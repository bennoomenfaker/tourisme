# Analyse code — Éco-Voyage (exécution du prompt v2, 2026-08-03)

> **Méthode** : audit lecture seule du code réel (`backend/` + `frontend/`), vérification
> de **chaque** point pré-identifié S1–S7 / M1–M6 / F1–F4 / A1–A6 avec `fichier:ligne`,
> puis audit complémentaire (OWASP, machine à états, concurrence, prix, capacité,
> isolation provider-only, perf), top 5 risques et roadmap. **Aucun fichier de code
> modifié.** Les `.env*` étant gitignorés, les secrets sont vérifiés sur disque local.

Légende : ✅ CONFIRMÉ · ⚠️ CONFIRMÉ AVEC NUANCE · ❌ INFIRMÉ.
Gravité : CRITIQUE / ÉLEVÉ / MOYEN / FAIBLE.

---

## A. Confirmation et priorisation des points pré-identifiés

### Sécurité

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| S1 | ✅ | **CRITIQUE** | `backend/.env`, `.env.dev`, `.env.production` : `JWT_SECRET=dev_secret_ultra_long` **identique dans les 3 fichiers** (vérifié sur disque) ; fallback `'dev-session-secret'` en dur `backend/src/main.ts:22`. `FRONTEND_URL=http://ecovoyage.duckdns.org:3004` (http). **Nuance** : seul `JWT_SECRET` n'a jamais été commité (`git log -S dev_secret_ultra_long` vide) — mais les **identifiants DB ont bien été commités** : `.env` racine ajouté dans l'initial commit `2a9593d` (`DB_PASSWORD=Hermosa`, `DB_USERNAME=marammejri`), retiré dans `03da5f8` mais **toujours récupérable via `git show 2a9593d:.env`**, et `Hermosa` est encore présent dans HEAD dans `backend/scripts/generate-complete-seed.ts` et `scripts/data_complementaire.sql` (20 commits de l'historique touchent ce mot de passe). |

**Exploitabilité** : secret partagé dev/prod + prévisible → forger un JWT admin si le secret fuit (code, dump, logs) ; le fallback en dur rend toute instance sans `.env` vulnérable ; les identifiants DB en clair (`Hermosa`/`marammejri`) restent dans l'historique git et dans 2 fichiers de HEAD → accès DB direct possible pour quiconque a un clone du repo. **Impact métier** : compromission totale des comptes et rôles + accès au schéma/données. **Effort** : 1 j. **Correction** : générer un secret fort par environnement, le passer en secret de déploiement (pas dans le repo), supprimer le fallback (`main.ts:22` → `process.env.JWT_SECRET!`), `FRONTEND_URL` en https, rotation du secret JWT **et des identifiants DB** en prod, expurger `Hermosa`/`marammejri` des fichiers trackés (`generate-complete-seed.ts`, `data_complementaire.sql`) et de l'historique git (BFG/filter-repo).

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| S2 | ✅ | **CRITIQUE** | `backend/src/auth/auth.service.ts:267-295` : `googleLogin` ne vérifie **ni** `auth_method`, **ni** `email_verified_at`, **ni** `status`. Il connecte tout compte existant trouvé par email (`:268`) → **prise de contrôle d'un compte email+password via Google (account takeover)**. Pour un email inconnu il crée un compte `password:''`, `status: PENDING` (`:271-275`, via `users.service.ts:20-28`) et **émet immédiatement des tokens** (`:278-287`). La chaîne est complète car `jwt.strategy.ts:23-37` n'accepte que `archived`/`banned` → un compte **PENDING** a un accès total. Contraste : le login classique vérifie bien tout ça (`auth.service.ts:160-176`). |

**Exploitabilité** : trivial — l'attaquant se connecte avec Google sur un email existant (par ex. un provider) et hérite du rôle/des données. **Impact métier** : détournement de comptes prestataires/voyageurs, fraude sur les réservations. **Effort** : 0,5 j. **Correction** : dans `googleLogin`, si un compte existe → vérifier `auth_method === 'google'` (sinon 409) ; sinon créer avec `status: ACTIVE, email_verified_at: now, auth_method: 'google'` (Google a déjà vérifié l'email) ; ajouter aussi le check `status !== 'banned'` avant d'émettre les tokens.

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| S3 | ✅ | **ÉLEVÉ** | `auth.controller.ts:42-56` (verifyEmail) et `:107-122` (googleAuthCallback) : JWT access+refresh **dans la query string** de redirection vers `FRONTEND_URL` (http). |

**Exploitabilité** : tokens exposés dans l'URL → logs serveur/proxy, historique navigateur, header `Referer` (vers les ressources externes chargées par la page) et interception sur HTTP. **Impact métier** : vol de session. **Effort** : 1 j. **Correction** : code d'échange à usage unique (state/OAuth code) consommé par le frontend via POST, ou tokens en fragment d'URL (jamais transmis au serveur), ou cookies HttpOnly ; en attendant : HTTPS obligatoire.

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| S4 | ✅ | **ÉLEVÉ** | JWT en `localStorage` : `frontend/lib/api.ts` (`access_token`, `refresh_token`, `user`). Callback : `frontend/app/auth/callback/page.tsx:19-26` lit `accessToken/refreshToken/user` **depuis la query string** et les stocke en localStorage. |

**Exploitabilité** : vol par XSS (tout script injecté lit localStorage) + fuite par Referer. **Impact métier** : prise de session. **Effort** : 2-3 j. **Correction** : cookies `HttpOnly` + `Secure` (+ CSRF), ou au minimum tokens en fragment `#` non transmis au serveur ; l'état `user` ne doit pas être stocké en localStorage non signé (voir S5).

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| S5 | ✅ (nuancé) | **FAIBLE–MOYEN** | Rôle/identité pilotés par `localStorage.getItem("user")` non signé : `frontend/app/dashboard/page.tsx:1983-1994`, `profile/project-owner/page.tsx:349-355`, `dashboard/profile/page.tsx:10-16`, etc. **Nuance** : l'autorisation effective est côté serveur (`RolesGuard` + `author_id`), donc le spoofing du localStorage ne permet pas de passer les gardes backend — impact = affichage de la mauvaise UI / redirections (dégradation UX, pas d'élévation de privilège). |

**Correction** (1 j) : ne plus router sur la base du localStorage ; lire le rôle depuis le token décodé ou un endpoint `/auth/me`, et purger `user` du localStorage après connexion.

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| S6 | ✅ | **MOYEN** | `frontend/app/auth/callback/page.tsx:35-39` : `router.push(storedRedirect)` sans validation → **open redirect** (attaque de phishing « localhost » → site externe). |

**Correction** (0,5 j) : valider `storedRedirect` (doit commencer par `/`, ne pas contenir `//` ni `:` en tête, contre-liste `javascript:`).

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| S7 | ✅ | **ÉLEVÉ** | `reservation.service.ts:130-141` : contrôle « déjà réservé » par `findOne(traveler, session, status≠cancelled)` **sans contrainte unique** (l'entité `reservation.entity.ts` n'a aucun `@Unique`) ni verrou → 2 requêtes simultanées passent les deux. `capacity-domain.service.ts:38-75` : `checkAvailability` est une **lecture sans verrou** (TOCTOU). `reserve()` (73-124) pose `pessimistic_write` **mais** sur le repo hors `manager` les locks sont inefficaces (chaque requête auto-commit hors transaction explicite) → les appels sans `manager` (`reservation.service.ts:222`, `:589`) ne sont **pas** protégés. |

**Exploitabilité** : 2 voyageurs réservent la dernière place d'une même session simultanément → les 2 passent → capacité négative / survente. **Impact métier** : survente, litiges. **Effort** : 1-2 j. **Correction** : déplacer `create()` et `addParticipants()` dans une transaction (pattern `reservation-application.service.ts:createTransaction`) en passant `manager` à `checkAvailability`/`reserve` (le verrou fonctionne alors) ; ajouter une contrainte unique `(traveler_id, session_id)` avec `WHERE status <> 'cancelled'` (index partiel) pour la double-réservation ; en dernier recours un retry sur erreur de verrou.

### Logique métier / intégrité

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| M1 | ✅ | **ÉLEVÉ** | `reservation.service.ts` : `create()` fait `reservationRepo.save(reservation)` (`:217`) puis `capacityService.reserve(...)` (`:222`) **hors transaction** ; si la capacité échoue (entre le check `:104` et le reserve), une ligne **`confirmed`** reste en base (statut posé à `:215`). Même pattern `addParticipants` (`:587-594` : reserve après save des participants). Aucun `queryRunner` dans ce service. |

**Correction** (1-2 j) : transaction unique autour de check→save→reserve (le manager donné à `reserve` active le verrou pessimiste, cf. S7).

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| M2 | ✅ | **ÉLEVÉ** | `trip-plan.service.ts:335-342` : `reservationApp.reserveProgramItemsCapacity(...).catch(() => {})` **avale l'erreur de capacité** des activités de circuit. Pire : `reservation-application.service.ts:47-77` décrémente item par item — si l'item N échoue, les items 1..N-1 sont **déjà décrémentés** et, le catch avalant l'erreur, la transaction continue et commit → **fuite de capacité silencieuse + réservation du plan sans capacité pour certaines activités**. |

**Correction** (1 j) : retirer le `.catch(() => {})` ; pousser l'erreur dans `errors[]` (comme les autres items) **et** restaurer la capacité déjà réservée pour les items traités (`restoreProgramItemsCapacity` partiel) avant de continuer.

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| M3 | ✅ | **ÉLEVÉ** | `trip-plan.service.ts:563` `save(Reservation)` puis `:565` `capacityService.reserve(...)` **dans** le try (`:614` catch → `errors.push` sans rethrow) → la réservation reste dans la transaction et `:637 commitTransaction()` **commit quand même les items dont le reserve a échoué** → réservation `confirmed` sans capacité. `:633` : `fullPlan.status = 'partial'` ne sauvegarde pas la capacité. |

**Correction** (1-2 j) : dans le catch item, si `reserve` a échoué après le `save`, supprimer la ligne réservation créée (ou sauvegarder en `rejected` + restaurer les décréments) ; ne `commit` que ce qui est réellement réservé.

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| M4 | ✅ | **MOYEN** | `collaboration.service.ts:366-381` (`propagateContributionToOffer`), `:458-460`, `:536-538`, `:636-638` : `offerRepo.update({ id }, { details } as any)` — **la colonne `details` n'existe pas** : absente de `offer.entity.ts` (seul `offer_items.details_json` existe, `offer-item.entity.ts:48`), absente des scripts SQL (`grep details backend/scripts/*.sql` → ∅, seuls les `offer_items.details_json` des seeds), absente des 2 migrations. → soit erreur SQL runtime (`column offers.details does not exist`), soit dépendance à une colonne de drift jamais versionnée. Le statut `'attente_publication'` (`:342`, `:463/541/640`, `:981`, `:1002`) est **hors machine à états documentée** (commentaire `offer.entity.ts:133` : pending/approved/rejected/archived/inactive) — écrit via `as any` ; comme la colonne est `varchar` sans CHECK il persiste, mais l'offre devient invisible des listes filtrées sur `approved` et de la modération admin (filtre `pending`) → **état bloqué** tant que `publish-final` n'est pas appelé. |

**Correction** (1-2 j) : soit ajouter réellement la colonne `details jsonb` à `offers` (migration + entité), soit réécrire la propagation vers `offer_items.details_json` ; documenter `attente_publication` dans la machine à états (ou le remplacer par `pending` + flag `publish_ready` déjà présent, `offer.entity.ts:154-157`).

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| M5 | ✅ | **ÉLEVÉ** | Aucun scheduler : `grep -rnE 'Cron|Interval|Timeout' backend/src` → ∅ ; `@nestjs/schedule` absent de `backend/package.json`. `checkExpiredReservations` existe (`reservation.service.ts:661`, `circuit.service.ts:1363`) mais n'est exposé qu'à des endpoints **manuels** (`reservation.controller.ts:143`, `circuit.controller.ts:334`) → les `pending > 48h` n'expirent jamais tout seuls. |

**Correction** (1-2 j) : brancher `@nestjs/schedule` + `@Cron` quotidien sur les deux `checkExpiredReservations` + `finalizeCompletedReservations` (`circuit.service.ts:1390`), ou un endpoint admin appelé par cron externe ; prévoir un `pending` < 48h vérifié aussi à la réservation (éviter la réservation sur une capacité dont le pending va expirer).

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| M6 | ⚠️ | **MOYEN** | Cycle de vie dupliqué : `reservation.service.ts` (offres, **non transactionnel**, `:56-230`) vs `circuit.service.ts` (circuits, **transactionnel**, `:815-950`) — confirmé. **Nuance positive** : la validation des transitions est bien centralisée (`reservationDomain.validateTransition` utilisé dans les deux : `reservation.service.ts:339,460`, `circuit.service.ts:1034,1081,1257` + `reservation-domain.service.spec.ts`). Le vrai risque est la **tarification dupliquée** : `circuit.service.ts:927` (via `pricing-domain.service`), `:1230-1232` (`updateReservation` recalcule `final_total = base_price × participants + options_total`, ignorant options réelles et prix guide), `reservation.service.ts:146-160` (calcul inline du prix d'offre), `trip-plan.service.ts:419` (prix guide), `:505-520` (prix offre). |

**Correction** (moyen terme) : un seul service pricing (`pricing-domain.service.ts` déjà existant) pour offre + circuit + trip-plan ; `updateReservation` doit repasser par ce service et **re-vérifier la capacité** avant d'augmenter les participants (aujourd'hui `circuit.service.ts:1220-1236` augmente sans vérifier — cf. audit B).

### Frontend

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| F1 | ✅ | **ÉLEVÉ** | Prix recalculés côté client : `computeItemTotal` `frontend/app/trip-plans/[id]/page.tsx:164` (+ totaux `:279,509,1204,1287`), `displayTotal` `frontend/app/offers/[id]/page.tsx:294,397-409`, `final_total` optimiste qui **ignore les options** `frontend/app/circuits/[id]/page.tsx:429` (`effectivePrice * modifyParticipants`), et `:1094` affichage. La page réservation, elle, utilise bien le serveur (`reservations/new/page.tsx:143`). Écart possible entre affiché et facturé. |

**Correction** (moyen terme) : endpoint `preview` serveur (recalcul prix par item/circuit) appelé par les 3 pages ; afficher « estimé » tant que le serveur n'a pas confirmé.

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| F2 | ✅ | **MOYEN** | God components vérifiés : `profile/provider/page.tsx` **3534 l**, `profile/project-owner/page.tsx` **3474**, `dashboard/page.tsx` **3237**, `profile/guide/page.tsx` **2367**, `profile/ecovoyageur/page.tsx` **2509**. Géocodage Nominatim dupliqué : **12 fichiers** (`grep -il nominatim frontend | wc -l`). `BotanicalCover` : **4 fichiers**. Modales inline `fixed inset-0` : **30 fichiers / 84 occurrences** (dont certaines avec `role="dialog"` + `aria-modal`, ex. `dashboard/ecovoyageur/reservations/[id]/page.tsx:368`, mais pas de focus trap). |

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| F3 | ✅ | **MOYEN** | `explore/page.tsx:212-223` : boucle `for (const offer of offersData)` avec `await apiFetch(/offers/${offer.id}/items)` par offre → **N+1 réseau**. `:179-182` : debounce 300 ms de `fetchGuides` sans `AbortController` → races + setState après unmount (le `clearTimeout` n'annule pas la requête en vol). |

**Correction** (1-2 j) : endpoint d'enrichissement groupé côté serveur ; `AbortController` sur le debounce + garde `mounted`.

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| F4 | ✅ | **MOYEN** | `fetch` natif qui contourne `apiFetch` : `destinations/page.tsx:47` (Nominatim), `places/[id]/page.tsx:291` (upload), `dashboard/page.tsx:798` (upload) — pas de refresh 401. `apiFetch` (`lib/api.ts`) redirige globalement vers `/auth/login?redirect=…` sur 401 dès qu'il n'y a pas de refresh token, y compris pour des endpoints publics (impossible de désactiver par appel). |

### Architecture / DB

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| A1 | ✅ | **CRITIQUE** | `backend/src/database/typeorm.config.ts` : **aucune option `migrations`**. `backend/package.json` : aucun script typeorm CLI (ni `data-source.ts`). Les 2 fichiers `backend/migrations/1722000000000-…ts` et `…0001-…ts` existent mais **ne sont jamais exécutés**. Schéma non versionné : 57+ entités vs scripts SQL manuels (`backend/scripts/*.sql`), `synchronize: false` en prod mais aucune migration branchée → drift inévitable. |

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| A2 | ⚠️ → **FAIBLE (accepté)** | 4 seeds ont `synchronize: true` (`offer-categories.seed.ts:16`, `eco-traveler-questionnaire.seed.ts:21`, `guide-questionnaire.seed.ts:21`, `project-questionnaire.seed.ts:21`). **Nuance / accord utilisateur** : ce sont des DataSource **standalone de scripts dev** (1 seule entité chargée chacun), jamais appelés par le boot de l'app (`typeorm.config.ts: synchronize:false`) → risque limité si on ne les lance jamais contre la prod. **Recommandation légère** : passer à `synchronize:false` + `CREATE TABLE IF NOT EXISTS` dans ces scripts pour éliminer tout risque résiduel. |

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| A3 | ✅ | **ÉLEVÉ** | Seulement **3 `@Index`** sur tout `backend/src` (57+ entités). `createForeignKeyConstraints: false` : `circuit-program-item.entity.ts:56,70,83`, `circuit-option.entity.ts:36`, `collaboration.entity.ts:82` → FKs absentes en base ; `backend/scripts/migration-p0-security.sql:27` le documente et n'ajoute la FK que pour `circuit_options` (le reste des références reste pendant). FKs « par convention » → données orphelines possibles. |

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| A4 | ✅ | **ÉLEVÉ** | `admin.service.ts:246-250` : **4 requêtes par provider** (venues, offers, bookings, revenue) ; `:183-189` 1 requête/user ; `:311-316` 1-2 requêtes/réservation. `messages.service.ts:131-151` : **3 requêtes par conversation** (`getUserInfo` + lastMsg + unread). `collaboration.service.ts:712-726` : `find` puis enrichissement par collab. |

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| A5 | ✅ | **MOYEN** | Double source Mongo/Postgres : `eco-traveler.service.ts:45-54` `getProfile` fait `Promise.all([postgres…, mongo…])` → **échec global si Mongo tombe** ; idem `provider.service.ts:69-70`, `guide.service.ts:34-36`. `Promise.all` fail-fast. |

| ID | Verdict | Gravité | Vérification |
|---|---|---|---|
| A6 | ✅ | **FAIBLE** | Tests : ~7 spec files seulement (`auth.*`, `users`, `reservation.service.spec`, `reservation-domain.service.spec`, `offer.service.spec`, `app.controller.spec`). **Non couverts** : `circuit.service.ts` (1454 l), `collaboration.service.ts` (1381 l), `admin.service.ts` (744 l), `trip-plan.service.ts` (683 l), `reservation.service.ts` (838 l). |

---

## B. Audit complémentaire (angles morts)

### B1. OWASP sur les routes de création/modification

- **Authorization object-level : globalement saine.** Offres : `offer.service.ts:305,395,406,484,502,527,609` (checks `author_id`). Circuits : `circuit.service.ts:208,426,463,494,518,577,702,799` + `circuit.controller.ts:88-89`. Collaborations : `collaboration.service.ts:90-93` (create), `:202-207` (respond), `:282-287` (contribution), `:419` (cancel), `:940-944` (**confirmPublish vérifie bien l'auteur**), `:1000-1001` (publishOffer). Messages : `messages.service.ts:172,209,240,255` (participants only). Réservations circuit : `circuit.service.ts:1028,1076,1220,1254` (provider/auteur vs voyageur). **OK.**
- **Mass assignment : protégé** par le `ValidationPipe` global `whitelist: true, forbidNonWhitelisted: true` (`main.ts:47-52`) + DTOs. `circuit.controller.ts:91` fait `{...dto}` mais `circuit.service.ts:update` n'assigne que des champs connus. Vérifier quand même les `updateContribution` (DTO `UpdateContributionDto`) et les endpoints `PATCH /offers/:id` côté dashboard (`dashboard/page.tsx:2111` envoie `{status:'approved'}` — s'assurer que le service refuse ce champ hors rôle admin).
- **Injections** : requêtes TypeORM paramétrées partout dans les services (querybuilder avec `:params`) ; aucun `query()` brut concaténé trouvé. Les scripts SQL sont des fichiers hors runtime. **OK.**
- **Uploads (Cloudinary)** : `upload.controller.ts` JWT-guardé, limite 10 Mo, mimetype `image/*` ou `application/pdf` (`:23-30`) ; `upload.service.ts` envoie à Cloudinary (`:28-44`). Points mineurs : pas de vérification magic-byte (spoof mimetype possible — faible, Cloudinary ne rend pas de HTML), PDF monté en `resource_type: 'raw'` (à surveiller si Cloudinary rend le fichier brut). **FAIBLE.**
- **XSS/headers** : CSP + nosniff + X-Frame + Referrer-Policy posés (`main.ts:36-45`) ; React échappe par défaut. Pas de `dangerouslySetInnerHTML` repéré.
- **Rate limiting** : `@Throttle` sur auth (register 3/min, login 5/min, refresh 10/min) — **bon**.

### B2. Machine à états complète

- **Réservations offre** : `pending → confirmed/rejected/cancelled/expired/completed` — transitions validées par `reservationDomain.validateTransition` (`reservation.service.ts:339,460`), testé (`reservation-domain.service.spec.ts:12-50`). Sorties couvertes : refus (`:475` + restauration capacité `:480`), annulation (`:373-375`), expiration (`:673-675`), confirmation (`:497`).
- **Circuits** : même machine + `circuit.service.ts` (confirm `:1034`, reject `:1081`, cancel `:1257`), expiration `:1363`, complétion `:1390`.
- **Trip Plan** : statuts `draft` (`trip-plan.entity.ts:35`) et `partial` (`trip-plan.service.ts:633`). **Trou réel** : pas de lien inverse `reservation → trip_plan` (aucune colonne dans `reservation.entity.ts` ; seule `trip_plan_items` pointe vers le plan) → **quand un item est refusé APRÈS la confirmation du plan (ou annulé), on ne peut pas savoir de quel plan il vient** → l'utilisateur voit un plan `partial`/`confirmed` avec un item mort sans réconciliation possible.
- **`attente_publication` (offres)** : état hors machine (cf. M4) → risque d'offre bloquée invisible.

### B3. Concurrence / transactions sur la réservation groupée

- Dernière place d'une session : voir S7 — **le flux direct offre (`reservation.service`) est vulnérable** (check sans verrou, reserve sans transaction). Les flux **circuit** (`circuit.service.ts:815-950` via `createTransaction`) et **trip-plan** (manager passé) sont protégés par `pessimistic_write` **quand le manager est passé** (`capacity-domain.service.ts:85,111,138,160`).
- Réservation groupée : 2 voyageurs sur le même trip plan → sérialisés par les verrous des sessions partagées ; reste le problème M2/M3 (erreurs avalées, commit partiel).

### B4. Cohérence prix serveur vs client (liste des règles dupliquées)

| Règle de prix | Serveur | Client |
|---|---|---|
| Prix d'offre (unit × participants, prices is_default) | `reservation.service.ts:146-160` | `computeItemTotal` `trip-plans/[id]/page.tsx:164` |
| Prix circuit (base + options) | `pricing-domain.service.ts` (`circuit.service.ts:927`) | `final_total` optimiste `circuits/[id]/page.tsx:429` (ignore les options) |
| Prix affiché offre | `offer.price/final_price` | `displayTotal` `offers/[id]/page.tsx:294` |
| Recalcul après modification | `circuit.service.ts:1230-1232` (ignorant options réelles + prix guide) | `circuits/[id]/page.tsx:429` |
| Prix guide (offering) | `trip-plan.service.ts:419` | — |
| Revenus analytics | `final_total` serveur | `components/dashboard/analytics/*.tsx` (lisent `final_total`) — **cohérent** |

→ 4 règles recalculées des deux côtés (F1) + 1 incohérence interne serveur (`updateReservation` circuit).

### B5. Restauration de capacité dans tous les flux

| Flux | Restauration | Verdict |
|---|---|---|
| Annulation offre | `reservation.service.ts:373-375` + `restoreReservationCapacity` `:718-731` (session + stock + session guide) | ✅ |
| Refus offre | `:480` | ✅ |
| Expiration offre | `:675` | ✅ |
| Refus/annulation/expiration circuit | `circuit.service.ts:1105-1126, 1281-1302, 1430-1452` (program items + options) | ✅ |
| **Trip plan — échec partiel** | `.catch(()=>{})` `trip-plan.service.ts:342` → items déjà décrémentés **non restaurés** | ❌ (cf. M2) |
| `addParticipants` offre (échec du reserve) | rien | ❌ (cf. M1) |
| `updateReservation` circuit (hausse participants) | **aucune vérif capacité ni reserve** (`circuit.service.ts:1220-1236`) | ❌ augmentation sans contrôle |
| Guide offering session | `trip-plan.service.ts:462-468` (décrément) ; restauration au cancel offre via `restoreReservationCapacity` | ⚠️ via offre seulement |

### B6. Isolation « provider-only »

- Offres : `findByAuthor` (`offer.service.ts:149-153`) et mutations vérifient `author_id`. Circuits : `findByAuthor` (`circuit.service.ts:178`) + mutations. Listes publiques filtrées `status:'approved'` (`circuit.service.ts:169-171`, `findById` `:167-171`). Collaborations : inviter = auteur uniquement (`:90-93`). Messages : participants uniquement. **Respecté globalement.** Points à surveiller : `dashboard/page.tsx:2111` force `status:'approved'` côté client (le backend doit refuser hors admin) ; `explore` consomme `/offers` publics — OK.
- **Enrichissement N+1 de `getOfferForCollaborator`/`findByOffer`** (`collaboration.service.ts:711-726, 738-756`) expose des données de collaborateurs uniquement aux concernés (`:731-735`) — OK.

### B7. Performance

- N+1 SQL : A4 (admin 4 req/provider, messages 3 req/conversation, collaboration).
- N+1 réseau : F3 (`explore/page.tsx:212-223`).
- Index manquants : JSONB filtrés (`offers.disponibilite`, `offer_items.details_json`, `offers.sustainability_*`) sans index GIN ; `reservations(traveler_id, session_id)`, `messages(conversation_id)`, `offers(status, region)` probablement non indexés (3 `@Index` au total).
- Cache Redis circuits bien invalidé (`circuit.service.ts:invalidateCircuitCache` appelé partout).
- **Impact admin** : `getProviders` paginé mais enrichi par N+1 → O(n×4) requêtes ; sur 100 providers = 400 requêtes par chargement.

---

## C. Top 5 risques AUJOURD'HUI + mitigation

| # | Risque (technique + métier) | Gravité | Mitigation |
|---|---|---|---|
| 1 | **Account takeover via Google OAuth** (S2) : n'importe quel email existant connecté sans vérif, comptes PENDING avec tokens immédiats. Détournement de comptes prestataires/voyageurs, fraude réservations. | CRITIQUE | Corriger `googleLogin` (auth_method/status/email_verified) ; bloquer l'émission de tokens pour `status != active` au niveau `jwt.strategy.ts` (défense en profondeur). |
| 2 | **Survente + réservation orpheline sur le flux offre** (S7+M1) : check sans verrou + save avant reserve hors transaction → 2 voyageurs sur la dernière place, lignes `confirmed` sans capacité. | CRITIQUE (métier) | Transactions avec verrous pessimistes via `manager` (pattern déjà en place côté circuit) ; contrainte unique partielle sur `(traveler_id, session_id)` ; retry. |
| 3 | **Trip plan : survente silencieuse + commit partiel** (M2+M3) : `.catch(()=>{})` sur la capacité circuit, erreurs avalées, items réservés sans capacité commités, fuite de capacité. | ÉLEVÉ | Retirer les catches avalés ; restaurer les décréments partiels ; ne committer que les items réservés ; tests de concurrence. |
| 4 | **Schéma non versionné + secrets faibles** (A1+S1) : migrations jamais branchées, `synchronize` historique, JWT secret unique dev/prod `dev_secret_ultra_long` + fallback en dur, prod en http, **identifiants DB `Hermosa`/`marammejri` commités dans l'historique git (`2a9593d`) et encore présents dans 2 fichiers trackés de HEAD**. | CRITIQUE (ops) | Brancher typeorm migrations (data-source + scripts), appliquer les 2 migrations existantes + un diff complet en SQL versionné ; rotation des secrets par environnement **y compris les identifiants DB** ; expurger les secrets de l'historique git (BFG) ; HTTPS. |
| 5 | **Expiration/responsabilité des `pending`** (M5) : aucun scheduler → des demandes en attente (et leurs capacités) restent verrouillées indéfiniment ; `attente_publication` peut bloquer des offres invisibles. | ÉLEVÉ | `@Cron` quotidien (ou cron externe) sur `checkExpiredReservations` des 2 services + `finalizeCompletedReservations` ; état `attente_publication` documenté/réparé (M4). |

---

## D. Roadmap de refactor priorisée

### Quick wins (1–2 sprints, sécurité + transactions d'abord)
1. **S1** — rotation JWT secret par env, suppression du fallback `main.ts:22`, HTTPS `FRONTEND_URL`.
2. **S2** — correction `googleLogin` + durcissement `jwt.strategy` (statut).
3. **S3/S4** — tokens hors query string (fragment ou code d'échange), purge `user` du localStorage.
4. **S5/S6** — rôle depuis le serveur, validation de `storedRedirect`.
5. **S7+M1** — transaction + verrous sur `reservation.service.create`/`addParticipants` ; contrainte unique partielle.
6. **M2/M3** — trip plan : erreurs remontées, restauration partielle, commit conditionnel.
7. **A2** — passer les seeds en `synchronize: false`.
8. **B5** — `updateReservation` circuit : re-vérif capacité + prix via `pricing-domain`.

### Moyen terme (sprints 3–5)
9. **A1** — migrations branchées (data-source + scripts npm + diff SQL versionné) ; appliquer `migration-p0-security.sql`.
10. **M5** — scheduler `@Cron` (expiration + complétion).
11. **F1** — endpoint `preview` serveur ; supprimer `computeItemTotal`/`displayTotal`/`final_total` optimiste.
12. **A4** — requêtes groupées (admin/messages/collaboration) : joins ou `find` avec relations au lieu des N+1.
13. **M4** — colonne `details` réelle (ou réécriture vers `details_json`) + statut `attente_publication` intégré à la machine à états.
14. **M6** — un seul calcul de prix (offre/circuit/trip-plan) sur `pricing-domain.service.ts`.
15. **A3** — FKs et index manquants (migration SQL), index GIN sur JSONB filtrés, index `reservations(traveler_id, session_id)`.

### Long terme (sprints 6+)
16. **F2** — extraction des god components (provider/ecovoyageur/dashboard) : tabs → composants, géocodage centralisé (1 util), modales → composant unique accessible (focus trap).
17. **F3** — endpoint d'enrichissement groupé explore + AbortController généralisé.
18. **A5** — réconcilier Mongo/Postgres (une source de vérité) ; `Promise.allSettled` en attendant.
19. **A6** — tests sur circuit/collaboration/trip-plan/admin (au moins les chemins de transaction et de capacité).
20. **B2** — lien inverse `reservation.trip_plan_id` pour la réconciliation des items refusés/annulés.

---

## Synthèse des verdicts

- **Confirmés tels quels (17)** : S2, S3, S4, S5, S6, S7, M1, M2, M3, M4, M5, M6, F1, F2, F3, F4, A1, A3, A4, A5, A6.
- **Confirmés avec nuance (1)** : A2 (`synchronize:true` des seeds **accepté comme non bloquant** — scripts dev standalone, `synchronize:false` en prod, accord utilisateur).
- **Nuance corrigée après re-vérification (1)** : S1 reste **CRITIQUE et confirmé** — le mot de passe DB `Hermosa`/`marammejri` **était commité dans l'historique git** (`.env` ajouté dans `2a9593d`, retiré dans `03da5f8`) et **est encore présent dans HEAD** dans `backend/scripts/generate-complete-seed.ts` et `scripts/data_complementaire.sql` ; seul `JWT_SECRET` n'a jamais été versionné. Rotation des identifiants DB obligatoire.
- **Déjà corrigé / bien géré (à ne pas re-traiter)** : verrous pessimistes dans les flux transactionnels circuit/trip-plan, validation des transitions centralisée + testée, restore de capacité sur refus/annulation/expiration (offre + circuit), validation `whitelist` globale (mass assignment), autorisation object-level sur offre/circuit/collab/messages, uploads limités (taille + mimetype), rate-limiting auth, headers de sécurité, cache Redis des circuits avec invalidation.

# Prompt d'analyse code — Éco-Voyage (v2)

> Prompt prêt à coller dans un autre modèle IA (Claude / GPT / Gemini — le modèle
> importe peu, la qualité du prompt prime). Objectif : audit technique + logique
> métier du code réellement implémenté, avec des recommandations actionnables.
>
> **v2** : conçu à partir de 4 analyses réelles (sécurité, logique métier, frontend,
> architecture/DB). Les problèmes Y DÉJÀ IDENTIFIÉS sont donnés au modèle pour être
> **vérifiés et priorisés**, pas pour être re-trouvés.
> ⚠️ Périmètre : **pas de paiement en ligne / commission / acompte** (hors sujet).

---

```
# CONTEXTE PROJET — Éco-Voyage (marketplace de tourisme durable, Tunisie)

Tu es un expert sécurité + architecte + senior full-stack. Audite le code d'une
plateforme B2B2C existante et propose des recommandations actionnables. Le code est
un fait — base tes recommandations sur ce qui est réellement implémenté, pas sur des
hypothèses.

## Stack technique
- Backend : NestJS + TypeORM (PostgreSQL) + MongoDB (préférences/engagements) + Redis (cache)
- Frontend : Next.js 16 (App Router, Turbopack) + React 19 + Tailwind, UI en français
- Modules backend (28) : auth, users, provider, offer, circuit, guide, collaboration,
  reservation, trip-plan, travel-cart, review, publication, eco-traveler, admin,
  notification, messages, certification, events, photo, organization, etc.
- Contraintes : `synchronize: false` en prod, schéma géré par scripts SQL manuels
  (aucune migration branchée), pas de scheduler (aucun @Cron).

## Contexte marché (Tunisie)
- Saisonnalité forte (mai–octobre), pic août, 24 régions. Paiement majoritairement en
  espèces (culture cash) → aucune exigence de gateway de paiement.
- Parcours : voyageur (s'inscrit) → provider/guide (créent offres/circuits) → admin
  (valide) → réservation → avis. Score de durabilité par questionnaire/réservation/avis/partages.

## Modèle métier (résumé)
- OFFRE : Provider → Venue → Offer → OfferItem (unité vendable) → prices
  (per_person, per_person_per_night, per_room_per_night, per_bed, per_group, …)
  + sessions (capacité restante). `deposit_percentage` stocké mais JAMAIS appliqué.
- CIRCUIT : multi-jours, activités à 4 sources (offre propre / offre externe / guide
  via collaboration / référence). Prix = prix_activité + guide_applied_price.
- GUIDE : prestations + sessions + agenda, collaboration bidirectionnelle.
- TRIP PLAN : agrégation offres + circuits + prestations guide → UNE réservation
  groupée, transaction à succès PARTIEL (`status: partial`, erreurs par item).
  PAS de lien inverse réservation→trip_plan.

## Ce qui est déjà fait / corrigé (à NE PAS re-proposer)
- Anti-overbooking : verrous pessimistes (`pessimistic_write`) + restauration de capacité
  sur refus/annulation.
- Prix TOUJOURS calculés serveur ; snapshot figé à la réservation ; délais de réservation
  et d'annulation vérifiés serveur ; min/max participants.
- Funnel Panier → Trip Plan → Réservation groupée (succès partiel).
- Refus de réservation ne confirme plus en base ; score durabilité relié aux
  réservations/avis ; badges AFRATIM ; approbation admin des offres ; messagerie +
  notifications (polling) + timeline + météo.

## Problèmes DÉJÀ identifiés — VÉRIFIE-les dans le code, affine-les et priorise-les
Donne pour chacun : gravité réelle (CRITIQUE/ÉLEVÉ/MOYEN/FAIBLE), exploitabilité,
impact métier, effort estimé, correction concrète. Confirme ou infirme chaque point
avec fichier:ligne.

### Sécurité
- S1. JWT secret faibles/partagés : `backend/.env.production` JWT_SECRET
  `dev_secret_ultra_long`, DB_PASSWORD en clair, fallback `'dev-session-secret'` dans
  `main.ts:22` ; secrets commités dans l'historique git.
- S2. OAuth Google : `auth.service.ts:267-295` `googleLogin` connecte n'importe quel
  compte existant par email sans vérifier auth_method/email_verified/status, et crée
  un compte password:'' status PENDING avec tokens immédiats → contourne la vérif email.
- S3. `auth.controller.ts:42-54,107-121` : tokens JWT en query string de redirection,
  FRONTEND_URL en http.
- S4. JWT access+refresh en localStorage (`frontend/lib/api.ts`) → vol par XSS ; les
  tokens dans l'URL du callback OAuth (`app/auth/callback/page.tsx`) → fuite referer.
- S5. Rôle/identité pilotés par un `user` localStorage non signé (`dashboard/page.tsx`).
- S6. `router.push(storedRedirect)` non validé (open redirect).
- S7. Course double-réservation : check « déjà réservé » (`reservation.service.ts:130-141`)
  sans contrainte unique ni verrou ; `checkAvailability` lit sans pessimistic_write →
  check→reserve non atomique → survente possible.

### Logique métier / intégrité
- M1. Réservation « orpheline » : `reservation.service.ts:217` (save) puis `:222`
  (reserve) hors transaction → si la capacité échoue, une ligne `confirmed` reste en
  DB. Même pattern `addParticipants` `:585-589`.
- M2. `trip-plan.service.ts:335-342` : `.catch(() => {})` avale les erreurs de capacité
  des activités circuit → overbooking silencieux.
- M3. `trip-plan.service.ts:563-565,614,630-637` : save avant reserve ; catch pousse
  l'erreur mais la ligne Réservation reste dans la transaction et COMMIT si d'autres
  items réussissent → réservation confirmed sans capacité.
- M4. Écritures `(offer as any).details` vers une colonne inexistante
  (`collaboration.service.ts:366-381,636-638`) → propagation/cleanup cassé ; statut
  `'attente_publication'` inexistant testé.
- M5. État des réservations : pending > 48h n'expire jamais (aucun scheduler) ;
  `checkExpiredReservations`/`finalizeCompletedReservations` seulement déclenchés par
  endpoints admin manuels.
- M6. Cycle de vie réservation dupliqué `reservation.service.ts` vs `circuit.service.ts`
  ; tarification offer/guide recalculée en dur en plusieurs endroits.

### Frontend
- F1. Prix dupliqués côté client : `computeItemTotal` (`trip-plans/[id]/page.tsx`),
  `final_total` optimiste qui ignore les options (`circuits/[id]/page.tsx`),
  `displayTotal` (`offers/[id]/page.tsx`) → risque d'écart serveur/client.
- F2. God components : `profile/provider/page.tsx` 3534 l, `project-owner` 3474,
  `dashboard` 3237, `profile/guide` 2367 ; géocodage Nominatim dupliqué ~12× ;
  `BotanicalCover` 4× ; modales inline `fixed inset-0` sans aria/focus trap ×20.
- F3. N+1 réseau : `explore/page.tsx:212-223` boucle for…await par offre ; pas
  d'AbortController sur debounce de recherche → races + setState après unmount.
- F4. `fetch` natif qui contourne `apiFetch` (pas de refresh 401) dans plusieurs
  composants ; `apiFetch` redirige globalement vers login sur 401 même endpoints publics.

### Architecture / DB
- A1. Migrations jamais branchées : `typeorm.config.ts` sans `migrations`, aucun
  data-source ni script typeorm → schéma non versionné, drift entre 57 entités et SQL.
- A2. Seeds avec `synchronize: true` → lancement en prod re-synchronise la table.
- A3. Aucun index FK (57 entités, 2 @Index) ; FKs « par convention » avec
  `createForeignKeyConstraints: false` (`circuit-program-item`, `collaboration`) →
  références pendantes possibles.
- A4. N+1 SQL : `admin.service.ts` (4 requêtes/provider), `messages.service.ts`
  (3/conversation), `collaboration.service.ts` (`findOne` par collab malgré relations).
- A5. Double source de vérité Mongo/Postgres (préférences voyageur + engagement guide)
  ; `Promise.all` fait échouer `getProfile` si Mongo tombe.
- A6. Tests quasi inexistants sur les gros services (circuit 1454 l, collaboration
  1381 l, admin 744 l non couverts).

## Ce que j'attends de toi
A) CONFIRMATION/PRIORISATION des points S1–S7, M1–M6, F1–F4, A1–A6 ci-dessus :
   vérifie chaque point dans le code, corrige fichier:ligne si besoin, classe par
   gravité, et écarte ce qui serait déjà résolu.
B) AUDIT COMPLÉMENTAIRE — angles morts NON listés ci-dessus :
   - OWASP Top 10 sur les routes de création/modification (authorization object-level,
     mass assignment, validation), uploads (Cloudinary), injections SQL/NoSQL.
   - État machine complet des statuts (pending→confirmed/rejected/cancelled/expired/
     completed, trip_plan partial/confirmed/cancelled) : toutes les sorties possibles
     sont-elles gérées ? que devient un trip plan dont un item est refusé APRÈS
     confirmation (lien inverse inexistant) ?
   - Concurrence et transactions sur la réservation groupée ; intégrité si 2 voyageurs
     réservent la dernière place d'une même session.
   - La cohérence prix serveur vs affichage client (F1) : liste chaque règle de prix
     recalculée des deux côtés.
   - Sessions de guide / prestations : l'annulation/refus restaure-t-elle vraiment la
     capacité dans tous les flux (offre, circuit, trip plan) ?
   - La notion de « provider-only » (offres/circuits liés à un provider) est-elle
     respectée partout, ou des écrans/filtres laissent passer du contenu étranger ?
   - Performance : requêtes les plus coûteuses (admin, findPublic non caché), index
     manquants sur filtres JSONB.
C) 5 RISQUES les plus graves AUJOURD'HUI (technique ET métier) + plan de mitigation.
D) ROADMAP de refactor priorisée : par sprint, en distinguant quick wins (sécurité,
   transactions), moyennes (prix serveur unifié, N+1), et long terme (extraction des
   god services/pages, migrations branchées, scheduler).

## Priorisation
Pour CHAQUE point : gravité, impact métier, risque technique, nécessite un changement
de schéma ou non, faisable en 1 sprint vs moyen vs long terme.

Contrainte : sois concret (fichier:ligne, schémas, endpoints, composants UI),
hiérarchise par impact/effort, NE propose PAS de gateway de paiement, de commission
ni d'acompte. Si un problème est déjà corrigé dans le code, dis-le et passe au suivant.
```

---

## À quel modèle le donner

| Modèle | Usage |
|---|---|
| **Claude Sonnet / GPT / Gemini** | Audit complet A→D (le prompt est calibré pour eux) |
| Agent « mode analyse long » (opencode/marathon thinking) | Approfondissement des points S7, M1–M3, B-« lien inverse » |
| Modèle spécialisé sécurité | Pour valider S1–S7 avec un PoC sur l'instance locale |

## Ce que les 4 analyses internes ont déjà trouvé (verdict contre le code)

| Domaine | Problème trouvé | Sévérité |
|---|---|---|
| Sécurité | JWT secret trivial partagé dev/prod + fallback en dur | CRITIQUE |
| Sécurité | OAuth Google contourne la vérification email | CRITIQUE |
| Sécurité | Tokens JWT dans URLs de redirection HTTP | ÉLEVÉ |
| Sécurité | JWT en localStorage / callback OAuth en query string | ÉLEVÉ |
| Sécurité | Check double-réservation non atomique (pas de contrainte unique ni verrou) | ÉLEVÉ |
| Sécurité | Rôle piloté par localStorage non signé ; open redirect | MOYEN |
| Métier | Réservation orpheline : save → reserve hors transaction | ÉLEVÉ |
| Métier | Trip plan : erreurs capacité avalées (`.catch(()=>{})`) / commit partiel | ÉLEVÉ |
| Métier | Écriture vers colonne `details` inexistante + statut inexistant | MOYEN |
| Métier | pending > 48h n'expire jamais (aucun scheduler) | ÉLEVÉ |
| Frontend | Prix recalculés côté client (3 occurrences) | ÉLEVÉ |
| Frontend | God components (pages 2 300–3 500 lignes) + géo dupliquée 12× | MOYEN |
| Frontend | N+1 réseau + races sans AbortController | MOYEN |
| Archi/DB | Migrations jamais branchées, seeds `synchronize: true` | CRITIQUE |
| Archi/DB | Aucun index FK, FKs `createForeignKeyConstraints: false` | ÉLEVÉ |
| Archi/DB | N+1 SQL admin/messages/collaboration | ÉLEVÉ |
| Archi/DB | Mongo/Postgres double source de vérité | MOYEN |
| Archi/DB | Tests quasi inexistants sur les gros services | FAIBLE |

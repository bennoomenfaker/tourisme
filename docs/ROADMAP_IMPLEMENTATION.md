# Roadmap d'implémentation — Sprint par Sprint

> Détail opérationnel de la section F de `docs/analyse-metier-resultat.md`.
> Références : `A1…A7` (audit réservation), `B1…B4` (UX), `C1…C5` (croissance), `D` (KPIs).
> Convention : 6 sprints de 2 semaines, équipe 1-2 devs. Chaque sprint est **livrable et testable** en autonomie.

## Sprint 0 — Fondations & prérequis (½ sprint, en parallèle des autres)

| Tâche | Détail |
|---|---|
| **Vérifier le runner de migrations** | `backend/migrations/*.ts` (TypeORM `MigrationInterface`). S'assurer que `migrationsRun` ou `migration:run` est exécuté en CI/déploiement (cf. `.github/workflows/deploy.yml`). |
| **Réactiver/étendre la suite de tests** | Pattern existant : `reservation.service.spec.ts`, `offer.service.spec.ts` (tests de transitions). Ajouter `npm run test` + `npm run lint` aux checks CI si absent. |
| **Choisir l'outil cron** | Les jobs existants (`checkExpiredReservations`, `finalizeCompletedReservations`) sont exposés en **endpoints admin** (`reservation.controller.ts:142`, `circuit.controller.ts:338`) mais **aucun scheduler interne** n'existe. Décision : installer `@nestjs/schedule` (`@Cron`) ou garder des endpoints appelés par un cron externe (Kubernetes CronJob / GitHub Action). **Recommandation : `@nestjs/schedule`** — évite une dépendance infra. |
| **Brique email** | `MailService` existe déjà (`backend/src/mail/`). Prévoir un canal « notification + email » pour les relances (A5, C3). Vérifier le provider SMTP configuré. |
| **Référence : schéma cible** | Figer les nouveaux champs/tables (tableaux § ci-dessous) dans un doc avant de commencer le Sprint 1. |

**Validation sprint 0** : `backend: yarn build && yarn test && yarn lint` verts ; une migration de test (vide) s'exécute de bout en bout.

---

## Sprint 1 — Quick wins (fiabilité + fondations data)

**Objectif** : corriger les bugs critiques, poser les fondations data (events, abandons), premier aperçu serveur et recommandation V1.

### Tâche 1.1 — 🔴 Bug `CircuitService.remove` (A7.2) — 0,5 j
- **Fichier** : `backend/src/circuit/circuit.service.ts` (méthode `remove`).
- **Changement** : `where: { circuit: { id }, status: 'draft' }` → `status: 'pending'` (les réservations circuit en attente sont `'pending'`, cf. `circuit.service.ts:reserve`). Ajouter aussi la vérification des `expired` (le circuit ne doit pas être supprimé si des réservations expired existent sans capacité restaurée ? → non, expired est restauré par cron, juste ajouter `status: In(['pending','confirmed'])`).
- **Tests** : `circuit.service.spec.ts` — « remove refuse si une réservation pending existe » / « remove refuse si confirmed existe ».
- **AC** : un circuit avec une `circuit_reservation` en `pending` ne peut plus être supprimé (erreur 400 avec message).

### Tâche 1.2 — 🟠 Correction défaut `currency` circuit (A6) — 0,25 j
- **Fichier** : `backend/src/circuit/circuit.service.ts` (`create`).
- **Changement** : défaut `'XAF'` → `'TND'` (aligné sur le reste du système).
- **Test** : le `create` sans `currency` produit `'TND'`.

### Tâche 1.3 — 🟠 Machine à états uniforme (A7) — 1,5 j
- **Fichiers** : `backend/src/domain/reservation-domain.service.ts`, `backend/src/reservation/reservation.service.ts`, `backend/src/circuit/circuit.service.ts`.
- **Changements** :
  - Ajouter la transition `pending → expired` pour `'circuit'` dans `RESERVATION_TRANSITIONS` (ou aligner le cron circuit sur une autre sortie — décision produit : **conserver l'expiration 48h pour les circuits**, donc l'ajouter).
  - Tous les crons passent par `reservationDomain.validateTransition()` (booking **et** circuit).
  - `finalizeCompletedReservations` (booking) : ajouter une sortie pour les offres **sans session** → utiliser `created_at + durée indicative` (ou un nouveau champ `expected_end_at`, voir schéma) pour passer en `completed` ; sinon documenter le choix « reste confirmed ».
  - Supprimer les états fantômes du trip plan (`planning`, `pending`, `completed`, `cancelled` dans le frontend `STATUS_LABELS`) ou les implémenter (dépend de A1 au Sprint 2).
- **Tests** : extension du pattern `offer.service.spec.ts` (table de transitions booking + circuit).
- **Migration** : `1722000000002-reservation-transitions.ts` — ajouter `reservations.expected_end_at timestamp NULL` (optionnel, pour offres sans session).

### Tâche 1.4 — 🟠 Récupération de panier abandonné (A5) — 2 j
- **Migration** : `1722000000003-cart-abandonment.ts` → table `cart_abandonment_events` (`id uuid pk, cart_id uuid, user_id uuid, triggered_at timestamptz, email_sent_at timestamptz null, recovered bool default false, created_at`).
- **Backend** :
  - `travel-cart/travel-cart.service.ts` : méthode `flagAbandoned()` (cron quotidien) : `UPDATE travel_carts SET status='abandoned' WHERE status='active' AND updated_at < now() - interval '24 hours'` + insert dans `cart_abandonment_events`.
  - Endpoint cron : `POST /api/travel-carts/internal/flag-abandoned` (ou `@Cron` si choix sprint 0) + endpoint protégé `GET /api/travel-carts/abandoned/reminder` (récupère les 3 premiers items pour la relance).
  - Sur tout ajout d'item à un panier `abandoned` : passage `active` + `recovered=true` sur l'événement.
- **Frontend** :
  - `frontend/components/CartWidget.tsx` : badge « panier abandonné » si le dernier événement de l'utilisateur est non-récupéré.
  - Notification in-app J+1 (via `NotificationService.create`, pattern existant) + email J+3 via `MailService`.
  - Page notifications : carte de rappel cliquable → `/cart?restore=1`.
- **Tests** : `travel-cart.service.spec.ts` — flagAbandoned ne touche que les paniers >24h ; recovery repasse en active.
- **AC** : un panier inactif 24h passe `abandoned` ; la relance est tracée ; le voyageur peut reprendre en 1 clic.

### Tâche 1.5 — 🟠 Instrumentation funnel (D) — 2,5 j
- **Migration** : `1722000000004-funnel-events.ts` → table `funnel_events` (`id uuid pk, user_id uuid null, event_type varchar, entity_type varchar null, entity_id uuid null, meta jsonb default '{}', created_at timestamptz`).
- **Backend** : nouveau `analytics/analytics.service.ts` (+ module) avec `log(eventType, { user_id, entity_type, entity_id, meta })` ; hooks fire-and-forget (`AnalyticsService.log().catch(() => {})`, pattern notifications) aux points :
  - `offer_view` (offers controller `findOne`), `cart_add` / `cart_remove` (`travel-cart.service`), `trip_plan_created`, `trip_plan_booked` (`trip-plan.service.book`), `booking_created` / `booking_confirmed` / `booking_rejected` / `booking_expired` (`reservation.service` + `circuit.service`), `review_created`.
  - Ajouter `approved_at timestamptz null` sur `offers` et `circuits` (migration) pour le KPI « délai d'approbation admin ».
- **Endpoints admin** : `GET /api/admin/kpis` → conversion par étape, taux abandon panier, taux occupation sessions (`(total_capacity-remaining)/total`), délai approbation moyen, taux de refus par provider, délai réponse provider manual.
- **Frontend** : `frontend/app/admin/page.tsx` (ou nouvelle section `frontend/app/dashboard/admin/page.tsx`) — cartes KPI + mini-graphiques (recharts ou graphiques simples inline ; vérifier les deps déjà présentes).
- **Tests** : `analytics.service.spec.ts` (log + agrégations).
- **AC** : chaque réservation créée/confirmée/refusée génère un event ; le dashboard affiche les 6 KPI.

### Tâche 1.6 — 🟢 Aperçu trip plan côté serveur (B2) — 2 j
- **Backend** : `trip-plan.service.ts` — méthode `preview(tripPlanId, ecoTravelerId, { participants })` qui réutilise **exactement** la logique de calcul de `book` (factoriser dans un helper `computeItemPrice(item, participantCount)` utilisé par les deux) et renvoie `{ items: [{ id, label, type, unit_price, total, pricing_unit, estimated }], total, currency, warnings[] }`.
- **Endpoint** : `GET /api/trip-plans/:id/preview?participants=N` (`trip-plan.controller.ts`).
- **Frontend** : `frontend/app/trip-plans/[id]/page.tsx` — remplacer le calcul client `computeItemTotal` par l'appel `preview` ; ajouter :
  - sous-totaux **par jour** (les items ont `day_number`),
  - badges « Estimé » vs « Confirmé »,
  - modale récap avant `book` (liste + prix serveur + items manual en attente).
- **Tests** : `trip-plan.service.spec.ts` — preview == book (même prix pour les mêmes inputs).
- **AC** : le prix affiché avant réservation est celui du serveur, à 100 %.

### Tâche 1.7 — 🟢 Recommandation V1 par préférences (C1) — 2 j
- **Backend** : `eco-traveler/eco-traveler-mongo.service.ts` — méthode `getPreferences(userId)` (lecture seule, existe déjà en upsert). Nouveau `recommendation/recommendation.service.ts` :
  - `GET /api/offers/recommended` : score = match(mots-clés `interests/landscapes/activities` ∩ `offer.offer_type/category/subtypes`) × 0.6 + `sustainability_score` × 0.3 + popularité (`review` count) × 0.1 ; renvoie 6 offres + 3 circuits + 3 guides.
  - Fallback : si pas de préférences → top offres par `sustainability_score` + popularité (pas d'échec).
- **Frontend** : rangée « Recommandé pour vous » sur `frontend/app/page.tsx` (home) + dans le `TripPlanBuilder`/circuit builder si pertinent.
- **Tests** : `recommendation.service.spec.ts` — scoring, tri, fallback sans préférences.
- **AC** : un voyageur avec `interests:['randonnée']` reçoit des offres `randonnée` en premier.

**Sprint 1 — Démo/validation** : `yarn build && yarn test` backend verts ; parcours manuel : panier abandonné → relance → reprise ; admin voit les KPI ; trip plan affiche le prix serveur par jour.

---

## Sprint 2 — Confiance : lien inverse trip_plan ↔ réservations + no-show

**Objectif** : rendre le plan de voyage honnête (A1) et protéger l'offre du no-show (A4).

### Tâche 2.1 — 🔴 Lien inverse réservation ↔ trip_plan (A1) — 3 j
- **Migration** : `1722000000005-trip-plan-reservation-link.ts` :
  - `trip_plan_items` : + `reservation_id uuid NULL`, `circuit_reservation_id uuid NULL`, `status varchar DEFAULT 'pending'`.
  - `reservations` : + `trip_plan_item_id uuid NULL` (FK optionnelle) — pour la requête inverse.
  - Index sur `trip_plan_items.reservation_id`.
- **Backend** :
  - `trip-plan.service.ts` `book` : après chaque save, renseigner `item.reservation_id` (ou `circuit_reservation_id`) + `item.status='booked'|'confirmed'` selon le mode.
  - `reservation.service.ts` `confirm` (rejet) & `circuit.service.ts` `rejectReservation` : après rejet, `UPDATE trip_plan_items SET status='rejected' WHERE reservation_id=$1` (via repo) + `UPDATE trip_plans SET status='partial' WHERE id IN (…item.tripPlan.id)`.
  - `reservation.service.ts` `cancel` & `circuit.service.ts` `cancelReservation` : `item.status='cancelled'`.
  - Notifications : voyageur + motif + lien vers le plan.
- **Endpoints** : `GET /api/trip-plans/:id/status` (résumé par item : label, statut, réservation_id) ; `POST /api/trip-plans/:id/items/:itemId/replace` (remplacer un item refusé, cf. B4) ; `POST /api/trip-plans/:id/items/:itemId/retry` (re-tenter capacité).
- **Tests** : `trip-plan.service.spec.ts` + `reservation.service.spec.ts` — « reject d'une réservation liée → item rejected + plan partial » ; « cancel → item cancelled ».
- **AC** : tout refus/annulation remonte au plan en <1s ; le plan n'affiche plus « confirmé » pour un item refusé.

### Tâche 2.2 — 🟠 UX item refusé (B4) — 2 j (couplée 2.1)
- **Frontend** `frontend/app/trip-plans/[id]/page.tsx` :
  - État par item : ✅ / 🟠 / ❌ + motif (depuis `GET /trip-plans/:id/status`).
  - Bandeau plan : « 2/3 éléments confirmés » en `partial`.
  - Actions sur item refusé : « Remplacer » (ouvre `OfferItemSearchInline` / `GuideSearchInline` — composants existants — filtrés sur le même créneau), « Re-réserver » (`retry`), « Retirer ».
  - `GET /api/trip-plans/:id/items/:itemId/alternatives?day=N` : top 3 offres du même type/région avec dispo + prix → carte « Suggestions » sous l'item refusé.
- **Tests** : composant frontend (jest + testing-library si présent) ; sinon test manuel scripté dans le plan de test.
- **AC** : un refus affiche 3 alternatives cliquables ; la re-réservation réessaie une session proche.

### Tâche 2.3 — 🟠 Détection no-show (A4) — 3 j
- **Migration** : `1722000000006-no-show.ts` :
  - `reservations` : + `no_show_at timestamptz NULL`, `no_show_reason varchar NULL`, `attendance_status varchar NULL` ('pending'|'attended'|'absent').
  - `eco_travelers` : + `no_show_count int DEFAULT 0`, `reliability_score int DEFAULT 100`.
- **Backend** :
  - `reservation.service.ts` `finalizeCompletedReservations` : ne plus auto-compléter ; créer une **fenêtre de présence 48h** → `attendance_status='pending'`, notification provider « confirmez la présence ».
  - Nouvel endpoint `POST /api/reservations/:id/attendance { attended: bool }` (provider/guide) → `attended`/`absent` ; si `absent` : `no_show_at=now()`, `no_show_count++`, `reliability_score=max(0, 100-15*count)`.
  - **Conséquences douces** (règles, sans argent) : `count≥2` → badge « Fiabilité en baisse » exposé aux providers (`GET /api/travelers/:id/trust`) ; `count≥3` → réservations manual mises en bas de la file providers ; `count≥5` → blacklist douce (offres manual exigent pré-contrat) + levée après 3 réservations honorées.
  - Cron de rappel J-7 / J-1 (notification voyageur + provider) — cf. C3 (Tâche 4.3) mais l'endpoint attendance doit exister ici.
- **Frontend** : provider — boutons « Présent / Absent » sur la réservation (page `dashboard/provider/reservations/[id]/page.tsx`) ; voyageur — visibilité du score de fiabilité dans le profil.
- **Tests** : `reservation.service.spec.ts` — fenêtre de présence, absent → no_show_count+1, levée de blacklist après 3 honorées.
- **AC** : une session passée >48h sans confirmation de présence n'est plus marquée `completed` automatiquement ; le provider peut marquer la présence.

### Tâche 2.4 — 🟠 Calendrier de disponibilité circuit (B1) — 2,5 j
- **Backend** : `circuit.service.ts` — `getAvailability(circuitId, month)` :
  - croise `circuit.availability` (mode/specific_dates/weekdays/avail_start/avail_end) **et** la disponibilité des guides (via `guide_availability` / agenda fusionné `OfferAgendaSync`) **et** la capacité des `programItems` pour chaque date candidate.
  - Sortie : `{ month, dates: [{ date, status: 'available'|'limited'|'unavailable', reasons: string[] }] }`.
- **Endpoint** : `GET /api/circuits/:id/availability?month=YYYY-MM`.
- **Frontend** : page `frontend/app/circuits/[id]/page.tsx` — remplacer la saisie de date libre par un calendrier (`SmartDatePicker` existant) avec dates grisées et libellés (« guide occupé », « activité complète »).
- **Tests** : `circuit.service.spec.ts` — intersection availability × guide × capacité.
- **AC** : une date où le guide est en rendez-vous est grisée avec la raison.

**Sprint 2 — Démo/validation** : plan partiel après rejet d'un item (statuts + alternatives) ; session passée sans présence → pas `completed` ; calendrier circuit grisé sur conflit guide.

---

## Sprint 3 — Temps réel + prix : SSE, prix dynamiques, annulation partielle

**Objectif** : notifications temps réel (B3), première valeur prix (A2), flexibilité circuit (A3).

### Tâche 3.1 — 🟠 Notifications SSE (B3) — 2 j
- **Backend** :
  - `notification/notification.controller.ts` : `GET /api/notifications/stream` (SSE, `text/event-stream`, header `X-Accel-Buffering: no`). Diff toutes les 15s sur `updated_at > Last-Event-ID` (reprise de flux) ; événements `{ id, type, title, body, link }`.
  - Un module SSE dédié `notification/sse.gateway.ts` (pas de socket.io pour l'instant).
- **Frontend** :
  - Hook `useNotificationStream()` : ouvre `EventSource` si connecté, met à jour le badge navbar, déclenche un **toast** (« ✅ Réservation confirmée ») cliquable → lien. Fallback : polling 30s si `EventSource` indisponible.
  - Brancher sur `frontend/app/notifications/page.tsx` + navbar.
- **Tests** : unitaire du hook (mock EventSource) ; test manuel 2 onglets.
- **AC** : une confirmation de réservation (action provider) apparaît en toast <15s sans refresh.

### Tâche 3.2 — 🟠 Prix dynamiques v1 (A2) — 3 j
- **Migration** : `1722000000007-price-rules.ts` :
  - table `price_rules` (`id uuid pk, offer_item_id uuid null, circuit_id uuid null, starts_at date, ends_at date, multiplier numeric(4,2), label varchar`),
  - `offer_item` : + `early_bird_days int null`, `last_minute_days int null`.
- **Backend** : `domain/pricing-domain.service.ts` — fonction pure `applyDynamicPricing(basePrice, sessionDate, bookingDate, rules, earlyBirdDays, lastMinuteDays)` :
  1. fenêtres saisonnières (multiplier),
  2. early-bird : `-10%` si `daysUntil ≥ early_bird_days`,
  3. dernière minute : `+15%` si `daysUntil ≤ last_minute_days`,
  4. demande (optionnel) : `× (1 + (1 - remaining/total) × 0.15)` plafonné.
  - Branchée dans `reservation.service.ts:create` (calcul prix) et `trip-plan.service.ts:preview/book` (même fonction).
- **Backend admin** : CRUD `price_rules` (`admin.controller.ts`) + UI dans `frontend/app/admin/page.tsx`.
- **Frontend** : afficher « Tarif haute saison appliqué (+20%) » dans panier/récap (transparence).
- **Tests** : `pricing-domain.service.spec.ts` — priorités fenêtre vs early-bird vs dernière minute ; bornes.
- **AC** : un item avec règle juin-sept ×1.2 voit son prix changer selon la date de session ; le prix affiché = prix payé.

### Tâche 3.3 — 🟠 Annulation partielle circuit (A3) — 3 j
- **Migration** : `1722000000008-circuit-partial-cancel.ts` :
  - `circuit_reservation_options` : + `is_cancelled bool DEFAULT false`,
  - table `circuit_reservation_cancellations` (`id uuid pk, circuit_reservation_id uuid, day_number int null, option_ids jsonb default '[]', participants_count int, reason text null, created_at timestamptz`).
- **Backend** : `circuit.service.ts` — `cancelPartialReservation(id, userId, { day_numbers?, option_ids?, reason? })` :
  - restaure la capacité des seuls programItems du/des jour(s) via `restoreProgramItemsCapacity` (existant) + des options via `restoreOptionsCapacity`,
  - recalcul : `final_total = base_total × (jours restants / jours totaux) + options non annulées`,
  - règle : impossible si les participants restants < `min_participants` ; audit dans la table de cancellations.
- **Endpoint** : `POST /api/circuit-reservations/:id/cancel-partial`.
- **Frontend** : détail réservation circuit (`frontend/app/circuits/[id]/page.tsx`) — chaque jour annulable individuellement, prix recalculé en direct, badge « Jour annulé ».
- **Tests** : `circuit.service.spec.ts` — prorata, restauration ciblée, garde-fou min_participants.
- **AC** : annuler le Jour 2 d'un circuit 5 jours restaure la capacité du jour 2 et recale le total.

**Sprint 3 — Démo/validation** : toast SSE sur confirmation ; règle saisonnière active en base ; annulation partielle d'un circuit avec recalcul.

---

## Sprint 4 — Devises, SEO, saisonnalité, fidélité

**Objectif** : réassurance voyageur étranger (A6), traction organique (C2), cycles (C3, C4, C5).

### Tâche 4.1 — 🟠 Multi-devises — affichage (A6) — 1,5 j
- **Migration** : `1722000000009-currency-rates.ts` → table `currency_rates` (`code varchar pk, rate_to_tnd numeric(10,4), updated_at`).
- **Backend** : `GET /api/currency/rates` (+ seed TND=1, EUR, USD, DZD via script `scripts/seed-currency.sql`).
- **Frontend** : composant `PriceWithConversion` (conversion affichage « ≈ 35 € »), branché sur les cartes offre/circuit/guide + récap réservation. Aucune écriture en devise autre que TND (les calculs serveur restent TND).
- **Tests** : unitaire du composant (arrondi, TND=1).
- **AC** : un prix TND s'affiche aussi en EUR pour un voyageur « étranger » (déterminé par `accept-language` ou choix utilisateur).

### Tâche 4.2 — 🟢 Pages SEO région/thème (C2) — 3 j
- **Migration** : `1722000000010-seo-pages.ts` → table `seo_pages` (`id uuid pk, slug varchar unique, title, description, body text, image, region varchar null, theme varchar null, created_at, updated_at`).
- **Backend** : CRUD admin `seo_pages` + `GET /api/seo/:slug` (public).
- **Frontend** (Next.js SSG) :
  - `app/regions/[slug]/page.tsx` + `generateStaticParams` sur les 24 gouvernorats (`lib/tunisia-governorates.json`),
  - `app/themes/[slug]/page.tsx`,
  - liste offres/circuits/guides de la région via endpoints `?region=` existants,
  - `generateMetadata` + JSON-LD, `app/sitemap.ts`, `app/robots.ts`.
- **Tests** : `GET /api/seo/:slug` ; vérif SSG build (`yarn build` frontend).
- **AC** : 24 pages régions + N pages thèmes générées au build, indexables.

### Tâche 4.3 — 🟠 Saisonnalité & relances (C3) — 2,5 j
- **Backend** : `campaign/campaign.service.ts` (+ module) :
  - `GET /api/offers?season=upcoming` : tri des offres avec `season_start ≤ today+30 ≤ season_end` (réutiliser `availability.saisons` ou nouveaux champs `season_start/season_end` si absents — migration légère).
  - Cron pré-saison (avril-mai) : cibler voyageurs ayant réservé/cherché l'année précédente (funnel_events + réservations) → notification + email via `MailService`.
  - Cron rappels J-7 / J-1 post-réservation (checklist, météo via `WeatherSection`, point de rencontre) — réduit le no-show (sprint 2).
- **Frontend** : badges « Bientôt de saison » + rangée « Hors saison : idéal en ce moment » (Sahara/sud) sur la home.
- **Tests** : `campaign.service.spec.ts` — ciblage et fenêtres.
- **AC** : un voyageur ayant réservé un circuit désert en août reçoit une relance mi-avril pour la nouvelle saison.

### Tâche 4.4 — 🟢 Réengagement post-voyage (C4) — 2 j
- **Backend** : `review/review.service.ts` — cron J+2/J+7 après `completed` (notification « Racontez votre expérience ») ; endpoint bilan CO₂ `GET /api/eco-travelers/:id/co2-saved` (formule simple : durée × transport).
- **Frontend** : `frontend/app/dashboard/ecovoyageur/*` — jauge éco-score avec breakdown (questionnaire 20 / réservations 40 / feedbacks 20 / partages 20) + « ~X kg CO₂ évités » partageable (image générée client-side) + suggestions « Repartez en X ».

### Tâche 4.5 — 🟢 Fidélité par score (C5) — 1,5 j
- **Backend** : règles de paliers (config simple dans `eco-traveler.service.ts`) : palier → avantages non monétaires (avant-première circuits, priorité de confirmation = tri des demandes manual en faveur des scores élevés, réutilise `reliability_score` du sprint 2).
- **Frontend** : profil voyageur — progression vers le prochain palier + badge.

**Sprint 4 — Démo/validation** : conversion EUR affichée ; `/regions/tozeur` indexable ; campagne pré-saison ; jauge éco-score.

---

## Sprint 5 — Durcissement, perf, tests & release

**Objectif** : fiabiliser l'ensemble, combler les trous de validation, préparer la mise en production.

| Tâche | Détail |
|---|---|
| **5.1 — Vérif capacité `updateReservation` / `addParticipants`** (Risque 2) | `circuit.service.ts:updateReservation` : re-vérifier `reserveProgramItemsCapacity` sur toute hausse de `participants_count` ; `reservation.service.ts:addParticipants` : vérifier `max_group_size`/`min_age` sur le nouvel ensemble + capacité guideOfferingSession. Tests dédiés. |
| **5.2 — Taux de refus / délai de réponse providers** | Compléter les KPI (Sprint 1) avec la vue provider (pattern `GuideAnalytics`) : taux d'occupation de SES sessions, taux de no-show de SES clients. |
| **5.3 — Tests de non-régression** | Réécrire/étendre les specs existants touchés par les sprints 1-4 : `reservation`, `circuit`, `trip-plan`, `travel-cart`, `pricing-domain`, `analytics`. Ajouter des tests e2e (`test/app.e2e-spec.ts`) sur le flux complet panier→plan→book→refus→alternatives. |
| **5.4 — Perf & migrations en prod** | Index sur `funnel_events(created_at, user_id)`, `trip_plan_items(status)`, `reservations(status, created_at)` ; vérifier l'exécution des migrations sur la base de prod (backup + dry-run). |
| **5.5 — Revue sécurité** | Passer `code-reviewer` + skill `security-code-audit` sur les nouveaux endpoints (SSE, attendance, cancel-partial, replace/retry) : IDOR sur `trip_plan_items`, validation des `day_numbers`/`option_ids` (appartenance au circuit), rate-limit sur l'endpoint attendance. |
| **5.6 — Release** | Changelog, mise à jour `docs/SPRINT_6.md`/ROADMAP, déploiement CI/CD (`.github/workflows/deploy.yml`). |

---

## Récapitulatif des migrations (ordre d'exécution)

| Migration | Contenu |
|---|---|
| `…002` | `reservations.expected_end_at` (optionnel, sortie completed offres sans session) |
| `…003` | `cart_abandonment_events` |
| `…004` | `funnel_events` + `offers.approved_at` + `circuits.approved_at` |
| `…005` | `trip_plan_items.reservation_id/circuit_reservation_id/status` + `reservations.trip_plan_item_id` |
| `…006` | `reservations.no_show_at/no_show_reason/attendance_status` + `eco_travelers.no_show_count/reliability_score` |
| `…007` | `price_rules` + `offer_item.early_bird_days/last_minute_days` |
| `…008` | `circuit_reservation_options.is_cancelled` + `circuit_reservation_cancellations` |
| `…009` | `currency_rates` |
| `…010` | `seo_pages` |

## Dépendances inter-sprints

- **Sprint 2 (A1) dépend de** : rien (le statut `partial` du plan existe déjà). Le **B4** dépend de A1.
- **Sprint 3 (A2 prix) dépend de** : la factorisation `preview` du Sprint 1 (même fonction de prix).
- **Sprint 3 (B3 SSE) dépend de** : le choix scheduler du Sprint 0 (pour les notifications triggerées par cron).
- **Sprint 4 (C3 rappels) dépend de** : A4 (attendance) du Sprint 2 et funnel_events du Sprint 1.
- **Sprint 5 dépend de** : tout le reste (durcissement).

## Critères de sortie globaux

1. `backend: yarn build && yarn test && yarn lint` ✅
2. `frontend: yarn build && yarn lint` ✅
3. Migration dry-run sur copie de prod sans erreur.
4. Parcours e2e couvert : panier → plan → book → refus → alternative → récupération → avis.
5. Aucune proposition de paiement/commission/acompte dans les flux livrés (contrainte du prompt initial).

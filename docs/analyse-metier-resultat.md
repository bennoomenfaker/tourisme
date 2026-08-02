# Analyse Métier — Éco-Voyage
> Exécution du prompt `docs/prompt-analyse-metier.md` (v2), vérifiée contre le code (backend NestJS/TypeORM + frontend Next.js).
> Contrainte respectée : **aucune** proposition de gateway de paiement, commission ou acompte. Le no-show est traité sans volet financier.

> ✅ **Corrections déjà appliquées** (2026-08-02) : les 2 bugs et l'incohérence d'états découverts par l'audit sont **corrigés** dans le code :
> 1. `CircuitService.remove` : `status: 'draft'` → `'pending'` (le circuit ne peut plus être supprimé avec des demandes en attente).
> 2. Défaut `currency` des circuits : `'XAF'` → `'TND'` (`create` + `update`).
> 3. Machine à états : `pending → expired` autorisé pour `circuit` (aligné sur `checkExpiredReservations`, qui conserve l'expiration 48h).
> Compilation `tsc` + 48 tests OK. Voir les sections A6/A7, le risque 3 et le tableau des verdicts.

---

## 0. Synthèse exécutive — les 10 actions à faire (par ordre d'impact)

| # | Action | Impact | Effort | Schéma |
|---|--------|--------|--------|--------|
| 1 | **Lien inverse réservation↔trip_plan + sync de statut** (conflit A1) | 🔴 Critique | Moyen | ✅ oui |
| 2 | **Détection no-show par réputation/score** (A4) | 🔴 Élevé | Moyen | ✅ oui |
| 3 | **Récupération de panier abandonné** (A5) | 🔴 Élevé | Faible | ❌ non (1 champ) |
| 4 | **Prix dynamiques saisonniers simples** (A2) | 🟠 Moyen | Moyen | ✅ oui |
| 5 | **Annulation partielle circuit** (A3) | 🟠 Moyen | Moyen | ✅ oui |
| 6 | **Aperçu trip plan par jour + items refusés** (B2/B4) | 🟠 Moyen | Faible | ❌ non |
| 7 | **Recommandation par préférences MongoDB** (C1) | 🟠 Moyen | Moyen | ❌ non |
| 8 | **Pages SEO par région/thème** (C2) | 🟢 Moyen | Faible | ❌ non |
| 9 | **KPIs funnel + instrumentation** (D) | 🟢 Moyen | Faible | ❌ non |
| 10 | **Correction bug `status: 'draft'` dans `CircuitService.remove`** (A7) | 🟢 Critique* | Trivial | ✅ fait |

\* le bug #10 est trivial à corriger mais ouvre une faille métier (suppression d'un circuit avec réservations en attente).

---

## A. AUDIT MÉTIER DE LA RÉSERVATION

### A0. Cartographie des 3 flux (vérifiée dans le code)

**Flux A — Offre directe** (`ReservationService.create`)
```
Découverte offre → [offer_item + session + participants] → POST /reservations
  → validations : session non full, booking_deadline_days, capacité (CapacityDomainService),
    min/max_group_size, min_age, double-réservation même session
  → prix SERVEUR : session.price_override ?? priceRow.price × participants (×nuits si per_night)
  → statut : automatic→confirmed / manual→pending
  → capacité décrémentée → score durabilité recalculé → notifications
Parcours aval : pending→confirmed/rejected (provider) | cancelled (voyageur, délai vérifié) | expired (cron 48h)
  → confirmed→completed (cron, date session passée)
```
**Points de friction du flux A :**
- `confirmation_mode` en mode manuel : le voyageur « paie » en confiance aveugle (rien ne garantit la réponse), aucun délai de réponse visible côté UI.
- L'ajout de participants (`addParticipants`) recalcule le prix mais **ne vérifie pas** `max_group_size` ni `min_age` du nouvel ensemble.
- `finalizeCompletedReservations` ne regarde que `session.date` : une offre sans session ne passe **jamais** en `completed` (elle reste `confirmed` indéfiniment).
- Aucun flux de « no-show » (voir A4).

**Flux B — Circuit** (`CircuitService.reserve`)
```
Découverte circuit → [date + participants + options] → POST /circuits/:id/reserve
  → statut approuvé, min/max_participants, capacité des programItems + options (transaction pessimiste)
  → pricing serveur (base + options, PricingDomainService) → snapshot figé (CircuitReservationSnapshot)
  → statut : manual→pending / automatic→confirmed → notifications voyageur + author + guides
Parcours aval : confirmReservation | rejectReservation (restaure capacité) | cancelReservation (complète) | cron
```
**Points de friction du flux B :**
- **Aucune contrainte de dates** : `reserve` ne vérifie pas que la date demandée est dans la fenêtre `circuit.availability` ni la disponibilité des guides/offres agrégées pour cette date (voir B1).
- `updateReservation` peut modifier `participants_count` **à la hausse sans re-vérifier la capacité** des activités liées (aucun appel à `reserveProgramItemsCapacity`).
- `remove` (suppression) : le comptage des réservations en attente interrogeait `status: 'draft'` au lieu de `'pending'` — **bug corrigé** (`.where status: 'pending'`) : un circuit avec des demandes pending ne peut plus être supprimé (voir A7).
- Annulation = uniquement globale (voir A3).

**Flux C — Trip Plan** (`TripPlanService.book`)
```
Panier (TravelCart) → convert → TripPlan (draft) → POST /trip-plans/:id/book
  → boucle par item : circuit | guideOffering | offerItem (validations + capacité par item)
  → succès PARTIEL : erreurs collectées par item → plan status = confirmed (0 erreur) | partial (≥1 erreur)
  → transaction : tout échoue si AUCUN item réservé → notifications → score
Parcours aval : chaîne de réservations indépendantes ; le plan N'EST PAS lié aux réservations.
```
**Points de friction du flux C :**
- **Pas de lien inverse réservation→trip_plan** : un refus provider après confirmation du plan ne met à jour ni le plan ni l'état visuel (voir A1).
- Les réservations circuits créées depuis un trip plan n'ont **pas de snapshot** (contrairement au flux B direct).
- Le prix total affiché au voyageur avant réservation est recalculé **côté frontend** (`computeItemTotal`) : risque d'écart avec le prix serveur final (déjà le cas pour `per_night`/nuits).
- La déduction d'une session guide se fait par « première session disponible » silencieuse si `guideOfferingSession` absent : le voyageur ne choisit pas sa date (voir B1).

### A1. CONFLITS — provider refuse un item d'un trip plan déjà confirmé

**Constat vérifié** : `TripPlanItem` n'a aucun champ `status` ni lien vers sa `Reservation` ; `Reservation` n'a pas de `trip_plan_id`. Le refus (`ReservationService.confirm` / `CircuitService.rejectReservation`) ne remonte jamais vers le plan. Un plan `confirmed` affiche un item réservé alors que la réservation est `rejected`. Le voyageur ne le voit qu'en allant dans sa liste de réservations.

**Impact métier** : élevé — c'est le moment où la confiance se brise : le voyageur a organisé tout son séjour autour d'un plan qu'il croit confirmé.

**Proposition concrète** :
- **Schéma** : ajouter sur `trip_plan_items` : `reservation_id uuid NULL`, `circuit_reservation_id uuid NULL`, `status varchar default 'pending'` ('pending' | 'booked' | 'confirmed' | 'rejected' | 'cancelled' | 'expired'). Alimenter `reservation_id` dans `TripPlanService.book` (et en option un `trip_plan_item_id` sur `reservations` pour la requête inverse).
- **Backend** : dans `ReservationService.confirm` (rejet) et `CircuitService.rejectReservation`, après sauvegarde, `UPDATE trip_plan_items SET status='rejected' WHERE reservation_id=$1` + `UPDATE trip_plans SET status='partial'` si ≥1 item refusé ; notifier le voyageur avec le motif.
- **Endpoints** : `GET /trip-plans/:id/status` (résumé agrégé des items) ; `POST /trip-plans/:id/items/:itemId/replace` (proposer une alternative) — voir B4.
- **Règle de transition du plan** : `confirmed` → `partial` (rejet) → `draft` (le voyageur remplace l'item) → re-book.

**Priorisation** : ROI 🔴 élevé (confiance/conversion) · Risque technique : moyen (transitions d'état) · **Schéma : oui** · 1–2 sprints.

### A2. PRIX DYNAMIQUES — aucun mécanisme hors `price_override`

**Constat vérifié** : `session.price_override` (offres) et `guideOfferingSession.price_override` existent et sont appliqués dans le calcul serveur, mais ils sont **saisis manuellement**, sans notion de période, saison ou demande. Rien n'utilise la saisonnalité (pourtant structurante en Tunisie : pic août).

**Proposition — modèle simple adapté au marché tunisien (4 leviers cumulables, en ordre d'effort)** :
1. **Fenêtres tarifaires** : table `price_rules` — `{ id, offer_item_id nullable, circuit_id nullable, starts_at, ends_at, multiplier decimal, label }`. Le calcul serveur applique `multiplier` si la date de session ∈ fenêtre. Seed de règles « Haute saison juin-sept ×1.2 » / « Basse saison ×0.85 ».
2. **Early-bird / dernière minute** : 2 colonnes sur `offer_item` : `early_bird_days` (remise si réservé ≥ X jours avant) et `last_minute_days` (surtaxe si ≤ X jours avant). Une fonction pure `applySeasonalPricing(base, sessionDate, bookingDate)`.
3. **Demande réelle** : utiliser `remaining_capacity` déjà calculé — p. ex. `multiplier = 1 + (1 - remaining/total) × 0.15` plafonné. Zéro nouvelle table, purement calculatoire.
4. **Transparence obligatoire** : afficher « prix estimé — tarif haute saison » dans le panier et à la réservation (législation + confiance).

**Priorisation** : ROI 🟠 moyen-élevé (marge + lissage de demande) · Risque : faible (fonction pure, testable) · **Schéma : oui** (1 table + 2 colonnes) · Leviers 1-2 en 1 sprint, le 3 en 2 sprints.

### A3. ANNULATION PARTIELLE — impossible sur circuit multi-jours

**Constat vérifié** : `CircuitService.cancelReservation` annule la réservation entière et restaure toute la capacité. Aucun chemin pour n'annuler qu'une journée ou une option.

**Proposition** :
- **Schéma** : sur `circuit_reservation_options` ajouter `is_cancelled boolean default false` ; nouvelle entité `circuit_reservation_cancellations` (`{ id, circuit_reservation_id, day_number, option_ids jsonb, participants_count, created_at, reason }`) pour l'audit et le remboursement futur (hors périmètre paiement).
- **Backend** : `POST /circuit-reservations/:id/cancel-partial` avec `{ day_numbers?: number[], option_ids?: string[], reason? }`. Logique : restaurer la capacité des seuls programItems du/des jour(s) annulé(s) via `restoreProgramItemsCapacity` (déjà existant) et des options ciblées via `restoreOptionsCapacity` ; recalculer `final_total` (options annulées déduites, prorata du prix du jour = base_total / nombre de jours × participants).
- **UI** : dans le détail de réservation circuit, chaque jour devient annulable individuellement (badge « Annulé », prix recalculé affiché).
- **Frontière** : un circuit ne peut pas être annulé « partiellement » en dessous de `min_participants` restants ; l'annulation partielle de participants (et non de jours) est traitée séparément en A7.

**Priorisation** : ROI 🟠 moyen (flexibilité = argument de vente B2B) · Risque : moyen (calculs prorata) · **Schéma : oui** · 1–2 sprints.

### A4. NO-SHOW — aucune pénalité ni détection (sans paiement en ligne)

**Constat vérifié** : `finalizeCompletedReservations` passe `confirmed → completed` automatiquement dès que la date de session est passée, sans aucune notion de présence. `deposit_percentage` est stocké mais jamais appliqué (et restera hors périmètre).

**Proposition — boucle vertueuse de réputation (sans argent)** :
- **Schéma** : `reservations.no_show_at timestamp NULL` + `no_show_reason varchar NULL` ; entité `traveler_trust` (PostgreSQL) ou champs sur `eco_traveler` : `no_show_count int default 0`, `reliability_score int` (100 − 15 × no_show).
- **Détection** : dans le cron `finalizeCompletedReservations`, ne plus auto-compléter les sessions passées > 48h sans action : déclencher une **fenêtre de confirmation de présence** de 48h — le provider (ou guide) marque « présent » / « absent » via `POST /reservations/:id/attendance { attended: boolean }` (nouveau). Sans réponse, statut `attendance_pending` (jamais pénalisant).
- **Conséquences douces** :
  - `no_show_count ≥ 2` → badge visible « Fiabilité en baisse » sur le profil voyageur (vu par providers).
  - `no_show_count ≥ 3` → réservations manual → statut bloqué en `pending` 72h (priorité réduite dans la file providers) — sans refus définitif.
  - `no_show_count ≥ 5` → **blacklist douce** : les offres manual exigent un pré-contrat (pas de paiement) ; levée automatique après 3 réservations honorées.
- **Côté providers** : dashboard « Taux de présence » + notification de rappel J-1 (voir C3) pour réduire le no-show à la source.

**Priorisation** : ROI 🔴 élevé (protège l'offre, augmente la fiabilité du marketplace) · Risque : faible-moyen · **Schéma : oui** · 2 sprints.

### A5. ABANDON DE PANIER — aucun suivi, aucun statut

**Constat vérifié** : `TravelCart` définit `status 'active' | 'converted' | 'abandoned'` mais le code ne pose **jamais** `abandoned` (seuls `active` et `converted` sont écrits). Aucune relance.

**Proposition** :
- **Backend** : cron quotidien `POST /internal/carts/flag-abandoned` : `UPDATE travel_carts SET status='abandoned' WHERE status='active' AND updated_at < now() - interval '24 hours'`. Table `cart_abandonment_events` (`{ id, cart_id, user_id, triggered_at, email_sent_at, recovered bool }`) pour l'analyse de récupération.
- **Notification + email** : 24h après abandon → notification in-app « Votre panier vous attend » avec les 3 premiers items ; J+3 → rappel. Lien direct de reprise du panier (`/cart?restore=1`).
- **Récupération** : tout ajout au panier abandonné le repasse en `active` et marque `recovered=true` (indicateur de performance de la relance).
- **UI** : widget « Panier abandonné » sur la page d'accueil (déjà un composant `CartWidget`), et une carte de rappel dans les notifications.

**Priorisation** : ROI 🔴 élevé (coût quasi nul, conversion directe — c'est le funnel déjà construit) · Risque : très faible · **Schéma : minime** (1 table d'événements) · 1 sprint.

### A6. MULTI-DEVISES — stockée sans conversion

**Constat vérifié** : `currency` est stocké sur `Reservation`, `OfferItemPrice`, `GuideOffering`, `Circuit` (défaut `'TND'`, mais `CircuitService.create` utilise `'XAF'` par défaut — **incohérence**). Aucune conversion, aucun affichage EUR/USD/DZD alors que le contexte marché l'exige.

**Proposition — affichage d'abord, conversion ensuite** :
- **Phase 1 (1 sprint)** : tableau `currency_rates` (`{ code, rate_to_tnd, updated_at }`) + endpoint `GET /currency/rates`. Affichage côté frontend « ≈ 35 € » à côté du prix TND, via un composant `PriceWithConversion` (config carte = taux fournis). **Aucune écriture en devise autre que TND** — le prix de référence reste TND partout (intégrité du calcul serveur préservée).
- **Phase 2 (moyen terme)** : `POST /reservations` accepte `display_currency` (cosmétique uniquement), jamais utilisé dans les calculs.
- **Règle produit** : DZD affiché pour le trafic frontalier, EUR/USD pour l'international ; les taux sont une donnée marketing (arrondie) et non contractuelle tant qu'il n'y a pas de paiement.
- **Correction immédiate** : aligner le défaut `currency` de `CircuitService.create` sur `'TND'` — **fait** (`create` et `update` : `dto.currency ?? 'TND'`).

**Priorisation** : ROI 🟠 moyen (réassurance voyageur étranger) · Risque : très faible (phase 1 cosmétique) · **Schéma : oui** (1 table lecture-seule) · Phase 1 : 1 sprint.

### A7. ÉTATS — cohérence des transitions

**Constats vérifiés** :
1. `RESERVATION_TRANSITIONS` : `pending → expired` n'était autorisé que pour `booking`, pas pour `circuit` — or `CircuitService.checkExpiredReservations` (cron) passe quand même `pending → expired` sur les réservations circuit. **Corrigé** : la transition `expired: ['booking', 'circuit']` est ajoutée au domaine (décision : le cron circuit est conservé, la source de vérité est alignée).
2. `rejected → draft` est une transition « circuit » — mais aucun chemin ne produit un `draft` sur une `circuit_reservation` ; le comptage de `remove` utilisait justement `status: 'draft'` : **bug corrigé** (cf. A0). `CircuitService.remove` : `where: { circuit: { id }, status: 'pending' }` → un circuit avec réservations pending est maintenant protégé.
3. `TripPlan.status` admet `draft | planning | partial | pending | confirmed | completed | cancelled`, mais le backend ne pose que `draft`, `confirmed` et `partial`. `planning/pending/completed/cancelled` sont des états fantômes côté API.
4. `finalizeCompletedReservations` (offres) : une offre **sans session** ne devient jamais `completed`.
5. Les notifications envoyées dans `TripPlanService.book` sont `fire-and-forget` (`.catch(() => {})`) **à l'intérieur de la transaction** : si la transaction commit mais la notification échoue, aucune trace — acceptable, mais un échec de notification ne doit jamais faire échouer le booking (comportement actuel correct, à documenter).

**Propositions** :
- Uniformiser la machine à états : une seule source de vérité (`RESERVATION_TRANSITIONS`) utilisée par **tous** les crons (booking **et** circuit) — **fait** pour `expired` circuit (transition ajoutée).
- **Corriger le bug** `status: 'draft'` → `'pending'` dans `CircuitService.remove` — **fait**.
- Créer une vraie transition manuelle `confirmed → completed` côté provider/voyageur (au lieu d'uniquement le cron), et une sortie `completed` pour les offres sans session basée sur une date « fin de prestation » (session ou date de réservation + durée).
- Nettoyer les états fantômes du trip plan (supprimer ou implémenter `planning`, `pending`, `completed`, `cancelled`).
- Documenter la politique d'expiration des circuits (48h identique au booking ?).

**Priorisation** : ROI 🟠 (intégrité, évite les données bloquées) · Risque : faible · **Schéma : non** (sauf si on ajoute une date de fin pour les offres sans session) · 1 sprint.

---

## B. EXPÉRIENCE UTILISATEUR

### B1. Sélection de dates d'un circuit multi-jours

**Problème vérifié** : `reserve` n'utilise **jamais** `circuit.availability` (mode/specific_dates/weekdays/avail_start/avail_end) ni les disponibilités des guides/offres agrégées. Le voyageur choisit une date « au doigt mouillé », et le provider devra la confirmer — friction majeure sur un produit multi-jours.

**Propositions UX concrètes** :
1. **Calendrier de disponibilité côté serveur** : endpoint `GET /circuits/:id/availability?month=YYYY-MM` qui renvoie les dates possibles calculées depuis `availability` ET croisées avec la disponibilité des guides (`guide_availability`) et la capacité des `programItems` (réservation de capacité est déjà pré-réservable via `reserveProgramItemsCapacity`). Utiliser `SmartDatePicker` (déjà présent) avec dates grisées.
2. **Étapes de booking remaniées** : `Date → Participants → Options → Aperçu (prix/jour) → Confirmer`. Afficher pour chaque date : « ✔ guide disponible · ✔ activités dispo · ✖ guide occupé » (données déjà disponibles via l'agenda fusionné guide↔provider).
3. **Message d'engagement clair** : « Ce circuit nécessite une confirmation manuelle (J-3 max) » pour les circuits `manual`, avec un compteur de temps de réponse côté provider.
4. **Si le circuit est flexible** (`availability.mode = 'flexible'`) : champ « Dates souhaitées » + le provider propose des dates dans sa réponse (utiliser le composant `AgendaManager` côté provider).

**Priorisation** : ROI 🔴 élevé (réduit le taux de refus à la source) · Risque : moyen (calcul de croisement) · **Schéma : non** · 1–2 sprints.

### B2. Visualisation du trip plan avant réservation

**Problème vérifié** : la page `trip-plans/[id]` calcule un `totalBudget` **côté client** avec une logique de prix dupliquée (`computeItemTotal`) qui ne correspond pas toujours au calcul serveur (ex. `price_override`, options de circuit, `on_request`). Pas de détail par jour, pas de « prix confirmé vs estimé ».

**Propositions UX** :
1. **Endpoint d'aperçu serveur** : `GET /trip-plans/:id/preview?participants=N` qui renvoie `{ items: [{ id, label, type, unit_price, total, pricing_unit, estimated: boolean }], total, currency, warnings: string[] }` — **même logique que `book`** (factoriser le calcul de prix pour ne plus le dupliquer). Le frontend ne fait plus que l'affichage.
2. **Vue par jour** : onglets Jour 1…N (les items ont déjà `day_number`), sous-total par jour, pictogramme de type (activité 🏞 / hébergement 🛏 / guide 🧭 / circuit 🗺), et ordre chronologique.
3. **Distinction prix** : badge « Estimé » (on_request, tarif haute saison) vs « Confirmé » ; afficher les warnings (« Capacité limitée : 3 places ») avant la réservation.
4. **Aperçu d'engagement** : avant le POST `book`, une modale récapitulative « Vous réservez X éléments pour N personnes = Y TND » avec la liste des items en attente de confirmation manuelle (badge orange).

**Priorisation** : ROI 🟠 moyen-élevé (réduit l'écart de prix ressenti et les litiges) · Risque : faible (factorisation) · **Schéma : non** · 1 sprint.

### B3. Notifications — polling vs SSE

**Constat vérifié** : page notifications → un `useEffect` qui fetch une fois (pas de polling) ; messagerie → `setInterval` (polling). Aucun WebSocket/SSE. L'utilisateur ne voit pas en temps réel l'arrivée d'une confirmation de réservation (pourtant le moment critique du tunnel).

**Proposition — SSE d'abord (simple, compatible infra actuelle)** :
- **Backend** : `GET /api/notifications/stream` en SSE (EventSource) — une table `notification_events` déjà existante sert de source ; diff sur `updated_at` toutes les 15 s avec un `Last-Event-ID` (reprise de flux). Prévoir le passage derrière le reverse proxy avec `X-Accel-Buffering: no`.
- **Frontend** : hook `useNotificationStream()` qui (1) ouvre l'EventSource quand l'utilisateur est connecté, (2) met à jour le badge de la navbar, (3) déclenche un **toast** discret (« ✅ Réservation confirmée ») cliquable. Fallback polling 30 s si EventSource indisponible (mobile/ancien navigateur).
- **WebSocket** : réserver pour la messagerie temps réel (déjà polling) — migrer la messagerie en 2e temps.
- **Anti-pattern à éviter** : ne pas brûler de ressources avec un ping SSE côté SPA multi-onglets (un seul flux par onglet actif).

**Priorisation** : ROI 🟠 moyen (réassurance temps réel) · Risque : faible-moyen (infra proxy) · **Schéma : non** · 1 sprint (SSE) + 1 sprint (migration messagerie WebSocket, optionnel).

### B4. Gestion d'un item refusé après confirmation du plan

**Problème vérifié** : aujourd'hui l'item refusé reste affiché comme « réservé » dans le plan (pas de champ status sur `trip_plan_items`).

**Propositions UX** (couplées à A1) :
1. **État visuel explicite** par item : ✅ Confirmé / 🟠 En attente / ❌ Refusé (motif affiché, lien vers la réservation). Le plan passe en bandeau `partial` (« 2/3 éléments confirmés »).
2. **Actions contextuelles** sur l'item refusé : (a) « Remplacer » → ouvre `OfferItemSearchInline` / `GuideSearchInline` (composants existants) filtré sur le même créneau/type ; (b) « Re-réserver » → `POST /trip-plans/:id/items/:itemId/retry` (relance la capacité, réessaie une session proche) ; (c) « Retirer ».
3. **Suggestion automatique d'alternatives** : endpoint `GET /trip-plans/:id/items/:itemId/alternatives?day=N` — top 3 offres du même type/région avec disponibilité et prix. C'est la brique qui transforme un refus en opportunité de conversion.
4. **Notification proactive** : dès le refus, notification + email au voyageur « Un élément de votre plan a été refusé — voici 3 alternatives ».

**Priorisation** : ROI 🔴 élevé (sauve la conversion après un refus) · Risque : moyen · **Schéma : oui** (cf. A1) · 1–2 sprints.

---

## C. CROISSANCE (hors monétisation)

### C1. Recommandation par préférences MongoDB

**Constat vérifié** : `TravelerPreferences` (`interests`, `landscapes`, `activities`, `objectives`, `updated_by_behavior`) est écrit via `upsertPreferences` mais **jamais lu** pour recommander. Le score de durabilité n'est pas utilisé pour trier les offres par voyageur.

**Proposition — recommandation simple à 3 sources, 1 sprint pour la v1** :
- **V1 (règles)** : `GET /offers/recommended` — scoring `score = match_preferences(offer.category/subtypes/region/activities) × 0.6 + sustainability_score × 0.3 + popularité × 0.1`. Le matching se fait par mots-clés partagés entre `traveler_preferences.interests` et `offer.offer_type/category/subtypes` (data déjà en base). Sortie : 6 offres + 3 circuits + 3 guides dans une rangée « Recommandé pour vous » sur la home et dans `TripPlanBuilder`.
- **V2 (comportement)** : le champ `updated_by_behavior` existe — alimenter `interests` automatiquement depuis les réservations/avis réussis (`ReservationService.create` → mongoService.incrementStat existe déjà ; ajouter une mise à jour des intérêts).
- **V3 (froid)** : `POST /onboarding/quiz` léger (5 questions) pour les nouveaux voyageurs sans historique — branché sur les mêmes champs.
- **Contrainte éthique** : la durabilité doit rester un critère visible (« éco-score ★★☆ ») et jamais un filtre caché.

**Priorisation** : ROI 🟠 moyen-élevé (conversion + engagement) · Risque : faible (règles, pas de ML) · **Schéma : non** · V1 : 1 sprint.

### C2. Pages SEO par région/thème

**Constat vérifié** : recherche par région existante (`?region=`), 24 gouvernorats disponibles dans `lib/tunisia-governorates.json` ; pas de pages statiques/SSG par région.

**Proposition** :
- **Routes SSG** : `app/regions/[slug]/page.tsx` (generateStaticParams sur les 24 gouvernorats) et `app/themes/[slug]/page.tsx` (randonnée, désert, culture, bien-être…). Chaque page : liste des offres + circuits + guides de la région (re-utiliser les endpoints existants `?region=`), titre/description/meta générés, JSON-LD (Product/Offer).
- **Contenu éditorial** : 100-150 mots par région (itinéraire « Incontournables ») alimentés par un contenu CMS simple (table `seo_pages` : slug, title, description, body, image) — éditable côté admin.
- **Sitemap + hreflang** : `app/sitemap.ts` (offres, circuits, guides, régions, thèmes) et `app/robots.ts`.
- **URLs canoniques** : éviter la duplication de contenu offer/région.

**Priorisation** : ROI 🟢 moyen (traction organique longue traîne, très pertinent pour un marché local où Google Maps/OTA dominent) · Risque : faible (SSG + APIs existantes) · **Schéma : oui** (table contenu) · 2 sprints.

### C3. Saisonnalité — relances pré-saison et post-saison

**Constat vérifié** : aucune logique de campagne saisonnière ; la saisonnalité est pourtant structurante (mai-oct, pic août).

**Proposition** :
- **Catalogue saisonnier** : flag `seasonal` + `season_start/season_end` sur offre/circuit (ou réutiliser `availability.saisons`) ; badge « Saison ✈ » et tri « bientôt de saison » dans la recherche dès J-30.
- **Campagne pré-saison (avril-mai)** : ciblage des voyageurs ayant réservé/cherché l'année précédente (données `created_at` des réservations + préférences) → notification in-app + email « Votre type de séjour est de retour » avec les offres correspondantes.
- **Rappels post-réservation** : J-7 / J-1 notifications « Votre départ approche » (checklist : point de rencontre, météo via `WeatherSection` existant, documents) → réduit le no-show (lié à A4).
- **Off-season** : mettre en avant les régions moins saisonnières (Sahara, sud) avec un badge « Hors saison : idéal en ce moment » — lissage de la demande, argument marché unique.

**Priorisation** : ROI 🟠 moyen (réactivation à coût quasi nul) · Risque : faible · **Schéma : minime** · 1-2 sprints.

### C4. Réengagement post-voyage

**Constat vérifié** : `ReviewService` recalcule le score ; rien ne relance le voyageur après `completed`.

**Proposition** :
- **Fenêtre d'avis intelligente** : 48h après `completed`, notification « Racontez votre expérience » + rappel J+7 si pas d'avis. Un formulaire guidé (note + 3 tags + photo) pré-rempli avec les items réservés (composant existant `PlaceContributions`/review).
- **Bilan CO₂ évité** : dans la page profil, « Grâce à vos X séjours durables, ~Y kg de CO₂ évités » (formule simple basée sur durée × type de transport renseigné) — contenu partageable (image générée) = boucle virale + renforce le score (composante partages 20%).
- **Suggestion de réengagement** : « Repartez en X » (même région, nouveau circuit) via la recommandation C1 avec un biais de fraîcheur (régions similaires, saison).

**Priorisation** : ROI 🟢 moyen (rétention + contenu UGC) · Risque : faible · **Schéma : non** · 1 sprint.

### C5. Fidélité via le score de durabilité

**Constat vérifié** : le score voyageur est calculé (questionnaire 20% + réservations 40% + feedbacks 20% + partages 20%) et les réservations/avis l'alimentent **automatiquement** désormais — mais le voyageur ne voit jamais comment il évolue, et rien ne le récompense.

**Proposition** :
- **Progression visible** : jauge « Éco-score » sur le profil avec breakdown par composante et « prochain palier » (niveau suivant à X points). Objectif : gamification, pas de badge caché.
- **Palier → avantage tangible (non monétaire)** : dès un palier (ex. « Guide d'or » 80+), accès à des **circuits en avant-première**, priorité de confirmation (tri des demandes manual en faveur des voyageurs fiables — réutilisable pour A4), participation à des événements communautaires.
- **Badge provider/guide côté voyageur** : afficher le score des providers/guides avec le label (déjà calculé) pour orienter le choix vers l'offre durable.

**Priorisation** : ROI 🟢 moyen (rétention + différenciation) · Risque : faible · **Schéma : non** · 1 sprint.

---

## D. KPIs & INSTRUMENTATION DU FUNNEL

**Constat vérifié** : `admin.service.ts` agrège déjà quelques stats (offres notées, avg score, top providers) — mais aucun KPI de funnel de réservation.

**Proposition — table d'événements + dashboard** :
- **Schéma** : `funnel_events` (`{ id, user_id, event_type, entity_type, entity_id, meta jsonb, created_at }`) — events écrits par un petit `AnalyticsService.log()` aux points clés. Table `abandonment` de A5 peut en dériver.
- **Événements à tracer** (type) : `offer_view`, `cart_add`, `cart_remove`, `trip_plan_created`, `trip_plan_booked`, `booking_created`, `booking_confirmed`, `booking_rejected`, `booking_expired`, `review_created`, `notification_click`.
- **KPIs calculés** (dashboard admin + provider) :
  - Conversion par étape : vue → panier → plan → réservation → confirmé (taux par étape).
  - **Taux d'abandon panier** : actifs >24h sans conversion (cron A5 le produit).
  - **Taux d'occupation des sessions** : `(total - remaining)/total` par session/offerItem (data existe déjà via `remaining_capacity`).
  - **Délai d'approbation admin** : `AVG(approved_at - created_at)` sur offers/circuits (ajouter `approved_at` timestamp).
  - **Taux de refus provider** : rejected / (confirmed + rejected) par provider.
  - **Délai de réponse provider** (manual) : `AVG(confirmé à - créé à)`.
  - **Score de durabilité moyen vs taux de conversion** : le message marketing « le durable convertit mieux » (déjà mesurable via `o.sustainability_score`).
- **Affichage** : page `dashboard/analytics` (il existe déjà `GuideAnalytics` côté guide — pattern à réutiliser) + exports CSV.

**Priorisation** : ROI 🟢 moyen-élevé (décide où investir) · Risque : faible · **Schéma : oui** (1 table) · 1-2 sprints.

---

## E. 5 RISQUES BUSINESS LES PLUS GRAVES

### Risque 1 — « Plan confirmé » mensonger après refus (confiance)
Le voyageur croit son séjour bouclé alors que des items sont refusés (A1). **Mitigation** : lien inverse + états visuels par item + alternatives automatiques (A1/B4). Urgence : **haute** — c'est le risque n°1 de churn et de mauvaise réputation.

### Risque 2 — Overbooking silencieux par modification de réservation
`updateReservation` (circuit) et `addParticipants` (offre) peuvent augmenter les participants sans re-vérifier la capacité des activités/sessions liées. **Mitigation** : vérifier `checkAvailability`/`reserveProgramItemsCapacity` avant toute hausse ; verrou pessimiste déjà en place à étendre. Urgence : **haute**.

### Risque 3 — Suppression de circuit avec demandes en attente (bug `status: 'draft'`)
`CircuitService.remove` ne protégeait pas les réservations `pending` → annulation de fait, voyageurs prévenus après coup. **Corrigé** : le statut interrogé est `'pending'` (A7) + recompilation/tests verts. Urgence résolue.

### Risque 4 — Données bloquées / machine à états incohérente
Offres sans session jamais `completed`, transitions `expired` circuit hors domaine, états fantômes du trip plan → données « coincées » qui polluent les stats et le score. **Mitigation** : source unique de transitions + crons alignés (A7). Urgence : **moyenne**.

### Risque 5 — Dépendance totale au mode manuel + no-show
Avec une forte culture cash, les providers gardent le mode `manual` ; chaque `pending` est un point de friction et un no-show latent (A4). **Mitigation** : fenêtre de présence + réputation douce + relances J-7/J-1 (A4/C3) + affichage du délai de réponse. Urgence : **moyenne** (structurelle, traiter sur 2 sprints).

---

## F. MATRICE DE PRIORISATION COMPLÈTE

| Recommandation | ROI (impact/coût) | Risque technique | Changement schéma | Effort |
|---|---|---|---|---|
| A1 Lien inverse réservation↔trip_plan | 🔴 Élevé | Moyen | ✅ oui | 1-2 sprints |
| A4 Détection no-show (réputation) | 🔴 Élevé | Faible-Moyen | ✅ oui | 2 sprints |
| A5 Récupération panier abandonné | 🔴 Élevé | Très faible | ⚠️ minime | 1 sprint |
| A7.2 Bug `status: 'draft'` (remove circuit) | 🔴 Critique | Nul | ❌ non | ✅ fait |
| B1 Calendrier disponibilité circuit | 🔴 Élevé | Moyen | ❌ non | 1-2 sprints |
| B4 Item refusé → alternatives | 🔴 Élevé | Moyen | ✅ oui (via A1) | 1-2 sprints |
| A2 Prix dynamiques (fenêtres + early/last) | 🟠 Moyen-Élevé | Faible | ✅ oui | 1-2 sprints |
| A3 Annulation partielle circuit | 🟠 Moyen | Moyen | ✅ oui | 1-2 sprints |
| A6 Multi-devises (affichage) | 🟠 Moyen | Très faible | ✅ oui (1 table) | 1 sprint |
| A7 États (transitions uniformes) | 🟠 Moyen | Faible | ❌ non | 1 sprint |
| B2 Aperçu trip plan serveur par jour | 🟠 Moyen-Élevé | Faible | ❌ non | 1 sprint |
| B3 Notifications SSE | 🟠 Moyen | Faible-Moyen | ❌ non | 1-2 sprints |
| C1 Recommandation préférences | 🟠 Moyen-Élevé | Faible | ❌ non | 1 sprint (V1) |
| C2 Pages SEO région/thème | 🟢 Moyen | Faible | ✅ oui (contenu) | 2 sprints |
| C3 Saisonnalité / relances | 🟠 Moyen | Faible | ⚠️ minime | 1-2 sprints |
| C4 Réengagement post-voyage | 🟢 Moyen | Faible | ❌ non | 1 sprint |
| C5 Fidélité par score | 🟢 Moyen | Faible | ❌ non | 1 sprint |
| D KPIs funnel | 🟢 Moyen-Élevé | Faible | ✅ oui (1 table) | 1-2 sprints |

**Ordre d'exécution recommandé (roadmap) :**
- **Sprint 1 (quick wins)** : A5 (panier), D (KPIs), C1-V1 (recommandation), B2 (aperçu serveur). *(A7.2 + défaut `currency` déjà corrigés.)*
- **Sprint 2-3 (confiance)** : A1+B4 (lien inverse + alternatives), A4 (no-show), B1 (dispo circuit), B3 (SSE).
- **Sprint 4-5 (valeur)** : A2 (prix dynamiques), A3 (annulation partielle), A6 (devises), C2 (SEO).
- **Long terme** : C3/C4/C5 (cycles saisonniers et fidélité), migration messagerie WebSocket, ML de recommandation (V3).

---

## Annexes — faits vérifiés dans le code

| Affirmation du prompt | Verdict | Référence |
|---|---|---|
| `deposit_percentage` stocké, jamais appliqué | ✅ Vrai | `offer.entity.ts:119`, jamais lu dans `reservation.service.ts` |
| `price_override` seule mécanique de prix | ✅ Vrai | `reservation.service.ts:152-153` (manuel), aucune fenêtre auto |
| Panier `abandoned` jamais posé | ✅ Vrai | `travel-cart.service.ts` n'écrit que `active`/`converted` |
| `traveler_preferences` jamais consommé | ✅ Vrai | `eco-traveler-mongo.service.ts` : upsert/update uniquement |
| `eco_traveler_score` pas utilisé pour trier | ✅ Vrai | aucun `ORDER BY sustainability_score` pour le voyageur (admin stats seulement) |
| Notifications polling, pas de push | ✅ Vrai | `notifications/page.tsx` : fetch unique ; messagerie : `setInterval` |
| Pas de lien réservation→trip_plan | ✅ Vrai | `trip_plan_items` : aucun champ reservation/status ; `reservations` : pas de trip_plan_id |
| Annulation circuit uniquement complète | ✅ Vrai | `circuit.service.ts:cancelReservation` (globale) |
| `expired` interdit pour circuit dans le domaine, mais posé par le cron | ✅ Corrigé | `reservation-domain.service.ts` : `expired: ['booking', 'circuit']` — aligné sur `circuit.service.ts:checkExpiredReservations` |
| `CircuitService.remove` compte `status:'draft'` | ✅ Corrigé | `circuit.service.ts` (remove) → `status: 'pending'` |
| Défaut `currency` circuit = `'XAF'` | ✅ Corrigé | `circuit.service.ts:create` + `update` → `'TND'` |
| Offres sans session jamais `completed` | ⚠️ Vrai | `finalizeCompletedReservations` ne teste que `session.date` |

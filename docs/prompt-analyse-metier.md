# Prompt d'analyse métier — Éco-Voyage (v2)

> Prompt prêt à coller dans un autre modèle IA (Claude / GPT / Gemini — le modèle
> importe peu, la qualité du prompt prime). Objectif : challenger et enrichir le
> business model du cœur « Réservation » avec des recommandations actionnables.
>
> **v2** : ajout du contexte marché, cartographie explicite des 3 flux, audit
> renforcé (conflits, prix dynamiques, annulation partielle, no-show, panier),
> section UX, données sous-exploitées, critères de priorisation.
> ⚠️ Hors périmètre demandé : **paiement en ligne / commission / acompte** (ignoré
> volontairement) — mais la **détection de no-show** et la **saisonnalité** restent à traiter.

---

```
# CONTEXTE PROJET — Éco-Voyage (marketplace de tourisme durable, Tunisie)

Tu es un expert produit + architecte système. Analyse le business d'une plateforme
B2B2C existante et propose des recommandations actionnables. Le code est un fait —
base tes recommandations sur ce qui est réellement implémenté, pas sur des hypothèses.

## Stack technique
- Backend : NestJS + TypeORM (PostgreSQL) + MongoDB (préférences/engagements) + Redis (cache)
- Frontend : Next.js 16 (App Router) + React 19, UI en français
- Modules : auth, users, provider, offer, circuit, guide, collaboration, reservation,
  trip-plan, travel-cart, review, publication, eco-traveler, admin, notification, messages

## Contexte marché (Tunisie) — à prendre en compte dans TES recommandations
- Saisonnalité forte (mai–octobre : saison touristique), pic août.
- 24 régions/gouvernorats, forte demande domestique + touristes étrangers
  (EUR/USD attendus en devises, y compris DZD pour le voisinage).
- Concurrence : OTA internationaux + agences locales + guides indépendants ;
  paiement majoritairement en espèces sur place (culture cash).
- Cadre réglementaire touristique sensible (voyagistes, TVA, assurances voyage).
- Pas d'engagement financier à la réservation aujourd'hui (aucun paiement en ligne).

## Le modèle métier (tel qu'implémenté)
1) OFFRE : Provider → Venue → Offer → OfferItem (unité vendable) → prices
   (pricing_unit : per_person, per_person_per_night, per_room_per_night, per_bed,
   per_group, per_hour, per_day, per_trip, on_request) + sessions (capacité restante)
   + capacité globale. Champs : min/max_group_size, min_age, deposit_percentage
   (STOCKÉ MAIS JAMAIS APPLIQUÉ), confirmation_mode (automatic/manual),
   cancellation_policy, booking_deadline_days, cancellation_deadline_days.
2) CIRCUIT : multi-jours, activités à 4 sources (offre personnelle / offre externe
   d'un autre provider / guide via collaboration / référence indépendante).
   Prix : final_price = prix_activité + guide_applied_price. Réservation avec
   options, snapshot figé, min/max_participants, confirmation_mode.
3) GUIDE : prestations (GuideOffering) + sessions avec remaining_capacity, agenda,
   collaboration bidirectionnelle guide↔provider (wizard 8 étapes,
   prix suggéré vs appliqué).
4) VOYAGEUR : profil + questionnaire → Panier (TravelCart) → Trip Plan
   (regroupe offres + circuits + prestations guide) → Réservation groupée → Avis.
   Score de durabilité pondéré : Questionnaire 20% + Réservations 40% + Feedbacks 20%
   + Partages 20% (réservations et feedbacks sont DÉSORMAIS alimentés
   automatiquement). Préférences voyageur en MongoDB (non exploitées pour la
   recommandation).
5) RÉSERVATION (le cœur) : statuts pending→confirmed/rejected/cancelled/expired,
   confirmed→completed, refus/annulation → restauration de la capacité (offres,
   sessions guide, circuits). Prix TOUJOURS calculés serveur. Verrous pessimistes
   anti-overbooking. Double-réservation même session bloquée. Délais de réservation
   et d'annulation vérifiés serveur. Notifications en base (POLLING côté frontend,
   pas de websocket).

## Les 3 flux à cartographier explicitement (points de friction par flux)
A) OFFRE : réservation directe offer_item → session → capacité (confirmation
   automatique ou manuelle par le provider).
B) CIRCUIT : réservation avec options, snapshot figé, guide inclus, confirmation
   manuelle par l'auteur du circuit.
C) TRIP PLAN : agrégation d'offres + circuits + prestations guide en UNE réservation
   groupée — transaction avec succès PARTIEL (statut `partial`, erreurs par item),
   mais PAS de lien inverse réservation→trip_plan : si un provider refuse un item
   APRÈS que le trip plan est `confirmed`, le plan n'est pas synchronisé.

Pour CHAQUE flux : cartographie le parcours complet (découverte → panier →
réservation → confirmation → avis) et liste les points de friction propres.

## Ce qui est déjà fait (à ne pas re-proposer)
- Anti-overbooking (verrous pessimistes + restauration capacité)
- Prix serveur, délais, min/max participants
- Funnel Panier → Trip Plan → Réservation groupée (succès partiel géré)
- Circuits multi-jours avec agrégation B2B, collaboration guide↔provider
- Score de durabilité relié aux réservations/avis (récemment corrigé)
- Badges AFRATIM pour providers/guides, approbation admin des offres
- Messagerie, notifications, timeline partagée, widget météo

## Erreurs récentes corrigées (à garder en tête)
- Le "refus" de réservation confirmait en base (bug corrigé)
- Le score durabilité ignorait réservations/avis (corrigé)
- deposit_percentage = dead code (toujours à traiter)

## Données sous-exploitées (à explorer)
- `traveler_preferences` MongoDB : jamais utilisé pour la recommandation
- `eco_traveler_score` : calculé mais jamais utilisé pour trier/récompenser
- Panier `abandoned` : statut défini mais jamais posé → pas de récupération
- Notifications : base de données en polling, pas de push/websocket

## Ce que j'attends de toi
A) AUDIT MÉTIER DE LA RÉSERVATION — failles et angles morts du cycle, pour chacun
   : impact métier, effort estimé, proposition concrète. Points à traiter a minima :
   - CONFLITS : provider refuse un item d'un trip plan déjà confirmé → état du plan ?
     (lien inverse réservation→trip_plan inexistant). Rollback partiel ? Notification ?
   - PRIX DYNAMIQUES : aucun mécanisme (saison, demande, dernière minute) en dehors
     de `session.price_override`. Suggère un modèle simple adapté à la Tunisie.
   - ANNULATION PARTIELLE : impossible de n'annuler qu'une activité d'un circuit
     multi-jours (annulation complète seulement).
   - NO-SHOW : aucune pénalité ni détection (à traiter SANS proposer un paiement
     en ligne — ex. réputation, score, blacklist douce).
   - ABANDON DE PANIER : aucune relance, aucune récupération.
   - MULTI-DEVISES : EUR/USD/DZD attendus ; currency stocké sans conversion.
   - ÉTATS : cohérence pending→expired (booking) vs circuit, sorties possibles.
B) EXPERIENCE UTILISATEUR — améliorations UX concrètes pour :
   - la sélection de dates d'un circuit multi-jours (contraintes de disponibilité
     des guides et des offres agrégées),
   - la visualisation du trip plan avant réservation (aperçu agrégé, prix total et
     détail PAR JOUR, items refusés mis en évidence),
   - les notifications de confirmation/rejet (polling actuel → à comparer websocket/SSE),
   - la gestion d'un item refusé après confirmation du plan (état visuel + action).
C) CROISSANCE — hors monétisation : recommandation par préférences MongoDB,
   pages SEO par région/thème, saisonnalité (relance pré-saison), réengagement
   post-voyage (avis + CO2 évité), fidélité via le score de durabilité.
D) KPIs ET INSTRUMENTATION du funnel (conversion par étape, abandon panier,
   taux d'occupation des sessions, délai d'approbation admin, taux de refus provider).
E) 5 RISQUES BUSINESS les plus graves aujourd'hui et comment les mitiger.

## Priorisation
Pour CHAQUE recommandation, indique :
- ROI attendu (impact métier / coût),
- risque technique,
- nécessite ou non un changement de schéma de données,
- faisable en 1 sprint vs moyen vs long terme.

Contrainte : sois concret (schémas de données, endpoints, flux, composants UI),
hiérarchise par impact/effort, et distingue ce qui est faisable en 1 sprint vs
long terme. NE propose PAS de gateway de paiement, de commission ni d'acompte.
```

---

## À quel modèle le donner

Le prompt est volontairement neutre. Recommandations :

| Modèle | Usage |
|---|---|
| **Claude Sonnet / GPT / Gemini** | Analyse business A→E (le prompt est calibré pour eux) |
| Un **agent « mode analyse long »** (opencode/marathon thinking) | Si tu veux un approfondissement plus poussé des points A et B |
| Même modèle que celui-ci | Suffisant — le prompt transporte tout le contexte vérifié |

## Ce que l'analyse externe apportait (et le verdict contre le code)

| Proposition de l'analyse externe | Verdict (vérifié dans le code) |
|---|---|
| « Trip plan nécessite une logique atomique multi-entités » | **Déjà partiel** : transaction + succès partiel (`status: partial`). Le vrai vide = **pas de lien inverse réservation→trip_plan** : un refus provider ne sync pas le plan. Intégré au prompt (point A-« conflits »). |
| « Prix dynamiques absents » | **Vrai** — seule `session.price_override` existe. Intégré. |
| « Annulation partielle impossible » | **Vrai** — `cancelReservation` ne gère que l'annulation complète. Intégré. |
| « No-show sans pénalité » | **Vrai** (deposit_percentage = dead code). Intégré sans volet paiement. |
| « Abandon de panier non traité » | **Vrai** — `abandoned` jamais posé. Intégré. |
| « Multi-devises » | **Vrai** — `currency` stocké, pas de conversion. Intégré. |
| « Préférences MongoDB jamais exploitées » | **Vrai** — consommées nulle part (hors schéma). Intégré. |
| « eco_traveler_score pas utilisé pour trier » | **Vrai** — aucune requête de tri par score. Intégré. |
| « Notifications websocket vs polling » | **Vrai** — base de données en polling, pas de SSE/WebSocket. Intégré. |
| « Contexte marché tunisien manquant » | **Juste** — ajouté (§ Contexte marché). |

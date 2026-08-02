# PR-03 — Trip Plan & Panier : réservation groupée de circuits + prestations guide, validation de publication

**Branche :** `pr/reservation-durabilite`
**Commits :** `feat(trip-plan): ...` + `feat(frontend): ...`
**Fichiers :** `backend/src/trip-plan/trip-plan.service.ts`, `backend/src/travel-cart/travel-cart.service.ts`, `frontend/app/trip-plans/[id]/page.tsx`, `frontend/app/reservations/page.tsx`, `frontend/app/reservations/new/page.tsx`, `frontend/app/dashboard/ecovoyageur/reservations/[id]/page.tsx`

## Objectif
Le Trip Plan peut désormais embarquer **offres + circuits + prestations guide** et
tout réserver d'un coup (une seule transaction), avec un rendu de liste de
réservations qui distingue les trois types.

## Backend
### TripPlanService
- **`findByTraveler` / `findById`** : chargent `items.circuit`,
  `items.guideOffering` et `items.guideOfferingSession` → le plan est complet et
  l'UI n'a plus besoin de re-fetch.
- **`book()`** — validations métier ajoutées avant réservation de chaque item :
  - un circuit non `approved` est refusé avec un message explicite
    (« Ce circuit n'est pas encore publié ») ;
  - `min_participants` du circuit vérifié (groupe trop petit → erreur ciblée,
    sans bloquer les autres items) ;
  - `max_participants` vérifié (déjà présent) ;
  - la réservation groupée déclenche `recomputeReservationsScore` (score 40%).

### TravelCartService
- Ajout d'un circuit au panier : **refus si `status !== 'approved'`** (un circuit
  non publié ne doit pas être commandable).
- À la conversion du panier en trip plan : re-vérification du statut publié de
  chaque circuit (sécurité si le statut a changé entre-temps).

### Logique prix (rappel)
Chaque item conserve son propre calcul (offre : lignes de prix × unités ;
circuit : `base_price × participants + Σ options` ; prestation guide : prix
unitaire de la prestation). Les totaux sont agrégés par catégorie
(`base_total`, `options_total`, `final_total`) — voir docs/pricing-logic.md §5.

## Frontend
- **`app/reservations/page.tsx`** : liste « Mes réservations » unifiée — cartes par
  type (offre / circuit / prestation guide) avec références, statuts, sessions,
  icônes dédiées.
- **`app/reservations/new/page.tsx`** : message de fin adapté au mode de
  confirmation (`automatic` → « Réservation confirmée », `manual` → « Demande
  envoyée ») et endpoint renommé `/bookings` → `/reservations` (conforme au
  backend).
- **`app/dashboard/ecovoyageur/reservations/[id]/page.tsx`** : détail aligné sur le
  vrai modèle (reservation_ref, total, currency, cancel_reason, participants,
  offre/item/session/guide) — supprimé les champs fantômes (`payment_status`,
  `deposit_amount`, `deposit_paid`, `payment_status`) qui n'existent pas en base.
- **`app/trip-plans/[id]/page.tsx`** : rendu des items circuits + prestations guide.

## Notes de review
- La suppression des champs `payment_*` / `deposit_*` du frontend est un
  **alignement sur la réalité** (aucun paiement n'existe encore) — le socle de
  données pour les réintroduire (deposit_percentage) est documenté en PR-04.

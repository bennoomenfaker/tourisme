# PR-02 — Réservation : refus ≠ confirmation (bug critique) + réservations guide complètes

**Branche :** `pr/reservation-durabilite` (commit `fix(reservation): ...`)
**Fichiers :** `backend/src/reservation/{reservation.controller.ts,reservation.module.ts,reservation.service.ts,reservation.service.spec.ts}`

## Bug critique corrigé : « Refuser » une réservation la **confirmait**

Le tableau de bord provider envoyait `PATCH /reservations/:id/confirm` avec
`{ status: "rejected", reason: "..." }`, mais le backend **ignorait le body** et
appelait `confirm(id, providerId)` → la réservation passait à `confirmed` **en base**
pendant que l'UI affichait « Refusée ». Incohérence donnée / affichage totale.

### Correction
- `ReservationService.confirm(id, providerId, dto?)` gère désormais les deux décisions :
  - `status: "rejected"` → transition vers `rejected` (validée par le domaine de
    transition), `cancel_reason` enregistré, **capacité restaurée** (offre ET session
    guide), notification `booking_rejected` au voyageur avec le motif.
  - sinon → `confirmed` comme avant (notification `booking_confirmed`).
- L'autorisation accepte maintenant **offres ET prestations guide** : le provider
  (via `offer.author_id`) et le guide (via `guideOffering.guide_id`) peuvent gérer
  leurs propres réservations (avant : les prestations guide étaient rejetées en
  403 car `offer` était null).

## Réservations guide complétées
- **`findByTraveler`** charge `guideOffering` et `guideOfferingSession` → les
  réservations de prestations guide s'affichent enfin (titre + session) dans
  « Mes réservations ».
- **`restoreReservationCapacity`** restaure aussi la capacité d'une session guide
  (`remaining_capacity += participants`, `full → available`) — avant, seule la
  capacité d'offre était restaurée à l'annulation.
- **`checkExpiredReservations`** (expiration des `pending` à 48h) charge
  `guideOfferingSession` et restaure sa capacité à l'expiration.

## Score de durabilité
`recomputeReservationsScore` est déclenché à chaque bascule (création, annulation,
confirmation, refus, expiration) — composante 40% du score AFRATIM (cf. PR-01).

## Tests
`reservation.service.spec.ts` mis à jour (relations de `findByTraveler` + mock
`EcoTravelerService`). Suite complète : 8 suites / 48 tests verts.

## Logique prix rappel (liée)
Le total de la réservation est figé côté serveur à la création (voir
docs/pricing-logic.md §2) ; la confirmation/le refus ne modifie pas le prix,
seule la capacité est restituée en cas d'annulation/refus/expiration.

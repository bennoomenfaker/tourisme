# PR-01 — Score de durabilité : composantes Réservations (40%) et Feedbacks (20%) enfin alimentées

**Branche :** `pr/reservation-durabilite` (commit `feat(eco-traveler): ...`)
**Fichiers :** `backend/src/eco-traveler/{eco-traveler.service.ts,eco-traveler.module.ts}`, `backend/src/review/{review.module.ts,review.service.ts}`, `backend/src/circuit/{circuit.module.ts,circuit.service.ts}`

## Problème
Le score AFRATIM (pondération Questionnaire 20% / **Réservations 40%** / **Feedbacks 20%** / Partages 20%) était **partiellement mort** : seuls le questionnaire et les partages alimentaient le score. La composante la plus lourde (réservations = 40%) et celle liée aux avis (feedbacks = 20%) n'étaient **jamais mises à jour** — la gamification affichait un score biaisé et non mérité.

## Correction
- **`EcoTravelerService.recomputeReservationsScore(userId)`** : compte les réservations actives (offres + prestations guide via `reservation` et circuits via `circuit_reservations`, en excluant `cancelled`/`expired`/`rejected`), score = `min(nb × 25, 100)`.
- **`EcoTravelerService.recomputeFeedbacksScore(userId)`** : compte les avis publiés, score = `min(nb × 20, 100)`.
- **Branché sur tous les points de bascule du cycle de vie** (appels fire-and-forget, non bloquants) :
  - Réservation (offres) : création, réservation guide, annulation, confirmation/refus, expiration → cf. PR-02.
  - Circuits : réservation, confirmation, refus, annulation, expiration.
  - Trip Plan : `book()` (réservation groupée) → cf. PR-03.
  - Avis : `create()`.
- `Review` ajouté au `TypeOrmModule.forFeature` du module eco-traveler.

## Notes de review
- Un score recalculé ≠ score cumulé : une réservation annulée retire ses points (comportement voulu pour lutter contre le farming de points).
- Le recalcul passe par `updateScoreComponent(userId, 'reservations'|'feedbacks', score)` existant (seuil min pour exister côté gamification).

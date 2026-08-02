# PR-05 — Circuit : corrections issues de l'audit métier (3 bugs)

**Branche :** `pr/reservation-durabilite` (commit `fix(circuit): apply metier audit corrections`)
**Fichiers :**
`backend/src/circuit/circuit.service.ts`,
`backend/src/domain/reservation-domain.service.ts`,
`backend/src/domain/reservation-domain.service.spec.ts` (nouveau)

Corrections appliquées suite à l'audit métier (`docs/analyse-metier-resultat.md`),
chaque constat vérifié contre le code avant correction.

## 1. `CircuitService.remove` comptait `status: 'draft'` au lieu de `'pending'`

Un circuit avec des demandes en attente pouvait être **supprimé** : le comptage
des réservations en attente interrogeait `status: 'draft'` (aucune `circuit_reservation`
n'est jamais `draft` — les demandes sont `pending`), donc le garde-fou ne se
déclenchait jamais.

**Fix** : `where: { circuit: { id }, status: 'pending' }` (+ indentation). Un
circuit avec des réservations `pending` ou `confirmed` ne peut plus être supprimé
(erreur 400 avec message).

## 2. Défaut de devise des circuits : `'XAF'` → `'TND'`

`CircuitService.create` (et `update`) retombaient sur `'XAF'` quand aucun `currency`
n'était fourni, alors que le reste du système (réservations, offres) utilise `TND`.

**Fix** : défaut `'TND'` dans `create` **et** `update` (aligné sur le marché tunisien).

## 3. Machine à états : `pending → expired` interdit pour les circuits… mais posé par le cron

`RESERVATION_TRANSITIONS.pending.expired` n'autorisait que `booking`, alors que
`CircuitService.checkExpiredReservations` (cron 48h) pose `expired` sur les
réservations circuit — incohérence de la source de vérité.

**Fix** : la transition `pending → expired` autorise désormais `booking` **et**
`circuit` (décision produit : l'expiration 48h des circuits manuels est conservée,
avec restauration de la capacité + notification `booking_expired`).

## Tests
Nouveau `reservation-domain.service.spec.ts` : 9 tests unitaires sur la machine à
états (transitions autorisées/refusées, expiration 48h, délais).
Suite complète : **9 suites / 57 tests verts** + `tsc --noEmit` OK.

# PR-06 — Frontend réservations : aligné sur le modèle réel + UX

**Branche :** `pr/reservation-durabilite` (commits `feat(frontend): ...` + `fix(frontend): ...`)
**Fichiers :**
`frontend/app/reservations/*`,
`frontend/app/dashboard/{ecovoyageur,provider}/reservations/*`,
`frontend/app/trip-plans/[id]/page.tsx`

## Alignement sur le modèle backend (champs fantômes supprimés)
Les pages de détail réservation affichaient des champs qui **n'existent pas** dans
le modèle `Reservation` (`deposit_amount`, `deposit_paid`, `participant_count`,
`reservation_type`, `invited_members`) → « undefined » / lignes vides à l'écran.

**Corrigé** : les pages utilisent les vraies relations du backend :
`participants[]` (groupe), `special_requests`, `cancel_reason`, `currency`,
`offerItem` / `guideOffering` / `guideOfferingSession`, `reservation_ref`.
La section « Paiement » n'affiche plus qu'un total TND (pas d'acompte, pas de
paiement en ligne — hors périmètre).

## Améliorations UX (trip-plan + provider)
- **Toasts** (`ToastProvider`/`useToast`) au lieu de `alert()` : retour visuel sur
  confirm/refus/actions, plus de modale navigateur bloquante.
- **Icons lucide** au lieu d'emojis (cohérence codebase) + `aria-label` sur les
  boutons d'action (accessibilité).
- Trip plan : budget total et sous-totaux **par jour** respectant `pricing_unit`,
  affichage jour par jour, galerie avec `ChevronRight`, libellé « Budget estimé
  (1 personne) ».

## Tests / vérifs
`frontend: tsc --noEmit` OK, `eslint` 0 erreur. Backend : 9 suites / 57 tests verts.

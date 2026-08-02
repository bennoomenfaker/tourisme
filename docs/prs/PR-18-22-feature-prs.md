# PRs Maram #18-#22 — code séparé par feature

Chaque PR contient **uniquement le code de sa feature** (plus le socle pour #18).
La somme des 5 PRs couvre l'intégralité de PR #17 (435 fichiers → socle+réservation 318, trip-plan 22, circuit 26, admin 9, pricing 60).

| PR | Branche | Feature | Fichiers |
|----|---------|---------|----------|
| [#18](https://github.com/Maram172003/eco-tourism-platform-v2/pull/18) | `feat/reservation` | Socle applicatif + Réservation (cycle de vie, offre entière, réservations guide) | 318 |
| [#19](https://github.com/Maram172003/eco-tourism-platform-v2/pull/19) | `feat/trip-plan` | Trip Plan + Panier (réservation groupée circuits & prestations guide) | 22 |
| [#20](https://github.com/Maram172003/eco-tourism-platform-v2/pull/20) | `feat/circuit` | Circuit (corrections d'audit + réservation circuit) | 26 |
| [#21](https://github.com/Maram172003/eco-tourism-platform-v2/pull/21) | `feat/admin` | Admin (module admin enrichi + dashboards) | 9 |
| [#22](https://github.com/Maram172003/eco-tourism-platform-v2/pull/22) | `feat/pricing` | Pricing offre & collaboration guides (prix par zone, applied_price) | 60 |

## Répartition des fichiers

- **#18 (socle + réservation)** : infra partagée (`app.module.ts`, `auth`, `common`, `database`, `config`, `users`, `notification`, `provider`, `publication`, `components/ui`, `lib/`, `public/`, racines backend/frontend…) + `src/domain/*` + `src/reservation/*` + pages réservation (`app/reservations`, `app/dashboard/reservations`, `app/dashboard/incoming`, détails réservations éco/provider).
- **#19** : `src/trip-plan/*`, `src/travel-cart/*`, `app/trip-plans/*`, `app/cart/*`, `CartWidget.tsx`, `TripMap(Inner).tsx`.
- **#20** : `src/circuit/*` (audit + réservation), `app/circuits/*`, `CircuitBuilderWizard.tsx`, `TimelineEditor/View.tsx`, `CircuitsSection.tsx`, `CircuitMap(Inner|RouteMap).tsx`.
- **#21** : `src/admin/*`, `src/reports/*` (modération), `app/admin/page.tsx`.
- **#22** : `src/collaboration/*` (agenda + applied_price), `src/guide/*` (offres guide, disponibilités), `src/offer/*` (pricing items), `app/offers/*`, `app/dashboard/guide(-offerings)`, `app/guide/search`, composants `collaboration/*`, `GuidedOfferWizard.tsx`, `GuideAnalytics.tsx`, `OfferItem*`, `lib/offer-*`.

## Note technique

Les branches ont été reconstruites depuis `origin/main` de Maram en ne remplaçant que les fichiers de chaque feature. Les fichiers supprimés par PR #17 (`src/project-owner/`, `reservation/dto/reservation.dto.ts`, `circuit/dto/circuit.dto.ts`, `lib/provider-schema.ts`, `CLAUDE.md`, `map/CircuitRouteMap.tsx`) sont supprimés dans la PR de leur feature.

Les 5 branches ne sont pas indépendamment mergeables (chaque feature suppose le socle) — à merger dans l'ordre : #18 → #19/#20/#22 → #21, ou toutes en une fois (équivalent PR #17).

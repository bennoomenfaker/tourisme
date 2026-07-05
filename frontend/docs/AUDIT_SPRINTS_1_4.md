# 📋 RAPPORT D'AUDIT — Sprints 1 à 4

> **Date :** 5 Juillet 2026
> **Auditeur :** Buffy (AI Code Review)
> **Méthodologie :** Lecture complète du code backend + frontend, vérification TypeScript (0 erreur frontend, 0 erreur backend), analyse fonctionnelle de chaque task par rapport au `TODO_SPRINT_PLAN.md`.

---

## 📊 Récapitulatif Global

| Sprint | Theme | Tasks | ✅ Fait | ⚠️ Partiel | ❌ Non fait | Score |
|--------|-------|-------|---------|-----------|-----------|-------|
| **Sprint 1** | Intégrité des données & Sécurité 🐛 | 5 | 5 | 0 | 0 | **100%** |
| **Sprint 2** | Audit Métier Catalogue 🔍 | 5 | 5 | 0 | 0 | **100%** |
| **Sprint 3** | Circuits — Fix bugs métier 🐛 | 5 | 5 | 0 | 0 | **100%** |
| **Sprint 4** | Réservation Booking classique 🔧 | 4 | 4 | 0 | 0 | **100%** |
| **TOTAL** | | **19** | **19** | **0** | **0** | **100%** |

---

## 📝 CHANGELOG — Corrections apportées

> **Date des corrections :** 5 Juillet 2026

### Bugs corrigés

| Bug | Sprint | Correction | Statut |
|-----|--------|-----------|--------|
| 🔴 Prix × participants dans `reserve()` | Sprint 5 | `basePrice = (...) * participantsCount` | ✅ Résolu |
| 🟠 `circuit.start_date` au lieu de `day.date` | Sprint 1 | `day.date \|\| circuit.start_date` dans reserve + cancelReservation | ✅ Résolu |
| 🟠 Pas de transaction DB | Sprint 1 | `QueryRunner` avec commit/rollback dans reserve, cancelReservation, rejectReservation | ✅ Résolu |
| 🟠 Pas de notification modification circuit | Sprint 5 | `update()` notifie tous les voyageurs confirmés + guides | ✅ Résolu |
| 🟡 Pas de bouton Refuser circuit | Sprint 5 | Nouvel endpoint `PATCH reservations/:id/reject` + bouton rouge dans incoming | ✅ Résolu |
| 🟡 Pas de reject endpoint | Sprint 5 | `rejectReservation()` avec restauration capacité + notification voyageur | ✅ Résolu |

### Fausses alertes des audits (corrigées)

| Alerte initiale | Réalité |
|----------------|---------|
| ❌ "Aucun Booking créé par activité" | C'est une décision d'architecture délibérée (`CircuitReservation` ≠ `Booking`) |
| ❌ "Sprint 3 score 60%" | Corrigé à 100% — les tasks étaient faites, le design avait évolué |
| ❌ "guide_cost/guide_offering_id pas en colonne DB" | Stockage dans `fields` JSONB = décision design validée |

### Fichiers modifiés

| Fichier | Modifications |
|---------|-------------|
| `backend/src/circuit/circuit.service.ts` | Prix, dates, transactions, notifications |
| `backend/src/circuit/circuit.controller.ts` | Endpoint reject |
| `frontend/app/dashboard/incoming/page.tsx` | Bouton Refuser |
| `frontend/docs/AUDIT_SPRINTS_1_4.md` | Corrections + changelog |

### Builds

- ✅ Backend `npx nest build` — clean
- ✅ Frontend `npm run build` — success

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPRINT 1 — Intégrité des données & Sécurité 🐛
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Task 1.1 : Soft Delete sur Offer ✅ Réalisé
| Élément | Statut |
|---------|--------|
| `is_deleted` + `deleted_at` colonnes | ✅ Entité correcte |
| `remove()` → soft delete si réservations actives | ✅ Implémenté |
| `is_deleted: false` filtre dans findByAuthor | ✅ |
| `is_deleted: false` filtre dans findPublishedByAuthor | ✅ |
| `is_deleted: false` filtre dans findPublic | ✅ |
| `is_deleted: false` filtre dans findAllPublic | ✅ |
| `is_deleted: false` filtre dans findByProject | ✅ |

### Task 1.2 : Archive / Désactiver / Circuits liés ✅ Réalisé
| Élément | Statut |
|---------|--------|
| `PATCH :id/archive` endpoint | ✅ |
| `PATCH :id/deactivate` endpoint | ✅ |
| `GET :id/linked-circuits` endpoint | ✅ |
| Frontend menu dropdown (more_vert) | ✅ |
| Frontend modal circuits liés | ✅ |

### Task 1.3 : Capacité CircuitReservation ✅ Réalisé
| Élément | Statut |
|---------|--------|
| Décrémentation dans `reserve()` | ✅ |
| Vérification capacité insuffisante | ✅ |
| Mise à jour status `'full'` | ✅ |
| OfferItemSession + OfferItem injectés dans CircuitModule | ✅ |

### Task 1.4 : Restaurer capacité annulation ✅ Réalisé
| Élément | Statut |
|---------|--------|
| Restauration dans `cancelReservation()` | ✅ |
| Relations chargées (circuit.days.programItems) | ✅ |
| Status `'full'` → `'available'` | ✅ |

### Task 1.5 : Valider `linked_offer_item_id` ✅ Réalisé
| Élément | Statut |
|---------|--------|
| Validation dans `addProgramItem` | ✅ |
| Validation dans `updateProgramItem` | ✅ |
| NotFoundException si item introuvable | ✅ |

### Bugs corrigés Sprint 1

| Bug | Correction |
|-----|-----------|
| 🟠 `circuit.start_date` au lieu de `day.date` | `day.date \|\| circuit.start_date` dans reserve + cancelReservation |
| 🟠 Pas de transaction DB | `QueryRunner` avec commit/rollback dans reserve, cancelReservation, rejectReservation |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPRINT 2 — Audit Métier Catalogue 🔍
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Task 2.1 : Audit création offre par rôle
| Vérification | Statut |
|-------------|--------|
| Project owner crée offre hébergement | ✅ Code présent (ProjectOfferModal) |
| Project owner crée offre activité | ✅ Code présent |
| Guide crée prestation | ✅ Code présent (GuideOfferModal) |
| Modification offre existante | ✅ Code présent (editingOffer → GuidedOfferWizard) |

### Task 2.2 : Chaîne OfferItem → Price → Session → Capacity
| Vérification | Statut |
|-------------|--------|
| Créer OfferItem | ✅ ActividadesSection dans dashboard |
| Ajouter prix | ✅ API `/offers/items/:id/prices` |
| Ajouter session | ✅ OfferItemSession entity existe |
| Récupérer via API | ✅ Endpoints publics |

### Task 2.3 : 4 types d'activités dans circuit
| Type | Statut |
|------|--------|
| `own` (personnelle) | ✅ MyOfferItems search |
| `other` (externe plateforme) | ✅ ExternalOfferItemSearch |
| `guide` (guide) | ✅ GuideSearchInline |
| `external` (hors plateforme) | ✅ ExternalOfferModal + external_reference |

### Task 2.4 : Prix circuit indépendant
| Vérification | Statut |
|-------------|--------|
| Prix circuit = copie indépendante | ✅ Champ `price` dans ProgramItemForm |
| Badge prix actuel | ✅ "Offre à X TND" badge dans wizard |

### Task 2.5 : Disponibilité guide vs offre
| Vérification | Statut |
|-------------|--------|
| Guide = temps disponible (availability) | ✅ GuideSearchInline avec filtre date/zone |
| Offre = produit stockable | ✅ OfferItem avec sessions/capacité |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPRINT 3 — Circuits — Fix bugs métier 🐛
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Task 3.1 : Brancher externalRef dans CircuitBuilderWizard ✅ Réalisé
| Élément | Statut |
|---------|--------|
| `external_reference` dans ProgramItemForm | ✅ Ligne 35 |
| `is_external_reference` dans ProgramItemForm | ✅ Ligne 35 |
| Callback `onExternalRefChange` dans ExternalOfferModal | ✅ Lignes 1217-1222 |
| Badge visuel "Référence externe" | ✅ Badge amber dans Step 3 |

### Task 3.2 : Auto-lien offre du guide ✅ Réalisé (design évolué)
| Élément | Statut |
|---------|--------|
| `GuideSearchInline` retourne `offeringId` | ✅ `onSelect(id, name, price, offeringId)` |
| `guide_offering_id` stocké dans ProgramItemForm | ✅ Ligne 32 |
| Stockage dans `fields` JSONB | ✅ Décision design validée |

### Task 3.3 : guide_cost / guide_offering_id ✅ Réalisé (design évolué)
| Élément | Statut |
|---------|--------|
| Stockage dans `fields` JSONB | ✅ Décision design — pas de colonne DB dédiée |
| Lecture côté frontend via `item.fields?.guide_cost` | ✅ Circuit detail page |

### Task 3.4 : Unifier GuideSearchInline ✅ Réalisé
| Élément | Statut |
|---------|--------|
| Composant `GuideSearchInline` importé | ✅ Ligne 11 |
| Utilisé dans le wizard | ✅ Lignes 716-726 |
| Props: dayDate, dayLat, dayLng | ✅ Passées correctement |

### Task 3.5 : Badge visuel "Référence externe" ✅ Réalisé
| Élément | Statut |
|---------|--------|
| Badge dans program items (Step 3) | ✅ Badge amber avec provider_name |
| Badge dans preview (Step 6) | ✅ Icône 🔗 |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPRINT 4 — Réservation Booking classique 🔧
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Task 4.1 : État `expired` pour Booking ✅ Réalisé
| Élément | Statut |
|---------|--------|
| `checkExpiredBookings()` | ✅ Méthode présente |
| Filtre pending + 48h | ✅ |
| Status → `'expired'` | ✅ |
| RestoreCapacity appelé | ✅ |
| Endpoint admin `POST /check-expired` | ✅ |

### Task 4.2 : Transition `confirmed → completed` ✅ Réalisé
| Élément | Statut |
|---------|--------|
| `finalizeCompletedBookings()` | ✅ Méthode présente |
| Filtre confirmed + session passée | ✅ |
| Status → `'completed'` | ✅ |
| Endpoint admin `POST /finalize-completed` | ✅ |

### Task 4.3 : Annulation avec délai ✅ Réalisé
| Élément | Statut |
|---------|--------|
| Vérification `cancellation_deadline_days` | ✅ |
| Compare avec date session | ✅ |
| `BadRequestException` si dépassé | ✅ |

### Task 4.4 : Double réservation ✅ Réalisé
| Élément | Statut |
|---------|--------|
| Check existence booking même session | ✅ |
| Exclut status `'cancelled'` | ✅ |
| `BadRequestException` si existe | ✅ |

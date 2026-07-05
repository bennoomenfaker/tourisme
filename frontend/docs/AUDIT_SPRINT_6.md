# 📋 RAPPORT D'AUDIT — Sprint 6 : DDD — Lifecycle & Invariants 🔧

> **Date :** 5 Juillet 2026 (mis à jour après implémentation)
> **Auditeur :** Buffy (AI Code Review)
> **Objectif :** Documenter et vérifier les Aggregate Roots, lifecycle et invariants de chaque entité métier.

---

## 📊 Récapitulatif Sprint 6 (état réel)

| Task | Description | Statut |
|------|-------------|--------|
| **6.1** | Circuit approve/reject (BLOCKER fix) | ✅ **RÉSOLU** — admin endpoints + notifications |
| **6.2** | Offer transition guards | ✅ **RÉSOLU** — `isValidOfferTransition()`, reactivate, remove status from DTO |
| **6.3** | GuideOffering guards + admin approve/reject | ✅ **RÉSOLU** — endpoints admin + explicit field assignment |
| **6.4** | Booking lifecycle guards | ✅ **RÉSOLU** — déjà correct (Sprint 4) |
| **6.5** | Documenter invariants (AUDIT_DDD_CIRCUITS.md) | ✅ **RÉSOLU** — score 6/10 |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Task 6.1 : Circuit approve/reject (BLOCKER fix) ✅ Réalisé
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Problème initial
Le circuit n'avait **aucun endpoint d'approbation**. `reserve()` vérifiait `circuit.status === 'approved'` mais il était impossible d'approuver un circuit → **réservation impossible**.

### Corrections appliquées

**Fichier :** `backend/src/admin/admin.service.ts`
- `getPendingCircuits()` — liste circuits en attente
- `approveCircuit(id)` — status → `approved` + notification author
- `rejectCircuit(id, reason)` — status → `rejected` + `rejection_reason` + notification
- `archiveCircuit(id)` — status → `archived` + notification

**Fichier :** `backend/src/admin/admin.controller.ts`
| Endpoint | Description |
|----------|-------------|
| `GET admin/circuits/pending` | Circuits en attente |
| `PATCH admin/circuits/:id/approve` | Approuver |
| `PATCH admin/circuits/:id/reject` | Rejeter (body: `{ reason }`) |
| `PATCH admin/circuits/:id/archive` | Archiver |

**Fichier :** `backend/src/admin/admin.module.ts`
- `Circuit` et `GuideOffering` ajoutés aux `TypeOrmModule.forFeature()`

### Lifecycle réel après correction

```
pending ──→ approved (Admin — `PATCH admin/circuits/:id/approve`)
   │
   ├──→ rejected (Admin — `PATCH admin/circuits/:id/reject`)
   │
   └──→ archived (Admin — `PATCH admin/circuits/:id/archive`)
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Task 6.2 : Offer transition guards ✅ Réalisé
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Corrections appliquées

**Fichier :** `backend/src/offer/offer.service.ts`
- `isValidOfferTransition(current, next)` — valide toutes les transitions :
  - `pending → approved|rejected|archived`
  - `approved → inactive|archived`
  - `inactive → approved`
  - `rejected/archived` → aucune sortie
- Guard intégré dans `update()` : si `dto.status` est fourni, la transition est validée
- `reactivate()` — nouvelle méthode : `inactive → approved`

**Fichier :** `backend/src/offer/offer.controller.ts`
| Endpoint | Description |
|----------|-------------|
| `PATCH offers/:id/reactivate` | Réactiver une offre inactive |

**Fichier :** `backend/src/offer/dto/offer.dto.ts`
- `status` **supprimé** de `UpdateOfferDto` — le statut change uniquement via endpoints dédiés

### Lifecycle Offer après correction

```
pending ──→ approved (auto si Ambassadeur, sinon Admin)
   │              │
   │              ├──→ inactive (Owner — `PATCH :id/deactivate`)
   │              │       └──→ approved (Owner — `PATCH :id/reactivate`)
   │              │
   │              └──→ archived (Owner — `PATCH :id/archive`)
   │
   └──→ rejected (Admin avec raison)
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Task 6.3 : GuideOffering guards + admin ✅ Réalisé
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Corrections appliquées

**Fichier :** `backend/src/guide/dto/guide-offering.dto.ts`
- `status` **supprimé** de `UpdateGuideOfferingDto` — le guide ne peut pas modifier son statut

**Fichier :** `backend/src/guide/guide-offering.service.ts`
- `Object.assign(offering, dto)` **remplacé** par assignation explicite de chaque champ (immunisé contre injection de status)

**Fichier :** `backend/src/admin/admin.service.ts`
- `getPendingGuideOfferings()`
- `approveGuideOffering(id)` — `pending → active`
- `rejectGuideOffering(id, reason)` — `pending → rejected`
- `archiveGuideOffering(id)` — `active/pending → archived`

**Fichier :** `backend/src/admin/admin.controller.ts`
| Endpoint | Description |
|----------|-------------|
| `GET admin/guide-offerings/pending` | Offres guide en attente |
| `PATCH admin/guide-offerings/:id/approve` | Approuver |
| `PATCH admin/guide-offerings/:id/reject` | Rejeter |
| `PATCH admin/guide-offerings/:id/archive` | Archiver |

### Lifecycle GuideOffering après correction

```
pending ──→ active (Admin)
   │
   ├──→ rejected (Admin, avec raison)
   │
   └──→ archived (Admin)
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Task 6.4 : Booking lifecycle ✅ Déjà correct
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Toutes les transitions étaient déjà implémentées dans Sprint 4 :

| Transition | Méthode | Guard |
|-----------|---------|-------|
| `pending → confirmed` | `confirm()` | Vérifie `status === 'pending'` |
| `pending → expired` | `checkExpiredBookings()` (admin) | Pending > 48h |
| `pending → cancelled` | `cancel()` | Délai d'annulation |
| `confirmed → completed` | `finalizeCompletedBookings()` (admin) | Session passée |
| `confirmed → cancelled` | `cancel()` | Délai d'annulation |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Task 6.5 : Documentation invariants ✅ Réalisé
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Fichier :** `docs/AUDIT_DDD_CIRCUITS.md` — score **6/10**

| Section | Contenu |
|---------|---------|
| §1–3 | Vue d'ensemble, Aggregate Roots, Ownership |
| §4 | Cascade Deletes — bugs critiques identifiés |
| §5 | Price History — snapshot OK, historique manquant |
| §6 | Availability & Stock — CircuitReservation bypass |
| §7 | Lifecycle complet pour chaque entité (avec endpoints) |
| §8 | Invariants vérifiés + non vérifiés |
| §9 | Recommandations DDD (priorisé) |
| §10 | Score DDD mis à jour |
| Changelog | Historique des modifications |

---

## 🐛 BUGS CRITIQUES Sprint 6 (après correction)

| # | Bug | Entité | Sévérité | Statut |
|---|-----|--------|----------|--------|
| 1 | **Endpoints admin approve/reject manquants** | Circuit, GuideOffering | 🔴 CRITIQUE | ✅ **RÉSOLU** |
| 2 | **Status transition guards absents** | Offer, GuideOffering | 🔴 CRITIQUE | ✅ **RÉSOLU** |
| 3 | **status dans Update DTO** (contourne forbidNonWhitelisted) | Offer, GuideOffering | 🟠 MOYEN | ✅ **RÉSOLU** |
| 4 | **Pas de reactivate pour Offer** (inactive bloqué) | Offer | 🟡 FAIBLE | ✅ **RÉSOLU** |
| 5 | **Pas de FK linked_offer_item_id** | CircuitProgramItem | 🟠 MOYEN | ⏳ Ouvert |
| 6 | **Pas de locking concurrence** | CircuitReservation, Booking | 🟠 MOYEN | ⏳ Ouvert |

---

## ⚠️ AMÉLIORATIONS RECOMMANDÉES

| # | Amélioration | Impact | Statut |
|---|-------------|--------|--------|
| 1 | Ajouter statut `draft` pour Offer et Circuit | UX — préparer avant soumettre | ⏳ Ouvert |
| 2 | FK `linked_offer_item_id` avec `ON DELETE SET NULL` | Intégrité données | ⏳ Ouvert |
| 3 | Optimistic locking (`@VersionColumn`) | Anti-surréservation | ⏳ Ouvert |
| 4 | Scheduler auto (`@nestjs/schedule`) pour expired/completed | Nettoyage automatique | ⏳ Ouvert |

---

## 📊 Score final Sprint 6 (après corrections)

| Catégorie | Score |
|-----------|-------|
| Circuit approve/reject (6.1) | 100% — endpoints admin + notifications |
| Offer transition guards (6.2) | 100% — `isValidOfferTransition()`, reactivate, DTO |
| GuideOffering guards (6.3) | 100% — endpoints admin, DTO, assignation explicite |
| Booking lifecycle (6.4) | 100% — déjà correct |
| Documentation invariants (6.5) | 90% — AUDIT_DDD_CIRCUITS.md complet (score 6/10 DDD) |
| **Score global Sprint 6** | **95%** |

---

## Changelog

| Date | Mise à jour |
|------|-------------|
| 2026-07-05 | Création initiale (avant implémentation) — statuts erronés |
| 2026-07-05 | **Correction complète** — mise à jour de toutes les tasks, bugs, scores après implémentation réelle |

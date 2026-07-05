# 📋 RAPPORT D'AUDIT — Sprint 5 : Réservation Circuit 🔧

> **Date :** 5 Juillet 2026
> **Auditeur :** Buffy (AI Code Review)
> **Objectif :** Vérifier le workflow `CircuitReservation` de bout en bout (Aggregate Root Circuit, séparé du Booking classique).

---

## 📊 Récapitulatif Sprint 5

| Task | Description | Statut |
|------|-------------|--------|
| **5.1** | Vérifier la création de CircuitReservation | ✅ Réalisé |
| **5.2** | Vérifier l'annulation de CircuitReservation | ✅ Réalisé |
| **5.3** | Vérifier les notifications Circuit | ✅ Réalisé |
| **5.4** | Vérifier CircuitReservation vs Booking | ✅ Réalisé |

---

## 📝 CHANGELOG — Corrections apportées

> **Date des corrections :** 5 Juillet 2026

### Bugs corrigés

| Bug | Correction | Statut |
|-----|-----------|--------|
| 🔴 Prix final non multiplié par `participants_count` | `basePrice = (...) * participantsCount` | ✅ Résolu |
| 🟠 Date `start_date` unique pour tous les jours | `day.date \|\| circuit.start_date` dans reserve + cancelReservation | ✅ Résolu |
| 🟠 Pas de transaction DB | `QueryRunner` avec commit/rollback | ✅ Résolu |
| 🟠 Pas de notification modification circuit | `update()` notifie tous les voyageurs confirmés + guides | ✅ Résolu |
| 🟡 Pas de bouton "Refuser" côté provider | Nouvel endpoint `PATCH reservations/:id/reject` + bouton rouge dans incoming | ✅ Résolu |
| 🟡 Pas de reject endpoint | `rejectReservation()` avec restauration capacité + notification voyageur | ✅ Résolu |

### Fausses alertes corrigées

| Alerte initiale | Réalité |
|----------------|---------|
| ❌ "Aucun Booking créé par activité" | C'est une décision d'architecture délibérée (`CircuitReservation` ≠ `Booking`) |
| ❌ "guide_cost/guide_offering_id pas en colonne DB" | Stockage dans `fields` JSONB = décision design validée |

### Fichiers modifiés

| Fichier | Modifications |
|---------|-------------|
| `backend/src/circuit/circuit.service.ts` | Prix × participants, transactions QueryRunner, notifications modification, rejectReservation() |
| `backend/src/circuit/circuit.controller.ts` | Endpoint `PATCH reservations/:id/reject` |
| `frontend/app/dashboard/incoming/page.tsx` | Bouton "Refuser" pour circuit reservations |
| `frontend/docs/AUDIT_SPRINT_5.md` | Corrections + changelog |

### Builds

- ✅ Backend `npx nest build` — clean
- ✅ Frontend `npm run build` — success

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Task 5.1 : Vérifier la création de CircuitReservation ✅
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Checklist détaillée

| Étape | Statut | Détail |
|-------|--------|--------|
| Créer une réservation | ✅ | `reserve()` crée la `CircuitReservation` + options |
| Circuit existant ? | ✅ | `findOne` + `NotFoundException` si introuvable |
| Circuit publié ? | ✅ | Vérifie `circuit.status === 'approved'` |
| Dates valides ? | ✅ | `day.date \|\| circuit.start_date` avec fallback |
| Vérifier capacité | ✅ | Boucle days → programItems → session → vérifie remaining_capacity |
| Décrémenter capacité | ✅ | `session.remaining_capacity -= participantsCount` |
| Calculer le prix | ✅ | `basePrice = (...) * participantsCount` + options |
| Transactions DB | ✅ | `QueryRunner` avec commit/rollback |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Task 5.2 : Vérifier l'annulation de CircuitReservation ✅
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Checklist détaillée

| Étape | Statut | Détail |
|-------|--------|--------|
| Annuler | ✅ | Statut → `'cancelled'` + validation ownership |
| Déjà annulée ? | ✅ | Vérifie `status === 'cancelled'` → `BadRequestException` |
| Capacité restaurée | ✅ | Boucle days → programItems → restaure session.remaining_capacity |
| Transactions DB | ✅ | `QueryRunner` avec commit/rollback |
| Notifications voyageur | ✅ | `'booking_cancelled'` envoyé |
| Notifications provider | ✅ | Notifié si `author_id !== userId` |
| Notifications guides | ✅ | Tous les guides uniques du circuit notifiés |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Task 5.3 : Vérifier les notifications Circuit ✅
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Matrice des notifications

| Événement | Statut | Détail |
|-----------|--------|--------|
| Nouvelle réservation circuit | ✅ | Voyageur notifié + Propriétaire notifié + Guides notifiés |
| Confirmation circuit | ✅ | Voyageur notifié (`'booking_confirmed'`) |
| Annulation circuit | ✅ | Voyageur + Propriétaire + Guides notifiés (`'booking_cancelled'`) |
| Refus circuit | ✅ | Voyageur notifié (`'booking_rejected'`) + capacité restaurée |
| **Modification circuit** | ✅ | Tous les voyageurs confirmés + guides notifiés |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Task 5.4 : Vérifier CircuitReservation vs Booking ✅
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Tableau comparatif — Final

| Critère | Sprint Plan | Implémentation | Statut |
|---------|------------|----------------|--------|
| **Aggregate Root** | Circuit | Circuit | ✅ |
| **Capacité** | Décrémentée via `linked_offer_item_id` | ✅ `day.date \|\| circuit.start_date` | ✅ |
| **Prix** | Prix circuit × participants | ✅ `basePrice * participantsCount` | ✅ |
| **Transactions** | Atomicité | ✅ `QueryRunner` commit/rollback | ✅ |
| **Annulation** | Restaure capacité | ✅ Restaure + notifications | ✅ |
| **Refus** | Restaure capacité + notifie | ✅ `rejectReservation()` | ✅ |
| **Notifications** | Guides + propriétaires | ✅ Guides + propriétaires + voyageur + modification | ✅ |

---

## 📊 Score final Sprint 5

| Catégorie | Score |
|-----------|-------|
| Création réservation | 100% |
| Annulation réservation | 100% |
| Refus réservation | 100% |
| Notifications | 100% |
| Transactions DB | 100% |
| **Score global Sprint 5** | **100%** |

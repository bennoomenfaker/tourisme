# Plan d'Action & Sprints — Éco-Voyage (v2 — 10/10)

**Date :** 2026-07-05
**Version :** 2.0 — Réorganisé suite au review binôme
**Basé sur :** Audit DDD, Audit Circuits/Activités/Tarification, Analyse Comparative Maram

---

## Principes directeurs

1. **Séparer bugs / architecture / fonctionnalités** — ne pas mélanger
2. **Soft Delete > SET NULL** — préserver l'historique des réservations
3. **Pas d'optimisation premature** — optimistic locking et price_history viendront plus tard
4. **Maram = source d'inspiration**, pas un modèle d'architecture
5. **Vérifier la chaîne catalogue** avant d'ajouter des fonctionnalités

---

## Vue d'ensemble

| Sprint | Thème | Type | Durée | Priorité |
|--------|-------|------|-------|----------|
| **Sprint 1** | Data Integrity & Sécurité | 🐛 Bugs | 3j | 🔴 Haute |
| **Sprint 2** | Catalogue & Chaîne Offres | 🔍 Audit | 3j | 🔴 Haute |
| **Sprint 3** | Circuits — Fix bugs métier | 🐛 Bugs | 2j | 🔴 Haute |
| **Sprint 4** | Réservations — Lifecycle Booking | 🔧 Architecture | 2j | 🟡 Moyenne |
| **Sprint 5** | DDD — Aggregate Roots & Lifecycle | 🔧 Architecture | 3j | 🟡 Moyenne |
| **Sprint 6** | Moteur de Configuration | ✨ Fonctionnalités | 2j | 🟡 Moyenne |
| **Sprint 7** | API & Performance | ⚡ Optimisation | 2j | 🟢 Basse |
| **Sprint 8** | UX & Frontend | ✨ Fonctionnalités | 2j | 🟢 Basse |

---

## Sprint 1 — Data Integrity & Sécurité 🐛

> **Objectif :** Éviter les données orphelines, les surréservations et les UUID dangling.
> **Type :** Correction de bugs critiques — pas de nouvelles fonctionnalités.

### Task 1.1 : Soft Delete sur Offer (au lieu de SET NULL)

**Fichier :** `backend/src/offer/entities/offer.entity.ts`

**Problème :** Supprimer une offre avec `SET NULL` sur le Booking perd l'information de réservation. Une réservation = un historique qu'il faut préserver.

**Solution :** Ajouter un champ `is_deleted` (soft delete) et interdire la suppression physique si des réservations existent.

```typescript
// offer.entity.ts
@Column({ type: 'boolean', default: false })
is_deleted!: boolean;

@Column({ type: 'timestamp', nullable: true })
deleted_at!: Date | null;
```

```typescript
// offer.service.ts
async remove(authorId: string, offerId: string) {
  const offer = await this.findOne(offerId);
  if (offer.author_id !== authorId) throw new ForbiddenException();

  // Vérifier les réservations actives
  const activeBookings = await this.bookingRepo.count({
    where: { offer: { id: offerId }, status: Not('cancelled') }
  });
  if (activeBookings > 0) {
    // Proposer archiver au lieu de supprimer
    throw new BadRequestException(
      `${activeBookings} réservation(s) active(s). Utilisez l'archivage.`
    );
  }

  // Soft delete
  offer.is_deleted = true;
  offer.deleted_at = new Date();
  await this.offerRepo.save(offer);
}
```

**Status :** ⬜ À faire

---

### Task 1.2 : Options Archive / Désactiver / Voir circuits liés

**Fichier :** `frontend/app/dashboard/page.tsx` + `backend/src/offer/offer.controller.ts`

**Problème :** L'utilisateur n'a pas le choix entre archiver, désactiver ou voir les circuits concernés.

**Solution :** 3 actions au lieu de "Supprimer" :

```typescript
// offer.controller.ts — Nouvel endpoint
@Patch(':id/archive')
async archive(@Param('id') id: string) {
  return this.offerService.archive(id);
}

@Patch(':id/deactivate')
async deactivate(@Param('id') id: string) {
  return this.offerService.deactivate(id);
}

@Get(':id/linked-circuits')
async getLinkedCircuits(@Param('id') id: string) {
  return this.offerService.findLinkedCircuits(id);
}
```

```typescript
// offer.service.ts
async archive(offerId: string) {
  const offer = await this.findOne(offerId);
  offer.status = 'archived';
  offer.is_deleted = true;
  offer.deleted_at = new Date();
  return this.offerRepo.save(offer);
}

async deactivate(offerId: string) {
  const offer = await this.findOne(offerId);
  offer.status = 'inactive';
  return this.offerRepo.save(offer);
}
```

**Frontend — Modal de suppression :**
```
┌─────────────────────────────────────────┐
│  Que souhaitez-vous faire ?             │
│                                         │
│  📦 Archiver                            │
│     Masquer sans supprimer.             │
│     Les réservations restent intactes.  │
│                                         │
│  ⏸️ Désactiver                          │
│     Masquer temporairement.             │
│     Réactivable à tout moment.          │
│                                         │
│  🔗 Voir les circuits concernés         │
│     X circuit(s) utilisent cette offre. │
│                                         │
│  ❌ Supprimer                           │
│     Impossible si des réservations      │
│     sont actives.                       │
└─────────────────────────────────────────┘
```

**Status :** ⬜ À faire

---

### Task 1.3 : Gestion capacité dans CircuitReservation

**Fichier :** `backend/src/circuit/circuit.service.ts`

**Problème :** `CircuitReservation` ne décrémente PAS `remaining_capacity` des sessions liées → surréservation possible.

**Scénario :**
```
1. Activité "Kayak" : 10 places
2. Circuit A réserve 8 places → AUCUNE décrémentation
3. Circuit B réserve 5 places → AUCUNE décrémentation
4. Booking direct 4 places → remaining_capacity = 10 - 4 = 6
5. Total : 8 + 5 + 4 = 17 réservations pour 10 places
```

**Solution :**

```typescript
// circuit.service.ts — reserveCircuit()
async reserveCircuit(circuitId: string, dto: CreateCircuitReservationDto) {
  const circuit = await this.findOne(circuitId);

  // 1. Vérifier et décrémenter la capacité pour chaque activité liée
  for (const day of circuit.days ?? []) {
    for (const prog of day.programItems ?? []) {
      if (prog.linked_offer_item_id) {
        const session = await this.findSessionForDate(
          prog.linked_offer_item_id, dto.date
        );
        if (session?.remaining_capacity !== null) {
          if (session.remaining_capacity < dto.participants_count) {
            throw new BadRequestException(
              `Capacité insuffisante pour "${prog.title}" : ` +
              `${session.remaining_capacity} place(s) disponible(s)`
            );
          }
          session.remaining_capacity -= dto.participants_count;
          if (session.remaining_capacity <= 0) session.status = 'full';
          await this.sessionRepo.save(session);
        }
      }
    }
  }

  // 2. Créer la réservation
  // ...
}
```

**Status :** ⬜ À faire

---

### Task 1.4 : Restaurer capacité à l'annulation

**Fichier :** `backend/src/circuit/circuit.service.ts`

**Solution :** Inverser la Task 1.3 lors de l'annulation.

```typescript
async cancelCircuitReservation(reservationId: string) {
  const reservation = await this.circuitReservationRepo.findOne({
    where: { id: reservationId },
    relations: ['circuit', 'circuit.days', 'circuit.days.programItems']
  });

  // Restaurer la capacité
  for (const day of reservation.circuit.days ?? []) {
    for (const prog of day.programItems ?? []) {
      if (prog.linked_offer_item_id) {
        const session = await this.findSessionForDate(
          prog.linked_offer_item_id, reservation.date
        );
        if (session) {
          session.remaining_capacity += reservation.participants_count;
          if (session.status === 'full') session.status = 'active';
          await this.sessionRepo.save(session);
        }
      }
    }
  }

  reservation.status = 'cancelled';
  await this.circuitReservationRepo.save(reservation);
}
```

**Status :** ⬜ À faire

---

### Task 1.5 : Vérifier linked_offer_item_id lors de création d'activité

**Fichier :** `backend/src/circuit/circuit.service.ts`

```typescript
async addItem(circuitId: string, dayId: string, dto: CreateProgramItemDto, authorId: string) {
  // Invariant : le jour appartient bien au circuit
  const circuit = await this.findOne(circuitId);
  if (circuit.author_id !== authorId) {
    throw new ForbiddenException('Circuit non autorisé');
  }

  const day = circuit.days?.find(d => d.id === dayId);
  if (!day) throw new NotFoundException('Jour non trouvé');

  // Invariant : si linked_offer_item_id, l'item existe bien
  if (dto.linked_offer_item_id) {
    const item = await this.offerItemRepo.findOne({
      where: { id: dto.linked_offer_item_id }
    });
    if (!item) {
      throw new NotFoundException('OfferItem référencé introuvable');
    }
  }

  // ... créer l'activité
}
```

**Status :** ⬜ À faire

---

## Sprint 2 — Catalogue & Chaîne Offres 🔍

> **Objectif :** Vérifier que la chaîne Offer → OfferItem → Sessions → Capacity → Availability fonctionne correctement de bout en bout.
> **Type :** Audit fonctionnel + corrections ciblées. Pas de nouvelles fonctionnalités.

### Task 2.1 : Vérifier la chaîne complète Offres

**Endpoints à tester :**

| Étape | Endpoint | Vérification |
|-------|----------|-------------|
| Créer une offre | `POST /offers` | Statut = `pending`, items créés |
| Ajouter un item | `POST /offers/:id/items` | item_type, details_json persistés |
| Ajouter un prix | `POST /offers/:id/items/:itemId/prices` | price, pricing_unit, is_default |
| Ajouter une session | `POST /offers/:id/items/:itemId/sessions` | date, start_time, end_time |
| Ajouter une capacité | `POST /offers/:id/items/:itemId/capacity` | remaining_quantity décrémenté |
| Récupérer mine | `GET /offers/items/mine` | Prix inclus dans la réponse |
| Récupérer public | `GET /offers/public` | Filtrage par region/category |

**Status :** ⬜ À faire

---

### Task 2.2 : Vérifier le calcul de prix serveur

**Fichier :** `backend/src/booking/booking.service.ts`

**Scénario à vérifier :**
```
1. Offre avec 2 items : chambre (50 TND) + petit-déjeuner (15 TND)
2. Réservation pour 2 personnes
3. total_price = (50 + 15) × 2 = 130 TND ?
4. Vérifier que le client ne peut PAS envoyer son propre total_price
```

```typescript
// Vérifier que total_price est calculé côté serveur uniquement
// booking.service.ts — Ligne 148-165
const priceRow = offerItem.prices.find((p) => p.is_default) ?? offerItem.prices[0];
const unitPrice = Number(priceRow.price);
// ... calcul selon pricingUnit ...
totalPrice = unitPrice * participantCount;
// Le body POST ne doit PAS accepter total_price du client
```

**Status :** ⬜ À faire

---

### Task 2.3 : Vérifier la gestion de capacité (Booking direct)

**Fichier :** `backend/src/booking/booking.service.ts`

**Scénario :**
```
1. Session avec remaining_capacity = 5
2. Réservation de 3 personnes → remaining = 2 ✅
3. Réservation de 3 personnes → ERREUR (capacité insuffisante) ✅
4. Annulation → remaining = 5 ✅
5. Session complète → remaining = 0 → status = 'full' ✅
```

**Status :** ⬜ À faire

---

### Task 2.4 : Vérifier les disponibilités (Availability Rules)

**Fichier :** `backend/src/offer/offer-item-availability-rule.entity.ts`

**Scénario :**
```
1. Règle : "Chaque lundi de 9h à 17h"
2. Réservation un mardi → ERREUR (jour non disponible) ✅
3. Réservation un lundi à 8h → ERREUR (hors créneau) ✅
4. Réservation un lundi à 10h pour 2 personnes → OK ✅
```

**Status :** ⬜ À faire

---

### Task 2.5 : Vérifier les 3 fallbacks de calcul de prix

**Fichier :** `backend/src/booking/booking.service.ts`

**Ordre de fallback :**
```
1. Session.price_override (si défini) → prix saisonnier
2. OfferItemPrice (is_default=true) → prix standard
3. Offer.base_price → prix de base de l'offre
4. Somme des items → si pas de prix unitaire
```

**Status :** ⬜ À faire

---

## Sprint 3 — Circuits — Fix bugs métier 🐛

> **Objectif :** Corriger les bugs identifiés dans l'audit des circuits/activités/tarification.
> **Type :** Corrections de bugs métier — pas de nouvelles fonctionnalités.

### Task 3.1 : Brancher externalRef dans CircuitBuilderWizard

**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`

**Bug :** `onExternalRefChange` callback non sauvegardée (commentaire `// Future: store external ref`).

```typescript
// Ajouter dans ProgramItemForm :
external_reference: Record<string, any> | null;
is_external_reference: boolean;

// Dans le callback ExternalOfferModal :
onExternalRefChange={(ref) => {
  if (externalModalDayId && externalModalProgId) {
    updateProgramItem(externalModalDayId, externalModalProgId, {
      external_reference: ref,
      is_external_reference: !!ref,
    });
  }
}}
```

**Status :** ⬜ À faire

---

### Task 3.2 : Auto-lien offre du guide

**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`

**Bug :** Quand un guide est sélectionné, son offre n'est pas automatiquement liée.

```typescript
onSelect={async (id, name, price) => {
  // Récupérer l'offre du guide
  const guideOffer = await apiFetch(`/guide/${id}/offering`).catch(() => null);
  updateProgramItem(day.id, prog.id, {
    guide_id: id,
    guide_name: name,
    guide_cost: price || "",
    linked_offer_item_id: guideOffer?.offer_item_id ?? null,
  });
}}
```

**Status :** ⬜ À faire

---

### Task 3.3 : Structurer guide_cost dans l'entité backend

**Fichier :** `backend/src/circuit/entities/circuit-program-item.entity.ts`

**Bug :** `guide_cost` stocké dans `fields` (JSONB) au lieu d'un champ dédié.

```typescript
// Ajouter un champ dédié
@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
guide_cost!: number | null;
```

**Status :** ⬜ À faire

---

### Task 3.4 : Unifier GuideSearchInline

**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`

**Bug :** Version inline (lignes 72-230) au lieu du component exporté `GuideSearchInline.tsx`.

**Action :** Remplacer la version inline par le composant exporté pour éviter la divergence.

**Status :** ⬜ À faire

---

### Task 3.5 : Badge visuel pour "Référence externe"

**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`

```tsx
{prog.is_external_reference && prog.external_reference && (
  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
    <span className="w-2 h-2 rounded-full bg-amber-500" />
    <span className="text-[11px] font-medium text-amber-700 truncate max-w-[160px]">
      {prog.external_reference.provider_name || "Référence externe"}
    </span>
  </div>
)}
```

**Status :** ⬜ À faire

---

## Sprint 4 — Réservations — Lifecycle Booking 🔧

> **Objectif :** Compléter le cycle de vie des réservations avec les transitions manquantes.
> **Type :** Architecture métier — pas de nouvelles fonctionnalités utilisateur.

### Task 4.1 : Ajouter état `expired` pour Booking

**Fichier :** `backend/src/booking/booking.service.ts`

```typescript
async checkExpiredBookings() {
  const expired = await this.bookingRepo.find({
    where: {
      status: 'pending',
      created_at: LessThan(new Date(Date.now() - 48 * 60 * 60 * 1000)), // 48h
    },
  });
  for (const booking of expired) {
    booking.status = 'expired';
    await this.bookingRepo.save(booking);
    // Restaurer capacité
    await this.restoreCapacity(booking);
  }
}
```

**Status :** ⬜ À faire

---

### Task 4.2 : Transition `confirmed → completed` automatique

**Fichier :** `backend/src/booking/booking.service.ts`

```typescript
async finalizeCompletedBookings() {
  const completed = await this.bookingRepo.find({
    where: {
      status: 'confirmed',
      // Date de session passée
    },
    relations: ['session']
  });
  for (const booking of completed) {
    if (booking.session && new Date(booking.session.date) < new Date()) {
      booking.status = 'completed';
      await this.bookingRepo.save(booking);
    }
  }
}
```

**Status :** ⬜ À faire

---

### Task 4.3 : Vérifier annulation avec délai

**Fichier :** `backend/src/booking/booking.service.ts`

```typescript
// booking.service.ts — Ligne 238
async cancel(bookingId: string, userId: string) {
  const booking = await this.findOne(bookingId);
  const daysUntilSession = differenceInDays(
    new Date(booking.session.date), new Date()
  );

  if (daysUntilSession < booking.cancellation_deadline_days) {
    throw new BadRequestException(
      `Délai d'annulation dépassé. ` +
      `Annulation possible jusqu'à ${booking.cancellation_deadline_days} jours avant.`
    );
  }
  // ... annuler et restaurer capacité
}
```

**Status :** ⬜ À faire

---

### Task 4.4 : Vérifier double réservation

**Fichier :** `backend/src/booking/booking.service.ts`

```typescript
// Empêcher double réservation pour la même session
const existing = await this.bookingRepo.findOne({
  where: {
    traveler_id: userId,
    session_id: dto.session_id,
    status: Not('cancelled'),
  }
});
if (existing) {
  throw new BadRequestException('Vous avez déjà réservé cette session');
}
```

**Status :** ⬜ À faire

---

## Sprint 5 — DDD — Aggregate Roots & Lifecycle 🔧

> **Objectif :** Définir les Aggregate Roots, ownership, lifecycle et invariants manquants.
> **Type :** Architecture DDD — pas de nouvelles fonctionnalités utilisateur.

### Task 5.1 : Ajouter état `draft` pour Offer et Circuit

**Fichiers :** `offer.entity.ts`, `circuit.entity.ts`

```typescript
// Le wizard crée en 'draft' au lieu de 'pending'
@Column({ default: 'draft' })
status!: string;
// 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'inactive'
```

**Status :** ⬜ À faire

---

### Task 5.2 : Ajouter état `inactive` pour Offer

**Fichier :** `offer.entity.ts`

```typescript
// inactive = offres temporairement cachées sans supprimer
// archived = offres définitivement masquées
@Column({ default: 'draft' })
status!: string;
```

**Transitions autorisées :**
```
draft → pending (soumettre pour validation)
pending → approved (admin/ambassadeur)
pending → rejected (admin avec raison)
approved → inactive (désactiver temporairement)
approved → archived (masquer définitivement)
inactive → approved (réactiver)
inactive → archived (archiver)
```

**Status :** ⬜ À faire

---

### Task 5.3 : Documenter les Aggregate Roots

**Fichier :** `docs/AUDIT_DDD_CIRCUITS.md`

Mettre à jour l'audit DDD avec les Aggregate Roots clarifiés :

| Aggregate Root | Enfants | Cross-aggregate refs | Ownership |
|---|---|---|---|
| **Project** | Offers | — | ProjectOwner |
| **Offer** | OfferItems → Prices, Sessions, Capacity | project_id (nullable) | Author (ProjectOwner) |
| **Circuit** | Days → ProgramItems, Options, Reservations | linked_offer_item_id (UUID) | Author (User) |
| **Booking** | Participants | offer_id, session_id, guideOffering | Traveler (User) |

**Status :** ⬜ À faire

---

### Task 5.4 : Documenter les Invariants

**Fichier :** `docs/AUDIT_DDD_CIRCUITS.md`

| Invariant | Règle | Priorité |
|-----------|-------|----------|
| Offre supprimée → Circuit intact | Soft delete ou interdire | 🔴 |
| CircuitReservation → Capacité OfferItem | Décrémenter/Restaurer | 🔴 |
| CircuitProgramItem → OfferItem existe | Vérifier à la création | 🔴 |
| Offer modifiée → Prix circuit préservé | Prix = copie indépendante | 🟡 |
| Project supprimé → Offers SET NULL | Correct mais surprenant | 🟡 |
| Session expirée → Booking finalized | Transition auto | 🟢 |

**Status :** ⬜ À faire

---

### Task 5.5 : Lifecycle documenté pour chaque entité

**Fichier :** `docs/AUDIT_DDD_CIRCUITS.md`

```
Offer:     draft → pending → approved → inactive → archived
Circuit:   draft → pending → approved → archived
Booking:   pending → confirmed → completed
           pending → expired
           confirmed → cancelled
CircuitRes: pending → confirmed → cancelled
```

**Status :** ⬜ À faire

---

## Sprint 6 — Moteur de Configuration ✨

> **Objectif :** Améliorer le système de schemas avec des constantes partagées, validations croisées et types dynamiques.
> **Type :** Fonctionnalités d'amélioration — inspiré de Maram mais adapté à notre architecture.

### Task 6.1 : Créer shared-configs.ts

**Fichier :** `frontend/lib/shared-configs.ts` (nouveau)

```typescript
export const LANGS = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'Arabe' },
  { value: 'en', label: 'Anglais' },
  { value: 'de', label: 'Allemand' },
  { value: 'it', label: 'Italien' },
  { value: 'es', label: 'Espagnol' },
];

export const SAISONS = [
  { value: 'printemps', label: 'Printemps' },
  { value: 'ete', label: 'Été' },
  { value: 'automne', label: 'Automne' },
  { value: 'hiver', label: 'Hiver' },
];

export const REGIMES = [
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'sans_gluten', label: 'Sans gluten' },
  { value: 'sans_lactose', label: 'Sans lactose' },
];

export const NIVEAUX = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
  { value: 'expert', label: 'Expert' },
];

export const DUREES = [
  { value: '30min', label: '30 minutes' },
  { value: '1h', label: '1 heure' },
  { value: '2h', label: '2 heures' },
  { value: 'demi_journee', label: 'Demi-journée' },
  { value: 'journee', label: 'Journée complète' },
  { value: '2jours', label: '2 jours' },
  { value: '3jours', label: '3 jours' },
  { value: 'semaine', label: '1 semaine' },
];
```

**Status :** ⬜ À faire

---

### Task 6.2 : Ajouter CrossValidationRule

**Fichier :** `frontend/lib/offer-schema.ts`

```typescript
export interface CrossValidationRule {
  field: string;
  rule: 'lte' | 'gte' | 'in' | 'subset' | 'coherent' | 'requiredIfTrue' | 'requiredIfFalse';
  onboardingKey: string; // ex: 'max_participants' du projet
  message: string;
}

// Utilisation dans un schema :
{
  crossValidation: {
    field: 'max_participants',
    rule: 'lte',
    onboardingKey: 'project_capacity',
    message: 'Le nombre de participants ne peut pas dépasser la capacité du projet'
  }
}
```

**Status :** ⬜ À faire

---

### Task 6.3 : Ajouter types `repeater` et `dynamicOptions`

**Fichier :** `frontend/lib/offer-schema.ts`

```typescript
export interface SchemaField {
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'time' | 'file' | 'textarea' | 'hierarchy' | 'repeater';
  // ... existing fields
  dynamicOptions?: {
    endpoint: string;
    labelField: string;
    valueField: string;
  };
  repeaterConfig?: {
    addLabel: string;
    fields: string[];
    minItems?: number;
    maxItems?: number;
  };
}
```

**Status :** ⬜ À faire

---

### Task 6.4 : Mettre à jour les schemas avec shared constants

**Fichier :** `frontend/lib/offer-schema.ts`

Remplacer les options hardcodées par les constantes importées de `shared-configs.ts`.

**Status :** ⬜ À faire

---

## Sprint 7 — API & Performance ⚡

> **Objectif :** Vérifier la qualité API avant d'ajouter des fonctionnalités.
> **Type :** Optimisation — pas de nouvelles fonctionnalités utilisateur.

### Task 7.1 : Vérifier la pagination

**Endpoints :**
```
GET /offers?page=1&limit=20
GET /circuits?page=1&limit=20
GET /guide/search?page=1&limit=20
GET /bookings/mine?page=1&limit=20
```

**Vérifier :** Response contient `data`, `total`, `page`, `limit`, `totalPages`.

**Status :** ⬜ À faire

---

### Task 7.2 : Vérifier les filtres et recherche

**Endpoints :**
```
GET /offers/public?region=&category=&min_price=&max_price=
GET /circuits?region=&difficulty=&duration_min=&duration_max=
GET /guide/search?q=&zone=&max_price=&lat=&lng=&date=
```

**Vérifier :** Filtres fonctionnent, combinaisons possibles.

**Status :** ⬜ À faire

---

### Task 7.3 : Vérifier les index SQL

**Requêtes à optimiser :**
```sql
-- Vérifier les index sur les colonnes fréquemment requêtées
CREATE INDEX IF NOT EXISTS idx_offers_author ON offers(author_id);
CREATE INDEX IF NOT EXISTS idx_offers_region ON offers(region);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offer_items_offer ON offer_items(offer_id);
CREATE INDEX IF NOT EXISTS idx_circuits_author ON circuits(author_id);
CREATE INDEX IF NOT EXISTS idx_bookings_traveler ON bookings(traveler_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
```

**Status :** ⬜ À faire

---

### Task 7.4 : Vérifier les N+1 Queries

**Fichiers :** `offer.service.ts`, `circuit.service.ts`, `booking.service.ts`

**Vérifier :**
```typescript
// ❌ N+1 : Boucle sur les items pour charger les prix
for (const item of items) {
  const prices = await this.priceRepo.find({ where: { offer_item_id: item.id } });
}

// ✅ Correct : Charger tout d'un coup
const items = await this.offerItemRepo.find({
  relations: ['prices', 'sessions', 'capacity'],
  where: { offer_id: offerId }
});
```

**Status :** ⬜ À faire

---

### Task 7.5 : Vérifier l'eager loading

**Fichiers :** `offer.entity.ts`, `circuit.entity.ts`

**Vérifier :** Pas de `eager: true` sur les relations qui ne sont pas toujours nécessaires.

**Status :** ⬜ À faire

---

## Sprint 8 — UX & Frontend ✨

> **Objectif :** Améliorer l'expérience utilisateur sur les composants existants.
> **Type :** Fonctionnalités d'amélioration UX.

### Task 8.1 : Afficher le type de prestation dans le wizard

**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`

Badge clair pour chaque type : 🟢 Ma offre | 🔵 Offre externe | 🟠 Guide | ⚪ Référence externe

**Status :** ⬜ À faire

---

### Task 8.2 : Skeleton loaders dans le wizard

**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`

Loading states pendant la recherche d'offres/guides.

**Status :** ⬜ À faire

---

### Task 8.3 : Tooltip explicatif sur les prix

**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`

Tooltip "Prix catalogue = prix de base de l'offre" au survol du badge prix.

**Status :** ⬜ À faire

---

### Task 8.4 : Confirmation avant suppression

**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`

`confirm()` avant de supprimer une activité ou un jour.

**Status :** ⬜ À faire

---

## Résumé des tâches

| Sprint | Tâches | Type | Status |
|--------|--------|------|--------|
| Sprint 1 — Data Integrity | 5 | 🐛 Bugs | ⬜ 0/5 |
| Sprint 2 — Catalogue | 5 | 🔍 Audit | ⬜ 0/5 |
| Sprint 3 — Circuits bugs | 5 | 🐛 Bugs | ⬜ 0/5 |
| Sprint 4 — Booking lifecycle | 4 | 🔧 Architecture | ⬜ 0/4 |
| Sprint 5 — DDD | 5 | 🔧 Architecture | ⬜ 0/5 |
| Sprint 6 — Config engine | 4 | ✨ Fonctionnalités | ⬜ 0/4 |
| Sprint 7 — API & perf | 5 | ⚡ Optimisation | ⬜ 0/5 |
| Sprint 8 — UX | 4 | ✨ Fonctionnalités | ⬜ 0/4 |
| **Total** | **37 tâches** | | **⬜ 0/37** |

---

## Ordre d'exécution

```
Sprint 1 (Data Integrity) → Sprint 2 (Catalogue) → Sprint 3 (Circuits bugs)
                                                           ↓
                                                   Sprint 4 (Booking lifecycle)
                                                           ↓
                                                   Sprint 5 (DDD) → Sprint 6 (Config)
                                                           ↓
                                                   Sprint 7 (API) → Sprint 8 (UX)
```

**Sprint 1 et 2 sont bloquants** — ils corrigent les problèmes critiques de données.

**Sprint 3 dépend de Sprint 1** — les fixes circuits nécessitent la data integrity.

**Sprint 4 et 5 sont indépendants** — lifecycle booking vs lifecycleDDD.

**Sprint 6, 7, 8 sont indépendants** — ils peuvent être faits en parallèle.

---

## Changements par rapport à v1

| Changement | Raison |
|-----------|--------|
| ❌ SET NULL → ✅ Soft Delete | Préserver l'historique des réservations |
| ❌ Optimistic Locking → reporté | Pas encore de charge concurrente |
| ❌ Price History → reporté | Pas encore d'analytics/audit |
| ❌ "Intégration Maram" → ✅ "Moteur de Configuration" | Maram = source d'inspiration, pas un modèle |
| ✅ Sprint 2 Catalogue ajouté | Vérifier la chaîne Offer → OfferItem → Capacity |
| ✅ Sprint 7 API ajouté | Pagination, filtres, index, N+1 queries |
| ✅ État `inactive` ajouté | Désactiver temporairement sans supprimer |
| ✅ Séparation bugs/architecture/fonctionnalités | Organisation claire |

---

*Dernière mise à jour : 5 Juillet 2026 — v2.0*

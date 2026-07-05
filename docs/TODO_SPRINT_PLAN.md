# Plan d'Action & Sprints — Éco-Voyage

**Date :** 2026-07-05
**Basé sur :** Audit DDD, Audit Circuits/Activités/Tarification, Analyse Comparative Maram

---

## Vue d'ensemble

| Sprint | Thème | Durée | Priorité | Impact |
|--------|-------|-------|----------|--------|
| **Sprint 1** | Sécurité & Data Integrity | 3 jours | 🔴 Haute | Éviter pertes de données |
| **Sprint 2** | Cohérence Métier | 3 jours | 🔴 Haute | Fix bugs circuits |
| **Sprint 3** | Intégration Maram | 2 jours | 🟡 Moyenne | Uniformité UI |
| **Sprint 4** | Lifecycle & State Machine | 2 jours | 🟡 Moyenne | Robustesse workflow |
| **Sprint 5** | UX & Frontend | 2 jours | 🟢 Basse | Expérience utilisateur |
| **Sprint 6** | Documentation & PR | 1 jour | 🟢 Basse | Maintenabilité |

---

## Sprint 1 — Sécurité & Data Integrity 🔴

> **Objectif :** Éviter les données orphelines et les surréservations

### Task 1.1 : Fix Booking FK cascade
**Fichier :** `backend/src/booking/entities/booking.entity.ts`
**Action :** Ajouter `onDelete: 'SET NULL'` sur les FK vers Offer, OfferItem, OfferItemSession

```typescript
@ManyToOne(() => Offer, { nullable: true, onDelete: 'SET NULL' })
offer!: Offer | null;

@ManyToOne(() => OfferItem, { nullable: true, onDelete: 'SET NULL' })
offerItem!: OfferItem | null;

@ManyToOne(() => OfferItemSession, { nullable: true, onDelete: 'SET NULL' })
session!: OfferItemSession | null;
```

**Status :** ⬜ À faire

### Task 1.2 : Vérifier linked circuits avant suppression d'Offer
**Fichier :** `backend/src/offer/offer.service.ts`
**Action :** Dans `remove()`, vérifier si des CircuitProgramItems référencent les OfferItems de cette offre

```typescript
async remove(authorId: string, offerId: string) {
  // Vérifier les circuits liés
  const linkedItems = await this.offerItemRepo.find({ where: { offer: { id: offerId } } });
  const itemIds = linkedItems.map(i => i.id);
  
  if (itemIds.length > 0) {
    const linkedCircuits = await this.circuitRepo
      .createQueryBuilder('c')
      .innerJoin('circuit_days', 'cd', 'cd.circuit_id = c.id')
      .innerJoin('circuit_program_items', 'cpi', 'cpi.circuit_day_id = cd.id')
      .where('cpi.linked_offer_item_id IN (:...itemIds)', { itemIds })
      .getCount();
    
    if (linkedCircuits > 0) {
      throw new BadRequestException(
        `${linkedCircuits} circuit(s) utilisent encore cette offre. Supprimez-les d'abord.`
      );
    }
  }
  // ... suite de la suppression
}
```

**Status :** ⬜ À faire

### Task 1.3 : Ajouter gestion capacité dans CircuitReservation
**Fichier :** `backend/src/circuit/circuit.service.ts`
**Action :** Dans `reserveCircuit()`, décrémenter `remaining_capacity` des sessions liées

```typescript
async reserveCircuit(circuitId: string, dto: CreateCircuitReservationDto) {
  const circuit = await this.findOne(circuitId);
  
  // Pour chaque CircuitProgramItem lié à un OfferItem :
  for (const day of circuit.days ?? []) {
    for (const prog of day.programItems ?? []) {
      if (prog.linked_offer_item_id) {
        const session = await this.findSessionForProgramItem(prog, dto.date);
        if (session?.remaining_capacity !== null) {
          if (session.remaining_capacity < dto.participants_count) {
            throw new BadRequestException(
              `Capacité insuffisante pour "${prog.title}" : ${session.remaining_capacity} place(s)`
            );
          }
          session.remaining_capacity -= dto.participants_count;
          if (session.remaining_capacity <= 0) session.status = 'full';
          await this.sessionRepo.save(session);
        }
      }
    }
  }
  // ... créer la réservation
}
```

**Status :** ⬜ À faire

### Task 1.4 : Ajouter optimistic locking sur Session
**Fichier :** `backend/src/offer/entities/offer-item-session.entity.ts`
**Action :** Ajouter un champ `version` pour le locking optimiste

```typescript
@Column({ type: 'int', default: 1 })
version!: number;
```

Puis dans `booking.service.ts`, incrémenter la version lors de la mise à jour :
```typescript
session.remaining_capacity = Math.max(0, session.remaining_capacity - participantCount);
session.version = (session.version ?? 0) + 1;
await this.sessionRepo.save(session);
// TypeORM vérifiera automatiquement la version
```

**Status :** ⬜ À faire

### Task 1.5 : Restaurer capacité à l'annulation de CircuitReservation
**Fichier :** `backend/src/circuit/circuit.service.ts`
**Action :** Dans `cancelCircuitReservation()`, restaurer `remaining_capacity`

**Status :** ⬜ À faire

---

## Sprint 2 — Cohérence Métier 🔴

> **Objectif :** Fixer les bugs identifiés dans l'audit des circuits

### Task 2.1 : Brancher externalRef dans CircuitBuilderWizard
**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`
**Action :** Sauvegarder la référence externe dans le state du circuit

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

### Task 2.2 : Auto-lien offre du guide
**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`
**Action :** Quand un guide est sélectionné, récupérer son offre et la lier

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

### Task 2.3 : Unifier GuideSearchInline
**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`
**Action :** Remplacer la version inline (lignes 72-230) par le component exporté `GuideSearchInline`

**Status :** ⬜ À faire

### Task 2.4 : Ajouter badge visuel pour "Référence externe"
**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`
**Action :** Après sélection d'une référence externe, afficher un badge orange

```tsx
{prog.is_external_reference && prog.external_reference && (
  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
    <span className="w-2 h-2 rounded-full bg-amber-500" />
    <span className="text-[11px] font-medium text-amber-700 truncate max-w-[160px]}>
      {prog.external_reference.provider_name || "Référence externe"}
    </span>
  </div>
)}
```

**Status :** ⬜ À faire

### Task 2.5 : Valider linked_offer_item_id lors de création d'activité
**Fichier :** `backend/src/circuit/circuit.service.ts`
**Action :** Vérifier que l'OfferItem référencé existe bien

```typescript
async addItem(circuitId: string, dayId: string, dto: CreateProgramItemDto, authorId: string) {
  if (dto.linked_offer_item_id) {
    const item = await this.offerItemRepo.findOne({ where: { id: dto.linked_offer_item_id } });
    if (!item) {
      throw new NotFoundException('OfferItem référencé introuvable');
    }
  }
  // ...
}
```

**Status :** ⬜ À faire

### Task 2.6 : Structurer proprement guide_cost dans l'entité backend
**Fichier :** `backend/src/circuit/entities/circuit-program-item.entity.ts`
**Action :** Ajouter un champ dédié `guide_cost` au lieu de le stocker dans `fields`

```typescript
@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
guide_cost!: number | null;
```

**Status :** ⬜ À faire

---

## Sprint 3 — Intégration Maram (Shared Constants) 🟡

> **Objectif :** Uniformiser les formulaires avec des constantes partagées

### Task 3.1 : Créer shared-configs.ts
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

### Task 3.2 : Ajouter CrossValidationRule
**Fichier :** `frontend/lib/offer-schema.ts`
**Action :** Ajouter l'interface et l'utiliser dans les schemas

```typescript
export interface CrossValidationRule {
  field: string;
  rule: 'lte' | 'gte' | 'in' | 'subset' | 'coherent' | 'requiredIfTrue' | 'requiredIfFalse';
  onboardingKey: string;
  message: string;
}
```

**Status :** ⬜ À faire

### Task 3.3 : Ajouter types repeater et dynamicOptions
**Fichier :** `frontend/lib/offer-schema.ts`
**Action :** Étendre le type `SchemaField`

```typescript
export interface SchemaField {
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'time' | 'file' | 'textarea' | 'hierarchy' | 'repeater';
  // ... existing fields
  dynamicOptions?: { endpoint: string; labelField: string; valueField: string };
  repeaterConfig?: { addLabel: string; fields: string[] };
}
```

**Status :** ⬜ À faire

### Task 3.4 : Mettre à jour les schemas existants avec shared constants
**Fichier :** `frontend/lib/offer-schema.ts`
**Action :** Remplacer les options hardcodées par les constantes importées

**Status :** ⬜ À faire

---

## Sprint 4 — Lifecycle & State Machine 🟡

> **Objectif :** Ajouter les états manquants et les transitions automatiques

### Task 4.1 : Ajouter état `draft` pour Offer et Circuit
**Fichiers :** `offer.entity.ts`, `circuit.entity.ts`
**Action :** Modifier le default de `status` de `'pending'` à `'draft'`

```typescript
@Column({ default: 'draft' })
status!: string;
// 'draft' | 'pending' | 'approved' | 'rejected' | 'archived'
```

**Status :** ⬜ À faire

### Task 4.2 : Ajouter état `archived` pour Offer
**Fichier :** `offer.entity.ts`
**Action :** Permettre le statut `archived` (masquer sans supprimer)

**Status :** ⬜ À faire

### Task 4.3 : Ajouter transition automatique pending → expired
**Fichier :** `backend/src/booking/booking.service.ts`
**Action :** Vérifier les réservations pending expirées lors du dashboard

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
  }
}
```

**Status :** ⬜ À faire

### Task 4.4 : Ajouter transition confirmed → completed automatique
**Fichier :** `backend/src/booking/booking.service.ts`
**Action :** Après la date de session, marquer automatiquement comme `completed`

**Status :** ⬜ À faire

### Task 4.5 : Ajouter price_history table
**Fichier :** `backend/src/offer/entities/offer-item-price-history.entity.ts` (nouveau)

```typescript
@Entity('offer_item_price_history')
export class OfferItemPriceHistory {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') offer_item_id!: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) price!: number;
  @Column({ default: 'TND' }) currency!: string;
  @Column({ default: 'per_person' }) pricing_unit!: string;
  @Column({ type: 'varchar' }) change_type!: string; // 'created' | 'updated' | 'deleted'
  @Column({ type: 'text', nullable: true }) reason!: string | null;
  @CreateDateColumn() created_at!: Date;
}
```

**Status :** ⬜ À faire

---

## Sprint 5 — UX & Frontend 🟢

> **Objectif :** Améliorer l'expérience utilisateur

### Task 5.1 : Améliorer l'affichage des liens dans le wizard
**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`
**Action :** Afficher clairement le type de prestation sélectionné (own/other/guide/external)

**Status :** ⬜ À faire

### Task 5.2 : Ajouter skeleton loaders dans le wizard
**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`
**Action :** Loading states pendant la recherche d'offres/guides

**Status :** ⬜ À faire

### Task 5.3 : Ajouter tooltip explicatif sur les prix
**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`
**Action :** Tooltip "Prix catalogue = prix de base de l'offre" au survol du badge prix

**Status :** ⬜ À faire

### Task 5.4 : Ajouter confirmation avant suppression
**Fichier :** `frontend/components/CircuitBuilderWizard.tsx`
**Action :** `confirm()` avant de supprimer une activité ou un jour

**Status :** ⬜ À faire

---

## Sprint 6 — Documentation & PR 🟢

> **Objectif :** Maintenir la documentation à jour

### Task 6.1 : Mettre à jour docs/ANALYSE_OFFRES_CIRCUITS.md
**Action :** Marquer les bugs corrigés comme résolus

**Status :** ⬜ À faire

### Task 6.2 : Mettre à jour docs/AUDIT_DDD_CIRCUITS.md
**Action :** Marquer les invariants corrigés

**Status :** ⬜ À faire

### Task 6.3 : Créer PR avec description type PR7
**Action :** Rédiger la description de PR suivant le format PR7

**Status :** ⬜ À faire

### Task 6.4 : Mettre à jour docs/TODO_SPRINT_PLAN.md
**Action :** Cocher les tâches terminées

**Status :** ⬜ À faire

---

## Résumé des tâches

| Sprint | Tâches | Status |
|--------|--------|--------|
| Sprint 1 — Sécurité | 5 tâches | ⬜ 0/5 |
| Sprint 2 — Cohérence | 6 tâches | ⬜ 0/6 |
| Sprint 3 — Maram | 4 tâches | ⬜ 0/4 |
| Sprint 4 — Lifecycle | 5 tâches | ⬜ 0/5 |
| Sprint 5 — UX | 4 tâches | ⬜ 0/4 |
| Sprint 6 — Docs | 4 tâches | ⬜ 0/4 |
| **Total** | **28 tâches** | **⬜ 0/28** |

---

## Ordre d'exécution recommandé

```
Sprint 1 (Sécurité) → Sprint 2 (Cohérence) → Sprint 3 (Maram)
                                                   ↓
                                           Sprint 4 (Lifecycle)
                                                   ↓
                                           Sprint 5 (UX) → Sprint 6 (Docs)
```

**Sprint 1 et 2 sont bloquants** — ils corrigent des bugs critiques qui peuvent causer des pertes de données.

**Sprint 3 et 4 sont indépendants** — ils peuvent être faits en parallèle.

**Sprint 5 dépend de Sprint 2** — il améliore l'UX des composants corrigés.

**Sprint 6 est continu** — la documentation doit être mise à jour à chaque sprint.

---

*Dernière mise à jour : 5 Juillet 2026*

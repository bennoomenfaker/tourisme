# Système de Collaboration Guide ↔ Prestataire

> **Date :** 28 Juillet 2026 (mis à jour)
> **Statut :** Implémenté (S1-S7) — Collaboration = objet central pricing
> **Module backend :** `collaboration/`
> **Table DB :** `collaborations`

---

## 1. Vue d'ensemble

Le système de collaboration permet à un **prestataire** d'inviter un **guide** à contribuer à une section spécifique de son offre ou de son circuit.

### Modèle Pricing — Objet Central

La **Collaboration** est l'objet central du pricing. Le voyageur ne voit **JAMAIS** la répartition interne (base vs guide). Il ne voit que le `final_price`.

```
Voyageur voit :  final_price = price (base activité) + guide_applied_price
Internal :       guide_applied_price = prix négocié guide (peut différer du suggéré)
```

Pour les circuits, chaque `CircuitProgramItem` peut avoir une `Collaboration` liée :
```
Circuit → Day → ProgramItem
                    ├── price (base activité)
                    ├── collaboration_id → Collaboration
                    │                      ├── guide_id
                    │                      ├── contribution.price (prix guide)
                    │                      └── suggested_price / applied_price
                    └── final_price = price + guide_applied_price
```

### Workflow

```
Prestataire                    Guide
    │                            │
    ├── Invite (POST) ──────────►│
    │                            ├── Reçoit notification
    │                            │
    │   ◄──── Accepte/P refuse ──┤
    │                            │
    │   ◄──── Remplit wizard ────┤  (8 étapes)
    │                            │
    ├── Voit contribution ───────┤
    │                            │
    ├── Publie offre ────────────►│  (contribution visible)
    │                            │
    ├── Publie circuit ──────────►│  (si toutes collab acceptées)
```

---

## 2. Modèle Pricing Détaillé

### Deux niveaux de `requires_guide`

| Niveau | Champ | Effet |
|--------|-------|-------|
| **Catégorie** | `OfferCategory.requires_guide` | Règle par défaut pour toutes les offres de cette catégorie |
| **Offre** | `Offer.requires_guide_override` | NULL = utiliser catégorie, TRUE = obligatoire, FALSE = pas besoin |

```typescript
// Logique de vérification (frontend + backend)
function offerRequiresGuide(offer: Offer): boolean {
  if (offer.requires_guide_override !== null) return offer.requires_guide_override;
  return offer.category?.requires_guide ?? false;
}
```

### Prix par activité (CircuitProgramItem)

| Champ | Description |
|-------|-------------|
| `price` | Prix de base de l'activité (ce que le prestataire facture) |
| `guide_suggested_price` | Prix suggéré par le guide (via `contribution.price`) |
| `guide_applied_price` | Prix appliqué par le prestataire (peut être modifié) |
| `final_price` | `price + guide_applied_price` — ce que le voyageur voit |

### Guard de Publication

Le circuit ne peut pas être publié tant que des collaborations sont en attente :

```typescript
// circuit.service.ts — submitForReview()
private async assertAllCollaborationsAccepted(circuitId: string): Promise<void> {
  const items = await this.programItemRepo.find({ where: { circuit: { id: circuitId } } });
  for (const item of items) {
    if (item.collaboration_id) {
      const collab = await this.collaborationRepo.findOne({ where: { id: item.collaboration_id } });
      if (collab && collab.status !== "accepted" && collab.status !== "completed") {
        throw new BadRequestException(
          `L'activité "${item.title}" a une collaboration en attente (${collab.status}). ` +
          `Toutes les collaborations doivent être acceptées avant publication.`
        );
      }
    }
  }
}
```

---

## 3. Endpoints API

| Méthode | Route | Rôle | Description |
|---------|-------|------|-------------|
| `POST` | `/api/collaborations` | Provider | Inviter un guide (bloqué si déjà PENDING/ACCEPTED/COMPLETED) |
| `PATCH` | `/api/collaborations/:id/respond` | Guide | Accepter ou refuser |
| `PATCH` | `/api/collaborations/:id/contribution` | Guide | Mettre à jour la contribution (wizard) |
| `DELETE` | `/api/collaborations/:id` | Provider | Annuler l'invitation |
| `GET` | `/api/collaborations/provider` | Provider | Mes collaborations (en tant que prestataire) |
| `GET` | `/api/collaborations/guide` | Guide | Mes invitations |
| `GET` | `/api/collaborations/provider/stats` | Provider | Statistiques |
| `GET` | `/api/collaborations/offer/:offerId` | Provider/Guide/Admin | Collaborations d'une offre |
| `GET` | `/api/collaborations/:id` | Provider/Guide/Admin | Détail |
| `POST` | `/api/collaborations/offer/:offerId/publish` | Provider | Publier offre (vérifie guard) |
| `PATCH` | `/api/collaborations/offer/:offerId/price` | Provider | Modifier prix offre |
| `GET` | `/api/collaborations/offer/:offerId/status` | Provider | Statut publication offre |

---

## 4. Statuts

| Statut | Description |
|--------|-------------|
| `pending` | Invitation envoyée, guide n'a pas encore répondu |
| `accepted` | Guide a accepté, peut remplir le wizard |
| `completed` | Guide a soumis sa contribution |
| `declined` | Guide a refusé l'invitation |
| `cancelled` | Prestataire a annulé l'invitation |

**Règle de duplication :** On ne peut pas inviter un même guide pour la même offre si une collaboration PENDING, ACCEPTED ou COMPLETED existe déjà.

---

## 5. Wizard 8 Étapes (Guide)

Après acceptation, le guide remplit un formulaire en 8 étapes :

| Étape | Contenu | Champs |
|-------|---------|--------|
| 1. Services | Services proposés | `services[]`, `service_description` |
| 2. Disponibilités | Horaires & jours | `availability_type`, `available_days[]`, `available_hours` |
| 3. Tarification | Prix & frais | `pricing_model`, `price`, `currency`, `extra_fees[]` |
| 4. Langues | Langues & compétences | `languages[]`, `skills[]`, `certifications[]` |
| 5. Photos | Médias & galérie | `photos[]`, `video_url` |
| 6. Description | Détails & notes | `detailed_description`, `notes_for_provider` |
| 7. Matériel | Équipements | `equipment_provided[]`, `equipment_required[]` |
| 8. Confirmation | Récapitulatif | `confirmed: true` |

**Nouveau :** Le champ `price` de l'étape 3 devient le `guide_suggested_price` dans le circuit.

---

## 6. Pages Frontend Modifiées

### Phase 1 — Bugs Fixés

| Fichier | Modification |
|---------|-------------|
| `components/collaboration/CollaborationCard.tsx` | `SECTION_LABELS` mis à jour : 5 → 9 types de services |
| `components/collaboration/CollaborationInviteModal.tsx` | Erreurs affichées avec `AlertCircle` rouge |
| `components/collaboration/ProviderCollaborationsTab.tsx` | Bouton Annuler fonctionne + erreurs affichées |
| `components/collaboration/GuideCollaborationsTab.tsx` | Erreurs affichées |

### Phase 2 — Modèle Pricing Circuit

| Fichier | Modification |
|---------|-------------|
| `components/CircuitBuilderWizard.tsx` | Interface `ProgramItemForm` : ajout `offer_id`, `collaboration_id`, `guide_suggested_price`, `guide_applied_price`, `final_price` |
| `components/CircuitBuilderWizard.tsx` | `addProgramItem()` : initialise les nouveaux champs |
| `components/CircuitBuilderWizard.tsx` | `handleSubmit()` : envoie les nouveaux champs à l'API |
| `components/CircuitBuilderWizard.tsx` | UI guide : affiche prix suggéré vs appliqué |
| `components/CircuitBuilderWizard.tsx` | Barre verte "Prix final activité" = base + guide |
| `components/CircuitBuilderWizard.tsx` | Label renommé "Prix base activité" (au lieu de "Prix facturé voyageur") |

### Phase 3 — Modèle Pricing Offre

| Fichier | Modification |
|---------|-------------|
| `app/offers/[id]/page.tsx` | Interface `Offer` : `requires_guide_override`, `final_price`, `category` |
| `app/offers/[id]/page.tsx` | Logique deux niveaux `requires_guide` (catégorie + override) |
| `app/offers/[id]/page.tsx` | Affichage `final_price` au lieu de `price` |

### Phase 4 — Fix Import

| Fichier | Modification |
|---------|-------------|
| `app/offers/[id]/page.tsx` | Import `Loader2` ajouté (manquait) |
| `components/collaboration/CollaborationWizard.tsx` | Cast `d[key]` avec `Record<string, any>` (fix TypeScript) |

---

## 7. Backend — Entités Modifiées

### `OfferCategory`

```typescript
@Entity()
export class OfferCategory {
  // ...existing fields...
  @Column({ type: "boolean", default: false })
  requires_guide!: boolean;  // Règle par défaut pour les offres de cette catégorie
}
```

### `Offer`

```typescript
@Entity()
export class Offer {
  // ...existing fields...
  @Column({ type: "boolean", nullable: true })
  requires_guide_override!: boolean | null;  // NULL = utiliser catégorie, TRUE/FALSE = override

  @Column({ type: "decimal", nullable: true })
  final_price!: number | null;  // Prix final pour le voyageur
}
```

### `CircuitProgramItem`

```typescript
@Entity()
export class CircuitProgramItem {
  // ...existing fields...

  @ManyToOne(() => Offer, { nullable: true })
  offer!: Offer | null;

  @Column({ type: "uuid", nullable: true })
  offer_id!: string | null;

  @ManyToOne(() => Collaboration, { nullable: true })
  collaboration!: Collaboration | null;

  @Column({ type: "uuid", nullable: true })
  collaboration_id!: string | null;

  @Column({ type: "decimal", nullable: true })
  guide_suggested_price!: number | null;  // Prix suggéré par le guide

  @Column({ type: "decimal", nullable: true })
  guide_applied_price!: number | null;    // Prix appliqué par le prestataire

  @Column({ type: "decimal", nullable: true })
  final_price!: number | null;            // price + guide_applied_price
}
```

### `Collaboration`

```typescript
@Entity()
export class Collaboration {
  // ...existing fields...

  @ManyToOne(() => Offer, { nullable: true })  // nullable pour collaborations circuit
  offer!: Offer | null;

  @Column({ type: "uuid", nullable: true })    // nullable pour collaborations circuit
  offer_id!: string | null;

  @ManyToOne(() => CircuitProgramItem, { nullable: true })
  circuit_program_item!: CircuitProgramItem | null;

  @Column({ type: "uuid", nullable: true })
  circuit_program_item_id!: string | null;
}
```

Contribution JSONB — nouveaux champs :
```json
{
  "services": ["guide_touristique"],
  "price": 80,
  "suggested_price": 80,
  "applied_price": 80,
  "currency": "TND",
  "confirmed": true
}
```

---

## 8. Migration DB

```sql
-- Migration 1722000000000
ALTER TABLE offer_categories ADD COLUMN requires_guide BOOLEAN DEFAULT FALSE;
ALTER TABLE offers ADD COLUMN requires_guide_override BOOLEAN;
ALTER TABLE offers ADD COLUMN publish_ready BOOLEAN DEFAULT FALSE;

-- Migration 1722000000001
ALTER TABLE offers ALTER COLUMN offer_id DROP NOT NULL;
ALTER TABLE offers ADD COLUMN circuit_program_item_id UUID;
ALTER TABLE offers ADD COLUMN suggested_price DECIMAL(10,2);
ALTER TABLE offers ADD COLUMN applied_price DECIMAL(10,2);

ALTER TABLE circuit_program_items ADD COLUMN offer_id UUID;
ALTER TABLE circuit_program_items ADD COLUMN collaboration_id UUID;
ALTER TABLE circuit_program_items ADD COLUMN guide_suggested_price DECIMAL(10,2);
ALTER TABLE circuit_program_items ADD COLUMN guide_applied_price DECIMAL(10,2);

ALTER TABLE collaborations ADD COLUMN circuit_program_item_id UUID;
ALTER TABLE collaborations ALTER COLUMN offer_id DROP NOT NULL;
```

---

## 9. Guide de Test UI

### Scénario 1 : Prestataire invite un guide

1. **Connexion** en tant que prestataire
2. **Aller** sur `/offers/[id]` d'une offre que vous avez créée
3. **Cliquer** sur "Inviter un guide à collaborer"
4. **Sélectionner** un guide dans la liste
5. **Choisir** la section : Guide touristique
6. **Ajouter** un message : "Je cherche un guide pour cette randonnée"
7. **Cliquer** sur "Envoyer l'invitation"
8. ✅ **Résultat** : Le guide reçoit une notification

**Test duplication :** Réessayer avec le même guide → ❌ Erreur "Ce guide est déjà invité"

### Scénario 2 : Guide accepte et remplit le wizard

1. **Connexion** en tant que guide
2. **Aller** sur `/profile/guide`
3. **Cliquer** sur l'onglet "Collabs"
4. **Voir** l'invitation en attente
5. **Cliquer** sur "Accepter"
6. **Cliquer** sur "Remplir ma contribution"
7. **Étape 1** : Sélectionner "Randonnée guidée" + description
8. **Étape 2** : Choisir jours + horaires
9. **Étape 3** : Prix **80 TND** par personne
10. **Étape 4** : Français, Anglais + compétences
11. **Étape 5** : Ajouter URLs photos
12. **Étape 6** : Description détaillée
13. **Étape 7** : Matériel fourni/requis
14. **Étape 8** : Vérifier récapitulatif → Confirmer
15. ✅ **Résultat** : Le prestataire voit la contribution

### Scénario 3 : Guide refuse

1. **Connexion** en tant que guide
2. **Aller** onglet "Collabs"
3. **Cliquer** sur "Refuser"
4. **Écrire** la raison : "Pas disponible à cette date"
5. **Confirmer** le refus
6. ✅ **Résultat** : Le prestataire voit "Refusée" + la raison

### Scénario 4 : Prestataire annule

1. **Connexion** en tant que prestataire
2. **Aller** onglet "Collabs"
3. **Voir** les invitations en attente
4. **Annuler** une invitation
5. ✅ **Résultat** : Statut passe à "cancelled"

### Scénario 5 : Visualiser sur l'offre

1. **Aller** sur `/offers/[id]`
2. **Voir** la section "Collaborateurs"
3. **Voir** les contributions avec services, prix, langues
4. ✅ **Résultat** : Les collaborations sont affichées dans la fiche offre

### Scénario 6 : Circuit avec collaboration guide

1. **Créer** un circuit avec 2 jours
2. **Jour 1** : Ajouter activité "Randonnée"
3. **Sélectionner** un guide via la recherche
4. ✅ **Résultat** : Le prix guide s'affiche (80 TND/j)
5. **Modifier** le prix appliqué à **70 TND**
6. ✅ **Résultat** : La barre verte affiche "Prix final activité : 170 TND" (90 base + 70 guide)
7. **Tenter** de publier avec une collaboration en attente
8. ✅ **Résultat** : ❌ Erreur "L'activité a une collaboration en attente"

### Scénario 7 : Prix final — Voyageur ne voit pas la répartition

1. **Consulter** un circuit en tant que voyageur
2. ✅ **Résultat** : Seul le `final_price` s'affiche (pas "90 base + 80 guide")
3. **Consulter** une offre avec guide
4. ✅ **Résultat** : Seul le `final_price` s'affiche

---

## 10. Fichiers Créés/Modifiés

### Nouveaux fichiers

```
backend/src/common/enums/collaboration-status.enum.ts
backend/src/collaboration/entities/collaboration.entity.ts
backend/src/collaboration/dto/create-collaboration.dto.ts
backend/src/collaboration/dto/update-contribution.dto.ts
backend/src/collaboration/collaboration.service.ts
backend/src/collaboration/collaboration.controller.ts
backend/src/collaboration/collaboration.module.ts
backend/migrations/1722000000000-add-offer-collab-fields.ts
backend/migrations/1722000000001-add-collaboration-circuit-pricing.ts

frontend/components/collaboration/CollaborationInviteModal.tsx
frontend/components/collaboration/CollaborationCard.tsx
frontend/components/collaboration/CollaborationWizard.tsx
frontend/components/collaboration/DeclineModal.tsx
frontend/components/collaboration/GuideCollaborationsTab.tsx
frontend/components/collaboration/ProviderCollaborationsTab.tsx
```

### Fichiers modifiés

```
backend/src/app.module.ts                                    — CollaborationModule ajouté
backend/src/notification/entities/notification.entity.ts     — types collaboration ajoutés
backend/src/offer/entities/offer.entity.ts                   — requires_guide_override, final_price
backend/src/offer/entities/offer-category.entity.ts          — requires_guide
backend/src/circuit/entities/circuit-program-item.entity.ts  — offer_id, collaboration_id, guide prices
backend/src/circuit/circuit.service.ts                       — pricing, publication guard
backend/src/circuit/circuit.module.ts                        — Offer + Collaboration repos
backend/src/collaboration/collaboration.service.ts           — deux niveaux requires_guide, guard
backend/src/collaboration/collaboration.controller.ts        — publish, price, status endpoints

frontend/app/offers/[id]/page.tsx                            — logique deux niveaux, final_price, Loader2
frontend/components/CircuitBuilderWizard.tsx                  — ProgramItemForm, pricing UI
frontend/components/collaboration/CollaborationCard.tsx      — SECTION_LABELS
frontend/components/collaboration/CollaborationInviteModal.tsx — erreurs affichées
frontend/components/collaboration/ProviderCollaborationsTab.tsx — annuler + erreurs
frontend/components/collaboration/GuideCollaborationsTab.tsx   — erreurs affichées
frontend/components/collaboration/CollaborationWizard.tsx     — fix TypeScript
```

---

## 11. Données de Test

Pour tester, il faut au minimum :
- 1 compte **prestataire** avec au moins 1 offre publiée
- 1 compte **guide** suivi par le prestataire

### Connexion rapide

```
Email : provider1@test.com (prestataire)
Email : guide1@test.com (guide)
Mot de passe : Aa17092001
```

### Vérification DB

```sql
-- Vérifier collaborations
SELECT c.id, c.status, c.section, c.contribution->>'price' as guide_price
FROM collaborations c;

-- Vérifier prix circuit
SELECT cp.title, cp.price, cp.guide_applied_price, cp.final_price,
       cp.collaboration_id, cp.offer_id
FROM circuit_program_items cp;

-- Vérifier requires_guide
SELECT o.title, o.requires_guide_override, oc.requires_guide,
       o.final_price
FROM offers o
JOIN offer_categories oc ON o.category_id = oc.id;
```

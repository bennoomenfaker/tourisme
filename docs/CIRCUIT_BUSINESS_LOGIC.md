# Logique Métier - Circuits Multi-Jours

> **Date :** 28 Juillet 2026 (mis à jour)
> **Statut :** Implémenté — Modèle pricing collaboration

---

## Structure Hiérarchique

```
Circuit
├── plusieurs Jours (CircuitDay)
│   └── plusieurs Activités (CircuitProgramItem)
│       ├── price (base activité)
│       ├── collaboration_id → Collaboration
│       │   ├── guide_id → Guide
│       │   ├── suggested_price (prix suggéré par le guide)
│       │   └── applied_price (prix appliqué par le prestataire)
│       └── final_price = price + guide_applied_price
└── Options (CircuitOption)
```

### Entities

| Entité | Relation | Description |
|--------|----------|-------------|
| `circuits` | 1 → N `circuit_days` | Circuit multi-jours avec titre, description, prix de base |
| `circuit_days` | N → 1 `circuits` + N → N `circuit_program_items` | Journée avec date, titre, localisation |
| `circuit_program_items` | N → 1 `circuit_days` | Activité avec `offer_id`, `collaboration_id`, `guide_applied_price`, `final_price` |
| `circuit_options` | N → 1 `circuits` | Options additionnelles (hébergement, transport, etc.) |

---

## Modèle Pricing — Collaboration = Objet Central

### Principe

Le voyageur ne voit **JAMAIS** la répartition interne (base vs guide). Seul le `final_price` est affiché.

```
final_price = price (base activité) + guide_applied_price
```

### Deux niveaux de `requires_guide`

| Niveau | Champ | Effet |
|--------|-------|-------|
| **Catégorie** | `OfferCategory.requires_guide` | Règle par défaut pour toutes les offres de cette catégorie |
| **Offre** | `Offer.requires_guide_override` | NULL = utiliser catégorie, TRUE = obligatoire, FALSE = pas besoin |

```typescript
// Logique de vérification
function offerRequiresGuide(offer: Offer): boolean {
  if (offer.requires_guide_override !== null) return offer.requires_guide_override;
  return offer.category?.requires_guide ?? false;
}
```

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

## Les 4 Types d'Activités

### Cas 1 — Ma propre offre (own)

**Composants :** `ExternalOfferModal` (onglet "Mes offres") + `OfferItemSearchInline`

- ✅ Les offres personnelles sont chargées via `/offers/items/mine`
- ✅ La sélection crée un lien avec `linked_offer_item_id`
- ✅ Les informations de l'offre (prix, description) sont récupérées
- ✅ Le prix catalogue est affiché comme référence

### Cas 2 — Offre d'un autre propriétaire (other)

**Composants :** `ExternalOfferModal` (onglet "Offres externes") + `ExternalOfferItemSearch`

- ✅ La recherche des offres publiques fonctionne via `/offers/public`
- ✅ Le filtrage géographique fonctionne (paramètres lat/lng)
- ✅ La sélection crée un lien avec `linked_offer_item_id` externe
- ✅ Les informations de l'offre sont récupérées (titre, prix)

### Cas 3 — Guide

**Composants :** `GuideSearchInline` (intégré dans `CircuitBuilderWizard.tsx:72-230`)

- ✅ La recherche fonctionne via `/guide/public/search`
- ✅ Filtre par zone et prix max disponible
- ✅ Le guide est lié via `guide_id` et `guide_name`
- ✅ Le prix guide est automatiquement récupéré (`guide_suggested_price`)
- ✅ Le `guide_applied_price` est initialisé avec le prix suggéré
- ✅ Le `final_price` est calculé automatiquement

**Nouveau :** Le guide possède maintenant une `Collaboration` liée dans le circuit.

**Code :** `CircuitBuilderWizard.tsx:1005-1020`

```tsx
<GuideSearchInline
  onSelect={(id, name, price, offeringId) => {
    const suggestedPrice = price || "";
    updateProgramItem(day.id, prog.id, {
      guide_id: id,
      guide_name: name,
      guide_cost: suggestedPrice,
      guide_offering_id: offeringId || null,
      guide_suggested_price: suggestedPrice,
      guide_applied_price: suggestedPrice,
    });
  }}
  dayDate={day.date || undefined}
  dayLat={day.lat}
  dayLng={day.lng}
  dayLocation={day.location_name || region}
/>
```

### Cas 4 — Prestataire externe

**Composants :** `ExternalOfferModal` (onglet "Référence externe")

- ✅ Il est possible de saisir un prestataire externe
- ✅ Aucune offre n'est requise
- ✅ Les champs sont entièrement manuels

---

## Logique de Tarification

### Principe Général

- **Prix catalogue** : Valeur de référence dans l'offre (immuable depuis le circuit)
- **Prix circuit** : Copie indépendante, modifiable
- **Prix guide** : Suggestion du guide, modifiable par le prestataire
- **Prix final** : `price + guide_applied_price` (ce que le voyageur voit)

### Cas 1 — Ma propre offre

- ✅ Le prix catalogue est récupéré automatiquement
- ✅ Le champ du prix dans le circuit est pré-rempli
- ✅ Le champ reste modifiable
- ✅ Le prix catalogue reste visible comme référence

### Cas 2 — Offre externe

- ✅ Le prix catalogue est récupéré automatiquement
- ✅ Le prix du circuit est pré-rempli
- ✅ Il reste modifiable

### Cas 3 — Guide

- ✅ Le prix du guide est récupéré automatiquement (`guide_suggested_price`)
- ✅ Le `guide_applied_price` est initialisé avec le prix suggéré
- ✅ Le prestataire peut modifier le `guide_applied_price`
- ✅ Le `final_price` est calculé automatiquement
- ✅ Si le prix suggéré ≠ prix appliqué, un indicateur s'affiche

### Cas 4 — Prestataire externe

- ✅ Aucun prix n'est pré-rempli
- ✅ Les champs sont entièrement manuels

### Exemple concret

```
Activité : Randonnée guidée au Djebel Zaghouan
Price (base) = 90 TND
Guide suggéré = 80 TND/jour
Guide appliqué = 80 TND/jour

Final_price = 90 + 80 = 170 TND

Voyageur voit : 170 TND
Internal : 90 (base) + 80 (guide)
```

---

## Champs Nouveaux dans CircuitProgramItem

| Champ | Type | Nullable | Description |
|-------|------|----------|-------------|
| `offer_id` | UUID | Oui | Lien vers l'offre parente |
| `collaboration_id` | UUID | Oui | Lien vers la collaboration guide |
| `guide_suggested_price` | DECIMAL | Oui | Prix suggéré par le guide |
| `guide_applied_price` | DECIMAL | Oui | Prix appliqué par le prestataire |
| `final_price` | DECIMAL | Oui | `price + guide_applied_price` |

---

## Bugs Résolus

### 1. Guide offer auto-link ✅ Résolu

**Avant :** L'offre du guide n'était pas automatiquement reliée à l'activité.

**Maintenant :** Le guide est lié via `guide_id` et une `Collaboration` est créée.

### 2. externalRef non branché ✅ Résolu

**Avant :** Les références externes n'étaient jamais sauvegardées dans le state.

**Maintenant :** `onExternalRefChange` est correctement branché.

### 3. Double implémentation GuideSearchInline

Le composant `GuideSearchInline.tsx` existe en tant que composant exporté mais une version inline est utilisée dans `CircuitBuilderWizard.tsx:72-230`.

---

## Recommandations

1. ~~Priorité Haute : Brancher `onExternalRefChange`~~ ✅ Résolu
2. ~~Priorité Haute : Auto-ligaturer l'offre du guide~~ ✅ Résolu
3. ~~Priorité Moyenne : Unifier les implémentations de `GuideSearchInline`~~ ⏳ En cours
4. ~~Priorité Moyenne : Ajouter des badges visuels pour indiquer le type de prestation~~ ✅ Résolu
5. ~~Priorité Basse : Intégrer le système de Provider Schema de Maram~~ ✅ Résolu

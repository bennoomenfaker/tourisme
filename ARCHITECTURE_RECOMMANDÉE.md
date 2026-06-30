## 12. ÉVALUATION GLOBALE

| Critère | Note | Commentaire |
|---------|------|-------------|
| Architecture métier | 10/10 | Projet → Offres, Guide → Offres de guidage |
| Organisation des données | 9,5/10 | Passer à SQL + JSON hybride |
| Richesse des formulaires | 6/10 → 10/10 | Avec moteur de schémas dynamique |
| Réutilisabilité | 7/10 → 10/10 | Avec composants partagés |
| Extensibilité | 8/10 → 10/10 | Un nouveau schéma = nouveau type fonctionnel |

---

## 13. ARCHITECTURE ULTRA-MATURE (10/10)

### 13.1 Structure des dossiers recommandée

```
src/
├── offer/
│   ├── offer-schema.ts              # Agrégateur principal
│   ├── offer-types/                 # Schémas métier séparés
│   │   ├── accommodation/
│   │   │   ├── index.ts
│   │   │   ├── chambre.schema.ts
│   │   │   ├── dortoir.schema.ts
│   │   │   ├── suite.schema.ts
│   │   │   └── tente.schema.ts
│   │   ├── activity/
│   │   │   ├── randonnee.schema.ts
│   │   │   ├── kayak.schema.ts
│   │   │   └── yoga.schema.ts
│   │   ├── restaurant/
│   │   ├── transport/
│   │   ├── workshop/
│   │   └── guide/
│   ├── components/
│   │   ├── DynamicOfferForm.tsx
│   │   ├── AvailabilityEngine.tsx
│   │   ├── PricingEngine.tsx
│   │   └── EquipmentSelector.tsx
│   └── entities/
```

### 13.2 Schéma métier complet (exemple)

```typescript
// offer-types/accommodation/chambre.schema.ts
export const CHAMBRE_SCHEMA: OfferTypeSchema = {
  // IDENTIFICATION
  key: 'accommodation_chambre',
  label: 'Chambre',
  icon: '🏠',
  category: 'accommodation',
  family: 'room',
  allowedRoles: ['owner'],

  // FORMULAIRE
  sections: [
    {
      id: 'general',
      label: 'Informations générales',
      fields: ['nom_chambre', 'surface_m2', 'vue', 'etage', 'bed_count']
    },
    {
      id: 'bathroom',
      label: 'Salle de bain',
      fields: ['sdb_type', 'sdb_equipements'],
      dependsOn: { field: 'sdb_type', values: ['Prive'] }
    },
    {
      id: 'services',
      label: 'Services',
      fields: ['inclus', 'formule_restauration', 'pmr_chambre']
    },
    {
      id: 'schedule',
      label: 'Horaires',
      fields: ['checkin_debut', 'checkin_fin', 'checkout', 'couvre_feu']
    }
  ],

  // CHAMPS DÉTAILLÉS
  fields: {
    nom_chambre: { type: 'text', required: true, label: 'Nom / numéro' },
    surface_m2: { type: 'number', required: false, label: 'Surface (m²)' },
    vue: { 
      type: 'select', 
      label: 'Vue',
      options: ['Jardin', 'Piscine', 'Mer', 'Montagne', 'Ville']
    },
    etage: { type: 'number', label: 'Étage' },
    bed_count: { type: 'number', required: true, label: 'Nombre de lits' },
    sdb_type: { 
      type: 'select', 
      label: 'Type SdB',
      options: ['Prive', 'Partage', 'SalleCommune']
    },
    sdb_equipements: { 
      type: 'multiselect', 
      label: 'Équipements',
      options: ['Douche', 'Baignoire', 'WC', 'Lavabo', 'SecheCheveux'],
      conditional: { field: 'sdb_type', value: 'Prive' }
    }
  },

  // RÉSERVATION
  booking: {
    mode: 'automatic' | 'manual' | 'quote',
    minGroup: 1,
    maxGroup: 10,
    requiresDeposit: false,
    depositPercentage: 0
  },

  // ANNULATION
  cancellation: {
    freeHours: 24,
    rules: [
      { hours: 24, refund: 100 },
      { hours: 48, refund: 50 },
      { hours: 0, refund: 0 }
    ]
  },

  // DISPONIBILITÉ
  availability: {
    hasSessions: true,
    recurrence: true,
    exceptionMerge: true
  },

  // CAPACITÉS
  capacities: {
    type: 'persons',
    min: 1,
    ideal: 2,
    max: 4
  },

  // RECHERCHE
  search: {
    filters: ['surface_m2', 'vue', 'bed_count', 'pmr_chambre'],
    sortable: ['surface_m2', 'price', 'bed_count'],
    displayFields: ['surface_m2', 'lits', 'prix', 'vue']
  },

  // AFFICHAGE
  display: {
    cardFields: ['surface_m2', 'bed_count', 'price', 'vue'],
    mapFields: ['latitude', 'longitude'],
    listColumns: ['nom', 'surface', 'lits', 'prix', 'statut']
  }
};
```

---

## 14. NOUVEAUX SCHÉMAS À CRÉER

### 14.1 Booking Rules Engine
```typescript
booking_schema: {
  immediate: { requires_payment: false },
  manual: { confirmation_required: true },
  quote: { admin_review: true },
  deposit: { percentage_required: 50 },
  onsite_payment: { allowed: true, methods: ['cb', 'especes'] }
}
```

### 14.2 Cancellation Rules Engine
```typescript
cancellation_schema: {
  restaurant: { freeHours: 24 },
  chambre: { freeHours: 168 }, // 7 jours
  kayak: { freeHours: 48 },
  guide: { custom: true } // Selon le guide
}
```

### 14.3 Equipment Taxonomy
```typescript
equipment_taxonomy: {
  confort: ['Wifi', 'Climatisation', 'Coffre', 'TV'],
  accessibilite: ['PMR', 'Ascenseur', 'Rampe'],
  exterieur: ['Terrasse', 'Barbecue', 'Jardin', 'Piscine'],
  salle_bain: ['Douche', 'Baignoire', 'WC', 'Lavabo']
}
```

### 14.4 Search Configuration
```typescript
search_schema: {
  surfaces: {
    searchable: true,
    filterable: true,
    sortable: true,
    display_in_card: true,
    icon: '📏'
  }
}
```

---

## 15. PLAN D'ACTION DÉTAILLÉ

### Phase 1 : Structure & Agrégateur (1 jour)
- [ ] Créer dossier `offer-types/`
- [ ] Créer `offer-types/accommodation/` et `offer-types/activity/`
- [ ] Déplacer schémas existants dans fichiers séparés
- [ ] Créer `offer-schema.ts` qui agrège tout

### Phase 2 : Moteurs centraux (3 jours)
- [ ] Implémenter `PricingEngine` (tarification flexible)
- [ ] Implémenter `AvailabilityEngine` (fusion théorique/réel)
- [ ] Implémenter `EquipmentSelector` (taxonomie + icônes)

### Phase 3 : Formulaire dynamique (2 jours)
- [ ] Refactoriser `GuidedOfferWizard.tsx` en `DynamicOfferForm`
- [ ] Charger schéma selon catégorie/famille/type
- [ ] Afficher sections dynamiquement
- [ ] Gérer conditions d'affichage

### Phase 4 : API & Validation (2 jours)
- [ ] API endpoint qui lit le schéma
- [ ] Validation automatique côté serveur
- [ ] Documentation OpenAPI générée

### Phase 5 : Schémas types (ongoing)
- [ ] Chambre : enrichir avec tous champs
- [ ] Dortoir : enrichir avec nb_lits, horaires
- [ ] Tente : ajouter type, literie, électricité
- [ ] Restaurant : ajouter régimes, horaires
- [ ] Kayak/Randonnée : ajouter champs spécifiques

---

## 16. CONCLUSION FINALE

Votre architecture actuelle est excellente. Elle peut atteindre le **score parfait (10/10)** en transformant `offer-schema.ts` en **cœur métier générique** de la plateforme.

Résultat final :
- Ajouter un type d'offre = ajouter un fichier de schéma
- Plus de code hardcodé dans le Wizard
- APIs flexibles et auto-documentées
- Recherche et filtres configurables
- Extensibilité maximale
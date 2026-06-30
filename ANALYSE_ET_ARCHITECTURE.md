# Analyse Complète & Architecture Recommandée
## Projet Actuel vs Éco-Tourism Platform v2

---

## 1. ARCHITECTURE ACTUELLE - Points forts

### 1.1 Ce qu'il faut garder absolument (10/10)

**Offres indépendantes**
```
Projet (ex: Camping Beni Mtir)
├── Offre Chambre familiale
├── Offre Dortoir
├── Offre Kayak
├── Offre Randonnée
└── Offre Atelier poterie
```

C'est le modèle Airbnb/Booking/GetYourGuide - pas de modification nécessaire.

**Moteur de schémas** - Remplace les conditions `if(type=="room")` par configuration dynamique.

**SQL + JSON hybride** - Champs communs en SQL, détails spécifiques en JSON.

**Sections du Wizard** - Informations → Tarifs → Disponibilités → Équipements → Conditions → Photos → Aperçu.

**Composants réutilisables** - PricingEngine, AvailabilityEngine, EquipmentSelector.

---

## 2. SYNTHESE DES DIFFÉRENCES

| Critère | Projet Actuel | Éco-Tourism Platform v2 |
|---------|--------------|-------------------------|
| Granularité | Simple (10 catégories) | 13 catégories, 87 sous-types |
| Architecture | ✅ Offres indépendantes | Offres contraintes par onboarding |
| Formulaires | Base JSON | Formulaires détaillés mais rigides |
| Évolutivité | 7/10 → 10/10 | 8/10 |

---

## 3. RECOMMANDATIONS TECHNIQUES

### 3.1 Structure de dossiers

```
src/
├── offer/
│   ├── offer-schema.ts        # Agrégateur
│   ├── offer-types/           # Schémas métier
│   │   ├── accommodation/
│   │   │   ├── chambre.schema.ts
│   │   │   ├── dortoir.schema.ts
│   │   │   ├── tente.schema.ts
│   │   │   └── index.ts
│   │   ├── activity/
│   │   │   ├── randonnee.schema.ts
│   │   │   ├── kayak.schema.ts
│   │   │   └── index.ts
│   │   └── restaurant/
│   ├── components/
│   │   ├── DynamicOfferForm.tsx
│   │   ├── AvailabilityEngine.tsx
│   │   ├── PricingEngine.tsx
│   │   └── EquipmentSelector.tsx
│   └── registry/
│       └── OfferRegistry.ts
└── taxonomy/
    ├── views.ts
    ├── equipment.ts
    ├── services.ts
    └── languages.ts
```

### 3.2 Hiérarchisation recommandée

```
Catégorie
  ↓
Sous-catégorie
  ↓
Type
  ↓
Option
```

Exemples :
- `Accommodation → Room → Suite → Vue Mer`
- `Activity → Water → Kayak → Kayak Double`

### 3.3 Modèle SQL + JSON

**SQL (communs)** :
```
title, description, capacity, price, duration, difficulty, status, location, images
```

**JSON (spécifiques)** :
```
vue, surface_m2, type_lit, type_embarcation, courant, allergenes
```

---

## 4. SCHÉMA MÉTIER COMPLET

```typescript
// offer-types/accommodation/chambre.schema.ts
export const CHAMBRE_SCHEMA: OfferTypeSchema = {
  key: 'accommodation_chambre',
  label: 'Chambre',
  icon: '🏠',
  category: 'accommodation',
  subcategory: 'room',
  
  sections: [
    { id: 'general', label: 'Informations', fields: ['nom_chambre', 'surface_m2', 'vue', 'etage'] },
    { id: 'capacity', label: 'Capacité', fields: ['bed_count', 'occupancy'] },
    { id: 'bathroom', label: 'Salle de bain', fields: ['sdb_type', 'sdb_equipements'] },
    { id: 'services', label: 'Services', fields: ['inclus', 'formule_restauration', 'pmr_chambre'] },
    { id: 'schedule', label: 'Horaires', fields: ['checkin_debut', 'checkin_fin', 'checkout', 'couvre_feu'] }
  ],
  
  // Référence aux politiques (plus simple que de tout redéfinir)
  bookingPolicy: 'standard_automatic',
  cancellationPolicy: 'standard_flexible',
  
  // Config affichage
  display: {
    cardFields: ['surface_m2', 'bed_count', 'price', 'vue'],
    filterable: ['surface_m2', 'vue', 'pmr_chambre']
  }
};
```

---

## 5. POLITIQUES PARTAGÉES (À NE PAS DUPLIQUER)

### 5.1 Booking Policies
```
standard_automatic: Réservation instantanée
standard_manual: Confirmation requise
standard_quote: Demande devis
flexible_booking: Config customizable
```

### 5.2 Cancellation Policies
```
flexible: 24h avant (restaurant)
standard: 48h avant (activités)
strict: 7 jours (hébergement)
flexible_guide: Selon le guide
```

### 5.3 Taxonomies globales
```
taxonomy/
├── views.ts         // Jardin, Piscine, Mer, Montagne
├── equipment.ts     // Wifi, Clim, Barbecue...
├── services.ts      // Petit-déj, Navette, Guide
├── difficulty.ts    // Facile, Modéré, Difficile
└── terrain.ts       // Rocheux, Boueux, Plate
```

---

## 6. CHAMPS MANQUANTS À AJOUTER

### 6.1 Hébergement - Priorité HAUTE
| Type | Champs critiques |
|------|-----------------|
| Chambre | surface_m2, vue, etage, sdb_equipements, checkin/checkout, pmr_chambre |
| Dortoir | nb_lits_offre, type_lit, silence_partir_de, checkin_fin |
| Tente | type_tente_offre, qualite_literie, sanitaires_offre, electricite |

### 6.2 Restaurant - Priorité HAUTE
| Champ | Description |
|-------|-------------|
| regimes_offre | Végétarien/Vegan/Halal/Sans gluten |
| horaires_ouverture | Horaires d'ouverture |
| capacite_interieure | Capacité intérieure |

### 6.3 Activités - Priorité MOYENNE
| Activité | Champs à ajouter |
|----------|-----------------|
| Randonnée | denivele_positif, fichier_gpx, point_depart, accessibilite_pmr |
| Kayak | niveau_min, savoir_nager, type_embarcation |

---

## 7. PLAN D'ACTION MVP (2 semaines)

### Semaine 1 : Infrastructure
- [ ] Créer `offer-types/` avec structure
- [ ] Déplacer 3 types (chambre, dortoir, tente) en schémas
- [ ] Créer `OfferRegistry.ts` agrégateur
- [ ] Créer `taxonomy/` (views, equipment, services)

### Semaine 2 : Moteurs & Composants
- [ ] Refactoriser `GuidedOfferWizard.tsx` en `DynamicOfferForm`
- [ ] Implémenter `PricingEngine` (prix par personne/nuit/groupe)
- [ ] Implémenter `AvailabilityEngine` partagé
- [ ] Implémenter `EquipmentSelector` avec taxonomie

---

## 8. ÉVOLUTIONS POST-MVP

À ajouter plus tard :
- [ ] Plugins modulaires (AccommodationPlugin, ActivityPlugin...)
- [ ] Workflows configurables (Draft → Pending → Published)
- [ ] SEO intégré (slug, metaTitle, structuredData)
- [ ] Internationalisation des schémas
- [ ] Génération API automatique depuis schémas

---

## 9. ÉVALUATION FINALE

| Élément | Note | Commentaire |
|---------|------|-------------|
| Architecture métier | 10/10 | Modèle Projet → Offres excellent |
| Offres indépendantes | 10/10 | Compatible Airbnb/Booking |
| SQL + JSON hybride | 10/10 | Performance + souplesse |
| Moteur de schémas | 10/10 | Extensibilité maximale |
| Complexité actuelle | 7/10 | MVP trop ambitieux avec 87 types |

---

## 10. RECOMMANDATION FINALE

**Ne pas implémenter les 87 sous-types tout de suite.** Construire l'architecture pour les accueillir, puis implémenter les types essentiels :

- Accommodation : Chambre, Dortoir, Tente (3 schémas)
- Activity : Randonnée, Kayak (2 schémas)
- Restaurant : Restaurant traditionnel (1 schéma)
- Workshop : Poterie, Cuisine (2 schémas)

Total : **8 schémas** pour couvrir le MVP.

Le moteur fonctionne une fois, puis chaque nouveau type = ajouter un schéma.
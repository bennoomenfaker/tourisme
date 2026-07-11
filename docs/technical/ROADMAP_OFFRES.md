# Roadmap : Enrichissement des Offres

## Objectif
Enrichir le formulaire de création d'offres avec détails spécifiques par sous-type, localisation conditionnelle, et recherche de guide.

## Principes
- ✅ Architecture actuelle conservée (Offer → OfferItem → details_json)
- ✅ Localisation héritée de l'établissement pour hébergement/restauration
- ✅ Localisation propre pour activités avec déplacement
- ✅ Guide optionnel avec recherche
- ✅ Formulaire en page dédiée (pas modal)
- ✅ Aligné avec Maram (Provider/Organization/Venue) — 11 juillet 2026

---

## Phase 1 : Infrastructure (1 jour)

- [ ] Créer `frontend/lib/offer-schema.ts` : configuration des champs par catégorie/sous-type
- [ ] Créer `frontend/lib/offer-rules.ts` : règles métier (localisation, guide, etc.)
- [ ] Définir les sous-types pour l'hébergement (tente, chambre, dortoir, suite, bungalow, ecolodge)
- [ ] Créer la structure `offer-types/` avec fichiers séparés par catégorie

## Phase 2 : Page dédiée (1-2 jours)

- [ ] Créer `app/offers/new/page.tsx` (ou `/offers/[id]/edit/page.tsx`)
- [ ] Migrer le contenu du `GuidedOfferWizard` vers la page
- [ ] Stepper multi-étapes :
  - Étape 1 : Catégorie
  - Étape 2 : Sous-type
  - Étape 3 : Infos générales + localisation (conditionnelle)
  - Étape 4 : Guide (optionnel, avec autocomplete)
  - Étape 5 : Détails spécifiques au sous-type
  - Étape 6 : Équipements & Services (multiselect avec catégories)
  - Étape 7 : Horaires & Disponibilités
  - Étape 8 : Tarifs
  - Étape 9 : Photos & Aperçu

## Phase 3 : Localisation conditionnelle (1 jour)

- [ ] Règle : si hébergement/restauration → pas de champ localisation
- [ ] Règle : si activité/déplacement → champs GPS + point_départ + point_arrivée
- [ ] Règle : si circuit → itinéraire multi-points
- [ ] Backend : valider que la localisation est fournie quand nécessaire

## Phase 4 : Guide optionnel (1 jour)

- [ ] Toggle "Guide requis" dans le formulaire
- [ ] Autocomplete / recherche de guide
- [ ] Lier `guide_id` à l' `OfferItem` (nullable)
- [ ] Backend : filtrer les offres avec/sans guide dans la recherche

## Phase 5 : Détails Hébergement (2 jours)

- [ ] **Tente** : type_tente, surface_m2, capacite, qualite_literie, electricite, sanitaires, prise_electrique, configuration_lit, linge_fourni, distance_sanitaires_m
- [ ] **Chambre** : surface_m2, vue, etage, sdb_type, sdb_equipements, formule_restauration, pmr, checkin_debut/fin, checkout, type_lit
- [ ] **Dortoir** : nb_lits_offre, type_lit, dortoir_genre (Mixte/H/F), couvre_feu, silence_partir_de, checkin_debut/fin, checkout
- [ ] **Suite** : surface_m2, nb_pieces, espaces, services_premium, privatisation
- [ ] **Bungalow** : surface_m2, capacite, configuration_lits, sdb_type, equipements, animaux, checkin/checkout
- [ ] **Éco-lodge** : materiaux_construction, source_energie, certifications_eco, gestion_dechets

## Phase 6 : Détails Activités (2 jours)

- [ ] **Kayak** : type_embarcation, distance_km, duree, niveau_min, savoir_nager, equipement_fourni
- [ ] **Randonnée** : distance_km, denivele_positif, fichier_gpx, point_depart, point_arrivee, altitude_max, niveau
- [ ] **VTT** : type_terrain, type_velo, distance_km, denivele, niveau, equipement_fourni
- [ ] **Yoga** : style, cadre, niveau, duree_seance, equipement_fourni
- [ ] **Plongée** : profondeur_max, niveau_requis, site, equipement_fourni

## Phase 7 : Équipements & Taxonomie (1 jour)

- [ ] Catégories d'équipements multiselect avec icônes :
  - Confort : Wifi, Clim, Chauffage, TV, Coffre
  - Extérieur : Terrasse, Barbecue, Jardin, Piscine, Parking
  - Salle de bain : Douche, Baignoire, WC, Lavabo, Sèche-cheveux
  - Cuisine : Réfrigérateur, Micro-ondes, Plaque, Bouilloire
- [ ] Composant `EquipmentSelector` réutilisable

## Phase 8 : Circuits (1 jour)

- [ ] Chaque activité du circuit peut avoir son propre guide (ou non)
- [ ] Localisation par activité (point_depart spécifique)
- [ ] Champ `guide_id` nullable dans `trip_plan_items` / `circuit_day_activities`

---

## Règles Métier (offer-rules.ts)

```typescript
// Localisation : seulement pour activités avec déplacement
needsLocation(itemType: string): boolean
// => true si itemType n'est pas hébergement/restauration

// Guide : optionnel pour activités, désactivé pour hébergement
canHaveGuide(category: string): boolean
// => true si activity / transport / eco_tour / workshop

// Source localisation
locationSource(itemType: string): 'offer' | 'project'
// => 'offer' si activité, 'project' si hébergement
```

## Notes
- `details_json` stocke tous les champs spécifiques
- Les champs communs restent dans les colonnes SQL de `Offer` / `OfferItem`
- Les sous-types sont définis dans `offer-config.ts` existant
- Le guide est lié via `guide_id` nullable sur `OfferItem`

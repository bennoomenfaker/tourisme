# Analyse Comparative : Projet Actuel vs Éco-Tourism Platform v2

## 1. Structure des Catégories

### Projet Actuel
- **10 catégories principales** : accommodation, activity, restaurant, transport, workshop, guide_service, equipment_rental, event, craft, circuit, sejour, eco_tour
- Système simple : catégorie → item_type (ex: accommodation → room/bed/camping_space)

### Éco-Tourism Platform v2
- **13 catégories principales** avec **87 sous-types** détaillés
- Chaque sous-type a sa propre fiche technique complète
- **Hierarchicalité** : Catégorie > Sous-type > Sous-sous-type (ex: HÉBERGEMENT > dortoir/chambre_standard/chambre_superieure/suite/bungalow/tente_glamping...)

---

## 2. Création d'Offres - Hébergement

### Projet Actuel
**Structure plate, simple :**
- 1 formulaire générique pour hébergement
- `item_type` : room / bed / camping_space
- `room_sub_type` (dans details_json) : private / double / family / shared / suite / studio
- **Attributs limités** stockés dans `details_json` :
  - room : { room_sub_type, bed_count }
  - camping_space : { tent_capacity }

### Éco-Tourism Platform v2
**Structure hiérarchique avec Onboarding :**

#### Dortoir
- **Onboarding** : nb_lits_total, type_dortoir, ratio_sanitaires, services_communs, accueil_continu, langues_accueil
- **Champs offre** : nb_lits_offre, type_lit, dortoir_genre (lié à type_dortoir), inclus, horaires (checkin_debut, checkin_fin, checkout, couvre_feu, silence_partir_de)
- **Cross-validation** : ≤ nb_lits_offre ≤ nb_lits_total

#### Chambre Standard
- **Onboarding** : nb_chambres, capacite_max, types_lits, services_inclus, pmr, langues_accueil
- **Champs offre** : nom_chambre, surface_m2, etage, vue, nb_couchages, sdb_type, sdb_equipements, formule_restauration, horaires
- **Cross-validation** : ∈ type_lit_offre ∈ types_lits, ≤ nb_couchages ≤ capacite_max

#### Chambre Supérieure
- **Onboarding** : nb_chambres_sup, caracteristiques_distinctives, services_premium, petit_dej_inclus, pmr
- **Champs offre** : nom_chambre, surface_m2, vue, caracteristiques_offre, services_offre, etc.
- **Cross-validation** : ⊆ caracteristiques_offre ⊆ caracteristiques, ⊆ services_offre ⊆ services_premium

#### Suite
- **Onboarding** : nb_suites, surface_moyenne, espaces_distincts, services_inclus, privatisation
- **Champs offre** : nom_suite, surface_m2, nb_pieces, espaces_suite, services_offre
- **Cross-validation** : ⊆ espaces_suite ⊆ espaces_distincts

#### Bungalow
- **Onboarding** : nb_bungalows, capacite_par_bungalow, environnement, equipements, animaux_acceptes, pmr
- **Champs offre** : nom_bungalow, surface_m2, vue, capacite_offre, configuration_lits, equipements_offre
- **Cross-validation** : ≤ capacite_offre ≤ capacite_par_bungalow

#### Tente Glamping
- **Onboarding** : nb_tentes, types_tentes, environnement, saison_ouverture, sanitaires, electricite, restauration
- **Champs offre** : nom_tente, type_tente_offre, surface_m2, capacite_offre, configuration_lit, qualite_literie, prise_electrique_offre, sanitaires_offre
- **Cross-validation** : ∈ type_tente_offre ∈ types_tentes, ¬F prise_electrique_offre requiredIfFalse electricite

---

## 3. Principales Différences de Détails

### a) Séparation des Formulaires
| Aspect | Projet Actuel | Éco-Tour v2 |
|--------|--------------|-------------|
| Sous-types hébergement | Gérés via room_sub_type dans un seul formulaire | Formulaires séparés par sous-type dédié |
| Champs spécifiques | Stockés dans `details_json` | Champs explicites avec validation directe |

### b) Onboarding Lié aux Activités
Le v2 introduit un **onboarding spécifique par sous-type** avec des champs comme :
- `nb_lits_total`, `capacite_max`, `types_lits` (limites globales)
- `environnement`, `saison_ouverture`
- `services_inclus`, `services_communs`
- Ces valeurs **contraind les offres** via des règles de cross-validation

### c) Cross-Validation (Validation Croisée)
Le v2 implémente un système riche de contraintes :

| Symbole | Règle | Exemple |
|---------|-------|---------|
| `∈` | Valeur doit être dans la liste | niveau_offre ∈ niveaux_diff |
| `≤` | Doit être inférieur ou égal | nb_lits_offre ≤ nb_lits_total |
| `⊆` | Sous-ensemble | equipements_offre ⊆ equipements |
| `¬F ... requiredIfFalse` | Champ requis si onboarding = false | pmr_chambre requis si pmr=false |
| `T ... requiredIfTrue` | Champ requis si onboarding = true | refuge_inclus requis si refuge_disponible=true |

### d) Champs Manquants dans le Projet Actuel
Par rapport au v2, le projet actuel manque :

1. **Hébergement** :
   - Horaires détaillés (checkin_debut, checkin_fin, checkout, couvre_feu, silence_partir_de)
   - Vue, étage, surface m²
   - Équipements SdB spécifiques
   - Formule restauration détaillée
   - Configuration des lits
   - Qualité de la literie
   - Distance aux sanitaires
   - Menu bivouac (pour camping)

2. **Champs transactionnels** :
   - Prix par nuit / par personne / par groupe
   - Caution, dépôt

3. **Conditionnalité** :
   - Les champs conditionnels selon onboarding (ex: "fichier_gpx si circuit=true")
   - Logique `conditionalOn`

4. **84 autres sous-types** :
   - safari_desert, observation_etoiles, speleologie, visite_oasis
   - circuit_montagne, tour_cotier
   - randonnee, kayak_canoe, vtt, escalade, yoga, plongee, surf_windsurf
   - poterie, bijoux_berberes, etc.
   - Tous avec leurs propres champs onboarding et offres

---

## 4. Points Forts du Projet Actuel

### a) Flexibilité JSON
- `details_json` permet d'ajouter des attributs sans migration DB
- Adapté pour des évolutions rapides

### b) Architecture Simple
- Moins de complexité : Offer + OfferItem + Prices
- Plus facile à maintenir

### c) Pas de Cross-Validation Lourde
- Pas de logique de contrainte complexe à gérer
- Moins de validation côté frontend/backend

---

## 5. Recommandations d'Alignement

### Phase 1 : Ajout des Types Sous-Types Hébergement
1. Créer une table `offer_sub_types` liée à `OfferItem`
2. Ajouter les champs onboarding dans une nouvelle table `OfferOnboarding`
3. Extension progressive via JSON fields

### Phase 2 : Cross-Validation
1. Implémenter les règles de validation dans le service
2. Ajouter des champs conditionnels dans le wizard frontend

### Phase 3 : Élargissement aux 87 Sous-Types
1. Migrer ITEM_TYPES_BY_CATEGORY vers une structure dynamique
2. Charger les formulaires depuis la configuration DB

---

## 6. Structure de Données Actuelle vs V2

### Actuel : OfferItem
```typescript
// Structure plate
interface OfferItem {
  item_type: 'room' | 'bed' | 'camping_space' | ...;
  details_json: {
    room_sub_type?: string;
    bed_count?: number;       // Seulement pour room
    tent_capacity?: number;    // Seulement pour camping_space
    difficulty_level?: string;
    duration_hours?: number;
  };
}
```

### V2 : Offre Hiérarchisée
```typescript
// Structure détaillée
interface OfferOnboarding {
  // Déclaration des capacités/possibilités globales
  nb_lits_total?: number;
  capacite_max?: number;
  types_lits?: string[];
  ...
}

interface OfferItemV2 {
  type: 'dortoir' | 'chambre_standard' | 'suite' | ...;
  // Champs propres au type sélectionné
  nb_lits_offre?: number;
  type_lit?: string;
  dortoir_genre?: string;
  inclus?: string[];
  checkin_debut?: string;
  checkin_fin?: string;
  ...
}
```

---

## 7. Synthèse

| Critère | Projet Actuel | Éco-Tourism Platform v2 |
|---------|--------------|------------------------|
| **Granularité** | Simple (10 catégories) | Très détaillée (13 catégories, 87 sous-types) |
| **Onboarding** | Questionnaire durabilité simple | Onboarding complet par sous-type avec contraintes |
| **Validation** | Minimale | Rich cross-validation (∈, ≤, ⊆, ¬F, T) |
| **Champs spécifiques** | Via JSON | Champs explicites typés |
| **Conditionnalité** | Limitée | Avancée (conditionalOn) |
| **Complexité** | Faible | Élevée |

**Conclusion** : Le projet actuel possède une bonne base technique (architecture modulaire avec OfferItem décomposé en prix/capacité/sessions), mais manque de la finesse fonctionnelle du v2. L'approche JSON actuelle permet une évolution progressive vers le modèle v2 sans refonte majeure.
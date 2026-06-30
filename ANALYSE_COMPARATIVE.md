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

## 6. Recommandations pour Enrichir le Formulaire Actuel

### Stratégie : Extension Progressive via JSON (Conserver votre architecture)

Votre approche (séparer les offres par type) est **supérieure** car elle permet :
- Plusieurs offres de types différents (chambre A, chambre B, dortoir...)
- Chaque offre indépendante avec ses prix/capacités
- Pas de contraintes rigides entre offres

### a) Enrichissement HÉBERGEMENT - Détails à Ajouter

#### Pour `camping_space` (Espace tente) - Ajouter dans `details_json` :
```json
{
  "tent_capacity": 4,
  "surface_m2": 25,
  "type_tente": "Safari"|"Bell"|"Yurt"|"Chalet",
  "configuration_lit": "2 lits superposés + 1 coin cuisine",
  "qualite_literie": true,
  "linge_fourni": true,
  "electricite": true,
  "prise_electrique": true,
  "sanitaires": "Privés"|"Partagés",
  "distance_sanitaires_m": 50,
  "experiences_incluses": ["Observation étoiles", "Randonnée nocturne"],
  "saison_ouverture": "Printemps/Été"|"Toute l'année"
}
```

#### Pour `room` (Chambre/Dortoir) - Enrichir :
```json
{
  "room_sub_type": "shared",
  "bed_count": 6,
  "surface_m2": 45,
  "etage": 1,
  "vue": "Jardin"|"Piscine"|"Montagne",
  "sdb_type": "Privé"|"Partagé",
  "sdb_equipements": ["Douche", "WC", "Lavabo"],
  "services_inclus": ["Wifi", "Climatisation", "Petit-déjeuner"],
  "checkin_debut": "14:00",
  "checkin_fin": "20:00",
  "checkout": "11:00",
  "couvre_feu": "22:00",
  "silence_partir_de": "22:00"
}
```

### b) Architecture Recommandée

1. **Étape 1 : Définir le Onboarding par Projet-Type**
   - Stocker dans Project ou une nouvelle table `project_capabilities`
   - Champs généraux : capacités max, types disponibles, services généraux

2. **Étape 2 : Dropdown Dynamique des Types**
   - `accommodation` → "Chambre", "Dortoir", "Tente", "Suite"
   - Chacun ouvre des champs spécifiques dans le formulaire

3. **Étape 3 : Validation Conditionnelle**
   - Si `electricite: true` dans onboarding → champ `prise_electrique_offre` requis
   - Si `pmr: true` → champ `pmr_chambre` requis si pas PMR

### c) Mapping des 7 Types d'Hébergement à Intégrer

| Type Actuel | Type V2 | Champs à Ajouter |
|-------------|---------|-----------------|
| room (shared) | Dortoir | nb_lits_offre, type_lit, inclus, horaires |
| room | Chambre Standard | nom_chambre, surface_m2, vue, sdb_equipements, formule_restauration |
| room (suite) | Suite | nb_pieces, espaces_suite, privatisation_offre |
| room (bungalow) | Bungalow | configuration_lits, vue, equipements_offre, animaux_offre |
| camping_space | Tente Glamping | type_tente_offre, surface_m2, qualite_literie, sanitaires_offre |
| camping_space | Camping Sauvage | emplacements, acces_eau, type_sanitaires, feu_camp_offre |
| room (gîte/maison) | Gîte Rural | nb_chambres_gite, equipements_cuisine, table_hotes_offre |

---

## 7. Structure de Données Actuelle vs V2

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

---

## 8. Proposition d'Implémentation Progressive

### Priorité 1 : Tente Glamping (manquant dans votre projet)
```json
// Dans offer-config.ts - Ajouter le type
{ value: 'tente_glamping', label: 'Tente Glamping', icon: '⛺' }

// Dans GuidedOfferWizard.tsx - Étape 3, après camping_space
{currentItemType === 'tente_glamping' && (
  <div className="space-y-3">
    <select onChange={(e) => updateFirstItem('type_tente_offre', e.target.value)}>
      <option value="">Type de tente</option>
      <option value="Safari">Safari</option>
      <option value="Bell">Bell</option>
      <option value="Yurt">Yourte</option>
      <option value="Chalet">Chalet</option>
    </select>
    <input type="number" placeholder="Surface m²" onChange={(e) => updateFirstItem('surface_m2', e.target.value)} />
    <input type="number" placeholder="Capacité" onChange={(e) => updateFirstItem('capacite_offre', e.target.value)} />
    <label><input type="checkbox" onChange={(e) => updateFirstItem('electricite', e.target.checked)} /> Électricité</label>
  </div>
)}
```

### Priorité 2 : Chambre avec Détails
```json
// Ajouts pour room type
- surface_m2 (input number)
- etage (input number)
- vue (select: "Jardin", "Piscine", "Montagne", "Mer")
- sdb_type (select: "Privé", "Partagé")
- sdb_equipements (multiselect)
- formule_restauration (select: "Aucun", "Petit-déj", "Demi-pension", "Pension complète")
```

### Priorité 3 : Horaires Check-in/out
```json
// Nouveau bloc dans les étapes
checkin_debut: "14:00",
checkin_fin: "20:00", 
checkout: "11:00",
couvre_feu: "22:00",
silence_partir_de: "22:00"
```

### Priorité 4 : Équipements avec Multiselect
- Pour tentes : équipements camping
- Pour chambres : équipements chambre
- Pour camping : sanitaires, accès eau, feu autorisé

---

## 9. Tableau des Champs Manquants Critiques

| Catégorie | Sous-type | Champ | Priorité |
|-----------|-----------|-------|----------|
| Hébergement | Toutes | Horaires (checkin/checkout) | HAUTE |
| Hébergement | Chambre | surface_m2, etage, vue, sdb_equipements | HAUTE |
| Hébergement | Tente | type_tente, qualite_literie, sanitaires | HAUTE |
| Hébergement | Toutes | formule_restauration | MOYENNE |
| Restaurant | Tous | regimes_alimentaires | HAUTE |
| Activités | Randonnée | fichier_gpx, denivele_positif, points_interet | MOYENNE |
| Activités | Kayak | niveau_min, savoir_nager | MOYENNE |

**Note** : Votre architecture actuelle avec création d'offres séparées est LA bonne approche. Le v2 regroupe trop de contraintes dans l'onboarding ce qui limite la flexibilité. Je recommande de garder votre système mais d'enrichir les champs via `details_json`.
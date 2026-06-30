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

#### Suite
- **Onboarding** : nb_suites, surface_moyenne, espaces_distincts, services_inclus, privatisation
- **Champs offre** : nom_suite, surface_m2, nb_pieces, espaces_suite, services_offre
- **Cross-validation** : ⊆ espaces_suite ⊆ espaces_distincts

#### Tente Glamping
- **Onboarding** : nb_tentes, types_tentes, environnement, saison_ouverture, sanitaires, electricite, restauration
- **Champs offre** : nom_tente, type_tente_offre, surface_m2, capacite_offre, configuration_lit, qualite_literie, prise_electrique_offre, sanitaires_offre
- **Cross-validation** : ∈ type_tente_offre ∈ types_tentes

---

## 3. Synthèse des Différences

| Critère | Projet Actuel | Éco-Tourism Platform v2 |
|---------|--------------|------------------------|
| **Granularité** | Simple (10 catégories) | Très détaillée (13 catégories, 87 sous-types) |
| **Onboarding** | Questionnaire durabilité | Questionnaire par sous-type avec contraintes |
| **Validation** | Minimale | Rich cross-validation |
| **Champs spécifiques** | Via JSON | Champs explicites |
| **Architecture** | ✅ Offres indépendantes | ❌ Onboarding contraint les offres |

---

## 4. Analyse de l'Architecture (CONFIRMÉE PAR L'UTILISATEUR)

### 4.1 Pourquoi le v2 est trop rigide

Le v2 mélange **deux concepts** :
1. **Gestion de l'établissement** (onboarding/capacité globale)
2. **Vente d'une offre**

C'est une erreur de conception.

### 4.2 Pourquoi votre architecture est supérieure

```
Propriétaire
     ↓
Projet (ex: Camping Beni Mtir)
     ↓
Offres indépendantes :
  • Cabane 1
  • Cabane 2
  • Chambre familiale
  • Dortoir
  • Restaurant
  • Kayak
  • Randonnée
```

Même pattern que Airbnb/Booking/GetYourGuide/Viator.

### 4.3 Le vrai problème : Formulaires pas assez riches

Aujourd'hui :
```
Cabane
Capacité
Prix
```

Demain :
```
Surface, nombre lits, type lits, étage, vue
SdB (privée/partagée, douche, WC)
Services (wifi, clim, terrasse, barbecue)
Horaires (checkin, checkout, couvre-feu)
```

---

## 5. RECOMMANDATIONS (À AJOUTER À VOTRE PROJET)

### 5.1 Architecture à GARDER

✅ Offer + OfferItem + details_json
✅ Offres indépendantes avec prix/capacités séparés

### 5.2 Éléments À AJOUTER

#### Étape "Sous-Type" dans le Wizard
Après la catégorie, choisir :
- **Hébergement** → Chambre | Dortoir | Suite | Bungalow | Tente | Gîte
- **Restaurant** → Restaurant traditionnel | Food truck | Table d'hôtes
- **Activités** → Randonnée | Kayak | Yoga | Escalade...

#### Moteur de Formulaires Dynamique
```typescript
// offer-schema.ts
const FORM_SCHEMA = {
  accommodation: {
    chambre: ['surface_m2', 'vue', 'etage', 'bed_count', 'sdb_equipements', 'checkin_debut', 'checkin_fin', 'checkout'],
    dortoir: ['nb_lits_offre', 'type_lit', 'inclus', 'checkin_debut', 'checkin_fin', 'checkout', 'silence_partir_de'],
    tente: ['type_tente_offre', 'surface_m2', 'capacite_offre', 'qualite_literie', 'electricite', 'sanitaires_offre'],
  }
};
```

---

## 6. CHAMPS MANQUANTS À AJOUTER (Prioritaire)

### Hébergement - Toutes les Offres
| Champ | Description | Type JSON | Priorité |
|-------|-------------|-----------|----------|
| surface_m2 | Surface en mètres carrés | number | HAUTE |
| checkin_debut | Heure check-in min | string (time) | HAUTE |
| checkin_fin | Heure check-in max | string (time) | HAUTE |
| checkout | Heure check-out | string (time) | HAUTE |

### Hébergement - Chambre
| Champ | Description | Priorité |
|-------|-------------|----------|
| vue | Jardin/Piscine/Mer/Montagne | HAUTE |
| etage | Numéro étage | MOYENNE |
| sdb_type | Privé/Partagé | HAUTE |
| sdb_equipements | Douche, WC, Lavabo... | HAUTE |
| formule_restauration | Petit-déj/Demi-pension | MOYENNE |
| pmr_chambre | Accessible PMR | HAUTE |

### Hébergement - Tente
| Champ | Description | Priorité |
|-------|-------------|----------|
| type_tente_offre | Safari/Bell/Yurt/Chalet | HAUTE |
| qualite_literie | Standard/Premium/Luxe | HAUTE |
| electricite | Électricité dispo | HAUTE |
| prise_electrique_offre | Prises incluses | CONDITIONNEL |
| sanitaires_offre | Privés/Partagés | HAUTE |
| distance_sanitaires_m | Distance aux sanitaires | CONDITIONNEL |

### Restaurant
| Champ | Description | Priorité |
|-------|-------------|----------|
| regimes_offre | Végétarien/Vegan/Halal/Sans gluten | HAUTE |
| nb_couverts_offre | Capacité totale | HAUTE |
| type_menu | Type de menu | HAUTE |

### Activités - Randonnée
| Champ | Description | Priorité |
|-------|-------------|----------|
| distance_km | Distance parcours | HAUTE |
| denivele_positif | Dénivelé (m) | HAUTE |
| fichier_gpx | Tracé GPS | MOYENNE |
| point_depart | Lieu départ | HAUTE |
| point_arrivee | Lieu arrivée | MOYENNE |
| altitude_max | Altitude max (m) | MOYENNE |

### Activités - Kayak
| Champ | Description | Priorité |
|-------|-------------|----------|
| type_embarcation_offre | Type embarcation | HAUTE |
| niveau_min | Niveau requis | HAUTE |
| savoir_nager | Savoir nager obligatoire | HAUTE |

---

## 7. PLAN D'ACTION IMMÉDIAT

### Phase 1 : Infrastructure (1 jour)
- [ ] Créer `offer-schema.ts` avec les définitions de champs
- [ ] Ajouter mapping `ACCOMMODATION_SUB_TYPES` dans `offer-config.ts`
- [ ] Modifier wizard : étape "Sous-type" après catégorie

### Phase 2 : Hébergement (3 jours)
- [ ] Formulaire Chambre enrichi (surface, vue, SdB, horaires)
- [ ] Formulaire Dortoir enrichi (nb_lits, types lits, horaires)
- [ ] Formulaire Tente Glamping enrichi (type, literie, électricité, sanitaires)

### Phase 3 : Restauration & Activités (4 jours)
- [ ] Formulaire Restaurant enrichi (régimes, capacité)
- [ ] Formulaire Randonnée enrichi (distance, denivelé, GPX)
- [ ] Formulaire Kayak enrichi (niveau, savoir nager)

### Phase 4 : Validation & Tests
- [ ] Tests fonctionnels sur chaque type
- [ ] Validation des champs conditionnels

---

## 8. CONCLUSION

Votre architecture est **LA bonne approche**. Le v2 est plus détaillé mais plus rigide.

**Stratégie gagnante (Version 1) :**
1. ✅ Garder Offer + OfferItem + details_json
2. ✅ Ajouter les champs manquants via schéma dynamique
3. ✅ Implémenter les champs conditionnels
4. ✅ Sectionner le formulaire (Informations → Équipements → Horaires → Tarifs)
5. ✅ Tout configurer dans `offer-schema.ts` pour modifications sans code

---

## 9. ANALYSE APPROFONDIE (Validation 85-90%)

### 9.1 Points validés à 100%

| Point | Statut |
|-------|--------|
| Architecture Projet → Offres | ✅ Validé |
| Offres indépendantes avec prix/capacités | ✅ Validé |
| Moteur de formulaires dynamique | ✅ Validé |

### 9.2 Points à améliorer (Modèle hybride SQL + JSON)

Actuellement votre modèle utilise `details_json` pour tout. 

**Recommandation** : Séparer les champs courants (SQL) des spécifiques (JSON)

```typescript
// Champs communs - SQL (déjà dans Offer/OfferItem)
title
description
price
capacity
location
availability
images

// Champs spécifiques - details_json
// Cabane : surface, vue, type_lit...
// Randonnée : distance_km, denivele_positif...
// Restaurant : regimes, halal, terrasse...
```

### 9.3 Hiérarchisation recommandée

```
Catégorie
   ↓
   Hébergement
Famille
   ↓
   Cabane
Type
   ↓
   Cabane familiale
Variation
   ↓
   Cabane Luxe
```

Permet d'ajouter des types sans casser la structure existante.

---

## 10. CHAMPS SUPPLÉMENTAIRES IDENTIFIÉS

### 10.1 Randonnée (enrichissement)
| Champ | Description |
|-------|-------------|
| durée_moyenne | Durée estimée |
| altitude_min | Altitude minimum |
| denivele_negatif | Dénivelé négatif |
| type_terrain | Type de terrain |
| periode_ideale | Période idéale |
| meteo_conseillée | Météo conseillée |
| equipement_obligatoire | Équipement obligatoire |
| equipement_fourni | Équipement fourni |
| enfants_autorises | Enfants autorisés |
| animaux_autorises | Animaux autorisés |
| pause_dejeuner | Pause déjeuner incluse |
| points_eau | Points d'eau sur parcours |
| toilettes | Toilettes disponibles |
| accessibilite_pmr | Accessibilité PMR |
| point_rendez_vous | Point de rendez-vous |

### 10.2 Kayak (enrichissement)
| Champ | Description |
|-------|-------------|
| riviere | Nom de la rivière |
| barrage | Barrage |
| lac | Lac |
| mer | Mer |
| courant | Courant fort/faible |
| profondeur | Profondeur moyenne |
| guide_obligatoire | Guide obligatoire |
| assurance | Assurance incluse |
| meteo_minimale | Météo minimale requise |
| equipement_fourni | Équipement fourni |
| type_embarcation | Simple/Double |

### 10.3 Restaurant (enrichissement)
| Champ | Description |
|-------|-------------|
| horaires_ouverture | Horaires d'ouverture |
| jours_ouverture | Jours d'ouverture |
| reservation_obligatoire | Réservation obligatoire |
| capacite_interieure | Capacité intérieure |
| capacite_exterieure | Capacité extérieure |
| parking | Parking disponible |
| paiement_cb | Paiement CB |
| paiement_especes | Paiement espèces |
| allergenes | Allergènes gérés |

### 10.4 Disponibilité (moteur unique)
Toutes les offres utilisent le même système :
- Calendrier
- Jours récurrents
- Périodes de fermeture
- Exceptions

### 10.5 Tarification (moteur unique)
- Prix fixe / par personne / par groupe
- Horaires (par heure / demi-journée / journée / nuit)
- Saisonnalité
- Suppléments week-end / jours fériés
- Réductions enfant / groupe

### 10.6 Équipements (composant réutilisable)
Catégories + icônes + recherche + multiselect.

---

## 11. PLAN D'ACTION OPTIMISÉ

### Phase 1 : Modèle hybride SQL + JSON
- [ ] Identifier champs communs à déplacer en SQL
- [ ] Garder details_json pour les spécifiques

### Phase 2 : Moteur de métadonnées
Créer `offer-schema.ts` qui décrit :
- [ ] Sections à afficher
- [ ] Champs avec validations
- [ ] Dépendances entre champs
- [ ] Filtres de recherche
- [ ] Colonnes d'affichage
- [ ] SEO

### Phase 3 : Composants réutilisables
- [ ] Disponibilité (calendrier partagé)
- [ ] Tarification (moteur partagé)
- [ ] Équipements (multiselect avec icônes)

### Phase 4 : Sections métier
Le wizard propose :
1. Informations
2. Localisation
3. Parcours (activités)
4. Difficulté
5. Capacité
6. Disponibilités
7. Tarifs
8. Photos
9. Conditions
10. Aperçu

Seules les sections pertinentes s'affichent selon le type.

---

## 12. ÉVALUATION GLOBALE

| Critère | Note | Commentaire |
|---------|------|-------------|
| Architecture métier | 10/10 | Projet → Offres, Guide → Offres de guidage |
| Organisation des données | 9,5/10 | Passer à SQL + JSON hybride |
| Richesse des formulaires | 6/10 → 10/10 | Avec moteur de schémas dynamique |
| Réutilisabilité | 7/10 → 10/10 | Avec composants partagés |
| Extensibilité | 8/10 → 10/10 | Un nouveau schéma = nouveau type fonctionnel |
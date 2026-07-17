# Formulaire de création d'offre — Référence complète

## Règle importante

**Chaque offre contient UN SEUL type d'hébergement** (room, bed, camping_space, suite, bungalow, ou ecolodge). Pas de multi-sélection.

---

## Types d'établissements (10 types)

| venue_type | Label | Offres autorisées |
|------------|-------|-------------------|
| `accommodation` | Hébergement | accommodation, restaurant, activity, sejour |
| `camping` | Camping | accommodation, activity, equipment_rental, sejour |
| `restaurant` | Restaurant | restaurant, event, craft |
| `activity_center` | Centre d'activités | activity, workshop, equipment_rental, event |
| `artisan` | Artisanat | workshop, event, equipment_rental, craft |
| `farm` | Ferme écologique | accommodation, restaurant, activity, workshop, sejour, eco_tour |
| `transport` | Transport | transport, equipment_rental, circuit |
| `event_space` | Espace événementiel | event, accommodation, restaurant, workshop |
| `tourism_association` | Association tourisme | activity, guide_service, workshop, transport, eco_tour, circuit, event |
| `eco_park` | Parc écologique | activity, accommodation, guide_service, equipment_rental, eco_tour, circuit |

---

## Formulaire par étape — Accommodation (room)

### Étape 1 — Catégorie
Sélection unique : `accommodation`

### Étape 2 — Informations générales

| Champ | Type | Obligatoire | Valeur |
|-------|------|-------------|--------|
| Établissement | select | ✅ | Sélection du venue |
| Titre | text | ✅ | ex: "Suite Éco-Lodge Vue Mer" |
| Description courte | text | — | 160 caractères max |
| Description détaillée | textarea | — | Texte libre |
| Région | text | ✅ | ex: "Médenine" |
| Adresse | text | — | ex: "Houmt Souk, Djerba" |
| Mode de confirmation | select | — | automatic / manual |
| Type de localisation | buttons | — | Fixe / Mobile |

### Étape 3 — Fiche technique (UN type sélectionné)

**Sélection du type :** `room` (Chambre)

| Section | Champ | Type | Valeur |
|---------|-------|------|--------|
| **Informations** | Surface (m²) | number | ex: 25 |
| | Vue | **multiselect** | jardin, piscine, mer, montagne, ville, aucune |
| | Étage | number | ex: 1 |
| | **Nombre de lits** | number ✅ | **Capacité maximale de lits** (ex: 2 = 2 lits physiques) |
| **Salle de bain** | Type SdB | select | privée, partagée, salle commune |
| | Équipements SdB | multiselect | douche, baignoire, WC, lavabo, sèche-cheveux |
| **Capacité** | **Capacité d'accueil** | number ✅ | **Nombre max de personnes** (ex: 4 = 4 personnes max) |
| | Type de lit | select | simple, double, king, superposé, canapé-lit, mixte |
| | **Accessible PMR** | boolean | Fauteuil roulant (PMR = Personne à Mobilité Réduite) |
| **Horaires** | Check-in à partir de (heure) | time ✅ | ex: 14:00 |
| | Check-in jusqu'à (heure) | time | ex: 22:00 |
| | Check-out avant (heure) | time ✅ | ex: 11:00 |
| | Couvre-feu (heure) | time | ex: 23:00 |
| **Services** | Formule restauration | select | sans, petit_dej, demi_pension, pension_complete |
| | Équipements chambre | hierarchy | wifi, clim, tv, etc. |
| | Services inclus (pour filtres) | hierarchy | petit-déjeuner, parking, etc. |

**Champs par type d'hébergement :**

| Type | Label | Champs spécifiques |
|------|-------|--------------------|
| `room` | Chambre | surface, vue, etage, **bed_count** (lits max), **capacite_accueil** (personnes max), type_lit, sdb, equipements, restauration, horaires, **accessible_pmr** |
| `bed` | Dortoir | **nb_lits_offre** (lits max), type_lit, dortoir_genre, horaires, silence, inclus |
| `camping_space` | Espace tente | **type_tente** (safari/bell/yurt/chalet/toile/tipi/autre), surface, **capacite_offre** (personnes max), literie, electricite, sanitaires, experiences |
| `suite` | Suite | surface, vue, nb_pieces, espaces (salon/terrasse/jardin/balcon/cuisinette), privatisation, sdb, services premium, horaires |
| `bungalow` | Bungalow | surface, vue, **capacite_offre** (personnes max), configuration_lits (1_double/2_simples/double_superpose/familiale), sdb, equipements, animaux, horaires |
| `ecolodge` | Éco-lodge | **type_unite** (cabane/bungalow/suite/tente/dome/yourte), surface, **capacite_offre** (personnes max), description_unique, materiaux, energie, certifications, equipements_eco, experiences_eco, restauration, horaires |

### Étape 4 — Tarifs

| Champ | Type | Valeur |
|-------|------|--------|
| Label tarif | text | ex: "Par nuit" |
| Prix | number | ex: 85 |
| Devise | select | TND |
| Unité de tarification | select | Par personne, Par nuit, Par heure, etc. |
| Tarif par défaut | checkbox | ☑ |
| Acompte (%) | slider | 0-100% |

### Étape 5 — Calendrier (Disponibilités)

| Champ | Type |
|-------|------|
| Règles de disponibilité | SmartDatePicker |

### Étape 6 — Capacité

**Pour accommodation :**

| Champ | Type | Signification |
|-------|------|---------------|
| Type de capacité | select | Chambres, Lits, Tentes, Espaces |
| **Quantité totale** | number | **Nombre total d'unités** (ex: 5 chambres) |
| Description des inclusions | textarea | Texte libre |
| Politique d'annulation | textarea | Texte libre |
| Mode d'exécution | select | standard, instant_stock, scheduled, recurring, on_request |
| Délai réservation (jours) | number | ex: 2 |
| Délai annulation (jours) | number | ex: 7 |

**Pour non-accommodation :**

| Champ | Type | Signification |
|-------|------|---------------|
| Participants minimum | number | Min par session |
| Participants maximum | number | Max par session |
| Âge minimum | number | |
| Type de capacité | select | Personnes, Chambres, Lits, Places, Tentes, Articles, Espaces |
| Quantité totale | number | Stock global |

### Étape 7 — Carte
MapPicker (si applicable)

### Étape 8 — Images
ImageUploader (multi)

### Étape 9 — Aperçu
Résumé + publication

---

## Clarifications importantes

### `bed_count` vs `capacite_accueil`

| Champ | Signification | Exemple |
|-------|---------------|---------|
| `bed_count` | Nombre de **lits physiques** dans la chambre | 2 lits |
| `capacite_accueil` | Nombre max de **personnes** qui peuvent dormir | 4 personnes (2 lits double) |

**Exemple :** Chambre avec 1 lit double + 1 superposé :
- `bed_count = 2` (2 lits physiques)
- `capacite_accueil = 3` (3 personnes : 2 dans le double + 1 dans le superposé)

### `vue` est multiselect

On peut sélectionner **plusieurs vues** (ex: "mer ET montagne").

### `accessible_pmr`

PMR = Personne à Mobilité Réduite. Checkbox pour indiquer que la chambre est accessible aux personnes en fauteuil roulant.

### Check-in = heure, pas date

Les champs check-in/check-out sont des **heures** (type `time`), pas des dates. Les dates de disponibilité sont dans l'étape 5 (Calendrier).

### Section "Services" dans step 3

Cette section apparaît **toujours** pour l'hébergement, même si l'établissement n'a pas "restauration" dans ses services. C'est une info sur l'offre (est-ce que le petit-déj est inclus ?), pas sur l'établissement.

### "Inclus" en double

| Endroit | Champ | Type | Usage |
|---------|-------|------|-------|
| Step 3 (fiche technique) | `inclus` | hierarchy (checkboxes) | Équipements inclus pour les **filtres** |
| Step 6 (capacité) | `inclusions` | textarea | **Description textuelle** des inclusions |

### Capacité de stock vs Participants

| Champ | Signification |
|-------|---------------|
| `minGroupSize` / `maxGroupSize` | Combien de personnes **par réservation/session** |
| `totalQuantity` | Combien d'unités **au total** (stock global) |

**Exemple :** Hôtel avec 5 chambres :
- `maxGroupSize` masqué (c'est la capacité de la chambre)
- `totalQuantity = 5` (5 chambres disponibles)

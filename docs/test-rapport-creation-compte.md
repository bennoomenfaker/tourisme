# Rapport de Test — Workflow Complet (3 comptes, offres, circuits, réservations)

**Date :** 14 juillet 2026  
**Environnement :** Local — `http://localhost:3000`  
**Backend :** `http://localhost:3001`  
**Base de données :** Docker `tourisme-db-1` — PostgreSQL `tourism_db`

---

## 1. Vue d'ensemble

3 comptes à créer pour tester le workflow complet :
1. **Provider** — crée des offres + 1 circuit
2. **Guide** — crée une offre guide
3. **Éco-voyageur** — réserve offres + circuit, crée trip plan

---

## 2. Compte 1 — Provider (`/auth/register` + `/onboarding/provider`)

### 2.1 Inscription
| Champ | Valeur |
|-------|--------|
| Type de compte | `Fournisseur de services` |
| Email | `fakerbennoomen@gmail.com` |
| Mot de passe | `Aa17092001` |
| Confirmation | `Aa17092001` |
| Conditions | ☑ coché |

### 2.2 Onboarding — Étape 1 : Identité
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Nom complet | `full_name` | `Ahmed Benali` |
| Bio | `bio` | `Chef d'entreprise touristique basé à Djerba, passionné d'écotourisme` |
| Pays | `country` | `Tunisie` |
| Langue | `language` | `Français` |

### 2.3 Onboarding — Étape 2 : Activité & Contact
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Entreprise | `organization` | `Dar Djerba Eco-Lodge` |
| Poste | `position` | `Directeur` |
| Téléphone | `phone` | `+216 75 123 456` |
| WhatsApp | `whatsapp` | `+216 75 123 456` |
| Site web | `website` | `https://nardardjerba.tn` |
| Facebook | `facebook` | `https://facebook.com/nardardjerba.tn` |
| Instagram | `instagram` | `@nardardjerba` |
| TikTok | `tiktok` | `@nardardjerba` |
| Ville | `city` | `Djerba` |
| Région | `region` | `Médenine` |
| Années d'expérience | `years_experience` | `4` |
| Certifications | `certifications` | `ISO 21401`, `Green Key` |

---

## 3. Compte 2 — Guide (`/auth/register` + `/onboarding/guide`)

### 3.1 Inscription
| Champ | Valeur |
|-------|--------|
| Type de compte | `Guide local` |
| Email | `fakerbennoomen+2@gmail.com` |
| Mot de passe | `Aa17092001` |
| Confirmation | `Aa17092001` |
| Conditions | ☑ coché |

### 3.2 Onboarding — Étape 1 : Identité
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Photo | `photo` | _(optionnel)_ |
| Nom complet | `full_name` | `Karima Bouazizi` |
| Bio | `bio` | `Guide touristique certifié, spécialisé randonnée et nature` |
| Pays | `country` | `Tunisie` |
| Langue | `language` | `Français` |
| Zone d'activité | `zone` | `Djerba` |

### 3.3 Onboarding — Étape 2 : Type de guide
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Type de guide | `guide_type` | `Guide professionnel` |

### 3.4 Onboarding — Étape 3 : Spécialités & Langues
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Spécialités | `specialties` | `Randonnée`, `Photographie` |
| Langues parlées | `languages_spoken` | `Français`, `Anglais` |

### 3.5 Onboarding — Étape 4 : Expérience & Terrain
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Années d'expérience | `years_experience` | `5` |
| Terrains | `landscapes` | `Montagne`, `Mer & Côte` |
| Certifications | `certifications` | `Guide certifié Éco-Voyage`, `Premiers secours` |

---

## 4. Compte 3 — Éco-voyageur (`/auth/register` + `/onboarding/eco-traveler`)

### 4.1 Inscription
| Champ | Valeur |
|-------|--------|
| Type de compte | `Éco-voyageur` |
| Email | `fakerbennoomen+3@gmail.com` |
| Mot de passe | `Aa17092001` |
| Confirmation | `Aa17092001` |
| Conditions | ☑ coché |

### 4.2 Onboarding — Étape 1 : Identité
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Photo | `photo` | _(optionnel)_ |
| Nom complet | `full_name` | `Sarra Khelifi` |
| Bio | `bio` | `Voyageuse passionnée, à la découverte de la Tunisie authentique` |
| Pays | `country` | `Tunisie` |
| Langue | `language` | `Français` |

### 4.3 Onboarding — Étape 2 : Type de voyageur
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Types de voyage | `traveler_types` | `Aventure`, `Nature` |

### 4.4 Onboarding — Étape 3 : Motivations
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Motivations | `motivations` | `Découverte culturelle`, `Escape nature` |
| Valeurs éco | `sustainability_values` | `Respect environnement`, `Tourisme local` |

### 4.5 Onboarding — Étape 4 : Centres d'intérêt
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Intérêts | `interests` | `Randonnée` (beginner), `Photographie` (intermediate) |
| Terrains | `landscapes` | `Montagne`, `Mer & Côte` |
| Styles de voyage | `travel_styles` | `Backpack`, `Slow travel` |

### 4.6 Onboarding — Étape 5 : Objectifs
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Objectifs éco | `sustainability_goals` | `Réduire empreinte carbone`, `Supporter économie locale` |

---

## 5. Création d'établissements (Venues) — Provider

Le provider doit créer au moins un établissement avant de pouvoir créer des offres.

### Champs du formulaire établissement (`/dashboard` → Nouvel établissement)

| # | Champ | API Field | Type | Obligatoire |
|---|-------|-----------|------|-------------|
| 1 | Nom | `name` | Text | ✅ (min 2 car.) |
| 2 | Type d'établissement | `venue_type` | Multi-select | ❌ |
| 3 | Description | `description` | Textarea | ❌ |
| 4 | Région | `region` | Text | ❌ |
| 5 | Adresse | `address` | Text | ❌ |
| 6 | Photos | `photos` | File upload (multi) | ❌ |
| 7 | Position carte | `lat/lng` | MapPicker | ❌ |
| 8 | Horaires d'ouverture | `opening_hours` | Text | ❌ |
| 9 | Téléphone | `phone` | Tel | ❌ |
| 10 | Site web | `website` | URL | ❌ |
| 11 | Facebook | `facebook` | Text | ❌ |
| 12 | Instagram | `instagram` | Text | ❌ |
| 13 | Services proposés | `services` | Multi-select | ❌ |
| 14 | Labels éco-responsables | `eco_labels` | Multi-select | ❌ |

> **Note :** La position sur la carte (lat/lng) ne remplit PAS automatiquement la région. L'utilisateur doit saisir la région manuellement.

### Types d'établissements disponibles (`venue_type` / `project_type`)

> **Note :** Le champ s'appelle `venue_type` dans l'entité mais `project_type` dans le DTO backend.

| Type | Label | Description |
|------|-------|-------------|
| `accommodation` | Hébergement | Hôtel, éco-lodge, gîte |
| `camping` | Camping | Camping, espace tente |
| `restaurant` | Restaurant | Restaurant, café, food truck |
| `activity_center` | Centre d'activités | Sports, loisirs, plein air |
| `artisan` | Artisanat | Artisanat local, artisan |
| `farm` | Ferme écologique | Agrotourisme, ferme |
| `transport` | Transport | Transport, transfert, location |
| `event_space` | Espace événementiel | Événements, séminaires |
| `tourism_association` | Association tourisme | Association, guide local |
| `eco_park` | Parc écologique | Parc naturel, réserve |

### Différence `venue_type` vs `services`

| Champ | Définition | Exemple |
|-------|-----------|---------|
| `venue_type` | Ce que l'établissement **EST** (catégorie) | `accommodation`, `restaurant` |
| `services` | Ce que l'établissement **PROPOSE** (activités) | `hebergement`, `restauration`, `transport` |

**Exemple :**
- Dar Djerba Eco-Lodge → type: `accommodation`, services: `hebergement`, `restauration`, `activite`
- Le Jardin de Djerba → type: `restaurant`, services: `restauration`

### Services proposés disponibles

| Service | Label | Icône |
|---------|-------|-------|
| `hebergement` | Hébergement | hotel |
| `restauration` | Restauration | restaurant |
| `transport` | Transport | directions_car |
| `activite` | Activités | hiking |
| `guide` | Guide touristique | person_search |
| `atelier` | Ateliers | school |

> **Note :** Le formulaire d'édition permet aussi de modifier le type d'établissement, services et labels éco.

### 5.1 Venue 1 — Hébergement
| Champ | Valeur |
|-------|--------|
| Nom | `Dar Djerba Eco-Lodge` |
| Type | `accommodation` |
| Description | `Éco-lodge authentique au cœur de Djerba, immersion totale dans la nature` |
| Adresse | `Houmt Souk, Djerba` |
| Région | `Médenine` |
| Position | `(33.8756, 10.8585)` |
| Téléphone | `+216 75 123 456` |
| Site web | `https://nardardjerba.tn` |
| Facebook | `https://facebook.com/nardardjerba.tn` |
| Instagram | `@nardardjerba` |
| Horaires | `Lun-Dim: 08:00-22:00` |
| Services | `hebergement`, `restauration`, `activite` |
| Labels éco | `Énergie renouvelable`, `Produits locaux` |

### 5.2 Venue 2 — Restaurant
| Champ | Valeur |
|-------|--------|
| Nom | `Le Jardin de Djerba` |
| Type | `restaurant` |
| Description | `Restaurant bio avec vue sur la mer, cuisine tunisienne traditionnelle` |
| Adresse | `Zone touristique, Djerba` |
| Région | `Médenine` |
| Position | `(33.8800, 10.8600)` |
| Téléphone | `+216 75 789 012` |
| Horaires | `Mar-Dim: 12:00-23:00` |
| Services | `restauration` |
| Labels éco | `Produits bio`, `Zéro déchet` |

---

## 6. Création d'offres — Provider (5 offres)

### Structure du formulaire d'offre (9 étapes)

| Étape | Label |
|-------|-------|
| 1 | Catégorie |
| 2 | Informations (titre, description, région, adresse, GPS) |
| 3 | Activité / Fiche technique (selon catégorie) |
| 4 | Tarifs |
| 5 | Calendrier (disponibilités) |
| 6 | Capacité |
| 7 | Carte |
| 8 | Images |
| 9 | Aperçu |

---

### 6.1 Offre 1 — Hébergement (`accommodation`)

#### Étape 2 — Informations générales
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Titre | `title` | `Suite Éco-Lodge Vue Mer` |
| Description courte | `short_description` | `Suite spacieuse avec vue mer` |
| Description longue | `description` | `Suite spacieuse avec vue panoramique sur la Méditerranée, décoration locale authentique` |
| Région | `region` | `Médenine` |
| Adresse | `address` | `Houmt Souk, Djerba` |
| GPS | `lat/lng` | `(33.8756, 10.8585)` |
| Mode confirmation | `confirmation_mode` | `automatic` |

#### Étape 3 — Fiche technique (selon sous-type)

**Sous-types d'hébergement disponibles :**

| Sous-type | Label | Description |
|-----------|-------|-------------|
| `room` | Chambre | Chambre privée, double, famille |
| `bed` | Lit (dortoir) | Dortoir partagé |
| `camping_space` | Espace tente | Tente safari, bell, yourte |
| `suite` | Suite | Suite luxe avec espaces |
| `bungalow` | Bungalow | Bungalow individuel |
| `ecolodge` | Éco-lodge | Cabane, dôme, yourte éco |

**Champs pour `room` (Chambre) :**

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Informations** | Surface (m²) | number | ex: 25 |
| | Vue | select | jardin, piscine, mer, montagne, ville, aucune |
| | Étage | number | ex: 1 |
| | Nombre de lits | number | min: 1 |
| **Capacité** | Nombre de couchages | number | min: 1 |
| | Type de lit | select | simple, double, king, superposé, canapé-lit, mixte |
| | Chambre PMR | boolean | oui/non |
| **Salle de bain** | Type SdB | select | privée, partagée, salle commune |
| | Équipements SdB | multiselect | douche, baignoire, WC, lavabo, sèche-cheveux |
| **Horaires** | Check-in à partir de | time | ex: 14:00 |
| | Check-in jusqu'à | time | ex: 22:00 |
| | Check-out avant | time | ex: 11:00 |
| | Couvre-feu | time | ex: 23:00 |
| **Services** | Formule restauration | select | sans, petit_dej, demi_pension, pension_complete |
| | Équipements chambre | hierarchy | wifi, climatisation, tv, réfrigérateur, etc. |
| | Inclus dans le prix | hierarchy | petit-déjeuner, parking, etc. |

**Champs pour `bed` (Dortoir) :**

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Capacité** | Nombre de lits proposés | number | min: 1 |
| | Type de lit | select | simple, superposé |
| | Genre du dortoir | select | mixte, hommes, femmes |
| **Horaires** | Check-in/Check-out | time | — |
| | Silence à partir de | time | ex: 22:00 |

**Champs pour `camping_space` (Espace tente) :**

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Informations** | Type de tente | select | safari, bell, yourte, chalet, toile, tipi, autre |
| | Surface (m²) | number | ex: 12 |
| | Capacité | number | min: 1, max: 10 |
| **Confort** | Qualité literie | select | standard, confort, premium |
| | Électricité | boolean | oui/non |
| | Prise électrique | boolean | (si électricité) |
| | Linge de lit fourni | boolean | oui/non |
| **Sanitaires** | Sanitaires | select | privés, partagés, communs |
| | Distance sanitaires (m) | number | (si partagés) |
| **Expériences incluses** | multiselect | — | feu de camp, petit-déjeuner, observation étoiles, randonnée |

**Champs pour `ecolodge` (Éco-lodge) :**

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **L'unité** | Type d'unité | select | cabane, bungalow, suite, tente lodge, dôme, yourte |
| | Surface (m²) | number | — |
| | Capacité | number | min: 1, max: 10 |
| | Description unique | textarea | — |
| **Éco-construction** | Matériaux | multiselect | bois local, pierre, terre/pisé, paille, brique, récupération, toit végétal |
| | Source d'énergie | multiselect | solaire, éolien, réseau, gaz |
| | Certifications éco | multiselect | ecolabel, green_key, biosphere, local |
| **Équipements** | Éco-équipements | hierarchy | — |
| | Expériences éco | multiselect | visite ferme, atelier bio, randonnée, dégustation, observation |
| **Restauration** | Formule | select | sans, petit_dej, demi_pension, pension, table_d'hôtes |

#### Étape 4 — Tarifs

| Champ | Type | Valeur |
|-------|------|--------|
| Label tarif | text | `Suite Vue Mer` |
| Prix | number | `85` |
| Devise | select | `TND` |
| Unité de tarification | select | Par nuit, Par personne, Par séjour, etc. |
| Tarif par défaut | boolean | ☑ |

**Unités de tarification disponibles :**

| Unité | Label |
|-------|-------|
| `per_person` | Par personne |
| `per_night` | Par nuit |
| `per_hour` | Par heure |
| `per_half_day` | Par demi-journée |
| `per_day` | Par jour |
| `per_trip` | Par trajet |
| `per_group` | Par groupe |
| `per_vehicle` | Par véhicule |
| `per_meal` | Par repas |
| `per_stay` | Par séjour |

#### Étape 5 — Calendrier (Disponibilités)

| Champ | Type | Valeur |
|-------|------|--------|
| Type de disponibilité | select | dates_unique, plages, recurrence |
| Date(s) | date picker | `2026-08-15` — `2026-08-30` |
| Jours de la semaine | checkboxes | lun, mar, mer, jeu, ven, sam, dim |
| Heure début | time | `14:00` |
| Heure fin | time | `22:00` |

#### Étape 6 — Capacité

| Champ | Type | Valeur |
|-------|------|--------|
| Participants min | number | `1` |
| Participants max | number | `4` |
| % Acompte | number | `30` |

#### Étape 8 — Images

| Champ | Type | Valeur |
|-------|------|--------|
| Photos | file upload (multi) | _(upload images)_ |

### Données de test — Offre Hébergement

| Champ | Valeur |
|-------|--------|
| Titre | `Suite Éco-Lodge Vue Mer` |
| Sous-type | `ecolodge` |
| Type d'unité | `dôme` |
| Surface | `35` m² |
| Capacité | `2` personnes |
| Vue | `mer` |
| Matériaux | `bois local`, `toit végétal` |
| Énergie | `solaire` |
| Certifications | `green_key` |
| Restauration | `petit_dej` |
| Check-in | `14:00` |
| Check-out | `11:00` |
| Prix | `85` TND / nuit |
| Participants min/max | `1` / `4` |
| Acompte | `30` % |

---

### 6.2 Offre 2 — Restaurant (`restaurant`)

#### Étape 2 — Informations générales

| Champ | Type | Valeur |
|-------|------|--------|
| Titre | text | `Menu Dégustation Terroir` |
| Description courte | text | `Menu 4 plats cuisine tunisienne bio, produits de la ferme` |
| Description détaillée | textarea | `Découvrez les saveurs de la Tunisie avec notre menu dégustation composé de 4 plats cuisinés avec des produits locaux biologiques. Entrée fraîche, plat principal mijoté, accompagnements de saison et dessert maison.` |
| Région | text | `Médenine` |
| Adresse | text | `Houmt Souk, Djerba` |
| Mode de confirmation | select | `manual` |
| Établissement | select | `Dar Djerba Eco-Lodge` |

#### Étape 3 — Fiche technique

**Sélection du type :** `menu` (Menu complet)

| Section | Champ | Type | Valeur |
|---------|-------|------|--------|
| **Informations** | Nombre de plats | number ✅ | `4` |
| | Formule | text | `Entrée + Plat + Accompagnement + Dessert` |
| | Régimes proposés | multiselect | `vegetarien`, `vegan` |
| | Niveau épicé | select | `doux` |
| **Capacité** | Nombre de couverts | number ✅ | `20` |
| **Inclus** | Inclus | multiselect | `boisson`, `pain`, `the` |
| | Boissons incluses | boolean | ☑ |

**Autre type possible :** `dish` (Plat)

| Section | Champ | Type | Valeur |
|---------|-------|------|--------|
| **Informations** | Type de plat | select ✅ | `entree`, `plat`, `dessert`, `accompagnement`, `boisson` |
| | Nom du plat | text | `Couscous aux fruits de mer` |
| | Description du plat | textarea | `Couscous traditionnel aux fruits de mer frais, sauce rouge épicée` |
| | Régimes proposés | multiselect | `halal` |
| | Niveau épicé | select | `moyen` |
| **Ingrédients** | Ingrédients | textarea | `Semoule, crevettes, moules, poisson, tomates, oignons, épices` |
| | Allergènes | multiselect | `poisson`, `crustaces` |

### Données de test — Offre Restaurant

| Champ | Valeur |
|-------|--------|
| Titre | `Menu Dégustation Terroir` |
| Type élément | `menu` (Menu complet) |
| Description courte | `Menu 4 plats cuisine tunisienne bio, produits de la ferme` |
| Description détaillée | `Découvrez les saveurs de la Tunisie avec notre menu dégustation composé de 4 plats cuisinés avec des produits locaux biologiques.` |
| Nombre de plats | `4` |
| Formule | `Entrée + Plat + Accompagnement + Dessert` |
| Régimes | `vegetarien`, `vegan` |
| Niveau épicé | `doux` |
| Nombre de couverts | `20` |
| Inclus | `boisson`, `pain`, `the` |
| Boissons incluses | ☑ |
| Prix | `45` TND / personne |
| Établissement | `Dar Djerba Eco-Lodge` |

---

### 6.3 Offre 3 — Activité (`activity`)

#### Types d'activités disponibles (wizard étape 3)

**Outdoor :**
| Type | Label |
|------|-------|
| `randonnee` | Randonnée |
| `trekking` | Trekking |
| `vtt` | VTT |
| `escalade` | Escalade |
| `kayak` | Kayak |
| `paddle` | Paddle |
| `tyrolienne` | Tyrolienne |
| `speleologie` | Spéléologie |
| `equitation` | Équitation |

**Nature :**
| Type | Label |
|------|-------|
| `observation` | Observation |
| `astronomie` | Astronomie |
| `photographie` | Photographie |

**Culture & Bien-être :**
| Type | Label |
|------|-------|
| `yoga` | Yoga |
| `meditation` | Méditation |
| `poterie` | Poterie |
| `cuisine` | Cuisine |
| `musique` | Musique |

**Sport :**
| Type | Label |
|------|-------|
| `surfing` | Surf |
| `diving` | Plongée |
| `paragliding` | Parapente |

**Autre :**
| Type | Label |
|------|-------|
| `other` | Autre activité |

---

#### Champs génériques (toutes activités — wizard étape 3)

| Champ | Type | Obligatoire | Notes |
|-------|------|-------------|-------|
| Titre | text | ✅ | Étape 2 |
| Description courte | text | — | Étape 2, max 160 caractères |
| Description détaillée | textarea | — | Étape 2 |
| Région | select | ✅ | Étape 2, sélection gouvernorat (auto-remplie GPS) |
| Adresse | text | — | Étape 2 (auto-remplie si GPS) |
| Type d'activité | buttons groupés | ✅ | Étape 3 |
| Nom custom (si "Autre") | text | ✅ | Étape 3, conditionnel |
| Niveau de difficulté | buttons | — | Facile/Modéré/Difficile/Expert |
| Durée estimée (heures) | number + presets | ✅ | 0.5h, 1h, 2h, 3h, 4h, 6h, 8h + saisie libre |
| Mode de localisation | Fixe / Mobile | ✅ | Étape 2 |
| Mode de confirmation | automatic / manual | ✅ | Étape 2 |
| Régime alimentaire | multiselect | — | végétarien, vegan, halal, sans gluten, etc. |
| Culture | multiselect | — | histoire, tradition, artisanat, gastronomie |
| Bien-être | multiselect | — | relaxation, méditation, yoga, spa |
| Sport | multiselect | — | aventure, extrême, eau, montagne |
| Nature | multiselect | — | faune, flore, paysage, étoiles |
| Date début | datepicker | — | Calendrier (étape 4) |
| Date fin | datepicker | — | Calendrier (étape 4) |
| Horaire début | time | — | Calendrier (étape 4) |
| Horaire fin | time | — | Calendrier (étape 4) |
| Prix | number | ✅ | TND (étape 2) |
| Guide associé | GuideSearchInline | — | Recherche par région/nom/disponibilité/prix |
| Établissement | select | ✅ | Provider: sélection parmi ses venues |
| Inclusions | textarea | — | Matériel, guide, repas, transport (étape 6) |

#### Champs pour `randonnee` (Randonnée)

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Randonnée Île de Djerba` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Parcours** | Distance (km) | number ✅ | ex: 12 |
| | Dénivelé positif (m) | number | ex: 450 |
| | Altitude maximale (m) | number | ex: 850 |
| | Type de parcours | select | boucle, aller_retour, traversee |
| | Point de départ | text ✅ | ex: `Dar Djerba Eco-Lodge` |
| | Point d'arrivée | text | — |
| | Tracé GPX | file | _(upload)_ |
| **Niveau** | Niveau | select ✅ | facile, moyen, difficile, tres_difficile |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 10 |
| | Âge minimum | number | ex: 8 |
| **Encadrement** | Guide inclus | boolean | oui/non |
| | Langues du guide | multiselect | français, anglais, arabe, etc. |
| **Inclus** | textarea (texte libre) | — | guide, repas, transport, assurance, baton_marche |

---

#### Champs pour `kayak`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Kayak Côte Ouest Djerba` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Parcours** | Parcours/itinéraire | text ✅ | ex: `Côte Ouest Djerba` |
| | Distance (km) | number | — |
| **Embarcation** | Type d'embarcation | select ✅ | kayak_simple, kayak_double, canoë, paddle |
| | Nombre d'embarcations | number ✅ | min: 1 |
| **Niveau** | Niveau requis | select ✅ | debutant, intermediaire, confirme |
| | Savoir nager obligatoire | boolean | oui/non |
| | Âge minimum | number | ex: 12 |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 8 |
| **Équipement fourni** | multiselect | — | gilet, pagaie, combinaison, sac_etanche |
| **Inclus** | textarea (texte libre) | — | guide, initiation, assurance |

---

#### Champs pour `vtt` (VTT)

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Randonnée VTT Montagne` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Parcours** | Distance (km) | number | ex: 25 |
| | Dénivelé positif (m) | number | ex: 600 |
| | Type de terrain | select | montagne, foret, desert, route, mixte |
| **Vélo** | Type de vélo | select ✅ | vtt, vae, gravel, ville |
| | Nombre de vélos | number ✅ | min: 1 |
| | Équipement fourni | multiselect | casque, gants, kit_reparation, sacoche |
| **Niveau** | Niveau | select ✅ | facile, moyen, difficile |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 10 |
| **Inclus** | textarea (texte libre) | — | guide, casque, assurance |
| | Points d'intérêt | textarea | — |

---

#### Champs pour `escalade`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Escalade Haouaria` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Site** | Nom du site | text ✅ | ex: `Falaises de Haouaria` |
| | Type de site | select ✅ | falaise, bloc, via_ferrata, mur, deep_water |
| | Hauteur maximale (m) | number | ex: 30 |
| | Nombre de voies | number | ex: 15 |
| | Cotation maximale | text | ex: `6a` |
| **Niveau** | Niveau | select ✅ | initiation, debutant, intermediaire, confirme, expert |
| | Guide inclus | boolean | oui/non |
| | Âge minimum | number | ex: 10 |
| **Groupe** | Participants max | number ✅ | ex: 6 |
| **Équipement fourni** | multiselect | — | baudrier, corde, casque, mousquetons, chaussons, magnesia |
| **Inclus** | textarea (texte libre) | — | moniteur, assurance, transport |

---

#### Champs pour `equitation` (Équitation)

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Promenade à Cheval Plage` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Balade** | Type de balade | select ✅ | promenade, randonnee, trek, initiation, voltige |
| | Distance (km) | number | ex: 15 |
| | Type de terrain | select | plage, foret, montagne, desert, manege |
| **Monture** | Type de monture | select | cheval, poney, dromadaire, ane |
| | Poids max (kg) | number | ex: 90 |
| **Niveau** | Niveau | select ✅ | debutant, intermediaire, confirme |
| | Guide inclus | boolean | oui/non |
| | Âge minimum | number | ex: 8 |
| **Groupe** | Participants max | number ✅ | ex: 6 |
| **Équipement fourni** | multiselect | — | casque, bombe, bottes, gilet |
| **Inclus** | textarea (texte libre) | — | guide, assurance, initiation |

---

#### Champs pour `observation` (Observation nature)

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Observation Étoiles Djerba` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Type** | Type d'observation | select ✅ | faune, flore, oiseaux, etoiles, paysages |
| | Saison idéale | text | ex: `Printemps` |
| | Meilleurs horaires | text | ex: `5h-7h, 17h-19h` |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 8 |
| **Guide** | Guide inclus | boolean | oui/non |
| **Inclus** | textarea (texte libre) | — | guide, jumelles, longue_vue, transport |

---

#### Champs pour `yoga`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Yoga Plage Sunrise` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Séance** | Style | select ✅ | hatha, vinyasa, ashtanga, yin, nidra, prenatal |
| | Cadre | select | interieur, exterieur, plage, terrasse |
| | Niveau | select | debutant, intermediaire, avance, tous |
| **Équipement** | Tapis fourni | boolean | oui/non |
| | Accessoires | multiselect | bloc, sangle, coussin, couverture |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 12 |
| **Inclus** | textarea (texte libre) | — | tapis, eau, serviette |

---

#### Champs pour `meditation`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Méditation Forêt Olive` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Session** | Type de méditation | select ✅ | pleine_conscience, guidee, transcendantale, zen, vipassana, marche |
| | Cadre | select | interieur, exterieur, jardin, plage, foret |
| | Niveau | select | debutant, intermediaire, avance, tous |
| **Groupe** | Participants max | number ✅ | ex: 10 |
| **Équipement** | Accessoires | multiselect | coussin, tapis, couverture, bol_tibetain |
| **Inclus** | textarea (texte libre) | — | guide, tapis, coussin, the |

---

#### Champs pour `photographie`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Photo Safari Djerba` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Type** | Type d'atelier | select ✅ | initiation, balade, stage, night, macro, paysage, faune |
| | Niveau | select | debutant, intermediaire, avance, tous |
| **Thème** | Thème photo | multiselect | nature, faune, portrait, paysage, architecture, macro, nocturne, street |
| | Points d'intérêt | textarea | — |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 8 |
| **Matériel** | Matériel fourni | multiselect | boitier, objectif, trepied, filtres |
| **Inclus** | textarea (texte libre) | — | guide, edition, impression |

---

#### Champs pour `guided_tour` (Visite guidée)

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Visite Médina Sousse` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Visite** | Type de visite | select ✅ | historique, culturelle, nature, gastronomique, nocturne, thematique |
| | Distance marche (km) | number | ex: 3 |
| | Thèmes visite | multiselect | patrimoine, architecture, artisanat, cuisine, histoire, nature, oiseaux, photographie |
| **Guide** | Langues | multiselect ✅ | francais, anglais, arabe, etc. |
| | Participants max | number ✅ | ex: 15 |
| **Inclus** | textarea (texte libre) | — | guide, entree, degustation |
| | Points d'intérêt | textarea | — |

---

#### Champs pour `autre` (Autre activité)

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Cours de Calligraphie Arabe` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Informations** | Nom de l'activité | text ✅ | ex: `Cours de calligraphie arabe` |
| | Description activité | textarea | — |
| | Niveau | select | facile, moyen, difficile, tous |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 10 |
| **Équipement** | Équipement fourni | textarea | — |
| **Inclus** | textarea (texte libre) | — | guide, assurance, equipement |

---

#### Champs pour `paddle`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Paddle Lagune Djerba` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Parcours** | Parcours/itinéraire | text ✅ | ex: `Lagune de Djerba` |
| | Distance (km) | number | — |
| **Matériel** | Type de planche | select ✅ | stand_up_paddle, paddle_a_voile, paddle_surf |
| | Nombre de planches | number ✅ | min: 1 |
| | Équipement fourni | multiselect | planche, pagaie, gilet, sac_etanche |
| **Niveau** | Niveau requis | select ✅ | debutant, intermediaire, confirme |
| | Savoir nager obligatoire | boolean | oui/non |
| | Âge minimum | number | ex: 10 |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 8 |
| **Inclus** | textarea (texte libre) | — | guide, initiation, assurance |

---

#### Champs pour `tyrolienne`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Tyrolienne Montagne Zaghouan` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Parcours** | Nom du site | text ✅ | ex: `Tyrolienne de Zaghouan` |
| | Nombre de tyroliennes | number | ex: 5 |
| | Hauteur maximale (m) | number | ex: 80 |
| | Distance totale (m) | number | ex: 500 |
| **Niveau** | Niveau | select ✅ | facile, moyen, difficile |
| | Âge minimum | number | ex: 10 |
| | Poids maximum (kg) | number | ex: 100 |
| **Groupe** | Participants max | number ✅ | ex: 8 |
| **Équipement** | Équipement fourni | multiselect | casque, baudrier, gants |
| **Inclus** | textarea (texte libre) | — | guide, assurance, transport |

---

#### Champs pour `speleologie`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Spéléologie Grotte de Cerné` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Site** | Nom de la grotte | text ✅ | ex: `Grotte de Cerné` |
| | Profondeur maximale (m) | number | ex: 50 |
| | Nombre de galeries | number | ex: 3 |
| **Niveau** | Niveau | select ✅ | facile, moyen, difficile, tres_difficile |
| | Âge minimum | number | ex: 12 |
| **Groupe** | Participants max | number ✅ | ex: 6 |
| **Équipement** | Équipement fourni | multiselect | casque, baudrier, luciole, corde |
| **Inclus** | textarea (texte libre) | — | guide spéléo, assurance, transport |

---

#### Champs pour `astronomie`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Nuit Étoiles Djerba` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Session** | Type d'observation | select ✅ | etoiles, planetes, lune, constellations, aurore |
| | Meilleurs horaires | text | ex: `21h-23h` |
| | Saison idéale | text | ex: `Toute l'année` |
| **Matériel** | Matériel fourni | multiselect | telescope, jumelles, longue_vue, planisphere |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 10 |
| **Inclus** | textarea (texte libre) | — | guide astronome, thé/café, couvertures |

---

#### Champs pour `poterie`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Atelier Poterie Nabeul` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Atelier** | Type de poterie | select ✅ | tournage, modelage, cuite, decoration, initiation |
| | Niveau | select | debutant, intermediaire, tous |
| | Techniques enseignées | multiselect | tournage, modelage, colombin, cuite |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 8 |
| **Matériel** | Matériel fourni | multiselect | argile, outils, tabouret, four |
| **Inclus** | textarea (texte libre) | — | artisan guide, matériel, cuite, transport |

---

#### Champs pour `cuisine`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Cuisine Tunisienne Traditionnelle` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Atelier** | Type de cuisine | select ✅ | traditionnelle, mediterraneenne, patisserie, pain, conserves, autre |
| | Niveau | select | debutant, intermediaire, tous |
| | Régimes proposés | multiselect | vegetarien, vegan, halal, sans_gluten |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 10 |
| **Matériel** | Matériel fourni | multiselect | tablier, ustensiles, ingrédients, recettes |
| **Inclus** | textarea (texte libre) | — | chef cuisinier, ingrédients, déjeuner, recettes |

---

#### Champs pour `musique`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Atelier Darbouka` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Atelier** | Type de musique | select ✅ | traditionnelle, andalouse, mediterraneenne, contemporaine |
| | Instruments | multiselect | darbouka, oud, ney, violine, guitare, autre |
| | Niveau | select | debutant, intermediaire, tous |
| **Groupe** | Participants min | number | ex: 2 |
| | Participants max | number ✅ | ex: 10 |
| **Matériel** | Matériel fourni | multiselect | instruments, partition, accordeur |
| **Inclus** | textarea (texte libre) | — | professeur, instruments, thé/café |

---

#### Champs pour `surfing`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Surf Plage La Marsa` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Parcours** | Spot de surf | text ✅ | ex: `Plage de La Marsa` |
| | Type de vagues | select | petites, moyennes, grandes |
| **Matériel** | Type de planche | select ✅ | longboard, shortboard, foam, funboard |
| | Équipement fourni | multiselect | planche, combinaison, leash, wax |
| **Niveau** | Niveau | select ✅ | debutant, intermediaire, confirme |
| | Savoir nager obligatoire | boolean | oui/non |
| | Âge minimum | number | ex: 10 |
| **Groupe** | Participants max | number ✅ | ex: 6 |
| **Inclus** | textarea (texte libre) | — | moniteur, matériel, assurance |

---

#### Champs pour `diving` (Plongée)

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Plongée Récif Djerba` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Plongée** | Site de plongée | text ✅ | ex: `Récif de Djerba` |
| | Profondeur maximale (m) | number | ex: 30 |
| | Type de plongée | select ✅ | decouverte, initiation, brevet, nuit |
| **Matériel** | Équipement fourni | multiselect | bouteille, combinaison, masque, stabilisateurs, palmes |
| **Niveau** | Niveau requis | select ✅ | aucun, debutant, brevet |
| | Certification requise | text | ex: `PADI Open Water` |
| | Âge minimum | number | ex: 12 |
| **Groupe** | Participants max | number ✅ | ex: 6 |
| **Inclus** | textarea (texte libre) | — | moniteur, matériel complet, bateau, photos/vidéo, assurance |

---

#### Champs pour `paragliding` (Parapente)

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Parapente Zaghouan` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée estimée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **Vol** | Site de décollage | text ✅ | ex: `Zaghouan` |
| | Altitude de décollage (m) | number | ex: 1200 |
| | Durée de vol | text ✅ | ex: `30min` |
| | Durée totale | text | ex: `2h (avec montée)` |
| **Niveau** | Type de vol | select ✅ | bapteme, initiation, vol_integral |
| | Âge minimum | number | ex: 12 |
| | Poids maximum (kg) | number | ex: 100 |
| **Groupe** | Participants max | number ✅ | ex: 4 |
| **Équipement** | Équipement fourni | multiselect | parapente, harnais, casque, combinaison |
| **Inclus** | textarea (texte libre) | — | pilote instructeur, matériel, transport sommet, assurance, vidéo GoPro |

---

### Données de test — Offre Activité (Randonnée)

| Champ | Valeur |
|-------|--------|
| Titre | `Randonnée Guidée Île de Djerba` |
| Type activité | `randonnee` (Randonnée) |
| Description | `Parcours de 12 km à travers les oliveraies et le littoral de Djerba, guide local inclus. Découverte du patrimoine naturel et culturel de l'île.` |
| Région | `Médenine` |
| Adresse | `Dar Djerba Eco-Lodge, Houmt Souk, Djerba` |
| Mode localisation | Fixe |
| Mode confirmation | Manuelle |
| Distance | `12` km |
| Dénivelé | `450` m |
| Altitude max | `850` m |
| Durée | `5` heures |
| Type parcours | `boucle` |
| Point départ | `Dar Djerba Eco-Lodge` |
| Point arrivée | `Dar Djerba Eco-Lodge` |
| Niveau difficulté | `Modéré` |
| Participants min/max | `2` / `10` |
| Guide inclus | ☑ |
| Langues guide | `français`, `anglais` |
| Inclus | `guide`, `repas` |
| Nature | `paysage`, `faune` |
| Culture | `histoire` |
| Prix | `35` TND / personne |
| Établissement | `Dar Djerba Eco-Lodge` |

### Données de test — Offre Activité (Kayak)

| Champ | Valeur |
|-------|--------|
| Titre | `Kayak Découverte Côte Ouest Djerba` |
| Type activité | `kayak` (Kayak) |
| Description | `Parcours en kayak le long de la côte ouest de Djerba. Observation de la faune marine, grottes et criques secrètes.` |
| Région | `Médenine` |
| Adresse | `Plage de Sidi Mahres, Djerba` |
| Parcours | `Côte Ouest — Plage Sidi Mahres → Grotte des Chameaux` |
| Distance | `8` km |
| Durée | `2.5` heures |
| Type embarcation | `kayak_double` |
| Nombre embarcations | `6` |
| Niveau | `debutant` |
| Savoir nager | ☑ |
| Âge minimum | `12` |
| Participants min/max | `2` / `12` |
| Équipement fourni | `gilet`, `pagaie`, `combinaison`, `sac_etanche` |
| Inclus | `guide`, `initiation`, `assurance` |
| Prix | `45` TND / personne |

---

### 6.4 Offre 4 — Transport (`transport`)

#### Sous-types disponibles

| Sous-type | Label |
|-----------|-------|
| `transport_service` | Service de transport |

#### Champs

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Service** | Nom du service | text | ex: `Transfert Aéroport Djerba` |
| | Description | textarea | — |
| | Type de véhicule | select | berline, van, minibus, 4x4 |
| | Capacité véhicules | number | ex: 4 |
| **Parcours** | Point de départ | text | ex: `Aéroport Djerba` |
| | Point d'arrivée | text | ex: `Dar Djerba Eco-Lodge` |
| | Distance (km) | number | ex: 15 |
| | Durée estimée | text | ex: `30min` |
| **Prix** | Prix | number | ex: 60 |
| | Unité | select | Par trajet, Par véhicule, Par personne |

### Données de test — Offre Transport

| Champ | Valeur |
|-------|--------|
| Titre | `Transfert Aéroport Djerba` |
| Sous-type | `transport_service` |
| Type véhicule | `van` |
| Capacité | `4` personnes |
| Départ | `Aéroport Djerba` |
| Arrivée | `Dar Djerba Eco-Lodge` |
| Distance | `15` km |
| Durée | `30min` |
| Prix | `60` TND / trajet |

---

### 6.5 Offre 5 — Atelier (`workshop`)

#### Sous-types disponibles

| Sous-type | Label |
|-----------|-------|
| `poterie` | Poterie |
| `cuisine` | Cuisine |
| `tissage` | Tissage |
| `musique` | Musique |
| `autre` | Autre atelier |

#### Champs pour `poterie`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Atelier Céramique Djerbienne` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **L'atelier** | Technique enseignée | select ✅ | tour, modelage, colombin, emaux |
| | Niveau | select | debutant, intermediaire, avance |
| **Groupe** | Participants min | number | ex: 1 |
| | Participants max | number ✅ | ex: 6 |
| **Options** | Matériel fourni | boolean | oui/non |
| | Création à emporter | boolean | oui/non |
| | Vente sur place | boolean | oui/non |
| **Inclus** | textarea (texte libre) | — | terre, émaux, cuisson, outils |

#### Champs pour `cuisine`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Atelier Cuisine Tunisienne` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **L'atelier** | Plats préparés | text ✅ | ex: `Couscous, brik, mloukhia` |
| | Niveau | select | debutant, intermediaire, avance |
| | Nombre de recettes | number ✅ | min: 1 |
| **Groupe** | Participants min | number | ex: 1 |
| | Participants max | number ✅ | ex: 8 |
| | Adapté aux enfants | boolean | oui/non |
| **Options** | Visite du marché incluse | boolean | oui/non |
| **Inclus** | textarea (texte libre) | — | ingrédients, tablier, fiche recette, dégustation |

#### Champs pour `tissage`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Atelier Tissage Margoum` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **L'atelier** | Technique | select ✅ | tapis, kilim, margoum, tissage_traditionnel, teinture |
| | Niveau | select | debutant, intermediaire, avance, tous |
| | Atelier en plusieurs sessions | boolean | oui/non |
| **Matériel** | Type de métier | select | vertical, horizontal, cadre |
| | Matériaux inclus | multiselect | laine, coton, soie, alfa, teintures |
| | Participants max | number ✅ | ex: 4 |

#### Champs pour `musique`

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Atelier Darbouka` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **L'atelier** | Instrument enseigné | select ✅ | darbouka, oud, violon, nei, percussions, chant |
| | Styles musicaux | multiselect | traditionnel, soufi, malouf, stambeli, moderne |
| | Niveau | select | debutant, intermediaire, avance, tous |
| **Groupe** | Participants min | number | ex: 1 |
| | Participants max | number ✅ | ex: 10 |
| **Options** | Instrument fourni | boolean | oui/non |
| **Inclus** | textarea (texte libre) | — | instrument, partitions, enregistrement audio |

#### Champs pour `autre` (Autre atelier)

| Section | Champ | Type | Valeurs possibles |
|---------|-------|------|-------------------|
| **Général** | Titre | text ✅ | ex: `Atelier Calligraphie Arabe` |
| | Description courte | text | max 160 car. |
| | Description détaillée | textarea | — |
| | Région | select ✅ | gouvernorat tunisien |
| | Adresse | text | auto-remplie GPS |
| | Date début | datepicker | — |
| | Date fin | datepicker | — |
| | Durée (heures) | number + presets ✅ | 0.5h–8h |
| | Prix | number ✅ | TND |
| **L'atelier** | Nom de l'atelier | text ✅ | ex: `Calligraphie arabe` |
| | Niveau | select | debutant, intermediaire, avance, tous |
| | Description atelier | textarea | — |
| **Groupe** | Participants min | number | ex: 1 |
| | Participants max | number ✅ | ex: 10 |
| **Matériel** | Matériel fourni | text | — |
| **Inclus** | textarea (texte libre) | — | matériel, goûter |

### Données de test — Offre Atelier

| Champ | Valeur |
|-------|--------|
| Titre | `Atelier Céramique Djerbienne` |
| Sous-type | `poterie` |
| Description | `Initiation à la céramique traditionnelle avec un artisan local` |
| Durée | `3h` |
| Niveau | `debutant` |
| Participants min/max | `1` / `6` |
| Matériel fourni | ☑ |
| Prix | `25` TND / personne |

### 6.2 Offre 2 — Restaurant (`restaurant`)

| Champ | Valeur |
|-------|--------|
| Titre | `Menu Dégustation Terroir` |
| Type élément | `menu` (Menu complet) |
| Établissement | `Dar Djerba Eco-Lodge` |
| Description courte | `Menu 4 plats cuisine tunisienne bio, produits de la ferme` |
| Description détaillée | `Découvrez les saveurs de la Tunisie avec notre menu dégustation composé de 4 plats cuisinés avec des produits locaux biologiques.` |
| Nombre de plats | `4` |
| Formule | `Entrée + Plat + Accompagnement + Dessert` |
| Régimes | `vegetarien`, `vegan` |
| Nombre de couverts | `20` |
| Inclus | `boisson`, `pain`, `the` |
| Prix | `45` TND / personne |
| Région | `Médenine` |

### 6.3 Offre 3 — Activité (`activity`)
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Titre | `title` | `Randonnée Guidée Île de Djerba` |
| Type | `offer_type` | `activity` |
| Établissement | `venue_id` | `Dar Djerba Eco-Lodge` |
| Description | `description` | `Parcours de 12 km à travers les oliveraies et le littoral, guide local inclus` |
| Prix | `price` | `35` |
| Devise | `currency` | `TND` |
| Durée | `duration` | `5h` |
| Région | `region` | `Médenine` |
| Min/Max groupe | `min/max_group_size` | `2` / `10` |
| Point de rendez-vous | `meeting_point` | `Dar Djerba Eco-Lodge, 8h00` |

### 6.4 Offre 4 — Transport (`transport`)
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Titre | `title` | `Transfert Aéroport Djerba` |
| Type | `offer_type` | `transport` |
| Établissement | `venue_id` | `Dar Djerba Eco-Lodge` |
| Description | `description` | `Transfert privé aéroport-hôtel aller/retour, véhicule climatisé` |
| Prix | `price` | `60` |
| Devise | `currency` | `TND` |
| Durée | `duration` | `30min` |
| Région | `region` | `Médenine` |
| Inclusions | `inclusions` | `Eau, Wi-Fi véhicule` |

---

## 7. Création d'offre Guide — Guide

### 7.1 Offre Guide (`guide_service`)
| Champ | API Field | Valeur |
|-------|-----------|--------|
| Titre | `title` | `Guide Nature & Randonnée Djerba` |
| Type | `offer_type` | `guide_service` |
| Description | `description` | `Accompagnement personnalisé pour randonnées et découvertes nature à Djerba` |
| Prix | `price` | `50` |
| Devise | `currency` | `TND` |
| Durée | `duration` | `Journée` |
| Région | `region` | `Médenine` |
| Langues | `languages` | `Français`, `Anglais` |
| Min/Max groupe | `min/max_group_size` | `1` / `8` |

---

## 8. Création de Circuit — Provider

### Structure du wizard (6 étapes)

| Étape | Label | Composant |
|-------|-------|-----------|
| 1 | Général | Titre, description, région, durée, dates, difficulté, images |
| 2 | Jours | Timeline des jours avec titre, description, date, lieu (MapPicker) |
| 3 | Activités | Program items par jour (offre liée, guide, prix, transport, etc.) |
| 4 | Itinéraire | Carte Leaflet avec tracé jour par jour (PolylineDrawer) |
| 5 | Tarifs & Options | Disponibilité, hébergement, tarification, inclus/non inclus, options |
| 6 | Aperçu | Résumé visuel avant publication |

---

### 8.1 Étape 1/6 — Général (CircuitBuilderWizard.tsx:676-741)

#### Champs du formulaire

| # | Champ | API Field | Type | Obligatoire | Valeur test |
|---|-------|-----------|------|-------------|-------------|
| 1 | Titre du circuit | `title` | Text | ✅ | `Circuit Tunisie du Sud 3 jours` |
| 2 | Description | `description` | Textarea (3 rows) | ❌ | `De Médenine à Mahdia via Djerba : dortoirs, musique, kayak et plages` |
| 3 | Région du circuit | `region` | Select (24 gouvernorats tunisiens) | ❌ | `Médenine` |
| 4 | Devise | `currency` | Select (TND/EUR/USD) | ❌ | `TND` |
| 5 | Durée (jours) | `duration_days` | Number (min:1, max:90) | ✅ | `3` |
| 6 | Durée (nuits) | `duration_nights` | Number (auto: jours-1, read-only) | — | `2` |
| 7 | Date de début | `start_date` | Date picker (min=today) | ❌ | `2026-08-20` |
| 8 | Date de fin | `end_date` | Date (auto-calculée: start + (jours-1)) | ❌ | `2026-08-22` |
| 9 | Niveau de difficulté | `difficulty_level` | Select | ❌ | `moderate` |
| 10 | Images du circuit | `images` | ImageUploader (max 10) + URL | ❌ | _(upload image)_ |

#### Valeurs difficulté_level

| Valeur | Label |
|--------|-------|
| `easy` | 🟢 Facile |
| `moderate` | 🟡 Modéré |
| `hard` | 🔴 Difficile |
| `expert` | ⚫ Expert |

#### Logique dates

- `duration_nights` = `duration_days - 1` (auto-calculé, champ read-only)
- Si `start_date` changé → `end_date` = `start_date + (duration_days - 1) jours`
- Si `end_date` changé → `duration_days` recalculé = `diff + 1`, `duration_nights` = `diff`
- Validation : `end_date` doit être ≥ `start_date`, la durée doit correspondre aux dates

#### Données de test — Étape 1

| Champ | Valeur |
|-------|--------|
| Titre | `Circuit Tunisie du Sud 3 jours` |
| Description | `De Médenine à Mahdia via Djerba : dortoirs, musique, kayak et plages` |
| Région | `Médenine` |
| Devise | `TND` |
| Durée jours | `3` |
| Durée nuits | `2` (auto) |
| Date début | `2026-08-20` |
| Date fin | `2026-08-22` (auto) |
| Difficulté | `easy` |
| Images | _(upload image)_ |

**Prix de base** : calculé automatiquement par le système = somme des prix des activités `is_included=true`. Par ex: Dortoir Médenine (35) + Souk (0) + Dortoir Djerba (40) + Kayak (45) + Plage Mahdia (0) + Départ (0) = **120 TND** (proposé automatiquement, éditable).

**Règle importante** : Les jours 1 et 2 **obligatoirement** contiennent une activité de type hébergement (pour la nuit). Le jour 3 (dernier jour) n'a pas d'hébergement — c'est le jour de retour au point de départ.

---

### 8.2 Étape 2/6 — Jours (CircuitBuilderWizard.tsx:745-793)

#### Comportement

- Par défaut, `duration_days` jours sont créés automatiquement au montage
- Chaque jour a : `title`, `description`, `date` (auto-remplie depuis `start_date`), `location_name`, `lat`, `lng`
- Possibilité d'ajouter/supprimer des jours (bouton +)
- Le nombre de jours se synchronise avec `duration_days` de l'étape 1

#### Champs par jour

| # | Champ | API Field | Type | Obligatoire | Valeur test |
|---|-------|-----------|------|-------------|-------------|
| 1 | Titre du jour | `title` | Text | ✅ (pour soumission) | `Jour 1` |
| 2 | Description du jour | `description` | Textarea (2 rows) | ❌ | `Visite du souk, nuit chez l'habitant` |
| 3 | Date du jour | `date` | Date (auto-remplie depuis start_date) | ❌ | `2026-08-20` |
| 4 | Lieu du jour | `location_name` | Text (rempli par MapPicker) | ❌ | `Médenine` |
| 5 | Position carte | `lat` / `lng` | MapPicker (Leaflet) | ❌ | `33.8756` / `10.8585` |

#### Données de test — Jours

| Jour | Titre | Description | Date | Lieu | Lat | Lng |
|------|-------|-------------|------|------|-----|-----|
| 1 | `Médenine — Souk & Dortoir` | `Visite du souk, nuit chez l'habitant` | `2026-08-20` | `Médenine` | `33.8443` | `10.4989` |
| 2 | `Djerba — Kayak & Mangroves` | `Kayak dans les mangroves, nuit à Djerba` | `2026-08-21` | `Djerba` | `33.8756` | `10.8585` |
| 3 | `Mahdia — Plage & Retour` | `Plage libre, retour au point de départ` | `2026-08-22` | `Mahdia` | `35.5047` | `11.0622` |

---

### 8.3 Étape 3/6 — Activités par jour (CircuitBuilderWizard.tsx:797-1003)

#### Comportement

- Chaque jour peut contenir N program items (activités)
- Chaque activité peut être liée à :
  - **Offre personnelle** (`linked_offer_item_id` → offre du provider)
  - **Offre externe** (`external_reference` → offre d'un autre provider)
  - **Référence indépendante** (pas d'offre liée, saisie libre)
- Sélection via `ExternalOfferModal` (composant dédié)
- Guide sélectionné via `GuideSearchInline` (filtré par région, date, géolocalisation)

#### Champs par program item

| # | Champ | API Field | Type | Obligatoire | Valeur test Jour 1 |
|---|-------|-----------|------|-------------|---------------------|
| 1 | Offre liée | `linked_offer_item_id` | ExternalOfferModal | ❌ | `Dortoir Chez Ali Médenine` |
| 2 | Titre de l'activité | `title` | Text (prérempli si offre liée) | ✅ | `Dortoir Chez Ali Médenine` |
| 3 | Description | `description` | Textarea (1 row) | ❌ | `Dortoir 4 lits dans maison traditionnelle de Médenine, clim, petit-déj inclus` |
| 4 | Emoji | `emoji` | Select (25 emojis) | ❌ | `🛏️` |
| 5 | Heure de début | `start_time` | Time picker | ❌ | `15:00` |
| 6 | Heure de fin | `end_time` | Time picker | ❌ | `22:00` |
| 7 | Durée (min) | `duration_minutes` | Number (auto-calculé si start/end remplis) | ❌ | `420` |
| 8 | Distance (km) | `distance_km` | Number (min:0, step:0.1) | ❌ | `0` |
| 9 | Transport | `transport_mode` | Select | ❌ | _(vide)_ |
| 10 | Catégorie | `category` | Select | ❌ | `hebergement` |
| 11 | Sous-types | `subtypes` | Multi-select (dynamique par catégorie) | ❌ | `gite` |
| 12 | Guide | `guide_id` / `guide_name` | GuideSearchInline | ❌ | _(pas de guide)_ |
| 13 | Coût guide | `guide_cost` | Number | ❌ | `0` |
| 14 | ID offre guide | `guide_offering_id` | String (auto depuis GuideSearchInline) | ❌ | _(id offre guide)_ |
| 15 | Prix facturé voyageur | `price` | Number | ❌ | `35` |
| 16 | Inclus dans le prix | `is_included` | Checkbox | ❌ | ☑ |
| 17 | Obligatoire | `is_required` | Checkbox | ❌ | ☐ |
| 18 | Photos | `photos` | ImageUploader (max 5) | ❌ | _(upload)_ |
| 19 | Référence externe | `external_reference` | ExternalOfferModal | ❌ | _(si offre externe)_ |
| 20 | is_external_reference | `is_external_reference` | Boolean (auto) | — | `false` |

#### Modes de transport disponibles

| Valeur | Label |
|--------|-------|
| _(vide)_ | Aucun |
| `Van` | 🚐 Van |
| `À pied` | 🥾 À pied |
| `Vélo` | 🚲 Vélo |
| `Chameau` | 🐪 Chameau |
| `Voiture` | 🚗 Voiture |
| `Kayak` | 🛶 Kayak |
| `Cheval` | 🐴 Cheval |
| `Bus` | 🚌 Bus |
| `Vol` | ✈️ Vol |
| `Barque` | 🚣 Barque |

#### Catégories et sous-types (10 catégories disponibles)

| Catégorie | Sous-types disponibles |
|-----------|----------------------|
| `sejour` | all_inclusive, demi_pension, pension_complete, sejour_luxe |
| `hebergement` | hotel, ecolodge, camping, gite |
| `activite` | randonnee, kayak, velo, visite, plage, observation, quad, plongee, equitation |
| `restauration` | petit_dejeuner, dejeuner, diner, degustation |
| `transport` | van, bus, bateau, vol |
| `atelier` | cuisine, yoga, musique, peinture |
| `guide_service` | guide_touristique, guide_nature, guide_culturel |
| `equipment_rental` | velo_location, kayak_location, surf_location, materiel_location |
| `evenement` | festival, conference, celebration, exposition |
| `artisanat` | poterie, tissage, bijouterie, product |

#### GuideSearchInline — Recherche de guide (même composant que création offre)

Le composant `GuideSearchInline` (GuideSearchInline.tsx) est le **même composant utilisé dans la création d'offre** (GuidedOfferWizard.tsx). Il recherche les guides via `GET /guide/search`.

**Comportement par défaut au chargement :**
1. La `zone` est **auto-remplie** depuis `dayLocation` (lieu du jour sélectionné) — ex: si le jour est à "Djerba", la zone = `Médenine` (région du circuit, fallback si pas de lieu du jour)
2. Si des coordonnées `lat`/`lng` du jour existent, une **recherche automatique par proximité** est lancée au montage du composant
3. Les résultats sont filtrés par **disponibilité à la date du jour** (`day.date`)

| Paramètre | Source | Description |
|-----------|--------|-------------|
| `q` | Champ texte | Nom du guide |
| `zone` | Select région (**auto-filtrée depuis `dayLocation`**) | Région du guide |
| `max_price` | Champ numérique | Prix maximum |
| `date` | `day.date` du jour parent | Disponibilité à la date |
| `lat` / `lng` | `day.lat` / `day.lng` du jour parent | Proximité géographique |

**Résultats affichés pour chaque guide :**
- Photo ou initiale
- Nom complet (`full_name`)
- Zone (`zone`) + rayon en km (`radius_km`)
- Prix (`price`) en TND/jour ou TND/personne + unité (`pricing_unit`)
- Langues parlées (`languages`)
- Disponibilité à la date demandée (badge vert "Disponible le XX")
- Score durabilité (`sustainability_score`) en %
- Lien vers le profil complet (`/profile/guide/{user_id}`)
- Bouton carte (affiche les guides sur une carte Leaflet si des coordonnées GPS existent)

**Exemple de résultat :**
```
👤 Karima Bouazizi
📍 Médenine · 📏 10km · 💰 50 TND/jour · 🗣️ Français, Anglais
✓ Disponible le 2026-08-20
🌿 85%
```

#### ExternalOfferModal — Sélection d'offre liée

Le modal `ExternalOfferModal` (ExternalOfferModal.tsx) propose **3 onglets** :

| Onglet | Description | Source |
|--------|-------------|--------|
| **Mes offres** | Offres du provider **filtrées par la catégorie sélectionnée** | `GET /offers/items/mine` → `findMyItems()` avec `category_slug` |
| **Offres externes** | Offres d'autres providers à proximité du lieu du jour, **filtrées par catégorie** | `GET /offers/public?lat=&lng=&radius_km=&category=&region=` |
| **Référence externe** | Saisie libre (sans offre liée) — si aucun provider ne propose ce service dans ce lieu | Formulaire |

**Onglet "Mes offres" :**
- Affiche **uniquement les offres correspondant à la catégorie sélectionnée** dans le program item (ex: si catégorie = "hebergement", seules les offres d'hébergement apparaissent)
- Le `category_slug` est envoyé par le backend via `GET /offers/items/mine` (champ ajouté à la réponse)
- Recherche par nom, titre d'offre, type d'élément
- Chaque élément affiche : nom, titre de l'offre, type, prix
- Cliquer → pré-remplit `linked_offer_item_id`

**Onglet "Offres externes" :**
- Recherche par localisation (lat/lng du jour) + rayon en km (défaut: 30km)
- Filtré par `category` (correspondant à la catégorie du program item)
- Filtré par `region` (région du circuit en fallback si pas de lieu du jour)
- Exclut les offres du provider courant (`exclude_author`)
- Affiche : nom, adresse/région, items avec prix

**Onglet "Référence externe" :**
- Utile quand **aucun provider** ne propose le service souhaité dans ce lieu
- Exemple : je veux un transfert Mahdia→Médenine mais aucun provider ne le propose → je référence externe
- Saisie libre : type de prestation, nom prestataire, contact, téléphone, prix estimé, adresse, coords GPS, site web, notes
- Stocké dans `external_reference` (pas de lien avec une offre plateforme)

**10 catégories disponibles pour les program items :**
Séjour, Hébergement, Activité, Restaurant, Transport, Atelier, Guide, Équipement, Événement, Artisanat

#### Données de test — Program items par jour

**Scénario réaliste — 3 jours, 3 lieux différents :**

| Jour | Lieu | Activité 1 (obligatoire) | Activité 2 |
|------|------|--------------------------|------------|
| 1 | Médenine | 🛏️ Dortoir **personnel** ("Mes offres") | 🛍️ Souk **créé directement** |
| 2 | Djerba | 🏨 Gîte **externe** (autre provider) | 🛶 Kayak avec **guide** (créé directement) |
| 3 | Mahdia | 🏖️ Plage **créée directement** | 🚐 Transfert **référence externe** |

**Règle** : Jours 1 et 2 = obligatoirement une activité hébergement (pour la nuit). Jour 3 = pas d'hébergement (dernier jour, retour).

---

**JOUR 1 — Médenine — Souk & Dortoir** (2026-08-20, Médenine)

**Activité 1 : Dortoir personnel** (onglet "Mes offres") — ⚠️ OBLIGATOIRE pour la nuit

| Champ | API Field | Valeur |
|-------|-----------|--------|
| Source | onglet | **Mes offres** — onglet 1 du ExternalOfferModal |
| Offre liée | `linked_offer_item_id` | `Dortoir Chez Ali Médenine` (offre personnelle — catégorie hébergement) |
| Titre | `title` | `Dortoir Chez Ali Médenine` |
| Description | `description` | `Dortoir 4 lits dans maison traditionnelle de Médenine, clim, petit-déj inclus` |
| Emoji | `emoji` | `🛏️` |
| Heure début | `start_time` | `15:00` |
| Heure fin | `end_time` | `22:00` |
| Durée (min) | `duration_minutes` | `420` |
| Distance | `distance_km` | _(vide — lieu fixe)_ |
| Transport | `transport_mode` | _(vide)_ |
| Catégorie | `category` | `hebergement` |
| Sous-types | `subtypes` | `["gite"]` |
| Guide | `guide_id` | `null` |
| Prix facturé | `price` | `35` TND (récupéré auto depuis l'offre) |
| Inclus | `is_included` | ☑ |
| Obligatoire | `is_required` | ☑ |

**Activité 2 : Souk de Médenine** (créée directement — pas d'offre liée)

| Champ | API Field | Valeur |
|-------|-----------|--------|
| Source | onglet | **Aucune offre liée** — activité créée directement |
| Offre liée | `linked_offer_item_id` | `null` |
| Titre | `title` | `Visite du Souk de Médenine` |
| Description | `description` | `Balade dans le souk traditionnel, épices, artisanat local, thé à la menthe` |
| Emoji | `emoji` | `🛍️` |
| Heure début | `start_time` | `10:00` |
| Heure fin | `end_time` | `12:30` |
| Durée (min) | `duration_minutes` | `150` |
| Distance | `distance_km` | `1` |
| Transport | `transport_mode` | `À pied` |
| Catégorie | `category` | `activite` |
| Sous-types | `subtypes` | `["visite"]` |
| Guide | `guide_id` | `null` |
| Prix facturé | `price` | `0` TND (gratuit) |
| Inclus | `is_included` | ☑ |
| Obligatoire | `is_required` | ☐ |

---

**JOUR 2 — Djerba — Kayak & Mangroves** (2026-08-21, Djerba)

**Activité 1 : Gîte externe** (onglet "Offres externes") — ⚠️ OBLIGATOIRE pour la nuit

| Champ | API Field | Valeur |
|-------|-----------|--------|
| Source | onglet | **Offres externes** — onglet 2 du ExternalOfferModal |
| Offre liée | `linked_offer_item_id` | `Gîte Erriadh` (offre d'un **autre provider** à Djerba — catégorie hébergement) |
| Titre | `title` | `Gîte Erriadh` |
| Description | `description` | `Gîte familial à Erriadh, ambiance authentique, dîner tunisien inclus` |
| Emoji | `emoji` | `🏡` |
| Heure début | `start_time` | `15:00` |
| Heure fin | `end_time` | `22:00` |
| Durée (min) | `duration_minutes` | `420` |
| Distance | `distance_km` | `80` (depuis Médenine) |
| Transport | `transport_mode` | `Voiture` |
| Catégorie | `category` | `hebergement` |
| Sous-types | `subtypes` | `["gite"]` |
| Guide | `guide_id` | `null` |
| Prix facturé | `price` | `40` TND (récupéré depuis l'offre externe) |
| Inclus | `is_included` | ☑ |
| Obligatoire | `is_required` | ☑ |

**Activité 2 : Kayak avec guide** (créée directement + guide)

| Champ | API Field | Valeur |
|-------|-----------|--------|
| Source | onglet | **Aucune offre liée** — activité créée directement, guide associé |
| Offre liée | `linked_offer_item_id` | `null` (je n'ai pas d'offre kayak, les autres providers non plus) |
| Titre | `title` | `Kayak Mangroves Djerba` |
| Description | `description` | `Balade en kayak 2h dans les mangroves, observation oiseaux, guide inclus` |
| Emoji | `emoji` | `🛶` |
| Heure début | `start_time` | `09:00` |
| Heure fin | `end_time` | `11:00` |
| Durée (min) | `duration_minutes` | `120` |
| Distance | `distance_km` | `5` |
| Transport | `transport_mode` | `Kayak` |
| Catégorie | `category` | `activite` |
| Sous-types | `subtypes` | `["kayak"]` |
| Guide | `guide_id` | `Ahmed Ben Salah` (GuideSearchInline — zone: Médenine, lieu: Djerba, date: 2026-08-21) |
| Coût guide | `guide_cost` | `45` TND |
| ID offre guide | `guide_offering_id` | `uuid-offre-guide-ahmed` (auto) |
| Prix facturé | `price` | `0` TND (coût guide géré séparément) |
| Inclus | `is_included` | ☑ |
| Obligatoire | `is_required` | ☑ |

---

**JOUR 3 — Mahdia — Plage & Retour** (2026-08-22, Mahdia)

**Activité 1 : Plage de Mahdia** (créée directement — pas d'hébergement car dernier jour)

| Champ | API Field | Valeur |
|-------|-----------|--------|
| Source | onglet | **Aucune offre liée** — activité créée directement |
| Offre liée | `linked_offer_item_id` | `null` |
| Titre | `title` | `Plage de Mahdia` |
| Description | `description` | `Matinée détente sur la plage de Mahdia, baignade, déjeuner poisson frais` |
| Emoji | `emoji` | `🏖️` |
| Heure début | `start_time` | `08:00` |
| Heure fin | `end_time` | `13:00` |
| Durée (min) | `duration_minutes` | `300` |
| Distance | `distance_km` | `90` (depuis Djerba) |
| Transport | `transport_mode` | `Voiture` |
| Catégorie | `category` | `activite` |
| Sous-types | `subtypes` | `["plage"]` |
| Guide | `guide_id` | `null` |
| Prix facturé | `price` | `0` TND (gratuit) |
| Inclus | `is_included` | ☑ |
| Obligatoire | `is_required` | ☐ |

**Activité 2 : Transfert retour** (onglet "Référence externe")

| Champ | API Field | Valeur |
|-------|-----------|--------|
| Source | onglet | **Référence externe** — onglet 3 (aucun provider ne propose ce trajet) |
| Offre liée | `linked_offer_item_id` | `null` |
| Référence externe | `external_reference` | `{ type: "transport", provider_name: "Mahdia Transport", contact_name: "Sami", phone: "+216 XX XXX XXX", estimated_price: 80, address: "Mahdia → Médenine" }` |
| Titre | `title` | `Retour Mahdia → Médenine` |
| Description | `description` | `Transfert privé Mahdia vers Médenine, véhicule climatisé` |
| Emoji | `emoji` | `🚐` |
| Heure début | `start_time` | `14:00` |
| Heure fin | `end_time` | `16:30` |
| Durée (min) | `duration_minutes` | `150` |
| Distance | `distance_km` | `130` |
| Transport | `transport_mode` | `Voiture` |
| Catégorie | `category` | `transport` |
| Sous-types | `subtypes` | `["van"]` |
| Guide | `guide_id` | `null` |
| Prix facturé | `price` | `80` TND (saisi manuellement — pas d'offre plateforme) |
| Inclus | `is_included` | ☑ |
| Obligatoire | `is_required` | ☑ |

---

### 8.4 Étape 4/6 — Itinéraire carte (CircuitBuilderWizard.tsx:1007-1087)

#### Comportement

- Onglets colorés par jour (couleurs : vert, bleu, orange, rouge, violet, rose, teal, orange)
- Sélection d'un jour → affichage de la carte Leaflet pour ce jour
- `LocationSearch` : recherche de lieu + ajout de waypoints
- `PolylineDrawer` : tracé interactif sur la carte avec anchors (destinations verrouillées depuis étape 2) et waypoints éditables
- Point de départ du circuit (rendez-vous) avec adresse et coordonnées auto-remplies

#### Champs

| # | Champ | API Field | Type | Obligatoire | Valeur test |
|---|-------|-----------|------|-------------|-------------|
| 1 | Point de départ (rendez-vous) | `address` | Text | ❌ | `Médenine, Tunisie` |
| 2 | Latitude | `lat` | Number (auto-rempli par carte) | — | `33.8443` |
| 3 | Longitude | `lng` | Number (auto-rempli par carte) | — | `10.4989` |
| 4 | Étapes par jour | `waypoints` | PolylineDrawer (JSON array de [lat,lng]) | ❌ | `[[33.8443,10.4989],[33.8756,10.8585],[35.5047,11.0622]]` |

#### Points d'ancrage (anchors)

Chaque jour avec `lat`/`lng` non-null devient un anchor (point verrouillé sur la carte). Les waypoints ajoutés par l'utilisateur sont des points éditables entre les anchors.

#### Données de test — Itinéraire

| Jour | Waypoints ajoutés |
|------|-------------------|
| Jour 1 (Médenine) | _(pas de waypoints supplémentaires — lieu = Médenine)_ |
| Jour 2 (Djerba) | `[[33.8200, 10.8700]]` (vers Erriadh — kayaking mangroves) |
| Jour 3 (Mahdia) | `[[35.5047, 11.0622]]` (vers plage de Mahdia) |

---

### 8.5 Étape 5/6 — Disponibilité, Tarifs & Options (CircuitBuilderWizard.tsx:1090-1418)

#### 8.5.1 Disponibilité

| # | Champ | API Field | Type | Valeur test |
|---|-------|-----------|------|-------------|
| 1 | Mode de disponibilité | `availability.mode` | Select (5 modes) | `specific` |
| 2 | Dates spécifiques | `availability.specific_dates` | Date picker (ajout multiple) | `2026-08-20` |
| 3 | Jours de la semaine | `availability.weekdays` | Checkboxes (0=Lun → 6=Dim) | _(si mode weekly)_ |
| 4 | Date début période | `availability.avail_start` | Date (si mode period) | _(si mode period)_ |
| 5 | Date fin période | `availability.avail_end` | Date (si mode period) | _(si mode period)_ |
| 6 | Saison | `availability.saisons` | Select (printemps/été/automne/hiver) | _(si mode season)_ |
| 7 | Créneau début | `availability.heure_debut` | Time | `09:00` |
| 8 | Créneau fin | `availability.heure_fin` | Time | `17:00` |
| 9 | Délai de réponse | `availability.delai_reponse` | Number (heures, si confirmation manuelle) | _(si manual)_ |

**Modes disponibles :**

| Mode | Label | Description |
|------|-------|-------------|
| `specific` | 📌 Dates spécifiques | Sélection manuelle de dates précises |
| `weekly` | 🔁 Récurrence hebdomadaire | Mêmes jours chaque semaine |
| `period` | 📅 Période ouverte | Disponible du … au … |
| `season` | 🌤️ Saison complète | Disponible toute une saison |
| `on_demand` | 💬 Sur demande | Vous confirmez après contact |

---

#### 8.5.2 Hébergement

| # | Champ | API Field | Type | Valeur test |
|---|-------|-----------|------|-------------|
| 1 | Hébergement inclus | `hebergement.inclus` | Toggle (boolean) | ☑ |
| 2 | Type séjour | `hebergement.type` | Select (same/per_day) | `same` |
| 3 | Type hébergement | `hebergement.accom_type` | Select (chambre/dortoir/tente) | `chambre` |
| 4 | Nombre d'unités | `hebergement.nb_unites` | Number (min:1) | `1` |
| 5 | Lits/unité (ou capacité/tente) | `hebergement.nb_lits` | Number (min:1) | `2` |
| 6 | Source tarification | `hebergement.price_source` | Select (own/other/external) | `own` |
| 7 | Prix par nuit | `hebergement.prix_nuit` | Number | `85` |
| 8 | Prix achat (si other) | `hebergement.prix_achat` | Number | _(si other)_ |
| 9 | Nom prestataire (si external) | `hebergement.prestataire` | Text | _(si external)_ |

**Sources de tarification :**

| Source | Label | Description |
|--------|-------|-------------|
| `own` | 🏠 Mon hébergement | C'est chez moi (auto-rempli depuis mes offres) |
| `other` | 🤝 Autre propriétaire | Je loue via la plateforme (ExternalOfferItemSearch) |
| `external` | 🏨 Externe | Hôtel/agence hors plateforme |

**Logique :** Si `hebergement.type === "per_day"`, message informatif : "Configurez l'hébergement par journée dans les détails du circuit."

---

#### 8.5.3 Tarification

| # | Champ | API Field | Type | Valeur test |
|---|-------|-----------|------|-------------|
| 1 | Prix de base | `base_price` | Number (min:0, step:0.01) | `120` |
| 2 | Participants max | `max_participants` | Number (min:1) | `10` |
| 3 | Délai réservation (jours) | `booking_deadline_days` | Number (min:0) | `3` |
| 4 | Mode de confirmation | `confirmation_mode` | Select (automatic/manual) | `automatic` |
| 5 | Délai de réponse (heures) | `availDelaiReponse` | Number (si confirmation manuelle) | _(si manual)_ |

**Note :** Un prix suggéré (somme des activités inclues + hébergement) est calculé automatiquement et proposé si le champ prix est vide. Par ex: Dortoir Médenine (35) + Souk (0) + Gîte Djerba (40) + Kayak (45) + Plage (0) + Transfert (0) = **120 TND**.

---

#### 8.5.4 Inclus / Non inclus

| # | Champ | API Field | Type | Valeur test |
|---|-------|-----------|------|-------------|
| 1 | Inclus | `inclusions` | Textarea (2 rows) | `Hébergement, guide, transport, activités` |
| 2 | Non inclus | `exclusions` | Textarea (2 rows) | `Repas du midi, boissons, activités optionnelles` |

---

#### 8.5.5 Options supplémentaires

Les options sont des **suppléments payants** que le voyageur peut ajouter au circuit de base.

| # | Champ | API Field | Type | Valeur test |
|---|-------|-----------|------|-------------|
| 1 | Groupe | `option_group` | Select (transport/accommodation/equipment/activity/food) | `transport` |
| 2 | Type | `option_type` | Select (single_choice/multiple_choice/quantity) | `single_choice` |
| 3 | Prix supplémentaire | `extra_price` | Number (min:0, step:0.01) | `30` |
| 4 | Inclus | `is_included` | Checkbox | ☐ |
| 5 | Requis | `is_required` | Checkbox | ☐ |
| 6 | Offre externe liée | `external_offer_item_id` | ExternalOfferSearch (si group=accommodation/food/transport) | _(optionnel)_ |

**Groupes d'options :**

| Groupe | Label |
|--------|-------|
| `transport` | Transport |
| `accommodation` | Hébergement |
| `equipment` | Équipement |
| `activity` | Activité |
| `food` | Repas |

---

### 8.6 Étape 6/6 — Aperçu (CircuitBuilderWizard.tsx:1422-1468)

Résumé visuel affichant :
- Première image + titre + prix
- Région, durée, participants max, mode confirmation
- Description
- Itinéraire jour par jour (titre + lieu + activités)
- Liste des options

---

### 8.7 Soumission — Données envoyées au backend

#### POST /circuits (corps principal)

```json
{
  "title": "Circuit Tunisie du Sud 3 jours",
  "description": "De Médenine à Mahdia via Djerba : dortoirs, musique, kayak et plages",
  "region": "Médenine",
  "duration_days": 3,
  "duration_nights": 2,
  "base_price": 120,
  "currency": "TND",
  "max_participants": 10,
  "booking_deadline_days": 3,
  "confirmation_mode": "manual",
  "difficulty_level": "easy",
  "inclusions": "Hébergement, guide, transport, activités",
  "exclusions": "Repas du midi, boissons, activities optionnelles",
  "images": ["https://..."],
  "lat": 33.8443,
  "lng": 10.4989,
  "address": "Médenine, Tunisie",
  "start_date": "2026-08-20",
  "end_date": "2026-08-22",
  "waypoints": "[[33.8443,10.4989],[33.8756,10.8585],[35.5047,11.0622]]",
  "availability": {
    "mode": "specific",
    "specific_dates": ["2026-08-20"],
    "heure_debut": "09:00",
    "heure_fin": "17:00"
  },
  "hebergement": {
    "inclus": true,
    "type": "per_day",
    "accom_type": "chambre",
    "nb_unites": 1,
    "nb_lits": 2,
    "price_source": "own",
    "prix_nuit": 0
  }
}
```

#### POST /circuits/{id}/days (par jour)

```json
{
  "day_number": 1,
  "title": "Médenine — Souk & Dortoir",
  "description": "Visite du souk, nuit chez l'habitant",
  "date": "2026-08-20",
  "lat": 33.8443,
  "lng": 10.4989,
  "location_name": "Médenine"
}
```

#### POST /circuits/{id}/days/{dayId}/program (par programme)

```json
{
  "title": "Dortoir Chez Ali Médenine",
  "description": "Dortoir 4 lits dans maison traditionnelle de Médenine, clim, petit-déj inclus",
  "start_time": "15:00",
  "end_time": "22:00",
  "is_included": true,
  "is_required": true,
  "linked_offer_item_id": "uuid-offre-dortoir-ali",
  "emoji": "🛏️",
  "duration_minutes": 420,
  "distance_km": 0,
  "transport_mode": null,
  "guide_id": null,
  "category": "hebergement",
  "subtypes": ["gite"],
  "price": 35,
  "fields": {
    "guide_cost": 0,
    "guide_offering_id": null
  },
  "external_reference": null,
  "is_external_reference": false
}
```

#### POST /circuits/{id}/options (par option)

```json
{
  "option_group": "transport",
  "option_type": "single_choice",
  "extra_price": 30,
  "is_included": false,
  "is_required": false,
  "offer_item_id": null
}
```

---

### 8.8 Résumé — Nombre de champs par étape

| Étape | Champs obligatoires | Champs optionnels | Total |
|-------|--------------------|--------------------|-------|
| 1 — Général | 2 (title, duration_days) | 8 | 10 |
| 2 — Jours | 0 (title requis à la soumission) | 5 par jour | 5 × N jours |
| 3 — Activités | 0 (title requis à la soumission) | 20 par activité | 20 × N activités |
| 4 — Itinéraire | 0 | 4 | 4 |
| 5 — Tarifs & Options | 0 | ~20 (dispo + hébergement + tarifs + options) | ~20 |
| 6 — Aperçu | 0 | 0 (lecture seule) | 0 |
| **Total** | **2** | **~50+** | **~52+** |

---

## 9. Réservations — Éco-voyageur

### 9.1 Réservation Offre (offer)
| Champ | Valeur |
|-------|--------|
| Offre | `Suite Éco-Lodge Vue Mer` |
| Date | `2026-08-15` |
| Nombre de participants | `2` |
| Prix total | `170` TND |

### 9.2 Réservation Circuit
| Champ | Valeur |
|-------|--------|
| Circuit | `Circuit Tunisie du Sud 3 jours` |
| Date de début | `2026-08-20` |
| Nombre de participants | `2` |
| Prix total | `240` TND |

---

## 10. Confirmation — Provider

- Provider confirme la réservation de l'offre `Suite Éco-Lodge Vue Mer`
- Statut passe de `pending` → `confirmed`

---

## 11. Trip Plan — Éco-voyageur

### 11.1 Trip Plan
| Champ | Valeur |
|-------|--------|
| Nom | `Voyage Djerba Août 2026` |
| Dates | `15 août — 23 août 2026` |
| Budget | `800` TND |

### 11.2 Jours
| Jour | Activité | Lieu |
|------|----------|------|
| 15 août | Arrivée, check-in | Dar Djerba Eco-Lodge |
| 16 août | Randonnée Île de Djerba | Djerba |
| 17 août | Atelier Céramique | Le Jardin de Djerba |
| 18 août | Journée libre | Djerba |
| 19 août | Circuit Éco-Tour Jour 1 | Djerba |
| 20 août | Circuit Éco-Tour Jour 2 | Djerba |
| 21 août | Circuit Éco-Tour Jour 3 | Djerba |
| 22 août | Journée libre | Djerba |
| 23 août | Départ | Aéroport Djerba |

---

## 12. Résumé des comptes

| Rôle | Email | Mot de passe | Nom |
|------|-------|--------------|-----|
| Provider | `fakerbennoomen@gmail.com` | `Aa17092001` | Ahmed Benali |
| Guide | `fakerbennoomen+2@gmail.com` | `Aa17092001` | Karima Bouazizi |
| Éco-voyageur | `fakerbennoomen+3@gmail.com` | `Aa17092001` | Sarra Khelifi |
| `opening_hours` | Optionnel — peut être ajouté plus tard |

---

## 6. Cas de test — Inscription

| Test | Description | Résultat |
|------|-------------|----------|
| T1 | Soumettre formulaire vide | ❌ Bloqué — messages d'erreur sur chaque champ requis |
| T2 | Email invalide (`test@`) | ❌ Bloqué — "Adresse email invalide" |
| T3 | Mot de passe < 8 caractères (`Ab1`) | ❌ Bloqué — "Le mot de passe doit contenir au moins 8 caractères" |
| T4 | Mot de passe sans majuscule (`abcdefg1`) | ❌ Bloqué — "Le mot de passe doit contenir au moins une lettre majuscule" |
| T5 | Mot de passe sans minuscule (`ABCDEFG1`) | ❌ Bloqué — "Le mot de passe doit contenir au moins une lettre minuscule" |
| T6 | Mot de passe valide (`Provider1`) | ✅ Accepté |
| T7 | Confirmation != mot de passe | ❌ Bloqué — "Les mots de passe ne correspondent pas" |
| T8 | Conditions non cochées | ❌ Bloqué — message d'erreur sous la checkbox |
| T9 | Tous champs valides + conditions cochées | ✅ Soumission acceptée |

---

## 7. Cas de test — Onboarding Provider

| Test | Description | Résultat |
|------|-------------|----------|
| T10 | Step 1 — `full_name` obligatoire vide | ❌ Bloqué — "Veuillez compléter les champs obligatoires" |
| T11 | Step 1 — Pays et langue non sélectionnés | ❌ Bloqué |
| T12 | Step 1 — Tous champs valides → POST profile | ✅ 200 OK |
| T13 | Step 2 — Tous les champs remplis | ✅ Accepté |
| T14 | Step 2 — Champs vides (optionnels) | ✅ Accepté |
| T15 | POST `/api/providers/profile` — tous champs envoyés | ✅ 200 OK |
| T16 | POST `/api/providers/profile` — champ inconnu envoyé | ❌ 400 Bad Request |

---

## 8. Données de test — Provider (complètes)

### 8.1 Inscription
| Champ | Valeur |
|-------|--------|
| Type de compte | `Fournisseur de services` |
| Email | `fakerbennoomen@gmail.com` |
| Mot de passe | `Aa17092001` |
| Confirmation | `Aa17092001` |
| Conditions | ☑ coché |

### 8.2 Onboarding — Étape 1 : Identité
| Champ | Valeur |
|-------|--------|
| Nom complet | `Ahmed Benali` |
| Présentation | `Chef d'entreprise touristique basé à Djerba, passionné d'écotourisme` |
| Pays | `Tunisie` |
| Langue | `Français` |

### 8.3 Onboarding — Étape 2 : Activité & Contact
| Champ | Valeur | API Field |
|-------|--------|-----------|
| Entreprise / Structure | `Dar Djerba Eco-Lodge` | `organization` |
| Votre poste | `Directeur` | `position` |
| Téléphone | `+216 75 123 456` | `phone` |
| WhatsApp | `+216 75 123 456` | `whatsapp` |
| Site web | `https://nardardjerba.tn` | `website` |
| Facebook | `https://facebook.com/nardardjerba.tn` | `facebook` |
| Instagram | `@nardardjerba` | `instagram` |
| TikTok | `@nardardjerba` | `tiktok` |
| Ville | `Djerba` | `city` |
| Région | `Médenine` | `region` |
| Années d'expérience | `4` | `years_experience` |

---

## 9. Données de test — Guide

### 9.1 Inscription
| Champ | Valeur |
|-------|--------|
| Type de compte | `Guide local` |
| Email | `fakerbennoomen+2@gmail.com` |
| Mot de passe | `Aa17092001` |

### 9.2 Onboarding
| Champ | Valeur |
|-------|--------|
| Nom complet | `Karima Bouazizi` |
| Présentation | `Guide touristique certifié, spécialisé randonnée et nature` |

---

## 10. Données de test — Éco-voyageur

### 10.1 Inscription
| Champ | Valeur |
|-------|--------|
| Type de compte | `Éco-voyageur` |
| Email | `traveler@test.com` |
| Mot de passe | `Traveler1` |

### 10.2 Onboarding
| Champ | Valeur |
|-------|--------|
| Nom complet | `Sarah Mansouri` |
| Présentation | `Voyageuse passionnée, à la découverte de la Tunisie authentique` |
| Types de voyage | `Aventure`, `Nature` |
| Valeurs éco | `Respect environnement`, `Tourisme local` |

---

## 11. Validation côté serveur (API)

| Test | Endpoint | Description | Résultat |
|------|----------|-------------|----------|
| T17 | `POST /api/auth/register` | Email déjà existant | `409 Conflict` |
| T18 | `POST /api/auth/register` | Mot de passe faible | `400 Bad Request` |
| T19 | `POST /api/auth/register` | Type de compte invalide | `400 Bad Request` |
| T20 | `POST /api/providers/profile` | Tous les champs acceptés | ✅ `200 OK` |
| T21 | `POST /api/providers/profile` | Champs manquants (optionnels) | ✅ `200 OK` |
| T22 | `POST /api/providers/profile` | Champ inconnu envoyé | ❌ `400 Bad Request` |

---

## 12. Comportement après inscription

| Test | Description | Résultat |
|------|-------------|----------|
| T23 | Redirection automatique vers onboarding | ✅ Chaque rôle redirigé vers `/onboarding/{role}` |
| T24 | JWT token généré et stocké | ✅ Token présent dans cookies/localStorage |
| T25 | Accès au dashboard sans onboarding terminé | ✅ Redirigé vers onboarding |
| T26 | Double inscription même email | ❌ Bloqué — 409 |

---

## 13. Sécurité

| Test | Description | Résultat |
|------|-------------|----------|
| T27 | Mot de passe hashé en base (bcrypt) | ✅ colonne `password` contient un hash bcrypt |
| T28 | Pas de mot de passe en réponse API | ✅ champ `password` absent du JSON |
| T29 | SQL injection dans email | ❌ Bloqué — validation DTO |
| T30 | XSS dans champ nom | ❌ Bloqué — échappement côté client |

---

## 14. Résumé

| Métrique | Valeur |
|----------|--------|
| Total tests | 30 |
| Réussis | 30 |
| Échoués | 0 |
| Taux de réussite | **100%** |

---

## 15. Bug corrigé

| Bug | Description | Fix |
|-----|-------------|-----|
| `POST /api/providers/profile` 400 Bad Request | Le DTO `CompleteOwnerProfileDto` ne contenait que 9 champs. Le frontend envoyait 8 champs supplémentaires (whatsapp, website, facebook, instagram, tiktok, city, region, years_experience) rejetés par class-validator. | Ajout des 8 champs manquants au DTO + mise à jour du service `completeProfile()`. |

---

## 16. Différences avec Maram's version

| Fonctionnalité | Notre version | Maram's version |
|----------------|---------------|-----------------|
| Nombre d'étapes | 2 | 4 |
| Champ `address` | ❌ Non | ✅ Oui |
| Champ `gps_lat` / `gps_lng` | ❌ Non | ✅ Oui (MapPicker Leaflet) |
| Champ `email` (pro) | ❌ Non | ✅ Oui |
| Certifications personnelles | ❌ Non | ✅ Oui |
| Labels & certifications org | ❌ Non | ✅ Oui |
| Activités primaire/secondaire | ❌ Non | ✅ Oui |
| Histoire & origine | ❌ Non | ✅ Oui |
| Photos de présentation | ❌ Non | ✅ Oui |
| Vidéos | ❌ Non | ✅ Oui |
| Gouvernorat (24) | ❌ Non (texte libre) | ✅ Oui (select 24 gouvernorats) |

> Notre version est **simplifiée**. Les champs manquants peuvent être ajoutés plus tard depuis le dashboard.

---

## 17. Écrans de test

| État | Description |
|------|-------------|
| ✅ | Formulaire inscription — validation côté client |
| ✅ | Inscription provider — redirection onboarding |
| ✅ | Onboarding Step 1 — identité remplie |
| ✅ | Onboarding Step 2 — établissement + contacts remplis |
| ✅ | POST profile — tous champs acceptés (après fix) |
| ✅ | Dashboard provider chargé après onboarding |

# Éco-Voyage - Plateforme de Tourisme Durable

## 🌍 Présentation

**Éco-Voyage** est une plateforme web de **tourisme durable / éco-tourisme** qui connecte trois types d'acteurs :

- Les **voyageurs éco-responsables** (Écovoyageurs)
- Les **guides locaux et professionnels**
- Les **propriétaires de projets éco-touristiques** (hébergements, restaurants, agences, artisanat, centres de loisir)

L'objectif est de promouvoir un tourisme respectueux de l'environnement via un système de **score de durabilité** et de **badges** gamifiant l'engagement écologique.

---

## 🏗️ Architecture Technique

### Stack Complète

| Couche | Technologie | Version | Usage |
|--------|-------------|---------|-------|
| **Backend** | NestJS | ^11.1.16 | Framework Node.js (modulaire, TypeScript) |
| **Frontend** | Next.js | 16.2.1 | React avec App Router, Server Components |
| **Base relationnelle** | PostgreSQL | 15 | Données transactionnelles (TypeORM) |
| **Base NoSQL** | MongoDB | 7 | Données flexibles, préférences, engagement |
| **Authentification** | JWT + Passport | @nestjs/jwt ^11 | Sessions sécurisées, Google OAuth2 |
| **Conteneurisation** | Docker Compose | - | 4 services réseau interne |
| **Stockage images** | Cloudinary | - | Upload cloud, CDN intégré |
| **Styling** | Tailwind CSS | ^4.2.2 | Utility-first CSS |
| **Cartographie** | Leaflet / OSM | - | Cartes interactives sans clé API payante |

### Infrastructure Docker

```
┌──────────────────────────────────────────────────────────────┐
│  Docker Compose                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  ┌──────┐ │
│  │ PostgreSQL 15 │  │  MongoDB 7   │  │ NestJS    │  │Next.js│ │
│  │  (relationnel)│  │  (NoSQL)     │  │ API:3003  │  │:3004  │ │
│  └──────────────┘  └──────────────┘  └─────┬─────┘  └──┬───┘ │
│         ▲                  ▲               │            │      │
│         │                  │               │  HTTP API  │      │
│         └──────────────────┴───────────────┘────────────┘      │
│                    réseau interne tourisme_net                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Fonctionnalités Principales

### 1. Système Multi-Rôle

| Rôle | Description | Fonctionnalités |
|------|-------------|-----------------|
| **Éco-Voyageur** | Voyageur éco-responsable | Parcours offres, création de plans, réservations, publications, messagerie |
| **Guide** | Guide local ou professionnel | Création d'offres, gestion des réservations, circuits, onboarding |
| **Propriétaire** | Porteur de projet éco-touristique | Gestion de projets (1:N), offres, circuits, statistiques |
| **Admin** | Administrateur plateforme | Modération, validation, gestion utilisateurs |

### 2. Système de Score de Durabilité (AFRATIM)

```
Score Final = Questionnaire × 20% + Réservations × 40% + Feedbacks × 20% + Partages × 20%
```

| Score | Label | Niveau |
|-------|-------|--------|
| ≥ 80 | Ambassadeur durable | Niveau 5 |
| ≥ 60 | Écovoyageur engagé | Niveau 4 |
| ≥ 40 | Voyageur sensible | Niveau 3 |
| < 40 | Voyageur classique | Niveau 1 |

### 3. Gestion des Offres Éco-Touristiques

**12 catégories d'offres supportées :**

| Catégorie | Description |
|-----------|-------------|
| 🏕️ Hébergement | Chambres, camping, éco-lodges, suites, bungalows |
| 🥾 Activités | Randonnées, kayak, ateliers, observation faune |
| 🍽️ Restauration | Restaurants éco-responsables, cuisine traditionnelle |
| 🎨 Artisanat | Ateliers poterie, tissage, produits locaux |
| 🚐 Transport | Navettes, transferts, location vélo |
| 🧭 Service guide | Guide touristique local |
| 🎿 Location équipement | Vélo, kayak, matériel outdoor |
| 🎪 Événements | Festival, spectacle, conférence |
| 🗺️ Circuit | Circuit multi-jours organisé |
| 🌴 Séjour | Forfait hébergement + activités |
| 🌿 Éco-Tour | Tourisme durable et responsable |

**40+ schemas dynamiques** dans `offer-schema.ts` (randonnée, kayak, VTT, yoga, escalade, chambre, dortoir, tente glamping, suite, bungalow, éco-lodge, restaurant, atelier poterie/cuisine/tissage/musique, transport, circuit nature/culturel, etc.)

### 4. Circuits Multi-Jours

**6 étapes du CircuitBuilderWizard :**
1. **Général** — Titre, description, région, durée, difficulté, images
2. **Jours** — Organisation jour par jour avec carte GPS
3. **Activités** — 4 types : propre offre, offre externe, guide, référence externe
4. **Itinéraire** — Carte interactive avec polylineDrawer
5. **Tarifs & Options** — Disponibilité, hébergement, pricing, options
6. **Aperçu** — Preview avant publication

**Logique des 4 types d'activités :**

| Type | Composant | Statut |
|------|-----------|--------|
| **Ma propre offre** | ExternalOfferModal (onglet "Mes offres") | ✅ Fonctionnel |
| **Offre externe** | ExternalOfferModal (onglet "Offres externes") | ✅ Fonctionnel |
| **Guide** | GuideSearchInline | ⚠️ Partiel (offre non auto-liée) |
| **Prestataire externe** | ExternalOfferModal (onglet "Référence externe") | ⚠️ Non branché |

**Logique de tarification :**
- Prix catalogue (référence immuable) vs Prix circuit (copie indépendante, modifiable)
- Auto-pré-remplissage depuis les offres personnelles

### 5. Panier de Voyage (TravelCart)

```
Explorer → Panier → Trip Plan → Réservation
```

- Panier temporaire avec ajout en un clic depuis la carte
- Conversion en TripPlan structuré avec dates et programme
- Réservation groupée en une seule action

### 6. Fonctionnalités Sociales

- **Publications** : Lieux et expériences avec likes/commentaires
- **Messagerie privée** : Communication entre utilisateurs
- **Système de Follow** : Abonnements entre utilisateurs
- **Avis et notes** : Feedback avec photos (1-5 étoiles)
- **Favoris** : Sauvegarde d'offres et circuits

### 7. Cartographie Interactive

- OpenStreetMap + Leaflet pour l'affichage
- Nominatim pour le reverse geocoding
- Turf.js pour les calculs géospatiaux
- Marqueurs par type d'activité
- Carte de chaleur (Heatmap) pour les zones populaires

---

## 📊 Base de Données

### PostgreSQL (Données relationnelles - 43+ entités)

```
users                    (auth, rôles, status, tokens)
  ├── eco_travelers      (profils voyageurs, scores, préférences)
  ├── guides             (profils guides, spécialités, expérience)
  └── project_owners     (profils propriétaires, organisation)
       └── projects      (projets éco-touristiques CRUD — 1:N)

offers                    (offres éco-touristiques, status pending/approved)
  ├── offer_items          (éléments vendables)
  │   ├── offer_item_prices     (prix par catégorie)
  │   ├── offer_item_sessions   (créneaux datés)
  │   └── offer_item_capacities (capacité restante)

circuits                  (circuits multi-jours, GPS, images)
  ├── circuit_days         (jours du circuit)
  │   └── circuit_program_items (activités — linked_offer_item_id, guide_id, external_reference)
  ├── circuit_options      (options additionnelles)
  └── circuit_reservations (réservations de circuits)

bookings                  (réservations, prix calculé serveur)
  └── booking_participants (individus dans une réservation)

trip_plans                (plans de voyage)
  └── trip_plan_items      (items: offer_item_id XOR circuit_id)
```

### MongoDB (Données NoSQL - 6 collections)

| Collection | Usage |
|-----------|-------|
| `traveler_preferences` | Préférences voyageur (intérêts, activités, objectifs) |
| `traveler_engagement` | Engagement voyageur (score, badges, stats) |
| `guide_skills` | Compétences guide (activités, certifications) |
| `guide_engagement` | Engagement guide (score, badges, stats) |
| `project_services` | Services des projets éco (offerts, pratiques) |
| `user_stats` | Statistiques utilisateur |

---

## 📁 Structure du Projet

```
tourisme/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/              # Authentification (JWT, Google OAuth)
│   │   ├── users/             # Gestion utilisateurs
│   │   ├── eco-traveler/      # Profils voyageurs
│   │   ├── guide/             # Profils guides
│   │   ├── project-owner/     # Profils propriétaires + CRUD projets
│   │   ├── offer/             # Offres éco-touristiques (40+ schemas)
│   │   ├── booking/           # Réservations
│   │   ├── circuit/           # Circuits multi-jours
│   │   ├── trip-plan/         # Plans de voyage
│   │   ├── notification/      # Notifications
│   │   ├── questionnaire/     # QCM durabilité
│   │   ├── publication/       # Publications sociales
│   │   ├── messages/          # Messagerie privée
│   │   ├── follow/            # Système d'abonnement
│   │   ├── reports/           # Signalements
│   │   ├── admin/             # Panneau admin
│   │   ├── upload/            # Upload Cloudinary
│   │   ├── mail/              # Envoi emails
│   │   └── common/            # Guards, décorateurs, enums
│   └── test/
├── frontend/                   # Next.js Frontend
│   ├── app/                   # App Router
│   │   ├── (auth)/           # Pages authentification
│   │   ├── onboarding/        # Onboarding par rôle
│   │   ├── dashboard/        # Tableaux de bord
│   │   ├── offers/           # Catalogue destinations
│   │   ├── circuits/          # Circuits touristiques
│   │   ├── trip-plans/       # Plans de voyage
│   │   ├── reservations/     # Réservations
│   │   ├── notifications/    # Notifications
│   │   ├── profile/          # Profils publics
│   │   └── admin/           # Admin panel
│   ├── components/           # Composants React
│   │   ├── CircuitBuilderWizard.tsx    # Wizard circuit 6 étapes
│   │   ├── GuidedOfferWizard.tsx       # Wizard offre 9 étapes
│   │   ├── ExternalOfferModal.tsx      # 3 onglets (propre/externe/référence)
│   │   ├── GuideSearchInline.tsx       # Recherche guides avec carte
│   │   ├── OfferItemSearchInline.tsx   # Recherche items offre
│   │   └── map/              # Composants Leaflet
│   └── lib/
│       ├── offer-schema.ts   # 40+ schemas d'offres dynamiques
│       ├── offer-config.ts   # Mapping project_type → offers
│       ├── offer-rules.ts    # Règles métier (location, guide)
│       └── offer-taxonomy.ts # Taxonomies hiérarchiques
├── docs/                     # Documentation
├── scripts/                  # Seeds SQL
├── docker-compose.yml        # Configuration Docker
└── README.md               # Ce fichier
```

---

## 🔧 API Endpoints Principaux

### Authentification
```
POST   /api/auth/register          POST   /api/auth/forgot-password
POST   /api/auth/login             GET    /api/auth/google
POST   /api/auth/refresh
```

### Offres
```
POST   /api/offers                GET    /api/offers/public?region=&category=
GET    /api/offers/mine           GET    /api/offers/items/mine
PATCH  /api/offers/:id            GET    /api/offers/:id/items
```

### Circuits
```
POST   /api/circuits                    POST   /api/circuits/:id/days
GET    /api/circuits                    POST   /api/circuits/:id/days/:dayId/program
GET    /api/circuits/:id                POST   /api/circuits/:id/options
POST   /api/circuits/:id/reserve
```

### Réservations
```
POST   /api/bookings                GET    /api/bookings/mine
GET    /api/bookings/incoming      PATCH  /api/bookings/:id/confirm
PATCH  /api/bookings/:id/cancel
```

### Panier & Plans
```
GET    /api/travel-carts/me        POST   /api/travel-carts/:id/items
POST   /api/travel-carts/:id/convert  POST   /api/trip-plans
```

### Guide Search
```
GET    /api/guide/search?q=&zone=&max_price=&lat=&lng=&date=
GET    /api/guide/public/search?q=&date=
```

---

## 🚀 Démarrage

```bash
# Cloner et lancer
git clone <repository-url> && cd tourisme
docker network create tourisme_net
docker compose up -d

# Frontend: http://localhost:3004
# Backend:  http://localhost:3003/api
```

---

## 📊 Capacités du Système de Schemas

Notre système de **schemas configurables** (`offer-schema.ts`) est le cœur métier de la plateforme. Chaque type d'offre a un schéma décrivant :
- Les **sections** du formulaire (Informations, Parcours, Groupe, Équipement, Inclus...)
- Les **champs** avec leur type (text, number, select, multiselect, boolean, time, file, hierarchy)
- Les **conditions d'affichage** (`conditionalOn`)
- La **configuration d'affichage** (cardFields, filterable)

**Exemples de schemas :**

| Catégorie | Schemas disponibles |
|-----------|-------------------|
| Hébergement | room, bed, camping_space, suite, bungalow, ecolodge |
| Activités | randonnee, kayak, vtt, yoga, escalade, equitation, observation, meditation, photographie, guided_tour, other |
| Restaurant | menu, dish |
| Atelier | poterie, cuisine, tissage, musique, other |
| Transport | transport_service |
| Guide | hiking, guided_tour |
| Circuit | circuit, circuit_nature, circuit_culturel |
| Séjour | package, all_inclusive |
| Éco-tour | activity, guided_tour, hiking, observation, workshop |

---

## 🗺️ Mapping avec le Projet Maram (eco-tourism-platform-v2)

### Correspondance des terminologies

| Éco-Voyage (notre projet) | Maram | Rôle |
|---|---|---|
| **User** (role: project) | **User** + **Provider** | Le compte utilisateur |
| **ProjectOwner** (`project_owners`) | **Provider** (`providers`) | Le propriétaire de projet (personne physique) |
| **Project** (`projects`) | **Organization** (`organizations`) | Le projet/entreprise (entité juridique) |

### Avantages de notre architecture

| Capacité | Notre projet | Maram |
|----------|-------------|-------|
| **Schemas d'offres** | ~40+ schemas dynamiques | ~15 schemas |
| **Circuits** | Wizard 6 étapes, structure hiérarchique | JSONB `etapes: object[]` |
| **Pricing** | Multi-items, auto-fill, prix catalogue vs circuit | `price` decimal unique |
| **Règles métier** | `offer-rules.ts` complet | Pas de règles dédiées |
| **Mapping project→offers** | `PROJECT_TYPE_OFFERS` (10 types) | Pas de mapping |
| **Taxonomies** | 5 taxonomies hiérarchiques | Pas de taxonomies |
| **Architecture** | ProjectOwner → N Projects (1:N) | Provider → 1 Organization (1:1) |

### Ce que Maram fait mieux (à intégrer)

| Priorité | Élément | Impact |
|----------|---------|--------|
| 🔧 Faible | Shared constants (LANGS, SAISONS, REGIMES, NIVEAUX) | Uniformité UI |
| 🔧 Faible | CrossValidationRule | Validation des offres contre les contraintes projet |
| 🔧 Faible | Types `repeater` et `dynamicOptions` | Formulaires plus riches |

### Ce qu'il ne PAS prendre de Maram

- ❌ Circuit en JSONB — Notre structure est 100x meilleure
- ❌ Offre avec `price` decimal — Notre système multi-items est supérieur
- ❌ Architecture 1:1 Provider→Organization — Notre 1:N est plus flexible

---

## 📄 Documentation

- [Architecture globale](./docs/GLOBAL_PROJECT.md)
- [Audit offres & circuits](./docs/ANALYSE_OFFRES_CIRCUITS.md)
- [Logique métier circuits](./docs/CIRCUIT_BUSINESS_LOGIC.md)
- [Feature cartes](./docs/architecture-travel-cart.md)
- [Sprints](./docs/SPRINT_1.md) à [SPRINT_5.md](./docs/SPRINT_5.md)
- [API Documentation](http://localhost:3003/api) (Swagger)

---



*Dernière mise à jour : 5 Juillet 2026*

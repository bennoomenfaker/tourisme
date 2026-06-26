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
| **Conteneurisation** | Docker Compose | - | 5 services réseau interne |
| **Stockage images** | Cloudinary | - | Upload cloud, CDN intégré |
| **Styling** | Tailwind CSS | ^4.2.2 | Utility-first CSS |

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

# Rapport d'Analyse — Éco-Voyage

## 1. Qu'est-ce que ce projet ?

**Éco-Voyage** est une plateforme web de **tourisme durable / éco-tourisme** qui connecte trois types d'acteurs : les **voyageurs éco-responsables**, les **guides locaux**, et les **propriétaires de projets éco-touristiques** (hébergements, restaurants, agences, etc.). L'objectif est de promouvoir un tourisme respectueux de l'environnement avec un système de **score de durabilité** et de **badges** pour gamifier l'engagement écologique.

---

## 2. Fonctionnalités (Use Cases)

| Fonctionnalité | Description |
|---|---|
| **Inscription & Connexion** | Register/Login avec email + Google OAuth, avec 3 rôles |
| **Vérification email** | Email de confirmation avec lien (via Nodemailer) |
| **Mot de passe oublié** | Forgot/reset password avec token + email |

---

## 🎯 Fonctionnalités Principales

### 1. Système Multi-Rôle

| Rôle | Description | Fonctionnalités |
|------|-------------|-----------------|
| **Éco-Voyageur** | Voyageur éco-responsable | Parcours offres, création de plans, réservations, publications, messagerie |
| **Guide** | Guide local ou professionnel | Création d'offres, gestion des réservations, circuits, onboarding |
| **Propriétaire** | Porteur de projet éco-touristique | Gestion de projets, offres, circuits, statistiques |
| **Admin** | Administrateur plateforme | Modération, validation, gestion utilisateurs |

### 2. Système de Score de Durabilité (AFRATIM)

Le score final est calculé avec cette pondération :

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

**Types d'offres supportés :**

- 🏕️ **Hébergement** : Chambres, camping, éco-lodges
- 🚣 **Activités** : Randonnées, kayak, ateliers, observation faune
- 🍽️ **Restauration** : Restaurants éco-responsables, cuisine traditionnelle
- 🎨 **Artisanat** : Ateliers poterie, tissage, produits locaux
- 🚐 **Transport** : Navettes, transferts, location vélo

**Types d'activités enrichis (25+) :**

| Catégorie | Activités |
|-----------|-----------|
| **Outdoor** | Randonnée, Trekking, VTT, Escalade, Kayak, Paddle, Tyrolienne, Spéléologie, Équitation |
| **Nature** | Observation oiseaux, Astronomie, Photographie |
| **Culture & Bien-être** | Yoga, Méditation, Poterie, Tissage, Cuisine locale, Musique traditionnelle, Calligraphie |
| **Services** | Hébergement, Repas, Transport, Atelier |

**Smart Date Picker :**
- 📅 Date unique
- 📆 Plusieurs dates
- 🔄 Chaque semaine (weekday picker)
- 🌊 Période saisonnière (date range + weekdays)
- 🎉 Chaque année (yearly recurrence)
- ⚙️ Personnalisé (full control)

**Workflow de validation :**

```
Création → status = "pending"
              │
       ┌───────┴───────┐
       │               │
    Ambassadeur     Non-ambassadeur
       │               │
    approved      Admin examine
                      │
               ┌──────┴──────┐
               │             │
           approved      rejected
```

### 4. Circuits Multi-Jours

**Fonctionnalités :**

- Itinéraire jour par jour avec programme détaillé
- Program items enrichis : émoji, durée, distance, mode transport
- Niveau de difficulté visuel : 🟢 Facile / 🟡 Modéré / 🔴 Difficile / ⚫ Expert
- Timeline interactive style Polarsteps dans le détail
- Assistant de création (CircuitBuilderWizard) pas-à-pas en 6 étapes
- Options additionnelles (transport, hébergement, équipement)
- Réservation avec participants
- Carte interactive avec tracé GPS
- Gestion des capacités et prix
- Édition et suppression d'activités par jour

### 5. Panier de Voyage (TravelCart) — NOUVEAU

**Workflow complet :** Explorer → Panier → Trip Plan → Réservation

- **Panier temporaire** : Ajouter des OfferItems et Circuits librement
- **Carte interactive** : Explorer les offres/circuits sur OpenStreetMap, ajouter au panier en un clic
- **Conversion** : Le panier se transforme en TripPlan structuré avec dates et programme
- **Widget flottant** : Bouton panier avec compteur d'items
- API : `/travel-carts/me`, `/travel-carts/:id/items`, `/travel-carts/:id/convert`

### 6. Plans de Voyage (TripPlan)

**Innovation clé :** Permet aux écovoyageurs de :

- Rassembler plusieurs offres/activités dans un même plan
- Organiser par jour avec notes
- Vérifier les limites de participants et d'âge
- Réserver toutes les activités en une seule action
- Suivre le statut (brouillon → planification → confirmé → terminé)

### 6. Fonctionnalités Sociales

- **Publications** : Partage de lieux et expériences
- **Messagerie privée** : Communication entre utilisateurs
- **Système de Follow** : Abonnements entre utilisateurs
- **Avis et notes** : Feedback system avec photos
- **Favoris** : Sauvegarde d'offres et circuits

### 7. Cartographie Interactive

- **OpenStreetMap** + **Leaflet** pour l'affichage
- **Nominatim** pour le reverse geocoding
- **Turf.js** pour les calculs géospatiaux
- Marqueurs par type d'activité
- Vue calendrier et recherche géolocalisée
- **Carte de chaleur (Heatmap)** : Visualisation des zones populaires (Offres, Publications)
- Filtres de calques : Offres, Circuits, Lieux

### 8. Événements Dynamiques

- **Module Event** : Types (festival, concert, marché, compétition, exposition, atelier)
- Section Événements dans la page de chaque lieu
- Création d'événements par les éco-voyageurs et guides
- Badges colorés par type d'événement

### 9. Timeline des Expériences

- **TimelineEntry** : Entité backend avec émoji, durée, distance, transport
- **TimelineView** : Affichage Polarsteps-style (lecture seule)
- **TimelineEditor** : Éditeur avec sélecteur émoji, champs durée/distance/transport
- Intégré dans les expériences et les circuits (itinéraire)

### 10. Dashboard Analytics Guide

- **KPIs** : Offres, circuits, note moyenne, réservations, abonnés
- **Graphiques** : Répartition offres par statut/type
- **Réservations** : Breakdown par statut (confirmées/en attente/annulées)
- **Derniers avis** : 5 derniers avec étoiles et commentaire

---

## 📊 Base de Données

### PostgreSQL (Données relationnelles - 43+ entités)

```
users                    (auth, rôles, status, tokens)
  ├── eco_travelers      (profils voyageurs, scores, préférences)
  ├── guides             (profils guides, spécialités, expérience)
  └── project_owners     (profils propriétaires, organisation)

project_owners
  └── projects           (projets éco-touristiques CRUD)

questionnaires            (questionnaires par type)
  └── questions            (questions avec poids)
       └── answers          (réponses avec score 1-4)

question_categories       (environmental, social, economic)

questionnaire_attempts     (tentatives de l'utilisateur)
  └── user_answers         (réponses données)

offers                    (offres éco-touristiques, status pending/approved)
  ├── offer_items          (éléments vendables)
  │   ├── offer_item_prices     (prix par catégorie)
  │   ├── offer_item_sessions   (créneaux datés)
  │   └── offer_item_capacities (capacité restante)
  └── offer_categories     (lookup 10 catégories)

bookings                  (réservations, prix calculé serveur)
  └── booking_participants (individus dans une réservation)

circuits                  (circuits multi-jours, GPS, images)
  ├── circuit_days         (jours du circuit)
  │   └── circuit_program_items (activités)
  ├── circuit_options      (options additionnelles)
  └── circuit_reservations (réservations de circuits)

trip_plans                (plans de voyage)
  └── trip_plan_items      (items: offer_item_id XOR circuit_id)

favorites                 (favoris, unique user+type+target)
reviews                   (avis, rating 1-5, photos)
notifications             (notifications utilisateur)
```

### MongoDB (Données NoSQL - 6 collections)

| Collection | Usage |
|-----------|-------|
| `traveler_preferences` | Préférences voyageur (intérêts, activités, objectifs) |
| `traveler_engagement` | Engagement voyageur (score, badges, stats) |
| `guide_skills` | Compétences guide (activités, paysages, certifications) |
| `guide_engagement` | Engagement guide (score, badges, stats) |
| `project_services` | Services des projets éco (offerts, pratiques) |
| `user_stats` | Statistiques utilisateur (réservations, partages, etc.) |

---

## 🚀 Démarrage du Projet

### Prérequis

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (ou via Docker)
- MongoDB 7 (ou via Docker)
- Compte Cloudinary (pour les images)

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd tourisme

# Lancer avec Docker
docker network create tourisme_net
docker compose up -d

# URLs de l'application
# Frontend: http://localhost:3004
# Backend: http://localhost:3003
```

### Configuration Environnement

```bash
# Backend (.env)
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=marammejri
DB_PASSWORD=Hermosa
DB_NAME=tourism_db

MONGODB_URI=mongodb://localhost:27017/tourism_db

CLOUDINARY_CLOUD_NAME=votre_cloud
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

JWT_SECRET=votre_secret_jwt
JWT_REFRESH_SECRET=votre_refresh_secret

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

### Seeds Initiaux

```bash
# Lancer le backend
cd backend
npm install
npm run start:dev

# Seeder les données initiales
npm run seed:offer-categories
npm run seed:eco-traveler-questionnaire
npm run seed:guide-questionnaire
npm run seed:project-questionnaire

# Lancer le frontend
cd ../frontend
npm install
npm run dev
```

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
│   │   ├── project-owner/     # Profils propriétaires
│   │   ├── offer/             # Offres éco-touristiques
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
│   │   ├── config/            # Configuration
│   │   ├── database/          # Connexions DB
│   │   └── common/            # Partagé
│   ├── database/              # Migrations, seeds
│   └── test/                  # Tests
├── frontend/                   # Next.js Frontend
│   ├── app/                   # App Router
│   │   ├── (auth)/           # Pages authentification
│   │   ├── onboarding/        # Onboarding par rôle
│   │   ├── dashboard/        # Tableaux de bord
│   │   ├── offers/           # Page destinations
│   │   ├── circuits/          # Circuits touristiques
│   │   ├── trip-plans/       # Plans de voyage
│   │   ├── reservations/     # Réservations
│   │   ├── notifications/    # Notifications
│   │   ├── profile/          # Profils publics
│   │   └── admin/           # Admin panel
│   ├── components/           # Composants React
│   ├── lib/                  # Utilitaires
│   └── styles/              # Styles globaux
├── docs/                     # Documentation
├── docker-compose.yml        # Configuration Docker
└── README.md               # Ce fichier
```

---

## 🔧 API Endpoints Principaux

### Authentification

```
POST   /api/auth/register     # Inscription
POST   /api/auth/login        # Connexion
POST   /api/auth/refresh      # Rafraîchissement token
POST   /api/auth/forgot-password # Mot de passe oublié
GET    /api/auth/google       # Google OAuth
```

### Éco-Voyageur

```
GET    /api/eco-traveler/profile      # Profil
POST   /api/eco-traveler/profile      # Compléter profil
PATCH  /api/eco-traveler/interests   # Mise à jour intérêts
POST   /api/eco-traveler/onboarded    # Onboard terminé
```

### Offres

```
POST   /api/offers                   # Créer offre
GET    /api/offers                   # Toutes les offres
GET    /api/offers/mine              # Mes offres
PATCH  /api/offers/:id              # Modifier offre
DELETE /api/offers/:id              # Supprimer offre
```

### Réservations

```
POST   /api/bookings                # Réserver
GET    /api/bookings/mine           # Mes réservations
GET    /api/bookings/incoming      # Réservations reçues
PATCH  /api/bookings/:id/cancel    # Annuler
PATCH  /api/bookings/:id/confirm   # Confirmer
```

### Circuits

```
POST   /api/circuits                    # Créer circuit
GET    /api/circuits                   # Circuits publiés
GET    /api/circuits/mine              # Mes circuits
GET    /api/circuits/:id               # Détail circuit
PATCH  /api/circuits/:id              # Modifier circuit
DELETE /api/circuits/:id              # Supprimer circuit
POST   /api/circuits/:id/reserve       # Réserver circuit

# Jours du circuit
POST   /api/circuits/:id/days          # Ajouter un jour
PATCH  /api/circuits/:id/days/:dayId   # Modifier un jour
DELETE /api/circuits/:id/days/:dayId   # Supprimer un jour

# Program items (activités)
POST   /api/circuits/:id/days/:dayId/program    # Ajouter activité
PATCH  /api/circuits/:id/days/:dayId/program/:itemId  # Modifier activité
DELETE /api/circuits/:id/days/:dayId/program/:itemId  # Supprimer activité

# Options
POST   /api/circuits/:id/options       # Ajouter option
DELETE /api/circuits/:id/options/:optId # Supprimer option
```

### Panier de Voyage (TravelCart) — NOUVEAU

```
GET    /api/travel-carts/me        # Panier actif
GET    /api/travel-carts/:id      # Détail panier
PATCH  /api/travel-carts/:id      # Modifier panier
DELETE /api/travel-carts/:id      # Supprimer panier
POST   /api/travel-carts/:id/items        # Ajouter item
PATCH  /api/travel-carts/:id/items/:iid   # Modifier item
DELETE /api/travel-carts/:id/items/:iid   # Supprimer item
POST   /api/travel-carts/:id/convert      # Convertir → TripPlan
```

### Trip Plans

```
POST   /api/trip-plans            # Créer plan
GET    /api/trip-plans/mine       # Mes plans
POST   /api/trip-plans/:id/book   # Réserver plan
```

---

## 📱 Pages Frontend Principales

| Page | URL | Description |
|------|-----|-------------|
| **Accueil** | `/` | Page d'accueil avec offres et circuits en vedette |
| **Connexion** | `/auth/login` | Formulaire de connexion |
| **Inscription** | `/auth/register` | Inscription avec choix de rôle |
| **Onboarding** | `/onboarding/{role}` | Parcours guidé par rôle |
| **Destinations** | `/offers` | Catalogue public des offres |
| **Détail Offre** | `/offers/[id]` | Détail d'une offre avec réservation |
| **Circuits** | `/circuits` | Liste des circuits touristiques |
| **Détail Circuit** | `/circuits/[id]` | Détail d'un circuit avec itinéraire |
| **Explorer** | `/explore` | Carte Leaflet + catalogue + ajout au panier |
| **Panier** | `/cart` | Gestion du panier, conversion en TripPlan |
| **Mes Réservations** | `/dashboard/reservations` | Réservations de l'utilisateur |
| **Notifications** | `/notifications` | Page des notifications |
| **Plans de Voyage** | `/trip-plans` | Gestion des plans personnels |
| **Admin** | `/admin` | Panneau d'administration |

---

## 🎨 Design & UX

### Style Visuel

- **Design Material You / Google-like** : Interface moderne et épurée
- **Icônes** : Material Symbols (Lucide React)
- **Couleurs** : Palette éco-friendly (verts, bleus, terres)
- **Animations** : Framer Motion pour transitions fluides
- **Responsive** : Design mobile-first

### Patterns UX

- **Progressive disclosure** : Information par étapes
- **Wizard forms** : Formulaires multi-étapes (onboarding, création offres)
- **Empty states** : Messages clairs pour vides
- **Loading states** : Skeleton loaders et spinners
- **Error handling** : Messages d'erreur contextuels

---

## 🔐 Sécurité

### Authentification

- **JWT tokens** avec expiration (15min access, 7j refresh)
- **Rotation de refresh tokens** pour sécurité renforcée
- **Google OAuth2** pour connexion sociale
- **Hash bcrypt** pour mots de passe (10 rounds)

### Protection des Données

- **Validation des entrées** : class-validator + Joi
- **Type-safe** : TypeScript partout
- **JWT Guards** : Protection des routes par rôle
- **Rate limiting** : Protection contre brute force

### Base de Données

- **Synchronisation TypeORM** : `synchronize: true` en dev, désactivé en prod
- **Transactions** : Opérations atomiques pour réservations
- **Optimistic locking** : Version fields pour mises à jour concurrentes

---

## 📊 Statut Actuel & Données

### Progrès Réalisé

✅ **Backend complet** : Tous les modules implémentés  
✅ **Frontend complet** : Toutes les pages et composants  
✅ **Base de données** : Schéma relationnel + NoSQL  
✅ **Authentification** : JWT + Google OAuth  
✅ **Système de réservation** : Complet avec anti-conflit  
✅ **Circuits multi-jours** : Package management  
✅ **Plans de voyage** : TripPlan avec réservation groupée  
✅ **Cartographie** : Leaflet/OpenStreetMap intégré  
✅ **Notifications** : Système complet  
✅ **Modération admin** : Workflow de validation  
✅ **Événements dynamiques** : Module Event avec types (festival, concert, marché, etc.)  
✅ **Dashboard Analytics guide** : KPIs, graphiques, réservations, avis  
✅ **Timeline des expériences** : TimelineEntry (backend) + TimelineView/TimelineEditor (frontend)  
✅ **Circuit Builder enrichi** : emoji, durée, distance, transport sur les program items  
✅ **Correction data circuits** : 52 jours en double supprimés, coordonnées GPS réelles  
✅ **Niveau de difficulté circuits** : 🟢 Facile / 🟡 Modéré / 🔴 Difficile / ⚫ Expert  
✅ **TimelineView intégré** : Style Polarsteps dans le détail circuit  
✅ **Onglet Circuits profil guide** : Liste des circuits dans /profile/guide  
✅ **CircuitBuilderWizard enrichi** : émoji, durée, distance, transport dans l'assistant  

### Données Ajoutées

- **4 projets** : Kayak center, éco bike, poterie, éco-gîte
- **4 offres** : Kayak, vélo, poterie, chambre troglodyte
- **3 circuits** : Aventure vélo, VTT, trésors artisanaux
- **3 plans de voyage** : Aventure verte, photo tour, éco tour
- **Images** : Téléchargées depuis Google pour les locations
- **Questionnaires** : Système de scoring durabilité opérationnel

### Utilisateurs

- **10 utilisateurs** répartis dans les 4 rôles
- **Données existantes** : Réservations, activités, favoris, avis
- **Système multi-email** : Support des variations de point (<fakerbennoomen@gmail.com>, etc.)

---

## 🚀 Déploiement

### Environnement de Production

```bash
# URLs de production
Frontend: http://91.134.139.163:3004
Backend:  http://91.134.139.163:3003/api

# Déploiement Docker
docker compose -f docker-compose.prod.yml up -d

# Variables d'environnement production
NEXT_PUBLIC_API_URL=https://91.134.139.163:3003/api
DB_HOST=prod-db-host
DB_NAME=tourism_db_prod
# ... autres variables
```

### Processus de Déploiement

1. **Build frontend** : `npm run build` → Next.js static export
2. **Build backend** : `npm run build` → NestJS compiled
3. **Docker images** : Construction des images
4. **Docker compose** : Lancement des services
5. **Database migration** : TypeORM synchronize (dev) ou migrations (prod)
6. **Seeds** : Insertion des données initiales

---

## 🧪 Tests

### Tests Backend

```bash
# Exécuter tous les tests
npm test

# Coverage
npm run test:cov

# Tests avec watch
npm run test:watch
```

### Tests Frontend

```bash
# Tests unitaires
npm run test

# Tests E2E (à venir)
npm run test:e2e
```

---

## 🤝 Contribuer

### Workflow Git

```bash
# Travailler sur une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Commit avec messages clairs
git commit -m "feat: ajouter la réservation de circuits"

# Push et création de PR
git push origin feature/nouvelle-fonctionnalite
```

### Code Quality

- **TypeScript** : Typage strict partout
- **ESLint** : Standard de code
- **Prettier** : Formatage automatique
- **Commitlint** : Messages de commit conventionnels

---

## 📈 Roadmap Futur

### Prochaines Étapes

- [ ] **Intégration de paiement** : Stripe/PayPal
- [ ] **WebSocket** : Notifications temps réel
- [ ] **Analytics** : Tableau de bord avancé
- [ ] **Mobile App** : React Native ou PWA
- [ ] **API externe** : Intégration services tiers
- [ ] **Tests E2E** : Cypress ou Playwright
- [ ] **CI/CD** : GitHub Actions automatisé

### Améliorations Continues

- [ ] **Performance** : Optimisation SEO et loading
- [ ] **Accessibilité** : WCAG 2.1 compliance
- [ ] **Internationalisation** : Support multi-langue
- [ ] **Monitoring** : Logging et error tracking
- [ ] **Cache** : Redis pour performance

---

## 📞 Support

### Équipe de Développement

- **Maram Mejri** <https://github.com/Maram172003>
- **BEN NOOMEN Faker** <https://github.com/bennoomenfaker/tourisme>

### Documentation Complète

- [Documentation technique](./docs/)
- [API Documentation](http://localhost:3003/api) (Swagger)
- [Architecture détaillée](./docs/architecture-tourisme-durable.md)

---

## 📄 License

Ce projet est en cours de développement. Toute utilisation commerciale nécessite une autorisation explicite.

---

*Dernière mise à jour : 20 Juin 2026*

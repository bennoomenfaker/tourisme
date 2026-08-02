# 🌍 Éco-Voyage — Plateforme de Tourisme Durable

**Éco-Voyage** est une plateforme web de **tourisme durable** qui connecte voyageurs éco-responsables, guides locaux et providers d'établissements éco-touristiques. L'objectif : promouvoir un tourisme respectueux de l'environnement via un système de **score de durabilité** et de **badges** gamifiant l'engagement écologique.

---

## 🚀 Ce que l'app offre

### Pour les Voyageurs Éco-Responsables
- **Explorer** des destinations et offres éco-touristiques sur une carte interactive
- **Créer des plans de voyage** (Trip Plans) avec un programme jour par jour
- **Réserver** des activités, hébergements et circuits en quelques clics
- **Publier** des lieux et expériences avec photos, likes et commentaires
- **Messagerie privée** avec guides et providers
- **Suivre** ses favoris et recevoir des notifications

### Pour les Guides Locaux
- **Publier des prestations** de guidage (randonnées, visites culturelles, safaris, ateliers)
- **Gérer les disponibilités** par zone, jour et créneau horaire
- **Recevoir des réservations** de circuits et plans de voyage
- **Construire un profil public** avec spécialités, langues, zone de service et tarifs

### Pour les Providers
- **Créer et gérer plusieurs établissements** éco-touristiques (1 provider → N établissements)
- **Publier des offres** riches (hébergement, restauration, activités, artisanat, transport)
- **Construire des circuits multi-jours** avec un wizard guidé en 6 étapes
- **Gérer la tarification** avec pré-remplissage automatique depuis le catalogue
- **Consulter les statistiques** et les avis

### Pour l'Admin
- **Modérer** les publications, offres, circuits et prestations guides (statut pending → approved → rejected)
- **ModerationLog** — historique complet de toutes les actions de modération
- **Gérer les utilisateurs** (ban temporaire/permanent, unban)
- **Superviser** les signalements (warn, ban, delete, dismiss)
- **Circuits & GuideOfferings tabs** dans la page admin
- **Auto-approve Ambassadeur** : score ≥ 80 → statut automatiquement approuvé

---

## 👥 Les 4 Rôles

| Rôle | Description | Accès principal |
|------|-------------|-----------------|
| **Éco-Voyageur** | Voyageur éco-responsable | Explorer, Réserver, Plans de voyage, Publications |
| **Guide** | Guide local ou professionnel | Prestations, Réservations, Profil public |
| **Provider** | Gère des établissements éco-touristiques | Établissements (1:N), Offres, Circuits, Statistiques |
| **Admin** | Administrateur plateforme | Modération, Validation, Gestion utilisateurs |

---

## 🏗️ Architecture Métier

### La chaîne de valeur

```
Provider
    ↓ détient
Établissement (1:N) — hébergement, restaurant, artisanat, transport...
    ↓ génère
Offres (conteneurs commerciaux)
    ↓ contiennent
OfferItems (produits réservables : chambre, plat, randonnée, atelier...)
    ↓ avec
Prices, Sessions, Capacités, Disponibilités
    ↓ assemblés dans
Circuits multi-jours (wizard 6 étapes)
    ↓ convertis en
Réservations (bookings)
```

### Le Circuit Builder — Wizard en 6 étapes

Un circuit est un itinéraire complet composé de **jours**, chacun contenant des **activités** :

```
Circuit
├── Jour 1
│   ├── Activité 1 : Mon hébergement (offre personnelle)
│   ├── Activité 2 : Randonnée avec guide local
│   └── Activité 3 : Repas dans un restaurant partenaire
├── Jour 2
│   ├── Activité 1 : Visite culturelle
│   └── Activité 2 : Atelier artisanal
└── ...
```

| Étape | Contenu |
|-------|---------|
| 1. Général | Titre, description, région, durée, difficulté, images |
| 2. Localisation | Carte interactive par jour + recherche offres externes |
| 3. Activités | Sélection offre (propre / externe / guide) + tarification |
| 4. Itinéraire | Waypoints sur carte + auto-calcul distance |
| 5. Hébergement | Recherche intelligente (propre → autre → externe) |
| 6. Résumé | Preview avant publication |

### Les 4 types d'activités dans un circuit

| Type | Description | Prix |
|------|-------------|------|
| **Ma propre offre** | Lien vers une de mes offres sur la plateforme | Pré-rempli depuis mon catalogue |
| **Offre externe** | Activité d'un autre provider de la plateforme | Prix catalogue du partenaire |
| **Guide local** | Guide avec ou sans offre liée | Coût guide + prix activité |
| **Référence externe** | Prestataire hors plateforme (hôtel, agence) | Saisie manuelle |

### Logique de tarification

- **Prix catalogue** = valeur de référence de l'offre (immuable)
- **Prix circuit** = copie indépendante, modifiable par le provider
- **Auto-pré-remplissage** : quand une offre est sélectionnée, le prix catalogue pré-remplit le champ
- **Marge** = prix facturé - coût achat (offre externe / guide)

---

## 📦 Système d'Offres

### Structure

```
Offer (conteneur commercial)
├── category, region, GPS, statut
└── OfferItems (produits réservables)
    ├── OfferItemPrice (tarification)
    ├── OfferItemSession (créneaux datés)
    ├── OfferItemCapacity (stock disponible)
    └── OfferItemAvailabilityRule (récurrence)
```

### 10 catégories supportées

| Slug | Catégorie | Exemples |
|------|-----------|----------|
| `eco_tour` | Éco-Tour | Tourisme durable et responsable |
| `accommodation` | Hébergement | Chambres, camping, éco-lodges, suites |
| `activity` | Activité | Randonnées, kayak, ateliers, observation faune |
| `restaurant` | Restauration | Restaurants éco-responsables, cuisine traditionnelle |
| `craft` | Artisanat | Poterie, tissage, produits locaux |
| `workshop` | Atelier | Ateliers poterie/cuisine/tissage/musique |
| `transfer` | Transfert | Navettes, transferts, location vélo |
| `sejour` | Séjour | Forfait hébergement + activités |
| `circuit` | Circuit | Circuit multi-jours organisé |
| `other` | Autre | Autres types d'offres |

### 40+ schemas dynamiques

Chaque type d'offre a un schéma décrivant les sections du formulaire, les champs avec leur type, les conditions d'affichage et la configuration d'affichage.

**Exemples** : randonnee, kayak, vtt, yoga, escalade, chambre, dortoir, tente glamping, suite, bungalow, éco-lodge, restaurant, atelier poterie/cuisine/tissage/musique, circuit nature/culturel, etc.

---

## 📊 Score de Durabilité (AFRATIM)

```
Score Final = Questionnaire × 20% + Réservations × 40% + Feedbacks × 20% + Partages × 20%
```

| Score | Label | Niveau |
|-------|-------|--------|
| ≥ 80 | Ambassadeur durable | Niveau 5 |
| ≥ 60 | Écovoyageur engagé | Niveau 4 |
| ≥ 40 | Voyageur sensible | Niveau 3 |
| < 40 | Voyageur classique | Niveau 1 |

---

## 🗺️ Cartographie Interactive

- **OpenStreetMap + Leaflet** pour l'affichage
- **Nominatim** pour le reverse geocoding
- **Turf.js** pour les calculs géospatiaux
- Marqueurs par type d'activité
- Carte de chaleur (Heatmap) pour les zones populaires
- Recherche géolocalisée des offres et guides

---

## 🔧 Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Backend** | NestJS (TypeScript, modulaire) |
| **Frontend** | Next.js 16 (App Router, Server Components) |
| **Base relationnelle** | PostgreSQL 15 (43+ entités, TypeORM) |
| **Base NoSQL** | MongoDB 7 (préférences, engagement) |
| **Auth** | JWT + Passport (Google OAuth2) |
| **Conteneurisation** | Docker Compose (4 services) |
| **Stockage images** | Cloudinary |
| **Cartographie** | Leaflet / OpenStreetMap |
| **Styling** | Tailwind CSS |

### Infrastructure

```
┌──────────────────────────────────────────────────────┐
│  Docker Compose                                      │
│  ┌──────────────┐  ┌──────────┐  ┌────────┐  ┌─────┐│
│  │ PostgreSQL 15 │  │ MongoDB 7│  │ NestJS │  │Next ││
│  │  (relationnel)│  │  (NoSQL) │  │ API:3003│  │:3004││
│  └──────────────┘  └──────────┘  └───┬────┘  └──┬──┘│
│         ▲               ▲            │           │   │
│         └───────────────┴────────────┴───────────┘   │
│                   réseau interne tourisme_net         │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Démarrage

```bash
git clone <repository-url> && cd tourisme
docker network create tourisme_net
docker compose up -d

# Frontend: http://localhost:3004
# Backend:  http://localhost:3003/api (Swagger)
```

---

## 📁 Structure du Projet

```
tourisme/
├── backend/                    # NestJS Backend
│   └── src/
│       ├── auth/              # JWT, Google OAuth
│       ├── users/             # Utilisateurs multi-rôles
│       ├── eco-traveler/      # Profils voyageurs + score durabilité
│       ├── guide/             # Profils guides + prestations
│       ├── provider/          # Providers + CRUD établissements
│       ├── offer/             # Offres (40+ schemas)
│       ├── reservation/       # Réservations (offres + guides)
│       ├── circuit/           # Circuits multi-jours + réservations
│       ├── trip-plan/         # Plans de voyage (réservation groupée)
│       ├── travel-cart/       # Panier voyageur
│       ├── notification/      # Notifications
│       ├── messages/          # Messagerie privée
│       ├── follow/            # Abonnements
│       ├── review/            # Avis et notes
│       ├── favorite/          # Favoris
│       ├── domain/            # Services métier transverses (capacité, prix, états)
│       └── upload/            # Cloudinary
├── frontend/                   # Next.js Frontend
│   └── app/                   # App Router
│       ├── explore/           # Carte + découverte
│       ├── offers/            # Catalogue destinations
│       ├── circuits/          # Pages circuits
│       ├── trip-plans/        # Plans de voyage
│       ├── reservations/      # Réservations
│       ├── dashboard/         # Espaces provider/guide/éco-voyageur/admin
│       ├── messagerie/        # Messagerie privée
│       ├── notifications/     # Centre de notifications
│       └── profile/           # Profils publics
├── docs/                       # Documentation
├── scripts/                    # Seeds SQL
└── docker-compose.yml
```

---

## 📄 Documentation

- [Architecture globale](./docs/GLOBAL_PROJECT.md)
- [Logique métier circuits](./docs/CIRCUIT_BUSINESS_LOGIC.md)
- [Fonctionnalité collaboration & agenda](./docs/COLLABORATION_FEATURE.md)
- [Architecture panier & trip plan](./docs/architecture-travel-cart.md)
- [Logique de tarification](./docs/pricing-logic.md)
- [Analyse métier réservation (audit + corrections)](./docs/analyse-metier-resultat.md)
- [Roadmap d'implémentation](./docs/ROADMAP_IMPLEMENTATION.md)
- [Sprints 1 → 5](./docs/SPRINT_1.md)
- [API Documentation](http://localhost:3003/api) (Swagger)

---

*Dernière mise à jour : 2 Août 2026*

# Documentation de Synthèse Globale — Éco-Voyage

Ce document regroupe l'intégralité des spécifications, de l'architecture, du modèle de données, des cas d'utilisation, des endpoints d'API, des commandes de base de données et des guides d'intégration pour le projet **Éco-Voyage**. Il centralise toutes les informations précédemment dispersées dans les différents fichiers de documentation afin de servir de référence unique.

---

## Sommaire
1. [🌍 Présentation Générale & Collaboration](#1-présentation-générale--collaboration)
2. [🛠️ Stack Technologique & Infrastructure](#2-stack-technologique--infrastructure)
3. [🏢 Architecture Applicative & Structure des Dossiers](#3-architecture-applicative--structure-des-dossiers)
4. [🔑 Parcours d'Onboarding par Rôle](#4-parcours-donboarding-par-rôle)
5. [📈 Système de Score de Durabilité (AFRATIM) & Badges](#5-système-de-score-de-durabilité-afratim--badges)
6. [🏕️ Catalogue & Gestion des Offres Éco-Touristiques](#6-catalogue--gestion-des-offres-éco-touristiques)
7. [🚣 Système de Réservations (Bookings)](#7-système-de-réservations-bookings)
8. [🗺️ Circuits Multi-Jours (Packages)](#8-circuits-multi-jours-packages)
9. [📅 Plans de Voyage (TripPlans) & Cartographie](#9-plans-de-voyage-tripplans--cartographie)
10. [💬 Messagerie, Follow & Fonctionnalités Sociales](#10-messagerie-follow--fonctionnalités-sociales)
11. [💾 Schéma de Base de Données (Détails PostgreSQL & MongoDB)](#11-schéma-de-base-de-données-détails-postgresql--mongodb)
12. [🔌 Référence Complète des Endpoints API](#12-référence-complète-des-endpoints-api)
13. [💻 Guide des Commandes DB & Scripts de Seed](#13-guide-des-commandes-db--scripts-de-seed)
14. [🔧 Historique des Bug Fixes (Version Avancée)](#14-historique-des-bug-fixes-version-avancée)
15. [🚀 Guide de Fusion (Merger PR) pour Maram](#15-guide-de-fusion-merger-pr-pour-maram)

---

## 1. Présentation Générale & Collaboration

**Éco-Voyage** est une plateforme web de **tourisme durable / éco-tourisme** qui connecte trois types d'acteurs : les **voyageurs éco-responsables** (Éco-Voyageurs), les **guides locaux**, et les **propriétaires de projets éco-touristiques** (hébergements, restaurants, agences, artisanat, centres de loisirs). L'objectif est de promouvoir un tourisme respectueux de l'environnement grâce à un système de **score de durabilité** et de **badges** pour gamifier l'engagement écologique.

### La Collaboration (Pair Programming)
Le projet a été développé en binôme :
- **Dépôt de base (Maram Mejri)** : Gère les fonctionnalités fondamentales — Authentification, profils de base, CRUD des offres simples, messagerie de base, publications sociales, et panneau d'administration initial.
- **Dépôt avancé (Bennoomen Faker)** : Ajoute 7 modules majeurs et structurants — Système de réservations complexe, circuits multi-jours, plans de voyage avec cartes interactives (Leaflet), gestion avancée du catalogue avec sessions et capacités, notifications temps réel, système d'avis et de favoris, onboarding interactif par étapes, et de multiples correctifs de sécurité et d'ergonomie.

---

## 2. Stack Technologique & Infrastructure

### Stack Technique
| Couche | Technologie | Version | Usage |
|---|---|---|---|
| **Backend** | NestJS | ^11.1.16 | Framework backend Node.js modulaire et type-safe |
| **Frontend** | Next.js | 16.2.1 | React 19 avec App Router et Server Components |
| **Base Relationnelle** | PostgreSQL | 15 (alpine) | Données transactionnelles et intégrité ACID (via TypeORM ^0.3.28) |
| **Base NoSQL** | MongoDB | 7 | Stockage flexible des préférences, badges et logs (via Mongoose ^9.4.1) |
| **Authentification** | JWT + Passport | @nestjs/jwt ^11 | JWT Access & Refresh token rotation, Google OAuth2 |
| **Styling** | Tailwind CSS | ^4.2.2 | Intégration responsive et utility-first |
| **Stockage Images** | Cloudinary | - | Hébergement et CDN d'images avec upload direct sécurisé |
| **Cartographie** | Leaflet / OSM | - | Cartes interactives sans clé API payante |

### Infrastructure Docker Compose
L'infrastructure comprend 4 conteneurs principaux reliés via le réseau externe `tourisme_net` :
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

**Configuration des Ports :**
- **API Backend** : Port hôte `3003` -> Port conteneur `3000`
- **Frontend** : Port hôte `3004` -> Port conteneur `3000`

---

## 3. Architecture Applicative & Structure des Dossiers

### Backend (NestJS Module-Based)
```
backend/src/
├── auth/              # Gestion des sessions (JWT, Google OAuth, rotation de tokens)
├── users/             # CRUD utilisateurs & gestion du statut (active, banned, etc.)
├── eco-traveler/      # Profils, intérêts, scoring & badges voyageurs
├── guide/             # Profils, spécialités, expérience des guides
├── project-owner/     # Profils & projets des propriétaires
├── offer/             # Offres éco-touristiques, items vendables, sessions & prix
├── booking/           # Système de réservations, participants & transactions anti-conflits
├── circuit/           # Itinéraires multi-jours, jours de circuits & options
├── trip-plan/         # Regroupement d'activités & réservations groupées (TripPlan)
├── notification/      # Gestion et lecture des notifications par utilisateur
├── favorite/          # Système d'abonnements favoris (offres, circuits, guides, projets)
├── review/            # Avis (notes 1-5, commentaires, photos)
├── questionnaire/     # QCM durabilité (soumission & scoring)
├── publication/       # Réseau social interne (lieux et expériences de voyage)
├── messages/          # Messagerie privée (conversations, blocage)
├── follow/            # Abonnements entre profils d'utilisateurs
├── reports/           # Signalements et modération
├── admin/             # Validation de contenu et panneau de modération
├── upload/            # SDK Cloudinary pour upload d'images
├── mail/              # Nodemailer pour l'envoi d'e-mails d'activation/bannissement
├── database/          # Fichiers de configuration PostgreSQL & MongoDB
└── common/            # Guards, décorateurs et DTOs réutilisables
```

### Frontend (Next.js App Router)
```
frontend/app/
├── (auth)/            # Authentification (login, register, forgot-password)
├── onboarding/        # Formulaires d'onboarding par rôle (voyageur, guide, propriétaire)
├── dashboard/         # Tableaux de bord personnalisés et historiques
├── offers/            # Vitrine Destinations (recherche, filtres, carte, détail offre)
├── circuits/          # Consultation publique et réservation de circuits multi-jours
├── trip-plans/        # Outil de planification et de réservation en lot
├── reservations/      # Formulaire d'enregistrement des participants et recap
├── notifications/     # Liste des notifications reçues
├── profile/           # Profils publics interactifs des membres
└── admin/             # Panneau admin (offres, projets, signalements, publications)
```

---

## 4. Parcours d'Onboarding par Rôle

Après la validation de l'e-mail, chaque utilisateur est dirigé vers un tunnel d'onboarding spécifique conçu sous forme de formulaire multi-étapes (Wizard) :

### 4.1 Éco-Voyageur (5 Étapes)
1. **Identité** : `full_name`, `bio`, `country`, `language`, `photo` (Base64/URL).
2. **Type de Voyageur** : Multi-sélection (`solo`, `couple`, `family`, `group`, `digital_nomad`, `slow_traveler`, `explorer`, `adventure`).
3. **Motivations & Valeurs** : Ex : *support_local_economy*, *protect_biodiversity*, *reduce_carbon*.
4. **Centres d'intérêt & Paysages** : Intérêts avec niveaux (`beginner`, `intermediate`, `advanced`) et paysages favoris (`mountain`, `desert`, `sea`, `forest`, `oasis`...).
5. **Objectifs durables** : Engagement environnemental personnel.
*À la finalisation : Le profil passe à `is_onboarded = true` et débloque automatiquement le badge **"Explorateur Durable"**.*

**Calcul du % de complétion :**
- Identité (Nom, Pays, Langue, Bio) : 30%
- Type de voyageur : 10%
- Motivations : 10%
- Intérêts : 15%
- Paysages : 8%
- Styles de voyage : 7%
- Objectifs : 10%
- Photo : 10%

---

### 4.2 Guide (4 Étapes)
1. **Identité** : `full_name`, `bio`, `country`, `language`, `photo`, `zone` (périmètre géographique d'activité).
2. **Type de Guide** : `local` ou `professionnel`.
3. **Spécialités & Langues** : Activités encadrées (`randonnee`, `ornithologie`, `kayak`...) et langues parlées.
4. **Expérience & Terrains** : Années d'expérience (0-30), paysages et certifications professionnelles (`PSC1`, `Formation éco-tourisme`...).
*À la finalisation : Le profil débloque le badge **"Guide Éco-Certifié"**.*

**Calcul du % de complétion :**
- Identité : 30% | Type : 10% | Zone : 10% | Spécialités : 15% | Langues : 10% | Expérience : 15% | Photo : 10%

---

### 4.3 Propriétaire de Projet (2 Étapes)
1. **Identité** : `full_name`, `bio`, `country`, `language`, `photo`.
2. **Organisation** : Nom de la structure (`organization`), poste occupé (`position`), et téléphone (`phone`).
*À la finalisation : Le profil débloque le badge **"Propriétaire Éco-Engagé"**.*

**Calcul du % de complétion :**
- Identité : 30% | Organisation : 20% | Position : 15% | Bio : 15% | Téléphone : 10% | Photo : 10%

---

## 5. Système de Score de Durabilité (AFRATIM) & Badges

### Formules de Score (sur 100 points)
Le score écologique est mis à jour périodiquement en base selon les formules suivantes :

- **Éco-Voyageur** :
  $$\text{Score Final} = (\text{Questionnaire} \times 20\%) + (\text{Réservations} \times 40\%) + (\text{Avis} \times 20\%) + (\text{Partages} \times 20\%)$$
- **Guide** :
  $$\text{Score Final} = (\text{Questionnaire} \times 40\%) + (\text{Réservations} \times 40\%) + (\text{Avis} \times 20\%)$$
- **Propriétaire de projet** :
  $$\text{Score Final} = (\text{Questionnaire} \times 40\%) + (\text{Réservations} \times 40\%) + (\text{Avis} \times 20\%)$$

### Niveaux de durabilité
| Seuil du Score | Label Éco-Voyageur | Label Guide | Label Propriétaire |
|---|---|---|---|
| **Score $\ge$ 80** | Ambassadeur durable | Guide Ambassadeur | Propriétaire Ambassadeur |
| **Score $\ge$ 60** | Écovoyageur engagé | Guide Expert | Propriétaire Engagé |
| **Score $\ge$ 40** | Voyageur sensible | Guide Engagé | Propriétaire Sensible |
| **Score $<$ 40** | Voyageur classique | Guide en Développement | Propriétaire en Dev |

*Note : Les Ambassadeurs (score $\ge$ 80) bénéficient d'un workflow simplifié (auto-approbation immédiate de leurs offres et publications de lieux).*

### Questionnaire QCM
Le calcul initial repose sur un QCM de durabilité stocké en base PostgreSQL :
- **Voyageur** : 11 questions.
- **Guide** : 10 questions.
- **Propriétaire** : 10 questions.
Chaque question comporte 4 réponses valant de 1 à 4 points. Le score en pourcentage est calculé par la formule :
$$\text{Score} = \text{Math.round}\left(\frac{\text{Somme des points obtenus}}{\text{Nombre de questions} \times 4} \times 100\right)$$

---

## 6. Catalogue & Gestion des Offres Éco-Touristiques

### Classification et Types d'Offres
Cinq types d'offres sont supportés :
- `eco_tour` : Circuit unitaire ou excursion guidée.
- `accommodation` : Hébergement durable (éco-gîte, camping, chambre troglodyte).
- `activity` : Activité ponctuelle (kayak, randonnée, spéléologie).
- `restaurant` : Restauration bio, locale ou traditionnelle.
- `craft` : Atelier ou boutique d'artisanat local (poterie, tissage).

### Catalogue Simple vs Catalogue Complexe
Le catalogue a été structuré pour gérer deux typologies d'offres :
1. **Catalogue Simple** : L'offre possède une quantité en stock globale, sans notion de créneau horaire ou de calendrier (ex: hébergement, location de matériel, artisanat).
2. **Catalogue Complexe** : L'offre dépend de sessions datées précises avec une capacité maximale et un stock fluctuant en temps réel (`remaining_capacity`). Principalement utilisé pour les activités encadrées et les ateliers.

### Workflow d'approbation des Offres
```
Création → status = "pending"
              │
      ┌───────┴───────┐
      │               │
   Author = Ambassadeur     Author = Non-ambassadeur
      │               │
   approved      Admin examine
                     │
              ┌──────┴──────┐
              │             │
          approved      rejected
```

### Calcul de Prix Côté Serveur (Anti-Fraude)
Afin d'éviter toute manipulation malveillante des montants de réservation côté client, l'API calcule les montants côté serveur avec 3 méthodes de repli successives :
1. Si un prix spécifique est défini sur la session, le serveur applique ce tarif.
2. Sinon, le serveur parcourt la table `offer_item_prices` pour l'item sélectionné et recherche le tarif par défaut (`is_default = true`).
3. En dernier recours, le serveur utilise le premier tarif de la liste associé à l'item.

---

## 7. Système de Réservations (Bookings)

### Validation & Flux de Réservation
1. **Enregistrement des participants** : Le voyageur saisit les participants (`full_name`, `age`, `document_type`, `document_number`, `is_group_leader`).
2. **Contrôle des Limites** : Le serveur vérifie que la taille du groupe respecte `min_group_size` et `max_group_size`, et que l'âge des participants respecte `min_age`.
3. **Vérification de Disponibilité** : Pour les offres complexes, le serveur vérifie la capacité disponible sur la session.
4. **Création du Booking** : Création d'une ligne dans la table `bookings` avec un numéro de référence unique et lisible (`BK-XXXXXX`).
5. **Mode de Confirmation** :
   - `automatic` : La réservation passe directement en statut `confirmed`, la capacité de la session est décrémentée.
   - `manual` : La réservation reste en statut `pending`. Le prestataire doit la confirmer ou la refuser dans son tableau de bord.
6. **Annulation** : Le voyageur peut annuler une réservation en statut `pending`. Si confirmée, l'annulation est soumise à la politique d'annulation (`cancellation_deadline_days`). La capacité de session est restaurée si la réservation est annulée.

### Transactions Atomiques Anti-Conflits (Locking)
Pour empêcher les problèmes de surréservation (overbooking) lors de requêtes simultanées, l'écriture des réservations utilise une **transaction atomique TypeORM** avec un niveau d'isolement strict. La base de données applique un verrouillage sur la session concernée afin de s'assurer qu'aucun autre processus ne vienne consommer la capacité restante entre le moment de la vérification et l'écriture de la réservation.

---

## 8. Circuits Multi-Jours (Packages)

Le module **Circuit** permet aux guides et propriétaires de regrouper un itinéraire complet sous la forme d'un produit packagé.

### Caractéristiques
- **Programme jour par jour** (`circuit_days`) contenant chacun des activités détaillées (`circuit_program_items`) avec horaires de début et de fin.
- **Options Additionnelles** (`circuit_options`) payantes (transport, hébergement, location d'équipements additionnels) sélectionnables lors de la réservation.
- **Géolocalisation** : Point de départ global et points GPS par journée de circuit pour tracer l'itinéraire sur une carte interactive Leaflet.
- **Réservation de circuit** (`circuit_reservations`) : Calcule le prix global (Tarif de base du circuit $\times$ nombre de participants + somme des options sélectionnées).

---

## 9. Plans de Voyage (TripPlans) & Cartographie

### Innovation Clé
Un **TripPlan** est un conteneur d'activités personnalisé créé par un Éco-Voyageur. Il permet de :
1. Regrouper plusieurs offres unitaires et circuits dans un plan de voyage unique.
2. Structurer son séjour jour par jour, agrémenté de notes personnelles par activité.
3. Vérifier les limites d'âge et de capacité globale de toutes les offres sélectionnées.
4. **Réserver l'ensemble du plan en une seule action** : Le système lance une transaction SQL globale, crée autant de `bookings` individuels que d'items dans le plan, et affecte les participants à chacune des réservations.

### Cartographie Interactive Leaflet (OpenStreetMap)
La page détail de chaque offre, circuit ou plan de voyage intègre une carte interactive :
- **Source** : Données OpenStreetMap (OSM) sans coûts de licence.
- **Mise en cache cartographique** : Gérée via Leaflet.
- **Nominatim** : Utilisé pour le reverse geocoding (conversion de coordonnées GPS en adresse lisible côté backend).
- **Points GPS** : Les points GPS sont extraits dynamiquement de l'offre parente ou des items du plan de voyage pour tracer les marqueurs sur la carte.

---

## 10. Messagerie, Follow & Fonctionnalités Sociales

### Messagerie Privée
- Les utilisateurs peuvent initier des **Conversations**.
- **Règles de rôle** : Un voyageur peut contacter un guide ou un propriétaire de projet. Les guides et propriétaires peuvent échanger entre eux. Cependant, deux utilisateurs ayant le même rôle (ex: deux voyageurs) ne peuvent pas démarrer de conversation privée afin d'éviter le spam.
- **Notifications de messages** : Chaque nouveau message incrémente le compteur de messages non lus et déclenche une notification en temps réel.

### Système de Follow
- Les voyageurs peuvent s'abonner (suivre) à des guides ou à des propriétaires de projet.
- Les guides peuvent s'abonner à des propriétaires de projet et inversement.
- Le profil public du prestataire affiche le nombre de followers réels calculé dynamiquement depuis la table `follows`.

### Publications & Interactions Sociales
Les voyageurs partagent leurs aventures sous deux formes :
- **Lieux (`place`)** : Recommandation d'un spot écotouristique (nécessite des coordonnées GPS précises). Reste en statut `pending` et requiert une validation de l'administrateur avant d'être publique (sauf si l'auteur est un Ambassadeur).
- **Récits d'Expériences (`experience`)** : Récits de voyage illustrés de photos. Approuvés automatiquement dès publication.
- **Interactions** : Likes et commentaires (avec un niveau de réponse imbriqué) sur toutes les publications.

---

## 11. Schéma de Base de Données (Détails PostgreSQL & MongoDB)

### 11.1 PostgreSQL (Modèle Relationnel ACID)

#### Table `users`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | `@PrimaryGeneratedColumn('uuid')` |
| `email` | varchar | UNIQUE |
| `password` | varchar | Haché bcrypt |
| `auth_method` | varchar | Défaut : `'email'` |
| `role` | varchar | `eco_traveler`, `project`, `guide`, `admin` |
| `status` | varchar | `pending`, `active`, `banned`, `archived` |
| `email_verified_at`| timestamp | Nullable |
| `verification_token`| text | Nullable |
| `refresh_token` | text | Nullable |

#### Table `eco_travelers`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `user_id` | UUID (PK, FK) | `@OneToOne(() => User)` |
| `full_name` | varchar | Requis |
| `bio` | text | Nullable |
| `country` | varchar | Requis |
| `language` | varchar | Requis |
| `photo` | text | Nullable |
| `traveler_types` | simple-array | Types de voyageur |
| `is_onboarded` | boolean | Défaut : `false` |
| `sustainability_score`| int | Note globale (0-100) |
| `score_questionnaire`| int | Note QCM (20% du score final) |

#### Table `guides`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `user_id` | UUID (PK, FK) | `@OneToOne(() => User)` |
| `full_name` | varchar | Requis |
| `guide_type` | varchar | `local` ou `professionnel` |
| `zone` | varchar | Zone géographique |
| `years_experience` | int | 0 à 30 |
| `is_onboarded` | boolean | Défaut : `false` |

#### Table `project_owners`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `user_id` | UUID (PK, FK) | `@OneToOne(() => User)` |
| `full_name` | varchar | Requis |
| `organization` | varchar | Nom de l'organisme |
| `position` | varchar | Poste |
| `phone` | varchar | Téléphone |
| `is_onboarded` | boolean | Défaut : `false` |

#### Table `projects`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | `@PrimaryGeneratedColumn('uuid')` |
| `owner_id` | UUID (FK) | → `project_owners.user_id` |
| `name` | varchar | Nom du projet |
| `project_type` | varchar | `hebergement`, `restauration`, `artisanat`, `agence`, `centre_loisir` |
| `eco_labels` | simple-array | Liste des pratiques écologiques validées |
| `status` | varchar | Défaut : `'pending'` |

#### Table `offers`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | |
| `author_id` | UUID | Guide ou project_owner |
| `author_type` | varchar | `'guide'` ou `'project_owner'` |
| `project_id` | UUID (FK) | Nullable, lié à `projects` |
| `category_id` | UUID (FK) | Lié à `offer_categories` |
| `title` | varchar | |
| `price` | decimal | |
| `latitude` / `longitude`| decimal(10,7)| GPS coordinates |
| `status` | varchar | `pending`, `approved`, `rejected` |

#### Table `offer_items`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | |
| `offer_id` | UUID (FK) | CASCADE |
| `name` | varchar | Libellé de la prestation (ex: "Chambre Double") |
| `item_type` | varchar | `room`, `bed`, `dish`, `equipment`, `activity`... |
| `bed_count` / `nights` | int | Spécifique hébergement |
| `tent_capacity` | int | Spécifique camping |

#### Table `bookings`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | |
| `booking_ref` | varchar | UNIQUE (ex: "BK-87FA2E") |
| `traveler_id` | UUID (FK) | Voyageur émetteur |
| `offer_id` | UUID (FK) | Offre globale |
| `offer_item_id` | UUID (FK) | Prestation spécifique |
| `session_id` | UUID (FK) | Créneau (nullable) |
| `status` | varchar | `pending`, `confirmed`, `cancelled`, `completed` |
| `total_price` | decimal | Calculé côté serveur |

#### Table `booking_participants`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | |
| `booking_id` | UUID (FK) | CASCADE |
| `full_name` | varchar | Nom du participant |
| `age` | int | Âge (pour contrôle `min_age`) |
| `is_group_leader` | boolean | Indique le chef de groupe |

#### Table `circuits`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | |
| `author_id` | UUID | Guide ou propriétaire |
| `title` | varchar | |
| `duration_days` | int | Durée totale |
| `base_price` | decimal | Tarif de base |
| `status` | varchar | `pending`, `approved`, `rejected` |

#### Table `circuit_days`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | |
| `circuit_id` | UUID (FK) | CASCADE |
| `day_number` | int | Index du jour (1, 2, 3...) |
| `lat` / `lng` | decimal | Coordonnées de l'étape du jour |

#### Table `circuit_program_items`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | |
| `circuit_day_id` | UUID (FK) | CASCADE |
| `title` | varchar | Nom de l'activité du jour |
| `start_time` / `end_time`| time | Créneau horaire |

#### Table `circuit_options`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | |
| `circuit_id` | UUID (FK) | CASCADE |
| `option_group` | varchar | `transport`, `accommodation`, `equipment`... |
| `extra_price` | decimal | Tarif supplémentaire appliqué |

#### Table `trip_plans`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | |
| `eco_traveler_id` | UUID (FK) | Propriétaire du plan |
| `title` | varchar | Nom du voyage |
| `status` | varchar | `draft`, `planning`, `confirmed`, `completed` |

#### Table `trip_plan_items`
| Colonne | Type | Modificateurs / Contraintes |
|---|---|---|
| `id` | UUID (PK) | |
| `trip_plan_id` | UUID (FK) | CASCADE |
| `offer_item_id` | UUID (FK) | Prestation liée (XOR avec circuit_id) |
| `day_number` | int | Jour dans l'itinéraire |
| `notes` | text | Note personnelle |

---

### 11.2 MongoDB (Modèle Documentaire Flexible)

- **`traveler_preferences`** : Stocke les intérêts détaillés et les styles de voyage.
  ```json
  {
    "user_id": "UUID",
    "interests": [{"name": "Randonnée", "level": "intermediate"}],
    "landscapes": ["mountain", "forest"],
    "objectives": ["reduce_carbon"]
  }
  ```
- **`traveler_engagement`** : Badges débloqués et statistiques d'engagement.
  ```json
  {
    "user_id": "UUID",
    "durability_score": 78,
    "badges": [{"label": "Explorateur Durable", "obtained_at": "ISODate"}],
    "plans_shared": 3,
    "reservations_made": 5
  }
  ```
- **`guide_skills`** : Certifications, langues et expertises.
  ```json
  {
    "user_id": "UUID",
    "activities": ["randonnee", "ornithologie"],
    "certifications": ["PSC1", "Formation éco-tourisme"]
  }
  ```
- **`project_services`** : Liste des labels et critères écologiques validés.
  ```json
  {
    "project_id": "UUID",
    "eco_practices": ["Panneaux solaires", "Compostage", "Zéro plastique"]
  }
  ```

---

## 12. Référence Complète des Endpoints API

### Authentification & Profils
| Méthode | Endpoint | Authentification | Rôle / Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Inscription utilisateur |
| `GET` | `/api/auth/verify-email` | Public | Validation par e-mail (token URL) |
| `POST` | `/api/auth/login` | Public | Authentification et retour des tokens JWT |
| `POST` | `/api/auth/refresh` | Public | Échange d'un refresh token contre un nouvel access token |
| `POST` | `/api/auth/forgot-password` | Public | Envoi d'un e-mail de réinitialisation de mot de passe |
| `POST` | `/api/auth/reset-password` | Public | Application du nouveau mot de passe |
| `GET` | `/api/auth/google` | Public | Lancement de la procédure Google OAuth2 |
| `GET` | `/api/auth/google/callback` | Public | Callback de retour Google OAuth2 |
| `POST` | `/api/auth/logout` | JWT requis | Révocation du refresh token en base de données |

### Profils & Onboarding
| Méthode | Endpoint | Authentification | Description |
|---|---|---|---|
| `GET` | `/api/eco-traveler/profile` | Voyageur | Consulter son profil voyageur |
| `POST` | `/api/eco-traveler/profile` | Voyageur | Créer/Compléter le profil (Étape 1 Onboarding) |
| `PATCH` | `/api/eco-traveler/traveler-types`| Voyageur | Configurer ses types de voyage |
| `PATCH` | `/api/eco-traveler/interests` | Voyageur | Mettre à jour ses intérêts & paysages |
| `POST` | `/api/eco-traveler/onboarded` | Voyageur | Valider l'onboarding complet |
| `GET` | `/api/guide/profile` | Guide | Récupérer le profil du guide |
| `POST` | `/api/guide/profile` | Guide | Créer son profil guide |
| `POST` | `/api/project-owner/profile` | Propriétaire | Créer son profil propriétaire |
| `GET` | `/api/project-owner/projects` | Propriétaire | Liste des projets du propriétaire |
| `POST` | `/api/project-owner/projects` | Propriétaire | Créer un nouveau projet durable |

### Offres & Catalogue
| Méthode | Endpoint | Authentification | Description |
|---|---|---|---|
| `GET` | `/api/offers` | Public | Toutes les offres publiques approuvées |
| `GET` | `/api/offers/:id` | Public | Détail de l'offre (prix, items, sessions, carte) |
| `POST` | `/api/offers` | Guide/Propriétaire| Créer une offre (statut initial `pending`) |
| `PATCH` | `/api/offers/:id` | Guide/Propriétaire| Modifier une offre |
| `DELETE` | `/api/offers/:id` | Guide/Propriétaire| Supprimer une offre |
| `POST` | `/api/offers/:offerId/items` | Guide/Propriétaire| Ajouter une prestation (item) à l'offre |
| `POST` | `/api/offers/items/:itemId/prices`| Guide/Propriétaire| Définir des prix par catégorie (adulte/enfant...) |
| `POST` | `/api/offers/items/:itemId/sessions`| Guide/Propriétaire| Créer des créneaux datés (sessions) |
| `GET` | `/api/offers/items/:itemId/sessions`| Public | Sessions disponibles d'un item |

### Réservations (Bookings)
| Méthode | Endpoint | Authentification | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Voyageur | Effectuer une réservation sur un item/session |
| `GET` | `/api/bookings/mine` | Voyageur | Liste de ses réservations de voyage |
| `GET` | `/api/bookings/incoming` | Guide/Propriétaire| Liste des demandes de réservations reçues |
| `PATCH` | `/api/bookings/:id/cancel` | Voyageur | Annuler une réservation (respectant les délais) |
| `PATCH` | `/api/bookings/:id/confirm` | Guide/Propriétaire| Valider manuellement une réservation `pending` |

### Circuits Multi-Jours
| Méthode | Endpoint | Authentification | Description |
|---|---|---|---|
| `POST` | `/api/circuits` | Guide/Propriétaire| Créer un circuit touristique |
| `GET` | `/api/circuits` | Public | Consulter les circuits disponibles |
| `GET` | `/api/circuits/:id` | Public | Détail du circuit (programme, itinéraire, options) |
| `POST` | `/api/circuits/:id/days` | Guide/Propriétaire| Définir les étapes journalières |
| `POST` | `/api/circuits/:id/options` | Guide/Propriétaire| Ajouter des suppléments payants |
| `POST` | `/api/circuits/:id/reserve` | Voyageur | Réserver un circuit avec options |

### Plans de Voyage (TripPlans)
| Méthode | Endpoint | Authentification | Description |
|---|---|---|---|
| `POST` | `/api/trip-plans` | Voyageur | Créer un plan de voyage |
| `GET` | `/api/trip-plans/mine` | Voyageur | Liste de ses plans (brouillon, planifié...) |
| `GET` | `/api/trip-plans/:id` | Voyageur | Détail du plan de voyage avec ses items |
| `POST` | `/api/trip-plans/:id/items` | Voyageur | Ajouter un `offer_item` ou un `circuit` au plan |
| `DELETE` | `/api/trip-plans/:id/items/:itemId`| Voyageur | Retirer un élément de l'itinéraire |
| `POST` | `/api/trip-plans/:id/book` | Voyageur | Lancer la réservation groupée du plan |

### Notifications & Interactions Sociales
| Méthode | Endpoint | Authentification | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Tout membre | Liste de ses notifications de compte |
| `PATCH` | `/api/notifications/:id/read` | Tout membre | Marquer une notification comme lue |
| `GET` | `/api/notifications/unread` | Tout membre | Nombre de notifications non lues |
| `POST` | `/api/favorites` | Voyageur | Ajouter/Retirer des favoris |
| `POST` | `/api/reviews` | Voyageur | Soumettre un avis noté avec photo |
| `POST` | `/api/publications` | Voyageur | Créer une publication (`place` ou `experience`) |
| `POST` | `/api/messages` | Tout membre | Envoyer un message privé |
| `POST` | `/api/follows/:targetId/:type` | Tout membre | S'abonner au profil d'un prestataire |
| `POST` | `/api/upload` | Tout membre | Téléverser un fichier image vers Cloudinary |

---

## 13. Guide des Commandes DB & Scripts de Seed

### Connexion et requêtes PostgreSQL via Docker (Conteneur `tourisme-db-1`)
Ces commandes s'exécutent directement dans le terminal hôte pour inspecter et gérer la base de données :

- **Lister les adresses e-mails de tous les utilisateurs inscrits :**
  ```bash
  docker exec tourisme-db-1 psql -U marammejri -d tourism_db -c "SELECT email FROM users;"
  ```
- **Exporter la liste des offres créées au format CSV :**
  ```bash
  docker exec tourisme-db-1 psql -U marammejri -d tourism_db -c "COPY offers TO STDOUT WITH CSV HEADER;" > offres.csv
  ```
- **Supprimer toutes les offres en attente de modération (`pending`) :**
  ```bash
  docker exec -it tourisme-db-1 psql -U marammejri -d tourism_db -c "DELETE FROM offers WHERE status = 'pending';"
  ```
- **Supprimer un projet spécifique à partir de son identifiant UUID :**
  ```bash
  docker exec -it tourisme-db-1 psql -U marammejri -d tourism_db -c "DELETE FROM projects WHERE id = '<ID_DU_PROJET>';"
  ```
- **Supprimer des offres de test spécifiques (IDs définis) :**
  ```bash
  docker exec -it tourisme-db-1 psql -U marammejri -d tourism_db -c "DELETE FROM offers WHERE id IN ('b2b63659-0d6b-4994-acf7-672d8f36e5dd', '17a947ef-bf39-4c30-9603-152ddaa23950');"
  ```

### Scripts d'Initialisation de la Base de Données (Seeds)
Après une installation ou une réinitialisation de la base de données, lancez les scripts suivants dans le répertoire `/backend` pour injecter les données indispensables au fonctionnement de l'application :

```bash
# Se connecter au dossier backend et installer les paquets
cd backend && npm install

# Seeder les catégories de catalogue d'offres (idempotent)
npm run seed:offer-categories

# Seeder les questionnaires de durabilité pour les trois rôles
npm run seed:eco-traveler-questionnaire
npm run seed:guide-questionnaire
npm run seed:project-questionnaire
```

---

## 14. Historique des Bug Fixes (Version Avancée)

Voici la liste des corrections majeures apportées dans la version avancée pour résoudre les dysfonctionnements du socle initial :

1. **Boucle infinie de redirection à l'onboarding** : Correction de la liaison d'association dans `eco-traveler.service.ts` où l'identifiant du voyageur était assigné à `traveler_id` au lieu de l'objet imbriqué `traveler: { id }`.
2. **Blocage du chargement de la page de réservation** : Déplacement de l'appel `setLoading(false)` pour qu'il soit exécuté sur le chemin de succès et d'échec de la requête, évitant un écran de chargement infini.
3. **Bouton de réservation manquant sur le détail de l'offre** : Correction d'une condition d'affichage côté frontend pour s'assurer que le bouton d'action s'affiche systématiquement pour les utilisateurs connectés ayant le rôle `eco_traveler`.
4. **Débordement d'affichage des modals sur mobile** : Ajout des classes CSS `max-h-[90vh] overflow-y-auto` sur les fenêtres modales de gestion de circuits pour éviter leur rognage sur petit écran.
5. **Erreur d'hydratation Next.js sur la messagerie** : Encapsulation des composants utilisant `useSearchParams` dans un conteneur `<Suspense>` pour supporter le rendu côté serveur (SSR).
6. **Erreur de parsing de l'utilitaire `apiFetch`** : Ajout d'une condition de traitement pour retourner `null` ou un objet vide lorsque le serveur backend répond avec un code `204 No Content` (corps de réponse vide).
7. **Double réservation pour le même créneau** : Ajout d'une vérification côté API pour bloquer toute nouvelle réservation sur un même créneau horaire ou une même session pour laquelle l'utilisateur possède déjà une réservation active non annulée.
8. **Mise à jour des statistiques de complétion du profil** : Réécriture du service de calcul du profil pour s'assurer que le pourcentage de complétion est recalculé et sauvegardé à chaque soumission d'étape d'onboarding.
9. **Prise en compte du mode de confirmation de circuit** : Modification de la route de réservation de circuit pour honorer la valeur du champ `confirmation_mode` du circuit parent au lieu d'appliquer une confirmation automatique systématique.

---

## 15. Guide de Fusion (Merger PR) pour Maram

Pour intégrer l'intégralité des nouvelles fonctionnalités (réservations, circuits, cartes, notifications) du dépôt avancé vers le dépôt d'origine, appliquez la procédure de fusion suivante :

### Étape 1 : Sauvegarde des bases de données
Effectuez un snapshot de votre base de données PostgreSQL actuelle avant toute manipulation de fichiers :
```bash
docker exec tourisme-db-1 pg_dump -U marammejri tourism_db > backup_tourisme.sql
```

### Étape 2 : Recopie des nouveaux modules Backend
Copiez les dossiers complets du backend suivants :
- `backend/src/booking/` (Système de réservations)
- `backend/src/circuit/` (Gestion des circuits touristiques)
- `backend/src/trip-plan/` (Plans de voyages durables)
- `backend/src/notification/` (Système d'alertes et de notifications)
- `backend/src/favorite/` (Système de favoris)
- `backend/src/review/` (Avis et notes)

### Étape 3 : Recopie des fichiers Frontend
Copiez les nouvelles pages et composants Next.js :
- `frontend/app/circuits/` (Itinéraires)
- `frontend/app/trip-plans/` (Plans de voyage)
- `frontend/app/reservations/` (Enregistrement participants)
- `frontend/app/notifications/` (Notifications)
- `frontend/components/map/` (Composants Leaflet OpenStreetMap)
- `frontend/components/GuidedOfferWizard.tsx` (Wizard de création d'offres)

### Étape 4 : Mise à jour de la configuration de l'application
- **Backend (`backend/src/app.module.ts`)** : Importez et déclarez les nouveaux modules (`BookingModule`, `CircuitModule`, `NotificationModule`, `TripPlanModule`, `FavoriteModule`, `ReviewModule`) dans le tableau `imports` de `AppModule`.
- **Base de données PostgreSQL** : La base de données va créer automatiquement les nouvelles tables au démarrage de l'API grâce à la synchronisation active (`synchronize: true` dans la configuration TypeORM).

### Étape 5 : Exécution des migrations & Seeds
Installez les nouvelles dépendances ajoutées dans les packages et lancez les seeds :
```bash
# Dans le dossier backend
npm install
npm run start:dev
npm run seed:offer-categories
npm run seed:eco-traveler-questionnaire
npm run seed:guide-questionnaire
npm run seed:project-questionnaire

# Dans le dossier frontend
cd ../frontend
npm install
npm run dev
```

### Étape 6 : Tests de validation
- Accédez à la documentation d'API Swagger sur `http://localhost:3003/api/docs` pour vous assurer que tous les nouveaux endpoints REST sont bien exposés.
- Connectez-vous sur le frontend et effectuez le parcours complet : *Inscription -> Onboarding -> Questionnaire -> Destinations -> Ajout au TripPlan -> Réservation groupée -> Consultation dans le Tableau de Bord*.

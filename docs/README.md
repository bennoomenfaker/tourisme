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
| **Refresh Token** | Rafraîchissement automatique du JWT |
| **Onboarding guidé** | Questionnaire onboarding multi-étapes pour chaque rôle |
| **Profil utilisateur** | Profil complet avec bio, pays, langue, photo, etc. |
| **Questionnaire durabilité** | QCM noté (catégories : environnemental, social, économique) |
| **Score de durabilité** | Score pondéré (Questionnaire 20% + Réservations 40% + Feedbacks 20% + Partages 20%) |
| **Badges** | Système de badges débloqués selon le score (Explorateur Durable, Ambassadeur, etc.) |
| **Dashboard voyageur** | Tableau de bord avec stats, score breakdown, plans de voyage, badges |
| **Dashboard guide** | Tableau de bord avec spécialités, certifications, langues, réservations |
| **Dashboard propriétaire** | Tableau de bord avec CRUD de projets éco-touristiques, stats |
| **Gestion de projets** | Création, modification, suppression de projets avec labels éco |
| **Gestion d'offres** | Création, modification, suppression d'offres éco-touristiques (guides + propriétaires) |
| **Page Destinations** | Vitrine publique des offres approuvées avec filtres, recherche et carte interactive |
| **Modération Admin** | Workflow de validation : offres, projets, publications en attente d'approbation |
| **Publications** | Réseau social interne : publications places/expériences, likes, commentaires |
| **Messagerie** | Messagerie privée entre utilisateurs avec conversations et blocage |
| **Système de Follow** | Abonnement entre utilisateurs (voyageurs → guides/propriétaires) |
| **Signalements** | Signalement de contenu inapproprié avec résolution + bannissement |
| **Upload** | Upload d'images vers Cloudinary |
| **Authentification Google** | Google OAuth2 avec redirect + création de compte auto |
| **Swagger API** | Documentation auto-générée de l'API |

---

## 3. Architecture Technique

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

## 4. Stack Technologique Détaillé

### Backend (`/backend`)

| Technologie | Version | Usage |
|---|---|---|
| **NestJS** | ^11.1.16 | Framework backend (Node.js, architecture modulaire) |
| **TypeScript** | ^5.9.3 | Langage |
| **PostgreSQL** | 15 (alpine) | Base relationnelle (via TypeORM) |
| **MongoDB** | 7 | Base NoSQL (via Mongoose) |
| **TypeORM** | ^0.3.28 | ORM PostgreSQL |
| **Mongoose** | ^9.4.1 | ODM MongoDB |
| **Passport** | ^0.7.0 | Authentification (JWT + Google OAuth2) |
| **JWT** | @nestjs/jwt ^11 | Tokens d'authentification |
| **bcrypt** | ^6.0.0 | Hash des mots de passe |
| **Nodemailer** | ^8.0.5 | Envoi d'emails (SMTP) |
| **Swagger** | @nestjs/swagger ^11 | Documentation API |
| **class-validator** | ^0.15.1 | Validation des DTOs |
| **Joi** | ^18.0.2 | Validation de config |

### Frontend (`/frontend`)

| Technologie | Version | Usage |
|---|---|---|
| **Next.js** | 16.2.1 | Framework React (App Router, Server Components) |
| **React** | 19.2.4 | UI Library |
| **TypeScript** | ^5 | Langage |
| **Tailwind CSS** | ^4.2.2 | Styling utility-first |
| **Framer Motion** | ^12.38.0 | Animations |
| **Lucide React** | ^1.7.0 | Icônes |
| **PostCSS** | ^8.5.8 | Transformation CSS |

### Infrastructure

| Technologie | Usage |
|---|---|
| **Docker** + **Docker Compose** | Conteneurisation (4 services : db, mongo, api, web + minio unused) |
| **Cloudinary** | Stockage d'images en cloud (upload via SDK cloudinary) |
| **Réseau** | `tourisme_net` (external) |
| **Ports exposés** | API sur `3003`, Frontend sur `3004` |

---

## 5. Structure de la Base de Données

### PostgreSQL (Données relationnelles — 10 entités)

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
```

### MongoDB (Données NoSQL — 5 collections)

| Collection | Usage |
|---|---|
| `traveler_preferences` | Préférences voyageur (interêts, activités, objectifs) |
| `traveler_engagement` | Engagement voyageur (score, badges, stats) |
| `guide_skills` | Compétences guide (activités, paysages, certifications) |
| `guide_engagement` | Engagement guide (score, badges, stats) |
| `project_services` | Services des projets éco (offerts, pratiques) |

---

## 6. Modèle de Données Hybride (Polyglot Persistence)

Le projet utilise une approche **hybride PostgreSQL + MongoDB** :

- **PostgreSQL** : source de vérité pour les profils, scores, questionnaires (données transactionnelles, relationnelles, avec ACID)
- **MongoDB** : données flexibles et évolutives — préférences utilisateur, engagement, badges, compétences (documents JSON)

**Pourquoi ce choix ?** Les profils et questionnaires sont relationnels (clés étrangères, intégrité). Les préférences et badges sont des documents semi-structurés qui peuvent évoluer sans migration de schéma.

---

## 7. Architecture Modulaire Backend (NestJS)

```
src/
├── auth/             Authentification (register, login, JWT, Google OAuth)
├── users/            Gestion des utilisateurs (CRUD base)
├── eco-traveler/     Profil & scoring des voyageurs
├── guide/            Profil & scoring des guides
├── project-owner/    Profil & CRUD projets des propriétaires
├── offer/            Offres éco-touristiques (CRUD, scoring, workflow modération, catalogue items, prix, disponibilités, sessions)
├── booking/          Réservations (bookings, participants, confirmation, annulation)
├── circuit/          Circuits multi-jours (jours, programme, options, réservations)
├── notification/     Notifications utilisateur (création, lecture, compteur non-lues)
├── questionnaire/    QCM durabilité (soumission, scoring)
├── publication/      Publications sociales (places, expériences, likes, commentaires)
├── messages/         Messagerie privée (conversations, blocage)
├── follow/           Système d'abonnement entre utilisateurs
├── reports/          Signalements et modération
├── admin/            Panneau d'administration (validation, bannissement)
├── interactions/     Likes et commentaires génériques (multi-entités)
├── upload/           Upload d'images (Cloudinary)
├── mail/             Service d'envoi d'emails (Nodemailer)
├── config/           Configuration (env vars, validation Joi)
├── database/         Connexions DB (TypeORM + Mongoose)
└── common/           Guards, décorateurs, enums partagés
```

### Endpoints API principaux

| Endpoint | Méthode | Description |
|---|---|---|
| `POST /api/auth/register` | Public | Inscription |
| `POST /api/auth/login` | Public | Connexion |
| `POST /api/auth/refresh` | Public | Refresh token |
| `POST /api/auth/forgot-password` | Public | Mot de passe oublié |
| `POST /api/auth/reset-password` | Public | Réinitialisation |
| `GET /api/auth/google` | Public | Google OAuth |
| `GET /eco-traveler/profile` | Auth | Profil voyageur |
| `POST /eco-traveler/profile` | Auth | Compléter profil |
| `PATCH /eco-traveler/interests` | Auth | Màj centres d'intérêt |
| `POST /eco-traveler/onboarded` | Auth | Marquer onboarding |
| `GET /guide/profile` | Auth | Profil guide |
| `GET /project-owner/profile` | Auth | Profil propriétaire |
| `GET /project-owner/projects` | Auth | Liste projets |
| `POST /project-owner/projects` | Auth | Créer projet |
| `GET /questionnaire/active` | Public | Questionnaire actif |
| `POST /questionnaire/submit` | Auth | Soumettre réponses |
| `POST /offers` | Auth (Guide/Projet) | Créer une offre |
| `GET /offers` | Public | Toutes les offres approuvées |
| `GET /offers/mine` | Auth (Guide/Projet) | Mes offres (dashboard) |
| `GET /offers/author/:authorId` | Public | Offres publiques d'un auteur |
| `GET /offers/project/:projectId` | Public | Offres liées à un projet |
| `PATCH /offers/:id` | Auth (Guide/Projet) | Modifier une offre |
| `PATCH /offers/:id/sustainability` | Auth (Guide/Projet) | Màj score durabilité |
| `DELETE /offers/:id` | Auth (Guide/Projet) | Supprimer une offre |
| `POST /offers/:offerId/items` | Auth (Guide/Projet) | Créer un item vendable |
| `GET /offers/:offerId/items` | Public | Items d'une offre |
| `PATCH /offers/items/:itemId` | Auth (Guide/Projet) | Modifier un item |
| `DELETE /offers/items/:itemId` | Auth (Guide/Projet) | Supprimer un item |
| `POST /offers/items/:itemId/prices` | Auth (Guide/Projet) | Ajouter un prix à un item |
| `POST /offers/items/:itemId/availability` | Auth (Guide/Projet) | Règle de disponibilité |
| `POST /offers/items/:itemId/sessions` | Auth (Guide/Projet) | Créer une session |
| `GET /offers/items/:itemId/sessions` | Public | Sessions disponibles |
| `POST /bookings` | Auth (Éco-voyageur) | Créer une réservation |
| `GET /bookings/mine` | Auth (Éco-voyageur) | Mes réservations |
| `GET /bookings/incoming` | Auth (Guide/Projet) | Réservations reçues |
| `PATCH /bookings/:id/cancel` | Auth (Éco-voyageur) | Annuler une réservation |
| `PATCH /bookings/:id/confirm` | Auth (Guide/Projet) | Confirmer (mode manuel) |
| `POST /circuits` | Auth (Guide/Projet) | Créer un circuit |
| `GET /circuits` | Public | Circuits approuvés |
| `GET /circuits/:id` | Public | Détail circuit |
| `POST /circuits/:id/days` | Auth (Guide/Projet) | Ajouter un jour |
| `POST /circuits/:id/options` | Auth (Guide/Projet) | Ajouter une option |
| `POST /circuits/:id/reserve` | Auth (Éco-voyageur) | Réserver un circuit |
| `GET /notifications` | Auth (Tous) | Mes notifications |
| `PATCH /notifications/:id/read` | Auth (Tous) | Marquer lue |
| `PATCH /notifications/read-all` | Auth (Tous) | Tout marquer lu |
| `GET /notifications/unread` | Auth (Tous) | Compteur non lues |
| `GET /admin/offers/pending` | Admin | Offres en attente |
| `PATCH /admin/offers/:id/approve` | Admin | Approuver une offre |
| `PATCH /admin/offers/:id/reject` | Admin | Refuser une offre |

---

## 8. Module Offres Éco-Touristiques

### 8.1 Qu'est-ce qu'une offre ?

Une **offre éco-touristique** est une prestation/service proposée par un **guide** ou un **propriétaire de projet** sur la plateforme. Elle est visible sur la page publique **Destinations** après validation par l'administrateur.

### 8.2 Types d'offres

| Type | Description |
|---|---|
| `eco_tour` | Circuit / excursion écotouristique guidé |
| `accommodation` | Hébergement durable |
| `activity` | Activité ponctuelle (randonnée, kayak, etc.) |
| `restaurant` | Restauration éco-responsable |
| `craft` | Artisanat local |

### 8.3 Workflow de validation

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

- Les **ambassadeurs** (score ≥ 80) voient leurs offres auto-approuvées
- Sinon l'offre reste en `pending` jusqu'à validation par l'admin
- L'admin peut approuver ou refuser (avec raison)

### 8.4 Structure de la table `offers` (PostgreSQL)

| Champ | Type | Description |
|---|---|---|
| `id` | UUID (PK) | |
| `author_id` | UUID | Créateur (guide ou project_owner) |
| `author_type` | varchar | `guide` ou `project_owner` |
| `project_id` | UUID (FK nullable) | Projet associé (propriétaires uniquement) |
| `title` | varchar | Titre |
| `description` | text | Description |
| `price` | decimal | Prix |
| `duration` | varchar | Durée (texte libre : "2h", "3 jours") |
| `offer_type` | varchar | Type d'offre |
| `images` | simple-array | URLs des images |
| `inclusions` | text | Inclus dans l'offre |
| `region` | varchar | Région |
| `meeting_point` | varchar | Point de rendez-vous |
| `meeting_lat/lng` | decimal | Coordonnées GPS |
| `min/max_group_size` | int | Taille du groupe |
| `min_age` | int | Âge minimum |
| `cancellation_policy` | text | Politique d'annulation |
| `sustainability_score` | int | Score éco (0-100) |
| `status` | varchar | `pending`, `approved`, `rejected` |
| `rejection_reason` | text | Motif du refus |

### 8.5 Use Cases — Offres

#### 🗺️ Guide
- **Créer une offre** : Définit un circuit/activité (titre, description, prix, durée, lieu, groupe)
- **Lier à son projet** : Les guides peuvent rattacher l'offre à un projet existant
- **Voir ses offres** : Dashboard "Mes Offres" avec statut (en attente/approuvée/refusée)
- **Modifier/Supprimer** : Éditer les détails ou retirer une offre
- **Noter la durabilité** : Attribuer un score éco (0-100)

#### 🏗️ Propriétaire de Projet
- **Créer une offre liée** : Une offre rattachée à un projet (ex: "Séjour dans votre éco-gîte")
- **CRUD complet** : Créer, consulter, modifier, supprimer ses offres
- **Validation projet requis** : L'offre ne peut être créée que si le projet est `active`

#### 🧳 Éco-Voyageur
- **Parcourir les offres** : Page Destinations avec filtres (type, région, prix, score)
- **Voir les détails** : Modal avec photos, description, inclus, carte, politique d'annulation
- **Contacter le créateur** : Via messagerie intégrée

#### 👑 Admin
- **Modérer les offres** : Liste des offres en attente avec aperçu
- **Approuver/Refuser** : Valide la qualité avant publication
- **Motif de refus** : Raison communiquée au créateur

### 8.6 Routes frontend liées aux offres

| Route | Page |
|---|---|
| `/destinations` | Vitrine publique des offres approuvées |
| `/admin` | Gestion des offres en attente (onglet "Offers") |
| Dashboard guide/propriétaire | CRUD de ses propres offres |
| Profil public guide/propriétaire | Offres publiées par l'utilisateur |

---

## 9. Publications — Partage de lieux & expériences

### 9.1 Concept
Les **voyageurs** peuvent partager leurs découvertes via des **publications** de deux types :
- **`place`** : Recommandation d'un lieu (avec coordonnées GPS, nom du lieu, région)
- **`experience`** : Récit d'expérience de voyage (avec photos, description)

### 9.2 Workflow
- Les **places** sont soumises à modération (sauf pour les **Ambassadeurs**)
- Les **experiences** sont publiées immédiatement
- Chaque publication contribue au score `partages` (20% du score final)

### 9.3 Interactions sociales
| Action | Description |
|---|---|
| **Like** | Toggle like sur une publication |
| **Commentaire** | Texte avec replies (1 niveau) |
| **Like commentaire** | Toggle like sur un commentaire |

### 9.4 Use cases
- 🧳 **Voyageur** : Crée des publications (places/expériences), like, commente
- 👑 **Admin** : Modère les places en attente, approuve/refuse

---

## 10. Messagerie privée

### 10.1 Concept
Messagerie interne entre utilisateurs avec système de **conversations**.

### 10.2 Règles de messagerie
| Expéditeur | Destinataire |
|---|---|
| Éco-voyageur | Guide ou Propriétaire |
| Guide | Propriétaire |
| Propriétaire | Guide |

### 10.3 Endpoints
| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/messages/conversations` | Créer/obtenir une conversation |
| `GET` | `/api/messages/conversations` | Lister ses conversations |
| `GET` | `/api/messages/conversations/:id` | Détails d'une conversation |
| `DELETE` | `/api/messages/conversations/:id` | Supprimer une conversation |
| `GET` | `/api/messages/conversations/:id/messages` | Messages (marque lus) |
| `POST` | `/api/messages` | Envoyer un message |

### 10.4 Use cases
- 🧳 **Voyageur** : Contacte un guide ou propriétaire pour réserver
- 🗺️ **Guide** : Répond aux voyageurs, contacte propriétaires
- 🏗️ **Propriétaire** : Répond aux voyageurs et guides

---

## 11. Système de Follow (Abonnements)

### 11.1 Concept
Les utilisateurs peuvent **suivre** d'autres utilisateurs (guides, propriétaires) pour rester informés.

### 11.2 Règles de follow
| Followeur | Followé |
|---|---|
| Éco-voyageur | Guide ou Propriétaire |
| Guide | Propriétaire |
| Propriétaire | Guide |

### 11.3 Endpoints
| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/follows/:targetId/:targetType` | Follow un utilisateur |
| `DELETE` | `/api/follows/:targetId` | Unfollow |
| `GET` | `/api/follows/following` | Mes abonnements |
| `GET` | `/api/follows/followers` | Mes followers |
| `GET` | `/api/follows/following/profiles` | Abonnements avec profils |
| `GET` | `/api/follows/followers/profiles` | Followers avec profils |
| `GET` | `/api/follows/followers/public/:userId` | Followers d'un utilisateur |
| `GET` | `/api/follows/count` | Nombre de followers |
| `GET` | `/api/follows/status/:targetId` | Vérifier si je follow |

---

## 12. Administration & Modération

### 12.1 Rôle Admin
Le panneau d'administration permet de gérer l'ensemble du contenu soumis.

### 12.2 Actions de modération
| Contenu | Actions |
|---|---|
| **Offres** | Approuver / Refuser les offres en attente |
| **Projets** | Approuver / Refuser les projets |
| **Publications** | Approuver / Refuser les places partagées |
| **Signalements** | Résoudre les signalements (bannissement) |
| **Utilisateurs** | Bannir / Débannir |

### 12.3 Systeme de signalement
Tout utilisateur peut signaler un contenu inapproprié. L'admin examine et peut bannir l'utilisateur (temporairement ou définitivement). Un email est envoyé automatiquement lors du bannissement/débannissement.

---

## 13. Système de Score de Durabilité (AFRATIM)

Le score final est calculé avec cette pondération :

```
Score Final = Questionnaire × 20% + Réservations × 40% + Feedbacks × 20% + Partages × 20%
```

Niveaux :

| Score | Label |
|---|---|
| ≥ 80 | Ambassadeur durable |
| ≥ 60 | Écovoyageur engagé |
| ≥ 40 | Voyageur sensible |
| < 40 | Voyageur classique |

---

## 14. Routes Frontend (Next.js App Router)

| Route | Page |
|---|---|
| `/` | Landing page (Hero, HowItWorks, Featured, Newsletter) |
| `/auth/login` | Connexion |
| `/auth/register` | Inscription (avec choix de rôle) |
| `/auth/forgot-password` | Mot de passe oublié |
| `/auth/reset-password` | Réinitialisation |
| `/auth/check-email` | Confirmation email envoyé |
| `/auth/callback` | Callback OAuth (storing tokens) |
| `/onboarding/eco-traveler` | Onboarding voyageur |
| `/onboarding/guide` | Onboarding guide |
| `/onboarding/project-owner` | Onboarding propriétaire |
| `/questionnaire/eco-traveler` | QCM durabilité voyageur |
| `/questionnaire/guide` | QCM durabilité guide |
| `/questionnaire/project-owner` | QCM durabilité propriétaire |
| `/dashboard` | Dashboard générique |
| `/dashboard/profile` | Profil / paramètres |
| `/destinations` | Vitrine publique des offres avec filtres et carte |
| `/destinations` | Vitrine publique des offres avec filtres et carte |
| `/admin` | Panneau d'administration (offres, projets, pubs, signalements) |
| `/messagerie` | Messagerie privée |
| `/profile/ecovoyageur` | Profil public voyageur |
| `/profile/ecovoyageur/[userId]` | Profil public voyageur (dynamique) |
| `/profile/guide` | Profil public guide |
| `/profile/project-owner` | Profil public propriétaire |
| `/profile/project-owner/[userId]` | Profil public propriétaire (dynamique) |

---

## 15. Use Cases par Rôle

### 🧳 Éco-Voyageur
- S'inscrit, se connecte (email ou Google)
- Complète son onboarding (type voyageur, motivations, intérêts, paysages, objectifs)
- Passe le questionnaire de durabilité (score initial)
- Parcourt les offres éco-touristiques sur la page Destinations (filtres, carte, recherche)
- Consulte le détail d'une offre (photos, description, inclus, carte, politique d'annulation)
- Contacte le créateur d'une offre via messagerie
- **Follow des guides et propriétaires** pour suivre leurs actualités
- **Partage des lieux (places)** et des **expériences de voyage (experiences)**
- **Like et commente** les publications des autres voyageurs
- **Voit ses followers et abonnements** sur son profil public
- Voit son tableau de bord avec score, badges, plans de voyage, stats d'engagement
- Consulte son **profil public** avec ses expériences, lieux partagés, et statistiques

### 🗺️ Guide
- Crée un profil (type guide, zone, spécialités, langues, années d'expérience, certifications)
- Passe l'évaluation de durabilité
- **Crée et gère ses offres éco-touristiques** (circuits, activités, etc.)
- **Soumet ses offres à validation** (statut pending → approved/rejected)
- **Auto-approbation si Ambassadeur** (score ≥ 80)
- **Attribue un score de durabilité** à chaque offre (0-100)
- **Reçoit des messages** des voyageurs intéressés par ses offres
- **Follow des propriétaires de projet**
- **Voit ses followers** (voyageurs et propriétaires)
- Gère ses circuits et réservations
- Reçoit des avis et accumule des badges

### 🏗️ Propriétaire de Projet
- Crée un profil (organisation, poste, bio)
- Ajoute/modifie/supprime des projets éco-touristiques (hébergement, restauration, artisanat, etc.)
- **Crée des offres liées à ses projets** (ex: séjour dans son éco-gîte)
- **Soumet ses offres à validation** (nécessite un projet actif)
- **Reçoit des messages** des voyageurs et guides
- **Follow des guides**
- **Voit ses followers** (voyageurs et guides)
- Définit des labels éco (panneaux solaires, zéro plastique, etc.)
- Passe l'évaluation de durabilité
- Gère les réservations reçues

---

## 16. Déploiement

L'infrastructure est **100% Docker** :
- `docker compose up` démarre les services (db, mongo, api, web ; minio présent mais non utilisé — images via Cloudinary)
- Le réseau `tourisme_net` doit être créé au préalable (`external: true`)
- Variables d'environnement dans `.env` / `.env.production`
- Adresse de prod frontend : `http://91.134.139.163:3004`
- Adresse de prod API : `http://91.134.139.163:3003/api`

### Cloudinary (Stockage d'images)

Le projet utilise **Cloudinary** comme service de stockage d'images.

**Fonctionnement :**
1. L'utilisateur upload une image via `POST /api/upload` (auth requis, multer, limite 10MB)
2. L'API téléverse le fichier vers Cloudinary via `cloudinary.uploader.upload_stream()` dans le dossier `eco-tourism`
3. L'API retourne l'URL sécurisée Cloudinary
4. Pour supprimer : `UploadService.deleteByUrl(url)` — extrait le public_id et appelle `cloudinary.uploader.destroy()`

**Variables d'environnement :**

```
CLOUDINARY_CLOUD_NAME=votre_cloud
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

---

## 17. Observations Techniques

- **Projet en développement actif** (Next.js 16, React 19, NestJS 11 — versions très récentes)
- **Pas de CI/CD** configuré dans le repo
- **`synchronize: true`** en TypeORM (pratique en dev, dangereux en prod)
- **Frontend sans gestion d'état** (localStorage uniquement — pas de Zustand/Redux/Context)
- **Pas de tests e2e** complets (uniquement des fichiers `.spec.ts` dans le backend)
- **Design Material You / Google-like** (Material Symbols, arrondis, ombres)
- **Interface 100% en français**
- **Double base de données** (PostgreSQL + MongoDB) pour un modèle hybride relationnel/NoSQL
- **Authentification avec refresh token rotation** (sécurité renforcée)
- **Modules sociaux complets :** Publications (places/expériences), Messagerie privée, Follow, Signalements
- **Panneau Admin :** validation offres/projets/publications, gestion des signalements, bannissement

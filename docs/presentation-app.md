# Présentation de l'application — Éco-Voyage

## 1. Qu'est-ce qu'Éco-Voyage ?

**Éco-Voyage** est une plateforme web de **tourisme durable / éco-tourisme** qui connecte trois types d'acteurs :

- Les **voyageurs éco-responsables** (Écovoyageurs)
- Les **guides locaux et professionnels**
- Les **propriétaires de projets éco-touristiques** (hébergements, restaurants, agences, artisanat, centres de loisir)

L'objectif est de promouvoir un tourisme respectueux de l'environnement via un système de **score de durabilité** et de **badges** gamifiant l'engagement écologique.

### Stack technique

| Couche | Technologie |
|---|---|
| Backend | NestJS 11 (Node.js) |
| Frontend | Next.js 16 (React 19, Tailwind v4) |
| Base relationnelle | PostgreSQL 15 (TypeORM) |
| Base NoSQL | MongoDB 7 (Mongoose) |
| Auth | JWT + Google OAuth2 |
| Conteneurisation | Docker Compose |

---

## 2. Authentification (Auth)

### 2.1 Inscription (Register)

**Route :** `POST /api/auth/register`

**Frontend :** `/auth/register` — formulaire avec email, mot de passe, choix du rôle.

**Flux backend :**
1. Vérifie que l'email n'existe pas déjà
2. Hash le mot de passe avec bcrypt (10 rounds)
3. Crée l'utilisateur dans la table `users` avec `status = PENDING`, `auth_method = 'email'`
4. Génère un token de vérification (`randomBytes(32)`, hex, 24h d'expiration)
5. Sauvegarde le token sur l'enregistrement utilisateur
6. Envoie un email de vérification via `MailService` (Nodemailer SMTP)
7. Retourne `{ message: "User created. Verification email sent." }`

### 2.2 Vérification d'email

**Route :** `GET /api/auth/verify-email?token=...`

1. `usersService.activateUserByToken(token)` — trouve l'utilisateur par token, vérifie l'expiration
2. Passe `status = ACTIVE`, `email_verified_at = now()`, efface le token
3. Génère un JWT access token (`sub`, `email`, `role` dans le payload)
4. Génère un refresh token (`randomBytes(64)`, hex, 7 jours d'expiration)
5. Sauvegarde le refresh token sur l'utilisateur
6. Redirige vers `{FRONTEND_URL}/auth/callback?accessToken=...&refreshToken=...`

### 2.3 Connexion (Login)

**Route :** `POST /api/auth/login`

**Frontend :** `/auth/login` — formulaire email + mot de passe.

1. Trouve l'utilisateur par email
2. Compare le mot de passe avec bcrypt
3. Vérifie que `email_verified_at` est renseigné et `status = ACTIVE`
4. Génère JWT access token + refresh token
5. Sauvegarde le refresh token
6. Retourne `{ access_token, refresh_token, user, dashboard }`

→ Les tokens sont stockés dans `localStorage`. L'utilisateur est redirigé vers `result.dashboard`.

### 2.4 Google OAuth

**Route :** `GET /api/auth/google` → redirige vers Google.

**Callback :** `GET /api/auth/google/callback`

1. `GoogleStrategy` (passport-google-oauth20) récupère le profil Google
2. Trouve ou crée l'utilisateur (rôle `ECO_TRAVELER` par défaut)
3. Génère JWT + refresh token
4. Redirige vers `{FRONTEND_URL}/auth/callback?accessToken=...`

### 2.5 Refresh Token

**Route :** `POST /api/auth/refresh`

- Appelé **automatiquement** par `lib/api.ts` côté frontend quand une requête reçoit un 401
- Rotation de tokens : ancien refresh token invalidé, nouveau généré
- Si le refresh échoue, les tokens sont effacés du localStorage et redirection vers `/auth/login`

### 2.6 Mot de passe oublié / Réinitialisation

**Routes :**
- `POST /api/auth/forgot-password` — envoie un email avec un lien de réinitialisation (token hex, 1h d'expiration)
- `POST /api/auth/reset-password` — valide le token, hash le nouveau mot de passe, met à jour l'utilisateur

### 2.7 Déconnexion (Logout)

**Route :** `POST /api/auth/logout`

- Efface le `refresh_token` de l'utilisateur en base
- Frontend : vide `access_token`, `refresh_token`, `user` du localStorage

### Enums utilisés

| Enum | Valeurs |
|---|---|
| `Role` | `eco_traveler`, `project`, `guide`, `admin` |
| `UserStatus` | `pending`, `active`, `banned`, `archived` |
| `AuthMethod` | `email` |

---

## 3. Onboarding — Parcours guidé (3 rôles)

### 3.1 Éco-Voyageur (5 étapes)

Après inscription, l'utilisateur est redirigé vers `/onboarding/eco-traveler`.

#### Étape 1 — Identité

**Route :** `POST /api/eco-traveler/profile`

| Champ | Type | Requis |
|---|---|---|
| `full_name` | string | Oui |
| `bio` | text | Non |
| `country` | string | Oui |
| `language` | string | Oui |
| `photo` | string (base64) | Non |

**Backend :**
- Crée une ligne dans la table `eco_travelers`
- Initialise un document MongoDB `traveler_engagement` (score=0, badges=[], compteurs=0)

#### Étape 2 — Type de voyageur

**Route :** `PATCH /api/eco-traveler/traveler-types`

| Champ | Valeurs possibles |
|---|---|
| `traveler_types[]` | `solo`, `couple`, `family`, `group`, `digital_nomad`, `slow_traveler`, `explorer`, `adventure` |

Multi-sélection (1 ou plusieurs).

#### Étape 3 — Motivations & Valeurs

**Route :** `PATCH /api/eco-traveler/motivations`

| Champ | Valeurs possibles |
|---|---|
| `motivations[]` | `cultural_discovery`, `nature`, `adventure`, `outdoor_sport`, `relaxation`, `local_immersion`, `gastronomy`, `photography` |
| `sustainability_values[]` | `support_local_economy`, `protect_biodiversity`, `reduce_carbon`, `responsible_tourism`, `respect_cultures`, `local_consumption`, `avoid_mass_tourism` |

**Backend :** Synchronise les motivations dans MongoDB `traveler_preferences`.

#### Étape 4 — Centres d'intérêt & Paysages

**Route :** `PATCH /api/eco-traveler/interests`

| Champ | Type |
|---|---|
| `interests[]` | Tableau `{ name, level }` où level = `beginner`, `intermediate`, `advanced` |
| `landscapes[]` | `mountain`, `desert`, `sea`, `forest`, `lake`, `village`, `archaeology`, `oasis` |
| `travel_styles[]` | `adventure`, `cultural`, `nature`, `sport`, `slow_tourism`, `eco_tourism`, `wellness`, `photography` |

**Intérêts disponibles :** Randonnée, Spéléologie, Vélo, Kayak, Gastronomie, Artisanat, Photographie, Observation faune, Culture, Patrimoine

**Backend :** Synchronise dans MongoDB `traveler_preferences`.

#### Étape 5 — Objectifs durables

**Route :** `PATCH /api/eco-traveler/goals`

| Champ | Valeurs possibles |
|---|---|
| `sustainability_goals[]` | `reduce_carbon`, `support_local_projects`, `preserve_biodiversity`, `avoid_mass_tourism`, `support_local_crafts`, `promote_local_culture` |

**Backend :** Synchronise dans MongoDB `traveler_preferences`.

#### Finalisation

**Route :** `POST /api/eco-traveler/onboarded`

- Passe `is_onboarded = true` sur `eco_travelers`
- Débloque le badge **"Explorateur Durable"** dans MongoDB `traveler_engagement`
- Redirige vers `/dashboard/ecovoyageur`

#### Calcul du pourcentage de complétion

| Critère | Pondération |
|---|---|
| Identité (full_name, country, language, bio) | 30% |
| traveler_types | 10% |
| Motivations & valeurs | 10% |
| Intérêts | 15% |
| Landscapes | 8% |
| Travel styles | 7% |
| Objectifs | 10% |
| Photo | 10% |

---

### 3.2 Guide (4 étapes)

Après inscription, redirigé vers `/onboarding/guide`.

#### Étape 1 — Identité

**Route :** `POST /api/guide/profile`

| Champ | Requis |
|---|---|
| `full_name` | Oui |
| `bio` | Non |
| `country` | Oui |
| `language` | Oui |
| `photo` | Non |
| `zone` (zone d'activité géographique) | Oui |

**Backend :**
- Crée une ligne dans la table `guides`
- Initialise MongoDB `guide_engagement`

#### Étape 2 — Type de guide

**Route :** `POST /api/guide/profile` (même endpoint, avec `guide_type`)

| Champ | Valeurs |
|---|---|
| `guide_type` | `local` ou `professionnel` |

#### Étape 3 — Spécialités & Langues

**Route :** `PATCH /api/guide/specialties`

| Champ | Valeurs possibles |
|---|---|
| `specialties[]` | `randonnee`, `ornithologie`, `photographie`, `culture`, `gastronomie`, `kayak`, `speleologie`, `vtt`, `safari`, `astronomie` |
| `languages_spoken[]` | `fr`, `ar`, `en`, `es`, `de`, `it` |

**Backend :** Synchronise dans MongoDB `guide_skills.activities`.

#### Étape 4 — Expérience & Terrains

**Route :** `PATCH /api/guide/experience`

| Champ | Type |
|---|---|
| `years_experience` | Nombre (0-30) |
| `landscapes[]` | `mountain`, `desert`, `sea`, `forest`, `oasis`, `village`, `archaeology`, `lake` |
| `certifications[]` | `Guide certifié Eco-Voyage`, `Premiers secours/PSC1`, `Guide de montagne agréé`, `Formation éco-tourisme`, `Brevet de guide touristique`, `Certification environnement` |

**Backend :** Synchronise dans MongoDB `guide_skills`.

#### Finalisation

**Route :** `POST /api/guide/onboarded`

- `is_onboarded = true` sur `guides`
- Badge **"Guide Eco-Certifié"**
- Redirige vers `/dashboard/guide`

#### Calcul du pourcentage de complétion

| Critère | Pondération |
|---|---|
| Identité (full_name, country, language, bio) | 30% |
| guide_type | 10% |
| zone | 10% |
| Spécialités | 15% |
| Langues | 10% |
| Années d'expérience | 15% |
| Photo | 10% |

---

### 3.3 Propriétaire de projet (2 étapes)

Après inscription, redirigé vers `/onboarding/project-owner`.

#### Étape 1 — Identité

**Route :** `POST /api/project-owner/profile`

| Champ | Requis |
|---|---|
| `full_name` | Oui |
| `bio` | Non |
| `country` | Oui |
| `language` | Oui |
| `photo` | Non |

**Backend :**
- Crée une ligne dans la table `project_owners`
- Initialise MongoDB `project_engagement`

#### Étape 2 — Organisation

**Route :** `POST /api/project-owner/profile` (même endpoint, avec données org)

| Champ | Requis |
|---|---|
| `organization` | Oui |
| `position` | Non |
| `phone` | Non |

#### Finalisation

**Route :** `POST /api/project-owner/onboarded`

- `is_onboarded = true` sur `project_owners`
- Badge **"Propriétaire Éco-Engagé"**
- Redirige vers `/dashboard/project-owner`

#### Calcul du pourcentage de complétion

| Critère | Pondération |
|---|---|
| Identité (full_name, country, language) | 30% |
| organization | 20% |
| position | 15% |
| bio | 15% |
| phone | 10% |
| photo | 10% |

---

## 4. Questionnaire de durabilité

### 4.1 Structure (PostgreSQL)

**Tables :**
- `questionnaires` — 1 par `target_type` (`eco_traveler`, `guide`, `eco_project`), avec `version`, `is_active`, `max_score`
- `question_categories` — 3 catégories : `environmental`, `social`, `economic`
- `questions` — liée à un questionnaire et une catégorie, avec `question_text`, `weight`, `question_order`
- `answers` — 4 réponses par question, chacune avec `score` (1 à 4) et `answer_order`

### 4.2 Nombre de questions

| Cible | Nb questions |
|---|---|
| Éco-voyageur | 11 |
| Guide | 10 |
| Propriétaire | 10 |

### 4.3 Flux frontend

Les pages `/questionnaire/{eco-traveler|guide|project-owner}` suivent le même pattern :

1. Au montage : `GET /api/questionnaire/my-attempt` — vérifie si déjà complété
2. Si déjà fait : affiche le score directement
3. Sinon : `GET /api/questionnaire/active?type={eco_traveler|guide|eco_project}` — récupère les questions
4. Présente les questions une par une avec 4 choix (A/B/C/D)
5. Avance automatiquement 400ms après sélection
6. À la fin : `POST /api/questionnaire/submit`

### 4.4 Soumission backend

**Route :** `POST /api/questionnaire/submit`

1. Valide que le questionnaire existe
2. Vérifie que l'utilisateur n'a pas déjà soumis
3. Charge toutes les réponses et questions en une requête
4. Crée un enregistrement `questionnaire_attempt`
5. Calcule :
   - `totalScore` = somme des scores de toutes les réponses
   - `envScore` / `socialScore` / `economicScore` = somme par catégorie
   - `maxScore` = `answers.length × 4`
   - `score_percentage` = `Math.round((totalScore / maxScore) × 100)`
   - Pourcentages par catégorie
6. Sauvegarde les `user_answers` individuelles
7. Met à jour le score du rôle : `updateQuestionnaireScore(userId, percentage)`
8. Retourne `{ attempt_id, score_total, score_percentage, environmental_score, social_score, economic_score, profile, message }`

---

## 5. Système de Score de Durabilité (AFRATIM)

### 5.1 Formules par rôle

**Éco-Voyageur :**
```
Score Final = Questionnaire × 20% + Réservations × 40% + Avis × 20% + Partages × 20%
```

**Guide :**
```
Score Final = Questionnaire × 40% + Réservations × 40% + Avis × 20%
```

**Propriétaire de projet :**
```
Score Final = Questionnaire × 40% + Réservations × 40% + Avis × 20%
```

> Tous les composants sont des scores sur 100. Seul le Questionnaire est implémenté pour l'instant ; Réservations, Avis et Partages sont prévus pour des sprints futurs.

### 5.2 Seuils et labels

| Score | Label Éco-Voyageur | Label Guide | Label Propriétaire |
|---|---|---|---|
| >= 80 | Ambassadeur durable | Guide Ambassadeur | Propriétaire Ambassadeur |
| >= 60 | Écovoyageur engagé | Guide Expert | Propriétaire Engagé |
| >= 40 | Voyageur sensible | Guide Engagé | Propriétaire Sensible |
| < 40 | Voyageur classique | Guide en Développement | Propriétaire en Développement |

---

## 6. Badges

Stockés dans MongoDB (documents d'engagement).

### 6.1 Badges d'onboarding

| Rôle | Badge | Déclencheur |
|---|---|---|
| Éco-Voyageur | **Explorateur Durable** | Onboarding terminé |
| Guide | **Guide Éco-Certifié** | Onboarding terminé |
| Propriétaire | **Propriétaire Éco-Engagé** | Onboarding terminé |

### 6.2 Badges de score

| Rôle | Badge | Condition |
|---|---|---|
| Éco-Voyageur | **Ambassadeur AFRATIM** | Score >= 80 |
| Guide | **Guide Ambassadeur AFRATIM** | Score >= 80 |
| Propriétaire | **Propriétaire Ambassadeur AFRATIM** | Score >= 80 |

### 6.3 Badges futurs (frontend uniquement)

| Rôle | Badge | Condition (prévue) |
|---|---|---|
| Éco-Voyageur | Contributeur Communautaire | 3 plans partagés |
| Éco-Voyageur | Protecteur de la Nature | 10 réservations durables |
| Guide | Guide Expert | 10 réservations gérées |
| Guide | Formateur Durable | 5 évaluations reçues |
| Propriétaire | Projet d'Excellence | 10 réservations gérées |
| Propriétaire | Champion Durable | 5 évaluations reçues |

---

## 7. Dashboard par rôle

### 7.1 Éco-Voyageur (`/dashboard/ecovoyageur`)

**Sidebar :** Dashboard, Explorer, Mes Voyages, Impact Éco, Favoris, Paramètres + Déconnexion

**Affichage :**
- Barre de complétion du profil
- En-tête : nom, label de score, barre de recherche, notifications, photo
- Bannière : si score === null (pas de questionnaire), invite à passer le test
- **Grille de stats :**
  - Score de durabilité (0-100) : vert >= 80, primaire >= 60, orange >= 40, rouge < 40
  - Décomposition du score : Questionnaire (20%), Réservations (40%), Avis (20%), Partages (20%)
  - Nombre de plans partagés, nombre de réservations
- **Plans de Voyage :** 3 exemples statiques avec images, dates, statuts, éco-notes
- **Badges :** 4 emplacements (Explorateur Durable, Ambassadeur, Contributeur Communautaire, Protecteur de la Nature) avec état déverrouillé/verrouillé et date d'obtention
- **Stats d'engagement :** Avis donnés, Plans partagés, Réservations

### 7.2 Guide (`/dashboard/guide`)

**Sidebar :** Tableau de bord, Mes Circuits, Réservations, Mes Avis, Certifications, Paramètres

**Affichage :**
- Barre de complétion du profil + bouton "Passer l'évaluation"
- Bannière si pas de questionnaire
- **Grille de stats :**
  - Score de durabilité avec décomposition
  - Réservations traitées, Avis reçus
- **Spécialités :** Zone d'activité, type de guide, années d'expérience, statut, spécialités (chips), certifications, langues parlées
- **Badges :** Guide Éco-Certifié, Guide Ambassadeur, Guide Expert, Formateur Durable

### 7.3 Propriétaire de projet (`/dashboard/project-owner`)

**Sidebar :** Tableau de bord, Mes Projets, Réservations, Avis reçus, Certifications, Paramètres

**Affichage :**
- Barre de complétion du profil + "Passer l'évaluation"
- Bannière si pas de questionnaire
- **Grille de stats :** Score, Projets, Réservations
- **Liste des projets :** Nom, type, description, région, site web, labels éco, statut. État vide avec CTA pour créer le premier projet
- **Modal d'ajout de projet :** Nom*, Type*, Description, Région, Téléphone, Site web, Pratiques éco (checkboxes)
- **Badges :** Propriétaire Éco-Certifié, Ambassadeur, Projet d'Excellence, Champion Durable

---

## 8. Gestion de projets (CRUD propriétaire)

### Endpoints

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/project-owner/projects` | Liste des projets du propriétaire |
| `POST` | `/api/project-owner/projects` | Créer un projet |
| `PATCH` | `/api/project-owner/projects/:id` | Modifier un projet (propriétaire seulement) |
| `DELETE` | `/api/project-owner/projects/:id` | Supprimer un projet (propriétaire seulement) |

### Champs d'un projet (table `projects`)

| Champ | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-généré |
| `owner_id` | UUID (FK) | → `project_owners.user_id` |
| `name` | varchar | Requis |
| `project_type` | varchar | `hebergement`, `restauration`, `artisanat`, `agence`, `centre_loisir` |
| `description` | text | |
| `region` | varchar | |
| `address` | varchar | |
| `photo` | text | Base64 ou URL |
| `status` | varchar | Défaut `pending` |
| `services` | simple-array | |
| `eco_labels` | simple-array | Labels éco du projet |
| `website` | varchar | |
| `phone` | varchar | |

### Labels éco disponibles

Panneaux solaires, Eau recyclée, Zéro plastique, Produits locaux, Compostage, Éco-certification, Véhicules électriques, Éclairage LED

---

## 9. Gestion d'offres (Offres éco-touristiques)

### 9.1 Qu'est-ce qu'une offre ?

Une **offre éco-touristique** est une prestation/service proposée par un **guide** ou un **propriétaire de projet** sur la plateforme. Elle est visible sur la page publique **Destinations** après validation par l'administrateur.

### 9.2 Types d'offres

| Type | Description |
|---|---|
| `eco_tour` | Circuit / excursion écotouristique guidé |
| `accommodation` | Hébergement durable |
| `activity` | Activité ponctuelle (randonnée, kayak, etc.) |
| `restaurant` | Restauration éco-responsable |
| `craft` | Artisanat local |

### 9.3 Endpoints

| Méthode | Route | Protection | Description |
|---|---|---|---|
| `POST` | `/api/offers` | Auth (Guide/Projet) | Créer une offre |
| `GET` | `/api/offers` | Public | Toutes les offres approuvées |
| `GET` | `/api/offers/mine` | Auth (Guide/Projet) | Mes offres (dashboard) |
| `GET` | `/api/offers/author/:authorId` | Public | Offres publiques d'un auteur |
| `GET` | `/api/offers/project/:projectId` | Public | Offres liées à un projet |
| `PATCH` | `/api/offers/:id` | Auth (Guide/Projet) | Modifier une offre |
| `PATCH` | `/api/offers/:id/sustainability` | Auth (Guide/Projet) | Màj score durabilité |
| `DELETE` | `/api/offers/:id` | Auth (Guide/Projet) | Supprimer une offre |
| `GET` | `/api/admin/offers/pending` | Admin | Offres en attente |
| `PATCH` | `/api/admin/offers/:id/approve` | Admin | Approuver une offre |
| `PATCH` | `/api/admin/offers/:id/reject` | Admin | Refuser une offre |

### 9.4 Workflow de validation

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
- L'admin peut approuver ou refuser (avec raison transmise au créateur)

### 9.5 Structure de la table `offers` (PostgreSQL)

| Champ | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-généré |
| `author_id` | UUID | Créateur (guide ou project_owner) |
| `author_type` | varchar | `guide` ou `project_owner` |
| `project_id` | UUID (FK nullable) | Projet associé (propriétaires uniquement) |
| `title` | varchar | Requis |
| `description` | text | |
| `price` | decimal | |
| `duration` | varchar | Texte libre : "2h", "1 journée", "3 jours" |
| `offer_type` | varchar | `eco_tour`, `accommodation`, `activity`, `restaurant`, `craft` |
| `images` | simple-array | URLs |
| `inclusions` | text | Ce qui est inclus |
| `region` | varchar | |
| `meeting_point` | varchar | Point de rendez-vous |
| `meeting_lat` | decimal (10,7) | Latitude |
| `meeting_lng` | decimal (10,7) | Longitude |
| `min_group_size` | int | Taille minimum du groupe |
| `max_group_size` | int | Taille maximum du groupe |
| `min_age` | int | Âge minimum requis |
| `cancellation_policy` | text | Politique d'annulation |
| `sustainability_score` | int | Score éco (0-100) |
| `status` | varchar | `pending`, `approved`, `rejected` |
| `rejection_reason` | text | Motif du refus admin |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### 9.6 Use Cases — Offres par rôle

#### 🗺️ Guide
- **Créer une offre** : Définit un circuit/activité (titre, description, prix, durée, lieu, groupe)
- **Lier ou non à un projet** : Peut rattacher l'offre à un projet existant
- **Voir ses offres** : Dashboard "Mes Offres" avec statut (en attente/approuvée/refusée)
- **Modifier/Supprimer** : Éditer les détails ou retirer une offre
- **Noter la durabilité** : Attribuer un score éco (0-100) via `PATCH /offers/:id/sustainability`

#### 🏗️ Propriétaire de Projet
- **Créer une offre liée** : Une offre rattachée à un projet existant (ex: séjour dans son éco-gîte)
- **Validation projet requis** : L'offre ne peut être créée que si le projet est en statut `active`
- **CRUD complet** : Créer, consulter, modifier, supprimer ses offres depuis le dashboard

#### 🧳 Éco-Voyageur
- **Parcourir les offres** : Page Destinations avec filtres par type, région, prix, score
- **Voir les détails** : Modal avec photos, description, inclusions, carte interactive, politique d'annulation
- **Contacter le créateur** : Via la messagerie intégrée

#### 👑 Admin
- **Modérer les offres** : Onglet "Offers" du panneau admin — aperçu des offres en attente avec photos
- **Approuver** : L'offre devient visible publiquement sur Destinations
- **Refuser** : Motif de refus communiqué au créateur

### 9.7 Routes frontend liées aux offres

| Route | Page |
|---|---|
| `/destinations` | Vitrine publique des offres approuvées (filtres, carte, modale détail) |
| `/admin` | Gestion des offres en attente (approbation/rejet) |
| Dashboard guide/propriétaire | CRUD de ses propres offres |
| Profil public guide/propriétaire | Offres publiées par l'utilisateur |

---

## 10. Publications — Partage de lieux & expériences

### 10.1 Concept
Les **voyageurs** peuvent partager leurs découvertes écotouristiques via des **publications**. Deux types :

| Type | Description | Modération |
|---|---|---|
| **`place`** | Recommandation d'un lieu avec coordonnées GPS, nom, région | `pending` → approuvée par admin (sauf Ambassadeur → auto-approvée) |
| **`experience`** | Récit d'expérience de voyage avec photos et description | `approved` immédiatement |

### 10.2 Endpoints

| Méthode | Route | Protection | Description |
|---|---|---|---|
| `POST` | `/api/publications` | Auth (Voyageur) | Créer une publication |
| `GET` | `/api/publications/mine` | Auth (Voyageur) | Mes publications (tous statuts) |
| `GET` | `/api/publications/experiences` | Public | Expériences approuvées (max 12) |
| `GET` | `/api/publications/author/:authorId` | Public | Publications approuvées d'un auteur |
| `PATCH` | `/api/publications/:id` | Auth (Voyageur) | Modifier sa publication |
| `DELETE` | `/api/publications/:id` | Auth (Voyageur) | Supprimer sa publication |

### 10.3 Interactions
| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/publications/:id/like` | Toggle like |
| `POST` | `/api/publications/:id/comments` | Ajouter un commentaire |
| `POST` | `/api/publications/comments/:commentId/reply` | Répondre à un commentaire (1 niveau) |
| `POST` | `/api/publications/comments/:commentId/like` | Toggle like sur un commentaire |
| `DELETE` | `/api/publications/comments/:commentId` | Supprimer son commentaire |
| `GET` | `/api/publications/:id/interactions` | Compter likes + commentaires |
| `GET` | `/api/publications/:id/likes` | Liste des likers avec profils |
| `GET` | `/api/publications/:id/comments` | Commentaires avec réponses et likes |
| `POST` | `/api/publications/interactions/batch` | Interactions multiples (batch) |

### 10.4 Base de données
**Table `publications` (PostgreSQL) :**
- `id` (UUID PK), `author_id` (UUID), `type` (`place`/`experience`), `title`, `description`, `images`, `latitude`, `longitude`, `place_name`, `region`, `status` (`pending`/`approved`/`rejected`), `rejection_reason`, `created_at`, `updated_at`

**Tables liées :** `publication_likes`, `publication_comments`, `comment_likes`

### 10.5 Use cases
- 🧳 **Voyageur** : Crée des publications (places/expériences), like, commente, reply
- 👑 **Admin** : Modère les places en attente (approuve/refuse avec raison)

---

## 11. Messagerie privée

### 11.1 Concept
Messagerie interne avec **conversations** entre deux participants.

### 11.2 Règles de messagerie
| Expéditeur | Destinataire |
|---|---|
| Éco-voyageur | Guide ou Propriétaire |
| Guide | Propriétaire |
| Propriétaire | Guide |

*Note : Les utilisateurs de même type ne peuvent pas s'envoyer de messages.*

### 11.3 Endpoints

| Méthode | Route | Protection | Description |
|---|---|---|---|
| `POST` | `/api/messages/conversations` | Auth | Créer/obtenir une conversation existante |
| `GET` | `/api/messages/conversations` | Auth | Lister ses conversations (dernier message + non-lus) |
| `GET` | `/api/messages/conversations/:id` | Auth | Détails d'une conversation |
| `DELETE` | `/api/messages/conversations/:id` | Auth | Supprimer conversation + messages |
| `GET` | `/api/messages/conversations/:id/messages` | Auth | Messages (marque les non-lus comme lus) |
| `POST` | `/api/messages` | Auth | Envoyer un message |

### 11.4 Base de données

**Table `conversations` :** `id`, `participant_a_id`, `participant_a_role`, `participant_b_id`, `participant_b_role`, `created_at`

**Table `messages` :** `id`, `conversation_id`, `sender_id`, `sender_role`, `content`, `is_read`, `created_at`

### 11.5 Use cases
- 🧳 **Voyageur** : Contacte un guide pour réserver, questionne un propriétaire
- 🗺️ **Guide** : Répond aux voyageurs, contacte propriétaires pour partenariats
- 🏗️ **Propriétaire** : Répond aux voyageurs et guides, gère les demandes

---

## 12. Système de Follow (Abonnements)

### 12.1 Concept
Les utilisateurs peuvent **suivre** d'autres utilisateurs.

### 12.2 Règles de follow
| Followeur | Followé |
|---|---|
| Éco-voyageur | Guide ou Propriétaire |
| Guide | Propriétaire |
| Propriétaire | Guide |

*Note : Les voyageurs ne peuvent pas être suivis. Pas de self-follow.*

### 12.3 Endpoints

| Méthode | Route | Protection | Description |
|---|---|---|---|
| `POST` | `/api/follows/:targetId/:targetType` | Auth | Follow un utilisateur |
| `DELETE` | `/api/follows/:targetId` | Auth | Unfollow |
| `GET` | `/api/follows/following` | Auth | Mes abonnements |
| `GET` | `/api/follows/followers` | Auth | Mes followers |
| `GET` | `/api/follows/following/profiles` | Auth | Abonnements avec infos profil |
| `GET` | `/api/follows/followers/profiles` | Auth | Followers avec infos profil |
| `GET` | `/api/follows/followers/public/:userId` | Public | Followers d'un utilisateur |
| `GET` | `/api/follows/count` | Auth | Nombre de followers |
| `GET` | `/api/follows/status/:targetId` | Auth | Vérifier si je follow |

### 12.4 Base de données

**Table `follows` :** `id` (UUID PK), `follower_id`, `follower_type`, `following_id`, `following_type`, `created_at`

### 12.5 Use cases
- 🧳 **Voyageur** : Suit ses guides préférés, découvre leurs nouvelles offres
- 🗺️ **Guide** : Suit des propriétaires, voit leurs nouveaux projets
- 🏗️ **Propriétaire** : Suit des guides, voit leurs activités

---

## 13. Base de données

### 13.1 PostgreSQL — Tables relationnelles

```
users
  ├── eco_travelers      (1:1, user_id PK+FK)
  ├── guides             (1:1, user_id PK+FK)
  │     └── offers       (1:N, author_id FK) → par les guides
  └── project_owners     (1:1, user_id PK+FK)
        ├── projects     (1:N, owner_id FK)
        └── offers       (1:N, author_id FK) → par les propriétaires

questionnaires
  └── questions          (1:N, questionnaire_id FK)
        └── answers      (1:N, question_id FK)

question_categories

questionnaire_attempts
  └── user_answers       (1:N, attempt_id FK)
```

#### Table `users`

| Champ | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `email` | varchar | Unique |
| `password` | varchar | Hashé bcrypt |
| `auth_method` | enum | `email` |
| `role` | enum | `eco_traveler`, `project`, `guide`, `admin` |
| `status` | enum | `pending`, `active`, `banned`, `archived` |
| `email_verified_at` | timestamp | Nullable |
| `verification_token` | text | Nullable |
| `verification_token_expires_at` | timestamp | Nullable |
| `refresh_token` | text | Nullable |
| `refresh_token_expires_at` | timestamp | Nullable |
| `reset_password_token` | text | Nullable |
| `reset_password_token_expires_at` | timestamp | Nullable |

#### Table `eco_travelers`

| Champ | Type | Notes |
|---|---|---|
| `user_id` | UUID (PK, FK) | → `users.id` |
| `full_name` | varchar | |
| `bio` | text | |
| `country` | varchar | |
| `language` | varchar | |
| `photo` | varchar | |
| `traveler_types` | simple-array | |
| `motivations` | simple-array | |
| `sustainability_values` | simple-array | |
| `interests` | jsonb | `[{ name, level }]` |
| `landscapes` | simple-array | |
| `travel_styles` | simple-array | |
| `sustainability_goals` | simple-array | |
| `profile_completion` | int | 0-100 |
| `is_onboarded` | boolean | |
| `sustainability_score` | int | Nullable |
| `score_questionnaire` | int | 20% |
| `score_reservations` | int | 40% (futur) |
| `score_feedbacks` | int | 20% (futur) |
| `score_partages` | int | 20% (futur) |

#### Table `guides`

| Champ | Type | Notes |
|---|---|---|
| `user_id` | UUID (PK, FK) | → `users.id` |
| `full_name` | varchar | |
| `guide_type` | varchar | `local` ou `professionnel` |
| `bio` | text | |
| `country` | varchar | |
| `language` | varchar | |
| `photo` | text | |
| `zone` | varchar | Zone d'activité |
| `specialties` | simple-array | |
| `languages_spoken` | simple-array | |
| `years_experience` | int | 0-30 |
| `status` | varchar | `pending`, `active`, `suspended` |
| `profile_completion` | int | |
| `is_onboarded` | boolean | |
| `sustainability_score` | int | |
| `score_questionnaire` | int | 40% |
| `score_reservations` | int | 40% (futur) |
| `score_feedbacks` | int | 20% (futur) |

#### Table `project_owners`

| Champ | Type | Notes |
|---|---|---|
| `user_id` | UUID (PK, FK) | → `users.id` |
| `full_name` | varchar | |
| `bio` | text | |
| `country` | varchar | |
| `language` | varchar | |
| `photo` | text | |
| `organization` | varchar | |
| `position` | varchar | |
| `phone` | varchar | |
| `profile_completion` | int | |
| `is_onboarded` | boolean | |
| `sustainability_score` | int | |
| `score_questionnaire` | int | 40% |
| `score_reservations` | int | 40% (futur) |
| `score_feedbacks` | int | 20% (futur) |

#### Table `projects`

| Champ | Type |
|---|---|
| `id` | UUID (PK) |
| `owner_id` | UUID (FK → project_owners.user_id) |
| `name` | varchar |
| `project_type` | varchar |
| `description` | text |
| `region` | varchar |
| `address` | varchar |
| `photo` | text |
| `status` | varchar (défaut `pending`) |
| `services` | simple-array |
| `eco_labels` | simple-array |
| `website` | varchar |
| `phone` | varchar |

#### Table `offers`

| Champ | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `author_id` | UUID | Guide ou project_owner |
| `author_type` | varchar | `guide` ou `project_owner` |
| `project_id` | UUID (FK nullable) | Projet associé |
| `title` | varchar | |
| `description` | text | |
| `price` | decimal | |
| `duration` | varchar | Texte libre |
| `offer_type` | varchar | `eco_tour`, `accommodation`, `activity`, `restaurant`, `craft` |
| `images` | simple-array | |
| `inclusions` | text | |
| `region` | varchar | |
| `meeting_point` | varchar | |
| `meeting_lat` | decimal | |
| `meeting_lng` | decimal | |
| `min_group_size` | int | |
| `max_group_size` | int | |
| `min_age` | int | |
| `cancellation_policy` | text | |
| `sustainability_score` | int | |
| `status` | varchar | `pending`, `approved`, `rejected` |
| `rejection_reason` | text | |

### 13.2 MongoDB — Collections NoSQL

| Collection | Champs | Lié à |
|---|---|---|
| `traveler_preferences` | `user_id` (unique), `interests[]`, `landscapes[]`, `activities[]` (name+level), `objectives[]`, `updated_by_behavior` | `eco_travelers.user_id` |
| `traveler_engagement` | `user_id` (unique), `durability_score`, `badges[]` (label+obtained_at), `feedback_given`, `plans_shared`, `reservations_made` | `eco_travelers.user_id` |
| `guide_skills` | `user_id` (indexé), `activities[]`, `landscapes[]`, `certifications[]`, `updated_by_behavior` | `guides.user_id` |
| `guide_engagement` | `user_id` (indexé), `durability_score`, `badges[]` (label+obtained_at), `feedback_received`, `reservations_handled` | `guides.user_id` |
| `project_engagement` | `user_id` (indexé), `sustainability_score`, `badges[]` (label+obtained_at), `total_reservations`, `feedback_received`, `projects_count` | `project_owners.user_id` |
| `project_services` | `project_id` (indexé), `owner_id`, `offered_services[]`, `eco_practices[]`, `target_travelers[]` | `projects.id` |

---

## 14. API — Tous les endpoints

### Auth

| Méthode | Route | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Inscription |
| `GET` | `/api/auth/verify-email` | Public | Vérification email (redirection) |
| `POST` | `/api/auth/login` | Public | Connexion |
| `POST` | `/api/auth/refresh` | Public | Refresh token |
| `POST` | `/api/auth/forgot-password` | Public | Mot de passe oublié |
| `POST` | `/api/auth/reset-password` | Public | Réinitialisation mot de passe |
| `POST` | `/api/auth/logout` | Auth | Déconnexion |
| `GET` | `/api/auth/google` | Public | Google OAuth |
| `GET` | `/api/auth/google/callback` | Public | Callback OAuth |

### Éco-Voyageur

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/eco-traveler/profile` | Récupérer le profil |
| `POST` | `/api/eco-traveler/profile` | Créer/compléter le profil |
| `PATCH` | `/api/eco-traveler/traveler-types` | Mettre à jour les types de voyageur |
| `PATCH` | `/api/eco-traveler/motivations` | Mettre à jour motivations et valeurs |
| `PATCH` | `/api/eco-traveler/interests` | Mettre à jour intérêts et paysages |
| `PATCH` | `/api/eco-traveler/goals` | Mettre à jour objectifs durables |
| `POST` | `/api/eco-traveler/onboarded` | Marquer onboarding terminé |

### Guide

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/guide/profile` | Récupérer le profil |
| `POST` | `/api/guide/profile` | Créer/compléter le profil |
| `PATCH` | `/api/guide/specialties` | Mettre à jour spécialités et langues |
| `PATCH` | `/api/guide/experience` | Mettre à jour expérience et terrains |
| `POST` | `/api/guide/onboarded` | Marquer onboarding terminé |

### Propriétaire de projet

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/project-owner/profile` | Récupérer le profil |
| `POST` | `/api/project-owner/profile` | Créer/compléter le profil |
| `POST` | `/api/project-owner/onboarded` | Marquer onboarding terminé |
| `GET` | `/api/project-owner/projects` | Lister les projets |
| `POST` | `/api/project-owner/projects` | Créer un projet |
| `PATCH` | `/api/project-owner/projects/:id` | Modifier un projet |
| `DELETE` | `/api/project-owner/projects/:id` | Supprimer un projet |

### Questionnaire

| Méthode | Route | Protection | Description |
|---|---|---|---|
| `GET` | `/api/questionnaire/active` | Public | Questionnaire actif (query: `type`) |
| `GET` | `/api/questionnaire/my-attempt` | Auth | Voir sa tentative |
| `POST` | `/api/questionnaire/submit` | Auth | Soumettre les réponses |

### Offres

| Méthode | Route | Protection | Description |
|---|---|---|---|
| `POST` | `/api/offers` | Auth (Guide/Projet) | Créer une offre |
| `GET` | `/api/offers` | Public | Toutes les offres approuvées |
| `GET` | `/api/offers/mine` | Auth (Guide/Projet) | Mes offres (dashboard) |
| `GET` | `/api/offers/author/:authorId` | Public | Offres publiques d'un auteur |
| `GET` | `/api/offers/project/:projectId` | Public | Offres liées à un projet |
| `PATCH` | `/api/offers/:id` | Auth (Guide/Projet) | Modifier une offre |
| `PATCH` | `/api/offers/:id/sustainability` | Auth (Guide/Projet) | Màj score durabilité |
| `DELETE` | `/api/offers/:id` | Auth (Guide/Projet) | Supprimer une offre |
| `GET` | `/api/admin/offers/pending` | Admin | Offres en attente |
| `PATCH` | `/api/admin/offers/:id/approve` | Admin | Approuver une offre |
| `PATCH` | `/api/admin/offers/:id/reject` | Admin | Refuser une offre |

---

## 15. Routes frontend

| Route | Page |
|---|---|
| `/` | Landing page (Hero, HowItWorks, Featured, Newsletter) |
| `/auth/login` | Connexion |
| `/auth/register` | Inscription (avec choix de rôle) |
| `/auth/forgot-password` | Mot de passe oublié |
| `/auth/reset-password` | Réinitialisation |
| `/auth/check-email` | Email de vérification envoyé |
| `/auth/callback` | Callback OAuth (stockage tokens) |
| `/onboarding/eco-traveler` | Onboarding voyageur (5 étapes) |
| `/onboarding/guide` | Onboarding guide (4 étapes) |
| `/onboarding/project-owner` | Onboarding propriétaire (2 étapes) |
| `/questionnaire/eco-traveler` | QCM durabilité voyageur (11 questions) |
| `/questionnaire/guide` | QCM durabilité guide (10 questions) |
| `/questionnaire/project-owner` | QCM durabilité propriétaire (10 questions) |
| `/dashboard` | Dashboard générique |
| `/dashboard/ecovoyageur` | Dashboard voyageur |
| `/dashboard/guide` | Dashboard guide |
| `/dashboard/project-owner` | Dashboard propriétaire |
| `/destinations` | Vitrine publique des offres avec filtres et carte |
| `/admin` | Panneau d'administration (offres, projets, pubs, signalements) |
| `/messagerie` | Messagerie privée |
| `/profile/ecovoyageur` | Profil public voyageur |
| `/profile/ecovoyageur/[userId]` | Profil public voyageur (dynamique) |
| `/profile/guide` | Profil public guide |
| `/profile/project-owner` | Profil public propriétaire |
| `/profile/project-owner/[userId]` | Profil public propriétaire (dynamique) |

---

## 16. Architecture modulaire backend

```
src/
├── auth/             Authentification (register, login, JWT, Google OAuth, refresh, reset password)
├── users/            Gestion des utilisateurs (CRUD base, activation)
├── eco-traveler/     Profil & scoring des voyageurs (onboarding 5 étapes)
├── guide/            Profil & scoring des guides (onboarding 4 étapes)
├── project-owner/    Profil & CRUD projets des propriétaires (onboarding 2 étapes)
├── offer/            Offres éco-touristiques (CRUD, scoring, workflow modération)
├── questionnaire/    QCM durabilité (soumission, scoring par catégorie)
├── publication/      Publications sociales (places, expériences, likes, commentaires)
├── messages/         Messagerie privée (conversations, blocage)
├── follow/           Système d'abonnement entre utilisateurs
├── reports/          Signalements et modération
├── admin/            Panneau d'administration (validation offres/projets/pubs, bannissement)
├── upload/           Upload d'images
├── mail/             Service d'envoi d'emails (Nodemailer, SMTP Gmail)
├── config/           Configuration (env vars, validation Joi)
├── database/         Connexions DB (TypeORM + Mongoose)
└── common/           Guards JWT, décorateurs, enums partagés
```

---

## 17. Déploiement

### Docker

```bash
docker network create tourisme_net
docker compose up -d
```

4 services : `db` (PostgreSQL), `mongo` (MongoDB), `api` (NestJS), `web` (Next.js)

### Ports

| Service | Port hôte | Port conteneur |
|---|---|---|
| API | 3003 | 3000 |
| Frontend | 3004 | 3000 |

### URLs

| Environnement | Frontend | API |
|---|---|---|
| Dev | `http://localhost:3004` | `http://localhost:3003` |
| Production | `http://91.134.139.163:3004` | `http://91.134.139.163:3003` |

---

## 18. Observations techniques

- **Projet en développement actif** (Next.js 16, React 19, NestJS 11)
- **Pas de CI/CD** configuré
- **`synchronize: true`** en TypeORM (pratique en dev, dangereux en prod)
- **Frontend sans gestion d'état** (localStorage uniquement — pas de Zustand/Redux/Context)
- **Pas de tests e2e** complets
- **Design Material You / Google-like** (Material Symbols, arrondis, ombres)
- **Interface 100% en français**
- **Double base de données** PostgreSQL + MongoDB
- **Authentification avec refresh token rotation**
- **Modules complets :** Offer, Publication, Messages, Follow, Reports, Admin, Upload
- **Panneau Admin :** validation offres/projets/publications, gestion des signalements, bannissement utilisateurs

# Questionnaires, Offres & Projets — Documentation Technique

---

## 1. Questionnaires d'Évaluation

### 1.1 Entités (TypeORM — PostgreSQL)

**Table `questionnaires`**
| Champ | Type | Description |
|---|---|---|
| `id` | UUID PK | Identifiant unique |
| `name` | varchar | Nom du questionnaire |
| `target_type` | enum | `eco_traveler` \| `guide` \| `eco_project` |
| `version` | int (default 1) | Version |
| `description` | text | Description d'introduction |
| `max_score` | int | Score max (= nbQuestions × 4) |
| `is_active` | bool (default true) | Actif ou non |
| `created_at` | timestamp | Date création |

**Table `question_categories`**
| Champ | Type | Description |
|---|---|---|
| `id` | int PK | Identifiant |
| `name` | varchar | `environmental` \| `social` \| `economic` |

**Table `questions`**
| Champ | Type | Description |
|---|---|---|
| `id` | UUID PK | Identifiant |
| `questionnaire_id` | UUID FK → questionnaires | Questionnaire parent |
| `category_id` | int FK → question_categories | Catégorie |
| `question_text` | text | Texte de la question |
| `weight` | int (default 1) | Pondération |
| `question_order` | int | Ordre d'affichage |
| `is_active` | bool | Active ou non |

**Table `answers`**
| Champ | Type | Description |
|---|---|---|
| `id` | UUID PK | Identifiant |
| `question_id` | UUID FK → questions | Question parent |
| `answer_text` | text | Texte de la réponse |
| `score` | int | Score (1 à 4) |
| `answer_order` | int | Ordre d'affichage |

**Table `questionnaire_attempts`**
| Champ | Type | Description |
|---|---|---|
| `id` | UUID PK | Identifiant |
| `user_id` | UUID | Utilisateur |
| `questionnaire_id` | UUID FK → questionnaires | Questionnaire |
| `score_total` | int | Score total |
| `score_percentage` | int | Pourcentage (0-100) |
| `environmental_score` | int | % score env. |
| `social_score` | int | % score social |
| `economic_score` | int | % score éco. |
| `completed_at` | timestamp | Date de soumission |

**Table `user_answers`**
| Champ | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `attempt_id` | UUID FK → questionnaire_attempts | |
| `question_id` | UUID | Question répondue |
| `answer_id` | UUID | Réponse choisie |
| `score` | int | Score de la réponse |

### 1.2 Scoring

- Chaque réponse vaut **1 à 4 points**
- Score max = `nbQuestions × 4`
- `score_percentage = (totalScore / maxScore) × 100`
- Score par catégorie : `(catScore / (catCount × 4)) × 100`

**Profils (backend) :**
| Score | Profil |
|---|---|
| ≥ 80% | Ambassadeur durable |
| ≥ 60% | Écovoyageur engagé |
| ≥ 40% | Voyageur sensible |
| < 40% | Voyageur classique |

### 1.3 API — Endpoints

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/questionnaire/active?type=eco_traveler` | Public | Questionnaire actif d'un type |
| `GET` | `/api/questionnaire/my-attempt` | Bearer | Dernière tentative de l'utilisateur |
| `POST` | `/api/questionnaire/submit` | Bearer | Soumettre les réponses |

### 1.4 DTO Soumission

```typescript
// POST /api/questionnaire/submit
{
  "questionnaire_id": "uuid",
  "answers": [
    { "question_id": "uuid", "answer_id": "uuid" }
  ]
}
```

**Retour :**
```json
{
  "attempt_id": "uuid",
  "score_total": 32,
  "score_percentage": 80,
  "environmental_score": 75,
  "social_score": 80,
  "economic_score": 85,
  "profile": "Ambassadeur durable",
  "message": "Félicitations ! ..."
}
```

### 1.5 Seeds — 3 Questionnaires

**Écovoyageur** (`target_type: eco_traveler`, 11 questions) — `/api/questionnaire/active?type=eco_traveler`
- Transport, hébergement, alimentation, activités, achats, déchets, immersion, préparation, eau
- Intro : "Imaginez que vous prenez une année sabbatique pour découvrir la Tunisie."

**Guide** (`target_type: guide`, 10 questions) — `/api/questionnaire/active?type=guide`
- Zones protégées, sites archéologiques, prestataires, déchets clients, animaux sauvages, culture locale, espèces protégées, impact communautés, formation, capacité de charge
- Profils spécifiques : Guide Ambassadeur, Guide Expert, Guide Engagé, Guide en Développement

**Projet** (`target_type: eco_project`, 10 questions) — `/api/questionnaire/active?type=eco_project`
- Approvisionnement, déchets, énergie, communauté, eau, communication éco, impact sites, politique salariale, certifications, impact local
- Profils spécifiques : Propriétaire Ambassadeur, Propriétaire Engagé, Propriétaire Sensible, Propriétaire en Développement

**Lancer les seeds :**
```bash
cd backend
npx ts-node src/database/seeds/eco-traveler-questionnaire.seed.ts
npx ts-node src/database/seeds/guide-questionnaire.seed.ts
npx ts-node src/database/seeds/project-questionnaire.seed.ts
```

---

## 2. Projets (Project Owner)

### 2.1 Entité `projects` (TypeORM — PostgreSQL)

| Champ | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `owner_id` | UUID FK → project_owners | Propriétaire du projet |
| `name` | varchar | Nom (ex: "Éco-Lodge Sahara") |
| `project_type` | simple-array | Types (hébergement, restauration, etc.) |
| `description` | text | Description |
| `region` | varchar | Région |
| `address` | varchar | Adresse |
| `photo` | text | Photo principale |
| `photos` | simple-array | Galerie photos |
| `lat` | decimal(10,7) | Latitude (carte) |
| `lng` | decimal(10,7) | Longitude (carte) |
| `opening_hours` | varchar | Horaires |
| `facebook` | varchar | URL Facebook |
| `instagram` | varchar | URL Instagram |
| `website` | varchar | Site web |
| `phone` | varchar | Téléphone |
| `services` | simple-array | Services proposés |
| `eco_labels` | simple-array | Labels éco |
| `status` | varchar | `pending` \| `active` \| `rejected` |
| `rejection_reason` | text | Motif de refus |
| `sustainability_score` | int | Score durabilité (0-100) |

### 2.2 Schémas MongoDB — `project_engagement`

| Champ | Type | Description |
|---|---|---|
| `user_id` | string (indexé) | Propriétaire |
| `sustainability_score` | number | Score global |
| `badges` | [{ label, obtained_at }] | Badges obtenus |
| `total_reservations` | number | Réservations totales |
| `feedback_received` | number | Feedbacks reçus |
| `projects_count` | number | Nb de projets créés |

### 2.3 Schémas MongoDB — `project_services`

| Champ | Type | Description |
|---|---|---|
| `project_id` | string (indexé) | Projet lié |
| `owner_id` | string (indexé) | Propriétaire |
| `offered_services` | [string] | Services offerts |
| `eco_practices` | [string] | Pratiques éco |
| `target_travelers` | [string] | Types de voyageurs ciblés |

### 2.4 API — Endpoints Projets

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/project-owner/profile` | Bearer | Profil complet + projets |
| `POST` | `/api/project-owner/profile` | Bearer | Compléter profil |
| `POST` | `/api/project-owner/onboarded` | Bearer | Marquer onboardé + badge |
| `GET` | `/api/project-owner/projects` | Bearer | Mes projets |
| `POST` | `/api/project-owner/projects` | Bearer | Créer un projet |
| `PATCH` | `/api/project-owner/projects/:id` | Bearer | Modifier projet |
| `DELETE` | `/api/project-owner/projects/:id` | Bearer | Supprimer projet |
| `PATCH` | `/api/project-owner/projects/:id/sustainability` | Bearer | Score durabilité |
| `GET` | `/api/project-owner/public/search?q=` | Public | Rechercher propriétaires |
| `GET` | `/api/project-owner/public/:userId` | Public | Profil public |
| `GET` | `/api/project-owner/projects/public` | Public | Tous les projets actifs |

### 2.5 DTO Création Projet

```typescript
{
  "name": "Éco-Lodge Sahara",           // requis
  "project_type": ["hébergement"],       // optionnel
  "description": "...",                  // optionnel
  "region": "Sud Tunisien",             // optionnel
  "address": "Douz, Tunisie",           // optionnel
  "lat": 33.8869, "lng": 9.5375,       // optionnel (carte)
  "photo": "url", "photos": ["url"],    // optionnel
  "opening_hours": "8h-20h",            // optionnel
  "facebook": "url", "instagram": "url",// optionnel
  "services": ["wifi", "restaurant"],   // optionnel
  "eco_labels": ["Clé Verte"],          // optionnel
  "website": "url", "phone": "+216"     // optionnel
}
```

### 2.6 Statuts & Modération

- `pending` → en attente de validation admin
- `active` → visible publiquement
- `rejected` → refusé avec `rejection_reason`

**Badge "Ambassadeur"** : si l'utilisateur a le badge `Propriétaire Ambassadeur AFRATIM`, ses projets sont automatiquement `active` au lieu de `pending`.

### 2.7 Profil Propriétaire — `project_owners`

| Champ | Type | Description |
|---|---|---|
| `user_id` | UUID PK | Lié à users |
| `full_name` | varchar | Nom complet |
| `bio` | text | Bio |
| `country` | varchar | Pays |
| `language` | varchar | Langue |
| `photo` / `cover_photo` | text | Photos |
| `organization` | varchar | Organisation |
| `position` | varchar | Poste |
| `phone` | varchar | Téléphone |
| `profile_completion` | int (0-100) | % complétion auto-calculé |
| `is_onboarded` | bool | Onboarding terminé |
| `sustainability_score` | int | Score global (0-100) |
| `score_questionnaire` | int | Score questionnaire |
| `score_reservations` | int | Score réservations |
| `score_feedbacks` | int | Score feedbacks |

**Calcul du score de durabilité global :**
```
sustainability_score = score_questionnaire × 0.40
                    + score_reservations   × 0.40
                    + score_feedbacks      × 0.20
```

**Badge "Ambassadeur"** débloqué si `sustainability_score >= 80`.

---

## 3. Offres

### 3.1 Entité `offers` (TypeORM — PostgreSQL)

| Champ | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `author_id` | UUID | Créateur (guide ou project_owner) |
| `author_type` | varchar | `guide` \| `project_owner` |
| `project_id` | UUID (nullable) FK → projects | Projet lié (pour project_owner) |
| `title` | varchar | Titre |
| `description` | text | Description |
| `price` | decimal(10,2) | Prix |
| `duration` | varchar | Durée (ex: "2h", "3 jours") |
| `offer_type` | varchar | `eco_tour` \| `accommodation` \| `activity` \| `restaurant` \| `craft` |
| `images` | simple-array | URLs des images |
| `inclusions` | text | Ce qui est inclus |
| `region` | varchar | Région |
| `meeting_point` | varchar | Point de rendez-vous |
| `meeting_lat` | decimal(10,7) | Latitude RDV |
| `meeting_lng` | decimal(10,7) | Longitude RDV |
| `min_group_size` | int | Groupe min |
| `max_group_size` | int | Groupe max |
| `min_age` | int | Âge minimum |
| `cancellation_policy` | text | Politique annulation |
| `sustainability_score` | int | Score durabilité |
| `status` | varchar | `pending` \| `approved` \| `rejected` |
| `rejection_reason` | text | Motif de refus |

### 3.2 API — Endpoints Offres

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/offers` | Bearer (Guide/PO) | Créer une offre |
| `GET` | `/api/offers/mine` | Bearer (Guide/PO) | Mes offres |
| `GET` | `/api/offers` | Public | Toutes les offres approuvées |
| `GET` | `/api/offers/author/:authorId` | Public | Offres publiées d'un auteur |
| `GET` | `/api/offers/project/:projectId` | Public | Offres d'un projet |
| `PATCH` | `/api/offers/:id` | Bearer (Guide/PO) | Modifier offre |
| `PATCH` | `/api/offers/:id/sustainability` | Bearer (Guide/PO) | Score durabilité |
| `DELETE` | `/api/offers/:id` | Bearer (Guide/PO) | Supprimer offre |

### 3.3 DTO Création Offre

```typescript
{
  "title": "Randonnée Atlas",              // requis
  "description": "...",                    // optionnel
  "price": 150,                            // optionnel
  "duration": "2 jours 1 nuit",           // optionnel
  "offer_type": "eco_tour",               // optionnel
  "images": ["url1", "url2"],             // optionnel
  "inclusions": "Guide, repas, transport",// optionnel
  "region": "Sud Tunisien",              // optionnel
  "meeting_point": "Hôtel X",            // optionnel
  "meeting_lat": 33.8869,                // optionnel (carte)
  "meeting_lng": 9.5375,                 // optionnel (carte)
  "min_group_size": 2, "max_group_size": 8, // optionnel
  "min_age": 12,                           // optionnel
  "cancellation_policy": "Remboursement 48h", // optionnel
  "project_id": "uuid"                     // optionnel, seulement project_owner
}
```

### 3.4 Statuts & Modération

- `pending` → en attente admin
- `approved` → visible publiquement
- `rejected` → refusé

**Badge "Ambassadeur"** : si l'utilisateur a le badge `Guide Ambassadeur AFRATIM` ou `Propriétaire Ambassadeur AFRATIM`, ses offres sont automatiquement `approved`.

### 3.5 Règles de création

- Si `project_id` est fourni, le projet doit exister et être `active`
- Un guide ne peut pas lier d'offre à un projet (pas de `project_id` pour les guides)
- Les images et photos sont gérées via le module `Upload`

---

## 4. Sélection sur Carte (Map)

### 4.1 MapPicker (`components/map/MapPicker.tsx`)

Composant interactif pour **choisir un lieu** lors de la création d'un projet ou d'une offre.

**Props :**
```typescript
{
  lat: number | null;     // Latitude initiale
  lng: number | null;     // Longitude initiale
  onPick: (lat: number, lng: number, address: string) => void;
}
```

**Fonctionnalités :**
- **Clic sur la carte** : place un marqueur et reverse-geocode (Nominatim) → adresse
- **Barre de recherche** : recherche via Nominatim (`q=...&format=json&limit=1`), vole vers le lieu
- **Centre initial** : Tunisie (33.8869, 9.5375) si aucune coordonnée
- **Marqueur** : Leaflet par défaut (taille 25×41)

**Technologies :** Leaflet + react-leaflet, tuiles OpenStreetMap

### 4.2 MapView (`components/map/MapView.tsx`)

Composant **lecture seule** pour afficher un marqueur sur une carte.

**Props :**
```typescript
{
  lat: number;
  lng: number;
}
```

**Fonctionnalités :**
- Affiche un marqueur à la position donnée
- Recentre automatiquement si les coordonnées changent
- CSS Leaflet chargé dynamiquement
- Skeleton loading pendant le chargement du CSS

### 4.3 Utilisation

- **Projets** : `lat`, `lng` dans l'entité Project → utilisés pour la localisation sur carte
- **Offres** : `meeting_lat`, `meeting_lng` dans l'entité Offer → point de rendez-vous

---

## 5. Attributs Techniques Transversaux

### Codes statut
| Entité | Statuts |
|---|---|
| `projects` | `pending` → `active` / `rejected` |
| `offers` | `pending` → `approved` / `rejected` |
| `users` | Actif via `is_active`, bannissement via `is_banned` + `banned_at` |

### Badges (MongoDB)
| Badge | Condition |
|---|---|
| `Propriétaire Éco-Engagé` | Onboarding complété (propriétaire) |
| `Guide Éco-Engagé` | Onboarding complété (guide) |
| `Guide Ambassadeur AFRATIM` | `sustainability_score >= 80` (guide) |
| `Propriétaire Ambassadeur AFRATIM` | `sustainability_score >= 80` (propriétaire) |

### Upload
- Module : `backend/src/upload/`
- Service : Cloudinary (via multer + `cloudinary.uploader.upload_stream`)
- Champs : `image` (multer, limite 10MB), retourne l'URL sécurisée Cloudinary

### Notifications & Modération Admin
- Les projets/offres en `pending` apparaissent dans le panneau admin
- Endpoints admin : `PATCH /api/admin/projects/:id/approve|reject`
- Endpoints admin : `PATCH /api/admin/offers/:id/approve|reject`

### Seeds PostgreSQL
```bash
# 3 questionnaires
npx ts-node src/database/seeds/eco-traveler-questionnaire.seed.ts
npx ts-node src/database/seeds/guide-questionnaire.seed.ts
npx ts-node src/database/seeds/project-questionnaire.seed.ts
```
Chaque seed est **idempotent** (vérifie si déjà seedé avant d'insérer).

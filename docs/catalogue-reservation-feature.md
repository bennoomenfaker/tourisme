# 🌿 Catalogue & Réservation — Feature Complete

> **Sprint 4-5** — Feature catalogue, réservation, circuits et notifications  
> Architecture backend NestJS + PostgreSQL (TypeORM)  
> **Pour Maram :** Cette feature ajoute tout le système de catalogue avancé (items, prix, disponibilités), les réservations, les circuits multi-jours, et les notifications. Voir §11 pour le résumé PR.

---

## Table des matières

1. [Architecture globale](#1-architecture-globale)
2. [Catalogue Simple](#2-catalogue-simple)
3. [Catalogue Complexe](#3-catalogue-complexe)
4. [Réservations](#4-réservations)
5. [Circuits / Packages](#5-circuits--packages)
6. [Notifications](#6-notifications)
7. [Scoring Durable](#7-scoring-durable)
8. [API Endpoints](#8-api-endpoints)
9. [Seed `offer_categories`](#9-seed-offer_categories)
10. [Fichiers modifiés / créés](#10-fichiers-modifiés--créés)
11. [Résumé PR pour Maram](#11-résumé-pr-pour-maram)

---

## 1. Architecture globale

```
Provider (Guide | ProjectOwner)
│
├── Offers (catalogue)
│   ├── OfferCategories (lookup — 10 lignes seedées)
│   └── OfferItems (éléments vendables)
│       ├── OfferItemPrices (prix par catégorie)
│       ├── OfferItemCapacity (stock / capacité)
│       ├── OfferItemAvailabilityRules (récurrence)
│       └── OfferItemSessions (créneaux concrets)
│
├── Bookings (réservations)
│   ├── BookingParticipants (individus)
│   └── → Notifications
│
└── Circuits (packages multi-jours)
    ├── CircuitDays (journées)
    ├── CircuitProgramItems (activités du jour)
    ├── CircuitOptions (options additionnelles)
    ├── CircuitReservations (résas circuits)
    │   └── CircuitReservationOptions (options choisies)
    └── → Notifications
```

### Règles métier

| Concept | Règle |
|---------|-------|
| **author_id + author_type** | Polymorphisme : un guide OU un project_owner crée des offres et circuits |
| **Offer vs Circuit** | Offer = unitaire (ex: plat, nuitée) ; Circuit = package multi-jours avec programme |
| **Catalogue Simple** | Items avec stock global, pas de dates. Idéal : hébergement, artisanat, transport |
| **Catalogue Complexe** | Items avec sessions datées, capacité journalière. Idéal : activités, ateliers |
| **Confirmation** | `automatic` = résa confirmée immédiatement ; `manual` = le provider valide |

---

## 2. Catalogue Simple

### Tables

#### `offer_categories` — Lookup (10 lignes seedées)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `slug` | varchar(50) UNIQUE | `eco_tour`, `accommodation`, `activity`, `restaurant`, `craft`, `workshop`, `transfer`, `sejour`, `circuit`, `other` |
| `label` | varchar(100) | `Éco-Tour`, `Hébergement`, etc. |
| `icon` | varchar(50) nullable | Identifiant icône |
| `sort_order` | int (default 0) | Ordre d'affichage |

#### `offers` — Colonnes AJOUTÉES à la table existante

| Colonne ajoutée | Type | Description |
|-----------------|------|-------------|
| `category_id` | UUID (FK → offer_categories) nullable | Catégorie (remplace progressivement `offer_type`) |
| `address` | varchar nullable | Adresse postale complète |
| `latitude` | decimal(10,7) nullable | GPS latitude |
| `longitude` | decimal(10,7) nullable | GPS longitude |
| `confirmation_mode` | varchar default `automatic` | `automatic` \| `manual` |

#### `offer_items` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `offer_id` | UUID (FK → offers) CASCADE | Offre parente |
| `name` | varchar | "Couscous", "Tente 2 places", "Vélo VTT" |
| `description` | text nullable | |
| `item_type` | varchar nullable | `room`, `bed`, `dish`, `menu`, `equipment`, `activity`, `workshop`... |
| `details_json` | json nullable | Infos libres |
| `requires_confirmation` | boolean default false | |
| `confirmation_mode` | varchar nullable | `automatic` \| `manual` |
| `booking_deadline_days` | int nullable | Résa X jours avant max |
| `cancellation_deadline_days` | int nullable | Annulation gratuite X jours avant |
| `production_delay_days` | int nullable | Délai de préparation |
| `status` | varchar default `active` | `active` \| `inactive` |

#### `offer_item_prices` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `offer_item_id` | UUID (FK → offer_items) CASCADE | |
| `label` | varchar | "Adulte", "Enfant", "Étudiant" |
| `price` | decimal(10,2) | |
| `currency` | varchar default `XAF` | |
| `pricing_unit` | varchar default `per_person` | `per_person`, `per_night`, `per_hour`... |
| `min_quantity` | int nullable | |
| `max_quantity` | int nullable | |
| `is_default` | boolean default false | |
| `status` | varchar default `active` | |

---

## 3. Catalogue Complexe

#### `offer_item_capacity` — Stock / Capacité

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `offer_item_id` | UUID (FK → offer_items) CASCADE |
| `capacity_type` | varchar : `rooms`, `beds`, `items`, `persons`, `seats` |
| `total_quantity` | int nullable — Stock total |
| `max_persons` | int nullable |
| `min_participants` | int nullable |
| `max_participants` | int nullable |

#### `offer_item_availability_rules` — Règles de récurrence

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `offer_item_id` | UUID (FK → offer_items) CASCADE |
| `availability_type` | varchar : `weekly`, `daily`, `date_range`, `weekend_only`, `custom` |
| `start_date` | date nullable |
| `end_date` | date nullable |
| `weekdays` | simple-array nullable : `[1,2,3,4,5]` = semaine |
| `start_time` | time nullable |
| `end_time` | time nullable |
| `recurrence_rule` | varchar nullable : `FREQ=WEEKLY;BYDAY=MO,WE,FR` |
| `is_active` | boolean default true |

#### `offer_item_sessions` — Créneaux concrets

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `offer_item_id` | UUID (FK → offer_items) CASCADE |
| `date` | date |
| `start_time` | time |
| `end_time` | time |
| `total_capacity` | int nullable |
| `remaining_capacity` | int nullable |
| `price_override` | decimal(10,2) nullable |
| `status` | varchar default `available` |

---

## 4. Réservations

#### `bookings` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `booking_ref` | varchar UNIQUE | `BK-` + aléatoire (lisible) |
| `traveler_id` | UUID (FK → users) | Qui réserve |
| `offer_id` | UUID (FK → offers) | Offre réservée |
| `offer_item_id` | UUID (FK → offer_items) nullable | Item spécifique |
| `session_id` | UUID (FK → offer_item_sessions) nullable | Créneau choisi |
| `status` | varchar default `pending` | `pending`, `confirmed`, `cancelled`, `completed`, `refunded` |
| `total_price` | decimal(10,2) | |
| `currency` | varchar default `XAF` | |
| `special_requests` | text nullable | |
| `confirmation_mode` | varchar nullable | Copié de l'offre à la résa |
| `cancelled_at` | timestamp nullable | |
| `cancel_reason` | text nullable | |

#### `booking_participants` — Nouvelle table

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `booking_id` | UUID (FK → bookings) CASCADE |
| `full_name` | varchar |
| `age` | int nullable |
| `document_type` | varchar nullable : `passport`, `id_card`, `none` |
| `document_number` | varchar nullable |
| `is_group_leader` | boolean default false |

---

## 5. Circuits / Packages

#### `circuits` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `author_id` | UUID | Guide ou Project Owner |
| `author_type` | varchar | `guide` \| `project_owner` |
| `project_id` | UUID nullable | |
| `title` | varchar | |
| `description` | text nullable | |
| `start_date` | date nullable | |
| `end_date` | date nullable | |
| `duration_days` | int nullable | |
| `duration_nights` | int nullable | |
| `region` | varchar nullable | |
| `base_price` | decimal(10,2) nullable | |
| `currency` | varchar default `XAF` | |
| `max_participants` | int nullable | |
| `booking_deadline_days` | int nullable | |
| `confirmation_mode` | varchar nullable | |
| `status` | varchar default `pending` | `pending`, `approved`, `rejected`, `archived` |
| `rejection_reason` | text nullable | |
| `inclusions` | text nullable | |
| `exclusions` | text nullable | |

#### `circuit_days` — Nouvelle table

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `circuit_id` | UUID (FK → circuits) CASCADE |
| `day_number` | int |
| `date` | date nullable |
| `title` | varchar |
| `description` | text nullable |

#### `circuit_program_items` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `circuit_day_id` | UUID (FK → circuit_days) CASCADE | |
| `title` | varchar | |
| `description` | text nullable | |
| `start_time` | time nullable | |
| `end_time` | time nullable | |
| `is_included` | boolean default true | Inclus dans le prix de base |
| `is_required` | boolean default true | Obligatoire ou optionnel |
| `linked_offer_item_id` | UUID nullable | Lien vers un OfferItem |
| `linked_location_id` | UUID nullable | Lien vers un lieu |

#### `circuit_options` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `circuit_id` | UUID (FK → circuits) CASCADE | |
| `offer_item_id` | UUID nullable | Lien vers un OfferItem |
| `option_group` | varchar nullable | `transport`, `accommodation`, `equipment`, `activity`, `food` |
| `option_type` | varchar | `single_choice`, `multiple_choice`, `quantity`, `time_slot` |
| `is_required` | boolean default false | |
| `is_included` | boolean default false | Inclus dans le prix de base |
| `extra_price` | decimal(10,2) nullable | |
| `selection_mode` | varchar nullable | |
| `min_quantity` | int nullable | |
| `max_quantity` | int nullable | |
| `status` | varchar default `active` | |

#### `circuit_reservations` — Nouvelle table

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `circuit_id` | UUID (FK → circuits) |
| `user_id` | UUID (FK → users) |
| `participants_count` | int nullable |
| `base_total` | decimal(10,2) nullable |
| `options_total` | decimal(10,2) default 0 |
| `final_total` | decimal(10,2) |
| `status` | varchar default `pending` |

#### `circuit_reservation_options` — Nouvelle table

| Champ | Type |
|-------|------|
| `id` | UUID (PK) |
| `circuit_reservation_id` | UUID (FK → circuit_reservations) CASCADE |
| `circuit_option_id` | UUID (FK → circuit_options) |
| `offer_item_session_id` | UUID nullable |
| `quantity` | int nullable |
| `unit_price` | decimal(10,2) nullable |
| `total_price` | decimal(10,2) nullable |

---

## 6. Notifications

#### `notifications` — Nouvelle table

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | Destinataire |
| `type` | varchar | `booking_confirmed`, `booking_cancelled`, `booking_request`, `offer_approved`, `offer_rejected`, `new_message`, `circuit_available` |
| `title` | varchar | |
| `body` | text nullable | |
| `link` | varchar nullable | Lien profond vers la page |
| `is_read` | boolean default false | |

---

## 7. Scoring Durable

Les champs `score_reservations` existent déjà sur les 3 entités (eco_traveler, guide, project_owner). Implémentation :

| Rôle | Poids | Formule |
|------|-------|---------|
| Éco-voyageur | 40% | `min(bookings_confirmed / 10 × 100, 100)` |
| Guide | 40% | `min(bookings_received / 20 × 100, 100)` |
| Project Owner | 40% | `min(bookings_received / 30 × 100, 100)` |

**Déclencheurs :** `booking.confirmed` / `booking.cancelled` → màj MongoDB + PostgreSQL.

---

## 8. API Endpoints

### Catalogue

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| GET | `/offers` | Public — toutes les offres approuvées |
| GET | `/offers/:id` | Public — détail avec items, prix, sessions |
| POST | `/offers` | Guide/Project — créer offre |
| PATCH | `/offers/:id` | Owner — modifier |
| DELETE | `/offers/:id` | Owner — supprimer |
| GET | `/offers/:offerId/items` | Public — items d'une offre |
| POST | `/offers/:offerId/items` | Guide/Project — créer item |
| GET | `/offers/items/:itemId` | Public — détail item |
| PATCH | `/offers/items/:itemId` | Owner — modifier item |
| DELETE | `/offers/items/:itemId` | Owner — supprimer item |
| POST | `/offers/items/:itemId/prices` | Owner — ajouter prix |
| POST | `/offers/items/:itemId/availability` | Owner — règle de dispo |
| POST | `/offers/items/:itemId/sessions` | Owner — créer session |
| GET | `/offers/items/:itemId/sessions` | Public — sessions dispo |

### Réservations

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/bookings` | Éco-voyageur |
| GET | `/bookings/mine` | Éco-voyageur |
| GET | `/bookings/incoming` | Provider — résas reçues |
| GET | `/bookings/:id` | Tous (si concerné) |
| PATCH | `/bookings/:id/cancel` | Éco-voyageur |
| PATCH | `/bookings/:id/confirm` | Provider (manual mode) |

### Circuits

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/circuits` | Guide/Project |
| GET | `/circuits` | Public |
| GET | `/circuits/mine` | Owner |
| GET | `/circuits/:id` | Public — avec jours, programme, options |
| PATCH | `/circuits/:id` | Owner |
| POST | `/circuits/:circuitId/days` | Owner |
| POST | `/circuits/:circuitId/options` | Owner |
| GET | `/circuits/:circuitId/options` | Public |
| POST | `/circuits/:circuitId/reserve` | Éco-voyageur |
| GET | `/circuits/reservations/mine` | Éco-voyageur |

### Notifications

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| GET | `/notifications` | Tous — ses notifications |
| PATCH | `/notifications/:id/read` | Tous |
| PATCH | `/notifications/read-all` | Tous |
| GET | `/notifications/unread` | Tous — compteur |

---

## 9. Seed `offer_categories`

Un seed script a été créé pour insérer les 10 catégories :

```bash
cd backend && npm run seed:offer-categories
```

**Catégories insérées :**

| slug | label | icon | ordre |
|------|-------|------|-------|
| eco_tour | Éco-Tour | eco | 1 |
| accommodation | Hébergement | house | 2 |
| activity | Activité | target | 3 |
| restaurant | Restauration | food | 4 |
| craft | Artisanat | craft | 5 |
| workshop | Atelier | tools | 6 |
| transfer | Transfert | van | 7 |
| sejour | Séjour | stay | 8 |
| circuit | Circuit | route | 9 |
| other | Autre | other | 10 |

Le script est idempotent : si une catégorie existe déjà (même slug), elle est ignorée.

---

## 10. Fichiers modifiés / créés

### Fichiers MODIFIÉS (backend existant)

| Fichier | Modifications |
|---------|---------------|
| `backend/src/app.module.ts` | Import de `BookingModule`, `CircuitModule`, `NotificationModule` |
| `backend/src/offer/entities/offer.entity.ts` | +5 colonnes : `category_id`, `address`, `latitude`, `longitude`, `confirmation_mode` + `@OneToMany items` |
| `backend/src/offer/offer.service.ts` | +méthodes : `createItem`, `findItems`, `findItemById`, `updateItem`, `removeItem`, `addPrice`, `addAvailabilityRule`, `createSession`, `findSessions` |
| `backend/src/offer/offer.controller.ts` | +endpoints items, prices, availability, sessions |
| `backend/src/offer/offer.module.ts` | +7 entités dans `TypeOrmModule.forFeature` |
| `backend/src/offer/dto/offer.dto.ts` | +DTOs : `CreateOfferItemDto`, `UpdateOfferItemDto`, `CreateOfferItemPriceDto`, `CreateAvailabilityRuleDto`, `CreateOfferItemSessionDto` |
| `backend/package.json` | +script `seed:offer-categories` |

### Fichiers CRÉÉS (backend nouveau)

| Fichier | Description |
|---------|-------------|
| `backend/src/offer/entities/offer-category.entity.ts` | Entité catégorie |
| `backend/src/offer/entities/offer-item.entity.ts` | Entité item vendable |
| `backend/src/offer/entities/offer-item-price.entity.ts` | Prix par catégorie |
| `backend/src/offer/entities/offer-item-availability-rule.entity.ts` | Règles de dispo |
| `backend/src/offer/entities/offer-item-capacity.entity.ts` | Stock/capacité |
| `backend/src/offer/entities/offer-item-session.entity.ts` | Créneaux concrets |
| `backend/src/booking/` | Module complet (2 entités, service, controller, DTO, module) |
| `backend/src/circuit/` | Module complet (6 entités, service, controller, DTOs, module) |
| `backend/src/notification/` | Module complet (1 entité, service, controller, module) |
| `backend/src/database/seeds/offer-categories.seed.ts` | Seed 10 catégories |
| `docs/catalogue-reservation-feature.md` | Cette documentation |

---

## 11. Résumé PR pour Maram

> **Ce qu'il faut savoir pour merger :**

### ✅ Ce qui a été fait

1. **Architecture `author_id` + `author_type` conservée** — Pas de nouvelle table `providers`. Les offres et circuits gardent le polymorphisme guide/project_owner.

2. **Table `offers` modifiée** — 5 colonnes AJOUTÉES (les 24 colonnes existantes sont intactes) :
   - `category_id` (FK → `offer_categories`)
   - `address`, `latitude`, `longitude`
   - `confirmation_mode`

3. **16 nouvelles tables** créées automatiquement via `synchronize: true` :
   - `offer_categories`, `offer_items`, `offer_item_prices`, `offer_item_capacity`, `offer_item_availability_rules`, `offer_item_sessions`
   - `bookings`, `booking_participants`
   - `circuits`, `circuit_days`, `circuit_program_items`, `circuit_options`, `circuit_reservations`, `circuit_reservation_options`
   - `notifications`

4. **Modules NestJS** : `booking`, `circuit`, `notification` — chacun avec entité, service, controller, DTOs

5. **Seed à lancer** : `npm run seed:offer-categories` (backend) pour insérer les 10 catégories

### 🚀 Pour tester

```bash
# 1. Lancer le backend
cd backend && npm run start:dev

# 2. Seeder les catégories (une seule fois)
npm run seed:offer-categories

# 3. Tester les endpoints (via Swagger sur http://localhost:3001/swagger)
# Ou curl :
curl http://localhost:3001/api/offers
```

### ⚠️ Points d'attention

| Point | Détail |
|-------|--------|
| **MongoDB requis** | Le serveur NestJS ne démarre pas sans MongoDB (`MongooseModule`). Vérifier que MongoDB tourne sur `localhost:27017`. |
| **synchronize: true** | Les tables sont créées automatiquement au démarrage. Pas besoin de migration. |
| **Seed idempotent** | `seed:offer-categories` peut être relancé sans risque. |
| **TypeORM columns** | Tous les `number \| null` doivent avoir `type: 'int'` explicite (sinon erreur `DataTypeNotSupportedError`). C'est corrigé. |

### 🔗 Schéma relationnel complet

```
offer_categories (1) ──→ offers (*)
offers (1) ──→ offer_items (*)
offer_items (1) ──→ offer_item_prices (*)
offer_items (1) ──→ offer_item_capacity (*)
offer_items (1) ──→ offer_item_availability_rules (*)
offer_items (1) ──→ offer_item_sessions (*)

users (1) ──→ bookings (*)
offers (1) ──→ bookings (*)
offer_items (1) ──→ bookings (*)
offer_item_sessions (1) ──→ bookings (*)
bookings (1) ──→ booking_participants (*)

circuits (1) ──→ circuit_days (*)
circuit_days (1) ──→ circuit_program_items (*)
circuits (1) ──→ circuit_options (*)
circuits (1) ──→ circuit_reservations (*)
circuit_reservations (1) ──→ circuit_reservation_options (*)
circuit_options (1) ──→ circuit_reservation_options (*)

users (1) ──→ notifications (*)
```

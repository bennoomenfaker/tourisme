# EcoVoyage — Plateforme d'Éco-Tourisme Tunisie

> **PR pour Maram** — Catalogue, réservation, circuits, notifications, plans de voyage, onboarding, maps, favoris, avis, et correctifs de bugs

---

## 1. Ce qui a été ajouté / corrigé

### Fonctionnalités principales

| Module | Description |
|--------|-------------|
| **Catalogue avancé** | Items vendables (hebergement, activite, restauration...), prix par categorie, sessions datées, capacite, disponibilites |
| **Réservations** | Réservation d'offres/items/sessions avec participants, confirmation auto/manuelle, annulation, double reservation prevention |
| **Calcul prix côté serveur** | Prix calcule automatiquement selon `pricing_unit` (per_person, per_person_per_night, per_room_per_night, per_bed, per_night) — le client n'envoie jamais `total_price` |
| **Gestion capacite** | `remaining_capacity` decremente a la reservation, restaure a l'annulation; statut `full` quand 0 |
| **Circuits multi-jours** | Packages avec programme jour par jour, GPS, images, options, réservation avec verification des participants |
| **Circuits dans TripPlan** | TripPlan supporte les items circuit (XOR avec offer_item) — reservation groupée mixte |
| **Notifications** | Système complet : booking, annulation, offre approuvée, nouveau message, circuit dispo, admin approve/reject |
| **Plans de voyage (TripPlan)** | Créer des plans multi-activités (offres + circuits), réserver en groupe avec verification des limites |
| **Favoris** | Toggle favori sur offres et circuits (POST toggle, check, count) — eco-voyageurs uniquement |
| **Avis (Reviews)** | Notes 1-5 + commentaire + photos, un par user par cible, note moyenne publique |
| **Upload images Cloudinary** | Composant `ImageUploader` drag-and-drop, upload via `POST /upload` → URL stockee en DB |
| **Cartes Leaflet/OpenStreetMap** | Cartes interactives sur circuits, plans de voyage, détail offre (avec attribution OSM) |
| **Onboarding guidé** | Questionnaire onboarding multi-étapes pour chaque rôle (5 étapes pour eco-voyageur) |
| **Partage via messagerie** | Boutons de partage qui redirigent vers la messagerie interne |
| **Login/Register validation** | Validation inline (email regex, password strength) |
| **Badge notifications** | Compteur de notifications non-lues sur l'icone (navbar + dashboard header) |
| **Dashboard eco-voyageur** | Section "Offres" avec filtres, stats reelles PostgreSQL, trip plans depuis la DB |
| **Guided Offer Wizard** | Wizard 4 étapes adapte selon le type de projet, avec gestion d'images upload |
| **Gestion d'offres (edit/view/delete)** | Boutons Editer/Supprimer sur les offres, editeur de prix/sessions |
| **Circuit edit avec images** | Modal d'edition avec ImageUploader et carte repositionnee |
| **Reservation modification** | PATCH/DELETE sur les reservations pending pour les voyageurs |
| **Moderation circuits** | Circuits en status `pending` a la creation (pas `approved` directement) |
| **Ownership checks** | addDay, addOption, addProgramItem verifient l'auteur du circuit |

### Correctifs de bugs

| Bug | Correction |
|-----|------------|
| **Onboarding redirect loop** | `traveler_id` corrigé en `traveler: { id }` dans eco-traveler.service.ts |
| **Reservation page loading** | `setLoading(false)` maintenant appele sur le chemin de succes |
| **Offer detail "Reserver" button** | Bouton toujours affiche pour les eco-voyageurs |
| **Circuit modal scroll** | Tous les modals ont `max-h-[90vh] overflow-y-auto` |
| **Circuit edit map position** | MapPicker deplace avant le bouton sauvegarder |
| **Messagerie useSearchParams** | Wrappe dans un `<Suspense>` boundary |
| **apiFetch 204 handling** | Retourne null pour les reponses 204/vide |
| **Double reservation prevention** | Offres et circuits verifient les reservations non-annulees existantes |
| **Provider notifications** | Notifie l'auteur de l'offre/circuit lors d'une reservation |
| **Dashboard notification badge** | Compteur non-lues affiche sur l'icone dans le header dashboard |
| **Trip plans dashboard** | Trip plans recuperees depuis la DB (pas de valeurs hardcodees) |
| **AppNavbar token** | Cle `localStorage` corrigee: `"token"` → `"access_token"` |
| **Notifications endpoint** | Frontend appelle `/notifications/unread` (pas `/unread-count`) |
| **TripPlanModule** | Circuit + CircuitReservation imports ajoutes (manquants) |

---

## 2. Stack Technique

### Backend (`/backend`)

| Technologie | Usage |
|-------------|-------|
| NestJS ^11 | Framework backend |
| TypeORM ^0.3 | ORM PostgreSQL |
| PostgreSQL 15 | Base relationnelle |
| MongoDB 7 | Base NoSQL (prefs, engagement) |
| class-validator | Validation DTOs |

### Frontend (`/frontend`)

| Technologie | Usage |
|-------------|-------|
| Next.js 16 | Framework React (App Router) |
| React 19 | UI Library |
| Tailwind CSS ^4 | Styling |
| Leaflet / react-leaflet | Cartes interactives |
| Framer Motion | Animations |
| Lucide React | Icones |

### Configuration

| Variable | Valeur |
|----------|--------|
| Backend port | 3001 |
| Frontend port | 3000 |
| PostgreSQL | localhost:5433, user: marammejri, db: tourism_db |
| Currency | TND (Tunisian Dinar) |

---

## 3. Modules Backend Ajoutes

```
backend/src/
├── booking/           Réservations (bookings, participants, confirmation, prix calcule server-side)
├── circuit/           Circuits multi-jours (jours, programme, options, réservations, ownership checks)
├── notification/      Notifications utilisateur (tous les types d'evenements)
├── trip-plan/         Plans de voyage (CRUD + réservation groupée + support circuits)
├── favorite/          Favoris (toggle, check, count — offer/circuit/project/guide)
├── review/            Avis (notes 1-5, commentaire, photos, note moyenne)
```

### Nouvelles entites PostgreSQL

| Table | Description |
|-------|-------------|
| `offers` (+7 colonnes) | category_id, address, latitude, longitude, confirmation_mode, meeting_lat/lng |
| `offer_items` | Elements vendables avec type, details, capacite |
| `offer_item_prices` | Prix par categorie (Adulte, Enfant, Etudiant...) |
| `offer_item_sessions` | Creneaux datés avec capacite |
| `offer_item_capacities` | Capacite restante par type (beds, seats, tents, spaces) |
| `bookings` | Reservations avec ref, status, participants, prix calcule server-side |
| `booking_participants` | Individus dans une reservation |
| `circuits` (+images) | Circuits multi-jours avec GPS, status pending/approved |
| `circuit_days` | Jours du circuit |
| `circuit_program_items` | Activites du programme |
| `circuit_options` | Options additionnelles |
| `circuit_reservations` | Reservations de circuits |
| `notifications` | Notifications utilisateur |
| `trip_plans` | Plans de voyage |
| `trip_plan_items` | Items des plans (offre OU circuit) |
| `favorites` | Favoris (user + type + target, unique constraint) |
| `reviews` | Avis (rating 1-5, comment, photos, target) |
| `offer_categories` | Lookup (10 categories seedees) |

---

## 4. Pages Frontend Ajoutees

| Route | Page |
|-------|------|
| `/offers/[id]` | Detail offre (items, prix, sessions, images, carte, bouton Reserver) |
| `/reservations/new` | Formulaire reservation (item, session, participants, montant) |
| `/dashboard/reservations` | Mes reservations voyageur (statut, annulation) |
| `/dashboard/incoming` | Reservations recues provider (confirmer/refuser) |
| `/circuits` | Liste publique circuits (filtre region) |
| `/circuits/[id]` | Detail circuit (itineraire, images, options, carte, reservation) |
| `/notifications` | Notifications (liste, marquer lu) |
| `/trip-plans` | Plans de voyage (liste) |
| `/trip-plans/new` | Creation plan |
| `/trip-plans/[id]` | Detail plan (items, reservation groupee) |

---

## 5. Endpoints API Ajoutes

### Catalogue

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/offers` | Guide/Project — creer offre |
| PATCH | `/offers/:id` | Owner — modifier |
| POST | `/offers/:offerId/items` | Creer item |
| PATCH | `/offers/items/:itemId` | Modifier item |
| DELETE | `/offers/items/:itemId` | Supprimer item |
| POST | `/offers/items/:itemId/prices` | Ajouter prix |
| PATCH | `/offers/items/prices/:priceId` | Modifier prix |
| DELETE | `/offers/items/prices/:priceId` | Supprimer prix |
| POST | `/offers/items/:itemId/sessions` | Creer session |
| PATCH | `/offers/items/sessions/:sessionId` | Modifier session |
| DELETE | `/offers/items/sessions/:sessionId` | Supprimer session |
| GET | `/offers/:id` | Detail avec items, prix, sessions |

### Reservations

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/bookings` | Eco-voyageur (prix calcule server-side) |
| GET | `/bookings/mine` | Eco-voyageur |
| GET | `/bookings/incoming` | Provider |
| GET | `/bookings/:id` | Tous (si concerne) |
| PATCH | `/bookings/:id/cancel` | Eco-voyageur (capacite restauree) |

### Circuits

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/circuits` | Guide/Project (status: pending) |
| GET | `/circuits` | Public (filtre status=approved) |
| GET | `/circuits/:id` | Detail |
| PATCH | `/circuits/:id` | Owner |
| POST | `/circuits/:circuitId/days` | Owner (ownership check) |
| PATCH | `/circuits/days/:dayId` | Owner |
| DELETE | `/circuits/days/:dayId` | Owner |
| POST | `/circuits/:circuitId/program` | Owner (ownership check) |
| PATCH | `/circuits/program/:programId` | Owner |
| DELETE | `/circuits/program/:programId` | Owner |
| POST | `/circuits/:circuitId/options` | Owner (ownership check) |
| POST | `/circuits/:circuitId/reserve` | Eco-voyageur |
| GET | `/circuits/reservations/mine` | Eco-voyageur |
| GET | `/circuits/reservations/incoming` | Provider |
| PATCH | `/circuits/reservations/:id/confirm` | Provider |
| PATCH | `/circuits/reservations/:id` | Eco-voyageur (modifier) |
| DELETE | `/circuits/reservations/:id` | Eco-voyageur (supprimer) |

### Notifications

| Methode | Endpoint | Role |
|---------|----------|------|
| GET | `/notifications` | Tous |
| PATCH | `/notifications/:id/read` | Tous |
| PATCH | `/notifications/read-all` | Tous |
| GET | `/notifications/unread` | Tous — compteur |

### Trip Plans

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/trip-plans` | Eco-voyageur |
| GET | `/trip-plans/mine` | Eco-voyageur |
| GET | `/trip-plans/:id` | Proprietaire |
| PATCH | `/trip-plans/:id` | Proprietaire |
| DELETE | `/trip-plans/:id` | Proprietaire |
| POST | `/trip-plans/:id/items` | Proprietaire (offer_item_id XOR circuit_id) |
| PATCH | `/trip-plans/:id/items/:itemId` | Proprietaire |
| DELETE | `/trip-plans/:id/items/:itemId` | Proprietaire |
| POST | `/trip-plans/:id/book` | Proprietaire (bookings + circuit_reservations) |

### Favoris

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/favorites` | Eco-voyageur — toggle (add/remove) |
| GET | `/favorites?type=` | Eco-voyageur — liste par type |
| GET | `/favorites/check/:targetType/:targetId` | Eco-voyageur — verifier si favori |
| GET | `/favorites/count/:targetType` | Public — compteur par type |
| DELETE | `/favorites/:targetType/:targetId` | Eco-voyageur — supprimer |

### Avis (Reviews)

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/reviews` | Eco-voyageur — creer (1 par user par cible) |
| GET | `/reviews/target/:type/:id` | Public — avis d'une cible |
| GET | `/reviews/mine` | Eco-voyageur — mes avis |
| GET | `/reviews/average/:type/:id` | Public — note moyenne |
| PATCH | `/reviews/:id` | Auteur — modifier |
| DELETE | `/reviews/:id` | Auteur — supprimer |

### Upload

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/upload` | Auth — upload image vers Cloudinary |

---

## 6. Seed Categories

```bash
cd backend && npm run seed:offer-categories
```

| slug | label | icon |
|------|-------|------|
| eco_tour | Eco-Tour | eco |
| accommodation | Hebergement | house |
| activity | Activite | target |
| restaurant | Restauration | food |
| craft | Artisanat | craft |
| workshop | Atelier | tools |
| transfer | Transfert | van |
| sejour | Sejour | stay |
| circuit | Circuit | route |
| other | Autre | other |

---

## 7. Donnees de test

- 10 utilisateurs (admin + eco-voyageurs + guides + project-owners)
- 12 offres avec items, prix, sessions (realistes Tunisie)
- 6 circuits avec jours, programme, images, GPS
- 8 bookings, 6 circuit_reservations
- 3 trip plans avec items
- 9 sessions avec capacite
- 6 projets eco-touristiques
- Notifications associees

---

## 8. Lancement

```bash
# Backend
cd backend && npm install && npm run start:dev
# -> http://localhost:3001/api
# -> http://localhost:3001/swagger

# Frontend
cd frontend && npm install && npm run dev
# -> http://localhost:3000
```

---

## 9. Fichiers modifies/crees

### Backend — Fichiers modifies

| Fichier | Modifications |
|---------|---------------|
| `backend/src/app.module.ts` | +imports BookingModule, CircuitModule, NotificationModule, TripPlanModule |
| `backend/src/offer/entities/offer.entity.ts` | +category_id, address, latitude, longitude, confirmation_mode |
| `backend/src/offer/entities/offer-item.entity.ts` | +bed_count, nights, tent_capacity, room_type |
| `backend/src/offer/dto/offer.dto.ts` | +DTOs prices, sessions, UpdateOfferItemPriceDto, UpdateOfferItemSessionDto |
| `backend/src/offer/offer.service.ts` | +updatePrice, updateSession, removePrice, removeSession, PATCH returns JSON |
| `backend/src/offer/offer.controller.ts` | +PATCH/DELETE endpoints prices, sessions |
| `backend/src/circuit/entities/circuit.entity.ts` | +images (simple-array) |
| `backend/src/circuit/dto/create-circuit.dto.ts` | +images field |
| `backend/src/circuit/circuit.service.ts` | +images handling, findAll(status?) |
| `backend/src/circuit/circuit.controller.ts` | +reserve() uses circuit.confirmation_mode, capacity check |
| `backend/src/eco-traveler/eco-traveler.service.ts` | Imports Booking + CircuitReservation, counts reelles depuis PostgreSQL |
| `backend/src/eco-traveler/eco-traveler.module.ts` | +Booking, CircuitReservation imports |

### Backend — Fichiers crees

| Fichier | Description |
|---------|-------------|
| `backend/src/booking/` | Module complet (entite, service, controller, DTO) |
| `backend/src/circuit/` | Module complet (6 entites, service, controller, DTOs) |
| `backend/src/notification/` | Module complet |
| `backend/src/trip-plan/` | Module complet (2 entites, 4 DTOs, service, controller) |

### Frontend — Fichiers modifies

| Fichier | Modifications |
|---------|---------------|
| `frontend/app/dashboard/page.tsx` | EcoTravelerOffersSection, CreateCircuitModal, edit/view/delete offres |
| `frontend/app/offers/[id]/page.tsx` | Bouton Reserver global, edit mode, images gallery |
| `frontend/app/circuits/[id]/page.tsx` | Image gallery, edit modal with images, modals overflow-y-auto |
| `frontend/app/reservations/new/page.tsx` | setLoading(false) sur succes |
| `frontend/app/messagerie/page.tsx` | Suspense boundary pour useSearchParams |
| `frontend/lib/api.ts` | apiFetch gere 204/empty responses |
| `frontend/lib/offer-config.ts` | PROJECT_TYPES, OFFER_CATEGORIES, CATEGORY_FORM_FIELDS |
| `frontend/components/GuidedOfferWizard.tsx` | Edit mode, image URL manager, PATCH on submit |

### Frontend — Fichiers crees

| Fichier | Description |
|---------|-------------|
| `frontend/app/offers/[id]/page.tsx` | Detail offre |
| `frontend/app/reservations/new/page.tsx` | Formulaire reservation |
| `frontend/app/dashboard/reservations/page.tsx` | Mes reservations |
| `frontend/app/dashboard/incoming/page.tsx` | Reservations recues |
| `frontend/app/circuits/page.tsx` | Liste circuits |
| `frontend/app/circuits/[id]/page.tsx` | Detail circuit |
| `frontend/app/notifications/page.tsx` | Notifications |
| `frontend/app/trip-plans/` | 3 pages (liste, new, detail) |
| `frontend/components/map/CircuitMap.tsx` | Carte Leaflet pour circuits |
| `frontend/components/map/TripMap.tsx` | Carte Leaflet pour trip plans |
| `frontend/components/home/DestinationsSection.tsx` | Real circuits from API |
| `frontend/components/home/FeaturedExperiences.tsx` | Real offers from API |
| `frontend/components/home/CircuitsSection.tsx` | Circuits on homepage |

---

## 10. Points importants

- `synchronize: true` sur TypeORM (auto-sync entities en dev)
- Les types de projet en DB sont en francais (`hebergement`, `artisanat`...)
- Le wizard normalise les types en anglais pour la config
- **Upload images**: `ImageUploader` → Cloudinary via `POST /upload` → URL stockee en DB
- **Prix toujours calcule server-side**: le client n'envoie jamais `total_price`
- `pricing_unit` values: `per_person`, `per_person_per_night`, `per_room_per_night`, `per_bed`, `per_night`
- `images/` contient des **screenshots** (documentation), PAS des uploads Cloudinary
- Les offres ont un champ `offer_type` varchar (pas `category_id` pour le wizard)
- La table `trip_plans` utilise `eco_traveler_id` (pas `user_id`)
- La table `notifications` utilise `body` (pas `message`)
- La table `circuit_days` utilise `day_number` (pas `number`)
- `whitelist: true, forbidNonWhitelisted: true` sur le global ValidationPipe
- `GuidedOfferWizard` edit mode: skip step 1, utilise PATCH, refetch apres update
- `apiFetch` retourne `null as T` pour les reponses 204/vide
- `AppNavbar` utilise `localStorage.getItem("access_token")` (pas `"token"`)
- Les circuits sont en `pending` a la creation (moderation admin)
- `addDay`/`addOption`/`addProgramItem` necessitent `authorId?` pour ownership check
- `TripPlanItem` supporte `circuit_id` (nullable) + `offer_item_id` (nullable) — XOR
- Les favoris: pattern toggle (POST = add/remove), unique constraint par user+type+target
- Les reviews: 1 review par user par cible, rating 1-5, photos optionnelles

---

## 11. Galerie de Screenshots

L'application EcoVoyage a ete entierement developpee et integree. Voici quelques apercus de l'interface :

<details>
<summary>Cliquez pour voir la galerie (75+ screenshots dans le dossier `images/`)</summary>

### Dashboard & Navigation
![Dashboard Eco-voyageur](images/Screenshot_2026-06-18_12-54-04.png)
![Dashboard Guide](images/Screenshot_2026-06-18_12-54-10.png)
![Dashboard Notification Badge](images/Screenshot_2026-06-18_13-25-54.png)

### Offres & Catalogue
![Detail Offre avec Carte](images/Screenshot_2026-06-18_12-54-18.png)
![Assistant Creation Offre](images/Screenshot_2026-06-18_12-54-30.png)
![Prix et Sessions](images/Screenshot_2026-06-18_12-54-43.png)
![Creation Offre Activite](images/cree%20offre%20actvite.png)

### Reservations
![Formulaire Reservation](images/Screenshot_2026-06-18_12-54-50.png)
![Mes Reservations](images/Screenshot_2026-06-18_12-59-20.png)
![Reservations Recues Provider](images/Screenshot_2026-06-18_12-59-26.png)

### Circuits
![Liste Circuits](images/Screenshot_2026-06-18_12-54-57.png)
![Detail Circuit avec Carte](images/Screenshot_2026-06-18_12-55-03.png)
![Circuit avec Images](images/Screenshot_2026-06-18_13-56-15.png)

### Plans de Voyage
![Liste Trip Plans](images/Screenshot_2026-06-18_12-55-13.png)
![Detail Trip Plan](images/Screenshot_2026-06-18_12-55-18.png)

### Notifications & Messagerie
![Notifications](images/Screenshot_2026-06-18_13-05-29.png)
![Messagerie Privee](images/Screenshot_2026-06-18_13-28-28.png)

### Cartes & Localisation
![Carte Leaflet Offre](images/Screenshot_2026-06-18_12-55-31.png)
![Carte Circuit](images/Screenshot_2026-06-18_12-55-48.png)

### Auth & Onboarding
![Connexion](images/Screenshot_2026-06-18_13-57-21.png)
![Inscription](images/Screenshot_2026-06-18_13-57-41.png)
![Onboarding Eco-voyageur](images/Screenshot_2026-06-18_13-57-53.png)

### Homepage
![Landing Page EcoVoyage](images/Screenshot_2026-06-18_13-58-39.png)

*Tous les screenshots complets sont disponibles dans le dossier `images/` du depot.*
</details>

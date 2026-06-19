# EcoVoyage — Plateforme d'Éco-Tourisme Tunisie

> **PR pour Maram** — Catalogue, réservation, circuits, notifications, plans de voyage, onboarding, maps, partage, et correctifs de bugs

---

## 1. Ce qui a été ajouté / corrigé

### Fonctionnalités principales

| Module | Description |
|--------|-------------|
| **Catalogue avancé** | Items vendables (hebergement, activite, restauration...), prix par categorie, sessions datées, capacite, disponibilites |
| **Réservations** | Réservation d'offres/items/sessions avec participants, confirmation auto/manuelle, annulation, double reservation prevention |
| **Circuits multi-jours** | Packages avec programme jour par jour, GPS, images, options, réservation avec verification des participants |
| **Notifications** | Système de notifications (booking confirmé, annulation, demande, offre approuvée, nouveau message, circuit dispo) |
| **Plans de voyage (TripPlan)** | Créer des plans multi-activités, réserver en groupe avec verification des limites de participants |
| **Onboarding guidé** | Questionnaire onboarding multi-étapes pour chaque rôle (5 étapes pour eco-voyageur) |
| **Cartes Leaflet/OpenStreetMap** | Cartes interactives sur circuits, plans de voyage, détail offre |
| **Partage via messagerie** | Boutons de partage qui redirigent vers la messagerie interne |
| **Login/Register validation** | Validation inline (email regex, password strength) |
| **Badge notifications** | Compteur de notifications non-lues sur l'icone |
| **Dashboard eco-voyageur** | Section "Offres" avec filtres (Toutes/Disponibles/Réservées), stats reelles PostgreSQL |
| **Guided Offer Wizard** | Wizard 4 étapes adapte selon le type de projet, avec gestion d'images URL |
| **Gestion d'offres (edit/view/delete)** | Boutons Editer/Supprimer sur les offres, editeur de prix/sessions |
| **Circuit edit avec images** | Modal d'edition avec gestionnaire d'images URL et carte repositionnee |
| **Reservation modification** | PATCH/DELETE sur les reservations pending pour les voyageurs |

### Correctifs de bugs

| Bug | Correction |
|-----|------------|
| **Onboarding redirect loop** | `traveler_id` corrigé en `traveler: { id }` dans eco-traveler.service.ts (erreur TypeORM) |
| **Reservation page loading** | `setLoading(false)` maintenant appele sur le chemin de succes (pas seulement en .catch) |
| **Offer detail "Reserver" button** | Bouton toujours affiche pour les eco-voyageurs, meme si l'offre a des items |
| **Circuit modal scroll** | Tous les modals ont `max-h-[90vh] overflow-y-auto` |
| **Circuit edit map position** | MapPicker deplace avant le bouton sauvegarder |
| **Messagerie useSearchParams** | Wrappe dans un `<Suspense>` boundary |
| **apiFetch 204 handling** | Retourne null pour les reponses 204/vide |
| **Double reservation prevention** | Offres et circuits verifient les reservations non-annulees existantes |
| **Provider notifications** | Notifie l'auteur de l'offre/circuit lors d'une reservation |

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
├── booking/           Réservations (bookings, participants, confirmation)
├── circuit/           Circuits multi-jours (jours, programme, options, réservations)
├── notification/      Notifications utilisateur
├── trip-plan/         Plans de voyage (CRUD + réservation groupée)
```

### Nouvelles entites PostgreSQL

| Table | Description |
|-------|-------------|
| `offers` (+5 colonnes) | category_id, address, latitude, longitude, confirmation_mode |
| `offer_items` | Elements vendables avec type, details |
| `offer_item_prices` | Prix par categorie (Adulte, Enfant, Etudiant...) |
| `offer_item_sessions` | Creneaux datés avec capacite |
| `bookings` | Reservations avec ref, status, participants |
| `booking_participants` | Individus dans une reservation |
| `circuits` (+images) | Circuits multi-jours avec GPS |
| `circuit_days` | Jours du circuit |
| `circuit_program_items` | Activites du programme |
| `circuit_options` | Options additionnelles |
| `circuit_reservations` | Reservations de circuits |
| `notifications` | Notifications utilisateur |
| `trip_plans` | Plans de voyage |
| `trip_plan_items` | Items des plans |
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
| POST | `/bookings` | Eco-voyageur |
| GET | `/bookings/mine` | Eco-voyageur |
| GET | `/bookings/incoming` | Provider |
| GET | `/bookings/:id` | Tous (si concerne) |
| PATCH | `/bookings/:id/cancel` | Eco-voyageur |

### Circuits

| Methode | Endpoint | Role |
|---------|----------|------|
| POST | `/circuits` | Guide/Project |
| GET | `/circuits` | Public (filtre status=approved) |
| GET | `/circuits/:id` | Detail |
| PATCH | `/circuits/:id` | Owner |
| POST | `/circuits/:circuitId/days` | Owner |
| PATCH | `/circuits/days/:dayId` | Owner |
| DELETE | `/circuits/days/:dayId` | Owner |
| POST | `/circuits/:circuitId/program` | Owner |
| PATCH | `/circuits/program/:programId` | Owner |
| DELETE | `/circuits/program/:programId` | Owner |
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
| POST | `/trip-plans/:id/items` | Proprietaire |
| PATCH | `/trip-plans/:id/items/:itemId` | Proprietaire |
| DELETE | `/trip-plans/:id/items/:itemId` | Proprietaire |
| POST | `/trip-plans/:id/book` | Proprietaire |

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
- Les images des circuits/offres sont stockees comme URL (pas de file upload)
- Les offres ont un champ `offer_type` varchar (pas `category_id` pour le wizard)
- La table `trip_plans` utilise `eco_traveler_id` (pas `user_id`)
- Le badge de notifications affiche le vrai compteur non-lues
- La page destinations affiche les circuits reellement proposes

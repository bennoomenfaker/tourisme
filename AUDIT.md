# AUDIT COMPLET DU PROJET ECO-VOYAGE

---

## 1. ARCHITECTURE GENERALE

### Architecture actuelle

```
Backend: NestJS + TypeORM + PostgreSQL (43 tables) + MongoDB (6 collections)
Frontend: Next.js 14 (App Router) + Tailwind CSS + Leaflet/OpenStreetMap
Port backend: 3001 | Port frontend: 3000
DB: PostgreSQL localhost:5433, user marammejri, db tourism_db
```

**Modules backend (24):**
auth, users, eco-traveler, guide, project-owner, offer, booking, circuit, trip-plan, notification, publication, interactions, follow, messages, reports, admin, questionnaire, place-contribution, upload, mail, config, database, common

**Tables PostgreSQL (43):**
users, eco_travelers, friendships, guides, project_owners, projects, offers, offer_categories, offer_items, offer_item_prices, offer_item_availability_rules, offer_item_capacity, offer_item_sessions, bookings, booking_participants, circuits, circuit_days, circuit_program_items, circuit_options, circuit_reservations, circuit_reservation_options, publications, publication_likes, publication_comments, comment_likes, item_likes, item_comments, item_comment_likes, follows, conversations, messages, notifications, reports, place_contributions, contribution_votes, questionnaires, question_categories, questions, answers, questionnaire_attempts, user_answers, trip_plans, trip_plan_items

**Collections MongoDB (6):**
traveler_preferences, traveler_engagement, guide_skills, guide_engagement, project_engagement, project_services

### Architecture prevue (ecart)
- Pas de WebSocket (messagerie REST/polling uniquement)
- Pas de migration TypeORM (`synchronize: true` en prod)
- Pas de middleware Next.js (auth uniquement cote client)
- Pas de `error.tsx`, `loading.tsx`, `not-found.tsx`
- Pas de nested layouts
- `UsersController` vide (aucun endpoint)

---

## 2. CATALOGUE

### Categories existantes (10)
`eco_tour`, `accommodation`, `activity`, `restaurant`, `craft`, `workshop`, `transfer`, `sejour`, `circuit`, `other`

### Structure reelle des offres

```
Offer (catalogue entry) -- PAS directement reservable
  ├── author_id + author_type (guide ou project_owner)
  ├── project_id (nullable)
  ├── category_id
  ├── title, description, price (LEGACY), duration
  ├── confirmation_mode (automatic/manual)
  ├── status (pending/approved/rejected)
  └── OfferItem[] -- L'UNITE DE RESERVATION
        ├── name, item_type, room_type, bed_count, nights, tent_capacity
        ├── OfferItemPrice[] (label, price, pricing_unit, is_default)
        ├── OfferItemSession[] (date, start/end_time, capacity, price_override)
        ├── OfferItemCapacity[] (DEAD CODE - jamais utilise)
        └── OfferItemAvailabilityRule[] (stocke mais jamais consomme)
```

### Comment un guide cree une offre ?
1. `POST /offers` → cree l'Offer (status = pending ou approved si ambassadeur)
2. `POST /offers/:id/items` → cree un OfferItem
3. `POST /offers/items/:itemId/prices` → cree les prix
4. `POST /offers/items/:itemId/sessions` → cree les sessions (manuellement)
5. `POST /offers/items/:itemId/availability` → cree les regles (non generees en sessions)

### Comment un proprietaire cree une offre ?
Meme processus, avec `project_id` lie a son projet.

### Comment un ecovoyageur reserve une offre ?
1. `POST /bookings` avec `offer_id`, `offer_item_id`, `session_id`, `total_price`, `participants`
2. Le **prix est envoye par le client** (pas de calcul cote serveur pour les offres directes)
3. Si `confirmation_mode = automatic` → status = `confirmed`
4. Si `confirmation_mode = manual` → status = `pending`, le provider doit confirmer

---

## 3. HEBERGEMENT

### Dortoir

```
OfferItem:
  item_type: 'dormitory' ou 'bed'
  room_type: 'shared_dormitory'
  bed_count: nombre de lits

OfferItemPrice:
  label: "Adulte", "Enfant"
  price: ex 5000 XAF
  pricing_unit: 'per_person' (defaut) ou 'per_night'
```

**Prix**: Par lit? Par personne? Par nuit?
→ Le systeme definit `pricing_unit` (`per_person`, `per_night`) mais **NE L'UTILISE PAS** dans les calculs. Le seul endroit qui calcule un prix est le TripPlan: `price * participantCount` (ignore `per_night`). Pour les reservations directes, **le client envoie le total**.

**RESULTAT: Le systeme de prix par lit/nuit n'est PAS fonctionnel.**

### Chambre privee

```
OfferItem:
  item_type: 'private_room' ou 'room'
  room_type: 'private' / 'double' / 'family'
```

Meme probleme: `pricing_unit` definit mais non utilise. Le prix est envoye par le client.

### Camping

```
OfferItem:
  item_type: 'tent_space' ou 'camping_space'
  room_type: 'tent'
  tent_capacity: nombre max de personnes
```

Meme probleme. `tent_capacity` est stocke mais jamais utilise dans le calcul du prix.

### Reservation hebergement - Flux reel

```
EcoVoyageur
  ↓
Choisit logement (OfferItem)
  ↓
Choisit nombre personnes (participants[])
  ↓
Choisit nombre nuits (OFF - pas de champ nights dans le flux de reservation)
  ↓
Calcul prix: ???
  → Reservation directe: le CLIENT envoie total_price (pas de calcul)
  → TripPlan: price * participantCount (ignore nights, ignore pricing_unit)
  ↓
Reservation (POST /bookings ou POST /trip-plans/:id/book)
```

**CRITIQUE: Il n'y a pas de multiplicateur de nuits. Le champ `nights` sur OfferItem n'est utilise nulle part dans les calculs de prix.**

---

## 4. ACTIVITES

### Randonee, kayak, velo, atelier, visite guideee

Toutes sont representees comme des `OfferItem` avec `item_type`:
- `'activity'` pour randonnee, kayak, velo
- `'workshop'` pour atelier
- `'activity'` pour visite guidee

**Capacite**: Geree via `OfferItemSession.total_capacity` / `remaining_capacity`
**Dates**: `OfferItemSession.date`, `start_time`, `end_time`
**Prix**: `OfferItemPrice` avec `pricing_unit` (non utilise)
**Participants**: `BookingParticipant` array dans le booking

**PROBLEME: La capacite des sessions n'est jamais decrementee. `remaining_capacity` est verifie mais jamais mis a jour. Overselling possible.**

---

## 5. ARTISANAT

### Atelier (ex: Atelier tissage)
→ Represente comme `OfferItem` avec `item_type: 'workshop'`

### Produit (ex: Tapis artisanal)
→ Represente comme `OfferItem` avec `item_type: 'activity'` ou `'workshop'`

**Stock?** → `OfferItemCapacity` entity existe mais est **DEAD CODE** (jamais utilisee dans le service)
**Precommande?** → `production_delay_days` sur OfferItem (stocke mais jamais utilise en logique metier)
**Delai fabrication?** → idem `production_delay_days`
**Prix?** → `OfferItemPrice` standard

**RESULTAT: Le systeme artisanat n'a pas de gestion de stock, precommande, ni delai.**

---

## 6. CIRCUITS

### Qui peut creer un circuit?
**GUIDE et PROJECT_OWNER** (les deux)
- `circuit.controller.ts:34`: `@Roles(Role.GUIDE, Role.PROJECT)`
- `author_type`: `'guide'` ou `'project_owner'`

**IMPORTANT: Les circuits sont immediatement `approved` (`circuit.service.ts:62`), ils bypass l'admin moderation.**

### Structure

```
Circuit
  ├── base_price, currency, max_participants
  ├── confirmation_mode, status, region
  ├── lat/lng, address, images
  ├── CircuitDay[] (day_number, title, lat/lng, location_name)
  │     └── CircuitProgramItem[] (title, start/end_time, is_included, is_required)
  │           ├── linked_offer_item_id → OfferItem
  │           └── linked_location_id → PlaceContribution
  └── CircuitOption[] (option_group, extra_price, offer_item_id)
        └── option_type: single_choice/multiple_choice/quantity/time_slot
```

**PROBLEME: Les sous-entites (addDay, addOption, addProgramItem) n'everifient PAS que l'utilisateur authentifie possede le circuit. N'importe quel GUIDE/PROJECT peut modifier le circuit d'un autre.**

---

## 7. TRIPPLAN

### Qui cree un TripPlan?
**ECO_TRAVELER uniquement**
- `trip-plan.controller.ts`: `@Roles(Role.ECO_TRAVELER)`

### Structure

```
TripPlan
  ├── eco_traveler_id (FK → users)
  ├── title, description, start_date, end_date
  ├── status: 'draft'
  └── TripPlanItem[]
        ├── offer_item_id (FK → offer_items)
        ├── day_number, sort_order, notes
        └── PAS de circuit_id
```

### Un TripPlan peut contenir:
- **Plusieurs offres?** OUI (chaque item = un OfferItem d'une offre differente)
- **Plusieurs circuits?** NON directement (pas de champ circuit_id)
- **Plusieurs prestataires?** OUI (chaque item peut etre d'un provider different)

### Reservation TripPlan
- `POST /trip-plans/:id/book`
- Genere **N Bookings separe** (un par item)
- Pas d'invoice unifiee ni de remise groupe
- Les participants sont stockes par Booking (BookingParticipant), pas par TripPlan

---

## 8. NOTIFICATIONS

### Notifications fonctionnelles (10 points de creation)

| # | Scenario | Destinataire | Type | Fichier:Ligne |
|---|----------|-------------|------|---------------|
| 1 | Reservation offre | Voyageur | `booking_confirmed` / `booking_request` | `booking.service.ts:85-90` |
| 2 | Reservation offre | Provider | `new_booking_request` | `booking.service.ts:92-97` |
| 3 | Annulation offre (voyageur) | Voyageur | `booking_cancelled` | `booking.service.ts:134-140` |
| 4 | Confirmation offre (provider) | Voyageur | `booking_confirmed` | `booking.service.ts:156-162` |
| 5 | Reservation circuit (auto) | Voyageur | `booking_confirmed` | `circuit.service.ts:248-249` |
| 6 | Reservation circuit (manuel) | Voyageur | `booking_request` | `circuit.service.ts:250-251` |
| 7 | Reservation circuit | Provider | `new_booking_request` | `circuit.service.ts:254-258` |
| 8 | Confirmation circuit | Voyageur | `booking_confirmed` | `circuit.service.ts:275-281` |
| 9 | TripPlan (manuel, par provider) | Provider | `booking_request` | `trip-plan.service.ts:217-222` |
| 10 | TripPlan (complet) | Voyageur | `booking_request` | `trip-plan.service.ts:231-237` |

### Notifications MANQUANTES

| # | Manquant | Impact |
|---|----------|--------|
| 1 | Offre approuvee/rejetee par admin | Provider sans feedback |
| 2 | Publication approuvee/rejetee par admin | Auteur sans feedback |
| 3 | Projet approuve/rejete par admin | Proprietaire sans feedback |
| 4 | Nouveau message | Pas de badge notification pour messages |
| 5 | Annulation offre → provider NOTIFIE | Provider ne sait pas |
| 6 | Annulation circuit → provider NOTIFIE | Provider ne sait pas |
| 7 | TripPlan auto-confirm → provider NOTIFIE | Seul le mode manuel notifie |
| 8 | **BUG CRITIQUE**: Frontend appelle `/notifications/unread-count` mais backend expose `/notifications/unread` | Badge navbar casse |

---

## 9. DASHBOARD

### EcoTraveler
| Feature | Disponible? | Details |
|---------|-------------|---------|
| Reservations | OUI | Onglet + page dediee |
| Favoris | **NON** | Aucun systeme de favoris |
| TripPlans | OUI | Liste + creation + detail |
| Notifications | OUI | Onglet + page dediee |
| Badges | OUI | 4 badges (Explorateur, Ambassadeur, Contributeur, Protecteur) |
| Score durable | OUI | Score/100 avec breakdown |
| Publications | OUI | Modal creation |
| Offres | OUI | Browse & reserver |
| Circuits | OUI | Browse circuits |
| Avis | **NON** | Compteur mais pas de page |

### Guide
| Feature | Disponible? | Details |
|---------|-------------|---------|
| Offres | OUI | GuidedOfferWizard (creation/modification) |
| Circuits | OUI | CreateCircuitModal |
| Reservations recues | OUI | Onglet + page incoming |
| Revenus | **NON** | Pas de dashboard revenus |
| Notifications | OUI | Meme onglet |
| Badges | OUI | 4 badges (Guide Eco-Certifie, Ambassadeur, Expert, Formateur) |
| Score durable | OUI | Breakdown different |

### ProjectOwner
| Feature | Disponible? | Details |
|---------|-------------|---------|
| Projets | OUI | CRUD complet |
| Offres | OUI | GuidedOfferWizard |
| Circuits | OUI | CreateCircuitModal |
| Reservations | OUI | Incoming |
| Statistiques | **NON** | Juste des compteurs basiques |
| Notifications | OUI | Meme onglet |
| Badges | OUI | 4 badges |

**PROBLEME: Le dashboard est un fichier MONOLITHIQUE de 2800+ lignes, 50+ useState. Les pages `/dashboard/ecovoyageur`, `/dashboard/guide`, `/dashboard/project-owner` sont de simples redirects.**

---

## 10. FAVORIS

**AUCUN SYSTEME DE FAVORIS N'EXISTE**

- Pas de table `favorites` ou `bookmarks`
- Pas de page favoris
- Pas de composant favori
- Le compteur `favorites_count` est affiche dans les badges mais sans UI pour gerer

---

## 11. AVIS

**PAS DE SYSTEME D'AVIS FONCTIONNEL**

- Les stats montrent `feedback_given` et `feedback_received` mais pas de page pour voir/gerer
- `PubInteractions` gere likes/commentaires sur les publications (social, pas avis)
- Pas de notation par etoiles sur offres/circuits/guides/projets
- Pas de page d'avis dans le dashboard

---

## 12. PARTAGE

| Type | Fonctionnel? | Details |
|------|-------------|---------|
| Partage TripPlan | OUI | Via messagerie interne |
| Partage Circuit | OUI | Via messagerie interne |
| Partage Offre | OUI | Via `PubInteractions` (copie lien, envoi message) |
| Partage Publication | OUI | Via `PubInteractions` |
| Partage profil | OUI | Via `PubInteractions` |

Le systeme de partage est base sur la messagerie interne. Pas de partage reseaux sociaux (Facebook, Twitter, WhatsApp).

---

## 13. CARTOGRAPHIE

### Ce qui existe
| Composant | Utilisation |
|-----------|-------------|
| `MapView` | Destinations, Admin, Profils |
| `MapPicker` | Dashboard (creation), Circuits, TripPlans, Profils, GuidedOfferWizard |
| `CircuitMap` | Detail circuit (jours + polyline) |
| `TripMap` | Detail TripPlan (offres + marqueurs) |

**Technologie:** Leaflet 1.9.4 + react-leaflet 5.0.0 + OpenStreetMap tiles + Nominatim geocoding
**Couverture:** ~85% complete

### Ce qui manque
1. **Page offre detail** (`/offers/[id]`) → PAS de carte malgre lat/lng disponibles
2. **Attribution OpenStreetMap** manquante sur `CircuitMapInner` et `TripMapInner` (obligation legale)
3. **Marqueurs CDN** (unpkg.com) au lieu de bundling local
4. **CSS Leaflet** injectee de maniere inconsistante (race conditions potentielles)

---

## 14. UX/UI

### Par page

| Page | Qualite | Notes |
|------|---------|-------|
| Homepage | **Correct** | Hero, HowItWorks, Destinations, Featured, Newsletter |
| Login/Register | **Excellent** | Material Design, validation, OAuth Google |
| Destinations | **Correct** | Filtrage riche, grille responsive |
| Offres catalogue | **Correct** | Recherche, filtres, skeleton loading |
| Offre detail | **A ameliorer** | Pas de carte, boutons gallery incoherents, doublons CTA |
| Circuits liste | **Correct** | Cards, filtres |
| Circuit detail | **A ameliorer** | 849 lignes, 30+ useState, alert() brut |
| TripPlans | **Correct** | CRUD complet |
| Dashboard | **Critique** | 2800 lignes monolithiques |
| Profils | **A ameliorer** | 2300-3400 lignes par fichier |
| Notifications | **Correct** | Liste, mark-read |
| Messagerie | **Correct** | Conversations, chat |
| Admin | **Correct** | Moderation multi-onglets |
| Onboarding | **Correct** | Wizards multi-etapes |

### Incoherences
1. **Token key**: `AppNavbar` lit `"token"` au lieu de `"access_token"` → badge notification casse
2. **Annee copyright**: 2024 (login/register) vs 2026 (footer)
3. **Styles boutons**: Auth pages (`bg-primary text-slate-900 font-extrabold`) vs dashboard (`bg-primary text-white font-semibold`)
4. **Back buttons**: Parfois `BackToDashboard`, parfois fleche raw
5. **AppNavbar**: Absente sur `/notifications`, `/messagerie`, `/dashboard/incoming`
6. **27 liens `href="#"`** morts (footer, navbar, auth pages)
7. **Hamburger mobile**: Bouton present mais aucun `onClick`
8. **`alert()`/`confirm()` brut**: 15+ occurrences au lieu de modals custom

---

## 15. COMPARAISON METIER

### vs Idwey (hebergement ecotouristique Tunisie)
| Fonctionnalite | EcoVoyage | Idwey |
|----------------|-----------|-------|
| Hebergement | Structure offre/item/prix | Maisons d'hotes, hebergements |
| Activites | Offres avec sessions | Ateliers, activities reservees en ligne |
| Circuits | Jours + programmes + options | Circuits et experiences |
| Blog | **NON** | Oui (inspirations) |
| Application mobile | **NON** | Oui |
| Paiement en ligne | **NON** | Integration paiement |
| Recherche avancee | Filtres basiques | Filtres par date, lieu, personnes |
| Impact durable | Score + badges | ODD8, ODD11, ODD12, ODD13 |
| Communaute | Publications, follow, messages | Partenaires locaux |

### vs Wildyness (activites immersives)
| Fonctionnalite | EcoVoyage | Wildyness |
|----------------|-----------|-----------|
| Experiences | Offres generiques | Experiences immersives authentiques |
| Categories | 10 categories | Food, trek, cultural, adventure |
| Prix | TND (base) | USD (base) |
| Avis | **NON** | Systeme d'avis integre (4.7/5) |
| Referral | **NON** | Programme "Refer a Friend" |
| Blog | **NON** | Travel blog |
| App mobile | **NON** | Non (web uniquement) |
| Creation itineraire | TripPlan basique | Create Your Itinerary |
| Groupes | Participants count | Petits groupes |

### Plateformes tourisme durable modernes (best practices)
| Fonctionnalite | EcoVoyage | Best Practice |
|----------------|-----------|---------------|
| Filtres durabilite | Score visible | Filtres GSTC/Key/Green certifies |
| Calcul empreinte carbone | **NON** | Calculateur carbone integre |
| Compensation carbone | **NON** | "Une reservation = un arbre" |
| Badges durabilite | OUI | OUI |
| Transparence prix | **NON** (client envoie le prix) | Prix calcule cote serveur |
| Paiement securise | **NON** | Stripe/PayPal integration |
| Annulation flexible | Champ stocke, pas de logique | Politiques d'annulation claires |
| Chat en direct | Messagerie REST | Chat en temps reel (WebSocket) |
| Notifications push | **NON** | Push notifications mobile |
| PWA | **NON** | Progressive Web App |

---

## 16. DETTE TECHNIQUE

### Code duplique
1. **2 systemes d'interactions**: `publication/` (PublicationLike, PublicationComment) + `interactions/` (ItemLike, ItemComment) — paralleles, non connectes
2. **Questionnaire pages**: 3 pages quasi identiques (`eco-traveler`, `guide`, `project-owner`) au lieu d'un composant parametre
3. **Injection CSS Leaflet**: 5 composants injectent/retirent independamment le CSS
4. **Token reading**: `localStorage.getItem("access_token")` repete dans chaque page

### Composants reutilisables
- `ImageUploader` (utilise dans 3+ endroits)
- `GuidedOfferWizard` (utilise dans dashboard + offer detail)
- `MapView`, `MapPicker`, `CircuitMap`, `TripMap`
- `PubInteractions` (utilise dans profils)
- `BackToDashboard` (utilise dans 8+ pages)

### Composants inutilises
- `CircuitsSection` (`components/home/CircuitsSection.tsx`) — jamais importe
- `lib/imageStore.ts` — IndexedDB store, jamais importe
- 3 pages redirect-only (`/dashboard/ecovoyageur`, `/dashboard/guide`, `/dashboard/project-owner`)
- `OfferItemCapacity` entity — enregistree mais jamais utilisee
- `ProjectServices` MongoDB schema — orpheline

### Bugs potentiels
1. **CRITIQUE**: `AppNavbar` lit `"token"` au lieu de `"access_token"` → badge notification casse
2. **CRITIQUE**: Frontend appelle `/notifications/unread-count` mais backend expose `/notifications/unread`
3. **CRITIQUE**: `remaining_capacity` des sessions jamais decrementee → overselling possible
4. **CRITIQUE**: `total_price` envoye par le client pour les reservations directes → falsification possible
5. **HAUT**: Circuits immediatement `approved` sans moderation admin
6. **HAUT**: Sous-entites circuits sans verification d'ownership
7. **MOYEN**: `pricing_unit` (per_night, per_hour) defini mais jamais utilise
8. **MOYEN**: `session.price_override` defini mais jamais utilise
9. **MOYEN**: `nights` sur OfferItem jamais multiplie dans les calculs
10. **MOYEN**: `synchronize: true` en production
11. **BAS**: 27 liens `href="#"` morts
12. **BAS**: Alert/confirm brut au lieu de modals

---

## 17. RAPPORT FINAL

### Ce qui est conforme a la vision Eco-Voyage
- Structure multi-roles (EcoTraveler, Guide, ProjectOwner)
- Systeme d'offres avec items, prix, sessions
- Circuits avec jours, programmes, options
- TripPlan avec items multi-providers
- Notifications de base (reservation, confirmation, annulation)
- Score de durabilite et badges
- Publications et messagerie
- Cartographie Leaflet/OpenStreetMap
- Moderation admin (publications, offres, projets)
- Follow/amis entre utilisateurs

### Ce qui manque
1. **Systeme de favoris** (offres, circuits, projets)
2. **Systeme d'avis** (etoiles + commentaires sur offres/circuits)
3. **Calcul de prix cote serveur** (multiplicateur nuits, pricing_unit)
4. **Gestion de capacite reelle** (decrementer remaining_capacity)
5. **Notifications admin** (approbation/rejet)
6. **Notification messagerie** (nouveau message)
7. **Dashboard revenus** (guide)
8. **Dashboard statistiques** (project_owner)
9. **Blog** (inspirations, articles)
10. **Application mobile** / PWA
11. **Paiement en ligne** (Stripe/PayPal)
12. **Partage reseaux sociaux**
13. **Page offre avec carte** (manquante malgre lat/lng)
14. **Middleware Next.js** (protection cote serveur)
15. **Gestion artisanat** (stock, precommande, delai)

### Ce qui est mal implemente
1. **Prix hebergement**: `nights` jamais multiplie, `pricing_unit` ignore
2. **Capacite sessions**: `remaining_capacity` jamais decremente
3. **Badge notification navbar**: Key `"token"` au lieu de `"access_token"`
4. **Endpoint unread**: Mismatch frontend/backend (`/unread-count` vs `/unread`)
5. **Circuits**: Bypass moderation, pas d'ownership check sur sous-entites
6. **Dashboard**: Monolithique 2800 lignes
7. **Offre detail**: Pas de carte malgre lat/lng
8. **Circuits**: Status immediatement `approved` sans moderation

### Ce qui doit etre corrige (Priorite haute)
1. Corriger `AppNavbar` token key → `"access_token"`
2. Corriger endpoint unread → aligner frontend/backend
3. Implementer decrement de `remaining_capacity` sur booking
4. Implementer calcul prix cote serveur (nights * price * participants)
5. Ajouter verification d'ownership sur sous-entites circuits
6. Ajouter notifications manquantes (admin, messages, annulations)
7. Mettre `synchronize: false` en production + ajouter migrations

### Ce qui doit etre enrichi (Priorite moyenne)
1. Systeme de favoris
2. Systeme d'avis avec etoiles
3. Dashboard revenus (guide)
4. Dashboard statistiques (project_owner)
5. Carte sur page offre detail
6. Attribution OpenStreetMap sur toutes les cartes
7. Nettoyer code mort (CircuitsSection, imageStore, OfferItemCapacity, 3 redirects)
8. Extraire composants du dashboard monolithique

### Priorite basse
1. Corriger 27 liens `href="#"` morts
2. Remplacer alert()/confirm() par des modals
3. Unifier styles boutons/inputs
4. Ajouter not-found.tsx, error.tsx, loading.tsx
5. Blog/inspirations
6. Partage reseaux sociaux
7. PWA / app mobile

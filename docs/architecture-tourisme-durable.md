# Architecture Système — Plateforme Tourisme Durable

## 🧠 Analyse du Concept "Projet"

**Problème identifié :** Le mot "Projet" est inadapté.

```
Projet
├── Hébergement
├── Restaurant
├── Artisanat
├── Agence
└── Centre loisir
```

Ce n'est pas un projet. C'est **une organisation touristique**.

**Proposition :** `Organization` ou `TourismOrganization`

Exemples concrets :
- Maison d'hôtes
- Camping
- Coopérative artisanale
- Agence locale
- Restaurant

---

## 🏛️ Modèle Métier — Cœur du Système

```
Organization
│
├── name
├── description
├── photos
├── coordonnées (lat/lng, adresse)
├── score durable
├── badges
├── horaires
├── website, téléphone, réseaux sociaux
│
├── Offre Hébergement    ← Chambre double, Dortoir, Camping, Tente privée
├── Offre Activité       ← Kayak, Randonnée, Observation oiseaux, Atelier cuisine
├── Offre Restauration   ← Déjeuner traditionnel, Dîner berbère
├── Offre Artisanat      ← Atelier poterie, Atelier tissage, Produit artisanal
└── Offre Transport      ← Navette, Transfert, Location vélo
```

### Exemple concret

```
Eco Camp Douz (Organization)
│
├── Camping              (Offre Hébergement)  ← 20 places
├── Tente privée         (Offre Hébergement)  ← 2 personnes max
├── Balade chameau       (Offre Activité)     ← tous les dimanches
├── Atelier cuisine      (Offre Activité)     ← vendredi
└── Dîner berbère        (Offre Restauration) ← quotidien
```

---

## 📦 Offres — Types & Sous-types

### Hébergement

| Type | Modèle de capacité |
|------|-------------------|
| **Chambre privée** | max personnes, prix par personne ou forfait |
| **Dortoir** | nombre de lits, prix par lit |
| **Camping / Tente** | prix par personne, max pers. par tente, nombre de tentes disponibles |

### Activité

| Type | Modèle de capacité |
|------|-------------------|
| **Randonnée** | max participants, créneau horaire |
| **Kayak** | max participants, créneau horaire |
| **Atelier cuisine** | max participants, date fixe |
| **Observation oiseaux** | max participants, créneau horaire |
| **Visite culturelle** | max participants, durée |

### Restauration

| Type | Modèle de capacité |
|------|-------------------|
| **Repas traditionnel** | couverts disponibles, service midi/soir |
| **Dîner berbère** | réservation par personne, date |

### Artisanat

| Type | Modèle de capacité |
|------|-------------------|
| **Atelier poterie** | max participants, créneau |
| **Atelier tissage** | max participants, créneau |
| **Produit artisanal** | stock, précommande |

### Transport

| Type | Modèle de capacité |
|------|-------------------|
| **Navette** | places, horaire fixe |
| **Transfert privé** | véhicule, trajet |
| **Location vélo** | nombre de vélos, durée |

---

## 🧩 Nouvelle Structure des Offres (unifiée)

Le système d'offre doit être unique mais flexible pour couvrir tous les types.

```
offer
├── id: uuid PK
├── organization_id: uuid → organizations
├── owner_id, owner_type
├── title, description
├── offer_category: 'accommodation' | 'activity' | 'restaurant' | 'craft' | 'transport'
├── offer_subtype: string (libre, ex: 'private_room', 'camping', 'hiking', 'workshop')
├── price: decimal
├── price_model: 'per_person' | 'fixed' | 'per_bed' | 'per_tent' | 'per_item'
├── images, region
├── meeting_point, meeting_lat/lng
├── min_group_size, max_group_size
├── min_age
├── cancellation_policy
├── sustainability_score
├── status: pending | approved | rejected
│
├── ACCOMMODATION_SPECIFICS (JSONB ou table dédiée)
│   ├── max_persons, price_per_person, fixed_price     ← chambre privée
│   ├── number_of_beds, price_per_bed                  ← dortoir
│   ├── max_per_tent, tents_available, price_per_tent  ← camping
│   └── amenities                                      ← wifi, clim, petit-déjeuner
│
├── ACTIVITY_SPECIFICS (JSONB)
│   ├── duration_minutes
│   ├── difficulty: 'easy' | 'moderate' | 'hard'
│   ├── equipment_provided: boolean
│   └── guide_required: boolean
│
├── RESTAURANT_SPECIFICS (JSONB)
│   ├── meal_type: 'breakfast' | 'lunch' | 'dinner'
│   ├── max_covers
│   └── menu_description
│
├── CRAFT_SPECIFICS (JSONB)
│   ├── duration_minutes
│   ├── materials_included: boolean
│   └── takeaway: boolean
│
└── TRANSPORT_SPECIFICS (JSONB)
    ├── vehicle_type
    ├── max_passengers
    ├── route_description
    └── includes_pickup: boolean
```

---

## ⏰ Le Plus Compliqué : Système de Disponibilité

Le vrai défi : chaque type d'offre a un modèle de disponibilité différent.

### Exemples de réservation

| Offre | Réservation |
|-------|------------|
| Chambre double | 2 nuits, 3 personnes |
| Kayak | 10 juin, 09h, 4 personnes |
| Camping | 5 places |
| Dîner berbère | 12 août, 20h, 2 personnes |
| Atelier poterie | 15 juin, 14h, 1 personne |
| Location vélo | 3 jours |

### Modèle unifié de disponibilité

```
offer_availability
├── id: uuid PK
├── offer_id: uuid → offers
├── date: DATE                       ← date spécifique
├── start_time: TIME?                ← "09:00" pour une activité
├── end_time: TIME?                  ← "11:00"
├── recurrence: 'none' | 'daily' | 'weekly' | 'custom'
├── recurrence_end_date: DATE?       ← si récurrent
├── day_of_week: int[]?              ← [1,3,5] pour lundi/mercredi/vendredi
│
├── capacity_model: 'slot' | 'quantity' | 'continuous'
│   ├── 'slot'        = créneau horaire (kayak à 09h, max 4 places)
│   ├── 'quantity'    = stock (camping: 20 places disponibles)
│   └── 'continuous'  = durée continue (location vélo: 10 vélos, résa par jour)
│
├── max_capacity: int                ← capacité totale
├── reserved_count: int              ← déjà réservé
├── total_quantity: int?             ← pour 'quantity' model (ex: 20 tentes)
│
├── price_override: decimal?         ← prix spécial pour cette date
├── is_available: boolean            ← manuellement désactivable
└── version: int                     ← optimistic locking

Index: (offer_id, date, start_time) UNIQUE
```

### Logique de réservation par type

```
CHAMBRE DOUBLE (capacity_model: 'slot', durée: 2 nuits)
→ Vérifier 2 lignes availability (date=J1, date=J2)
→ Les 2 doivent avoir reserved_count + 1 <= max_capacity
→ Réserver = incrémenter les 2

KAYAK (capacity_model: 'slot', horaire fixe)
→ 1 ligne availability (date=10/06, start_time=09:00)
→ reserved_count + participants <= max_capacity
→ Incrémenter reserved_count

CAMPING (capacity_model: 'quantity')
→ 1 ligne availability (date=arrivée, start_time=NULL)
→ reserved_count + participants <= max_capacity
→ 'quantity' = places de camping, pas de durée spécifique

ATELIER CUISINE (capacity_model: 'slot', date fixe)
→ 1 ligne availability (date=15/06, start_time=14:00)
→ reserved_count + participants <= max_capacity
→ Incrémenter

LOCATION VÉLO (capacity_model: 'continuous', 3 jours)
→ 3 lignes availability (J1, J2, J3)
→ Chaque ligne: reserved_count + 1 <= total_quantity (10 vélos)
→ Incrémenter les 3 lignes
```

---

## 🧳 Plan de Voyage Voyageur (TripPlan)

C'est probablement **LA fonctionnalité innovante** de la plateforme.

### Concept

```
Mon voyage à Djerba (TripPlan)
│
├── Jour 1 (TripPlanDay)
│   ├── 08:00 Randonnée         ← booking
│   ├── 11:00 Kayak             ← booking
│   ├── 13:00 Restaurant local  ← booking
│   ├── 16:00 Atelier artisanat ← booking
│   └── 20:00 Camping           ← booking
│
├── Jour 2 (TripPlanDay)
│   ├── 09:00 Visite culturelle ← booking
│   └── 18:00 Dîner berbère    ← booking
│
└── Participants (TripPlanMember)
    ├── Moi (propriétaire)
    ├── Amine
    └── Leila (vue partagée)
```

### Structure BDD

```
trip_plans
├── id: uuid PK
├── owner_id: uuid → users
├── owner_type: 'eco_traveler'
├── name: string               ← "Mon voyage à Djerba"
├── description: text?
├── start_date: DATE
├── end_date: DATE
├── is_public: boolean         ← partagé via lien
├── share_token: string?       ← token unique pour partage (UUID)
├── status: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled'
├── total_budget: decimal?
├── total_sustainability_score: int?  ← calculé depuis les bookings
└── created_at, updated_at

trip_plan_days
├── id: uuid PK
├── trip_plan_id: uuid → trip_plans
├── day_number: int            ← 1, 2, 3...
├── date: DATE
└── notes: text?

trip_plan_items
├── id: uuid PK
├── day_id: uuid → trip_plan_days
├── booking_id: uuid? → bookings
├── offer_snapshot: JSONB      ← copie des infos offre au moment de l'ajout
│   ├── title, price, duration, offer_type, organization_name
│   └── owner_id, owner_type
├── custom_title: string?      ← si ajout manuel (sans réservation)
├── start_time: TIME
├── end_time: TIME?
├── notes: text?
├── order: int                 ← ordre dans la journée
└── created_at
```

### Partage de Plan

```
Comme Google Maps ou Notion :

trip_plan_shares
├── id: uuid PK
├── trip_plan_id: uuid → trip_plans
├── shared_with_user_id: uuid? → users  ← si utilisateur connu
├── shared_with_email: string?           ← si invité par email
├── permission: 'view' | 'edit'
├── token: string (UUID unique)          ← lien de partage
├── accepted_at: DATE?
└── created_at

Lien de partage : /plans/shared/<token>
→ Accès sans authentification (avec verrouillage optionnel)
→ Vue en lecture seule des jours/activités
→ Possibilité de commenter
```

---

## 🗺️ Circuits Touristiques

### Concept

Un **Circuit** est un itinéraire pré-construit par un **Guide**, une **Organisation** ou un **Admin**.

```
Exemple : Circuit Sud Tunisie 5 jours
Créé par : Guide ou Organisation ou Admin

Jour 1
├── Camping Sahara
├── Atelier artisanat
└── Dîner berbère

Jour 2
├── Randonnée montagne
└── Restaurant local

Jour 3
├── Kayak mer
├── Observation oiseaux
└── Nuit chez l'habitant
```

### Structure BDD

```
circuits
├── id: uuid PK
├── author_id: uuid
├── author_type: 'guide' | 'organization' | 'admin'
├── organization_id: uuid? → organizations
├── title: string               ← "Circuit Sud Tunisie 5 jours"
├── description: text
├── region: string
├── duration_days: int
├── difficulty: 'easy' | 'moderate' | 'hard'
├── theme: string[]             ← ['aventure', 'culture', 'nature', 'gastronomie']
├── images: string[]
├── price_total: decimal?       ← prix estimé total
├── price_per_person: decimal
├── sustainability_score: int
├── status: 'draft' | 'published' | 'archived'
├── is_featured: boolean        ← mis en avant par l'admin
└── created_at, updated_at

circuit_days
├── id: uuid PK
├── circuit_id: uuid → circuits
├── day_number: int
├── title: string?              ← "Jour 1 : Départ de Douz"
├── description: text?
├── region: string?             ← région de la journée
└── accommodation_offer_id: uuid? → offers  ← hébergement suggéré pour la nuit

circuit_stops
├── id: uuid PK
├── circuit_day_id: uuid → circuit_days
├── offer_id: uuid? → offers    ← activité/restaurant lié
├── stop_type: 'activity' | 'restaurant' | 'craft' | 'transport' | 'visit'
├── title: string
├── description: text?
├── duration_minutes: int?
├── lat: decimal(10,7)
├── lng: decimal(10,7)
├── order: int
├── waypoint_type: 'start' | 'stop' | 'overnight' | 'end'
└── notes: text?
```

### Cartographie d'un Circuit

```
Chaque circuit_day / circuit_stop a des coordonnées GPS.

Exemple : Douz → Sahara → Ksar Ghilane → Douz

circuit_waypoints
├── id: uuid PK
├── circuit_id: uuid → circuits
├── day_number: int
├── lat: decimal(10,7)
├── lng: decimal(10,7)
├── title: string
├── type: 'pickup' | 'stop' | 'viewpoint' | 'accommodation' | 'restaurant' | 'activity'
├── order: int
├── description: text?
└── offer_id: uuid? → offers

→ Rendu sur carte OpenStreetMap + Leaflet
→ Tracé du trajet (polylines entre waypoints)
→ Marqueurs par type
→ Info-bulles au clic
```

---

## 🧭 Programme ÉcoVoyageur

### Concept

L'ÉcoVoyageur n'est plus un simple utilisateur passif. C'est un acteur du tourisme durable avec un **programme de progression**.

### Niveaux et Scores

```
Programme ÉcoVoyageur
│
├── Score de durabilité (0-100)
│   ├── Questionnaire   → 20%
│   ├── Réservations    → 40%  ← réservations d'activités durables
│   ├── Avis            → 20%  ← feedbacks sur les expériences
│   └── Partages        → 20%  ← plans partagés, publications
│
├── Badges
│   ├── Explorateur Durable          ← onboarding terminé
│   ├── Ambassadeur AFRATIM          ← score >= 80
│   ├── Contributeur Communautaire   ← 3 plans partagés
│   ├── Protecteur de la Nature      ← 10 réservations durables
│   └── Planificateur Expert         ← 5 itinéraires créés
│
└── Fonctionnalités débloquables
    ├── Niveau 1 (inscription)    : consultation offres, messagerie
    ├── Niveau 2 (onboarding)     : création plans, réservation
    ├── Niveau 3 (score >= 40)    : partage plans, publications
    ├── Niveau 4 (score >= 60)    : création circuits personnels
    └── Niveau 5 (score >= 80)    : badge Ambassadeur, accès bêta
```

### Parcours voyageur

```
1. Inscription (email ou Google)
2. Onboarding 5 étapes
   ├── Identité
   ├── Type de voyageur
   ├── Motivations & Valeurs
   ├── Centres d'intérêt & Paysages
   └── Objectifs durables
3. Questionnaire durabilité (11 questions)
4. Découverte des offres (Destinations)
5. Création d'un plan de voyage (TripPlan)
6. Réservation d'activités
7. Avis et notation
8. Partage du plan
9. Badges et progression
```

---

## 🗄️ Schéma BDD Complet

### PostgreSQL (données transactionnelles)

```
-- =============================================
-- CŒUR DU SYSTÈME
-- =============================================

users                              ← déjà existant
├── id: uuid PK
├── email, password
├── role: eco_traveler | provider | guide | admin
├── status: pending | active | banned | archived
└── auth_method, tokens...

project_owners                     ← conservé (profil prestataire)
├── user_id: uuid PK → users
├── full_name, bio, country, language
├── photo, cover_photo
├── organization_name              ← "AFRATIM Voyages"
├── position, phone
├── sustainability_score
└── profile_completion, is_onboarded

organizations                      ← REMPLACE projects
├── id: uuid PK
├── owner_id: uuid → project_owners.user_id
├── name: string                   ← "Eco Camp Douz"
├── slug: string                   ← URL-friendly
├── description: text
├── short_description: string?
├── org_type: string[]             ← ['camping', 'eco_lodge', 'restaurant', 'agency']
├── region: string
├── address: string
├── lat: decimal(10,7)
├── lng: decimal(10,7)
├── photo: string
├── photos: string[]
├── opening_hours: string?
├── facebook, instagram, website, phone
├── services: string[]             ← ['wifi', 'restaurant', 'parking']
├── eco_labels: string[]           ← ['panneaux_solaires', 'zero_plastique']
├── status: pending | active | rejected
├── rejection_reason: string?
├── sustainability_score: int?
├── sustainability_badges: string[]?
└── settings: JSONB?               ← configurable

-- =============================================
-- OFFRES UNIFIÉES
-- =============================================

offers                             ← MODIFIÉ (project_id → organization_id)
├── id: uuid PK
├── organization_id: uuid? → organizations
├── author_id: uuid
├── author_type: 'guide' | 'project_owner'
├── title: string
├── description: text?
├── offer_category: 'accommodation' | 'activity' | 'restaurant' | 'craft' | 'transport'
├── offer_subtype: string?         ← 'private_room', 'camping', 'hiking',...
├── price: decimal?
├── price_model: 'per_person' | 'fixed' | 'per_unit'
├── duration: string?              ← affichage : "2h", "3 jours"
├── images: string[]
├── inclusions: text?
├── region: string?
├── meeting_point: string?
├── meeting_lat: decimal(10,7)?
├── meeting_lng: decimal(10,7)?
├── min_group_size: int?
├── max_group_size: int?
├── min_age: int?
├── cancellation_policy: text?
├── specifics: JSONB               ← données spécifiques au type d'offre
│   ex: { "max_persons": 2, "beds": 1, "tents": 5 }
├── sustainability_score: int?
├── status: pending | approved | rejected
├── rejection_reason: string?
└── created_at, updated_at

-- =============================================
-- DISPONIBILITÉ & CAPACITÉ
-- =============================================

offer_availabilities
├── id: uuid PK
├── offer_id: uuid → offers
├── date: DATE
├── start_time: TIME?              ← NULL pour 'quantity' model
├── end_time: TIME?
├── recurrence: 'none' | 'daily' | 'weekly'
├── recurrence_end_date: DATE?
├── day_of_week: int[]?
├── capacity_model: 'slot' | 'quantity' | 'continuous'
├── max_capacity: int
├── reserved_count: int (default 0)
├── price_override: decimal?
├── is_available: boolean (default true)
├── notes: text?
└── version: int

Index: (offer_id, date, start_time) UNIQUE

-- =============================================
-- RÉSERVATIONS
-- =============================================

bookings
├── id: uuid PK
├── booking_ref: string            ← ex: "ECO-2024-0001" (lisible)
├── offer_id: uuid → offers
├── organization_id: uuid? → organizations
├── traveler_id: uuid → eco_travelers.user_id
├── group_id: uuid? → groups
├── status: pending | confirmed | rejected | cancelled | completed
├── participants_count: int
├── total_price: decimal
├── currency: string (default 'TND')
│
├── booking_dates                  ← pour 'continuous' model (plusieurs dates)
│   └── date_from: DATE, date_to: DATE
├── booking_slots                  ← pour 'slot' model (créneaux spécifiques)
│   └── [{ availability_id, date, start_time }]
│
├── guest_names: string[]?
├── special_requests: text?
├── guide_notes: text?
├── cancellation_reason: text?
├── confirmed_at: timestamp?
├── cancelled_at: timestamp?
└── created_at, updated_at

booking_availabilities             ← table de liaison (réservation → créneaux)
├── id: uuid PK
├── booking_id: uuid → bookings
├── availability_id: uuid → offer_availabilities
├── quantity_reserved: int
└── unit_price: decimal

-- =============================================
-- GROUPES VOYAGEURS
-- =============================================

groups
├── id: uuid PK
├── name: string
├── created_by: uuid → users
├── max_members: int (default 10)
├── invite_token: string?          ← lien d'invitation
└── created_at

group_members
├── id: uuid PK
├── group_id: uuid → groups
├── user_id: uuid → users
├── role: 'admin' | 'member'
├── joined_at: timestamp?
├── invited_by: uuid? → users
└── status: 'pending' | 'accepted' | 'declined'

-- =============================================
-- PLANS DE VOYAGE (TRIP PLANS)
-- =============================================

trip_plans
├── id: uuid PK
├── owner_id: uuid → users
├── owner_type: 'eco_traveler'
├── name: string
├── description: text?
├── start_date: DATE
├── end_date: DATE
├── is_public: boolean (default false)
├── share_token: string?           ← UUID unique pour lien de partage
├── status: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled'
├── total_budget: decimal?
├── total_sustainability_score: int?
└── created_at, updated_at

trip_plan_days
├── id: uuid PK
├── trip_plan_id: uuid → trip_plans
├── day_number: int
├── date: DATE
└── notes: text?

trip_plan_items
├── id: uuid PK
├── day_id: uuid → trip_plan_days
├── booking_id: uuid? → bookings
├── offer_snapshot: JSONB
│   ├── title, organization_name, price, duration
│   ├── offer_category, offer_subtype
│   └── owner_id, owner_type
├── custom_title: string?          ← activité manuelle (sans réservation)
├── start_time: TIME
├── end_time: TIME?
├── notes: text?
├── order: int
└── created_at

trip_plan_shares
├── id: uuid PK
├── trip_plan_id: uuid → trip_plans
├── shared_with_user_id: uuid? → users
├── shared_with_email: string?
├── permission: 'view' | 'edit'
├── token: string                  ← lien unique
├── accepted_at: timestamp?
└── created_at

-- =============================================
-- CIRCUITS TOURISTIQUES
-- =============================================

circuits
├── id: uuid PK
├── author_id: uuid
├── author_type: 'guide' | 'organization' | 'admin'
├── organization_id: uuid? → organizations
├── title: string                  ← "Circuit Sud Tunisie 5 jours"
├── description: text
├── region: string
├── duration_days: int
├── difficulty: 'easy' | 'moderate' | 'hard'
├── theme: string[]
├── images: string[]
├── price_total: decimal?
├── price_per_person: decimal?
├── sustainability_score: int?
├── status: 'draft' | 'published' | 'archived'
├── is_featured: boolean
└── created_at, updated_at

circuit_days
├── id: uuid PK
├── circuit_id: uuid → circuits
├── day_number: int
├── title: string?
├── description: text?
├── region: string?
└── accommodation_offer_id: uuid? → offers

circuit_stops
├── id: uuid PK
├── circuit_day_id: uuid → circuit_days
├── offer_id: uuid? → offers
├── stop_type: 'activity' | 'restaurant' | 'craft' | 'accommodation' | 'transport' | 'visit' | 'viewpoint'
├── title: string
├── description: text?
├── duration_minutes: int?
├── lat: decimal(10,7)
├── lng: decimal(10,7)
├── order: int
├── waypoint_type: 'start' | 'stop' | 'overnight' | 'end'
└── notes: text?

-- =============================================
-- NOTIFICATIONS
-- =============================================

notifications
├── id: uuid PK
├── user_id: uuid → users
├── type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled'
│        | 'capacity_reached' | 'group_invite' | 'plan_shared'
│        | 'circuit_published' | 'new_offer' | 'schedule_changed'
├── title: string
├── body: text
├── data: JSONB                    ← données contextuelles
├── is_read: boolean (default false)
├── read_at: timestamp?
└── created_at

-- =============================================
-- EXISTANT (conservé tel quel)
-- =============================================

eco_travelers, guides, project_owners  ← profils (inchangés)
publications, publication_likes, publication_comments, comment_likes  ← social
questionnaires, questions, answers, questionnaire_attempts, user_answers  ← scoring
conversations, messages            ← messagerie
follows                            ← abonnements
reports                            ← signalements
```

### MongoDB (préférences, engagement, données non-structurées)

```
organization_engagement           ← REMPLACE project_engagement
├── user_id (indexé)
├── sustainability_score
├── badges: [{ label, obtained_at }]
├── total_reservations, feedback_received
└── organizations_count

organization_services             ← REMPLACE project_services
├── organization_id (indexé)
├── owner_id (indexé)
├── offered_services[]
├── eco_practices[]
└── target_travelers[]

traveler_preferences
├── user_id (indexé, unique)
├── interests: [{ name, level }]
├── landscapes[]
├── activities[]
├── objectives[]
└── updated_by_behavior

traveler_engagement
├── user_id (indexé, unique)
├── durability_score
├── badges: [{ label, obtained_at }]
├── feedback_given, plans_shared, reservations_made
└── last_active_at

guide_skills
├── user_id (indexé)
├── activities[], landscapes[], certifications[]
└── updated_by_behavior

guide_engagement
├── user_id (indexé)
├── durability_score
├── badges: [{ label, obtained_at }]
├── feedback_received, reservations_handled
└── last_active_at
```

---

## 📡 API Endpoints

### Organisations

```
GET    /api/organizations/public                   ← Toutes les orgas actives
GET    /api/organizations                          ← Mes orgas
POST   /api/organizations                          ← Créer
PATCH  /api/organizations/:id                      ← Modifier
DELETE /api/organizations/:id                      ← Supprimer
PATCH  /api/organizations/:id/sustainability       ← Score durabilité
GET    /api/organizations/:id/circuits             ← Circuits d'une orga
GET    /api/organizations/:id/offers               ← Offres d'une orga
```

### Offres (unifiées)

```
POST   /api/offers                                 ← Créer
GET    /api/offers/mine                            ← Mes offres
GET    /api/offers                                 ← Toutes (publiques)
GET    /api/offers/organization/:orgId             ← Offres d'une orga
GET    /api/offers/category/:category              ← Filtrer par catégorie
PATCH  /api/offers/:id                             ← Modifier
DELETE /api/offers/:id                             ← Supprimer
```

### Disponibilités

```
POST   /api/availabilities                         ← Définir un créneau
GET    /api/availabilities?offer_id=&date=         ← Voir disponibilités
POST   /api/availabilities/batch                   ← Créer en masse (récurrence)
PATCH  /api/availabilities/:id                     ← Modifier
DELETE /api/availabilities/:id                     ← Supprimer
GET    /api/availabilities/calendar?offer_id=&from=&to=  ← Vue calendrier
```

### Réservations

```
POST   /api/bookings                               ← Réserver
GET    /api/bookings/mine                          ← Mes résas (voyageur)
GET    /api/bookings/manage                        ← Résas à gérer (provider)
PATCH  /api/bookings/:id/confirm                   ← Confirmer
PATCH  /api/bookings/:id/reject                    ← Rejeter
PATCH  /api/bookings/:id/cancel                    ← Annuler
GET    /api/bookings/:id                           ← Détail réservation
```

### Plans de Voyage

```
POST   /api/trip-plans                             ← Créer un plan
GET    /api/trip-plans/mine                        ← Mes plans
GET    /api/trip-plans/:id                         ← Détail du plan
PATCH  /api/trip-plans/:id                         ← Modifier
DELETE /api/trip-plans/:id                         ← Supprimer

POST   /api/trip-plans/:id/days                    ← Ajouter un jour
DELETE /api/trip-plans/days/:dayId                 ← Supprimer un jour

POST   /api/trip-plans/days/:dayId/items           ← Ajouter une activité
PATCH  /api/trip-plans/items/:itemId               ← Modifier l'activité
DELETE /api/trip-plans/items/:itemId               ← Supprimer l'activité

POST   /api/trip-plans/:id/share                   ← Partager le plan
GET    /api/trip-plans/shared/:token               ← Accès via lien
DELETE /api/trip-plans/shares/:shareId             ← Retirer un partage
```

### Groupes

```
POST   /api/groups                                 ← Créer un groupe
GET    /api/groups/mine                            ← Mes groupes
GET    /api/groups/:id                             ← Détail du groupe
DELETE /api/groups/:id                             ← Supprimer
POST   /api/groups/:id/members                     ← Ajouter membre
DELETE /api/groups/:id/members/:userId             ← Retirer membre
```

### Circuits

```
POST   /api/circuits                               ← Créer un circuit
GET    /api/circuits/public                        ← Tous les circuits publiés
GET    /api/circuits/mine                          ← Mes circuits
GET    /api/circuits/:id                           ← Détail du circuit
PATCH  /api/circuits/:id                           ← Modifier
DELETE /api/circuits/:id                           ← Supprimer
GET    /api/circuits/:id/waypoints                 ← Points cartographiques
```

### Notifications

```
GET    /api/notifications                          ← Mes notifications
PATCH  /api/notifications/:id/read                 ← Marquer lue
POST   /api/notifications/read-all                 ← Tout marquer lu
GET    /api/notifications/unread-count             ← Compteur non-lues
```

---

## 🗺️ Cartographie

### Stack

| Technologie | Usage |
|-------------|-------|
| **OpenStreetMap** | Tuiles cartographiques |
| **Leaflet** + **react-leaflet** | Rendu carte |
| **Nominatim** (OSM) | Reverse geocoding (adresse → coordonnées) |
| **Turf.js** | Calculs géospatiaux (distances, tracés) |

### Fonctionnalités cartographiques

```
Organisation
├── Marqueur position (lat/lng)
├── Zone d'activité (polygone/cercle)
└── Rayon de couverture

Offre
├── Point de rendez-vous (meeting_point)
└── Lieu de l'activité

Circuit
├── Ensemble de waypoints
├── Tracé du parcours (polylines)
├── Étapes avec marqueurs distincts par type
│   ├── 🟢 Départ
│   ├── 🔵 Activité
│   ├── 🍽️ Restaurant
│   ├── 🏕️ Hébergement
│   └── 🔴 Fin
└── Info-bulles au clic

Plan de voyage
├── Visualisation des activités par jour
├── Marqueurs de tous les bookings
└── Lignes de déplacement entre activités

Recherche
├── Carte interactive avec clusters
├── Filtres par catégorie d'offre
├── Filtres par région
└── Recherche à proximité (geolocation)
```

### Endpoints cartographiques

```
GET /api/map/organizations?bounds=...              ← Organisations dans le viewport
GET /api/map/offers?lat=&lng=&radius=              ← Offres à proximité
GET /api/map/circuits?region=                      ← Circuits par région
GET /api/map/search?q=&lat=&lng=                   ← Recherche géolocalisée
```

---

## 🧠 Réservation — Algorithme Anti-Conflit

```
FONCTION réserver(offer_id, date, start_time, participants, guest_names):

  1. CHARGER l'offre et vérifier :
     - offer.status === 'approved'
     - participants <= offer.max_group_size

  2. TROUVER la disponibilité :
     - SELECT * FROM offer_availabilities
       WHERE offer_id = :offer_id
         AND date = :date
         AND (start_time = :start_time OR start_time IS NULL)
         AND is_available = true
     - SI non trouvée : créer une availability par défaut
       (capacity = offer.max_group_size, model = 'slot')

  3. VALIDER LA CAPACITÉ (atomique) :
     BEGIN TRANSACTION
       UPDATE offer_availabilities
       SET reserved_count = reserved_count + :participants
       WHERE id = :availability_id
         AND reserved_count + :participants <= max_capacity
         AND version = :version

       IF rows_affected == 0 THEN
         ROLLBACK
         RETURN "Capacité insuffisante"

       INSERT INTO bookings (
         offer_id, traveler_id, participants_count,
         status: 'pending', total_price, guest_names
       )

       INSERT INTO booking_availabilities (
         booking_id, availability_id,
         quantity_reserved, unit_price
       )

     COMMIT

  4. POST-RÉSERVATION :
     - Émettre événement "booking.created"
     - Notifier organization owner
     - Vérifier capacity_reached (reserved == max)
     - Mettre à jour traveler_engagement.reservations_made

  5. RETOURNER le booking avec booking_ref
```

### Edge Cases

| Scénario | Solution |
|----------|----------|
| **Surbooking** | UPDATE atomique avec `WHERE reserved + new <= max` ET `version = :v` |
| **Race condition** | Version field + retry (3 tentatives max) |
| **Disponibilité non définie** | Fallback sur `max_group_size` de l'offre |
| **Réservation multi-jours** | Vérifier chaque jour individuellement |
| **Annulation** | Statut `cancelled`, recalcul reserved_count (atomique) |
| **Modification** | Annuler + recréer (pas de update complexe) |
| **Groupe dépasse capacité** | Vérification participants <= remaining avant INSERT |
| **Expiration pending** | CRON : passer pending → cancelled après 24h |
| **Paiement non honoré** | Statut `pending_payment` → cancelled après X minutes |
| **Chevauchement voyageur** | Vérifier conflits horaires dans trip_plan_items du voyageur |

---

## 📊 Structure des Modules Backend (finale)

```
backend/src/
│
├── common/               ← Guards, decorators, enums, interfaces
├── config/               ← Configuration (env, Joi)
├── database/             ← TypeORM + Mongoose connections, migrations
├── upload/               ← Cloudinary file storage
├── mail/                 ← Nodemailer service
│
├── users/                ← User entity + CRUD
├── auth/                 ← JWT, Google OAuth, register, login, password reset
├── eco-traveler/         ← Profil voyageur + onboarding
├── guide/                ← Profil guide + onboarding
├── project-owner/        ← Profil prestataire + onboarding (CONSERVÉ)
│
├── organization/         ← Organisations (REMPLACE "projects")
│   ├── entities/
│   ├── schemas/          ← MongoDB engagement + services
│   ├── dto/
│   └── services/
│
├── offer/                ← Offres unifiées (ADAPTÉ)
│   ├── entities/
│   ├── dto/
│   ├── offer.service.ts
│   └── offer.controller.ts
│
├── availability/         ← Disponibilités (NOUVEAU)
│   ├── entities/
│   ├── availability.service.ts
│   └── availability.controller.ts
│
├── booking/              ← Réservations + anti-conflit (NOUVEAU)
│   ├── entities/
│   ├── booking.service.ts
│   ├── booking.controller.ts
│   └── booking-conflict.service.ts
│
├── trip-plan/            ← Plans de voyage (NOUVEAU)
│   ├── entities/
│   ├── trip-plan.service.ts
│   ├── trip-plan.controller.ts
│   └── trip-plan-sharing.service.ts
│
├── circuit/              ← Circuits touristiques (NOUVEAU)
│   ├── entities/
│   ├── circuit.service.ts
│   └── circuit.controller.ts
│
├── group/                ← Groupes voyageurs (NOUVEAU)
│   ├── entities/
│   ├── group.service.ts
│   └── group.controller.ts
│
├── notification/         ← Notifications (NOUVEAU)
│   ├── entities/
│   ├── notification.service.ts
│   └── notification.gateway.ts  ← WebSocket
│
├── map/                  ← Cartographie (NOUVEAU)
│   ├── map.service.ts
│   └── map.controller.ts
│
├── publication/          ← Social (places, experiences, likes, comments)
├── questionnaire/        ← QCM durabilité
├── follow/               ← Abonnements
├── messages/             ← Messagerie privée
├── reports/              ← Signalements
├── admin/                ← Panneau admin
└── upload/               ← Upload fichiers
```

---

## 📐 Structure Frontend (Next.js App Router)

```
frontend/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/
│   │
│   ├── onboarding/
│   │   ├── eco-traveler/
│   │   ├── guide/
│   │   └── project-owner/
│   │
│   ├── dashboard/
│   │   ├── traveler/           ← Dashboard voyageur
│   │   ├── guide/              ← Dashboard guide
│   │   └── provider/           ← Dashboard prestataire
│   │
│   ├── organizations/          ← Page publique des organisations
│   │   └── [slug]/             ← Détail d'une organisation
│   │       └── offers/
│   │
│   ├── offers/                 ← Destinations (offres publiques)
│   │   └── [offerId]/
│   │
│   ├── circuits/               ← Circuits touristiques
│   │   └── [circuitId]/
│   │
│   ├── plan/                   ← Mes plans de voyage
│   │   ├── new/
│   │   ├── [planId]/
│   │   └── shared/[token]      ← Plan partagé
│   │
│   ├── bookings/               ← Mes réservations
│   │
│   ├── groups/                 ← Mes groupes
│   │
│   ├── messagerie/
│   ├── admin/
│   ├── questionnaire/
│   ├── profile/
│   └── notifications/
│
└── components/
    ├── ui/                     ← Composants génériques
    ├── map/                    ← Leaflet/OSM components
    │   ├── MapPicker.tsx
    │   ├── MapView.tsx
    │   ├── CircuitMap.tsx      ← Tracé de circuits
    │   └── OfferMap.tsx
    ├── organizations/          ← Organisation cards, modals
    ├── offers/                 ← Offer cards, filters
    ├── trip-plan/              ← Plan builder, day view
    ├── circuit/                ← Circuit builder
    ├── booking/                ← Booking form, calendar
    └── sharing/                ← Share dialog, permissions
```

---

## 🔄 Stratégie de Migration

### Phase 1 — Renommage Projet → Organisation (Sprint 1)

```
Backend:
  entities/project.entity.ts          → organization.entity.ts
  schemas/project-engagement.schema.ts → organization-engagement.schema.ts
  schemas/project-services.schema.ts   → organization-services.schema.ts
  dto/project.dto.ts                   → organization.dto.ts
  Contrôleur : routes /projects/*      → /organizations/*
  Offer : project_id                   → organization_id
  Admin : Project                      → Organization

BDD:
  RENAME TABLE projects → organizations
  ALTER TABLE offers RENAME COLUMN project_id → organization_id
  MongoDB: renameCollection("project_engagement" → "organization_engagement")
  MongoDB: renameCollection("project_services" → "organization_services")

Compatibilité:
  Anciennes routes conservées en alias @Deprecated()
  Frontend : mise à jour progressive des imports
```

### Phase 2 — Nouveaux Modules (Sprint 2)

```
  AvailabilityModule    ← Disponibilités + calendrier
  BookingModule         ← Réservations + anti-conflit
  NotificationModule    ← Notifications in-app
  Offer : unification   ← offer_category + specifics JSONB
```

### Phase 3 — Voyageur & Social (Sprint 3)

```
  TripPlanModule        ← Plans de voyage multi-jours
  GroupModule           ← Groupes voyageurs
  TripPlanSharing       ← Partage de plans
  CircuitModule         ← Circuits touristiques
  MapModule             ← Cartographie avancée
```

### Phase 4 — Améliorations (Sprint 4)

```
  ÉcoVoyageur Program   ← Badges, niveaux, gamification
  Booking scoring       ← Impact réservations sur score
  Feedback system       ← Avis et notations
  WebSocket             ← Notifications temps réel
  Paiement intégré      ← Stripe (optionnel)
```

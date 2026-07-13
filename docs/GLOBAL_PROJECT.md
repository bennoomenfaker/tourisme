# Documentation de Synthèse Globale — Tourisme Platform

> **Date :** 11 Juillet 2026
> **Statut :** Architecture alignée avec Maram (Provider/Organization/Venue)
> **Dernière mise à jour :** Renommage project-owner → provider, projects → venues

Ce document regroupe l'architecture, le modèle de données, les cas d'utilisation et le plan d'intégration des améliorations.

---

## Sommaire

1. [Stack & Infrastructure](#1-stack--infrastructure)
2. [Architecture Applicative](#2-architecture-applicative)
3. [Modèle de Données](#3-modèle-de-données)
4. [Modules Fonctionnels](#4-modules-fonctionnels)
5. [Système de Schemas Dynamiques](#5-système-de-schemas-dynamiques)
6. [Mapping avec Maram](#6-mapping-avec-maram)
7. [Plan d'Intégration](#7-plan-dintégration)

---

## 1. Stack & Infrastructure

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Backend** | NestJS | ^11.1.16 |
| **Frontend** | Next.js | 16.2.1 |
| **Base relationnelle** | PostgreSQL | 15 (TypeORM) |
| **Base NoSQL** | MongoDB | 7 (Mongoose) |
| **Authentification** | JWT + Passport | @nestjs/jwt ^11 |
| **Conteneurisation** | Docker Compose | 4 services |
| **Stockage images** | Cloudinary | Upload cloud |
| **Styling** | Tailwind CSS | ^4.2.2 |
| **Cartographie** | Leaflet / OpenStreetMap | Sans clé API |

---

## 2. Architecture Applicative

### Backend (NestJS) — 37 modules

```
backend/src/
├── auth/              # JWT + Google OAuth + refresh rotation
├── users/             # CRUD utilisateurs
├── eco-traveler/      # Profils voyageurs + scoring MongoDB
├── guide/             # Profils guides + scoring MongoDB
├── provider/          # Profils prestataires (anciennement project-owner)
├── organization/      # Entités légales (CRUD complet)
├── provider-activity/ # Liaison Provider ↔ Organization + MongoDB
├── offer/             # Offres (40+ schemas dynamiques)
│   ├── entities/      # Offer, OfferItem, Price, Session, Capacity, Availability
│   └── dto/
├── booking/           # Réservations avec transactions atomiques
├── circuit/           # Circuits multi-jours (CircuitDay, ProgramItem, Option)
├── trip-plan/         # Plans de voyage (regroupement + réservation groupée)
├── favorite/          # Favoris multi-types
├── review/            # Avis 1-5 étoiles + photos
├── notification/      # Système de notifications
├── questionnaire/     # QCM durabilité (11/10 questions par rôle)
├── publication/       # Publications sociales (places/experiences)
├── messages/          # Messagerie privée
├── follow/            # Abonnements entre utilisateurs
├── reports/           # Signalements + modération
├── admin/             # Validation de contenu
├── upload/            # Cloudinary SDK
├── mail/              # Nodemailer
├── database/          # TypeORM + Mongoose config
├── redis/             # Cache Redis
├── domain/            # Services métier (capacity, pricing, reservation)
└── common/            # Guards, decorators, enums
```

### Frontend (Next.js App Router)

```
frontend/app/
├── (auth)/            # Login, register, forgot-password
├── onboarding/        # Wizard multi-étapes par rôle
│   ├── provider/      # Onboarding prestataire (2 étapes)
│   ├── guide/         # Onboarding guide (multi-étapes)
│   └── eco-traveler/  # Onboarding voyageur (multi-étapes)
├── dashboard/         # Tableaux de bord (voyageur, guide, prestataire)
│   ├── provider/      # Dashboard prestataire (redirect)
│   ├── guide/         # Dashboard guide
│   └── admin/         # Panel admin
├── offers/            # Catalogue Destinations + détail
├── circuits/          # Circuits publics + détail avec carte
├── trip-plans/        # Plans de voyage
├── reservations/      # Réservation avec participants
├── notifications/     # Notifications
├── profile/           # Profils publics
│   ├── provider/      # Profil prestataire (public)
│   ├── guide/         # Profil guide (public)
│   └── ecovoyageur/   # Profil voyageur (public)
└── admin/             # Panel admin

frontend/components/
├── CircuitBuilderWizard.tsx    # Wizard circuit 6 étapes
├── GuidedOfferWizard.tsx       # Wizard offre 9 étapes
├── ExternalOfferModal.tsx      # 3 onglets (propre/externe/référence)
├── GuideSearchInline.tsx       # Recherche guides avec carte
├── OfferItemSearchInline.tsx   # Recherche items offre
├── SmartDatePicker.tsx         # Calendrier récurrence
├── ImageUploader.tsx           # Upload drag-and-drop
├── HierarchicalSelect.tsx      # Sélecteur hiérarchique
├── TimelineView.tsx            # Affichage Polarsteps-style
├── TimelineEditor.tsx          # Éditeur de timeline
├── WeatherSection.tsx          # Météo intégrée
├── CartWidget.tsx              # Widget panier flottant
└── map/                        # Leaflet components

frontend/lib/
├── offer-schema.ts    # 40+ schemas dynamiques (OFFER_SCHEMAS)
├── offer-config.ts    # VENUE_TYPES, OFFER_CATEGORIES, ITEM_TYPES_BY_CATEGORY
├── offer-rules.ts     # needsLocation, canHaveGuide, guideRequirement
├── offer-taxonomy.ts  # 5 taxonomies (equipment, services, inclus)
├── shared-configs.ts  # LANGS, SAISONS, REGIMES, NIVEAUX
├── tunisia-governorates.json  # 24 governorates avec delegations
├── api.ts             # apiFetch utilitaire
├── auth.ts            # Auth helpers
└── distance.ts        # Calculs géospatiaux
```

---

## 3. Modèle de Données

### Architecture 1:N — Le point clé

```
User (role=provider)
  └── Provider (infos perso, 1:1 avec User)
       ├── Organization (entité légale, 1:1 ou 1:N)
       │    nom, logo, contact, certifications, eco_labels
       │    approval_status, approved_at, approved_by
       │
       ├── ProviderActivity (liaison Provider ↔ Organization)
       │    level: primary|secondary
       │    category, subtypes, years_experience
       │
       └── Venue (lieu physique, 1:N) ← UN PRESTATAIRE PEUT AVOIR PLUSIEURS LIEUX
            ├── name, venue_type[], region, lat, lng, eco_labels
            └── offers (via venue_id)
                 └── OfferItem (produits réservables)
                      └── OfferItemSession (créneaux datés)
```

### PostgreSQL — Tables principales

| Table | Description | Relation |
|-------|-------------|----------|
| `users` | Auth, rôles, status, tokens | — |
| `eco_travelers` | Profils voyageurs, scores | 1:1 → users |
| `guides` | Profils guides, spécialités | 1:1 → users |
| `providers` | Profils prestataires (anciennement project_owners) | 1:1 → users |
| `organizations` | Entités légales (nouvelle table) | 1:1 → providers |
| `provider_activities` | Liaison Provider ↔ Organization | N:1 → providers, N:1 → organizations |
| `venues` | Lieux physiques (anciennement projects) | N:1 → providers |
| `offers` | Offres éco-touristiques | N:1 → users (guide/provider) |
| `offer_items` | Éléments vendables | N:1 → offers |
| `offer_item_prices` | Prix par catégorie | N:1 → offer_items |
| `offer_item_sessions` | Créneaux datés | N:1 → offer_items |
| `offer_item_capacities` | Capacité restante | N:1 → offer_items |
| `circuits` | Circuits multi-jours | N:1 → users |
| `circuit_days` | Jours du circuit | N:1 → circuits |
| `circuit_program_items` | Activités | N:1 → circuit_days |
| `circuit_options` | Options additionnelles | N:1 → circuits |
| `bookings` | Réservations | N:1 → users + offers |
| `booking_participants` | Participants | N:1 → bookings |
| `trip_plans` | Plans de voyage | N:1 → eco_travelers |
| `trip_plan_items` | Items du plan | N:1 → trip_plans |
| `reviews` | Avis 1-5 étoiles | N:1 → users |
| `favorites` | Éléments sauvegardés | N:1 → users |
| `notifications` | Notifications système | N:1 → users |
| `photos` | Galerie photos polymorphique | polymorphique |

### MongoDB — Collections

| Collection | Usage |
|-----------|-------|
| `traveler_preferences` | Intérêts, paysages, objectifs |
| `traveler_engagement` | Score, badges, stats |
| `guide_skills` | Activités, certifications, langues |
| `guide_engagement` | Score, badges, stats |
| `provider_engagement` | Badges, score, venues_count |
| `provider_services` | offered_services, eco_practices |
| `activity_details` | Détails flexibles par activité |

---

## 4. Modules Fonctionnels

### 4.1 Système de Score de Durabilité

```
Score Final = Questionnaire × 20% + Réservations × 40% + Feedbacks × 20% + Partages × 20%
```

| Seuil | Voyageur | Guide | Propriétaire |
|-------|----------|-------|-------------|
| ≥ 80 | Ambassadeur durable | Guide Ambassadeur | Propriétaire Ambassadeur |
| ≥ 60 | Écovoyageur engagé | Guide Expert | Propriétaire Engagé |
| ≥ 40 | Voyageur sensible | Guide Engagé | Propriétaire Sensible |
| < 40 | Voyageur classique | Guide en Développement | Propriétaire en Dev |

### 4.2 Workflow d'Offres

```
Création → status = "draft"
              │
       Soumettre (provider)
              │
           pending ──→ Admin examine
                          │
                   ┌──────┴──────┐
                   │             │
               approved      rejected
                   │             │
           ┌───────┴───────┐     │
           │               │     └─→ pending (resoumettre)
        inactive        archived
           │
        archived
```

**Transitions autorisées (provider)** : `draft→pending`, `draft→archived`, `approved→inactive`, `approved→archived`, `inactive→approved`, `rejected→pending`, `rejected→archived`

**Transitions autorisées (admin)** : `pending→approved`, `pending→rejected`

**price_type** : `per_person` | `per_group` | `per_night` | `per_unit` | `on_request`

### 4.3 Réservations

- **Prix calculé côté serveur** (anti-fraude) avec 3 fallbacks
- **Transactions atomiques** anti-overbooking
- **Modes de confirmation** : automatique / manuel
- **Gestion des capacités** : remaining_capacity décrémenté/restauré

### 4.4 Circuits Multi-Jours

- Structure : Circuit → CircuitDay → CircuitProgramItem
- 4 types d'activités : own, other, guide, standalone reference
- Options additionnelles (transport, hébergement, équipement)
- Hébergement configurable (same/per_day, own/other/external)
- **Cycle de vie** : `draft → pending → approved → published → archived`
- **Validation admin obligatoire** avant publication
- **Soft delete** : `is_deleted=true`, `deleted_at=new Date()` — pas de suppression définitive si réservations actives
- **Transition contrôlée** : provider ne peut soumettre que `draft→pending`, admin valide `pending→approved/rejected`

### 4.5 Plans de Voyage

- Regroupement OfferItems + Circuits
- Organisation par jour avec notes
- Réservation groupée en une seule action
- Vérification des limites (participants, âge)

---

## 5. Système de Schemas Dynamiques

### Architecture du moteur

```typescript
// frontend/lib/offer-schema.ts
OFFER_SCHEMAS: Record<string, OfferTypeSchema> = {
  "accommodation_room": {
    sections: [...],  // Informations, SdB, Capacité, Horaires, Services
    fields: {...},     // surface_m2, vue, bed_count, sdb_type, checkin/checkout...
    display: {...}     // cardFields, filterable
  },
  "activity_randonnee": {
    sections: [...],  // Parcours, Niveau, Guide, Inclus
    fields: {...},     // distance_km, denivele_m, niveau_offre, inclus...
  },
  // ... 40+ schemas
};
```

### Types de champs supportés

| Type | Usage |
|------|-------|
| `text` | Champs texte libre |
| `number` | Nombres avec min/max/unit |
| `select` | Liste déroulante |
| `multiselect` | Sélection multiple (pills) |
| `boolean` | Toggle on/off |
| `time` | Sélecteur horaire |
| `file` | Upload fichier |
| `textarea` | Zone de texte |
| `hierarchy` | Sélecteur hiérarchique (taxonomie) |

### Conditions d'affichage

```typescript
fieldDef.conditionalOn = { field: 'sdb_type', value: 'prive' }
// Le champ n'apparaît que si le champ parent a la valeur spécifiée
```

### Mapping project_type → offers

```typescript
PROJECT_TYPE_OFFERS = {
  accommodation: ['accommodation', 'restaurant', 'activity', 'sejour'],
  camping: ['accommodation', 'activity', 'equipment_rental', 'sejour'],
  restaurant: ['restaurant', 'event', 'craft'],
  activity_center: ['activity', 'workshop', 'equipment_rental', 'event'],
  // ... 10 types
}
```

---

## 6. Mapping avec Maram (eco-tourism-platform-v2)

### Correspondance des entités

| Tourisme | Maram | Relation |
|---|---|---|
| User (role=provider) | User + Provider | Le compte |
| Provider | Provider | La personne physique |
| Organization | Organization | L'entité juridique |
| Venue | — | Lieu physique (Maram n'a pas cette entité) |
| ProviderActivity.category | ProviderActivity.category | Catégories d'activités |
| Offer + OfferItem | Offer + OfferItem (simplifié) | Produit vendable |
| Circuit (structured) | Circuit (JSONB etapes) | Circuit multi-jours |

### Ce que notre projet fait MIEUX

| Capacité | Tourisme | Maram |
|----------|---------|-------|
| Schemas d'offres | ~40+ dynamiques | ~15 |
| Circuits | Wizard 6 étapes, hiérarchique | JSONB simple |
| Pricing | Multi-items, auto-fill | `price` decimal |
| Règles métier | `offer-rules.ts` | Pas de règles |
| Architecture | Provider → N Venues (1:N) | Provider → 1 Org (1:1) |
| Taxonomies | 5 taxonomies hiérarchiques | Pas de taxonomies |
| Réservation | Booking riche + participants | Reservation simple |
| Guide offerings | GuideOffering avec sessions/prix | Offres classiques |

### Ce que Maram fait MIEUX (à intégrer)

| Élément | Description | Effort | Statut |
|---------|-------------|--------|--------|
| Provider riche | 25+ champs (social, GPS, certifications) | Moyen | 🔜 Phase 4 |
| Onboarding Provider | 5 étapes wizard complet | Élevé | 🔜 Phase 5 |
| Formulaire Organization | CRUD complet depuis l'UI | Moyen | 🔜 Phase 6 |
| Approval workflow | Transitions controlées admin/provider | Faible | ✅ Fait (Sprint 1) |
| Shared constants | LANGS, SAISONS, REGIMES, NIVEAUX | Faible | ✅ Fait |
| CrossValidationRule | Valider offres vs contraintes projet | Faible | ✅ Fait |
| `repeater` field type | Listes dynamiques (horaires/jour) | Faible | ✅ Fait |
| `dynamicOptions | Options depuis API | Faible | ✅ Fait |

### Ce qu'il NE PAS prendre de Maram

- ❌ Circuit en JSONB (`etapes: object[]`) — Notre structure est supérieure
- ❌ Offre avec `price` decimal — Notre système multi-items est supérieur
- ❌ Architecture 1:1 — Notre 1:N est plus flexible
- ❌ Provider minimal — Il faut enrichir le nôtre avec les champs de Maram

---

## 7. Plan d'Intégration

> **Statut :** ✅ Toutes les étapes terminées (Juillet 2026)

### Étape 1 — Shared Constants (Terminé)

Créer `frontend/lib/shared-configs.ts` (✅ fait) :

```typescript
export const LANGS = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'Arabe' },
  { value: 'en', label: 'Anglais' },
  { value: 'de', label: 'Allemand' },
  { value: 'it', label: 'Italien' },
  { value: 'es', label: 'Espagnol' },
];

export const SAISONS = [
  { value: 'printemps', label: 'Printemps' },
  { value: 'ete', label: 'Été' },
  { value: 'automne', label: 'Automne' },
  { value: 'hiver', label: 'Hiver' },
];

export const REGIMES = [
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'sans_gluten', label: 'Sans gluten' },
  { value: 'sans_lactose', label: 'Sans lactose' },
];

export const NIVEAUX = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
];
```

**Impact** : Uniformité dans les 40+ schemas existants. Aucun risque.

### Étape 2 — CrossValidationRule (Terminé ✅)

Ajouter dans `offer-schema.ts` (✅ fait) :

### Étape 3 — Champs dynamiques + shared-configs (Terminé ✅)

Ajouter `repeater`, `dynamicOptions`, et importer `LANGS`, `REGIMES` dans les schemas (✅ fait).

### Étape 4 — Fix bugs circuits (Terminé ✅)

1. Brancher `externalRef` dans CircuitBuilderWizard — ✅ Résolu
2. Auto-lien offre du guide — ✅ Résolu
3. Unifier GuideSearchInline — ✅ Résolu

**Impact** : Complétude fonctionnelle.

---

## 8. Audit DDD — Points Critiques

Voir le document détaillé : [AUDIT_DDD_CIRCUITS.md](./AUDIT_DDD_CIRCUITS.md)

### Bugs critiques (tous résolus ✅)

| Bug | Résolution | Priorité 🔴→✅ |
|-----|-----------|----------------|
| `linked_offer_item_id` sans FK | Soft delete guard + circuit usage check (Sprint 3) | ✅ Résolu |
| CircuitReservation sans gestion capacité | CapacityService avec locking (Sprint 5) | ✅ Résolu |
| Booking FK sans `onDelete` | Cascade sur toutes les relations (Sprint 1) | ✅ Résolu |
| Pas d'optimistic/pessimistic locking | Version column sur Capacity (Sprint 5) | ✅ Résolu |
| Pas de price_history | Ajouté via `previousPrice` + historique (Sprint 6) | ✅ Résolu |

### Score DDD global : 9/10

✅ Tous les bugs critiques résolus via les Sprints 1–6.

### Plan d'action DDD (✅ Terminé)

1. **Semaine 1** : Sécurité (onDelete FK, vérif suppression Offer, capacité CircuitReservation, optimistic locking) — ✅
2. **Semaine 2** : Cohérence (état draft, price_history, validation linked_offer_item_id) — ✅

---

## 9. Endpoints API Complets

### Auth & Profils
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public |
| GET | `/api/auth/google` | Public |
| GET | `/api/eco-traveler/profile` | Voyageur |
| POST | `/api/eco-traveler/profile` | Voyageur |
| GET | `/api/guide/profile` | Guide |
| GET | `/api/providers/me` | Prestataire |
| PATCH | `/api/providers/me` | Prestataire |
| POST | `/api/providers/onboarding` | Prestataire |
| GET | `/api/provider/profile` | Prestataire (legacy) |
| POST | `/api/provider/profile` | Prestataire (legacy) |
| GET | `/api/provider/venues` | Prestataire |
| POST | `/api/provider/venues` | Prestataire |
| PATCH | `/api/provider/venues/:id` | Prestataire |
| DELETE | `/api/provider/venues/:id` | Prestataire |

### Organizations
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| GET | `/api/organizations` | Public |
| GET | `/api/organizations/:id` | Public |
| PATCH | `/api/organizations/:id` | Prestataire |

### Provider Activities
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/provider-activities` | Prestataire |
| GET | `/api/provider-activities/provider/:id` | Public |
| PATCH | `/api/provider-activities/:id` | Prestataire |
| DELETE | `/api/provider-activities/:id` | Prestataire |

### Offres
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/offers` | Guide/Prestataire |
| GET | `/api/offers` | Public (support `?page=&limit=` pour pagination) |
| GET | `/api/offers/mine` | Guide/Prestataire |
| GET | `/api/offers/items/mine` | Guide/Prestataire |
| GET | `/api/offers/public` | Public (filtres + pagination) |
| GET | `/api/offers/venue/:venueId` | Public |
| PATCH | `/api/offers/:id` | Guide/Prestataire |
| DELETE | `/api/offers/:id` | Guide/Prestataire |
| POST | `/api/offers/:id/items` | Guide/Prestataire |
| POST | `/api/offers/items/:itemId/prices` | Guide/Prestataire |
| POST | `/api/offers/items/:itemId/availability` | Guide/Prestataire |
| POST | `/api/offers/:id/archive` | Guide/Prestataire |
| POST | `/api/offers/:id/deactivate` | Guide/Prestataire |
| POST | `/api/offers/:id/reactivate` | Guide/Prestataire |

### Circuits
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/circuits` | Guide/Prestataire |
| GET | `/api/circuits` | Public (support `?page=&limit=` pour pagination) |
| GET | `/api/circuits/:id` | Public |
| GET | `/api/circuits/mine` | Guide/Prestataire |
| PATCH | `/api/circuits/:id` | Guide/Prestataire |
| DELETE | `/api/circuits/:id` | Guide/Prestataire |
| POST | `/api/circuits/:id/days` | Guide/Prestataire |
| POST | `/api/circuits/:id/days/:dayId/program` | Guide/Prestataire |
| POST | `/api/circuits/:id/options` | Guide/Prestataire |
| POST | `/api/circuits/:id/reserve` | Voyageur |
| GET | `/api/circuits/reservations/incoming` | Guide/Prestataire |
| PATCH | `/api/circuits/reservations/:id/confirm` | Guide/Prestataire |
| PATCH | `/api/circuits/reservations/:id/reject` | Guide/Prestataire |

### Admin
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| GET | `/api/admin/publications/pending` | Admin |
| PATCH | `/api/admin/publications/:id/approve` | Admin |
| PATCH | `/api/admin/publications/:id/reject` | Admin |
| GET | `/api/admin/offers/pending` | Admin |
| PATCH | `/api/admin/offers/:id/approve` | Admin |
| PATCH | `/api/admin/offers/:id/reject` | Admin |
| GET | `/api/admin/projects/pending` | Admin |
| PATCH | `/api/admin/projects/:id/approve` | Admin |
| PATCH | `/api/admin/projects/:id/reject` | Admin |
| GET | `/api/admin/circuits/pending` | Admin |
| PATCH | `/api/admin/circuits/:id/approve` | Admin |
| PATCH | `/api/admin/circuits/:id/reject` | Admin |
| PATCH | `/api/admin/circuits/:id/archive` | Admin |
| GET | `/api/admin/guide-offerings/pending` | Admin |
| PATCH | `/api/admin/guide-offerings/:id/approve` | Admin |
| PATCH | `/api/admin/guide-offerings/:id/reject` | Admin |
| PATCH | `/api/admin/guide-offerings/:id/archive` | Admin |
| GET | `/api/admin/reports` | Admin |
| PATCH | `/api/admin/reports/:id/resolve` | Admin |
| GET | `/api/admin/users/banned` | Admin |
| PATCH | `/api/admin/users/:id/ban` | Admin |
| PATCH | `/api/admin/users/:id/unban` | Admin |
| GET | `/api/admin/moderation-log` | Admin (historique complet) |

### Réservations
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/bookings` | Voyageur |
| POST | `/api/bookings/guide` | Voyageur |
| GET | `/api/bookings/mine` | Voyageur |
| GET | `/api/bookings/incoming` | Guide/Prestataire |
| PATCH | `/api/bookings/:id/cancel` | Voyageur |
| PATCH | `/api/bookings/:id/confirm` | Guide/Prestataire |
| PATCH | `/api/bookings/:id/participants` | Voyageur |

### Guide Search
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| GET | `/api/guide/search?q=&zone=&max_price=&lat=&lng=&date=` | Public |
| GET | `/api/guide/public/search?q=&date=` | Public |
| GET | `/api/guide-offerings` | Public |
| GET | `/api/guide-offerings/mine` | Guide |
| POST | `/api/guide-offerings` | Guide |
| PATCH | `/api/guide-offerings/:id` | Guide |
| DELETE | `/api/guide-offerings/:id` | Guide |

### Autres
| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/api/favorites` | Tous authentifiés |
| GET | `/api/favorites` | Tous authentifiés |
| GET | `/api/favorites/check/:targetType/:targetId` | Tous authentifiés |
| DELETE | `/api/favorites/:targetType/:targetId` | Tous authentifiés |
| POST | `/api/reviews` | Tous authentifiés |
| GET | `/api/reviews/target/:targetType/:targetId` | Public |
| GET | `/api/reviews/mine` | Tous authentifiés |
| GET | `/api/notifications` | Tous authentifiés |
| PATCH | `/api/notifications/:id/read` | Tous authentifiés |
| PATCH | `/api/notifications/read-all` | Tous authentifiés |
| POST | `/api/messages` | Tous authentifiés |
| GET | `/api/messages/conversations` | Tous authentifiés |
| POST | `/api/upload` | Tous authentifiés |
| POST | `/api/follows/:targetId/:targetType` | Tous authentifiés |
| GET | `/api/follows/following` | Tous authentifiés |
| GET | `/api/follows/followers` | Tous authentifiés |
| POST | `/api/reports` | Tous authentifiés |
| GET | `/api/photos` | Public |
| POST | `/api/photos` | Tous authentifiés |
| POST | `/api/travel-carts/me` | Tous authentifiés |
| POST | `/api/trip-plans` | Voyageur |
| GET | `/api/trip-plans/mine` | Voyageur |
| GET | `/api/questionnaire/active` | Public |
| POST | `/api/questionnaire/submit` | Tous authentifiés |

---

*Dernière mise à jour : 11 Juillet 2026*

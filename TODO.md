# TODO - Tourisme Platforme

## Hautes priorités

### 1. Détail offre : afficher sous-types + alimenter DB
- [x] Afficher les sous-types (TV, douche, lavabo, etc.) dans la page détail offre
- [x] Backfill les offres existantes (script seed:backfill-details-json → `details_json = '{}'`)
- [x] Ajouter UI pour éditer/saisir les sous-types (déjà fait via GuidedOfferWizard)

### 2. Circuit : améliorer sélection guide
- [x] Recherche guide par nom + filtres (disponibilité, zone)
- [x] Afficher infos guide (zone, rayon, langues, prix) dans la sélection
- [x] Filtre automatique selon la date du jour et la localisation (via /guide/search)

### 3. CircuitActivity → relation offre
- [x] Chaque activité de circuit doit référencer une offre existante
- [x] UI : sélection offre obligatoire + auto-fill titre depuis l'offre
- [x] Validation : blocage submit si activité sans linked_offer_item_id
- [x] Backend : linked_offer_item_id envoyé dans le POST program
- [x] Respecter le modèle UML (Offer ← CircuitActivity ← CircuitDay ← Circuit)
- [x] Supprimé le mauvais script de migration (créait des offres automatiquement)

## Priorités moyennes

### 4. Offre → projet obligatoire
- [x] Validation backend (déjà en place - offer.service.ts ligne 57-61)
- [x] Message "Créez un projet" quand userProjects est vide
- [x] Validation frontend (selectedProjectId requis avant submit)
- [x] Bouton "Créer un projet" dans le message d'alerte

### 5. Localisation : héritée vs propre
- [x] Offres fixes (hébergement, resto, etc.) → héritent du projet
- [x] Offres mobiles (kayak, randonnée, etc.) → propre localisation
- [x] UI : masquer/afficher champs selon type
- [x] Step 2 utilise `hasItemTypesWithoutLocation(cat, itemTypes)`

### 6. GuideOffering — Finalisation
- [x] Modèle GuideOffering (titre, description, langues, prix, capacité, zone, rayon, déplacement)
- [x] API CRUD guide-offerings (backend)
- [x] Règles de disponibilité (on_demand, date_range, weekly, daily)
- [x] Recherche guide avancée (spatiale, date, prix, langue)
- [x] UI frontend : créer/gérer les GuideOfferings (dashboard guide)
- [x] Sessions : entité GuideOfferingSession + génération + UI calendrier
- [x] Booking : intégration GuideOffering dans Booking entity + createGuideBooking + endpoint
- [x] Bouton Réserver sur profil guide public (sélection session, participants)
- [x] generateSessions() ne supprime plus les sessions avec réservations
- [x] GuideOfferingBlock entity + API (jours bloqués)
- [x] GuideOfferingPrice entity + API (grilles tarifaires)
- [x] GuideSearchService : filtrage spatial en SQL + statut actif
- [x] POST /bookings/guide dans BookingController

### 7. Map : afficher rayon cercle
- [x] `<Circle>` implémenté dans `MapView.tsx` et `MapPicker.tsx`
- [x] Rayon affiché depuis `radius_km` pour les guides dans la page Explore
- [x] Utilisé aussi pour les offres mobiles

### 8. Moteur recherche guide
- [x] Backend filters (date, zone, distance, langue, prix, capacité)
- [x] Exclusion automatique des guides indisponibles (quand une date est fournie)
- [x] Frontend dédié : UI de filtres guide dans la page Explore
- [x] Filtrage spatial déporté en SQL (haversine)

## Faible priorité

### 9. Trip Planner pour écovoyageur
- [x] Constructeur de voyage (jours → activités) : CRUD complet
- [x] Réservation directe : bouton "Réserver" + modal
- [x] Recherche guide intégrée + ajout direct de GuideOffering dans TripPlan

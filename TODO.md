# TODO - Tourisme Plateforme

## Hautes priorités

### 1. Détail offre : afficher sous-types + alimenter DB
- [x] Afficher les sous-types (TV, douche, lavabo, etc.) dans la page détail offre
- [ ] Backfill les offres existantes avec les nouveaux champs
- [ ] Ajouter UI pour éditer/saisir les sous-types (déjà fait via GuidedOfferWizard)

### 2. Circuit : améliorer sélection guide
- [ ] Recherche guide par nom + filtres (disponibilité, zone)
- [ ] Afficher infos guide (zone, rayon, langues) dans la sélection
- [ ] Filtre automatique selon la date du jour et la localisation

### 3. CircuitActivity → relation offre
- [ ] Chaque activité de circuit doit lier une offre existante
- [ ] UI : sélectionner une offre depuis le projet
- [ ] Backend : valider et stocker la relation
- [ ] Respecter le modèle UML (Circuit → Days → Activities → Offer)

## Priorités moyennes

### 4. Offre → projet obligatoire
- [ ] Supprimer création offre hors projet
- [ ] API : `POST /projects/{id}/offers` seulement
- [ ] Nettoyer les écrans/boutons/API obsolètes

### 5. Localisation : héritée vs propre
- [ ] Offres fixes (hébergement, resto, etc.) → héritent du projet
- [ ] Offres mobiles (kayak, randonnée, etc.) → propre localisation
- [ ] UI : masquer/afficher champs selon type

### 6. Refactor Guide → GuideOffering
- [ ] Guide vend sa disponibilité (pas des activités)
- [ ] Modèle : titre, description, langues, prix, capacité
- [ ] Zone de service + rayon
- [ ] Déplacement autorisé
- [ ] Calendrier / disponibilités (réutiliser OfferItem)

### 7. Map : afficher rayon cercle
- [ ] Ajouter `<Circle>` sur la carte pour guides et offres mobiles
- [ ] Afficher rayon depuis `radius_km`

### 8. Moteur recherche guide
- [ ] Filtres : date, heure, zone, distance, langue, prix, capacité
- [ ] Exclure guides indisponibles automatiquement
- [ ] API `GET /guides/available`

## Faible priorité

### 9. Trip Planner pour écovoyageur
- [ ] Constructeur de voyage (jours → activités)
- [ ] Recherche guide intégrée
- [ ] Réservation directe

### 2. Circuit : améliorer sélection guide
- [ ] Recherche guide par nom + filtres (disponibilité, zone)
- [ ] Afficher infos guide (zone, rayon, langues) dans la sélection
- [ ] Filtre automatique selon la date du jour et la localisation

### 3. CircuitActivity → relation offre
- [ ] Chaque activité de circuit doit lier une offre existante
- [ ] UI : sélectionner une offre depuis le projet
- [ ] Backend : valider et stocker la relation
- [ ] Respecter le modèle UML (Circuit → Days → Activities → Offer)

## Priorités moyennes

### 4. Offre → projet obligatoire
- [ ] Supprimer création offre hors projet
- [ ] API : `POST /projects/{id}/offers` seulement
- [ ] Nettoyer les écrans/boutons/API obsolètes

### 5. Localisation : héritée vs propre
- [ ] Offres fixes (hébergement, resto, etc.) → héritent du projet
- [ ] Offres mobiles (kayak, randonnée, etc.) → propre localisation
- [ ] UI : masquer/afficher champs selon type

### 6. Refactor Guide → GuideOffering
- [ ] Guide vend sa disponibilité (pas des activités)
- [ ] Modèle : titre, description, langues, prix, capacité
- [ ] Zone de service + rayon
- [ ] Déplacement autorisé
- [ ] Calendrier / disponibilités (réutiliser OfferItem)

### 7. Map : afficher rayon cercle
- [ ] Ajouter `<Circle>` sur la carte pour guides et offres mobiles
- [ ] Afficher rayon depuis `radius_km`

### 8. Moteur recherche guide
- [ ] Filtres : date, heure, zone, distance, langue, prix, capacité
- [ ] Exclure guides indisponibles automatiquement
- [ ] API `GET /guides/available`

## Faible priorité

### 9. Trip Planner pour écovoyageur
- [ ] Constructeur de voyage (jours → activités)
- [ ] Recherche guide intégrée
- [ ] Réservation directe

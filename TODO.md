# TODO - Tourisme Plateforme

## Hautes priorités

### 1. Détail offre : afficher sous-types + alimenter DB
- [x] Afficher les sous-types (TV, douche, lavabo, etc.) dans la page détail offre
- [ ] Backfill les offres existantes avec les nouveaux champs
- [x] Ajouter UI pour éditer/saisir les sous-types (déjà fait via GuidedOfferWizard)

### 2. Circuit : améliorer sélection guide
- [x] Recherche guide par nom + filtres (disponibilité, zone)
- [x] Afficher infos guide (zone, rayon, langues, prix) dans la sélection
- [x] Filtre automatique selon la date du jour et la localisation (via /guide/search)

### 3. CircuitActivity → relation offre
- [x] Chaque activité de circuit peut lier une offre existante (linked_offer_item_id)
- [x] UI : sélectionner une offre depuis le projet (search + filter)
- [x] Backend : linked_offer_item_id déjà envoyé dans le POST program
- [ ] Backend : valider que l'offre appartient bien au owner
- [x] Respecter le modèle UML (Circuit → Days → Activities → Offer)

## Priorités moyennes

### 4. Offre → projet obligatoire
- [x] Validation backend (déjà en place - offer.service.ts ligne 57-61)
- [x] Message "Créez un projet" quand userProjects est vide
- [x] Validation frontend (selectedProjectId requis avant submit)
- [x] Bouton "Créer un projet" dans le message d'alerte

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

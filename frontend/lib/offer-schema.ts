export interface SchemaField {
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'time' | 'file' | 'textarea';
  required?: boolean;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  conditionalOn?: { field: string; value: string | boolean };
  min?: number;
  max?: number;
  unit?: string;
}

export interface SchemaSection {
  id: string;
  label: string;
  fields: string[];
  conditionalOn?: { field: string; value: string | boolean };
}

export interface OfferTypeSchema {
  key: string;
  label: string;
  category: string;
  sections: SchemaSection[];
  fields: Record<string, SchemaField>;
  display?: {
    cardFields?: string[];
    filterable?: string[];
  };
}

export const OFFER_SCHEMAS: Record<string, OfferTypeSchema> = {

  // ───────── HÉBERGEMENT ─────────

  accommodation_room: {
    key: 'accommodation_room',
    label: 'Chambre',
    category: 'accommodation',
    sections: [
      { id: 'general', label: 'Informations', fields: ['surface_m2', 'vue', 'etage', 'bed_count'] },
      { id: 'bathroom', label: 'Salle de bain', fields: ['sdb_type', 'sdb_equipements'] },
      { id: 'capacity', label: 'Capacité', fields: ['nb_couchages', 'type_lit', 'pmr_chambre'] },
      { id: 'schedule', label: 'Horaires', fields: ['checkin_debut', 'checkin_fin', 'checkout', 'couvre_feu'] },
      { id: 'services', label: 'Services', fields: ['formule_restauration', 'equipements_chambre', 'inclus'] },
    ],
    fields: {
      surface_m2: { type: 'number', label: 'Surface (m²)', placeholder: '25', unit: 'm²' },
      vue: { type: 'select', label: 'Vue', options: [
        { value: 'jardin', label: 'Jardin' }, { value: 'piscine', label: 'Piscine' },
        { value: 'mer', label: 'Mer' }, { value: 'montagne', label: 'Montagne' },
        { value: 'ville', label: 'Ville' }, { value: 'aucune', label: 'Aucune' },
      ]},
      etage: { type: 'number', label: 'Étage', placeholder: 'Rez-de-chaussée' },
      bed_count: { type: 'number', required: true, label: 'Nombre de lits', min: 1 },
      nb_couchages: { type: 'number', required: true, label: 'Nombre de couchages', min: 1 },
      type_lit: { type: 'select', label: 'Type de lit', options: [
        { value: 'simple', label: 'Lit simple' }, { value: 'double', label: 'Lit double' },
        { value: 'king', label: 'Lit king size' }, { value: 'superpose', label: 'Lit superposé' },
        { value: 'canape', label: 'Canapé-lit' }, { value: 'mixte', label: 'Plusieurs types' },
      ]},
      sdb_type: { type: 'select', label: 'Type de salle de bain', options: [
        { value: 'prive', label: 'Privée' }, { value: 'partage', label: 'Partagée' },
        { value: 'commune', label: 'Salle commune' },
      ]},
      sdb_equipements: { type: 'multiselect', label: 'Équipements SdB', conditionalOn: { field: 'sdb_type', value: 'prive' }, options: [
        { value: 'douche', label: 'Douche' }, { value: 'baignoire', label: 'Baignoire' },
        { value: 'wc', label: 'WC' }, { value: 'lavabo', label: 'Lavabo' },
        { value: 'seche_cheveux', label: 'Sèche-cheveux' },
      ]},
      equipements_chambre: { type: 'multiselect', label: 'Équipements chambre', options: [
        { value: 'wifi', label: 'WiFi' }, { value: 'clim', label: 'Climatisation' },
        { value: 'chauffage', label: 'Chauffage' }, { value: 'tv', label: 'TV' },
        { value: 'coffre', label: 'Coffre-fort' }, { value: 'mini_bar', label: 'Mini-bar' },
        { value: 'terrasse', label: 'Terrasse' }, { value: 'bureau', label: 'Bureau' },
      ]},
      formule_restauration: { type: 'select', label: 'Formule restauration', options: [
        { value: 'sans', label: 'Sans restauration' }, { value: 'petit_dej', label: 'Petit-déjeuner' },
        { value: 'demi_pension', label: 'Demi-pension' }, { value: 'pension_complete', label: 'Pension complète' },
      ]},
      inclus: { type: 'multiselect', label: 'Inclus dans le prix', options: [
        { value: 'linge', label: 'Linge de lit' }, { value: 'serviettes', label: 'Serviettes' },
        { value: 'menage', label: 'Ménage' }, { value: 'petit_dej', label: 'Petit-déjeuner' },
        { value: 'parking', label: 'Parking' },
      ]},
      checkin_debut: { type: 'time', required: true, label: 'Check-in à partir de' },
      checkin_fin: { type: 'time', label: 'Check-in jusqu\'à' },
      checkout: { type: 'time', required: true, label: 'Check-out avant' },
      couvre_feu: { type: 'time', label: 'Couvre-feu' },
      pmr_chambre: { type: 'boolean', label: 'Chambre accessible PMR' },
    },
    display: { cardFields: ['surface_m2', 'bed_count', 'vue'], filterable: ['vue', 'pmr_chambre', 'equipements_chambre'] },
  },

  accommodation_bed: {
    key: 'accommodation_bed',
    label: 'Lit (dortoir)',
    category: 'accommodation',
    sections: [
      { id: 'capacity', label: 'Capacité', fields: ['nb_lits_offre', 'type_lit', 'dortoir_genre'] },
      { id: 'schedule', label: 'Horaires', fields: ['checkin_debut', 'checkin_fin', 'checkout', 'couvre_feu', 'silence_partir_de'] },
      { id: 'services', label: 'Services', fields: ['inclus'] },
    ],
    fields: {
      nb_lits_offre: { type: 'number', required: true, label: 'Nombre de lits proposés', min: 1 },
      type_lit: { type: 'select', label: 'Type de lit', options: [
        { value: 'simple', label: 'Lit simple' }, { value: 'superpose', label: 'Lit superposé' },
      ]},
      dortoir_genre: { type: 'select', label: 'Genre du dortoir', options: [
        { value: 'mixte', label: 'Mixte' }, { value: 'hommes', label: 'Hommes' },
        { value: 'femmes', label: 'Femmes' },
      ]},
      checkin_debut: { type: 'time', required: true, label: 'Check-in à partir de' },
      checkin_fin: { type: 'time', label: 'Check-in jusqu\'à' },
      checkout: { type: 'time', required: true, label: 'Check-out avant' },
      couvre_feu: { type: 'time', label: 'Couvre-feu' },
      silence_partir_de: { type: 'time', label: 'Silence à partir de' },
      inclus: { type: 'multiselect', label: 'Inclus dans le prix', options: [
        { value: 'linge', label: 'Linge de lit' }, { value: 'casier', label: 'Casier' },
        { value: 'petit_dej', label: 'Petit-déjeuner' }, { value: 'wifi', label: 'WiFi' },
      ]},
    },
    display: { cardFields: ['nb_lits_offre', 'type_lit', 'dortoir_genre'], filterable: ['dortoir_genre'] },
  },

  accommodation_camping_space: {
    key: 'accommodation_camping_space',
    label: 'Espace tente',
    category: 'accommodation',
    sections: [
      { id: 'general', label: 'Informations', fields: ['type_tente_offre', 'surface_m2', 'capacite_offre'] },
      { id: 'comfort', label: 'Confort', fields: ['qualite_literie', 'electricite', 'prise_electrique_offre', 'linge_fourni'] },
      { id: 'bathroom', label: 'Sanitaires', fields: ['sanitaires_offre', 'distance_sanitaires_m'] },
      { id: 'schedule', label: 'Horaires', fields: ['checkin_debut', 'checkout'] },
      { id: 'services', label: 'Services', fields: ['experiences_incluses'] },
    ],
    fields: {
      type_tente_offre: { type: 'select', required: true, label: 'Type de tente', options: [
        { value: 'safari', label: 'Tente safari' }, { value: 'bell', label: 'Tente bell' },
        { value: 'yurt', label: 'Yourte' }, { value: 'chalet', label: 'Tente chalet' },
        { value: 'toile', label: 'Tente toile' }, { value: 'tipi', label: 'Tipi' },
        { value: 'autre', label: 'Autre' },
      ]},
      surface_m2: { type: 'number', label: 'Surface (m²)', placeholder: '12', unit: 'm²' },
      capacite_offre: { type: 'number', required: true, label: 'Capacité (personnes)', min: 1, max: 10 },
      qualite_literie: { type: 'select', label: 'Qualité de la literie', options: [
        { value: 'standard', label: 'Standard' }, { value: 'confort', label: 'Confort' },
        { value: 'premium', label: 'Premium' },
      ]},
      electricite: { type: 'boolean', label: 'Électricité disponible' },
      prise_electrique_offre: { type: 'boolean', label: 'Prise électrique dans la tente', conditionalOn: { field: 'electricite', value: true } },
      linge_fourni: { type: 'boolean', label: 'Linge de lit fourni' },
      sanitaires_offre: { type: 'select', label: 'Sanitaires', options: [
        { value: 'prives', label: 'Privés' }, { value: 'partages', label: 'Partagés' },
        { value: 'communs', label: 'Communs (bloc)' },
      ]},
      distance_sanitaires_m: { type: 'number', label: 'Distance sanitaires (m)', unit: 'm', conditionalOn: { field: 'sanitaires_offre', value: 'partages' } },
      checkin_debut: { type: 'time', required: true, label: 'Check-in à partir de' },
      checkout: { type: 'time', required: true, label: 'Check-out avant' },
      experiences_incluses: { type: 'multiselect', label: 'Expériences incluses', options: [
        { value: 'feu_camp', label: 'Feu de camp' }, { value: 'petit_dej', label: 'Petit-déjeuner' },
        { value: 'etoiles', label: 'Observation étoiles' }, { value: 'randonnee', label: 'Randonnée' },
      ]},
    },
    display: { cardFields: ['type_tente_offre', 'capacite_offre', 'surface_m2'], filterable: ['type_tente_offre', 'sanitaires_offre', 'electricite'] },
  },

  // ───────── ACTIVITÉS ─────────

  activity_randonnee: {
    key: 'activity_randonnee',
    label: 'Randonnée',
    category: 'activity',
    sections: [
      { id: 'course', label: 'Parcours', fields: ['distance_km', 'denivele_m', 'altitude_max', 'duree_estimee', 'type_parcours', 'point_depart', 'point_arrivee', 'fichier_gpx'] },
      { id: 'level', label: 'Niveau & Groupe', fields: ['niveau_offre', 'nb_participants_min', 'nb_participants_max'] },
      { id: 'guide', label: 'Encadrement', fields: ['encadrement_guide', 'langues_guides'] },
      { id: 'inclus', label: 'Inclus & Conditions', fields: ['inclus', 'equipement_obligatoire', 'points_interet'] },
    ],
    fields: {
      distance_km: { type: 'number', required: true, label: 'Distance (km)', unit: 'km', min: 0 },
      denivele_m: { type: 'number', label: 'Dénivelé positif (m)', unit: 'm' },
      altitude_max: { type: 'number', label: 'Altitude maximale (m)', unit: 'm' },
      duree_estimee: { type: 'text', required: true, label: 'Durée estimée', placeholder: '4h / 1 journée' },
      type_parcours: { type: 'select', label: 'Type de parcours', options: [
        { value: 'boucle', label: 'Boucle' }, { value: 'aller_retour', label: 'Aller-retour' },
        { value: 'traversee', label: 'Traversée' },
      ]},
      point_depart: { type: 'text', required: true, label: 'Point de départ' },
      point_arrivee: { type: 'text', label: "Point d'arrivée" },
      fichier_gpx: { type: 'file', label: 'Tracé GPX' },
      niveau_offre: { type: 'select', required: true, label: 'Niveau', options: [
        { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' },
        { value: 'difficile', label: 'Difficile' }, { value: 'tres_difficile', label: 'Très difficile' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      encadrement_guide: { type: 'boolean', label: 'Encadrement par un guide' },
      langues_guides: { type: 'multiselect', label: "Langues du guide", conditionalOn: { field: 'encadrement_guide', value: true }, options: [
        { value: 'fr', label: 'Français' }, { value: 'ar', label: 'Arabe' },
        { value: 'en', label: 'Anglais' }, { value: 'de', label: 'Allemand' },
        { value: 'it', label: 'Italien' }, { value: 'es', label: 'Espagnol' },
      ]},
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide' }, { value: 'repas', label: 'Repas' },
        { value: 'transport', label: 'Transport aller-retour' }, { value: 'assurance', label: 'Assurance' },
        { value: 'baton_marche', label: 'Bâtons de marche' },
      ]},
      equipement_obligatoire: { type: 'textarea', label: 'Équipement obligatoire' },
      points_interet: { type: 'textarea', label: "Points d'intérêt" },
    },
    display: { cardFields: ['distance_km', 'denivele_m', 'duree_estimee', 'niveau_offre'], filterable: ['niveau_offre', 'encadrement_guide', 'distance_km'] },
  },

  activity_kayak: {
    key: 'activity_kayak',
    label: 'Kayak',
    category: 'activity',
    sections: [
      { id: 'course', label: 'Parcours', fields: ['parcours', 'distance_km', 'duree'] },
      { id: 'embarcation', label: 'Embarcation', fields: ['type_embarcation_offre', 'nb_embarcations_offre'] },
      { id: 'level', label: 'Niveau & Sécurité', fields: ['niveau_offre', 'savoir_nager', 'age_minimum', 'nb_participants_min', 'nb_participants_max'] },
      { id: 'equipment', label: 'Équipement', fields: ['equipement_fourni', 'inclus'] },
    ],
    fields: {
      parcours: { type: 'text', required: true, label: 'Parcours / itinéraire' },
      distance_km: { type: 'number', label: 'Distance (km)', unit: 'km' },
      duree: { type: 'text', required: true, label: 'Durée', placeholder: '2h / demi-journée' },
      type_embarcation_offre: { type: 'select', required: true, label: "Type d'embarcation", options: [
        { value: 'kayak_simple', label: 'Kayak simple' }, { value: 'kayak_double', label: 'Kayak double' },
        { value: 'canoe', label: 'Canoë' }, { value: 'paddle', label: 'Paddle' },
      ]},
      nb_embarcations_offre: { type: 'number', required: true, label: "Nombre d'embarcations", min: 1 },
      niveau_offre: { type: 'select', required: true, label: 'Niveau requis', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'confirme', label: 'Confirmé' },
      ]},
      savoir_nager: { type: 'boolean', label: 'Savoir nager obligatoire' },
      age_minimum: { type: 'number', label: 'Âge minimum', min: 0 },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      equipement_fourni: { type: 'multiselect', label: 'Équipement fourni', options: [
        { value: 'gilet', label: 'Gilet de sauvetage' }, { value: 'pagaie', label: 'Pagaie' },
        { value: 'combinaison', label: 'Combinaison' }, { value: 'sac_etanche', label: 'Sac étanche' },
      ]},
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide' }, { value: 'initiation', label: 'Initiation' },
        { value: 'assurance', label: 'Assurance' },
      ]},
    },
    display: { cardFields: ['type_embarcation_offre', 'distance_km', 'duree', 'niveau_offre'], filterable: ['niveau_offre', 'type_embarcation_offre', 'savoir_nager'] },
  },

  activity_vtt: {
    key: 'activity_vtt',
    label: 'VTT',
    category: 'activity',
    sections: [
      { id: 'course', label: 'Parcours', fields: ['distance_km', 'denivele_m', 'duree', 'type_terrain'] },
      { id: 'bike', label: 'Vélo', fields: ['type_velo_offre', 'nb_velos_offre', 'equipement_fourni'] },
      { id: 'level', label: 'Niveau & Groupe', fields: ['niveau_offre', 'nb_participants_min', 'nb_participants_max'] },
      { id: 'inclus', label: 'Inclus', fields: ['points_interet', 'inclus'] },
    ],
    fields: {
      distance_km: { type: 'number', label: 'Distance (km)', unit: 'km' },
      denivele_m: { type: 'number', label: 'Dénivelé (m)', unit: 'm' },
      duree: { type: 'text', required: true, label: 'Durée' },
      type_terrain: { type: 'select', label: 'Type de terrain', options: [
        { value: 'montagne', label: 'Montagne' }, { value: 'foret', label: 'Forêt' },
        { value: 'desert', label: 'Désert' }, { value: 'route', label: 'Route' },
        { value: 'mixte', label: 'Mixte' },
      ]},
      type_velo_offre: { type: 'select', required: true, label: 'Type de vélo', options: [
        { value: 'vtt', label: 'VTT' }, { value: 'vae', label: 'VAE' },
        { value: 'gravel', label: 'Gravel' }, { value: 'ville', label: 'Vélo ville' },
      ]},
      nb_velos_offre: { type: 'number', required: true, label: 'Nombre de vélos', min: 1 },
      equipement_fourni: { type: 'multiselect', label: 'Équipement fourni', options: [
        { value: 'casque', label: 'Casque' }, { value: 'gants', label: 'Gants' },
        { value: 'kit_reparation', label: 'Kit réparation' }, { value: 'sacoche', label: 'Sacoche' },
      ]},
      niveau_offre: { type: 'select', required: true, label: 'Niveau', options: [
        { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' },
        { value: 'difficile', label: 'Difficile' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      points_interet: { type: 'textarea', label: "Points d'intérêt" },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'guide', label: 'Guide' }, { value: 'casque', label: 'Casque' },
        { value: 'assurance', label: 'Assurance' },
      ]},
    },
    display: { cardFields: ['type_velo_offre', 'distance_km', 'duree', 'niveau_offre'], filterable: ['niveau_offre', 'type_velo_offre', 'type_terrain'] },
  },

  activity_yoga: {
    key: 'activity_yoga',
    label: 'Yoga',
    category: 'activity',
    sections: [
      { id: 'general', label: 'Séance', fields: ['style_offre', 'cadre_offre', 'niveau_offre', 'duree_seance'] },
      { id: 'equipment', label: 'Équipement', fields: ['tapis_fourni', 'accessoires'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
    ],
    fields: {
      style_offre: { type: 'select', required: true, label: 'Style de yoga', options: [
        { value: 'hatha', label: 'Hatha' }, { value: 'vinyasa', label: 'Vinyasa' },
        { value: 'ashtanga', label: 'Ashtanga' }, { value: 'yin', label: 'Yin' },
        { value: 'nidra', label: 'Yoga Nidra' }, { value: 'prénatal', label: 'Prénatal' },
      ]},
      cadre_offre: { type: 'select', label: 'Cadre', options: [
        { value: 'interieur', label: 'Intérieur' }, { value: 'exterieur', label: 'Extérieur' },
        { value: 'plage', label: 'Plage' }, { value: 'terrasse', label: 'Terrasse' },
      ]},
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' }, { value: 'tous', label: 'Tous niveaux' },
      ]},
      duree_seance: { type: 'text', required: true, label: 'Durée par séance', placeholder: '1h / 1h30' },
      tapis_fourni: { type: 'boolean', label: 'Tapis fourni' },
      accessoires: { type: 'multiselect', label: 'Accessoires fournis', options: [
        { value: 'bloc', label: 'Blocs' }, { value: 'sangle', label: 'Sangles' },
        { value: 'coussin', label: 'Coussin' }, { value: 'couverture', label: 'Couverture' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
    },
    display: { cardFields: ['style_offre', 'cadre_offre', 'duree_seance', 'niveau_offre'], filterable: ['style_offre', 'niveau_offre', 'cadre_offre'] },
  },

  // ───────── RESTAURATION ─────────

  restaurant_menu: {
    key: 'restaurant_menu',
    label: 'Menu complet',
    category: 'restaurant',
    sections: [
      { id: 'general', label: 'Informations', fields: ['nb_plats', 'formule', 'regimes_offre'] },
      { id: 'capacity', label: 'Capacité', fields: ['nb_couverts_offre'] },
      { id: 'inclus', label: 'Inclus', fields: ['inclus'] },
    ],
    fields: {
      nb_plats: { type: 'number', required: true, label: 'Nombre de plats', min: 1 },
      formule: { type: 'text', label: 'Formule', placeholder: 'Entrée + Plat + Dessert' },
      regimes_offre: { type: 'multiselect', label: 'Régimes proposés', options: [
        { value: 'vegetarien', label: 'Végétarien' }, { value: 'vegan', label: 'Vegan' },
        { value: 'halal', label: 'Halal' }, { value: 'sans_gluten', label: 'Sans gluten' },
        { value: 'sans_lactose', label: 'Sans lactose' },
      ]},
      nb_couverts_offre: { type: 'number', required: true, label: 'Nombre de couverts', min: 1 },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'boisson', label: 'Boisson' }, { value: 'pain', label: 'Pain' },
        { value: 'the', label: 'Thé' }, { value: 'cafe', label: 'Café' },
      ]},
    },
    display: { cardFields: ['nb_plats', 'formule', 'nb_couverts_offre'], filterable: ['regimes_offre'] },
  },

  restaurant_dish: {
    key: 'restaurant_dish',
    label: 'Plat',
    category: 'restaurant',
    sections: [
      { id: 'general', label: 'Informations', fields: ['type_plat', 'regimes_offre'] },
    ],
    fields: {
      type_plat: { type: 'select', required: true, label: 'Type de plat', options: [
        { value: 'entree', label: 'Entrée' }, { value: 'plat', label: 'Plat principal' },
        { value: 'dessert', label: 'Dessert' },
      ]},
      regimes_offre: { type: 'multiselect', label: 'Régimes proposés', options: [
        { value: 'vegetarien', label: 'Végétarien' }, { value: 'vegan', label: 'Vegan' },
        { value: 'halal', label: 'Halal' }, { value: 'sans_gluten', label: 'Sans gluten' },
      ]},
    },
    display: { cardFields: ['type_plat'], filterable: ['regimes_offre', 'type_plat'] },
  },

  // ───────── ATELIER ─────────

  workshop_poterie: {
    key: 'workshop_poterie',
    label: 'Poterie',
    category: 'workshop',
    sections: [
      { id: 'general', label: "L'atelier", fields: ['technique_enseignee', 'niveau_offre', 'duree', 'materiel_fourni'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'options', label: 'Options', fields: ['creation_a_emporter', 'vente_sur_place', 'inclus'] },
    ],
    fields: {
      technique_enseignee: { type: 'select', required: true, label: 'Technique enseignée', options: [
        { value: 'tour', label: 'Tour de potier' }, { value: 'modelage', label: 'Modelage main' },
        { value: 'colombin', label: 'Colombin' }, { value: 'emaux', label: 'Émaux & décoration' },
      ]},
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' },
      ]},
      duree: { type: 'text', required: true, label: 'Durée', placeholder: '2h / demi-journée' },
      materiel_fourni: { type: 'boolean', label: 'Matériel fourni' },
      creation_a_emporter: { type: 'boolean', label: 'Création à emporter' },
      vente_sur_place: { type: 'boolean', label: 'Vente sur place' },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'terre', label: 'Terre' }, { value: 'emaux', label: 'Émaux' },
        { value: 'cuisson', label: 'Cuisson' }, { value: 'outils', label: 'Outils' },
      ]},
    },
    display: { cardFields: ['technique_enseignee', 'duree', 'niveau_offre'], filterable: ['niveau_offre', 'technique_enseignee'] },
  },

  workshop_cuisine: {
    key: 'workshop_cuisine',
    label: 'Atelier cuisine',
    category: 'workshop',
    sections: [
      { id: 'general', label: "L'atelier", fields: ['plats_prepares', 'niveau_offre', 'duree_heures', 'nb_recettes'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max', 'enfants_acceptes'] },
      { id: 'options', label: 'Options', fields: ['visite_marche', 'inclus'] },
    ],
    fields: {
      plats_prepares: { type: 'text', required: true, label: 'Plats préparés', placeholder: 'Couscous, brik, mloukhia...' },
      niveau_offre: { type: 'select', label: 'Niveau', options: [
        { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' },
      ]},
      duree_heures: { type: 'number', required: true, label: 'Durée (heures)', unit: 'h', min: 1 },
      nb_recettes: { type: 'number', required: true, label: 'Nombre de recettes', min: 1 },
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      enfants_acceptes: { type: 'boolean', label: 'Adapté aux enfants' },
      visite_marche: { type: 'boolean', label: 'Visite du marché incluse' },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'ingredients', label: 'Ingrédients' }, { value: 'tablier', label: 'Tablier' },
        { value: 'recette', label: 'Fiche recette' }, { value: 'degustation', label: 'Dégustation' },
      ]},
    },
    display: { cardFields: ['nb_recettes', 'duree_heures', 'niveau_offre', 'plats_prepares'], filterable: ['niveau_offre', 'enfants_acceptes'] },
  },

  // ───────── TRANSPORT ─────────

  transport_transport_service: {
    key: 'transport_transport_service',
    label: 'Service transport',
    category: 'transport',
    sections: [
      { id: 'route', label: 'Trajet', fields: ['trajet_exact', 'duree_trajet', 'horaires_depart'] },
      { id: 'vehicle', label: 'Véhicule', fields: ['type_vehicule_offre', 'capacite_offre'] },
      { id: 'services', label: 'Services', fields: ['wifi_bord', 'pmr_offre', 'bagages_inclus'] },
    ],
    fields: {
      trajet_exact: { type: 'text', required: true, label: 'Trajet exact' },
      duree_trajet: { type: 'text', required: true, label: 'Durée du trajet', placeholder: '30 min / 2h' },
      horaires_depart: { type: 'textarea', label: 'Horaires de départ' },
      type_vehicule_offre: { type: 'select', required: true, label: 'Type de véhicule', options: [
        { value: 'voiture', label: 'Voiture' }, { value: 'minibus', label: 'Minibus' },
        { value: 'bus', label: 'Bus' }, { value: '4x4', label: '4x4' },
      ]},
      capacite_offre: { type: 'number', required: true, label: 'Nombre de personnes', min: 1 },
      wifi_bord: { type: 'boolean', label: 'WiFi à bord' },
      pmr_offre: { type: 'boolean', label: 'Accessible PMR' },
      bagages_inclus: { type: 'boolean', label: 'Bagages inclus' },
    },
    display: { cardFields: ['type_vehicule_offre', 'capacite_offre', 'duree_trajet'], filterable: ['type_vehicule_offre', 'pmr_offre'] },
  },

  // ───────── GUIDE SERVICE ─────────

  guide_service_guided_tour: {
    key: 'guide_service_guided_tour',
    label: 'Visite guidée',
    category: 'guide_service',
    sections: [
      { id: 'general', label: 'Visite', fields: ['zone_offre', 'specialite_offre', 'duree', 'langues'] },
      { id: 'group', label: 'Groupe', fields: ['nb_participants_min', 'nb_participants_max'] },
      { id: 'inclus', label: 'Inclus', fields: ['inclus'] },
    ],
    fields: {
      zone_offre: { type: 'text', required: true, label: 'Zone couverte' },
      specialite_offre: { type: 'text', label: 'Spécialité', placeholder: 'Histoire, nature, gastronomie...' },
      duree: { type: 'text', required: true, label: 'Durée' },
      langues: { type: 'multiselect', required: true, label: 'Langues parlées', options: [
        { value: 'fr', label: 'Français' }, { value: 'ar', label: 'Arabe' },
        { value: 'en', label: 'Anglais' }, { value: 'de', label: 'Allemand' },
        { value: 'it', label: 'Italien' }, { value: 'es', label: 'Espagnol' },
      ]},
      nb_participants_min: { type: 'number', label: 'Nombre minimum', min: 1 },
      nb_participants_max: { type: 'number', required: true, label: 'Nombre maximum', min: 1 },
      inclus: { type: 'multiselect', label: 'Inclus', options: [
        { value: 'audioguide', label: 'Audioguide' }, { value: 'entree', label: "Billet d'entrée" },
        { value: 'transport', label: 'Transport' },
      ]},
    },
    display: { cardFields: ['zone_offre', 'duree', 'specialite_offre'], filterable: ['langues', 'specialite_offre'] },
  },
};

export function getSchema(category: string, itemType: string): OfferTypeSchema | null {
  const key = `${category}_${itemType}`;
  return OFFER_SCHEMAS[key] ?? null;
}

export function getSchemaFields(category: string, itemType: string, fieldName?: string): SchemaField | Record<string, SchemaField> | null {
  const schema = getSchema(category, itemType);
  if (!schema) return null;
  if (fieldName) return schema.fields[fieldName] ?? null;
  return schema.fields;
}

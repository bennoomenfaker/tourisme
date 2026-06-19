/**
 * Mapping project_type → allowed offer categories
 * Ensures artisan projects don't create accommodation offers, etc.
 */

export const PROJECT_TYPES = [
  { value: 'accommodation', label: 'Hébergement', icon: '🏨', description: 'Hôtel, éco-lodge, gîte' },
  { value: 'camping', label: 'Camping', icon: '⛺', description: 'Camping, espace tente' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️', description: 'Restaurant, café, food truck' },
  { value: 'activity_center', label: 'Centre d\'activités', icon: '🎯', description: 'Sports, loisirs, plein air' },
  { value: 'artisan', label: 'Artisanat', icon: '🏺', description: 'Artisanat local, artisan' },
  { value: 'farm', label: 'Ferme écologique', icon: '🌾', description: 'Agrotourisme, ferme' },
  { value: 'transport', label: 'Transport', icon: '🚌', description: 'Transport, transfert, location' },
  { value: 'event_space', label: 'Espace événementiel', icon: '🎪', description: 'Événements, séminaires' },
  { value: 'tourism_association', label: 'Association tourisme', icon: '🤝', description: 'Association, guide local' },
  { value: 'eco_park', label: 'Parc écologique', icon: '🌿', description: 'Parc naturel, réserve' },
] as const;

export const OFFER_CATEGORIES = [
  { value: 'accommodation', label: 'Hébergement', icon: '🏨', description: 'Chambre, dortoir, tente' },
  { value: 'activity', label: 'Activité', icon: '🥾', description: 'Randonnée, kayak, visite' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️', description: 'Repas, menu, buffet' },
  { value: 'transport', label: 'Transport', icon: '🚌', description: 'Transfert, location véhicule' },
  { value: 'workshop', label: 'Atelier', icon: '🎨', description: 'Artisanat, cuisine, art' },
  { value: 'guide_service', label: 'Service guide', icon: '🧭', description: 'Guide touristique local' },
  { value: 'equipment_rental', label: 'Location équipement', icon: '🎿', description: 'Vélo, kayak, matériel' },
  { value: 'event', label: 'Événement', icon: '🎪', description: 'Festival, spectacle' },
  { value: 'package', label: 'Séjour complet', icon: '📦', description: 'Forfait hébergement+activité' },
] as const;

/**
 * Which offer categories are available for each project type
 */
export const PROJECT_TYPE_OFFERS: Record<string, string[]> = {
  accommodation: ['accommodation', 'restaurant', 'activity', 'package'],
  camping: ['accommodation', 'activity', 'equipment_rental'],
  restaurant: ['restaurant', 'event'],
  activity_center: ['activity', 'workshop', 'equipment_rental'],
  artisan: ['workshop', 'event', 'equipment_rental'],
  farm: ['accommodation', 'restaurant', 'activity', 'workshop'],
  transport: ['transport', 'equipment_rental'],
  event_space: ['event', 'accommodation', 'restaurant'],
  tourism_association: ['activity', 'guide_service', 'workshop', 'transport'],
  eco_park: ['activity', 'accommodation', 'guide_service', 'equipment_rental'],
};

/**
 * For guides (no project), allowed offer categories
 */
export const GUIDE_ALLOWED_OFFERS = ['activity', 'guide_service', 'workshop', 'transport', 'equipment_rental'];

/**
 * Offer category → fields that appear in the creation form
 */
export const CATEGORY_FORM_FIELDS: Record<string, string[]> = {
  accommodation: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items_accommodation', 'sessions'],
  activity: ['title', 'description', 'region', 'address', 'gps', 'meeting_point', 'images', 'min_group_size', 'max_group_size', 'min_age', 'confirmation_mode', 'items_activity', 'sessions'],
  restaurant: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items_restaurant', 'sessions'],
  transport: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items_transport'],
  workshop: ['title', 'description', 'region', 'address', 'gps', 'images', 'min_group_size', 'max_group_size', 'confirmation_mode', 'items_workshop', 'sessions'],
  guide_service: ['title', 'description', 'region', 'address', 'gps', 'meeting_point', 'images', 'min_group_size', 'max_group_size', 'confirmation_mode', 'items_guide', 'sessions'],
  equipment_rental: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items_rental'],
  event: ['title', 'description', 'region', 'address', 'gps', 'images', 'min_group_size', 'max_group_size', 'confirmation_mode', 'items_event', 'sessions'],
  package: ['title', 'description', 'region', 'address', 'gps', 'images', 'confirmation_mode', 'items_package'],
};

/**
 * Accommodation sub-types for offer items
 */
export const ACCOMMODATION_TYPES = [
  { value: 'private_room', label: 'Chambre privée', icon: '🏠' },
  { value: 'shared_dormitory', label: 'Dortoir partagé', icon: '🛏' },
  { value: 'double_room', label: 'Chambre double', icon: '👫' },
  { value: 'family_room', label: 'Chambre famille', icon: '👨‍👩‍👧‍👦' },
  { value: 'tent_space', label: 'Espace tente', icon: '⛺' },
  { value: 'suite', label: 'Suite', icon: '👑' },
  { value: 'studio', label: 'Studio', icon: '🏢' },
] as const;

/**
 * Item types for different offer categories
 */
export const ITEM_TYPES_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
  accommodation: ACCOMMODATION_TYPES.map(t => ({ value: t.value, label: t.label })),
  activity: [
    { value: 'guided_tour', label: 'Visite guidée' },
    { value: 'hiking', label: 'Randonnée' },
    { value: 'water_sport', label: 'Sport nautique' },
    { value: 'cultural', label: 'Visite culturelle' },
    { value: 'nature', label: 'Nature & safari' },
  ],
  restaurant: [
    { value: 'main_dish', label: 'Plat principal' },
    { value: 'appetizer', label: 'Entrée' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'menu', label: 'Menu complet' },
    { value: 'breakfast', label: 'Petit déjeuner' },
    { value: 'buffet', label: 'Buffet' },
  ],
  transport: [
    { value: 'transfer', label: 'Transfert' },
    { value: 'rental', label: 'Location véhicule' },
    { value: 'shuttle', label: 'Navette' },
  ],
  workshop: [
    { value: 'pottery', label: 'Poterie' },
    { value: 'cooking', label: 'Cuisine' },
    { value: 'weaving', label: 'Tissage' },
    { value: 'painting', label: 'Peinture' },
    { value: 'craft', label: 'Artisanat' },
  ],
  guide_service: [
    { value: 'guided_tour', label: 'Visite guidée' },
    { value: 'hiking_guide', label: 'Guide randonnée' },
    { value: 'cultural_guide', label: 'Guide culturel' },
    { value: 'photography', label: 'Guide photo' },
  ],
  equipment_rental: [
    { value: 'bike', label: 'Vélo' },
    { value: 'kayak', label: 'Kayak' },
    { value: 'hiking_gear', label: 'Matériel rando' },
    { value: 'camping_gear', label: 'Matériel camping' },
  ],
  event: [
    { value: 'festival', label: 'Festival' },
    { value: 'concert', label: 'Concert' },
    { value: 'exhibition', label: 'Exposition' },
    { value: 'conference', label: 'Conférence' },
  ],
  package: [
    { value: 'all_inclusive', label: 'Tout compris' },
    { value: 'half_board', label: 'Demi-pension' },
    { value: 'full_board', label: 'Pension complète' },
  ],
};

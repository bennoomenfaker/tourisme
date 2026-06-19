-- Seed file for EcoVoyage Database with real Tunisian data
-- Note: Passwords are placeholders, assuming they would be hashed by the application layer.

-- 1. USERS
INSERT INTO "users" (id, email, password, role, first_name, last_name, is_active, created_at, updated_at) VALUES
('usr_101', 'admin@ecovoyage.tn', '$2b$10$dummyHashHere', 'admin', 'Admin', 'EcoVoyage', true, NOW(), NOW()),
('usr_102', 'guide.ali@gmail.com', '$2b$10$dummyHashHere', 'guide', 'Ali', 'Ben Salah', true, NOW(), NOW()),
('usr_103', 'projet.kroumirie@yahoo.fr', '$2b$10$dummyHashHere', 'project_owner', 'Samir', 'Kroumirie', true, NOW(), NOW()),
('usr_104', 'voyageur.maram@gmail.com', '$2b$10$dummyHashHere', 'eco_traveler', 'Maram', 'Mejri', true, NOW(), NOW());

-- 2. ECO_TRAVELERS, GUIDES, PROJECT_OWNERS
INSERT INTO "eco_travelers" (id, user_id, bio, points, created_at, updated_at) VALUES
('eco_101', 'usr_104', 'Passionnée par la nature et les randonnées.', 150, NOW(), NOW());

INSERT INTO "guides" (id, user_id, specialty, languages, experience_years, created_at, updated_at) VALUES
('gui_101', 'usr_102', 'Randonnées en montagne', 'Arabe, Français, Anglais', 5, NOW(), NOW());

INSERT INTO "project_owners" (id, user_id, company_name, description, created_at, updated_at) VALUES
('pro_101', 'usr_103', 'Eco-Lodge Kroumirie', 'Hébergement écologique au cœur de la forêt d''Ain Draham.', NOW(), NOW());

-- 3. OFFER CATEGORIES (Assuming these might already be seeded, but including for reference)
INSERT INTO "offer_categories" (id, slug, label, icon) VALUES
('cat_1', 'eco_tour', 'Eco-Tour', 'eco') ON CONFLICT DO NOTHING;
INSERT INTO "offer_categories" (id, slug, label, icon) VALUES
('cat_2', 'accommodation', 'Hébergement', 'house') ON CONFLICT DO NOTHING;
INSERT INTO "offer_categories" (id, slug, label, icon) VALUES
('cat_3', 'activity', 'Activité', 'target') ON CONFLICT DO NOTHING;

-- 4. OFFERS
INSERT INTO "offers" (id, provider_id, provider_type, title, description, location, status, created_at, updated_at, category_id, address, latitude, longitude, confirmation_mode) VALUES
('off_101', 'pro_101', 'project_owner', 'Séjour à Eco-Lodge Kroumirie', 'Un séjour inoubliable en pleine nature à Ain Draham.', 'Ain Draham, Jendouba', 'approved', NOW(), NOW(), 'cat_2', 'Route de la forêt, Ain Draham', 36.776, 8.686, 'manual'),
('off_102', 'gui_101', 'guide', 'Randonnée Pédestre à Zaghouan', 'Découvrez les montagnes de Zaghouan et le temple des eaux.', 'Zaghouan', 'approved', NOW(), NOW(), 'cat_3', 'Temple des eaux, Zaghouan', 36.398, 10.143, 'automatic');

-- 5. OFFER ITEMS
INSERT INTO "offer_items" (id, offer_id, title, description, max_quantity, is_active, created_at, updated_at, bed_count, nights, tent_capacity, room_type) VALUES
('item_101', 'off_101', 'Bungalow en bois', 'Bungalow écologique avec vue sur la forêt', 5, true, NOW(), NOW(), 2, 1, NULL, 'private'),
('item_102', 'off_102', 'Ticket Randonnée', 'Participation à la randonnée guidée', 20, true, NOW(), NOW(), NULL, NULL, NULL, NULL);

-- 6. OFFER ITEM PRICES
INSERT INTO "offer_item_prices" (id, item_id, title, price, currency, conditions, is_active) VALUES
('price_101', 'item_101', 'Adulte', 120.00, 'TND', 'Par nuit, petit déjeuner inclus', true),
('price_102', 'item_102', 'Standard', 35.00, 'TND', 'Transport non inclus', true);

-- 7. CIRCUITS
INSERT INTO "circuits" (id, provider_id, provider_type, title, description, location, duration_days, difficulty, group_size_min, group_size_max, price, currency, status, created_at, updated_at, images) VALUES
('cir_101', 'gui_101', 'guide', 'Circuit Sud Tunisien: Magie du Sahara', 'Un circuit de 3 jours dans le sud tunisien: Douz, Tozeur, et Tataouine.', 'Sud Tunisien', 3, 'medium', 4, 15, 450.00, 'TND', 'approved', NOW(), NOW(), 'https://example.com/sahara1.jpg,https://example.com/sahara2.jpg');

-- 8. CIRCUIT DAYS
INSERT INTO "circuit_days" (id, circuit_id, day_number, title, description) VALUES
('cday_101', 'cir_101', 1, 'Départ vers Tozeur', 'Visite de la médina et des oasis.'),
('cday_102', 'cir_101', 2, 'Aventure à Douz', 'Balade à dos de chameau dans les dunes.'),
('cday_103', 'cir_101', 3, 'Les Ksour de Tataouine', 'Découverte de l''architecture berbère.');

-- 9. CIRCUIT PROGRAM ITEMS
INSERT INTO "circuit_program_items" (id, day_id, time, title, description, latitude, longitude) VALUES
('cprog_101', 'cday_101', '08:00', 'Départ de Tunis', 'Rassemblement au centre-ville.', 36.806, 10.181),
('cprog_102', 'cday_101', '14:00', 'Arrivée à Tozeur', 'Installation à l''hôtel et visite de l''Oasis.', 33.919, 8.133);

-- END OF SEED FILE

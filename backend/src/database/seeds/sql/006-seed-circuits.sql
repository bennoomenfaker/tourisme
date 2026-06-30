-- ═══════════════════════════════════════════════════════════════════
-- Seed 006 — Circuits for project owners + trip plans for eco_travelers
-- ═══════════════════════════════════════════════════════════════════
-- Project owners:
--  • fakerbennoomen@gmail.com  (92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e)
--  • me.d.fakerbennoomen@gmail.com (3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f)
--  • n.our.fakerbennoomen@gmail.com (8148d448-9c88-4aa3-b2f1-7d71bc112f12)
-- Guides:
--  • Youssef (87a38946-9a54-4bb4-be4a-887be312af15)
--  • Karim (6fb2d1e7-39db-4152-b9b5-5b440f551cc9)
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════
-- CIRCUIT 1: "Circuit Djerba Culture & Nature" (fakerbennoomen)
-- 4 days — mix of guided (Youssef) and company activities
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO circuits (id, author_id, author_type, title, description, region, lat, lng, duration_days, base_price, currency, difficulty_level, status, created_at, updated_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner',
  'Circuit Djerba Culture & Nature',
  'Un circuit de 4 jours pour découvrir Djerba : poterie traditionnelle, plongée écoresponsable, randonnée culturelle et détente sur les plages préservées.',
  'Djerba', 33.8085, 10.9905, 4, 850.00, 'TND', 'easy', 'approved', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Circuit Djerba Culture & Nature');

-- Day 1: Arrivée & Poterie de Guellala (guide: Youssef)
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 1, 'Arrivée & Atelier Poterie de Guellala',
  'Accueil à Djerba, installation. Visite du village de potiers de Guellala avec démonstration et initiation.',
  33.8000, 10.8500, 'Guellala', now()
FROM circuits c WHERE c.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND c.title = 'Circuit Djerba Culture & Nature'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 1);

-- Program items Day 1
INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Accueil & Installation', 'Transfert aéroport → hébergement, installation.', '10:00', '12:00', true, true, '🚐', 120, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Accueil & Installation');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Atelier Poterie de Guellala', 'Visite de la coopérative féminine de poterie. Initiation au tour de potier et modelage.', '14:00', '17:00', true, true, '🏺', 180, '87a38946-9a54-4bb4-be4a-887be312af15', 'Youssef Meslek', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Atelier Poterie de Guellala');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Dîner Djerbien Traditionnel', 'Repas typique dans un restaurant familial. Dégustation de couscous, tajines et pâtisseries locales.', '19:30', '21:00', true, true, '🍽️', 90, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Dîner Djerbien Traditionnel');

-- Day 2: Plongée & Snorkeling (no guide, company activity)
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 2, 'Plongée Écoresponsable & Détente',
  'Journée au centre de plongée : snorkeling dans les herbiers de posidonie, observation des tortues marines.',
  33.8300, 11.0100, 'Zone Touristique Midoun', now()
FROM circuits c WHERE c.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND c.title = 'Circuit Djerba Culture & Nature'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 2);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Plongée & Snorkeling', 'Initiation plongée ou snorkeling encadré par des moniteurs. Observation des posidonies et tortues.', '08:00', '12:00', true, true, '🤿', 240, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Plongée & Snorkeling');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Déjeuner au Jardin Bio', 'Déjeuner au Restaurant Le Jardin Bio : cuisine du terroir avec produits bio du potager.', '12:30', '14:00', true, true, '🥗', 90, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Déjeuner au Jardin Bio');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Temps libre plage', 'Détente sur la plage de Sidi Mehrez. Baignade libre.', '15:00', '18:00', true, false, '🏖️', 180, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Temps libre plage');

-- Day 3: Visite culturelle guidée (guide: Youssef)
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 3, 'Patrimoine & Culture Djerbienne',
  'Visite de la Ghriba, promenade dans Houmt Souk, déjeuner chez l''habitant et cours de cuisine djerbienne.',
  33.8750, 10.8600, 'Houmt Souk', now()
FROM circuits c WHERE c.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND c.title = 'Circuit Djerba Culture & Nature'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 3);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Visite de la Ghriba', 'Visite guidée de la synagogue de la Ghriba, l''un des plus anciens lieux de culte juif d''Afrique.', '08:30', '10:30', true, true, '🕍', 120, '87a38946-9a54-4bb4-be4a-887be312af15', 'Youssef Meslek', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 3
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Visite de la Ghriba');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Promenade Houmt Souk', 'Découverte du souk traditionnel de Houmt Souk : épices, artisanat, tissage.', '10:45', '12:30', true, true, '🛍️', 105, '87a38946-9a54-4bb4-be4a-887be312af15', 'Youssef Meslek', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 3
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Promenade Houmt Souk');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Cours de Cuisine Djerbienne', 'Cours de cuisine traditionnelle chez l''habitant. Préparation de briks, couscous et pâtisseries.', '14:00', '17:00', true, true, '👩‍🍳', 180, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 3
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Cours de Cuisine Djerbienne');

-- Day 4: Kayak & Départ
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 4, 'Kayak & Départ',
  'Matinée kayak sur la côte Est de Djerba. Déjeuner et transfert vers l''aéroport.',
  33.8300, 11.0200, 'Côte Est Djerba', now()
FROM circuits c WHERE c.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND c.title = 'Circuit Djerba Culture & Nature'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 4);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Kayak Côtier', 'Excursion en kayak le long de la côte Est. Observation des oiseaux et baignade.', '08:00', '11:00', true, true, '🛶', 180, '87a38946-9a54-4bb4-be4a-887be312af15', 'Youssef Meslek', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 4
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Kayak Côtier');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Déjeuner & Transfert', 'Déjeuner et transfert vers l''aéroport de Djerba-Zarzis.', '12:00', '15:00', true, true, '🚐', 180, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Djerba Culture & Nature' AND cd.day_number = 4
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Déjeuner & Transfert');


-- ═══════════════════════════════════════════════════════════════════
-- CIRCUIT 2: "Safari Désert & Oasis Tozeur" (fakerbennoomen)
-- 3 days — guided by Karim
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO circuits (id, author_id, author_type, title, description, region, lat, lng, duration_days, base_price, currency, difficulty_level, status, created_at, updated_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner',
  'Safari Désert & Oasis Tozeur',
  'Un circuit de 3 jours dans le Grand Erg Oriental : trekking dans le désert, nuit en bivouac, visite des oasis et des ksour.',
  'Tozeur', 33.9197, 8.1335, 3, 650.00, 'TND', 'moderate', 'approved', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Safari Désert & Oasis Tozeur');

-- Day 1
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 1, 'Arrivée Tozeur & Visite de l''Oasis',
  'Arrivée à Tozeur. Déjeuner à la Ferme Bio Oasis. Découverte des palmeraies et des sources d''eau.',
  33.9197, 8.1335, 'Tozeur', now()
FROM circuits c WHERE c.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND c.title = 'Safari Désert & Oasis Tozeur'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 1);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Déjeuner Ferme Bio Oasis', 'Déjeuner bio à la Ferme Bio Oasis : dattes, huile d''olive, méchoui.', '12:00', '14:00', true, true, '🌴', 120, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Safari Désert & Oasis Tozeur' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Déjeuner Ferme Bio Oasis');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Randonnée Palmeraie', 'Randonnée guidée à travers les palmeraies de Tozeur. Histoire des oasis et système d''irrigation traditionnel.', '14:30', '17:00', true, true, '🥾', 150, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'Karim Bouazizi', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Safari Désert & Oasis Tozeur' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Randonnée Palmeraie');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Dîner & Nuit à Tozeur', 'Dîner traditionnel et nuit à l''hôtel.', '19:00', '22:00', true, true, '🌙', 180, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Safari Désert & Oasis Tozeur' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Dîner & Nuit à Tozeur');

-- Day 2: Désert Trekking (guide: Karim)
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 2, 'Trekking Grand Erg Oriental',
  'Journée trekking dans le Grand Erg Oriental guidée par Karim. Nuit en bivouac sous les étoiles.',
  33.1300, 8.1300, 'Grand Erg Oriental', now()
FROM circuits c WHERE c.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND c.title = 'Safari Désert & Oasis Tozeur'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 2);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Trekking Désert', 'Marche dans les dunes du Grand Erg Oriental. Découverte de la faune et flore désertique.', '06:00', '12:00', true, true, '🥾', 360, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'Karim Bouazizi', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Safari Désert & Oasis Tozeur' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Trekking Désert');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Déjeuner Bivouac', 'Déjeuner nomade préparé sur place. Dégustation de thé à la menthe.', '12:00', '14:00', true, true, '🍵', 120, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'Karim Bouazizi', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Safari Désert & Oasis Tozeur' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Déjeuner Bivouac');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Session Photo Coucher de Soleil', 'Session photo accompagnée par Karim. Capture des meilleurs spots au coucher du soleil.', '16:00', '18:00', true, true, '📷', 120, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'Karim Bouazizi', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Safari Désert & Oasis Tozeur' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Session Photo Coucher de Soleil');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Nuit en Bivouac', 'Nuit à la belle étoile dans le désert. Veillée nomade autour du feu.', '20:00', '23:00', true, true, '🔥', 180, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'Karim Bouazizi', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Safari Désert & Oasis Tozeur' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Nuit en Bivouac');

-- Day 3: Ksour & Retour
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 3, 'Ksour du Sud & Retour',
  'Visite des ksour berbères de la région de Tataouine. Retour vers Tozeur en fin de journée.',
  33.1300, 10.4500, 'Tataouine', now()
FROM circuits c WHERE c.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND c.title = 'Safari Désert & Oasis Tozeur'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 3);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Visite Ksar Ouled Soltane', 'Visite guidée du plus beau ksar du Sud tunisien. Architecture berbère millénaire.', '08:00', '10:00', true, true, '🏰', 120, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'Karim Bouazizi', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Safari Désert & Oasis Tozeur' AND cd.day_number = 3
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Visite Ksar Ouled Soltane');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Déjeuner chez l''habitant', 'Déjeuner traditionnel chez une famille berbère à Tataouine.', '12:00', '13:30', true, true, '🍲', 90, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Safari Désert & Oasis Tozeur' AND cd.day_number = 3
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Déjeuner chez l''habitant');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Retour Tozeur', 'Transfert vers Tozeur. Fin du circuit.', '14:00', '17:00', true, true, '🚐', 180, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Safari Désert & Oasis Tozeur' AND cd.day_number = 3
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Retour Tozeur');


-- ═══════════════════════════════════════════════════════════════════
-- CIRCUIT 3: "Circuit Kroumirie & Mer" (me.d.fakerbennoomen)
-- 3 days — mix guided/company
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO circuits (id, author_id, author_type, title, description, region, lat, lng, duration_days, base_price, currency, difficulty_level, status, created_at, updated_at)
SELECT gen_random_uuid(), '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f', 'project_owner',
  'Circuit Kroumirie & Côte Nord',
  '3 jours entre forêt de chênes-lièges et plages préservées de la côte Nord : bungalow éco-lodge, randonnée et kayak.',
  'Aïn Draham', 36.7837, 8.6865, 3, 580.00, 'TND', 'moderate', 'approved', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE author_id = '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f' AND title = 'Circuit Kroumirie & Côte Nord');

-- Day 1
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 1, 'Arrivée à Aïn Draham & Installation',
  'Arrivée à l''Éco-Lodge Forêt de Kroumirie. Installation dans les bungalows en bois. Découverte des lieux.',
  36.7837, 8.6865, 'Aïn Draham', now()
FROM circuits c WHERE c.author_id = '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f' AND c.title = 'Circuit Kroumirie & Côte Nord'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 1);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Randonnée Forêt de Chênes-Lièges', 'Randonnée guidée en forêt. Découverte de la biodiversité, observation des oiseaux.', '09:00', '12:00', true, true, '🥾', 180, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Kroumirie & Côte Nord' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Randonnée Forêt de Chênes-Lièges');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Déjeuner Bio à l''Éco-Lodge', 'Déjeuner préparé avec les produits du jardin bio de l''éco-lodge.', '12:30', '14:00', true, true, '🥗', 90, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Kroumirie & Côte Nord' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Déjeuner Bio à l''Éco-Lodge');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Atelier Découverte Plantes', 'Atelier découverte des plantes aromatiques et médicinales de Kroumirie.', '15:00', '17:00', true, true, '🌿', 120, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Kroumirie & Côte Nord' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Atelier Découverte Plantes');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Soirée Détente Spa Naturel', 'Soirée détente avec spa naturel et bain de vapeur traditionnel.', '19:00', '21:00', true, false, '🧖', 120, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Kroumirie & Côte Nord' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Soirée Détente Spa Naturel');

-- Day 2: Kayak à Korba
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 2, 'Kayak de Mer à Korba',
  'Excursion d''une journée au Centre Kayak Éco Korba. Initiation kayak et snorkeling.',
  36.7570, 10.7250, 'Korba', now()
FROM circuits c WHERE c.author_id = '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f' AND c.title = 'Circuit Kroumirie & Côte Nord'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 2);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Transfert Aïn Draham → Korba', 'Trajet vers le Centre Kayak Éco Korba (2h).', '08:00', '10:00', true, true, '🚐', 120, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Kroumirie & Côte Nord' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Transfert Aïn Draham → Korba');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Kayak & Snorkeling', 'Initiation kayak de mer. Snorkeling dans les eaux claires de Korba. Observation des tortues.', '10:30', '13:00', true, true, '🛶', 150, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Kroumirie & Côte Nord' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Kayak & Snorkeling');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Déjeuner Poisson Frais', 'Déjeuner de poisson frais dans un restaurant côtier.', '13:00', '14:30', true, true, '🐟', 90, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Kroumirie & Côte Nord' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Déjeuner Poisson Frais');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Retour & Dîner à l''Éco-Lodge', 'Retour à Aïn Draham. Dîner et nuit à l''éco-lodge.', '15:00', '20:00', true, true, '🏡', 300, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Kroumirie & Côte Nord' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Retour & Dîner à l''Éco-Lodge');

-- Day 3: Départ
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 3, 'Matinée Libre & Départ',
  'Matinée libre : randonnée en autonomie ou détente. Déjeuner et départ.',
  36.7837, 8.6865, 'Aïn Draham', now()
FROM circuits c WHERE c.author_id = '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f' AND c.title = 'Circuit Kroumirie & Côte Nord'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 3);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Randonnée Libre', 'Randonnée libre autour de l''éco-lodge ou détente.', '08:00', '11:00', true, false, '🥾', 180, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Kroumirie & Côte Nord' AND cd.day_number = 3
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Randonnée Libre');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Brunch & Départ', 'Brunch à l''éco-lodge puis départ.', '11:00', '13:00', true, true, '🥐', 120, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Kroumirie & Côte Nord' AND cd.day_number = 3
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Brunch & Départ');


-- ═══════════════════════════════════════════════════════════════════
-- CIRCUIT 4: "Circuit Vélo Éco Hammamet" (n.our.fakerbennoomen)
-- 2 days
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO circuits (id, author_id, author_type, title, description, region, lat, lng, duration_days, base_price, currency, difficulty_level, status, created_at, updated_at)
SELECT gen_random_uuid(), '8148d448-9c88-4aa3-b2f1-7d71bc112f12', 'project_owner',
  'Circuit Vélo Éco Hammamet',
  'Circuit écoresponsable à vélo entre Hammamet et Nabeul. Balades le long de la côte et atelier poterie traditionnelle.',
  'Hammamet', 36.4020, 10.6300, 2, 280.00, 'TND', 'easy', 'approved', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE author_id = '8148d448-9c88-4aa3-b2f1-7d71bc112f12' AND title = 'Circuit Vélo Éco Hammamet');

-- Day 1
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 1, 'Balade Côtière & Atelier Poterie',
  'Location de vélos éco. Balade le long de la côte d''Hammamet jusqu''à Nabeul. Atelier poterie l''après-midi.',
  36.4050, 10.6350, 'Hammamet', now()
FROM circuits c WHERE c.author_id = '8148d448-9c88-4aa3-b2f1-7d71bc112f12' AND c.title = 'Circuit Vélo Éco Hammamet'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 1);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Balade à Vélo Côte Hammamet', 'Balade à vélo le long de la côte. Arrêts photo et baignade.', '08:30', '11:30', true, true, '🚲', 180, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Vélo Éco Hammamet' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Balade à Vélo Côte Hammamet');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Déjeuner Marché de Nabeul', 'Déjeuner au marché de Nabeul : spécialités locales et fruits de mer.', '12:00', '13:30', true, true, '🍽️', 90, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Vélo Éco Hammamet' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Déjeuner Marché de Nabeul');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Atelier Poterie Traditionnelle', 'Visite de l''atelier de poterie. Initiation au modelage avec des artisans locaux.', '14:30', '17:00', true, true, '🏺', 150, '87a38946-9a54-4bb4-be4a-887be312af15', 'Youssef Meslek', now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Vélo Éco Hammamet' AND cd.day_number = 1
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Atelier Poterie Traditionnelle');

-- Day 2
INSERT INTO circuit_days (id, circuit_id, day_number, title, description, lat, lng, location_name, created_at)
SELECT gen_random_uuid(), c.id, 2, 'Randonnée Vélo & Départ',
  'Randonnée à vélo dans l''arrière-pays d''Hammamet. Visite de vergers et déjeuner champêtre.',
  36.4020, 10.6300, 'Hammamet', now()
FROM circuits c WHERE c.author_id = '8148d448-9c88-4aa3-b2f1-7d71bc112f12' AND c.title = 'Circuit Vélo Éco Hammamet'
AND NOT EXISTS (SELECT 1 FROM circuit_days WHERE circuit_id = c.id AND day_number = 2);

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Randonnée Vélo Arrière-Pays', 'Randonnée à vélo dans les vergers et oliveraies autour d''Hammamet.', '08:00', '11:00', true, true, '🚲', 180, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Vélo Éco Hammamet' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Randonnée Vélo Arrière-Pays');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Déjeuner Champêtre', 'Déjeuner champêtre dans une ferme bio. Dégustation d''huile d''olive et produits du terroir.', '12:00', '14:00', true, true, '🧺', 120, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Vélo Éco Hammamet' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Déjeuner Champêtre');

INSERT INTO circuit_program_items (id, circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, guide_id, guide_name, created_at)
SELECT gen_random_uuid(), cd.id, 'Retour & Fin du Circuit', 'Retour à Hammamet et fin du circuit.', '14:00', '15:00', true, true, '🚐', 60, NULL, NULL, now()
FROM circuit_days cd JOIN circuits c ON c.id = cd.circuit_id
WHERE c.title = 'Circuit Vélo Éco Hammamet' AND cd.day_number = 2
AND NOT EXISTS (SELECT 1 FROM circuit_program_items WHERE circuit_day_id = cd.id AND title = 'Retour & Fin du Circuit');


-- ═══════════════════════════════════════════════════════════════════
-- NOTIFICATIONS for guides and project owners
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(), '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'system', 'Bienvenue Karim !',
  'Votre profil guide a été activé. Vous pouvez maintenant recevoir des réservations.', false, now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9' AND title = 'Bienvenue Karim !');

INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(), '87a38946-9a54-4bb4-be4a-887be312af15', 'system', 'Bienvenue Youssef !',
  'Votre profil guide a été activé. Vous pouvez maintenant recevoir des réservations.', false, now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND title = 'Bienvenue Youssef !');

INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'system', 'Circuit approuvé',
  'Votre circuit "Circuit Djerba Culture & Nature" a été approuvé. Il est maintenant visible par les voyageurs.', false, now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Circuit approuvé');

INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'system', 'Nouvelle réservation',
  'Un voyageur a réservé le "Safari Désert & Oasis Tozeur". Consultez vos réservations.', false, now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Nouvelle réservation');

INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(), '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f', 'system', 'Circuit approuvé',
  'Votre circuit "Circuit Kroumirie & Côte Nord" a été approuvé.', false, now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = '3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f' AND title = 'Circuit approuvé');

INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(), '8148d448-9c88-4aa3-b2f1-7d71bc112f12', 'system', 'Circuit approuvé',
  'Votre circuit "Circuit Vélo Éco Hammamet" a été approuvé.', false, now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = '8148d448-9c88-4aa3-b2f1-7d71bc112f12' AND title = 'Circuit approuvé');

INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(), '87a38946-9a54-4bb4-be4a-887be312af15', 'system', 'Affectation guide',
  'Vous avez été assigné comme guide pour le circuit "Circuit Djerba Culture & Nature".', false, now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND title = 'Affectation guide');

INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
SELECT gen_random_uuid(), '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'system', 'Affectation guide',
  'Vous avez été assigné comme guide pour le circuit "Safari Désert & Oasis Tozeur".', false, now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9' AND title = 'Affectation guide');

-- ═══════════════════════════════════════════════════════════════════
-- TRIP PLANS for eco_travelers
-- ═══════════════════════════════════════════════════════════════════

-- Trip plan 1: f.akerbennoomen@gmail.com (eco_traveler) — 2-day Djerba trip
INSERT INTO trip_plans (id, title, description, start_date, end_date, status, created_at, updated_at, eco_traveler_id)
SELECT gen_random_uuid(), 'Week-end Découverte Djerba', '2 jours pour découvrir Djerba : poterie, plage et gastronomie.',
  '2026-07-15', '2026-07-16', 'published', now(), now(), '7b83e87d-276d-4d89-bb00-ab8ea1243a14'
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE eco_traveler_id = '7b83e87d-276d-4d89-bb00-ab8ea1243a14' AND title = 'Week-end Découverte Djerba');

-- Trip plan 2: l.eila.fakerbennoomen@gmail.com (eco_traveler) — 3-day desert exploration
INSERT INTO trip_plans (id, title, description, start_date, end_date, status, created_at, updated_at, eco_traveler_id)
SELECT gen_random_uuid(), 'Aventure Désert Tozeur', '3 jours dans le Sahara : dune, ksour et nuit sous les étoiles.',
  '2026-08-01', '2026-08-03', 'draft', now(), now(), 'a602737a-b07d-4a41-b9c3-cdf1be17036a'
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE eco_traveler_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a' AND title = 'Aventure Désert Tozeur');

-- Trip plan 3: ah.m.edfakerbennoomen@gmail.com (eco_traveler) — 2-day Kroumirie
INSERT INTO trip_plans (id, title, description, start_date, end_date, status, created_at, updated_at, eco_traveler_id)
SELECT gen_random_uuid(), 'Escapade Forêt Kroumirie', 'Évasion en forêt de chênes-lièges et kayak à Korba.',
  '2026-07-20', '2026-07-21', 'published', now(), now(), 'b09808ee-30a9-4089-bbf7-698e73004ef4'
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE eco_traveler_id = 'b09808ee-30a9-4089-bbf7-698e73004ef4' AND title = 'Escapade Forêt Kroumirie');

-- Trip plan 4: sarah.b.akerbennoomen@gmail.com (eco_traveler) — 4-day Djerba culture
INSERT INTO trip_plans (id, title, description, start_date, end_date, status, created_at, updated_at, eco_traveler_id)
SELECT gen_random_uuid(), 'Circuit Culturel Djerba 4 Jours', 'Immersion culturelle à Djerba avec ateliers artisanaux et plongée.',
  '2026-09-05', '2026-09-08', 'draft', now(), now(), '90b4c5bf-4a47-4737-b033-f7385e22a2e6'
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE eco_traveler_id = '90b4c5bf-4a47-4737-b033-f7385e22a2e6' AND title = 'Circuit Culturel Djerba 4 Jours');

-- Trip plan 5: f.a.k.e.r.b.e.n.n.o.o.m.e.n@gmail.com (eco_traveler) — 1-day Hammamet
INSERT INTO trip_plans (id, title, description, start_date, end_date, status, created_at, updated_at, eco_traveler_id)
SELECT gen_random_uuid(), 'Journée Vélo Hammamet', 'Balade à vélo et atelier poterie à Hammamet.',
  '2026-07-25', '2026-07-25', 'published', now(), now(), '4dbab9db-0d74-4726-8c1b-49f53ad64ea9'
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE eco_traveler_id = '4dbab9db-0d74-4726-8c1b-49f53ad64ea9' AND title = 'Journée Vélo Hammamet');

COMMIT;

-- ═══════════════════════════════════════════════════════════════════
-- Seed 007 — Comprehensive data for all users
-- ═══════════════════════════════════════════════════════════════════
-- What this seed does:
--  1. Activates pending users
--  2. Creates eco_traveler profiles for pending travelers
--  3. Creates project_owner profile for pending project owner
--  4. Creates new offers + offer_items in Sousse / Kairouan (for trip plans)
--  5. Links trip_plan_items with offer_item_id to real offer_items
--  6. Creates bookings with participants for eco_travelers
--  7. Creates notifications for all users
--  8. Creates reviews
--  9. Sets coordinates on offers that lack them
-- ═══════════════════════════════════════════════════════════════════
-- Users:
--   Project owners:
--     92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e  fakerbennoomen@gmail.com
--     3f8cb3e8-b8d1-4d27-a9ff-1b6699079b9f  me.d.fakerbennoomen@gmail.com
--     8148d448-9c88-4aa3-b2f1-7d71bc112f12  n.our.fakerbennoomen@gmail.com
--     dab65a25-7dfb-4150-b559-a5e367176af1  fakerben.noomen+123@gmail.com  (pending → active)
--   Guides:
--     6fb2d1e7-39db-4152-b9b5-5b440f551cc9  Karim Bouazizi
--     87a38946-9a54-4bb4-be4a-887be312af15  Youssef Meslek
--   Eco travelers:
--     7b83e87d-276d-4d89-bb00-ab8ea1243a14  f.akerbennoomen@gmail.com
--     b09808ee-30a9-4089-bbf7-698e73004ef4  ah.m.edfakerbennoomen@gmail.com
--     a602737a-b07d-4a41-b9c3-cdf1be17036a  l.eila.fakerbennoomen@gmail.com
--     90b4c5bf-4a47-4737-b033-f7385e22a2e6  sarah.b.akerbennoomen@gmail.com
--     4dbab9db-0d74-4726-8c1b-49f53ad64ea9  f.a.k.e.r.b.e.n.n.o.o.m.e.n@gmail.com
--     053f8618-5b08-464d-a188-64adf9547735  fakerbennoomen+1@gmail.com       (pending → active)
--     fa57156b-10f5-460a-9b33-137129f6cb3e  k.arim.fakerbennoomen+1@gmail.com (pending → active)
--     19761bd4-a85a-4099-9980-b80d0ccb5b07  k.arim.fakerbennoomen@gmail.com  (pending → active)
--   Admin:
--     faf06ea0-3c4a-4cff-b180-5ff4bedab682  admin@gmail.com
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════
-- 1. Activate pending users
-- ═══════════════════════════════════════════════════════════════════
UPDATE users SET status = 'active', updated_at = now()
WHERE status = 'pending' AND id IN (
  '053f8618-5b08-464d-a188-64adf9547735',  -- fakerbennoomen+1
  'fa57156b-10f5-460a-9b33-137129f6cb3e',  -- k.arim.fakerbennoomen+1
  '19761bd4-a85a-4099-9980-b80d0ccb5b07',  -- k.arim.fakerbennoomen
  'dab65a25-7dfb-4150-b559-a5e367176af1'   -- fakerben.noomen+123
);

-- ═══════════════════════════════════════════════════════════════════
-- 2. Create eco_traveler profiles for pending travelers
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO eco_travelers (user_id, full_name, bio, country, language, traveler_types, motivations, sustainability_values, is_onboarded, profile_completion, created_at, updated_at)
SELECT '053f8618-5b08-464d-a188-64adf9547735', 'Sami Ben Salem',
  'Voyageur passionné de découvertes culturelles et de rencontres authentiques.',
  'Tunisie', 'fr', 'culturel,solo', 'Découvrir,Apprendre,Partager', 'Respect,Authenticité', true, 60, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM eco_travelers WHERE user_id = '053f8618-5b08-464d-a188-64adf9547735');

INSERT INTO eco_travelers (user_id, full_name, bio, country, language, traveler_types, motivations, sustainability_values, is_onboarded, profile_completion, created_at, updated_at)
SELECT 'fa57156b-10f5-460a-9b33-137129f6cb3e', 'Mariam Khelifi',
  'Amoureuse de la nature, je voyage pour découvrir les paysages préservés et soutenir le tourisme durable.',
  'Tunisie', 'fr', 'nature,famille', 'Nature,Bien-être,Déconnexion', 'Écologie,Respect', true, 60, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM eco_travelers WHERE user_id = 'fa57156b-10f5-460a-9b33-137129f6cb3e');

INSERT INTO eco_travelers (user_id, full_name, bio, country, language, traveler_types, motivations, sustainability_values, is_onboarded, profile_completion, created_at, updated_at)
SELECT '19761bd4-a85a-4099-9980-b80d0ccb5b07', 'Omar Jelliti',
  'Photographe amateur en quête de lumières et de paysages uniques. Je préfère les circuits hors des sentiers battus.',
  'Tunisie', 'fr', 'solo,aventure', 'Aventure,Photo,Dépassement', 'Authenticité,Partage', true, 60, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM eco_travelers WHERE user_id = '19761bd4-a85a-4099-9980-b80d0ccb5b07');

-- ═══════════════════════════════════════════════════════════════════
-- 3. Create project_owner profile for pending project owner
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO project_owners (user_id, full_name, bio, country, language, organization, position, is_onboarded, profile_completion, created_at, updated_at)
SELECT 'dab65a25-7dfb-4150-b559-a5e367176af1', 'Amira Ben Ali',
  'Agence locale spécialisée dans les circuits culturels et éco-touristiques dans le Sahel et le Sud tunisien.',
  'Tunisie', 'fr', 'Sahel Eco Tours', 'Fondatrice', true, 70, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM project_owners WHERE user_id = 'dab65a25-7dfb-4150-b559-a5e367176af1');

-- ═══════════════════════════════════════════════════════════════════
-- 4. Create offers in Sousse / Kairouan for trip plan linkage
-- by fakerbennoomen (92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e) project owner
-- ═══════════════════════════════════════════════════════════════════

-- Offer 1: Visite historique Kairouan
INSERT INTO offers (id, author_id, author_type, title, description, region, offer_type, status, latitude, longitude, address, meeting_point, meeting_lat, meeting_lng, category_id, price, confirmation_mode, location_type, created_at, updated_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner',
  'Visite Historique Kairouan',
  'Découvrez la ville sainte de Kairouan : Grande Mosquée, Bassins Aghlabites, Médina classée UNESCO. Visite guidée de 3 heures avec guide local.',
  'Kairouan', 'activity', 'approved',
  35.6789, 10.1010, 'Kairouan Médina', 'Place de la Grande Mosquée', 35.6789, 10.1010,
  '21a655e0-de08-4b62-b0da-7c5337fd93be', 120.00, 'automatic', 'fixed', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Visite Historique Kairouan');

-- Offer items for Kairouan offer
INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
SELECT gen_random_uuid(), o.id, 'Grande Mosquée & Médina',
  'Visite guidée de la Grande Mosquée Okba Ibn Nafaa, des Bassins Aghlabites et balade dans la Médina classée UNESCO.',
  'visit', '{"duration_minutes": 180}', 'active', now(), now()
FROM offers o WHERE o.title = 'Visite Historique Kairouan' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = o.id AND name = 'Grande Mosquée & Médina');

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
SELECT gen_random_uuid(), o.id, 'Dégustation Pâtisseries Traditionnelles',
  'Dégustation de pâtisseries kairouanaises (makroudh, baklawa) dans une maison d hôte traditionnelle.',
  'food', '{"duration_minutes": 60}', 'active', now(), now()
FROM offers o WHERE o.title = 'Visite Historique Kairouan' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = o.id AND name = 'Dégustation Pâtisseries Traditionnelles');

-- Offer 2: Séjour Sousse & Sahel
INSERT INTO offers (id, author_id, author_type, title, description, region, offer_type, status, latitude, longitude, address, meeting_point, meeting_lat, meeting_lng, category_id, price, confirmation_mode, location_type, created_at, updated_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner',
  'Séjour Sousse & Sahel',
  'Explorez Sousse et le Sahel tunisien : Ribat, Port de pêche, plages de sable fin et découverte de l artisanat local. 4 jours d immersion.',
  'Sousse', 'sejour', 'approved',
  35.8256, 10.6411, 'Sousse Médina', 'Port de Sousse', 35.8256, 10.6411,
  '4c50bfe4-dc54-4b5d-bfa9-308c31c8b356', 450.00, 'automatic', 'fixed', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Séjour Sousse & Sahel');

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
SELECT gen_random_uuid(), o.id, 'Visite du Ribat & Médina de Sousse',
  'Visite guidée du Ribat, de la Grande Mosquée et balade dans la Médina classée au patrimoine mondial.',
  'visit', '{"duration_minutes": 180}', 'active', now(), now()
FROM offers o WHERE o.title = 'Séjour Sousse & Sahel' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = o.id AND name = 'Visite du Ribat & Médina de Sousse');

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
SELECT gen_random_uuid(), o.id, 'Port de Pêche & Dégustation',
  'Visite du port de pêche de Sousse le matin, suivie d une dégustation de poissons grillés chez un pêcheur local.',
  'food', '{"duration_minutes": 150}', 'active', now(), now()
FROM offers o WHERE o.title = 'Séjour Sousse & Sahel' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = o.id AND name = 'Port de Pêche & Dégustation');

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
SELECT gen_random_uuid(), o.id, 'Plage & Détente',
  'Après-midi libre sur les plages de sable fin de Sousse. Baignade et détente.',
  'relaxation', '{"duration_minutes": 240}', 'active', now(), now()
FROM offers o WHERE o.title = 'Séjour Sousse & Sahel' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = o.id AND name = 'Plage & Détente');

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
SELECT gen_random_uuid(), o.id, 'Atelier Artisanat Sahel',
  'Initiation à la poterie et à la vannerie dans un atelier artisanal traditionnel du Sahel.',
  'workshop', '{"duration_minutes": 120}', 'active', now(), now()
FROM offers o WHERE o.title = 'Séjour Sousse & Sahel' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = o.id AND name = 'Atelier Artisanat Sahel');

-- Offer 3: Sahara Expedition Dunes & Oasis (for trip plan linking)
INSERT INTO offers (id, author_id, author_type, title, description, region, offer_type, status, latitude, longitude, address, meeting_point, meeting_lat, meeting_lng, category_id, price, confirmation_mode, location_type, created_at, updated_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner',
  'Expédition Sahara Dunes & Oasis',
  'Aventure dans le Grand Sud : dunes de Douz, oasis de Tozeur, Chott El Jerid. 3 jours de découverte du désert tunisien.',
  'Tozeur', 'circuit', 'approved',
  33.9197, 8.1335, 'Tozeur', 'Place Ibn Chabbat', 33.9197, 8.1335,
  '98bed090-080f-447f-b24b-19d4ca794c04', 550.00, 'automatic', 'fixed', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Expédition Sahara Dunes & Oasis');

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
SELECT gen_random_uuid(), o.id, 'Randonnée à Chameau Douz',
  'Randonnée à dos de chameau dans les dunes de Douz au coucher du soleil. Nuit en bivouac sous les étoiles.',
  'activity', '{"duration_minutes": 180}', 'active', now(), now()
FROM offers o WHERE o.title = 'Expédition Sahara Dunes & Oasis' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = o.id AND name = 'Randonnée à Chameau Douz');

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
SELECT gen_random_uuid(), o.id, 'Traversée Chott El Jerid',
  'Traversée du Chott El Jerid en 4x4 avec arrêts photo sur les paysages lunaires et les mirages.',
  'activity', '{"duration_minutes": 240}', 'active', now(), now()
FROM offers o WHERE o.title = 'Expédition Sahara Dunes & Oasis' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = o.id AND name = 'Traversée Chott El Jerid');

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
SELECT gen_random_uuid(), o.id, 'Visite Oasis Tozeur',
  'Découverte des oasis de Tozeur et du village de Chebika. Baignade dans les sources naturelles.',
  'visit', '{"duration_minutes": 180}', 'active', now(), now()
FROM offers o WHERE o.title = 'Expédition Sahara Dunes & Oasis' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = o.id AND name = 'Visite Oasis Tozeur');

-- ═══════════════════════════════════════════════════════════════════
-- 5. Add price entries for all new offer_items
-- ═══════════════════════════════════════════════════════════════════
DO $$
DECLARE
  item_rec RECORD;
BEGIN
  FOR item_rec IN
    SELECT oi.id, oi.name
    FROM offer_items oi
    JOIN offers o ON o.id = oi.offer_id
    WHERE o.title IN ('Visite Historique Kairouan', 'Séjour Sousse & Sahel', 'Expédition Sahara Dunes & Oasis')
    AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
    AND NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE offer_item_id = oi.id)
  LOOP
    INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, is_default, created_at)
    VALUES (gen_random_uuid(), item_rec.id,
      CASE
        WHEN item_rec.name LIKE '%Mosquée%' OR item_rec.name LIKE '%Ribat%' OR item_rec.name LIKE '%Port%' THEN 'Par personne'
        WHEN item_rec.name LIKE '%Dégustation%' THEN 'Par personne'
        WHEN item_rec.name LIKE '%Plage%' THEN 'Par personne'
        WHEN item_rec.name LIKE '%Atelier%' THEN 'Par personne'
        WHEN item_rec.name LIKE '%Chameau%' OR item_rec.name LIKE '%Traversée%' THEN 'Par personne'
        WHEN item_rec.name LIKE '%Oasis%' THEN 'Par personne'
        ELSE 'Par personne'
      END,
      CASE
        WHEN item_rec.name LIKE '%Mosquée%' THEN 35.00
        WHEN item_rec.name LIKE '%Dégustation%' THEN 25.00
        WHEN item_rec.name LIKE '%Ribat%' THEN 40.00
        WHEN item_rec.name LIKE '%Port%' THEN 55.00
        WHEN item_rec.name LIKE '%Plage%' THEN 0.00
        WHEN item_rec.name LIKE '%Atelier%' THEN 30.00
        WHEN item_rec.name LIKE '%Chameau%' THEN 120.00
        WHEN item_rec.name LIKE '%Traversée%' THEN 85.00
        WHEN item_rec.name LIKE '%Oasis%' THEN 45.00
        ELSE 50.00
      END,
      'TND', true, now());
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 6. Link trip_plan_items to actual offer_items (where offer_item_id IS NULL)
-- ═══════════════════════════════════════════════════════════════════
-- This updates the 37 items that only have notes to point to actual offer_items
-- based on keyword matching between the notes and offer item names

-- Link "Region par Region: Sousse, Kairouan, Tataouine" items
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000017'  -- J1-3 : Kairouan — grande mosquee
  AND oi.name = 'Grande Mosquée & Médina'
  AND o.title = 'Visite Historique Kairouan';

UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000018'  -- J4-7 : Sousse et Sahel
  AND oi.name = 'Visite du Ribat & Médina de Sousse'
  AND o.title = 'Séjour Sousse & Sahel';

UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000020'  -- J10-13 : Sud profond — Douz, Tozeur
  AND oi.name = 'Randonnée à Chameau Douz'
  AND o.title = 'Expédition Sahara Dunes & Oasis';

-- Link Tataouine items to existing Tataouine offers
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000019'  -- J8-9 : Tataouine — ksour
  AND oi.name = 'Randonnée Ksour (1 pers.)'
  AND o.title = 'Randonnée Guidée Ksour du Sud';

-- ═══════════════════════════════════════════════════════════════════
-- 7. Link other trip_plan_items to existing offers
-- ═══════════════════════════════════════════════════════════════════

-- Grand Tour Tunisien — J1-3 VTT → existing VTT/kayak offers
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000001'  -- J1-3 : VTT le long de la cote
  AND oi.name = 'Kayak Solo'
  AND o.title = 'Kayak de Mer Korba';

-- Grand Tour Tunisien — J4-6 Trek en foret de Kroumirie → Bungalow Forêt de Kroumirie
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000002'
  AND oi.name = 'Bungalow Double'
  AND o.title = 'Bungalow Forêt de Kroumirie';

-- Grand Tour Tunisien — J7-9 Djerba → Tour de l'île de Djerba
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000003'
  AND oi.name = 'Bungalow éco-lodge'
  AND o.title = 'Tour de l''île de Djerba';

-- Grand Tour Tunisien — J10-14 Aventure Grand Sud → Safari désert Tozeur
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000004'
  AND oi.name = 'Atelier poterie'
  AND o.title = 'Safari désert Tozeur';

-- Grand Tour Tunisien — J15-16 Oasis de Tozeur (use the new expedition offer)
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000005'
  AND oi.name = 'Visite Oasis Tozeur'
  AND o.title = 'Expédition Sahara Dunes & Oasis';

-- Grand Tour Tunisien — J17-18 Ksour de Tataouine
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000006'
  AND oi.name = 'Randonnée Ksour (1 pers.)'
  AND o.title = 'Randonnée Guidée Ksour du Sud';

-- Photo et Culture: De Tunis a Tozeur — J1-3 Kairouan et Sousse
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000008'
  AND oi.name = 'Grande Mosquée & Médina'
  AND o.title = 'Visite Historique Kairouan';

-- Photo et Culture: De Tunis a Tozeur — J7-10 Sahara
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000010'
  AND oi.name = 'Randonnée à Chameau Douz'
  AND o.title = 'Expédition Sahara Dunes & Oasis';

-- Photo et Culture: De Tunis a Tozeur — J11-13 Sahara avec guide
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000011'
  AND oi.name = 'Traversée Chott El Jerid'
  AND o.title = 'Expédition Sahara Dunes & Oasis';

-- Trek et Aventure Kroumirie — J1-2 VTT
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000014'
  AND oi.name = 'Kayak Solo'
  AND o.title = 'Kayak de Mer Korba';

-- Weekend Djerba-Kerkennah — J1-2 Djerba
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0002-0000-0000-000000000012'
  AND oi.name = 'Bungalow éco-lodge'
  AND o.title = 'Tour de l''île de Djerba';

-- Découverte Culturelle Djerba-Kerkennah — Tour guidé Houmt Souk
UPDATE trip_plan_items tpi
SET offer_item_id = oi.id
FROM offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tpi.id = '1a000000-0001-0000-0000-000000000003'
  AND oi.name = 'Menu terroir'
  AND o.title = 'Tour de l''île de Djerba';

-- ═══════════════════════════════════════════════════════════════════
-- 8. Create bookings for eco_travelers missing them
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_booking_id uuid;
  v_offer_item_id uuid;
  v_traveler_id uuid;
  v_offer_author_id uuid;
BEGIN
  -- Booking 1: f.a.k.e.r.b.e.n.n.o.o.m.e.n → Kairouan visit
  v_traveler_id := '4dbab9db-0d74-4726-8c1b-49f53ad64ea9';
  SELECT oi.id INTO v_offer_item_id FROM offer_items oi JOIN offers o ON o.id = oi.offer_id WHERE oi.name = 'Grande Mosquée & Médina' LIMIT 1;
  IF v_offer_item_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.traveler_id = v_traveler_id AND b.offer_item_id = v_offer_item_id) THEN
    SELECT gen_random_uuid() INTO v_booking_id;
    INSERT INTO bookings (id, booking_ref, status, total_price, currency, traveler_id, offer_id, offer_item_id, confirmation_mode, created_at, updated_at)
    VALUES (v_booking_id, 'BK-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6)),
      'confirmed', 35.00, 'TND', v_traveler_id,
      (SELECT o.id FROM offer_items oi2 JOIN offers o ON o.id = oi2.offer_id WHERE oi2.id = v_offer_item_id),
      v_offer_item_id, 'automatic', now(), now());
    INSERT INTO booking_participants (id, full_name, age, document_type, document_number, is_group_leader, booking_id)
    VALUES (gen_random_uuid(), 'Faker', 32, 'cin', '12345678', true, v_booking_id);
INSERT INTO notifications (id, user_id, type, title, body, link, created_at)
    VALUES (gen_random_uuid(), v_traveler_id, 'booking_confirmed', 'Réservation confirmée',
      'Votre visite à Kairouan est confirmée !', '/bookings', now());
    SELECT o.author_id INTO v_offer_author_id FROM offers o JOIN offer_items oi2 ON oi2.offer_id = o.id WHERE oi2.id = v_offer_item_id;
    INSERT INTO notifications (id, user_id, type, title, body, link, created_at)
    VALUES (gen_random_uuid(), v_offer_author_id, 'new_booking_request', 'Nouvelle réservation',
      'Un voyageur a réservé votre offre Visite Historique Kairouan.', '/dashboard/incoming', now());
  END IF;

  -- Booking 2: sarah.b.akerbennoomen → Sousse stay
  v_traveler_id := '90b4c5bf-4a47-4737-b033-f7385e22a2e6';
  SELECT oi.id INTO v_offer_item_id FROM offer_items oi JOIN offers o ON o.id = oi.offer_id WHERE oi.name = 'Visite du Ribat & Médina de Sousse' LIMIT 1;
  IF v_offer_item_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.traveler_id = v_traveler_id AND b.offer_item_id = v_offer_item_id) THEN
    SELECT gen_random_uuid() INTO v_booking_id;
    INSERT INTO bookings (id, booking_ref, status, total_price, currency, traveler_id, offer_id, offer_item_id, confirmation_mode, created_at, updated_at)
    VALUES (v_booking_id, 'BK-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6)),
      'confirmed', 40.00, 'TND', v_traveler_id,
      (SELECT o.id FROM offer_items oi2 JOIN offers o ON o.id = oi2.offer_id WHERE oi2.id = v_offer_item_id),
      v_offer_item_id, 'automatic', now(), now());
    INSERT INTO booking_participants (id, full_name, age, document_type, document_number, is_group_leader, booking_id)
    VALUES (gen_random_uuid(), 'Sarah Benali', 28, 'cin', '87654321', true, v_booking_id);
    INSERT INTO notifications (id, user_id, type, title, body, link, created_at)
    VALUES (gen_random_uuid(), v_traveler_id, 'booking_confirmed', 'Réservation Sousse confirmée',
      'Votre séjour à Sousse est confirmé !', '/bookings', now());
    SELECT o.author_id INTO v_offer_author_id FROM offers o JOIN offer_items oi2 ON oi2.offer_id = o.id WHERE oi2.id = v_offer_item_id;
    INSERT INTO notifications (id, user_id, type, title, body, link, created_at)
    VALUES (gen_random_uuid(), v_offer_author_id, 'new_booking_request', 'Nouvelle réservation Sousse',
      'Un voyageur a réservé votre offre Séjour Sousse & Sahel.', '/dashboard/incoming', now());
  END IF;

  -- Booking 3: l.eila.fakerbennoomen → Sahara expedition
  v_traveler_id := 'a602737a-b07d-4a41-b9c3-cdf1be17036a';
  SELECT oi.id INTO v_offer_item_id FROM offer_items oi JOIN offers o ON o.id = oi.offer_id WHERE oi.name = 'Randonnée à Chameau Douz' LIMIT 1;
  IF v_offer_item_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.traveler_id = v_traveler_id AND b.offer_item_id = v_offer_item_id) THEN
    SELECT gen_random_uuid() INTO v_booking_id;
    INSERT INTO bookings (id, booking_ref, status, total_price, currency, traveler_id, offer_id, offer_item_id, confirmation_mode, created_at, updated_at)
    VALUES (v_booking_id, 'BK-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6)),
      'confirmed', 120.00, 'TND', v_traveler_id,
      (SELECT o.id FROM offer_items oi2 JOIN offers o ON o.id = oi2.offer_id WHERE oi2.id = v_offer_item_id),
      v_offer_item_id, 'automatic', now(), now());
    INSERT INTO booking_participants (id, full_name, age, document_type, document_number, is_group_leader, booking_id)
    VALUES (gen_random_uuid(), 'Leila Mansour', 35, 'cin', '11223344', true, v_booking_id);
    INSERT INTO notifications (id, user_id, type, title, body, link, created_at)
    VALUES (gen_random_uuid(), v_traveler_id, 'booking_confirmed', 'Randonnée Sahara confirmée',
      'Votre randonnée à chameau à Douz est confirmée !', '/bookings', now());
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 9. Create notifications for pending users (welcome + offers)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO notifications (id, user_id, type, title, body, created_at)
SELECT gen_random_uuid(), u.id, 'system', 'Bienvenue sur Tourisme Durable !',
  'Bienvenue ' || COALESCE(e.full_name, '') || ' ! Votre compte voyageur est actif. Commencez à explorer les circuits et offres éco-responsables.',
  now()
FROM users u
JOIN eco_travelers e ON e.user_id = u.id
WHERE u.id IN ('053f8618-5b08-464d-a188-64adf9547735', 'fa57156b-10f5-460a-9b33-137129f6cb3e', '19761bd4-a85a-4099-9980-b80d0ccb5b07')
  AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = u.id AND n.type = 'system' AND n.title LIKE 'Bienvenue%');

INSERT INTO notifications (id, user_id, type, title, body, created_at)
SELECT gen_random_uuid(), 'dab65a25-7dfb-4150-b559-a5e367176af1', 'system', 'Bienvenue sur Tourisme Durable !',
  'Bienvenue Amira ! Votre compte porteur de projet est actif. Publiez vos offres et circuits pour attirer des voyageurs éco-responsables.',
  now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = 'dab65a25-7dfb-4150-b559-a5e367176af1' AND type = 'system' AND title LIKE 'Bienvenue%');

-- Notifications for eco_travelers who were missing some
INSERT INTO notifications (id, user_id, type, title, body, created_at)
SELECT gen_random_uuid(), '4dbab9db-0d74-4726-8c1b-49f53ad64ea9', 'system', 'Bienvenue Faker !',
  'Votre compte voyageur est actif. Explorez les offres et planifiez votre prochain voyage éco-responsable !',
  now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = '4dbab9db-0d74-4726-8c1b-49f53ad64ea9' AND type = 'system');

-- ═══════════════════════════════════════════════════════════════════
-- 10. Create reviews for eco_travelers missing them
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO reviews (id, author_id, target_id, target_type, rating, comment, created_at)
SELECT gen_random_uuid(), '4dbab9db-0d74-4726-8c1b-49f53ad64ea9', '87a38946-9a54-4bb4-be4a-887be312af15', 'guide', 4,
  'Super guide, très professionnel et sympathique !', now()
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE author_id = '4dbab9db-0d74-4726-8c1b-49f53ad64ea9' AND target_id = '87a38946-9a54-4bb4-be4a-887be312af15');

INSERT INTO reviews (id, author_id, target_id, target_type, rating, comment, created_at)
SELECT gen_random_uuid(), '4dbab9db-0d74-4726-8c1b-49f53ad64ea9', '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'guide', 5,
  'Karim est un guide exceptionnel. Il connaît le Sahara comme personne !', now()
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE author_id = '4dbab9db-0d74-4726-8c1b-49f53ad64ea9' AND target_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9');

-- ═══════════════════════════════════════════════════════════════════
-- 11. Update offer coordinates for offers missing them
-- ═══════════════════════════════════════════════════════════════════
UPDATE offers SET latitude = 35.6789, longitude = 10.1010
WHERE region ILIKE '%kairouan%' AND latitude IS NULL;

UPDATE offers SET latitude = 35.8256, longitude = 10.6411
WHERE region ILIKE '%sousse%' AND latitude IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 12. Create trip plans for pending eco_travelers
-- ═══════════════════════════════════════════════════════════════════

-- Trip plan for Sami (fakerbennoomen+1)
INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status, created_at, updated_at)
SELECT '55000000-0001-0000-0000-000000000026', '053f8618-5b08-464d-a188-64adf9547735',
  'Découverte Kairouan & Sousse',
  'Un week-end culturel à la découverte des trésors de Kairouan et Sousse.',
  '2026-08-15', '2026-08-17', 'planning', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE id = '55000000-0001-0000-0000-000000000026');

INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, notes, offer_item_id, created_at)
SELECT gen_random_uuid(), '55000000-0001-0000-0000-000000000026', 1, 1, 'Jour 1 : Visite de Kairouan', oi.id, now()
FROM offer_items oi WHERE oi.name = 'Grande Mosquée & Médina'
AND NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE trip_plan_id = '55000000-0001-0000-0000-000000000026' AND day_number = 1);

INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, notes, offer_item_id, created_at)
SELECT gen_random_uuid(), '55000000-0001-0000-0000-000000000026', 2, 1, 'Jour 2 : Sousse Médina', oi.id, now()
FROM offer_items oi WHERE oi.name = 'Visite du Ribat & Médina de Sousse'
AND NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE trip_plan_id = '55000000-0001-0000-0000-000000000026' AND day_number = 2);

-- Trip plan for Mariam (k.arim.fakerbennoomen+1)
INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status, created_at, updated_at)
SELECT '55000000-0001-0000-0000-000000000027', 'fa57156b-10f5-460a-9b33-137129f6cb3e',
  'Séjour Nature Sahel',
  'Un séjour détente en famille dans le Sahel tunisien entre plages et artisanat.',
  '2026-09-01', '2026-09-04', 'draft', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE id = '55000000-0001-0000-0000-000000000027');

INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, notes, offer_item_id, created_at)
SELECT gen_random_uuid(), '55000000-0001-0000-0000-000000000027', 1, 1, 'Jour 1 : Arrivée à Sousse et plage', oi.id, now()
FROM offer_items oi WHERE oi.name = 'Plage & Détente'
AND NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE trip_plan_id = '55000000-0001-0000-0000-000000000027' AND day_number = 1);

INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, notes, offer_item_id, created_at)
SELECT gen_random_uuid(), '55000000-0001-0000-0000-000000000027', 2, 1, 'Jour 2 : Atelier poterie en famille', oi.id, now()
FROM offer_items oi WHERE oi.name = 'Atelier Artisanat Sahel'
AND NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE trip_plan_id = '55000000-0001-0000-0000-000000000027' AND day_number = 2);

-- Trip plan for Omar (k.arim.fakerbennoomen)
INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status, created_at, updated_at)
SELECT '55000000-0001-0000-0000-000000000028', '19761bd4-a85a-4099-9980-b80d0ccb5b07',
  'Photo Safari Sahara',
  'Un voyage photo à travers le Grand Sud : des dunes de Douz aux oasis de Tozeur.',
  '2026-10-01', '2026-10-05', 'planning', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE id = '55000000-0001-0000-0000-000000000028');

INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, notes, offer_item_id, created_at)
SELECT gen_random_uuid(), '55000000-0001-0000-0000-000000000028', 1, 1, 'Jour 1 : Randonnée chameau Douz', oi.id, now()
FROM offer_items oi WHERE oi.name = 'Randonnée à Chameau Douz'
AND NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE trip_plan_id = '55000000-0001-0000-0000-000000000028' AND day_number = 1);

INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, notes, offer_item_id, created_at)
SELECT gen_random_uuid(), '55000000-0001-0000-0000-000000000028', 2, 1, 'Jour 2 : Traversée Chott El Jerid', oi.id, now()
FROM offer_items oi WHERE oi.name = 'Traversée Chott El Jerid'
AND NOT EXISTS (SELECT 1 FROM trip_plan_items WHERE trip_plan_id = '55000000-0001-0000-0000-000000000028' AND day_number = 2);

-- ═══════════════════════════════════════════════════════════════════
-- 13. Create offers + circuit for the new project owner (Amira)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO offers (id, author_id, author_type, title, description, region, offer_type, status, latitude, longitude, address, category_id, price, created_at, updated_at)
SELECT gen_random_uuid(), 'dab65a25-7dfb-4150-b559-a5e367176af1', 'project_owner',
  'Randonnée Sahel Méditerranéen',
  'Une randonnée guidée le long de la côte du Sahel, entre Monastir et Mahdia. Découverte des falaises, criques et villages de pêcheurs.',
  'Sousse', 'activity', 'approved',
  35.7600, 10.7700, 'Monastir - Mahdia',
  '21a655e0-de08-4b62-b0da-7c5337fd93be', 80.00, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE author_id = 'dab65a25-7dfb-4150-b559-a5e367176af1' AND title = 'Randonnée Sahel Méditerranéen');

INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
SELECT gen_random_uuid(), o.id, 'Randonnée Côtière (1 pers.)',
  'Randonnée de 6km le long des falaises avec arrêts baignade. Encadrée par un guide local.',
  'activity', '{"duration_minutes": 240}', 'active', now(), now()
FROM offers o WHERE o.title = 'Randonnée Sahel Méditerranéen' AND o.author_id = 'dab65a25-7dfb-4150-b559-a5e367176af1'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = o.id AND name = 'Randonnée Côtière (1 pers.)');

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, is_default, created_at)
SELECT gen_random_uuid(), oi.id, 'Par personne', 80.00, 'TND', true, now()
FROM offer_items oi JOIN offers o ON o.id = oi.offer_id
WHERE oi.name = 'Randonnée Côtière (1 pers.)' AND o.author_id = 'dab65a25-7dfb-4150-b559-a5e367176af1'
AND NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE offer_item_id = oi.id);

-- Circuit for Amira
INSERT INTO circuits (id, author_id, author_type, title, description, region, lat, lng, duration_days, base_price, currency, difficulty_level, status, created_at, updated_at)
SELECT gen_random_uuid(), 'dab65a25-7dfb-4150-b559-a5e367176af1', 'project_owner',
  'Circuit Sahel Historique',
  'Un circuit de 3 jours à travers les sites historiques du Sahel : Monastir, Mahdia et El Jem.',
  'Sousse', 35.7500, 10.7200, 3, 350.00, 'TND', 'easy', 'approved', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM circuits WHERE author_id = 'dab65a25-7dfb-4150-b559-a5e367176af1' AND title = 'Circuit Sahel Historique');

-- ═══════════════════════════════════════════════════════════════════
-- 14. Admin notifications
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO notifications (id, user_id, type, title, body, created_at)
SELECT gen_random_uuid(), 'faf06ea0-3c4a-4cff-b180-5ff4bedab682', 'system', 'Nouveaux inscrits sur la plateforme',
  '4 nouveaux utilisateurs se sont inscrits et sont actifs. Consultez le tableau de bord administrateur.',
  now()
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = 'faf06ea0-3c4a-4cff-b180-5ff4bedab682' AND type = 'system' AND title LIKE 'Nouveaux inscrits%');

-- ═══════════════════════════════════════════════════════════════════
-- 15. Publish the "Region par Region" trip plan (change from draft to planning)
-- ═══════════════════════════════════════════════════════════════════
UPDATE trip_plans SET status = 'planning', updated_at = now()
WHERE id = '19000000-0002-0000-0000-000000000005' AND status = 'draft';

COMMIT;

-- ═══════════════════════════════════════════════════════════════════
-- Seed 005 — Realistic user data
-- ═══════════════════════════════════════════════════════════════════
-- Users ciblés :
--  • fakerbennoomen@gmail.com  (92a3ba7f-...) → project_owner
--  • f.akerbennoomen@gmail.com (7b83e87d-...) → eco_traveler
--  • k.arim.amirbennoomen@gmail.com (6fb2d1e7-...) → guide Karim
--  • y.m.eslek.amirbennoomen@gmail.com (87a38946-...) → guide Youssef
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Guide Offerings supplémentaires pour Karim Bouazizi ────────

-- 1a. "Randonnée Ksour du Sud" (all_tunisia, on_demand)
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, service_zone_type, displacement_allowed, displacement_max_km, status, created_at, updated_at)
SELECT gen_random_uuid(), '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'Randonnée Ksour du Sud',
  'Découverte des ksour berbères du Sud tunisien : Ksar Ouled Soltane, Ksar Hadada, Ksar Ghilane. Nuits chez l''habitant.',
  'fr,ar,en', 180, 'day', 'all_tunisia', true, 200, 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM guide_offerings WHERE guide_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9' AND title = 'Randonnée Ksour du Sud');

INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, is_active, created_at)
SELECT gen_random_uuid(), id, 'on_demand', true, now()
FROM guide_offerings WHERE guide_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9' AND title = 'Randonnée Ksour du Sud'
AND NOT EXISTS (SELECT 1 FROM guide_offering_availability_rules WHERE guide_offering_id = guide_offerings.id);

-- 1b. "Safari Photo Désert 2 jours" (point Djerba, date_range sep-nov)
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, service_zone_type, lat, lng, radius_km, displacement_allowed, displacement_max_km, status, created_at, updated_at)
SELECT gen_random_uuid(), '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'Safari Photo Désert 2 jours',
  'Expédition photo de 2 jours dans le Grand Erg Oriental. Nuits en bivouac. Matériel photo optionnel.',
  'fr,ar,en,es', 350, 'trip', 'point', 33.8085, 10.9905, 80, true, 150, 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM guide_offerings WHERE guide_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9' AND title = 'Safari Photo Désert 2 jours');

INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, start_date, end_date, weekdays, is_active, created_at)
SELECT gen_random_uuid(), id, 'date_range', '2026-09-01', '2026-11-30', '0,1,2,3,4,5,6', true, now()
FROM guide_offerings WHERE guide_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9' AND title = 'Safari Photo Désert 2 jours'
AND NOT EXISTS (SELECT 1 FROM guide_offering_availability_rules WHERE guide_offering_id = guide_offerings.id AND availability_type = 'date_range');

-- ── 2. Guide Offerings supplémentaires pour Youssef Meslek ────────

-- 2a. "Tour Guidé Djerba Insolite" (point, weekly)
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, service_zone_type, lat, lng, displacement_allowed, displacement_max_km, status, created_at, updated_at)
SELECT gen_random_uuid(), '87a38946-9a54-4bb4-be4a-887be312af15', 'Tour Guidé Djerba Insolite',
  'Visite des lieux cachés de Djerba : ateliers d''artisans, synagogues, marchés locaux, dégustation de produits du terroir.',
  'fr,ar,en', 80, 'half_day', 'point', 33.875, 10.86, true, 30, 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM guide_offerings WHERE guide_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND title = 'Tour Guidé Djerba Insolite');

INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, weekdays, start_time, end_time, is_active, created_at)
SELECT gen_random_uuid(), id, 'weekly', '1,3,5', '09:00', '13:00', true, now()
FROM guide_offerings WHERE guide_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND title = 'Tour Guidé Djerba Insolite'
AND NOT EXISTS (SELECT 1 FROM guide_offering_availability_rules WHERE guide_offering_id = guide_offerings.id AND availability_type = 'weekly' AND weekdays = '1,3,5');

INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, weekdays, start_time, end_time, is_active, created_at)
SELECT gen_random_uuid(), id, 'weekly', '2,4', '14:00', '18:00', true, now()
FROM guide_offerings WHERE guide_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND title = 'Tour Guidé Djerba Insolite'
AND NOT EXISTS (SELECT 1 FROM guide_offering_availability_rules WHERE guide_offering_id = guide_offerings.id AND availability_type = 'weekly' AND weekdays = '2,4');

-- 2b. "Expédition VTT Forêt de Kroumirie" (radius, on_demand)
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, service_zone_type, lat, lng, radius_km, displacement_allowed, displacement_max_km, status, created_at, updated_at)
SELECT gen_random_uuid(), '87a38946-9a54-4bb4-be4a-887be312af15', 'Expédition VTT Forêt de Kroumirie',
  'Descente VTT à travers la forêt de chênes-lièges de Kroumirie. Niveau intermédiaire à avancé. VTT et équipement fournis.',
  'fr,en', 130, 'day', 'radius', 36.7837, 8.6865, 40, true, 80, 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM guide_offerings WHERE guide_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND title = 'Expédition VTT Forêt de Kroumirie');

INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, is_active, created_at)
SELECT gen_random_uuid(), id, 'on_demand', true, now()
FROM guide_offerings WHERE guide_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND title = 'Expédition VTT Forêt de Kroumirie'
AND NOT EXISTS (SELECT 1 FROM guide_offering_availability_rules WHERE guide_offering_id = guide_offerings.id AND availability_type = 'on_demand');

-- 2c. "Initiation Spéléologie Djerba" (point, weekly)
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, service_zone_type, lat, lng, displacement_allowed, status, created_at, updated_at)
SELECT gen_random_uuid(), '87a38946-9a54-4bb4-be4a-887be312af15', 'Initiation Spéléologie Djerba',
  'Découverte des grottes et cavités naturelles de l''île de Djerba. Matériel fourni. Débutants bienvenus.',
  'fr,ar', 70, 'half_day', 'point', 33.82, 10.87, false, 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM guide_offerings WHERE guide_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND title = 'Initiation Spéléologie Djerba');

INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, weekdays, start_time, end_time, is_active, created_at)
SELECT gen_random_uuid(), id, 'weekly', '3,6', '08:00', '12:00', true, now()
FROM guide_offerings WHERE guide_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND title = 'Initiation Spéléologie Djerba'
AND NOT EXISTS (SELECT 1 FROM guide_offering_availability_rules WHERE guide_offering_id = guide_offerings.id AND availability_type = 'weekly' AND weekdays = '3,6');

-- ── 3. Nouvelles offres mobiles pour fakerbennoomen@gmail.com ──────
-- Projet : Coopérative Artisanale Tataouine (b1822765-...)

-- 3a. Randonnée Guidée Ksour du Sud (mobile, guided_tour)
INSERT INTO offers (id, author_id, author_type, project_id, title, description, price, duration, offer_type, region, location_type, latitude, longitude, category_id, status, confirmation_mode, created_at, updated_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', 'b1822765-564a-470c-832b-3092cc763554',
  'Randonnée Guidée Ksour du Sud',
  'Randonnée accompagnée par un guide local à travers les ksour du Sud. Transport, repas et guide inclus.',
  250, '2 jours', 'activity', 'Tataouine', 'mobile', 33.5451, 7.757,
  (SELECT id FROM offer_categories WHERE slug = 'activity'), 'approved', 'automatic', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Randonnée Guidée Ksour du Sud');

-- Item + price
INSERT INTO offer_items (id, offer_id, name, item_type, status, created_at, updated_at)
SELECT gen_random_uuid(), id, 'Randonnée Ksour (1 pers.)', 'guided_tour', 'active', now(), now()
FROM offers WHERE title = 'Randonnée Guidée Ksour du Sud' AND author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = offers.id AND name = 'Randonnée Ksour (1 pers.)');

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status, created_at)
SELECT gen_random_uuid(), oi.id, 'Adulte', 250, 'TND', 'per_person', true, 'active', now()
FROM offer_items oi JOIN offers o ON o.id = oi.offer_id
WHERE o.title = 'Randonnée Guidée Ksour du Sud' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND oi.name = 'Randonnée Ksour (1 pers.)'
AND NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE offer_item_id = oi.id AND label = 'Adulte');

-- 3b. Atelier Poterie Mobile Tataouine (mobile, workshop)
INSERT INTO offers (id, author_id, author_type, project_id, title, description, price, duration, offer_type, region, location_type, latitude, longitude, category_id, status, confirmation_mode, created_at, updated_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', 'b1822765-564a-470c-832b-3092cc763554',
  'Atelier Poterie Mobile Tataouine',
  'Atelier poterie qui se déplace chez vous (hôtel, gîte). Initiation aux techniques ancestrales. Matériel fourni.',
  60, '3h', 'workshop', 'Tataouine', 'mobile', 33.5451, 7.757,
  (SELECT id FROM offer_categories WHERE slug = 'workshop'), 'approved', 'automatic', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Atelier Poterie Mobile Tataouine');

INSERT INTO offer_items (id, offer_id, name, item_type, status, created_at, updated_at)
SELECT gen_random_uuid(), id, 'Atelier Poterie Adulte', 'workshop', 'active', now(), now()
FROM offers WHERE title = 'Atelier Poterie Mobile Tataouine' AND author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = offers.id AND name = 'Atelier Poterie Adulte');

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status, created_at)
SELECT gen_random_uuid(), oi.id, 'Adulte', 60, 'TND', 'per_person', true, 'active', now()
FROM offer_items oi JOIN offers o ON o.id = oi.offer_id
WHERE o.title = 'Atelier Poterie Mobile Tataouine' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND oi.name = 'Atelier Poterie Adulte'
AND NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE offer_item_id = oi.id AND label = 'Adulte');

-- 3c. Séjour Immersion Tataouine (fixed, sejour)
INSERT INTO offers (id, author_id, author_type, project_id, title, description, price, duration, offer_type, region, location_type, meeting_point, meeting_lat, meeting_lng, category_id, status, confirmation_mode, created_at, updated_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'project_owner', 'b1822765-564a-470c-832b-3092cc763554',
  'Séjour Immersion Tataouine',
  'Séjour tout compris de 5 jours : hébergement chez l''habitant, randonnées, ateliers artisanaux, cuisine locale.',
  750, '5 jours', 'sejour', 'Tataouine', 'fixed', 'Centre-ville, Tataouine', 33.5451, 7.757,
  (SELECT id FROM offer_categories WHERE slug = 'sejour'), 'approved', 'automatic', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND title = 'Séjour Immersion Tataouine');

INSERT INTO offer_items (id, offer_id, name, item_type, status, created_at, updated_at)
SELECT gen_random_uuid(), id, 'Séjour 5 jours (1 pers.)', 'package', 'active', now(), now()
FROM offers WHERE title = 'Séjour Immersion Tataouine' AND author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = offers.id AND name = 'Séjour 5 jours (1 pers.)');

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status, created_at)
SELECT gen_random_uuid(), oi.id, 'Adulte', 750, 'TND', 'per_person', true, 'active', now()
FROM offer_items oi JOIN offers o ON o.id = oi.offer_id
WHERE o.title = 'Séjour Immersion Tataouine' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND oi.name = 'Séjour 5 jours (1 pers.)'
AND NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE offer_item_id = oi.id AND label = 'Adulte');

INSERT INTO offer_items (id, offer_id, name, item_type, status, created_at, updated_at)
SELECT gen_random_uuid(), id, 'Repas végétarien (option)', 'meal', 'active', now(), now()
FROM offers WHERE title = 'Séjour Immersion Tataouine' AND author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (SELECT 1 FROM offer_items WHERE offer_id = offers.id AND name = 'Repas végétarien (option)');

INSERT INTO offer_item_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default, status, created_at)
SELECT gen_random_uuid(), oi.id, 'Repas supplément', 25, 'TND', 'per_unit', false, 'active', now()
FROM offer_items oi JOIN offers o ON o.id = oi.offer_id
WHERE o.title = 'Séjour Immersion Tataouine' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND oi.name = 'Repas végétarien (option)'
AND NOT EXISTS (SELECT 1 FROM offer_item_prices WHERE offer_item_id = oi.id AND label = 'Repas supplément');

-- ── 4. Trip Plans pour f.akerbennoomen@gmail.com (eco_traveler) ───

-- 4a. Road Trip Sud Tunisien — Juillet 2026
INSERT INTO trip_plans (id, title, description, start_date, end_date, status, eco_traveler_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Road Trip Sud Tunisien — Juillet 2026',
  'Plan de 7 jours combinant randonnée dans les ksour, atelier poterie, et guidage avec Karim Bouazizi.',
  '2026-07-15', '2026-07-21', 'planning', '7b83e87d-276d-4d89-bb00-ab8ea1243a14', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE eco_traveler_id = '7b83e87d-276d-4d89-bb00-ab8ea1243a14' AND title = 'Road Trip Sud Tunisien — Juillet 2026');

-- Items for this trip plan (linked to offer_items)
INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, offer_item_id, notes, created_at)
SELECT gen_random_uuid(), tp.id, 1, 1, oi.id,
  'RDV 8h au centre-ville. Prévoir chaussures de marche et eau.', now()
FROM trip_plans tp
CROSS JOIN offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tp.title = 'Road Trip Sud Tunisien — Juillet 2026'
  AND o.title = 'Randonnée Guidée Ksour du Sud'
  AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
  AND oi.name = 'Randonnée Ksour (1 pers.)'
  AND NOT EXISTS (
    SELECT 1 FROM trip_plan_items tpi2
    WHERE tpi2.trip_plan_id = tp.id AND tpi2.day_number = 1 AND tpi2.sort_order = 1
  );

INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, offer_item_id, notes, created_at)
SELECT gen_random_uuid(), tp.id, 3, 1, oi.id,
  'Après-midi. L''artisan se déplace à l''hébergement.', now()
FROM trip_plans tp
CROSS JOIN offer_items oi
JOIN offers o ON o.id = oi.offer_id
WHERE tp.title = 'Road Trip Sud Tunisien — Juillet 2026'
  AND o.title = 'Atelier Poterie Mobile Tataouine'
  AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
  AND oi.name = 'Atelier Poterie Adulte'
  AND NOT EXISTS (
    SELECT 1 FROM trip_plan_items tpi2
    WHERE tpi2.trip_plan_id = tp.id AND tpi2.day_number = 3 AND tpi2.sort_order = 1
  );

-- Guide offering items as notes
INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, guide_id, notes, created_at)
SELECT gen_random_uuid(), tp.id, 2, 1, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9',
  'Guidage: Randonnée Ksour du Sud avec Karim Bouazizi. 180 TND/jour. Départ 7h de l''hébergement.', now()
FROM trip_plans tp
WHERE tp.title = 'Road Trip Sud Tunisien — Juillet 2026'
  AND NOT EXISTS (
    SELECT 1 FROM trip_plan_items tpi2
    WHERE tpi2.trip_plan_id = tp.id AND tpi2.day_number = 2 AND tpi2.sort_order = 1
  );

INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, guide_id, notes, created_at)
SELECT gen_random_uuid(), tp.id, 5, 1, '87a38946-9a54-4bb4-be4a-887be312af15',
  'Guidage: Tour Guidé Djerba Insolite avec Youssef Meslek. 80 TND/demi-journée. RDV 9h place de la mairie de Houmt Souk.', now()
FROM trip_plans tp
WHERE tp.title = 'Road Trip Sud Tunisien — Juillet 2026'
  AND NOT EXISTS (
    SELECT 1 FROM trip_plan_items tpi2
    WHERE tpi2.trip_plan_id = tp.id AND tpi2.day_number = 5 AND tpi2.sort_order = 1
  );

-- 4b. Weekend Art & Nature Djerba (pour Sarah)
INSERT INTO trip_plans (id, title, description, start_date, end_date, status, eco_traveler_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Week-end Art & Nature Djerba',
  '2 jours pour découvrir l''artisanat djerbien et les paysages naturels avec un guide local.',
  '2026-08-10', '2026-08-11', 'planning', '90b4c5bf-4a47-4737-b033-f7385e22a2e6', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE eco_traveler_id = '90b4c5bf-4a47-4737-b033-f7385e22a2e6' AND title = 'Week-end Art & Nature Djerba');

INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, guide_id, notes, created_at)
SELECT gen_random_uuid(), tp.id, 1, 1, '87a38946-9a54-4bb4-be4a-887be312af15',
  'Visite guidée de Houmt Souk avec Youssef Meslek — rendez-vous 9h place de la mairie.', now()
FROM trip_plans tp
WHERE tp.title = 'Week-end Art & Nature Djerba'
  AND NOT EXISTS (
    SELECT 1 FROM trip_plan_items tpi2
    WHERE tpi2.trip_plan_id = tp.id AND tpi2.day_number = 1 AND tpi2.sort_order = 1
  );

-- 4c. Aventure Photo Désert & Ksour (pour Leila)
INSERT INTO trip_plans (id, title, description, start_date, end_date, status, eco_traveler_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Aventure Photo Désert & Ksour',
  'Safari photo de 5 jours : Matmata, Tataouine, Douz. Guidé par Karim Bouazizi.',
  '2026-10-01', '2026-10-05', 'planning', 'a602737a-b07d-4a41-b9c3-cdf1be17036a', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM trip_plans WHERE eco_traveler_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a' AND title = 'Aventure Photo Désert & Ksour');

INSERT INTO trip_plan_items (id, trip_plan_id, day_number, sort_order, guide_id, notes, created_at)
SELECT gen_random_uuid(), tp.id, 2, 1, '6fb2d1e7-39db-4152-b9b5-5b440f551cc9',
  'Safari Photo Désert avec Karim — départ 6h de l''hôtel. Prévoir batteries de rechange !', now()
FROM trip_plans tp
WHERE tp.title = 'Aventure Photo Désert & Ksour'
  AND NOT EXISTS (
    SELECT 1 FROM trip_plan_items tpi2
    WHERE tpi2.trip_plan_id = tp.id AND tpi2.day_number = 2 AND tpi2.sort_order = 1
  );

-- ── 5. Reviews (avis) ────────────────────────────────────────

-- 5a. Avis sur Karim Bouazizi (guide) par Ahmed
INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
SELECT gen_random_uuid(), 'b09808ee-30a9-4089-bbf7-698e73004ef4', 'guide', '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 5,
  'Guide exceptionnel ! Karim connaît le désert comme personne. Son safari photo était incroyable, il sait exactement où trouver les meilleurs angles au coucher du soleil.', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM reviews WHERE author_id = 'b09808ee-30a9-4089-bbf7-698e73004ef4' AND target_type = 'guide' AND target_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9'
);

-- 5b. Avis sur guide_offering de Karim par Ahmed
INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
SELECT gen_random_uuid(), 'b09808ee-30a9-4089-bbf7-698e73004ef4', 'guide_offering', go.id, 5,
  'Le trekking dans les ksour était une expérience inoubliable. Karim nous a raconté l''histoire de chaque ksar avec passion.', now(), now()
FROM guide_offerings go
WHERE go.guide_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9' AND go.title = 'Randonnée Ksour du Sud'
AND NOT EXISTS (
  SELECT 1 FROM reviews WHERE author_id = 'b09808ee-30a9-4089-bbf7-698e73004ef4' AND target_type = 'guide_offering' AND target_id = go.id::text
);

-- 5c. Avis sur Youssef Meslek (guide) par Sarah
INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
SELECT gen_random_uuid(), '90b4c5bf-4a47-4737-b033-f7385e22a2e6', 'guide', '87a38946-9a54-4bb4-be4a-887be312af15', 5,
  'Youssef est un guide passionné et très professionnel. Sa visite de Djerba était riche en anecdotes et en découvertes. Je recommande à 100% !', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM reviews WHERE author_id = '90b4c5bf-4a47-4737-b033-f7385e22a2e6' AND target_type = 'guide' AND target_id = '87a38946-9a54-4bb4-be4a-887be312af15'
);

-- 5d. Avis sur guide_offering de Youssef par Sarah
INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
SELECT gen_random_uuid(), '90b4c5bf-4a47-4737-b033-f7385e22a2e6', 'guide_offering', go.id, 4,
  'Très belle randonnée. Les paysages étaient magnifiques. Seul bémol : prévoir plus de temps pour profiter des arrêts photo.', now(), now()
FROM guide_offerings go
WHERE go.guide_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND go.title = 'Tour Guidé Djerba Insolite'
AND NOT EXISTS (
  SELECT 1 FROM reviews WHERE author_id = '90b4c5bf-4a47-4737-b033-f7385e22a2e6' AND target_type = 'guide_offering' AND target_id = go.id::text
);

-- 5e. Avis sur offre mobile "Randonnée Guidée Ksour du Sud" par Leila
INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
SELECT gen_random_uuid(), 'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'offer', o.id, 5,
  'Superbe randonnée organisée de A à Z. Le guide local était très connaisseur et le repas chez l''habitant délicieux. Le transport inclus est un plus.', now(), now()
FROM offers o
WHERE o.title = 'Randonnée Guidée Ksour du Sud' AND o.author_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
AND NOT EXISTS (
  SELECT 1 FROM reviews WHERE author_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a' AND target_type = 'offer' AND target_id = o.id::text
);

-- 5f. Avis sur fakerbennoomen (project_owner) par Ahmed
INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
SELECT gen_random_uuid(), 'b09808ee-30a9-4089-bbf7-698e73004ef4', 'project_owner', '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 4,
  'Très bon organisateur. Les activités étaient variées et bien planifiées. Un peu de retard le premier jour mais sinon tout était parfait.', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM reviews WHERE author_id = 'b09808ee-30a9-4089-bbf7-698e73004ef4' AND target_type = 'project_owner' AND target_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e'
);

-- 5g. Avis supplémentaire sur "Safari Photo Désert 2 jours" (Karim) par Leila
INSERT INTO reviews (id, author_id, target_type, target_id, rating, comment, created_at, updated_at)
SELECT gen_random_uuid(), 'a602737a-b07d-4a41-b9c3-cdf1be17036a', 'guide_offering', go.id, 5,
  'Le safari photo de 2 jours était magique. Nuits en bivouac sous les étoiles, lever de soleil sur les dunes. Karim est un photographe talentueux.', now(), now()
FROM guide_offerings go
WHERE go.guide_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9' AND go.title = 'Safari Photo Désert 2 jours'
AND NOT EXISTS (
  SELECT 1 FROM reviews WHERE author_id = 'a602737a-b07d-4a41-b9c3-cdf1be17036a' AND target_type = 'guide_offering' AND target_id = go.id::text
);

-- ── 6. Notifications ───────────────────────────────────────────

INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at)
SELECT gen_random_uuid(), '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', 'new_review', 'Nouvel avis 5★',
  'Ahmed a laissé un avis sur votre profil guide.',
  '/profile/guide/6fb2d1e7-39db-4152-b9b5-5b440f551cc9', false, now()
WHERE NOT EXISTS (
  SELECT 1 FROM notifications WHERE user_id = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9' AND type = 'new_review' AND title LIKE 'Nouvel avis%'
);

INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at)
SELECT gen_random_uuid(), '87a38946-9a54-4bb4-be4a-887be312af15', 'new_review', 'Nouvel avis 5★',
  'Sarah a laissé un avis sur votre profil guide.',
  '/profile/guide/87a38946-9a54-4bb4-be4a-887be312af15', false, now()
WHERE NOT EXISTS (
  SELECT 1 FROM notifications WHERE user_id = '87a38946-9a54-4bb4-be4a-887be312af15' AND type = 'new_review' AND title LIKE 'Nouvel avis%'
);

INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at)
SELECT gen_random_uuid(), '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', 'new_review', 'Nouvel avis 4★',
  'Ahmed a laissé un avis sur votre profil.',
  '/profile/project-owner/92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', false, now()
WHERE NOT EXISTS (
  SELECT 1 FROM notifications WHERE user_id = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e' AND type = 'new_review' AND title LIKE 'Nouvel avis%'
);

COMMIT;

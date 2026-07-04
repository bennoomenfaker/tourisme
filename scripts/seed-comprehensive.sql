-- ============================================================================
-- EcoVoyage — Seed complet avec utilisateurs, offres, circuits, trip plans
-- ============================================================================
-- Usage Docker :
--   docker exec -i tourisme-db-1 psql -U marammejri -d tourism_db < scripts/seed-comprehensive.sql
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  -- ── Fakher Bennomen (project owner - 3 email variants) ──
  v_faker1_id  UUID := 'f0000000-0000-0000-0000-000000000001';
  v_faker2_id  UUID := 'f0000000-0000-0000-0000-000000000002';
  v_faker3_id  UUID := 'f0000000-0000-0000-0000-000000000003';

  -- ── Other users ──
  v_admin_id    UUID := 'f0000000-0000-0000-0000-000000000010';
  v_guide1_id   UUID := 'f0000000-0000-0000-0000-000000000011';
  v_guide2_id   UUID := 'f0000000-0000-0000-0000-000000000012';
  v_owner1_id   UUID := 'f0000000-0000-0000-0000-000000000013';
  v_traveler1   UUID := 'f0000000-0000-0000-0000-000000000014';
  v_traveler2   UUID := 'f0000000-0000-0000-0000-000000000015';

  -- ── Offer UUIDs ──
  v_off_heberg  UUID := 'f1000000-0000-0000-0000-000000000001';
  v_off_transp  UUID := 'f1000000-0000-0000-0000-000000000002';
  v_off_atelier UUID := 'f1000000-0000-0000-0000-000000000003';
  v_off_randon  UUID := 'f1000000-0000-0000-0000-000000000004';
  v_off_artisan UUID := 'f1000000-0000-0000-0000-000000000005';
  v_off_restau  UUID := 'f1000000-0000-0000-0000-000000000006';
  v_off_guide   UUID := 'f1000000-0000-0000-0000-000000000007';
  v_off_kayak   UUID := 'f1000000-0000-0000-0000-000000000008';

  -- ── Item UUIDs ──
  v_item_chambre  UUID := 'f2000000-0000-0000-0000-000000000001';
  v_item_dortoir  UUID := 'f2000000-0000-0000-0000-000000000002';
  v_item_tente    UUID := 'f2000000-0000-0000-0000-000000000003';
  v_item_van      UUID := 'f2000000-0000-0000-0000-000000000004';
  v_item_poterie  UUID := 'f2000000-0000-0000-0000-000000000005';
  v_item_randonnee UUID := 'f2000000-0000-0000-0000-000000000006';
  v_item_tapis    UUID := 'f2000000-0000-0000-0000-000000000007';
  v_item_couscous UUID := 'f2000000-0000-0000-0000-000000000008';

  -- ── Circuit UUIDs ──
  v_circ_djerba  UUID := 'f3000000-0000-0000-0000-000000000001';
  v_circ_nord    UUID := 'f3000000-0000-0000-0000-000000000002';
  v_circ_sud     UUID := 'f3000000-0000-0000-0000-000000000003';
  v_circ_kairouan UUID := 'f3000000-0000-0000-0000-000000000004';

  -- ── Trip plan UUIDs ──
  v_trip1_id UUID := 'f4000000-0000-0000-0000-000000000001';
  v_trip2_id UUID := 'f4000000-0000-0000-0000-000000000002';

  -- ── Notification UUIDs ──
  v_notif1 UUID := 'f5000000-0000-0000-0000-000000000001';
  v_notif2 UUID := 'f5000000-0000-0000-0000-000000000002';
  v_notif3 UUID := 'f5000000-0000-0000-0000-000000000003';
  v_notif4 UUID := 'f5000000-0000-0000-0000-000000000004';

  v_pwhash TEXT;

BEGIN
  -- Hash consistent pour tous : "Test1234!"
  v_pwhash := crypt('Test1234!', gen_salt('bf', 10));

  -- ==========================================================================
  -- 1. USERS (covers: active, pending, all roles)
  -- ==========================================================================
  INSERT INTO users (id, email, password, auth_method, role, status, email_verified_at, created_at, updated_at) VALUES
    (v_faker1_id, 'fakerbennomen@gmail.com',  v_pwhash, 'email', 'project',       'active',  NOW(), NOW(), NOW()) ON CONFLICT (email) DO NOTHING,
    (v_faker2_id, 'f.akerbennomen@gmail.com',   v_pwhash, 'email', 'project',       'active',  NOW(), NOW(), NOW()) ON CONFLICT (email) DO NOTHING,
    (v_faker3_id, 'fa.kerbennomen@gmail.com',  v_pwhash, 'email', 'guide',         'active',  NOW(), NOW(), NOW()) ON CONFLICT (email) DO NOTHING,
    (v_admin_id,   'admin-fcomprehensive@ecovoyage.tn',          v_pwhash, 'email', 'admin',         'active',  NOW(), NOW(), NOW()) ON CONFLICT (email) DO NOTHING,
    (v_guide1_id,  'amir.guide-fcomp@ecovoyage.tn',    v_pwhash, 'email', 'guide',         'active',  NOW(), NOW(), NOW()) ON CONFLICT (email) DO NOTHING,
    (v_guide2_id,  'leila.guide-fcomp@ecovoyage.tn',   v_pwhash, 'email', 'guide',         'pending', NOW(), NOW(), NOW()) ON CONFLICT (email) DO NOTHING,
    (v_owner1_id,  'sami-owner-fcomp@ecovoyage.tn',    v_pwhash, 'email', 'project',       'active',  NOW(), NOW(), NOW()) ON CONFLICT (email) DO NOTHING,
    (v_traveler1,  'ines.voyageur-fcomp@ecovoyage.tn', v_pwhash, 'email', 'eco_traveler',  'active',  NOW(), NOW(), NOW()) ON CONFLICT (email) DO NOTHING,
    (v_traveler2,  'karim.voyageur-fcomp@ecovoyage.tn',v_pwhash, 'email', 'eco_traveler',  'active',  NOW(), NOW(), NOW()) ON CONFLICT (email) DO NOTHING;

  -- ==========================================================================
  -- 2. GUIDES (profiles for guide users)
  -- ==========================================================================
  INSERT INTO guides (user_id, full_name, guide_type, bio, country, zone, specialties, languages_spoken, years_experience, status, profile_completion, is_onboarded, sustainability_score, created_at, updated_at)
  VALUES
    (v_faker3_id, 'Faker Bennomen', 'guide_montagne', 'Guide passionné de la montagne et des randonnées', 'Tunisie', 'Bizerte', ARRAY['Randonnée','Trekking','VTT'], ARRAY['Arabe','Français','Anglais'], 8, 'active', 100, true, 85, NOW(), NOW()),
    (v_guide1_id,  'Amir Mansouri',   'guide_nature',    'Spécialiste en écotourisme et observation', 'Tunisie', 'Djerba', ARRAY['Observation','Photographie','Kayak'], ARRAY['Arabe','Français','Anglais','Italien'], 12, 'active', 100, true, 92, NOW(), NOW()),
    (v_guide2_id,  'Leila Ben Ali',   'guide_culture',   'Guide culturelle des médinas et sites historiques', 'Tunisie', 'Tunis', ARRAY['Culture','Gastronomie','Artisanat'], ARRAY['Arabe','Français','Anglais','Allemand'], 5, 'pending', 60, false, NULL, NOW(), NOW());

  -- ==========================================================================
  -- 3. GUIDE OFFERINGS (services que les guides proposent)
  -- ==========================================================================
  INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit, min_travelers, max_travelers, service_zone_type, lat, lng, radius_km, zone_governorate, displacement_allowed, displacement_max_km, status, confirmation_mode, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_guide1_id, 'Randonnée guidée à Djerba', 'Découvrez les paysages uniques de Djerba avec un guide local', ARRAY['Arabe','Français','Anglais'], 75, 'per_person', 2, 12, 'point', 33.875, 10.865, 30, 'Djerba', true, 50, 'active', 'automatic', NOW(), NOW()),
    (gen_random_uuid(), v_faker3_id, 'Trekking Monts de Bizerte', 'Randonnée en montagne avec nuit en refuge', ARRAY['Arabe','Français'], 120, 'per_person', 3, 10, 'zone', 37.274, 9.872, 25, 'Bizerte', true, 80, 'active', 'manual', NOW(), NOW()),
    (gen_random_uuid(), v_guide1_id, 'Kayak aux îles Kerkennah', 'Excursion en kayau au coucher du soleil', ARRAY['Arabe','Français','Anglais','Italien'], 90, 'per_person', 2, 8, 'point', 34.711, 11.184, 20, 'Sfax', true, 40, 'active', 'automatic', NOW(), NOW());

  -- ==========================================================================
  -- 4. OFFERS — couvrant tous les types, status, et cas
  -- ==========================================================================

  -- 4a. HÉBERGEMENT — chambre + dortoir + tente (faker1 - publié)
  INSERT INTO offers (id, author_id, author_type, title, description, price, offer_type, images, region, address, latitude, longitude, location_type, status, confirmation_mode, created_at, updated_at)
  VALUES (v_off_heberg, v_faker1_id, 'project_owner', 'Éco-gîte Djerba', 'Gîte écologique avec chambres, dortoir et espace tente', 150, 'accommodation', ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'], 'Djerba', 'Houmt Souk, Djerba', 33.861, 10.942, 'fixed', 'approved', 'automatic', NOW(), NOW());
  INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
  VALUES
    (v_item_chambre, v_off_heberg, 'Chambre double éco', 'Chambre avec vue sur le jardin', 'room', '{"room_sub_type":"double","bed_count":2}'::json, 'active', NOW(), NOW()),
    (v_item_dortoir, v_off_heberg, 'Dortoir 4 lits', 'Dortoir partagé style auberge', 'bed', '{"bed_count":4}'::json, 'active', NOW(), NOW()),
    (v_item_tente,   v_off_heberg, 'Emplacement tente', 'Espace pour tente 4 personnes', 'camping_space', '{"tent_capacity":4}'::json, 'active', NOW(), NOW());
  INSERT INTO offer_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default) VALUES
    (gen_random_uuid(), v_item_chambre, 'Nuitée standard', 80, 'TND', 'per_room_per_night', true),
    (gen_random_uuid(), v_item_chambre, 'Petit-déjeuner inclus', 95, 'TND', 'per_room_per_night', false),
    (gen_random_uuid(), v_item_dortoir, 'Lit dortoir', 25, 'TND', 'per_bed', true),
    (gen_random_uuid(), v_item_tente, 'Emplacement', 20, 'TND', 'per_night', true);

  -- 4b. TRANSPORT (faker1 - en attente)
  INSERT INTO offers (id, author_id, author_type, title, description, price, offer_type, images, region, address, latitude, longitude, location_type, status, confirmation_mode, created_at, updated_at)
  VALUES (v_off_transp, v_faker1_id, 'project_owner', 'Navette Djerba - Tunis', 'Service de navette confortable avec climatisation', 250, 'transport', ARRAY['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'], 'Djerba', 'Aéroport Djerba-Zarzis', 33.875, 10.775, 'fixed', 'pending', 'manual', NOW(), NOW());
  INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
  VALUES (v_item_van, v_off_transp, 'Van 8 places', 'Van climatisé 8 places', 'transport_service', '{"vehicle_type":"van","capacity":8,"ac":true}'::json, 'active', NOW(), NOW());
  INSERT INTO offer_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default) VALUES
    (gen_random_uuid(), v_item_van, 'Trajet simple', 250, 'TND', 'per_vehicle', true);

  -- 4c. ATELIER POTERIE (faker1 - refusé)
  INSERT INTO offers (id, author_id, author_type, title, description, price, offer_type, images, region, address, latitude, longitude, location_type, status, rejection_reason, created_at, updated_at)
  VALUES (v_off_atelier, v_faker1_id, 'project_owner', 'Atelier poterie traditionnelle', 'Apprenez la poterie avec des artisans locaux', 60, 'workshop', ARRAY['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'], 'Nabeul', 'Nabeul Médina', 36.452, 10.735, 'fixed', 'rejected', 'Photos insuffisantes pour valider l authenticité', NOW(), NOW());
  INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
  VALUES (v_item_poterie, v_off_atelier, 'Atelier 2h', 'Initiation à la poterie', 'workshop', '{"duration_minutes":120,"max_participants":8}'::json, 'active', NOW(), NOW());
  INSERT INTO offer_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default) VALUES
    (gen_random_uuid(), v_item_poterie, 'Par personne', 60, 'TND', 'per_person', true);

  -- 4d. RANDONNÉE (owner1 - publié)
  INSERT INTO offers (id, author_id, author_type, title, description, price, offer_type, images, region, address, latitude, longitude, location_type, status, created_at, updated_at)
  VALUES (v_off_randon, v_owner1_id, 'project_owner', 'Randonnée Jebel Zaghouan', 'Randonnée guidée au sommet du Jebel Zaghouan', 45, 'activity', ARRAY['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'], 'Zaghouan', 'Jebel Zaghouan', 36.384, 10.127, 'fixed', 'approved', NOW(), NOW());
  INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
  VALUES (v_item_randonnee, v_off_randon, 'Randonnée demi-journée', 'Randonnée de 4h avec guide', 'activity', '{"duration_minutes":240,"difficulty":"moderate","max_participants":15}'::json, 'active', NOW(), NOW());
  INSERT INTO offer_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default) VALUES
    (gen_random_uuid(), v_item_randonnee, 'Adulte', 45, 'TND', 'per_person', true),
    (gen_random_uuid(), v_item_randonnee, 'Enfant (-12)', 25, 'TND', 'per_person', false);

  -- 4e. ARTISANAT (faker2 - publié)
  INSERT INTO offers (id, author_id, author_type, title, description, price, offer_type, images, region, address, latitude, longitude, location_type, status, created_at, updated_at)
  VALUES (v_off_artisan, v_faker2_id, 'project_owner', 'Tapis traditionnel Kairouanais', 'Atelier de tissage de tapis avec une artisane locale', 120, 'workshop', ARRAY['https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800'], 'Kairouan', 'Médina de Kairouan', 35.678, 10.096, 'fixed', 'approved', NOW(), NOW());
  INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
  VALUES (v_item_tapis, v_off_artisan, 'Atelier tissage 3h', 'Initiation au tissage traditionnel', 'workshop', '{"duration_minutes":180,"max_participants":6}'::json, 'active', NOW(), NOW());
  INSERT INTO offer_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default) VALUES
    (gen_random_uuid(), v_item_tapis, 'Par personne', 120, 'TND', 'per_person', true);

  -- 4f. RESTAURATION (faker2 - brouillon/draft)
  INSERT INTO offers (id, author_id, author_type, title, description, offer_type, region, address, latitude, longitude, location_type, status, created_at, updated_at)
  VALUES (v_off_restau, v_faker2_id, 'project_owner', 'Couscous traditionnel', 'Dégustation de couscous dans une famille d accueil', 'meal', 'Kairouan', 'Maison d hôte Kairouan', 35.68, 10.095, 'fixed', 'pending', NOW(), NOW());
  INSERT INTO offer_items (id, offer_id, name, description, item_type, details_json, status, created_at, updated_at)
  VALUES (v_item_couscous, v_off_restau, 'Menu couscous', 'Couscous + dessert + thé', 'meal', '{"meal_type":"lunch","serves":1}'::json, 'active', NOW(), NOW());
  INSERT INTO offer_prices (id, offer_item_id, label, price, currency, pricing_unit, is_default) VALUES
    (gen_random_uuid(), v_item_couscous, 'Par personne', 35, 'TND', 'per_person', true);

  -- 4g. OFFRE GUIDE (via offre - pas guide_offering) - mixte
  INSERT INTO offers (id, author_id, author_type, title, description, price, offer_type, images, region, location_type, status, created_at, updated_at)
  VALUES (v_off_guide, v_guide1_id, 'guide', 'Excursion Kerkennah', 'Découverte des îles Kerkennah en bateau + kayak', 150, 'activity', ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'], 'Sfax', 'fixed', 'approved', NOW(), NOW());

  -- 4h. KAYAK (faker2 - actif)
  INSERT INTO offers (id, author_id, author_type, title, description, price, offer_type, images, region, location_type, status, created_at, updated_at)
  VALUES (v_off_kayak, v_faker2_id, 'project_owner', 'Kayak Djerba Plage', 'Balade en kayak le long des côtes de Djerba', 55, 'activity', ARRAY['https://images.unsplash.com/photo-1551703595-39ec2b328497?w=800'], 'Djerba', 'fixed', 'approved', NOW(), NOW());

  -- ==========================================================================
  -- 5. CIRCUITS — avec différents statuts, hébergements, guides
  -- ==========================================================================

  -- 5a. Circuit Djerba (faker1 - approuvé, avec hébergement chambre)
  INSERT INTO circuits (id, author_id, author_type, title, description, duration_days, duration_nights, region, base_price, currency, max_participants, difficulty_level, status, lat, lng, address, cover_image, images, hebergement, availability, created_at, updated_at)
  VALUES (
    v_circ_djerba, v_faker1_id, 'project_owner',
    'Circuit Djerba & Kerkennah',
    'Un circuit de 5 jours pour découvrir les îles du Sud Tunisien',
    5, 4, 'Djerba', 1200, 'TND', 12, 'easy', 'approved',
    33.875, 10.860, 'Houmt Souk, Djerba',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    '{"inclus":true,"type":"same","accom_type":"chambre","nb_unites":6,"nb_lits":2,"price_source":"own","prix_nuit":80}'::jsonb,
    '{"mode":"specific","specific_dates":["2026-07-15","2026-08-01","2026-08-15"]}'::jsonb,
    NOW(), NOW()
  );
  -- Jours
  INSERT INTO circuit_days (id, circuit_id, day_number, date, title, description, lat, lng, location_name, created_at) VALUES
    (gen_random_uuid(), v_circ_djerba, 1, '2026-07-15', 'Arrivée à Djerba', 'Installation à l éco-gîte', 33.875, 10.860, 'Houmt Souk', NOW()),
    (gen_random_uuid(), v_circ_djerba, 2, '2026-07-16', 'Exploration du Sud', 'Visite du marché et balade à vélo', 33.850, 10.880, 'Midoun', NOW()),
    (gen_random_uuid(), v_circ_djerba, 3, '2026-07-17', 'Excursion Kerkennah', 'Traversée en bateau vers les îles', 34.700, 11.200, 'Kerkennah', NOW()),
    (gen_random_uuid(), v_circ_djerba, 4, '2026-07-18', 'Kayak et coucher de soleil', 'Balade en kayak', 33.820, 10.920, 'Plage de Sidi Mahrez', NOW()),
    (gen_random_uuid(), v_circ_djerba, 5, '2026-07-19', 'Départ', 'Petit-déjeuner et départ', 33.875, 10.860, 'Houmt Souk', NOW());

  -- Guide associé au circuit
  INSERT INTO circuit_program_items (circuit_day_id, title, description, start_time, end_time, guide_id, category) SELECT cd.id, 'Randonnée guidée', 'Randonnée avec guide local', '09:00', '12:00', v_guide1_id, 'guided_tour' FROM circuit_days cd WHERE cd.circuit_id = v_circ_djerba AND cd.day_number = 2;

  -- 5b. Circuit Nord (faker2 - approuvé, hébergement mixte)
  INSERT INTO circuits (id, author_id, author_type, title, description, duration_days, duration_nights, region, base_price, currency, max_participants, difficulty_level, status, lat, lng, address, cover_image, images, hebergement, availability, created_at, updated_at)
  VALUES (
    v_circ_nord, v_faker2_id, 'project_owner',
    'Circuit Nord : Tunis & Bizerte',
    'Découverte du Nord tunisien entre médinas et montagnes',
    3, 2, 'Tunis', 800, 'TND', 10, 'moderate', 'approved',
    36.806, 10.181, 'Tunis Centre',
    'https://images.unsplash.com/photo-1590075766080-4d3264ba7cb9?w=800',
    ARRAY['https://images.unsplash.com/photo-1590075766080-4d3264ba7cb9?w=800'],
    '{"inclus":true,"type":"per_day","accom_type":"dortoir","nb_unites":4,"nb_lits":4,"price_source":"external","prix_nuit":35,"prestataire":"Auberge de Jeunesse Tunis"}'::jsonb,
    '{"mode":"weekly","weekdays":[0,1,2,3,4,5,6]}'::jsonb,
    NOW(), NOW()
  );

  -- 5c. Circuit Sud (faker1 - en attente)
  INSERT INTO circuits (id, author_id, author_type, title, description, duration_days, duration_nights, region, base_price, difficulty_level, status, address, hebergement, availability, created_at, updated_at)
  VALUES (
    v_circ_sud, v_faker1_id, 'project_owner',
    'Circuit Sud : Tozeur & Kébili',
    '3 jours dans le désert avec nuit sous les tentes',
    3, 2, 'Tozeur', 600, 'hard', 'pending', 'Tozeur Centre',
    '{"inclus":true,"type":"same","accom_type":"tente","nb_unites":10,"nb_lits":4,"price_source":"own","prix_nuit":25}'::jsonb,
    '{"mode":"season","saison":"ete"}'::jsonb,
    NOW(), NOW()
  );

  -- 5d. Circuit Kairouan (owner1 - approuvé, hébergement non inclus)
  INSERT INTO circuits (id, author_id, author_type, title, description, duration_days, duration_nights, region, base_price, difficulty_level, status, address, hebergement, created_at, updated_at)
  VALUES (
    v_circ_kairouan, v_owner1_id, 'project_owner',
    'Circuit Culturel Kairouan',
    'Découverte de la médina et des ateliers artisanaux',
    2, 1, 'Kairouan', 350, 'easy', 'approved', 'Kairouan Médina',
    '{"inclus":false}'::jsonb,
    NOW(), NOW()
  );

  -- ==========================================================================
  -- 6. CIRCUIT PROGRAM ITEMS (liens offre + guide)
  -- ==========================================================================
  INSERT INTO circuit_program_items (circuit_day_id, title, description, start_time, end_time, linked_offer_item_id, guide_id, category)
  SELECT cd.id, 'Atelier tapis', 'Initiation au tissage', '14:00', '17:00', v_item_tapis, NULL, 'workshop'
  FROM circuit_days cd WHERE cd.circuit_id = v_circ_kairouan;

  -- ==========================================================================
  -- 7. TRIP PLANS — avec différents types d'activités
  -- ==========================================================================

  -- 7a. Trip plan de Ines (eco-traveler) avec hébergement, activité, transport
  INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status, created_at, updated_at)
  VALUES (v_trip1_id, v_traveler1, 'Week-end à Djerba', 'Séjour détente à Djerba avec activités nautiques', '2026-08-01', '2026-08-04', 'confirmed', NOW(), NOW());

  INSERT INTO trip_plan_items (trip_plan_id, offer_item_id, circuit_id, day_number, sort_order, guide_id, notes, created_at)
  VALUES
    (v_trip1_id, v_item_chambre, NULL, 1, 1, NULL, 'Nuit du 1er août', NOW()),         -- Hébergement chambre
    (v_trip1_id, v_item_randonnee, NULL, 2, 2, v_guide1_id, 'Avec guide Amir', NOW()),   -- Randonnée
    (v_trip1_id, NULL, v_circ_djerba, NULL, 3, NULL, 'Circuit complet', NOW());          -- Circuit

  -- 7b. Trip plan de Karim (eco-traveler) avec artisanat + transport
  INSERT INTO trip_plans (id, eco_traveler_id, title, description, start_date, end_date, status, created_at, updated_at)
  VALUES (v_trip2_id, v_traveler2, 'Découverte artisanat Kairouan', 'Initiation au tissage et visite culturelle', '2026-09-10', '2026-09-12', 'draft', NOW(), NOW());

  INSERT INTO trip_plan_items (trip_plan_id, offer_item_id, guide_id, notes, created_at)
  VALUES
    (v_trip2_id, v_item_tapis, NULL, 'Atelier tissage de tapis', NOW());

  -- ==========================================================================
  -- 8. NOTIFICATIONS — tous types et statuts
  -- ==========================================================================

  -- Pour faker1 (project owner)
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at) VALUES
    (v_notif1, v_faker1_id, 'offer_approved', 'Offre approuvée 🎉', 'Votre offre "Éco-gîte Djerba" a été approuvée et est maintenant visible publiquement.', '/offers/' || v_off_heberg, false, NOW() - INTERVAL '2 days'),
    (v_notif2, v_faker1_id, 'offer_rejected', 'Offre refusée', 'Votre offre "Atelier poterie" a été refusée. Motif : photos insuffisantes.', '/offers/' || v_off_atelier, false, NOW() - INTERVAL '1 day'),
    (v_notif3, v_faker1_id, 'booking_request', 'Nouvelle réservation reçue', 'Ines a réservé le circuit "Circuit Djerba & Kerkennah" pour août 2026.', '/circuits/' || v_circ_djerba, true, NOW() - INTERVAL '12 hours'),
    (v_notif4, v_faker1_id, 'circuit_available', 'Circuit disponible', 'Votre circuit "Circuit Djerba" est maintenant disponible à la réservation.', '/circuits/' || v_circ_djerba, true, NOW() - INTERVAL '3 days');

  -- Pour faker2 (project owner)
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at) VALUES
    (gen_random_uuid(), v_faker2_id, 'offer_approved', 'Offre approuvée', 'Votre offre "Tapis traditionnel Kairouanais" a été approuvée.', '/offers/' || v_off_artisan, false, NOW() - INTERVAL '1 day');

  -- Pour guide1
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at) VALUES
    (gen_random_uuid(), v_guide1_id, 'booking_confirmed', 'Réservation confirmée', 'Vous êtes assigné comme guide pour le circuit "Circuit Djerba & Kerkennah".', '/circuits/' || v_circ_djerba, false, NOW());

  -- ==========================================================================
  -- 9. OFFER BOOKINGS / RÉSERVATIONS
  -- ==========================================================================
  INSERT INTO bookings (id, user_id, offer_id, status, participants_count, total_price, notes, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_traveler1, v_off_heberg, 'confirmed', 2, 300, '2 nuits en chambre double', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_traveler2, v_off_artisan, 'pending', 1, 120, 'Atelier tissage seul', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

  -- ==========================================================================
  -- 10. REVIEWS / AVIS
  -- ==========================================================================
  INSERT INTO reviews (id, user_id, target_id, target_type, rating, comment, created_at)
  VALUES
    (gen_random_uuid(), v_traveler1, v_off_heberg, 'offer', 5, 'Super séjour ! Accueil chaleureux et cadre magnifique.', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_traveler1, v_guide1_id, 'guide', 4, 'Guide très compétent et sympathique.', NOW() - INTERVAL '5 days');

  -- ==========================================================================
  -- 11. MESSAGES/CONVERSATIONS
  -- ==========================================================================
  INSERT INTO conversations (id, participant_ids, created_at, updated_at)
  VALUES
    (gen_random_uuid(), ARRAY[v_traveler1, v_faker1_id], NOW(), NOW());

  RAISE NOTICE '✅ Seed comprehensive terminé avec succès !';
END $$;

COMMIT;

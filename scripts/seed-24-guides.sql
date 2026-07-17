-- ============================================================================
-- Seed: 24 guides — 1 par gouvernorat tunisien
-- Email: amirbennoomen+1@gmail.com ... amirbennoomen+24@gmail.com
-- MDP: Aa17092001
-- bcrypt hash: $2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK
-- ============================================================================
BEGIN;

-- 1. User accounts (24 guides)
INSERT INTO users (id, email, password, auth_method, role, status, email_verified_at)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'amirbennoomen+1@gmail.com',  '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000002', 'amirbennoomen+2@gmail.com',  '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000003', 'amirbennoomen+3@gmail.com',  '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000004', 'amirbennoomen+4@gmail.com',  '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000005', 'amirbennoomen+5@gmail.com',  '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000006', 'amirbennoomen+6@gmail.com',  '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000007', 'amirbennoomen+7@gmail.com',  '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000008', 'amirbennoomen+8@gmail.com',  '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000009', 'amirbennoomen+9@gmail.com',  '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000010', 'amirbennoomen+10@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000011', 'amirbennoomen+11@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000012', 'amirbennoomen+12@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000013', 'amirbennoomen+13@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000014', 'amirbennoomen+14@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000015', 'amirbennoomen+15@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000016', 'amirbennoomen+16@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000017', 'amirbennoomen+17@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000018', 'amirbennoomen+18@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000019', 'amirbennoomen+19@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000020', 'amirbennoomen+20@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000021', 'amirbennoomen+21@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000022', 'amirbennoomen+22@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000023', 'amirbennoomen+23@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW()),
  ('b0000001-0000-0000-0000-000000000024', 'amirbennoomen+24@gmail.com', '$2b$10$N17qunj8ST0xjIHZNxayvedO8Mq11/kfaef.2VWX0QlUwrRA8AGPK', 'email', 'guide', 'active', NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Guide profiles (1 par gouvernorat)
INSERT INTO guides (user_id, full_name, guide_type, bio, country, zone, language, specialties, languages_spoken, years_experience, status, profile_completion, is_onboarded, sustainability_score)
VALUES
  -- +1: Ariana
  ('b0000001-0000-0000-0000-000000000001', 'Youssef Trabelsi', 'professionnel',
   'Guide professionnel basé à Ariana, spécialisé dans la randonnée urbaine et les découvertes culturelles du Grand Tunis.',
   'Tunisie', 'Ariana', 'fr', 'Randonnée,Culture,Ville', 'Arabe,Français,Anglais', 10, 'active', 95, true, 88),
  -- +2: Beja
  ('b0000001-0000-0000-0000-000000000002', 'Nadia Bouazizi', 'local',
   'Guide locale de Béja, passionnée par l''agritourisme et les oliveraies millénaires du nord-ouest.',
   'Tunisie', 'Beja', 'fr', 'Nature,Agrotourisme,Histoire', 'Arabe,Français', 6, 'active', 85, true, 92),
  -- +3: Ben Arous
  ('b0000001-0000-0000-0000-000000000003', 'Karim Jlassi', 'professionnel',
   'Guide certifié de Ben Arous, expert des sports nautiques et des plages du golfe de Tunis.',
   'Tunisie', 'Ben Arous', 'fr', 'Sports nautiques,Plage,Kayak', 'Arabe,Français,Anglais,Italien', 8, 'active', 90, true, 85),
  -- +4: Bizerte
  ('b0000001-0000-0000-0000-000000000004', 'Amira Mansour', 'professionnel',
   'Guide de Bizerte, spécialiste de la randonnée littorale et de l''observation ornithologique.',
   'Tunisie', 'Bizerte', 'fr', 'Nature,Observation,Randonnée', 'Arabe,Français,Anglais', 12, 'active', 92, true, 90),
  -- +5: Gabes
  ('b0000001-0000-0000-0000-000000000005', 'Slim Khenissi', 'local',
   'Guide local de Gabès, expert des oasis et du tourisme durable dans le Jeffara.',
   'Tunisie', 'Gabes', 'fr', 'Oasis,Désert,Durable', 'Arabe,Français', 7, 'active', 80, true, 94),
  -- +6: Gafsa
  ('b0000001-0000-0000-0000-000000000006', 'Fatma Rejeb', 'professionnel',
   'Guide de Gafsa, passionnée par les sites archéologiques et les randonnées en montagne.',
   'Tunisie', 'Gafsa', 'fr', 'Archéologie,Randonnée,Mountain', 'Arabe,Français,Anglais', 9, 'active', 88, true, 87),
  -- +7: Jendouba
  ('b0000001-0000-0000-0000-000000000007', 'Walid Khemiri', 'professionnel',
   'Guide professionnel de Jendouba, spécialiste des forêts de chênes-lièges et du trekking.',
   'Tunisie', 'Jendouba', 'fr', 'Trekking,Forêt,Nature', 'Arabe,Français,Anglais', 11, 'active', 90, true, 91),
  -- +8: Kairouan
  ('b0000001-0000-0000-0000-000000000008', 'Leila Braham', 'local',
   'Guide locale de Kairouan, experte du patrimoine Aghlabite et de la gastronomie locale.',
   'Tunisie', 'Kairouan', 'fr', 'Patrimoine,Gastronomie,Culture', 'Arabe,Français,Allemand', 5, 'active', 82, true, 86),
  -- +9: Kasserine
  ('b0000001-0000-0000-0000-000000000009', 'Mehdi Sahli', 'professionnel',
   'Guide de Kasserine, expert des montagnes de l''Atlas et du parapente.',
   'Tunisie', 'Kasserine', 'fr', 'Montagne,Parapente,Aventure', 'Arabe,Français,Anglais', 8, 'active', 87, true, 89),
  -- +10: Kebili
  ('b0000001-0000-0000-0000-000000000010', 'Amel Bouhadjila', 'local',
   'Guide locale de Kebili, spécialiste du Sahara et des circuits désertiques.',
   'Tunisie', 'Kebili', 'fr', 'Désert,Sahara,Trek', 'Arabe,Français', 6, 'active', 78, true, 93),
  -- +11: Kef
  ('b0000001-0000-0000-0000-000000000011', 'Rachid Touati', 'professionnel',
   'Guide du Kef, expert des grottes et du patrimoine naturel du nord-ouest.',
   'Tunisie', 'Kef', 'fr', 'Spéléologie,Nature,History', 'Arabe,Français,Anglais', 10, 'active', 88, true, 90),
  -- +12: Mahdia
  ('b0000001-0000-0000-0000-000000000012', 'Salma Charef', 'professionnel',
   'Guide de Mahdia, spécialiste du littoral, de la plongée et du patrimoine hassanide.',
   'Tunisie', 'Mahdia', 'fr', 'Plongée,Littoral,Patrimoine', 'Arabe,Français,Anglais,Russe', 9, 'active', 91, true, 87),
  -- +13: Manouba
  ('b0000001-0000-0000-0000-000000000013', 'Hatem Nefzi', 'local',
   'Guide de Manouba, expert du Dar El Bey et des médinas du Sahel.',
   'Tunisie', 'Manouba', 'fr', 'Culture,Médina,Artisanat', 'Arabe,Français', 4, 'active', 75, true, 85),
  -- +14: Medenine
  ('b0000001-0000-0000-0000-000000000014', 'Ines Miled', 'professionnel',
   'Guide de Médenine, spécialiste de Djerba, du patrimoine berbère et du tourisme durable.',
   'Tunisie', 'Medenine', 'fr', 'Djerba,Berbère,Durable', 'Arabe,Français,Anglais,Allemand', 12, 'active', 93, true, 95),
  -- +15: Monastir
  ('b0000001-0000-0000-0000-000000000015', 'Omar Karray', 'professionnel',
   'Guide de Monastir, expert du Sahel, du ribat et des circuits balnéaires.',
   'Tunisie', 'Monastir', 'fr', 'Littoral,Balnéaire,History', 'Arabe,Français,Anglais', 7, 'active', 86, true, 84),
  -- +16: Nabeul
  ('b0000001-0000-0000-0000-000000000016', 'Rim Gharbi', 'professionnel',
   'Guide de Nabeul, spécialiste de la céramique, des plages et des sites romains.',
   'Tunisie', 'Nabeul', 'fr', 'Artisanat,Plage,Archéologie', 'Arabe,Français,Anglais,Italien', 8, 'active', 89, true, 86),
  -- +17: Sfax
  ('b0000001-0000-0000-0000-000000000017', 'Fathi Bouchama', 'professionnel',
   'Guide de Sfax, expert du commerce maritime et des îles Kerkennah.',
   'Tunisie', 'Sfax', 'fr', 'Maritime,Îles,Culture', 'Arabe,Français,Anglais', 10, 'active', 90, true, 88),
  -- +18: Sidi Bouzid
  ('b0000001-0000-0000-0000-000000000018', 'Houda Maatallah', 'local',
   'Guide locale de Sidi Bouzid, spécialiste de l''agritourisme et des circuits ruraux.',
   'Tunisie', 'Sidi Bouzid', 'fr', 'Agritourisme,Rural,Nature', 'Arabe,Français', 3, 'active', 72, true, 91),
  -- +19: Siliana
  ('b0000001-0000-0000-0000-000000000019', 'Yacine Frad', 'professionnel',
   'Guide de Siliana, expert des gorges et du trekking en ambiance montagne.',
   'Tunisie', 'Siliana', 'fr', 'Trekking,Gorges,Mountain', 'Arabe,Français,Anglais', 9, 'active', 85, true, 92),
  -- +20: Sousse
  ('b0000001-0000-0000-0000-000000000020', 'Nesrine Chaabane', 'professionnel',
   'Guide de Sousse, spécialiste du patrimoine Aghlabite, de la médina et du tourisme balnéaire.',
   'Tunisie', 'Sousse', 'fr', 'Patrimoine,Balnéaire,Culture', 'Arabe,Français,Anglais,Russe,Allemand', 11, 'active', 94, true, 89),
  -- +21: Tataouine
  ('b0000001-0000-0000-0000-000000000021', 'Bilel Rejichi', 'professionnel',
   'Guide de Tataouine, expert des ksour berbères, du désert et des paysages extrêmes.',
   'Tunisie', 'Tataouine', 'fr', 'Désert,Ksours,Trek', 'Arabe,Français,Anglais', 8, 'active', 83, true, 96),
  -- +22: Tozeur
  ('b0000001-0000-0000-0000-000000000022', 'Syhem Bouchiba', 'professionnel',
   'Guide de Tozeur, spécialiste de l''oasis, des ksars et du tourisme éco-responsable.',
   'Tunisie', 'Tozeur', 'fr', 'Oasis,Désert,Écotourisme', 'Arabe,Français,Anglais,Italien', 13, 'active', 95, true, 97),
  -- +23: Tunis
  ('b0000001-0000-0000-0000-000000000023', 'Ali Zouari', 'professionnel',
   'Guide de Tunis, expert de la médina, du Bardo et des circuits urbains.',
   'Tunisie', 'Tunis', 'fr', 'Médina,Urbain,Musée', 'Arabe,Français,Anglais,Espagnol', 14, 'active', 96, true, 87),
  -- +24: Zaghouan
  ('b0000001-0000-0000-0000-000000000024', 'Mongi Dhaouadi', 'professionnel',
   'Guide de Zaghouan, spécialiste du temple des eaux, du parapente et des randonnées montagne.',
   'Tunisie', 'Zaghouan', 'fr', 'Montagne,Parapente,History', 'Arabe,Français,Anglais', 7, 'active', 88, true, 90)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Guide offerings (1 par guide, zone locale avec rayon)
INSERT INTO guide_offerings (id, guide_id, title, description, languages, price, pricing_unit,
  min_travelers, max_travelers, service_zone_type, lat, lng, radius_km,
  displacement_allowed, displacement_max_km, status, confirmation_mode)
VALUES
  -- +1: Ariana — randonnée urbaine
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001',
   'Randonnée Découverte Grand Tunis', 'Parcours à pied à travers les quartiers historiques de Tunis et Ariana.',
   ARRAY['ar','fr','en'], 45.00, 'hour', 2, 12, 'radius', 36.8665, 10.1647, 25.00,
   true, 50.00, 'active', 'automatic'),
  -- +2: Beja — agritourisme
  ('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002',
   'Journée Olive & Terroir', 'Visite d''oliveraies millénaires et dégustation d''huile d''olive locale.',
   ARRAY['ar','fr'], 35.00, 'day', 2, 8, 'radius', 36.7256, 9.1847, 30.00,
   false, 0, 'active', 'automatic'),
  -- +3: Ben Arous — sports nautiques
  ('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003',
   'Kayak Golfe de Tunis', 'Excursion en kayak dans le golfe de Tunis avec observation marine.',
   ARRAY['ar','fr','en','it'], 55.00, 'half_day', 2, 10, 'radius', 36.7833, 10.2333, 20.00,
   true, 30.00, 'active', 'automatic'),
  -- +4: Bizerte — observation
  ('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000004',
   'Observation Ornithologique Ichkeul', 'Guide expert pour l''observation des oiseaux au lac Ichkeul.',
   ARRAY['ar','fr','en'], 60.00, 'day', 1, 6, 'radius', 37.1667, 9.6833, 35.00,
   true, 40.00, 'active', 'automatic'),
  -- +5: Gabes — oasis
  ('c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000005',
   'Circuit Oasis de Gabès', 'Découverte des oasis et du marché de Gabès avec guide local.',
   ARRAY['ar','fr'], 30.00, 'half_day', 2, 15, 'radius', 33.8815, 10.0982, 40.00,
   true, 60.00, 'active', 'automatic'),
  -- +6: Gafsa — archéologie
  ('c0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000006',
   'Randonnée Archéologique Gafsa', 'Parcours entre sites romains et montagnes de Gafsa.',
   ARRAY['ar','fr','en'], 50.00, 'day', 2, 10, 'radius', 34.4311, 8.7756, 45.00,
   true, 70.00, 'active', 'automatic'),
  -- +7: Jendouba — trekking
  ('c0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000007',
   'Trek Forêt de Fernana', 'Trekking en forêt de chênes-lièges dans le nord-ouest.',
   ARRAY['ar','fr','en'], 65.00, 'day', 2, 8, 'radius', 36.7167, 8.8000, 50.00,
   true, 80.00, 'active', 'automatic'),
  -- +8: Kairouan — patrimoine
  ('c0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000008',
   'Visite Guidée Kairouan', 'Découverte de la Grande Mosquée, des souks et de la gastronomie.',
   ARRAY['ar','fr','de'], 40.00, 'half_day', 1, 20, 'radius', 35.6781, 10.0994, 15.00,
   false, 0, 'active', 'automatic'),
  -- +9: Kasserine — montagne
  ('c0000001-0000-0000-0000-000000000009', 'b0000001-0000-0000-0000-000000000009',
   'Parapente Chambi', 'Vol en parapente au-dessus du Djebel Chambi, point culminant de Tunisie.',
   ARRAY['ar','fr','en'], 120.00, 'half_day', 1, 4, 'radius', 35.4500, 8.6167, 60.00,
   true, 100.00, 'active', 'automatic'),
  -- +10: Kebili — désert
  ('c0000001-0000-0000-0000-000000000010', 'b0000001-0000-0000-0000-000000000010',
   'Circuit Désert Kebili', 'Excursion dans le grand Erg oriental et les chott.',
   ARRAY['ar','fr'], 80.00, 'day', 2, 6, 'radius', 33.7000, 8.9667, 100.00,
   true, 150.00, 'active', 'automatic'),
  -- +11: Kef — spéléologie
  ('c0000001-0000-0000-0000-000000000011', 'b0000001-0000-0000-0000-000000000011',
   'Spéléologie Grottes du Kef', 'Exploration des grottes et cavernes du Kef.',
   ARRAY['ar','fr','en'], 70.00, 'day', 2, 6, 'radius', 35.9167, 8.7167, 40.00,
   true, 60.00, 'active', 'automatic'),
  -- +12: Mahdia — plongée
  ('c0000001-0000-0000-0000-000000000012', 'b0000001-0000-0000-0000-000000000012',
   'Plongée Mahdia', 'Plongée sous-marine sur les récifs du large de Mahdia.',
   ARRAY['ar','fr','en','ru'], 90.00, 'half_day', 1, 8, 'radius', 35.5000, 11.0667, 25.00,
   true, 35.00, 'active', 'automatic'),
  -- +13: Manouba — culture
  ('c0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000013',
   'Visite Médina Manouba', 'Découverte du Dar El Bey et des的艺术 traditionnels.',
   ARRAY['ar','fr'], 25.00, 'hour', 1, 15, 'radius', 36.8042, 10.0833, 10.00,
   false, 0, 'active', 'automatic'),
  -- +14: Medenine — Djerba
  ('c0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000014',
   'Circuit Djerba Complet', 'Visite complète de Djerba : synagogue,蛟rmale, plages et artisanat.',
   ARRAY['ar','fr','en','de'], 70.00, 'day', 2, 12, 'radius', 33.8719, 10.8583, 30.00,
   true, 50.00, 'active', 'automatic'),
  -- +15: Monastir — balnéaire
  ('c0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000015',
   'Circuit Balnéaire Sahel', 'Plages de Monastir et Sousse avec visite du ribat.',
   ARRAY['ar','fr','en'], 45.00, 'day', 2, 10, 'radius', 35.7647, 10.8117, 25.00,
   true, 40.00, 'active', 'automatic'),
  -- +16: Nabeul — artisanat
  ('c0000001-0000-0000-0000-000000000016', 'b0000001-0000-0000-0000-000000000016',
   'Artisanat & Plages Nabeul', 'Visite des ateliers de céramique et plages de Nabeul.',
   ARRAY['ar','fr','en','it'], 40.00, 'half_day', 2, 12, 'radius', 36.4536, 10.7350, 20.00,
   true, 30.00, 'active', 'automatic'),
  -- +17: Sfax — Kerkennah
  ('c0000001-0000-0000-0000-000000000017', 'b0000001-0000-0000-0000-000000000017',
   'Excursion Îles Kerkennah', 'Bateau vers les Kerkennah avec visite des palangriers.',
   ARRAY['ar','fr','en'], 75.00, 'day', 2, 8, 'radius', 34.7333, 11.1167, 5.00,
   true, 100.00, 'active', 'automatic'),
  -- +18: Sidi Bouzid — rural
  ('c0000001-0000-0000-0000-000000000018', 'b0000001-0000-0000-0000-000000000018',
   'Immersion Rurale Sidi Bouzid', 'Séjour dans une exploitation agricole locale.',
   ARRAY['ar','fr'], 25.00, 'day', 2, 10, 'radius', 34.7406, 9.4839, 35.00,
   true, 50.00, 'active', 'automatic'),
  -- +19: Siliana — gorges
  ('c0000001-0000-0000-0000-000000000019', 'b0000001-0000-0000-0000-000000000019',
   'Trek Gorges de Siliana', 'Randonnée dans les gorges spectaculaires de Siliana.',
   ARRAY['ar','fr','en'], 55.00, 'day', 2, 8, 'radius', 35.9167, 9.4833, 45.00,
   true, 70.00, 'active', 'automatic'),
  -- +20: Sousse — patrimoine
  ('c0000001-0000-0000-0000-000000000020', 'b0000001-0000-0000-0000-000000000020',
   'Sousse Patrimoine & Mer', 'Visite de la médina classée et plages de Sousse.',
   ARRAY['ar','fr','en','ru','de'], 50.00, 'day', 2, 15, 'radius', 35.8281, 10.6403, 20.00,
   true, 35.00, 'active', 'automatic'),
  -- +21: Tataouine — ksour
  ('c0000001-0000-0000-0000-000000000021', 'b0000001-0000-0000-0000-000000000021',
   'Circuit Ksours Tataouine', 'Découverte des ksour berbères et paysages désertiques.',
   ARRAY['ar','fr','en'], 85.00, 'day', 2, 6, 'radius', 32.9297, 10.4514, 80.00,
   true, 120.00, 'active', 'automatic'),
  -- +22: Tozeur — oasis
  ('c0000001-0000-0000-0000-000000000022', 'b0000001-0000-0000-0000-000000000022',
   'Oasis & Star Wars Tozeur', 'Oasis du Djérid, ksar Hadada et décors de Star Wars.',
   ARRAY['ar','fr','en','it'], 75.00, 'day', 2, 10, 'radius', 33.9197, 8.1333, 60.00,
   true, 100.00, 'active', 'automatic'),
  -- +23: Tunis — médina
  ('c0000001-0000-0000-0000-000000000023', 'b0000001-0000-0000-0000-000000000023',
   'Médina de Tunis & Bardo', 'Visite complète de la médina et du musée du Bardo.',
   ARRAY['ar','fr','en','es'], 55.00, 'half_day', 1, 20, 'radius', 36.8065, 10.1815, 15.00,
   false, 0, 'active', 'automatic'),
  -- +24: Zaghouan — parapente
  ('c0000001-0000-0000-0000-000000000024', 'b0000001-0000-0000-0000-000000000024',
   'Parapente & Temple Zaghouan', 'Vol en parapente et visite du temple des eaux romain.',
   ARRAY['ar','fr','en'], 95.00, 'half_day', 1, 4, 'radius', 36.4000, 10.1500, 35.00,
   true, 50.00, 'active', 'automatic')
ON CONFLICT (id) DO NOTHING;

-- 4. Availability rules (daily for all guides)
INSERT INTO guide_offering_availability_rules (id, guide_offering_id, availability_type, start_time, end_time, is_active)
SELECT
  ('d0000001-' || lpad(gs.id::text, 4, '0') || '-0000-0000-000000000000')::uuid,
  ('c0000001-' || lpad(gs.id::text, 4, '0') || '-0000-0000-000000000001')::uuid,
  'daily',
  '08:00',
  '18:00',
  true
FROM generate_series(1, 24) AS gs(id)
ON CONFLICT DO NOTHING;

COMMIT;

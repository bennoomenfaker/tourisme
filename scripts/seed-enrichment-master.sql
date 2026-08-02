-- ============================================================================
-- ENRICHISSEMENT MASTER — Données métier réalistes pour démo
--
-- Objectifs :
--  1. Compléter les 5 comptes faker (fakerbennoomen+1..+5@gmail.com)
--  2. Compléter les onboardings incomplets (f.akerbennoomen, fa.kerbennoomen)
--  3. Ajouter des certifications valides ET invalides (rejected)
--  4. Remplir les attributs manquants des offres pending du provider principal
--  5. Créer des réservations sur offres / circuits / guides / trip plans
--     avec statuts variés (pending, confirmed, rejected, cancelled, completed)
--     et tailles de groupe (5 personnes, 2 personnes)
--  6. Créer les notifications associées (nouvelle réservation, annulation, etc.)
--
-- Toutes les insertions sont idempotentes (WHERE NOT EXISTS / ON CONFLICT).
-- Base : tourism_db (Docker tourisme-db-1)
-- ============================================================================
BEGIN;

-- ============================================================================
-- SECTION 0 — Variables / identifiants connus
-- ============================================================================
DO $$
DECLARE
  -- Utilisateurs faker existants
  v_po1          uuid := '8c21a605-450d-446b-bb7f-33559f6120a5';  -- +1 provider
  v_guide2       uuid := '8b8a1970-8717-45e8-b114-e1a6154363e6';  -- +2 guide
  v_traveler3    uuid := '4bdea078-7512-450a-a5c9-bd73b896d410';  -- +3 eco_traveler
  v_po_main      uuid := '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e';  -- provider principal
  v_traveler_main uuid := '7b83e87d-276d-4d89-bb00-ab8ea1243a14'; -- f.akerbennoomen
  v_guide_main   uuid := '87a38946-9a54-4bb4-be4a-887be312af15';  -- fa.kerbennoomen

  -- Catégories d'offres
  v_cat_sejour   uuid := '339fb32c-58c0-4979-9bbf-e093a178ef57';
  v_cat_activity uuid := 'f8509a3c-747f-475b-b4a0-40a32c765bfb';
  v_cat_circuit  uuid := '74b459cf-8c7a-496e-941d-5f0cdd7356db';
  v_cat_craft    uuid := 'd8835649-c729-4625-9f46-820cc02a9d72';
  v_cat_resto    uuid := '4269fcff-40fe-478e-9214-17b2fcb01415';
  v_cat_eco_tour uuid := '450c9c0b-5a94-4372-8f84-6c548eb4ebce';

  v_po4 uuid;
  v_po5 uuid;
BEGIN
  RAISE NOTICE '=== SECTION 0 : préparation ===';

  -- ==========================================================================
  -- SECTION 1 — Comptes fakerbennoomen+4 et +5 (complètent les 5 comptes)
  -- ==========================================================================
  RAISE NOTICE '=== SECTION 1 : comptes +4 / +5 ===';

  -- fakerbennoomen+4@gmail.com → provider
  INSERT INTO users (id, email, password, auth_method, role, status, email_verified_at, created_at, updated_at)
  SELECT gen_random_uuid(), 'fakerbennoomen+4@gmail.com', '$2b$10$8.wi7hUU.78oPUK6C3L.2OZ0uS.POq2dEXgryrU7ChJYROoM2ylRO', 'email', 'provider', 'active', NOW(), NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'fakerbennoomen+4@gmail.com');

  -- fakerbennoomen+5@gmail.com → eco_traveler
  INSERT INTO users (id, email, password, auth_method, role, status, email_verified_at, created_at, updated_at)
  SELECT gen_random_uuid(), 'fakerbennoomen+5@gmail.com', '$2b$10$8.wi7hUU.78oPUK6C3L.2OZ0uS.POq2dEXgryrU7ChJYROoM2ylRO', 'email', 'eco_traveler', 'active', NOW(), NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'fakerbennoomen+5@gmail.com');

  SELECT id INTO v_po4 FROM users WHERE email = 'fakerbennoomen+4@gmail.com';
  SELECT id INTO v_po5 FROM users WHERE email = 'fakerbennoomen+5@gmail.com';

  -- Profil provider +4 — onboarding complet
  INSERT INTO providers (
    user_id, full_name, bio, country, language, organization, position, phone,
    sustainability_score, score_questionnaire, score_reservations, score_feedbacks,
    years_experience, languages_spoken, status, personal_bio, provider_type,
    zone, activity_types, specialties, services, eco_labels,
    profile_completion, is_onboarded, region, whatsapp, website, facebook, instagram,
    created_at, updated_at
  )
  SELECT v_po4, 'Omar Ben Romdhane',
    'Prestataire éco-tourisme spécialisé en hébergement rural et circuits désert, basé à Douz.',
    'TN', 'fr', 'Désert Eco-Aventures', 'Fondateur', '+216 98 765 432',
    72, 60, 20, 15,
    8, 'fr,ar,en', 'active', 'Hébergeur et organisateur de circuits dans le Grand Sud tunisien.',
    'prestataire', 'Douz', ARRAY['hebergement','activite','circuit','restauration'],
    ARRAY['désert','oasis','bivouac','culture'], ARRAY['hébergement','circuits','restauration','transfert'],
    ARRAY['Green Key','Travelife'],
    100, true, 'Kébili', '+216 98 765 432', 'https://desertecoaventures.tn',
    'https://facebook.com/desertecoaventures', '@desertecoaventures',
    NOW(), NOW()
  ON CONFLICT (user_id) DO NOTHING;

  -- Profil eco_traveler +5 — onboarding complet
  INSERT INTO eco_travelers (
    user_id, full_name, bio, country, language,
    traveler_types, motivations, sustainability_values,
    interests, landscapes, travel_styles, sustainability_goals,
    profile_completion, is_onboarded, sustainability_score,
    score_questionnaire, score_reservations, score_feedbacks, score_partages,
    created_at, updated_at
  )
  SELECT v_po5, 'Nour Ben Ammar',
    'Amoureuse des grands espaces, engagée pour un tourisme respectueux des communautés locales.',
    'TN', 'fr',
    '{"couple","family"}', '{"cultural_discovery","nature_connection","adventure"}',
    '{"support_local_economy","reduce_carbon","respect_cultures","avoid_mass_tourism"}',
    '[{"name": "Randonnée", "level": "intermediate"}, {"name": "Artisanat", "level": "intermediate"}, {"name": "Photographie", "level": "beginner"}]',
    '{"mountain","desert","sea","village"}', '{"slow_travel","off_beat"}', '{"reduce_carbon","support_local","respect_cultures"}',
    100, true, 55, 55, 30, 10, 20,
    NOW(), NOW()
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE '✓ Comptes +4 (provider) et +5 (eco_traveler) assurés (% / %)', v_po4, v_po5;

  -- ==========================================================================
  -- SECTION 2 — Compléter les onboardings incomplets
  -- ==========================================================================
  RAISE NOTICE '=== SECTION 2 : onboarding ===';

  -- f.akerbennoomen (eco_traveler, completion 90 → 100)
  UPDATE eco_travelers
  SET profile_completion = 100,
      interests = '[{"name": "photographie", "level": "medium"}, {"name": "randonnée", "level": "advanced"}, {"name": "artisanat", "level": "medium"}, {"name": "gastronomie", "level": "advanced"}]',
      landscapes = '{"campagne","desert","montagne"}',
      travel_styles = '{"gastronomique","nature","aventure","slow_travel"}',
      sustainability_goals = '{"offset_carbon","support_local_economy","reduce_waste"}',
      updated_at = NOW()
  WHERE user_id = v_traveler_main;

  -- fa.kerbennoomen (guide, completion 90 → 100)
  UPDATE guides
  SET profile_completion = 100,
      status = 'active',
      updated_at = NOW()
  WHERE user_id = v_guide_main;

  RAISE NOTICE '✓ Onboarding complétés (eco_traveler f.akerbennoomen + guide fa.kerbennoomen)';

  -- ==========================================================================
  -- SECTION 3 — Certifications valides ET invalides
  -- ==========================================================================
  RAISE NOTICE '=== SECTION 3 : certifications ===';

  -- 3a. Guide fa.kerbennoomen — certif VALIDE
  INSERT INTO certifications (id, user_id, name, proof_url, status, category, description, file_url, issued_by, issued_at, expires_at, created_at, updated_at)
  SELECT 'd5000000-0001-4000-8000-000000000001', v_guide_main,
    'Certificat de Guide National d''Écotourisme',
    'https://ecovoyage.tn/certificates/guide-main-2024.pdf', 'approved', 'guide_license',
    'Licence nationale de guidage écologique, délivrée après examen pratique en milieu naturel.',
    'https://ecovoyage.tn/certificates/guide-main-2024.pdf', 'Ministère du Tourisme — ONTT',
    '2024-04-12', '2028-04-11', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM certifications WHERE user_id = v_guide_main AND category = 'guide_license');

  -- 3b. Guide +2 — certif VALIDE (secourisme)
  INSERT INTO certifications (id, user_id, name, proof_url, status, category, description, file_url, issued_by, issued_at, expires_at, created_at, updated_at)
  SELECT 'd5000000-0001-4000-8000-000000000002', v_guide2,
    'PSC1 — Premiers Secours Civiques',
    'https://ecovoyage.tn/certificates/psc1-guide2.pdf', 'approved', 'first_aid',
    'Formation aux gestes de premiers secours en milieu civique (8h).',
    'https://ecovoyage.tn/certificates/psc1-guide2.pdf', 'Croix-Rouge Tunisienne',
    '2025-01-20', '2027-01-19', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM certifications WHERE user_id = v_guide2 AND category = 'first_aid');

  -- 3c. Guide +2 — certif INVALIDE (rejetée) avec motif
  INSERT INTO certifications (id, user_id, name, proof_url, status, category, description, file_url, issued_by, issued_at, expires_at, rejection_reason, created_at, updated_at)
  SELECT 'd5000000-0001-4000-8000-000000000003', v_guide2,
    'Diplôme de Spéléologie Professionnelle',
    'https://ecovoyage.tn/certificates/spelco-guide2.pdf', 'rejected', 'speciality',
    'Attestation de niveau 2 en spéléologie (justificatif attendu).',
    'https://ecovoyage.tn/certificates/spelco-guide2.pdf', 'FFS — Fédération de Spéléologie',
    '2025-06-01', '2028-05-31', 'Document non lisible et aucun justificatif officiel fourni.', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM certifications WHERE id = 'd5000000-0001-4000-8000-000000000003');

  -- 3d. Provider principal — certif VALIDE (Green Key)
  INSERT INTO certifications (id, user_id, name, proof_url, status, category, description, file_url, issued_by, issued_at, expires_at, created_at, updated_at)
  SELECT 'd5000000-0001-4000-8000-000000000004', v_po_main,
    'Green Key — Écotourisme & Hébergement durable',
    'https://ecovoyage.tn/certificates/greenkey-main.pdf', 'approved', 'eco_label',
    'Label international récompensant les hébergements touristiques responsables.',
    'https://ecovoyage.tn/certificates/greenkey-main.pdf', 'Foundation for Environmental Education',
    '2024-10-05', '2027-10-04', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM certifications WHERE user_id = v_po_main AND category = 'eco_label');

  -- 3e. Provider principal — certif INVALIDE (rejetée)
  INSERT INTO certifications (id, user_id, name, proof_url, status, category, description, file_url, issued_by, issued_at, expires_at, rejection_reason, created_at, updated_at)
  SELECT 'd5000000-0001-4000-8000-000000000005', v_po_main,
    'ISO 14001 — Management Environnemental',
    'https://ecovoyage.tn/certificates/iso14001-main.pdf', 'rejected', 'iso',
    'Certification environnementale internationale (dossier incomplet).',
    'https://ecovoyage.tn/certificates/iso14001-main.pdf', 'Bureau Veritas',
    NULL, NULL, 'Certificat expiré et audit de renouvellement non planifié.', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM certifications WHERE id = 'd5000000-0001-4000-8000-000000000005');

  -- 3f. Provider +1 — certif VALIDE (Travelife) en plus des 2 existantes
  INSERT INTO certifications (id, user_id, name, proof_url, status, category, description, file_url, issued_by, issued_at, expires_at, created_at, updated_at)
  SELECT 'd5000000-0001-4000-8000-000000000006', v_po1,
    'Travelife Partner — Tourisme durable',
    'https://ecovoyage.tn/certificates/travelife-p1.pdf', 'approved', 'eco_label',
    'Partenariat Travelife pour les engagements durables de l''hébergement.',
    'https://ecovoyage.tn/certificates/travelife-p1.pdf', 'Travelife Ltd',
    '2025-02-11', '2028-02-10', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM certifications WHERE user_id = v_po1 AND category = 'eco_label');

  -- 3g. Provider +4 (nouveau) — certif EN ATTENTE (pending)
  INSERT INTO certifications (id, user_id, name, proof_url, status, category, description, file_url, issued_by, issued_at, expires_at, created_at, updated_at)
  SELECT 'd5000000-0001-4000-8000-000000000007', v_po4,
    'Label Éco-Voyage — Hébergement rural',
    'https://ecovoyage.tn/certificates/ecovoyage-p4.pdf', 'pending', 'eco_label',
    'Demande de labellisation en cours d''instruction par le comité Éco-Voyage.',
    'https://ecovoyage.tn/certificates/ecovoyage-p4.pdf', 'Comité Éco-Voyage',
    NULL, NULL, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM certifications WHERE id = 'd5000000-0001-4000-8000-000000000007');

  RAISE NOTICE '✓ 7 certifications (5 valides/1 rejetée/1 en attente)';
END $$;

-- ============================================================================
-- SECTION 4 — Remplir les attributs des offres pending du provider principal
-- ============================================================================
DO $$
DECLARE
  v_po_main uuid := '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e';
  v_cat_sejour   uuid := '339fb32c-58c0-4979-9bbf-e093a178ef57';
  v_cat_activity uuid := 'f8509a3c-747f-475b-b4a0-40a32c765bfb';
  v_cat_circuit  uuid := '74b459cf-8c7a-496e-941d-5f0cdd7356db';
  v_cat_eco_tour uuid := '450c9c0b-5a94-4372-8f84-6c548eb4ebce';
  v_cat_resto    uuid := '4269fcff-40fe-478e-9214-17b2fcb01415';
BEGIN
  RAISE NOTICE '=== SECTION 4 : attributs offres pending ===';

  -- Séjour Éco-Luxe Test → vrai nom + attributs complets
  UPDATE offers SET
    title = 'Séjour Éco-Luxe La Marsa',
    category_id = v_cat_sejour,
    description = '3 nuits dans un appartement éco-rénové à La Marsa, petit-déjeuner bio, accès plage à 300m et atelier cuisine locale inclus.',
    price = 180,
    duration = '3 nuits',
    region = 'Tunis',
    min_group_size = 1,
    max_group_size = 4,
    confirmation_mode = 'automatic',
    cancellation_policy = 'Annulation gratuite jusqu''à 7 jours avant l''arrivée.',
    inclusions = 'Hébergement, petit-déjeuner bio, atelier cuisine, ménage quotidien',
    sustainability_score = 65,
    availability_start = '2026-08-01',
    availability_end = '2026-12-31',
    carbon_estimate_kg = 18.50,
    updated_at = NOW()
  WHERE id = '9cab8e32-cc20-41b3-a33a-2b6fad8699da';

  -- Séjour Éco-Luxe Sidi Bou Said → attributs complets
  UPDATE offers SET
    category_id = v_cat_sejour,
    description = '3 nuits dans un riad rénové durablement avec vue mer. Petit-déjeuner bio inclus, rooftop panoramique et produits de la ferme.',
    price = 210,
    duration = '3 nuits',
    region = 'Sidi Bou Said',
    min_group_size = 1,
    max_group_size = 3,
    confirmation_mode = 'automatic',
    cancellation_policy = 'Annulation gratuite jusqu''à 5 jours avant l''arrivée.',
    inclusions = 'Hébergement, petit-déjeuner bio, rooftop, accès wifi',
    sustainability_score = 70,
    availability_start = '2026-08-01',
    availability_end = '2026-12-31',
    carbon_estimate_kg = 14.00,
    updated_at = NOW()
  WHERE id = 'a1b1d75b-ff64-4a91-a41e-b362e61b35e4';

  -- Package Plage Verte → attributs complets
  UPDATE offers SET
    category_id = v_cat_eco_tour,
    description = 'Journée éco-responsable : accès plage privée, restaurant bio, yoga au coucher du soleil et nettoyage de plage encadré.',
    price = 95,
    duration = '1 journée',
    region = 'Hammamet',
    min_group_size = 2,
    max_group_size = 12,
    confirmation_mode = 'automatic',
    cancellation_policy = 'Annulation gratuite jusqu''à 48h avant l''activité.',
    inclusions = 'Accès plage, déjeuner bio, séance de yoga, matériel de nettoyage',
    sustainability_score = 75,
    availability_start = '2026-06-01',
    availability_end = '2026-09-30',
    carbon_estimate_kg = 8.00,
    updated_at = NOW()
  WHERE id = '57a9becf-3905-42fc-9201-62d573d75b4c';

  -- Circuit Vert Cap Bon → attributs complets
  UPDATE offers SET
    category_id = v_cat_circuit,
    description = 'Tour éco du Cap Bon : visite de fermes biologiques, dégustation locale, randonnée douce et baignade sauvage.',
    price = 65,
    duration = '1 journée',
    region = 'Nabeul',
    min_group_size = 2,
    max_group_size = 15,
    confirmation_mode = 'automatic',
    cancellation_policy = 'Annulation gratuite jusqu''à 48h avant le départ.',
    inclusions = 'Transport, guide, déjeuner local, dégustations',
    sustainability_score = 70,
    availability_start = '2026-08-01',
    availability_end = '2026-11-30',
    carbon_estimate_kg = 12.00,
    updated_at = NOW()
  WHERE id = 'b0b906c7-d02f-4760-846f-1955ddde5fb7';

  -- Kayak Aventure Tataouine → attributs complets
  UPDATE offers SET
    category_id = v_cat_activity,
    description = 'Excursion en kayak dans les gorges de Tataouine avec guide local, observation de la faune et pause baignade.',
    price = 55,
    duration = '4h',
    region = 'Tataouine',
    min_group_size = 2,
    max_group_size = 8,
    confirmation_mode = 'manual',
    cancellation_policy = 'Annulation gratuite jusqu''à 24h avant l''activité.',
    inclusions = 'Kayak, gilet, pagaie, guide, eau',
    sustainability_score = 68,
    availability_start = '2026-09-01',
    availability_end = '2027-05-31',
    carbon_estimate_kg = 4.00,
    updated_at = NOW()
  WHERE id = '2d676216-52cb-4455-8800-10705afc245b';

  RAISE NOTICE '✓ 5 offres pending remplies (catégorie, prix, capacité, inclusion, carbone)';
END $$;

-- ============================================================================
-- SECTION 5 — Acceptation / refus des guide offerings (pending → active/rejected)
-- ============================================================================
DO $$
DECLARE
  v_guide_main uuid := '87a38946-9a54-4bb4-be4a-887be312af15';
BEGIN
  RAISE NOTICE '=== SECTION 5 : guide offerings acceptées/refusées ===';

  -- Accepter "Randonnée Éco Jebel Orbata" et "Atelier Cuisine Tunisienne Bio"
  UPDATE guide_offerings SET status = 'active', updated_at = NOW()
  WHERE id IN ('4b033472-2644-4332-9be7-a54d2466d2bb', '23fdc928-8b9b-4564-9d76-921ad8b14c14')
    AND status <> 'active';

  -- Refuser "Guide Patrimoine Carthage Test" avec motif
  UPDATE guide_offerings SET
    status = 'rejected',
    updated_at = NOW()
  WHERE id = '5af28184-c896-4bd0-8ecd-786a37b3c1de'
    AND status = 'pending';

  RAISE NOTICE '✓ 2 prestations guide acceptées, 1 refusée';
END $$;

-- ============================================================================
-- SECTION 6 — Réservations sur OFFERS (statuts variés, groupes 5 & 2)
-- ============================================================================
DO $$
DECLARE
  v_traveler3     uuid := '4bdea078-7512-450a-a5c9-bd73b896d410';
  v_traveler_main uuid := '7b83e87d-276d-4d89-bb00-ab8ea1243a14';
  v_traveler5     uuid;
  v_po_main       uuid := '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e';

  -- Offres / items provider principal
  v_offer_ksour    uuid := '1d26463f-30e5-4f05-9f53-1eb12e5231f5';
  v_item_ksour     uuid := 'a95819c7-d266-4ca3-bbfb-4cb55c7791a7';
  v_offer_poterie  uuid := '31e6274d-bf53-4cd1-bbbc-5b243e626380';
  v_item_poterie   uuid := 'fa1fc1a0-0645-4758-a7c6-d1f2402a38ea';
  v_offer_sejour   uuid := '77dce710-fc13-4dcb-8c42-2bda280a76ed';
  v_item_sejour    uuid := 'c3c9727d-93b2-4bbc-b0bf-70ed1c40c679';
  v_offer_mosaic   uuid := 'f1000000-0001-4000-8000-000000000004';
  v_item_mosaic    uuid := 'f1000000-0002-4000-8000-000000000005';
  v_offer_kayak    uuid := '55000000-0001-0000-0000-000000000012';
  v_item_kayak     uuid := 'a2000000-0001-4000-8000-000000000012';
  v_offer_resto    uuid := 'f1000000-0001-4000-8000-000000000003';
  v_item_resto     uuid := 'f1000000-0002-4000-8000-000000000004';
  v_offer_troglo   uuid := 'b1000000-0001-0000-0000-000000000002';
  v_item_troglo    uuid := 'd1000000-0001-0000-0000-000000000003';
  v_offer_fermana  uuid := 'b1000000-0001-0000-0000-000000000001';
  v_item_fermana   uuid := 'd1000000-0001-0000-0000-000000000001';

  v_new_id uuid;
BEGIN
  RAISE NOTICE '=== SECTION 6 : réservations offres ===';
  SELECT id INTO v_traveler5 FROM users WHERE email = 'fakerbennoomen+5@gmail.com';

  -- 6a. CONFIRMED — Séjour Immersion Tataouine, 2 personnes (2 × 750 = 1500)
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-SEJOUR-2P') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, offer_id, offer_item_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-SEJOUR-2P', 'confirmed', 1500.00, 'TND',
      'Couple, souhaitent une chambre avec vue sur la montagne et un régime végétarien.',
      'automatic', v_traveler_main, v_offer_sejour, v_item_sejour,
      NOW() - INTERVAL '14 days', NOW() - INTERVAL '12 days');
  END IF;

  -- 6b. PENDING (en attente) — Atelier Poterie Mobile, 5 personnes (5 × 60 = 300)
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-POTERIE-5P') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, offer_id, offer_item_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-POTERIE-5P', 'pending', 300.00, 'TND',
      'Groupe de 5 adultes, atelier le matin de préférence. L''artisan peut-il se déplacer à l''hôtel ?',
      'manual', v_traveler3, v_offer_poterie, v_item_poterie,
      NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');
  END IF;

  -- 6c. REJECTED — Kayak Korba, 2 personnes (2 × 65 = 130)
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-KAYAK-REJ') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, offer_id, offer_item_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-KAYAK-REJ', 'rejected', 130.00, 'TND',
      'Créneau matinal demandé.',
      'manual', v_traveler3, v_offer_kayak, v_item_kayak,
      NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days');
  END IF;

  -- 6d. CANCELLED — Randonnée Ksour, 5 personnes (5 × 250 = 1250)
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-KSOUR-ANN') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, offer_id, offer_item_id, cancelled_at, cancel_reason, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-KSOUR-ANN', 'cancelled', 1250.00, 'TND',
      '5 participants, déjeuner inclus demandé.',
      'manual', v_traveler_main, v_offer_ksour, v_item_ksour,
      NOW() - INTERVAL '3 days', 'Fermeture temporaire de la route du Sud en raison de fortes pluies.',
      NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days');
  END IF;

  -- 6e. COMPLETED — Atelier Mosaïque Carthage, 5 personnes (5 × 90 = 450)
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-MOSAIC-5P') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, offer_id, offer_item_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-MOSAIC-5P', 'completed', 450.00, 'TND',
      'Groupe de 5, incluant un enfant de 11 ans (min_age ok).',
      'automatic', v_traveler3, v_offer_mosaic, v_item_mosaic,
      NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days');
  END IF;

  -- 6f. PENDING — Restaurant Dar El Fellah, 2 personnes (2 × 120 = 240)
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-RESTO-2P') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, offer_id, offer_item_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-RESTO-2P', 'pending', 240.00, 'TND',
      'Table à l''extérieur, dîner à 19h30, une personne allergique aux fruits de mer.',
      'manual', v_traveler5, v_offer_resto, v_item_resto,
      NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');
  END IF;

  -- 6g. CONFIRMED — Chambre Troglodyte Matmata, 5 personnes (pack 2 nuits 5 × 150 = 750)
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-TROGLO-5P') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, offer_id, offer_item_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-TROGLO-5P', 'confirmed', 750.00, 'TND',
      'Famille de 5 : 2 adultes + 3 enfants (chambres troglodytes authentiques).',
      'automatic', v_traveler5, v_offer_troglo, v_item_troglo,
      NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days');
  END IF;

  -- 6h. CANCELLED — Bungalow Kroumirie, 2 personnes
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-KROUM-ANN') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, offer_id, offer_item_id, cancelled_at, cancel_reason, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-KROUM-ANN', 'cancelled', 240.00, 'TND',
      'Chambre double, 2 nuits.',
      'automatic', v_traveler5, v_offer_fermana, v_item_fermana,
      NOW() - INTERVAL '5 days', 'Changement de programme professionnel.',
      NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days');
  END IF;

  RAISE NOTICE '✓ 8 réservations offre (confirmed/pending/rejected/cancelled/completed)';
END $$;

-- Participants des réservations de groupe (5 et 2 personnes)
DO $$
DECLARE
  v_r1 uuid;
  v_r2 uuid;
  v_r3 uuid;
BEGIN
  RAISE NOTICE '=== SECTION 6bis : participants ===';

  -- Réservation 6e (Mosaïque 5 pers)
  SELECT id INTO v_r1 FROM reservations WHERE reservation_ref = 'RES-2026-MOSAIC-5P';
  INSERT INTO reservation_participants (id, booking_id, full_name, age, document_type, document_number, is_group_leader, created_at)
  SELECT gen_random_uuid(), v_r1, t.full_name, t.age, t.document_type, t.document_number, t.is_group_leader, NOW() - INTERVAL '30 days'
  FROM (VALUES
    ('Sarra Khelifi', 29, 'cin', '11002233', true),
    ('Karim Khelifi', 34, 'cin', '11002234', false),
    ('Yosra Khelifi', 31, 'passport', 'AB445566', false),
    ('Mehdi Khelifi', 27, 'cin', '11002235', false),
    ('Nadia Khelifi', 11, 'passport', 'AB445567', false)
  ) AS t(full_name, age, document_type, document_number, is_group_leader)
  WHERE v_r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM reservation_participants WHERE booking_id = v_r1);

  -- Réservation 6b (Poterie 5 pers)
  SELECT id INTO v_r2 FROM reservations WHERE reservation_ref = 'RES-2026-POTERIE-5P';
  INSERT INTO reservation_participants (id, booking_id, full_name, age, document_type, document_number, is_group_leader, created_at)
  SELECT gen_random_uuid(), v_r2, t.full_name, t.age, t.document_type, t.document_number, t.is_group_leader, NOW() - INTERVAL '2 days'
  FROM (VALUES
    ('Sarra Khelifi', 29, 'cin', '11002233', true),
    ('Nadia Khelifi', 31, 'cin', '11002236', false),
    ('Lina Khelifi', 26, 'cin', '11002237', false),
    ('Omar Khelifi', 33, 'passport', 'AB445568', false),
    ('Amine Khelifi', 28, 'cin', '11002238', false)
  ) AS t(full_name, age, document_type, document_number, is_group_leader)
  WHERE v_r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM reservation_participants WHERE booking_id = v_r2);

  -- Réservation 6a (Séjour Immersion 2 pers)
  SELECT id INTO v_r3 FROM reservations WHERE reservation_ref = 'RES-2026-SEJOUR-2P';
  INSERT INTO reservation_participants (id, booking_id, full_name, age, document_type, document_number, is_group_leader, created_at)
  SELECT gen_random_uuid(), v_r3, t.full_name, t.age, t.document_type, t.document_number, t.is_group_leader, NOW() - INTERVAL '14 days'
  FROM (VALUES
    ('Faker Bennoomen', 32, 'passport', 'AB223344', true),
    ('Mariem Faker', 30, 'cin', '11009900', false)
  ) AS t(full_name, age, document_type, document_number, is_group_leader)
  WHERE v_r3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM reservation_participants WHERE booking_id = v_r3);

  RAISE NOTICE '✓ Participants ajoutés (groupes de 5 et 2)';
END $$;

-- ============================================================================
-- SECTION 7 — Réservations de CIRCUITS (statuts variés, groupes 5 & 2)
-- ============================================================================
DO $$
DECLARE
  v_traveler3     uuid := '4bdea078-7512-450a-a5c9-bd73b896d410';
  v_traveler_main uuid := '7b83e87d-276d-4d89-bb00-ab8ea1243a14';
  v_traveler5     uuid;
BEGIN
  RAISE NOTICE '=== SECTION 7 : réservations circuits ===';
  SELECT id INTO v_traveler5 FROM users WHERE email = 'fakerbennoomen+5@gmail.com';

  -- 7a. CONFIRMED — Magie du Sahara, 5 personnes (5 × 680 = 3400)
  IF NOT EXISTS (SELECT 1 FROM circuit_reservations WHERE id = 'e6000000-0001-4000-8000-000000000001') THEN
    INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
    VALUES ('e6000000-0001-4000-8000-000000000001', '11000000-0001-0000-0000-000000000001',
      v_traveler5, 5, 3400.00, 0, 3400.00, 'confirmed', NOW() - INTERVAL '12 days');
  END IF;

  -- 7b. PENDING — Djerba Authentique, 2 personnes (2 × 420 = 840)
  IF NOT EXISTS (SELECT 1 FROM circuit_reservations WHERE id = 'e6000000-0001-4000-8000-000000000002') THEN
    INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
    VALUES ('e6000000-0001-4000-8000-000000000002', '11000000-0001-0000-0000-000000000002',
      v_traveler3, 2, 840.00, 0, 840.00, 'pending', NOW() - INTERVAL '1 day');
  END IF;

  -- 7c. CANCELLED — Road Trip Sud, 5 personnes (5 × 890 = 4450)
  IF NOT EXISTS (SELECT 1 FROM circuit_reservations WHERE id = 'e6000000-0001-4000-8000-000000000003') THEN
    INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
    VALUES ('e6000000-0001-4000-8000-000000000003', 'a5000000-0001-4000-8000-0000000000f5',
      v_traveler_main, 5, 4450.00, 0, 4450.00, 'cancelled', NOW() - INTERVAL '15 days');
  END IF;

  -- 7d. REJECTED — Trek Kroumirie, 2 personnes (2 × 380 = 760)
  IF NOT EXISTS (SELECT 1 FROM circuit_reservations WHERE id = 'e6000000-0001-4000-8000-000000000004') THEN
    INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
    VALUES ('e6000000-0001-4000-8000-000000000004', '11000000-0001-0000-0000-000000000003',
      v_traveler3, 2, 760.00, 0, 760.00, 'rejected', NOW() - INTERVAL '7 days');
  END IF;

  -- 7e. CONFIRMED — Djerba Plongée et Saveurs, 2 personnes (2 × 550 = 1100)
  IF NOT EXISTS (SELECT 1 FROM circuit_reservations WHERE id = 'e6000000-0001-4000-8000-000000000005') THEN
    INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
    VALUES ('e6000000-0001-4000-8000-000000000005', 'a5000000-0001-4000-8000-0000000000f3',
      v_traveler_main, 2, 1100.00, 0, 1100.00, 'confirmed', NOW() - INTERVAL '5 days');
  END IF;

  -- 7f. PENDING — Île de Kerkennah, 5 personnes (5 × 250 = 1250)
  IF NOT EXISTS (SELECT 1 FROM circuit_reservations WHERE id = 'e6000000-0001-4000-8000-000000000006') THEN
    INSERT INTO circuit_reservations (id, circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
    VALUES ('e6000000-0001-4000-8000-000000000006', '11000000-0001-0000-0000-000000000006',
      v_traveler5, 5, 1250.00, 0, 1250.00, 'pending', NOW() - INTERVAL '2 days');
  END IF;

  RAISE NOTICE '✓ 6 réservations circuit (confirmed/pending/cancelled/rejected)';
END $$;

-- ============================================================================
-- SECTION 8 — Réservations GUIDES (acceptées / refusées) + sessions
-- ============================================================================
DO $$
DECLARE
  v_traveler3     uuid := '4bdea078-7512-450a-a5c9-bd73b896d410';
  v_traveler_main uuid := '7b83e87d-276d-4d89-bb00-ab8ea1243a14';
  v_traveler5     uuid;
  v_guide_main    uuid := '87a38946-9a54-4bb4-be4a-887be312af15';
  v_go_jebel      uuid := 'f3000000-0001-4000-8000-000000000001';
  v_go_carthage   uuid := 'f3000000-0001-4000-8000-000000000002';
  v_go_fernana    uuid := 'a1b00000-0001-4000-8000-000000000001';
  v_sess_jebel    uuid;
  v_sess_carthage uuid;
  v_sess_fernana  uuid;
  v_new_id        uuid;
BEGIN
  RAISE NOTICE '=== SECTION 8 : réservations guides ===';
  SELECT id INTO v_traveler5 FROM users WHERE email = 'fakerbennoomen+5@gmail.com';

  -- Sessions (si absentes)
  INSERT INTO guide_offering_sessions (id, guide_offering_id, date, start_time, end_time, total_capacity, remaining_capacity, status, created_at)
  SELECT gen_random_uuid(), v_go_jebel, '2026-10-11', '08:00', '16:00', 8, 8, 'available', NOW()
  WHERE NOT EXISTS (SELECT 1 FROM guide_offering_sessions WHERE guide_offering_id = v_go_jebel AND date = '2026-10-11');

  INSERT INTO guide_offering_sessions (id, guide_offering_id, date, start_time, end_time, total_capacity, remaining_capacity, status, created_at)
  SELECT gen_random_uuid(), v_go_carthage, '2026-09-20', '09:00', '14:00', 12, 12, 'available', NOW()
  WHERE NOT EXISTS (SELECT 1 FROM guide_offering_sessions WHERE guide_offering_id = v_go_carthage AND date = '2026-09-20');

  INSERT INTO guide_offering_sessions (id, guide_offering_id, date, start_time, end_time, total_capacity, remaining_capacity, status, created_at)
  SELECT gen_random_uuid(), v_go_fernana, '2026-11-08', '08:00', '18:00', 8, 8, 'available', NOW()
  WHERE NOT EXISTS (SELECT 1 FROM guide_offering_sessions WHERE guide_offering_id = v_go_fernana AND date = '2026-11-08');

  SELECT id INTO v_sess_jebel FROM guide_offering_sessions WHERE guide_offering_id = v_go_jebel AND date = '2026-10-11' LIMIT 1;
  SELECT id INTO v_sess_carthage FROM guide_offering_sessions WHERE guide_offering_id = v_go_carthage AND date = '2026-09-20' LIMIT 1;
  SELECT id INTO v_sess_fernana FROM guide_offering_sessions WHERE guide_offering_id = v_go_fernana AND date = '2026-11-08' LIMIT 1;

  -- 8a. CONFIRMED (acceptée) — Randonnée Jebel Ressas, 5 personnes (5 × 45 = 225)
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-GUIDE-JEBEL-5P') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, guide_offering_id, guide_offering_session_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-GUIDE-JEBEL-5P', 'confirmed', 225.00, 'TND',
      'Groupe de 5 randonneurs confirmés, prévoir une pause pique-nique végétarien.',
      'manual', v_traveler3, v_go_jebel, v_sess_jebel,
      NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days');
  END IF;

  -- 8b. REJECTED (refusée) — Visite Culturelle Carthage, 2 personnes (2 × 35 = 70)
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-GUIDE-CARTH-REJ') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, guide_offering_id, guide_offering_session_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-GUIDE-CARTH-REJ', 'rejected', 70.00, 'TND',
      'Visite en français, intéressés par les mosaïques romaines.',
      'manual', v_traveler_main, v_go_carthage, v_sess_carthage,
      NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days');
  END IF;

  -- 8c. PENDING (en attente) — Randonnée Forêt de Fernana, 5 personnes (5 × 120 = 600)
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE reservation_ref = 'RES-2026-GUIDE-FERN-5P') THEN
    INSERT INTO reservations (id, reservation_ref, status, total_price, currency, special_requests, confirmation_mode, traveler_id, guide_offering_id, guide_offering_session_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'RES-2026-GUIDE-FERN-5P', 'pending', 600.00, 'TND',
      '5 personnes, niveau intermédiaire, VTT fournis demandés.',
      'manual', v_traveler5, v_go_fernana, v_sess_fernana,
      NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');
  END IF;

  RAISE NOTICE '✓ 3 réservations guide (1 acceptée / 1 refusée / 1 en attente)';
END $$;

-- ============================================================================
-- SECTION 9 — Trip plans validés + items
-- ============================================================================
DO $$
DECLARE
  v_traveler3     uuid := '4bdea078-7512-450a-a5c9-bd73b896d410';
  v_traveler_main uuid := '7b83e87d-276d-4d89-bb00-ab8ea1243a14';
  v_traveler5     uuid;
  v_guide_main    uuid := '87a38946-9a54-4bb4-be4a-887be312af15';
  v_plan          uuid;
  v_item_ksour    uuid := 'a95819c7-d266-4ca3-bbfb-4cb55c7791a7';
  v_item_poterie  uuid := 'fa1fc1a0-0645-4758-a7c6-d1f2402a38ea';
  v_go_jebel      uuid := 'f3000000-0001-4000-8000-000000000001';
BEGIN
  RAISE NOTICE '=== SECTION 9 : trip plans validés ===';
  SELECT id INTO v_traveler5 FROM users WHERE email = 'fakerbennoomen+5@gmail.com';

  -- Valider les trip plans en draft du traveler principal
  UPDATE trip_plans SET status = 'confirmed', updated_at = NOW()
  WHERE eco_traveler_id = v_traveler_main AND status = 'draft';

  -- Valider le plan de +3 "Voyage Djerba & Sud Août 2026" s'il est encore planning
  UPDATE trip_plans SET status = 'confirmed', updated_at = NOW()
  WHERE eco_traveler_id = v_traveler3 AND status IN ('draft', 'planning');

  -- Nouveau trip plan validé pour +5
  IF NOT EXISTS (SELECT 1 FROM trip_plans WHERE title = 'Week-end Art & Désert — Douz') THEN
    INSERT INTO trip_plans (id, title, description, start_date, end_date, status, eco_traveler_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Week-end Art & Désert — Douz',
      '2 jours entre artisanat, désert et hébergement durable, coordonné par le prestataire Désert Eco-Aventures.',
      '2026-10-17', '2026-10-18', 'confirmed', v_traveler5, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days')
    RETURNING id INTO v_plan;

    -- Items du plan validé (offers + guide offering)
    INSERT INTO trip_plan_items (trip_plan_id, day_number, sort_order, offer_item_id, notes, created_at)
    SELECT v_plan, 1, 1, v_item_poterie, 'Atelier poterie le matin — l''artisan se déplace au gîte.', NOW()
    WHERE EXISTS (SELECT 1 FROM offer_items WHERE id = v_item_poterie);

    INSERT INTO trip_plan_items (trip_plan_id, day_number, sort_order, guide_offering_id, guide_id, notes, created_at)
    SELECT v_plan, 2, 1, v_go_jebel, v_guide_main, 'Randonnée guidée Jebel Ressas avec Fa Ker Bennoomen.', NOW()
    WHERE EXISTS (SELECT 1 FROM guide_offerings WHERE id = v_go_jebel);
  END IF;

  RAISE NOTICE '✓ Trip plans validés (confirmed) et items ajoutés';
END $$;

-- ============================================================================
-- SECTION 10 — Notifications
-- ============================================================================
DO $$
DECLARE
  v_traveler3     uuid := '4bdea078-7512-450a-a5c9-bd73b896d410';
  v_traveler_main uuid := '7b83e87d-276d-4d89-bb00-ab8ea1243a14';
  v_po_main       uuid := '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e';
  v_guide_main    uuid := '87a38946-9a54-4bb4-be4a-887be312af15';
  v_guide2        uuid := '8b8a1970-8717-45e8-b114-e1a6154363e6';
  v_po1           uuid := '8c21a605-450d-446b-bb7f-33559f6120a5';
  v_po4           uuid;
  v_traveler5     uuid;

  v_r_sejour uuid;
  v_r_poterie uuid;
  v_r_kayak uuid;
  v_r_ksour uuid;
  v_r_mosaic uuid;
  v_r_resto uuid;
  v_r_troglo uuid;
  v_r_kroum uuid;
  v_r_jebel uuid;
  v_r_carth uuid;
  v_r_fern uuid;

  v_c_magie uuid := 'e6000000-0001-4000-8000-000000000001';
  v_c_djerba uuid := 'e6000000-0001-4000-8000-000000000002';
  v_c_roadtrip uuid := 'e6000000-0001-4000-8000-000000000003';
  v_c_trek uuid := 'e6000000-0001-4000-8000-000000000004';
  v_c_plongee uuid := 'e6000000-0001-4000-8000-000000000005';
  v_c_kerkennah uuid := 'e6000000-0001-4000-8000-000000000006';
BEGIN
  RAISE NOTICE '=== SECTION 10 : notifications ===';
  SELECT id INTO v_po4 FROM users WHERE email = 'fakerbennoomen+4@gmail.com';
  SELECT id INTO v_traveler5 FROM users WHERE email = 'fakerbennoomen+5@gmail.com';

  SELECT id INTO v_r_sejour  FROM reservations WHERE reservation_ref = 'RES-2026-SEJOUR-2P';
  SELECT id INTO v_r_poterie FROM reservations WHERE reservation_ref = 'RES-2026-POTERIE-5P';
  SELECT id INTO v_r_kayak   FROM reservations WHERE reservation_ref = 'RES-2026-KAYAK-REJ';
  SELECT id INTO v_r_ksour   FROM reservations WHERE reservation_ref = 'RES-2026-KSOUR-ANN';
  SELECT id INTO v_r_mosaic  FROM reservations WHERE reservation_ref = 'RES-2026-MOSAIC-5P';
  SELECT id INTO v_r_resto   FROM reservations WHERE reservation_ref = 'RES-2026-RESTO-2P';
  SELECT id INTO v_r_troglo  FROM reservations WHERE reservation_ref = 'RES-2026-TROGLO-5P';
  SELECT id INTO v_r_kroum   FROM reservations WHERE reservation_ref = 'RES-2026-KROUM-ANN';
  SELECT id INTO v_r_jebel   FROM reservations WHERE reservation_ref = 'RES-2026-GUIDE-JEBEL-5P';
  SELECT id INTO v_r_carth   FROM reservations WHERE reservation_ref = 'RES-2026-GUIDE-CARTH-REJ';
  SELECT id INTO v_r_fern    FROM reservations WHERE reservation_ref = 'RES-2026-GUIDE-FERN-5P';

  -- 10a. Nouvelle réservation (pending) → provider + voyageur
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_po_main, 'booking_request', 'Nouvelle demande de réservation',
    'Un voyageur a envoyé une demande de réservation pour votre offre "Atelier Poterie Mobile Tataouine" (5 participants).',
    '/dashboard/incoming', false, NOW() - INTERVAL '2 days',
    '{"ref":"RES-2026-POTERIE-5P","kind":"offer"}'
  WHERE v_r_poterie IS NOT NULL AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_po_main AND type = 'booking_request' AND data->>'ref' = 'RES-2026-POTERIE-5P');

  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_traveler3, 'booking_request', 'Demande envoyée',
    'Votre demande de réservation RES-2026-POTERIE-5P (Atelier Poterie Mobile Tataouine, 5 pers.) a été envoyée au prestataire.',
    '/bookings/' || v_r_poterie, false, NOW() - INTERVAL '2 days',
    '{"ref":"RES-2026-POTERIE-5P","kind":"offer"}'
  WHERE v_r_poterie IS NOT NULL AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_traveler3 AND type = 'booking_request' AND data->>'ref' = 'RES-2026-POTERIE-5P');

  -- 10b. Réservation confirmée (automatique) → voyageur
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_traveler_main, 'booking_confirmed', 'Réservation confirmée',
    'Votre réservation RES-2026-SEJOUR-2P (Séjour Immersion Tataouine, 2 pers.) a été confirmée automatiquement.',
    '/bookings/' || v_r_sejour, false, NOW() - INTERVAL '12 days',
    '{"ref":"RES-2026-SEJOUR-2P","kind":"offer"}'
  WHERE v_r_sejour IS NOT NULL AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_traveler_main AND data->>'ref' = 'RES-2026-SEJOUR-2P');

  -- 10c. Réservation annulée → provider + voyageur
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_po_main, 'booking_cancelled', 'Réservation annulée',
    'La réservation RES-2026-KSOUR-ANN (Randonnée Guidée Ksour du Sud, 5 pers.) a été annulée. Motif : Fermeture temporaire de la route du Sud.',
    '/dashboard/incoming', false, NOW() - INTERVAL '3 days',
    '{"ref":"RES-2026-KSOUR-ANN","kind":"offer"}'
  WHERE v_r_ksour IS NOT NULL AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_po_main AND data->>'ref' = 'RES-2026-KSOUR-ANN');

  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_traveler_main, 'booking_cancelled', 'Réservation annulée',
    'Votre réservation RES-2026-KSOUR-ANN (Randonnée Guidée Ksour du Sud) a été annulée. Motif : fermeture temporaire de la route.',
    '/bookings/' || v_r_ksour, false, NOW() - INTERVAL '3 days',
    '{"ref":"RES-2026-KSOUR-ANN","kind":"offer"}'
  WHERE v_r_ksour IS NOT NULL AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_traveler_main AND data->>'ref' = 'RES-2026-KSOUR-ANN');

  -- 10d. Réservation refusée (offer) → voyageur
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_traveler3, 'booking_request', 'Réservation refusée',
    'Votre demande de réservation RES-2026-KAYAK-REJ (Kayak de Mer Korba) a été refusée par le prestataire.',
    '/bookings/' || v_r_kayak, false, NOW() - INTERVAL '4 days',
    '{"ref":"RES-2026-KAYAK-REJ","kind":"offer"}'
  WHERE v_r_kayak IS NOT NULL AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_traveler3 AND data->>'ref' = 'RES-2026-KAYAK-REJ');

  -- 10e. Nouvelle demande guide (pending) → guide
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_guide_main, 'booking_request', 'Nouvelle demande de guidage',
    'Un voyageur souhaite réserver "Randonnée Forêt de Fernana" (5 participants, le 08/11/2026).',
    '/dashboard/incoming', false, NOW() - INTERVAL '1 day',
    '{"ref":"RES-2026-GUIDE-FERN-5P","kind":"guide"}'
  WHERE v_r_fern IS NOT NULL AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_guide_main AND data->>'ref' = 'RES-2026-GUIDE-FERN-5P');

  -- 10f. Réservation guide acceptée → voyageur + guide
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_traveler3, 'booking_confirmed', 'Réservation guidage confirmée',
    'Le guide a confirmé votre réservation RES-2026-GUIDE-JEBEL-5P (Randonnée Jebel Ressas, 5 pers.).',
    '/bookings/' || v_r_jebel, false, NOW() - INTERVAL '5 days',
    '{"ref":"RES-2026-GUIDE-JEBEL-5P","kind":"guide"}'
  WHERE v_r_jebel IS NOT NULL AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_traveler3 AND data->>'ref' = 'RES-2026-GUIDE-JEBEL-5P');

  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_guide_main, 'booking_confirmed', 'Nouvelle réservation guidage confirmée',
    'Vous avez une nouvelle réservation confirmée : Randonnée Jebel Ressas (5 participants, 225 TND).',
    '/dashboard/incoming', false, NOW() - INTERVAL '5 days',
    '{"ref":"RES-2026-GUIDE-JEBEL-5P","kind":"guide"}'
  WHERE v_r_jebel IS NOT NULL AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_guide_main AND data->>'ref' = 'RES-2026-GUIDE-JEBEL-5P');

  -- 10g. Circuit confirmé → provider + voyageur
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_po_main, 'circuit_confirmed', 'Réservation circuit confirmée',
    'Un voyageur a réservé le circuit "Magie du Sahara : Douz – Tozeur – Tataouine" (5 participants, 3400 TND).',
    '/dashboard/incoming', false, NOW() - INTERVAL '12 days',
    '{"ref":"e6000000-0001-4000-8000-000000000001","kind":"circuit"}'
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_po_main AND data->>'ref' = 'e6000000-0001-4000-8000-000000000001');

  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_traveler5, 'circuit_confirmed', 'Réservation circuit confirmée',
    'Votre réservation du circuit "Magie du Sahara : Douz – Tozeur – Tataouine" (5 pers.) est confirmée.',
    '/circuits/reservations', false, NOW() - INTERVAL '12 days',
    '{"ref":"e6000000-0001-4000-8000-000000000001","kind":"circuit"}'
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_traveler5 AND data->>'ref' = 'e6000000-0001-4000-8000-000000000001');

  -- 10h. Circuit en attente → provider
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_po_main, 'circuit_pending', 'Nouvelle demande circuit',
    'Un voyageur a envoyé une demande pour le circuit "Djerba Authentique : Culture et Mer" (2 participants).',
    '/dashboard/incoming', false, NOW() - INTERVAL '1 day',
    '{"ref":"e6000000-0001-4000-8000-000000000002","kind":"circuit"}'
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_po_main AND data->>'ref' = 'e6000000-0001-4000-8000-000000000002');

  -- 10i. Certification approuvée → guide +2
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_guide2, 'admin_approved', 'Certification approuvée',
    'Votre certification "PSC1 — Premiers Secours Civiques" a été approuvée.',
    '/profile/guide/' || v_guide2, false, NOW() - INTERVAL '10 days',
    '{"certification":"psc1-guide2","status":"approved"}'
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_guide2 AND data->>'certification' = 'psc1-guide2');

  -- 10j. Certification rejetée → provider principal
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_po_main, 'admin_rejected', 'Certification refusée',
    'Votre certification "ISO 14001 — Management Environnemental" a été refusée. Motif : certificat expiré.',
    '/profile/provider/' || v_po_main, false, NOW() - INTERVAL '6 days',
    '{"certification":"iso14001-main","status":"rejected"}'
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_po_main AND data->>'certification' = 'iso14001-main');

  -- 10k. Guide offering acceptée → guide
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_guide_main, 'admin_approved', 'Prestation guide approuvée',
    'Votre prestation "Randonnée Éco Jebel Orbata" a été approuvée et est désormais visible.',
    '/guide-offerings', false, NOW() - INTERVAL '8 days',
    '{"offering":"4b033472-2644-4332-9be7-a54d2466d2bb","status":"approved"}'
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_guide_main AND data->>'offering' = '4b033472-2644-4332-9be7-a54d2466d2bb');

  -- 10l. Guide offering refusée → guide
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_guide_main, 'admin_rejected', 'Prestation guide refusée',
    'Votre prestation "Guide Patrimoine Carthage Test" a été refusée. Motif : description incomplète et assurance manquante.',
    '/guide-offerings', false, NOW() - INTERVAL '8 days',
    '{"offering":"5af28184-c896-4bd0-8ecd-786a37b3c1de","status":"rejected"}'
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_guide_main AND data->>'offering' = '5af28184-c896-4bd0-8ecd-786a37b3c1de');

  -- 10m. Trip plan validé → +5
  INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at, data)
  SELECT gen_random_uuid(), v_traveler5, 'circuit_available', 'Trip Plan validé',
    'Votre Trip Plan "Week-end Art & Désert — Douz" a été validé. Vous pouvez maintenant réserver ses composants.',
    '/trip-plans', false, NOW() - INTERVAL '3 days',
    '{"trip_plan":"week-end-art-desert-douz","status":"confirmed"}'
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = v_traveler5 AND data->>'trip_plan' = 'week-end-art-desert-douz');

  RAISE NOTICE '✓ Notifications créées (réservations, annulations, certifications, guides, trip plans)';
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
DO $$
DECLARE
  n_users INT; n_res INT; n_circ INT; n_cert INT; n_notif INT;
BEGIN
  SELECT count(*) INTO n_users FROM users WHERE email LIKE 'fakerbennoomen%';
  SELECT count(*) INTO n_res   FROM reservations WHERE reservation_ref LIKE 'RES-2026-%';
  SELECT count(*) INTO n_circ  FROM circuit_reservations WHERE id::text LIKE 'e6000000-%';
  SELECT count(*) INTO n_cert  FROM certifications;
  SELECT count(*) INTO n_notif FROM notifications;
  RAISE NOTICE '==============================================================';
  RAISE NOTICE '✅ Enrichissement master terminé !';
  RAISE NOTICE '   Comptes fakerbennoomen+*   : %', n_users;
  RAISE NOTICE '   Nouvelles réservations     : %', n_res;
  RAISE NOTICE '   Nouvelles rés. circuits    : %', n_circ;
  RAISE NOTICE '   Certifications totales     : %', n_cert;
  RAISE NOTICE '   Notifications totales      : %', n_notif;
  RAISE NOTICE '==============================================================';
END $$;

COMMIT;

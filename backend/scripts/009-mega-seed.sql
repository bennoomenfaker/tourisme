CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_password text := crypt('17092001', gen_salt('bf', 10));
  v_now timestamp := NOW();
  uid_faker_po uuid := gen_random_uuid();
  uid_faker_traveler uuid := gen_random_uuid();
  uid_faker_guide uuid := gen_random_uuid();
  uid_karim uuid := gen_random_uuid();
  uid_leila uuid := gen_random_uuid();
  uid_ahmed uuid := gen_random_uuid();
  uid_sarah uuid := gen_random_uuid();
  uid_admin uuid := gen_random_uuid();
  idx integer;
  v_project_ids uuid[] := '{}';
  v_offer_ids uuid[] := '{}';
  v_offer_item_ids uuid[] := '{}';
  v_circuit_ids uuid[] := '{}';
  v_guide_offering_ids uuid[] := '{}';
  v_publication_ids uuid[] := '{}';
  v_trip_plan_ids uuid[] := '{}';
  v_booking_ids uuid[] := '{}';
BEGIN
  RAISE NOTICE 'Starting massive seed...';

  INSERT INTO users (id, email, password, auth_method, role, status, email_verified_at, created_at, verification_token, verification_token_expires_at, reset_password_token, reset_password_token_expires_at, refresh_token, refresh_token_expires_at, ban_until, failed_login_attempts, locked_until)
  VALUES
    (uid_faker_po, 'fakerbennoomen@gmail.com', v_password, 'email', 'project'::users_role_enum, 'active', v_now, v_now, null, null, null, null, null, null, null, 0, null),
    (uid_faker_traveler, 'f.akerbennoomen@gmail.com', v_password, 'email', 'eco_traveler'::users_role_enum, 'active', v_now, v_now, null, null, null, null, null, null, null, 0, null),
    (uid_faker_guide, 'fa.kerbennoomen@gmail.com', v_password, 'email', 'guide'::users_role_enum, 'active', v_now, v_now, null, null, null, null, null, null, null, 0, null),
    (uid_karim, 'karim.bouazizi@gmail.com', v_password, 'email', 'guide'::users_role_enum, 'active', v_now, v_now, null, null, null, null, null, null, null, 0, null),
    (uid_leila, 'leila.trabelsi@gmail.com', v_password, 'email', 'eco_traveler'::users_role_enum, 'active', v_now, v_now, null, null, null, null, null, null, null, 0, null),
    (uid_ahmed, 'ahmed.jridi@gmail.com', v_password, 'email', 'eco_traveler'::users_role_enum, 'active', v_now, v_now, null, null, null, null, null, null, null, 0, null),
    (uid_sarah, 'sarah.mansouri@gmail.com', v_password, 'email', 'eco_traveler'::users_role_enum, 'active', v_now, v_now, null, null, null, null, null, null, null, 0, null),
    (uid_admin, 'admin@ecovoyage.tn', v_password, 'email', 'admin'::users_role_enum, 'active', v_now, v_now, null, null, null, null, null, null, null, 0, null);

  FOR idx IN 1..22 LOOP
    INSERT INTO users (email, password, auth_method, role, status, email_verified_at, created_at, verification_token, verification_token_expires_at, reset_password_token, reset_password_token_expires_at, refresh_token, refresh_token_expires_at, ban_until, failed_login_attempts, locked_until)
    VALUES ('user' || idx || '@test.com', v_password, 'email', CASE WHEN idx % 3 = 0 THEN 'guide'::users_role_enum WHEN idx % 3 = 1 THEN 'eco_traveler'::users_role_enum ELSE 'project'::users_role_enum END, 'active', v_now, v_now, null, null, null, null, null, null, null, 0, null);
  END LOOP;

  INSERT INTO eco_travelers (user_id, full_name, bio, country, language, traveler_types, motivations, sustainability_values, interests, landscapes, travel_styles, sustainability_goals, profile_completion, is_onboarded, sustainability_score, score_questionnaire, score_reservations, score_feedbacks, score_partages, created_at)
  SELECT id, 'Traveler ' || substring(id::text from 1 for 8), 'Bio voyageur écologique.', 'Tunisie', 'fr', ARRAY['solo'], ARRAY['nature'], ARRAY['zero_waste'], '[{"name":"rando","level":"high"}]', ARRAY['montagne'], ARRAY['aventure'], ARRAY['reduce_waste'], 80, true, 70, 60, 30, 20, 10, v_now FROM users WHERE role = 'eco_traveler';

  INSERT INTO guides (user_id, full_name, bio, country, language, zone, specialties, languages_spoken, years_experience, status, profile_completion, is_onboarded, sustainability_score, score_questionnaire, score_reservations, score_feedbacks, created_at)
  SELECT id, 'Guide ' || substring(id::text from 1 for 8), 'Guide professionnel Tunisie.', 'Tunisie', 'fr,ar', 'Tataouine', ARRAY['rando','culture'], ARRAY['fr','ar'], 5, 'active', 85, true, 80, 75, 40, 30, v_now FROM users WHERE role = 'guide';

  INSERT INTO project_owners (user_id, full_name, bio, country, language, organization, position, profile_completion, is_onboarded, sustainability_score, score_questionnaire, score_reservations, score_feedbacks, created_at)
  SELECT id, 'PO ' || substring(id::text from 1 for 8), 'Promoteur éco-touristique.', 'Tunisie', 'fr', 'EcoVenture', 'Founder', 70, true, 75, 65, 35, 25, v_now FROM users WHERE role = 'project';

  INSERT INTO offer_categories (slug, label, icon, sort_order)
  VALUES ('eco_tour','Éco-Tour','eco',1),('accommodation','Hébergement','house',2),('activity','Activité','target',3),('restaurant','Restauration','food',4),('craft','Artisanat','craft',5),('workshop','Atelier','tools',6),('transfer','Transfert','van',7),('sejour','Séjour','stay',8),('circuit','Circuit','route',9),('other','Autre','other',10)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO projects (owner_id, name, project_type, description, region, address, status, sustainability_score, services, eco_labels, created_at, lat, lng)
  SELECT po.user_id, 'Projet ' || r.region || ' ' || floor(random()*100)::int, ARRAY['guided_tour'], 'Projet durable en ' || r.region, r.region, r.region || ' rue Eco', 'active', floor(random()*40 + 60)::int, ARRAY['guided_tour','workshop'], ARRAY['Eco-label','Bio'], v_now, 33 + random()*4.5, 8 + random()*3.5
  FROM project_owners po
  CROSS JOIN LATERAL (SELECT unnest(ARRAY['Tataouine','Djerba','Sfax','Tozeur','Nabeul','Sousse','Mahdia']) as region FROM generate_series(1, (random()*3+1)::int)) r;

  SELECT array_agg(id) INTO v_project_ids FROM projects;

  WITH offer_data AS (
    INSERT INTO offers (author_id, author_type, project_id, category_id, title, description, price, duration, offer_type, region, address, latitude, longitude, meeting_point, meeting_lat, meeting_lng, location_type, min_group_size, max_group_size, min_age, cancellation_policy, sustainability_score, confirmation_mode, status, inclusions, images, created_at)
    SELECT u.id, 'project'::text, p.id, c.id, 'Offre ' || r.region || ' ' || floor(random()*100)::int, 'Découverte écologique exceptionnelle.', floor(random()*370+30)::numeric(10,2), floor(random()*5+1)::text || ' jours', c.slug, r.region, r.region || ' Av. République', 33+random()*4.5, 8+random()*3.5, 'RDV ' || r.region, 33+random()*4.5, 8+random()*3.5, CASE WHEN random()>0.5 THEN 'fixed' ELSE 'mobile' END, floor(random()*4+1)::int, floor(random()*16+5)::int, floor(random()*5+6)::int, 'Annulation gratuite 48h avant.', floor(random()*35+60)::int, CASE WHEN random()>0.5 THEN 'automatic' ELSE 'manual' END, 'approved', 'Guide, repas, transport', ARRAY[null,null,null], v_now
    FROM users u
    CROSS JOIN LATERAL (SELECT unnest(ARRAY['Tataouine','Djerba','Sfax','Tozeur','Nabeul','Sousse','Mahdia','Matmata','Chenini','Douz']) as region FROM generate_series(1, (random()*4+2)::int)) r
    CROSS JOIN LATERAL (SELECT id, slug FROM offer_categories ORDER BY random() LIMIT 1) c
    CROSS JOIN LATERAL (SELECT id FROM projects p WHERE p.owner_id = u.id ORDER BY random() LIMIT 1) p
    WHERE u.role = 'project'::users_role_enum
    RETURNING id, author_id, project_id, category_id
  ),
  offer_item AS (
    INSERT INTO offer_items (offer_id, name, description, item_type, details_json, requires_confirmation, confirmation_mode, booking_deadline_days, cancellation_deadline_days, production_delay_days, status, created_at)
    SELECT o.id, 'Item ' || floor(random()*100)::int, 'Description item', 'activity', '{}', false, 'automatic', 3, 1, 0, 'active', v_now
    FROM offer_data o, generate_series(1, (random()*3+1)::int) gs
    RETURNING id, offer_id
  )
  INSERT INTO offer_item_prices (offer_item_id, label, price, currency, pricing_unit, min_quantity, max_quantity, is_default, status, created_at)
  SELECT oi.id, 'Adulte', floor(random()*130+15)::numeric(10,2), 'TND', 'per_person', 1, 10, true, 'active', v_now FROM offer_item oi;

  SELECT array_agg(id) INTO v_offer_item_ids FROM offer_items;

  INSERT INTO offer_item_sessions (offer_item_id, date, start_time, end_time, total_capacity, remaining_capacity, price_override, status, created_at)
  SELECT oi.id, ('2026-0' || floor(random()*4+6)::text || '-' || lpad(floor(random()*28+1)::text, 2, '0'))::date, (lpad(floor(random()*8+8)::text, 2, '0') || ':00')::time, (lpad(floor(random()*5+16)::text, 2, '0') || ':00')::time, floor(random()*25+5), floor(random()*20+2), null, 'available', v_now
  FROM offer_items oi, generate_series(1, (random()*4+2)::int);

  INSERT INTO offer_item_capacity (offer_item_id, capacity_type, total_quantity, remaining_quantity, max_persons, min_participants, max_participants, created_at)
  SELECT oi.id, 'persons', floor(random()*45+5), floor(random()*40+3), floor(random()*10+2), 1, floor(random()*8+2), v_now
  FROM offer_items oi;

  INSERT INTO offer_item_availability_rules (offer_item_id, availability_type, start_date, end_date, weekdays, start_time, end_time, recurrence_rule, is_active, created_at)
  SELECT i, 'weekly', '2026-06-01', '2026-11-30', ARRAY[1,3,5], '09:00', '17:00', null, true, v_now
  FROM offer_items i;

  INSERT INTO guide_offerings (guide_id, title, description, languages, price, pricing_unit, min_travelers, max_travelers, service_zone_type, lat, lng, radius_km, zone_governorate, zone_municipality, displacement_allowed, displacement_max_km, displacement_type, status, confirmation_mode, created_at)
  SELECT u.id, 'Offre Guide ' || i, 'Expérience avec guide.', 'fr,ar', floor(random()*210+40)::numeric(10,2), 'hour', 1, 10, 'point', 33+random()*4.5, 8+random()*3.5, 25, 'Tataouine', 'Centre', true, 50, 'included', 'active', 'manual', v_now, v_now
  FROM users u, generate_series(1, (random()*4+2)::int) i WHERE u.role = 'guide';

  SELECT array_agg(id) INTO v_guide_offering_ids FROM guide_offerings;

  INSERT INTO guide_offering_prices (guide_offering_id, label, price, min_quantity, max_quantity, is_default, created_at)
  SELECT go.id, 'Individuel', floor(random()*200+40)::numeric(10,2), 1, 10, true, v_now FROM guide_offerings go;

  INSERT INTO guide_offering_sessions (guide_offering_id, date, start_time, end_time, total_capacity, remaining_capacity, price_override, status, created_at)
  SELECT go.id, '2026-0' || floor(random()*4+6)::text || '-' || lpad(floor(random()*28+1)::text, 2, '0'), lpad(floor(random()*7+8)::text, 2, '0') || ':00', lpad(floor(random()*6+15)::text, 2, '0') || ':00', floor(random()*20+5), floor(random()*15+2), null, 'available', v_now
  FROM guide_offerings go, generate_series(1, (random()*3+2)::int);

  INSERT INTO guide_offering_availability_rules (guide_offering_id, availability_type, start_date, end_date, weekdays, start_time, end_time, recurrence_rule, is_active, created_at)
  SELECT go.id, 'weekly', '2026-06-01', '2026-11-30', ARRAY[1,3,5], '09:00', '17:00', null, true, v_now FROM guide_offerings go;

  WITH circuit_data AS (
    INSERT INTO circuits (author_id, author_type, project_id, title, description, start_date, end_date, duration_days, duration_nights, region, base_price, currency, max_participants, booking_deadline_days, confirmation_mode, difficulty_level, inclusions, exclusions, lat, lng, address, status, images, waypoints, created_at)
    SELECT u.id, 'guide', null, 'Circuit ' || r.region || ' ' || i, 'Découverte inoubliable.', '2026-0' || floor(random()*4+7)::text || '-01', '2026-0' || floor(random()*4+9)::text || '-28', floor(random()*8+3), floor(random()*7+2), r.region, floor(random()*1300+200)::numeric(10,2), 'TND', floor(random()*15+6), 14, 'manual', 'moderate', 'Hébergement, repas, guide', 'Assurance', 33+random()*4.5, 8+random()*3.5, r.region, 'approved', ARRAY[null,null,null,null], '{}', v_now, v_now
    FROM users u, LATERAL (SELECT unnest(ARRAY['Tataouine','Djerba','Sfax','Tozeur','Nabeul','Matmata','Chenini','Douz']) as region FROM generate_series(1, (random()*3+1)::int)) r, LATERAL generate_series(1, (random()*2+1)::int) i
    WHERE u.role = 'guide'
    RETURNING id
  )
  INSERT INTO circuit_days (circuit_id, day_number, date, title, description, lat, lng, location_name, created_at)
  SELECT c.id, gs, '2026-07-' || lpad((gs+2)::text, 2, '0'), 'Jour ' || gs, 'Programme journée.', 33+random(), 8+random(), r.region, v_now
  FROM circuit_data c, generate_series(1, 5) gs, LATERAL (SELECT unnest(ARRAY['Tataouine','Djerba','Sfax']) as region) r;

  INSERT INTO circuit_program_items (circuit_day_id, title, description, start_time, end_time, is_included, is_required, emoji, duration_minutes, distance_km, transport_mode, guide_name, created_at)
  SELECT cd.id, 'Randonnée', 'Belle balade.', '09:00', '12:00', true, true, '🥾', 180, 12, 'walk', 'Guide Local', v_now
  FROM circuit_days cd, generate_series(1, 3);

  INSERT INTO circuit_options (circuit_id, option_group, option_type, is_required, is_included, extra_price, selection_mode, min_quantity, max_quantity, status, created_at)
  SELECT c.id, 'transport', 'single_choice', false, true, 50, 'single', 1, 4, 'active', v_now
  FROM circuits c, generate_series(1, 2);

  SELECT array_agg(id) INTO v_circuit_ids FROM circuits;

  INSERT INTO bookings (booking_ref, traveler_id, offer_id, offer_item_id, session_id, guide_offering_id, status, total_price, currency, special_requests, confirmation_mode, cancelled_at, cancel_reason, created_at)
  SELECT 'BK-' || substring(id::text from 1 for 8) || '-' || floor(random()*9000+1000)::text, u.id, (SELECT id FROM offers ORDER BY random() LIMIT 1), (SELECT id FROM offer_items ORDER BY random() LIMIT 1), (SELECT id FROM offer_item_sessions ORDER BY random() LIMIT 1), (SELECT id FROM guide_offerings ORDER BY random() LIMIT 1), CASE WHEN random()>0.3 THEN 'confirmed' WHEN random()>0.5 THEN 'completed' ELSE 'pending' END, floor(random()*750+50)::numeric(10,2), 'TND', CASE WHEN random()>0.5 THEN 'Allergies, assistance.' ELSE null END, 'automatic', null, null, v_now, v_now
  FROM users u WHERE u.role = 'eco_traveler' AND random() < 0.7;

  INSERT INTO booking_participants (booking_id, full_name, age, document_type, document_number, is_group_leader, created_at)
  SELECT b.id, p.prenom || ' ' || p.nom, floor(random()*65+5), 'id_card', 'ID' || floor(random()*99999), i = 1, v_now
  FROM bookings b, LATERAL (SELECT unnest(ARRAY['Ahmed','Leila','Sami','Nour','Mehdi','Yasmine','Karim','Amel','Bader','Rania']) as prenom) p, generate_series(1, floor(random()*4+1)::int) i
  WHERE b.traveler_id IN (SELECT id FROM users WHERE role = 'eco_traveler');

  INSERT INTO circuit_reservations (circuit_id, user_id, participants_count, base_total, options_total, final_total, status, created_at)
  SELECT (SELECT id FROM circuits ORDER BY random() LIMIT 1), u.id, floor(random()*5+1), floor(random()*1700+300)::numeric(10,2), floor(random()*400)::numeric(10,2), floor(random()*2100+400)::numeric(10,2), 'confirmed', v_now
  FROM users u WHERE u.role = 'eco_traveler' AND random() < 0.5;

  INSERT INTO trip_plans (eco_traveler_id, title, description, start_date, end_date, status, created_at)
  SELECT u.id, 'Road Trip ' || r.region || ' ' || i, 'Plan personnalisé.', '2026-07-15', '2026-07-22', 'planning', v_now, v_now
  FROM users u, LATERAL (SELECT unnest(ARRAY['Sud','Djerba','Nord']) as region FROM generate_series(1, (random()*2+1)::int)) r, generate_series(1, (random()*2+1)::int) i
  WHERE u.role = 'eco_traveler'
  RETURNING id;

  INSERT INTO publications (author_id, type, title, description, images, latitude, longitude, place_name, region, category, tags, popularity_score, status, created_at)
  SELECT u.id, CASE WHEN random()>0.4 THEN 'place' ELSE 'experience' END, r.title, 'Lieu magnifique.', ARRAY[null,null], 33+random()*4.5, 8+random()*3.5, r.title, r.region, r.cat, ARRAY['nature','culture'], floor(random()*490+10), 'approved', v_now, v_now
  FROM users u, LATERAL (SELECT unnest(ARRAY['Douz','Chenini','Matmata','Djerba','Tozeur','Tataouine','Hammamet','Ain Draham','Bizerte','Sidi Bouzid']) as title) r, LATERAL (SELECT unnest(ARRAY['nature','culture','plage','aventure','artisanat']) as cat) c
  WHERE random() < 0.3 LIMIT 45;

  SELECT array_agg(id) INTO v_publication_ids FROM publications;

  INSERT INTO reviews (author_id, target_type, target_id, rating, comment, photos, created_at)
  SELECT u.id, t.type, t.id, floor(random()*2+3), 'Excellent !', ARRAY[null,null], v_now, v_now
  FROM users u
  CROSS JOIN LATERAL (
    SELECT 'guide' as type, id FROM guides ORDER BY random() LIMIT 1
  ) t
  WHERE u.role = 'eco_traveler' AND random() < 0.6
  UNION ALL
  SELECT u.id, 'offer', o.id, floor(random()*2+3), 'Super offre !', ARRAY[null,null], v_now, v_now
  FROM users u, offers o WHERE u.role = 'eco_traveler' AND random() < 0.4
  UNION ALL
  SELECT u.id, 'circuit', c.id, floor(random()*2+3), 'Super circuit !', ARRAY[null,null], v_now, v_now
  FROM users u, circuits c WHERE u.role = 'eco_traveler' AND random() < 0.3;

  INSERT INTO publication_comments (publication_id, author_id, content, created_at)
  SELECT p.id, u.id, 'Magnifique !', v_now FROM publications p, users u WHERE random() < 0.3;

  INSERT INTO publication_likes (publication_id, user_id)
  SELECT p.id, u.id FROM publications p, users u WHERE random() < 0.2;

  INSERT INTO item_comments (offer_item_id, author_id, content, created_at)
  SELECT oi.id, u.id, 'Super activité !', v_now FROM offer_items oi, users u WHERE random() < 0.25;

  INSERT INTO item_likes (offer_item_id, user_id)
  SELECT oi.id, u.id FROM offer_items oi, users u WHERE random() < 0.2;

  INSERT INTO favorites (user_id, target_type, target_id, created_at)
  SELECT u.id, 'offer', o.id, v_now FROM users u, offers o WHERE random() < 0.3
  UNION ALL
  SELECT u.id, 'circuit', c.id, v_now FROM users u, circuits c WHERE random() < 0.2
  UNION ALL
  SELECT u.id, 'guide', g.user_id, v_now FROM users u, guides g WHERE random() < 0.15;

  INSERT INTO follows (follower_id, follower_type, following_id, following_type, created_at)
  SELECT u.id, 'eco_traveler', g.user_id, 'guide', v_now FROM users u, guides g WHERE random() < 0.3;

  INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at)
  SELECT u.id, 'new_message', 'Nouveau message', 'Contenu...', '/messages', random() > 0.4, v_now - (random() * interval '7 days')
  FROM users u WHERE random() < 0.7;

  INSERT INTO conversations (participant_a_id, participant_a_role, participant_b_id, participant_b_role, created_at)
  SELECT u1.id, u1.role, u2.id, u2.role, v_now FROM users u1, users u2 WHERE u1.id < u2.id AND random() < 0.15 LIMIT 12;

  INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at)
  SELECT c.id, c.participant_a_id, 'Bonjour, disponible en août ?', random() > 0.3, v_now FROM conversations c, generate_series(1, floor(random()*5+1)::int);

  INSERT INTO events (place_id, title, description, event_type, start_date, end_date, images, external_url, status, created_by, created_at)
  SELECT (SELECT id FROM publications ORDER BY random() LIMIT 1), 'Festival ' || i, 'Festival durable.', 'festival', '2026-0' || floor(random()*4+6)::text || '-15 10:00:00', '2026-0' || floor(random()*4+6)::text || '-15 18:00:00', ARRAY[null], 'https://ecovoyage.tn/events', 'published', u.id, v_now
  FROM users u, generate_series(1, (random()*15+5)::int) i WHERE u.role IN ('guide', 'project');

  INSERT INTO photos (url, caption, uploader_id, observable_type, observable_id, created_at)
  SELECT 'https://images.ecovoyage.tn/seed/' || i, 'Photo ' || i, u.id, 'publication', p.id, v_now
  FROM users u, generate_series(1, 40) i, publications p
  WHERE random() < 0.5
  UNION ALL
  SELECT 'https://images.ecovoyage.tn/seed/' || i, 'Photo ' || i, u.id, 'offer', o.id, v_now
  FROM users u, generate_series(1, 40) i, offers o
  WHERE random() < 0.3;

  INSERT INTO place_contributions (contributor_id, title, description, latitude, longitude, region, category, status, created_at)
  SELECT u.id, r.region || ' Lieu ' || i, 'Découverte.', 33+random()*4.5, 8+random()*3.5, r.region, r.cat, 'pending', v_now, v_now
  FROM users u, LATERAL (SELECT unnest(ARRAY['Tataouine','Djerba','Sfax']) as region FROM generate_series(1, (random()*4+1)::int)) r, LATERAL (SELECT unnest(ARRAY['nature','culture','restaurant']) as cat) c, generate_series(1, (random()*3+1)::int) i
  WHERE random() < 0.4;

  INSERT INTO contribution_votes (contribution_id, voter_id, vote_type, created_at)
  SELECT c.id, u.id, CASE WHEN random()>0.2 THEN 'up' ELSE 'down' END, v_now FROM place_contributions c, users u WHERE random() < 0.5;

  INSERT INTO friendships (user_a_id, user_b_id, status, created_at)
  SELECT u1.id, u2.id, 'accepted', v_now FROM users u1, users u2 WHERE u1.role = 'eco_traveler' AND u2.role = 'eco_traveler' AND u1.id < u2.id AND random() < 0.1;

  INSERT INTO travel_carts (eco_traveler_id, status, created_at)
  SELECT u.id, 'active', v_now FROM users u WHERE u.role = 'eco_traveler' AND random() < 0.5;

  INSERT INTO travel_cart_items (cart_id, offer_item_id, quantity, created_at)
  SELECT c.id, oi.id, floor(random()*3+1), v_now FROM travel_carts c, offer_items oi WHERE random() < 0.4;

  INSERT INTO reports (reporter_id, target_type, target_id, reason, description, status, created_at)
  SELECT u.id, 'offer', (SELECT id FROM offers ORDER BY random() LIMIT 1), 'contenu inapproprié', 'Signalement test.', 'pending', v_now
  FROM users u WHERE u.role = 'eco_traveler' AND random() < 0.2;

  INSERT INTO timeline_entries (user_id, action_type, target_type, target_id, description, metadata, created_at)
  SELECT u.id, 'booking', 'offer', (SELECT id FROM offers ORDER BY random() LIMIT 1), 'a réservé', '{}', v_now FROM users u WHERE random() < 0.4;

  INSERT INTO questionnaires (name, description, target_type, is_active, created_at)
  VALUES ('Questionnaire Éco', 'Préférences voyage.', 'eco_traveler', true, v_now, v_now);

  INSERT INTO questions (questionnaire_id, question_text, question_type, options, order_index, created_at)
  SELECT currval('questionnaires_id_seq'), 'Question ' || i, 'multiple_choice', ARRAY['A','B','C','D'], i, v_now FROM generate_series(1, 5) i;

  RAISE NOTICE 'Seed completed successfully!';
END $$;

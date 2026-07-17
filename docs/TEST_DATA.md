# Données de Test — Eco-Voyage

> **Utilisateurs, établissements, offres, circuits, réservations, avis, trip plans**
> **Base:** `tourism_db` — Docker `tourisme-db-1`

---

## 1. Utilisateurs

### Provider — fakerbennoomen+1@gmail.com

| Champ | Valeur |
|-------|--------|
| email | fakerbennoomen+1@gmail.com |
| password | Aa17092001 |
| full_name | Ahmed Benali |
| bio | Chef d'entreprise touristique basé à Djerba, passionné d'écotourisme |
| organization | Dar Djerba Eco-Lodge |
| position | Directeur |
| country | Djerba |
| website | https://nardardjerba.tn |
| phone | +216 75 123 456 |
| facebook | https://facebook.com/nardardjerba.tn |
| instagram | @nardardjerba |
| twitter | @nardardjerba |

### Guide — fakerbennoomen+2@gmail.com

| Champ | Valeur |
|-------|--------|
| email | fakerbennoomen+2@gmail.com |
| password | Aa17092001 |
| full_name | Karima Bouazizi |
| bio | Guide touristique certifié, spécialisé randonnée et nature |
| zone | Djerba |
| guide_type | Guide professionnel |
| skills_activities | Randonnée, Photographie |
| years_experience | 5 |
| skills_landscapes | Montagne, Mer & Côte |
| certifications | Guide certifié Éco-Voyage, Premiers secours |

### Éco-voyageur — fakerbennoomen+3@gmail.com

| Champ | Valeur |
|-------|--------|
| email | fakerbennoomen+3@gmail.com |
| password | Aa17092001 |
| full_name | Sarra Khelifi |
| bio | Voyageuse passionnée, à la découverte de la Tunisie authentique |

---

## 2. Établissements (Venues)

### Venue 1 — Dar Djerba Eco-Lodge

| Champ | Valeur |
|-------|--------|
| name | Dar Djerba Eco-Lodge |
| project_type | hébergement |
| services | hébergement, restauration |
| description | Éco-lodge authentique au cœur de Djerba, immersion totale dans la nature |
| address | Houmt Souk, Djerba |
| region | Médenine |
| phone | +216 75 123 456 |
| website | https://nardardjerba.tn |
| lat | 33.8756 |
| lng | 10.8585 |
| facebook | https://facebook.com/nardardjerba.tn |
| instagram | @nardardjerba |
| opening_hours | Lun-Dim: 08:00-22:00 |

### Venue 2 — Le Jardin de Djerba

| Champ | Valeur |
|-------|--------|
| name | Le Jardin de Djerba |
| project_type | restaurant |
| services | restauration |
| description | Restaurant bio avec vue sur la mer, cuisine tunisienne traditionnelle |
| lat | 33.8800 |
| lng | 10.8600 |
| address | Zone touristique, Djerba |
| region | Médenine |
| facebook | https://facebook.com/nardardjerba.tn |
| instagram | @nardardjerba |
| phone | +216 75 789 012 |
| opening_hours | Mar-Dim: 12:00-23:00 |

---

## 3. Offres

### Offre 1 — Hébergement (accommodation)

| Champ | Valeur |
|-------|--------|
| title | Suite spacieuse avec vue mer |
| offer_type | accommodation |
| venue_id | Dar Djerba Eco-Lodge |
| description | Suite spacieuse avec vue panoramique sur la Méditerranée, décoration locale authentique |
| region | Médenine |
| confirmation_mode | manual |
| cancellation_policy | moderate |

**Item — accommodation_room:**

| Champ | Valeur |
|-------|--------|
| item_type | accommodation_room |
| name | Chambre privée |
| description | Chambre privée avec vue mer |
| surface_m2 | 25 |
| etage | 1 |
| bed_count | 100 |
| lit_type | simple |
| checkin_debut | 14:00 |
| checkin_fin | 22:00 |
| checkout | 11:00 |
| booking_deadline_days | 2 |
| cancellation_deadline_days | 7 |

**Prix:**

| Champ | Valeur |
|-------|--------|
| label | Prix standard |
| amount | 120 |
| currency | TND |

---

### Offre 2 — Restaurant (restaurant)

| Champ | Valeur |
|-------|--------|
| title | Menu Dégustation Terroir |
| offer_type | restaurant |
| venue_id | Le Jardin de Djerba |
| description courte | Menu 4 plats cuisine tunisienne bio, produits de la ferme |
| description | Découvrez les saveurs de la Tunisie avec notre menu dégustation composé de 4 plats cuisinés avec des produits locaux biologiques. |
| region | Médenine |

**Item — menu:**

| Champ | Valeur |
|-------|--------|
| item_type | menu |
| name | Menu Dégustation 4 plats |
| description | Menu complet avec entrée, plat, dessert et boisson |

**Prix:**

| Champ | Valeur |
|-------|--------|
| label | Par personne |
| amount | 65 |
| currency | TND |

---

### Offre 3 — Activité (activity) — Kayak

| Champ | Valeur |
|-------|--------|
| title | Kayak Découverte Côte Ouest Djerba |
| offer_type | activity |
| venue_id | Dar Djerba Eco-Lodge |
| description | Parcours en kayak le long de la côte ouest de Djerba. Observation de la faune marine, grottes et criques secrètes. |
| region | Médenine |
| address | Plage de Sidi Mahres, Djerba |
| meeting_point | Plage de Sidi Mahres, Djerba |
| min_group_size | 2 |
| max_group_size | 12 |
| min_age | 12 |

**Item — kayak:**

| Champ | Valeur |
|-------|--------|
| item_type | kayak |
| name | Kayak Côte Ouest |
| description | Parcours en kayak le long de la côte ouest |
| parcours | Côte Ouest — Plage Sidi Mahres → Grotte des Chameaux |
| distance_km | 8 |
| duree | 2.5 heures |
| type_embarcation | kayak_double |
| nb_embarcations | 6 |
| niveau | debutant |
| savoir_nager | true |
| equipement_fourni | gilet, pagaie, combinaison, sac_etanche |

**Inclus:** guide, initiation, assurance

**Prix:**

| Champ | Valeur |
|-------|--------|
| label | Par personne |
| amount | 45 |
| currency | TND |

---

### Offre 4 — Activité (activity) — Randonnée

| Champ | Valeur |
|-------|--------|
| title | Randonnée Guidée Île de Djerba |
| offer_type | activity |
| venue_id | Dar Djerba Eco-Lodge |
| description | Parcours de 12 km à travers les oliveraies et le littoral, guide local inclus |
| price | 35 |
| currency | TND |
| duration | 5h |
| region | Médenine |
| min_group_size | 2 |
| max_group_size | 10 |
| meeting_point | Dar Djerba Eco-Lodge, 8h00 |

**Item — randonnee:**

| Champ | Valeur |
|-------|--------|
| item_type | randonnee |
| name | Randonnée oliveraies & littoral |
| description | Parcours de 12 km à travers les oliveraies et le littoral |
| distance_km | 12 |
| duree | 5h |
| niveau | debutant |

**Prix:**

| Champ | Valeur |
|-------|--------|
| label | Par personne |
| amount | 35 |
| currency | TND |

---

## 4. Circuit

### Circuit — Éco-Tour Djerba 3 jours

| Champ | Valeur |
|-------|--------|
| title | Circuit Éco-Tour Djerba 3 jours |
| description | Découverte complète de l'île de Djerba : nature, culture, gastronomie |
| region | Médenine |
| nb_jours | 3 |
| inclus | Hébergement, guide, transport, activités |
| non_inclus | Repas du midi, boissons, activités optionnelles |

### Jour 1 — Médenine — Souk & Dortoir

| Champ | Valeur |
|-------|--------|
| title | Médenine — Souk & Dortoir |
| description | Visite du souk, nuit chez l'habitant |

**Item programme:**

| Champ | Valeur |
|-------|--------|
| title | Gîte Erriadh |
| description | Gîte familial à Erriadh, ambiance authentique, dîner tunisien inclus |
| reference_type | external |
| reference_name | Gîte Erriadh |
| start_time | 15:00 |
| end_time | 22:00 |
| duration_minutes | 420 |
| distance_km | 80 (depuis Médenine) |
| transport_mode | Voiture |
| category | hebergement |
| subtypes | ["gite"] |
| guide_id | null |

### Jour 2 — Djerba — Kayak & Mangroves

| Champ | Valeur |
|-------|--------|
| title | Djerba — Kayak & Mangroves |
| description | Kayak dans les mangroves, nuit à Djerba |

**Item programme:**

| Champ | Valeur |
|-------|--------|
| title | Kayak Mangroves Djerba |
| description | Balade en kayak 2h dans les mangroves, observation oiseaux, guide inclus |
| start_time | 09:00 |
| end_time | 11:00 |
| duration_minutes | 120 |
| distance_km | 5 |
| transport_mode | Kayak |
| category | activite |
| subtypes | ["kayak"] |

### Jour 3 — Mahdia — Plage & Retour

| Champ | Valeur |
|-------|--------|
| title | Mahdia — Plage & Retour |
| description | Plage libre, retour au point de départ |

**Item programme:**

| Champ | Valeur |
|-------|--------|
| title | Retour Mahdia → Médenine |
| description | Transfert privé Mahdia vers Médenine, véhicule climatisé |
| start_time | 14:00 |
| end_time | 16:30 |
| duration_minutes | 150 |
| distance_km | 130 |
| transport_mode | Voiture |
| category | transport |
| price | 80 |
| currency | TND |

---

## 5. Réservations

### Réservation 1 — Offre Kayak (confirmed)

| Champ | Valeur |
|-------|--------|
| offer_id | Offre 3 (Kayak) |
| user_id | fakerbennoomen+3@gmail.com |
| status | confirmed |
| nb_participants | 4 |
| total_price | 180 (4 × 45 TND) |

### Réservation 2 — Offre Hébergement (pending)

| Champ | Valeur |
|-------|--------|
| offer_id | Offre 1 (Hébergement) |
| user_id | fakerbennoomen+3@gmail.com |
| status | pending |
| nb_participants | 2 |
| total_price | 240 (2 × 120 TND) |

### Réservation 3 — Circuit 3 jours (confirmed)

| Champ | Valeur |
|-------|--------|
| circuit_id | Circuit Éco-Tour Djerba 3 jours |
| user_id | fakerbennoomen+3@gmail.com |
| status | confirmed |
| nb_participants | 2 |

---

## 6. Trip Plans

### Trip Plan — Découverte Djerba

| Champ | Valeur |
|-------|--------|
| user_id | fakerbennoomen+3@gmail.com |
| title | Découverte Djerba |
| nb_days | 7 |
| region | Médenine |

**Items:**

| Jour | Activité | Lieu |
|------|----------|------|
| Jour 1 | Arrivée, installation | Dar Djerba Eco-Lodge |
| Jour 2 | Kayak Côte Ouest | Plage Sidi Mahres |
| Jour 3 | Randonnée oliveraies | Dar Djerba Eco-Lodge |
| Jour 4 | Restauration bio | Le Jardin de Djerba |
| Jour 5 | Visite souk Médenine | Médenine |
| Jour 6 | Plage libre | Djerba |
| Jour 7 | Retour | — |

---

## 7. Avis (Reviews)

| Offre | Note | Commentaire |
|-------|------|-------------|
| Suite spacieuse avec vue mer | 5 | Séjour parfait, la vue est magnifique ! |
| Menu Dégustation Terroir | 4 | Excellente cuisine, produits frais |
| Kayak Découverte Côte Ouest | 5 | Aventure incroyable, guide top ! |
| Randonnée Guidée Île de Djerba | 4 | Super randonnée, paysages magnifiques |
| Circuit Éco-Tour Djerba 3 jours | 5 | Circuit complet, très bien organisé |

---

## 8. Favoris

| user_id | offer_id |
|---------|----------|
| fakerbennoomen+3@gmail.com | Suite spacieuse avec vue mer |
| fakerbennoomen+3@gmail.com | Kayak Découverte Côte Ouest |
| fakerbennoomen+3@gmail.com | Randonnée Guidée Île de Djerba |

---

## 9. Certifications

### Provider — Ahmed Benali

| Champ | Valeur |
|-------|--------|
| name | ISO 21401 — Hébergement touristique durable |
| category | iso |
| description | Certification internationale de durabilité pour les établissements d'hébergement touristique |
| issued_by | Bureau Veritas |
| issued_at | 2025-03-15 |
| expires_at | 2027-03-14 |
| status | approved |

### Guide — Karima Bouazizi

| Champ | Valeur |
|-------|--------|
| name | Guide certifié Éco-Voyage — Niveau 2 |
| category | formation |
| description | Formation de 120h en éco-tourisme, gestion durable des sites naturels |
| issued_by | Institut Tunisien du Tourisme |
| issued_at | 2024-09-10 |
| expires_at | 2027-09-09 |
| status | approved |

| Champ | Valeur |
|-------|--------|
| name | PSC1 — Premiers Secours Civiques |
| category | first_aid |
| description | Formation aux gestes de premiers secours en milieu civique |
| issued_by | Croix-Rouge Tunisienne |
| issued_at | 2025-01-20 |
| expires_at | 2027-01-19 |
| status | pending |

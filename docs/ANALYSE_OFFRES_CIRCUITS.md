# Analyse — Offres, Circuits & Résolution du Problème d'Hébergement en Déplacement

**Date :** 2026-07-04
**Statut :** Document d'analyse + recommandation architecturale
**Auteur :** Audit du projet tourisme

---

## 1. Ce qui est déjà implémenté

L'audit du code backend confirme que **les briques existent déjà** pour gérer le scénario que tu décris. Le modèle de données supporte nativement l'association multi-acteurs dans un circuit. Voici l'état réel, dossier par dossier.

### 1.1 Module `offer/` — Catalogue de produits vendables

L'**offre** est l'unité commerciale créée par un auteur (guide OU project-owner). Une offre n'est jamais réservée directement : elle contient des **OfferItems** qui sont les vraies unités réservables.

| Entité | Rôle | Champs clés |
|---|---|---|
| `Offer` | Conteneur commercial | `author_id` + `author_type` ('guide' \| 'project_owner'), `category_id`, `region`, `latitude`, `longitude`, `address`, `meeting_point`, `meeting_lat`, `meeting_lng`, `status` |
| `OfferItem` | **Produit réservable** | `item_type` ('room' \| 'bed' \| 'camping_space' \| 'dish' \| 'menu' \| 'equipment' \| 'activity' \| 'workshop' \| 'transport_service'), `details_json` flexible, `confirmation_mode`, `requires_confirmation` |
| `OfferItemPrice` | Tarification | prix par catégorie (adulte, enfant, groupe…) |
| `OfferItemSession` | Créneaux datés | sessions ponctuelles avec date/heure |
| `OfferItemCapacity` | Capacité restante | stock disponible par date |
| `OfferItemAvailabilityRule` | Règles de récurrence | date unique / hebdo / saisonnier / annuel / custom |
| `OfferCategory` | Catégorisation | 10 catégories dont Hébergement, Restauration, Activité |

**Endpoints REST existants (`/api/offers`) :**
- `POST /offers` — création
- `GET /offers/public` — catalogue public (avec filtre `?region=…`)
- `GET /offers/:id/items` — lister les items d'une offre
- `GET /items/:itemId/sessions` — sessions datées
- `GET /items/:itemId/capacity` — capacité restante
- `POST /offers/popular-locations` — heatmap géographique

> **Conclusion 1 :** Le système sait déjà retourner des offres **par région** et **par géolocalisation** (`latitude`/`longitude`). Tu peux donc chercher des offres d'hébergement dans une localité précise.

### 1.2 Module `circuit/` — Itinéraires multi-jours

Le **circuit** est un assemblage structuré par un auteur (guide OU project-owner) avec un programme jour par jour.

| Entité | Rôle | Champs clés |
|---|---|---|
| `Circuit` | Conteneur | `author_id`, `author_type`, `region`, `lat`, `lng`, `address`, `start_date`, `end_date`, `duration_days`, `base_price`, `difficulty_level` |
| `CircuitDay` | Une journée | `day_number`, `date`, `title`, `lat`, `lng`, `location_name` |
| `CircuitProgramItem` | **Une activité** | `title`, `start_time`, `end_time`, **`linked_offer_item_id`**, **`linked_location_id`**, **`guide_id`**, `guide_name`, `emoji`, `duration_minutes`, `distance_km`, `transport_mode`, `is_included`, `is_required` |
| `CircuitOption` | Options additionnelles | transport, équipement, hébergement |
| `CircuitReservation` | Réservation globale | participants, prix total |

**Endpoints REST existants (`/api/circuits`) :**
- `POST /circuits/:id/days` — ajouter un jour
- `POST /circuits/:id/days/:dayId/program` — **ajouter une activité**
- `PATCH /circuits/:id/days/:dayId/program/:itemId` — modifier
- `DELETE /circuits/:id/days/:dayId/program/:itemId` — supprimer

> **Conclusion 2 :** `CircuitProgramItem` possède déjà **`linked_offer_item_id`**, **`linked_location_id`**, **`guide_id`**. Ce sont précisément les trois liens dont tu parles : (1) hébergement du même auteur, (2) hébergement externe, (3) guide. Le champ `linked_offer_item_id` ne filtre **PAS** par auteur — n'importe quel OfferItem de la plateforme peut y être rattaché.

### 1.3 Module `trip-plan/` — Plan personnel du voyageur

L'écovoyageur peut composer son propre plan en assemblant des OfferItems et des Circuits existants. Il sert de panier avancé.

| Entité | Rôle |
|---|---|
| `TripPlan` | Plan personnel avec dates, budget, statut (draft → planned → confirmed → completed) |
| `TripPlanItem` | Item : `offer_item_id` **XOR** `circuit_id` |

### 1.4 Module `travel-cart/` — Panier temporaire

Le voyageur ajoute des offres et circuits à un panier, puis le convertit en TripPlan structuré.

---

## 2. Cartographie du scénario que tu décris

Reformulons ton workflow en termes du modèle actuel :

```
1. CRÉER UNE OFFRE D'HÉBERGEMENT
   └─ Project-Owner X crée Offer #1 (Hébergement)
      └─ OfferItem #1 : room (chambre double)
         └─ Prix, sessions, capacité

2. CRÉER UN CIRCUIT MULTI-JOURS
   └─ Project-Owner X crée Circuit #A
      └─ Jour 1 (région A) — activité chez lui
         └─ linked_offer_item_id = #1  (sa propre chambre) ✓
      └─ Jour 2 (région B) — il se déplace
         └─ linked_offer_item_id = ???  ← PROBLÈME
            → Faut-il une chambre d'un autre owner dans la région B ?
```

### 2.1 Les trois cas d'une activité dans un circuit

| Cas | Description | Lien actuel dans `CircuitProgramItem` |
|---|---|---|
| **A — Même lieu que l'hébergement du jour** | Activité dans le même lieu que là où on dort | `linked_offer_item_id` (item du même auteur) |
| **B — Activité mobile (randonnée, kayak)** | Déplacement, besoin d'un guide | `linked_offer_item_id` (activité d'un guide) **+** `guide_id` + `guide_name` |
| **C — Déplacement vers un autre lieu, pas d'hébergement** | On dort ailleurs, besoin d'une chambre externe | `linked_offer_item_id` **d'un autre auteur** OU champ à créer |

Le cas C est celui qui te bloque. Aujourd'hui, **techniquement rien ne t'empêche** d'écrire `linked_offer_item_id = chambre_de_Y_dans_région_B` — la colonne est juste un UUID sans contrainte d'auteur. Ce qui manque, c'est :

1. **Une API de recherche d'offres tierces** dans une localité donnée avec filtrage par type (hébergement).
2. **Une UI** pour sélectionner cette offre tierce lors de la création du jour.
3. **Une gestion contractuelle** : qui touche l'argent quand le voyageur réserve le circuit (l'auteur du circuit sous-traite l'hébergement à un autre owner).

---

## 3. Réponse à ta question : « activité indépendante comme un hôtel qui offre une chambre »

Tu poses la question : *si aucun project-owner de la plateforme n'a d'offre d'hébergement dans la région B, est-ce que je crée une activité indépendante de type « hôtel offre chambre » ?*

**Réponse courte : NON, ne crée pas de type "activité externe" indépendant. Voici pourquoi et quoi faire à la place.**

### 3.1 Pourquoi pas une entité séparée « HôtelExterne »

| Problème | Impact |
|---|---|
| Duplication de modèle | Tu auras deux façons de représenter une chambre : `OfferItem` (interne) et `HôtelExterne` (externe). Tout le code de réservation, calendrier, prix devra être dupliqué. |
| Pas de réservation atomique | Si le circuit réserve un "HôtelExterne", comment savoir s'il reste de la place ? Comment bloquer la chambre ? |
| Pas de revenus pour la plateforme | Une activité 100% externe contourne le système de réservation et de paiement. |
| Pas de garantie de qualité | Pas de sustainability_score, pas de reviews, pas de modération. |
| Incohérence avec la donnée | Tu perds le lien entre la chambre et son fournisseur (avis, contact, fiabilité). |

### 3.2 La bonne architecture : trois niveaux de résolution

```
                    ┌─────────────────────────────────────┐
                    │  Création d'une activité dans un    │
                    │  jour de circuit (région B)         │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────────┐
                    │  ÉTAPE 1 : Recherche sur la plate-  │
                    │  forme d'offres d'hébergement dans  │
                    │  la région B (rayon configurable)   │
                    └──────────────┬──────────────────────┘
                                   │
                       ┌───────────┴────────────┐
                       ▼                        ▼
              ┌────────────────┐         ┌─────────────────┐
              │  RÉSULTATS     │         │  AUCUN RÉSULTAT  │
              │  TROUVÉS       │         │  sur la platef.  │
              └────────┬───────┘         └────────┬────────┘
                       ▼                          ▼
            ┌──────────────────┐       ┌────────────────────────┐
            │ Cas A : lier à   │       │ Cas B : ExternalRef    │
            │ un OfferItem     │       │ (référence externe     │
            │ tiers via        │       │  sans entité métier)   │
            │ linked_offer_    │       │                        │
            │ item_id          │       │ - nom de l'hôtel       │
            └──────────────────┘       │ - téléphone            │
                                       │ - adresse              │
                                       │ - tarif indicatif      │
                                       │ - notes                │
                                       └────────────────────────┘
```

#### Niveau 1 — Hébergement d'un autre owner de la plateforme (recommandé, **prioritaire**)

L'auteur du circuit cherche dans le catalogue public :

```
GET /api/offers/public?region=B&category=hebergement
GET /api/items?lat=X&lng=Y&radius_km=20&item_type=room
```

Puis il crée l'activité :

```
POST /api/circuits/:circuitId/days/:dayId/program
{
  "title": "Nuit à l'éco-gîte de Tata Yasmine",
  "start_time": "18:00",
  "linked_offer_item_id": "<uuid de la chambre chez Yasmine>",
  "is_included": true,
  "emoji": "🛏️"
}
```

**Avantages :**
- Réservation atomique via le module `booking` existant
- Capacité et sessions vérifiées automatiquement
- Avis, durabilité, paiement centralisés
- Yasmine touche l'argent et la plateforme prend sa commission

#### Niveau 2 — Référence externe ponctuelle (fallback)

Quand vraiment aucun owner local n'est inscrit, l'auteur du circuit documente l'hébergement comme une **référence externe** dans l'activité. Pas d'entité métier dédiée, juste un champ JSON sur `CircuitProgramItem`.

#### Niveau 3 — (Décision à prendre) Créer un compte "owner virtuel" pour l'hôtel

Si l'hôtel externe est un partenaire durable stable, **on l'invite à s'inscrire**. C'est la voie privilégiée à moyen terme : tout passe par `Offer` + `OfferItem`, le modèle est uniforme.

---

## 4. Recommandation architecturale concrète

### 4.1 Étape immédiate (1-2 jours) — Référencement externe sans nouvelle entité

Ajouter deux colonnes à `circuit_program_items` :

```typescript
// backend/src/circuit/entities/circuit-program-item.entity.ts

@Column({ type: 'varchar', nullable: true })
external_provider_name!: string | null;  // "Hôtel Dar El Houda"

@Column({ type: 'json', nullable: true })
external_reference!: {
  name?: string;
  phone?: string;
  address?: string;
  url?: string;
  estimated_price?: number;
  currency?: string;
  notes?: string;
} | null;

@Column({ type: 'boolean', default: false })
is_external_reference!: boolean;
```

**Règle métier :**
- `linked_offer_item_id` rempli → c'est une activité liée à la plateforme (cas A et B).
- `external_reference` rempli → c'est une référence externe (niveau 2).
- Les deux peuvent coexister si tu veux garder un lien interne ET une note externe (rare).

### 4.2 Étape 2 — Endpoints de recherche géolocalisée

Créer deux endpoints pour faciliter la recherche :

```typescript
// GET /api/offers/search?lat=36.4&lng=10.6&radius_km=20&item_type=room
// GET /api/offers/near?lat=36.4&lng=10.6&radius_km=20&category_id=<uuid>
```

Implémentation avec PostgreSQL `ST_DWithin` sur `(latitude, longitude)` :

```sql
SELECT o.*, ST_Distance(location_point, ST_MakePoint($lng, $lat)) AS distance_m
FROM offers o
WHERE ST_DWithin(location_point, ST_MakePoint($lng, $lat), $radius_m)
  AND status = 'approved'
  AND EXISTS (
    SELECT 1 FROM offer_items oi
    WHERE oi.offer_id = o.id AND oi.item_type IN ('room','bed','camping_space')
  )
ORDER BY distance_m ASC;
```

### 4.3 Étape 3 — UI dans le `CircuitBuilderWizard`

Dans l'étape « programme du jour », ajouter un bouton **« Chercher un hébergement à proximité »** qui ouvre une modale de recherche. Deux onglets :

1. **Sur la plateforme** — liste d'`OfferItem` filtrés par géolocalisation
2. **Référence externe** — formulaire simple (nom, téléphone, adresse, prix estimé)

### 4.4 Étape 4 (long terme) — Système de partenariat

Pour les hôtels externes récurrents, créer un programme « partenaires » qui :
- Génère une invitation à rejoindre la plateforme
- Offre une commission réduite la première année
- Permet une inscription simplifiée (workflow guided onboarding)

---

## 5. Schéma de décision final

```
                        Activité d'un jour de circuit
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ L'auteur a-t-il sa propre     │
                    │ offre d'hébergement ici ?     │
                    └───────────┬───────────────────┘
                                │
                  ┌─────────────┴─────────────┐
                  ▼                           ▼
                OUI                          NON
                  │                           │
                  ▼                           ▼
        linked_offer_item_id        Recherche d'offres tierces
        (sa propre chambre)         dans la région (rayon X km)
                                            │
                              ┌─────────────┴─────────────┐
                              ▼                           ▼
                          TROUVÉ                      RIEN
                              │                           │
                              ▼                           ▼
                    linked_offer_item_id        external_reference
                    (chambre d'un autre         (nom, tél, adresse,
                     owner de la plateforme)     prix, notes)
```

---

## 6. Résumé exécutif

| Question | Réponse |
|---|---|
| Qu'est-ce qui existe déjà ? | `Offer`, `OfferItem`, `Circuit`, `CircuitDay`, `CircuitProgramItem`, `TripPlan`, `TravelCart` — modèle polymorphe guide/project-owner déjà en place |
| Où est le lien entre activité et hébergement ? | `CircuitProgramItem.linked_offer_item_id` (UUID sans contrainte d'auteur → tu peux déjà lier un OfferItem tiers) |
| Comment chercher un hébergement tiers dans une région ? | Aujourd'hui : `GET /api/offers/public?region=X` — manque la recherche par rayon GPS |
| Faut-il créer une entité « activité externe / hôtel externe » ? | **Non.** Ajouter plutôt un champ `external_reference` (JSON) sur `CircuitProgramItem` pour les cas où aucun owner n'est inscrit |
| Cas idéal à terme ? | Tous les hébergeurs sont inscrits sur la plateforme ; le circuit lie toujours un OfferItem réel (pas de référence externe) |

**Prochaine action concrète :** implémenter l'étape 1 (3 colonnes supplémentaires sur `CircuitProgramItem`) et l'étape 2 (endpoint `/api/offers/near`).

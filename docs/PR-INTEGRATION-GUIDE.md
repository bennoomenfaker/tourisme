# Guide Technique — Integration PR pour Maram

## 1. Vue d'ensemble des features ajoutees

Ce PR contient **tout le systeme de catalogue, reservation, circuits, notifications, plans de voyage, cartes, et correctifs de bugs**.

### Features principales

| Feature | Description |
|---------|-------------|
| **Catalogue avance** | Items vendables, prix par categorie, sessions datees, capacite |
| **Reservations** | Booking avec participants, confirmation auto/manuelle, annulation |
| **Circuits multi-jours** | Programme jour par jour, GPS, images upload, options |
| **Notifications** | Systeme complet (booking, offre, message, circuit) |
| **Plans de voyage (TripPlan)** | Regrouper plusieurs offres, reserver en groupe |
| **Cartes Leaflet** | Cartes interactives sur circuits, plans de voyage, offres |
| **Upload d'images** | Deposer des images reelles (pas juste URLs) via Cloudinary |
| **Onboarding ameliore** | Validation inline, redirect loop corrige |
| **Dashboard eco-voyageur** | Section offres avec filtres, stats reelles PostgreSQL |

---

## 2. Comment integrer le PR

### Option A : Copier les fichiers (recommande)

#### Backend

1. Copier ces dossiers dans ton repo backend :
   - `backend/src/booking/` → Ajouter (complet)
   - `backend/src/circuit/` → Ajouter (complet)
   - `backend/src/notification/` → Ajouter (complet)
   - `backend/src/trip-plan/` → Ajouter (complet)

2. Copier ces fichiers modified :
   - `backend/src/app.module.ts` → Remplacer (3 imports ajoutes)
   - `backend/src/offer/entities/offer.entity.ts` → Remplacer (+colonnes)
   - `backend/src/offer/entities/offer-item.entity.ts` → Remplacer (+colonnes)
   - `backend/src/offer/offer.service.ts` → Remplacer (+methodes)
   - `backend/src/offer/offer.controller.ts` → Remplacer (+endpoints)
   - `backend/src/offer/offer.module.ts` → Remplacer (+entites)
   - `backend/src/offer/dto/offer.dto.ts` → Remplacer (+DTOs)
   - `backend/src/circuit/entities/circuit.entity.ts` → Remplacer (+images)
   - `backend/src/circuit/dto/create-circuit.dto.ts` → Remplacer (+images)
   - `backend/src/circuit/circuit.service.ts` → Remplacer
   - `backend/src/eco-traveler/eco-traveler.service.ts` → Remplacer (fix bug)
   - `backend/src/eco-traveler/eco-traveler.module.ts` → Remplacer (+imports)

3. Installer les dependances :
   ```bash
   cd backend
   npm install
   ```

4. Lancer le backend :
   ```bash
   npm run start:dev
   ```
   Les tables seront creees automatiquement (synchronize: true).

5. Seeder les categories (une seule fois) :
   ```bash
   npm run seed:offer-categories
   ```

#### Frontend

1. Copier ces dossiers :
   - `frontend/components/ImageUploader.tsx` → Ajouter
   - `frontend/components/GuidedOfferWizard.tsx` → Remplacer
   - `frontend/components/map/` → Ajouter (CircuitMap, TripMap, MapPicker)
   - `frontend/components/home/DestinationsSection.tsx` → Remplacer
   - `frontend/components/home/FeaturedExperiences.tsx` → Remplacer
   - `frontend/components/home/CircuitsSection.tsx` → Ajouter
   - `frontend/components/nav/` → Ajouter
   - `frontend/lib/offer-config.ts` → Ajouter

2. Copier ces pages :
   - `frontend/app/offers/[id]/page.tsx` → Ajouter
   - `frontend/app/reservations/new/page.tsx` → Ajouter
   - `frontend/app/dashboard/reservations/page.tsx` → Ajouter
   - `frontend/app/dashboard/incoming/page.tsx` → Ajouter
   - `frontend/app/circuits/page.tsx` → Ajouter
   - `frontend/app/circuits/[id]/page.tsx` → Ajouter
   - `frontend/app/notifications/page.tsx` → Ajouter
   - `frontend/app/trip-plans/` → Ajouter (3 pages)

3. Remplacer ces fichiers :
   - `frontend/app/dashboard/page.tsx` → Remplacer (+sections offres, circuits, edit)
   - `frontend/app/globals.css` → Remplacer
   - `frontend/lib/api.ts` → Remplacer (gestion 204)

4. Installer et lancer :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 3. Verification

### Backend

```bash
# Verifier que le serveur demarre
cd backend && npm run start:dev

# Tester les endpoints
curl http://localhost:3001/api/offers
curl http://localhost:3001/api/circuits
curl http://localhost:3001/api/notifications

# Swagger
open http://localhost:3001/swagger
```

### Frontend

```bash
# Verifier le build
cd frontend && npm run build

# Lancer en dev
npm run dev
```

### Pages a tester

| Page | URL | Test |
|------|-----|------|
| Login | `/auth/login` | Connexion eco-voyageur |
| Dashboard | `/dashboard` | Stats, offres, circuits |
| Offres | `/destinations` | Liste des offres approuvees |
| Detail offre | `/offers/[id]` | Items, prix, bouton Reserver |
| Reservation | `/reservations/new` | Formulaire participants |
| Circuits | `/circuits` | Liste des circuits |
| Detail circuit | `/circuits/[id]` | Itineraire, images, carte |
| Notifications | `/notifications` | Liste, compteur badge |
| Trip plans | `/trip-plans` | Plans de voyage |

---

## 4. Bug corrige

### Onboarding redirect loop

**Probleme :** L'eco-voyageur etait redirige vers `/onboarding/eco-traveler` apres chaque connexion.

**Cause :** `eco-traveler.service.ts` utilisait `traveler_id` (colonne DB) au lieu de `traveler: { id }` (relation TypeORM).

**Correction :**
```typescript
// AVANT (erreur)
this.bookingRepo.count({ where: { traveler_id: userId } as any })

// APRES (correct)
this.bookingRepo.count({ where: { traveler: { id: userId } as any } })
```

---

## 5. Upload d'images

Le projet utilise maintenant **Cloudinary** pour l'upload d'images reelles.

### Comment ca marche

1. L'utilisateur clique sur "Deposer une image" ou glisse-depose
2. Le fichier est envoye a `POST /upload`
3. Le backend upload vers Cloudinary
4. L'URL est stockee dans la base

### Variables d'environnement

Assure-toi d'avoir ces variables dans ton `.env` :

```
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ton_api_key
CLOUDINARY_API_SECRET=ton_api_secret
```

---

## 6. Donnees de test

Le repo contient des donnees de test reelles (Tunisie) :
- 10 utilisateurs
- 12 offres avec items/prix/sessions
- 6 circuits avec jours/programme/GPS
- 8 bookings, 6 reservations circuits
- 3 trip plans

---

## 7. Fichiers cles a ne pas oublier

| Fichier | Pourquoi |
|---------|----------|
| `backend/src/app.module.ts` | Doit importer BookingModule, CircuitModule, NotificationModule, TripPlanModule |
| `backend/src/offer/offer.module.ts` | Doit inclure toutes les entites catalogue |
| `frontend/components/ImageUploader.tsx` | Composant d'upload d'images |
| `frontend/lib/offer-config.ts` | Configuration des categories/offres par type de projet |

---

## 8. En cas de conflit

Si tu as des conflits avec ton code existant :

1. **Circuit images** : La colonne `images` est ajoutee a la table `circuits`. Si tu as deja des donnees, TypeORM les conservera.
2. **Offer items** : Les colonnes `bed_count`, `nights`, `tent_capacity`, `room_type` sont ajoutees a `offer_items`.
3. **Eco-traveler** : Les imports `Booking` et `CircuitReservation` sont ajoutes pour compter les reservations reelles.

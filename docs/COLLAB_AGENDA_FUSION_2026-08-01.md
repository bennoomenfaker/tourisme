# Fusion Collaboration & Agenda — Logique Métier unifiée

**Date :** 01/08/2026
**Contexte :** Fusion de la logique collab/agenda de Maram (PR #16 `feat/collab-agenda-offer-wizard-fixes`) avec la logique pricing/circuit de l'utilisateur, sur le repo `tourisme`.

---

## 1. Décision de fusion (le meilleur de chaque système)

| Aspect | Source | Choix retenu |
|---|---|---|
| **Invitation** | Maram | **Bidirectionnelle** — un guide OU un provider peut inviter un guide OU un provider (`invited_user_id`, `invited_user_type`, `invited_user_name`) |
| **Agenda** | Maram | Table `guide_availability_slots` + `shared/slot.utils.ts` (SlotLike, `overlappingDays`, `dispoEqual`, `toSlotType`) + sync auto offre↔collab + notifications de conflit |
| **Prix** | Utilisateur | `contribution.suggested_price → applied_price → final_price` = base + Σ des prix appliqués |
| **Circuits** | Utilisateur | `circuit_program_item_id` conservé (rétrocompat `circuit.service`) |
| **Publication** | Fusion | `publish_ready` + `final_price` (utilisateur) **ET** flux `attente_publication → approved` avec injection collaborateurs dans `details` (Maram) |

**Un seul modèle :** la table `collaborations` existante est étendue. Pas de `offer_collaborations` dupliquée, pas de double-flux de publication.

---

## 2. Base de données (migrations manuelles — synchronize: false)

```sql
-- Collaborations : colonnes bidirectionnelles
ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS invited_user_id uuid;
ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS invited_user_type varchar;  -- 'guide' | 'provider'
ALTER TABLE collaborations ADD COLUMN IF NOT EXISTS invited_user_name varchar;

-- Agenda (Maram)
CREATE TABLE IF NOT EXISTS guide_availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL,
  type varchar NOT NULL,                       -- 'specific' | 'range' | 'recurring'
  dates text[],                                -- ISO YYYY-MM-DD (type 'specific')
  start_date date,                             -- borne début (type 'range')
  end_date date,                               -- borne fin (type 'range')
  days_of_week text[],                         -- 0=Lun … 6=Dim (type 'recurring')
  label varchar,                               -- '[Offre] …' | '[Collab] … — section'
  time_slots jsonb,                            -- { date|"0"…"6": [{start,end}] }
  created_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gas_guide ON guide_availability_slots(guide_id);

-- Offres : disponibilité au format SlotLike (agenda)
ALTER TABLE offers ADD COLUMN IF NOT EXISTS disponibilite jsonb;
```

**Backfill appliqué :**
```sql
UPDATE collaborations SET invited_user_id = guide_id, invited_user_type = 'guide' WHERE invited_user_id IS NULL;
UPDATE collaborations c SET invited_user_name = g.full_name FROM guides g WHERE g.user_id = c.guide_id AND c.invited_user_name IS NULL;
```

---

## 3. Backend — fichiers modifiés

| Fichier | Changement |
|---|---|
| `backend/src/collaboration/entities/collaboration.entity.ts` | +3 colonnes bidirectionnelles |
| `backend/src/collaboration/dto/create-collaboration.dto.ts` | DTO étendu : `guide_id` (legacy) OU `invited_user_id` + `invited_user_type` + `invited_user_name` |
| `backend/src/collaboration/collaboration.service.ts` | Réécrit — invite bidirectionnelle, conflit agenda à l'acceptation, sync `updateOfferAvailability`, kick, `confirmPublish` + `publishOffer` |
| `backend/src/collaboration/collaboration.controller.ts` | Routes agenda + bidirectionnel + `publish-final`, rôles étendus à GUIDE |
| `backend/src/collaboration/collaboration.module.ts` | Enregistre `Guide`, `Provider`, `GuideAvailabilitySlot` |
| `backend/src/guide/entities/guide-availability.entity.ts` | **NOUVEAU** — entité agenda |
| `backend/src/shared/slot.utils.ts` | **NOUVEAU** — utils SlotLike (portés de Maram) |
| `backend/src/offer/entities/offer.entity.ts` | + colonne `disponibilite` jsonb |

---

## 4. Endpoints — modifications & ajouts

### Modifiés
| Méthode | Route | Changement |
|---|---|---|
| `POST` | `/api/collaborations` | Rôles `PROVIDER` + `GUIDE` ; invite bidirectionnelle ; vérifie que l'inviteur est l'auteur de l'offre ; réinvitation après refus autorisée |
| `PATCH` | `/api/collaborations/:id/respond` | Rôles `GUIDE` + `PROVIDER` ; vérifie `invited_user_id` OU `guide_id` ; conflit d'agenda bloquant à l'acceptation ; création auto du créneau `[Collab]` |
| `PATCH` | `/api/collaborations/:id/contribution` | Rôles étendus à `PROVIDER` |
| `DELETE` | `/api/collaborations/:id` | Rôles étendus à `GUIDE` (annulation par l'inviteur) |
| `GET` | `/api/collaborations/provider` | Match `provider_id` OU `invited_user_id`+type provider |
| `GET` | `/api/collaborations/guide` | Match `guide_id` OU `invited_user_id`+type guide |
| `POST` | `/api/collaborations/offer/:offerId/publish` | Fusionné : calcule `final_price` = base + Σ prix appliqués, pose `publish_ready=true` + `status='attente_publication'` |
| `PATCH` | `/api/collaborations/offer/:offerId/price` | Pose aussi `final_price` |

### Ajoutés
| Méthode | Route | Description |
|---|---|---|
| `PATCH` | `/api/collaborations/:id/kick` | L'inviteur retire un collaborateur actif (→ `declined`, contribution vidée, notif `collab_kicked`) |
| `POST` | `/api/collaborations/offer/:offerId/publish-final` | Publication finale `attente_publication → approved`, injection des collaborateurs dans `details` |
| `POST` | `/api/collaborations/offer/:offerId/collab-conflicts` | Vérifie les conflits d'agenda d'une disponibilité vs collaborateurs actifs |
| `PATCH` | `/api/collaborations/offer/:offerId/availability` | Sync l'agenda du propriétaire + des collaborateurs avec une nouvelle disponibilité (notifs `offer_schedule_changed` / `offer_schedule_conflict`) |
| `GET` | `/api/collaborations/availability` | Mes créneaux d'agenda |
| `POST` | `/api/collaborations/availability` | Ajouter un créneau |
| `DELETE` | `/api/collaborations/availability/:id` | Supprimer un créneau |

---

## 5. Logique métier — flux unifiés

### 5.1 Invitation bidirectionnelle
- **Inviteur :** guide OU provider, à condition d'être l'auteur de l'offre (`offer.author_id`).
- **Invité :** guide OU provider.
- **Doublons :** si un collab `pending/accepted/completed` existe pour (offre, invité, section) → retourné tel quel. Si `declined` → réinvitation possible (reset à `pending`, contribution vidée).
- **Notification :** `collaboration_invite` (jsonb) vers `invited_user_id`.

### 5.2 Réponse & agenda
- **Acceptation :** vérifie les créneaux agenda existants de l'invité (`overlappingDays`) ; conflit → `ConflictException` (409). Sans conflit → créneau `[Collab] {offre} — {section}` auto-créé dans `guide_availability_slots`.
- **Refus :** `declined` + `decline_reason`.
- **Notification :** `collab_accepted` / `collab_declined` vers l'inviteur.

### 5.3 Contribution (wizard 8 étapes) — pricing conservé
- Seulement si `accepted`.
- `contribution.suggested_price` (proposé) vs `contribution.applied_price` (appliqué par l'inviteur — entre dans le calcul).
- `confirmed: true` → `completed` + notification `collaboration_completed`.

### 5.4 Publication (fusion des 2 flux)
```
Collaborations actives complétées (aucune pending/accepted)
        │
        ▼
confirmPublish  →  final_price = base + Σ(applied_price) ; publish_ready = true ; status = 'attente_publication'
        │
        ▼
publishOffer    →  status = 'approved' ; details.collaborators injectés
```
- Offre visible par le voyageur uniquement quand `status = 'approved'` (filtres existants inchangés).
- Notifications `collaboration_completed` aux contributeurs lors du publish.

### 5.5 Agenda — synchronisation (Maram)
- `updateOfferAvailability` : si la disponibilité de l'offre change, recrée le créneau `[Offre]` du propriétaire **et** les créneaux `[Collab]` des collaborateurs `accepted/completed`.
- Conflit détecté vs créneaux personnels → notification `offer_schedule_conflict` ; sinon `offer_schedule_changed`.
- `checkCollabConflicts` : aperçu des conflits avant validation (utilisé par l'UI).

---

## 6. Frontend — pages/formulaires concernés (périmètre)

| Page / Composant | Impact |
|---|---|
| `frontend/app/offers/[id]/page.tsx` | Statut collab + `POST publish` (`final_price`) + `PATCH price` déjà câblés — rétrocompatibles |
| `frontend/components/collaboration/CollaborationInviteModal.tsx` | Appelle `POST /collaborations` — compatible ; à étendre pour l'invitation guide→provider |
| `frontend/components/collaboration/GuideCollaborationsTab.tsx` | Liste + respond — compatible |
| `frontend/components/collaboration/ProviderCollaborationsTab.tsx` | Liste par statut — compatible |
| `frontend/components/collaboration/CollaborationWizard.tsx` | Wizard 8 étapes (contribution) — compatible |
| `frontend/app/profile/guide/page.tsx`, `frontend/app/profile/provider/page.tsx` | Onglets collab locaux — à re-fusionner après le merge de la PR #16 (qui réécrit lourdement ces pages) |
| `frontend/app/notifications/page.tsx` | Rendu jsonb + types collab + delete (fusion notification déjà faite) |

> Note : le frontend existant reste **rétrocompatible** — les nouveaux champs sont optionnels et l'ancien appel `guide_id` fonctionne toujours. L'UI agenda (créneaux, sync, conflits) et l'invitation bidirectionnelle côté formulaire sont à construire/étendre.

---

## 7. Vérifications effectuées

- `npx tsc --noEmit -p tsconfig.json` → **0 erreur**
- `npm run build` (backend) → **OK**
- `npx jest` → **8 suites, 48 tests, tous passent**
- Démarrage `node dist/src/main.js` → **OK** (module Collaboration chargé)
- Migrations SQL → **appliquées** (colonnnes + table + backfill 9 collaborations)

---

## 8. Non bloqué / restant

- ~~**Frontend agenda** : UI de gestion des créneaux + affichage des conflits + sync depuis le formulaire offre.~~ → **fait** (`AgendaManager`, `OfferAgendaSync`)
- ~~**Invitation bidirectionnelle côté UI** : sélecteur guide/provider dans `CollaborationInviteModal`.~~ → **fait**
- **Re-fusion pages profil** après merge de la PR #16 (conflits `GuideOfferModal`, onglets Collabs, `searchGuides` limit 20 vs 50) — toujours à faire quand la PR est mergée.
- ~~**`graphify update .`** échouait sur un bug d'environnement Python (`http.client.HTTPSConnection`)~~ → **corrigé** (réinstall du tool uv sur `/usr/bin/python3.12`, voir §11.5).

---

## 9. Intégration du 2e commit PR #16 (`12bab06` — conflict cleanup, provider publish flow, approved offer lock)

**Décision :** adopter le métier de Maram (nettoyage des conflits, verrou des offres publiées, propagation des contributions, flux withdraw/leave/dismiss) **tout en gardant notre pricing** (`final_price` = base + Σ) et notre frontend `/collaborations/*`.

### 9.1 Nouveautés backend (`collaboration.service.ts`)

| Méthode | Rôle |
|---|---|
| `syncCollabConflictNotifications(userId)` | Re-évalue les notifs de conflit d'agenda après tout changement de créneau personnel (save/delete/get) ; supprime les notifs obsolètes ; nettoie les notifs orphelines des collabs `declined` dont l'offre a été supprimée ; recrée le créneau `[Collab]` manquant |
| `propagateContributionToOffer` | À `confirmed`, injecte `types`/`svcs`/`formData` de la contribution dans `offer.details` (sections `restauration|transport|hebergement|autre_service`) + pose auto `status='attente_publication'` si **toutes** les collabs actives sont complétées |
| `withdrawContribution` | L'invité quitte : bloque si offre `approved` ; vide la contribution → `declined` ; nettoie la section dans `details` ; repasse l'offre `approved/attente_publication → draft` ; supprime le créneau `[Collab]` ; nettoie les notifs de conflit ; notifie `collab_quit` |
| `leaveCollabBySlotLabel` | Quitter en supprimant le créneau agenda `[Collab] …` (parse le label, best-effort sur la collab) |
| `dismissCollaboration` | Suppression : l'invité pour `pending/declined` ; l'auteur pour tout ; bloque si offre `approved` |
| `kick` (upgradé) | Bloque si `approved` ; nettoie la section dans `details` ; repasse l'offre → `draft` ; supprime le créneau `[Collab]` ; nettoie les notifs ; marque `contribution.kicked=true` (historique préservé) |
| `searchCollaborators` | Recherche guides + prestataires (org/providers) par nom, filtrable par `mode` (catégorie) et `section` |
| `getOfferForCollaborator` | Détail offre enrichi des collaborateurs (sans les `kicked`) pour auteur/invité |

### 9.2 Verrou offre approuvée (approved lock)

- `updateContribution`, `kick`, `withdrawContribution`, `dismissCollaboration` **bloquent** si `offers.status === 'approved'`.
- `updateContribution` accepte désormais `accepted` **ou** `completed` (édition d'une contribution déjà soumise, tant que l'offre n'est pas publiée).

### 9.3 Endpoints ajoutés (`collaboration.controller.ts`)

| Méthode | Route | Description |
|---|---|---|
| `PATCH` | `/api/collaborations/:id/withdraw` | Quitter une collaboration acceptée/complétée |
| `PATCH` | `/api/collaborations/leave` | Quitter via suppression du créneau `[Collab]` (`{ slot_label }`) |
| `DELETE` | `/api/collaborations/:id/dismiss` | Supprimer (invité : pending/declined ; auteur : tout) |
| `GET` | `/api/collaborations/collaborators/search?q=&section=&mode=` | Recherche de collaborateurs |
| `GET` | `/api/collaborations/offer/:offerId/detail` | Détail offre pour collaborateur |

### 9.4 Historique de suppression d'offre (`offer.service.ts`)

- `remove()` (soft-delete) marque désormais chaque collaboration `status='declined'` + `contribution.offer_deleted=true` (avec `offer_title/description/cover`) et notifie `offer_deleted` — l'historique reste visible côté collaborateur.
- `findByGuide`/`findByProvider` sont enrichis (`offer_title`, `offer_description`, `offer_cover`, `offer_status` résolu : `offer_deleted` / `collab_kicked` / statut réel).
- `findByOffer` et `getOfferForCollaborator` excluent les collabs `kicked`.

### 9.5 Vérifications (2e intégration)

- `npx tsc --noEmit` → **0 erreur**
- `npm run build` (backend) → **OK**
- `npx jest` → **8 suites, 48 tests, tous passent** (spec offer.service mis à jour avec mocks `Collaboration` + `NotificationService`)

---

## 10. Frontend — UI collaborateur/agenda (session suivante)

**Décision :** notre frontend `/collaborations/*` conservé, étendu pour exposer le métier intégré.

| Composant | Changement |
|---|---|
| `CollaborationInviteModal.tsx` | **Bidirectionnel** : toggle Guide/Prestataire, recherche via `GET /collaborations/collaborators/search` (`mode=guide` / `mode=provider&section=`), envoi `invited_user_id/type/name` ; aperçu profil guide conservé, carte résumé pour les prestataires |
| `AgendaManager.tsx` | **NOUVEAU** — onglet Agenda des profils guide & provider : liste des créneaux (dont `[Collab]`/`[Offre]` automatiques), ajout (specific/range/recurring + horaires), suppression ; `GET/POST/DELETE /collaborations/availability` |
| `OfferAgendaSync.tsx` | **NOUVEAU** — panneau auteur sur la page offre : définit la disponibilité SlotLike, pré-vérifie les conflits (`POST /collaborations/offer/:offerId/collab-conflicts`), synchronise (`PATCH /collaborations/offer/:offerId/availability`) |
| `GuideCollaborationsTab.tsx` | Bouton **Quitter** (withdraw) pour accepted/completed → `PATCH /collaborations/:id/withdraw` |
| `ProviderCollaborationsTab.tsx` | Bouton **Retirer** (kick) pour accepted/completed → `PATCH /collaborations/:id/kick` |
| `CollaborationCard.tsx` | Actions `withdraw` (guide) + `kick` (provider) |
| `app/offers/[id]/page.tsx` | Bouton « Inviter un collaborateur » (guide ou prestataire, défaut selon le rôle auteur) + panneau `OfferAgendaSync` |
| `app/profile/guide/page.tsx`, `app/profile/provider/page.tsx` | Onglet **Agenda** ajouté |

### 10.1 Backend corrélé

- `searchCollaborators` : ajout du mode `mode=provider` (prestataires seuls, sans filtre de catégorie) — le mode non-`guide`/`provider` reste un slug de catégorie.

### 10.2 Vérifications (frontend)

- `next build` → **OK**
- `eslint` → **0 erreur** (warnings `any` cohérents avec le style existant)
- `tsc --noEmit` backend + `jest` → toujours **48 tests verts**

---

## 11. Certifications guide — source de vérité unifiée

**Décision :** la table ORM `certifications` devient l'unique source de vérité pour les certifications guide. La preuve est **obligatoire dès l'onboarding** et chaque certification passe par un workflow admin (pending → approved / refused). Seules les certifications **approuvées** sont exposées publiquement.

### 11.1 Backend

| Fichier | Changement |
|---|---|
| `backend/src/certification/certification.service.ts` | **Nouveau** `createFromOnboarding(userId, items)` — skippe les items sans label/preuve, dédoublonne par `{ user_id, name }`, crée avec `status='pending'`, `category=null`, preuve stockée dans `proof_url` (URL ou dataURL) |
| `backend/src/guide/guide.service.ts` | `getProfile` : `certifications` → `[{label, proof}]` depuis les certifs **approuvées** ORM (plus de lecture Mongo `guide_skills.certifications`). `updateExperience` : écrit `landscapes` seulement dans Mongo, transmet les `{label, proof}` filtrés à `createFromOnboarding` |
| `backend/src/guide/guide.controller.ts` | Ajout `GET /api/guide/stats` (role guide) |

### 11.2 Flux

```
Onboarding guide (étape 4)
  guide coche une certif + preuve obligatoire (URL ou photo upload)
        │  POST/PATCH /api/guide/experience
        ▼
updateExperience → createFromOnboarding (certifications table, status=pending)
        │
        ▼
Admin : /dashboard (page certifications) → approve / refuse
        │
        ▼
GET /api/certifications/user/:userId (approved, Public) → profil public
```

### 11.3 Frontend

| Page / Composant | Changement |
|---|---|
| `frontend/app/onboarding/guide/page.tsx` | `data.certifications` passe de `string[]` à `{label, proof}[]` ; `CertProofInput` (URL / upload image, check `proof.startsWith("data:")`) ; `canProceed` étape 4 exige une preuve pour chaque certif cochée ; envoi `{label, proof}` à `updateExperience` |
| `frontend/components/CertificationUploader.tsx` | Workflow admin complet (approve/refuse) — inchangé |
| `frontend/app/profile/guide/page.tsx` | Profil public via `GET /certifications/user/` (approved uniquement) — inchangé |

### 11.4 Vérifications

- `npx tsc --noEmit` frontend → **0 erreur**
- `npx tsc --noEmit` backend → **0 erreur**

### 11.5 Restant / terminé

- ~~Migration de nettoyage des anciennes certifs Mongo « fausses » (`guide_skills.certifications`)~~ → **fait** : `backend/src/database/seeds/cleanup-guide-skills-certifications.seed.ts` (npm `seed:cleanup-guide-skills-certifications`), 1 doc nettoyé, certifs `[]` en Mongo, table ORM inchangée.
- ~~`graphify update .` échouait sur le bug d'environnement Python~~ → **corrigé** : le venv uv du tool `graphifyy` pointait vers `/usr/local/bin/python3.12` (interpréteur sans le module `_ssl`, d'où `http.client.HTTPSConnection` manquant). Réinstallé avec `uv tool install graphifyy --upgrade --python /usr/bin/python3.12` (Python système fonctionnel). Graphe régénéré (12874 nœuds).

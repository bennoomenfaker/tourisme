# PR-07 — Pricing offre : prix guide récupéré par zone + réservation offre entière

**Commits (branche `main`) :** `a38322c` (pricing), `25aa0de` (réservation offre entière)
**Fichiers :** `backend/src/collaboration/*`, `backend/src/guide/guide.service.ts`, `frontend/app/offers/[id]/page.tsx`, `frontend/app/reservations/new/page.tsx`, `frontend/components/collaboration/CollaborationInviteModal.tsx`, `docs/pricing-logic.md`

## Pourquoi
Le prix affiché sur une offre avec guides ne prenait pas en compte la marge des
guides, et le formulaire de réservation laissait choisir item par item alors que le
produit vendu est **l'offre entière**. Cette PR rend le prix de l'offre cohérent
(tarif de base + prix des guides) et uniformise la réservation sur l'offre entière.

## Backend (NestJS, prefix `/api`)
1. **Invitation de guide avec prix** — `create-collaboration.dto.ts` : nouveau champ
   `guide_price?: number` (`@IsNumber @IsOptional`). `collaboration.service.ts`
   `create()` : si `invitedType === 'guide'` et `guide_price` renseigné, la
   contribution est seedée avec `{ price, applied_price, suggested_price,
   currency: 'TND', auto_recovered: true }` (également sur réinvitation après
   `DECLINED`). → le prix de l'offre intègre le guide dès l'invitation.
2. **Ajustement du prix appliqué** — nouvel endpoint
   `PATCH /collaborations/:id/applied-price` (`{ applied_price: number }`,
   rôles `PROVIDER`/`GUIDE`, authorisation via `offer.author_id`). Rejette
   `400` si l'offre est déjà publiée (`status === 'approved'`) : le prix du guide
   ne peut plus être modifié après publication. Préserve `price`/`suggested_price`
   d'origine.
3. **Statut d'offre enrichi** — `getOfferCollabStatus()` expose désormais pour
   chaque guide : `collab_id`, `applied_price`, `status`, `price`, `currency`,
   `services` (statuts `pending`/`accepted`/`completed`).
4. **Récupération du prix guide** — `guide.service.ts getPublicProfile()` renvoie
   les `offerings` (prix, zone de service, gouvernorat/municipalité, statut) qui
   alimentent la récupération automatique du prix côté frontend.

## Frontend (Next.js)
1. **Modal d'invitation** (`CollaborationInviteModal.tsx`) — à la sélection d'un
   guide, son prix est récupéré depuis ses prestations par zone :
   municipalité = région de l'offre → gouvernorat → `all_tunisia` → prix le plus
   bas actif (approximation zone). Champ « Prix du guide — récupéré
   automatiquement » pré-rempli et modifiable ; envoyé via `guide_price`.
2. **Page offre** (`offers/[id]/page.tsx`) —
   - Prix total **en lecture seule** : `basePrice + Σ applied_price` des guides
     avec détail « Tarif de base X TND + guides Y TND = Z TND ». L'édition directe
     du prix (PATCH `/collaborations/offer/:id/price`) est supprimée.
   - Panneau **« Contributions des guides »** : statut de chaque contribution
     (En attente / Accepté / Contribution validée), prix proposé par le guide,
     input **« Prix appliqué »** modifiable par le provider (auto-save blur/Entrée),
     note « Prix de l'offre = tarif de base + prix appliqué des guides ».
   - Boutons globaux uniquement : « Ajouter au panier » (ajoute **tous** les items
     actifs) et « Réserver ». Les boutons par-item « Ajouter au panier » /
     « Réserver {item} » sont retirés de « Ce qui est proposé ».
3. **Formulaire de réservation** (`reservations/new/page.tsx`) — suppression du
   select « Que souhaitez-vous réserver ? (offre entière / item) » et du choix de
   session : la réservation envoie uniquement `offer_id` + `participants` (offre
   entière). Prix affiché = tarif de l'offre (ou somme des items actifs).
   Corrige la duplication des boutons sur la page offre.

## Non touché
Circuits (`/circuits/{id}/reserve`) et Trip Plan (form + consultation) ont leurs
propres flux ; ils sont inchangés. La logique `GuideOffering` (prix, unité, zone de
service) n'a pas été modifiée.

## Vérifié
- `tsc --noEmit` backend + frontend : OK ; ESLint : 0 erreur.
- E2E : invitation `guide_price: 35` → contribution seedée (`price=35`,
  `applied_price=35`, `auto_recovered=true`) ; `PATCH :id/applied-price {42}` →
  `applied_price=42` / `price=35` ; rejet 400 sur offre `approved` ; statut d'offre
  renvoie la contribution avec `collab_id`.

## Décisions
- La réservation est exclusivement **l'offre entière** ; un éventuel besoin de
  réserver un item seul (ex. une chambre dans un hôtel multi-chambres) devra être
  retravaillé avec Maram.
- `applied_price` est la valeur qui entre dans le calcul du prix de l'offre ;
  `price` / `suggested_price` restent l'historique de l'offre du guide.

# PR-04 — Logique de pricing : documentation de référence + angles morts

**Branche :** `pr/reservation-durabilite` (commit `docs: pricing + PR descriptions`)
**Fichiers :** `docs/pricing-logic.md`, `docs/prompt-analyse-metier.md`, `docs/prs/*`

## Pourquoi
La logique de prix est le cœur économique du projet mais n'était documentée nulle
part. Cette PR formalise (vérifié contre le code) comment chaque type de vente est
facturé, pour servir de base aux décisions de monétisation (commission, acompte,
paiement en ligne) et aux discussions avec Maram.

## Contenu de docs/pricing-logic.md
1. **Principes** : prix 100% serveur, snapshot figé à la réservation, pas de
   paiement/acompte aujourd'hui.
2. **Offres** : `OfferItemPrice` (lignes Adulte/Enfant…, `pricing_unit`,
   `is_default`, bornes `min/max_quantity`), switch de calcul
   (per_person, per_person_per_night, per_room_per_night, per_bed, per_night,
   per_group, per_hour, per_day, per_trip, on_request), `session.price_override`.
3. **Circuits** : `base_price` = Σ prix des activités ; prix final =
   `base_price + guide_applied_price` ; à la réservation
   `finalTotal = base_price × participants + Σ(option.extra_price × quantité)`
   (pricing-domain.service.ts).
4. **Prestations guide** : prix unitaire × unité, capacité de session.
5. **Réservation groupée (Trip Plan)** : agrégation par catégorie.
6. **Angles morts identifiés** :
   - `deposit_percentage` stocké mais **jamais appliqué** (aucune pénalité
     no-show, aucun acompte perçu) ;
   - **aucun gateway de paiement** en ligne ;
   - surcharges saisonnières uniquement via `price_override` (pas de fenêtres
     tarifaires) ;
   - multi-devises : `currency` stocké mais pas de conversion (TND de facto) ;
   - `per_group` / `per_trip` / `on_request` non traités par le switch serveur →
     retombent sur `per_person` (prix potentiellement faux si ces unités sont
     réellement proposées aux providers).

## docs/prompt-analyse-metier.md
Prompt prêt à coller dans un autre modèle IA (Claude/GPT/Gemini) pour challenger le
business model : audit des failles de la réservation, plan de monétisation
(commission/acompte/paiement), stratégie de croissance, KPIs du funnel,
top-5 des risques.

## Décisions attendues (issues à ouvrir)
- Appliquer `deposit_percentage` (acompte) → changement de schéma + flux de
  paiement.
- Choisir le gateway de paiement (Stripe/PayPal/virement) et le modèle de
  commission.
- Uniformiser le switch de pricing sur toutes les unités du frontend.

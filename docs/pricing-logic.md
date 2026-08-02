# Logique de pricing — Éco-Voyage

Document de référence du moteur de prix, vérifié contre le code (`backend/`).
Objectif : expliquer comment chaque type de vente est facturé, pour servir de base
aux PRs et aux décisions de monétisation (acompte, commission).

## 1. Principes

1. **Les prix sont TOUJOURS calculés côté serveur.** Le client n'envoie jamais un
   montant ; il envoie les identifiants (offer_item_id, session_id, participants…)
   et le backend calcule le total à partir des lignes de prix en base.
2. **Snapshot au moment de la réservation** : le total est figé dans la réservation
   (`total_price`, `base_total`, `options_total`, `final_total`). Une évolution du
   prix du catalogue ensuite ne change pas les réservations passées.
3. **Pas de paiement en ligne ni d'acompte** : `deposit_percentage` existe sur
   `Offer` mais n'est appliqué nulle part (dead code — voir §6).

## 2. Offres (hébergement, activité, expérience)

Structure : `Offer → OfferItem` (unité vendable) → `OfferItemPrice` (lignes de prix
par catégorie de participant : Adulte / Enfant / Étudiant…).

Ligne de prix (`offer_item_prices`) :
- `price` (decimal 10,2), `currency` (défaut TND)
- `pricing_unit` : `per_person | per_night | per_hour | per_half_day | per_day`
  (le domaine complet du frontend couvre aussi `per_person_per_night`,
  `per_room_per_night`, `per_bed`, `per_group`, `per_trip`, `on_request`)
- `min_quantity` / `max_quantity` (bornes par ligne)
- `is_default` (ligne tarifaire par défaut), `status`

### Calcul (reservation.service.ts, `create` / `quote`)

```
prix_unitaire = session.price_override ?? priceRow.price
                (la session peut écraser le prix, ex. tarif dernière minute)

selon pricing_unit :
  per_person              → unitPrice × nb_participants
  per_person_per_night    → unitPrice × nb_participants × nights
  per_night               → unitPrice × nights
  per_room_per_night      → unitPrice × nights
  per_bed                 → unitPrice × bed_count × nights
  per_group / par défaut  → unitPrice × nb_participants
```

Cas particuliers :
- **Item sélectionné** : on prend la ligne `is_default` (ou la première) de
  `offerItem.prices`.
- **Aucun item sélectionné, offre avec prix indicatif** : `offer.price × participants`.
- **Aucun item sélectionné, offre multi-items** : somme des prix par défaut de tous
  les items × participants.
- **Réservation = offre entière (choix produit)** : le formulaire de réservation
  n'offre plus le choix item/session ; il envoie uniquement `offer_id` +
  `participants`, le backend somme les items actifs.
- **Prix affiché d'une offre avec guides** : `prix_offre = offer.price + Σ
  contribution.applied_price` des guides en collaboration (statuts `pending`,
  `accepted`, `completed`). `applied_price` est le prix appliqué par le provider
  (ajustable sur la page offre via `PATCH /collaborations/:id/applied-price`) ;
  `price` / `suggested_price` restent l'offre initiale du guide. À la création
  d'une invitation, le prix du guide est récupéré automatiquement depuis ses
  prestations (`GuideOffering`) par zone (municipalité → gouvernorat → toute la
  Tunisie → prix le plus bas actif) puis envoyé via `guide_price` (seed de
  `applied_price`, `auto_recovered: true`).

### Sessions & prix dynamiques
- Une `session` a une `price_override` optionnelle : si renseignée, elle remplace
  la ligne de prix (tarif saisonnier / dernière minute).
- Double-réservation de la même session par le même voyageur → bloquée
  (BadRequest) tant que la réservation n'est pas `cancelled`.

## 3. Circuits (multi-jours)

Modèle : `Circuit` + activités (4 sources) + options.

### Prix des activités (build / édition du circuit)
Chaque activité a un prix (offre personnelle = prix du catalogue ; offre externe =
prix de l'offre source ; guide = `guide_applied_price` de la collaboration ;
référence indépendante = prix saisi manuellement).

- `base_price` du circuit = somme des prix des activités (par personne).
- Prix final affiché = `base_price + guide_applied_price` (la marge du guide est
  additionnée au prix du circuit — calcul fait à la réservation, voir
  `circuit.service.ts`, `final_price`).

### Calcul à la réservation (pricing-domain.service.ts)

```
baseTotal   = base_price × nb_participants
optionsTotal = Σ (option.extra_price × quantité)
finalTotal  = baseTotal + optionsTotal
```

Résultat persisté dans `circuit_reservations` : `base_total`, `options_total`,
`final_total` + snapshot figé des participants et options.

### Contraintes
- `min_participants` / `max_participants` vérifiés côté serveur avant réservation
  (message d'erreur si le groupe est trop petit ou trop grand).
- Un circuit doit être `status = 'approved'` pour être réservable (contrôlé au
  panier ET au trip plan).

## 4. Prestations guide (GuideOffering)

- Prix unitaire sur la prestation (`GuideOffering.price`), facturé selon l'unité
  (`hour | day | half_day`…).
- La réservation pointe vers `guideOfferingSession` (date/heure) ; la capacité de
  la session (`remaining_capacity`) est décrémentée/restaurée comme pour une session
  d'offre.

## 5. Réservation groupée (Trip Plan → book)

`TripPlanService.book()` réserve chaque item du plan (offres, circuits, prestations
guide) dans une transaction. Chaque ligne reçoit son propre prix (règles §2/§3),
les totaux sont additionnés par catégorie (`base_total`, `options_total`,
`final_total`) et retournés au client.

## 6. Angles morts / décisions à prendre

| Point | État | Impact |
|---|---|---|
| `deposit_percentage` | Stocké sur `Offer`, **jamais appliqué** | Aucune pénalité no-show, aucun acompte perçu. Décision produit requise. |
| Paiement en ligne | **Aucun gateway** (Stripe/PayPal/virement) | La « réservation » est un engagement sans transaction monétaire. |
| Surcharges saisonnières | Uniquement via `session.price_override` | Pas de fenêtres tarifaires automatiques par période. |
| Multi-devises | `currency` stocké mais pas de conversion | `TND` de facto ; prévoir change si tourisme international. |
| `on_request` / `per_group` | Présents dans le frontend, non traités dans le switch de calcul | Retomber sur la branche `per_person` → prix potentiellement faux. |

> Le switch de calcul (§2) ne couvre pas tous les `pricing_unit` du frontend :
> `per_group`, `per_trip`, `on_request` retombent sur le cas par défaut. À
> uniformiser si ces unités sont réellement proposées aux providers.

# Nouvelle Logique de Tarification (Pricing Logic)

## Résumé

Implémentation de la tarification à 3 sources pour les activités et l'hébergement dans le Circuit Builder, avec pré-remplissage automatique du prix catalogue et modification possible.

---

## 1. Les 3 sources de tarification

### A. Mon offre (own)
> *Le circuit inclut MA propre offre*

| Champ | Comportement |
|-------|-------------|
| Prix catalogue | 50 TND (mon offre) |
| Prix facturé voyageur | **Pré-rempli à 50 TND** — modifiable |
| Logique | Je peux vendre à 50 TND (prix catalogue) ou 60 TND (marge) |

### B. Offre d'un autre propriétaire (other)
> *Le circuit inclut l'offre d'un autre utilisateur de la plateforme*

| Champ | Comportement |
|-------|-------------|
| Prix catalogue autre | 40 TND |
| Prix achat (ce que je paie) | **Pré-rempli à 40 TND** — modifiable |
| Prix revente (ce que je facture) | Saisie manuelle |
| Ma marge | Revente - Achat |

### C. Prestataire externe (external)
> *Hôtel/agence hors plateforme*

| Champ | Comportement |
|-------|-------------|
| Prix estimé | Saisie manuelle |
| Prestataire | Saisie manuelle |

---

## 2. Pour le guide

Le guide a son propre prix catalogue (ex: 100 TND/jour).

| Champ | Comportement |
|-------|-------------|
| Coût guide | **Pré-rempli à 100 TND** (depuis guide_offering.price) |
| Prix activité | Saisie manuelle (ex: 120 TND) |
| Ma marge | Prix activité - Coût guide - Coût offre liée |

Le prix du guide est un **coût interne**, pas le prix facturé au voyageur.

---

## 3. Modifications détaillées

### Backend
- `offer.service.ts` — `/offers/items/mine` retourne maintenant les `prices` de chaque item
- `guide.controller.ts` — Ajout du paramètre `zone` à `@Get('search')`
- `guide-search.service.ts` — Filtre par zone sur le guide

### Frontend — Types
- `MyOfferItem` (OfferItemSearchInline.tsx) — Ajout du champ `prices[]`
- `ExternalOfferModal` — Type local `MyOfferItem` mis à jour avec `prices[]`

### Frontend — ExternalOfferItemSearch
- `onSelect` passe maintenant `price?: string` en 5e paramètre

### Frontend — ExternalOfferModal
- Tab 1 "Mes offres" : Affiche le prix catalogue à côté de chaque item
- Tab 2 "Offres externes" : Passe le prix via `onSelect`
- `onSelectMyOffer` accepte `(id, price?)`

### Frontend — CircuitBuilderWizard Step 3 (Activités)
- **Nouvel input** "Prix facturé voyageur" avec icône DollarSign
- Quand une offre perso est sélectionnée → prix pré-rempli depuis le catalogue
- Quand un guide est sélectionné → "Coût guide: X TND" affiché
- Quand une offre liée existe → badge "Offre à X TND"
- Nouveau champ `guide_cost` dans `ProgramItemForm`
- Stocké dans `fields.guide_cost` au submit

### Frontend — CircuitBuilderWizard Step 5 (Hébergement)
- Source "Mon hébergement" : pré-remplissage auto depuis `offerItems` (filtre item_type)
- Message "Mon offre [nom] — prix catalogue: X TND"
- Source "Autre propriétaire" : Intégration de `ExternalOfferItemSearch` pour chercher les offres à proximité
- `useEffect` pour auto-fill quand `offerItems` sont chargés

### Frontend — GuideSearchInline
- Zone + prix déclenchent la recherche automatiquement (debounce 200ms)
- Recherche possible sans query (juste zone ou prix)
- `onSelect` passe `price?: string` depuis `offerings[0]?.price`

---

## 4. Fichiers modifiés

### Backend
| Fichier | Changement |
|---------|-----------|
| `src/guide/guide.controller.ts` | Ajout `@Query('zone')` |
| `src/guide/guide-search.service.ts` | Filtre zone + paramètre |
| `src/offer/offer.service.ts` | `findMyItems` retourne prices |

### Frontend
| Fichier | Changement |
|---------|-----------|
| `components/CircuitBuilderWizard.tsx` | Step 3: input prix + guide_cost; Step 5: auto-fill; GuideSearchInline: debounce + zone/prix auto |
| `components/ExternalOfferModal.tsx` | Type MyOfferItem + prices, onSelectMyOffer passe price |
| `components/ExternalOfferItemSearch.tsx` | onSelect passe price |
| `components/OfferItemSearchInline.tsx` | Type MyOfferItem ajout prices |
| `lib/api.ts` | (aucun changement) |
| `app/guide/search/page.tsx` | Fix hasSearched → results.length |

### Documentation
| Fichier | Changement |
|---------|-----------|
| `docs/technical/CIRCUIT_FORM_LOGIC.md` | Section tarification hébergement + activités |

---

## 5. Comment tester

1. Créer un circuit avec une activité
2. Cliquer "Sélectionner" → choisir "Mes offres" → le prix se pré-remplit
3. Ajouter un guide → le coût guide s'affiche
4. Dans Tarifs & Options → "Mon hébergement" → prix pré-rempli depuis mes offres
5. "Autre propriétaire" → chercher → cliquer → prix achat pré-rempli
6. Modifier les prix → ils restent modifiables

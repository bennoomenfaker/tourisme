# Analyse du formulaire de création d'offre — Problèmes et Solutions

## Problème 1 : Types d'établissements — Dashboard vs offer-config

**Dashboard** (`page.tsx` L187-193) utilise 5 types :
```
hebergement, restauration, artisanat, agence, centre_loisir
```

**offer-config.ts** utilise 10 types :
```
accommodation, camping, restaurant, activity_center, artisan, farm, transport, event_space, tourism_association, eco_park
```

**Valeurs différentes** : `hebergement ≠ accommodation`, `restauration ≠ restaurant`, etc.

**Solution :** Unifier. Le dashboard doit utiliser les mêmes valeurs que offer-config.ts.

---

## Problème 2 : Champs "Nombre de lits" et "Nombre de couchages" (step 3/8)

Dans `accommodation_room`, il y a 2 champs distincts :

| Champ | Section | Signification |
|-------|---------|---------------|
| `bed_count` | Informations | Nombre de **lits physiques** (ex: 2 lits) |
| `nb_couchages` | Capacité | Nombre de **places couchées** (ex: 1 lit double = 2 couchages) |
| `type_lit` | Capacité | Type de lit (simple, double, king, superposé, canapé-lit, mixte) |

**Ce n'est pas une duplication** — ce sont 2 concepts différents :
- `bed_count` = combien de lits dans la chambre
- `nb_couchages` = combien de personnes peuvent dormir

**Exemple :** Chambre avec 1 lit double + 1 superposé → `bed_count=2`, `nb_couchages=3`

**Solution :** Garder les 2 champs mais renommer pour plus de clarté :
- `bed_count` → "Nombre de lits"
- `nb_couchages` → "Capacité d'accueil (personnes)"

---

## Problème 3 : Champ `vue` — select simple ou multi ?

Dans `accommodation_room`, `vue` est un `select` simple (une seule valeur) :
```
jardin, piscine, mer, montagne, ville, aucune
```

**Problème :** Une chambre peut avoir 2 vues (ex: "mer ET montagne").

**Solution :** Changer en `multiselect` pour allowir plusieurs vues.

---

## Problème 4 : `pmr_chambre` — C'est quoi ?

`pmr_chambre` = **Personne à Mobilité Réduite** — checkbox boolean.

Signifie : la chambre est accessible aux personnes en fauteuil roulant (rampe, porte large, douche accessible, etc.).

**Solution :** Renommer en "Accessible PMR (fauteuil roulant)" pour plus de clarté.

---

## Problème 5 : Check-in — Date ou heure ?

Les champs check-in sont des **heures** (type `time`), pas des dates :

| Champ | Type | Signification |
|-------|------|---------------|
| `checkin_debut` | time | Heure **au plus tôt** d'arrivée (ex: 14:00) |
| `checkin_fin` | time | Heure **au plus tard** d'arrivée (ex: 22:00) |
| `checkout` | time | Heure **maximum** de départ (ex: 11:00) |
| `couvre_feu` | time | Heure de couvre-feu (ex: 23:00) — optionnel |

Les **dates** de disponibilité sont dans l'étape 5 (Calendrier).

---

## Problème 6 : Section "Services" dans step 3 — dépend du venue_type ?

Dans `accommodation_room`, la section "Services" contient :
- `formule_restauration` (select : sans, petit_dej, demi_pension, pension)
- `equipements_chambre` (hierarchy — équipements)
- `inclus` (hierarchy — inclus dans le prix)

**Problème :** Cette section apparaît TOUJOURS pour `accommodation_room`, même si l'établissement n'a pas sélectionné "restauration" dans ses services.

**Solution :** La section "Services" doit toujours apparaître pour l'hébergement car c'est une info sur l'offre (est-ce que le petit-déj est inclus ?), pas sur l'établissement.

---

## Problème 7 : "Inclus dans le prix" — 2 endroits différents

| Endroit | Champ | Type | Usage |
|---------|-------|------|-------|
| Step 3 (fiche technique) | `inclus` | hierarchy (checkboxes structurés) | Équipements inclus : guide, repas, transport, assurance, etc. |
| Step 6 (capacité) | `inclusions` | textarea (texte libre) | Description textuelle des inclusions |

**Ce ne sont pas les mêmes champs.** Le premier est structuré (pour les filtres), le second est descriptif.

**Solution :** Unifier en un seul champ `inclusions` (textarea) dans step 6, et supprimer le `inclus` hierarchy de step 3 pour éviter la confusion. OU garder les 2 avec des labels clairs :
- Step 3 : "Équipements inclus (pour les filtres)"
- Step 6 : "Description des inclusions"

---

## Problème 8 : Step 6 "Capacité de stock" — confusion

| Champ | Signification |
|-------|---------------|
| `minGroupSize` | Participants minimum par session (ex: 2 pour une randonnée) |
| `maxGroupSize` | Participants maximum par session (ex: 10 pour une randonnée) |
| `capacityType` | Type de stock (persons, rooms, beds, seats, tents, items, spaces) |
| `totalQuantity` | Quantité **totale** disponible (ex: 5 chambres, 20 vélos) |

**Différence :**
- `maxGroupSize` = combien de personnes **par réservation/session**
- `totalQuantity` = combien d'unités **au total** (stock global)

**Exemple :** Hôtel avec 5 chambres :
- `maxGroupSize=4` (4 personnes max par chambre)
- `totalQuantity=5` (5 chambres disponibles)

**Exemple :** Location de vélos :
- `maxGroupSize=1` (1 personne par vélo)
- `totalQuantity=20` (20 vélos au total)

**Problème :** Pour l'hébergement, `maxGroupSize` n'a pas de sens (c'est la capacité de la chambre, pas un groupe). C'est `capacite_offre` dans le schema qui gère ça.

**Solution :** Pour l'hébergement, masquer `maxGroupSize` et utiliser uniquement `capacite_offre` (du schema) + `totalQuantity` (stock).

---

## Problème 9 : Description auto-fill

L'utilisateur demande si la description peut se remplir automatiquement selon les sélections.

**Solution :** Oui, on peut générer une description basée sur :
- Type d'hébergement + vue + surface + capacité + formule restauration
- Ex: "Chambre double de 25m² avec vue mer, capacité 2 personnes, petit-déjeuner inclus"

---

## Résumé des corrections à apporter

| # | Problème | Correction |
|---|----------|------------|
| 1 | Types dashboard ≠ offer-config | Unifier les valeurs |
| 2 | bed_count vs nb_couchages | Renommer pour clarté |
| 3 | vue = select simple | Changer en multiselect |
| 4 | pmr_chambre = cryptique | Renommer "Accessible PMR" |
| 5 | Check-in = heure pas date | C'est correct, clarifier le label |
| 6 | Services toujours affiché | OK — c'est une info offre, pas établissement |
| 7 | Inclus en double | Unifier ou clarifier les labels |
| 8 | Capacité de stock confusion | Masquer maxGroupSize pour hébergement |
| 9 | Description auto-fill | Générer depuis les sélections |

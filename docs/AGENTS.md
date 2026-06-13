# Tourisme (Eco-Voyage)

## 🧑‍🤝‍🧑 Binôme
- **Maram** — propriétaire des repos frontend & backend
- **Moi** — je travaille dans `tourisme/` (root) qui contient frontend/backend en **sous-modules**
- **NE JAMAIS toucher au code de Maram directement.** Toujours PR.

## 📦 Structure — 3 repos liés (sous-modules)

```
tourisme/ (mon repo: bennoomenfaker/tourisme)   ← root, branche Faker → pushé sur origin/main
├── frontend/ → sous-module → github.com/Maram172003/eco-tourism-platform-front  [branche: main]
├── backend/  → sous-module → github.com/Maram172003/eco-tourism-platform-backend [branche: main]
```

**Important** : `frontend/` et `backend/` ne sont PAS de simples dossiers. Ce sont des **sous-modules git** — ils pointent vers des repos GitHub différents, chacun avec ses propres branches. Le root repo ne fait que **référencer un commit précis** de chaque sous-module (`git add frontend` sauvegarde le hash du commit pointé).

## 🔀 Git Workflow complet

### Concept clé — branches parallèles

Quand tu travailles, tu as 2 branches en parallèle :

```
backend/
├── main  (code stable de Maram, sans mes modifs)
└── feat/brute-force-protection  (mes modifs, PAS encore mergées)
```

Le root repo (tourisme/) pointe vers un commit du sous-module. Si le sous-module est sur `feat/xxx`, le root enregistre ce hash. Si le sous-module est sur `main`, le root enregistre le hash de main.

### 1. Commencer une nouvelle feature

```bash
# Se placer sur la branche stable de Maram
cd backend    # ou frontend
git checkout main
git pull origin main

# Créer une branche feature
git checkout -b feat/ma-feature

# Travailler...
git add .
git commit -m "feat: description"
git push origin feat/ma-feature
```

### 2. Comprendre : cd backend && git pull origin feat/brute-force-protection

Cette commande fait 2 choses :
```bash
cd backend                          # aller dans le sous-module
git pull origin feat/brute-force-protection  # télécharge les commits de la branche
                                            # distante et les fusionne dans la
                                            # branche locale du même nom
```

**C'est différent de `git pull origin main`** qui télécharge la branche `main` de Maram (sans mes modifs).

### 3. Différence entre main et feat/xxx

```bash
# Voir le code STABLE de Maram (sans mes changements)
cd backend && git checkout main
# Les fichiers n'ont PAS les eye icons, PAS le rate limiting

# Voir MES changements
cd backend && git checkout feat/brute-force-protection
# Les fichiers ONT le rate limiting, lockout, messages français

# Voir les différences entre les 2 branches
cd backend
git diff main..feat/brute-force-protection  # tout ce que j'ai ajouté
git diff main..feat/brute-force-protection -- src/auth/auth.service.ts  # juste ce fichier
```

**Tant que Maram n'a pas merge ma PR, mes changements ne sont QUE sur la branche feature.**

### 4. Travailler sur une feature existante (ex: feat/brute-force-protection)

```bash
cd backend
# Récupérer la branche distante en local (1ère fois)
git fetch origin
git checkout -b feat/brute-force-protection origin/feat/brute-force-protection

# Ou si elle existe déjà en local
git checkout feat/brute-force-protection
git pull origin feat/brute-force-protection
```

### 5. Ouvrir une Pull Request

```bash
# Lien direct frontend :
#   https://github.com/Maram172003/eco-tourism-platform-front/pull/new/feat/ma-feature?base=main
# Lien direct backend :
#   https://github.com/Maram172003/eco-tourism-platform-backend/pull/new/feat/ma-feature?base=main
```

Config GitHub : **base: `main`** (Maram) ← **compare: `feat/ma-feature`** (mes modifs)
Puis cliquer "Create Pull Request".

Vérifier : https://github.com/Maram172003/eco-tourism-platform-front/pulls
         https://github.com/Maram172003/eco-tourism-platform-backend/pulls

### 6. Après le merge de la PR par Maram

```bash
# Dans le sous-module : récupérer main qui contient maintenant mes modifs
cd backend    # ou frontend
git checkout main
git pull origin main

# Dans le root : mettre à jour la référence
cd ..
git add backend    # ou frontend
git commit -m "chore: update backend submodule after PR merge"
git push origin Faker:main   # root → origin/main
```

## 🔒 Features déjà pushées (en attente de merge Maram)

### Frontend — `feat/eye-icon-brute-force`
| Fichier | Changement |
|---|---|
| `app/auth/login/page.tsx` | Icône œil show/hide sur champ password |
| `app/auth/register/page.tsx` | Icône œil sur password + confirm password |
| `app/auth/reset-password/page.tsx` | Icône œil sur confirm password |

### Backend — `feat/brute-force-protection`
| Fichier | Changement |
|---|---|
| `src/app.module.ts` | `ThrottlerModule.forRoot()` + FrenchThrottlerGuard global |
| `src/auth/auth.controller.ts` | `@Throttle()` sur login (5/min), register (3/min), forgot-password (3/min) |
| `src/auth/auth.service.ts` | Lockout check avant password verify, `NotFoundException` si email inconnu |
| `src/users/entities/user.entity.ts` | Colonnes `failed_login_attempts`, `locked_until` |
| `src/users/users.service.ts` | `incrementFailedLoginAttempts()`, `resetFailedLoginAttempts()` |
| `src/common/guards/throttler.guard.ts` | Message 429 en français |
| `.gitignore` | Ajout `.env.production` |

## 🐛 Problèmes résolus

### 1. Fichiers .env trackés dans git
**Problème** : `.env.dev` et `.env.production` étaient commités dans backend, `.env` dans root.
**Solution** :
```bash
cd backend
git rm --cached .env.dev .env.production   # retire du suivi sans supprimer le fichier
git add .gitignore                          # s'assurer qu'ils sont dans .gitignore
git commit -m "chore: arrêter de tracker les .env"
git push origin feat/brute-force-protection

cd ..   # root
git add .gitignore
git rm --cached .env
git commit -m "chore: arrêter de tracker .env dans le root"
git push origin Faker:main
```

**Vérification** :
```bash
git ls-files | grep '\.env'      # doit retourner vide
git check-ignore .env            # doit retourner ".env"
```

### 2. Merge conflict backend (yarn.lock)
**Problème** : Maram a modifié `yarn.lock` dans son `main` pendant qu'on travaillait.
**Solution** :
```bash
cd backend
git checkout feat/brute-force-protection
git fetch origin main
git merge origin/main
# Conflit dans yarn.lock → prendre la version main
git checkout origin/main -- yarn.lock
yarn install   # regénère le lockfile proprement
git add -A
git commit -m "merge: résolution conflit main -> feat/brute-force-protection"
git push origin feat/brute-force-protection
```

### 3. `.env.production` retiré du `.gitignore` par Maram
**Problème** : Après merge, `.gitignore` avait perdu `.env.production` (Maram l'avait supprimé).
**Solution** : Ajouter manuellement `.env.production` dans `.gitignore`.

### 4. Sous-module root sur Faker, pushé sur origin/main
Le root repo utilise la branche locale `Faker` mais push sur `origin/main` :
```bash
git push origin Faker:main
```

## 🔧 Commandes utiles

```bash
# Voir ma branche actuelle
git branch

# Voir toutes les branches (locales + distantes)
git branch -a

# Voir les branches distantes seulement
git branch -r

# Lister les commits de ma branche feature
git log --oneline -10

# Comparer ma branche avec main
git diff main..feat/ma-feature --stat    # fichiers modifiés
git diff main..feat/ma-feature           # contenu complet

# Voir l'historique d'un fichier
git log --oneline -- src/auth/auth.service.ts

# Backend dev
cd backend && cp .env.dev .env && yarn start:dev

# Frontend dev
cd frontend && yarn dev
```

## 📝 Fichiers .env

| Fichier | Usage | Tracké ? |
|---|---|---|
| `.env.dev` | Dev local (localhost, root/root, port 3001) | ❌ Non |
| `.env.production` | Production/Docker (db, marammejri, port 3000) | ❌ Non |
| `.env` | Copie locale de `.env.dev` pour NestJS | ❌ Non (root + backend) |

Tous sont dans `.gitignore` et ne seront jamais pushés.

## ⚠️ Règles à ne JAMAIS faire
- ❌ Push directement sur `main` (frontend ou backend)
- ❌ Travailler sur `main` (toujours branche feature)
- ❌ Modifier le code de Maram sans PR
- ❌ Commiter `.env` avec des tokens réels
- ❌ `git push origin main` depuis le root (toujours `git push origin Faker:main`)

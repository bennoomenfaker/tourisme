# Workflow Git — Tourisme

## Règle d'or

> **NE JAMAIS push directement sur `main`.**  
> Toujours passer par une **branche feature** + **Pull Request** vers Maram.

## Dépôts GitHub

| Dépôt | URL | Branche protégée |
|---|---|---|
| **tourisme** (root) | `github.com/bennoomenfaker/tourisme` | `main` |
| **frontend** (sous-module) | `github.com/Maram172003/eco-tourism-platform-front` | `main` |
| **backend** (sous-module) | `github.com/Maram172003/eco-tourism-platform-backend` | `main` |

## Structure

```
tourisme/                          # Root repo (bennoomenfaker/tourisme)
├── docker-compose.yml
├── GIT_WORKFLOW.md
├── .gitmodules                    # Lien vers les sous-modules (branch = main)
├── .opencode/skills/git-workflow/ # Config agent IA (auto)
├── frontend/                      # Sous-module → Maram172003/eco-tourism-platform-front (main)
└── backend/                       # Sous-module → Maram172003/eco-tourism-platform-backend (main)
```

## Workflow complet (feature branch + PR)

### 1. Créer une branche feature

```bash
cd frontend    # ou backend
git checkout main
git pull origin main
git checkout -b feat/nom-de-ta-feature
```

Nommer clairement : `feat/auth-google`, `feat/guide-questionnaire`, `fix/upload-pdf`, `feat/eye-icon-brute-force`, etc.

### 2. Travailler sur la branche

```bash
git add .
git commit -m "feat: description en français de ce qui a été fait"
git push origin feat/nom-de-ta-feature
```

### 3. Ouvrir une Pull Request (PR)

```bash
# Lien direct à ouvrir dans le navigateur :
# Frontend :
#   https://github.com/Maram172003/eco-tourism-platform-front/pull/new/feat/nom-de-ta-feature?base=main
# Backend :
#   https://github.com/Maram172003/eco-tourism-platform-backend/pull/new/feat/nom-de-ta-feature?base=main
```

Configuration dans GitHub :
- **base**: `main` (la branche protégée de Maram)
- **compare**: `feat/nom-de-ta-feature`
- **Titre**: clair et descriptif
- **Description**: détailler chaque changement
- **Ne pas toucher à "base repository"** (c'est déjà celui de Maram)

👉 Puis cliquer sur **"Create Pull Request"**.

### 4. Vérifier que la PR est bien envoyée

```bash
# Lien pour voir toutes les PR ouvertes :
# Frontend : https://github.com/Maram172003/eco-tourism-platform-front/pulls
# Backend  : https://github.com/Maram172003/eco-tourism-platform-backend/pulls

# En CLI (si gh est installé) :
gh pr list --repo Maram172003/eco-tourism-platform-front
gh pr list --repo Maram172003/eco-tourism-platform-backend
```

Tu dois voir ta PR listée avec ton titre et le label "open".

### 5. Review & merge

- Maram review le code
- Une fois approuvée, merger la PR sur GitHub (bouton vert "Merge pull request")
- Supprimer la branche feature après merge (bouton "Delete branch")

### 6. Synchroniser le root tourisme

```bash
# Après le merge de la PR frontend/backend par Maram
cd frontend    # ou backend
git checkout main
git pull origin main

cd ..
git add frontend    # ou backend
git commit -m "chore: update frontend submodule"
git push origin main
```

## Fonctionnalités de sécurité implémentées

### 🔐 Anti brute force (backend)

| Protection | Détail | Fichier |
|---|---|---|
| **Rate limiting login** | 5 tentatives/minute | `auth.controller.ts` |
| **Rate limiting register** | 3 tentatives/minute | `auth.controller.ts` |
| **Rate limiting forgot-password** | 3 tentatives/minute | `auth.controller.ts` |
| **Rate limiting global** | 20 requêtes/minute | `app.module.ts` |
| **Lockout compte** | 5 échecs → verrouillé 15 min | `auth.service.ts` |
| **Déverrouillage auto** | Après 15 min, reconnexion possible | `users.service.ts` |
| **forgot-password email inexistant** | Message : "Aucun compte trouvé" | `auth.service.ts` |

Messages en français partout.

### 👁️ Eye icon (show/hide password)

| Page | Champ |
|---|---|
| **Login** | Mot de passe |
| **Register** | Mot de passe + Confirmation |
| **Reset password** | Nouveau mot de passe + Confirmation |

## Commandes essentielles

### Cloner le projet

```bash
git clone --recurse-submodules https://github.com/bennoomenfaker/tourisme.git
```

Si déjà cloné sans les sous-modules :

```bash
git submodule update --init --remote
```

### Mise à jour quotidienne

```bash
# 1. Root repo
git pull origin main

# 2. Sous-modules (frontend + backend)
git submodule update --remote
```

### Travailler sur le frontend (avec PR)

```bash
cd frontend
git checkout main
git pull origin main
git checkout -b feat/ma-feature

# Faire les modifications...
git add .
git commit -m "feat: description du changement"
git push origin feat/ma-feature

# → Aller sur GitHub, ouvrir une PR de feat/ma-feature → main
# → Après merge de la PR, synchroniser le root :
cd ..
git add frontend
git commit -m "chore: update frontend submodule"
git push origin main
```

### Travailler sur le backend (avec PR)

```bash
cd backend
git checkout main
git pull origin main
git checkout -b feat/ma-feature

# Faire les modifications...
git add .
git commit -m "feat: description du changement"
git push origin feat/ma-feature

# → Aller sur GitHub, ouvrir une PR de feat/ma-feature → main
# → Après merge de la PR, synchroniser le root :
cd ..
git add backend
git commit -m "chore: update backend submodule"
git push origin main
```

## Démarrage en dev

```bash
# Backend
cd backend
cp .env.dev .env   # ou modifier .env directement
yarn start:dev

# Frontend (autre terminal)
cd frontend
yarn dev
```

## Synchronisation

Les 3 dépôts sont indépendants mais liés par les sous-modules :

1. **Frontend / Backend** → modifications sur branche feature → PR → merge dans `main`
2. **Root tourisme** → référence les commits des sous-modules → push vers `bennoomenfaker/tourisme`
3. Après chaque `git pull` dans le root, faire `git submodule update --remote` pour synchroniser

## Résumé visuel

```
bennoomenfaker/tourisme (main)
         │
         ├── frontend/ ──► Maram172003/eco-tourism-platform-front (main)
         │                    └── feat/* ──→ PR ──→ review ──→ merge
         │
         └── backend/  ──► Maram172003/eco-tourism-platform-backend (main)
                              └── feat/* ──→ PR ──→ review ──→ merge
```

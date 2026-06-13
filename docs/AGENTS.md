# Tourisme (Eco-Voyage)

## 🧑‍🤝‍🧑 Binôme
- **Maram** — propriétaire des repos frontend & backend
- **Moi** — je travaille dans `tourisme/` (root) qui contient frontend/backend en **sous-modules**
- **NE JAMAIS toucher au code de Maram directement.** Toujours PR.

## 📦 Structure — 3 repos liés (sous-modules)

```
tourisme/ (mon repo: bennoomenfaker/tourisme)
├── frontend/ → sous-module → repo Maram (eco-tourism-platform-front)  [branche: main]
├── backend/  → sous-module → repo Maram (eco-tourism-platform-backend) [branche: main]
```

**Important** : `frontend/` et `backend/` ne sont PAS de simples dossiers. Ce sont des **sous-modules git** — ils pointent vers des repos GitHub différents.

## 🔀 Git Workflow (OBLIGATOIRE — ne jamais casser le code de Maram)

Toujours :
1. `git checkout main && git pull origin main` (dans frontend/ ou backend/)
2. `git checkout -b feat/ma-feature`
3. Coder, commiter, pusher SUR LA BRANCHE FEATURE
4. Ouvrir une PR sur GitHub : **base: `main`** ← **compare: `feat/ma-feature`**
5. Maram review → merge → je synchronise le root

## ❓ Pourquoi le code modifié n'apparaît pas sur ma branche main ?

**C'est normal.** C'est le principe des sous-modules + feature branches.

| Si je suis sur | Je vois |
|---|---|
| `main` (frontend ou backend) | Le code **stable** de Maram (sans mes modifs) |
| `feat/ma-feature` (frontend ou backend) | Mes **nouvelles modifs** |

Tant que Maram n'a pas merge ma PR, mes changements **ne sont que sur ma branche feature**, pas sur `main`.

**Pour tester mes modifs en local :**
```bash
cd frontend    # ou backend
git checkout feat/ma-feature
# ici je vois mes changements
```

**Pour revenir au code stable de Maram :**
```bash
git checkout main
```

**Après le merge de la PR par Maram :**
```bash
git checkout main
git pull origin main
# maintenant main contient mes modifs ✅
```

## 🔒 Sécurité implémentée (déjà pushé sur les branches feat/)

### Frontend — Eye icon (show/hide password)
- **Login** : `app/auth/login/page.tsx` — icône œil sur mot de passe
- **Register** : `app/auth/register/page.tsx` — icône œil sur password + confirmation
- **Reset password** : `app/auth/reset-password/page.tsx` — icône œil sur confirmation

### Backend — Anti brute force (`feat/brute-force-protection`)
- **Rate limiting** : login (5/min), register (3/min), forgot-password (3/min)
- **Lockout** : 5 échecs connexion → verrouillé 15 min
- **Forgot-password** : email inexistant → message "Aucun compte trouvé"
- **Tous les messages en français**

## 🔧 Commandes essentielles

```bash
# Backend (dev)
cd backend
cp .env.dev .env   # une fois
yarn start:dev

# Frontend (dev, autre terminal)
cd frontend
yarn dev
```

### Synchronisation après merge PR

```bash
# Après que Maram merge ma PR frontend/backend
cd frontend    # ou backend
git checkout main
git pull origin main

cd ..
git add frontend    # ou backend
git commit -m "chore: update submodule after PR merge"
git push origin main
```

## 📝 Fichiers .env (backend)

| Fichier | Usage |
|---|---|
| `.env.dev` | Dev local (localhost, root/root, port 3001) |
| `.env.production` | Production / Docker (db, marammejri, port 3000) |
| `.env` | Celui chargé par NestJS (copier .env.dev → .env) |

## ⚠️ Règles à ne JAMAIS faire
- ❌ Push directement sur `main` (frontend ou backend)
- ❌ Travailler sur `main` (toujours branche feature)
- ❌ Modifier le code de Maram sans PR
- ❌ Commiter `.env` avec des tokens réels

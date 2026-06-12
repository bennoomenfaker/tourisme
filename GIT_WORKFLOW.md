# Workflow Git — Tourisme

## Dépôts GitHub

| Dépôt | URL | Branche principale |
|---|---|---|
| **tourisme** (root) | `github.com/bennoomenfaker/tourisme` | `main` |
| **frontend** (sous-module) | `github.com/Maram172003/eco-tourism-platform-front` | `Faker` |
| **backend** (sous-module) | `github.com/Maram172003/eco-tourism-platform-backend` | `Faker` |

## Structure

```
tourisme/                          # Root repo (bennoomenfaker/tourisme)
├── docker-compose.yml
├── README.md
├── .gitmodules                    # Lien vers les sous-modules
├── frontend/                      # Sous-module → Maram172003/eco-tourism-platform-front
│                                  #   Branche : Faker
└── backend/                       # Sous-module → Maram172003/eco-tourism-platform-backend
                                   #   Branche : Faker
```

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
git pull

# 2. Sous-modules (frontend + backend)
git submodule update --remote
```

### Travailler sur le frontend

```bash
cd frontend
git checkout Faker

# Faire les modifications...
git add .
git commit -m "Description du changement"
git push origin Faker

# Revenir au root pour enregistrer la nouvelle référence
cd ..
git add frontend
git commit -m "chore: update frontend submodule"
git push
```

### Travailler sur le backend

```bash
cd backend
git checkout Faker

# Faire les modifications...
git add .
git commit -m "Description du changement"
git push origin Faker

# Revenir au root pour enregistrer la nouvelle référence
cd ..
git add backend
git commit -m "chore: update backend submodule"
git push
```

## Synchronisation

Les 3 dépôts sont indépendants mais liés par les sous-modules :

1. **Frontend / Backend** → modifications sur la branche `Faker` → push vers le repo de Maram
2. **Root tourisme** → référence les commits des sous-modules → push vers `bennoomenfaker/tourisme`
3. Après chaque `git pull` dans le root, faire `git submodule update --remote` pour synchroniser

## Résumé visuel

```
bennoomenfaker/tourisme (main)
         │
         ├── frontend/ ──► Maram172003/eco-tourism-platform-front (Faker)
         │
         └── backend/  ──► Maram172003/eco-tourism-platform-backend (Faker)
```

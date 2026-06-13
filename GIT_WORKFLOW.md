# Workflow Git — Tourisme

## Règle d'or

> **NE JAMAIS push directement sur `main` ou `Faker`.**  
> Toujours passer par une **branche feature** + **Pull Request**.

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
├── README.md
├── .gitmodules                    # Lien vers les sous-modules
├── .opencode/skills/git-workflow/ # Config agent IA (auto)
├── frontend/                      # Sous-module → Maram172003/eco-tourism-platform-front
│                                  #   Branche : Faker
└── backend/                       # Sous-module → Maram172003/eco-tourism-platform-backend
                                   #   Branche : Faker
```

## Workflow complet (feature branch + PR)

### 1. Créer une branche feature

```bash
# Dans frontend/ ou backend/
git checkout Faker
git pull origin Faker
git checkout -b feat/nom-de-ta-feature
```

Nommer la branche clairement : `feat/auth-google`, `feat/guide-questionnaire`, `fix/upload-pdf`, etc.

### 2. Travailler sur la branche

```bash
# Faire les modifications...
git add .
git commit -m "Ajout questionnaire guide avec upload PDF"
git push origin feat/nom-de-ta-feature
```

### 3. Ouvrir une Pull Request (PR)

Aller sur GitHub → **New Pull Request** :
- **base**: `Faker` (la branche protégée)
- **compare**: `feat/nom-de-ta-feature`
- **Titre**: clair et descriptif

### 4. Review & merge

- Les modifs sont reviewées
- Une fois approuvée, merger la PR sur GitHub
- Supprimer la branche feature après merge

## Schéma visuel

```
Faker (protégée)
  │
  ├─── feat/auth-google ──→ PR ──→ review ──→ merge dans Faker
  │
  ├─── feat/guide-questionnaire ──→ PR ──→ review ──→ merge dans Faker
  │
  └─── feat/upload-images ──→ PR ──→ review ──→ merge dans Faker
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

### Travailler sur le frontend (avec PR)

```bash
cd frontend
git checkout Faker
git pull origin Faker
git checkout -b feat/ma-feature

# Faire les modifications...
git add .
git commit -m "Description du changement"
git push origin feat/ma-feature

# → Aller sur GitHub, ouvrir une PR de feat/ma-feature → Faker
# → Après merge de la PR, synchroniser le root :
cd ..
git add frontend
git commit -m "chore: update frontend submodule"
git push
```

### Travailler sur le backend (avec PR)

```bash
cd backend
git checkout Faker
git pull origin Faker
git checkout -b feat/ma-feature

# Faire les modifications...
git add .
git commit -m "Description du changement"
git push origin feat/ma-feature

# → Aller sur GitHub, ouvrir une PR de feat/ma-feature → Faker
# → Après merge de la PR, synchroniser le root :
cd ..
git add backend
git commit -m "chore: update backend submodule"
git push
```

## Synchronisation

Les 3 dépôts sont indépendants mais liés par les sous-modules :

1. **Frontend / Backend** → modifications sur branche feature → PR → merge dans `Faker`
2. **Root tourisme** → référence les commits des sous-modules → push vers `bennoomenfaker/tourisme`
3. Après chaque `git pull` dans le root, faire `git submodule update --remote` pour synchroniser

## Résumé visuel

```
bennoomenfaker/tourisme (main)
         │
         ├── frontend/ ──► Maram172003/eco-tourism-platform-front (Faker)
         │                    └── feat/* ──→ PR ──→ review ──→ merge
         │
         └── backend/  ──► Maram172003/eco-tourism-platform-backend (Faker)
                              └── feat/* ──→ PR ──→ review ──→ merge
```

---
name: git-workflow
description: "Use when performing ANY git operation (commit, push, branch, PR) in this project. Enforces feature-branch workflow with PRs to protect Maram's code. NEVER push directly to main/Faker."
---

# Git Workflow — Tourisme

This project uses **3 repos** linked as submodules:

## Architecture des branches

```
Maram172003/eco-tourism-platform-front (main)    ← Source de vérité
Maram172003/eco-tourism-platform-backend (main)   ← Source de vérité
         │
         ▼ (sous-modules)
bennoomenfaker/tourisme:Faker                     ← Pointe sur le main de Maram
         │
         ▼ (merge)
bennoomenfaker/tourisme:main                      ← PR target vers Maram, synced avec Faker
```

### 3 branches importantes

| Branche | Repo | Rôle |
|---|---|---|
| `Maram/*:main` | Maram172003/* | Source de vérité. Maram merge les PR ici. |
| `Faker` | bennoomenfaker/tourisme | Pointe sur le `main` de Maram via sous-modules. Branche de travail. |
| `main` | bennoomenfaker/tourisme | Créée pour envoyer les PR à Maram. Synchro : `main = Faker = Maram/main` |

### Synchronisation

```bash
# Après merge d'une PR par Maram → mettre à jour Faker
cd frontend && git checkout main && git pull origin main
cd backend  && git checkout main && git pull origin main
cd ..
git add frontend backend
git commit -m "chore: update submodules to main (PR mergée par Maram)"
git push origin Faker

# Sync main du root avec Faker
git checkout main && git merge Faker && git push origin main
git checkout Faker   # retour sur Faker
```

## Rules (ALWAYS follow)

1. **NEVER push directly to `main` or `Faker`**. Always use a feature branch.
2. **Branch naming**: `feat/<nom-descriptif>` (ex: `feat/auth-google`, `feat/guide-questionnaire`)
3. **Workflow**:
   ```
   git checkout -b feat/ma-feature
   # ... work, commit, push ...
   # → Open a Pull Request on GitHub
   # → Wait for review → merge
   ```
4. **Commit messages**: claires en français ou anglais, décrivant l'action.
5. **PR title**: clair et descriptif, ex: "Ajout questionnaire guide avec upload PDF".

## Before any git operation

Ask yourself: *"Est-ce que je push direct sur main/Faker ?"* Si oui → **STOP**. Crée une branche feature.

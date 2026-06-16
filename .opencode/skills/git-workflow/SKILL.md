---
name: git-workflow
description: "Use when performing ANY git operation (commit, push, branch, PR) in this project. Work on main branch. To send code to Maram, use PR on GitHub."
---

# Git Workflow — Tourisme

This project is a **single repo** (`bennoomenfaker/tourisme`). `frontend/` and `backend/` are regular directories (NOT submodules).

## Branches

| Branche | Rôle |
|---|---|
| `main` | Branche de travail unique. Push directement ici. |

## Workflow

```bash
# Travailler
git add .
git commit -m "feat: description"
git push origin main
```

## Envoyer du code à Maram

`frontend/` et `backend/` contiennent le code de Maram. Pour envoyer des modifs :

1. Va sur GitHub → `bennoomenfaker/tourisme`
2. Copie les fichiers modifiés
3. Crée une PR manuellement sur le repo de Maram

Ou demande-moi (l'agent) de préparer les fichiers pour PR.

## Vérifier les mises à jour de Maram

Demande-moi. Je clone les repos de Maram, je compare, et si nécessaire je mets à jour.

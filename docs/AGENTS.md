# Tourisme (Eco-Voyage)

## 🧑‍🤝‍🧑 Binôme
- **Maram** — propriétaire des repos frontend & backend originaux
- **Moi** — je travaille dans `tourisme/` (mon repo: `bennoomenfaker/tourisme`)
- Pour envoyer du code à Maram : PR manuelle sur ses repos GitHub

## 📦 Structure

```
bennoomenfaker/tourisme/           ← Mon repo unique (branche main)
├── frontend/                      ← Dossier normal (code de Maram)
├── backend/                       ← Dossier normal (code de Maram)
├── docs/                          ← Documentation
├── docker-compose.yml
└── README.md
```

`frontend/` et `backend/` sont de **simples dossiers** (pas des sous-modules). Tout est dans le même repo.

## 🔀 Workflow Git

```bash
# Travailler
git add .
git commit -m "feat: description"
git push origin main
```

## 🔄 Mise à jour depuis Maram
- Demander à l'agent IA de vérifier
- L'agent clone les repos de Maram, compare, et copie les nouveaux fichiers

## 🚀 Démarrer le projet

```bash
# Backend (terminal 1)
cd backend && yarn start:dev

# Frontend (terminal 2)
cd frontend && yarn dev
```

## ⚠️ Règles
- Ne pas commiter les vraies clés API / tokens dans `.env`
- Les fichiers `.env*` sont dans `.gitignore`

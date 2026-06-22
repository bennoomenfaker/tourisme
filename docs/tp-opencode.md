# TP OpenCode — Deux cas pratiques

## TP 1 : Construire un CLI note-taking avec opencode

**Objectif** : Découvrir opencode en construisant pas à pas un outil CLI en Python.

### Prérequis (5 min)

```bash
# Installer opencode
curl -fsSL https://opencode.ai/install | bash

# Configurer un provider (ex: opencode Zen)
opencode
/connect

# Créer un projet vierge
mkdir ~/notes-cli && cd ~/notes-cli && opencode
```

### Étapes

#### 1. `/init` — Analyser le projet

```
/init
```

→ opencode analyse le dossier (vide) et crée `AGENTS.md`.

#### 2. Question — Comprendre le codebase

```
@AGENTS.md qu'est-ce que ce projet contient ?
```

→ Montre qu'on peut référencer des fichiers avec `@`.

#### 3. Plan mode — Concevoir avant de coder

Appuyer sur **Tab** pour passer en *Plan mode*, puis :

```
Je veux un CLI notes qui permet de :
- ajouter une note (titre + contenu)
- lister toutes les notes
- supprimer une note par id
- chercher des notes par mot-clé

Les notes sont stockées dans un fichier JSON ~/.notes.json.
```

→ opencode propose un plan sans toucher au code. Itérer si besoin.

#### 4. Build mode — Implémenter

Appuyer sur **Tab** pour repasser en *Build mode* :

```
OK, implémente le plan.
```

→ opencode écrit le code (argparse, JSON, etc.)

#### 5. Tester — Lancer et corriger

```bash
python notes.py add "Première note" "Contenu de test"
python notes.py list
```

Si erreur, demander à opencode de la corriger :

```
J'ai une erreur : <copier l'erreur>. Corrige-la.
```

#### 6. `/undo` — Annuler une modification

```
Ajoute une commande "export" qui exporte en CSV.
```

Puis :

```
/undo
```

→ Montrer qu'on peut revenir en arrière.

#### 7. `@` — Référencer plusieurs fichiers

```
Ajoute une commande "stats" qui affiche le nombre total de notes.
Regarde comment les autres commandes sont faites dans @notes.py
```

#### 8. `/share` — Partager la session

```
/share
```

→ opencode génère un lien partageable (ex: `https://opencode.ai/s/xxx`).

### Ce que le TP démontre

| Feature opencode | Commande / Action |
|---|---|
| Initialisation | `/init` |
| Questions sur le code | Question libre + `@fichier` |
| Planification | **Tab** → Plan mode |
| Génération de code | **Tab** → Build mode |
| Correction d'erreurs | Coller l'erreur dans une question |
| Annulation | `/undo` / `/redo` |
| Partage | `/share` |
| Référencement | `@fichier` |
| Commandes custom | `/command` |

---

## TP 2 : Refactoriser une API Flask existante avec opencode

**Objectif** : Montrer comment opencode analyse, refactorise et teste une codebase existante.

### Prérequis

```bash
git clone https://github.com/pallets-eco/flask-api-example.git ~/flask-demo
cd ~/flask-demo && opencode
/init
```

### Étapes

#### 1. Analyser le code existant

```
Explique-moi comment est structurée cette application.
Quels sont les endpoints disponibles et comment fonctionne le routing ?
```

→ opencode lit les fichiers et résume l'architecture.

#### 2. Identifier du code mort / améliorations

```
Y a-t-il du code redondant ou des fonctions trop longues à refactoriser ?
Fais un audit du projet et propose des améliorations (toujours en Plan mode).
```

→ Appuyer sur **Tab** pour passer en Plan mode avant d'envoyer.

#### 3. Refactoriser avec confirmation

Après validation du plan, repasser en Build mode :

```
OK, applique le refactoring. Sépare les routes dans plusieurs blueprints :
- /api/users
- /api/posts
- /api/auth

Tire les schémas de validation dans un fichier schemas.py dédié.
```

→ opencode restructure le projet en suivant tes instructions.

#### 4. Ajouter des tests automatiques

```
Ajoute des tests pytest pour tous les endpoints.
Utilise pytest-flask et une base SQLite en mémoire.
Regarde la structure existante dans @app.py pour comprendre les modèles.
```

→ opencode crée `tests/` avec un fichier `conftest.py` et des tests.

#### 5. Debugger un test qui échoue

```bash
pytest tests/ -v
```

Si un test échoue, copier l'erreur dans opencode :

```
Ce test échoue : <psite le traceback>. Corrige-le.
```

#### 6. Ajouter une feature avec `/drop`

```
/drop
Ajoute une pagination sur la route GET /api/posts avec les paramètres ?page=1&per_page=20
```

→ `/drop` permet de basculer en mode "drop" où opencode peut lire plus de fichiers en une fois.

#### 7. Configurer un formatteur auto

```
/command
Nom: lint
Commande: ruff check .
Outil: bash
Description: Linter le projet avec ruff
```

Puis :

```
/lint
```

→ opencode exécute la commande custom.

#### 8. Générer un changelog et partager

```
Génère un CHANGELOG.md récapitulant toutes les modifications apportées pendant cette session.
```

Puis :

```
/share
```

### Ce que le TP démontre

| Feature opencode | Commande / Action |
|---|---|
| Analyse de code existant | Question ouverte + `@fichier` |
| Audit et propositions | Plan mode (**Tab**) |
| Refactoring multi-fichiers | Build mode avec instructions détaillées |
| Génération de tests | Prompt décrivant le framework souhaité |
| Debugging | Coller le traceback |
| Mode drop | `/drop` (lecture large) |
| Commandes custom | `/command` |
| Génération de doc | Prompt classique |
| Partage | `/share` |

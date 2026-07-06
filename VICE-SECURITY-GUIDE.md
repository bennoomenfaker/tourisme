# 🔒 VICE-Security — Guide Complet

## C'est quoi ?

**VICE** (**V**ulnerability **I**nspector & **C**ode **E**xaminer) est un outil de sécurité open-source (MIT) qui audite les applications web. Il fonctionne en deux modes :

| Mode | Description |
|------|-------------|
| **Black-box (scan distant)** | Scanne un site web en ligne via un navigateur headless (Puppeteer) pour trouver des failles depuis le point de vue d'un attaquant |
| **White-box (audit local)** | Analyse le code source en local pour détecter les vulnérabilités statiques (clés API exposées, injections SQL, XSS, etc.) |

### Ce qu'il détecte :
- **Clés API / secrets** codés en dur dans le JavaScript
- **Fichiers sensibles exposés** (`.env`, `.git`, etc.)
- **En-têtes HTTP manquants** (CSP, HSTS, X-Frame-Options)
- **Failles d'authentification** (brute force, injection SQL)
- **Misconfigurations Supabase RLS**
- **Dépendances vulnérables** (`npm audit`)
- **Injections SQL / XSS / Command Injection**
- **Ports ouverts** sur le VPS

### Intégrations :
- **GitHub Actions** — Audit automatique en CI/CD
- **Rapports HTML/JSON** — Génération de rapports détaillés
- **Score de sécurité** (A à F) — Peut bloquer les builds CI si le score est trop bas
- **SARIF** — Upload vers l'onglet Security de GitHub

---

## 📥 Comment télécharger / installer

### Installation globale (recommandé)
```bash
npm install -g vice-security
```

### Installation locale dans le projet
```bash
cd /home/himawari/workSpace/tourisme
npm install vice-security
```

### Vérifier l'installation
```bash
vice --version
```

---

## 🚀 Comment l'utiliser

### 1. Mode interactif (recommandé pour débuter)
```bash
vice
```
L'outil vous guide avec des questions pour choisir le mode d'audit.

### 2. Scan distant (Black-box)
```bash
vice scan
```
Scanne un site web en ligne. Utile pour tester la sécurité perçue de votre application déployée.

### 3. Audit local (White-box) — ⭐ RECOMMANDÉ pour ce projet
```bash
vice audit .
```
Analyse tout le code source du projet en cours. C'est le mode le plus pertinent pour notre codebase.

### 4. Mode CI/CD (GitHub Actions)
```bash
vice audit . --ci --min-score 70
```
L'outil échoue (exit code != 0) si le score de sécurité est inférieur au seuil. Idéal pour les pipelines GitHub Actions.

### 5. Générer un rapport
```bash
vice audit . --report html
```
Génère un fichier HTML avec le détail complet des findings.

### 6. Configuration avancée

Créez un fichier `vice.config.js` à la racine du projet :

```js
// vice.config.js
module.exports = {
  // Chemins à ignorer pendant l'audit
  ignore: [
    'node_modules/**',
    'dist/**',
    '*.test.ts',
    'scripts/**'
  ],
  // Score minimum (CI mode)
  minScore: 70,
  // Chemins spécifiques à auditer
  paths: [
    'backend/src/**',
    'frontend/**'
  ]
};
```

---

## 🎯 Utilisation sur ce projet (Tourisme)

### Audit rapide du backend
```bash
cd /home/himawari/workSpace/tourisme
vice audit backend/src/
```

### Audit rapide du frontend
```bash
vice audit frontend/
```

### Audit complet du projet
```bash
vice audit .
```

### Générer un rapport HTML complet
```bash
vice audit . --report html
```

---

## 📊 Lecture des résultats

VICE attribue un **score de sécurité** de **A** (excellent) à **F** (critique) :

| Score | Niveau | Action |
|-------|--------|--------|
| **A** | ✅ Excellent | Aucune action requise |
| **B** | 🟢 Bon | Améliorations mineures recommandées |
| **C** | 🟡 Moyen | Corriger les problèmes Medium/High |
| **D** | 🟠 Médiocre | Corriger tous les High/Critical |
| **F** | 🔴 Critique | Action immédiate requise |

Les findings sont classés par sévérité :
- 🔴 **Critical** — Exploitable, impact majeur
- 🟠 **High** — Faille sérieuse à corriger rapidement
- 🟡 **Medium** — Risque modéré
- 🟢 **Low** — Amélioration de best practice
- ℹ️ **Info** — Information, pas de risque direct

---

## ⚠️ Avertissements

> **IMPORTANT** : Cet outil est destiné uniquement à des tests de sécurité **autorisés**.
> Vous êtes seul responsable de la conformité légale et éthique lors de l'utilisation de VICE.
> Ne scannez **jamais** des sites web sans autorisation explicite du propriétaire.

---

## 📚 Ressources

- **GitHub officiel** : https://github.com/Webba-Creative-Technologies/vice
- **NPM** : https://www.npmjs.com/package/vice-security
- **Auteur** : Webba Creative Technologies (luca.deguin@webba-creative.fr)
- **Licence** : MIT
- **Version installée** : 3.2.1

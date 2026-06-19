# Guide d'Intégration et Logique Métier

Cette Pull Request apporte l'intégration globale du système de catalogue et de réservation. Voici l'explication détaillée de la logique métier implémentée et comment elle s'interface avec l'architecture existante.

## 1. Périmètre et Architecture

*   **Ce qui est déjà en place (Ton travail) :** Le module d'authentification, la gestion des rôles (EcoTraveler, Guide, ProjectOwner), la table `users`, ainsi que les scripts de seeding pour les questionnaires. Le cœur du système est protégé.
*   **Ce qui est ajouté (Mes développements) :** Les modules `booking`, `circuit`, `trip-plan` et `notification`. Toutes ces nouvelles entités sont rattachées à tes utilisateurs via des clés étrangères sécurisées (par exemple, `traveler: { id }` au lieu d'un ID brut pour éviter les erreurs TypeORM), sans aucune modification du module Auth ou de la table `users`.

## 2. Visuels et Résultats (Important)

**Merci de consulter le fichier `README.md` à la racine du dépôt.** 
J'y ai intégré une galerie complète de **captures d'écran**. Cela te permettra de visualiser immédiatement le rendu final côté frontend de toutes ces fonctionnalités : Dashboard dynamique, fiches d'offres détaillées, intégration des cartes interactives Leaflet, et processus de réservation fluide.

---

## 3. Logique de Fonctionnement des Fonctionnalités

### A. Hébergement (Logique du Catalogue et des Offer Items)
La structure de la base de données (`offer_items`) a été modélisée pour gérer dynamiquement plusieurs types d'hébergement, chacun avec sa propre logique :
*   **Dortoir :** L'unité de réservation est le lit. Géré via le champ `bed_count`.
*   **Chambre privée :** L'unité est la chambre, définie par le champ `room_type`.
*   **Espace Tente (Camping) :** La capacité est gérée selon le nombre de personnes pouvant occuper l'emplacement, via le champ `tent_capacity`.
Chaque item peut ensuite avoir des prix déclinés par profil (Adulte, Enfant, etc.) via `offer_item_prices` et des sessions datées définissant la disponibilité journalière via `offer_item_sessions`.

### B. Plans de Voyage (Trip Plans)
La fonctionnalité Trip Plan agit comme un "panier" avancé pour l'éco-voyageur :
*   L'utilisateur peut piocher différentes offres (un hébergement à Tozeur le jour 1, une activité à Douz le jour 2) et les regrouper dans un plan unique.
*   **Réservation groupée :** En une seule action, le backend boucle sur les items du plan, vérifie la capacité restante pour chaque session, et génère toutes les réservations d'un coup.

### C. Circuits Multi-jours
Il s'agit de packages touristiques créés par les guides (ex: "Aventure dans le Sahara") :
*   Ils incluent un programme détaillé jour par jour (`circuit_days` et `circuit_program_items`).
*   Intégration GPS : Chaque circuit et journée possède des coordonnées (`lat`, `lng`) affichées dynamiquement sur les cartes Leaflet.
*   Intégration de l'upload d'images réelles (via Cloudinary) et non plus de simples URLs.

---

## 4. Migration et Mise à jour de la Base de Données

Pour intégrer ces changements et tester l'interface de manière réaliste, voici la marche à suivre :

### Étape 1 : Démarrage et Auto-migration
Lance le backend en développement :
```bash
npm run start:dev
```
TypeORM (`synchronize: true`) créera automatiquement toutes les nouvelles tables sans écraser tes données `users`.

### Étape 2 : Lancer le nouveau Seed
Tout comme tu as tes propres scripts définis dans le `package.json` (`npm run seed:eco-traveler-questionnaire`, `seed:guide-questionnaire`, etc.), lance le seed des catégories d'offres :
```bash
npm run seed:offer-categories
```

### Étape 3 : Exécuter le script SQL (Données Tunisiennes)
Pour voir l'application prendre vie, j'ai préparé un script SQL complet :
1. Connecte-toi à ta base locale (`tourism_db`).
2. Ouvre le fichier `scripts/seed.sql` inclus dans la PR.
3. **Important :** Au tout début du script, remplace les identifiants statiques (UUID) par de vrais ID issus de ta table `users` existante (`SELECT id, email, role FROM users;`).
4. Exécute le script. Il injectera un catalogue riche (Djerba, Ksar Ghilane, Matmata), des circuits, et des réservations pour tester l'ensemble du système.

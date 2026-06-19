# 🚀 Guide de la Pull Request (Pour Maram)

Coucou Maram ! Cette PR vient s'ajouter à ton excellent travail sur l'architecture de base, la gestion des rôles et la table `users`. L'objectif de cette PR est de greffer tout le système de réservation et de catalogue **sans jamais toucher à ta table `users`**.

## 🌟 Ce que tu as déjà accompli (Ton périmètre)
- **Authentification et Rôles** : Le système de base avec les rôles EcoTraveler, Guide, et ProjectOwner.
- **La table `users`** : C'est le cœur du système, et elle est restée intacte !
- **Questionnaires d'Onboarding** : Les formulaires initiaux (eco-traveler, guide, project-owner) pour comprendre les profils.

## 🛠️ Ce que cette PR ajoute (La suite logique)
Nous avons complété ton écosystème avec les fonctionnalités métiers :
1. **Catalogue Avancé (Offres & Items)** : 
   - Ajout de prix, de sessions datées, et de capacités.
   - Les `offers` sont reliées aux owners, et les `offer_items` peuvent être de l'hébergement, des activités, etc.
2. **Système de Réservation (Bookings)** : 
   - Réservation complète avec la gestion des participants (adultes, enfants) et prévention des doubles réservations.
   - Correctement relié à tes utilisateurs (ex: `traveler: { id }` au lieu de l'ID brut pour éviter les bugs TypeORM).
3. **Circuits Multi-jours** :
   - Packages touristiques avec programmes jour par jour, carte Leaflet (GPS) et gestion d'images (Cloudinary).
4. **Plans de Voyage (Trip Plans)** :
   - Permet à l'éco-voyageur de regrouper plusieurs offres dans un itinéraire personnalisé.
5. **Notifications** :
   - Alertes temps réel pour les confirmations de réservation.

---

## 🗄️ Comment migrer et mettre à jour ta Base de Données

Pour tester tout ça sans casser tes utilisateurs existants, la migration est super simple :

### 1. Démarrer le Backend (Auto-migration)
```bash
npm run start:dev
```
*Cela va créer automatiquement toutes les nouvelles tables (offres, circuits, bookings, etc.) grâce à `synchronize: true` de TypeORM, en gardant tes tables intactes.*

### 2. Lancer les nouveaux Seeds (Catégories)
Puisque tu as déjà testé tes propres scripts (ex: `npm run seed:eco-traveler-questionnaire`), tu vas utiliser la même logique pour les catégories d'offres :
```bash
npm run seed:offer-categories
```

### 3. Exécuter le gros Seed SQL (Données de test Tunisiennes)
Pour avoir un catalogue rempli (Djerba, Tataouine, Tozeur, etc.) et pouvoir tester le frontend sans devoir tout saisir à la main :
1. Connecte-toi à ta base `tourism_db` (`localhost:5433`, user: `marammejri`, password: `Hermosa`).
2. Ouvre le fichier `scripts/seed.sql` qui se trouve dans cette PR.
3. **Avant de l'exécuter** : Au début du script, modifie les variables UUID (ex: `v_owner1_id`, `v_traveler1_id`) en copiant des vrais IDs depuis ta table `users` (`SELECT id, email, role FROM users;`).
4. Exécute le script complet ! Il injectera des centaines de lignes (offres, circuits, réservations) parfaitement liées à tes utilisateurs.

---

## 💻 Côté Code : Où regarder ?

Si tu veux explorer le code ajouté par rapport au tien :
- **Backend** : Regarde les dossiers `src/booking`, `src/circuit`, `src/trip-plan` et `src/notification`. Tu remarqueras qu'ils utilisent ton entité `User` comme clé étrangère de manière propre et sécurisée.
- **Frontend** : Check `app/dashboard` pour voir l'intégration des filtres sur le tableau de bord que tu avais initié, `app/circuits` pour les cartes interactives, et le bouton "Réserver" dans `app/offers/[id]`.

Bonne revue de code ! ✨

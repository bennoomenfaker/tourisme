Feature: Intégration backend - Modules avancés pour Éco-Voyage

Ce PR ajoute 7 modules backend essentiels pour transformer la plateforme en solution professionnelle complète :

🆕 Nouveaux modules :
- booking/ : Système de réservations complet
- circuit/ : Circuits multi-jours avec GPS
- trip-plan/ : Plans de voyage (innovation clé)
- notification/ : Notifications en temps réel
- favorite/ : Favoris et likes
- review/ : Avis et notations
- map/ : Services cartographiques

🔧 Points clés :
- Compatibilité parfaite avec l'authentification existante
- TypeORM auto-crée les nouvelles tables
- Données réelles tunisiennes incluses
- Architecture moderne et scalable

🚀 Valeur ajoutée :
- Réservations avec anti-conflits
- Circuits organisés jour par jour
- Plans de voyage innovants
- Notifications automatiques

Instructions d'intégration :
1. Sauvegarder le travail actuel
2. Copier les modules backend/src/
3. Mettre à app.module.ts 
4. Lancer npm run start:dev
5. Seeder les catégories: npm run seed:offer-categories
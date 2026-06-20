Feature: Intégration frontend - Interface utilisateur complète

Ce PR ajoute 9 pages frontend pour une expérience utilisateur complète et professionnelle :

🆕 Nouvelles pages :
- /offers/[id] : Détail offre avec réservation
- /circuits : Liste circuits avec filtres
- /circuits/[id] : Détail circuit avec itinéraire GPS
- /reservations : Gestion des réservations
- /notifications : Page notifications en temps réel
- /trip-plans : Plans de voyage innovants
- /dashboard/reservations : Réservations utilisateur
- /dashboard/incoming : Réservations reçues
- /admin/offers : Admin panel amélioré

🎨 Design :
- Material You / Google-like moderne
- Interface responsive mobile-first
- Cartes Leaflet interactives
- Loading states et animations

🔧 Points clés :
- Compatibilité parfaite avec le frontend existant
- Design moderne et professionnel
- Intégration transparente des nouvelles fonctionnalités
- Expérience utilisateur riche et intuitive

Instructions d'intégration :
1. Copier les pages frontend/app/
2. Mettre à jour les dépendances package.json
3. Lancer npm run dev
4. Tester toutes les nouvelles pages
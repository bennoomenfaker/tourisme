# Prompt d'analyse métier — Éco-Voyage

> Prompt prêt à coller dans un autre modèle IA (Claude / GPT / Gemini — le modèle
> importe peu, la qualité du prompt prime). Objectif : challenger et enrichir le
> business model du cœur « Réservation » avec des recommandations actionnables.

---

```
# CONTEXTE PROJET — Éco-Voyage (marketplace de tourisme durable, Tunisie)

Tu es un expert produit + architecte système. Analyse le business d'une plateforme
B2B2C existante et propose des recommandations actionnables. Le code est un fait —
base tes recommandations sur ce qui est réellement implémenté, pas sur des hypothèses.

## Stack technique
- Backend : NestJS + TypeORM (PostgreSQL) + MongoDB (préférences/engagements) + Redis (cache)
- Frontend : Next.js 16 (App Router) + React 19, UI en français
- Modules : auth, users, provider, offer, circuit, guide, collaboration, reservation,
  trip-plan, travel-cart, review, publication, eco-traveler, admin, notification, messages

## Le modèle métier (tel qu'implémenté)
1) OFFRE : Provider → Venue → Offer → OfferItem (unité vendable) → prices
   (pricing_unit : per_person, per_person_per_night, per_room_per_night, per_bed,
   per_group, per_hour, per_day, per_trip, on_request) + sessions (capacité restante)
   + capacité globale. Champs : min/max_group_size, min_age, deposit_percentage
   (STOCKÉ MAIS JAMAIS APPLIQUÉ), confirmation_mode (automatic/manual),
   cancellation_policy, booking_deadline_days, cancellation_deadline_days.
2) CIRCUIT : multi-jours, activités à 4 sources (offre personnelle / offre externe
   d'un autre provider / guide via collaboration / référence indépendante).
   Prix : final_price = prix_activité + guide_applied_price. Réservation avec
   options, snapshot figé, min/max_participants, confirmation_mode.
3) GUIDE : prestations (GuideOffering) + sessions avec remaining_capacity, agenda,
   collaboration bidirectionnelle guide↔provider (wizard 8 étapes,
   prix suggéré vs appliqué).
4) VOYAGEUR : profil + questionnaire → Panier (TravelCart) → Trip Plan
   (regroupe offres + circuits + prestations guide) → Réservation groupée → Avis.
   Score de durabilité pondéré : Questionnaire 20% + Réservations 40% + Feedbacks 20%
   + Partages 20% (réservations et feedbacks sont DÉSORMAIS alimentés
   automatiquement). Préférences voyageur en MongoDB (non exploitées pour la
   recommandation).
5) RÉSERVATION (le cœur) : statuts pending→confirmed/rejected/cancelled/expired,
   confirmed→completed, refus/annulation → restauration de la capacité (offres,
   sessions guide, circuits). Prix TOUJOURS calculés serveur. Verrous pessimistes
   anti-overbooking. Double-réservation même session bloquée. Délais de réservation
   et d'annulation vérifiés serveur. Pas de paiement en ligne ni d'acompte.

## Ce qui est déjà fait (à ne pas re-proposer)
- Anti-overbooking (verrous pessimistes + restauration capacité)
- Prix serveur, délais, min/max participants
- Funnel Panier → Trip Plan → Réservation groupée
- Circuits multi-jours avec agrégation B2B, collaboration guide↔provider
- Score de durabilité relié aux réservations/avis (récemment corrigé)
- Badges AFRATIM pour providers/guides, approbation admin des offres
- Messagerie, notifications, timeline partagée, widget météo

## Erreurs récentes corrigées (à garder en tête)
- Le "refus" de réservation confirmait en base (bug corrigé)
- Le score durabilité ignorait réservations/avis (corrigé)
- deposit_percentage = dead code (toujours à traiter)

## Ce que j'attends de toi
A) AUDIT MÉTIER DE LA RÉSERVATION : énumère les failles et angles morts du cycle
   (abandon de panier non traité, expiration 48h, no-show sans pénalité, refus,
   surréservation résiduelle, cohérence des statuts, multi-établissements, prix
   à la dernière minute, change de devises...). Pour chaque point : impact métier,
   effort estimé, proposition concrète.
B) MONÉTISATION : propose un modèle de revenus adapté au marché tunisien (commission,
   escrow, acompte, abonnement Pro, mise en avant, frais service). Détaille le
   chemin critique pour implémenter le paiement en ligne (Stripe/PayPal/virement)
   et l'acompte avec deposit_percentage — y compris le schéma de données et les
   points de bascule.
C) CROISSANCE : recommandation basée sur les préférences MongoDB, pages SEO par
   région/thème, saisonnalité, réengagement post-voyage (avis + CO2 évité).
D) KPIs et instrumentation du funnel (conversion par étape, abandon panier,
   taux d'occupation des sessions, délai d'approbation admin).
E) 5 risques business les plus graves aujourd'hui et comment les mitiger.

Contrainte : sois concret (schémas de données, endpoints, flux), hiérarchise par
impact/effort, et distingue ce qui est faisable en 1 sprint vs long terme.
```

---

## À quel modèle le donner

Le prompt est volontairement neutre. Recommandations :

| Modèle | Usage |
|---|---|
| **Claude Sonnet / GPT / Gemini** | Analyse business A→E (le prompt est calibré pour eux) |
| Un **agent « mode analyse long »** (opencode/marathon thinking) | Si tu veux un approfondissement plus poussé des points A et B |
| Même modèle que celui-ci | Suffisant — le prompt transporte tout le contexte vérifié |

# Plan de Tests Métier — Tourisme Platform

> **Dernière mise à jour :** 11 Juillet 2026

## Sprint 11 — Tests Bout en Bout

### 11.1 Création d'offre

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Prestataire crée offre hébergement | Offer créée avec venue_id, status=pending | ✅ |
| 2 | Guide crée prestation randonnée | GuideOffering créée avec guide_id, availability rules | ✅ |
| 3 | Prestataire modifie prix offre | Prix mis à jour, circuits existants inchangés | ✅ |
| 4 | Prestataire ajoute OfferItem + Price | Item créé, prix visible dans le catalogue | ✅ |
| 5 | Prestataire ajoute Session + Capacity | Session créée, capacité décrémentable | ✅ |

### 11.2 Réservation

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Réservation simple (1 personne) | Booking créé, capacité décrémentée, notification envoyée | ✅ |
| 2 | Réservation circuit (3 personnes) | CircuitReservation créée, capacité décrémentée pour chaque activité | ✅ |
| 3 | Réservation session complète | Erreur "Capacité insuffisante" | ✅ |
| 4 | Annulation avant délai | Capacité restaurée, notifications envoyées | ✅ |
| 5 | Annulation après délai | Erreur "Délai d'annulation dépassé" | ✅ |
| 6 | Double réservation même session | Erreur "Vous avez déjà réservé" | ✅ |
| 7 | Réservation avec guide | guide_offering_id lié, guide notifié | ✅ |

### 11.3 Circuit

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Créer circuit 3 jours | Circuit créé avec 3 CircuitDays | ✅ |
| 2 | Ajouter activité "ma offre" | linked_offer_item_id = mon item, prix pré-rempli | ✅ |
| 3 | Ajouter activité "offre externe" | linked_offer_item_id = item tiers | ✅ |
| 4 | Ajouter activité "guide" | guide_id lié, guide_cost récupéré | ✅ |
| 5 | Ajouter activité "référence externe" | external_reference JSONB sauvegardé | ✅ |
| 6 | Modifier prix activité | Prix circuit modifié, prix catalogue inchangé | ✅ |
| 7 | Supprimer activité | Activité supprimée, capacité non affectée | ✅ |
| 8 | Supprimer offre liée à circuit | Erreur "X circuit(s) utilisent cette offre" | ✅ |

### 11.4 Recherche

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Recherche offre par région | Offres de la région affichées | ✅ |
| 2 | Recherche guide par zone + date | Guides disponibles à cette date | ✅ |
| 3 | Recherche circuit par durée + difficulté | Circuits correspondants | ✅ |
| 4 | Recherche hébergement dans Circuit Builder | 3 niveaux fonctionnent (propre → autre → externe) | ✅ |
| 5 | Recherche avec filtres combinés | Filtres cumulés fonctionnent | ✅ |

### 11.5 Guide

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Guide crée prestation avec availability rule | Sessions générées pour 90 jours | ✅ |
| 2 | Guide bloque une période | Blocks créés, sessions correspondantes annulées | ✅ |
| 3 | Guide modifie prix saisonnier | price_override sur les sessions | ✅ |
| 4 | Voyageur cherche guide disponible | Guides avec sessions available affichés | ✅ |
| 5 | Voyageur réserve prestation guide | Booking + GuideOfferingSession liés | ✅ |

### 11.6 Collaboration Guide ↔ Prestataire

| # | Scénario | Résultat attendu | Statut |
|---|----------|------------------|--------|
| 1 | Prestataire invite un guide sur une offre | Collaboration créée (status=pending), notification envoyée au guide | ✅ |
| 2 | Guide accepte l'invitation | Status → accepted, notification envoyée au prestataire | ✅ |
| 3 | Guide remplit le wizard 8 étapes | Contribution sauvegardée en JSONB | ✅ |
| 4 | Guide confirme la contribution | Status → completed, completed_at défini, notification au prestataire | ✅ |
| 5 | Guide refuse l'invitation | Status → declined, decline_reason sauvegardée, notification au prestataire | ✅ |
| 6 | Prestataire annule une invitation pending | Status → cancelled | ✅ |
| 7 | Prestataire annule une invitation accepted | Status → cancelled | ✅ |
| 8 | Tentative de double invitation même guide/section | Erreur "Une invitation est déjà en cours" | ✅ |
| 9 | Guide tente de répondre à une invitation non-pending | Erreur "Cette invitation a déjà été traitée" | ✅ |
| 10 | Guide tente de modifier contribution sans avoir accepté | Erreur "Vous ne pouvez modifier que si vous avez accepté" | ✅ |
| 11 | Prestataire voit les collaborations sur `/offers/[id]` | Section "Collaborateurs" affichée avec les contributions | ✅ |
| 12 | Guide voit les invitations dans onglet "Collabs" | Onglet affiché avec statuts (en attente, en cours, historique) | ✅ |
| 13 | Prestataire voit les contributions dans onglet "Collabs" | Onglet affiché avec stats + liste des collaborations | ✅ |
| 14 | Recherche de guide dans le modal d'invitation | Seuls les guides suivis apparaissent | ✅ |
| 15 | Invitation avec message personnalisé | Message sauvegardé et affiché dans la carte | ✅ |

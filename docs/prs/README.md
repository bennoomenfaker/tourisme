# PRs préparées — à revoir avant envoi (non poussées)

Toutes ces PRs sont préparées **localement** sur la branche `pr/reservation-durabilite`
(sous la forme d'un commit par domaine). **Rien n'a été poussé ni envoyé à Maram.**
Le texte ci-dessous est le brouillon de la description de chaque PR.

## Comment envoyer (quand tu décideras)

```bash
git checkout pr/reservation-durabilite
git push -u origin pr/reservation-durabilite   # pousse la branche
# puis créer la PR sur GitHub vers ta branche de destination
```

> Le travail est découpé en commits par domaine. Tu peux soit envoyer **un seul PR**
> pour toute la branche (recommandé, les PRs dépendent les uns des autres), soit
> recréer des branches séparées par PR si tu veux un historique par domaine chez Maram.

## Index

| PR | Domaine | Fichiers | Description |
|---|---|---|---|
| [PR-01](PR-01-score-durabilite.md) | Score durabilité | eco-traveler, review, circuit | Composantes réservations 40% + feedbacks 20% enfin alimentées |
| [PR-02](PR-02-reservation-lifecycle.md) | Réservation | reservation/* | Bug refus=confirmation corrigé + réservations guide complètes |
| [PR-03](PR-03-trip-plan-cart.md) | Trip Plan + Panier | trip-plan, travel-cart, frontend | Réservation groupée circuits + prestations guide, validation publication |
| [PR-04](PR-04-pricing.md) | Pricing (doc) | docs/pricing-logic.md | Logique de prix serveur, unités de facturation, angles morts |
| [PR-05](PR-05-circuit-audit-fixes.md) | Circuit (audit) | circuit/*, domain/* | 3 corrections : garde-fou suppression, devise TND, machine à états expired |
| [PR-06](PR-06-frontend-reservation.md) | Frontend réservations | app/reservations, app/dashboard, app/trip-plans | Alignement sur le modèle réel + UX (toasts, icons, budgets par jour) |

> L'offre (offer) n'a pas de changement de code dans cette série ; la logique de
> prix associée est documentée dans PR-04 et docs/pricing-logic.md.

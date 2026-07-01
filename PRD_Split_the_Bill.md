# Product Requirements Document

## Fonctionnalité "Split the Bill" – Partage de Commande

| Propriété | Valeur |
|-----------|--------|
| Date | Juillet 2026 |
| Auteur | Product Management – Deliveroo |
| Statut | Spec de Fonctionnalité |
| Version | 1.0 |

---

## 1. Vue d'Ensemble

Cette fonctionnalité permet aux utilisateurs de passer une seule commande à partager entre plusieurs personnes nommées, en assignant chaque article (ou portion d'article) à un invité. La commande génère automatiquement un récapitulatif par personne incluant les sous-totaux, taxes, frais de livraison (si applicable) et le total à payer. Le système gère les cas limites complexes : articles partagés, partages inégaux, arrondi des centimes.

---

## 2. Objectifs Métier

- Simplifier le processus de commande entre amis/collègues en centralisant la gestion des paiements
- Réduire les frictions lors du partage de repas (pas besoin de diviser manuellement)
- Augmenter la valeur moyenne des commandes en facilitant les commandes groupées
- Accroître l'engagement client en offrant une fonctionnalité ludique et pratique
- Créer un avantage compétitif vs autres plateformes de delivery

---

## 3. Scope

### 3.1 Inclus

- Étape de création/modification de commande : ajouter des invités nommés (max 5 + commandant = 6 personnes)
- Interface d'assignation d'articles : assigner par personne ou partager équitablement
- Logique de partage en quantités : ex. 2 parts pour Alice, 1 part pour Bob
- Calcul automatique : sous-totaux par article, taxes par article, répartition équitable des taxes
- Sommaire par personne : affichage dans le panier et dans le modal de paiement
- Gestion des arrondis : correction du dernier centime pour éviter écarts de centimes
- Option de paiement : une seule personne paie tout, OU plusieurs paiements séparés (à choisir dans la commande)
- Récapitulatif paiement : affichage clair pour le payeur et les invités de leur part
- Notification/suivi : les invités reçoivent un lien/code pour voir la répartition et confirmer

### 3.2 Exclus (Phase 2)

- Intégration avec Venmo/PayPal pour remboursements automatiques
- Historique de partages (favoris/modèles)
- Paiement par invité (p2p) – uniquement le mode "un payeur + notification"
- Rappels SMS/Email aux invités de payer leur part
- Suivi du remboursement entre amis
- Modifications post-commande (ex. un invité ajoute un article)
- Partage de frais de livraison non proportionnel

---

## 4. Flux Utilisateur

### 4.1 Scénario Principal : Commande Partagée

1. Utilisateur ouvre Deliveroo et sélectionne un restaurant
2. Panier pré-rempli : option "Partager avec des invités" (toggle ou bouton)
3. Clic → Modal "Ajouter des invités" : saisie de noms (max 5 invités, sans emails pour MVP)
4. Retour au panier : chaque article affiche un sélecteur "Assigner à"
5. Pour chaque article :
   - Bouton/menu déroulant "Qui ?" avec liste [Moi, Invité1, Invité2, …, Partager]
   - Si "Partager" → afficher sous-menu pour définir les parts (ex. 1 part Moi, 1 part Alice, 2 parts Bob)
   - Récapitulatif en temps réel du prix par personne
6. Mode de paiement : "Qui paie ?" → sélectionner une personne ou "Partager les frais"
7. Checkout : afficher la répartition avant paiement
8. Confirmation : invite liens vers le récapitulatif pour les invités
9. Mode notification : invités reçoivent lien/code pour voir leur part (pas d'intégration paiement pour MVP)

### 4.2 Scénario Alternatif : Paiements Séparés

Mode "Partager les frais" : chaque invité doit payer sa part. Dans ce mode, la commande n'est finalisée que lorsque tous les invités ont confirmé leur part (ou après X minutes, une personne paie tout).

---

## 5. Spécifications Détaillées

### 5.1 Gestion des Invités

- Maximum 5 invités nommés + commandant = 6 personnes max
- Noms saisie libre (pas d'emails requis pour MVP)
- Édition/suppression d'invités avant validation du panier
- Après validation, les noms sont gelés (modifiable uniquement en créant une nouvelle commande)
- Interface : modal ou slide-up panel selon le design existant

### 5.2 Assignation d'Articles

- Chaque article du panier a une ligne de sélection "Assigner à"
- Options :
  - [Moi] – article assigné uniquement au commandant
  - [Invité X] – article assigné à une seule personne
  - [Partager] – article divisé entre plusieurs personnes
- Par défaut (non spécifié) : article assigné au commandant
- Si article dans panier (quantité > 1) :
  - Option 1 (simple) : partage équitable automatique
  - Option 2 (avancé) : interface pour spécifier les parts
- Interface : contrôles inline ou modal selon complexité

### 5.3 Logique de Calcul

| Élément | Logique |
|---------|---------|
| Prix article | Somme du prix unitaire × quantité |
| Taxe par article | Taxe = Prix article × Taux TVA applicable |
| Sous-total personne | Somme (Prix articles assignés + Part de taxes assignées) |
| Frais (livraison, service) | Répartis équitablement par personne (montant / nb personnes) |
| Total personne | Sous-total + Part des frais (arrondis) |

#### 5.3.1 Partage Équitable avec Quantités

- Article : Pizza €12, assigné à Alice (2 parts) et Bob (1 part)
- Total parts = 3
- Prix par part = €12 / 3 = €4
- Alice = €4 × 2 = €8
- Bob = €4 × 1 = €4
- Taxe (10%) : €1.20 → répartition proportionnelle
- Alice : €0.80 | Bob : €0.40

#### 5.3.2 Gestion de l'Arrondi

- Scénario problématique : commande €10 entre 3 personnes = €3.33... par personne
- Approche : calculer 2 parts à €3.33, la dernière personne paie €3.34 (différence arrondie)
- Règle : la dernière personne (ou la première, à définir) absorbe les centimes manquants
- Affichage : montant exact pour chaque personne, pas d'approximation
- Validation : somme des parts = total commande (cent par cent)

### 5.4 Modes de Paiement

**Option A : Un Payeur (Défaut)**
- Une seule personne paie la totalité
- Sélectionner "Qui paie ?" dans le panier
- Récapitulatif : afficher qui paie et montant total
- Invités reçoivent notification avec leur part (info seulement, pas de paiement)

**Option B : Paiements Séparés**
- Mode "Partager les frais" : chacun paie sa part
- Non implémenté pour MVP – noté comme "À venir"
- Fallback : message "Cette option sera disponible bientôt" ou forcer le mode "Un payeur"

### 5.5 Récapitulatif et Modal de Paiement

- Avant paiement : afficher "Récapitulatif par personne"
- Tableau : Personne | Articles | Sous-total | Taxes | Frais | Total
- Exemple :
  - Alice : Burger €8, Frites €3 | ST €11 | Tax €1.10 | Frais €2.50 | Total €14.60
  - Bob : Burger €8 | ST €8 | Tax €0.80 | Frais €2.50 | Total €11.30
- Vérification : Total Alice + Bob = Total Commande
- Bouton "Confirmer et Payer" : procède au paiement
- Après succès : afficher codes/liens pour les invités (MVP : lien simple, pas intégration paiement)

### 5.6 Gestion des Cas Limites

| Cas Limite | Comportement |
|-----------|--------------|
| Invité sans article | Invité peut rester dans la commande avec Total = €0 OU retirer la personne. À confirmer UX. |
| Article annulé du restaurant | Retracer automatiquement la répartition. Article remis à zéro, autres articles conservent leurs assignations. |
| Commandant paie, invité annule | MVP : pas d'annulation/modification post-commande. Futur : logique de remboursement. |
| Promo/Code coupon | Réduction appliquée avant calcul des parts (applicable à tout le panier). Répartition au prorata des sous-totaux. |
| Article sans quantité (boisson gratuite) | Traiter comme quantité = 1. Partager équitablement si assigné à plusieurs. |

---

## 6. User Interface

### 6.1 Panier Existant

- Ajouter un bouton/toggle en haut du panier : "Partager cette commande ?" (ou icon + texte)
- Au clic : afficher modal "Ajouter des invités"
- Une fois activé : ajouter colonne/sélecteur à chaque article pour assigner à une personne

### 6.2 Modal "Ajouter des Invités"

- Titre : "Qui partage ce repas ?"
- Liste éditable : [Nom invité] [X] pour chaque personne
- Bouton "+ Ajouter une personne"
- Limite visuelle : "5 invités max" en gris sous la liste
- Boutons : "Annuler" et "Continuer"
- Validation : au moins 1 invité + 1 commandant

### 6.3 Panier Modifié (Mode Partage Actif)

- Chaque ligne d'article affiche sélecteur/bouton "Assigner à"
- Interface option 1 : dropdown inline "Moi | Alice | Bob | Partager"
- Interface option 2 : bouton "Assigner" → modal détaillé pour partage avancé
- Récapitulatif au-dessus du panier : sous-total par personne (live update)
  - Exemple : Alice : €12.50 | Bob : €8.30 | Total : €20.80
- Option de paiement : bouton "Qui paie ?" → menu "Moi | Alice | Bob | [En attente d'implémentation]"

### 6.4 Modal "Partage d'Article" (Avancé)

- Titre : "[Nom article] – Partager entre qui ?"
- Liste des invités + commandant
- Pour chaque personne : input "Nombre de parts" (par défaut 0 ou 1)
- Affichage dynamique du prix par part (en temps réel)
- Exemple : Pizza €12 (3 parts totales) | Alice : 2 parts = €8.00 | Bob : 1 part = €4.00
- Boutons : "Annuler" et "Valider"

### 6.5 Confirmation Paiement

- Écran avant paiement (comme le checkout actuel)
- Section "Récapitulatif par personne" : tableau détaillé
- Ligne 1 : Personne 1 | Articles assignés | €... + Taxes + Frais = €...
- Ligne 2 : Personne 2 | ...
- Ligne de paiement : "Qui paie ?" → [Personne choisie]
- Bouton "Confirmer et Payer"
- Post-paiement : afficher codes/liens à partager avec les invités

---

## 7. Flux de Données et Stockage

### 7.1 Modèle de Données

Structure de Commande Partagée (à ajouter à la structure existante):

```
order.sharedBill {
  enabled: boolean,
  guests: [...],
  paymentMode,
  breakdown: {...}
}

order.sharedBill.guests: [
  {
    id,
    name,
    items: [{itemId, quantity, partShare}],
    total,
    taxes,
    fees
  }
]

order.sharedBill.paymentMode: "singlePayer" | "splitPayment" | null
order.sharedBill.payer: userId ou guestId (si singlePayer)

order.sharedBill.breakdown: {
  subtotalPerGuest: {...},
  taxPerGuest: {...},
  feePerGuest: {...},
  totalPerGuest: {...},
  corrections: [{guestId, amount}]
}
```

### 7.2 Validation Backend

- À la soumission de la commande : valider que somme(totaux par personne) = total de commande
- Vérifier assignations cohérentes (pas d'article perdu)
- Appliquer corrections d'arrondi si nécessaire
- Logger les détails de partage pour support/tracking

---

## 8. Non-Fonctionnel et Performance

- **Latence** : le calcul du résumé par personne doit être < 100ms même avec 5 invités et 50 articles
- **Accessibilité** : interface compatible avec les lecteurs d'écran pour modales et sélecteurs
- **Responsive** : fonctionnalité doit marcher sur mobile et desktop
- **Rétrocompatibilité** : les anciennes commandes (sans partage) continuent à fonctionner
- **Sécurité** : limiter le nombre de requêtes pour créer une commande (rate limiting)
- **A/B test** : supporter l'activation progressive (rollout 5% → 50% → 100% des utilisateurs)

---

## 9. Analytics et Métriques

Événements à tracker :

- `shared_bill_enabled` – utilisateur active la fonctionnalité
- `shared_bill_guests_added` – nombre d'invités ajoutés
- `shared_bill_completed` – commande finalisée avec partage
- `shared_bill_payment_method` – mode de paiement choisi
- `shared_bill_value` – montant moyen de commandes partagées

**KPI** : conversion (utilisateurs utilisant partage / total utilisateurs), AOV pour commandes partagées, fréquence d'utilisation

**Dashboard** : suivi par cohort, device, région

---

## 10. Timeline et Livrables

| Phase | Livrables | Durée |
|-------|-----------|-------|
| Design | Wireframes, prototypes haute-fidélité, spécifications d'interaction | 2 semaines |
| MVP – Backend | Logique de calcul, API de partage, validation, stockage | 3-4 semaines |
| MVP – Frontend | Modales, sélecteurs, résumé par personne, intégration checkout | 3-4 semaines |
| QA + Rollout | Test cas limites, arrondi, A/B test progressif | 2 semaines |
| **Total MVP** | | **10-12 semaines** |

---

## 11. Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| Confusion UX : interface trop complexe | Adoption faible, support client élevé | Tests utilisateurs itératifs, progressive disclosure (montrer options avancées que si utile) |
| Bugs d'arrondi → écarts financiers | Churn client, risque légal | Suite de tests exhaustive, validation backend stricte, logs détaillés |
| Performance dégradée (calcul lent) | Chargement panier ralenti | Cache des résultats, optimisation du calcul, monitoring perf |
| Intégration avec promo/codes coupon complexe | Bugs, réclamations de clients | Commencer par cas simple (promo 1 seule), tests manuels intensifs |

---

## 12. Dépendances

- **Infrastructure backend** : aucune nouvelle infra requise, utiliser système existant de panier/commande
- **Design** : impliquer l'équipe design pour mockups (dépendance : 2 semaines)
- **Backend** : calcul de partage, intégration avec le système de paiement existant
- **Frontend** : modification du panier existant + modales
- **Analytics** : intégrer les événements dans le système de tracking existant (Segment/Mixpanel/autre)

---

## 13. Critères d'Acceptation

- Utilisateur peut ajouter 1-5 invités nommés
- Utilisateur peut assigner chaque article à une personne ou le partager
- Système calcule correctement sous-totaux, taxes, frais par personne
- Somme des totaux par personne = total commande (test pour 100+ commandes de test)
- Modal de paiement affiche la répartition lisiblement
- Cas limites testés : articles partagés, arrondi, 5 invités, réductions, taxes variables
- Performance : résumé calcule en < 100ms même avec 5 invités + 50 articles
- Accessible : modales et sélecteurs testés pour accessibilité
- Retrocompatibilité : anciennes commandes chargent correctement
- Analytics : événements trackent correctement (test en QA)

---

## 14. Annexes

### 14.1 Exemples de Calcul Détaillé

#### Exemple 1 : Partage Simple à 2

**Articles :**
- Burger €8 (assigner à Alice)
- Frites €3 (partager 1/1 Alice & Bob)

**Taxes (10%)** : €1.10 total
**Frais livraison** : €2.50

**Calcul :**
- Alice : Burger €8 + ½ Frites €1.50 = €9.50
- Bob : ½ Frites €1.50 = €1.50
- Taxes (10%) : Alice €0.95, Bob €0.15
- Frais : Alice €1.25, Bob €1.25
- Total Alice : €9.50 + €0.95 + €1.25 = **€11.70**
- Total Bob : €1.50 + €0.15 + €1.25 = **€2.90**
- ✓ Somme : €14.60

#### Exemple 2 : Division Inégale avec Arrondi

**Articles :**
- Pizza €10 (partager 2/1 : Alice 2 parts, Bob 1 part)

**Taxes (10%)** : €1.00
**Frais** : €3.00

**Calcul :**
- Prix par part : €10 / 3 = €3.33...
- Alice (2 parts) : €3.33 × 2 = €6.66
- Bob (1 part) : €3.34 (arrondi: absorbe les centimes)
- Taxes : Alice €0.67, Bob €0.33 (proportionnel)
- Frais : Alice €2.00, Bob €1.00 (proportionnel)
- Total Alice : €6.66 + €0.67 + €2.00 = **€9.33**
- Total Bob : €3.34 + €0.33 + €1.00 = **€4.67**
- ✓ Somme : €14.00


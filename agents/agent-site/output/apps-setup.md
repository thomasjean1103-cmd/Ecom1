# Configuration Apps Shopify — FELINO
**Date :** Mars 2026

---

## Stack Apps Recommandée (Budget < 500€/mois)

### Apps Essentielles au Lancement

---

#### 1. Vitals — All-in-One Marketing
**Prix :** 29$/mois | **Priorité :** OBLIGATOIRE

**Ce que ça remplace :** 40+ apps séparées
**Fonctions clés à activer :**
- [ ] Product Reviews (avis clients avec photos)
- [ ] Upsell & Cross-sell (popup panier)
- [ ] Sticky Add to Cart (bouton ATC visible en scroll)
- [ ] Trust Badges (badges de confiance sous ATC)
- [ ] Recently Viewed Products
- [ ] Free Shipping Bar (barre progression livraison gratuite)
- [ ] Currency Converter (pour BE/CH)

**Configuration rapide :**
1. Installer depuis l'App Store Shopify
2. Activer les 7 fonctions listées ci-dessus
3. Personnaliser couleurs pour correspondre à la charte FELINO (#1A1A1A, #C4B5A0)
4. Configurer le seuil livraison gratuite à 49€

---

#### 2. Klaviyo — Email Marketing
**Prix :** Gratuit jusqu'à 500 contacts | **Priorité :** OBLIGATOIRE

**Flows à créer en priorité :**
- [ ] **Welcome Series** (3 emails) : inscription → -10% → présentation FELINO → produit phare
- [ ] **Abandoned Cart** (2 emails) : 1h après abandon → 24h après → rappel avec avis
- [ ] **Post-Purchase** (2 emails) : confirmation → J+5 demande d'avis → J+30 réachat filtres
- [ ] **Browse Abandonment** : produit vu mais pas ajouté au panier

**Configuration rapide :**
1. Connecter Klaviyo à Shopify (intégration native)
2. Importer charte FELINO dans les templates
3. Créer les 4 flows ci-dessus
4. Configurer le formulaire popup d'inscription (-10% première commande)

---

#### 3. Judge.me — Avis Clients
**Prix :** Gratuit (plan de base suffisant) | **Priorité :** OBLIGATOIRE

**Configuration :**
- [ ] Activer demande d'avis automatique J+14 après livraison estimée
- [ ] Activer import d'avis AliExpress (pour les premiers avis)
- [ ] Personnaliser email de demande d'avis (ton FELINO)
- [ ] Activer affichage étoiles sur Google (rich snippets)
- [ ] Activer photos dans les avis

---

#### 4. ReConvert — Thank You Page Upsell
**Prix :** 4.99$/mois | **Priorité :** RECOMMANDÉE

**Configuration :**
- [ ] Ajouter offre de réachat (filtres fontaine à -15%)
- [ ] Ajouter produit complémentaire (hamac si griffoir acheté, et inversement)
- [ ] Timer urgence 15 minutes
- [ ] Section "Laisse un avis" avec lien direct

---

#### 5. Microsoft Clarity — Heatmaps (Gratuit)
**Prix :** Gratuit | **Priorité :** RECOMMANDÉE

**Utilisation :** Voir où les visiteurs cliquent, jusqu'où ils scrollent, où ils abandonnent.
**Installation :** Ajouter le script dans les paramètres Shopify > Thème > Modifier le code > theme.liquid

---

### Apps à Ajouter Plus Tard (Mois 3+)

| App | Usage | Prix | Quand l'ajouter |
|-----|-------|------|-----------------|
| Loox | Avis avec photos (plus beau que Judge.me) | 9.99$/mois | Après 50 avis |
| Tidio | Chat live + chatbot | Gratuit/19$ | Après 100 commandes |
| Privy | Popups avancés | 30$/mois | Après optimisation trafic |
| Recharge | Abonnements (filtres fontaine) | 99$/mois | Après 200 clients |

---

## Configuration Shopify Payments

### Moyens de Paiement à Activer
- [ ] Carte bancaire (Visa, Mastercard, Amex) via Shopify Payments
- [ ] PayPal (obligatoire — beaucoup de clients FR l'exigent)
- [ ] Klarna (paiement en 3x sans frais — augmente AOV de 15-25%)
- [ ] Apple Pay / Google Pay (activés automatiquement avec Shopify Payments)

### Devises
- [ ] EUR (principale)
- [ ] CHF (pour la Suisse — Vitals gère la conversion)

---

## Configuration Livraison

### Zones et Tarifs
| Zone | Tarif | Seuil livraison gratuite |
|------|-------|--------------------------|
| France | 3,99€ | Gratuit dès 49€ |
| Belgique | 4,99€ | Gratuit dès 59€ |
| Suisse | 7,99€ | Gratuit dès 79€ |
| Reste Europe | 9,99€ | Gratuit dès 99€ |

### Délais Affichés
- France : 7-12 jours ouvrés
- Belgique : 8-14 jours ouvrés
- Suisse : 10-16 jours ouvrés

---

## Configuration Emails Transactionnels

### Templates à Personnaliser (dans Shopify > Notifications)
- [ ] Confirmation de commande → ajouter logo FELINO + message chaleureux
- [ ] Confirmation d'expédition → ajouter numéro de suivi + lien tracking
- [ ] Annulation de commande → ton empathique + proposition alternative
- [ ] Remboursement → message rassurant + invitation à revenir

**Ton recommandé :**
> "Coucou [Prénom] ! Ton colis FELINO est en route 🐾 Tu peux suivre sa progression ici : [LIEN]. Si tu as la moindre question, réponds directement à cet email — on répond en moins de 24h."

# Checklist Tracking & Analytics — FELINO
**Date :** Mars 2026

---

## 1. Google Analytics 4 (GA4)

### Installation
- [ ] Créer propriété GA4 sur analytics.google.com
- [ ] Copier l'ID de mesure (format : G-XXXXXXXXXX)
- [ ] Dans Shopify : Paramètres > Boutique en ligne > Préférences > Google Analytics → coller l'ID

### Événements à Vérifier (automatiques avec Shopify)
- [ ] `page_view` — toutes les pages
- [ ] `view_item` — fiche produit vue
- [ ] `add_to_cart` — ajout au panier
- [ ] `begin_checkout` — début du checkout
- [ ] `purchase` — achat confirmé

### Rapports Essentiels à Configurer
- [ ] Rapport acquisition (d'où viennent tes visiteurs)
- [ ] Rapport conversion (entonnoir de vente)
- [ ] Rapport produits (quels produits performent)
- [ ] Rapport géographique (FR vs BE vs CH)

---

## 2. Meta Pixel (Facebook/Instagram Ads)

### Installation
- [ ] Créer Pixel dans Meta Business Manager
- [ ] Installer via app officielle "Facebook & Instagram" sur Shopify
- [ ] Activer le Conversions API (CAPI) pour contourner les bloqueurs de pubs
- [ ] Vérifier dans Meta Events Manager que les événements remontent

### Événements Critiques à Vérifier
| Événement | Déclencheur | Priorité |
|-----------|-------------|---------|
| PageView | Toute page | Obligatoire |
| ViewContent | Fiche produit | Obligatoire |
| AddToCart | Bouton ATC | Obligatoire |
| InitiateCheckout | Début paiement | Obligatoire |
| Purchase | Confirmation commande | CRITIQUE |

### Test du Pixel
1. Installer l'extension Chrome "Meta Pixel Helper"
2. Naviguer sur ton site et simuler un parcours d'achat
3. Vérifier dans Meta Pixel Helper que chaque événement se déclenche correctement

---

## 3. TikTok Pixel

### Installation (si TikTok Ads)
- [ ] Créer Pixel dans TikTok Ads Manager
- [ ] Installer via app "TikTok" sur Shopify App Store
- [ ] Activer Events API (TikTok CAPI)
- [ ] Vérifier remontée événements dans TikTok Ads Manager

### Événements à Activer
- [ ] ViewContent, AddToCart, InitiateCheckout, Purchase

---

## 4. Google Search Console

### Configuration
- [ ] Ajouter propriété sur search.google.com/search-console
- [ ] Vérification de propriété via méta-tag HTML (Shopify > Thème > Modifier le code)
- [ ] Soumettre le sitemap : felino.fr/sitemap.xml
- [ ] Vérifier dans 48-72h que Google indexe les pages

---

## 5. Microsoft Clarity (Heatmaps — Gratuit)

### Installation
- [ ] Créer compte sur clarity.microsoft.com
- [ ] Copier le script de tracking
- [ ] Coller dans Shopify > Thème > Modifier le code > theme.liquid (avant </head>)
- [ ] Vérifier dans 24h que les sessions commencent à apparaître

### Ce qu'il faut analyser
- Heatmaps : où cliquent les visiteurs sur la page produit ?
- Scroll maps : jusqu'où scrollent-ils avant de partir ?
- Session recordings : regarder des sessions réelles pour identifier les blocages

---

## 6. Checklist Go-Live Complète

### Technique
- [ ] Domaine felino.fr connecté et SSL actif (cadenas vert)
- [ ] Score Google PageSpeed Mobile > 60 (tester sur pagespeed.web.dev)
- [ ] Toutes les images compressées (TinyPNG ou Shopify auto-compress)
- [ ] Site responsive vérifié sur iPhone, Android, tablette
- [ ] Favicon configuré (logo FELINO 32x32px)

### Contenu
- [ ] Toutes les photos produit uploadées (minimum 5 par produit)
- [ ] Descriptions produit complètes et relues
- [ ] Métadonnées SEO renseignées (titre + description pour Google)
- [ ] Pages légales complètes (CGV, confidentialité, retours, mentions légales)
- [ ] Page "À propos" publiée
- [ ] Page "Contact" avec formulaire fonctionnel

### Paiement & Commandes
- [ ] Test commande réelle effectué (avec vrai paiement → rembourser immédiatement)
- [ ] Email de confirmation commande reçu et correct
- [ ] Email de confirmation expédition testé
- [ ] Politique de livraison visible avant le paiement
- [ ] Tous les moyens de paiement fonctionnels (CB, PayPal, Klarna)

### Tracking
- [ ] GA4 reçoit des données en temps réel
- [ ] Meta Pixel Helper confirme les événements
- [ ] Purchase event déclenché sur la commande test
- [ ] Google Search Console validé + sitemap soumis

### Avant Premier Euro de Pub
- [ ] Taux de conversion testé manuellement (parcours complet fluide)
- [ ] Mobile checkout sans friction
- [ ] Page de confirmation commande soignée (ReConvert configuré)
- [ ] Au moins 10 avis importés (AliExpress ou manuels)
- [ ] Barre de livraison gratuite visible
- [ ] Trust badges visibles sous le bouton ATC

---

## Dashboard KPIs à Surveiller Chaque Semaine

| Métrique | Source | Cible |
|---------|--------|-------|
| Visiteurs uniques | GA4 | Croissance semaine/semaine |
| Taux de conversion | Shopify Analytics | > 2% |
| AOV (panier moyen) | Shopify Analytics | > 45€ |
| ROAS | Meta Ads Manager | > 2.5x |
| CAC | Meta Ads Manager | < 15€ |
| Taux d'abandon panier | GA4 | < 70% |
| Taux d'ouverture email | Klaviyo | > 35% |

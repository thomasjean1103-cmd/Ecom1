# Stratégie Meta Ads — VELIRA
## Structure de campagnes Facebook/Instagram (inspirée felira.de)

---

## 1. ANALYSE CONCURRENTE — felira.de

### Ce qu'on sait
- **102 ads actives** en Mars 2026
- Marché : Allemagne uniquement
- Trafic 100% payant (pas d'organique)
- 9K visites/mois = ~€500-1000/mois de budget estimé

### Ce qu'on peut copier
- Volume de tests (ils testent beaucoup de créatifs)
- Marché cible allemand confirmé
- Format produit single (hoodie)

### Ce qu'on améliore
- Meilleur SAV = CAC plus faible (retargeting naturel)
- UGC authentique = meilleur CTR
- Email flows = ROAS total supérieur

---

## 2. ARCHITECTURE CAMPAGNES (CBO)

```
COMPTE META ADS
├── CAMPAGNE 1 — COLD TRAFFIC (CBO €20/jour)
│   ├── AdSet 1 — Broad DE 18-35 (sans intérêts)
│   ├── AdSet 2 — Intérêts Mode/Streetwear DE
│   └── AdSet 3 — Lookalike 1% acheteurs (dès 50+ conversions)
│
├── CAMPAGNE 2 — RETARGETING (CBO €10/jour)
│   ├── AdSet 1 — Visiteurs page produit (7 jours)
│   ├── AdSet 2 — Abandons panier (3 jours)
│   └── AdSet 3 — Vues vidéo 75%+ (30 jours)
│
└── CAMPAGNE 3 — SCALING (activer quand ROAS >2.5x)
    ├── AdSet 1 — Winning audience × 2 budget
    ├── AdSet 2 — Expansion AT/CH (DACH)
    └── AdSet 3 — Lookalike 2-5% DE
```

---

## 3. BUDGET PHASES

### Phase 1 — Testing (J1 à J14)
- Budget : €20-30/jour
- Objectif : Trouver 1-2 créatifs gagnants
- KPIs cibles : CTR >1.5%, CPC <€1.50, CPM <€20
- Action : Couper les adsets si CPM >€30 ou 0 achat après €15

### Phase 2 — Validation (J15 à J21)
- Budget : €50-70/jour
- Objectif : ROAS >2x stable
- KPIs cibles : ROAS >2x, CAC <€15, CVR >2%
- Action : Dupliquer les winners, couper les losers

### Phase 3 — Scaling (J22+)
- Budget : +20% tous les 3-4 jours si ROAS stable
- Objectif : €100-200/jour avec ROAS >2.5x
- Expansion : Autriche + Suisse (DACH)

---

## 4. CRÉATIFS (102 ADS COMME FELIRA)

### Formats à tester (en parallèle)

#### Format 1 — UGC Simple (meilleur CTR)
```
Hook (0-3s): "Rate mal was das kostet..." [personne montre le hoodie]
Problème (3-8s): "Ich habe so viele Hoodies gekauft, die nach einer Woche kaputt waren"
Solution (8-20s): [Montre la texture, met le hoodie]
CTA (20-30s): "Link in der Bio / Swipe up — nur €44,99"
```

#### Format 2 — Testimonial Direct
```
"Ich habe den Cloud Hoodie jetzt 3 Monate.
Ich habe ihn mindestens 30x gewaschen.
Er sieht noch aus wie am ersten Tag.
€44,99. Den Link findest du unten."
```

#### Format 3 — Static Image (pour feed)
- Photo produit sur fond blanc
- Prix barré (€89 →) €44.99
- "Schnelle Lieferung nach Deutschland"
- 5 étoiles + "312 Bewertungen"

#### Format 4 — Comparaison Prix
- ZALANDO : €89 --- VELIRA : €44.99
- "Gleiche Qualität. Halber Preis."

#### Format 5 — Before/After Hoodie Quality
- Avant : hoodie cheap déformé
- Après : VELIRA après 30 lavages comme neuf

### Matrice de test (Phase 1)
| Variable | Variante A | Variante B | Variante C |
|----------|-----------|-----------|-----------|
| Hook | Prix surprise | POV | Problème |
| Format | Vidéo UGC | Static | Carousel |
| CTA | Jetzt kaufen | Link in Bio | Swipe Up |
| Couleur | Noir | Beige | Gris |

→ **Total : 3×3×3×3 = 81 combinaisons** (similaire aux 102 de felira.de)

---

## 5. KPIs CIBLES

| Métrique | Seuil minimal | Cible | Action si <seuil |
|----------|--------------|-------|-----------------|
| CTR | 1.0% | >1.5% | Changer le hook |
| CPM | <€25 | <€18 | Élargir l'audience |
| CPC | <€2.00 | <€1.20 | Améliorer la copy |
| CVR page | >1.5% | >2.5% | Optimiser la page produit |
| CAC | <€20 | <€12 | Scaler si <€15 |
| ROAS | >1.5x | >2.5x | Scaler si >2x 3 jours consécutifs |

---

## 6. AUDIENCES DE RETARGETING

### Séquence de retargeting

**J1-3 après visite :** Message chaud
> "Du hast den Hoodie gesehen. Er ist noch da. Aber nicht lange."

**J4-7 abandon panier :** Urgence + preuve sociale
> "312 Personen haben ihn bereits. Einer weniger in deiner Größe."

**J8-14 :** Dernière chance + promo
> "Letzte Chance: -10% mit Code ZURÜCK10"

---

## 7. PIXEL & TRACKING

### Events à configurer (Shopify + Meta Pixel)
- `ViewContent` — Page produit
- `AddToCart` — Ajout panier
- `InitiateCheckout` — Début checkout
- `Purchase` — Achat confirmé (valeur dynamique)

### Audiences custom à créer
- All Website Visitors 30j
- Product Page Viewers 7j
- Add to Cart 3j
- Purchasers 180j (exclure du cold)
- Video Views 75% 30j

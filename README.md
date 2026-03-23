# Mission Commerce — MVP SaaS Next.js

SaaS e-commerce guidé par missions pour valider un produit à partir de preuves terrain.

## Stack
- Next.js App Router
- TypeScript strict
- Tailwind CSS
- UI inspirée shadcn/ui (composants locaux réutilisables)
- Supabase (schéma SQL fourni pour Postgres/Auth/Storage)
- Moteur d'analyse mock remplaçable plus tard par OpenAI

## Arborescence
```txt
app/
  page.tsx
  auth/login/page.tsx
  auth/signup/page.tsx
  dashboard/page.tsx
  dashboard/projects/new/page.tsx
  dashboard/projects/[projectId]/page.tsx
  dashboard/projects/[projectId]/mission/page.tsx
components/
  dashboard/
  forms/
  layout/
  ui/
lib/
  analysis/mock-engine.ts
  constants/missions.ts
  data/repository.ts
  domain/types.ts
  mock/storage.ts
  supabase/schema.sql
```

## Lancement local
```bash
npm install
npm run dev
```

Ouvrir ensuite `http://localhost:3000`.

## Déploiement Vercel
1. Importer le dépôt dans Vercel.
2. Configurer les variables Supabase plus tard si vous branchez le backend réel.
3. Build command: `npm run build`
4. Output: `.next`

## Supabase
Le schéma et le seed des missions sont dans `lib/supabase/schema.sql`.

- `checklist-lancement.md` — Rien n'oublier avant le go-live
- `kpis-ecom.md` — Toutes les formules et cibles
- `outils-stack.md` — Quel outil choisir et à quel prix
- `legal-templates/` — Templates légaux prêts à personnaliser


---

## Analysis Engine modulaire

Le dépôt expose maintenant un service modulaire `analysis-engine/` pour analyser les preuves d’une mission sans dépendre d’une vraie clé API.

### Contrat d’entrée
- `missionId`
- `missionName`
- `objective`
- `market` *(optionnel)*
- `channel` *(optionnel)*
- `evidence[]` avec `id`, `type`, `label`, `value`, `confidence`, `source`, `notes`

### Contrat de sortie
- `score`
- `summary`
- `decision`
- `next_action`
- `strengths[]`
- `weaknesses[]`
- `red_flags[]`

### Modules
- `analysis-engine/types.js` — types JSDoc et enums de contrat
- `analysis-engine/prompt-builder.js` — construction du prompt structuré
- `analysis-engine/service.js` — interface unique `AnalysisEngine`
- `analysis-engine/mock-provider.js` — implémentation mock compatible
- `analysis-engine/index.js` — exports + factory `createMockAnalysisEngine()`

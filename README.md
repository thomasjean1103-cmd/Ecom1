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

## Remplacer le moteur mock par OpenAI
- `lib/analysis/mock-engine.ts` contient le moteur actuel.
- `lib/data/repository.ts` est la couche d'orchestration à remplacer par un provider Supabase + OpenAI.
- `lib/mock/storage.ts` sert de backend local pour le MVP et les démonstrations hors réseau.

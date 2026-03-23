create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  niche text not null,
  market text not null,
  budget text not null,
  experience_level text not null,
  status text not null default 'active',
  current_phase text not null default 'recherche-produit',
  current_mission_order int not null default 1,
  overall_score int null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  objective text not null,
  instructions text not null,
  required_evidence jsonb not null default '[]'::jsonb,
  order_index int not null unique
);

create table if not exists public.project_missions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  status text not null default 'locked',
  submitted_at timestamptz null,
  score int null,
  ai_summary text null,
  ai_decision text null,
  next_action text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, mission_id)
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  project_mission_id uuid not null references public.project_missions(id) on delete cascade,
  type text not null,
  content text null,
  file_url text null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  project_mission_id uuid not null references public.project_missions(id) on delete cascade,
  model text not null,
  input_summary text not null,
  output_json jsonb not null,
  created_at timestamptz not null default now()
);

insert into public.missions (slug, title, objective, instructions, required_evidence, order_index)
values
('signaux-organiques', 'Signaux organiques', 'Vérifier si le problème et l’intérêt existent déjà sur les plateformes organiques.', 'Va sur TikTok ou Instagram, cherche des contenus liés au problème, trouve 5 à 10 contenus pertinents, puis envoie captures, liens, hooks et commentaires utiles.', '["5 à 10 liens de contenus", "Hooks observés", "Commentaires utiles", "Captures"]'::jsonb, 1),
('signaux-pub', 'Signaux publicitaires', 'Vérifier l’existence d’annonceurs actifs et d’angles déjà monétisés.', 'Va sur Meta Ads Library, trouve 5 annonces liées au problème ou produit, puis envoie captures de la créa, texte et landing.', '["5 annonces minimum", "Angles pub", "Texte publicitaire", "Landing pages"]'::jsonb, 2),
('concurrence', 'Analyse concurrence', 'Analyser 3 concurrents directs.', 'Trouve 3 boutiques concurrentes, puis envoie captures hero, prix, offre, bundle, promesse et avis.', '["3 concurrents", "Hero section", "Prix et offre", "Promesse + avis"]'::jsonb, 3),
('voix-client', 'Voix du client', 'Récupérer frustrations, objections et désirs réels.', 'Va sur Amazon, Trustpilot, forums et commentaires, puis récupère 10 frustrations, 10 objections et 10 désirs.', '["10 frustrations", "10 objections", "10 désirs", "Sources / liens"]'::jsonb, 4),
('verdict-produit', 'Verdict final produit', 'Produire une synthèse finale de validation.', 'Synthétise les missions précédentes, calcule un score global et produis un verdict GO / GO prudent / NO GO.', '["Synthèse globale", "Points forts", "Risques", "Recommandation finale"]'::jsonb, 5)
on conflict (slug) do update set
  title = excluded.title,
  objective = excluded.objective,
  instructions = excluded.instructions,
  required_evidence = excluded.required_evidence,
  order_index = excluded.order_index;

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { appRepository } from '@/lib/data/repository';
import { Project } from '@/lib/domain/types';
import { AppShell } from '@/components/layout/shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DashboardClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { setProjects(appRepository.listProjects()); }, []);
  return <AppShell><div className="mb-8 flex items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold">Dashboard projets</h1><p className="text-sm text-[var(--muted-foreground)]">Pilote la validation produit par missions.</p></div><Link href="/dashboard/projects/new"><Button>Créer un projet</Button></Link></div>{projects.length === 0 ? <Card className="p-10 text-center"><p className="font-medium">Aucun projet pour le moment.</p><p className="mt-2 text-sm text-[var(--muted-foreground)]">Crée ton premier projet pour démarrer la mission 1.</p></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <Card key={project.id} className="p-5"><div className="flex items-start justify-between"><div><h2 className="text-lg font-medium">{project.name}</h2><p className="text-sm text-[var(--muted-foreground)]">{project.niche} · {project.market}</p></div><Badge>{project.status}</Badge></div><div className="mt-6 space-y-2 text-sm"><p>Mission actuelle: <strong>{project.currentMissionOrder}/5</strong></p><p>Score global: <strong>{project.overallScore ?? '—'}</strong></p></div><Link href={`/dashboard/projects/${project.id}`} className="mt-5 inline-block"><Button variant="outline">Ouvrir</Button></Link></Card>)}</div>}</AppShell>;
}

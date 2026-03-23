'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { appRepository } from '@/lib/data/repository';
import { ProjectBundle } from '@/lib/domain/types';

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  const [bundle, setBundle] = useState<ProjectBundle | null>(null);
  useEffect(() => { setBundle(appRepository.getProjectBundle(projectId)); }, [projectId]);
  if (!bundle) return <AppShell><Card className="p-8">Projet introuvable.</Card></AppShell>;
  const activeMission = bundle.missions.find((mission) => mission.status === 'active') ?? bundle.missions[bundle.missions.length - 1];
  return <AppShell><div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><Card className="p-6"><div className="flex items-start justify-between"><div><h1 className="text-3xl font-semibold">{bundle.project.name}</h1><p className="mt-2 text-sm text-[var(--muted-foreground)]">{bundle.project.niche} · {bundle.project.market}</p></div><Badge>{bundle.project.status}</Badge></div><div className="mt-6 grid gap-4 md:grid-cols-3"><Card className="p-4">Score global<br/><strong className="text-2xl">{bundle.project.overallScore ?? '—'}</strong></Card><Card className="p-4">Mission actuelle<br/><strong className="text-2xl">{bundle.project.currentMissionOrder}/5</strong></Card><Card className="p-4">Phase<br/><strong className="text-xl">{bundle.project.currentPhase}</strong></Card></div><div className="mt-6"><Link href={`/dashboard/projects/${projectId}/mission`}><Button>Ouvrir la mission active</Button></Link></div></Card><Card className="p-6"><h2 className="text-xl font-semibold">Timeline des missions</h2><div className="mt-4 space-y-3">{bundle.missions.map((item) => <div key={item.id} className="rounded-xl border p-4"><div className="flex items-center justify-between"><div><p className="font-medium">{item.mission.orderIndex}. {item.mission.title}</p><p className="text-sm text-[var(--muted-foreground)]">{item.mission.objective}</p></div><Badge>{item.status}</Badge></div><p className="mt-3 text-sm">Score: <strong>{item.score ?? '—'}</strong></p></div>)}</div><div className="mt-6 rounded-xl bg-[var(--muted)] p-4"><p className="text-sm text-[var(--muted-foreground)]">Mission en cours</p><p className="font-medium">{activeMission.mission.title}</p><p className="mt-1 text-sm">{activeMission.mission.instructions}</p></div></Card></div></AppShell>;
}

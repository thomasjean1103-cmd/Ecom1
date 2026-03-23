'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { appRepository } from '@/lib/data/repository';
import { ProjectBundle } from '@/lib/domain/types';

export function MissionForm({ projectId }: { projectId: string }) {
  const [bundle, setBundle] = useState<ProjectBundle | null>(null);
  const [note, setNote] = useState('');
  const [links, setLinks] = useState(['']);
  const [uploads, setUploads] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => { setBundle(appRepository.getProjectBundle(projectId)); }, [projectId]);
  const activeMission = useMemo(() => bundle?.missions.find((mission) => mission.status === 'active') ?? bundle?.missions[bundle.missions.length - 1], [bundle]);
  if (!bundle || !activeMission) return <AppShell><Card className="p-8">Mission introuvable.</Card></AppShell>;

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const previews = files.map((file) => URL.createObjectURL(file));
    setUploads((current) => [...current, ...previews]);
  };

  const submit = () => {
    setLoading(true);
    const next = appRepository.submitMission({ projectId, projectMissionId: activeMission.id, note, links, uploads });
    setBundle(next);
    setLoading(false);
  };

  return <AppShell><div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"><Card className="p-6"><div className="flex items-start justify-between gap-4"><div><Badge>Mission active</Badge><h1 className="mt-3 text-3xl font-semibold">{activeMission.mission.title}</h1><p className="mt-2 text-sm text-[var(--muted-foreground)]">{activeMission.mission.objective}</p></div><Badge>{activeMission.status}</Badge></div><div className="mt-6 space-y-3"><div><h2 className="font-medium">Instructions</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">{activeMission.mission.instructions}</p></div><div><h2 className="font-medium">Preuves attendues</h2><ul className="mt-2 space-y-2 text-sm text-[var(--muted-foreground)]">{activeMission.mission.requiredEvidence.map((item) => <li key={item}>• {item}</li>)}</ul></div></div><div className="mt-6 space-y-4"><Textarea placeholder="Colle ici tes notes de terrain, hooks, objections, patterns observés..." value={note} onChange={(e) => setNote(e.target.value)} />{links.map((value, index) => <Input key={index} placeholder={`Lien preuve #${index + 1}`} value={value} onChange={(e) => setLinks((current) => current.map((item, currentIndex) => currentIndex === index ? e.target.value : item))} />)}<Button variant="outline" onClick={() => setLinks((current) => [...current, ''])}>Ajouter un lien</Button><Input type="file" accept="image/*" multiple onChange={onUpload} /><div className="flex flex-wrap gap-2">{uploads.map((upload) => <img key={upload} src={upload} alt="preuve" className="h-20 w-20 rounded-lg object-cover" />)}</div><Button onClick={submit} disabled={loading}>{loading ? 'Soumission...' : 'Soumettre la mission'}</Button></div></Card><Card className="p-6"><h2 className="text-xl font-semibold">Analyse structurée</h2>{activeMission.analysis ? <div className="mt-4 space-y-4"><div className="rounded-xl bg-[var(--muted)] p-4"><p className="text-sm text-[var(--muted-foreground)]">Décision</p><p className="text-2xl font-semibold">{activeMission.analysis.outputJson.decision}</p></div><div className="grid gap-4 md:grid-cols-2"><Card className="p-4">Score<br/><strong className="text-3xl">{activeMission.analysis.outputJson.score}</strong></Card><Card className="p-4">Next action<br/><strong>{activeMission.analysis.outputJson.nextAction}</strong></Card></div><div><h3 className="font-medium">Résumé</h3><p className="mt-2 text-sm text-[var(--muted-foreground)]">{activeMission.analysis.outputJson.summary}</p></div><div className="grid gap-4 md:grid-cols-2"><div><h3 className="font-medium">Forces</h3><ul className="mt-2 text-sm text-[var(--muted-foreground)]">{activeMission.analysis.outputJson.strengths.map((item) => <li key={item}>• {item}</li>)}</ul></div><div><h3 className="font-medium">Risques</h3><ul className="mt-2 text-sm text-[var(--muted-foreground)]">{activeMission.analysis.outputJson.risks.map((item) => <li key={item}>• {item}</li>)}</ul></div></div></div> : <div className="mt-4 rounded-xl border border-dashed p-6 text-sm text-[var(--muted-foreground)]">Soumets des preuves pour déclencher l’analyse mock.</div>}<div className="mt-6"><h3 className="font-medium">Preuves déjà stockées</h3><div className="mt-3 space-y-2">{activeMission.evidenceItems.length === 0 ? <p className="text-sm text-[var(--muted-foreground)]">Aucune preuve soumise pour cette mission.</p> : activeMission.evidenceItems.map((item) => <div key={item.id} className="rounded-xl border p-3 text-sm">{item.type === 'image' ? <a href={item.fileUrl ?? '#'} className="underline">Capture uploadée</a> : item.content}</div>)}</div></div></Card></div></AppShell>;
}

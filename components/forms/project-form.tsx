'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { appRepository } from '@/lib/data/repository';
import { ExperienceLevel } from '@/lib/domain/types';
import { AppShell } from '@/components/layout/shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const levels: ExperienceLevel[] = ['débutant', 'intermédiaire', 'avancé'];

export function ProjectForm() {
  const [form, setForm] = useState({ name: '', niche: '', market: '', budget: '', experienceLevel: 'débutant' as ExperienceLevel });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = () => {
    if (!form.name || !form.niche || !form.market || !form.budget) {
      setError('Tous les champs sont requis.');
      return;
    }
    setLoading(true);
    const bundle = appRepository.createProject(form);
    router.push(`/dashboard/projects/${bundle.project.id}`);
  };

  return <AppShell><div className="mx-auto max-w-2xl"><Card className="p-6"><h1 className="text-2xl font-semibold">Créer un projet</h1><p className="mt-2 text-sm text-[var(--muted-foreground)]">Formulaire simple pour lancer automatiquement les 5 missions.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><Input placeholder="Nom du projet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input placeholder="Niche" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} /><Input placeholder="Marché" value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })} /><Input placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /><div className="md:col-span-2"><label className="mb-2 block text-sm">Niveau</label><div className="flex gap-2">{levels.map((level) => <Button key={level} type="button" variant={form.experienceLevel === level ? 'default' : 'outline'} onClick={() => setForm({ ...form, experienceLevel: level })}>{level}</Button>)}</div></div></div>{error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}<Button className="mt-6" onClick={submit} disabled={loading}>{loading ? 'Création...' : 'Créer le projet'}</Button></Card></div></AppShell>;
}

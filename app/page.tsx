import Link from 'next/link';
import { AppShell } from '@/components/layout/shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MISSION_SEED } from '@/lib/constants/missions';

export default function HomePage() {
  return <AppShell><section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center"><div className="space-y-6"><Badge className="bg-[var(--accent)]">MVP V1 · Recherche produit guidée</Badge><h1 className="text-5xl font-semibold tracking-tight">Valide un produit e-commerce mission par mission, avec de vraies preuves terrain.</h1><p className="max-w-2xl text-lg text-[var(--muted-foreground)]">Plus qu’un chatbot: un workflow structuré pour capturer des signaux organiques, publicitaires, concurrentiels et voix du client avant un verdict final.</p><div className="flex gap-3"><Link href="/dashboard"><Button>Ouvrir le dashboard</Button></Link><Link href="/auth/signup"><Button variant="outline">Créer un compte</Button></Link></div></div><Card className="p-6"><p className="mb-4 text-sm text-[var(--muted-foreground)]">Les 5 missions seedées automatiquement</p><div className="space-y-3">{MISSION_SEED.map((mission) => <div key={mission.id} className="rounded-xl border p-4"><div className="mb-1 flex items-center justify-between"><h3 className="font-medium">{mission.title}</h3><Badge>#{mission.orderIndex}</Badge></div><p className="text-sm text-[var(--muted-foreground)]">{mission.objective}</p></div>)}</div></Card></section></AppShell>;
}

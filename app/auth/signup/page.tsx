import Link from 'next/link';
import { AppShell } from '@/components/layout/shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  return <AppShell><div className="mx-auto max-w-md"><Card className="p-6"><h1 className="text-2xl font-semibold">Créer un compte</h1><p className="mt-2 text-sm text-[var(--muted-foreground)]">Structure prête pour Supabase Auth, avec parcours local de démonstration.</p><div className="mt-6 space-y-4"><Input placeholder="Nom" /><Input placeholder="email@exemple.com" /><Input type="password" placeholder="Mot de passe" /><Link href="/dashboard"><Button className="w-full">Créer un compte démo</Button></Link></div><p className="mt-4 text-sm text-[var(--muted-foreground)]">Déjà inscrit ? <Link href="/auth/login" className="underline">Se connecter</Link></p></Card></div></AppShell>;
}

import Link from 'next/link';
import { AppShell } from '@/components/layout/shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  return <AppShell><div className="mx-auto max-w-md"><Card className="p-6"><h1 className="text-2xl font-semibold">Connexion</h1><p className="mt-2 text-sm text-[var(--muted-foreground)]">Page prête pour Supabase Auth. Pour le MVP local, va directement au dashboard.</p><div className="mt-6 space-y-4"><Input placeholder="email@exemple.com" /><Input type="password" placeholder="Mot de passe" /><Link href="/dashboard"><Button className="w-full">Connexion démo</Button></Link></div><p className="mt-4 text-sm text-[var(--muted-foreground)]">Pas encore de compte ? <Link href="/auth/signup" className="underline">Créer un compte</Link></p></Card></div></AppShell>;
}

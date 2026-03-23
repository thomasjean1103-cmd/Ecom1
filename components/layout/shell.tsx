import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_45%)]"><header className="border-b backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><Link href="/" className="font-semibold">Mission Commerce</Link><nav className="flex items-center gap-3"><Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link><Link href="/auth/login"><Button variant="outline">Connexion</Button></Link></nav></div></header><main className="mx-auto max-w-7xl px-6 py-10">{children}</main></div>;
}

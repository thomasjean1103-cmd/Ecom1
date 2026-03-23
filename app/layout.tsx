import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mission Commerce',
  description: 'SaaS e-commerce guidé par missions pour valider un produit avec des preuves terrain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body className="min-h-screen">{children}</body></html>;
}

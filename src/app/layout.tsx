import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Gestão de Horários ISCTE',
  description: 'Projeto 1 — Arquitetura e Desenho de Software',
};

// @next-codemod-ignore
export const instant = false;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="pt">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar role={user?.role ?? null} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

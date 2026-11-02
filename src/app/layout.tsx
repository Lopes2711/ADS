import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Gestão de Horários ISCTE',
  description: 'Projeto 1 — Arquitetura e Desenho de Software',
};

// @next-codemod-ignore
export const instant = false;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

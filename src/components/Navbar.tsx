'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { seedDataAction } from '@/app/actions';

export function Navbar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const navLinks = [
    { href: '/', label: 'Visão Geral', icon: '📊' },
    { href: '/horarios', label: 'Horários & Aulas', icon: '📅', badge: 'Req. 1' },
    { href: '/regras', label: 'Motor de Regras', icon: '⚖️', badge: 'Req. 1' },
    { href: '/alocacao', label: 'Alocação de Salas', icon: '🏫', badge: 'Req. 2' },
    { href: '/mudancas', label: 'Mudanças Ad-hoc & Impacto', icon: '⚡', badge: 'Req. 3' },
    { href: '/importar', label: 'Transformação de Dados', icon: '📥', badge: 'Req. 1' },
  ];

  const handleSeed = () => {
    startTransition(async () => {
      await seedDataAction();
    });
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide text-slate-300">ISCTE - IUL</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Projeto 1: Gestão de Horários & Alocação Inteligente</span>
          <span className="bg-blue-900/60 text-blue-300 font-mono text-[11px] px-2 py-0.5 rounded border border-blue-700/50">
            Semestre 2026/27
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <button
            onClick={handleSeed}
            disabled={isPending}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium transition cursor-pointer disabled:opacity-50"
            title="Recria a base de dados com o cenário de teste inicial (UCs, Salas, Turnos e Violações)"
          >
            <span>{isPending ? 'A repor...' : '🔄 Repor Dados Demo'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-sm group-hover:bg-blue-500 transition">
              IS
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white group-hover:text-blue-400 transition">
                Horários ISCTE
              </span>
              <p className="text-[11px] text-slate-400 leading-none">Sistema de Suporte à Decisão</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                        isActive
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 bg-slate-950/60 border-t border-slate-800 space-x-2 text-xs">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-800/80'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

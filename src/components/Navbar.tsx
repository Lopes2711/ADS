'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/login/actions';

const links = [
  { href: '/home', label: 'Início' },
  { href: '/horarios', label: 'Horários' },
  { href: '/regras', label: 'Regras' },
  { href: '/alocacao', label: 'Alocação' },
  { href: '/mudancas', label: 'Mudanças' },
  { href: '/importar', label: 'Importar' },
  { href: '/utilizadores', label: 'Utilizadores' },
];

export function Navbar({ role }: { role: string | null }) {
  const pathname = usePathname();
  const visibleLinks = role === null
    ? []
    : role === 'STUDENT'
      ? links.filter((link) => ['/home', '/horarios', '/utilizadores'].includes(link.href))
      : links;

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <span className="font-bold text-slate-900">ISCTE Horários</span>
          <nav className="flex items-center gap-4 text-sm">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? 'font-semibold text-blue-600' : 'text-slate-600 hover:text-slate-900'}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {role !== null && (
          <form action={logoutAction} className="flex items-center gap-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {role}
            </span>
            <button
              type="submit"
              className="text-xs font-medium text-rose-600 hover:text-rose-700 border border-rose-200 hover:bg-rose-50 rounded px-2.5 py-1 transition"
            >
              Sair
            </button>
          </form>
        )}
      </div>
    </header>
  );
}

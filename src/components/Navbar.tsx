'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-6">
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
    </header>
  );
}

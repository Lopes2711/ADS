import Link from 'next/link';
import { prisma } from '@/lib/prisma';

// @next-codemod-ignore
export const instant = false;


export default async function HomePage() {
  const [lessonsCount, coursesCount, roomsCount, rulesCount, violations] = await Promise.all([
    prisma.lesson.count(),
    prisma.course.count(),
    prisma.room.count(),
    prisma.rule.count(),
    prisma.violation.findMany({
      include: {
        lesson: {
          include: {
            shift: { include: { course: true } },
            room: true,
            professor: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Horários ISCTE</h1>
        <p className="text-slate-500 mt-1">Projeto 1 — Arquitetura e Desenho de Software</p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs uppercase font-medium text-slate-500">Aulas</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{lessonsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs uppercase font-medium text-slate-500">UCs (Cursos)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{coursesCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs uppercase font-medium text-slate-500">Salas</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{roomsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs uppercase font-medium text-slate-500">Violações</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{violations.length}</div>
        </div>
      </div>

      {/* Navegação entre Módulos */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Módulos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/horarios" className="p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition">
            <div className="font-semibold text-slate-900">📅 Horários &amp; Aulas</div>
            <div className="text-sm text-slate-500 mt-1">Grelha com todas as aulas, horários e docentes atribuídos.</div>
          </Link>
          <Link href="/regras" className="p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition">
            <div className="font-semibold text-slate-900">⚖️ Regras &amp; Violações (Req. 2)</div>
            <div className="text-sm text-slate-500 mt-1">Catálogo de regras vigentes e violações ativas detetadas.</div>
          </Link>
          <Link href="/alocacao" className="p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition">
            <div className="font-semibold text-slate-900">🏫 Alocação de Salas (Req. 4)</div>
            <div className="text-sm text-slate-500 mt-1">Conformidade de salas, capacidade vs inscritos e tipos.</div>
          </Link>
          <Link href="/mudancas" className="p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition">
            <div className="font-semibold text-slate-900">⚡ Mudanças Ad-hoc (Req. 8)</div>
            <div className="text-sm text-slate-500 mt-1">Turnos sobrelotados, desdobramentos e sobreposições.</div>
          </Link>
        </div>
      </div>

      {/* Resumo de Violações Ativas */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Violações Detetadas na Base de Dados ({violations.length})</h2>
          <Link href="/regras" className="text-xs text-blue-600 hover:underline">Ver todas &rarr;</Link>
        </div>

        {violations.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma violação detetada.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {violations.map((v) => (
              <li key={v.id} className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mr-2 ${
                    v.severity === 'ERRO' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {v.severity}
                  </span>
                  <span className="font-medium text-slate-800">
                    {v.lesson.shift.course.acronym} ({v.lesson.shift.name})
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">{v.description}</p>
                </div>
                {v.ruleCode && (
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">{v.ruleCode}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

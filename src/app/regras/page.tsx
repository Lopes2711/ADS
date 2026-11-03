import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireNonStudentUser } from '@/lib/auth';

// @next-codemod-ignore
export const instant = false;


export default async function RegrasPage() {
  await requireNonStudentUser();
  const [rules, violations] = await Promise.all([
    prisma.rule.findMany({ orderBy: { code: 'asc' } }),
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
      orderBy: { severity: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Regras &amp; Violações</h1>
          <p className="text-slate-500 text-sm mt-1">Requisito 2 — Motor de regras e validação de integridade</p>
        </div>
        <Link href="/home" className="text-sm text-blue-600 hover:underline">&larr; Voltar ao Início</Link>
      </div>

      {/* Catálogo de Regras */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Regras Configuradas ({rules.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {rule.code}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  {rule.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{rule.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Violações */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Violações Detetadas ({violations.length})</h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
          {violations.map((v) => (
            <div key={v.id} className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  v.severity === 'ERRO' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {v.severity}
                </span>
                <span className="font-semibold text-sm text-slate-900">
                  {v.lesson.shift.course.acronym} — {v.lesson.shift.name}
                </span>
                {v.rule_code && (
                  <span className="text-xs font-mono text-slate-400">[{v.rule_code}]</span>
                )}
              </div>
              <p className="text-sm text-slate-700">{v.description}</p>
              <div className="text-xs text-slate-500 flex gap-4 mt-1">
                <span>Docente: {v.lesson.professor?.name ?? 'Não atribuído'}</span>
                <span>Sala: {v.lesson.room?.name ?? 'Sem sala'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

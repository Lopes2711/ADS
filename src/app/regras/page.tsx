import { prisma } from '@/lib/prisma';
import { ensureDataSeeded } from '@/lib/ensureData';
import { RuleToggle } from '@/components/RuleToggle';
import { reevaluateScheduleAction } from '@/app/actions';

// @next-codemod-ignore
export const instant = false;

export default async function RegrasPage() {
  await ensureDataSeeded();

  const rules = await prisma.rule.findMany({
    orderBy: { code: 'asc' },
  });

  const violations = await prisma.violation.findMany({
    include: {
      lesson: {
        include: {
          shift: {
            include: { course: true },
          },
          professor: true,
          room: true,
        },
      },
    },
    orderBy: { severity: 'asc' },
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <span>Requisito 1</span>
            <span>&bull;</span>
            <span>Motor de Regras & Deteção de Violações</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Regras de Funcionamento dos Horários
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure as regras vigentes do ISCTE e acompanhe as violações detetadas pelo motor de integridade.
          </p>
        </div>

        <form action={reevaluateScheduleAction}>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>⚡</span>
            <span>Reavaliar Regras no Horário</span>
          </button>
        </form>
      </div>

      {/* Rules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Catálogo de Regras Configuradas ({rules.length})
            </h2>
            <p className="text-xs text-slate-500">
              Ative ou desative regras para observar a evolução e tolerância a mudanças futuras.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                rule.isActive
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-slate-50/60 border-slate-200/60 opacity-75'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {rule.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                      {rule.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                    <RuleToggle ruleId={rule.id} isActive={rule.isActive} />
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{rule.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>
              </div>

              {rule.parameters && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Parâmetros dinâmicos:</span>
                  <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {rule.parameters}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detected Violations Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚠️</span> Violações de Regras Encontradas ({violations.length})
            </h2>
            <p className="text-xs text-slate-500">
              Conflitos apurados nas aulas atuais que violam uma ou mais das regras ativas acima.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {violations.filter((v) => v.severity === 'ERRO').length} Erros &bull;{' '}
            {violations.filter((v) => v.severity === 'AVISO').length} Avisos
          </span>
        </div>

        {violations.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            ✨ Excelente! Não há qualquer violação das regras ativas no horário.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {violations.map((violation) => {
              const isError = violation.severity === 'ERRO';
              const lesson = violation.lesson;
              return (
                <div key={violation.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isError
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {violation.severity}
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        {lesson.shift.course.name} ({lesson.shift.course.acronym})
                      </span>
                      <span className="text-xs text-slate-500">
                        Turno: <strong className="text-slate-800">{lesson.shift.name}</strong> ({lesson.shift.enrolledStudents} inscritos)
                      </span>
                      {violation.ruleCode && (
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {violation.ruleCode}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700">
                      {violation.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Docente: {lesson.professor?.name ?? 'Não atribuído'}</span>
                      <span>&bull;</span>
                      <span>Sala atual: {lesson.room?.name ?? 'Nenhuma'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {violation.ruleCode?.includes('ROOM') || violation.ruleCode === 'MISSING_ROOM' ? (
                      <a
                        href="/alocacao"
                        className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
                      >
                        Resolver na Alocação &rarr;
                      </a>
                    ) : (
                      <a
                        href="/mudancas"
                        className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition"
                      >
                        Ajustar no Simulador &rarr;
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Explanatory Note on Rule Evolution */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-900 space-y-1">
        <span className="font-bold flex items-center gap-1.5">
          <span>💡</span> Como este modelo suporta a evolução futura das regras (Requisito 1):
        </span>
        <p className="text-blue-800/90 leading-relaxed">
          As regras estão desacopladas do esquema relacional de tabelas. A tabela <code>Rule</code> armazena códigos, descrições, estado (ativo/inativo) e parâmetros em formato JSON. O motor de integridade pode facilmente incorporar novas verificações (como restrições pedagógicas de sexta-feira ou rácios específicos) sem necessitar de alterar o esquema da base de dados.
        </p>
      </div>
    </div>
  );
}

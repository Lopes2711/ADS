import { prisma } from '@/lib/prisma';
import { ensureDataSeeded } from '@/lib/ensureData';
import Link from 'next/link';
import { reevaluateScheduleAction } from './actions';

// @next-codemod-ignore
export const instant = false;

export default async function HomePage() {
  await ensureDataSeeded();

  const [lessonsCount, unassignedRoomsCount, violations, activeRulesCount, shiftsCount, professorsCount] =
    await Promise.all([
      prisma.lesson.count(),
      prisma.lesson.count({ where: { roomId: null } }),
      prisma.violation.findMany({
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
        orderBy: { severity: 'asc' }, // ERRO first
      }),
      prisma.rule.count({ where: { isActive: true } }),
      prisma.shift.count(),
      prisma.professor.count(),
    ]);

  const assignedRoomsPercentage = lessonsCount > 0 
    ? Math.round(((lessonsCount - unassignedRoomsCount) / lessonsCount) * 100) 
    : 0;

  const errorCount = violations.filter((v) => v.severity === 'ERRO').length;
  const warningCount = violations.filter((v) => v.severity === 'AVISO').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <span>ISCTE - IUL</span>
            <span>&bull;</span>
            <span>Mestrado / Licenciatura em Informática</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Projeto 1: Gestão de Horários & Alocação Inteligente
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Painel de navegação e demonstração da arquitetura para a gestão de horários escolares.
            O sistema contempla a <strong className="text-white">modelação de regras dinâmicas</strong>, a <strong className="text-white">sugestão de salas por requisitos</strong> e a <strong className="text-white">avaliação de impacto em mudanças ad-hoc</strong>.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Aulas Agendadas</span>
            <span className="text-base">📅</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900">{lessonsCount}</span>
            <span className="text-xs text-slate-500 ml-2">em {shiftsCount} turnos</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium">
            {professorsCount} professores alocados
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Salas Alocadas</span>
            <span className="text-base">🏫</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-emerald-600">{assignedRoomsPercentage}%</span>
            <span className="text-xs text-slate-500 ml-2">cobertura</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {unassignedRoomsCount > 0 ? (
              <span className="text-amber-600 font-semibold">{unassignedRoomsCount} aulas sem sala</span>
            ) : (
              <span className="text-emerald-600">Todas as salas atribuídas</span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Violações Ativas</span>
            <span className="text-base">⚠️</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600">{errorCount}</span>
            <span className="text-xs text-rose-700 font-medium">erros</span>
            <span className="text-xl font-bold text-amber-500 ml-2">{warningCount}</span>
            <span className="text-xs text-amber-700 font-medium">avisos</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Deteção em tempo real
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Regras Ativas</span>
            <span className="text-base">⚖️</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-indigo-600">{activeRulesCount}</span>
            <span className="text-xs text-slate-500 ml-2">em vigor</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-medium">
            Modelo de evolução dinâmica
          </div>
        </div>
      </div>

      {/* Main Project Modules / Routing Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Módulos do Projeto & Estrutura de Rotas
            </h2>
            <p className="text-sm text-slate-500">
              Cada módulo responde diretamente a um dos três itens solicitados no enunciado.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Requisito 1 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                  1
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Item 1 do Enunciado
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                Dados, Regras & Violações
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transformação de dados para SQLite/Prisma, motor de regras de funcionamento evolutivas (ex: máx. 3h seguidas da mesma UC) e visualizador de violações ativas.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded">Modelagem Prisma</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Motor de Regras</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Deteção de Violações</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/regras"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Gerir Regras &rarr;
              </Link>
              <Link
                href="/horarios"
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Ver Horário
              </Link>
            </div>
          </div>

          {/* Card Requisito 2 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                  2
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Item 2 do Enunciado
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">
                Alocação & Sugestão de Salas
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sugestão e alocação automática de salas considerando capacidade vs inscritos e tipo de sala exigida (Laboratórios, Salas Normais, Auditórios).
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded">Lotação vs Inscritos</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Tipos de Sala</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Sugestões com 1 clique</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/alocacao"
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
              >
                Painel de Alocação de Salas &rarr;
              </Link>
            </div>
          </div>

          {/* Card Requisito 3 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                  3
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  Item 3 do Enunciado
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition">
                Mudanças Ad-hoc & Impacto
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Simulação e aplicação de alterações pontuais (ex: desdobramento de turmas sobrelotadas ou troca de professor) com cálculo imediato do impacto na qualidade.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded">Desdobramento de Turma</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Troca de Docente</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Avaliação Antes/Depois</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/mudancas"
                className="text-sm font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1"
              >
                Simulador de Impacto &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active Violations Highlight */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚠️</span> Violações Detetadas no Horário Atual ({violations.length})
            </h3>
            <p className="text-xs text-slate-500">
              Regras violadas calculadas pelo motor de validação face às restrições do ISCTE.
            </p>
          </div>

          <form action={reevaluateScheduleAction}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer border border-slate-300 flex items-center gap-1.5"
            >
              <span>🔍</span>
              <span>Reavaliar Regras Agora</span>
            </button>
          </form>
        </div>

        {violations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            🎉 Parabéns! Não foram encontradas violações ativas no horário atual.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {violations.map((violation) => {
              const isError = violation.severity === 'ERRO';
              return (
                <div
                  key={violation.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isError
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {violation.severity}
                      </span>
                      <span className="font-semibold text-sm text-slate-900">
                        {violation.lesson.shift.course.acronym} &bull; {violation.lesson.shift.name}
                      </span>
                      {violation.ruleCode && (
                        <span className="text-xs font-mono text-slate-400">
                          [{violation.ruleCode}]
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {violation.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {violation.ruleCode === 'MISSING_ROOM' || violation.ruleCode === 'ROOM_CAPACITY' || violation.ruleCode === 'ROOM_TYPE' ? (
                      <Link
                        href="/alocacao"
                        className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 rounded font-medium transition"
                      >
                        Resolver Sala &rarr;
                      </Link>
                    ) : (
                      <Link
                        href="/mudancas"
                        className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1 rounded font-medium transition"
                      >
                        Ajustar Horário &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schematic Overview of Project Routes */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>🗺️</span> Mapa de Rotas e Esquema do Sistema
        </h3>
        <p className="text-xs text-slate-400">
          A aplicação está organizada numa estrutura modular clara no Next.js App Router:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <span className="font-mono text-blue-400 font-semibold">/</span>
            <p className="text-slate-300 font-medium mt-1">Dashboard Executivo</p>
            <p className="text-slate-400 text-[11px]">Métricas gerais, resumo de violações e mapa do sistema.</p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <span className="font-mono text-blue-400 font-semibold">/horarios</span>
            <p className="text-slate-300 font-medium mt-1">Grelha & Horários</p>
            <p className="text-slate-400 text-[11px]">Consulta, filtros de turmas/UCs e detalhes de cada aula.</p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <span className="font-mono text-blue-400 font-semibold">/regras</span>
            <p className="text-slate-300 font-medium mt-1">Motor de Regras (Item 1)</p>
            <p className="text-slate-400 text-[11px]">Regras ativas, parâmetros dinâmicos e inspeção de violações.</p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <span className="font-mono text-blue-400 font-semibold">/alocacao</span>
            <p className="text-slate-300 font-medium mt-1">Alocação de Salas (Item 2)</p>
            <p className="text-slate-400 text-[11px]">Sugestão de salas por inscritos e tipo, com atribuição assistida.</p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <span className="font-mono text-blue-400 font-semibold">/mudancas</span>
            <p className="text-slate-300 font-medium mt-1">Mudanças Ad-hoc (Item 3)</p>
            <p className="text-slate-400 text-[11px]">Desdobramento de turmas e troca de docentes com análise de impacto.</p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <span className="font-mono text-blue-400 font-semibold">/importar</span>
            <p className="text-slate-300 font-medium mt-1">Transformação ETL (Item 1)</p>
            <p className="text-slate-400 text-[11px]">Pipeline de transformação de dados e carregamento de ficheiros.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
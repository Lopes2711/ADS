import { prisma } from '@/lib/prisma';
import { ensureDataSeeded } from '@/lib/ensureData';
import { seedDataAction } from '@/app/actions';

// @next-codemod-ignore
export const instant = false;

export default async function ImportarDadosPage() {
  await ensureDataSeeded();

  const [coursesCount, shiftsCount, professorsCount, roomsCount, lessonsCount, rulesCount] =
    await Promise.all([
      prisma.course.count(),
      prisma.shift.count(),
      prisma.professor.count(),
      prisma.room.count(),
      prisma.lesson.count(),
      prisma.rule.count(),
    ]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
          <span>Requisito 1</span>
          <span>&bull;</span>
          <span>Transformação da Informação & Motor de Base de Dados</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Transformação & Carga de Dados de Horários
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Processamento de ficheiros de horários brutos (ex: CSV/Excel do ISCTE) para o modelo de dados relacional (SQLite via Prisma), com validação de integridade.
        </p>
      </div>

      {/* Pipeline Diagram */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>🔄</span> Pipeline de Transformação e Persistência (ETL)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-bold text-blue-600 uppercase text-[10px] tracking-wider block">Fase 1</span>
            <div className="font-bold text-slate-900 text-sm">Ficheiro Bruto (CSV/Excel)</div>
            <p className="text-slate-600">
              Colunas desnormalizadas de horários (Curso, Turno, Nº Inscritos, Dia, Hora Início, Hora Fim, Sala Pretendida, Docente).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-bold text-blue-600 uppercase text-[10px] tracking-wider block">Fase 2</span>
            <div className="font-bold text-slate-900 text-sm">Parser & Normalização</div>
            <p className="text-slate-600">
              Separação de entidades: extração de UCs únicas, agregação de Turnos, mapeamento de Professores e Salas de aula.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-bold text-blue-600 uppercase text-[10px] tracking-wider block">Fase 3</span>
            <div className="font-bold text-slate-900 text-sm">Modelo Relacional (SQLite)</div>
            <p className="text-slate-600">
              Persistência estruturada com integridade referencial: <code>Course</code>, <code>Shift</code>, <code>Lesson</code>, <code>Room</code>, <code>Professor</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-bold text-blue-600 uppercase text-[10px] tracking-wider block">Fase 4</span>
            <div className="font-bold text-slate-900 text-sm">Validação de Regras</div>
            <p className="text-slate-600">
              Execução automática do motor de integridade: deteção imediata de violações (&gt;3h seguidas, colisões, lotação) e registo na tabela <code>Violation</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Current Database State */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Estado Atual do Modelo de Dados na BD (SQLite)
            </h2>
            <p className="text-xs text-slate-500">
              Registos atualmente persistidos e geríveis através da aplicação.
            </p>
          </div>

          <form action={seedDataAction}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Carregar Cenário de Dados de Demonstração</span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-2xl font-bold text-slate-900">{coursesCount}</span>
            <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">UCs (Courses)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-2xl font-bold text-slate-900">{shiftsCount}</span>
            <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">Turnos (Shifts)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-2xl font-bold text-slate-900">{professorsCount}</span>
            <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">Docentes</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-2xl font-bold text-slate-900">{roomsCount}</span>
            <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">Salas (Rooms)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-2xl font-bold text-slate-900">{lessonsCount}</span>
            <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">Aulas (Lessons)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-2xl font-bold text-blue-600">{rulesCount}</span>
            <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">Regras (Rules)</p>
          </div>
        </div>
      </div>

      {/* CSV Preview Sample */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-6 border border-slate-800 space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <span>📄</span> Exemplo de Dados de Entrada ISCTE (Formato CSV Típico)
        </h3>
        <p className="text-xs text-slate-400">
          A estrutura de ficheiro bruto transformada pelo sistema corresponde à estrutura habitual de horários da universidade:
        </p>

        <div className="overflow-x-auto text-[11px] font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 text-emerald-400">
          <pre>{`Curso;Unidade Curricular;Turno;Inscritos;Dia;Hora Início;Hora Fim;Características da Sala Pedida;Sala;Docente
Eng. Inf.;Arquitetura e Desenho de Software;ADS-T1;95;Segunda;09:00;11:00;Anfiteatro;Grande Auditório;Carlos Silva
Eng. Inf.;Arquitetura e Desenho de Software;ADS-PL1;32;Segunda;11:30;13:30;Laboratório;Lab 1.10;Carlos Silva
Eng. Inf.;Arquitetura e Desenho de Software;ADS-PL2;68;Segunda;14:00;18:00;Laboratório;;Pedro Ferreira
Eng. Inf.;Sistemas Distribuídos;SD-T1;75;Terça;10:00;12:00;Anfiteatro;Auditório Afonso de Barros;Maria Santos
Eng. Inf.;Sistemas Distribuídos;SD-PL1;35;Terça;14:00;16:30;Laboratório;Sala D1.01;Maria Santos`}</pre>
        </div>
      </div>
    </div>
  );
}

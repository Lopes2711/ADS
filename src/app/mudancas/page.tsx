import { prisma } from '@/lib/prisma';
import { ensureDataSeeded } from '@/lib/ensureData';
import { AdHocSimulator } from '@/components/AdHocSimulator';

// @next-codemod-ignore
export const instant = false;

export default async function MudancasAdHocPage() {
  await ensureDataSeeded();

  const [shifts, professors, lessons] = await Promise.all([
    prisma.shift.findMany({
      include: { course: true },
      orderBy: { name: 'asc' },
    }),
    prisma.professor.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.lesson.findMany({
      include: {
        shift: { include: { course: true } },
        professor: true,
      },
      orderBy: { startTime: 'asc' },
    }),
  ]);

  const mappedShifts = shifts.map((s) => ({
    id: s.id,
    name: s.name,
    enrolledStudents: s.enrolledStudents,
    roomTypeReq: s.roomTypeReq,
    courseAcronym: s.course.acronym,
    courseName: s.course.name,
  }));

  const mappedLessons = lessons.map((l) => ({
    id: l.id,
    date: l.date.toISOString(),
    startTime: l.startTime.toISOString(),
    endTime: l.endTime.toISOString(),
    courseAcronym: l.shift.course.acronym,
    shiftName: l.shift.name,
    enrolledStudents: l.shift.enrolledStudents,
    currentProfessorId: l.professorId,
    currentProfessorName: l.professor?.name ?? null,
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
          <span>Requisito 3</span>
          <span>&bull;</span>
          <span>Mudanças Ad-hoc & Avaliação de Impacto</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Simulador de Mudanças Ad-hoc no Horário
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Execute alterações pontuais ao horário (desdobramento de turmas ou troca de docentes de UCs) e avalie imediatamente o impacto específico gerado na qualidade e conformidade do horário.
        </p>
      </div>

      {/* Simulator Component */}
      <AdHocSimulator
        shifts={mappedShifts}
        professors={professors}
        lessons={mappedLessons}
      />

      {/* Explanatory Methodology Card */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-6 border border-slate-800 space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <span>🎯</span> Como é avaliado o impacto específico de cada mudança (Requisito 3)
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Sempre que uma alteração é simulada ou submetida, o sistema executa um cálculo diferencial:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <li className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <strong className="text-blue-400 block mb-1">1. Sobreposição de Turnos:</strong>
            Garante que o novo turno criado ou ajustado não coincide com outras aulas do mesmo plano curricular para aquele grupo de estudantes.
          </li>
          <li className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <strong className="text-blue-400 block mb-1">2. Conflito de Docente:</strong>
            Verifica na agenda global do docente se este já tem aulas de outras UCs/cursos atribuídas no mesmo intervalo horário.
          </li>
          <li className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <strong className="text-blue-400 block mb-1">3. Capacidade & Espaço:</strong>
            Ao desdobrar um turno sobrelotado, o impacto reflete-se na possibilidade de encontrar salas compatíveis onde antes era impossível.
          </li>
        </ul>
      </div>
    </div>
  );
}

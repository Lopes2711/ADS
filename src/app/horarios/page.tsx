import { prisma } from '@/lib/prisma';
import { ensureDataSeeded } from '@/lib/ensureData';
import Link from 'next/link';

// @next-codemod-ignore
export const instant = false;

export default async function HorariosPage() {
  await ensureDataSeeded();

  const lessons = await prisma.lesson.findMany({
    include: {
      shift: {
        include: {
          course: true,
        },
      },
      room: true,
      professor: true,
      violations: true,
    },
    orderBy: [
      { startTime: 'asc' },
      { shift: { course: { acronym: 'asc' } } },
    ],
  });

  const courses = await prisma.course.findMany({
    orderBy: { acronym: 'asc' },
  });

  const getDayName = (date: Date) => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[date.getDay()];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <span>Requisito 1</span>
            <span>&bull;</span>
            <span>Consulta & Atualização de Dados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Horários & Aulas Agendadas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulte a programação horária, turnos, docentes e as respetivas salas e violações de regras.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/alocacao"
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
          >
            <span>🏫</span>
            <span>Alocação de Salas</span>
          </Link>
          <Link
            href="/mudancas"
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>Mudanças Ad-hoc</span>
          </Link>
        </div>
      </div>

      {/* Courses Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-semibold text-slate-500 whitespace-nowrap">Unidades Curriculares:</span>
        <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white font-medium">Todas</span>
        {courses.map((c) => (
          <span
            key={c.id}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-medium whitespace-nowrap"
          >
            {c.acronym} &bull; {c.name}
          </span>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Dia & Horário</th>
                <th className="py-3.5 px-4">Unidade Curricular</th>
                <th className="py-3.5 px-4">Turno / Alunos</th>
                <th className="py-3.5 px-4">Docente</th>
                <th className="py-3.5 px-4">Sala Alocada</th>
                <th className="py-3.5 px-4">Estado / Violações</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.map((lesson) => {
                const day = getDayName(new Date(lesson.startTime));
                const time = `${formatTime(new Date(lesson.startTime))} - ${formatTime(new Date(lesson.endTime))}`;
                const durationMinutes = (new Date(lesson.endTime).getTime() - new Date(lesson.startTime).getTime()) / (1000 * 60);
                const hasViolations = lesson.violations.length > 0;
                const hasErrors = lesson.violations.some((v) => v.severity === 'ERRO');

                return (
                  <tr key={lesson.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{day}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{time}</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono text-slate-600">
                          {durationMinutes / 60}h
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{lesson.shift.course.acronym}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">
                        {lesson.shift.course.name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{lesson.shift.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="font-medium text-slate-700">{lesson.shift.enrolledStudents}</span>
                        <span>inscritos</span>
                        {lesson.shift.roomTypeReq && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 rounded">
                            {lesson.shift.roomTypeReq}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {lesson.professor ? (
                        <div>
                          <div className="font-medium text-slate-900">{lesson.professor.name}</div>
                          <div className="text-xs text-slate-400">{lesson.professor.email}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Docente não atribuído</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {lesson.room ? (
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{lesson.room.name}</span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Lotação: {lesson.room.capacity}</span>
                            <span>&bull;</span>
                            <span className="text-slate-600">{lesson.room.type}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-700 text-xs font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md w-fit">
                          <span>⚠️ Sem sala</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {hasViolations ? (
                        <div className="space-y-1">
                          {lesson.violations.map((v) => (
                            <div
                              key={v.id}
                              className={`text-[11px] font-medium px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                                v.severity === 'ERRO'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                              title={v.description}
                            >
                              <span>{v.severity === 'ERRO' ? '⛔' : '⚠️'}</span>
                              <span className="font-mono">{v.ruleCode || v.severity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span>✓</span> Conforme
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {!lesson.room ? (
                        <Link
                          href="/alocacao"
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition"
                        >
                          Alocar &rarr;
                        </Link>
                      ) : (
                        <Link
                          href="/mudancas"
                          className="text-xs font-medium text-slate-600 hover:text-blue-600 transition"
                        >
                          Ajustar
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

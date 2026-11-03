import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';
import { canAccessRoute, ROUTE_ROLES } from '@/lib/permissions';

// @next-codemod-ignore
export const instant = false;


export default async function HorariosPage() {
  const currentUser = await requireRoles(ROUTE_ROLES['/horarios']);
  const canSeeViolations = canAccessRoute(currentUser.role, '/regras');
  const lessons = await prisma.lesson.findMany({
    include: {
      shift: { include: { course: true } },
      room: true,
      professor: true,
      ...(canSeeViolations ? { violations: true } : {}),
    },
    orderBy: { start_time: 'asc' },
  });

  const getDayName = (d: Date) => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[d.getDay()];
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Horários &amp; Aulas</h1>
          <p className="text-slate-500 text-sm mt-1">Lista de todas as aulas agendadas ({lessons.length} aulas)</p>
        </div>
        <Link href="/home" className="text-sm text-blue-600 hover:underline">&larr; Voltar ao Início</Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Dia &amp; Hora</th>
                <th className="px-4 py-3">Unidade Curricular</th>
                <th className="px-4 py-3">Turno / Alunos</th>
                <th className="px-4 py-3">Docente</th>
                <th className="px-4 py-3">Sala</th>
                {canSeeViolations && <th className="px-4 py-3">Estado</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.map((lesson) => {
                const start_time = new Date(lesson.start_time);
                const end_time = new Date(lesson.end_time);
                const hasViolations = canSeeViolations && lesson.violations.length > 0;

                return (
                  <tr key={lesson.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{getDayName(start_time)}</div>
                      <div className="text-xs text-slate-500">{formatTime(start_time)} - {formatTime(end_time)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{lesson.shift.course.acronym}</div>
                      <div className="text-xs text-slate-500">{lesson.shift.course.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{lesson.shift.name}</div>
                      <div className="text-xs text-slate-500">
                        {lesson.shift.enrolled_students} alunos {lesson.shift.room_type_req && `• ${lesson.shift.room_type_req}`}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800">{lesson.professor?.name ?? <span className="text-slate-400 italic">Não atribuído</span>}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {lesson.room ? (
                        <div>
                          <div className="font-medium text-slate-800">{lesson.room.name}</div>
                          <div className="text-xs text-slate-500">{lesson.room.capacity} lug. ({lesson.room.type})</div>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Sem sala
                        </span>
                      )}
                    </td>
                    {canSeeViolations && <td className="px-4 py-3">
                      {hasViolations ? (
                        <div className="space-y-1">
                          {lesson.violations.map((v) => (
                            <span
                              key={v.id}
                              className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded mr-1 ${
                                v.severity === 'ERRO' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                              }`}
                              title={v.description}
                            >
                              {v.rule_code || v.severity}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Conforme
                        </span>
                      )}
                    </td>}
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

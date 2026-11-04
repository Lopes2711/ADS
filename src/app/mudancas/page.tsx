import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRoles } from '@/lib/auth';
import { ROUTE_ROLES } from '@/lib/permissions';

// @next-codemod-ignore
export const instant = false;


export default async function MudancasPage() {
  await requireRoles(ROUTE_ROLES['/mudancas']);
  const [shifts, professors, lessons] = await Promise.all([
    prisma.shift.findMany({
      include: { course: true, lessons: true },
      orderBy: { enrolled_students: 'desc' },
    }),
    prisma.professor.findMany({
      include: { lessons: { include: { shift: { include: { course: true } } } } },
      orderBy: { name: 'asc' },
    }),
    prisma.lesson.findMany({
      include: {
        shift: { include: { course: true } },
        professor: true,
      },
      orderBy: { start_time: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mudanças Ad-hoc &amp; Impacto</h1>
          <p className="text-slate-500 text-sm mt-1">Requisito 8 - Avaliação de impacto de desdobramentos de turmas e trocas de docentes</p>
        </div>
        <Link href="/home" className="text-sm text-blue-600 hover:underline">&larr; Voltar ao Início</Link>
      </div>

      {/* Turnos / Candidatos a Desdobramento */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Turnos e Lotação ({shifts.length})</h2>
        <p className="text-xs text-slate-500">
          Turnos com elevado número de inscritos (ex: &gt;40 para laboratórios) são candidatos a desdobramento em turmas menores (ex: PL2A e PL2B).
        </p>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">UC</th>
                <th className="px-4 py-3">Turno</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Inscritos</th>
                <th className="px-4 py-3">Estado / Sugestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts.map((shift) => {
                const isOvercrowded = shift.enrolled_students > 40 && shift.room_type_req === 'Laboratório';
                return (
                  <tr key={shift.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{shift.course.acronym}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{shift.name}</td>
                    <td className="px-4 py-3 text-slate-600">{shift.type || '-'} ({shift.room_type_req})</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{shift.enrolled_students} alunos</td>
                    <td className="px-4 py-3">
                      {isOvercrowded ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                          Sobrelotado - Recomendado Desdobramento
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Docentes e Cargas Horárias */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Docentes e Aulas Atribuídas ({professors.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {professors.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm">{p.name}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {p.lessons.length} aulas
                </span>
              </div>
              <p className="text-xs text-slate-500">{p.email}</p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                {p.lessons.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span>{l.shift.course.acronym} ({l.shift.name})</span>
                    <span className="text-slate-400">
                      {new Date(l.start_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

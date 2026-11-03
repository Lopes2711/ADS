import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { seedDataAction } from '@/app/actions';
import { requireRoles } from '@/lib/auth';
import { ROUTE_ROLES } from '@/lib/permissions';

// @next-codemod-ignore
export const instant = false;


export default async function ImportarPage() {
  await requireRoles(ROUTE_ROLES['/importar']);
  const [coursesCount, shiftsCount, professorsCount, roomsCount, lessonsCount, rulesCount, violationsCount] =
    await Promise.all([
      prisma.course.count(),
      prisma.shift.count(),
      prisma.professor.count(),
      prisma.room.count(),
      prisma.lesson.count(),
      prisma.rule.count(),
      prisma.violation.count(),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transformação &amp; Estado da BD</h1>
          <p className="text-slate-500 text-sm mt-1">Requisito 2 — Registos armazenados no SQLite via Prisma</p>
        </div>
        <Link href="/home" className="text-sm text-blue-600 hover:underline">&larr; Voltar ao Início</Link>
      </div>

      {/* Tabela de Contagem dos Registos */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Estado Atual dos Dados</h2>
          <form action={seedDataAction}>
            <button
              type="submit"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded transition cursor-pointer"
            >
              🔄 Recarregar Dados Demo
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="text-2xl font-bold text-slate-900">{coursesCount}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-medium">UCs (Courses)</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="text-2xl font-bold text-slate-900">{shiftsCount}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-medium">Turnos (Shifts)</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="text-2xl font-bold text-slate-900">{professorsCount}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-medium">Docentes</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="text-2xl font-bold text-slate-900">{roomsCount}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-medium">Salas (Rooms)</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="text-2xl font-bold text-slate-900">{lessonsCount}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-medium">Aulas (Lessons)</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="text-2xl font-bold text-blue-600">{rulesCount}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-medium">Regras</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="text-2xl font-bold text-rose-600">{violationsCount}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-medium">Violações</div>
          </div>
        </div>
      </div>
    </div>
  );
}

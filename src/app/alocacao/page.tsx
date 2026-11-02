import Link from 'next/link';
import { prisma } from '@/lib/prisma';


export default async function AlocacaoPage() {
  const [lessons, rooms] = await Promise.all([
    prisma.lesson.findMany({
      include: {
        shift: { include: { course: true } },
        room: true,
        professor: true,
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.room.findMany({
      orderBy: { capacity: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alocação de Salas</h1>
          <p className="text-slate-500 text-sm mt-1">Requisito 2 — Cruzamento de requisitos pedagógicos e salas disponíveis</p>
        </div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">&larr; Voltar ao Início</Link>
      </div>

      {/* Salas do Campus */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Salas Cadastradas ({rooms.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="font-semibold text-slate-900 text-sm">{room.name}</div>
              <div className="text-xs text-slate-500 mt-1">
                Lotação: <span className="font-medium text-slate-700">{room.capacity}</span> lugares
              </div>
              <div className="text-xs text-blue-600 mt-0.5">{room.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Estado da Alocação por Aula */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Aulas e Alocação de Sala ({lessons.length})</h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Aula / Turno</th>
                <th className="px-4 py-3">Inscritos</th>
                <th className="px-4 py-3">Tipo Exigido</th>
                <th className="px-4 py-3">Sala Atribuída</th>
                <th className="px-4 py-3">Lotação Sala</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.map((lesson) => {
                const enrolled = lesson.shift.enrolledStudents;
                const reqType = lesson.shift.roomTypeReq;
                const room = lesson.room;

                const isCapacityOk = room ? room.capacity >= enrolled : false;
                const isTypeOk = room && reqType ? room.type.toLowerCase() === reqType.toLowerCase() : true;

                return (
                  <tr key={lesson.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {lesson.shift.course.acronym} — {lesson.shift.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{enrolled} alunos</td>
                    <td className="px-4 py-3 text-slate-600">{reqType || 'Qualquer'}</td>
                    <td className="px-4 py-3">
                      {room ? (
                        <span className="font-medium text-slate-900">{room.name} ({room.type})</span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Sem sala
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {room ? (
                        <span className={isCapacityOk ? 'text-emerald-700' : 'text-rose-600 font-semibold'}>
                          {room.capacity} lugares
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {!room ? (
                        <span className="text-xs font-semibold text-amber-700">Pendente</span>
                      ) : !isCapacityOk ? (
                        <span className="text-xs font-semibold text-rose-600">Sobrelotada</span>
                      ) : !isTypeOk ? (
                        <span className="text-xs font-semibold text-amber-600">Tipo Inadequado</span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700">OK</span>
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

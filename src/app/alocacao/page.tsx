import { prisma } from '@/lib/prisma';
import { ensureDataSeeded } from '@/lib/ensureData';
import { RoomAssigner } from '@/components/RoomAssigner';

// @next-codemod-ignore
export const instant = false;

export default async function AlocacaoSalasPage() {
  await ensureDataSeeded();

  const [lessons, allRooms] = await Promise.all([
    prisma.lesson.findMany({
      include: {
        shift: {
          include: { course: true },
        },
        room: true,
        professor: true,
        violations: true,
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.room.findMany({
      orderBy: { capacity: 'desc' },
    }),
  ]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  const getDayName = (date: Date) => {
    const days = ['Dom', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sáb'];
    return days[date.getDay()];
  };

  // Avalia candidatos para cada aula
  const lessonsWithSuggestions = lessons.map((lesson) => {
    const enrolled = lesson.shift.enrolledStudents;
    const reqType = lesson.shift.roomTypeReq?.toLowerCase() || '';

    // Encontrar que salas estão ocupadas neste mesmo bloco temporal
    const overlappingLessons = lessons.filter(
      (other) =>
        other.id !== lesson.id &&
        other.roomId !== null &&
        lesson.startTime < other.endTime &&
        other.startTime < lesson.endTime
    );
    const occupiedRoomIds = new Set(overlappingLessons.map((l) => l.roomId));

    const candidateRooms = allRooms.map((room) => {
      const isAvailable = !occupiedRoomIds.has(room.id);
      const isCapacitySufficient = room.capacity >= enrolled;
      const isTypeMatch = !reqType || room.type.toLowerCase() === reqType;

      let score = 1;
      if (isAvailable && isCapacitySufficient && isTypeMatch) {
        score = 3; // Ideal
      } else if (isAvailable && isCapacitySufficient) {
        score = 2; // Aceitável
      }

      return {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        type: room.type,
        isAvailable,
        isCapacitySufficient,
        isTypeMatch,
        score,
      };
    });

    // Ordenar sugestões: score mais alto primeiro, depois melhor ajuste de capacidade (menos desperdício)
    candidateRooms.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.isCapacitySufficient && b.isCapacitySufficient) {
        return Math.abs(a.capacity - enrolled) - Math.abs(b.capacity - enrolled);
      }
      return b.capacity - a.capacity;
    });

    const isPendingAllocation = !lesson.room;
    const hasRoomViolation = lesson.violations.some(
      (v) => v.ruleCode === 'ROOM_CAPACITY' || v.ruleCode === 'ROOM_TYPE'
    );

    return {
      ...lesson,
      candidateRooms,
      isPendingAllocation,
      hasRoomViolation,
    };
  });

  const pendingLessons = lessonsWithSuggestions.filter((l) => l.isPendingAllocation || l.hasRoomViolation);
  const allocatedLessons = lessonsWithSuggestions.filter((l) => !l.isPendingAllocation && !l.hasRoomViolation);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
          <span>Requisito 2</span>
          <span>&bull;</span>
          <span>Alocação & Sugestão Inteligente de Salas</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Alocação de Salas às Aulas Previstas
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          O motor cruza os requisitos específicos de cada aula (número de alunos inscritos e tipo de sala exigido) com as salas disponíveis no campus do ISCTE.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold">Aulas sem Sala</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {lessonsWithSuggestions.filter((l) => l.isPendingAllocation).length}
            </div>
            <p className="text-[11px] text-slate-400">Requerem alocação prioritária</p>
          </div>
          <span className="text-2xl">⏳</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold">Salas com Inadequação</span>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">
              {lessonsWithSuggestions.filter((l) => l.hasRoomViolation).length}
            </div>
            <p className="text-[11px] text-slate-400">Lotação excedida ou tipo errado</p>
          </div>
          <span className="text-2xl">⚠️</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold">Salas Cadastradas</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {allRooms.length}
            </div>
            <p className="text-[11px] text-slate-400">Laboratórios, Anfiteatros e Normais</p>
          </div>
          <span className="text-2xl">🏢</span>
        </div>
      </div>

      {/* Section 1: Aulas com Necessidade de Ação (Sem sala ou Inadequadas) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🚨</span> Aulas a Requerer Alocação ou Correção de Sala ({pendingLessons.length})
          </h2>
          <p className="text-xs text-slate-500">
            Aulas sem sala ou cujos requisitos pedagógicos não são satisfeitos pela sala atual.
          </p>
        </div>

        {pendingLessons.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-sm text-slate-500">
            🎉 Todas as aulas têm salas adequadas alocadas!
          </div>
        ) : (
          <div className="space-y-4">
            {pendingLessons.map((lesson) => {
              const day = getDayName(new Date(lesson.startTime));
              const time = `${formatTime(new Date(lesson.startTime))} - ${formatTime(new Date(lesson.endTime))}`;

              return (
                <div
                  key={lesson.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4"
                >
                  {/* Top info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-slate-900">
                          {lesson.shift.course.name} ({lesson.shift.course.acronym})
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                          Turno {lesson.shift.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          Docente: {lesson.professor?.name ?? 'Não atribuído'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>🗓️ {day}, {time}</span>
                        <span>&bull;</span>
                        <span className="font-medium text-slate-800">
                          👥 {lesson.shift.enrolledStudents} estudantes inscritos
                        </span>
                        <span>&bull;</span>
                        <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                          Requisito: {lesson.shift.roomTypeReq || 'Qualquer'}
                        </span>
                      </div>
                    </div>

                    <div>
                      {lesson.isPendingAllocation ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Pendente de Alocação
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          Sala Inadequada ({lesson.room?.name})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Room suggestions */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Sugestões do Motor de Alocação (ordenadas por compatibilidade):
                    </h3>
                    <RoomAssigner
                      lessonId={lesson.id}
                      currentRoomId={lesson.roomId}
                      candidateRooms={lesson.candidateRooms}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Aulas com Alocação Conforme */}
      {allocatedLessons.length > 0 && (
        <div className="space-y-4 pt-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>✅</span> Aulas com Sala Adequada Alocada ({allocatedLessons.length})
            </h2>
            <p className="text-xs text-slate-500">
              Aulas onde a capacidade e o tipo de sala satisfazem integralmente os requisitos da aula.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
            {allocatedLessons.map((l) => (
              <div key={l.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{l.shift.course.acronym} &bull; {l.shift.name}</span>
                  <span className="text-slate-500">({l.shift.enrolledStudents} inscritos)</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-600">{getDayName(new Date(l.startTime))} {formatTime(new Date(l.startTime))}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                    {l.room?.name} ({l.room?.capacity} lug. / {l.room?.type})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

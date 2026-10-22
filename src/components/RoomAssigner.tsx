'use client';

import { useTransition } from 'react';
import { allocateRoomAction } from '@/app/actions';

interface CandidateRoom {
  id: string;
  name: string;
  capacity: number;
  type: string;
  isAvailable: boolean;
  isCapacitySufficient: boolean;
  isTypeMatch: boolean;
  score: number; // 3 = Ideal, 2 = Aceitável, 1 = Sub-ótima
}

interface RoomAssignerProps {
  lessonId: string;
  currentRoomId: string | null;
  candidateRooms: CandidateRoom[];
}

export function RoomAssigner({
  lessonId,
  currentRoomId,
  candidateRooms,
}: RoomAssignerProps) {
  const [isPending, startTransition] = useTransition();

  const handleSelectRoom = (roomId: string) => {
    startTransition(async () => {
      await allocateRoomAction(lessonId, roomId);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {candidateRooms.map((room) => {
          const isCurrent = room.id === currentRoomId;
          const isIdeal = room.score === 3;
          const isAcceptable = room.score === 2;

          return (
            <div
              key={room.id}
              className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition ${
                isCurrent
                  ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                  : isIdeal
                  ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400'
                  : isAcceptable
                  ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{room.name}</span>
                  {isIdeal && (
                    <span className="bg-emerald-600 text-white font-semibold text-[10px] px-1.5 py-0.2 rounded">
                      Sugestão Ideal
                    </span>
                  )}
                  {isCurrent && (
                    <span className="bg-blue-600 text-white font-semibold text-[10px] px-1.5 py-0.2 rounded">
                      Alocada
                    </span>
                  )}
                </div>
                <div className="text-slate-600 flex items-center gap-2">
                  <span>Lotação: {room.capacity} lug.</span>
                  <span>&bull;</span>
                  <span>{room.type}</span>
                </div>
                {!room.isAvailable && (
                  <p className="text-rose-600 text-[10px] font-semibold">⚠️ Ocupada no horário</p>
                )}
                {!room.isCapacitySufficient && (
                  <p className="text-rose-600 text-[10px] font-semibold">⚠️ Lotação insuficiente</p>
                )}
                {!room.isTypeMatch && room.isCapacitySufficient && (
                  <p className="text-amber-700 text-[10px]">Aviso: tipo não coincide</p>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                {isCurrent ? (
                  <button
                    onClick={() => handleSelectRoom('')}
                    disabled={isPending}
                    className="text-[11px] font-medium text-rose-600 hover:text-rose-800 transition cursor-pointer"
                  >
                    Desalocar
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectRoom(room.id)}
                    disabled={isPending || !room.isAvailable}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                      isIdeal
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : isAcceptable
                        ? 'bg-slate-800 hover:bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isPending ? 'A alocar...' : 'Alocar Sala'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

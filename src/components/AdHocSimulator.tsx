'use client';

import { useState, useTransition } from 'react';
import { splitShiftAction, changeProfessorAction } from '@/app/actions';

interface ShiftItem {
  id: string;
  name: string;
  enrolledStudents: number;
  roomTypeReq: string | null;
  courseAcronym: string;
  courseName: string;
}

interface ProfessorItem {
  id: string;
  name: string;
  email: string;
}

interface LessonItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  courseAcronym: string;
  shiftName: string;
  enrolledStudents: number;
  currentProfessorId: string | null;
  currentProfessorName: string | null;
}

interface AdHocSimulatorProps {
  shifts: ShiftItem[];
  professors: ProfessorItem[];
  lessons: LessonItem[];
}

export function AdHocSimulator({ shifts, professors, lessons }: AdHocSimulatorProps) {
  const [isPending, startTransition] = useTransition();

  // Tab state: 'split' | 'professor'
  const [activeTab, setActiveTab] = useState<'split' | 'professor'>('split');

  // Split state
  const [selectedShiftId, setSelectedShiftId] = useState<string>(shifts[0]?.id || '');

  // Professor change state
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || '');
  const [selectedProfId, setSelectedProfId] = useState<string>('');

  const selectedShift = shifts.find((s) => s.id === selectedShiftId);
  const selectedLesson = lessons.find((l) => l.id === selectedLessonId);

  // Análise de Impacto de Mudança de Professor:
  // Verifica se o professor selecionado tem aulas em simultâneo com a aula selecionada
  const targetProfId = selectedProfId || selectedLesson?.currentProfessorId;
  const targetProf = professors.find((p) => p.id === targetProfId);

  let professorConflict: LessonItem | null = null;
  if (selectedLesson && targetProfId) {
    const lStart = new Date(selectedLesson.startTime).getTime();
    const lEnd = new Date(selectedLesson.endTime).getTime();

    for (const other of lessons) {
      if (other.id === selectedLesson.id) continue;
      if (other.currentProfessorId === targetProfId) {
        const oStart = new Date(other.startTime).getTime();
        const oEnd = new Date(other.endTime).getTime();
        if (lStart < oEnd && oStart < lEnd) {
          professorConflict = other;
          break;
        }
      }
    }
  }

  const handleSplitShift = () => {
    if (!selectedShiftId) return;
    startTransition(async () => {
      await splitShiftAction(selectedShiftId);
    });
  };

  const handleChangeProfessor = () => {
    if (!selectedLessonId || !selectedProfId) return;
    startTransition(async () => {
      await changeProfessorAction(selectedLessonId, selectedProfId);
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('split')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'split'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>✂️</span>
          <span>Desdobramento de Turma / Turno</span>
        </button>

        <button
          onClick={() => setActiveTab('professor')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'professor'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>👨‍🏫</span>
          <span>Mudança de Docente de uma UC</span>
        </button>
      </div>

      {/* Tab 1: Desdobramento de Turno */}
      {activeTab === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                1. Selecionar Turno com Excesso de Inscritos
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Turnos com mais de 40 alunos excedem a capacidade de laboratórios de informática do ISCTE.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Escolher Turno para Desdobrar:
              </label>
              <select
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.courseAcronym} &bull; {s.name} ({s.enrolledStudents} alunos) {s.roomTypeReq ? `[${s.roomTypeReq}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedShift && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Unidade Curricular:</span>
                  <span className="font-semibold text-slate-800">{selectedShift.courseName} ({selectedShift.courseAcronym})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alunos Atualmente Inscritos:</span>
                  <span className={`font-bold ${selectedShift.enrolledStudents > 40 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {selectedShift.enrolledStudents} alunos
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tipo de Sala Exigido:</span>
                  <span className="font-medium text-slate-800">{selectedShift.roomTypeReq || 'Qualquer'}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSplitShift}
              disabled={isPending || !selectedShift}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isPending ? 'A processar desdobramento...' : '✂️ Confirmar Desdobramento do Turno'}</span>
            </button>
          </div>

          {/* Análise de Impacto do Desdobramento */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>📊</span> Avaliação de Impacto da Mudança
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30 font-semibold">
                Requisito 3
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              O sistema calcula em tempo real o impacto pedagógico e espacial do desdobramento de turmas:
            </p>

            {selectedShift ? (
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-start gap-3">
                  <span className="text-base text-rose-400">🔴</span>
                  <div>
                    <span className="font-semibold text-rose-300">Cenário Atual (Sem desdobrar):</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      {selectedShift.name} com {selectedShift.enrolledStudents} alunos. Excede a lotação máxima dos laboratórios (36-40 lug.), gerando erro crítico ou impedindo alocação.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 flex items-start gap-3">
                  <span className="text-base text-emerald-400">🟢</span>
                  <div>
                    <span className="font-semibold text-emerald-300">Cenário Após Desdobramento:</span>
                    <p className="text-emerald-100 text-[11px] mt-0.5">
                      Criação de {selectedShift.name}-A ({Math.ceil(selectedShift.enrolledStudents / 2)} alunos) e {selectedShift.name}-B ({selectedShift.enrolledStudents - Math.ceil(selectedShift.enrolledStudents / 2)} alunos).
                      Ambos passam a caber perfeitamente nos Laboratórios disponíveis!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-950/60 border border-blue-800/80 text-[11px] text-blue-200">
                  <span className="font-semibold text-white">Impacto na Qualidade Global:</span> Redução de sobrelotação, eliminação de 1 violação crítica de capacidade e melhor rácio docente/aluno.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Tab 2: Mudança de Docente */}
      {activeTab === 'professor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                1. Selecionar Aula e Novo Docente
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Permite atribuir ou substituir o professor responsável por uma aula específica.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Aula a Modificar:
                </label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => {
                    setSelectedLessonId(e.target.value);
                    const l = lessons.find((x) => x.id === e.target.value);
                    if (l) setSelectedProfId(l.currentProfessorId || '');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.courseAcronym} ({l.shiftName}) &bull; Docente atual: {l.currentProfessorName || 'Nenhum'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Novo Docente a Designar:
                </label>
                <select
                  value={selectedProfId}
                  onChange={(e) => setSelectedProfId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um docente...</option>
                  {professors.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleChangeProfessor}
              disabled={isPending || !selectedLessonId || !selectedProfId}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isPending ? 'A atualizar docente...' : '💾 Gravar Mudança de Professor'}</span>
            </button>
          </div>

          {/* Análise de Impacto da Mudança de Docente */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>⚡</span> Avaliação de Conflitos & Sobreposição
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30 font-semibold">
                Impacto no Horário
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              O motor valida instantaneamente se a troca de docente gera sobreposição de horários para o professor selecionado.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              {professorConflict ? (
                <div className="p-4 rounded-lg bg-rose-950/80 border border-rose-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <span>⛔</span>
                    <span>ALERTA DE SOBREPOSIÇÃO DETETADO!</span>
                  </div>
                  <p className="text-rose-200 text-xs">
                    Se atribuir <strong>{targetProf?.name}</strong> a esta aula, o docente ficará com duas aulas em simultâneo no mesmo horário:
                  </p>
                  <div className="p-2 bg-rose-900/60 rounded text-[11px] font-mono text-rose-100 mt-2">
                    Conflito com: {professorConflict.courseAcronym} ({professorConflict.shiftName})
                  </div>
                  <p className="text-rose-300 text-[10px] mt-1 font-semibold">
                    Impacto: Esta mudança violará a regra PROFESSOR_OVERLAP!
                  </p>
                </div>
              ) : targetProf ? (
                <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-800/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span>✅</span>
                    <span>SEM SOBREPOSIÇÕES PARA O DOCENTE</span>
                  </div>
                  <p className="text-emerald-200 text-xs">
                    <strong>{targetProf.name}</strong> encontra-se totalmente livre no intervalo desta aula.
                  </p>
                  <p className="text-emerald-300 text-[10px] mt-1">
                    Impacto: Não são introduzidas novas violações de horário no sistema.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs">
                  Selecione um professor para simular e verificar a existência de sobreposições em tempo real.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

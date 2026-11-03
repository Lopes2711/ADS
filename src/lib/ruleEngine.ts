import { prisma } from './prisma';

export interface EvaluationResult {
  totalLessons: number;
  totalViolations: number;
  errorsCount: number;
  warningsCount: number;
  violations: {
    lesson_id: number;
    courseAcronym: string;
    shiftName: string;
    rule_code: string;
    description: string;
    severity: 'ERRO' | 'AVISO';
  }[];
}

/**
 * Motor de Validação de Regras de Horários (Requisito 2 & 8)
 * Avalia o horário atual face às regras ativas na base de dados.
 */
export async function evaluateScheduleRules(): Promise<EvaluationResult> {
  const activeRules = await prisma.rule.findMany({
    where: { is_active: true },
  });

  const ruleMap = new Map(activeRules.map((r) => [r.code, r]));

  const lessons = await prisma.lesson.findMany({
    include: {
      shift: {
        include: {
          course: true,
        },
      },
      room: true,
      professor: true,
    },
    orderBy: {
      start_time: 'asc',
    },
  });

  // Limpa violações anteriores na BD antes de reavaliar
  await prisma.violation.deleteMany({});

  const violationsToInsert: {
    lesson_id: number;
    rule_code: string;
    description: string;
    severity: 'ERRO' | 'AVISO';
    courseAcronym: string;
    shiftName: string;
  }[] = [];

  for (let i = 0; i < lessons.length; i++) {
    const l1 = lessons[i];
    const durationMinutes = (l1.end_time.getTime() - l1.start_time.getTime()) / (1000 * 60);

    // REGRA 1: Duração máxima de 3 horas (180 min) da mesma UC
    if (ruleMap.has('MAX_3H_CONSECUTIVAS')) {
      const rule = ruleMap.get('MAX_3H_CONSECUTIVAS')!;
      let maxMinutes = 180;
      if (rule.parameters) {
        try {
          const parsed = JSON.parse(rule.parameters);
          if (parsed.maxDurationMinutes) maxMinutes = parsed.maxDurationMinutes;
        } catch {}
      }

      if (durationMinutes > maxMinutes) {
        violationsToInsert.push({
          lesson_id: l1.id,
          rule_code: 'MAX_3H_CONSECUTIVAS',
          description: `A aula tem duração de ${Math.round(durationMinutes / 60)}h (${durationMinutes}min), excedendo o limite máximo regulamentar de ${maxMinutes / 60}h consecutivas para a UC ${l1.shift.course.acronym}.`,
          severity: 'ERRO',
          courseAcronym: l1.shift.course.acronym,
          shiftName: l1.shift.name,
        });
      }
    }

    // REGRA: Sala não alocada (Requisito 4)
    if (!l1.room) {
      violationsToInsert.push({
        lesson_id: l1.id,
        rule_code: 'MISSING_ROOM',
        description: `Aula de ${l1.shift.course.acronym} (${l1.shift.name}) ainda não tem sala atribuída (${l1.shift.enrolled_students} alunos inscritos).`,
        severity: 'AVISO',
        courseAcronym: l1.shift.course.acronym,
        shiftName: l1.shift.name,
      });
    } else {
      // REGRA: Capacidade da Sala
      if (ruleMap.has('ROOM_CAPACITY')) {
        if (l1.room.capacity < l1.shift.enrolled_students) {
          violationsToInsert.push({
            lesson_id: l1.id,
            rule_code: 'ROOM_CAPACITY',
            description: `A sala ${l1.room.name} tem lotação de ${l1.room.capacity} lugares, insuficiente para os ${l1.shift.enrolled_students} alunos inscritos no turno ${l1.shift.name}.`,
            severity: 'ERRO',
            courseAcronym: l1.shift.course.acronym,
            shiftName: l1.shift.name,
          });
        }
      }

      // REGRA: Tipo de Sala
      if (ruleMap.has('ROOM_TYPE') && l1.shift.room_type_req) {
        if (l1.room.type.toLowerCase() !== l1.shift.room_type_req.toLowerCase()) {
          violationsToInsert.push({
            lesson_id: l1.id,
            rule_code: 'ROOM_TYPE',
            description: `A aula requer tipo "${l1.shift.room_type_req}", mas está alocada à sala ${l1.room.name} do tipo "${l1.room.type}".`,
            severity: 'AVISO',
            courseAcronym: l1.shift.course.acronym,
            shiftName: l1.shift.name,
          });
        }
      }
    }

    // REGRA: Sobreposição de Professor & Turno (comparações par a par)
    for (let j = i + 1; j < lessons.length; j++) {
      const l2 = lessons[j];

      // Verifica se há sobreposição temporal
      const hasTimeOverlap =
        l1.start_time < l2.end_time && l2.start_time < l1.end_time;

      if (!hasTimeOverlap) continue;

      // Sobreposição de Professor
      if (
        ruleMap.has('PROFESSOR_OVERLAP') &&
        l1.professor_id &&
        l2.professor_id &&
        l1.professor_id === l2.professor_id
      ) {
        const profName = l1.professor?.name ?? 'Docente';
        violationsToInsert.push({
          lesson_id: l1.id,
          rule_code: 'PROFESSOR_OVERLAP',
          description: `O docente ${profName} tem duas aulas em simultâneo: ${l1.shift.course.acronym} (${l1.shift.name}) e ${l2.shift.course.acronym} (${l2.shift.name}).`,
          severity: 'ERRO',
          courseAcronym: l1.shift.course.acronym,
          shiftName: l1.shift.name,
        });
      }

      // Sobreposição de Turno/Turma
      if (
        ruleMap.has('SHIFT_OVERLAP') &&
        l1.shift_id === l2.shift_id
      ) {
        violationsToInsert.push({
          lesson_id: l1.id,
          rule_code: 'SHIFT_OVERLAP',
          description: `O turno ${l1.shift.name} tem sobreposição de aulas no mesmo período de horário.`,
          severity: 'ERRO',
          courseAcronym: l1.shift.course.acronym,
          shiftName: l1.shift.name,
        });
      }

      // Sobreposição de Sala
      if (l1.room_id && l2.room_id && l1.room_id === l2.room_id) {
        violationsToInsert.push({
          lesson_id: l1.id,
          rule_code: 'ROOM_OVERLAP',
          description: `A sala ${l1.room?.name} está alocada simultaneamente a duas aulas no mesmo horário (${l1.shift.name} e ${l2.shift.name}).`,
          severity: 'ERRO',
          courseAcronym: l1.shift.course.acronym,
          shiftName: l1.shift.name,
        });
      }
    }
  }

  // Grava as violações na base de dados
  if (violationsToInsert.length > 0) {
    // Encontra o horário principal para associar as violações
    const mainSchedule = await prisma.schedule.findFirst({ where: { is_main: true } })
      ?? await prisma.schedule.findFirst();

    if (mainSchedule) {
      await prisma.violation.createMany({
        data: violationsToInsert.map((v) => ({
          lesson_id: v.lesson_id,
          schedule_id: mainSchedule.id,
          rule_code: v.rule_code,
          description: v.description,
          severity: v.severity,
        })),
      });
    }
  }

  const errors = violationsToInsert.filter((v) => v.severity === 'ERRO').length;
  const warnings = violationsToInsert.filter((v) => v.severity === 'AVISO').length;

  return {
    totalLessons: lessons.length,
    totalViolations: violationsToInsert.length,
    errorsCount: errors,
    warningsCount: warnings,
    violations: violationsToInsert,
  };
}

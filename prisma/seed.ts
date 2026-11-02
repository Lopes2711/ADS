import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clearing existing data...');
  await prisma.violation.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.professor.deleteMany({});
  await prisma.roomFeature.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.rule.deleteMany({});
  await prisma.user.deleteMany({});

  // ── Rules ──────────────────────────────────────────────────────────────────
  console.log('📋 Seeding rules...');
  await prisma.rule.createMany({
    data: [
      {
        code: 'MAX_3H_CONSECUTIVAS',
        name: 'Duração Máxima 3h Consecutivas',
        description: 'Uma aula da mesma UC não deve durar mais de 3 horas consecutivas.',
        isActive: true,
        severity: 'ERRO',
        parameters: JSON.stringify({ maxDurationMinutes: 180 }),
      },
      {
        code: 'PROFESSOR_OVERLAP',
        name: 'Sem Sobreposição de Docentes',
        description: 'Um docente não pode ter duas aulas no mesmo intervalo de tempo.',
        isActive: true,
        severity: 'ERRO',
      },
      {
        code: 'ROOM_CAPACITY',
        name: 'Lotação Suficiente da Sala',
        description: 'A sala alocada deve ter lotação ≥ número de alunos inscritos no turno.',
        isActive: true,
        severity: 'ERRO',
      },
      {
        code: 'ROOM_TYPE',
        name: 'Tipo de Sala Conforme',
        description: 'O tipo de sala deve corresponder ao tipo exigido pelo turno.',
        isActive: true,
        severity: 'AVISO',
      },
      {
        code: 'MISSING_ROOM',
        name: 'Sala Não Atribuída',
        description: 'Aula sem sala alocada — necessita de atribuição.',
        isActive: true,
        severity: 'AVISO',
      },
    ],
  });

  // ── Rooms ──────────────────────────────────────────────────────────────────
  console.log('🏫 Seeding rooms...');
  const roomAud1   = await prisma.room.create({ data: { name: 'Grande Auditório', capacity: 130, type: 'Anfiteatro' } });
  const roomAud2   = await prisma.room.create({ data: { name: 'Auditório Afonso de Barros', capacity: 80, type: 'Anfiteatro' } });
  const roomLab1   = await prisma.room.create({ data: { name: 'Lab 1.10', capacity: 36, type: 'Laboratório' } });
  const roomLab2   = await prisma.room.create({ data: { name: 'Lab 2.05', capacity: 40, type: 'Laboratório' } });
  const roomNorm1  = await prisma.room.create({ data: { name: 'Sala D1.01', capacity: 45, type: 'Normal' } });
  const roomNorm2  = await prisma.room.create({ data: { name: 'Sala C2.04', capacity: 25, type: 'Normal' } });

  // ── Professors ─────────────────────────────────────────────────────────────
  console.log('👨‍🏫 Seeding professors...');
  const profCarlos = await prisma.professor.create({ data: { name: 'Carlos Silva', email: 'carlos.silva@iscte-iul.pt' } });
  const profMaria  = await prisma.professor.create({ data: { name: 'Maria Santos', email: 'maria.santos@iscte-iul.pt' } });
  const profPedro  = await prisma.professor.create({ data: { name: 'Pedro Ferreira', email: 'pedro.ferreira@iscte-iul.pt' } });
  const profAna    = await prisma.professor.create({ data: { name: 'Ana Ribeiro', email: 'ana.ribeiro@iscte-iul.pt' } });

  // ── Courses ────────────────────────────────────────────────────────────────
  console.log('📚 Seeding courses...');
  const courseADS = await prisma.course.create({ data: { name: 'Arquitetura e Desenho de Software', acronym: 'ADS', year: 3, semester: 1 } });
  const courseSD  = await prisma.course.create({ data: { name: 'Sistemas Distribuídos', acronym: 'SD', year: 3, semester: 1 } });
  const courseBDA = await prisma.course.create({ data: { name: 'Bases de Dados Avançadas', acronym: 'BDA', year: 2, semester: 1 } });
  const courseER  = await prisma.course.create({ data: { name: 'Engenharia de Requisitos', acronym: 'ER', year: 2, semester: 1 } });

  // ── Shifts ─────────────────────────────────────────────────────────────────
  console.log('🔀 Seeding shifts...');
  // ADS
  const shiftADS_T1  = await prisma.shift.create({ data: { name: 'ADS-T1',  type: 'T',  enrolledStudents: 95, roomTypeReq: 'Anfiteatro',  courseId: courseADS.id } });
  const shiftADS_PL1 = await prisma.shift.create({ data: { name: 'ADS-PL1', type: 'PL', enrolledStudents: 32, roomTypeReq: 'Laboratório', courseId: courseADS.id } });
  // Intentionally overcrowded for Req. 8 split demo (68 students, labs max 40)
  const shiftADS_PL2 = await prisma.shift.create({ data: { name: 'ADS-PL2', type: 'PL', enrolledStudents: 68, roomTypeReq: 'Laboratório', courseId: courseADS.id } });

  // SD
  const shiftSD_T1   = await prisma.shift.create({ data: { name: 'SD-T1',   type: 'T',  enrolledStudents: 75, roomTypeReq: 'Anfiteatro',  courseId: courseSD.id } });
  const shiftSD_PL1  = await prisma.shift.create({ data: { name: 'SD-PL1',  type: 'PL', enrolledStudents: 35, roomTypeReq: 'Laboratório', courseId: courseSD.id } });

  // BDA
  const shiftBDA_T1  = await prisma.shift.create({ data: { name: 'BDA-T1',  type: 'T',  enrolledStudents: 80, roomTypeReq: 'Anfiteatro',  courseId: courseBDA.id } });
  const shiftBDA_PL1 = await prisma.shift.create({ data: { name: 'BDA-PL1', type: 'PL', enrolledStudents: 34, roomTypeReq: 'Laboratório', courseId: courseBDA.id } });

  // ER
  const shiftER_TP1  = await prisma.shift.create({ data: { name: 'ER-TP1',  type: 'TP', enrolledStudents: 42, roomTypeReq: 'Normal',      courseId: courseER.id } });

  // ── Schedule ───────────────────────────────────────────────────────────────
  console.log('📅 Seeding schedule...');
  const schedule = await prisma.schedule.create({ data: { name: 'Horário 2026/27 S1', isMain: true } });

  // ── Helpers ────────────────────────────────────────────────────────────────
  // Next Monday as anchor date
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() + daysUntilMonday);

  const day = (offset: number) => { const d = new Date(monday); d.setDate(monday.getDate() + offset); return d; };
  const dt  = (base: Date, h: number, m = 0) => new Date(new Date(base).setHours(h, m, 0, 0));

  // ── Lessons ────────────────────────────────────────────────────────────────
  // Designed to showcase every feature:
  //  ✅ Normal lesson (no violation)
  //  ⚠️  Missing room            → MISSING_ROOM violation
  //  🔴 Room too small           → ROOM_CAPACITY violation
  //  ⚠️  Wrong room type         → ROOM_TYPE violation
  //  🔴 Duration > 3h            → MAX_3H_CONSECUTIVAS violation
  //  🔴 Professor double-booked  → PROFESSOR_OVERLAP violation
  console.log('📖 Seeding lessons...');

  const mon = day(0); // Monday
  const tue = day(1); // Tuesday
  const wed = day(2); // Wednesday
  const thu = day(3); // Thursday

  // MON 09:00-11:00 — ADS Teórica — Auditório (OK ✅)
  await prisma.lesson.create({ data: { scheduleId: schedule.id, shiftId: shiftADS_T1.id, date: mon, startTime: dt(mon, 9), endTime: dt(mon, 11), roomId: roomAud1.id, professorId: profCarlos.id } });

  // MON 11:30-13:30 — ADS PL1 — Lab 1.10 (OK ✅)
  await prisma.lesson.create({ data: { scheduleId: schedule.id, shiftId: shiftADS_PL1.id, date: mon, startTime: dt(mon, 11, 30), endTime: dt(mon, 13, 30), roomId: roomLab1.id, professorId: profCarlos.id } });

  // MON 14:00-18:00 — ADS PL2 — NO ROOM, 68 students, 4h duration
  //   → MISSING_ROOM + MAX_3H_CONSECUTIVAS (Req.4 + Req.2 demos)
  await prisma.lesson.create({ data: { scheduleId: schedule.id, shiftId: shiftADS_PL2.id, date: mon, startTime: dt(mon, 14), endTime: dt(mon, 18), roomId: null, professorId: profPedro.id } });

  // TUE 10:00-12:00 — SD Teórica — Auditório Afonso (OK ✅)
  await prisma.lesson.create({ data: { scheduleId: schedule.id, shiftId: shiftSD_T1.id, date: tue, startTime: dt(tue, 10), endTime: dt(tue, 12), roomId: roomAud2.id, professorId: profMaria.id } });

  // TUE 14:00-16:30 — SD PL1 — Sala Normal instead of Lab
  //   → ROOM_TYPE violation (Req.2 demo)
  await prisma.lesson.create({ data: { scheduleId: schedule.id, shiftId: shiftSD_PL1.id, date: tue, startTime: dt(tue, 14), endTime: dt(tue, 16, 30), roomId: roomNorm1.id, professorId: profMaria.id } });

  // TUE 10:00-12:00 — BDA Teórica — Carlos Silva (same slot as SD-T1 for Maria, no conflict)
  //   But Pedro Ferreira is double-booked below → PROFESSOR_OVERLAP demo
  await prisma.lesson.create({ data: { scheduleId: schedule.id, shiftId: shiftBDA_T1.id, date: tue, startTime: dt(tue, 10), endTime: dt(tue, 12), roomId: roomAud1.id, professorId: profPedro.id } });

  // WED 09:30-11:30 — ER TP1 — Sala C2.04 (capacity 25, students 42)
  //   → ROOM_CAPACITY violation (Req.4 demo)
  await prisma.lesson.create({ data: { scheduleId: schedule.id, shiftId: shiftER_TP1.id, date: wed, startTime: dt(wed, 9, 30), endTime: dt(wed, 11, 30), roomId: roomNorm2.id, professorId: profAna.id } });

  // WED 11:30-13:30 — BDA T1 again (different week rep.) — Pedro (same as TUE BDA-T1, different day — OK)
  await prisma.lesson.create({ data: { scheduleId: schedule.id, shiftId: shiftBDA_T1.id, date: wed, startTime: dt(wed, 11, 30), endTime: dt(wed, 13, 30), roomId: roomAud1.id, professorId: profPedro.id } });

  // THU 14:00-16:00 — BDA PL1 — no room assigned (Req.4 pending allocation demo)
  await prisma.lesson.create({ data: { scheduleId: schedule.id, shiftId: shiftBDA_PL1.id, date: thu, startTime: dt(thu, 14), endTime: dt(thu, 16), roomId: null, professorId: profPedro.id } });

  // THU 14:00-16:00 — BDA PL1 duplicate slot → PROFESSOR_OVERLAP for Pedro (pedro has BDA-PL1 + next)
  // Actually let's make Pedro teach two lessons simultaneously on Thursday for the overlap demo:
  await prisma.lesson.create({ data: { scheduleId: schedule.id, shiftId: shiftADS_PL1.id, date: thu, startTime: dt(thu, 14), endTime: dt(thu, 16), roomId: roomLab2.id, professorId: profPedro.id } });

  // ── Violations ─────────────────────────────────────────────────────────────
  // Let the rule engine compute them from the lessons we just created.
  // We'll insert the obvious ones manually since the engine needs to be called separately.
  console.log('⚠️  Seeding violations...');
  const lessons = await prisma.lesson.findMany({ include: { shift: { include: { course: true } }, room: true } });

  const viols: { scheduleId: string; lessonId: string; ruleCode: string; description: string; severity: string }[] = [];

  for (const l of lessons) {
    const dur = (l.endTime.getTime() - l.startTime.getTime()) / 60000;

    if (dur > 180) {
      viols.push({ scheduleId: schedule.id, lessonId: l.id, ruleCode: 'MAX_3H_CONSECUTIVAS', description: `Aula de ${l.shift.course.acronym} (${l.shift.name}) tem ${dur / 60}h — excede 3h consecutivas.`, severity: 'ERRO' });
    }
    if (!l.roomId) {
      viols.push({ scheduleId: schedule.id, lessonId: l.id, ruleCode: 'MISSING_ROOM', description: `${l.shift.course.acronym} (${l.shift.name}) — sem sala atribuída.`, severity: 'AVISO' });
    } else if (l.room) {
      if (l.room.capacity < l.shift.enrolledStudents) {
        viols.push({ scheduleId: schedule.id, lessonId: l.id, ruleCode: 'ROOM_CAPACITY', description: `Sala ${l.room.name} (lotação ${l.room.capacity}) insuficiente para ${l.shift.enrolledStudents} inscritos (${l.shift.course.acronym} ${l.shift.name}).`, severity: 'ERRO' });
      }
      if (l.shift.roomTypeReq && l.room.type.toLowerCase() !== l.shift.roomTypeReq.toLowerCase()) {
        viols.push({ scheduleId: schedule.id, lessonId: l.id, ruleCode: 'ROOM_TYPE', description: `${l.shift.course.acronym} (${l.shift.name}) requer ${l.shift.roomTypeReq} mas está em ${l.room.type} (${l.room.name}).`, severity: 'AVISO' });
      }
    }
  }

  // Professor overlap: find same-professor same-time pairs
  for (let i = 0; i < lessons.length; i++) {
    for (let j = i + 1; j < lessons.length; j++) {
      const a = lessons[i], b = lessons[j];
      if (a.professorId && a.professorId === b.professorId && a.startTime < b.endTime && b.startTime < a.endTime) {
        viols.push({ scheduleId: schedule.id, lessonId: a.id, ruleCode: 'PROFESSOR_OVERLAP', description: `Docente com sobreposição: ${a.shift.course.acronym} ${a.shift.name} e ${b.shift.course.acronym} ${b.shift.name} no mesmo horário.`, severity: 'ERRO' });
      }
    }
  }

  if (viols.length > 0) {
    await prisma.violation.createMany({ data: viols });
  }

  console.log(`\n✅ Done! Seeded:`);
  console.log(`   ${await prisma.rule.count()} rules`);
  console.log(`   ${await prisma.room.count()} rooms`);
  console.log(`   ${await prisma.professor.count()} professors`);
  console.log(`   ${await prisma.course.count()} courses`);
  console.log(`   ${await prisma.shift.count()} shifts`);
  console.log(`   ${await prisma.lesson.count()} lessons`);
  console.log(`   ${await prisma.violation.count()} violations`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());


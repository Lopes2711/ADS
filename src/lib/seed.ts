import { prisma } from './prisma';
import { evaluateScheduleRules } from './ruleEngine';

export async function seedDatabase() {
  // Limpar tabelas por ordem para evitar conflitos de FK
  await prisma.violation.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.professor.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.rule.deleteMany({});

  // 1. Criar Regras de Negócio (Requisito 1)
  await prisma.rule.createMany({
    data: [
      {
        code: 'MAX_3H_CONSECUTIVAS',
        name: 'Duração Máxima de 3 Horas Consecutivas',
        description: 'Não devem existir blocos de aulas da mesma UC com duração superior a 3 horas no mesmo dia.',
        isActive: true,
        parameters: JSON.stringify({ maxDurationMinutes: 180 }),
      },
      {
        code: 'PROFESSOR_OVERLAP',
        name: 'Sem Sobreposição de Docentes',
        description: 'Um professor não pode lecionar duas aulas no mesmo intervalo de tempo.',
        isActive: true,
      },
      {
        code: 'SHIFT_OVERLAP',
        name: 'Sem Sobreposição de Turnos',
        description: 'Uma turma/turno não pode ter aulas coincidentes no mesmo horário.',
        isActive: true,
      },
      {
        code: 'ROOM_CAPACITY',
        name: 'Lotação Suficiente da Sala',
        description: 'A lotação da sala alocada deve ser igual ou superior ao número de alunos inscritos no turno.',
        isActive: true,
      },
      {
        code: 'ROOM_TYPE',
        name: 'Conformidade do Tipo de Sala',
        description: 'O tipo de sala (ex: Laboratório, Anfiteatro, Normal) deve coincidir com os requisitos pedagógicos do turno.',
        isActive: true,
      },
    ],
  });

  // 2. Criar Salas (Requisito 2)
  const roomLab1 = await prisma.room.create({
    data: { name: 'Lab 1.10 (Informática)', capacity: 36, type: 'Laboratório' },
  });
  const roomLab2 = await prisma.room.create({
    data: { name: 'Lab 2.05 (Multimédia)', capacity: 40, type: 'Laboratório' },
  });
  const roomNormal1 = await prisma.room.create({
    data: { name: 'Sala D1.01', capacity: 45, type: 'Normal' },
  });
  const roomNormal2 = await prisma.room.create({
    data: { name: 'Sala C2.04', capacity: 25, type: 'Normal' },
  });
  const roomAuditorium1 = await prisma.room.create({
    data: { name: 'Grande Auditório ISCTE', capacity: 130, type: 'Anfiteatro' },
  });
  const roomAuditorium2 = await prisma.room.create({
    data: { name: 'Auditório Afonso de Barros', capacity: 80, type: 'Anfiteatro' },
  });

  // 3. Criar Docentes (Requisito 3)
  const profCarlos = await prisma.professor.create({
    data: { name: 'Prof. Doutor Carlos Silva', email: 'carlos.silva@iscte-iul.pt' },
  });
  const profMaria = await prisma.professor.create({
    data: { name: 'Prof.ª Doutora Maria Santos', email: 'maria.santos@iscte-iul.pt' },
  });
  const profPedro = await prisma.professor.create({
    data: { name: 'Prof. Doutor Pedro Ferreira', email: 'pedro.ferreira@iscte-iul.pt' },
  });
  const profAna = await prisma.professor.create({
    data: { name: 'Prof.ª Doutora Ana Ribeiro', email: 'ana.ribeiro@iscte-iul.pt' },
  });

  // 4. Criar Unidades Curriculares (UCs)
  const courseADS = await prisma.course.create({
    data: {
      name: 'Arquitetura e Desenho de Software',
      acronym: 'ADS',
    },
  });
  const courseSD = await prisma.course.create({
    data: {
      name: 'Sistemas Distribuídos',
      acronym: 'SD',
    },
  });
  const courseBD = await prisma.course.create({
    data: {
      name: 'Bases de Dados Avançadas',
      acronym: 'BDA',
    },
  });
  const courseER = await prisma.course.create({
    data: {
      name: 'Engenharia de Requisitos',
      acronym: 'ER',
    },
  });

  // 5. Criar Turnos / Turmas
  // ADS
  const shiftADSTeorica = await prisma.shift.create({
    data: {
      name: 'ADS-T1',
      enrolledStudents: 95,
      roomTypeReq: 'Anfiteatro',
      courseId: courseADS.id,
    },
  });
  const shiftADSPL1 = await prisma.shift.create({
    data: {
      name: 'ADS-PL1',
      enrolledStudents: 32,
      roomTypeReq: 'Laboratório',
      courseId: courseADS.id,
    },
  });
  // Turno sobrelotado de propósito para demonstrar Requisito 3 (Desdobramento de Turma)
  const shiftADSPL2 = await prisma.shift.create({
    data: {
      name: 'ADS-PL2',
      enrolledStudents: 68, // Excede a capacidade dos laboratórios normais (36 a 40)!
      roomTypeReq: 'Laboratório',
      courseId: courseADS.id,
    },
  });

  // SD
  const shiftSDTeorica = await prisma.shift.create({
    data: {
      name: 'SD-T1',
      enrolledStudents: 75,
      roomTypeReq: 'Anfiteatro',
      courseId: courseSD.id,
    },
  });
  const shiftSDPL1 = await prisma.shift.create({
    data: {
      name: 'SD-PL1',
      enrolledStudents: 35,
      roomTypeReq: 'Laboratório',
      courseId: courseSD.id,
    },
  });

  // BDA
  const shiftBDATeorica = await prisma.shift.create({
    data: {
      name: 'BDA-T1',
      enrolledStudents: 80,
      roomTypeReq: 'Anfiteatro',
      courseId: courseBD.id,
    },
  });
  const shiftBDAPL1 = await prisma.shift.create({
    data: {
      name: 'BDA-PL1',
      enrolledStudents: 34,
      roomTypeReq: 'Laboratório',
      courseId: courseBD.id,
    },
  });

  // ER
  const shiftERTP1 = await prisma.shift.create({
    data: {
      name: 'ER-TP1',
      enrolledStudents: 42,
      roomTypeReq: 'Normal',
      courseId: courseER.id,
    },
  });

  // 6. Criar Aulas (com alguns casos de teste pré-definidos para demonstrar regras e alocação)
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  // Segunda-feira: ADS Teórica (9:00 - 11:00) -> OK
  const dSegunda = new Date(baseDate);
  dSegunda.setDate(baseDate.getDate() + (1 - baseDate.getDay() + 7) % 7);

  await prisma.lesson.create({
    data: {
      date: dSegunda,
      startTime: new Date(new Date(dSegunda).setHours(9, 0, 0, 0)),
      endTime: new Date(new Date(dSegunda).setHours(11, 0, 0, 0)),
      shiftId: shiftADSTeorica.id,
      roomId: roomAuditorium1.id,
      professorId: profCarlos.id,
    },
  });

  // Segunda-feira: ADS PL1 (11:30 - 13:30) -> OK
  await prisma.lesson.create({
    data: {
      date: dSegunda,
      startTime: new Date(new Date(dSegunda).setHours(11, 30, 0, 0)),
      endTime: new Date(new Date(dSegunda).setHours(13, 30, 0, 0)),
      shiftId: shiftADSPL1.id,
      roomId: roomLab1.id,
      professorId: profCarlos.id,
    },
  });

  // Segunda-feira: ADS PL2 (14:00 - 18:00)
  // CASO DE TESTE:
  // 1) Duração de 4 horas (viola MAX_3H_CONSECUTIVAS)
  // 2) Não tem sala atribuída (Requisito 2: Alocação pendente)
  // 3) Tem 68 inscritos (Requisito 3: Sugestão de desdobramento)
  await prisma.lesson.create({
    data: {
      date: dSegunda,
      startTime: new Date(new Date(dSegunda).setHours(14, 0, 0, 0)),
      endTime: new Date(new Date(dSegunda).setHours(18, 0, 0, 0)),
      shiftId: shiftADSPL2.id,
      roomId: null, // Sem sala
      professorId: profPedro.id,
    },
  });

  // Terça-feira: SD Teórica (10:00 - 12:00)
  const dTerca = new Date(dSegunda);
  dTerca.setDate(dSegunda.getDate() + 1);

  await prisma.lesson.create({
    data: {
      date: dTerca,
      startTime: new Date(new Date(dTerca).setHours(10, 0, 0, 0)),
      endTime: new Date(new Date(dTerca).setHours(12, 0, 0, 0)),
      shiftId: shiftSDTeorica.id,
      roomId: roomAuditorium2.id,
      professorId: profMaria.id,
    },
  });

  // Terça-feira: SD PL1 (14:00 - 16:30)
  // CASO DE TESTE: Alocada a Sala Normal em vez de Laboratório (Violação ROOM_TYPE)
  await prisma.lesson.create({
    data: {
      date: dTerca,
      startTime: new Date(new Date(dTerca).setHours(14, 0, 0, 0)),
      endTime: new Date(new Date(dTerca).setHours(16, 30, 0, 0)),
      shiftId: shiftSDPL1.id,
      roomId: roomNormal1.id, // Requer Laboratório, mas está em Sala Normal
      professorId: profMaria.id,
    },
  });

  // Quarta-feira: ER TP1 (09:30 - 11:30)
  // CASO DE TESTE: Alocada à Sala C2.04 (Capacidade: 25, mas inscritos: 42 -> Violação ROOM_CAPACITY)
  const dQuarta = new Date(dSegunda);
  dQuarta.setDate(dSegunda.getDate() + 2);

  await prisma.lesson.create({
    data: {
      date: dQuarta,
      startTime: new Date(new Date(dQuarta).setHours(9, 30, 0, 0)),
      endTime: new Date(new Date(dQuarta).setHours(11, 30, 0, 0)),
      shiftId: shiftERTP1.id,
      roomId: roomNormal2.id, // Lotação 25 vs 42 alunos
      professorId: profAna.id,
    },
  });

  // Quarta-feira: BDA T1 (11:30 - 13:30)
  await prisma.lesson.create({
    data: {
      date: dQuarta,
      startTime: new Date(new Date(dQuarta).setHours(11, 30, 0, 0)),
      endTime: new Date(new Date(dQuarta).setHours(13, 30, 0, 0)),
      shiftId: shiftBDATeorica.id,
      roomId: roomAuditorium1.id,
      professorId: profPedro.id,
    },
  });

  // Quinta-feira: BDA PL1 (14:00 - 16:00) -> Sem sala atribuída (Pendente para Requisito 2)
  const dQuinta = new Date(dSegunda);
  dQuinta.setDate(dSegunda.getDate() + 3);

  await prisma.lesson.create({
    data: {
      date: dQuinta,
      startTime: new Date(new Date(dQuinta).setHours(14, 0, 0, 0)),
      endTime: new Date(new Date(dQuinta).setHours(16, 0, 0, 0)),
      shiftId: shiftBDAPL1.id,
      roomId: null, // Sem sala
      professorId: profPedro.id,
    },
  });

  // Avalia as regras e guarda as violações na base de dados
  await evaluateScheduleRules();

  return { success: true };
}

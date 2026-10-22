'use server';

import { prisma } from '@/lib/prisma';
import { evaluateScheduleRules } from '@/lib/ruleEngine';
import { seedDatabase } from '@/lib/seed';
import { revalidatePath } from 'next/cache';

/**
 * Ação para semear a base de dados com o cenário de teste inicial
 */
export async function seedDataAction(): Promise<void> {
  await seedDatabase();
  revalidatePath('/');
  revalidatePath('/horarios');
  revalidatePath('/regras');
  revalidatePath('/alocacao');
  revalidatePath('/mudancas');
  revalidatePath('/importar');
}

/**
 * Reavaliação de todas as regras no horário atual
 */
export async function reevaluateScheduleAction(): Promise<void> {
  await evaluateScheduleRules();
  revalidatePath('/');
  revalidatePath('/horarios');
  revalidatePath('/regras');
  revalidatePath('/alocacao');
  revalidatePath('/mudancas');
  revalidatePath('/importar');
}

/**
 * Requisito 1: Ativar ou desativar uma regra de funcionamento
 */
export async function toggleRuleAction(ruleId: string, isActive: boolean): Promise<void> {
  await prisma.rule.update({
    where: { id: ruleId },
    data: { isActive },
  });
  await evaluateScheduleRules();
  revalidatePath('/regras');
  revalidatePath('/');
  revalidatePath('/horarios');
}

/**
 * Requisito 2: Alocar / Atribuir uma sala a uma aula
 */
export async function allocateRoomAction(lessonId: string, roomId: string): Promise<void> {
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { roomId: roomId ? roomId : null },
  });
  await evaluateScheduleRules();
  revalidatePath('/alocacao');
  revalidatePath('/horarios');
  revalidatePath('/');
  revalidatePath('/mudancas');
}

/**
 * Requisito 3: Desdobramento de turno / turma (ex: turma com muitos inscritos)
 */
export async function splitShiftAction(shiftId: string): Promise<void> {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { course: true, lessons: true },
  });

  if (!shift) throw new Error('Turno não encontrado');

  const halfStudents = Math.ceil(shift.enrolledStudents / 2);
  const remainingStudents = shift.enrolledStudents - halfStudents;

  // Atualiza o turno original para metade dos estudantes (ex: "PL2A")
  const originalName = shift.name;
  await prisma.shift.update({
    where: { id: shiftId },
    data: {
      name: `${originalName}-A`,
      enrolledStudents: halfStudents,
    },
  });

  // Cria o novo turno desdobrado (ex: "PL2B")
  const newShift = await prisma.shift.create({
    data: {
      name: `${originalName}-B`,
      enrolledStudents: remainingStudents,
      roomTypeReq: shift.roomTypeReq,
      courseId: shift.courseId,
    },
  });

  // Cria uma nova aula para o novo turno num bloco alternativo para não colidir
  if (shift.lessons.length > 0) {
    const originalLesson = shift.lessons[0];
    const newStart = new Date(originalLesson.startTime);
    // Agendamos para o dia seguinte
    newStart.setDate(newStart.getDate() + 1);
    const newEnd = new Date(originalLesson.endTime);
    newEnd.setDate(newEnd.getDate() + 1);

    await prisma.lesson.create({
      data: {
        date: newStart,
        startTime: newStart,
        endTime: newEnd,
        shiftId: newShift.id,
        roomId: null,
        professorId: originalLesson.professorId,
      },
    });
  }

  await evaluateScheduleRules();
  revalidatePath('/mudancas');
  revalidatePath('/horarios');
  revalidatePath('/');
  revalidatePath('/alocacao');
}

/**
 * Requisito 3: Mudança de Professor de uma Aula / UC
 */
export async function changeProfessorAction(lessonId: string, newProfessorId: string): Promise<void> {
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { professorId: newProfessorId },
  });

  await evaluateScheduleRules();
  revalidatePath('/mudancas');
  revalidatePath('/horarios');
  revalidatePath('/');
  revalidatePath('/regras');
}
'use server';

import { prisma } from '@/lib/prisma';
import { evaluateScheduleRules } from '@/lib/ruleEngine';
import { seedDatabase } from '@/lib/seed';
import { requireCurrentUser, requireRoles } from '@/lib/auth';
import { withAuditActor } from '@/lib/audit-context';
import { hashPassword } from '@/lib/password';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createUserAction(formData: FormData): Promise<void> {
  const currentUser = await requireCurrentUser();
  if (currentUser.role !== 'ADMIN') {
    throw new Error('Apenas administradores podem criar utilizadores.');
  }
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'STUDENT');

  if (!name || !email || password.length < 8) {
    throw new Error('Nome, email e uma password com pelo menos 8 caracteres são obrigatórios.');
  }

  if (!['ADMIN', 'COORDINATOR', 'PROFESSOR', 'STUDENT'].includes(role)) {
    throw new Error('Role inválida.');
  }

  await withAuditActor(currentUser.id, async () => {
    await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        role,
      },
    });
  });
  revalidatePath('/utilizadores');
}

export async function requestRoleAction(formData: FormData): Promise<void> {
  const currentUser = await requireCurrentUser();
  const requested_role = String(formData.get('role') ?? '');
  const availableRoles = ['ADMIN', 'COORDINATOR', 'PROFESSOR', 'STUDENT'];

  if (!availableRoles.includes(requested_role) || requested_role === currentUser.role) {
    throw new Error('Role solicitada inválida.');
  }

  await withAuditActor(currentUser.id, async () => {
    const pendingRequest = await prisma.roleManagement.findUnique({
      where: { user_id: currentUser.id },
    });

    if (pendingRequest) {
      await prisma.roleManagement.update({
        where: { id: pendingRequest.id },
        data: { requested_role, approved: false },
      });
    } else {
      await prisma.roleManagement.create({
        data: { user_id: currentUser.id, requested_role, approved: false },
      });
    }
  });

  console.info(`[role-request] user_id=${currentUser.id} requested_role=${requested_role}`);
  redirect('/home');
}

export async function approveRoleRequestAction(formData: FormData): Promise<void> {
  const currentUser = await requireCurrentUser();
  if (currentUser.role !== 'ADMIN') {
    throw new Error('Apenas administradores podem aprovar pedidos de role.');
  }

  const requestId = Number(formData.get('requestId'));
  if (!Number.isInteger(requestId) || requestId <= 0) {
    throw new Error('Pedido de role inválido.');
  }

  await withAuditActor(currentUser.id, async () => {
    const request = await prisma.roleManagement.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new Error('Pedido de role não encontrado.');
    }

    await prisma.$transaction([
      prisma.roleManagement.update({
        where: { id: request.id },
        data: { approved: true },
      }),
      prisma.user.update({
        where: { id: request.user_id },
        data: { role: request.requested_role },
      }),
    ]);
  });

  revalidatePath('/utilizadores');
}

/**
 * Ação para semear a base de dados com o cenário de teste inicial
 */
export async function seedDataAction(): Promise<void> {
  const user = await requireRoles(['ADMIN']);
  await withAuditActor(user.id, seedDatabase);
  revalidatePath('/home');
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
  const user = await requireRoles(['ADMIN', 'COORDINATOR']);
  await withAuditActor(user.id, evaluateScheduleRules);
  revalidatePath('/home');
  revalidatePath('/horarios');
  revalidatePath('/regras');
  revalidatePath('/alocacao');
  revalidatePath('/mudancas');
  revalidatePath('/importar');
}

/**
 * Requisito 2: Ativar ou desativar uma regra de funcionamento
 */
export async function toggleRuleAction(ruleId: number, is_active: boolean): Promise<void> {
  const user = await requireRoles(['ADMIN']);
  await withAuditActor(user.id, async () => {
    await prisma.rule.update({
      where: { id: ruleId },
      data: { is_active },
    });
    await evaluateScheduleRules();
  });
  revalidatePath('/regras');
  revalidatePath('/home');
  revalidatePath('/horarios');
}

/**
 * Requisito 4: Alocar / Atribuir uma sala a uma aula
 */
export async function allocateRoomAction(lesson_id: number, room_id: number | null): Promise<void> {
  const user = await requireRoles(['ADMIN']);
  await withAuditActor(user.id, async () => {
    await prisma.lesson.update({
      where: { id: lesson_id },
      data: { room_id },
    });
    await evaluateScheduleRules();
  });
  revalidatePath('/alocacao');
  revalidatePath('/horarios');
  revalidatePath('/home');
  revalidatePath('/mudancas');
}

/**
 * Requisito 8: Desdobramento de turno / turma (ex: turma com muitos inscritos)
 */
export async function splitShiftAction(shift_id: number): Promise<void> {
  const user = await requireRoles(['COORDINATOR']);
  await withAuditActor(user.id, async () => {
    const shift = await prisma.shift.findUnique({
      where: { id: shift_id },
      include: { course: true, lessons: true },
    });

    if (!shift) throw new Error('Turno não encontrado');

    const halfStudents = Math.ceil(shift.enrolled_students / 2);
    const remainingStudents = shift.enrolled_students - halfStudents;

  // Atualiza o turno original para metade dos estudantes (ex: "PL2A")
    const originalName = shift.name;
    await prisma.shift.update({
      where: { id: shift_id },
      data: {
        name: `${originalName}-A`,
        enrolled_students: halfStudents,
      },
    });

  // Cria o novo turno desdobrado (ex: "PL2B")
    const newShift = await prisma.shift.create({
      data: {
        name: `${originalName}-B`,
        enrolled_students: remainingStudents,
        room_type_req: shift.room_type_req,
        course_id: shift.course_id,
      },
    });

  // Cria uma nova aula para o novo turno num bloco alternativo para não colidir
    if (shift.lessons.length > 0) {
      const originalLesson = shift.lessons[0];
      const newStart = new Date(originalLesson.start_time);
      // Agendamos para o dia seguinte
      newStart.setDate(newStart.getDate() + 1);
      const newEnd = new Date(originalLesson.end_time);
      newEnd.setDate(newEnd.getDate() + 1);

      await prisma.lesson.create({
        data: {
          date: newStart,
          start_time: newStart,
          end_time: newEnd,
          schedule_id: originalLesson.schedule_id,
          shift_id: newShift.id,
          room_id: null,
          professor_id: originalLesson.professor_id,
        },
      });
    }

    await evaluateScheduleRules();
  });
  revalidatePath('/mudancas');
  revalidatePath('/horarios');
  revalidatePath('/home');
  revalidatePath('/alocacao');
}

/**
 * Requisito 8: Mudança de Professor de uma Aula / UC
 */
export async function changeProfessorAction(lesson_id: number, newProfessorId: number): Promise<void> {
  const user = await requireRoles(['COORDINATOR']);
  await withAuditActor(user.id, async () => {
    await prisma.lesson.update({
      where: { id: lesson_id },
      data: { professor_id: newProfessorId },
    });

    await evaluateScheduleRules();
  });
  revalidatePath('/mudancas');
  revalidatePath('/horarios');
  revalidatePath('/home');
  revalidatePath('/regras');
}

'use server';

import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { authenticateUser, createSession, destroySession, requireCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const user = await authenticateUser(email, password);

  if (!user) redirect('/login?error=1');

  await createSession(user.id);
  redirect('/home');
}

export async function logoutAction(): Promise<void> {
  await requireCurrentUser();
  await destroySession();
  redirect('/login');
}

export async function registerAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || password.length < 8) {
    redirect('/registar?error=invalid');
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        role: 'STUDENT',
      },
    });

    await createSession(user.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      redirect('/registar?error=email');
    }
    throw error;
  }

  redirect('/home');
}

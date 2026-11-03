import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { prisma } from './prisma';
import { verifyPassword } from './password';
import { redirect } from 'next/navigation';
import { type Role } from './permissions';

const SESSION_COOKIE = 'ads_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

export async function createSession(user_id: number): Promise<void> {
  const id = randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({ data: { id, user_id, expires_at } });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expires_at,
    path: '/',
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) await prisma.session.deleteMany({ where: { id: sessionId } });
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expires_at <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return session.user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.password))) return null;
  return user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('É necessário iniciar sessão.');
  return user;
}

export async function requireNonStudentUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'STUDENT') redirect('/home');
  return user;
}

export async function requireRoles(allowedRoles: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!allowedRoles.includes(user.role as Role)) redirect('/home');
  return user;
}

import { approveRoleRequestAction, createUserAction } from '@/app/actions';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { RoleRequestForm } from './RoleRequestForm';

// @next-codemod-ignore
export const instant = false;

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedido de role</h1>
          <p className="text-slate-500 mt-1">
            A gestão de utilizadores está disponível apenas para administradores.
          </p>
        </div>
        <RoleRequestForm currentRole={currentUser.role} />
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sessions: { select: { id: true } },
      role_management: { select: { id: true, requested_role: true, approved: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Utilizadores</h1>
        <p className="text-slate-500 mt-1">Cria contas para acesso à aplicação.</p>
      </div>

      <form action={createUserAction} className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 max-w-xl">
        <h2 className="font-semibold text-slate-900">Criar login</h2>
        <input name="name" required placeholder="Nome" className="w-full border rounded px-3 py-2" />
        <input name="email" required type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input name="password" required minLength={8} type="password" placeholder="Password (mínimo 8 caracteres)" className="w-full border rounded px-3 py-2" />
        <select name="role" defaultValue="STUDENT" className="w-full border rounded px-3 py-2">
          <option value="STUDENT">Student</option>
          <option value="PROFESSOR">Professor</option>
          <option value="COORDINATOR">Coordinator</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
          Criar login
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <span>Nome</span><span>Email</span><span>Role</span><span>Sessões</span>
        </div>
        {users.map((user) => (
          <div key={user.id} className="grid grid-cols-4 gap-4 px-4 py-3 border-t text-sm">
            <span>{user.name}</span><span>{user.email}</span><span>{user.role}</span><span>{user.sessions.length}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          Pedidos de alteração de role
        </div>
        {users.filter((user) => user.role_management && !user.role_management.approved).length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-500">Não existem pedidos pendentes.</p>
        ) : (
          users
            .filter((user) => user.role_management && !user.role_management.approved)
            .map((user) => (
              <div key={user.role_management!.id} className="flex items-center justify-between gap-4 px-4 py-3 border-t text-sm">
                <span>{user.name} — solicitar: <strong>{user.role_management!.requested_role}</strong></span>
                <form action={approveRoleRequestAction}>
                  <input type="hidden" name="requestId" value={user.role_management!.id} />
                  <button type="submit" className="bg-emerald-600 text-white rounded px-3 py-1.5 hover:bg-emerald-700">
                    Aprovar
                  </button>
                </form>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

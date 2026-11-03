import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { loginAction } from './actions';

// @next-codemod-ignore
export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect('/home');
  const { error } = await searchParams;

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Iniciar sessão</h1>
      <p className="text-sm text-slate-500 mt-1">Aceda à gestão de horários.</p>
      {error ? <p className="mt-4 text-sm text-rose-600">Email ou palavra-passe inválidos.</p> : null}
      <form action={loginAction} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded border border-slate-300 p-2" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Palavra-passe
          <input name="password" type="password" required className="mt-1 w-full rounded border border-slate-300 p-2" />
        </label>
        <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
          Entrar
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Ainda não tem conta?{' '}
        <a href="/registar" className="font-semibold text-blue-600 hover:underline">
          Criar conta
        </a>
      </p>
    </div>
  );
}

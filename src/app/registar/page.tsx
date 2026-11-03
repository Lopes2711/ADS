import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { registerAction } from '@/app/login/actions';

// @next-codemod-ignore
export const instant = false;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect('/home');
  const { error } = await searchParams;

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Criar conta</h1>
      <p className="text-sm text-slate-500 mt-1">Crie uma conta de estudante para aceder à aplicação.</p>
      {error === 'email' ? (
        <p className="mt-4 text-sm text-rose-600">Já existe uma conta com este email.</p>
      ) : error === 'invalid' ? (
        <p className="mt-4 text-sm text-rose-600">Preencha todos os campos e use uma password com pelo menos 8 caracteres.</p>
      ) : null}
      <form action={registerAction} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Nome
          <input name="name" required className="mt-1 w-full rounded border border-slate-300 p-2" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded border border-slate-300 p-2" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Palavra-passe
          <input name="password" type="password" minLength={8} required className="mt-1 w-full rounded border border-slate-300 p-2" />
        </label>
        <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
          Criar conta
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Já tem conta?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

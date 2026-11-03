'use client';

import { requestRoleAction } from '@/app/actions';
import { FormEvent } from 'react';

const roles = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'COORDINATOR', label: 'Coordenador' },
  { value: 'PROFESSOR', label: 'Professor' },
  { value: 'STUDENT', label: 'Estudante' },
];

export function RoleRequestForm({ currentRole }: { currentRole: string }) {
  function confirmRequest(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm('O seu pedido será processado.')) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={requestRoleAction}
      onSubmit={confirmRequest}
      className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 max-w-xl"
    >
      <h2 className="font-semibold text-slate-900">Solicitar role</h2>
      <p className="text-sm text-slate-600">Role atual: {currentRole}</p>
      <label className="block text-sm font-medium text-slate-700">
        Solicitar role de:
        <select name="role" required defaultValue="" className="mt-1 w-full border rounded px-3 py-2">
          <option value="" disabled>Selecionar role</option>
          {roles
            .filter((role) => role.value !== currentRole)
            .map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
        </select>
      </label>
      <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
        Solicitar role
      </button>
    </form>
  );
}


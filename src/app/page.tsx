import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { createUser } from './actions';

async function UserList() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg">Users in Database ({users.length})</h2>
      {users.length === 0 ? (
        <p className="text-gray-500">No users found yet. Add one above!</p>
      ) : (
        <ul className="divide-y border rounded-lg">
          {users.map((user) => (
            <li key={user.id} className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{user.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span className="text-xs text-gray-400">ID: {user.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="max-w-xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">User Directory</h1>

      <form action={createUser} className="flex flex-col gap-3 border p-4 rounded-lg shadow-sm">
        <h2 className="font-semibold text-lg">Add New User</h2>
        <input type="text" name="name" placeholder="Name" className="border p-2 rounded text-black" />
        <input type="email" name="email" placeholder="Email" required className="border p-2 rounded text-black" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-medium">
          Create User
        </button>
      </form>

      <Suspense fallback={<p className="text-gray-500">Loading user list...</p>}>
        <UserList />
      </Suspense>
    </main>
  );
}
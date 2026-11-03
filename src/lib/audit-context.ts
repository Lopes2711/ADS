import { AsyncLocalStorage } from 'node:async_hooks';

const storage = new AsyncLocalStorage<number | null>();

export function getAuditActorId(): number | null {
  return storage.getStore() ?? null;
}

export function withAuditActor<T>(actorId: number | null, operation: () => Promise<T>): Promise<T> {
  return storage.run(actorId, operation);
}

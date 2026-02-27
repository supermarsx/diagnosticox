import { AsyncLocalStorage } from 'async_hooks';

export interface DbRequestContext {
  organizationId?: string;
  role?: string;
  userId?: string;
}

const storage = new AsyncLocalStorage<DbRequestContext>();

export function runWithRequestContext<T>(ctx: DbRequestContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function getRequestContext(): DbRequestContext | undefined {
  return storage.getStore();
}

export function updateRequestContext(ctx: DbRequestContext): void {
  const current = storage.getStore() || {};
  storage.enterWith({ ...current, ...ctx });
}

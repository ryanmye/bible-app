import { OpSqliteClient } from './opSqliteClient';
import type { DbClient } from './DbClient';
import { runMigrations } from './migrate';

export * from './DbClient';
export * from './schema';
export * from './migrate';
export * from './opSqliteClient';

const DB_FILE_NAME = 'bibleapp.sqlite';

let singleton: DbClient | null = null;
let initPromise: Promise<DbClient> | null = null;

/**
 * Lazily opens the primary app database and runs any pending migrations.
 */
export async function getDb(): Promise<DbClient> {
  if (singleton) return singleton;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const client = new OpSqliteClient({ name: DB_FILE_NAME });
    await runMigrations(client);
    singleton = client;
    return client;
  })();
  return initPromise;
}

export function _resetDbForTests(client: DbClient | null): void {
  singleton = client;
  initPromise = null;
}

export const DB_NAME = DB_FILE_NAME;

export * from './types';
export * from './schema';
export * from './migrations';
export * from './opSqliteClient';

import { openDatabase } from './opSqliteClient';
import { runMigrations } from './migrations';
import type { DbClient } from './types';

const DB_NAME = 'bible-app.sqlite';

let instance: DbClient | null = null;
let pending: Promise<DbClient> | null = null;

export async function getDatabase(): Promise<DbClient> {
  if (instance) return instance;
  if (pending) return pending;
  pending = (async () => {
    const db = openDatabase({ name: DB_NAME });
    await runMigrations(db);
    instance = db;
    pending = null;
    return db;
  })();
  return pending;
}

export async function resetDatabaseForTests(): Promise<void> {
  if (instance) {
    await instance.close();
    instance = null;
  }
  pending = null;
}

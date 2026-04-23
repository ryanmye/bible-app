import { MIGRATIONS } from './schema';
import type { DbClient } from './types';

const META_TABLE_SQL = `CREATE TABLE IF NOT EXISTS _meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);`;

async function readUserVersion(db: DbClient): Promise<number> {
  const rows = await db.execute<{ user_version: number }>('PRAGMA user_version;');
  return Number(rows[0]?.user_version ?? 0);
}

async function writeUserVersion(db: DbClient, version: number): Promise<void> {
  // PRAGMA doesn't accept bindings on all drivers, so inline (integer is safe).
  await db.execute(`PRAGMA user_version = ${Math.floor(version)};`);
}

export async function runMigrations(db: DbClient): Promise<number> {
  await db.execute(META_TABLE_SQL);
  const current = await readUserVersion(db);
  const target = MIGRATIONS.length;
  if (current >= target) {
    return current;
  }

  for (let i = current; i < target; i++) {
    const migration = MIGRATIONS[i];
    await db.transaction(async (tx) => {
      for (const stmt of migration) {
        await tx.execute(stmt);
      }
    });
  }

  await writeUserVersion(db, target);
  return target;
}

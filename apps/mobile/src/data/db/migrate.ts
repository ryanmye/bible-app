import type { DbClient, SqlParam } from './DbClient';
import { MIGRATIONS } from './schema';

interface MigrationRow {
  id: number;
}

/**
 * Runs any pending migrations. Idempotent.
 */
export async function runMigrations(db: DbClient): Promise<number> {
  await db.execute(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at INTEGER NOT NULL
    )`,
  );

  const applied = await db.execute<MigrationRow>(
    'SELECT id FROM schema_migrations ORDER BY id ASC',
  );
  const appliedIds = new Set(applied.map((row) => row.id));

  let ran = 0;
  for (const migration of MIGRATIONS) {
    if (appliedIds.has(migration.id)) continue;
    const stmts: Array<{ sql: string; params?: SqlParam[] }> =
      migration.statements.map((sql) => ({ sql }));
    stmts.push({
      sql: 'INSERT INTO schema_migrations(id, name, applied_at) VALUES(?, ?, ?)',
      params: [migration.id, migration.name, Date.now()],
    });
    await db.executeBatch(stmts);
    ran += 1;
  }
  return ran;
}

/* istanbul ignore file */
/**
 * Testing helper: wraps better-sqlite3 (a pure-JS-compatible sqlite binding) to
 * match our DbClient interface. Lets repositories be exercised under Jest
 * without needing op-sqlite's native module loaded.
 */
import type { DbClient, SqlParam, SqlRow } from './types';

type BetterSqliteCtor = new (filename: string, options?: { memory?: boolean }) => BetterSqliteDb;

interface BetterSqliteDb {
  prepare(sql: string): BetterSqliteStatement;
  exec(sql: string): void;
  transaction<T extends (...args: unknown[]) => unknown>(fn: T): T;
  pragma(src: string): unknown;
  close(): void;
}

interface BetterSqliteStatement {
  run(...params: unknown[]): unknown;
  all<Row>(...params: unknown[]): Row[];
}

export function createInMemoryDb(): DbClient {
  const Database = require('better-sqlite3') as BetterSqliteCtor;
  const db = new Database(':memory:');

  const isRead = (sql: string): boolean => {
    const trimmed = sql.trim();
    if (/^SELECT\s/i.test(trimmed)) return true;
    if (/^PRAGMA\s/i.test(trimmed) && !/=/.test(trimmed)) return true;
    return false;
  };

  const client: DbClient = {
    async execute<Row extends SqlRow = SqlRow>(
      sql: string,
      params: SqlParam[] = [],
    ): Promise<Row[]> {
      if (isRead(sql)) {
        const stmt = db.prepare(sql);
        return stmt.all<Row>(...(params as unknown[]));
      }
      if (/^PRAGMA\s.*=/i.test(sql.trim())) {
        db.exec(sql);
        return [] as Row[];
      }
      const stmt = db.prepare(sql);
      stmt.run(...(params as unknown[]));
      return [] as Row[];
    },
    async executeBatch(statements: string[]): Promise<void> {
      for (const s of statements) db.exec(s);
    },
    async transaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T> {
      return fn(client);
    },
    async close(): Promise<void> {
      db.close();
    },
  };
  return client;
}

import type { DbClient, SqlParam } from '../../src/data/db/DbClient';

export interface ExecuteCall {
  sql: string;
  params: SqlParam[];
}

/**
 * A spy DbClient. Tests can queue responses for specific SELECT statements
 * and inspect the recorded calls to make assertions about what repositories
 * actually execute. It does not interpret SQL.
 */
export class FakeDb implements DbClient {
  readonly calls: ExecuteCall[] = [];
  private responses: Array<{ match: (sql: string) => boolean; rows: unknown[] }> = [];

  mockSelect(matcher: RegExp | string, rows: unknown[]): void {
    const match =
      typeof matcher === 'string'
        ? (sql: string) => sql.includes(matcher)
        : (sql: string) => matcher.test(sql);
    this.responses.push({ match, rows });
  }

  async execute<T = unknown>(sql: string, params: SqlParam[] = []): Promise<T[]> {
    this.calls.push({ sql, params });
    for (const r of this.responses) {
      if (r.match(sql)) return r.rows as T[];
    }
    return [];
  }

  async executeBatch(
    statements: Array<{ sql: string; params?: SqlParam[] }>,
  ): Promise<void> {
    for (const stmt of statements) {
      await this.execute(stmt.sql, stmt.params ?? []);
    }
  }

  async close(): Promise<void> {}

  reset(): void {
    this.calls.length = 0;
    this.responses = [];
  }
}

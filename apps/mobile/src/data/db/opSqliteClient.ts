import { open, type DB } from '@op-engineering/op-sqlite';
import type { DbClient, SqlParam } from './DbClient';

export interface OpSqliteOptions {
  name: string;
  location?: string;
}

/**
 * op-sqlite backed implementation used by the RN app on device.
 */
export class OpSqliteClient implements DbClient {
  private db: DB;

  constructor(opts: OpSqliteOptions) {
    this.db = open({ name: opts.name, location: opts.location });
  }

  async execute<T = unknown>(sql: string, params: SqlParam[] = []): Promise<T[]> {
    const result = await this.db.execute(sql, params as never);
    const rows = (result.rows ?? []) as unknown as T[];
    return rows;
  }

  async executeBatch(
    statements: Array<{ sql: string; params?: SqlParam[] }>,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      for (const stmt of statements) {
        await tx.execute(stmt.sql, (stmt.params ?? []) as never);
      }
    });
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}

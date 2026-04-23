import { open, type DB } from '@op-engineering/op-sqlite';
import type { DbClient, SqlParam, SqlRow } from './types';

export type OpenOptions = {
  name: string;
  location?: string;
};

function wrap(db: DB): DbClient {
  const client: DbClient = {
    async execute<Row extends SqlRow = SqlRow>(sql: string, params: SqlParam[] = []): Promise<Row[]> {
      const result = await db.execute(sql, params as unknown[] as (string | number | null | boolean)[]);
      return (result.rows ?? []) as Row[];
    },
    async executeBatch(statements: string[]): Promise<void> {
      await db.executeBatch(statements.map((sql) => [sql] as [string]));
    },
    async transaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T> {
      let out!: T;
      await db.transaction(async () => {
        out = await fn(client);
      });
      return out;
    },
    async close(): Promise<void> {
      db.close();
    },
  };
  return client;
}

export function openDatabase(options: OpenOptions): DbClient {
  const db = open({ name: options.name, location: options.location });
  return wrap(db);
}

export type SqlParam = string | number | null | boolean;

export type SqlRow = Record<string, SqlParam | undefined>;

export interface DbClient {
  execute<Row extends SqlRow = SqlRow>(sql: string, params?: SqlParam[]): Promise<Row[]>;
  executeBatch(statements: string[]): Promise<void>;
  transaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

/**
 * Minimal database client interface used by all repositories.
 *
 * Implementations live in separate files so tests can run against better-sqlite3
 * in node, while the RN app binds to op-sqlite.
 */
export type SqlParam = string | number | null | boolean | Uint8Array;

export interface DbClient {
  execute<T = unknown>(sql: string, params?: SqlParam[]): Promise<T[]>;
  executeBatch(statements: Array<{ sql: string; params?: SqlParam[] }>): Promise<void>;
  close(): Promise<void>;
}

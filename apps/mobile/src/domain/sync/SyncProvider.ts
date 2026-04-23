/**
 * Pluggable sync provider contract.
 *
 * The app is local-first: all reads and writes go through SQLite repositories
 * with a `dirty` flag and optional `remoteId`. A SyncProvider is responsible
 * for pushing dirty rows up and pulling remote changes down.
 *
 * The default implementation is `NoopSyncProvider` which lets everything work
 * offline. Concrete implementations (Supabase, Firebase, self-hosted) can be
 * dropped in without touching the repositories.
 */
export interface SyncProvider {
  readonly id: string;
  readonly displayName: string;

  isAuthenticated(): Promise<boolean>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;

  pushDirty(): Promise<SyncPushResult>;
  pullRemote(sinceEpochMs: number): Promise<SyncPullResult>;
}

export interface SyncPushResult {
  pushed: number;
  failed: number;
}

export interface SyncPullResult {
  pulled: number;
  latestServerTimestampMs: number;
}

export interface SyncStatus {
  providerId: string;
  authenticated: boolean;
  lastPushAt: number | null;
  lastPullAt: number | null;
  lastError: string | null;
}

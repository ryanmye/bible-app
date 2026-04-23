import type {
  SyncProvider,
  SyncPullResult,
  SyncPushResult,
} from '../../domain/sync/SyncProvider';

/**
 * Default sync provider used when the user has not configured a cloud sync
 * backend. All operations are no-ops so the app is fully usable offline.
 */
export class NoopSyncProvider implements SyncProvider {
  readonly id = 'noop';
  readonly displayName = 'No sync (local only)';

  async isAuthenticated(): Promise<boolean> {
    return false;
  }
  async signIn(): Promise<void> {}
  async signOut(): Promise<void> {}
  async pushDirty(): Promise<SyncPushResult> {
    return { pushed: 0, failed: 0 };
  }
  async pullRemote(_since: number): Promise<SyncPullResult> {
    return { pulled: 0, latestServerTimestampMs: Date.now() };
  }
}

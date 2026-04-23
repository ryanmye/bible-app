import type { SyncProvider } from '../../domain/sync/SyncProvider';

export const NoopSyncProvider: SyncProvider = {
  id: 'noop',
  displayName: 'None (local only)',
  async isAuthenticated() {
    return false;
  },
  async signIn() {
    /* no-op */
  },
  async signOut() {
    /* no-op */
  },
  async pushDirty() {
    /* no-op */
  },
  async pullRemote() {
    /* no-op */
  },
};

import type { SyncProvider } from '../../domain/sync/SyncProvider';

// TODO(sync): wire firebase/firestore. Stub for selection in the UI.
export const FirebaseSyncProvider: SyncProvider = {
  id: 'firebase',
  displayName: 'Firebase',
  async isAuthenticated() {
    return false;
  },
  async signIn() {
    throw new Error('Firebase sync is not yet implemented.');
  },
  async signOut() {
    throw new Error('Firebase sync is not yet implemented.');
  },
  async pushDirty() {
    throw new Error('Firebase sync is not yet implemented.');
  },
  async pullRemote() {
    throw new Error('Firebase sync is not yet implemented.');
  },
};

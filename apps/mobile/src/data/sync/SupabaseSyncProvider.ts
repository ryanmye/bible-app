import type { SyncProvider } from '../../domain/sync/SyncProvider';

// TODO(sync): wire @supabase/supabase-js. For now this adapter throws if
// selected so we can register it in the UI and light up the pathway later.
export const SupabaseSyncProvider: SyncProvider = {
  id: 'supabase',
  displayName: 'Supabase',
  async isAuthenticated() {
    return false;
  },
  async signIn() {
    throw new Error('Supabase sync is not yet implemented.');
  },
  async signOut() {
    throw new Error('Supabase sync is not yet implemented.');
  },
  async pushDirty() {
    throw new Error('Supabase sync is not yet implemented.');
  },
  async pullRemote() {
    throw new Error('Supabase sync is not yet implemented.');
  },
};

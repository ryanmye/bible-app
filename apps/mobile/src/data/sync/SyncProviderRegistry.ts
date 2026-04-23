import type { SyncProvider } from '../../domain/sync/SyncProvider';
import { NoopSyncProvider } from './NoopSyncProvider';
import { SupabaseSyncProvider } from './SupabaseSyncProvider';
import { FirebaseSyncProvider } from './FirebaseSyncProvider';

const providers: Record<string, SyncProvider> = {
  [NoopSyncProvider.id]: NoopSyncProvider,
  [SupabaseSyncProvider.id]: SupabaseSyncProvider,
  [FirebaseSyncProvider.id]: FirebaseSyncProvider,
};

export const SyncProviderRegistry = {
  list(): SyncProvider[] {
    return Object.values(providers);
  },
  get(id: string): SyncProvider | undefined {
    return providers[id];
  },
  default(): SyncProvider {
    return NoopSyncProvider;
  },
  register(provider: SyncProvider): void {
    providers[provider.id] = provider;
  },
};

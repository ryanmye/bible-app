import type { SyncProvider } from '../../domain/sync/SyncProvider';
import { NoopSyncProvider } from './NoopSyncProvider';

/**
 * Registry of available SyncProviders. Adapters for Supabase, Firebase, etc.
 * should be registered here once implemented. The Settings screen reads
 * this list to let the user choose a backend.
 */
export class SyncProviderRegistry {
  private readonly providers = new Map<string, SyncProvider>();
  private activeId: string;

  constructor(providers: SyncProvider[]) {
    if (providers.length === 0) {
      throw new Error('SyncProviderRegistry requires at least one provider');
    }
    for (const p of providers) this.providers.set(p.id, p);
    this.activeId = providers[0].id;
  }

  list(): SyncProvider[] {
    return Array.from(this.providers.values());
  }

  get(id: string): SyncProvider | undefined {
    return this.providers.get(id);
  }

  getActive(): SyncProvider {
    return this.providers.get(this.activeId)!;
  }

  setActive(id: string): void {
    if (!this.providers.has(id)) {
      throw new Error(`Unknown sync provider: ${id}`);
    }
    this.activeId = id;
  }
}

export const syncProviders = new SyncProviderRegistry([new NoopSyncProvider()]);

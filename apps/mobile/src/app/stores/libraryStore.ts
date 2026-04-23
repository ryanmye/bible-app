import { create } from 'zustand';

import type { Version } from '../../domain/bible/types';
import { BibleRepository } from '../../data/repositories/BibleRepository';
import { getDb } from '../../data/db';

export interface LibraryState {
  loading: boolean;
  versions: Version[];
  error: string | null;
  reload: () => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  loading: false,
  versions: [],
  error: null,

  reload: async () => {
    set({ loading: true, error: null });
    try {
      const db = await getDb();
      const repo = new BibleRepository(db);
      const versions = await repo.listVersions();
      set({ versions, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));

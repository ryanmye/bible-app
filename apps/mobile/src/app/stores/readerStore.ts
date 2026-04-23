import { create } from 'zustand';

import type { BookOsisId, VersionId } from '../../domain/bible/types';

export interface ReaderLocation {
  book: BookOsisId;
  chapter: number;
}

export interface ReaderState {
  location: ReaderLocation;
  primaryVersion: VersionId;
  parallelVersions: VersionId[];
  parallelEnabled: boolean;

  setLocation: (loc: ReaderLocation) => void;
  setPrimaryVersion: (id: VersionId) => void;
  addParallel: (id: VersionId) => void;
  removeParallel: (id: VersionId) => void;
  setParallelEnabled: (enabled: boolean) => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  location: { book: 'Gen', chapter: 1 },
  primaryVersion: 'kjv',
  parallelVersions: [],
  parallelEnabled: false,

  setLocation: (location) => set({ location }),
  setPrimaryVersion: (primaryVersion) => set({ primaryVersion }),
  addParallel: (id) =>
    set((state) =>
      state.parallelVersions.includes(id)
        ? state
        : { parallelVersions: [...state.parallelVersions, id] },
    ),
  removeParallel: (id) =>
    set((state) => ({
      parallelVersions: state.parallelVersions.filter((v) => v !== id),
    })),
  setParallelEnabled: (parallelEnabled) => set({ parallelEnabled }),
}));

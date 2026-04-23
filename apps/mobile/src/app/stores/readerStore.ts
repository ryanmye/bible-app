import { create } from 'zustand';

type ReaderState = {
  primaryVersionId: string;
  parallelVersionIds: string[];
  parallelMode: boolean;
  book: string;
  chapter: number;
  setPrimaryVersion: (v: string) => void;
  setParallelVersions: (ids: string[]) => void;
  setParallelMode: (on: boolean) => void;
  goTo: (book: string, chapter: number) => void;
};

export const useReaderStore = create<ReaderState>((set) => ({
  primaryVersionId: 'kjv',
  parallelVersionIds: ['asv'],
  parallelMode: false,
  book: 'Gen',
  chapter: 1,
  setPrimaryVersion: (primaryVersionId) => set({ primaryVersionId }),
  setParallelVersions: (parallelVersionIds) => set({ parallelVersionIds }),
  setParallelMode: (parallelMode) => set({ parallelMode }),
  goTo: (book, chapter) => set({ book, chapter }),
}));

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getDatabase } from '../data/db';
import type { DbClient } from '../data/db/types';
import {
  BibleRepository,
  HighlightsRepository,
  NotesRepository,
} from '../data/repositories';
import { installSeedIfNeeded } from '../data/seed';
import { useTheme } from '../ui/theme';

export type DataLayer = {
  db: DbClient;
  bible: BibleRepository;
  notes: NotesRepository;
  highlights: HighlightsRepository;
};

const DataContext = createContext<DataLayer | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [layer, setLayer] = useState<DataLayer | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const theme = useTheme();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = await getDatabase();
        await installSeedIfNeeded(db);
        if (cancelled) return;
        setLayer({
          db,
          bible: new BibleRepository(db),
          notes: new NotesRepository(db),
          highlights: new HighlightsRepository(db),
        });
      } catch (e) {
        if (!cancelled) setError(e as Error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    throw error;
  }
  if (!layer) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.bg,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }
  return <DataContext.Provider value={layer}>{children}</DataContext.Provider>;
}

export function useData(): DataLayer {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}

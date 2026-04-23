import { Platform } from 'react-native';
import { moveAssetsDatabase } from '@op-engineering/op-sqlite';
import { BUNDLED_VERSIONS } from './bundledVersions';
import { BibleRepository } from '../repositories/BibleRepository';
import type { DbClient } from '../db/types';

const SEED_FLAG_KEY = 'seed.installed.v1';

type Meta = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
};

function makeMeta(db: DbClient): Meta {
  return {
    async get(key) {
      await db.execute(
        `CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`,
      );
      const rows = await db.execute<{ value: string }>(
        `SELECT value FROM _meta WHERE key = ?;`,
        [key],
      );
      return rows[0]?.value ?? null;
    },
    async set(key, value) {
      await db.execute(
        `INSERT INTO _meta (key, value) VALUES (?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
        [key, value],
      );
    },
  };
}

export type InstallSeedOptions = {
  /** override for tests / customization */
  assetFilename?: string;
};

/**
 * Copies the bundled seed.sqlite from the app bundle into the app's document
 * directory (so op-sqlite can read it), and registers bundled versions in the
 * main db if not already present. Safe to call on every launch.
 */
export async function installSeedIfNeeded(
  db: DbClient,
  options: InstallSeedOptions = {},
): Promise<'installed' | 'already-installed' | 'skipped-no-asset'> {
  const meta = makeMeta(db);
  const already = await meta.get(SEED_FLAG_KEY);
  if (already) return 'already-installed';

  const assetFilename = options.assetFilename ?? 'seed.sqlite';

  // On platforms where we can ship the asset, move it into the documents dir
  // so it can be opened alongside our main DB. We catch errors because on a
  // fresh repo the asset may not exist yet (the seed build script hasn't run).
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'macos' || Platform.OS === 'android') {
      await moveAssetsDatabase({
        filename: assetFilename,
        // iOS/macOS: the bundled asset lives at the resource root; Android uses
        // the standard assets path. op-sqlite handles both uniformly.
      });
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('[seed] could not move seed asset; continuing with empty DB', err);
    }
    await meta.set(SEED_FLAG_KEY, String(Date.now()));
    return 'skipped-no-asset';
  }

  const bible = new BibleRepository(db);
  const now = Date.now();
  for (const v of BUNDLED_VERSIONS) {
    await bible.upsertVersion({ ...v, installedAt: now });
  }

  await meta.set(SEED_FLAG_KEY, String(now));
  return 'installed';
}

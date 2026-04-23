import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

import { DB_NAME, getDb } from '../db';
import { BibleRepository } from '../repositories/BibleRepository';

const SEED_ASSET_NAME = 'seed.sqlite';

export interface SeedInstallResult {
  installed: boolean;
  reason: 'already-installed' | 'copied-from-bundle' | 'no-seed-found';
  versionIds: string[];
}

/**
 * First-launch installer for the bundled Bible seed.
 *
 * Strategy:
 *   1. Check whether the main app DB already contains any versions.
 *   2. If empty, locate `seed.sqlite` in the platform's main bundle and copy
 *      it over the main DB file. Migrations re-run idempotently after copy.
 *   3. If the seed cannot be found (e.g. missing from Xcode "Copy Bundle
 *      Resources"), we log and leave the DB empty so the app still runs.
 */
export async function installSeed(): Promise<SeedInstallResult> {
  const db = await getDb();
  const repo = new BibleRepository(db);
  const existing = await repo.listVersions();
  if (existing.length > 0) {
    return {
      installed: false,
      reason: 'already-installed',
      versionIds: existing.map((v) => v.id),
    };
  }

  const sourcePath = await locateBundledSeed();
  if (!sourcePath) {
    console.warn(
      `[installSeed] ${SEED_ASSET_NAME} not found in app bundle. ` +
        'Did you run `npm run seed:build` and add seed.sqlite to the ' +
        'Xcode project (Copy Bundle Resources)?',
    );
    return { installed: false, reason: 'no-seed-found', versionIds: [] };
  }

  const destDir = RNFS.DocumentDirectoryPath;
  const destPath = `${destDir}/${DB_NAME}`;

  if (await RNFS.exists(destPath)) {
    await RNFS.unlink(destPath);
  }
  await RNFS.copyFile(sourcePath, destPath);

  // Force a fresh connection against the new file. The existing `getDb()`
  // singleton was opened against the empty file; close it and let the next
  // call re-open.
  await db.close();
  const fresh = await getDb();
  const freshRepo = new BibleRepository(fresh);
  const versions = await freshRepo.listVersions();

  return {
    installed: true,
    reason: 'copied-from-bundle',
    versionIds: versions.map((v) => v.id),
  };
}

async function locateBundledSeed(): Promise<string | null> {
  const candidates: string[] = [];
  if (Platform.OS === 'ios' || Platform.OS === 'macos') {
    candidates.push(`${RNFS.MainBundlePath}/${SEED_ASSET_NAME}`);
    candidates.push(`${RNFS.MainBundlePath}/Contents/Resources/${SEED_ASSET_NAME}`);
  } else if (Platform.OS === 'android') {
    // Android support is out of scope for the initial foundation; returning
    // null here keeps the app running empty until we add an Android seed path.
    return null;
  }

  for (const path of candidates) {
    if (await RNFS.exists(path)) return path;
  }
  return null;
}

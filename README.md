# bible-app

A local-first Bible reader for **macOS** (now) and **iOS** (next), built on
React Native 0.81 with [`react-native-macos`][rnmacos]. Single codebase,
TypeScript, SQLite-backed with full-text search, user notes, highlights, and a
pluggable sync provider.

> AI agents working in this repo should start with [`LLMs.md`](./LLMs.md).

[rnmacos]: https://github.com/microsoft/react-native-macos

## Prereqs

- **Xcode 16+** (macOS/iOS targets)
- **Node 20+** (`.nvmrc` / `engines` pin to >= 20)
- **CocoaPods** — `gem install cocoapods` (or install via `brew install cocoapods`)
- **Ruby via rbenv** is recommended on macOS to match what CocoaPods expects
- Watchman (optional but recommended): `brew install watchman`

## Quick start

```bash
# JS deps
npm --prefix apps/mobile install

# Build the bundled public-domain Bibles (KJV / ASV / WEB) ~25 MB
npm run seed:build

# Native deps
npm run pods:ios        # iOS
npm run pods:macos      # macOS

# Run
npm run macos           # desktop
npm run ios             # simulator
npm start               # just the Metro server
```

## Scripts

Run from the repo root.

| Command                | What it does                                                    |
| ---------------------- | --------------------------------------------------------------- |
| `npm start`            | Start Metro bundler                                             |
| `npm run ios`          | `react-native run-ios`                                          |
| `npm run macos`        | `react-native run-macos --scheme mobile-macOS`                  |
| `npm run android`      | `react-native run-android` (Android is not a target yet)        |
| `npm run pods:ios`     | `pod install` in `apps/mobile/ios`                              |
| `npm run pods:macos`   | `pod install --project-directory=apps/mobile/macos`             |
| `npm run seed:build`   | Fetches KJV/ASV/WEB and writes `apps/mobile/assets/bibles/seed.sqlite` |
| `npm run seed:smoke`   | Opens the bundled seed and verifies repos round-trip (no RN needed)    |
| `npm test`             | Jest: repositories, USFM parser, reference parser                |
| `npm run lint`         | ESLint (RN config)                                              |

Inside `apps/mobile/` you can also run `npx tsc --noEmit` for a full typecheck.

## Folder tour

```
apps/mobile/
  ios/            Xcode project for iOS (created by RN init)
  macos/          Xcode project for macOS (created by react-native-macos-init)
  android/        Android project (not a current target, left intact)
  assets/
    bibles/
      seed.sqlite Pre-built public-domain Bibles (binary; rebuild with seed:build)
  src/
    app/          Root App component, Data/Theme providers, zustand stores
    navigation/   React Navigation drawer + root navigator
    features/
      reader/       Single + parallel reader, version picker, verse highlighter
      library/      Version list + import stubs
      notes/        List + inline editor
      highlights/   List with color palette
      search/       FTS5 query box
      settings/     Theme override + sync provider picker
      _template/    Copy this folder to add a new feature
    domain/
      bible/        Reference, Book, Version, VerseRow, OsisBookId
      notes/        Note, NewNote
      highlights/   Highlight, NewHighlight, palette
      sync/         SyncProvider interface
    data/
      db/           op-sqlite client, migrations, schema, better-sqlite3 test helper
      repositories/ BibleRepository, NotesRepository, HighlightsRepository
      importers/    usfm/ (happy-path parser) + epub/ (typed stub)
      seed/         Bundled-Bible installer (copies asset -> documents dir)
      sync/         NoopSyncProvider + SyncProviderRegistry (Supabase/Firebase stubs)
    ui/
      theme/        Light/dark tokens + ThemeProvider
      components/   Screen, Text, Button (minimal primitives)
    lib/          OSIS book list, reference parser/formatter
scripts/
  build-seed-db.ts  Builds apps/mobile/assets/bibles/seed.sqlite
  smoke-seed.ts     Opens the seed and round-trips note + highlight
packages/           Reserved for future extraction (currently empty)
```

The `src/domain/` and `src/data/` layers deliberately contain **zero React
Native imports** so they can be extracted into a shared package when an
iOS-only or web-admin app joins later.

## Adding a feature

1. `cp -R apps/mobile/src/features/_template apps/mobile/src/features/<name>`
2. Rename the screen file and export from the folder's `index.ts`
3. Add it to the drawer in `apps/mobile/src/navigation/AppDrawer.tsx`
4. If it needs persistence, talk to the DB through a repository in
   `src/data/repositories/` — never hit `op-sqlite` from a screen

See `LLMs.md` for the longer orientation + guardrails.

## Data model

Schema v1 lives in `apps/mobile/src/data/db/schema.ts`. Summary:

- `versions(id, name, abbreviation, language, source, copyright, installed_at)`
- `books(version_id, osis_id, name, ordinal)` — PK `(version_id, osis_id)`
- `verses(version_id, book_osis, chapter, verse, text)` — PK `(version_id, book_osis, chapter, verse)`
- `verses_fts` — FTS5 virtual table mirroring `verses.text`
- `notes(id, anchor_version, book_osis, chapter, verse_start, verse_end, body, created_at, updated_at, remote_id, dirty)`
- `highlights(id, book_osis, chapter, verse_start, verse_end, color, created_at, updated_at, remote_id, dirty)`

Every user-data table has `remote_id` + `dirty` so the sync layer can be
wired in without reshaping tables.

## Sync

Provider-agnostic by design. See `src/domain/sync/SyncProvider.ts`. The default
is `NoopSyncProvider`; Supabase and Firebase are registered as typed stubs and
throw on use until implemented.

## Known issues

- `react-native-macos` 0.81.6 has an open build-failure issue
  ([microsoft/react-native-macos#2936][rnm-2936]). If the fresh macOS build
  fails, pin `react-native` **and** `react-native-macos` to a matching 0.79.x
  minor. Everything in `src/` is RN-version-agnostic.
- `op-sqlite` requires the New Architecture, which is on by default in
  RN 0.81. Don't disable it.
- WEB is currently sourced from scrollmapper's `NHEB.json` (also public
  domain). Swap in a direct WEB source when one is available upstream.

[rnm-2936]: https://github.com/microsoft/react-native-macos/issues/2936

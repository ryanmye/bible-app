# Orientation for AI contributors

Read this before making changes. It summarizes the conventions that the rest of the codebase already assumes.

## Stack

- React Native **0.81.4** (TypeScript) with `react-native-macos` **0.81.4** for the desktop target. iOS target ships from the same codebase.
- SQLite via **`@op-engineering/op-sqlite`** (new-architecture required; RN 0.81 has it on by default).
- React Navigation 7 (Drawer).
- Zustand for UI state; repository pattern for data.
- Node Jest for unit tests (no RN preset — tests run in plain node for speed and so they don't need native modules).

## Layered architecture

The app has a strict dependency direction:

```
features/ (RN UI) ── uses ──▶  data/repositories/  ── uses ──▶  data/db/  ── uses ──▶  op-sqlite
                        └── also uses ──▶  domain/
ui/ (primitives + theme)  ── uses ──▶ domain/
```

Rules:

1. **`src/domain/`** is pure TypeScript. No React, no React Native, no Node APIs. It must run in any JS runtime. This is the seam for a future shared package or web admin.
2. **`src/data/`** may use Node-native / RN-native APIs (op-sqlite, react-native-fs), but **only behind a small interface** (see `DbClient`). It must NOT import from `ui/` or `features/`.
3. **`src/ui/`** is the design system. Themed primitives only. It must NOT import repositories or stores directly.
4. **`src/features/`** is where RN screens live. Screens call repositories and stores; they should not build ad-hoc SQL.
5. **`src/navigation/`** is the only place that wires features into a navigator.
6. **`src/app/`** owns the root `AppRoot`, providers, bootstrap, and zustand stores.

## Database conventions

- Schema is declared as numbered **migrations** in `apps/mobile/src/data/db/schema.ts`. **Never edit a shipped migration**; add a new one.
- Every user-data table has **`remote_id TEXT` + `dirty INTEGER NOT NULL DEFAULT 1`** so sync is a drop-in feature.
- The main DB file is `bibleapp.sqlite` in the app document dir. On first launch, `installSeed()` copies `seed.sqlite` from the app bundle into that location, then we rerun migrations (idempotent).
- Full-text search uses FTS5 (`verses_fts`), populated at insert time by `BibleRepository.bulkInsertVerses`.

## Bible references + canon

- We use **OSIS book ids** (`Gen`, `Matt`, `1John`, `Rev`, ...) everywhere. See `apps/mobile/src/domain/bible/canon.ts` for the frozen canonical list of all 66 Protestant books with ordinals and testament labels.
- Human-facing names are resolved via `canonicalBookName(osisId)` — never hard-code.
- When importing, map the foreign book name/id to OSIS using the helpers in the importer (e.g. USFM has its own three-letter codes, mapped in `parseUsfm.ts`).

## Sync

- The default is `NoopSyncProvider`. New backends implement the `SyncProvider` interface in `src/domain/sync/SyncProvider.ts` and register themselves with the `SyncProviderRegistry` singleton in `src/data/sync/SyncProviderRegistry.ts`.
- Do not spread sync logic into repositories; repositories only expose `listDirty()` / `markClean(id, remoteId)` helpers.

## Importers

- `BibleImporter` returns `{ version, books, verses, warnings }` — plain data. The caller writes it via the repositories inside a transaction.
- USFM parsing is in `src/data/importers/usfm/parseUsfm.ts`. Keep that parser pure (string in, parsed out). The `UsfmImporter` is only the I/O wrapper.
- EPUB is stubbed with a typed error class (`EpubImportNotYetImplementedError`). The UI is free to catch this and show "coming soon" gracefully.

## Testing

- `npm test` runs Jest in node (no RN preset) against `__tests__/**/*.test.ts`.
- Repository tests use the `FakeDb` spy client in `__tests__/fakes/FakeDb.ts` — it records SQL calls and returns queued responses. It is **not** a SQL engine; do not assert row state by issuing real queries against it. Prefer asserting on `db.calls` and the returned objects.
- There is a full-fidelity end-to-end check at `scripts/smoke-test.ts` that uses `better-sqlite3` as a stand-in for op-sqlite. Run it with `npm run smoke`. It's the fastest way to validate a data-layer change without launching Xcode.

## When adding a new feature

1. Copy `apps/mobile/src/features/_template/` to `src/features/<name>/`.
2. Add domain models in `src/domain/<name>/` if the feature has non-trivial logic.
3. Add a repository in `src/data/repositories/` with `dirty`/`remote_id` bookkeeping.
4. Extend the schema via a new migration entry in `src/data/db/schema.ts`.
5. Register the screen in `src/navigation/AppDrawer.tsx`.
6. Add tests under `apps/mobile/__tests__/`.

## Cross-platform notes

- We are explicitly **not** browser-based. Never add `expo-web`, `react-native-web`, or a webview-only flow.
- Prefer code paths that work on both iOS and macOS. The current `react-native-macos` target is the blocker for anything mac-specific (menu bar, windowing); file platform-specific code under `.macos.ts` / `.ios.ts` only when necessary.

## Security / privacy

- Bible text is public domain. User data (notes, highlights, bookmarks) lives locally by default. Never log user note or highlight contents to telemetry without a consent flow.

## Out of scope for the foundation

- Full EPUB parsing.
- Actual cloud sync adapters (Supabase/Firebase).
- Reading plans, audio, lexicon, cross-references UI.
- Android polish (targets scaffolded but not exercised).

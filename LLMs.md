# LLMs.md — Orientation for AI agents

Read this first. It's the shortest path to not breaking things.

## 1. What this project is

A local-first Bible reader. Primary target: **macOS** now, **iOS** next.
Same codebase. Built with:

- **React Native 0.81.6** + **TypeScript**, New Architecture on (required by op-sqlite)
- **`react-native-macos` 0.81.7** for the desktop target
- **`@op-engineering/op-sqlite`** — the only DB client used at runtime in-app
- **React Navigation** (drawer + native stack) with a token-based theme that
  follows `useColorScheme`
- **zustand** for lightweight UI/session state (e.g. current book/chapter, theme
  override, selected sync provider)
- **Jest** + **better-sqlite3** for unit tests (better-sqlite3 emulates the
  `DbClient` interface at test time; nothing in `src/` actually imports it)

No browser / no webview. No workspaces yet (`packages/` is reserved).

## 2. Layer rules — do not violate

```
UI (features/*)    ─┐
                   ├─► Repositories ─► DbClient (op-sqlite at runtime)
Importers (USFM…)  ─┘
Seed installer     ───► DbClient
Sync providers     ───► Repositories (future; currently noop)
Domain             ─── imported by everyone, depends on nothing
```

Enforced informally. Key guardrails:

- **`src/domain/` and `src/data/` MUST NOT import React Native.** They have
  to be portable; they will be extracted into a `packages/*` workspace when
  we add a second consumer.
- **Screens talk to repositories, never to `op-sqlite` directly.** Use
  `useData()` from `src/app/DataContext.tsx`.
- **All persistence goes through a repository method.** Add new methods to
  `BibleRepository`, `NotesRepository`, `HighlightsRepository` instead of
  sprinkling SQL in screens.
- **Every user-data table already has `remote_id` + `dirty`.** When you add
  new user-data tables, keep this convention so sync stays trivial.

## 3. Where things live

```
apps/mobile/src/
  app/         Root App, DataProvider (boots DB + seed), ThemeProvider, zustand stores
  navigation/  RootNavigator + AppDrawer
  features/    one folder per screen family; copy features/_template to add one
  domain/      pure-TS types + SyncProvider interface
  data/
    db/          opSqliteClient, migrations (PRAGMA user_version), schema.ts, testing.ts
    repositories/ Bible, Notes, Highlights — add methods here
    importers/   usfm parser (happy path) + epub stub
    seed/        installSeedIfNeeded (uses op-sqlite moveAssetsDatabase)
    sync/        Noop/Supabase/Firebase providers + SyncProviderRegistry
  ui/          theme tokens + Screen/Text/Button primitives
  lib/         OSIS book list + reference parser/formatter
scripts/
  build-seed-db.ts  fetches KJV/ASV/WEB → apps/mobile/assets/bibles/seed.sqlite
  smoke-seed.ts     exercises the data layer against the bundled seed without RN
```

## 4. Running + checking

- **Typecheck:** `cd apps/mobile && npx tsc --noEmit` (or `npm run typecheck`)
- **Unit tests:** `cd apps/mobile && npm test` (12 tests; should stay green)
- **Data-layer smoke (no RN required):** from repo root `npm run seed:smoke`
- **Regenerate the seed DB:** `npm run seed:build` (writes to
  `apps/mobile/assets/bibles/seed.sqlite`; ~25 MB). Do this whenever you
  change the schema or sources.

You cannot meaningfully run the macOS/iOS apps from a Linux cloud agent; use
`seed:smoke` plus unit tests to validate data-layer changes.

## 5. How to add a feature screen

1. `cp -R apps/mobile/src/features/_template apps/mobile/src/features/<name>`
2. Rename the screen component + update `index.ts`
3. Register it in `apps/mobile/src/navigation/AppDrawer.tsx`
4. If it needs persistence: add repository methods (never hit `op-sqlite` from
   a screen) and consume them with `useData()`
5. If it needs UI-only state: prefer a zustand store in
   `apps/mobile/src/app/stores/`

## 6. How to change the DB schema

1. Add a new array of SQL statements to `MIGRATIONS` in
   `apps/mobile/src/data/db/schema.ts`. **Never edit `SCHEMA_V1` once it has
   been released** — migrations are append-only.
2. Update the affected repositories + domain types.
3. Update `scripts/build-seed-db.ts` if the seed needs new columns/tables.
4. Rerun `npm run seed:build` and `npm test`.

## 7. Sync

`SyncProvider` (in `src/domain/sync/SyncProvider.ts`) is the only surface that
UI/Settings code knows about. To add a real backend:

1. Implement a class/object matching `SyncProvider`
2. `SyncProviderRegistry.register(...)` it from the app boot
3. Settings screen picks it up automatically

The Noop provider is the default so features continue to work offline.

## 8. Bible sources

- Bundled: KJV, ASV, WEB (currently sourced from scrollmapper's NHEB JSON
  until a direct WEB feed is wired). All public domain.
- User-imported: USFM is supported via `src/data/importers/usfm`. EPUB is a
  typed stub — flesh it out only when we have representative samples.

## 9. Don't

- Don't re-enable the default `__tests__/App.test.tsx` — the real App boots
  op-sqlite which is unavailable in Jest. Tests should target domain/data.
- Don't import from `@op-engineering/op-sqlite` outside
  `src/data/db/opSqliteClient.ts` and `src/data/seed/installSeed.ts`.
- Don't put React Native imports in `src/domain/` or `src/data/` (outside of
  the two files that legitimately need `Platform` / `op-sqlite`).
- Don't commit anything into `packages/`. It exists purely as a seam; use it
  only when you're consciously extracting a shared package.
- Don't edit the original plan file at
  `/Users/ryanm/.cursor/plans/bible-app-foundation_a0195010.plan.md`.

## 10. Known gotchas

- **macOS 0.81.6** has an open build-failure issue
  ([microsoft/react-native-macos#2936](https://github.com/microsoft/react-native-macos/issues/2936)).
  Everything in `src/` is version-agnostic; if macOS won't build, downgrade
  the RN pair to matching 0.79.x and iterate again.
- `uuid` ships ESM-only; `apps/mobile/jest.config.js` already whitelists it in
  `transformIgnorePatterns`. If you add another ESM-only dep and tests fail
  with `Unexpected token 'export'`, extend that pattern.
- `op-sqlite.executeBatch` expects `SQLBatchTuple` (`[sql]` / `[sql, params]`),
  not `{query: sql}`. The wrapper in `opSqliteClient.ts` handles this.
- `PRAGMA user_version = N` can't be parameterized; the migration runner inlines
  the integer, which is safe because it's controlled by `MIGRATIONS.length`.

## 11. Useful entry points

- Root of the RN app: `apps/mobile/App.tsx` → `src/app/App.tsx`
- Where the DB is opened: `src/app/DataContext.tsx` + `src/data/db/index.ts`
- Where bundled versions come from: `src/data/seed/bundledVersions.ts`
- Where the drawer routes are declared: `src/navigation/AppDrawer.tsx`
- Example repository test: `apps/mobile/__tests__/repositories.test.ts`

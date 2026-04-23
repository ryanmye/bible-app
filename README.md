# bible-app

A local-first Bible reader for macOS (now) and iOS (next), built on React Native 0.81
with `react-native-macos`. Single codebase, TypeScript, SQLite-backed with full-text
search, user notes, highlights, and a pluggable sync provider.

See [`LLMs.md`](./LLMs.md) for the orientation doc aimed at AI agents working in this
repo. Full setup, scripts, and folder tour live below.

## Layout

```
apps/mobile/    React Native app (iOS, macOS; Android later)
scripts/        Dev-only scripts (seed builder, etc.)
packages/       Reserved for future extraction
```

## Quick start

```bash
# install JS deps for the app
npm --prefix apps/mobile install

# iOS
npm run pods:ios
npm run ios

# macOS
npm run pods:macos
npm run macos

# dev server only
npm start
```

## Scripts

- `npm start` — start Metro for the app
- `npm run ios` / `npm run macos` / `npm run android`
- `npm run pods:ios` / `npm run pods:macos`
- `npm run seed:build` — build the bundled public-domain Bible database
- `npm test` — run unit tests

## Folder tour

```
apps/mobile/src/
  app/         root, providers, navigation host
  navigation/  stacks, drawer, linking
  features/    one folder per screen family (reader, library, notes, ...)
  domain/      pure TS types/interfaces (no RN imports)
  data/
    db/          op-sqlite client, migrations, schema
    repositories/ Bible, Notes, Highlights
    importers/   usfm/, epub/
    seed/        bundled-bible installer
    sync/        SyncProvider implementations
  ui/          theme tokens + reusable primitives
  lib/         small utils
```

## Adding a feature

Copy `apps/mobile/src/features/_template` to a new folder and wire it into the drawer in
`apps/mobile/src/navigation/AppDrawer.tsx`.

## Known issues

- `react-native-macos` 0.81.6 has a reported build-failure issue
  ([microsoft/react-native-macos#2936](https://github.com/microsoft/react-native-macos/issues/2936)).
  If the fresh build fails on macOS, downgrade both `react-native` and
  `react-native-macos` to a matching 0.79.x minor.

See the full notes and Prereqs at the bottom of this README.

## Prereqs

- Xcode 16+
- Node 20+
- CocoaPods (`gem install cocoapods`)
- Ruby via `rbenv` recommended

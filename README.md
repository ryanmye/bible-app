# Bible App

A cross-platform Bible reading app focused on side-by-side version comparison, notes, and highlights. Built with React Native so a single codebase powers macOS today and iOS next.

> For the in-depth folder tour, setup steps, and known issues see [`apps/mobile/README.md`](apps/mobile/README.md).

## Quick start

```bash
npm run install:all        # install root + mobile deps
npm run macos:init         # Mac only, adds the macOS Xcode project (once)
npm run pods               # Mac only, installs CocoaPods for ios/ and macos/
npm run seed:build         # builds the bundled Bible database
npm run macos              # run the macOS app
npm run ios                # run the iOS simulator
npm start                  # start the Metro bundler
```

## Layout

```
bible-app/
  apps/
    mobile/         React Native app (macOS + iOS; Android scaffolded by default)
  scripts/
    build-seed-db.ts   Builds the bundled Bible SQLite seed
  packages/         Reserved for future shared packages
```

See the plan at [`.cursor/plans/`](.cursor/plans) for the architectural decisions.

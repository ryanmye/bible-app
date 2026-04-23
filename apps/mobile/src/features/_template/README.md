# Feature template

Copy this folder to `src/features/<feature-name>/` when starting a new feature, then:

1. Rename `PlaceholderScreen.tsx` to `<Feature>Screen.tsx` and update the export in `index.ts`.
2. Add the screen to `src/navigation/AppDrawer.tsx` so it shows up in the drawer.
3. Keep data access behind repositories from `@data/repositories`. Do not touch `getDb()` directly in screens.
4. Domain logic (parsing, range math, etc.) goes in `@domain/...` so it stays RN-free and unit-testable.

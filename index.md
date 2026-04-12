# letitrip.in Index

Consumer app for @mohasinac/appkit. This index is intentionally concise and maintained manually.

## Purpose

letitrip.in should stay thin:
- Owns routes, app wiring, server actions, and project config.
- Imports reusable UI/features/hooks/providers from @mohasinac/appkit.
- Avoids parallel reusable implementations when appkit ownership exists.

## Main Entry Points

- app routes: src/app/
- server actions: src/actions/
- provider wiring: src/providers.config.ts
- feature flags/config: src/features.config.ts
- project constants/config: src/constants/, src/config/

## Expected Ownership In This Repo

- Next.js route files and route-local composition.
- App-specific runtime wiring (market config, environment integration).
- Thin adapters that pass letitrip config/labels/data into appkit components.

## Should Usually Live In appkit Instead

- Reusable UI components and layout primitives.
- Feature view implementations and shared hooks/contexts.
- Shared schemas, repositories, validation, and utilities.

## Important Documents

- migration backlog: prune.md
- architecture rules: .github/copilot-instructions.md
- package manifest: package.json

## Notes

- This file intentionally does not list every source file.
- Use this as a quick orientation map; rely on code search for detailed symbol lookups.

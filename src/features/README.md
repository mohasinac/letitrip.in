# Feature Modules

Each directory here is a **self-contained vertical slice** of one application domain.

## Structure

```
src/features/
  <name>/
    components/    ← UI components specific to this feature
    hooks/         ← data-fetching & state hooks for this feature
    types/         ← TypeScript interfaces specific to this feature
    constants/     ← sort options, status enums, config constants
    utils/         ← mappers / formatters used only by this feature (optional)
    index.ts       ← PUBLIC barrel — only export what pages need
```

## Rules

1. **Feature code imports Tier 1 only** — `@/components`, `@/hooks`, `@/utils`, `@/helpers`, `@/constants`, `@/classes`.
2. **Never import from another feature** — `import X from '@/features/cart'` inside `@/features/products` is forbidden. Elevate shared logic to Tier 1.
3. **One public barrel per feature** — callers use `import { X } from '@/features/<name>'`, never deep imports.
4. **Pages compose features** — `src/app/` is the only layer allowed to import from multiple feature modules.

## Why

Tier 1 shared code (`src/components/ui/`, `src/hooks/`, `src/utils/`, etc.) can be extracted into an npm package (`@letitrip/ui`, `@letitrip/utils`) at any time. Because feature modules only ever import from those barrels — not from relative paths — the extraction only requires updating `tsconfig.json` path aliases. No feature or page file needs to change.

## Migration

- **New features** → create directly in `src/features/<name>/`.
- **Existing** `src/components/<feature>/` → migrate to `src/features/<name>/components/` when the area is next touched.
- **Feature-specific hooks** in `src/hooks/` (e.g. `useRealtimeBids`, `useAdminStats`, `useRazorpay`) → move to `src/features/<feature>/hooks/` progressively.

## Feature barrel `index.ts` template

```typescript
// src/features/<name>/index.ts
export * from "./components";
export * from "./hooks";
export * from "./types";
export * from "./constants";
// optional:
// export * from './utils';
```

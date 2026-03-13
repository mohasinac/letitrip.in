---
applyTo: ["scripts/**", "src/db/**"]
description: "Seed data sync on schema changes, docs/CHANGELOG sync on every change. Rules 29, 30."
---

# Docs & Seed Data Sync Rules

## RULE 29: Keep Seed Data in Sync with Schema Changes

Whenever you change a schema file, Firestore/Storage/DB rules, or `firestore.indexes.json`, update seed data in the **same change**.

### Trigger Table

| Changed                                        | Update in `src/db/seed-data/`                 |
| ---------------------------------------------- | --------------------------------------------- |
| `src/db/schema/<domain>.ts` — interface/fields | `src/db/seed-data/<domain>-seed-data.ts`      |
| Collection name constant                       | All seed files referencing it                 |
| `STATUS_VALUES`/`TYPE_VALUES` enum constants   | All seed objects using those values           |
| `firestore.rules`                              | Seed data for affected collection             |
| `firestore.indexes.json` — new composite index | Add seed object exercising all indexed fields |
| Renamed/removed field                          | Remove from ALL seed objects                  |
| New required field                             | Add to EVERY seed object in the matching file |

### Seed Object Rules

- Every required field must be present — no `undefined`
- Use schema constants: `PRODUCT_FIELDS.STATUS_VALUES.PUBLISHED`, not `'published'`
- Cover at least one seed object per status/type variant
- FK references must have a matching parent seed object — no orphans
- Timestamps: `new Date('2025-01-15T10:00:00Z')` — never string literals
- IDs: use established deterministic format (e.g., `'product-001'`)

### Checklist

- [ ] Updated `src/db/seed-data/<domain>-seed-data.ts`
- [ ] Updated `src/db/seed-data/RELATIONSHIPS.md` if FK references changed
- [ ] Updated `src/db/seed-data/index.ts` if new seed file added
- [ ] Added seeding step in `/api/demo/seed/route.ts` if new collection seeded
- [ ] `npx tsc --noEmit src/db/seed-data/<domain>-seed-data.ts` passes

When adding a new collection: create `src/db/seed-data/<domain>-seed-data.ts`, export from `src/db/seed-data/index.ts`, add to `CollectionName` type and seed maps in `src/app/api/demo/seed/route.ts`.

## RULE 30: Docs + CHANGELOG Must Stay in Sync

Every CHANGELOG entry MUST be accompanied by updates to all affected files in the **same change**.

### What to also update

| CHANGELOG describes       | Also update                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| New/changed component API | `docs/GUIDE.md` + all call sites                                   |
| New/changed hook API      | `docs/GUIDE.md` + `docs/QUICK_REFERENCE.md` + call sites           |
| New/changed utility       | `docs/GUIDE.md` + call sites                                       |
| New/changed API endpoint  | `docs/GUIDE.md` + `src/constants/api-endpoints.ts` + services      |
| New/changed route         | `docs/GUIDE.md` + `src/constants/routes.ts` + Link/push call sites |
| Security/RBAC change      | `docs/SECURITY.md` + `docs/RBAC.md` + `src/constants/rbac.ts`      |
| Schema/collection change  | `docs/GUIDE.md` + `scripts/seed-data/` (Rule 29)                   |
| Removed feature           | `docs/GUIDE.md` (remove entry) + delete the code (Rule 24)         |

Never ship a CHANGELOG entry that references a component, hook, or route that docs don't yet describe.

### Core docs set (always keep current)

`docs/GUIDE.md` · `docs/QUICK_REFERENCE.md` · `docs/CHANGELOG.md` · `docs/SECURITY.md` · `docs/RBAC.md` · `docs/ERROR_HANDLING.md` · `docs/STYLING_GUIDE.md`

NEVER create session-specific files like `REFACTORING_DATE.md` or `SESSION_SUMMARY.md`.

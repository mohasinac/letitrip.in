---
applyTo: "src/**"
description: "No alert/confirm, structured logging, no backward compatibility, build verification, tests as you go. Rules 22, 23, 24, 26, 27."
---

# Code Quality Rules

## RULE 22: No Native Dialogs

| ❌ Never       | ✅ Use instead                           |
| -------------- | ---------------------------------------- |
| `alert(msg)`   | `useMessage()` from `@/hooks`            |
| `confirm(msg)` | `ConfirmDeleteModal` from `@/components` |
| `prompt(msg)`  | Custom form in `Modal`                   |

## RULE 23: Structured Logging

`console.log()` is FORBIDDEN in production code.

| Context             | Use            | Import                |
| ------------------- | -------------- | --------------------- |
| Client-side         | `logger`       | `@/classes`           |
| Server / API routes | `serverLogger` | `@/lib/server-logger` |

## RULE 24: No Backward Compatibility

Delete old code when replacing it. No exceptions.

- No `@deprecated` JSDoc stubs — delete the code
- No compatibility shims (`export const formatPrice = formatCurrency` — update call sites instead)
- No dual implementations or feature flags for old behaviour
- Modern JS/CSS only — no polyfills, no `@supports` fallbacks, no manual vendor prefixes

## RULE 26: Build Verification (mandatory after EVERY change)

Run in this exact order — never skip steps:

```powershell
# 1. Type-check changed file(s)
npx tsc --noEmit src/path/to/changed-file.tsx

# 2. Full type-check
npx tsc --noEmit

# 3. Production build
npm run build
```

All three must pass with 0 errors before the task is done. Never hand back with outstanding TS errors or a failing build.

## RULE 28-B: Protect Source Files from Encoding Corruption

PowerShell and Python scripts are **permitted** to read or process source files, but must never write back to them in a way that corrupts encoding.

Why: PowerShell and Python can corrupt UTF-8 files by writing BOM, wrong CRLF line endings, wrong encoding, or truncating Unicode characters (e.g. Hindi/Devanagari). This has previously corrupted `messages/hi.json`.

### Preferred tools for file edits

| Task                          | Correct tool                                              |
| ----------------------------- | --------------------------------------------------------- |
| Edit a source / message file  | `replace_string_in_file` / `multi_replace_string_in_file` |
| Add/remove a JSON field       | `replace_string_in_file`                                  |
| Batch edits across many files | `multi_replace_string_in_file`                            |
| Create a brand-new file       | `create_file` tool                                        |

### When PowerShell or Python scripts write to source files

Scripts MAY write to `src/`, `messages/`, or `scripts/seed-data/` if **all** of the following are satisfied:

1. **Encoding is explicit and safe** — use `-Encoding utf8NoBOM` (PowerShell) or `encoding='utf-8'` without BOM (Python)
2. **Double-verify before execution** — review the exact command/script output twice to confirm no encoding issues before the write runs
3. **Corruption check after write** — immediately verify the written file (open in editor or diff against original) to confirm no garbled characters, BOM, or CRLF changes

### Banned patterns (always)

- ❌ `Set-Content`, `Out-File`, `Add-Content` without explicit `-Encoding utf8NoBOM`
- ❌ `python -c "open(...).write(...)"` without explicit `encoding='utf-8'`
- ❌ `sed -i`, `awk`, `jq` piped into source files via shell without encoding verification
- ❌ Any script that silently overwrites a source file without a pre-execution review step

---

## RULE 27: Tests As You Go

- **New file** → create `__tests__/<filename>.test.ts(x)` alongside it
- **Modified file** → update existing test to cover the change
- **Deleted file** → delete its test file
- Tests live next to code: `src/features/products/hooks/__tests__/useProducts.test.ts`
- After writing tests: `npm test -- --testPathPattern=<changed-file>`
- Do NOT batch test-writing — write each test when each file is done

```typescript
// Pattern
describe("useProducts", () => {
  it("returns product list on success", async () => {
    /* arrange/act/assert */
  });
  it("propagates error state", async () => {
    /* arrange/act/assert */
  });
});
```

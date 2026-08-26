#!/usr/bin/env node
/**
 * audit-form-schema — strict-zero.
 *
 * Every <FormShell> JSX usage and every useFormShellState(...) callsite MUST
 * reference a Zod schema, either as a `schema={...}` prop or as the first
 * argument to useFormShellState (when its API exposes a schema seat).
 *
 * Scope: src/ + appkit/src/ — not the FormShell definition itself.
 *
 * Exit 0 — clean.
 * Exit 1 — form callsites without a discernible schema reference.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const ALLOW = [
  join(ROOT, "appkit", "src", "ui", "forms", "FormShell.tsx"),
  // ui/components/Form.tsx is a thin re-export layer that mentions FormShell
  // by name in its public types; it doesn't host any concrete form callsite.
  join(ROOT, "appkit", "src", "ui", "components", "Form.tsx"),
];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".mjs"]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if ([...EXTS].some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

const violations = [];

for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    if (ALLOW.includes(file)) continue;
    const rel = relative(ROOT, file);
    const src = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");

    const usesFormShellJsx = /<\s*FormShell\b/.test(src);
    const usesFormShellState = /\buseFormShellState\s*\(/.test(src);
    if (!usesFormShellJsx && !usesFormShellState) continue;

    // Acceptable schema references:
    //   - <FormShell schema={...}>
    //   - { schema: <ident> }  (any object literal field)
    //   - useFormShellState(<ident>)  (hook invoked with a schema argument)
    const hasSchemaProp =
      /\bschema\s*=\s*\{/.test(src) ||
      /\bschema\s*:\s*[A-Za-z_$]/.test(src) ||
      /\buseFormShellState\s*(?:<[^>]+>\s*)?\(\s*[A-Za-z_$]/.test(src);
    /*
     * The schema must be PROVABLY a Zod schema, not just any identifier named
     * `schema`. Two accepted proofs:
     *
     *   1. the file imports zod and declares the schema itself, or
     *   2. it imports a binding whose NAME ends in `Schema`.
     *
     * (2) was missing and it made the audit reject the better pattern. W4
     * established that a schema belongs in a `schemas/` module, not in a view
     * — registering one from a `.tsx` made `schemas/registry.ts` import React
     * trees, and `routeHandler.ts` imports that registry, so every API route
     * pulled an admin editor into the server bundle. Requiring `from "zod"` in
     * the view is a proxy for "has a schema" that is false exactly when the
     * schema is correctly shared, which is also the only way two portals can
     * be guaranteed to accept the same field set.
     *
     * The binding NAME is the proof, not the import PATH. A first draft of (2)
     * required the path to contain `schema`, which worked for appkit own
     * views and rejected every CONSUMER form — those cannot reach into
     * `appkit/src` and must import from `@mohasinac/appkit/client`. Since
     * `hasSchemaProp` has already confirmed the binding is passed AS the
     * schema, the only remaining question is whether it IS one, and a
     * `*Schema` name that is not a schema is a naming lie no static rule
     * should pretend to catch.
     */
    const importsZod = /from\s+["']zod["']/.test(src);
    const importsSchemaBinding =
      /import\s*(?:type\s*)?\{[^}]*\b[A-Za-z_$][\w$]*Schema\b[^}]*\}\s*from\s*["'][^"']+["']/.test(src);

    if (!hasSchemaProp || !(importsZod || importsSchemaBinding)) {
      violations.push(
        `${rel} :: uses FormShell/useFormShellState without a Zod schema reference ` +
          `(needs a schema prop AND either import "zod" or an imported *Schema binding)`,
      );
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-form-schema] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

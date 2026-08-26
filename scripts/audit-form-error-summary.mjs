#!/usr/bin/env node
/**
 * audit-form-error-summary — strict-zero.
 *
 * Every file that drives schema-based form validation (a `<FormShell>` JSX
 * usage, a `useFormShellState(...)` call, or a `<Form ... schema=` /
 * `<Form ... shellCtx=` usage) must also render `<FormErrorSummary>`
 * somewhere in the same file — the shared, live, beside-Submit/Save error
 * summary block. `audit-form-schema` already proves "this form has a
 * schema"; this audit proves "this form's validation is actually surfaced
 * to the user," closing the loop that both original bugs (product-create
 * form: white-box previews + a validation failure with no useful message)
 * exploited.
 *
 * Scope: src/ + appkit/src/ — not the primitive definition files themselves.
 *
 * ## 🛑 The W21 mobile bar does NOT satisfy this rule
 *
 * `useFormBottomActions()` publishes a "Fix N issues" sheet into the
 * bottom-chrome tier, rendering the same `<FormErrorList>` this summary does.
 * It is tempting to accept it as an alternative — the W21 plan said it would
 * have to be, expecting the summary to MOVE into the bar and all ~75 files to
 * start failing.
 *
 * That is not what happened, and accepting it would be a real weakening.
 * `useBottomActions` defaults to `desktop: "hidden"`, so the bar exists on
 * phones only. A file whose sole error surface were the bar would show a
 * desktop user a form that refuses to save and says nothing about why.
 *
 * So the two are ADDITIVE, not alternative: the inline summary is the
 * always-present surface, the bar is the mobile ergonomics on top. Nothing
 * moved out of any file, no suppression marker was needed anywhere, and this
 * audit is unchanged in what it demands.
 *
 * Whole-file suppression: `// audit-form-error-summary-ok: <reason>`
 * anywhere in the file (e.g. a form whose FormErrorSummary is legitimately
 * rendered by a different file — a shared layout wrapper — not co-located).
 *
 * Exit 0 — clean.
 * Exit 1 — form callsites without a co-located <FormErrorSummary>.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const ALLOW = [
  join(ROOT, "appkit", "src", "ui", "forms", "FormShell.tsx"),
  join(ROOT, "appkit", "src", "ui", "forms", "FormErrorSummary.tsx"),
  join(ROOT, "appkit", "src", "ui", "components", "Form.tsx"),
  join(ROOT, "appkit", "src", "features", "shell", "FormShell.tsx"),
  join(ROOT, "appkit", "src", "features", "shell", "StepForm.tsx"),
];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".mjs"]);
const SUPPRESS_RE = /\/\/\s*audit-form-error-summary-ok\b/;

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

    if (SUPPRESS_RE.test(readFileSync(file, "utf8"))) continue;

    const usesFormShellJsx = /<\s*FormShell\b/.test(src);
    const usesFormShellState = /\buseFormShellState\s*\(/.test(src);
    // Bounded lookahead so this only matches within a single <Form ...> opening
    // tag's attribute list, not runaway across the rest of the file.
    const usesFormWithSchemaProp = /<\s*Form\b[\s\S]{0,300}?\b(?:schema|shellCtx)\s*=/.test(src);
    const isFormCallsite = usesFormShellJsx || usesFormShellState || usesFormWithSchemaProp;
    if (!isFormCallsite) continue;

    const hasErrorSummary = /<\s*FormErrorSummary\b/.test(src);
    if (!hasErrorSummary) {
      violations.push(
        `${rel} :: drives schema-based form validation without rendering <FormErrorSummary> anywhere in the file`,
      );
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-form-error-summary] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

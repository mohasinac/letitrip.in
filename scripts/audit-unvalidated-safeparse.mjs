#!/usr/bin/env node
/**
 * audit-unvalidated-safeparse — strict-zero.
 *
 * Catches the "validation ran but the result went nowhere" defect class —
 * distinct from "no schema at all" (audit-form-schema) — where a
 * `.safeParse(...)` call's result (success or failure) is never actually
 * piped into anything the user or caller can observe. This is exactly the
 * shape of the original `StepForm.tsx` bug: a schema existed and *could*
 * have been parsed, but nothing downstream ever surfaced the outcome.
 *
 * A `.safeParse(` call is considered validated when, within a bounded
 * window of source AFTER the call, the file also calls one of:
 *   - `setFieldError(` / `setErrors(` / `setFieldErrors(` / any `set*Error(s)(`
 *     state setter (covers both the incremental per-field pattern and the
 *     legitimate "bulk-replace the whole errors map from the full parse
 *     result" pattern used by useFormShellState/StepForm/FormShellProvider)
 *   - `applyZodIssues(`
 *   - `throw new ValidationError(` (the server-action/API-route sink)
 *   - an `issues:` / `fieldErrors:` object-literal key (the full parse
 *     failure forwarded through a plain return-envelope, e.g.
 *     `return { ok: false, issues: result.error.issues }` or
 *     `errorJson(..., { issues: result.error.issues })`)
 *   - a bare `.error.issues` property read not immediately indexed
 *     (`result.error.issues ?? []` passed positionally) — deliberately
 *     excludes `.error.issues[0]`, which is the exact truncation bug this
 *     audit exists to catch, not a sink
 *   - `for (const issue of X.issues)` / `X.error.issues)` — iterating every
 *     issue (as opposed to indexing just the first) is itself evidence the
 *     full result is being surfaced, even when the loop body assigns into a
 *     plain object instead of calling one of the setter sinks above
 *   - `.flatten(` — Zod's own all-issues extraction method; like the loop
 *     case above, calling it is evidence of full (not first-only) surfacing
 *     even when the result flows out via an ES6 shorthand property
 *
 * Scope: src/ + appkit/src/ — server-side action/route files are IN scope;
 * `throw new ValidationError(` is an equally valid sink there.
 *
 * Per-occurrence escape hatch: `// audit-unvalidated-safeparse-ok: <reason>`
 * on the same line as `.safeParse(` or the line immediately before/after.
 * Legitimate case: a `.safeParse()` used purely as a type-narrowing boolean
 * gate on an internal, non-user-facing value (not a form).
 *
 * Exit 0 — clean.
 * Exit 1 — unvalidated `.safeParse(` call sites found.
 *
 * Known limitation (documented, not a defect): this is a windowed-text
 * heuristic, not an AST/control-flow analysis — it can't prove the sink call
 * is actually reachable from this specific `.safeParse()`'s branch, only
 * that one appears nearby in the source. Consistent with the precedent set
 * by the other regex-based audits in this registry.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const ALLOW = [
  // Defines applyZodIssues/useFormShellState themselves — not a validation callsite.
  join(ROOT, "appkit", "src", "ui", "forms", "FormShell.tsx"),
  // Defines the generic validateRequestBody(schema, body) helper, which returns
  // the full ZodError to ITS caller — the real validation callsite is wherever
  // that caller consumes the result, not here. Same reasoning as FormShell.tsx above.
  join(ROOT, "appkit", "src", "validation", "schemas.ts"),
  join(ROOT, "src", "validation", "request-schemas.ts"),
];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const EXTS = new Set([".ts", ".tsx"]);
const SUPPRESS_RE = /\/\/\s*audit-unvalidated-safeparse-ok\b/;
const SINK_RE =
  /\bset[A-Za-z]*[Ee]rrors?\s*\(|\bapplyZodIssues\s*\(|\bthrow\s+new\s+ValidationError\s*\(|\bissues\s*:|\bfieldErrors\s*:|\.error\.issues\b(?!\s*\[)|for\s*\(\s*const\s+\w+\s+of\s+[\w.]+\.issues\b|\.flatten\s*(?:\?\.)?\s*\(/;
const WINDOW_LINES = 25;

// Test files call .safeParse() to exercise a schema's own behavior — there is
// no "form" and no user-facing validation surface to pipe a result into, so
// they are out of scope entirely (not a suppression-marker case — there is
// nothing here to suppress, the pattern this audit targets doesn't apply).
const TEST_FILE_RE = /(\.test\.[jt]sx?$|[/\\]__tests__[/\\])/;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if ([...EXTS].some((x) => e.name.endsWith(x)) && !TEST_FILE_RE.test(full)) out.push(full);
  }
  return out;
}

const violations = [];

for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    if (ALLOW.includes(file)) continue;
    const raw = readFileSync(file, "utf8");
    const rawLines = raw.split("\n");
    // Comment-stripped (but line-count-preserving) copy for match detection —
    // a `.safeParse()` or sink name mentioned in a doc comment / prose must
    // not be treated as real code. Suppression markers are themselves
    // comments, so they're checked against rawLines, not this copy.
    const codeOnly = raw
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
      .replace(/(^|[^:])\/\/[^\n]*/g, (_m, pre) => pre);
    const lines = codeOnly.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (!/\.safeParse\s*\(/.test(lines[i])) continue;

      const suppressed =
        SUPPRESS_RE.test(rawLines[i] ?? "") ||
        (i > 0 && SUPPRESS_RE.test(rawLines[i - 1] ?? "")) ||
        (i + 1 < rawLines.length && SUPPRESS_RE.test(rawLines[i + 1] ?? ""));
      if (suppressed) continue;

      const windowEnd = Math.min(lines.length, i + 1 + WINDOW_LINES);
      const window = lines.slice(i, windowEnd).join("\n");
      if (SINK_RE.test(window)) continue;

      const rel = relative(ROOT, file).replace(/\\/g, "/");
      violations.push(
        `${rel}:${i + 1} :: .safeParse( result not piped into setFieldError/setErrors/applyZodIssues/throw ValidationError within ${WINDOW_LINES} lines`,
      );
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-unvalidated-safeparse] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

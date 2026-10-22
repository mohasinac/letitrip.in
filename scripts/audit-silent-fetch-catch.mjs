#!/usr/bin/env node
/**
 * audit-silent-fetch-catch.mjs — silent `.catch(() => {})` swallowing fetch errors.
 *
 * Dashboard pages that do `fetch(...).catch(() => {})` silently drop 4xx/5xx
 * responses on the floor. The user sees the page render with stat cards
 * displaying "—" or empty lists, and has no way to tell whether the data is
 * legitimately empty or whether the API returned 401/500.
 *
 * Root cause this prevents:
 *   admin/dashboard/page.tsx swallowed errors from /api/admin/orders,
 *   /api/admin/payouts, etc. When an admin's session cookie expired, every
 *   stat became "—" with no banner or toast — the user thought the database
 *   was down. Replaced with `.catch((err) => setLoadError(err))` plus a
 *   visible banner and a toast for 5xx.
 *
 * Correct:
 *   fetch("/api/admin/orders").catch((err) => {
 *     setLoadError(err.message);
 *     showToast("Couldn't load orders", "error");
 *   });
 *
 * Wrong:
 *   fetch("/api/admin/orders").catch(() => {});
 *
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SEARCH_DIRS = [
  join(ROOT, "src"),
  join(ROOT, "appkit", "src"),
];

// Matches `.catch(() => {})` or `.catch(() => {  })` — empty-arrow swallow.
const SILENT_CATCH_RE = /\.catch\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)/g;

function listFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === ".next") continue;
      out.push(...listFiles(full));
    } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      // Skip test files
      if (full.includes("__tests__") || full.endsWith(".test.ts") || full.endsWith(".test.tsx")) continue;
      out.push(full);
    }
  }
  return out;
}

/**
 * Replace every comment with a filler character, preserving length and newlines.
 *
 * 🛑 THE FILLER IS NOT WHITESPACE, and that is load-bearing. Blanking to
 * spaces turns
 *
 *     .catch(() => {
 *        // nothing to do here
 *     })
 *
 * into an empty arrow body, so the pattern starts matching and the audit went
 * 1 → 9 violations. Those 9 are arguably real — a comment is not a handler —
 * but that is a deliberate WIDENING of the rule, not the false-positive fix
 * this function exists for, and it should be landed on its own with its own
 * triage. A non-space filler keeps the body non-empty, so behaviour is
 * identical to before except that prose no longer matches.
 *
 * 🛑 A `.catch(() => {})` QUOTED IN PROSE is not a silent catch. Measured
 * 2026-10-22: the only violation this audit reported was
 * `refunds/actions.ts:486`, a comment reading *"This read `.catch(() => {})`
 * with no `.then`"* — i.e. a note explaining that the swallow had been FIXED.
 * The audit was reporting the documentation of its own resolved finding.
 *
 * Length is preserved rather than the text removed, so the reported line
 * number and the same-line marker lookup both still land correctly — which
 * is why this blanks rather than strips.
 *
 * String literals are deliberately NOT protected: a `"//"` inside a string
 * would start a fake comment here. It is a real limitation, and the trade is
 * right — a URL in a string is common but `.catch(() => {})` inside a string
 * literal is not, so the false-negative risk is far smaller than the
 * false-positive rate it removes.
 */
const FILL = "x";

function blankComments(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    if (src[i] === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (let k = i; k < stop; k++) out += src[k] === "\n" ? "\n" : FILL;
      i = stop;
      continue;
    }
    if (src[i] === "/" && src[i + 1] === "/") {
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? src.length : end;
      // Keep the marker readable — the allowlist checks the raw line text.
      const seg = src.slice(i, stop);
      out += seg.includes("audit-silent-catch-ok") ? seg : FILL.repeat(seg.length);
      i = stop;
      continue;
    }
    out += src[i];
    i++;
  }
  return out;
}

const violations = [];

for (const dir of SEARCH_DIRS) {
  try {
    statSync(dir);
  } catch {
    continue;
  }
  for (const file of listFiles(dir)) {
    const src = blankComments(readFileSync(file, "utf8"));
    SILENT_CATCH_RE.lastIndex = 0;
    let m;
    while ((m = SILENT_CATCH_RE.exec(src)) !== null) {
      const idx = m.index;
      // Allowlist: explicit "// audit-silent-catch-ok" marker on the same line
      const lineStart = src.lastIndexOf("\n", idx) + 1;
      const lineEnd = src.indexOf("\n", idx);
      const fullLine = src.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      if (fullLine.includes("audit-silent-catch-ok")) continue;
      const line = src.slice(0, idx).split("\n").length;
      violations.push({ file: relative(ROOT, file), line });
    }
  }
}

if (violations.length === 0) {
  console.log("✓ audit-silent-fetch-catch — no silent `.catch(() => {})` swallows.");
  process.exit(0);
}

console.error(`\n✗ audit-silent-fetch-catch — ${violations.length} violation(s) found:`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
}
console.error("\nReplace `.catch(() => {})` with a real handler that calls setError/showToast,");
console.error("or annotate the line with `// audit-silent-catch-ok: <reason>` if the swallow is intentional.\n");
process.exit(1);

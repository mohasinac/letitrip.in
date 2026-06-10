#!/usr/bin/env node
/**
 * audit-spinner-defaults.mjs — bare "Loading…" text strings in view components.
 *
 * View components in appkit and src/ that show a spinner default of plain
 * "Loading…" / "Loading..." text instead of the appkit <Skeleton> primitive
 * are a known UX bug: a perpetual spinner with no visible structure looks
 * stuck and prevents users from understanding what's loading.
 *
 * Root cause this prevents:
 *   EventParticipateView rendered a bare "Loading…" Div when isLoading=true
 *   and no renderSkeleton prop was passed. Users perceived this as the page
 *   never resolving — they couldn't tell if the form was about to load or
 *   if the request had hung. Replaced with <Skeleton> (3 shimmer rows).
 *
 * Correct:
 *   if (isLoading) {
 *     return (
 *       <Div className="space-y-4 py-6">
 *         <Skeleton variant="rectangular" height="32px" />
 *         <Skeleton variant="rectangular" height="80px" />
 *       </Div>
 *     );
 *   }
 *
 * Wrong:
 *   if (isLoading) return <Div>Loading…</Div>;
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

// Match a JSX text node of "Loading…" / "Loading..." / "Loading" as the
// SOLE content of a Div/div/section. Allowlist explicit Skeleton-bearing
// returns by checking for `Skeleton` in the surrounding 200 chars.
const LOADING_TEXT_RE = />\s*Loading\s*(?:…|\.{3,}|\.\.\.|)\s*</g;

function listFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === ".next") continue;
      out.push(...listFiles(full));
    } else if (full.endsWith(".tsx")) {
      out.push(full);
    }
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
    const src = readFileSync(file, "utf8");
    LOADING_TEXT_RE.lastIndex = 0;
    let m;
    const lines = src.split("\n");
    while ((m = LOADING_TEXT_RE.exec(src)) !== null) {
      const idx = m.index;
      const window = src.slice(Math.max(0, idx - 400), Math.min(src.length, idx + 200));
      // Allowlist: if Skeleton is referenced nearby, this is likely an
      // intentional fallback alongside the real Skeleton render.
      if (window.includes("Skeleton")) continue;
      // Allowlist: i18n strings — these are translation keys, not JSX.
      if (window.includes("t(") || window.includes("useTranslations")) continue;
      const line = src.slice(0, idx).split("\n").length;
      // Per-line suppression marker. Accepts `// audit-spinner-defaults-ok`
      // (TS comment) or `{/* audit-spinner-defaults-ok */}` (JSX comment).
      const lineText = lines[line - 1] || "";
      if (lineText.includes("audit-spinner-defaults-ok")) continue;
      violations.push({ file: relative(ROOT, file), line });
    }
  }
}

if (violations.length === 0) {
  console.log("✓ audit-spinner-defaults — no bare 'Loading…' text spinners in view components.");
  process.exit(0);
}

console.error(`\n✗ audit-spinner-defaults — ${violations.length} violation(s) found:`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
}
console.error(`\nReplace bare 'Loading…' text with the <Skeleton> primitive from appkit/src/ui/components/Skeleton.tsx.\n`);
process.exit(1);

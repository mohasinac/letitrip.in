#!/usr/bin/env node
/**
 * audit-content-alignment.mjs — site-wide alignment convention enforcement:
 * public-facing page content (headlines, subtitles, CTA copy, empty-state
 * messages) must be left-aligned, not centered. Navigation surfaces are the
 * opposite (right-aligned) but are a small, fixed set of layout components
 * reviewed by hand — this audit targets the much larger, easier-to-regress
 * surface: any `<Text>`/`<Heading>` or raw `text-center` className added to
 * a public feature component.
 *
 * Deliberately narrow heuristic (two unambiguous patterns only):
 *   1. `<Text ... align="center"` / `<Heading ... align="center"` — align is
 *      the only prop on these two primitives that maps directly to CSS
 *      text-align, so this is never a false positive.
 *   2. Raw `text-center` token inside a className string.
 *
 * NOT flagged (too ambiguous for a regex, would produce high-noise false
 * positives — left to manual review): `justify="center"` on Row/Stack/Grid
 * (could be centering a CTA block OR a small icon/spinner/badge — see
 * CLAUDE.md's alignment convention notes), and `align="center"` on
 * Row/Stack/Grid (in this component system that prop is the CROSS-axis —
 * i.e. vertical centering of an icon+label pair — never horizontal text
 * alignment, so it is intentionally out of scope everywhere, not just here).
 *
 * Scope: public marketing/listing feature directories only — NOT dashboard,
 * modal/dialog, toast, or primitive source directories, where centering is
 * still a legitimate, common pattern (confirmation dialogs, spinners, etc).
 *
 * Suppression: `// audit-content-alignment-ok: <reason>` on the same line or
 * the line above, for genuinely irreducible cases.
 *
 * Strict zero — locked 2026-08-12 after the nav-right/content-left sweep.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_FEATURE_DIRS = [
  "homepage",
  "products",
  "stores",
  "categories",
  "promotions",
  "reviews",
  "events",
  "blog",
  "classified",
  "digital-codes",
  "live",
  "pre-orders",
  "account",
  "search",
];

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__"]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;

const TEXT_HEADING_CENTER_RE = /<(?:Text|Heading)\b[^>]*\balign="center"/;
const RAW_TEXT_CENTER_RE = /\btext-center\b/;
const SUPPRESSION_RE = /audit-content-alignment-ok:/;

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (extname(entry.name) === ".tsx" && !SKIP_FILE_RE.test(entry.name)) files.push(full);
  }
  return files;
}

const violations = [];
for (const feature of SCAN_FEATURE_DIRS) {
  const dir = join(ROOT, "appkit", "src", "features", feature, "components");
  for (const file of walk(dir)) {
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasHit = TEXT_HEADING_CENTER_RE.test(line) || RAW_TEXT_CENTER_RE.test(line);
      if (!hasHit) continue;
      const suppressedHere = SUPPRESSION_RE.test(line);
      const suppressedAbove = i > 0 && SUPPRESSION_RE.test(lines[i - 1]);
      if (suppressedHere || suppressedAbove) continue;
      violations.push(`${relative(ROOT, file).replace(/\\/g, "/")}:${i + 1}`);
    }
  }
}

const BASELINE = 0;

if (violations.length <= BASELINE) {
  console.log(`audit-content-alignment: clean ✓ (${violations.length}/${BASELINE})`);
  process.exit(0);
}

console.error(`audit-content-alignment: ${violations.length} centered content hit(s) in public feature directories (baseline ${BASELINE}).`);
console.error("Fix: drop align=\"center\" (left is the default) or change text-center to text-left.");
console.error("Suppress only genuinely irreducible cases with // audit-content-alignment-ok: <reason>.\n");
for (const f of violations) console.error(`  ${f}`);
process.exit(1);

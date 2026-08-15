#!/usr/bin/env node
/**
 * audit-icon-label-split.mjs — catches an icon+label nav pattern where the
 * label's own `align` prop right-aligns (or centers) it away from a
 * `shrink-0` icon pinned on the preceding line, inside a `flex-1` growing
 * cell. Visually this splits the icon from its label the wider the
 * container — the icon stays pinned to one edge, the label drifts to the
 * opposite edge, instead of the two reading as one grouped unit.
 *
 * Real-world instance (2026-08-15): all 3 dashboard sidebar `NavLink`
 * components had this exact shape:
 *
 *   {item.icon && <Span size="base" className="shrink-0 ...">{item.icon}</Span>}
 *   <Span align="end" className="flex-1 truncate">{item.label}</Span>
 *
 * introduced by a single mechanical commit. Confirmed via full-repo grep
 * this is the ONLY place the pattern occurs — every other `align="end"` in
 * the codebase is a legitimate right-aligned price/timestamp/badge, not an
 * icon+label pair, so the heuristic below only fires on the specific
 * two-line icon-then-label shape, not on `align="end"` generally.
 *
 * Heuristic (two consecutive lines):
 *   1. A line containing `shrink-0` AND (an icon-holder className token like
 *      `opacity-` OR the literal `.icon` prop access) — the icon span.
 *   2. The immediately following non-blank line contains `flex-1` AND
 *      `align="end"` or `align="center"` on a `<Span`/`<Text`.
 *
 * Suppression: `// audit-icon-label-split-ok: <reason>` on the label line
 * or the line above, for genuine cases (e.g. a deliberately right-aligned
 * label in a RTL or numeric-badge context).
 *
 * Strict zero.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__"]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;

const ICON_LINE_RE = /shrink-0/;
const LABEL_LINE_RE = /<(?:Span|Text)\b[^>]*\bflex-1\b[^>]*\balign="(?:end|center)"|<(?:Span|Text)\b[^>]*\balign="(?:end|center)"[^>]*\bflex-1\b/;
const SUPPRESSION_RE = /audit-icon-label-split-ok:/;

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

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length - 1; i++) {
      if (!ICON_LINE_RE.test(lines[i])) continue;
      // Find the next non-blank line (usually i+1, but tolerate one blank line).
      let j = i + 1;
      if (lines[j] !== undefined && lines[j].trim() === "") j++;
      const labelLine = lines[j];
      if (labelLine === undefined || !LABEL_LINE_RE.test(labelLine)) continue;
      if (SUPPRESSION_RE.test(labelLine) || SUPPRESSION_RE.test(lines[j - 1] ?? "")) continue;
      violations.push({
        file: relative(ROOT, file).replace(/\\/g, "/"),
        line: j + 1,
        text: labelLine.trim().slice(0, 100),
      });
    }
  }
}

if (violations.length === 0) {
  console.log("audit-icon-label-split: clean ✓");
  process.exit(0);
}

console.error(`audit-icon-label-split: ${violations.length} icon+label split hit(s) found.\n`);
console.error(
  "A label's align=\"end\"/\"center\" inside a flex-1 cell, immediately after a shrink-0 icon span,\n" +
    "visually separates the icon from its label instead of grouping them. Drop the align prop\n" +
    "(the flex-1 cell already left-aligns text by default).\n",
);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.text}`);
}
process.exit(1);

#!/usr/bin/env node
/**
 * audit-select-wrapper-classname.mjs
 *
 * The shared `<Select>` primitive (appkit/src/ui/components/Select.tsx) wraps
 * the real `<select>` in an outer `.appkit-select` div — that outer div is the
 * actual flex/grid child when `<Select>` sits inside a Row/flex container.
 * `className` only ever reaches the inner `<select>`, so a caller passing a
 * sizing/flex-control utility via `className` (intending to constrain the
 * Select's width in a flex row) gets silently ignored: the wrapper's own
 * `width: 100%` wins, and the Select balloons while its flex siblings get
 * squeezed. Use the dedicated `wrapperClassName` prop for sizing instead.
 *
 * Strict-zero — no legitimate case puts a sizing/flex-control token on
 * `<Select>`'s `className`. No suppression marker exists for this audit; if a
 * genuine exception ever surfaces, add one and register it in
 * scripts/audit-no-suppression-comments.mjs's SUPPRESSION_MARKERS.
 *
 * Exits 0 when violations === 0, 1 on any regression.
 */

const BASELINE = 0;
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "__tests__",
  "__mocks__",
  "scripts",
  "seed",
]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;

// Select.tsx itself defines the primitive — its own internal usage is exempt.
const SELECT_SOURCE_FILE = join(ROOT, "appkit", "src", "ui", "components", "Select.tsx");

const SELECT_OPENER_RE = /<Select\b([^>]*?)(?=\/?>)/g;
const CLASSNAME_RE = /(?<!wrapper)className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/;
const BARE_PROP_RE = /\bbare\b(?:\s*=\s*\{?\s*(?:true)?\s*\}?)?/;
const WRAPPER_CLASSNAME_RE = /\bwrapperClassName\s*=/;

const SIZING_TOKEN_RES = [
  /\bflex-shrink(-0)?\b/,
  /\bshrink(-0)?\b/,
  /\bflex-grow\b/,
  /\bgrow-0\b/,
  /\bflex-1\b/,
  /\bflex-none\b/,
  /\bbasis-\S+/,
  /\bmin-w-\S+/,
  /\bmax-w-\S+/,
  /\bw-\d+\b/,
  /\bw-\[[^\]]+\]/,
];

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (!entry.name.endsWith(".tsx") && !entry.name.endsWith(".jsx")) continue;
    if (SKIP_FILE_RE.test(entry.name)) continue;
    if (full === SELECT_SOURCE_FILE) continue;
    files.push(full);
  }
  return files;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");
    if (!text.includes("<Select")) continue;
    const lines = text.split("\n");

    for (const match of text.matchAll(SELECT_OPENER_RE)) {
      const [, attrs] = match;
      if (BARE_PROP_RE.test(attrs)) continue; // bare mode: className already lands on the real flex child
      if (WRAPPER_CLASSNAME_RE.test(attrs)) continue; // already sizing the wrapper correctly

      const cls = CLASSNAME_RE.exec(attrs);
      if (!cls) continue;
      const classValue = cls[1] ?? cls[2] ?? cls[3] ?? cls[4] ?? cls[5] ?? "";
      if (!classValue.trim()) continue;

      const offending = SIZING_TOKEN_RES.filter((rx) => rx.test(classValue));
      if (offending.length === 0) continue;

      const before = text.slice(0, match.index ?? 0);
      const lineIdx = before.split("\n").length - 1;

      violations.push({
        file: relative(ROOT, file).replace(/\\/g, "/"),
        line: lineIdx + 1,
        classValue: classValue.slice(0, 120),
        token: classValue.match(offending[0])?.[0] ?? "",
      });
    }
  }
}

if (violations.length <= BASELINE) {
  console.log(
    violations.length === 0
      ? "audit-select-wrapper-classname: clean ✓"
      : `audit-select-wrapper-classname: ${violations.length}/${BASELINE} (within baseline; drive to 0)`,
  );
  process.exit(0);
}

console.error(
  `audit-select-wrapper-classname: REGRESSION — ${violations.length} <Select> site(s) carry a sizing/flex-control token in className instead of wrapperClassName (baseline ${BASELINE}, over by ${violations.length - BASELINE}).\n`,
);
for (const v of violations.slice(0, 20)) {
  console.error(`  ${v.file}:${v.line}  [${v.token}]  className="${v.classValue}"`);
}
if (violations.length > 20) {
  console.error(`  … and ${violations.length - 20} more`);
}
console.error(
  "\n  Fix: move the sizing/flex-control token(s) to the wrapperClassName prop — className only styles the inner <select>; wrapperClassName sizes the actual flex-child wrapper div.",
);
process.exit(1);

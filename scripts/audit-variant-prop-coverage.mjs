#!/usr/bin/env node
/**
 * audit-variant-prop-coverage.mjs
 *
 * Catches the most insidious bypass of the variant catalogue: a primitive
 * (`<Stack>`, `<Card>`, `<Text>`, etc.) carrying a `className=` that includes
 * a token covered by one of its own variant props. The audit reads
 * `scripts/variant-catalogue.mjs` for the primitive list + forbidden-utility
 * tokens, then scans every `.tsx` file outside the primitive source dirs.
 *
 * Baseline-drift mode while the consumer sweep is in flight — today's count
 * (BASELINE) is the cap; only regressions block. Drive the number to 0 as
 * the sweep replaces ad-hoc className strings with variant props. Suppression
 * marker `// audit-variant-ok: <reason>` recognised on the same line or the
 * previous line (mandatory reason after the colon).
 *
 * Exits 0 when violations ≤ baseline, 1 on regression.
 */

// Baseline locked 2026-06-14 at the variant-catalogue rollout. The number is
// the per-callsite count across both src/ and appkit/src/ excluding primitive
// source dirs. Tighten this number whenever the sweep drives the count down;
// the audit will block any regression.
const BASELINE = 949;
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import {
  FORBIDDEN_UTILITY_TOKENS,
  PRIMITIVE_SOURCE_DIRS,
  PRIMITIVE_TAGS,
  VARIANT_OK_MARKER,
} from "./variant-catalogue.mjs";

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

/** Single regex that captures every primitive JSX element's opening tag + attribute slice. */
const PRIMITIVE_OPENER_RE = new RegExp(
  `<(${PRIMITIVE_TAGS.join("|")})\\b([^>]*?)(?=/?>)`,
  "g",
);

const CLASSNAME_RE = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/;

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
    if (PRIMITIVE_SOURCE_DIRS.some((rx) => rx.test(full))) continue;
    files.push(full);
  }
  return files;
}

function suppressed(lineIdx, lines) {
  return (
    VARIANT_OK_MARKER.test(lines[lineIdx]) ||
    (lineIdx > 0 && VARIANT_OK_MARKER.test(lines[lineIdx - 1]))
  );
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");
    if (!PRIMITIVE_TAGS.some((tag) => text.includes(`<${tag}`))) continue;
    const lines = text.split("\n");

    for (const match of text.matchAll(PRIMITIVE_OPENER_RE)) {
      const [opener, tagName, attrs] = match;
      if (!attrs.includes("className")) continue;
      const cls = CLASSNAME_RE.exec(attrs);
      if (!cls) continue;
      const classValue = cls[1] ?? cls[2] ?? cls[3] ?? cls[4] ?? cls[5] ?? "";
      if (!classValue.trim()) continue;

      const offending = FORBIDDEN_UTILITY_TOKENS.filter((rx) => rx.test(classValue));
      if (offending.length === 0) continue;

      const before = text.slice(0, match.index ?? 0);
      const lineIdx = before.split("\n").length - 1;
      if (suppressed(lineIdx, lines)) continue;

      violations.push({
        file: relative(ROOT, file).replace(/\\/g, "/"),
        line: lineIdx + 1,
        tag: tagName,
        classValue: classValue.slice(0, 120),
        // Surface the first matched token to the developer.
        token: classValue.match(offending[0])?.[0] ?? "",
      });
    }
  }
}

if (violations.length <= BASELINE) {
  const lead =
    violations.length === 0
      ? "clean ✓"
      : `${violations.length}/${BASELINE} (within baseline; drive to 0)`;
  console.log(
    `audit-variant-prop-coverage: ${lead} (scanned ${PRIMITIVE_TAGS.length} primitive tags)`,
  );
  // When the count drops below the recorded baseline, surface a hint so the
  // operator can tighten BASELINE in this file.
  if (violations.length > 0 && violations.length < BASELINE) {
    console.log(
      `  Tip: tighten BASELINE in scripts/audit-variant-prop-coverage.mjs to ${violations.length}.`,
    );
  }
  process.exit(0);
}

console.error(
  `audit-variant-prop-coverage: REGRESSION — ${violations.length} primitive(s) carry a className token that belongs in a variant prop (baseline ${BASELINE}, over by ${violations.length - BASELINE}).\n`,
);
const grouped = new Map();
for (const v of violations) {
  if (!grouped.has(v.tag)) grouped.set(v.tag, []);
  grouped.get(v.tag).push(v);
}
for (const [tag, vs] of grouped) {
  console.error(`  <${tag}> — ${vs.length} site(s)`);
  for (const v of vs.slice(0, 8)) {
    console.error(`    ${v.file}:${v.line}  [${v.token}]  className="${v.classValue}"`);
  }
  if (vs.length > 8) {
    console.error(`    … and ${vs.length - 8} more`);
  }
}
console.error(
  "\n  Fix: move the className token to the matching variant prop (color / surface / padding / gap / rounded / shadow / border / align / justify / size / weight / gradient).\n  Suppress with `// audit-variant-ok: <reason>` only when the dynamic className genuinely can't be expressed as a variant.",
);
process.exit(1);

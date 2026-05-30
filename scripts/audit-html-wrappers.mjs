#!/usr/bin/env node
/**
 * audit-html-wrappers — raw HTML vs appkit primitives + redundant wrapper detector.
 *
 * Rules:
 *   RAW_HEADING   — <h1>–<h6> in component files; use <Heading> from appkit.
 *   RAW_PARAGRAPH — <p> in component files; use <Text> from appkit.
 *   RAW_SECTION   — <section> in component files; use <Section> from appkit.
 *   BARE_DIV      — <div> on its own line with no attributes; likely a redundant wrapper.
 *   RAW_DIV       — <div ...> with attributes in feature views; use <Div>/<Stack>/<Row>/<Container>
 *                   from appkit (baseline-drift: only regressions above current count block).
 *
 * Scans .tsx files in src/ and appkit/src/ (JSX component files only).
 * Skips: node_modules, .next, seed/, repositories/, scripts/, __tests__, configs/, *.d.ts,
 * ui/components (primitive implementations), _internal/server feature og.tsx (Satori OG images).
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "seed",
  "repositories",
  "scripts",
  "__tests__",
  "__mocks__",
  "configs",
  "contracts",
  "validators",
]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;
// Skip the UI primitive implementations — they define the wrappers themselves.
// Also skip Satori-rendered OG images (server/features/**/og.tsx, og-layout.tsx),
// ErrorBoundary files (must render before React tree is ready), and the
// shared Layout.tsx (defines Stack/Row/Container/Section/Grid themselves).
const SKIP_PATH_RE = /[/\\]ui[/\\](?:components|forms|rich-text)[/\\]|[/\\]_internal[/\\]server[/\\]features[/\\][^/\\]+[/\\]og(?:-layout)?\.tsx$|ErrorBoundary\.tsx$/;

const RULES = [
  {
    id: "RAW_HEADING",
    // Match <h1 through <h6 followed by space, >, or /
    re: /<h[1-6][\s>/]/,
    message: "Use <Heading> from appkit instead of raw heading tag (<h1>–<h6>)",
    fix: "import { Heading } from '@mohasinac/appkit'",
  },
  {
    id: "RAW_PARAGRAPH",
    // Match <p followed by space or > but not <pre, <progress, <param, <path
    re: /<p[\s>]/,
    exclude: /<p(?:re|ro|a|at|l|s|h)/,
    message: "Use <Text> from appkit instead of raw <p> tag",
    fix: "import { Text } from '@mohasinac/appkit'",
  },
  {
    id: "RAW_SECTION",
    re: /<section[\s>/]/,
    message: "Use <Section> from appkit instead of raw <section> tag",
    fix: "import { Section } from '@mohasinac/appkit'",
  },
  {
    id: "BARE_DIV",
    // <div> with no attributes on its own line — classic pointless wrapper
    re: /^\s*<div>\s*$/,
    message: "Bare <div> with no props — likely a redundant wrapper; use <> or <Div>/<Container>",
    fix: "Replace with React.Fragment <> or remove; use <Div>/<Container>/<Stack> from appkit for layout",
  },
  {
    id: "RAW_DIV",
    // <div with at least one attribute. Excludes <div> (caught by BARE_DIV) and </div>.
    re: /<div\s/,
    message: "Use <Div>/<Stack>/<Row>/<Container>/<Section> from appkit instead of raw <div ...>",
    fix: "Replace with appkit primitive: surface/padding/border props for chrome, Stack/Row for flex layouts, Grid for grids",
    baselineDrift: true,
  },
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
    } else if (extname(entry.name) === ".tsx" && !SKIP_FILE_RE.test(entry.name) && !SKIP_PATH_RE.test(full)) {
      files.push(full);
    }
  }
  return files;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comments and import lines
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
      if (trimmed.startsWith("import ")) continue;

      for (const rule of RULES) {
        if (!rule.re.test(line)) continue;
        if (rule.exclude && rule.exclude.test(line)) continue;
        violations.push({
          rule: rule.id,
          file: relative(ROOT, file),
          line: i + 1,
          text: trimmed.slice(0, 100),
          message: rule.message,
          fix: rule.fix,
          baselineDrift: !!rule.baselineDrift,
        });
        // First-match wins per line: BARE_DIV and RAW_DIV are mutually exclusive
        // (different regexes), but if a future rule overlaps we don't want
        // double-counting.
        break;
      }
    }
  }
}

// Per-rule baselines. Rules without an entry default to 0 (hard-block on any).
// RAW_DIV is on a baseline-drift policy: today's count is the cap; lower is fine,
// higher fails. Drive this down to 0 as feature views adopt <Div>/<Stack>/<Row>.
const BASELINES = {
  RAW_HEADING: 0,
  RAW_PARAGRAPH: 0,
  RAW_SECTION: 0,
  BARE_DIV: 0,
  // RAW_DIV baseline = current count of raw <div ...> in feature views.
  // Tightened 2026-05-30 (Phase E cont. 2 — misc components sweep): 124 actual (-11 from 135).
  // Drive this down by replacing raw <div className="..."> with appkit primitives:
  //   - flex/grid layouts → <Stack>/<Row>/<Grid>
  //   - bordered/padded chrome → <Div surface=... padding=... border=...>
  //   - page-level wrappers → <Container>/<Section>
  RAW_DIV: 124,
};

const hardBlocking = violations.filter((v) => !v.baselineDrift);
const drift = violations.filter((v) => v.baselineDrift);

const driftByRule = new Map();
for (const v of drift) {
  driftByRule.set(v.rule, (driftByRule.get(v.rule) || 0) + 1);
}

const regressions = [];
for (const [rule, count] of driftByRule) {
  const baseline = BASELINES[rule] ?? 0;
  if (count > baseline) regressions.push({ rule, count, baseline, over: count - baseline });
}

if (hardBlocking.length === 0 && regressions.length === 0) {
  // Report drift status (informational, not blocking)
  const driftStatus = [...driftByRule.entries()]
    .map(([r, c]) => `${r}=${c}/${BASELINES[r] ?? 0}`)
    .join(", ");
  console.log(`audit-html-wrappers: clean ✓${driftStatus ? ` (drift: ${driftStatus})` : ""}`);
  process.exit(0);
}

// Group by rule for readable output
const byRule = Map.groupBy
  ? Map.groupBy(violations, (v) => v.rule)
  : violations.reduce((m, v) => { m.set(v.rule, [...(m.get(v.rule) || []), v]); return m; }, new Map());

const out = [];
for (const [rule, vs] of byRule) {
  const baseline = BASELINES[rule] ?? 0;
  const status = vs[0].baselineDrift
    ? (vs.length > baseline ? ` — REGRESSION (baseline ${baseline}, +${vs.length - baseline})` : ` — within baseline ${baseline}`)
    : "";
  out.push(`[${rule}] ${vs[0].message} (${vs.length} instance${vs.length === 1 ? "" : "s"})${status}`);
  out.push(`  Fix: ${vs[0].fix}`);
  // Only print sample lines when this rule is actually blocking
  const blocking = !vs[0].baselineDrift || vs.length > baseline;
  if (blocking) {
    for (const v of vs.slice(0, 8)) {
      out.push(`  ${v.file}:${v.line}  ${v.text}`);
    }
    if (vs.length > 8) out.push(`  … and ${vs.length - 8} more`);
  }
  out.push("");
}

if (hardBlocking.length === 0 && regressions.length === 0) {
  process.stdout.write(out.join("\n"));
  process.exit(0);
}

process.stderr.write(out.join("\n") + "\n");
if (hardBlocking.length > 0) {
  process.stderr.write(`audit-html-wrappers: ${hardBlocking.length} hard-blocking violation(s).\n`);
}
for (const r of regressions) {
  process.stderr.write(`audit-html-wrappers: ${r.rule} regressed +${r.over} above baseline ${r.baseline} (now ${r.count}).\n`);
}
process.exit(1);

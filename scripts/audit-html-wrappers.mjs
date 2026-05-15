#!/usr/bin/env node
/**
 * audit-html-wrappers — raw HTML vs appkit primitives + redundant wrapper detector.
 *
 * Rules:
 *   RAW_HEADING   — <h1>–<h6> in component files; use <Heading> from appkit.
 *   RAW_PARAGRAPH — <p> in component files; use <Text> from appkit.
 *   RAW_SECTION   — <section> in component files; use <Section> from appkit.
 *   BARE_DIV      — <div> on its own line with no attributes; likely a redundant wrapper.
 *
 * Scans .tsx files in src/ and appkit/src/ (JSX component files only).
 * Skips: node_modules, .next, seed/, repositories/, scripts/, __tests__, configs/, *.d.ts.
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
    } else if (extname(entry.name) === ".tsx" && !SKIP_FILE_RE.test(entry.name)) {
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
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("audit-html-wrappers: 0 violations ✓");
  process.exit(0);
}

// Group by rule for readable output
const byRule = Map.groupBy
  ? Map.groupBy(violations, (v) => v.rule)
  : violations.reduce((m, v) => { m.set(v.rule, [...(m.get(v.rule) || []), v]); return m; }, new Map());

const out = [`audit-html-wrappers: ${violations.length} violation(s) found.\n`];
for (const [rule, vs] of byRule) {
  out.push(`[${rule}] ${vs[0].message} (${vs.length} instance${vs.length === 1 ? "" : "s"})`);
  out.push(`  Fix: ${vs[0].fix}`);
  for (const v of vs.slice(0, 8)) {
    out.push(`  ${v.file}:${v.line}  ${v.text}`);
  }
  if (vs.length > 8) out.push(`  … and ${vs.length - 8} more`);
  out.push("");
}

process.stderr.write(out.join("\n") + "\n");
process.exit(1);

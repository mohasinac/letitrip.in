#!/usr/bin/env node
/**
 * audit-typography.mjs — Enforce appkit Typography primitives
 *
 * Catches raw HTML elements that should use appkit primitives:
 *   <ANY className="text-sm/font-bold/text-zinc-*"> → use appkit <Text>, <Span>, <Heading>, <Button>
 *   <strong> / <b>                  → <Span weight="bold">
 *   <p className="...">             → <Text>
 *   <h1>...<h6>                     → <Heading level={N}>
 *   <em>                            → <Span className="italic">
 *   <small>                         → <Caption> or <Text size="xs">
 *   <button>                        → <Button> (appkit primitive)
 *
 * Baseline mode: violations at or below baseline pass; regressions block.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DIRS = [
  join(ROOT, "appkit", "src"),
  join(ROOT, "src"),
];

const IGNORE_DIRS = ["node_modules", ".next", "dist", "__tests__", "scripts"];
const EXTENSIONS = [".tsx", ".jsx"];

// Files where raw HTML is acceptable (rich text renderers, markdown, etc.)
const ALLOWLIST = [
  "RichTextRenderer.tsx",
  "RichText.tsx",
  "RichTextEditor.tsx",
  "index.style.css",
  // Dev-only admin tooling — rich diagnostic UI; raw HTML acceptable.
  "SeedPanel.tsx",
  "DevToolbar.tsx",
];

// File-name patterns where raw HTML is acceptable (internal documentation)
const ALLOWLIST_PATTERNS = [
  /GuideView\.tsx$/,         // Admin/seller/buyer guide documentation pages
  /GuideHubView\.tsx$/,      // Guide hub landing pages
];

// ── Patterns ─────────────────────────────────────────────────────────────────
// Each rule: { id, label, regex, baseline }
// regex runs per-line on TSX source (outside comments/strings is best-effort)

const TYPOGRAPHY_CLASSES = "text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|font-(?:normal|medium|semibold|bold|extrabold|black|light|thin)|text-(?:zinc|slate|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)";

const RULES = [
  // ── Catch-all: ANY lowercase HTML element with typography/color classes ────
  {
    id: "HTML_TYPOGRAPHY_CLASSES",
    label: "Raw HTML element with typography/color classes (use appkit <Text>, <Span>, <Heading>, <Button>)",
    // Matches <div>, <span>, <button>, <td>, <li>, <label>, <section>, <a>, etc.
    // Excludes PascalCase components (appkit primitives like <Span>, <Text>, <Button>)
    regex: new RegExp(`<[a-z][a-z0-9]*\\s[^>]*className[^>]*(?:${TYPOGRAPHY_CLASSES})`),
    // Tightened P4 (2026-06-08): 178 actual after Action/Nav PermissionsManager table primitives (-12).
    baseline: 178,
  },
  {
    id: "APPKIT_SPAN_RAW_CLASSES",
    label: "Appkit <Span> using raw Tailwind size/weight classes in className instead of size/weight props",
    // Only flag text-xs/sm/base/lg/xl and font-medium/semibold/bold in className.
    // Color classes (text-zinc-*, etc.) can legitimately remain in className when no exact token match exists.
    regex: /(<Span\s[^>]*className\s*=\s*["'{][^"'>]*(text-(?:xs|sm|base|lg|xl)\b|font-(?:normal|medium|semibold|bold)))/,
    // Tightened 2026-05-30 (Phase H): 0 actual — all Span size/weight classes converted to props.
    baseline: 0,
  },
  // ── Raw semantic elements that have a direct appkit replacement ────────────
  {
    id: "RAW_STRONG",
    label: "Raw <strong> (use <Span weight=\"bold\"> or <Span weight=\"semibold\">)",
    regex: /<strong[\s>]/,
    baseline: 0,
  },
  {
    id: "RAW_P_TAG",
    label: "Raw <p> tag (use <Text>)",
    regex: /<p\s+className/,
    // Tightened 2026-05-23: 0 actual vs prior 3.
    baseline: 0,
  },
  {
    id: "RAW_HEADING",
    label: "Raw <h1>-<h6> (use <Heading level={N}>)",
    regex: /<h[1-6][\s>]/,
    baseline: 0,
  },
  {
    id: "RAW_SMALL",
    label: "Raw <small> (use <Caption> or <Text size=\"xs\">)",
    regex: /<small[\s>]/,
    baseline: 0,
  },
  {
    id: "RAW_B_TAG",
    label: "Raw <b> (use <Span weight=\"bold\">)",
    regex: /<b[\s>]/,
    baseline: 0,
  },
  {
    id: "RAW_EM",
    label: "Raw <em> (use <Span className=\"italic\">)",
    regex: /<em[\s>]/,
    // Tightened 2026-05-23: 0 actual vs prior 2.
    baseline: 0,
  },
  {
    id: "RAW_BUTTON",
    label: "Raw <button> (use appkit <Button>)",
    regex: /<button[\s>]/,
    // Tightened 2026-05-30 (Phase G): 0 actual — all 16 raw buttons converted to <Button>.
    baseline: 0,
  },
];

// ── Scanner ──────────────────────────────────────────────────────────────────

function walkFiles(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (IGNORE_DIRS.includes(entry)) continue;
    const stat = statSync(full, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isDirectory()) {
      results.push(...walkFiles(full));
    } else if (EXTENSIONS.some(ext => entry.endsWith(ext))) {
      if (ALLOWLIST.includes(entry)) continue;
      if (ALLOWLIST_PATTERNS.some(rx => rx.test(entry))) continue;
      results.push(full);
    }
  }
  return results;
}

function isInsideComment(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
}

function isInsideString(line, matchIndex) {
  // Rough heuristic: if the match is inside a template literal or string
  const before = line.slice(0, matchIndex);
  const singleQuotes = (before.match(/'/g) || []).length;
  const doubleQuotes = (before.match(/"/g) || []).length;
  const backticks = (before.match(/`/g) || []).length;
  return (singleQuotes % 2 !== 0) || (doubleQuotes % 2 !== 0) || (backticks % 2 !== 0);
}

// Extra filter for RAW_B_TAG to avoid false positives
// <b> matches things like <button, <br, <body — need exact match
function isRealBTag(line, match) {
  const idx = line.indexOf(match);
  if (idx < 0) return false;
  const afterB = line[idx + 2];
  // <b> or <b  (space) — real b tag
  return afterB === ">" || afterB === " " || afterB === "\n" || afterB === "\t";
}

const violations = {};
for (const rule of RULES) violations[rule.id] = [];

for (const dir of DIRS) {
  const files = walkFiles(dir);
  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isInsideComment(line)) continue;

      for (const rule of RULES) {
        const match = rule.regex.exec(line);
        if (!match) continue;
        if (isInsideString(line, match.index)) continue;

        // Extra validation for <b> to avoid <button, <br, etc.
        if (rule.id === "RAW_B_TAG" && !isRealBTag(line, match[0])) continue;

        const rel = relative(ROOT, file).replace(/\\/g, "/");
        violations[rule.id].push({
          file: rel,
          line: i + 1,
          text: line.trim().slice(0, 100),
        });
      }
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────

const verbose = process.argv.includes("--verbose");
const strict = process.argv.includes("--strict");
let totalViolations = 0;
let totalBaseline = 0;
let hasRegression = false;

for (const rule of RULES) {
  const hits = violations[rule.id];
  totalViolations += hits.length;
  totalBaseline += rule.baseline;

  if (hits.length > rule.baseline) {
    hasRegression = true;
    console.error(`\n[${rule.id}] ${hits.length} violation(s) — REGRESSION (baseline ${rule.baseline}):`);
    for (const v of hits.slice(0, 10)) {
      console.error(`  ${v.file}:${v.line} — ${v.text}`);
    }
    if (hits.length > 10) console.error(`  ... and ${hits.length - 10} more`);
  } else if (verbose || strict) {
    if (hits.length > 0) {
      console.log(`\n[${rule.id}] ${hits.length} violation(s) — within baseline ${rule.baseline}:`);
      if (verbose) {
        for (const v of hits.slice(0, 5)) {
          console.log(`  ${v.file}:${v.line} — ${v.text}`);
        }
        if (hits.length > 5) console.log(`  ... and ${hits.length - 5} more`);
      }
    }
  }
}

console.log("");

if (hasRegression) {
  console.error(`audit-typography: ${totalViolations} violation(s) — REGRESSION above baseline. Fix new raw HTML text elements.`);
  process.exit(1);
} else {
  console.log(`audit-typography: ${totalViolations} violation(s) (baseline ${totalBaseline}). No regression.`);
  if (totalViolations > 0 && !verbose) {
    console.log(`  Run with --verbose to see details.`);
  }
}

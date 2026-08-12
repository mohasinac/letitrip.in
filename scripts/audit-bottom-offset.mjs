#!/usr/bin/env node
/**
 * audit-bottom-offset.mjs — Enforce --bottom-nav-height for fixed/sticky bottom offsets
 *
 * Mirrors audit-sticky-offsets.mjs but for the bottom edge. BottomNavLayout
 * writes the runtime bottom-nav height into `--bottom-nav-height` on `:root`
 * (4rem below `lg`, 0px above). Every fixed/sticky element that positions
 * itself relative to the bottom of the viewport MUST consume that variable —
 * a hardcoded `bottom-14`/`bottom: 3.5rem` etc. silently drifts the moment
 * the real bottom-nav height changes, and has already caused a real,
 * user-visible overlap bug (BottomActions sitting 8px too low, clipped by
 * the bottom nav; ListingLayout's mobile pagination bar the same).
 *
 * Two rules:
 *   1. Tailwind — a `fixed`/`sticky` utility co-occurring with a hardcoded
 *      `bottom-N` class in .tsx/.jsx, instead of `bottom-[var(--bottom-nav-height,4rem)]`.
 *   2. Raw CSS — a `bottom: <N><unit>;` declaration in a `.style.css` file
 *      that isn't `var(--bottom-nav-height...)` and isn't `bottom: 0`.
 *
 * `bottom-0` / `bottom: 0` (and 0px/0rem) are excluded — correct value when
 * an element is flush against its own scroll container, not the viewport.
 *
 * Per-line escape hatch: `// audit-bottom-offset-ok: <reason>` (JS/TS) or
 * `/* audit-bottom-offset-ok: <reason> *\/` (CSS), same or preceding line.
 *
 * Mode: strict-zero.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const IGNORE_DIRS = ["node_modules", ".next", "dist", "__tests__", "scripts"];

const SUPPRESS_RE = /(?:\/\/|\/\*)\s*audit-bottom-offset-ok\b/;

const RULES = [
  {
    id: "BOTTOM_OFFSET_HARDCODED_TAILWIND",
    label: "Fixed/sticky element with hardcoded bottom-N magic number (use `bottom-[var(--bottom-nav-height,4rem)]`)",
    extensions: [".tsx", ".jsx"],
    regex: /(?:\b(?:fixed|sticky)\b[^"`'\n]*?(?<![-\w])bottom-(?:8|10|12|14|16|20|24|28|32|\[\d+(?:px|rem)\])|(?<![-\w])bottom-(?:8|10|12|14|16|20|24|28|32|\[\d+(?:px|rem)\])[^"`'\n]*?\b(?:fixed|sticky)\b)/,
  },
  {
    id: "BOTTOM_OFFSET_HARDCODED_CSS",
    label: "Raw CSS bottom offset not reading var(--bottom-nav-height,...) (use `bottom: var(--bottom-nav-height, 4rem);` or `calc(... + var(--bottom-nav-height, 0px))`)",
    extensions: [".css"],
    regex: /(?<![-\w])bottom\s*:\s*(?!0(?:px|rem)?\s*;)[\d.]+(?:px|rem|vh)\s*;/,
    excludeIfContains: "var(--bottom-nav-height",
  },
];

function walkFiles(dir, exts) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (IGNORE_DIRS.includes(entry)) continue;
    const stat = statSync(full, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isDirectory()) results.push(...walkFiles(full, exts));
    else if (exts.some((ext) => entry.endsWith(ext))) results.push(full);
  }
  return results;
}

function isComment(line, isCss) {
  const t = line.trim();
  return isCss ? t.startsWith("/*") || t.startsWith("*") : t.startsWith("//") || t.startsWith("*") || t.startsWith("/*");
}

const violations = {};
for (const rule of RULES) violations[rule.id] = [];

for (const rule of RULES) {
  const isCss = rule.extensions.includes(".css");
  for (const dir of DIRS) {
    for (const file of walkFiles(dir, rule.extensions)) {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isComment(line, isCss)) continue;
        if (!rule.regex.test(line)) continue;
        if (rule.excludeIfContains && line.includes(rule.excludeIfContains)) continue;
        if (SUPPRESS_RE.test(line)) continue;
        if (i > 0 && SUPPRESS_RE.test(lines[i - 1])) continue;
        const rel = relative(ROOT, file).replace(/\\/g, "/");
        violations[rule.id].push({ file: rel, line: i + 1, text: line.trim().slice(0, 140) });
      }
    }
  }
}

let total = 0;
for (const rule of RULES) {
  const hits = violations[rule.id];
  total += hits.length;
  if (hits.length === 0) continue;
  console.error(`\n[${rule.id}] ${hits.length} violation(s) — ${rule.label}`);
  for (const v of hits.slice(0, 20)) console.error(`  ${v.file}:${v.line} — ${v.text}`);
  if (hits.length > 20) console.error(`  ... and ${hits.length - 20} more`);
}

console.log("");

if (total === 0) {
  console.log("audit-bottom-offset: clean ✓");
  process.exit(0);
}

console.error(`audit-bottom-offset: ${total} violation(s). Replace hardcoded bottom-* with var(--bottom-nav-height,...), or add \`// audit-bottom-offset-ok: <reason>\` for non-bottom-nav-relative offsets.`);
process.exit(1);

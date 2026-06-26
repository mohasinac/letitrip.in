#!/usr/bin/env node
/**
 * audit-semantic-colors.mjs — Enforce semantic status colour tokens
 *
 * appkit defines the semantic palette in tokens.css:
 *   --appkit-color-error / -error-surface / -error-text / -error-title / -error-hover
 *   --appkit-color-success / -success-surface
 *   --appkit-color-warning / -warning-surface
 *   --appkit-color-info / -info-surface
 *
 * And surfaces them as Tailwind classes:
 *   text-error / bg-error-surface  (etc.)
 *
 * Raw Tailwind hue classes used for *semantic* status context (errors,
 * success, warnings, info) should reference the semantic alias so a brand
 * theme override touches one line, not dozens.
 *
 * Catches:
 *   text-(red|amber|green|emerald|sky|blue|rose|orange|yellow)-\d+
 *   bg-…    border-…   ring-…   fill-…   stroke-…
 *
 * Per-line escape hatch: `// audit-semantic-color-ok: <reason>` on same or
 * preceding line. Use for chart palettes, brand-mark accents, decorative
 * non-semantic colour.
 *
 * Allowlisted: the canonical theme constant file + chart-palette files.
 *
 * Mode: strict-zero.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const IGNORE_DIRS = ["node_modules", ".next", "dist", "__tests__", "scripts"];
const EXTENSIONS = [".tsx", ".jsx", ".ts"];

const SUPPRESS_RE = /(?:\/\/|\/\*)\s*audit-semantic-color-ok\b/;

// Files where raw status hues are inherent (palette tables, charts, theme map).
const ALLOWLIST = [];

// Path patterns where raw status hues are decorative, not semantic.
// Educational / guide / help pages assign distinct hues per step or category
// (visual variety, not error/success state) — those uses are legitimate.
const ALLOWLIST_PATH_PATTERNS = [
  // Token definition files — raw hues ARE the semantic-token mapping targets
  /appkit[/\\]src[/\\]tokens[/\\]/,
  /appkit[/\\]src[/\\]_internal[/\\]shared[/\\]styles[/\\]/,
  /src[/\\]constants[/\\]styles[/\\]/,
  // Educational guide/help pages — distinct hues per category or workflow step
  // (visual variety for navigation, not error/success/warning status)
  /appkit[/\\]src[/\\]features[/\\]about[/\\]/,
  /src[/\\]features[/\\]about[/\\]/,
  /appkit[/\\]src[/\\]features[/\\]account[/\\]components[/\\]Buyer.*Guide/,
  /appkit[/\\]src[/\\]features[/\\]admin[/\\]components[/\\]Admin.*Guide/,
  /appkit[/\\]src[/\\]features[/\\]stores[/\\]components[/\\]StoreGuideHub/,
  // Dev-only seed panel — not user-facing production UI; uses data-type palette
  /src[/\\]components[/\\]dev[/\\]/,
  // Role indicator dot — decorative category distinction (moderator/seller/employee)
  /appkit[/\\]src[/\\]features[/\\]layout[/\\]AppLayoutShell/,
  // Event type label palette — sale/raffle/spin_wheel category colours, not status
  /src[/\\]app[/\\].*events[/\\].*_constants/,
];

// Status hues — `red`/`rose` for error, `green`/`emerald` for success,
// `amber`/`yellow`/`orange` for warning, `sky`/`blue` for info. Excludes
// `zinc`/`slate`/`gray`/`neutral`/`stone` (structural neutrals).
const STATUS_HUES = "red|rose|green|emerald|teal|amber|yellow|orange|sky|blue";
const UTILITIES = "text|bg|border|ring|fill|stroke|from|to|via|outline|caret|decoration|placeholder|divide|accent";

const RULES = [
  {
    id: "RAW_STATUS_HUE",
    label: `Raw status hue (use semantic token — text-error / bg-error-surface / text-success / etc.)`,
    regex: new RegExp(`(?:^|\\s|"|'|\\{|\\[|\\(|\\\`)(${UTILITIES})-(${STATUS_HUES})-(?:50|100|200|300|400|500|600|700|800|900|950)\\b`),
  },
];

function walk(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const full = join(dir, e);
    if (IGNORE_DIRS.includes(e)) continue;
    const stat = statSync(full, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isDirectory()) out.push(...walk(full));
    else if (EXTENSIONS.some(ext => e.endsWith(ext))) {
      if (ALLOWLIST.includes(e)) continue;
      out.push(full);
    }
  }
  return out;
}

function isExemptPath(file) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  return ALLOWLIST_PATH_PATTERNS.some(rx => rx.test(rel));
}

function isComment(line) {
  const t = line.trim();
  return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*");
}

const violations = {};
for (const r of RULES) violations[r.id] = [];

for (const dir of DIRS) {
  for (const file of walk(dir)) {
    if (isExemptPath(file)) continue;
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isComment(line)) continue;
      for (const r of RULES) {
        if (!r.regex.test(line)) continue;
        if (SUPPRESS_RE.test(line)) continue;
        if (i > 0 && SUPPRESS_RE.test(lines[i - 1])) continue;
        const rel = relative(ROOT, file).replace(/\\/g, "/");
        violations[r.id].push({ file: rel, line: i + 1, text: line.trim().slice(0, 140) });
      }
    }
  }
}

let total = 0;
for (const r of RULES) {
  const hits = violations[r.id];
  total += hits.length;
  if (hits.length === 0) continue;
  console.error(`\n[${r.id}] ${hits.length} violation(s) — ${r.label}`);
  for (const v of hits.slice(0, 20)) console.error(`  ${v.file}:${v.line} — ${v.text}`);
  if (hits.length > 20) console.error(`  ... and ${hits.length - 20} more`);
}

console.log("");

if (total === 0) {
  console.log("audit-semantic-colors: clean ✓");
  process.exit(0);
}

console.error(`audit-semantic-colors: ${total} violation(s). Swap status-context hues for semantic tokens (text-error / bg-error-surface / text-success / etc.), or add \`// audit-semantic-color-ok: <reason>\` for decorative / non-semantic uses.`);
process.exit(1);

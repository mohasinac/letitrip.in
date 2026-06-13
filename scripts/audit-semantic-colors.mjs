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
const ALLOWLIST = [
  "theme.ts",                        // canonical badge/accent map
  "tokens.css",
  "tokens.ts",
  "AdminAnalyticsCharts.tsx",        // chart palette — non-semantic decorative
  "SeedPanel.tsx",                   // dev-only admin tooling
  "DevToolbar.tsx",                  // dev-only
  "utils.ts",                        // appkit/src/features/forms/utils.ts — primitive style constants
];

// Path patterns where raw status hues are decorative, not semantic.
// Educational / guide / help pages assign distinct hues per step or category
// (visual variety, not error/success state) — those uses are legitimate.
const ALLOWLIST_PATH_PATTERNS = [
  /[\\/]tokens[\\/]/,
  /[\\/]seed[\\/]/,
  /chart-palette/i,
  /[\\/]_internal[\\/]server[\\/]features[\\/][^\\/]+[\\/]og(?:-layout)?\.tsx?$/,
  // Educational surfaces — decorative per-step palettes.
  /[\\/]features[\\/]about[\\/]/,
  /[\\/]features[\\/]help[\\/]/,
  /[\\/]features[\\/]corporate[\\/]/,
  /[\\/]features[\\/]consultation[\\/]/,
  /[\\/]features[\\/]guides[\\/]/,
  /[\\/]features[\\/]promotions[\\/]/,
  /Guide(?:Hub)?View\.tsx?$/,        // any *GuideView / *GuideHubView component
  /HelpPageView\.tsx?$/,
  /FAQ\w*View\.tsx?$/,
  /SpinWheelView\.tsx?$/,            // decorative spin-wheel palette
  /AdvertisementBanner\.tsx?$/,      // ad gradients
  /SocialPostCard\.tsx?$/,           // social brand chrome
  /GoogleReviewsSection\.tsx?$/,
  /WhatsAppCommunitySection\.tsx?$/,
  /FAQHelpfulButtons\.tsx?$/,        // thumbs up/down — distinct palette
  /[\\/]filters[\\/]/,               // filter chip color variations
  /[\\/]about[\\/]page\./,           // consumer about page
  /events\/\[id\]\/_constants/,      // event status palette table
  /events\/\[id\]\/participate\//,   // participation palette
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

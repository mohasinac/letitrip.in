#!/usr/bin/env node
/**
 * audit-sticky-offsets.mjs — Enforce --header-height for sticky positioning
 *
 * AppLayoutShell writes the runtime header height into `--header-height` on
 * `:root`. Every sticky element MUST consume that variable so the offset
 * tracks the actual rendered header (which changes with breakpoint, branding
 * banner state, mobile keyboard, etc.).
 *
 * Catches hardcoded sticky offsets that should use the CSS variable:
 *   `sticky top-14`            → `sticky top-[var(--header-height,0px)]`
 *   `sticky top-16`            → same
 *   `sticky top-20`            → same
 *   `sticky top-[Npx]`         → same
 *
 * Per-line escape hatch: `// audit-sticky-offset-ok: <reason>` on same or
 * preceding line. Use for non-header-relative stickies (in-modal toolbars,
 * second-row stickies whose offset depends on a sibling).
 *
 * Mode: strict-zero.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const IGNORE_DIRS = ["node_modules", ".next", "dist", "__tests__", "scripts"];
const EXTENSIONS = [".tsx", ".jsx"];

const SUPPRESS_RE = /(?:\/\/|\/\*)\s*audit-sticky-offset-ok\b/;

// Match a `sticky` Tailwind utility co-occurring with a banned hardcoded
// `top-N` magic number on the same line. We require both because `top-N` on
// its own is also used for absolute-positioned badges/icons (legitimate).
// `top-0` is excluded — correct value when sticky is inside an overflow
// scroll container. Prop-default antipatterns like `stickyRailOffset = "top-20"`
// must be fixed by hand.
const RULES = [
  {
    id: "STICKY_HARDCODED_TOP",
    label: "Sticky element with hardcoded top-N magic number (use `top-[var(--header-height,0px)]`)",
    regex: /(?:\bsticky\b[^"`'\n]*?(?<![-\w])top-(?:8|10|12|14|16|20|24|28|32|\[\d+(?:px|rem)\])|(?<![-\w])top-(?:8|10|12|14|16|20|24|28|32|\[\d+(?:px|rem)\])[^"`'\n]*?\bsticky\b)/,
  },
];

function walkFiles(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (IGNORE_DIRS.includes(entry)) continue;
    const stat = statSync(full, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isDirectory()) results.push(...walkFiles(full));
    else if (EXTENSIONS.some(ext => entry.endsWith(ext))) results.push(full);
  }
  return results;
}

function isComment(line) {
  const t = line.trim();
  return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*");
}

const violations = {};
for (const rule of RULES) violations[rule.id] = [];

for (const dir of DIRS) {
  for (const file of walkFiles(dir)) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isComment(line)) continue;
      for (const rule of RULES) {
        if (!rule.regex.test(line)) continue;
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
  console.log("audit-sticky-offsets: clean ✓");
  process.exit(0);
}

console.error(`audit-sticky-offsets: ${total} violation(s). Replace hardcoded top-* with top-[var(--header-height,0px)], or add \`// audit-sticky-offset-ok: <reason>\` for non-header-relative stickies.`);
process.exit(1);

#!/usr/bin/env node
// Remove `dark:bg-neutral-800` and `dark:text-neutral-{400,100}` whenever
// the same className string also contains another dark:bg-* or dark:text-*.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN = [
  join(ROOT, "appkit", "src"),
  join(ROOT, "src"),
];
const EXCLUDED = new Set(["node_modules", "dist", ".next", "__tests__"]);

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".d.ts")) yield full;
  }
}

const COLORS = "(?:slate|zinc|neutral|gray|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)";

// Process per-className-string (inside quotes/backticks).
function dedupeOne(s) {
  // If a className contains `dark:bg-neutral-800` AND another `dark:bg-*`
  // (different color or different shade), drop `dark:bg-neutral-800`.
  const hasNeutral800 = /\bdark:bg-neutral-800\b/.test(s);
  if (hasNeutral800) {
    const otherDarkBg = new RegExp(`\\bdark:bg-(?!neutral-800\\b)${COLORS}-\\d+\\b`).test(s);
    if (otherDarkBg) {
      s = s.replace(/\s*\bdark:bg-neutral-800\b/g, "");
    }
  }
  // Drop dark:text-neutral-400 when another dark:text-* exists
  const hasN400 = /\bdark:text-neutral-400\b/.test(s);
  if (hasN400) {
    const otherDarkText = new RegExp(`\\bdark:text-(?!neutral-400\\b)${COLORS}-\\d+\\b`).test(s);
    if (otherDarkText) {
      s = s.replace(/\s*\bdark:text-neutral-400\b/g, "");
    }
  }
  // Drop dark:text-neutral-100 when another dark:text-* exists
  const hasN100 = /\bdark:text-neutral-100\b/.test(s);
  if (hasN100) {
    const otherDarkText = new RegExp(`\\bdark:text-(?!neutral-100\\b)${COLORS}-\\d+\\b`).test(s);
    if (otherDarkText) {
      s = s.replace(/\s*\bdark:text-neutral-100\b/g, "");
    }
  }
  // Collapse double spaces
  return s.replace(/  +/g, " ");
}

let total = 0;
let files = 0;
for (const root of SCAN) {
  for (const file of walk(root)) {
    let src = readFileSync(file, "utf8");
    const before = src;
    // Process each quoted or backticked string
    src = src.replace(/"([^"]*?)"/g, (m, inner) => `"${dedupeOne(inner)}"`);
    src = src.replace(/`([^`]*?)`/g, (m, inner) => `\`${dedupeOne(inner)}\``);
    if (src === before) continue;
    writeFileSync(file, src);
    files++;
    const beforeCount = (before.match(/dark:/g) || []).length;
    const afterCount = (src.match(/dark:/g) || []).length;
    const removed = beforeCount - afterCount;
    total += removed;
    console.log(`${file}: -${removed} duplicate dark classes`);
  }
}
console.log(`\nTotal: ${files} files, -${total} duplicate dark classes`);

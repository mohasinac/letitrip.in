#!/usr/bin/env node
// Add dark: companions to `text-neutral-{500,600,900}` and `bg-neutral-100`.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN = [
  join(ROOT, "appkit", "src", "features"),
  join(ROOT, "appkit", "src", "ui"),
  join(ROOT, "src", "app"),
  join(ROOT, "src", "components"),
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

// Returns true if the substring near match already has the dark: companion
function hasDarkCompanion(line, match, darkClass) {
  return line.includes(darkClass);
}

const PATTERNS = [
  { from: /\btext-neutral-500\b/g, dark: "dark:text-neutral-400" },
  { from: /\btext-neutral-600\b/g, dark: "dark:text-neutral-400" },
  { from: /\btext-neutral-900\b/g, dark: "dark:text-neutral-100" },
  { from: /\bbg-neutral-100\b(?!\/)/g, dark: "dark:bg-neutral-800" },
  { from: /\btext-zinc-500\b/g, dark: "dark:text-zinc-400" },
  { from: /\btext-zinc-600\b/g, dark: "dark:text-zinc-400" },
  { from: /\btext-zinc-900\b/g, dark: "dark:text-zinc-100" },
];

let totalSites = 0;
let touchedFiles = 0;

for (const root of SCAN) {
  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8");
    if (!/text-neutral-(500|600|900)|bg-neutral-100/.test(src)) continue;

    const lines = src.split(/\r?\n/);
    let sitesInFile = 0;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      for (const { from, dark } of PATTERNS) {
        // Find all matches in line; only add dark companion if not already present
        from.lastIndex = 0;
        let m;
        const newReplacements = new Map();
        while ((m = from.exec(line)) !== null) {
          if (hasDarkCompanion(line, m[0], dark)) continue;
          newReplacements.set(m.index, m[0]);
        }
        if (newReplacements.size === 0) continue;
        // Apply replacements right-to-left to preserve indices
        const indices = [...newReplacements.keys()].sort((a, b) => b - a);
        for (const idx of indices) {
          const match = newReplacements.get(idx);
          const after = line.slice(idx + match.length);
          // Insert `dark:...` immediately after the matched class
          line = line.slice(0, idx + match.length) + " " + dark + after;
          sitesInFile++;
        }
      }
      lines[i] = line;
    }

    if (sitesInFile === 0) continue;
    writeFileSync(file, lines.join("\n"));
    touchedFiles++;
    totalSites += sitesInFile;
    console.log(`${file}: +${sitesInFile} dark companions`);
  }
}

console.log(`\nTotal: ${touchedFiles} files, +${totalSites} sites`);

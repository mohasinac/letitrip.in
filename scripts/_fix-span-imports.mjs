#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__", "scripts", "seed"]);
const PRIMITIVE_SOURCE_DIRS = [
  /[\\/]appkit[\\/]src[\\/]ui[\\/]components[\\/]/,
  /[\\/]appkit[\\/]src[\\/]ui[\\/]forms[\\/]/,
  /[\\/]appkit[\\/]src[\\/]ui[\\/]rich-text[\\/]/,
  /[\\/]appkit[\\/]src[\\/]features[\\/]email[\\/]/,
];

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) { walk(full, files); continue; }
    if (extname(e.name) !== ".tsx") continue;
    if (PRIMITIVE_SOURCE_DIRS.some(rx => rx.test(full))) continue;
    files.push(full);
  }
  return files;
}

const NEEDED = ["Span"];
let filesPatched = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    let text = readFileSync(file, "utf8");
    const before = text;
    const referenced = new Set();
    for (const sym of NEEDED) {
      if (new RegExp(`<${sym}\\b`).test(text)) referenced.add(sym);
    }
    if (referenced.size === 0) continue;
    const missing = [];
    for (const sym of referenced) {
      const importedRe = new RegExp(`import\\s+(?:type\\s+)?\\{[^}]*\\b${sym}\\b[^}]*\\}\\s+from`, "m");
      if (!importedRe.test(text)) missing.push(sym);
    }
    if (missing.length === 0) continue;

    const candidateRe = /^import\s+\{([^}]+)\}\s+from\s+(["'])((?:[^"']*\/ui|@mohasinac\/appkit(?:\/(?:ui|client|server))?))\2\s*;?\s*$/m;
    const candMatch = text.match(candidateRe);
    if (candMatch) {
      const existing = candMatch[1].split(",").map(s => s.trim()).filter(Boolean);
      const merged = [...new Set([...existing, ...missing])].sort();
      const newLine = `import { ${merged.join(", ")} } from ${candMatch[2]}${candMatch[3]}${candMatch[2]};`;
      text = text.replace(candidateRe, newLine);
    }
    if (text !== before) { writeFileSync(file, text); filesPatched++; }
  }
}
console.log(`Patched Span imports in ${filesPatched} files.`);

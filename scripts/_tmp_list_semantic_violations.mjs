#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const IGNORE = ["node_modules", ".next", "dist", "__tests__", "scripts"];
const EXT = [".tsx", ".jsx", ".ts"];
const SUPPRESS = /(?:\/\/|\/\*)\s*audit-semantic-color-ok/;
const STATUS_HUES = "red|rose|green|emerald|teal|amber|yellow|orange|sky|blue";
const UTILITIES = "text|bg|border|ring|fill|stroke|from|to|via|outline|caret|decoration|placeholder|divide|accent";
const REGEX = new RegExp(String.raw`(?:^|\s|"|'|\{|\[|\(|\`)(${UTILITIES})-(${STATUS_HUES})-(?:50|100|200|300|400|500|600|700|800|900|950)\b`);

function walk(dir) {
  let out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const full = join(dir, e);
    if (IGNORE.includes(e)) continue;
    const stat = statSync(full, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isDirectory()) { out.push(...walk(full)); continue; }
    if (EXT.some(x => e.endsWith(x))) out.push(full);
  }
  return out;
}

const byFile = {};
for (const dir of DIRS) {
  for (const file of walk(dir)) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue;
      if (!REGEX.test(line)) continue;
      if (SUPPRESS.test(line)) continue;
      if (i > 0 && SUPPRESS.test(lines[i - 1])) continue;
      const rel = file.replace(ROOT, "").replace(/\\/g, "/").replace(/^\//, "");
      if (!byFile[rel]) byFile[rel] = [];
      byFile[rel].push({ line: i + 1, text: line.trim().slice(0, 120) });
    }
  }
}

const keys = Object.keys(byFile).sort();
keys.forEach(k => {
  console.log(`\n${k} (${byFile[k].length} violations)`);
  byFile[k].forEach(v => console.log(`  L${v.line}: ${v.text}`));
});
console.log(`\nFiles: ${keys.length}  Total: ${Object.values(byFile).reduce((s, v) => s + v.length, 0)}`);

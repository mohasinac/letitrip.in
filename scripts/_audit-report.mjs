#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { FORBIDDEN_UTILITY_TOKENS, PRIMITIVE_SOURCE_DIRS, PRIMITIVE_TAGS, VARIANT_OK_MARKER } from "./variant-catalogue.mjs";
const ROOT = process.cwd();
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__", "scripts", "seed"]);
const PRIMITIVE_OPENER_RE = new RegExp(`<(${PRIMITIVE_TAGS.join("|")})\\b([^>]*?)(?=/?>)`, "g");
const CLASSNAME_RE = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/;
function walk(dir, files = []) {
  let entries; try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) { walk(full, files); continue; }
    if (!e.name.endsWith(".tsx")) continue;
    if (PRIMITIVE_SOURCE_DIRS.some(rx => rx.test(full))) continue;
    files.push(full);
  } return files;
}
const perTagToken = new Map();
const perFile = new Map();
let total = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");
    const lines = text.split("\n");
    let fc = 0;
    for (const match of text.matchAll(PRIMITIVE_OPENER_RE)) {
      const [, tagName, attrs] = match;
      if (!attrs.includes("className")) continue;
      const cls = CLASSNAME_RE.exec(attrs);
      if (!cls) continue;
      const val = cls[1] ?? cls[2] ?? cls[3] ?? cls[4] ?? cls[5] ?? "";
      if (!val.trim()) continue;
      const offending = FORBIDDEN_UTILITY_TOKENS.filter(rx => rx.test(val));
      if (!offending.length) continue;
      const before = text.slice(0, match.index ?? 0);
      const lineIdx = before.split("\n").length - 1;
      if (VARIANT_OK_MARKER.test(lines[lineIdx]) || (lineIdx > 0 && VARIANT_OK_MARKER.test(lines[lineIdx - 1]))) continue;
      total++; fc++;
      const token = val.match(offending[0])?.[0] ?? "";
      perTagToken.set(`${tagName}::${token}`, (perTagToken.get(`${tagName}::${token}`) ?? 0) + 1);
    }
    if (fc) perFile.set(relative(ROOT, file).replace(/\\/g, "/"), fc);
  }
}
console.log(`TOTAL: ${total}\n=== TOP 20 FILES ===`);
[...perFile.entries()].sort((a,b)=>b[1]-a[1]).slice(0,20).forEach(([f,c])=>console.log(`${String(c).padStart(4)} ${f}`));
console.log(`\n=== TOP 20 TAG::TOKEN ===`);
[...perTagToken.entries()].sort((a,b)=>b[1]-a[1]).slice(0,20).forEach(([k,c])=>console.log(`${String(c).padStart(4)} ${k}`));

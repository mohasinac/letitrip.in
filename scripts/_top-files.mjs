import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { FORBIDDEN_UTILITY_TOKENS, PRIMITIVE_SOURCE_DIRS, PRIMITIVE_TAGS, VARIANT_OK_MARKER } from "./variant-catalogue.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__", "scripts", "seed"]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;
const PRIMITIVE_OPENER_RE = new RegExp(`<(${PRIMITIVE_TAGS.join("|")})\\b([^>]*?)(?=/?>)`, "g");
const CLASSNAME_RE = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/;

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) { walk(full, files); continue; }
    if (!e.name.endsWith(".tsx")) continue;
    if (SKIP_FILE_RE.test(e.name)) continue;
    if (PRIMITIVE_SOURCE_DIRS.some((rx) => rx.test(full))) continue;
    files.push(full);
  }
  return files;
}
function suppressed(lineIdx, lines) {
  if (VARIANT_OK_MARKER.test(lines[lineIdx])) return true;
  for (let j = lineIdx - 1; j >= 0; j--) {
    const prev = lines[j];
    if (VARIANT_OK_MARKER.test(prev)) return true;
    if (!/^\s*(?:\/\/|\{?\/\*)/.test(prev)) return false;
  }
  return false;
}

const byFile = new Map();
for (const d of SCAN_DIRS) {
  for (const f of walk(d)) {
    const text = readFileSync(f, "utf8");
    if (!PRIMITIVE_TAGS.some((t) => text.includes("<" + t))) continue;
    const lines = text.split("\n");
    for (const m of text.matchAll(PRIMITIVE_OPENER_RE)) {
      const attrs = m[2];
      if (!attrs.includes("className")) continue;
      const cls = CLASSNAME_RE.exec(attrs);
      if (!cls) continue;
      const v = cls[1] ?? cls[2] ?? cls[3] ?? cls[4] ?? cls[5] ?? "";
      if (!v.trim()) continue;
      const off = FORBIDDEN_UTILITY_TOKENS.filter((rx) => rx.test(v));
      if (off.length === 0) continue;
      const before = text.slice(0, m.index ?? 0);
      const li = before.split("\n").length - 1;
      if (suppressed(li, lines)) continue;
      const rel = relative(ROOT, f).replace(/\\/g, "/");
      byFile.set(rel, (byFile.get(rel) || 0) + 1);
    }
  }
}
console.log("TOP 30 FILES:");
for (const [f, n] of [...byFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)) console.log(String(n).padStart(4), f);

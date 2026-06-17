import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FORBIDDEN_UTILITY_TOKENS,
  PRIMITIVE_SOURCE_DIRS,
  PRIMITIVE_TAGS,
  VARIANT_OK_MARKER,
} from "./variant-catalogue.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__", "scripts", "seed"]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;
const OPENER = new RegExp("<(" + PRIMITIVE_TAGS.join("|") + ")\\b([^>]*?)(?=/?>)", "g");
const CLS = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/;

function walk(d, files = []) {
  let e; try { e = readdirSync(d, { withFileTypes: true }); } catch { return files; }
  for (const x of e) {
    if (SKIP_DIRS.has(x.name)) continue;
    const f = join(d, x.name);
    if (x.isDirectory()) { walk(f, files); continue; }
    if (!x.name.endsWith(".tsx")) continue;
    if (SKIP_FILE_RE.test(x.name)) continue;
    if (PRIMITIVE_SOURCE_DIRS.some((r) => r.test(f))) continue;
    files.push(f);
  }
  return files;
}

const tally = new Map();
for (const d of SCAN_DIRS) {
  for (const f of walk(d)) {
    const text = readFileSync(f, "utf8");
    if (!PRIMITIVE_TAGS.some((t) => text.includes("<" + t))) continue;
    const lines = text.split("\n");
    let count = 0;
    for (const m of text.matchAll(OPENER)) {
      const attrs = m[2];
      if (!attrs.includes("className")) continue;
      const cls = CLS.exec(attrs);
      if (!cls) continue;
      const v = cls[1] ?? cls[2] ?? cls[3] ?? cls[4] ?? cls[5] ?? "";
      if (!v.trim()) continue;
      if (FORBIDDEN_UTILITY_TOKENS.every((rx) => !rx.test(v))) continue;
      const before = text.slice(0, m.index ?? 0);
      const li = before.split("\n").length - 1;
      if (VARIANT_OK_MARKER.test(lines[li]) || (li > 0 && VARIANT_OK_MARKER.test(lines[li - 1]))) continue;
      count++;
    }
    if (count > 0) tally.set(relative(ROOT, f).replace(/\\/g, "/"), count);
  }
}
const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
for (const [k, v] of sorted) console.log(v.toString().padStart(4), k);

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
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
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "__tests__",
  "__mocks__",
  "scripts",
  "seed",
]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;
const PRIMITIVE_OPENER_RE = new RegExp(
  "<(" + PRIMITIVE_TAGS.join("|") + ")\\b([^>]*?)(?=/?>)",
  "g",
);
const CLASSNAME_RE =
  /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/;

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (!e.name.endsWith(".tsx")) continue;
    if (SKIP_FILE_RE.test(e.name)) continue;
    if (PRIMITIVE_SOURCE_DIRS.some((rx) => rx.test(full))) continue;
    files.push(full);
  }
  return files;
}

const tally = new Map();
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
      if (
        VARIANT_OK_MARKER.test(lines[li]) ||
        (li > 0 && VARIANT_OK_MARKER.test(lines[li - 1]))
      )
        continue;
      const tok = v.match(off[0])?.[0] ?? "";
      const key = m[1] + "::" + tok;
      tally.set(key, (tally.get(key) || 0) + 1);
    }
  }
}
const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
for (const [k, v] of sorted) console.log(v.toString().padStart(3), k);

#!/usr/bin/env node
/**
 * audit-hardcoded-api-routes.mjs — strict-zero.
 *
 * Raw `/api/...` string/template literals bypass the registry (`API_ROUTES` in
 * `src/constants/api.ts`, `API_ENDPOINTS` in `appkit/src/constants/api-endpoints.ts`)
 * — untyped, unrenamed-with-the-route, and the direct cause of a real production
 * 404 (an admin dashboard fetch that never got updated when its route moved).
 *
 * Scans both trees in one pass — consumer `src/` and `appkit/src/` — since the
 * pattern recurs identically in both (appkit view components hardcode default
 * endpoint props the same way consumer pages hardcode fetch URLs).
 *
 * Allowed:
 *   - `src/app/api/**`, `appkit/src/**\/api/**` — the route definitions themselves
 *   - `src/lib/api/**` — the typed wrapper layer (this is where literals belong)
 *   - `src/constants/api.ts`, `appkit/src/constants/api-endpoints.ts` — the registry
 *   - Test files (`.test.ts(x)`, `__tests__/`)
 *   - Lines with `// audit-hardcoded-api-routes-ok: <reason>` (same or preceding line)
 *
 * Mode: strict-zero.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SEARCH_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", ".git", "__tests__"]);
const EXTS = [".ts", ".tsx"];

const IGNORE_PATH_FRAGMENTS = [
  "/app/api/",             // consumer route definitions — allowed
  "/lib/api/",              // consumer typed-wrapper layer — allowed
  "/constants/api.ts",      // consumer registry — allowed
  "/constants/api-endpoints.ts", // appkit registry — allowed
];

// appkit route-definition dirs follow `features/<x>/api/**` — anything with
// `/api/` as a path SEGMENT (not just substring) inside appkit/src is a route file.
const APPKIT_API_DIR_RE = /\/api\//;

const SUPPRESS_RE = /\/\/\s*audit-hardcoded-api-routes-ok\b/;

// Matches a quoted or backtick string starting with /api/ — covers both plain
// string literals and template literals with ${...} interpolation inside.
const API_LITERAL_RE = /(["'`])(\/api\/[^"'`]*)\1/g;

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (EXTS.includes(extname(entry.name))) files.push(full);
  }
  return files;
}

function isExempt(rel) {
  if (IGNORE_PATH_FRAGMENTS.some((f) => rel.includes(f))) return true;
  if (rel.endsWith(".test.ts") || rel.endsWith(".test.tsx")) return true;
  if (rel.includes("/__tests__/")) return true;
  // appkit's own consumer-stub route files live at features/<x>/api/**
  if (rel.startsWith("appkit/src/") && APPKIT_API_DIR_RE.test(rel)) return true;
  return false;
}

const violations = [];

for (const searchDir of SEARCH_DIRS) {
  for (const file of walk(searchDir)) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (isExempt(rel)) continue;

    const src = readFileSync(file, "utf8");
    const lines = src.split("\n");

    API_LITERAL_RE.lastIndex = 0;
    let m;
    while ((m = API_LITERAL_RE.exec(src)) !== null) {
      const lineNum = src.slice(0, m.index).split("\n").length;
      const line = lines[lineNum - 1] ?? "";
      const trimmed = line.trim();

      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*") || trimmed.startsWith("/**")) continue;
      if (SUPPRESS_RE.test(line)) continue;
      if (lineNum > 1 && SUPPRESS_RE.test(lines[lineNum - 2] ?? "")) continue;

      violations.push({ file: rel, line: lineNum, literal: m[2], text: trimmed.slice(0, 140) });
    }
  }
}

if (violations.length === 0) {
  console.log("audit-hardcoded-api-routes: clean ✓");
  process.exit(0);
}

console.error(`\naudit-hardcoded-api-routes: ${violations.length} violation(s) — raw /api/ literal bypassing the registry`);
console.error("Import from API_ROUTES (src/constants/api.ts) or API_ENDPOINTS (appkit/src/constants/api-endpoints.ts) instead.");
console.error("Add a missing entry to the registry rather than leaving the literal inline.");
console.error("Suppress with `// audit-hardcoded-api-routes-ok: <reason>` only for genuine one-off cases.\n");

for (const v of violations.slice(0, 40)) {
  console.error(`  ${v.file}:${v.line} — "${v.literal}"`);
  console.error(`    ${v.text}`);
}
if (violations.length > 40) console.error(`  ... and ${violations.length - 40} more`);

process.exit(1);

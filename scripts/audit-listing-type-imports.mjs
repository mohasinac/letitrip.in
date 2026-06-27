#!/usr/bin/env node
/**
 * audit-listing-type-imports — ListingType inline union enforcement.
 *
 * Rule (scans appkit/src/**\/*.{ts,tsx} except the canonical type definition):
 *
 *   LISTING_TYPE_INLINE — A file redeclares the ListingType union inline as
 *     `"standard" | "auction" | "pre-order"`. All code must import the
 *     canonical `ListingType` from `@mohasinac/appkit` or directly from
 *     `appkit/src/features/products/types/index.ts` instead of redeclaring
 *     the union. Inline redeclarations drift when new listing types are added.
 *
 * Excluded file: appkit/src/features/products/types/index.ts
 *   (canonical declaration — the source of truth for the union).
 *
 * Strict-zero. Suppression: `// audit-listing-type-inline-ok: <reason>` on
 * the offending line. Reserve for genuinely irreducible edge cases (e.g. a
 * Zod literal that cannot reference the TS type).
 *
 * Exit 0 — clean
 * Exit 1 — violations found
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIR = join(ROOT, "appkit", "src");

// ── Walk ──────────────────────────────────────────────────────────────────────
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git", "__tests__", "__mocks__"]);

// Canonical declaration — excluded from scanning
const CANONICAL_FILE = join(ROOT, "appkit", "src", "features", "products", "types", "index.ts")
  .replace(/\\/g, "/");

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      const ext = extname(entry.name);
      if (ext === ".ts" || ext === ".tsx") {
        files.push(full);
      }
    }
  }
  return files;
}

// ── Rule ──────────────────────────────────────────────────────────────────────

// Matches `"standard" | "auction" | "pre-order"` anywhere on a non-comment line.
// The pipe-separated quoted literals are the fingerprint of an inline union redeclaration.
const RE_INLINE_UNION = /"standard"\s*\|\s*"auction"\s*\|\s*"pre-order"/;

function isCommentLine(line) {
  const t = line.trimStart();
  return t.startsWith("//") || t.startsWith("*");
}

// ── Scan ──────────────────────────────────────────────────────────────────────
const files = walk(SCAN_DIR).filter((f) => f.replace(/\\/g, "/") !== CANONICAL_FILE);
const violations = [];

for (const file of files) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = src.split("\n");
  const rel = relative(ROOT, file).replace(/\\/g, "/");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isCommentLine(raw)) continue;
    if (!RE_INLINE_UNION.test(raw)) continue;

    // Suppression on current line
    if (raw.includes("// audit-listing-type-inline-ok:")) continue;

    violations.push({ file: rel, line: i + 1, text: raw.trim() });
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log("audit-listing-type-imports: clean");
  process.exit(0);
}

console.error(`audit-listing-type-imports: ${violations.length} violation(s).\n`);
console.error("Import the canonical ListingType instead of redeclaring the union inline:");
console.error("  import type { ListingType } from '../../products/types'; // within appkit");
console.error("  import type { ListingType } from '@mohasinac/appkit';    // from consumer\n");
console.error("Inline unions drift when new listing types (classified/digital-code/live) are added.\n");
for (const v of violations) {
  console.error(`  [LISTING_TYPE_INLINE] ${v.file}:${v.line}`);
  console.error(`    ${v.text}`);
}
process.exit(1);

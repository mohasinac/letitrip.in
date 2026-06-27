#!/usr/bin/env node
/**
 * audit-per-type-data-pattern — Listing data-fetch factory enforcement.
 *
 * Rule (scans appkit/src/_internal/server/features/[feature]/data.ts):
 *
 *   DIRECT_REPO_CALL — A per-type data.ts file calls
 *     `productRepository.findByIdOrSlug` directly instead of delegating to
 *     `makeGetListingForDetail` from `listing-data-factory.ts`. Direct calls
 *     bypass the `listingType !== type` guard that prevents cross-type URL
 *     collisions (e.g. `/auctions/classified-slug` returning the wrong product).
 *
 * The factory `listing-data-factory.ts` itself is not a `data.ts` file and is
 * excluded by the glob pattern. Store-level `stores/data.ts` calls
 * `storeRepository.findBySlug` (not `productRepository.findByIdOrSlug`) so it
 * is clean.
 *
 * Strict-zero. Suppression: `// audit-per-type-data-ok: <reason>` on the
 * offending line. Reserve for proven cases where the type guard is enforced
 * by another mechanism.
 *
 * Exit 0 — clean
 * Exit 1 — violations found
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Collect per-type data.ts files ───────────────────────────────────────────
// Only the 6 listing-type-specific directories are in scope — these must use the
// makeGetListingForDetail factory. General-purpose directories (products/, stores/,
// grouped/) legitimately call findByIdOrSlug directly and are excluded.
const FEATURES_DIR = join(
  ROOT,
  "appkit",
  "src",
  "_internal",
  "server",
  "features",
);

const PER_TYPE_DIRS = new Set([
  "auctions",
  "pre-orders",
  "prize-draws",
  "classified",
  "digital-code",
  "live",
]);

function collectDataFiles() {
  const files = [];
  for (const dir of PER_TYPE_DIRS) {
    files.push(join(FEATURES_DIR, dir, "data.ts"));
  }
  return files;
}

// ── Rule ──────────────────────────────────────────────────────────────────────

// Matches `productRepository.findByIdOrSlug(` — the direct call that must be replaced
// with the factory.
const RE_DIRECT_CALL = /\bproductRepository\.findByIdOrSlug\s*\(/;

function isCommentLine(line) {
  const t = line.trimStart();
  return t.startsWith("//") || t.startsWith("*");
}

// ── Scan ──────────────────────────────────────────────────────────────────────
const violations = [];

for (const file of collectDataFiles()) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue; // File does not exist — skip
  }
  const lines = src.split("\n");
  const rel = relative(ROOT, file).replace(/\\/g, "/");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isCommentLine(raw)) continue;
    if (!RE_DIRECT_CALL.test(raw)) continue;

    // Suppression on current line
    if (raw.includes("// audit-per-type-data-ok:")) continue;

    violations.push({ file: rel, line: i + 1, text: raw.trim() });
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log("audit-per-type-data-pattern: clean");
  process.exit(0);
}

console.error(`audit-per-type-data-pattern: ${violations.length} violation(s).\n`);
console.error(
  "Per-type data.ts files must use makeGetListingForDetail from listing-data-factory.ts.",
);
console.error(
  "Direct productRepository.findByIdOrSlug calls bypass the listingType guard that",
);
console.error("prevents cross-type URL collisions.\n");
console.error("Replace with:");
console.error(
  "  import { makeGetListingForDetail } from '../shared/listing-data-factory';",
);
console.error(
  "  export const getFooForDetail = makeGetListingForDetail('foo-type');\n",
);
for (const v of violations) {
  console.error(`  [DIRECT_REPO_CALL] ${v.file}:${v.line}`);
  console.error(`    ${v.text}`);
}
process.exit(1);

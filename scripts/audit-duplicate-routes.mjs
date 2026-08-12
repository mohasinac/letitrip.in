#!/usr/bin/env node
/**
 * audit-duplicate-routes.mjs — strict-zero.
 *
 * Content-hashes every `route.ts` under `src/app/api/**` and fails if two
 * different paths hash identically. This is the direct guard against the
 * class of bug this repo hit for real: a batch refactor commit accidentally
 * overwrote 96 API route files with byte-identical copies of an unrelated
 * sibling route's content (same handler, same doc-comment, wrong file) —
 * every one of them silently served the wrong logic until the corruption
 * was found by hand months later. No suppression marker exists for this
 * rule — two route files can never legitimately have identical content;
 * a genuine intentional re-export belongs in the route registry, not a
 * byte-for-byte duplicate handler.
 *
 * Mode: strict-zero.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const API_DIR = join(ROOT, "src", "app", "api");

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === "route.ts" || entry.name === "route.tsx") out.push(full);
  }
  return out;
}

let exists = false;
try { exists = statSync(API_DIR).isDirectory(); } catch { exists = false; }
if (!exists) process.exit(0);

const byHash = new Map();

for (const file of walk(API_DIR)) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const content = readFileSync(file, "utf8");
  const hash = createHash("sha256").update(content).digest("hex");
  if (!byHash.has(hash)) byHash.set(hash, []);
  byHash.get(hash).push(rel);
}

const groups = [...byHash.values()].filter((paths) => paths.length > 1);

if (groups.length === 0) {
  console.log("audit-duplicate-routes: clean ✓");
  process.exit(0);
}

const totalFiles = groups.reduce((n, g) => n + g.length, 0);
console.error(`\naudit-duplicate-routes: ${groups.length} group(s), ${totalFiles} file(s) with byte-identical content to a different route.\n`);
console.error("Two API route files can never legitimately share content — each should be restored to its own real implementation.\n");
for (const group of groups) {
  console.error(`  Identical content across ${group.length} files:`);
  for (const p of group) console.error(`    ${p}`);
  console.error("");
}
process.exit(1);

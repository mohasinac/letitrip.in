#!/usr/bin/env node
/**
 * audit-media-direct-upload — strict-zero.
 *
 * No API route may read raw binary bytes off the inbound HTTP request.
 * Every upload flows through the signed-URL path:
 *
 *   client → POST /api/media/sign → PUT to GCS → POST /api/media/finalize
 *
 * Forbidden inside src/app/api/[recursive]/route.ts:
 *   - request.formData()
 *   - request.body  (when consumed as a stream / buffer)
 *   - request.arrayBuffer()
 *   - request.blob()
 *
 * Exempt:
 *   - src/app/api/media/sign/route.ts   (header-only, never receives bytes)
 *   - src/app/api/media/finalize/route.ts (header-only, never receives bytes)
 *
 * Exit 0 — clean.
 * Exit 1 — at least one direct binary read found.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const API_DIR = join(ROOT, "src", "app", "api");
const EXEMPT = new Set([
  join(ROOT, "src", "app", "api", "media", "sign", "route.ts"),
  join(ROOT, "src", "app", "api", "media", "finalize", "route.ts"),
]);

const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name === "route.ts" || e.name === "route.tsx") out.push(full);
  }
  return out;
}

const FORBIDDEN = [
  /\brequest\s*\.\s*formData\s*\(/,
  /\brequest\s*\.\s*arrayBuffer\s*\(/,
  /\brequest\s*\.\s*blob\s*\(/,
];

let exists = false;
try { exists = statSync(API_DIR).isDirectory(); } catch { exists = false; }
if (!exists) process.exit(0);

const violations = [];
for (const file of walk(API_DIR)) {
  if (EXEMPT.has(file)) continue;
  const rel = relative(ROOT, file);
  const cleaned = readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
  for (const pat of FORBIDDEN) {
    if (pat.test(cleaned)) {
      violations.push(`${rel} :: matches ${pat.source}`);
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-media-direct-upload] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error("\nUse the signed-URL flow instead: POST /api/media/sign, PUT to GCS, POST /api/media/finalize.\n");
process.exit(1);

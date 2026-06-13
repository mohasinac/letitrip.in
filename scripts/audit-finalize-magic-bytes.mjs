#!/usr/bin/env node
/**
 * audit-finalize-magic-bytes — strict-zero.
 *
 * The /api/media/finalize route MUST verify the declared MIME type against
 * actual magic bytes (fileTypeFromBuffer) and emit a structured 422
 * "MIME_MISMATCH" error on disagreement.
 *
 * Exit 0 — both shapes present.
 * Exit 1 — finalize route missing magic-byte verification or structured
 *          mismatch handling.
 */

import { readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TARGET = join(ROOT, "src", "app", "api", "media", "finalize", "route.ts");

let exists = false;
try { exists = statSync(TARGET).isFile(); } catch { exists = false; }
if (!exists) {
  console.error(`[audit-finalize-magic-bytes] ${relative(ROOT, TARGET)} missing.`);
  process.exit(1);
}

const cleaned = readFileSync(TARGET, "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");

const violations = [];
if (!/\bfileTypeFromBuffer\s*\(/.test(cleaned)) {
  violations.push("missing fileTypeFromBuffer() call — magic-byte verification required");
}
if (!/MIME_MISMATCH/.test(cleaned)) {
  violations.push('missing structured "MIME_MISMATCH" error code path');
}
if (!/\b422\b/.test(cleaned)) {
  violations.push("missing 422 status response for MIME mismatch");
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-finalize-magic-bytes] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${relative(ROOT, TARGET)} :: ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

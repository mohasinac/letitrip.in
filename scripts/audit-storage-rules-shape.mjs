#!/usr/bin/env node
/**
 * audit-storage-rules-shape — strict-zero.
 *
 * Firebase Storage MUST stay private-write / public-read. Track E hardens this
 * by parsing appkit/firebase/base/storage.rules and asserting two lines exist:
 *
 *   allow read: if true;
 *   allow write: if false;
 *
 * Any relaxation that admits client writes (allow write: if request.auth..., etc.)
 * fails the audit. Bytes never reach Storage from a browser — they go to a
 * signed URL after /api/media/sign.
 *
 * Exit 0 — both required rules present, no client-write relaxation.
 * Exit 1 — rules file missing or shape violated.
 */

import { readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TARGET = join(ROOT, "appkit", "firebase", "base", "storage.rules");

let exists = false;
try { exists = statSync(TARGET).isFile(); } catch { exists = false; }
if (!exists) {
  console.error(`[audit-storage-rules-shape] ${relative(ROOT, TARGET)} missing.`);
  process.exit(1);
}

const raw = readFileSync(TARGET, "utf8");

const violations = [];
if (!/\ballow\s+read\s*:\s*if\s+true\s*;/.test(raw)) {
  violations.push("missing `allow read: if true;` — proxy depends on read-all");
}
if (!/\ballow\s+write\s*:\s*if\s+false\s*;/.test(raw)) {
  violations.push("missing `allow write: if false;` — clients must never write directly");
}
const offending = raw.match(/allow\s+write\s*:\s*if\s+(?!false)[^;]+;/g);
if (offending && offending.length > 0) {
  for (const o of offending) violations.push(`relaxed write rule found: ${o.trim()}`);
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-storage-rules-shape] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${relative(ROOT, TARGET)} :: ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

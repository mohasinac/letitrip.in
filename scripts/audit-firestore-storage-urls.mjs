#!/usr/bin/env node
/**
 * audit-firestore-storage-urls — strict-zero.
 *
 * No source file may contain a literal `firebasestorage.googleapis.com` or
 * `storage.googleapis.com/v0/` URL substring. Every media reference flows
 * through `/media/<slug>` (the proxy at src/app/api/media/[...slug]/route.ts).
 *
 * Allowed locations:
 *   - src/app/api/media/**            (the proxy + sign + finalize routes
 *                                       resolve real GCS paths internally)
 *   - appkit/src/_internal/server/storage/**
 *   - appkit/src/seed/_helpers/media.ts (the seedExtMedia wrapper definition)
 *
 * Exit 0 — clean.
 * Exit 1 — any disallowed reference found.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const ALLOW_PREFIXES = [
  join("src", "app", "api", "media") + sep,
  join("appkit", "src", "_internal", "server", "storage") + sep,
];
const ALLOW_FILES = [
  join("appkit", "src", "seed", "_helpers", "media.ts"),
  // Sole declarations of the FIREBASE_STORAGE_HOST / GCS_HOST constants.
  // Every other module imports from here.
  join("appkit", "src", "utils", "media-url.ts"),
];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".mjs"]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if ([...EXTS].some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

const PATTERNS = [
  "firebasestorage.googleapis.com",
  "storage.googleapis.com/v0/",
];

const violations = [];
for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (ALLOW_PREFIXES.some((p) => rel.startsWith(p))) continue;
    if (ALLOW_FILES.some((p) => rel === p)) continue;
    const src = readFileSync(file, "utf8");
    for (const p of PATTERNS) {
      if (src.includes(p)) {
        violations.push(`${rel} :: contains literal "${p}" — use /media/<slug> instead`);
      }
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-firestore-storage-urls] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

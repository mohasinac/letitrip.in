#!/usr/bin/env node
/**
 * audit-raw-img-src — strict-zero.
 *
 * No JSX <img src="..."> or src={"..."} may point at a raw Firebase Storage,
 * Google Cloud Storage, or googleusercontent host. The single allowlist
 * exception is `lh3.googleusercontent.com` (Google OAuth profile photos
 * before they are finalized through the media proxy).
 *
 * Exit 0 — clean.
 * Exit 1 — at least one raw src found.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith(".tsx") || e.name.endsWith(".jsx")) out.push(full);
  }
  return out;
}

const FORBIDDEN_HOSTS = [
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
];
const ALLOW_HOST = "lh3.googleusercontent.com";

const violations = [];
for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    const src = readFileSync(file, "utf8");
    const srcAttr = /\bsrc\s*=\s*(["'`])([^"'`]+)\1/g;
    const srcExpr = /\bsrc\s*=\s*\{\s*["'`]([^"'`]+)["'`]\s*\}/g;
    const seen = new Set();
    let m;
    while ((m = srcAttr.exec(src)) !== null) seen.add(m[2]);
    while ((m = srcExpr.exec(src)) !== null) seen.add(m[1]);
    for (const url of seen) {
      if (!/^https?:\/\//.test(url)) continue;
      let host;
      try { host = new URL(url).host; } catch { continue; }
      if (host === ALLOW_HOST) continue;
      if (FORBIDDEN_HOSTS.includes(host) || host.includes("googleusercontent")) {
        violations.push(`${rel} :: src="${url}" — use /media/<slug> via the proxy`);
      }
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-raw-img-src] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

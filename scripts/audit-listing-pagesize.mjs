#!/usr/bin/env node
/**
 * audit-listing-pagesize.mjs - list-endpoint pageSize must be clamped <= 50.
 *
 * Vercel Hobby Fluid Compute is capped at 2 GB / 10 s sync. Loading more
 * than 50 documents per request leaves no headroom for serialisation,
 * sanitisation, and Cache-Control wiring. Routes that accept arbitrary
 * pageSize via the query string can be DoS'd by a single ?pageSize=5000.
 *
 * Root cause this prevents:
 *   /api/products previously accepted any pageSize and forwarded it to the
 *   listingProcessor Function. Now rejects pageSize > 50 with 400.
 *
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const API_DIR = join(ROOT, "src", "app", "api");

function listRouteFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      out.push(...listRouteFiles(full));
    } else if (full.endsWith("route.ts") || full.endsWith("route.tsx")) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];

try {
  statSync(API_DIR);
} catch {
  console.log("OK audit-listing-pagesize - no /src/app/api directory; nothing to scan.");
  process.exit(0);
}

for (const file of listRouteFiles(API_DIR)) {
  const src = readFileSync(file, "utf8");
  if (!/pageSize/.test(src)) continue;
  if (src.includes("audit-pagesize-ok")) continue;

  const hasRejectClamp = />\s*50\b[\s\S]{0,400}status:\s*400/.test(src);
  const hasMathMinClamp = /Math\.min\([^,]+,\s*50\b/.test(src);
  const hasMaxParamClamp = /getNumberParam\([^)]+max:\s*50\b/.test(src);
  const hasMaxConst = /MAX_PAGE_SIZE\s*=\s*50\b/.test(src);
  if (hasRejectClamp || hasMathMinClamp || hasMaxParamClamp || hasMaxConst) continue;

  const overCap = src.match(/getNumberParam\([^)]+max:\s*(\d+)/g) ?? [];
  const offending = overCap.find((m) => {
    const num = Number(m.match(/max:\s*(\d+)/)?.[1] ?? "0");
    return num > 50;
  });
  if (offending) {
    violations.push({ file: relative(ROOT, file), reason: offending });
    continue;
  }

  if (/(searchParams|url).*pageSize/.test(src) || /std\.pageSize/.test(src)) {
    violations.push({ file: relative(ROOT, file), reason: "no clamp for pageSize <= 50" });
  }
}

if (violations.length === 0) {
  console.log("OK audit-listing-pagesize - every list endpoint clamps pageSize <= 50.");
  process.exit(0);
}

console.error("\nFAIL audit-listing-pagesize - " + violations.length + " violation(s) found:");
for (const v of violations) {
  console.error("  " + v.file + " - " + v.reason);
}
console.error("\nClamp pageSize <= 50 per CLAUDE.md Rule #6 (Vercel Hobby caps).");
console.error("Reject larger values with a 400, or annotate the file with // audit-pagesize-ok: <reason>\n");
process.exit(1);

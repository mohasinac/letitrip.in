#!/usr/bin/env node
/**
 * audit-auth-rate-limit — strict-zero.
 *
 * Every exported HTTP handler in src/app/api/auth/[recursive]/route.ts MUST
 * call applyRateLimit(request, RateLimitPresets.<preset>). The preset must
 * be one of AUTH / PASSWORD_RESET / OAUTH — no defaulting.
 *
 * Exit 0 — every auth route is rate-limited.
 * Exit 1 — at least one auth handler missing a rate-limit call.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const AUTH_DIR = join(ROOT, "src", "app", "api", "auth");

const violations = [];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name === "route.ts" || e.name === "route.tsx") out.push(full);
  }
  return out;
}

let exists = false;
try { exists = statSync(AUTH_DIR).isDirectory(); } catch { exists = false; }

if (exists) {
  for (const file of walk(AUTH_DIR)) {
    const rel = relative(ROOT, file);
    const cleaned = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
    const verbExports = cleaned.match(/\bexport\s+(?:const|async\s+function|function)\s+(GET|POST|PUT|PATCH|DELETE)\b/g) ?? [];
    if (verbExports.length === 0) continue;
    if (!/\bapplyRateLimit\s*\(/.test(cleaned)) {
      violations.push(`${rel} :: auth handler(s) ${verbExports.length} without applyRateLimit call`);
      continue;
    }
    if (!/\bRateLimitPresets\.(AUTH|PASSWORD_RESET|OAUTH)\b/.test(cleaned)) {
      violations.push(`${rel} :: applyRateLimit present but no RateLimitPresets.AUTH / PASSWORD_RESET / OAUTH selected`);
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-auth-rate-limit] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

#!/usr/bin/env node
/**
 * audit-route-rbac — strict-zero.
 *
 * For every src/app/api/[recursive]/route.ts file: every exported HTTP verb
 * (GET / POST / PUT / PATCH / DELETE) must use one of these recognised patterns:
 *
 *   1. createRouteHandler({ ... }) or createApiHandler({ ... }) — the appkit
 *      handler factories. roles/permission optional (omitting = public endpoint).
 *   2. withProviders(handler) — delegates to an appkit or local handler that
 *      owns its own auth internally.
 *   3. withFeatureGuard("FLAG", handler) — feature-flag gate; handler inside
 *      uses createRouteHandler/createApiHandler with proper auth.
 *   4. Thin init-shim: async function that only calls initProviders() then
 *      delegates via dynamic import("@mohasinac/appkit").
 *   5. Infrastructure paths — auth routes, demo utilities, media proxy,
 *      webhooks — are exempt; they self-verify or don't need session auth.
 *
 * No rbac-public or rbac-scope-enforced-in-handler markers accepted.
 *
 * Exit 0 — clean.
 * Exit 1 — any verb export missing a recognised guard pattern.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const API_DIR = join(ROOT, "src", "app", "api");

// Verb export line — catches const, async function, or plain function forms
const VERB_EXPORT = /^[\s]*export\s+(?:const|async\s+function|function)\s+(GET|POST|PUT|PATCH|DELETE)\b/;

// Handler factory patterns
const HAS_ROUTE_HANDLER   = /\bcreateRouteHandler\s*\(/;
const HAS_API_HANDLER     = /\bcreateApiHandler\s*(?:<[^>]*>)?\s*\(/;
const HAS_WITH_PROVIDERS  = /\bwithProviders\s*\(/;
const HAS_FEATURE_GUARD   = /\bwithFeatureGuard\s*\(/;
// Thin shim: dynamic import inside function body
const HAS_APPKIT_DYN_IMPORT = /import\s*\(\s*["']@mohasinac\/appkit["']\s*\)/;

// Infrastructure path prefixes exempt from session-auth requirements
const EXEMPT_PATH_PREFIXES = [
  "src/app/api/auth/",
  "src/app/api/demo/",
  "src/app/api/media/",
  "src/app/api/webhooks/",
];

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
try { exists = statSync(API_DIR).isDirectory(); } catch { exists = false; }
if (!exists) process.exit(0);

const violations = [];

for (const file of walk(API_DIR)) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");

  // Infrastructure paths — auth, demo, media, webhooks
  const isExempt = EXEMPT_PATH_PREFIXES.some((prefix) => rel.startsWith(prefix));
  if (isExempt) continue;

  const raw = readFileSync(file, "utf8");

  // File-level checks — if ANY of these are true, the whole file uses a valid pattern
  const fileOk =
    HAS_ROUTE_HANDLER.test(raw)    ||  // createRouteHandler — the canonical appkit factory
    HAS_API_HANDLER.test(raw)      ||  // createApiHandler — older appkit factory, same guarantees
    HAS_WITH_PROVIDERS.test(raw)   ||  // withProviders — delegates to an appkit or local handler
    HAS_FEATURE_GUARD.test(raw)    ||  // withFeatureGuard — feature-flag gate over a guarded handler
    HAS_APPKIT_DYN_IMPORT.test(raw);   // thin shim: dynamic import("@mohasinac/appkit") inside fn

  if (!fileOk) {
    // Flag every exported verb — the file has no recognised guarding pattern
    const lines = raw.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const m = VERB_EXPORT.exec(lines[i]);
      if (!m) continue;
      violations.push(
        `${rel}:${i + 1} :: ${m[1]} — no handler factory (createRouteHandler/createApiHandler), ` +
        `withProviders, withFeatureGuard, or dynamic appkit import found in file`,
      );
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-route-rbac] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
console.error("Fix options:");
console.error("  • Wrap handler in createRouteHandler({ roles, permission, handler })");
console.error("  • For public endpoints: createRouteHandler({ handler }) (no roles/permission = public)");
console.error("  • For init-shims: use dynamic import(\"@mohasinac/appkit\") inside the function body");
console.error("  • For infra routes: move to /api/auth/, /api/demo/, /api/media/, or /api/webhooks/\n");
process.exit(1);

#!/usr/bin/env node
/**
 * audit-route-rbac — strict-zero.
 *
 * For every src/app/api/[recursive]/route.ts file: every exported HTTP verb
 * (GET / POST / PUT / PATCH / DELETE) must be either:
 *
 *   - Wrapped by createRouteHandler({ ... }) (the appkit primitive), OR
 *   - Marked with `// rbac-public: <reason>` on the line above the export.
 *
 * Public listing endpoints (products, categories, blog, etc.) get the
 * suppression marker. Everything else flows through createRouteHandler so the
 * `roles` and `permission` shape is enforced at one place.
 *
 * Exit 0 — clean.
 * Exit 1 — any verb export missing both a guard and a marker.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const API_DIR = join(ROOT, "src", "app", "api");

const VERB_EXPORT = /^[\s]*export\s+(?:const|async\s+function|function)\s+(GET|POST|PUT|PATCH|DELETE)\b/;
const RBAC_PUBLIC_MARKER = /\/\/\s*rbac-public:\s*\S+/;
const SCOPE_MARKER = /\/\/\s*rbac-scope-enforced-in-handler:\s*\S+/;
const CREATE_ROUTE_HANDLER = /\bcreateRouteHandler\s*\(/;
const ROLES_KEY = /\broles\s*:\s*[\s\S]*?(\bROLES_|\[)/;
const PERMISSION_KEY = /\bpermission\s*:\s*["']/;

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
  const rel = relative(ROOT, file);
  const raw = readFileSync(file, "utf8");
  const lines = raw.split("\n");
  const fileHasCreateRouteHandler = CREATE_ROUTE_HANDLER.test(raw);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = VERB_EXPORT.exec(line);
    if (!m) continue;
    const verb = m[1];
    // Look at the previous non-empty lines for a marker.
    let marker = null;
    for (let k = i - 1; k >= 0 && k >= i - 3; k--) {
      const prev = lines[k]?.trim() ?? "";
      if (prev === "") continue;
      if (RBAC_PUBLIC_MARKER.test(prev) || SCOPE_MARKER.test(prev)) {
        marker = prev;
      }
      break;
    }
    if (marker) continue;
    if (!fileHasCreateRouteHandler) {
      violations.push(`${rel}:${i + 1} :: ${verb} export with no createRouteHandler and no rbac-public marker`);
      continue;
    }
    // Verb is wrapped by createRouteHandler — additionally require roles and
    // permission keys somewhere in the file, OR a scope-enforced marker
    // before the export.
    if (!ROLES_KEY.test(raw) && !marker) {
      violations.push(`${rel}:${i + 1} :: ${verb} createRouteHandler missing roles: [...] (or // rbac-scope-enforced-in-handler marker)`);
    }
    if (!PERMISSION_KEY.test(raw) && !marker) {
      violations.push(`${rel}:${i + 1} :: ${verb} createRouteHandler missing permission: "..." (or // rbac-scope-enforced-in-handler marker)`);
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-route-rbac] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

#!/usr/bin/env node
/**
 * audit-orphan-dev-routes — strict-zero.
 *
 * Track H deletes the orphaned `/api/dev/mock-*` HTTP routes wholesale in
 * favor of in-process mock providers selected via
 * `siteSettings.featureFlags.useMockPayment` / `useMockShipping`. This audit
 * blocks any future route from being added under `src/app/api/dev/`.
 *
 * The only routes legitimately living under `/api/dev/` would be admin-only
 * developer tooling (e.g. cache flush, queue replay) — and those belong under
 * `src/app/api/admin/dev/` so the existing admin layout's permission gates
 * apply. The audit therefore disallows src/app/api/dev/[recursive]/route.ts outright.
 *
 * Exit 0 — clean (no such files exist).
 * Exit 1 — at least one route file exists under src/app/api/dev/.
 */

import { readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TARGET = join(ROOT, "src", "app", "api", "dev");

const violations = [];

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else if (e.name === "route.ts" || e.name === "route.tsx") {
      violations.push(relative(ROOT, full));
    }
  }
}

let exists = false;
try { exists = statSync(TARGET).isDirectory(); } catch { exists = false; }
if (exists) walk(TARGET);

if (violations.length === 0) process.exit(0);
console.error("\n[audit-orphan-dev-routes] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(
  "\nDev mocking must live in-process via siteSettings.featureFlags.useMock{Payment,Shipping}. " +
    "Admin-only developer tooling belongs under src/app/api/admin/dev/ behind a createRouteHandler guard.\n",
);
process.exit(1);

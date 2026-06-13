#!/usr/bin/env node
/**
 * audit-shipping-provider-import — strict-zero.
 *
 * Enforces the Track H invariant: no source file outside the shipping-provider
 * directory may call the Shiprocket REST API directly. Every consumer flows
 * through `getProviders().shipping.{createShipment,trackShipment,...}`.
 *
 * Allowed locations:
 *   - appkit/src/providers/shipping-shiprocket/**
 *   - appkit/src/_internal/server/providers/shipping/**
 *
 * Exit 0 — clean
 * Exit 1 — any violator listed.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const ALLOW = [
  join("appkit", "src", "providers", "shipping-shiprocket") + sep,
  join("appkit", "src", "_internal", "server", "providers", "shipping") + sep,
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

const SHIPROCKET_HOST = "apiv2.shiprocket.in";
const violations = [];
for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (ALLOW.some((p) => rel.startsWith(p))) continue;
    const src = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
    if (src.includes(SHIPROCKET_HOST)) {
      violations.push(`${rel} :: references ${SHIPROCKET_HOST} directly — use getProviders().shipping`);
    }
    if (/from\s+["']@?[\w\-/]*shiprocket[\w\-/]*["']/.test(src)) {
      violations.push(`${rel} :: imports a Shiprocket SDK directly — use getProviders().shipping`);
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-shipping-provider-import] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

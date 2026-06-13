#!/usr/bin/env node
/**
 * audit-payment-provider-import — strict-zero.
 *
 * Enforces the Track H invariant: no source file outside the payment-provider
 * directory may import the `razorpay` npm package or instantiate
 * `new Razorpay(...)`. Every consumer flows through
 * `getProviders().payment.{createOrder,verifyWebhook,capturePayment,refund}`.
 *
 * Allowed locations:
 *   - appkit/src/providers/payment-razorpay/**
 *   - appkit/src/_internal/server/providers/payment/**
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
  join("appkit", "src", "providers", "payment-razorpay") + sep,
  join("appkit", "src", "_internal", "server", "providers", "payment") + sep,
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

const violations = [];
for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (ALLOW.some((p) => rel.startsWith(p))) continue;
    const src = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
    if (/from\s+["']razorpay["']/.test(src) || /\brequire\s*\(\s*["']razorpay["']\s*\)/.test(src)) {
      violations.push(`${rel} :: imports the "razorpay" package`);
    }
    if (/\bnew\s+Razorpay\s*\(/.test(src)) {
      violations.push(`${rel} :: instantiates new Razorpay(...) directly`);
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-payment-provider-import] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

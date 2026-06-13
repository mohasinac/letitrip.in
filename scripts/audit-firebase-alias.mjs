#!/usr/bin/env node
/**
 * audit-firebase-alias.mjs — Assert Firebase dedup alias is wired.
 *
 * CLAUDE.md Root Cause #14: `appkit/node_modules/firebase` and root
 * `node_modules/firebase` are separate package copies. If webpack/Turbopack
 * resolves `firebase/app` to two different module instances, the Firebase
 * app registry is split — `initializeApp()` registers in one instance, but
 * `getAuth()`/`getFirestore()` look in the other and throw:
 *   "No Firebase App '[DEFAULT]' has been created"
 *
 * The fix is two aliases that must both be present:
 *   1. next.config.js  → turbopack.resolveAlias.firebase = root/node_modules/firebase
 *      (Turbopack does not respect webpack aliases — needs its own.)
 *   2. appkit/src/configs/next.ts → config.resolve.alias.firebase = root/node_modules/firebase
 *      (Webpack alias inside defineNextConfig's mergedWebpack.)
 *
 * This audit greps both files for the alias presence and fails if either is
 * missing. Strict-zero. Wire into stop hook + check:audits.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const CHECKS = [
  {
    file: join(ROOT, "next.config.js"),
    label: "next.config.js turbopack.resolveAlias.firebase",
    // Look for `resolveAlias` block AND `firebase:` key pointing to a node_modules path.
    pattern: /resolveAlias\s*:\s*\{[\s\S]*?firebase\s*:[\s\S]*?node_modules[\\/]firebase/,
    fix: "Add to defineNextConfig({...}) → turbopack.resolveAlias.firebase = path.resolve(__dirname, 'node_modules/firebase').",
  },
  {
    file: join(ROOT, "appkit", "src", "configs", "next.ts"),
    label: "appkit/src/configs/next.ts webpack resolve.alias.firebase",
    // The defineNextConfig mergedWebpack block aliases firebase.
    pattern: /config\.resolve\.alias\s*=\s*\{[\s\S]*?firebase[\s\S]*?_firebaseRoot|alias\s*\[\s*["']firebase["']\s*\]\s*=/,
    fix: "Restore the webpack alias in defineNextConfig: config.resolve.alias.firebase = path.resolve(cwd, 'node_modules/firebase').",
  },
];

const failures = [];
for (const c of CHECKS) {
  if (!existsSync(c.file)) {
    failures.push({ label: c.label, reason: `file not found: ${c.file}`, fix: c.fix });
    continue;
  }
  const src = readFileSync(c.file, "utf8");
  if (!c.pattern.test(src)) {
    failures.push({ label: c.label, reason: "alias missing or pattern not matched", fix: c.fix });
  }
}

if (failures.length === 0) {
  console.log("audit-firebase-alias: clean ✓");
  process.exit(0);
}

console.error(`audit-firebase-alias: ${failures.length} missing alias(es).\n`);
for (const f of failures) {
  console.error(`  ✗ ${f.label}`);
  console.error(`    ${f.reason}`);
  console.error(`    Fix: ${f.fix}\n`);
}
console.error(
  "Why: Root Cause #14 — dual-module Firebase instance silently breaks " +
    "initializeApp()/getAuth() in prod. Removing either alias has caused a " +
    "production outage on this project before.",
);
process.exit(1);

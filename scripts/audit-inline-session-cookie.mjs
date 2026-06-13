#!/usr/bin/env node
/**
 * audit-inline-session-cookie — strict-zero.
 *
 * Every read of the __session cookie MUST go through the centralized helper
 * in src/lib/firebase/auth-server.ts (getServerSessionUser /
 * requireAuthFromRequest / requireRoleFromRequest / getUserFromRequest).
 * Inline cookies().get("__session") in any other file is a violation.
 *
 * Exit 0 — clean.
 * Exit 1 — at least one inline cookie read found outside auth-server.ts.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const ALLOWED = [
  join(ROOT, "src", "lib", "firebase", "auth-server.ts"),
  // Edge runtime cannot import firebase-admin; the proxy first-gate uses a
  // signature-less JWT decode in this dedicated helper instead. RSC layouts
  // re-verify with the real server helper.
  join(ROOT, "src", "lib", "edge", "session-role.ts"),
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

const PATTERN_GET = /\bcookies\s*\(\s*\)\s*\?\.\s*get\s*\(\s*["']__session["']/;
const PATTERN_GET_PLAIN = /\bcookies\s*\(\s*\)\s*\.\s*get\s*\(\s*["']__session["']/;
const PATTERN_REQ_COOKIES = /\brequest\.cookies\s*\.\s*get\s*\(\s*["']__session["']/;

const violations = [];
for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    if (ALLOWED.includes(file)) continue;
    const src = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
    if (PATTERN_GET.test(src) || PATTERN_GET_PLAIN.test(src) || PATTERN_REQ_COOKIES.test(src)) {
      violations.push(`${relative(ROOT, file)} :: reads __session cookie inline — use auth-server helpers`);
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-inline-session-cookie] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

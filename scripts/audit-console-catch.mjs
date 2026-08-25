#!/usr/bin/env node
/**
 * audit-console-catch.mjs — flags `.catch(console.error)` and `.catch(console.warn)`
 * in server-side code (API routes, server actions, appkit server utilities).
 *
 * Why these are wrong in server code:
 *   - `console.error` bypasses `normalizeError` — errors stay as `unknown`
 *   - No structured context (uid, productId, path) — impossible to investigate
 *   - In Vercel's log buffer (4 KB/s), a raw Error object truncates to `[object Object]`
 *   - Signals the operation is "non-critical" but does not use safeFireAndForget's
 *     structured warning pattern
 *
 * Fix:
 *   - Non-critical fire-and-forget: `safeFireAndForget(promise, "context label")`
 *   - Operations that must succeed: a real `catch (err) { ... }` with normalizeError
 *
 * Scope: server-side files only (API routes, server actions, appkit without "use client").
 * Client-side files (hooks, components) may use console.error in development;
 * those are covered by audit-silent-fetch-catch.mjs instead.
 *
 * Run:  node scripts/audit-console-catch.mjs
 *       (Strict since W2 — any violation fails. There is no report mode.)
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Only server-side paths
const SCAN_ROOTS = [
  join(ROOT, "src", "app", "api"),
  join(ROOT, "src", "actions"),
  join(ROOT, "appkit", "src"),
];

const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".next", "out", "__tests__", "__mocks__"]);
const EXCLUDED_SUFFIXES = [".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", ".d.ts"];

// Matches `.catch(console.error)` and `.catch(console.warn)` with optional whitespace
const CONSOLE_CATCH_RE = /\.catch\s*\(\s*console\.(error|warn)\s*\)/g;

function isClientFile(src) {
  // First non-empty, non-comment line is "use client" (with or without semicolon)
  for (const line of src.split("\n")) {
    const trimmed = line.trim().replace(/;$/, "");
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    return trimmed === '"use client"' || trimmed === "'use client'";
  }
  return false;
}

function* walkFiles(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); }
  catch (_err) { return; /* dir does not exist */ }
  for (const e of entries) {
    if (EXCLUDED_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) { yield* walkFiles(full); continue; }
    if (!/\.(ts|tsx)$/.test(e.name)) continue;
    if (EXCLUDED_SUFFIXES.some((s) => e.name.endsWith(s))) continue;
    yield full;
  }
}

const violations = [];

for (const root of SCAN_ROOTS) {
  try { statSync(root); } catch (_err) { continue; }
  for (const file of walkFiles(root)) {
    let src;
    try { src = readFileSync(file, "utf8"); } catch (_err) { continue; }
    if (!src.includes("catch")) continue;

    // Skip client components — they can log to console in dev
    if (isClientFile(src)) continue;

    const lines = src.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comment lines — docstrings and inline comments are not executable
      const trimmed = line.trimStart();
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
      CONSOLE_CATCH_RE.lastIndex = 0;
      if (CONSOLE_CATCH_RE.test(line)) {
        violations.push({
          file: relative(ROOT, file).replace(/\\/g, "/"),
          line: i + 1,
          snippet: line.trim().slice(0, 100),
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("✓ audit-console-catch — no .catch(console.error/warn) in server code.");
  process.exit(0);
}

// Strict as of W2. This audit reports ZERO violations today, so making it
// block costs nothing and buys real regression protection. An audit that
// cannot fail is documentation, not a gate — `audit-listing-detail-affordance`
// proved it by silently absorbing two new dead-end listing views while
// reporting a number nobody was obliged to act on.
//
// The per-line suppression marker stays the escape hatch; a tolerated COUNT
// does not, because it hides which instances are known and which are new.
console.error(`\n✗ audit-console-catch — ${violations.length} violation(s):`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  — ${v.snippet}`);
}
console.error("\nFix: replace with `safeFireAndForget(promise, \"context\")` for non-critical ops,");
console.error("or a real `catch (err) { void normalizeError(err); serverLogger.warn(...); }` for important ops.");
process.exit(1);

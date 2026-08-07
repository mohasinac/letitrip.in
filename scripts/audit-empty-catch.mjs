#!/usr/bin/env node
/**
 * audit-empty-catch.mjs — flags `catch {}` blocks with no binding variable.
 *
 * A catch block with no binding (`catch {}`) cannot call `normalizeError(err)`
 * because there is no `err` variable. This means:
 *   - Errors are silently dropped with no logging
 *   - The `audit-catch-normalize` audit cannot enforce normalizeError at these sites
 *   - Structured logging is impossible — on-call engineers cannot investigate
 *
 * Fix:
 *   - For genuinely intentional silent catches: `catch (_err) { // reason why failure
 *     cannot propagate }` — the underscore-prefixed binding satisfies both audits
 *     without requiring a log call, and the comment documents the invariant.
 *   - For important errors: `catch (err) { void normalizeError(err); serverLogger.warn(...); }`
 *
 * Do NOT add suppression markers — fix the code.
 *
 * Run:  node scripts/audit-empty-catch.mjs
 *       STRICT=1 node scripts/audit-empty-catch.mjs   # force fail (useful in CI)
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_ROOTS = [
  join(ROOT, "src"),
  join(ROOT, "appkit", "src"),
];

const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".next", "out", "__tests__", "__mocks__"]);
const EXCLUDED_SUFFIXES = [".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", ".d.ts"];

// Matches `catch {` — no binding (no parenthesised expression after `catch`)
// Handles: `} catch {`, `catch {`, with optional whitespace.
const EMPTY_CATCH_RE = /\bcatch\s*\{/g;

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
  try { statSync(root); } catch (_err) { continue; /* root not present */ }
  for (const file of walkFiles(root)) {
    let src;
    try { src = readFileSync(file, "utf8"); } catch (_err) { continue; }
    if (!src.includes("catch")) continue;

    EMPTY_CATCH_RE.lastIndex = 0;
    let m;
    while ((m = EMPTY_CATCH_RE.exec(src)) !== null) {
      const before = src.slice(0, m.index);
      const lineNum = before.split("\n").length;
      violations.push({ file: relative(ROOT, file).replace(/\\/g, "/"), line: lineNum, snippet: m[0] });
    }
  }
}

if (violations.length === 0) {
  console.log("✓ audit-empty-catch — no `catch {}` blocks found.");
  process.exit(0);
}

const strict = process.env.STRICT === "1";
const exitCode = strict ? 1 : 0;

if (strict) {
  console.error(`\n✗ audit-empty-catch — ${violations.length} violation(s):`);
} else {
  console.warn(`\n⚠ audit-empty-catch — ${violations.length} violation(s) (report mode; set STRICT=1 to fail):`);
}
for (const v of violations) {
  console[strict ? "error" : "warn"](`  ${v.file}:${v.line}  — ${v.snippet}`);
}
if (!strict) {
  console.warn("\nFix: add a binding variable. For intentional silent catches use");
  console.warn("  `catch (_err) { /* reason the failure cannot propagate */ }`");
  console.warn("For important errors use `catch (err) { void normalizeError(err); ... }`");
}
process.exit(exitCode);

#!/usr/bin/env node
/**
 * audit-bulk-action-registry.mjs — Rule #7 enforcement: every bulk-action bar
 * must source its actions array from a named preset (`ADMIN_BULK_ACTIONS`,
 * `SELLER_BULK_ACTIONS`, `USER_*_ACTIONS`, `LISTING_BULK_ACTIONS`), never a
 * hand-built inline array of `{ id, label, onClick }` objects.
 *
 * Heuristic: a file that defines a `buildBulkActions`/`bulkActions` value
 * (function or array) AND contains an inline object literal shaped like
 * `{ id: "...", label: ... }` inside that same file, but never imports one
 * of the preset constants, is flagged — the array almost certainly wasn't
 * built from the registry.
 *
 * Baseline-drift while the consumer sweep is in flight (matches the
 * project's own audit-html-wrappers.mjs precedent for large sweeps) —
 * current count locks today; only regressions block.
 *
 * Exits 0 on clean (within baseline), 1 on regression.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__", "scripts"]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;

const PRESET_NAMES = /\b(?:ADMIN_BULK_ACTIONS|SELLER_BULK_ACTIONS|USER_[A-Z_]*BULK_ACTIONS|LISTING_BULK_ACTIONS)\b/;
const BULK_ACTIONS_DECL_RE = /\b(?:buildBulkActions|bulkActions)\s*[:=]/;
const INLINE_OBJECT_RE = /\{\s*id\s*:\s*["'`][\w-]+["'`]\s*,\s*label\s*:/;

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (extname(entry.name) === ".tsx" && !SKIP_FILE_RE.test(entry.name)) files.push(full);
  }
  return files;
}

const violations = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const content = readFileSync(file, "utf8");
    if (!BULK_ACTIONS_DECL_RE.test(content)) continue;
    if (!INLINE_OBJECT_RE.test(content)) continue;
    if (PRESET_NAMES.test(content)) continue; // references a registry preset somewhere in the file
    violations.push(relative(ROOT, file).replace(/\\/g, "/"));
  }
}

// Baseline = current count of files with a hand-built bulk-action array and
// no registry preset reference, locked 2026-08-09 after AdminCouponsView.tsx
// was fixed (the reference conversion pattern). 25 other admin/seller list
// views still hand-build their bulk-action arrays — drive this to 0 in the
// consumer sweep; rerun this script any time to see exactly which remain.
const BASELINE = 25;

if (violations.length <= BASELINE) {
  console.log(`audit-bulk-action-registry: clean ✓ (${violations.length}/${BASELINE})`);
  process.exit(0);
}

console.error(`audit-bulk-action-registry: ${violations.length} file(s) with a hand-built bulk-action array and no ADMIN_BULK_ACTIONS/SELLER_BULK_ACTIONS/etc. preset reference (baseline ${BASELINE}).`);
console.error("Fix: map ADMIN_BULK_ACTIONS.<resource> (or the matching preset) IDs to { ...ROW_ACTION_META[id], onClick: handler } — see AdminCouponsView.tsx for the pattern.\n");
for (const f of violations) console.error(`  ${f}`);
process.exit(1);

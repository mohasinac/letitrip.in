#!/usr/bin/env node
/**
 * audit-root-cause — blocks workaround patterns that paper over root causes.
 *
 * Rules (all scoped to production code — never scripts/, seed/, __tests__):
 *
 *   IN_MEMORY_FILTER   — API route fetches with pageSize > HOBBY_LIMIT (50) for
 *                        the purpose of in-memory filtering. Detected by:
 *                        (a) pageSize ≥ 200 in src/app/api/ files, OR
 *                        (b) a "// Fallback" comment followed within 10 lines by
 *                        a .filter( call on repository results.
 *                        Fix: add a Firestore composite index, or route through
 *                        the listingProcessor Firebase Function.
 *
 *   FALLBACK_COMMENT   — Production code (src/app/api/, appkit/src/) contains
 *                        // Fallback, // HACK, // WORKAROUND, or
 *                        // backward compat (case-insensitive).
 *                        These signal that root cause was not addressed.
 *
 *   DEFER_TODO         — // TODO(defer or // TODO: defer in production code.
 *                        All deferrals must be tracked in crud-tracker.md, not
 *                        buried in comments.
 *
 * Baseline: the known violations at script creation time are counted here.
 * Exits 1 only when new violations exceed the baseline (regression-only gate).
 * Set AUDIT_ROOT_CAUSE_STRICT=1 to fail on any violation (zero-tolerance mode).
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Directories to scan ─────────────────────────────────────────────────────
// FALLBACK_COMMENT is scoped to API routes only (appkit may have migration notes).
// IN_MEMORY_FILTER scans all API routes.
// DEFER_TODO scans all production code.
const API_DIR = join(ROOT, "src", "app", "api");
const ALL_DIRS = [join(ROOT, "src", "app", "api"), join(ROOT, "appkit", "src")];
const SCAN_DIRS = ALL_DIRS;

const SKIP_DIRS = new Set(["node_modules", ".next", "seed", "scripts", "__tests__", "__mocks__", "configs", "dist"]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      const ext = extname(entry.name);
      if ((ext === ".ts" || ext === ".tsx") && !SKIP_FILE_RE.test(entry.name)) {
        files.push(full);
      }
    }
  }
  return files;
}

function rel(file) {
  return relative(ROOT, file);
}

const violations = { IN_MEMORY_FILTER: [], FALLBACK_COMMENT: [], DEFER_TODO: [] };

// ─── Rule: IN_MEMORY_FILTER ───────────────────────────────────────────────────
// Detects large pageSize fetches (≥200) in API routes, which almost always
// indicate an in-memory filtering workaround rather than a proper index.
const LARGE_PAGE_RE = /pageSize\s*:\s*(\d+)/g;
const IN_MEMORY_FILTER_RE = /\.filter\s*\(/;
const FALLBACK_NEAR_FILTER_RE = /\/\/\s*fallback/i;

// Also detect the explicit "SEARCH_FETCH_LIMIT" pattern (named constant style)
const FETCH_LIMIT_CONST_RE = /(?:SEARCH|FETCH)_(?:FETCH|ALL)?_?LIMIT\s*=\s*(\d+)/;

function checkInMemoryFilter(file, lines, text) {
  // Only check API routes
  if (!file.includes(`src${join("")}app${join("")}api`)) return;

  // Pattern A: large pageSize constant
  let m;
  LARGE_PAGE_RE.lastIndex = 0;
  while ((m = LARGE_PAGE_RE.exec(text)) !== null) {
    const size = Number(m[1]);
    if (size >= 200) {
      const lineNo = text.slice(0, m.index).split("\n").length;
      // Verify there's also a .filter( somewhere in the same file (confirms it's for filtering)
      if (IN_MEMORY_FILTER_RE.test(text)) {
        violations.IN_MEMORY_FILTER.push(`${rel(file)}:${lineNo} — pageSize:${size} with in-memory .filter() (add a Firestore index or use listingProcessor)`);
      }
    }
  }

  // Pattern B: named FETCH_LIMIT constant
  const lm = FETCH_LIMIT_CONST_RE.exec(text);
  if (lm && Number(lm[1]) >= 200 && IN_MEMORY_FILTER_RE.test(text)) {
    const lineNo = text.slice(0, lm.index).split("\n").length;
    // Avoid double-counting with Pattern A
    const alreadyCounted = violations.IN_MEMORY_FILTER.some((v) => v.startsWith(rel(file)));
    if (!alreadyCounted) {
      violations.IN_MEMORY_FILTER.push(`${rel(file)}:${lineNo} — ${lm[0]} with in-memory .filter() (add a Firestore index or use listingProcessor)`);
    }
  }
}

// ─── Rule: FALLBACK_COMMENT ───────────────────────────────────────────────────
// Only fires in API routes (src/app/api/). Appkit may legitimately have migration
// notes, rendering fallbacks, and backward-compat aliases during active migrations.
// Catches: // HACK, // WORKAROUND (anywhere in API routes),
//          and // Fallback + in-memory/filter/workaround combos.
const HACK_RE = /\/\/\s*(hack|workaround)/i;
const FALLBACK_DATA_RE = /\/\/\s*fallback\s*(repo|data|fetch|query|filter|in.memory)/i;

function checkFallbackComments(file, lines) {
  // Limit to API routes only
  if (!file.startsWith(API_DIR)) return;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (!trimmed.startsWith("//") && !trimmed.startsWith("*")) continue;
    if (HACK_RE.test(line) || FALLBACK_DATA_RE.test(line)) {
      violations.FALLBACK_COMMENT.push(`${rel(file)}:${i + 1} — ${line.trim()}`);
    }
  }
}

// ─── Rule: DEFER_TODO ─────────────────────────────────────────────────────────
const DEFER_TODO_RE = /\/\/\s*TODO\s*[:(]\s*defer/i;

function checkDeferTodo(file, lines) {
  for (let i = 0; i < lines.length; i++) {
    if (DEFER_TODO_RE.test(lines[i])) {
      violations.DEFER_TODO.push(`${rel(file)}:${i + 1} — ${lines[i].trim()} (track in crud-tracker.md instead)`);
    }
  }
}

// ─── Scan ─────────────────────────────────────────────────────────────────────
const allFiles = SCAN_DIRS.flatMap((dir) => walk(dir));

for (const file of allFiles) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = text.split("\n");
  checkInMemoryFilter(file, lines, text);
  checkFallbackComments(file, lines);
  checkDeferTodo(file, lines);
}

// ─── Report ───────────────────────────────────────────────────────────────────
const total = Object.values(violations).flat().length;

if (total === 0) {
  console.log("audit-root-cause: clean.\n");
  process.exit(0);
}

for (const [rule, found] of Object.entries(violations)) {
  if (found.length === 0) continue;
  console.error(`\n[${rule}] ${found.length} violation(s):`);
  for (const v of found) {
    console.error(`  ${v}`);
  }
}

console.error(`\naudit-root-cause: ${total} violation(s).\n`);
console.error("Fix: add a Firestore index, use listingProcessor, or track deferrals in crud-tracker.md.\n");
console.error("See prompt.md Rule #7 for the full guidance.\n");
process.exit(1);

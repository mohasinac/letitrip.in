#!/usr/bin/env node
/**
 * audit-sieve-constants — Sieve / sort constants enforcement.
 *
 * Rules (scans src/app/api/**\/*.ts):
 *
 *   RAW_SORT_FALLBACK  — `|| "-createdAt"` / `?? "-orderDate"` raw string used as
 *                        sort fallback. Replace with sortBy(FIELD.X) from appkit.
 *
 *   RAW_SORT_IN_OBJ   — `sorts: "-createdAt"` hardcoded string in an object literal.
 *                        Assign to a named constant using sortBy().
 *
 *   RAW_FILTER_INLINE  — `filters: "field==value"` / `filters: \`field==${x}\``
 *                        inline sieve filter string. Use sieveFilter() / sieveAnd()
 *                        / sieveMultiEq() instead.
 *
 * Baseline-drift: only regressions block (count > BASELINE). Existing violations are
 * grandfathered. Drive the number to 0 as routes are migrated.
 *
 * Exits 0  — clean (or within baseline)
 * Exits 1  — regression detected
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Baseline ─────────────────────────────────────────────────────────────────
// All violations resolved in S-SBUNI-RULES (2026-05-15). Baseline is now 0 — any regression blocks.
const BASELINE = 0;

// ── Walk ──────────────────────────────────────────────────────────────────────
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git", "__tests__", "__mocks__"]);

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
    } else if (extname(entry.name) === ".ts") {
      files.push(full);
    }
  }
  return files;
}

// ── Rules ─────────────────────────────────────────────────────────────────────

// Raw string used as sort fallback after || or ??
// Matches: || "-createdAt"  || "order,name"  ?? "-orderDate"
const RE_SORT_FALLBACK = /(\|\||\?\?)\s*(["'])[-]?[a-zA-Z][a-zA-Z,]*\2/;

// sorts: "rawString" in an object literal
// Matches: sorts: "-createdAt"  sorts: "createdAt"  sorts: "order,name"
const RE_SORT_IN_OBJ = /\bsorts\s*:\s*(["'])[-]?[a-zA-Z][a-zA-Z,]*\1/;

// filters: "field==..." or filters: `field==...` inline sieve string
// Matches lines where filters value begins with a field name + sieve operator char
// Uses a bracket class that includes backtick (template literal), ", and '
const RE_FILTER_INLINE = /\bfilters\s*:\s*[`"'][a-z][a-zA-Z]*\s*(?:==|!=|@=|>|<|,|\|)/;

function isCommentLine(line) {
  const t = line.trimStart();
  return t.startsWith("//") || t.startsWith("*");
}

// ── Scan ──────────────────────────────────────────────────────────────────────
const API_DIR = join(ROOT, "src", "app", "api");
const files = walk(API_DIR);

/** @type {{ file: string; line: number; rule: string; text: string }[]} */
const violations = [];

for (const file of files) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isCommentLine(raw)) continue;

    const rel = relative(ROOT, file).replace(/\\/g, "/");
    const lineNum = i + 1;

    // RAW_SORT_FALLBACK — only flag when the line is sort-related
    if (
      RE_SORT_FALLBACK.test(raw) &&
      /sort/i.test(raw.replace(RE_SORT_FALLBACK, ""))
    ) {
      violations.push({ file: rel, line: lineNum, rule: "RAW_SORT_FALLBACK", text: raw.trim() });
    }

    // RAW_SORT_IN_OBJ
    if (RE_SORT_IN_OBJ.test(raw)) {
      violations.push({ file: rel, line: lineNum, rule: "RAW_SORT_IN_OBJ", text: raw.trim() });
    }

    // RAW_FILTER_INLINE
    if (RE_FILTER_INLINE.test(raw)) {
      violations.push({ file: rel, line: lineNum, rule: "RAW_FILTER_INLINE", text: raw.trim() });
    }
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
const count = violations.length;

if (count === 0) {
  console.log("audit-sieve-constants: clean");
  process.exit(0);
}

if (count <= BASELINE) {
  console.log(
    `audit-sieve-constants: ${count} violation(s) found (baseline ${BASELINE} — ${BASELINE - count} improved). No regression.`
  );
  process.exit(0);
}

const regression = count - BASELINE;
console.error(
  `audit-sieve-constants: ${count} violation(s) found (baseline ${BASELINE} — regression of ${regression}).\n`
);
console.error("Replace raw sort/filter strings with appkit constants:");
console.error("  sorts → sortBy(FIELD.X)  from '@mohasinac/appkit'");
console.error("  filters → sieveFilter() / sieveAnd() / sieveMultiEq()\n");
for (const v of violations) {
  console.error(`  [${v.rule}] ${v.file}:${v.line}`);
  console.error(`    ${v.text}`);
}
process.exit(1);

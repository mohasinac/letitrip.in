#!/usr/bin/env node
/**
 * audit-raw-money-math — flags the hand-rolled `Math.round(x * 100) / 100`
 * rupee-rounding idiom outside its one canonical definition.
 *
 * `roundRupees(amount)` in appkit/src/utils/number.formatter.ts is the
 * single source of truth for "round a rupee-denominated value to 2 decimal
 * places" (paise precision). Call sites that hand-roll the same
 * `Math.round(<expr> * 100) / 100` arithmetic instead of calling
 * `roundRupees(<expr>)` drift the moment the rounding rule changes anywhere
 * (e.g. floor vs round, or moving to nearest-rupee) since there's no single
 * place left to fix it.
 *
 * NOT YET WIRED into scripts/run-audits.mjs / npm run check:audits — as of
 * 2026-08-18 there are 20+ pre-existing call sites (rupee input fields in
 * admin/seller forms, seed data, checkout GST math) that still hand-roll
 * this idiom. Enabling this audit in the strict-zero check:audits chain
 * today would fail the build on code this session didn't write. Wire it in
 * once those call sites are migrated to `roundRupees()` (Tier PP Track 6b).
 *
 * Usage: node scripts/audit-raw-money-math.mjs
 * Exits 0 — clean (no violations)
 * Exits 1 — violations found (lists every file:line)
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git", "__tests__"]);
const SCAN_EXTS = new Set([".ts", ".tsx"]);

// The canonical helper's own definition — the only legitimate occurrence.
const ALLOWLIST = new Set([join(ROOT, "appkit", "src", "utils", "number.formatter.ts")]);

// Matches `Math.round(<anything, including nested calls>* 100) / 100` —
// allows one level of nested parens (covers `parseFloat(x)`, `Number(x)`)
// without a full parser.
const PATTERN = /Math\.round\((?:[^()]|\([^()]*\))*\*\s*100\)\s*\/\s*100/g;

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
    } else if (SCAN_EXTS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

const violations = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    if (ALLOWLIST.has(file)) continue;
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("audit-raw-money-math-ok")) return;
      if (PATTERN.test(line)) {
        violations.push(`${relative(ROOT, file)}:${i + 1}`);
      }
      PATTERN.lastIndex = 0;
    });
  }
}

if (violations.length === 0) {
  console.log("audit-raw-money-math: clean");
  process.exit(0);
}

console.error(
  `audit-raw-money-math: ${violations.length} hand-rolled Math.round(x * 100) / 100 occurrence(s) — use roundRupees() from appkit/src/utils/number.formatter.ts instead.\n`,
);
console.error("Affected lines:");
for (const v of violations) console.error(`  ${v}`);
console.error(
  '\nPer-line escape hatch: "// audit-raw-money-math-ok: <reason>" for genuinely non-money percentage math.',
);
process.exit(1);

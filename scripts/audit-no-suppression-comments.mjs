#!/usr/bin/env node
/**
 * audit-no-suppression-comments — strict-zero.
 *
 * Blocks every known audit suppression / escape-hatch comment marker.
 *
 * Philosophy: suppression comments hide a real violation behind a text marker.
 * They are not a substitute for fixing the root cause. This audit ensures no
 * new ones accumulate after the "remove all suppressions" cleanup sprint.
 *
 * When this audit fires:
 *   - Find the underlying audit whose marker is present
 *   - Fix the root cause so the underlying audit passes without the marker
 *   - Do NOT add a new marker or exception to this script
 *
 * Exit 0 — clean.
 * Exit 1 — any suppression marker found.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [
  join(ROOT, "src"),
  join(ROOT, "appkit", "src"),
];

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git", "__tests__", "__mocks__", "coverage"]);

// Every known suppression marker. Each entry is a string that must appear
// on a source line (not inside a block comment header) to trigger a violation.
const SUPPRESSION_MARKERS = [
  "// audit-direct-fetch-ok:",
  "// audit-inline-style-ok:",
  "// audit-variant-ok:",
  "// audit-raw-form-input-ok:",
  "// audit-unnecessary-use-client-ok:",
  "// audit-catch-raw-ok:",
  "// audit-schema-base-ok:",
  "// audit-listing-type-inline-ok:",
  "// audit-hex-tokens-ok:",
  "// audit-z-any-ok:",
  "// audit-pagesize-ok:",
  "// audit-field-name-ok:",
  "// audit-sieve-views-ok:",
  "// audit-form-mutation-hook-ok:",
  "// audit-unknown-ok:",
  "// audit-silent-catch-ok:",
  "// audit-child-wrapper-ok:",
  "// audit-client-entry-ok:",
  "// rbac-public:",
  "// rbac-scope-enforced-in-handler:",
  "// toast-intentionally-silent:",
  "// toast-handled-by-hook",
];

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
      const name = entry.name;
      if (name.endsWith(".ts") || name.endsWith(".tsx") || name.endsWith(".mjs") || name.endsWith(".js")) {
        files.push(full);
      }
    }
  }
  return files;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  let exists = false;
  try { exists = statSync(dir).isDirectory(); } catch { /* skip */ }
  if (!exists) continue;

  for (const file of walk(dir)) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }

    // Skip this script itself (it documents the markers)
    if (rel.includes("audit-no-suppression-comments")) continue;

    const lines = src.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Only flag lines that have the marker in a line comment position
      // (not inside a block comment that merely documents the pattern)
      for (const marker of SUPPRESSION_MARKERS) {
        if (line.includes(marker)) {
          violations.push({ file: rel, line: i + 1, text: line.trim().slice(0, 120) });
          break;
        }
      }
    }
  }
}

if (violations.length === 0) {
  console.log("audit-no-suppression-comments: clean ✓");
  process.exit(0);
}

console.error(`\naudit-no-suppression-comments: ${violations.length} suppression marker(s) found.\n`);
console.error("Fix the root cause instead of suppressing the audit:");
console.error("  1. Identify which audit the marker belongs to.");
console.error("  2. Fix the underlying code so that audit passes without the marker.");
console.error("  3. Remove the marker line.\n");
for (const v of violations.slice(0, 50)) {
  console.error(`  ${v.file}:${v.line} — ${v.text}`);
}
if (violations.length > 50) {
  console.error(`  ... and ${violations.length - 50} more`);
}
process.exit(1);

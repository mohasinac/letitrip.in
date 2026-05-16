#!/usr/bin/env node
/**
 * audit-dashboard-padding.mjs
 *
 * Detects double-padding in dashboard page files.
 *
 * WHY THIS MATTERS
 * ─────────────────
 * DashboardLayoutClient already wraps every dashboard route with:
 *   px-5 py-8 (mobile) / md:pl-10 md:pr-6 / lg:pl-11 lg:pr-8
 *
 * Page components that add their own px-4/py-6/py-8 at the root element
 * double the gutter — too much whitespace on mobile and misaligned with
 * the layout's design contract.
 *
 * The fixed pattern: className="mx-auto max-w-* px-4 py-6"
 * After fix:        className="mx-auto max-w-*"   (no px/py on dashboard pages)
 *
 * SCOPE
 * ─────
 * Only scans page.tsx files under the three dashboard route trees:
 *   src/app/[locale]/store/*
 *   src/app/[locale]/admin/*
 *   src/app/[locale]/user/*
 *
 * SUPPRESSION
 * ───────────
 * Add `// audit-dashboard-padding-ok` on the same line to suppress a hit
 * that intentionally applies root padding (e.g. a page that doesn't go
 * through DashboardLayoutClient).
 *
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const DASHBOARD_ROOTS = [
  join(ROOT, "src", "app", "[locale]", "store"),
  join(ROOT, "src", "app", "[locale]", "admin"),
  join(ROOT, "src", "app", "[locale]", "user"),
];

const SKIP_DIRS = new Set(["node_modules", ".next"]);

// Patterns that indicate double-padding at the root wrapper level.
// We look for className attributes that contain both a horizontal px-* and a vertical py-*
// in the range that the layout already covers.
const DOUBLE_PADDING_PATTERNS = [
  // Explicit both-axis combos on one className string
  /className=[`"'][^`"']*\bpx-4\b[^`"']*\bpy-[468]\b/,
  /className=[`"'][^`"']*\bpy-[468]\b[^`"']*\bpx-4\b/,
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
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      files.push(full);
    }
  }
  return files;
}

const violations = [];

for (const root of DASHBOARD_ROOTS) {
  for (const absPath of walk(root)) {
    const rel = relative(ROOT, absPath);
    let content;
    try {
      content = readFileSync(absPath, "utf8");
    } catch {
      continue;
    }

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("audit-dashboard-padding-ok")) continue;
      for (const pattern of DOUBLE_PADDING_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({ file: rel, lineNo: i + 1, line: line.trim() });
          break;
        }
      }
    }
  }
}

if (violations.length === 0) {
  console.log("audit-dashboard-padding: no double-padding in dashboard pages ✓");
  process.exit(0);
}

const msg = [
  `audit-dashboard-padding: ${violations.length} violation(s) found.\n`,
  "[DOUBLE_PADDING] Dashboard page adds px-4/py-* to its root wrapper.",
  "  DashboardLayoutClient already provides px-5 py-8. Remove px-4 + py-* from the page.",
  "  Keep only width-constraint classes (mx-auto max-w-*).",
  "",
  ...violations.map((v) => `  ${v.file}:${v.lineNo}\n    ${v.line}`),
  "",
  "Pattern:",
  '  Before: <Div className="mx-auto max-w-4xl px-4 py-6">',
  '  After:  <Div className="mx-auto max-w-4xl">',
  "",
  "To suppress a genuine exception:",
  '  <div className="... px-4 py-6"> {/* audit-dashboard-padding-ok */}',
];

process.stderr.write(msg.join("\n") + "\n");
process.exit(1);

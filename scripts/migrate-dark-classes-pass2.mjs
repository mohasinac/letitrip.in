#!/usr/bin/env node
/**
 * migrate-dark-classes-pass2.mjs
 *
 * Second-pass migration: handle `neutral` / `gray` dark: variants missed by
 * pass1, and replace standalone light-only text/bg classes that the
 * audit-dark-mode check flags (missing dark: companion).
 *
 * Usage: node scripts/migrate-dark-classes-pass2.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

const SCAN_PATHS = [
  join(ROOT, "src"),
  join(ROOT, "appkit", "src"),
];

const SKIP_PATHS = [
  join(ROOT, "appkit", "src", "_internal", "server"),
  join(ROOT, "appkit", "src", "features", "email"),
  join(ROOT, "node_modules"),
  join(ROOT, "appkit", "node_modules"),
  join(ROOT, ".next"),
  join(ROOT, "appkit", "dist"),
];

const SKIP_FILES = new Set(["migrate-dark-classes.mjs", "migrate-dark-classes-pass2.mjs"]);
const EXTENSIONS = new Set([".tsx", ".ts", ".css"]);

// ── Phase A: neutral/gray dark: pair replacements ─────────────────────────────
const NEUTRAL_PAIR_REPLACEMENTS = [
  // bg pairs
  ["bg-white dark:bg-neutral-950", "bg-[var(--appkit-color-bg)]"],
  ["bg-white dark:bg-neutral-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-neutral-800", "bg-[var(--appkit-color-surface)]"],
  ["bg-neutral-50 dark:bg-neutral-950", "bg-[var(--appkit-color-bg)]"],
  ["bg-neutral-50 dark:bg-neutral-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-neutral-100 dark:bg-neutral-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-neutral-100 dark:bg-neutral-800", "bg-[var(--appkit-color-surface)]"],
  ["bg-neutral-100 dark:bg-neutral-700", "bg-[var(--appkit-color-border-subtle)]"],
  ["bg-neutral-200 dark:bg-neutral-700", "bg-[var(--appkit-color-border)]"],
  ["bg-neutral-200 dark:bg-neutral-800", "bg-[var(--appkit-color-surface)]"],
  ["bg-gray-50 dark:bg-gray-950", "bg-[var(--appkit-color-bg)]"],
  ["bg-gray-50 dark:bg-gray-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-gray-100 dark:bg-gray-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-gray-100 dark:bg-gray-800", "bg-[var(--appkit-color-surface)]"],
  // text pairs
  ["text-neutral-900 dark:text-neutral-50", "text-[var(--appkit-color-text)]"],
  ["text-neutral-900 dark:text-neutral-100", "text-[var(--appkit-color-text)]"],
  ["text-neutral-800 dark:text-neutral-100", "text-[var(--appkit-color-text)]"],
  ["text-neutral-800 dark:text-neutral-200", "text-[var(--appkit-color-text-muted)]"],
  ["text-neutral-700 dark:text-neutral-300", "text-[var(--appkit-color-text-muted)]"],
  ["text-neutral-600 dark:text-neutral-300", "text-[var(--appkit-color-text-muted)]"],
  ["text-neutral-600 dark:text-neutral-400", "text-[var(--appkit-color-text-muted)]"],
  ["text-neutral-500 dark:text-neutral-400", "text-[var(--appkit-color-text-muted)]"],
  ["text-neutral-500 dark:text-neutral-300", "text-[var(--appkit-color-text-muted)]"],
  ["text-neutral-400 dark:text-neutral-500", "text-[var(--appkit-color-text-faint)]"],
  ["text-gray-900 dark:text-gray-50", "text-[var(--appkit-color-text)]"],
  ["text-gray-900 dark:text-gray-100", "text-[var(--appkit-color-text)]"],
  ["text-gray-700 dark:text-gray-300", "text-[var(--appkit-color-text-muted)]"],
  ["text-gray-600 dark:text-gray-400", "text-[var(--appkit-color-text-muted)]"],
  ["text-gray-500 dark:text-gray-400", "text-[var(--appkit-color-text-muted)]"],
  // border pairs
  ["border-neutral-200 dark:border-neutral-700", "border-[var(--appkit-color-border)]"],
  ["border-neutral-200 dark:border-neutral-800", "border-[var(--appkit-color-border-subtle)]"],
  ["border-neutral-100 dark:border-neutral-800", "border-[var(--appkit-color-border-subtle)]"],
  ["border-neutral-300 dark:border-neutral-700", "border-[var(--appkit-color-border)]"],
  ["border-gray-200 dark:border-gray-700", "border-[var(--appkit-color-border)]"],
  // divide pairs
  ["divide-neutral-200 dark:divide-neutral-700", "divide-[var(--appkit-color-border)]"],
  ["divide-neutral-200 dark:divide-neutral-800", "divide-[var(--appkit-color-border)]"],
  ["divide-gray-200 dark:divide-gray-700", "divide-[var(--appkit-color-border)]"],
  // hover pairs
  ["hover:bg-neutral-100 dark:hover:bg-neutral-800", "hover:bg-[var(--appkit-color-surface-elevated)]"],
  ["hover:bg-neutral-50 dark:hover:bg-neutral-900", "hover:bg-[var(--appkit-color-surface)]"],
  ["hover:bg-gray-100 dark:hover:bg-gray-800", "hover:bg-[var(--appkit-color-surface-elevated)]"],
];

// ── Phase B: neutral/gray orphan dark: replacements ──────────────────────────
const NEUTRAL_ORPHAN_REPLACEMENTS = [
  ["dark:bg-neutral-950", "bg-[var(--appkit-color-bg)]"],
  ["dark:bg-neutral-900", "bg-[var(--appkit-color-surface)]"],
  ["dark:bg-neutral-800/60", "bg-[var(--appkit-color-surface-input)]"],
  ["dark:bg-neutral-800/30", "bg-[var(--appkit-color-surface)]"],
  ["dark:bg-neutral-800", "bg-[var(--appkit-color-surface-elevated)]"],
  ["dark:bg-neutral-700", "bg-[var(--appkit-color-border)]"],
  ["dark:text-neutral-50", "text-[var(--appkit-color-text)]"],
  ["dark:text-neutral-100", "text-[var(--appkit-color-text)]"],
  ["dark:text-neutral-200", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-neutral-300", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-neutral-400", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-neutral-500", "text-[var(--appkit-color-text-faint)]"],
  ["dark:border-neutral-800/60", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:border-neutral-800", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:border-neutral-700", "border-[var(--appkit-color-border)]"],
  ["dark:border-neutral-600", "border-[var(--appkit-color-border)]"],
  ["dark:divide-neutral-800", "divide-[var(--appkit-color-border)]"],
  ["dark:divide-neutral-700", "divide-[var(--appkit-color-border)]"],
  ["dark:ring-neutral-700", "ring-[var(--appkit-color-border)]"],
  ["dark:hover:bg-neutral-800", "hover:bg-[var(--appkit-color-surface-elevated)]"],
  ["dark:hover:bg-neutral-900", "hover:bg-[var(--appkit-color-surface)]"],
  ["dark:hover:text-neutral-300", "hover:text-[var(--appkit-color-text-muted)]"],
  // gray orphans
  ["dark:bg-gray-900", "bg-[var(--appkit-color-surface)]"],
  ["dark:bg-gray-800", "bg-[var(--appkit-color-surface-elevated)]"],
  ["dark:bg-gray-700", "bg-[var(--appkit-color-border)]"],
  ["dark:text-gray-100", "text-[var(--appkit-color-text)]"],
  ["dark:text-gray-200", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-gray-300", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-gray-400", "text-[var(--appkit-color-text-muted)]"],
  ["dark:border-gray-700", "border-[var(--appkit-color-border)]"],
  ["dark:border-gray-800", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:divide-gray-700", "divide-[var(--appkit-color-border)]"],
];

// ── Phase C: standalone light-only class replacements ────────────────────────
// These replace light-only classes that the audit flags as missing a dark: companion.
// Order matters: most specific first to avoid partial replacement.
const STANDALONE_LIGHT_REPLACEMENTS = [
  // Standalone text (these appear in className contexts without any dark: on the line)
  // text-neutral-900 alone → CSS var
  [/\btext-neutral-900\b(?![^\s"'`]*dark:text-)/g, "text-[var(--appkit-color-text)]"],
  [/\btext-gray-900\b(?![^\s"'`]*dark:text-)/g, "text-[var(--appkit-color-text)]"],
  // text-neutral-600 alone
  [/\btext-neutral-600\b(?![^\s"'`]*dark:text-)/g, "text-[var(--appkit-color-text-muted)]"],
  [/\btext-gray-600\b(?![^\s"'`]*dark:text-)/g, "text-[var(--appkit-color-text-muted)]"],
  // text-neutral-500 alone
  [/\btext-neutral-500\b(?![^\s"'`]*dark:text-)/g, "text-[var(--appkit-color-text-muted)]"],
  [/\btext-gray-500\b(?![^\s"'`]*dark:text-)/g, "text-[var(--appkit-color-text-muted)]"],
  // text-zinc-500 alone (after pair pass still catches some stragglers)
  [/\btext-zinc-500\b(?![^\s"'`]*dark:text-)/g, "text-[var(--appkit-color-text-muted)]"],
  [/\btext-zinc-600\b(?![^\s"'`]*dark:text-)/g, "text-[var(--appkit-color-text-muted)]"],
  // Standalone bg
  // bg-neutral-100 alone
  [/\bbg-neutral-100\b(?![^\s"'`]*dark:bg-)/g, "bg-[var(--appkit-color-surface)]"],
  [/\bbg-gray-100\b(?![^\s"'`]*dark:bg-)/g, "bg-[var(--appkit-color-surface)]"],
  [/\bbg-zinc-100\b(?![^\s"'`]*dark:bg-)/g, "bg-[var(--appkit-color-surface)]"],
  // bg-white standalone — only replace when it's clearly a surface (not button/dot/toggle)
  // We use a negative lookahead to skip toggle-thumb + carousel-dot contexts.
  // The audit's isBgWhiteOnColoredSurface already handles those exclusions.
  [/\bbg-white\b(?!\/\d)(?![^\s"'`]*dark:bg-)(?![^\n]*(rounded-full|px-\d|py-\d.*font-semibold))/g, "bg-[var(--appkit-color-surface)]"],
];

function collectFiles(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (SKIP_PATHS.some(s => full.startsWith(s))) continue;
    if (SKIP_FILES.has(e.name)) continue;
    if (e.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (EXTENSIONS.has(extname(e.name))) {
      results.push(full);
    }
  }
  return results;
}

function applyPhaseA(content) {
  let result = content;
  for (const [find, replace] of NEUTRAL_PAIR_REPLACEMENTS) {
    if (result.includes(find)) result = result.split(find).join(replace);
  }
  return result;
}

function applyPhaseB(content) {
  let result = content;
  for (const [find, replace] of NEUTRAL_ORPHAN_REPLACEMENTS) {
    if (result.includes(find)) result = result.split(find).join(replace);
  }
  return result;
}

function applyPhaseC(content) {
  let result = content;
  for (const [pattern, replace] of STANDALONE_LIGHT_REPLACEMENTS) {
    result = result.replace(pattern, replace);
  }
  return result;
}

let processed = 0;
let changed = 0;

for (const scanDir of SCAN_PATHS) {
  const files = collectFiles(scanDir);
  for (const file of files) {
    const original = readFileSync(file, "utf8");
    let updated = applyPhaseA(original);
    updated = applyPhaseB(updated);
    updated = applyPhaseC(updated);
    processed++;
    if (updated !== original) {
      changed++;
      if (!DRY_RUN) writeFileSync(file, updated, "utf8");
      if (DRY_RUN) console.log(`  WOULD CHANGE: ${relative(ROOT, file)}`);
    }
  }
}

console.log(`\nmigrate-dark-classes-pass2: processed ${processed} files, changed ${changed} files${DRY_RUN ? " (dry run)" : ""}`);

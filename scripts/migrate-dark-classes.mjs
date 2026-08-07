#!/usr/bin/env node
/**
 * migrate-dark-classes.mjs
 *
 * One-shot migration: replace dark:bg/text/border-zinc/slate-N class pairs
 * with CSS variable equivalents so all 6+ themes display correctly.
 *
 * Usage: node scripts/migrate-dark-classes.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative, resolve } from "node:path";
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

const SKIP_FILES = new Set([
  "RichText.tsx",
  "migrate-dark-classes.mjs",
]);

const EXTENSIONS = new Set([".tsx", ".ts", ".css"]);

// ── Ordered replacement pairs ────────────────────────────────────────────────
// Sorted longest-first to avoid partial matches.
// Each entry: [find_string, replace_string]
// Pair replacements collapse "light dark" → "cssvar"
// Orphan replacements replace standalone "dark:*" → "cssvar"

const PAIR_REPLACEMENTS = [
  // bg pairs — bg-white
  ["bg-white dark:bg-zinc-950", "bg-[var(--appkit-color-bg)]"],
  ["bg-white dark:bg-slate-950", "bg-[var(--appkit-color-bg)]"],
  ["bg-white dark:bg-zinc-900/90", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-slate-900/90", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-zinc-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-slate-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-zinc-800/90", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-slate-800/90", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-zinc-800/60", "bg-[var(--appkit-color-surface-input)]"],
  ["bg-white dark:bg-slate-800/60", "bg-[var(--appkit-color-surface-input)]"],
  ["bg-white dark:bg-zinc-800/30", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-slate-800/30", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-zinc-800", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-slate-800", "bg-[var(--appkit-color-surface)]"],
  ["bg-white dark:bg-zinc-700", "bg-[var(--appkit-color-border)]"],
  ["bg-white dark:bg-slate-700", "bg-[var(--appkit-color-border)]"],
  // bg pairs — bg-zinc-50
  ["bg-zinc-50 dark:bg-zinc-950", "bg-[var(--appkit-color-bg)]"],
  ["bg-slate-50 dark:bg-slate-950", "bg-[var(--appkit-color-bg)]"],
  ["bg-zinc-50 dark:bg-zinc-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-slate-50 dark:bg-slate-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-zinc-50 dark:bg-zinc-800/50", "bg-[var(--appkit-color-surface)]"],
  ["bg-zinc-50 dark:bg-zinc-800", "bg-[var(--appkit-color-surface-elevated)]"],
  ["bg-slate-50 dark:bg-slate-800", "bg-[var(--appkit-color-surface-elevated)]"],
  // bg pairs — bg-zinc-100
  ["bg-zinc-100 dark:bg-zinc-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-slate-100 dark:bg-slate-900", "bg-[var(--appkit-color-surface)]"],
  ["bg-zinc-100 dark:bg-zinc-800/60", "bg-[var(--appkit-color-surface-input)]"],
  ["bg-zinc-100 dark:bg-slate-800/60", "bg-[var(--appkit-color-surface-input)]"],
  ["bg-zinc-100 dark:bg-zinc-800/30", "bg-[var(--appkit-color-surface)]"],
  ["bg-zinc-100 dark:bg-zinc-800", "bg-[var(--appkit-color-surface)]"],
  ["bg-slate-100 dark:bg-slate-800", "bg-[var(--appkit-color-surface)]"],
  ["bg-zinc-100 dark:bg-zinc-700/60", "bg-[var(--appkit-color-border-subtle)]"],
  ["bg-zinc-100 dark:bg-zinc-700", "bg-[var(--appkit-color-border-subtle)]"],
  ["bg-slate-100 dark:bg-slate-700", "bg-[var(--appkit-color-border-subtle)]"],
  // bg pairs — bg-zinc-200
  ["bg-zinc-200 dark:bg-zinc-700/60", "bg-[var(--appkit-color-border-subtle)]"],
  ["bg-zinc-200 dark:bg-zinc-700", "bg-[var(--appkit-color-border)]"],
  ["bg-slate-200 dark:bg-slate-700", "bg-[var(--appkit-color-border)]"],
  ["bg-zinc-200 dark:bg-zinc-800", "bg-[var(--appkit-color-surface)]"],
  // bg pairs — bg-zinc-300
  ["bg-zinc-300 dark:bg-zinc-700", "bg-[var(--appkit-color-border)]"],
  ["bg-zinc-300 dark:bg-slate-700", "bg-[var(--appkit-color-border)]"],
  // text pairs
  ["text-zinc-900 dark:text-zinc-50", "text-[var(--appkit-color-text)]"],
  ["text-zinc-900 dark:text-zinc-100", "text-[var(--appkit-color-text)]"],
  ["text-slate-900 dark:text-slate-50", "text-[var(--appkit-color-text)]"],
  ["text-slate-900 dark:text-slate-100", "text-[var(--appkit-color-text)]"],
  ["text-gray-900 dark:text-gray-50", "text-[var(--appkit-color-text)]"],
  ["text-gray-900 dark:text-gray-100", "text-[var(--appkit-color-text)]"],
  ["text-neutral-900 dark:text-neutral-50", "text-[var(--appkit-color-text)]"],
  ["text-zinc-800 dark:text-zinc-100", "text-[var(--appkit-color-text)]"],
  ["text-zinc-800 dark:text-zinc-200", "text-[var(--appkit-color-text-muted)]"],
  ["text-zinc-800 dark:text-zinc-300", "text-[var(--appkit-color-text-muted)]"],
  ["text-zinc-700 dark:text-zinc-200", "text-[var(--appkit-color-text-muted)]"],
  ["text-zinc-700 dark:text-zinc-300", "text-[var(--appkit-color-text-muted)]"],
  ["text-slate-700 dark:text-slate-300", "text-[var(--appkit-color-text-muted)]"],
  ["text-zinc-600 dark:text-zinc-300", "text-[var(--appkit-color-text-muted)]"],
  ["text-zinc-600 dark:text-zinc-400", "text-[var(--appkit-color-text-muted)]"],
  ["text-slate-600 dark:text-slate-300", "text-[var(--appkit-color-text-muted)]"],
  ["text-slate-600 dark:text-slate-400", "text-[var(--appkit-color-text-muted)]"],
  ["text-gray-600 dark:text-gray-400", "text-[var(--appkit-color-text-muted)]"],
  ["text-zinc-500 dark:text-zinc-300", "text-[var(--appkit-color-text-muted)]"],
  ["text-zinc-500 dark:text-zinc-400", "text-[var(--appkit-color-text-muted)]"],
  ["text-slate-500 dark:text-slate-400", "text-[var(--appkit-color-text-muted)]"],
  ["text-gray-500 dark:text-gray-400", "text-[var(--appkit-color-text-muted)]"],
  ["text-neutral-500 dark:text-neutral-400", "text-[var(--appkit-color-text-muted)]"],
  ["text-zinc-400 dark:text-zinc-400", "text-[var(--appkit-color-text-faint)]"],
  ["text-zinc-400 dark:text-zinc-500", "text-[var(--appkit-color-text-faint)]"],
  ["text-zinc-400 dark:text-zinc-600", "text-[var(--appkit-color-text-faint)]"],
  ["text-zinc-300 dark:text-zinc-600", "text-[var(--appkit-color-text-faint)]"],
  // border pairs
  ["border-zinc-100 dark:border-zinc-800/60", "border-[var(--appkit-color-border-subtle)]"],
  ["border-zinc-100 dark:border-slate-800/60", "border-[var(--appkit-color-border-subtle)]"],
  ["border-zinc-100 dark:border-zinc-800", "border-[var(--appkit-color-border-subtle)]"],
  ["border-slate-100 dark:border-slate-800", "border-[var(--appkit-color-border-subtle)]"],
  ["border-zinc-200/80 dark:border-slate-800/80", "border-[var(--appkit-color-border)]"],
  ["border-zinc-200/60 dark:border-slate-700/40", "border-[var(--appkit-color-border-subtle)]"],
  ["border-zinc-200 dark:border-zinc-800", "border-[var(--appkit-color-border-subtle)]"],
  ["border-zinc-200 dark:border-slate-800", "border-[var(--appkit-color-border-subtle)]"],
  ["border-zinc-200 dark:border-zinc-700/60", "border-[var(--appkit-color-border-subtle)]"],
  ["border-zinc-200 dark:border-zinc-700", "border-[var(--appkit-color-border)]"],
  ["border-zinc-200 dark:border-slate-700", "border-[var(--appkit-color-border)]"],
  ["border-zinc-200 dark:border-zinc-600", "border-[var(--appkit-color-border)]"],
  ["border-zinc-300/70 dark:border-slate-600", "border-[var(--appkit-color-border)]"],
  ["border-zinc-300 dark:border-zinc-700", "border-[var(--appkit-color-border)]"],
  ["border-zinc-300 dark:border-slate-700", "border-[var(--appkit-color-border)]"],
  ["border-zinc-300 dark:border-zinc-600", "border-[var(--appkit-color-border)]"],
  ["border-zinc-300 dark:border-slate-600", "border-[var(--appkit-color-border)]"],
  ["border-neutral-200 dark:border-slate-700", "border-[var(--appkit-color-border)]"],
  ["border-slate-200 dark:border-slate-700", "border-[var(--appkit-color-border)]"],
  ["border-slate-300 dark:border-slate-500", "border-[var(--appkit-color-border)]"],
  ["border-slate-300 dark:border-slate-600", "border-[var(--appkit-color-border)]"],
  // divide pairs
  ["divide-zinc-200 dark:divide-zinc-700", "divide-[var(--appkit-color-border)]"],
  ["divide-slate-200 dark:divide-slate-700", "divide-[var(--appkit-color-border)]"],
  // ring pairs
  ["ring-zinc-200 dark:ring-zinc-700", "ring-[var(--appkit-color-border)]"],
  ["ring-slate-200 dark:ring-slate-700", "ring-[var(--appkit-color-border)]"],
  ["ring-offset-slate-950", "ring-offset-[var(--appkit-color-bg)]"],
  // hover pairs
  ["hover:bg-zinc-100 dark:hover:bg-zinc-800/60", "hover:bg-[var(--appkit-color-surface-elevated)]"],
  ["hover:bg-zinc-100 dark:hover:bg-zinc-800", "hover:bg-[var(--appkit-color-surface-elevated)]"],
  ["hover:bg-slate-100 dark:hover:bg-slate-800", "hover:bg-[var(--appkit-color-surface-elevated)]"],
  ["hover:bg-zinc-50 dark:hover:bg-zinc-900", "hover:bg-[var(--appkit-color-surface)]"],
  ["hover:bg-slate-50 dark:hover:bg-slate-900", "hover:bg-[var(--appkit-color-surface)]"],
  ["hover:bg-zinc-50 dark:hover:bg-zinc-800", "hover:bg-[var(--appkit-color-surface)]"],
  ["hover:bg-white dark:hover:bg-zinc-800", "hover:bg-[var(--appkit-color-surface)]"],
  ["hover:border-zinc-300 dark:hover:border-slate-600", "hover:border-[var(--appkit-color-border)]"],
  ["hover:border-zinc-300 dark:hover:border-slate-500", "hover:border-[var(--appkit-color-border)]"],
  ["hover:border-zinc-400 dark:hover:border-slate-500", "hover:border-[var(--appkit-color-border)]"],
  ["hover:text-zinc-700 dark:hover:text-zinc-300", "hover:text-[var(--appkit-color-text-muted)]"],
  ["hover:text-neutral-600 dark:hover:text-zinc-300", "hover:text-[var(--appkit-color-text-muted)]"],
  // bg/border with glassmorphism
  ["bg-white/90 dark:bg-slate-950/90", "bg-[color-mix(in_srgb,var(--appkit-color-bg)_90%,transparent)]"],
  ["bg-white/85 dark:bg-slate-900/85", "bg-[color-mix(in_srgb,var(--appkit-color-surface)_85%,transparent)]"],
  ["bg-white/85 dark:bg-slate-800/90", "bg-[color-mix(in_srgb,var(--appkit-color-surface)_85%,transparent)]"],
  ["bg-white dark:bg-slate-900/85", "bg-[color-mix(in_srgb,var(--appkit-color-surface)_85%,transparent)]"],
  // bg pairs for step-number circles in how-it-works views
  ["bg-slate-100 dark:bg-slate-700", "bg-[var(--appkit-color-surface)]"],
  ["text-slate-700 dark:text-slate-300", "text-[var(--appkit-color-text-muted)]"],
  // shimmer gradients
  ["from-zinc-200 dark:from-slate-800", "from-[var(--appkit-color-border-subtle)]"],
  ["via-zinc-100 dark:via-slate-700/60", "via-[var(--appkit-color-bg)]"],
  ["to-zinc-200 dark:to-slate-800", "to-[var(--appkit-color-border-subtle)]"],
  // placeholder
  ["placeholder:text-zinc-400 dark:placeholder:text-zinc-500", "placeholder:text-[var(--appkit-color-text-faint)]"],
  ["placeholder:text-zinc-500 dark:placeholder:text-zinc-400", "placeholder:text-[var(--appkit-color-text-faint)]"],
];

// Orphan dark: classes (standalone, not preceded by a light pair)
// These run AFTER pairs so they only catch remaining orphans.
const ORPHAN_REPLACEMENTS = [
  ["dark:bg-zinc-950", "bg-[var(--appkit-color-bg)]"],
  ["dark:bg-slate-950", "bg-[var(--appkit-color-bg)]"],
  ["dark:bg-zinc-900/90", "bg-[var(--appkit-color-surface)]"],
  ["dark:bg-slate-900/90", "bg-[var(--appkit-color-surface)]"],
  ["dark:bg-zinc-900", "bg-[var(--appkit-color-surface)]"],
  ["dark:bg-slate-900", "bg-[var(--appkit-color-surface)]"],
  ["dark:bg-zinc-800/60", "bg-[var(--appkit-color-surface-input)]"],
  ["dark:bg-slate-800/60", "bg-[var(--appkit-color-surface-input)]"],
  ["dark:bg-zinc-800/30", "bg-[var(--appkit-color-surface)]"],
  ["dark:bg-slate-800/30", "bg-[var(--appkit-color-surface)]"],
  ["dark:bg-zinc-800", "bg-[var(--appkit-color-surface-elevated)]"],
  ["dark:bg-slate-800", "bg-[var(--appkit-color-surface-elevated)]"],
  ["dark:bg-zinc-700/60", "bg-[var(--appkit-color-border-subtle)]"],
  ["dark:bg-slate-700/60", "bg-[var(--appkit-color-border-subtle)]"],
  ["dark:bg-zinc-700", "bg-[var(--appkit-color-border)]"],
  ["dark:bg-slate-700", "bg-[var(--appkit-color-border)]"],
  ["dark:bg-zinc-100", "bg-[var(--appkit-color-surface)]"],
  ["dark:text-zinc-50", "text-[var(--appkit-color-text)]"],
  ["dark:text-zinc-100", "text-[var(--appkit-color-text)]"],
  ["dark:text-slate-100", "text-[var(--appkit-color-text)]"],
  ["dark:text-zinc-200", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-slate-200", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-zinc-300", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-slate-300", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-zinc-400", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-slate-400", "text-[var(--appkit-color-text-muted)]"],
  ["dark:text-zinc-500", "text-[var(--appkit-color-text-faint)]"],
  ["dark:text-zinc-600", "text-[var(--appkit-color-text-faint)]"],
  ["dark:border-zinc-800/80", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:border-slate-800/80", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:border-zinc-800/60", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:border-slate-800/60", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:border-zinc-800", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:border-slate-800", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:border-zinc-700/60", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:border-slate-700/40", "border-[var(--appkit-color-border-subtle)]"],
  ["dark:border-zinc-700", "border-[var(--appkit-color-border)]"],
  ["dark:border-slate-700", "border-[var(--appkit-color-border)]"],
  ["dark:border-zinc-600", "border-[var(--appkit-color-border)]"],
  ["dark:border-slate-600", "border-[var(--appkit-color-border)]"],
  ["dark:border-zinc-500", "border-[var(--appkit-color-border)]"],
  ["dark:border-slate-500", "border-[var(--appkit-color-border)]"],
  ["dark:divide-zinc-700", "divide-[var(--appkit-color-border)]"],
  ["dark:divide-slate-700", "divide-[var(--appkit-color-border)]"],
  ["dark:ring-zinc-700", "ring-[var(--appkit-color-border)]"],
  ["dark:ring-slate-700", "ring-[var(--appkit-color-border)]"],
  ["dark:hover:bg-zinc-800", "hover:bg-[var(--appkit-color-surface-elevated)]"],
  ["dark:hover:bg-slate-800", "hover:bg-[var(--appkit-color-surface-elevated)]"],
  ["dark:hover:bg-zinc-900", "hover:bg-[var(--appkit-color-surface)]"],
  ["dark:hover:bg-slate-900", "hover:bg-[var(--appkit-color-surface)]"],
  ["dark:hover:text-zinc-300", "hover:text-[var(--appkit-color-text-muted)]"],
  ["dark:hover:text-zinc-200", "hover:text-[var(--appkit-color-text-muted)]"],
  ["dark:hover:border-slate-500", "hover:border-[var(--appkit-color-border)]"],
  ["dark:hover:border-slate-600", "hover:border-[var(--appkit-color-border)]"],
  ["dark:focus:ring-secondary-400/40", ""],
  ["dark:focus:ring-secondary-400/20", ""],
  ["dark:focus:border-secondary-400", ""],
  ["dark:placeholder:text-zinc-500", ""],
  ["dark:placeholder:text-zinc-400", ""],
  ["dark:shadow-zinc-900/50", ""],
  ["dark:shadow-slate-900/50", ""],
  // gradient orphans
  ["dark:from-slate-800", "from-[var(--appkit-color-border-subtle)]"],
  ["dark:via-slate-700/60", "via-[var(--appkit-color-bg)]"],
  ["dark:to-slate-800", "to-[var(--appkit-color-border-subtle)]"],
];

function shouldSkip(filePath) {
  if (SKIP_FILES.has(require("node:path").basename(filePath))) return true;
  return SKIP_PATHS.some(skip => filePath.startsWith(skip));
}

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

function applyReplacements(content) {
  let result = content;
  // Apply pair replacements first (they collapse "A B" → "C")
  for (const [find, replace] of PAIR_REPLACEMENTS) {
    if (result.includes(find)) {
      result = result.split(find).join(replace);
    }
  }
  // Apply orphan replacements for any remaining dark: classes
  for (const [find, replace] of ORPHAN_REPLACEMENTS) {
    if (result.includes(find)) {
      result = result.split(find).join(replace);
    }
  }
  return result;
}

let processed = 0;
let changed = 0;

for (const scanDir of SCAN_PATHS) {
  const files = collectFiles(scanDir);
  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const updated = applyReplacements(original);
    processed++;
    if (updated !== original) {
      changed++;
      if (!DRY_RUN) {
        writeFileSync(file, updated, "utf8");
      }
      if (DRY_RUN) {
        console.log(`  WOULD CHANGE: ${relative(ROOT, file)}`);
      }
    }
  }
}

console.log(`\nmigrate-dark-classes: processed ${processed} files, changed ${changed} files${DRY_RUN ? " (dry run)" : ""}`);

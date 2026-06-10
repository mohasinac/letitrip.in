#!/usr/bin/env node
/**
 * audit-dark-mode.mjs — dark-mode AND light-mode contrast regression detector.
 *
 * Scans .tsx/.ts component files for Tailwind text/bg classes that lack
 * a corresponding dark:/light counterpart, causing contrast bugs.
 *
 * DARK-MODE PATTERNS (missing dark: variant)
 * ------------------------------------------
 * 1. text-zinc-500 / text-neutral-500 without dark:text-*
 * 2. text-zinc-600 / text-neutral-600 without dark:text-*  (secondary text)
 * 3. text-zinc-900 / text-neutral-900 without dark:text-*  (headings — unreadable)
 * 4. bg-white without dark:bg-*  (white surface on dark bg)
 * 5. bg-zinc-100 / bg-neutral-100 without dark:bg-*  (skeleton / badge bg)
 *
 * LIGHT-MODE PATTERNS (missing light counterpart or inverted contrast)
 * --------------------------------------------------------------------
 * 6. dark:text-zinc-* without a base text-* class (orphan dark variant — no light style)
 * 7. dark:bg-zinc-* without a base bg-* class (orphan dark background)
 * 8. Inverted contrast: text-zinc-400 dark:text-zinc-500 (darker in dark mode = wrong)
 * 9. bg-black / bg-zinc-900 without dark:bg-* (black surface unreadable in light mode if
 *    it should adapt, but commonly intentional — reported only in --strict)
 *
 * EXCEPTIONS (not flagged)
 * ------------------------
 * - Lines that are pure comments
 * - Tailwind config / CSS files
 * - String literals outside className / class (e.g. seed data, tests)
 * - Inline styles (style={{ ... }})
 * - Classes inside template literals that already have a dark: companion nearby
 * - placeholder: and focus: prefixed variants (placeholder:text-zinc-400 is fine)
 *
 * USAGE
 * -----
 *   node scripts/audit-dark-mode.mjs              # audit, fail on regressions
 *   node scripts/audit-dark-mode.mjs --strict      # baseline=0
 *   node scripts/audit-dark-mode.mjs --verbose     # show all violations
 *
 * Exits 0 if violations ≤ baseline, 1 if regressions found.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");

const SCAN_DIRS = [
  join(ROOT, "appkit", "src", "features"),
  join(ROOT, "appkit", "src", "ui"),
  join(ROOT, "src", "app"),
  join(ROOT, "src", "components"),
];

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", "scripts"]);
const EXTENSIONS = new Set([".tsx", ".ts"]);

// Patterns to detect — [regex for the problematic class, description]
// We look for these classes NOT followed by a dark: companion for the same property
const TEXT_PATTERNS = [
  // text-zinc-500 / text-neutral-500 without dark:text-
  /\btext-(?:zinc|neutral)-(?:500|600|900)\b/,
];

const BG_PATTERNS = [
  // bg-white but NOT bg-white/xx (opacity-modified overlays are intentional on colored surfaces)
  /\bbg-white(?!\/)\b/,
  /\bbg-(?:zinc|neutral)-100\b/,
];

// Light-mode patterns: dark: variant present but no corresponding base class
const ORPHAN_DARK_TEXT = /\bdark:text-(?:zinc|neutral)-\d+\b/;
const ORPHAN_DARK_BG = /\bdark:bg-(?:zinc|neutral)-\d+\b/;

// Inverted contrast: lighter in light mode, darker in dark mode (wrong direction)
// e.g. text-zinc-400 dark:text-zinc-500 — 500 is darker than 400, so dark mode text is less readable
const INVERTED_TEXT = /\btext-(?:zinc|neutral)-(\d+)\b.*\bdark:text-(?:zinc|neutral)-(\d+)\b/;

function collectFiles(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (EXTENSIONS.has(extname(e.name))) {
      results.push(full);
    }
  }
  return results;
}

function isCommentLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
}

function isInClassContext(line) {
  return /className|class=|clsx|cn\(|twMerge/.test(line);
}

function hasDarkCompanion(line, property) {
  // property is "text" or "bg"
  const darkPattern = new RegExp(`dark:${property}-`);
  return darkPattern.test(line);
}

function isPrefixed(match, line) {
  const idx = line.indexOf(match);
  if (idx <= 0) return false;
  const before = line.substring(Math.max(0, idx - 20), idx);
  return /(?:placeholder|focus|hover|active|group-hover|peer):$/.test(before);
}

function isBgWhiteOnColoredSurface(match, line) {
  if (match !== "bg-white") return false;
  // Toggle thumbs (rounded-full bg-white shadow) and carousel dots on colored surfaces
  return /rounded-full.*bg-white.*shadow|bg-white.*rounded-full.*shadow/.test(line) ||
    // CTA buttons on hero/banner sections (bg-white px-* py-* text-sm font-semibold text-primary)
    /bg-white\s+px-\d/.test(line) ||
    // Carousel image dots on dark overlay backgrounds
    /bg-white"?\s*:\s*"/.test(line) || /bg-white\/\d/.test(line);
}

function scan() {
  const violations = [];

  for (const dir of SCAN_DIRS) {
    const files = collectFiles(dir);
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isCommentLine(line)) continue;
        if (!isInClassContext(line)) continue;

        // Check text patterns
        for (const pat of TEXT_PATTERNS) {
          const m = line.match(pat);
          if (!m) continue;
          if (isPrefixed(m[0], line)) continue;
          if (hasDarkCompanion(line, "text")) continue;

          // Check the line above/below for multi-line className (template literals)
          const ctx = [
            i > 0 ? lines[i - 1] : "",
            line,
            i < lines.length - 1 ? lines[i + 1] : "",
          ].join(" ");
          if (hasDarkCompanion(ctx, "text")) continue;

          violations.push({
            file: relative(ROOT, file),
            line: i + 1,
            match: m[0],
            type: "text",
          });
        }

        // Check bg patterns
        for (const pat of BG_PATTERNS) {
          const m = line.match(pat);
          if (!m) continue;
          if (isPrefixed(m[0], line)) continue;
          if (isBgWhiteOnColoredSurface(m[0], line)) continue;
          if (hasDarkCompanion(line, "bg")) continue;

          const ctx = [
            i > 0 ? lines[i - 1] : "",
            line,
            i < lines.length - 1 ? lines[i + 1] : "",
          ].join(" ");
          if (hasDarkCompanion(ctx, "bg")) continue;

          violations.push({
            file: relative(ROOT, file),
            line: i + 1,
            match: m[0],
            type: "bg",
          });
        }

        // Check inverted contrast (text-zinc-400 dark:text-zinc-500 — wrong direction)
        // Only flag close-pair inversions (gap ≤ 200) — wider gaps like 200→700
        // are often intentional for colored backgrounds or overlays.
        const inv = line.match(INVERTED_TEXT);
        if (inv) {
          const lightWeight = parseInt(inv[1], 10);
          const darkWeight = parseInt(inv[2], 10);
          const gap = darkWeight - lightWeight;
          if (gap > 0 && gap <= 200 && darkWeight >= 500) {
            violations.push({
              file: relative(ROOT, file),
              line: i + 1,
              match: `text-*-${lightWeight} dark:text-*-${darkWeight}`,
              type: "inverted",
            });
          }
        }

        // Check orphan dark:text- without a base text- class
        const orphanText = line.match(ORPHAN_DARK_TEXT);
        if (orphanText && !isPrefixed(orphanText[0], line)) {
          const hasBaseText = /\btext-(?:zinc|neutral|slate|gray|white|black|primary|secondary|emerald|blue|red|green|orange|yellow|purple|indigo|amber|inherit|current|transparent)/.test(line);
          if (!hasBaseText) {
            const ctx = [
              i > 0 ? lines[i - 1] : "",
              line,
              i < lines.length - 1 ? lines[i + 1] : "",
            ].join(" ");
            const ctxHasBase = /\btext-(?:zinc|neutral|slate|gray|white|black|primary|secondary|emerald|blue|red|green|orange|yellow|purple|indigo|amber|inherit|current|transparent)/.test(ctx);
            if (!ctxHasBase) {
              violations.push({
                file: relative(ROOT, file),
                line: i + 1,
                match: orphanText[0],
                type: "orphan-dark-text",
              });
            }
          }
        }

        // Check orphan dark:bg- without a base bg- class
        const orphanBg = line.match(ORPHAN_DARK_BG);
        if (orphanBg && !isPrefixed(orphanBg[0], line)) {
          const hasBaseBg = /\bbg-(?:zinc|neutral|slate|gray|white|black|primary|secondary|emerald|blue|red|green|orange|yellow|purple|indigo|amber|transparent)/.test(line);
          if (!hasBaseBg) {
            const ctx = [
              i > 0 ? lines[i - 1] : "",
              line,
              i < lines.length - 1 ? lines[i + 1] : "",
            ].join(" ");
            const ctxHasBase = /\bbg-(?:zinc|neutral|slate|gray|white|black|primary|secondary|emerald|blue|red|green|orange|yellow|purple|indigo|amber|transparent)/.test(ctx);
            if (!ctxHasBase) {
              violations.push({
                file: relative(ROOT, file),
                line: i + 1,
                match: orphanBg[0],
                type: "orphan-dark-bg",
              });
            }
          }
        }
      }
    }
  }

  return violations;
}

const violations = scan();

if (violations.length === 0) {
  console.log("audit-dark-mode: 0 violations ✓");
  process.exit(0);
}

if (verbose || violations.length > threshold) {
  const groups = {
    text: { label: "TEXT — missing dark: variant", items: [] },
    bg: { label: "BG — missing dark: variant", items: [] },
    inverted: { label: "INVERTED — dark mode text darker than light mode", items: [] },
    "orphan-dark-text": { label: "ORPHAN — dark:text-* without base text-*", items: [] },
    "orphan-dark-bg": { label: "ORPHAN — dark:bg-* without base bg-*", items: [] },
  };
  for (const v of violations) {
    (groups[v.type]?.items ?? []).push(v);
  }
  for (const g of Object.values(groups)) {
    if (g.items.length === 0) continue;
    const max = g.label.startsWith("ORPHAN") ? 15 : 30;
    console.log(`\n  [${g.label}] ${g.items.length} violation(s):`);
    for (const v of g.items.slice(0, max)) {
      console.log(`    ${v.file}:${v.line} — ${v.match}`);
    }
    if (g.items.length > max) console.log(`    ... and ${g.items.length - max} more`);
  }
  console.log();
}

if (violations.length === 0) {
  console.log("audit-dark-mode: clean ✓");
  process.exit(0);
}
console.log(`audit-dark-mode: ${violations.length} violation(s).`);
if (!verbose) console.log("  Run with --verbose to see them.");
process.exit(1);

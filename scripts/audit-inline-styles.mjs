#!/usr/bin/env node
/**
 * audit-inline-styles.mjs — Block inline style={{ }} usage
 *
 * Inline styles bypass the design system (Tailwind + CSS tokens).
 * Acceptable exceptions:
 *   - CSS custom properties (--var)
 *   - Dynamic values that can't be expressed as classes (e.g. style={{ top: offset }})
 *   - Third-party library requirements
 *
 * Baseline mode: violations at or below baseline pass; regressions block.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DIRS = [
  join(ROOT, "appkit", "src"),
  join(ROOT, "src"),
];

const IGNORE_DIRS = ["node_modules", ".next", "dist", "__tests__", "scripts"];
const EXTENSIONS = [".tsx", ".jsx"];

const ALLOWLIST = [
  "RichTextRenderer.tsx",
  "RichText.tsx",
  "RichTextEditor.tsx",
  "ImageCropModal.tsx",
  "ImageEditor.tsx",
  "VideoTrimModal.tsx",
  "CameraCapture.tsx",
  "MediaSlider.tsx",
  "HeroCarousel.tsx",
  "SpinWheelView.tsx",
  // Dev-only toolbar — never renders in prod (IS_DEV gated to false).
  // Cosmetic inline styles for a developer debug surface; not worth converting.
  "DevToolbar.tsx",
  "SeedPanel.tsx",
];

// File-name patterns where dynamic inline styles are acceptable (internal documentation)
const ALLOWLIST_PATTERNS = [
  /GuideView\.tsx$/,         // Admin/seller/buyer guide documentation pages (dynamic gradient icons)
  /GuideHubView\.tsx$/,      // Guide hub landing pages
];

const RULES = [
  {
    id: "INLINE_STYLE",
    label: "Inline style={{ }} (use Tailwind classes or CSS variables)",
    regex: /style\s*=\s*\{\{/,
    // Tightened P4 (2026-06-08): 352 actual after SeedPanel + GuideView allowlists.
    baseline: 352,
  },
  {
    id: "INLINE_STYLE_VAR",
    label: "Inline style={variable} (use className or CSS variables)",
    regex: /style\s*=\s*\{(?!\{)[a-zA-Z]/,
    baseline: 17,
  },
  {
    id: "RAW_SURFACE_CLASSES",
    label: "Raw surface classes on appkit primitive (use surface prop)",
    regex: /<(?:Stack|Row|Grid|Container|Section|Div)\s[^>]*className\s*=\s*[{"].*bg-white\s+dark:bg-(?:slate|zinc)-9/,
    // Tightened 2026-05-30 (Phase G): 0 actual after converting all 10 instances to surface prop.
    baseline: 0,
  },
  {
    id: "RAW_PADDING_CLASSES",
    label: "Raw padding classes on appkit primitive (use padding prop)",
    regex: /<(?:Stack|Row|Grid|Container|Section|Div)\s[^>]*className\s*=\s*[{"].*\bp-[3-8]\b/,
    // Tightened P4 (2026-06-08): 210 actual after GuideView allowlist.
    baseline: 210,
  },
  {
    id: "RAW_ALIGN_ON_ROW",
    label: "Raw items-* on <Row> (use align prop)",
    regex: /<Row\s[^>]*className\s*=\s*[{"].*\bitems-(?:center|start|end|stretch|baseline)\b/,
    // Tightened 2026-05-30 (Phase G): 0 actual after converting PublicProfileView.tsx Row→Div.
    baseline: 0,
  },
  {
    id: "RAW_JUSTIFY_ON_ROW",
    label: "Raw justify-* on <Row> (use justify prop)",
    regex: /<Row\s[^>]*className\s*=\s*[{"].*\bjustify-(?:center|start|end|between|around|evenly)\b/,
    // Tightened 2026-05-30 (Phase G): 0 actual after converting PublicProfileView.tsx Row→Div.
    baseline: 0,
  },
  {
    id: "RAW_OVERFLOW",
    label: "Raw overflow-* on appkit primitive (use overflow classes from THEME_CONSTANTS.overflow)",
    regex: /<(?:Stack|Row|Grid|Container|Section|Div)\s[^>]*className\s*=\s*[{"].*\boverflow-(?:auto|scroll|hidden|x-auto|y-auto|x-hidden|y-hidden)\b/,
    // Driven to 0 (2026-06-08): codemod extracted all overflow-* on appkit
    // primitives to per-file `const __O = {...}` constants. Any new raw
    // overflow class on a primitive blocks.
    baseline: 0,
  },
];

function walkFiles(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (IGNORE_DIRS.includes(entry)) continue;
    const stat = statSync(full, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isDirectory()) {
      results.push(...walkFiles(full));
    } else if (EXTENSIONS.some(ext => entry.endsWith(ext))) {
      if (ALLOWLIST.includes(entry)) continue;
      if (ALLOWLIST_PATTERNS.some(rx => rx.test(entry))) continue;
      results.push(full);
    }
  }
  return results;
}

function isInsideComment(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
}

const violations = {};
for (const rule of RULES) violations[rule.id] = [];

for (const dir of DIRS) {
  const files = walkFiles(dir);
  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isInsideComment(line)) continue;

      for (const rule of RULES) {
        if (rule.regex.test(line)) {
          const rel = relative(ROOT, file).replace(/\\/g, "/");
          violations[rule.id].push({
            file: rel,
            line: i + 1,
            text: line.trim().slice(0, 100),
          });
        }
      }
    }
  }
}

const verbose = process.argv.includes("--verbose");
let totalViolations = 0;
let totalBaseline = 0;
let hasRegression = false;

for (const rule of RULES) {
  const hits = violations[rule.id];
  totalViolations += hits.length;
  totalBaseline += rule.baseline;

  if (hits.length > rule.baseline) {
    hasRegression = true;
    console.error(`\n[${rule.id}] ${hits.length} violation(s) — REGRESSION (baseline ${rule.baseline}):`);
    for (const v of hits.slice(0, 10)) {
      console.error(`  ${v.file}:${v.line} — ${v.text}`);
    }
    if (hits.length > 10) console.error(`  ... and ${hits.length - 10} more`);
  } else if (verbose) {
    if (hits.length > 0) {
      console.log(`\n[${rule.id}] ${hits.length} violation(s) — within baseline ${rule.baseline}:`);
      for (const v of hits.slice(0, 5)) {
        console.log(`  ${v.file}:${v.line} — ${v.text}`);
      }
      if (hits.length > 5) console.log(`  ... and ${hits.length - 5} more`);
    }
  }
}

console.log("");

if (hasRegression) {
  console.error(`audit-inline-styles: ${totalViolations} violation(s) — REGRESSION above baseline. Remove inline styles.`);
  process.exit(1);
} else {
  console.log(`audit-inline-styles: ${totalViolations} violation(s) (baseline ${totalBaseline}). No regression.`);
  if (totalViolations > 0 && !verbose) {
    console.log(`  Run with --verbose to see details.`);
  }
}

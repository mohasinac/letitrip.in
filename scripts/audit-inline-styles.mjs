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

const ALLOWLIST = [];

// File-name patterns where dynamic inline styles are acceptable (internal documentation)
const ALLOWLIST_PATTERNS = [];

// Path patterns where inline styles are inherent to the technology.
// CLAUDE.md §"Theme / Tokens / Variants Architecture" lists the primitive source directories.
// CLAUDE.md §"Inline Style Rules" lists additional allowlisted files.
const ALLOWLIST_PATH_PATTERNS = [
  // Email primitives — email clients require inline styles; CSS classes are ignored.
  /appkit[/\\]src[/\\]features[/\\]email[/\\]/,
  // Contact email templates — renderToStaticMarkup HTML email output.
  /appkit[/\\]src[/\\]features[/\\]contact[/\\]email\.tsx$/,
  // UI component primitives — variant system owns the underlying CSS.
  /appkit[/\\]src[/\\]ui[/\\]components[/\\]/,
  /appkit[/\\]src[/\\]ui[/\\]forms[/\\]/,
  /appkit[/\\]src[/\\]ui[/\\]rich-text[/\\]/,
  // Media primitives — Canvas/ImageCrop/VideoTrim require computed positioning.
  /appkit[/\\]src[/\\]features[/\\]media[/\\]/,
  // Internal client primitives — animated/positioned UI components.
  /appkit[/\\]src[/\\]_internal[/\\]client[/\\]/,
  // OG image renderers — @vercel/og/ImageResponse ONLY supports inline styles; CSS classes are ignored.
  /appkit[/\\]src[/\\]_internal[/\\]server[/\\]/,
  // ErrorBoundary + GlobalError — critical-path CSS must work when the CSS bundle fails to load.
  /appkit[/\\]src[/\\]react[/\\]ErrorBoundary\.tsx$/,
  /appkit[/\\]src[/\\]next[/\\]components[/\\]GlobalError\.tsx$/,
  // FormShell — calc(var(--appkit-z-modal) ± N) z-index expressions can't be CSS classes.
  /appkit[/\\]src[/\\]features[/\\]shell[/\\]FormShell\.tsx$/,
  // CLAUDE.md §"Inline Style Rules" explicitly allowlists these animation/canvas components:
  /appkit[/\\]src[/\\]features[/\\]homepage[/\\]components[/\\]HeroCarousel\.tsx$/,
  /appkit[/\\]src[/\\]features[/\\]events[/\\]components[/\\]SpinWheelView\.tsx$/,
  /appkit[/\\]src[/\\]features[/\\]before-after[/\\]components[/\\]BeforeAfterSlider\.tsx$/,
  // Character hotspot admin canvas tool — 120+ dynamic inline positions from user-authored JSON.
  /appkit[/\\]src[/\\]features[/\\]homepage[/\\]components[/\\]CharacterHotspot/,
  // Admin Copilot chat UI — dynamic per-message bubble geometry (sender vs receiver radius values)
  // that change at runtime and cannot be expressed as static Tailwind classes.
  /appkit[/\\]src[/\\]features[/\\]copilot[/\\]/,
  // DataTable UI primitive — col.width is dynamic user-configured table column sizing.
  /appkit[/\\]src[/\\]ui[/\\]DataTable\.tsx$/,
];

const RULES = [
  {
    id: "INLINE_STYLE",
    label: "Inline style={{ }} (use Tailwind classes or CSS variables; add `// audit-inline-style-ok: <reason>` for legitimate dynamic patterns)",
    regex: /style\s*=\s*\{\{/,
  },
  {
    id: "INLINE_STYLE_VAR",
    label: "Inline style={variable} (use className or CSS variables; add `// audit-inline-style-ok: <reason>` for pass-through props)",
    regex: /style\s*=\s*\{(?!\{)[a-zA-Z]/,
  },
  {
    id: "RAW_SURFACE_CLASSES",
    label: "Raw surface classes on appkit primitive (use surface prop)",
    regex: /<(?:Stack|Row|Grid|Container|Section|Div)\s[^>]*className\s*=\s*[{"].*bg-white\s+dark:bg-(?:slate|zinc)-9/,
  },
  {
    id: "RAW_PADDING_CLASSES",
    label: "Raw padding classes on appkit primitive (use padding prop)",
    regex: /<(?:Stack|Row|Grid|Container|Section|Div)\s[^>]*className\s*=\s*[{"].*\bp-[3-8]\b/,
  },
  {
    id: "RAW_ALIGN_ON_ROW",
    label: "Raw items-* on <Row> (use align prop)",
    regex: /<Row\s[^>]*className\s*=\s*[{"].*\bitems-(?:center|start|end|stretch|baseline)\b/,
  },
  {
    id: "RAW_JUSTIFY_ON_ROW",
    label: "Raw justify-* on <Row> (use justify prop)",
    regex: /<Row\s[^>]*className\s*=\s*[{"].*\bjustify-(?:center|start|end|between|around|evenly)\b/,
  },
  {
    id: "RAW_OVERFLOW",
    label: "Raw overflow-* on appkit primitive (use overflow classes from THEME_CONSTANTS.overflow)",
    regex: /<(?:Stack|Row|Grid|Container|Section|Div)\s[^>]*className\s*=\s*[{"].*\boverflow-(?:auto|scroll|hidden|x-auto|y-auto|x-hidden|y-hidden)\b/,
  },
  {
    // New rule (variant catalogue): inline colour / background / border-colour
    // overrides bypass the theme tokens. Every theme-aware tint comes from a
    // primitive variant (`color`, `surface`, `tone`); inline colour writes
    // never inherit the active theme.
    id: "INLINE_COLOR_OVERRIDE",
    label:
      "Inline color / backgroundColor / borderColor in style={{ … }} (use a primitive `color` / `surface` / `tone` variant; add `// audit-inline-style-ok: <reason>` for legitimate dynamic colour pickers)",
    regex: /style\s*=\s*\{\{[^}]*\b(?:color|backgroundColor|borderColor)\s*:/,
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
      if (ALLOWLIST_PATH_PATTERNS.some(rx => rx.test(full))) continue;
      results.push(full);
    }
  }
  return results;
}

function isInsideComment(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
}

// Suppression marker for documented-legitimate dynamic inline styles
// (backgroundImage URLs, computed widths/positions, CSS variable expressions, etc).
// Use sparingly with a reason — most inline styles should be converted to classes.
const SUPPRESS_RE = /(?:\/\/|\{?\/\*)\s*audit-inline-style-ok/;

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
      const prevLine = i > 0 ? lines[i - 1] : "";
      if (SUPPRESS_RE.test(line) || SUPPRESS_RE.test(prevLine)) continue;

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

let totalViolations = 0;

for (const rule of RULES) {
  const hits = violations[rule.id];
  totalViolations += hits.length;

  if (hits.length > 0) {
    console.error(`\n[${rule.id}] ${hits.length} violation(s) — ${rule.label}`);
    for (const v of hits) {
      console.error(`  ${v.file}:${v.line} — ${v.text}`);
    }

  }
}

console.log("");

if (totalViolations === 0) {
  console.log("audit-inline-styles: clean ✓");
  process.exit(0);
}

console.error(`audit-inline-styles: ${totalViolations} violation(s).`);
process.exit(1);

#!/usr/bin/env node
/**
 * audit-status-color-pairs.mjs — status colours must be used in matched pairs.
 *
 * Each semantic status (`success` / `warning` / `error` / `info`) ships TWO
 * background/foreground pairings, and they are NOT interchangeable:
 *
 *     chip     ->  bg-{status}-surface  +  text-{status}
 *     overlay  ->  bg-{status}-solid    +  text-{status}-on-solid
 *
 * `--appkit-color-{status}` and `--appkit-color-{status}-surface` both INVERT
 * with the theme — in light themes the surface is a 50-level tint and the
 * foreground a 700-level ink; in dark themes they swap. That is what makes the
 * chip pairing readable everywhere, and it is also what makes a literal
 * `text-white` broken in exactly one theme no matter which background it is
 * paired with:
 *
 *     bg-warning-surface + text-white  ->  #fffbeb bg, white text (LIGHT: invisible)
 *     bg-error           + text-white  ->  rose-400 bg, white text (DARK:  invisible)
 *
 * `--appkit-color-{status}-solid` / `-on-solid` exist for the overlay case and
 * are deliberately theme-INVARIANT (dark saturated fill, white ink, always) so
 * a badge sitting on a product photo stays legible in every theme.
 *
 * WHY THIS AUDIT EXISTS (2026-08-21). A past sweep mechanically replaced solid
 * status fills (`bg-red-500 text-white`) with the `-surface` tint token but
 * left `text-white` in place. That shipped 24 invisible-in-light-mode surfaces
 * — the "Auction" / "Pre-Order" / "Live Item" listing badges, the NEW / SALE /
 * LIMITED product-grid badges, notification count bubbles, prize-draw WON
 * stamps, the seller-sidebar nav badge — none of which threw, logged, or
 * failed a build. The only symptom was a user noticing they could not read a
 * tag. Strict-zero.
 *
 * Also blocks status classes that do not resolve to a token at all. `danger`
 * is a bare alias of `error` in appkit's Tailwind config (a flat string, so it
 * has no `-surface`/`-solid` sub-keys) and it does not survive into the
 * consumer build at all, because the consumer's `extend.colors` replaces that
 * whole object. `bg-danger-surface` therefore emitted NO background whatsoever
 * — that is how the "Live Item" badge came to render as bare dark-red text
 * floating on a product photo. Tailwind silently drops unknown utilities, so
 * this class of typo is invisible without an audit.
 *
 * Suppression: `// audit-status-color-pair-ok: <reason>` on the same line or
 * the line above. Reserve it for a background that is provably dark in every
 * theme by some other mechanism (an explicit dark ancestor, an image scrim).
 */

const BASELINE = 0;

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "build", ".git", "coverage", "__mocks__"]);
const SKIP_FILE_RE = /\.(d\.ts|test\.[jt]sx?|spec\.[jt]sx?)$/;
const SCAN_EXT_RE = /\.(tsx?|jsx?)$/;

const STATUSES = ["success", "warning", "error", "info"];
const SUPPRESS_RE = /audit-status-color-pair-ok\s*:/;

/**
 * Foreground tokens that are white (or resolve to white) in every theme.
 * `text-{status}-on-solid` is included because it is white by definition —
 * pairing it with a theme-relative background is the same bug spelled with
 * the newer token.
 */
const WHITE_TEXT_RE = new RegExp(
  [
    String.raw`\btext-white\b`,
    String.raw`\btext-\[#(?:fff|ffffff)\]`,
    String.raw`\btext-\[var\(--appkit-color-text-on-primary\)\]`,
    String.raw`\btext-\[var\(--appkit-color-text-on-dark\)\]`,
    String.raw`\btext-(?:${STATUSES.join("|")})-on-solid\b`,
  ].join("|"),
  "",
);

/**
 * `surface` prop values that follow the active theme, i.e. resolve to a LIGHT
 * background in every light theme. Pairing any of these with `color="inverse"`
 * (white ink) is the primitive-prop spelling of the same bug — this is exactly
 * how the WhatsApp community card's "5,000+ members" pill became white-on-white.
 * `frost` / `overlay-*` / `media-dark` are absent on purpose: those are dark or
 * translucent-white-on-dark by construction and pair with inverse text.
 */
const THEME_RELATIVE_SURFACES = [
  "default", "muted", "subtle", "inset", "card", "elevated",
  "interactive", "form", "sidePanel", "glass", "skeleton", "skeleton-light",
  ...STATUSES.map((s) => (s === "error" ? "danger-surface" : `${s}-surface`)),
];

const RULES = [
  {
    id: "SURFACE_WITH_WHITE_TEXT",
    // bg-{status}-surface paired with any always-white foreground.
    test: (line) =>
      new RegExp(String.raw`\bbg-(?:${STATUSES.join("|")})-surface\b`).test(line) &&
      WHITE_TEXT_RE.test(line),
    hint: (s) =>
      `\`bg-${s}-surface\` is a LIGHT tint in every light theme — white text on it is invisible.\n` +
      `      For an inline chip use  bg-${s}-surface text-${s}\n` +
      `      For an overlay badge use bg-${s}-solid text-${s}-on-solid`,
  },
  {
    id: "DEFAULT_WITH_WHITE_TEXT",
    // Bare bg-{status} (the theme-relative ink colour used as a fill) + white
    // text. Readable in light themes, invisible in dark ones where
    // --appkit-color-{status} flips to a 400-level pastel.
    test: (line) =>
      new RegExp(String.raw`\bbg-(?:${STATUSES.join("|")})(?![\w-])`).test(line) &&
      WHITE_TEXT_RE.test(line),
    hint: (s) =>
      `\`bg-${s}\` flips to a light 400-level pastel in dark themes — white text on it is invisible there.\n` +
      `      Use bg-${s}-solid text-${s}-on-solid (theme-invariant) for a solid fill.`,
  },
  {
    id: "SOLID_WITH_THEME_TEXT",
    // bg-{status}-solid is always a dark fill; text-{status} goes pastel in
    // light themes and would sit on that dark fill at low contrast.
    test: (line) =>
      new RegExp(String.raw`\bbg-(?:${STATUSES.join("|")})-solid\b`).test(line) &&
      new RegExp(String.raw`\btext-(?:${STATUSES.join("|")})(?![\w-])`).test(line),
    hint: (s) =>
      `\`bg-${s}-solid\` is a dark fill in every theme — pair it with \`text-${s}-on-solid\`, not \`text-${s}\`.`,
  },
  {
    id: "NONEXISTENT_STATUS_CLASS",
    // Utilities that name a real token but in a combination Tailwind never
    // generates, so the declaration is silently dropped.
    test: (line) =>
      new RegExp(
        [
          // `danger` is a flat alias with no sub-keys, and is absent entirely
          // from the consumer build.
          String.raw`\b(?:bg|text|border|ring|fill|stroke)-danger-[\w-]+`,
          String.raw`\b(?:bg|border|ring|fill|stroke)-danger(?![\w-])`,
          // A tint is a background, an ink is a foreground — never the reverse.
          String.raw`\btext-(?:${STATUSES.join("|")})-surface\b`,
          String.raw`\bbg-(?:${STATUSES.join("|")})-on-solid\b`,
        ].join("|"),
      ).test(line),
    hint: () =>
      `This utility is not generated by either Tailwind config, so Tailwind drops it silently.\n` +
      `      \`danger\` is a bare alias of \`error\` with no -surface/-solid sub-keys, and the consumer\n` +
      `      build drops it entirely. Use error-* / the {status}-surface|{status}-solid pairings.`,
  },
];

/**
 * Extract a JSX opening tag's attribute text, starting just after `<Tag`.
 *
 * A naive `[^>]*?` stops at the first `>` character — including the `>` inside
 * an arrow function (`onChange={() => f()}`) — silently truncating the
 * attribute list before later props and producing a false negative (see
 * CLAUDE.md Recurrent Root Cause Pattern #29, where exactly that regex hid a
 * live violation). This walks characters tracking string/template/brace state.
 */
function extractOpenerAttrs(text, from) {
  let depth = 0;
  let quote = null;
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") { depth++; continue; }
    if (ch === "}") { depth--; continue; }
    if (ch === ">" && depth === 0) {
      const end = text[i - 1] === "/" ? i - 1 : i;
      return text.slice(from, end);
    }
  }
  return null;
}

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
    if (entry.isDirectory()) { walk(full, files); continue; }
    if (!SCAN_EXT_RE.test(entry.name) || SKIP_FILE_RE.test(entry.name)) continue;
    files.push(full);
  }
  return files;
}

const rel = (p) => relative(ROOT, p).replace(/\\/g, "/");

/**
 * The token definitions themselves legitimately mention every spelling this
 * audit bans (that is what makes them definitions), as does this file.
 */
const EXEMPT_FILES = new Set([
  "appkit/src/tokens/color-pairs.ts",
  "appkit/src/ui/components/surface-tokens.ts",
]);

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const relPath = rel(file);
    if (EXEMPT_FILES.has(relPath)) continue;

    let source;
    try { source = readFileSync(file, "utf8"); } catch { continue; }

    const lines = source.split(/\r?\n/);
    const suppressed = (i) =>
      SUPPRESS_RE.test(lines[i] ?? "") || SUPPRESS_RE.test(lines[i - 1] ?? "");

    // --- Pass 1: class-string pairings, line-scoped -----------------------
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes("-")) continue;
      if (suppressed(i)) continue;
      for (const rule of RULES) {
        if (!rule.test(line)) continue;
        const status =
          STATUSES.find((s) => new RegExp(String.raw`\b(?:bg|text)-${s}\b|\b(?:bg|text)-${s}-`).test(line)) ??
          "error";
        violations.push({
          file: relPath,
          line: i + 1,
          rule: rule.id,
          snippet: line.trim().slice(0, 150),
          hint: rule.hint(status),
        });
        break; // one finding per line — the fix is the same edit either way
      }
    }

    // --- Pass 2: primitive props (`surface="card" color="inverse"`) -------
    if (!file.endsWith(".tsx") && !file.endsWith(".jsx")) continue;
    const OPENER_RE = /<([A-Z][A-Za-z0-9]*)\b/g;
    let m;
    while ((m = OPENER_RE.exec(source))) {
      const attrs = extractOpenerAttrs(source, m.index + m[0].length);
      if (!attrs) continue;
      const surfaceMatch = attrs.match(/\bsurface\s*=\s*"([^"]+)"/);
      if (!surfaceMatch) continue;
      if (!THEME_RELATIVE_SURFACES.includes(surfaceMatch[1])) continue;
      if (!/\bcolor\s*=\s*"inverse"/.test(attrs)) continue;

      const lineNo = source.slice(0, m.index).split(/\r?\n/).length;
      if (suppressed(lineNo - 1)) continue;
      violations.push({
        file: relPath,
        line: lineNo,
        rule: "PRIMITIVE_SURFACE_INVERSE_TEXT",
        snippet: `<${m[1]} surface="${surfaceMatch[1]}" … color="inverse">`,
        hint:
          `surface="${surfaceMatch[1]}" follows the active theme — it is a LIGHT background in every\n` +
          `      light theme, so color="inverse" (white) renders white-on-white.\n` +
          `      For a chip on a dark/branded backdrop use surface="frost" (translucent white on dark).\n` +
          `      For a status chip drop color="inverse" — SURFACE_TEXT_PAIR_MAP already supplies a\n` +
          `      readable default foreground for every surface token.`,
      });
    }
  }
}

violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (violations.length > BASELINE) {
  console.error(`[audit-status-color-pairs] FAIL: ${violations.length} violation(s) (baseline ${BASELINE}).\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
    console.error(`      ${v.snippet}`);
    console.error(`      ${v.hint}\n`);
  }
  console.error("  Pairings:  chip -> bg-{status}-surface + text-{status}");
  console.error("             overlay -> bg-{status}-solid + text-{status}-on-solid");
  console.error("  Suppress a provably-safe case with: // audit-status-color-pair-ok: <reason>");
  process.exit(1);
}

console.log(`[audit-status-color-pairs] OK: 0 violations across ${SCAN_DIRS.length} scan roots.`);

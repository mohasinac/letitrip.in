#!/usr/bin/env node
/**
 * audit-icon-sizing.mjs — an icon's size comes from its role, not from taste.
 *
 * `ICON_SIZE` (appkit/src/ui/icons/icon-registry.ts) is the only sanctioned
 * scale: xs 12 / sm 14 / md 16 / lg 20 / xl 24 / 2xl 28. `<Button>` and `<IconButton>`
 * derive their own glyph size from it, so a call site should usually pass no
 * size at all.
 *
 * WHY THIS AUDIT EXISTS (2026-08-27). Reported as "the wishlist icon is very
 * small … this issue is with all icons in general". Three distinct defects, and
 * only the first is about a number:
 *
 * 1. OFF-SCALE. A glyph at a size with no tier — nobody can say what size it
 *    "is", so the next one is guessed too.
 *
 * 2. MISMATCH. The auction card's heart was a 14px lucide glyph inside a
 *    `<Button>` with no `size` prop — which defaults to `md`, ~44px tall. The
 *    largest tap target in the card carried the smallest glyph. `<Button>`
 *    itself hardcoded `h-4 w-4` for every button size, so nothing related the
 *    two at all.
 *
 * 3. TEXT GLYPHS. `♥`/`♡`/`★`/`☆` used AS icons — in the product list row, both
 *    pre-order card layouts, and baked into the product detail page's label
 *    STRINGS. No width or height utility can size a text character; it renders
 *    at the platform font fallback. This is the literal "very small" report,
 *    and it is invisible to any size-based check, which is why it is a rule.
 *
 * SCOPE: icons inside an INTERACTIVE CONTROL — a button, or an element with an
 * onClick / aria-label. That is deliberate and is where the whole reported
 * defect class lives: a control's glyph has a tap target to agree with, and
 * getting that pair wrong is what reads as "broken". Decorative section art (a
 * 28px `<Mail>` heading a newsletter block, a lightbox chrome glyph) is a
 * composition choice, not a system violation, and flagging ~40 of those would
 * be the noise that trains people to ignore this audit.
 *
 * NO SUPPRESSION MARKER, deliberately — matching audit-theme-invariant-hover.
 * Every in-scope case has a first-class spelling: pick a tier, let the control
 * choose, or use `<Icon name="…">`. A decorative non-glyph box (a bullet dot on
 * a `<Span>`, an avatar frame on a `<Div>`) is not an icon and is not scanned.
 */

const BASELINE = 0;

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set([
  "node_modules", ".next", "dist", "build", ".git", "coverage", "__mocks__", "__tests__",
]);
const SKIP_FILE_RE = /\.(d\.ts|test\.[jt]sx?|spec\.[jt]sx?)$/;

/** The scale, as Tailwind numeric steps. */
const SCALE = new Map([
  ["3", "xs"], ["3.5", "sm"], ["4", "md"], ["5", "lg"], ["6", "xl"], ["7", "2xl"],
]);

/**
 * Elements that ARE glyphs. A capitalised component is only treated as an icon
 * when it is a known glyph host — a bare `<Span className="h-2 w-2">` is a
 * bullet dot and `<Div className="h-7 w-7">` is an avatar frame; sizing those
 * off-scale is correct, and flagging them would be noise that trains people to
 * ignore this audit.
 */
const NON_ICON_COMPONENTS = new Set([
  "Div", "Span", "Row", "Stack", "Grid", "Container", "Section", "Text",
  "Heading", "Card", "Image", "MediaImage", "MediaVideo", "Avatar", "Skeleton",
  "IconBox", "Button", "IconButton", "Link", "TextLink", "Anchor",
]);

/** `★`/`☆`/`♥`/`♡`/`✓`/`✗` standing in for an icon. */
// Only glyphs that stand in for a real registry icon. A `✓` bullet in a
// static feature list is conventional typography, not a control affordance.
const TEXT_GLYPH_RE = /[★☆♡♥]/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(join(dir, e.name), out);
    } else out.push(join(dir, e.name));
  }
  return out;
}

/**
 * Walk a JSX opening tag to its own `>`, brace/quote aware.
 * A `<Tag[^>]*>` regex stops at the `>` inside `onClick={() => f()}` and never
 * reaches className — that is the false negative in Root Cause #29.
 */
function openerEnd(src, start) {
  let i = start;
  let depth = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return i;
    i++;
  }
  return src.length;
}

function stripComments(src) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (quote) {
      out += c;
      if (c === "\\") { out += n ?? ""; i += 2; continue; }
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; out += c; i++; continue; }
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== "\n") { out += " "; i++; }
      continue;
    }
    if (c === "/" && n === "*") {
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += "  ";
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/**
 * Is `idx` inside an interactive control?
 *
 * Cheap and deliberate: scan back a bounded window for the nearest enclosing
 * control opener. Precise enough to separate "a glyph in a button" from "a
 * glyph decorating a section heading", which is the line this audit draws —
 * see SCOPE in the header for why that line is where it is.
 */
function inControl(src, idx) {
  const window = src.slice(Math.max(0, idx - 600), idx);
  return /<(?:button|a|Button|IconButton|TextLink|Anchor)\b|onClick=|aria-label=/.test(
    window,
  );
}

const rel = (p) => relative(ROOT, p).replace(/\\/g, "/");
const lineOf = (src, idx) => src.slice(0, idx).split(/\r?\n/).length;
const violations = [];

const OPENER_RE = /<(svg|[A-Z][A-Za-z0-9]*)\b/g;
const HW_RE = /(?<![\w:./-])h-([0-9.]+) w-([0-9.]+)(?![\w./-])/;
const WH_RE = /(?<![\w:./-])w-([0-9.]+) h-([0-9.]+)(?![\w./-])/;

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    if (!file.endsWith(".tsx") || SKIP_FILE_RE.test(file)) continue;
    const raw = readFileSync(file, "utf8");
    const source = stripComments(raw);
    const relPath = rel(file);

    // --- OFF_SCALE_ICON --------------------------------------------------
    let m;
    OPENER_RE.lastIndex = 0;
    while ((m = OPENER_RE.exec(source))) {
      const tag = m[1];
      if (tag !== "svg" && NON_ICON_COMPONENTS.has(tag)) continue;
      const attrs = source.slice(m.index, openerEnd(source, m.index) + 1);
      const hit = HW_RE.exec(attrs) ?? WH_RE.exec(attrs);
      if (!hit) continue;
      const [a, b] = HW_RE.test(attrs)
        ? [hit[1], hit[2]]
        : [hit[2], hit[1]];
      if (a !== b) continue;
      const px = parseFloat(a) * 4;
      if (!Number.isFinite(px) || px > 28) continue; // avatar/tile territory
      if (SCALE.has(a)) continue;
      if (!inControl(source, m.index)) continue;
      violations.push({
        file: relPath,
        line: lineOf(source, m.index),
        rule: "OFF_SCALE_ICON",
        snippet: `<${tag} … h-${a} w-${a}>  (${px}px)`,
        hint:
          `${px}px is not on the icon scale (12 / 14 / 16 / 20 / 24 / 28).\n` +
          `      Pick the nearest tier from ICON_SIZE, or let <Button>/<IconButton> size it.`,
      });
    }

    // --- TEXT_GLYPH_ICON --------------------------------------------------
    // The glyph must be the ENTIRE content of its slot — `>♥<`, `"♡"`, or a
    // ternary yielding only glyphs. `"3★ and above"` is a rating LABEL, where
    // the star is prose meaning "stars", and `"4.5 ★"` is a readout; neither is
    // an icon and flagging them would train people to ignore this audit.
    if (TEXT_GLYPH_RE.test(source)) {
      const ALONE_RE = new RegExp(
        [
          String.raw`>\s*[★☆♡♥]\s*<`,
          String.raw`["'\`]\s*[★☆♡♥]\s*["'\`]`,
          String.raw`\{\s*[★☆♡♥]\s*\}`,
        ].join("|"),
        "g",
      );
      for (const g of source.matchAll(ALONE_RE)) {
        if (!inControl(source, g.index)) continue;
        violations.push({
          file: relPath,
          line: lineOf(source, g.index),
          rule: "TEXT_GLYPH_ICON",
          snippet: g[0].trim().slice(0, 100),
          hint:
            `A text character standing alone as an icon. No width or height\n` +
            `      utility can size it — it renders at the platform font fallback,\n` +
            `      which is exactly the "the icon is very small" report.\n` +
            `      Use <Icon name="…" size="…" /> from the icon registry.`,
        });
      }
    }
  }
}

violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (violations.length > BASELINE) {
  console.error(`[audit-icon-sizing] FAIL: ${violations.length} violation(s) (baseline ${BASELINE}).\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
    console.error(`      ${v.snippet}`);
    console.error(`      ${v.hint}\n`);
  }
  console.error("  Scale: xs 12 / sm 14 / md 16 / lg 20 / xl 24 / 2xl 28  (ICON_SIZE)");
  console.error("  Prefer letting <Button>/<IconButton> pick the size over passing one.");
  console.error("  There is no suppression marker for this audit — see the header.");
  process.exit(1);
}

console.log(`[audit-icon-sizing] OK: 0 violations across ${SCAN_DIRS.length} scan roots.`);

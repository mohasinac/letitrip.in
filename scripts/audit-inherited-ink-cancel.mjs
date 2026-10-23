#!/usr/bin/env node
/**
 * audit-inherited-ink-cancel.mjs — a child that declares its own ink cancels
 * the white it was supposed to inherit from a fixed-fill container.
 *
 * `.appkit-card--gradient-indigo` (and its teal/amber/rose siblings) set
 * `color: white`. That only INHERITS: it reaches a descendant that declares no
 * colour of its own, and nothing else. A `<Text variant="secondary">` inside
 * one emits `.appkit-color--secondary { color: var(--appkit-color-text-muted) }`
 * — a grey chosen for the PAGE background — and an element with its own
 * `color` never consults the inherited value. No cascade subtlety, no
 * specificity contest: inheritance simply does not apply.
 *
 * WHY THIS AUDIT EXISTS (2026-10-23). Reported as, in full, "can you read?",
 * against the About page's three "How It Works" cards: muted grey body text on
 * saturated indigo and teal. The hero at the top of the SAME component had it
 * right (`color="inverse"` + `variant="none"`), so this was not a missing
 * token or an unknown pattern — it was one author reaching for the default
 * `<Text>` three hundred lines below another author's correct call.
 *
 * Nothing could catch it. `tsc` is happy — both props are valid. The CSS is
 * valid. `audit-status-color-pairs` looks for a literal `text-white` on an
 * INVERTING background and this is the mirror image: theme-relative ink on a
 * FIXED one. The only detector was a human looking at the page.
 *
 * 🛑 THE DEFAULT IS A DECLARATION. `<Heading level={3}>` with no `color` prop
 * is not "inherit" — it resolves to a class that sets `color`, so it cancels
 * the white exactly as `variant="secondary"` does. That is why a bare text
 * primitive inside a fixed-fill container is reported: the half of the bug
 * that is easy to miss is the one where the author wrote no colour at all.
 *
 * SCOPE, deliberately narrow. Only containers whose fill is FIXED across
 * themes are considered — a gradient Card variant, an accent-banner Section,
 * a `-solid` status surface, `media-dark`. A theme-relative surface
 * (`default`, `card`, `muted`) inverts along with the ink, so ordinary text on
 * it is correct and must not be flagged. Getting that boundary wrong is how a
 * rule ends up louder than the truth (Root Cause #84), and a rule that reports
 * 53 non-violations out of 72 is one people learn to skip.
 *
 * NO SUPPRESSION MARKER. `audit-no-suppression-comments` bans them, and the
 * genuine exception already has a first-class spelling: a child that really
 * should keep page-coloured ink on a coloured panel wants its own surface
 * (`<Div surface="card">`), not a marker.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, relative } from "path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");
const SCAN_DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];

const BASELINE = 0;

/**
 * Container openings whose fill does NOT invert with the theme, so their
 * contents inherit a fixed light ink.
 *
 * Each entry is matched against the container's opening-tag attribute text.
 */
const FIXED_FILL_CONTAINERS = [
  { tag: "Card", attr: /variant\s*=\s*[{"'`]?\s*(?:`)?gradient-/, what: 'Card variant="gradient-*"' },
  { tag: "Section", attr: /tone\s*=\s*"accent-banner"/, what: 'Section tone="accent-banner"' },
  { tag: "Div", attr: /surface\s*=\s*"media-dark"/, what: 'surface="media-dark"' },
  { tag: "Stack", attr: /surface\s*=\s*"media-dark"/, what: 'surface="media-dark"' },
  { tag: "Row", attr: /surface\s*=\s*"media-dark"/, what: 'surface="media-dark"' },
  { tag: "Div", attr: /surface\s*=\s*"(?:success|warning|error|info)-solid"/, what: 'surface="*-solid"' },
  { tag: "Span", attr: /surface\s*=\s*"(?:success|warning|error|info)-solid"/, what: 'surface="*-solid"' },
];

/**
 * Text primitives, split by whether writing NO colour prop still declares a
 * colour. This distinction is the entire accuracy of the audit, and it was
 * measured rather than assumed: `Heading` and `Text` default to
 * `variant="primary"`, which maps to `.appkit-color--primary` and therefore
 * cancels the inherited white, while `Span` defaults to `variant="inherit"`,
 * which maps to `""` and inherits correctly.
 *
 * 🛑 The first draft treated all three alike and reported 5 violations, FOUR
 * of them bare `<Span>`s that were already correct. That is the Root Cause #84
 * failure mode — a rule louder than the truth — and it was caught only by
 * opening the files the count pointed at instead of trusting the number.
 */
const TEXT_TAGS = [
  { tag: "Heading", defaultDeclaresInk: true },
  { tag: "Text", defaultDeclaresInk: true },
  { tag: "Span", defaultDeclaresInk: false },
];

/** Ink values that are correct on a fixed light-on-dark fill. */
const INVERSE_INK = /(?:color|tone)\s*=\s*"(?:inverse|inverse-muted|on-primary|frost)"/;

/** An explicit theme-relative ink — wrong on a fixed fill whatever the tag. */
const THEME_INK =
  /(?:color|variant)\s*=\s*"(?:primary|secondary|muted|faint|accent|error|danger|success|warning|info)"/;

/** Opts out of the colour class entirely, so the element inherits. */
const NO_INK = /variant\s*=\s*"(?:none|inherit)"/;

/**
 * A nested container that paints its OWN theme-relative background, which
 * re-establishes page-coloured ink for everything inside it.
 *
 * 🛑 Without this, the audit is wrong in the other direction. `EventSaleBanner`
 * puts a `<Div surface="default">` coupon chip inside its accent banner — a
 * light pill on the dark band — and page ink is exactly right in there. Walking
 * a fixed-fill container's whole subtree without stopping at these would report
 * every correct chip, badge and inset panel on every banner in the codebase.
 */
const RESETS_SURFACE =
  /surface\s*=\s*"(?:default|card|muted|subtle|inset|elevated|interactive|form|glass)"/;
const CONTAINER_TAGS = ["Div", "Stack", "Row", "Section", "Card"];

/** Blank out the bodies of nested surface-resetting containers, preserving offsets. */
function maskResetRegions(body) {
  let out = body;
  for (const tag of CONTAINER_TAGS) {
    const rx = new RegExp(`<${tag}[\\s/>]`, "g");
    let m;
    while ((m = rx.exec(out))) {
      const open = readOpeningTag(out, m.index);
      if (!open || open.selfClosing) continue;
      if (!RESETS_SURFACE.test(open.text)) continue;
      const end = findCloseIndex(out, tag, open.end);
      out =
        out.slice(0, open.end) +
        out.slice(open.end, end).replace(/[^\n]/g, " ") +
        out.slice(end);
      rx.lastIndex = open.end;
    }
  }
  return out;
}

/**
 * Walk from the `<` of an opening tag to its matching `>`, tracking quotes and
 * braces. A `<Tag[^>]*>` regex stops at the `>` inside `onClick={() => f()}`
 * and never reaches the later attributes — the false-negative that made
 * audit-select-wrapper-classname miss the cart violation (Root Cause #29).
 */
function readOpeningTag(src, start) {
  let i = start;
  let depth = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'" || c === "`") {
      quote = c;
    } else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) {
      return { text: src.slice(start, i + 1), end: i + 1, selfClosing: src[i - 1] === "/" };
    }
    i++;
  }
  return null;
}

/** Find the index just past the matching `</Tag>` for an opening at `from`. */
function findCloseIndex(src, tag, from) {
  const open = new RegExp(`<${tag}[\\s/>]`, "g");
  const close = new RegExp(`</${tag}\\s*>`, "g");
  let depth = 1;
  let cursor = from;
  while (cursor < src.length) {
    open.lastIndex = cursor;
    close.lastIndex = cursor;
    const o = open.exec(src);
    const c = close.exec(src);
    if (!c) return src.length;
    if (o && o.index < c.index) {
      depth++;
      cursor = o.index + 1;
      continue;
    }
    depth--;
    if (depth === 0) return c.index;
    cursor = c.index + 1;
  }
  return src.length;
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, " "));
}

function lineOf(src, index) {
  return src.slice(0, index).split("\n").length;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === ".next") continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const violations = [];

for (const scanDir of SCAN_DIRS) {
  let files;
  try {
    files = walk(scanDir);
  } catch {
    continue;
  }
  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    if (!/gradient-|accent-banner|media-dark|-solid"/.test(raw)) continue;
    const src = stripComments(raw);
    const rel = relative(ROOT, file).replace(/\\/g, "/");

    for (const container of FIXED_FILL_CONTAINERS) {
      const openRx = new RegExp(`<${container.tag}[\\s/>]`, "g");
      let m;
      while ((m = openRx.exec(src))) {
        const opening = readOpeningTag(src, m.index);
        if (!opening || opening.selfClosing) continue;
        if (!container.attr.test(opening.text)) continue;

        const bodyStart = opening.end;
        const bodyEnd = findCloseIndex(src, container.tag, bodyStart);
        const body = maskResetRegions(src.slice(bodyStart, bodyEnd));

        for (const { tag, defaultDeclaresInk } of TEXT_TAGS) {
          const childRx = new RegExp(`<${tag}[\\s/>]`, "g");
          let cm;
          while ((cm = childRx.exec(body))) {
            const child = readOpeningTag(body, cm.index);
            if (!child) continue;
            const attrs = child.text;

            // Already correct.
            if (INVERSE_INK.test(attrs)) continue;

            const explicitThemeInk = THEME_INK.test(attrs);
            // Opted out of the colour class, so it inherits the container's.
            if (!explicitThemeInk && NO_INK.test(attrs)) continue;
            // A tag whose default inherits is wrong only if it ASKS for ink.
            if (!defaultDeclaresInk && !explicitThemeInk) continue;

            violations.push({
              file: rel,
              line: lineOf(src, bodyStart + cm.index),
              tag,
              container: container.what,
              why: explicitThemeInk
                ? "declares theme-relative ink"
                : 'defaults to variant="primary", which declares ink',
              snippet: attrs.replace(/\s+/g, " ").slice(0, 96),
            });
          }
        }
      }
    }
  }
}

const seen = new Set();
const deduped = violations.filter((v) => {
  const k = `${v.file}:${v.line}:${v.tag}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});
deduped.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (deduped.length > BASELINE) {
  console.error(
    `[audit-inherited-ink-cancel] FAIL: ${deduped.length} violation(s) (baseline ${BASELINE}).\n`,
  );
  for (const v of deduped) {
    console.error(`  ${v.file}:${v.line}  <${v.tag}> inside ${v.container} - ${v.why}`);
    console.error(`      ${v.snippet}`);
  }
  console.error(
    "\n  The container sets `color: white`, which only INHERITS — a child that\n" +
      "  declares any colour of its own (including the default one it gets from\n" +
      "  writing no `color` prop at all) never sees it.\n\n" +
      '  Fix:  <Heading color="inverse" variant="none">\n' +
      '        <Text color="inverse-muted" variant="none">\n\n' +
      "  `variant` is what re-applies a colour over `color`, so both are needed.\n" +
      "  There is no suppression marker — see the header.",
  );
  process.exit(1);
}

console.log(
  `[audit-inherited-ink-cancel] OK: 0 violations across ${SCAN_DIRS.length} scan roots.`,
);

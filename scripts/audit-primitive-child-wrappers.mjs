#!/usr/bin/env node
/**
 * audit-primitive-child-wrappers.mjs
 *
 * Guards the "collapsing internal child wrapper" defect class (Root Cause #68).
 *
 * A primitive that inserts its OWN element between its root and the consumer's
 * `{children}` creates a new sizing context nobody asked for. If that wrapper is
 * a flex/inline-flex box with no growth or stretch rules, it is shrink-to-fit in
 * BOTH axes — so any fill-style child (`<MediaImage>`, `<Image fill>`, an
 * `absolute inset-0` overlay) resolves `width:100%` / `height:100%` against a box
 * that is itself sized by that same child, collapses to 0x0, and renders blank.
 *
 * Confirmed instance: `.appkit-button__content`, the span added by the 2026-05-13
 * ripple commit (45c6c0a2) so the label paints above the ripple. It silently
 * blanked every image-tile button in the app at once — product gallery
 * thumbnails, review photo grids, prize-draw and bundle collages, the media
 * picker, the lightbox thumbnail strip — because before it existed the image was
 * a direct flex item of the button and resolved against the button's own
 * definite `h-16 w-16`. It also swallowed the button's `gap` and `justify` props,
 * which are declared on the flex container the children no longer belong to.
 *
 * Two checks:
 *
 *  1. CONTRACT — every wrapper in WRAPPERS must declare the rules that keep it
 *     from collapsing (`flex`, `align-self: stretch`, `min-width: 0`) plus the
 *     inherits that keep the root's own flex props reaching the real children.
 *
 *  2. UNREGISTERED — any NEW internal wrapper element (a BEM `appkit-x__y` class)
 *     directly wrapping `{children}` in an appkit primitive must be listed in
 *     WRAPPERS with an explicit verdict. A block-level `<div>` wrapper does not
 *     collapse (`width:auto` fills its parent), so those are registered as
 *     `collapses: false` with the reason recorded — the point is that somebody
 *     decided, not that the audit guessed.
 *
 * Strict-zero. Suppression: `// audit-child-wrapper-ok: <reason>` on the wrapper's
 * opening line or the comment block immediately above it.
 *
 * Exits 0 when violations === 0, 1 on any regression.
 */

const BASELINE = 0;
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APPKIT_UI = join(ROOT, "appkit", "src", "ui", "components");

const SUPPRESSION = "audit-child-wrapper-ok";

/**
 * Every internal element an appkit primitive puts between its root and the
 * consumer's `{children}`.
 *
 * `collapses: true`  — the wrapper is a flex/inline-flex box, so it needs the
 *                      full REQUIRED_RULES set or fill children render blank.
 * `collapses: false` — the wrapper is block-level (`width: auto` fills the
 *                      parent, height grows with content), so a fill child still
 *                      resolves correctly. `reason` records why it is exempt.
 */
const WRAPPERS = [
  {
    cls: "appkit-button__content",
    css: join(APPKIT_UI, "Button.style.css"),
    collapses: true,
  },
  {
    cls: "appkit-accordion__content",
    css: join(APPKIT_UI, "Accordion.style.css"),
    collapses: false,
    reason: "block-level <div>; width:auto fills the parent",
  },
  {
    cls: "appkit-accordion__panel",
    css: join(APPKIT_UI, "Accordion.style.css"),
    collapses: false,
    reason: "block-level <Div>; width:auto fills the parent",
  },
  {
    cls: "appkit-alert__text",
    css: join(APPKIT_UI, "Alert.style.css"),
    collapses: false,
    reason: "block-level <div>; text content only, never a fill child",
  },
  {
    cls: "appkit-drawer__body",
    css: join(APPKIT_UI, "Drawer.style.css"),
    collapses: false,
    reason: "block-level scroll body with flex:1 from its column parent",
  },
  {
    cls: "appkit-modal__body",
    css: join(APPKIT_UI, "Modal.style.css"),
    collapses: false,
    reason: "block-level scroll body with flex:1 from its column parent",
  },
  {
    cls: "appkit-quick-create-modal__body",
    css: join(APPKIT_UI, "QuickCreateModal.style.css"),
    collapses: false,
    reason: "block-level scroll body with flex:1 1 auto from its column parent",
  },
  {
    cls: "appkit-side-modal__body",
    css: join(APPKIT_UI, "SideModal.style.css"),
    collapses: false,
    reason: "block-level scroll body with flex:1 from its column parent",
  },
];

/**
 * What a `collapses: true` wrapper must declare. `flex` gives it main-axis
 * growth, `align-self: stretch` gives it cross-axis size, `min-width: 0` lets
 * it shrink below content so long labels truncate instead of overflowing, and
 * the two `inherit`s keep the root's own `gap`/`justify` props reaching the
 * children that now sit one level deeper than the container declaring them.
 */
const REQUIRED_RULES = [
  { prop: "flex", re: /\bflex\s*:\s*[^;]*\bauto\b/ },
  { prop: "align-self: stretch", re: /\balign-self\s*:\s*stretch\b/ },
  { prop: "min-width: 0", re: /\bmin-width\s*:\s*0\b/ },
  { prop: "justify-content: inherit", re: /\bjustify-content\s*:\s*inherit\b/ },
  { prop: "gap: inherit", re: /\bgap\s*:\s*inherit\b/ },
  // A flex container has FOUR properties that decide how its children lay out.
  // The 2026-08-21 fix inherited two of them and hard-coded `align-items:center`,
  // so `flex-col` / `items-*` on a Button never reached the real children and
  // every multi-child image tile silently laid out as a row (Root Cause #68).
  { prop: "flex-direction: inherit", re: /\bflex-direction\s*:\s*inherit\b/ },
  { prop: "align-items: inherit", re: /\balign-items\s*:\s*inherit\b/ },
];

const violations = [];

// --- Check 1: the CSS contract ----------------------------------------------

/**
 * Concatenate the declaration bodies of EVERY rule whose selector list targets
 * `.cls` — the class is declared across several blocks (the combined
 * `__content, __spinner` z-index rule plus its own block), and CSS applies all
 * of them, so the contract must be checked against the union, not the first hit.
 *
 * A selector matches only when `.cls` is not itself a prefix of a longer class
 * (`.appkit-button__content--loading` is a different class, not this one).
 */
function ruleBodyFor(css, cls) {
  const clsRe = new RegExp(`\\.${cls.replace(/[-]/g, "\\-")}(?![\\w-])`);
  const bodies = [];
  let cursor = 0;
  while (true) {
    const open = css.indexOf("{", cursor);
    if (open === -1) break;
    const close = css.indexOf("}", open);
    if (close === -1) break;
    // Selector text = everything back to the previous rule/at-rule boundary.
    const prevBoundary = Math.max(
      css.lastIndexOf("}", open),
      css.lastIndexOf("{", open - 1),
      css.lastIndexOf("*/", open),
    );
    const selector = css.slice(prevBoundary + 1, open);
    if (clsRe.test(selector)) bodies.push(css.slice(open + 1, close));
    cursor = close + 1;
  }
  return bodies.length ? bodies.join("\n") : null;
}

for (const w of WRAPPERS) {
  if (!w.collapses) continue;
  if (!existsSync(w.css)) {
    violations.push(`${relative(ROOT, w.css)} — stylesheet for .${w.cls} not found`);
    continue;
  }
  const css = readFileSync(w.css, "utf8");
  const body = ruleBodyFor(css, w.cls);
  if (body === null) {
    violations.push(`${relative(ROOT, w.css)} — no \`.${w.cls} { ... }\` rule found`);
    continue;
  }
  for (const rule of REQUIRED_RULES) {
    if (!rule.re.test(body)) {
      violations.push(
        `${relative(ROOT, w.css)} — .${w.cls} is missing \`${rule.prop}\`. ` +
          `Without it the wrapper is shrink-to-fit and every fill child ` +
          `(<MediaImage>, <Image fill>, absolute inset-0) collapses to 0x0.`,
      );
    }
  }
}

// --- Check 2: unregistered wrappers -----------------------------------------

const known = new Set(WRAPPERS.map((w) => w.cls));

function tsxFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      out.push(...tsxFiles(p));
    } else if (entry.name.endsWith(".tsx")) {
      out.push(p);
    }
  }
  return out;
}

// A JSX opener carrying a BEM `appkit-x__y` class, immediately wrapping {children}.
const WRAPPER_RE =
  /<(\w+)\s+className=(?:\{`|")([^"`]*\b(appkit-[a-z0-9-]+__[a-z0-9-]+)\b[^"`]*)(?:`\}|")[^>]*>\s*\{children\}/g;

for (const file of tsxFiles(join(ROOT, "appkit", "src", "ui"))) {
  const src = readFileSync(file, "utf8");
  let m;
  WRAPPER_RE.lastIndex = 0;
  while ((m = WRAPPER_RE.exec(src))) {
    const cls = m[3];
    if (known.has(cls)) continue;
    const lineNo = src.slice(0, m.index).split("\n").length;
    // Suppression: the opener's own line, or the contiguous comment block above it.
    const lines = src.split("\n");
    let suppressed = lines[lineNo - 1]?.includes(SUPPRESSION) ?? false;
    for (let i = lineNo - 2; i >= 0 && !suppressed; i--) {
      const t = lines[i].trim();
      if (!t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*")) break;
      if (t.includes(SUPPRESSION)) suppressed = true;
    }
    if (suppressed) continue;
    violations.push(
      `${relative(ROOT, file)}:${lineNo} — .${cls} wraps {children} but is not registered in ` +
        `scripts/audit-primitive-child-wrappers.mjs. Decide whether it collapses ` +
        `(flex/inline-flex → needs the full rule set) or not (block-level → record the reason).`,
    );
  }
}

// --- Checks 3 & 4: call sites that depend on the wrapper's contract ----------
//
// Check 1 guards the primitive's CSS. These two guard the other half: a call
// site can void that CSS entirely from the outside, or ask for a layout the
// wrapper cannot deliver, and neither is visible in Button.style.css.

const BUTTON_SUPPRESSION = "audit-button-fill-child-ok";

/**
 * A fill-style descendant — one whose box is defined by its parent rather than
 * its own content, so it renders blank the moment that parent stops being
 * definite.
 */
const FILL_CHILD_RE = /<MediaImage\b|<Image\b[^>]*\bfill\b|absolute\s+inset-0/;

/**
 * A STANDALONE display utility. `src/app/globals.css` declares `.block`,
 * `.flex` and `.hidden` un-layered and `!important` (a Turbopack CSS-chunking
 * workaround), so any of these beats `.appkit-button { display: inline-flex }`
 * and the button stops being a flex container — which makes every rule in
 * REQUIRED_RULES inert, because they only apply to a flex ITEM.
 *
 * The `(?![\w-])` lookahead is load-bearing: it must never fire on `flex-col`,
 * `flex-1`, `flex-shrink-0`, `flex-wrap`, `inline-flex` or `grid-cols-3`.
 */
const DISPLAY_UTIL_RE =
  /(?:^|\s)(?:(?:sm|md|lg|xl|2xl):)?(block|flex|hidden|grid|table|inline-block)(?![\w-])/;

/**
 * If a `//` or block comment starts at `i`, return the index just past it,
 * else -1. Callers must already know they are not inside a string — `//` is
 * otherwise indistinguishable from the middle of a URL.
 */
function skipComment(src, i) {
  if (src[i] !== "/") return -1;
  if (src[i + 1] === "/") {
    const nl = src.indexOf("\n", i);
    return nl === -1 ? src.length : nl;
  }
  if (src[i + 1] === "*") {
    const end = src.indexOf("*/", i + 2);
    return end === -1 ? src.length : end + 2;
  }
  return -1;
}

/**
 * Scan forward from the `<` of a JSX opening tag to the `>` that ends it,
 * tracking string and brace state.
 *
 * A `<Tag[^>]*>` regex CANNOT do this — it stops at the `>` inside
 * `onClick={() => f()}` and never reaches a later `className`. That exact
 * false negative is documented in Root Cause #29; it is why the earlier
 * wrapper audit missed every call site outside `appkit/src/ui`.
 */
function readOpeningTag(src, start) {
  let i = start + 1;
  let brace = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    if (quote) {
      if (c === "\\") { i += 2; continue; }
      if (c === quote) quote = null;
      i++;
      continue;
    }
    // Comments inside a JSX opener are common (they explain the className).
    // They routinely quote class names in backticks, which would otherwise
    // read as a template literal and swallow the rest of the tag.
    const cm = skipComment(src, i);
    if (cm !== -1) { i = cm; continue; }
    if (c === '"' || c === "'" || c === "`") { quote = c; i++; continue; }
    if (c === "{") { brace++; i++; continue; }
    if (c === "}") { brace--; i++; continue; }
    if (brace === 0 && c === ">") {
      let j = i - 1;
      while (j > start && /\s/.test(src[j])) j--;
      return { end: i, selfClosing: src[j] === "/" };
    }
    i++;
  }
  return null;
}

/** Index just past `<tag …>` … `</tag>`, honouring nesting. */
function skipElement(src, start, tag, openEnd) {
  const openTok = `<${tag}`;
  const closeTok = `</${tag}>`;
  let depth = 1;
  let i = openEnd + 1;
  while (i < src.length && depth > 0) {
    const nextOpen = src.indexOf(openTok, i);
    const nextClose = src.indexOf(closeTok, i);
    if (nextClose === -1) return src.length;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      const t = readOpeningTag(src, nextOpen);
      if (t && !t.selfClosing) depth++;
      i = t ? t.end + 1 : nextOpen + openTok.length;
    } else {
      depth--;
      i = nextClose + closeTok.length;
      if (depth === 0) return { after: i, bodyEnd: nextClose };
    }
  }
  return { after: i, bodyEnd: i };
}

/**
 * The literal string segments of a `className` prop, concatenated. Handles the
 * plain-string form, the template-literal form (skipping `${…}`), and the
 * `{[...].join(" ")}` array form. Scoped to className specifically so an
 * `aria-label` that happens to contain the word "block" can't trip the audit.
 */
function classNameLiterals(opener) {
  const at = opener.indexOf("className=");
  if (at === -1) return "";
  let i = at + "className=".length;
  const segs = [];
  const readQuoted = (q) => {
    let buf = "";
    i++;
    for (; i < opener.length; i++) {
      const c = opener[i];
      if (c === "\\") { i++; continue; }
      if (c === q) break;
      if (q === "`" && c === "$" && opener[i + 1] === "{") {
        let d = 1;
        i += 2;
        while (i < opener.length && d > 0) {
          if (opener[i] === "{") d++;
          else if (opener[i] === "}") d--;
          i++;
        }
        i--;
        continue;
      }
      buf += c;
    }
    segs.push(buf);
  };
  if (opener[i] === "{") {
    let brace = 1;
    i++;
    for (; i < opener.length && brace > 0; i++) {
      const c = opener[i];
      const cm = skipComment(opener, i);
      if (cm !== -1) { i = cm - 1; continue; }
      if (c === '"' || c === "'" || c === "`") { readQuoted(c); continue; }
      if (c === "{") brace++;
      else if (c === "}") brace--;
    }
  } else if (opener[i] === '"' || opener[i] === "'" || opener[i] === "`") {
    readQuoted(opener[i]);
  }
  return segs.filter(Boolean).join(" ");
}

const OUT_OF_FLOW_RE = /\b(absolute|fixed)\b/;

/**
 * True when every TOP-LEVEL element in the fragment is absolutely positioned.
 *
 * Subtrees are skipped deliberately: an `absolute inset-0` overlay is out of
 * flow no matter what it contains, and descending into it would see the
 * ordinary icon inside and wrongly conclude the fragment participates in
 * layout — which is exactly how this counter first mis-flagged the product
 * gallery's video-play overlay.
 */
function allOutOfFlow(fragment) {
  let sawAny = false;
  let i = 0;
  while (i < fragment.length) {
    if (fragment[i] === "<" && /[A-Za-z]/.test(fragment[i + 1] ?? "")) {
      const tag = /^<([A-Za-z][\w.]*)/.exec(fragment.slice(i))?.[1];
      const t = readOpeningTag(fragment, i);
      if (!tag || !t) break;
      sawAny = true;
      if (!OUT_OF_FLOW_RE.test(classNameLiterals(fragment.slice(i, t.end + 1)))) return false;
      if (t.selfClosing) { i = t.end + 1; continue; }
      const skipped = skipElement(fragment, i, tag, t.end);
      i = typeof skipped === "number" ? skipped : skipped.after;
      continue;
    }
    i++;
  }
  return sawAny;
}

/**
 * Count depth-1 children that participate in flex layout. Out-of-flow children
 * (`absolute` / `fixed` badges, scrims, hover overlays) are irrelevant — they
 * are not flex items. An expression container counts as ONE child, which is
 * deliberately conservative: `{cond ? <A/> : <B/>}` renders one of them.
 */
function countInFlowChildren(body) {
  let count = 0;
  let i = 0;
  while (i < body.length) {
    const c = body[i];
    if (c === "{") {
      let d = 1;
      let j = i + 1;
      let quote = null;
      while (j < body.length && d > 0) {
        const ch = body[j];
        if (quote) {
          if (ch === "\\") j++;
          else if (ch === quote) quote = null;
        } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
        else if (ch === "{") d++;
        else if (ch === "}") d--;
        j++;
      }
      const inner = body.slice(i + 1, j - 1);
      if (/<[A-Za-z]/.test(inner) && !allOutOfFlow(inner)) count++;
      i = j;
      continue;
    }
    if (c === "<" && /[A-Za-z]/.test(body[i + 1] ?? "")) {
      const tag = /^<([A-Za-z][\w.]*)/.exec(body.slice(i))?.[1];
      const t = readOpeningTag(body, i);
      if (!tag || !t) break;
      if (!OUT_OF_FLOW_RE.test(classNameLiterals(body.slice(i, t.end + 1)))) count++;
      if (t.selfClosing) { i = t.end + 1; continue; }
      const skipped = skipElement(body, i, tag, t.end);
      i = typeof skipped === "number" ? skipped : skipped.after;
      continue;
    }
    i++;
  }
  return count;
}

function sourceFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist", "__tests__", ".next"].includes(entry.name)) continue;
      out.push(...sourceFiles(p));
    } else if (entry.name.endsWith(".tsx")) {
      out.push(p);
    }
  }
  return out;
}

function isSuppressed(lines, lineNo, marker) {
  if (lines[lineNo - 1]?.includes(marker)) return true;
  for (let i = lineNo - 2; i >= 0; i--) {
    const t = lines[i].trim();
    if (!t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*")) return false;
    if (t.includes(marker)) return true;
  }
  return false;
}

const CALL_SITE_ROOTS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];

for (const root of CALL_SITE_ROOTS) {
  for (const file of sourceFiles(root)) {
    const src = readFileSync(file, "utf8");
    if (!src.includes("<Button")) continue;
    const lines = src.split("\n");
    const openRe = /<Button(?=[\s/>])/g;
    let m;
    while ((m = openRe.exec(src))) {
      const t = readOpeningTag(src, m.index);
      if (!t) break;
      openRe.lastIndex = t.end;
      if (t.selfClosing) continue;
      const skipped = skipElement(src, m.index, "Button", t.end);
      if (typeof skipped === "number") continue;
      const body = src.slice(t.end + 1, skipped.bodyEnd);
      if (!FILL_CHILD_RE.test(body)) continue;

      const lineNo = src.slice(0, m.index).split("\n").length;
      if (isSuppressed(lines, lineNo, BUTTON_SUPPRESSION)) continue;
      const rel = `${relative(ROOT, file)}:${lineNo}`;
      const cls = classNameLiterals(src.slice(m.index, t.end + 1));

      // Check 3 — a display utility voids the flex contract entirely.
      const util = DISPLAY_UTIL_RE.exec(cls);
      if (util) {
        violations.push(
          `${rel} — <Button className="… ${util[1]} …"> wraps a fill-style child. ` +
            `src/app/globals.css declares .block/.flex/.hidden un-layered and !important, ` +
            `which beats .appkit-button's \`display:inline-flex\`. The button stops being a ` +
            `flex container, so .appkit-button__content's \`flex:1 1 auto\` / \`align-self:stretch\` ` +
            `are inert and the child collapses to 0x0. Remove the display utility — if you need ` +
            `block-level flow, make the PARENT a flex column instead.`,
        );
        continue;
      }

      // Check 4 — the wrapper is a row; a multi-child image tile needs a column.
      if (countInFlowChildren(body) >= 2 && !/\bflex-col\b/.test(cls)) {
        violations.push(
          `${rel} — <Button> has 2+ in-flow children and one is a fill-style tile, but no ` +
            `\`flex-col\`. .appkit-button__content inherits flex-direction from a \`row\` button, ` +
            `so the tile and its caption become side-by-side row items and the tile shrinks to a ` +
            `fraction of its intended width. Add \`flex-col items-stretch\`, or hoist the ` +
            `non-image children out of the Button.`,
        );
      }
    }
  }
}

// --- Report ------------------------------------------------------------------

if (violations.length > BASELINE) {
  console.error(
    `\n[audit-primitive-child-wrappers] ${violations.length} violation(s) (baseline ${BASELINE}):\n`,
  );
  for (const v of violations) console.error(`  ${v}`);
  console.error(
    `\n  A primitive's internal child wrapper must not introduce a sizing context\n` +
      `  the consumer can't see. See CLAUDE.md Root Cause #68.\n`,
  );
  process.exit(1);
}

console.log(
  `[audit-primitive-child-wrappers] OK — ${WRAPPERS.length} wrapper(s) registered, 0 violations.`,
);

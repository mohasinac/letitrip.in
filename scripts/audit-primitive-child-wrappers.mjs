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

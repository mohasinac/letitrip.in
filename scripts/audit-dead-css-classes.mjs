#!/usr/bin/env node
/**
 * audit-dead-css-classes — a Tailwind class that generates NO RULE.
 *
 * Strict zero. Suppression: `// audit-dead-css-ok: <reason>`.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 * A dead Tailwind class is the quietest defect this codebase produces. There is
 * no error, no warning, no console message and no visual placeholder — the
 * element simply renders without the styling someone wrote, and it reads as a
 * design choice. Two live examples, both found 2026-10-15 by hand:
 *
 *   `items-[center]`        — a codemod substituted the CSS *property value*
 *                             into the *class name*. 25 occurrences across 18
 *                             files; every one silently unstyled.
 *   `bg-card` / `border-border` — shadcn/ui token names. This design system has
 *                             no `card`, `background`, `muted` or `border`
 *                             colour, so they compiled to nothing.
 *
 * ── Why it is not "just lint the class list" ───────────────────────────────
 * 🛑 THE AUTHORITY IS THE BUILT CSS, NOT A LIST OF KNOWN-GOOD NAMES. A rule
 * that matches class names against a hand-maintained allowlist is the exact
 * failure Root Cause #84 describes: the list is always narrower than reality,
 * and it goes quiet precisely when someone adopts a newer API. So this audit
 * reads the two compiled stylesheets and asks one question per class — "is
 * there a selector for you?" — which cannot drift from what actually ships.
 *
 * ── Two escaping traps, both of which produced a confident wrong answer ────
 * 1. A CSS identifier MAY NOT START WITH A DIGIT, so Tailwind hex-escapes it:
 *    `2xl:hidden` is emitted as `.\32 xl\:hidden` — note the trailing SPACE,
 *    which is part of the escape, not formatting. Grepping for `.2xl\:` finds
 *    zero and reads as "the 2xl breakpoint is completely broken". It is not;
 *    13 call sites were nearly "fixed" on the strength of that.
 * 2. Tailwind escapes `: / . [ ] ( ) % # , !` and more with a backslash. A
 *    naive `css.includes("." + token)` therefore misses every variant and every
 *    arbitrary value, i.e. most of the interesting cases.
 *
 * `selectorsFor()` below encodes both. It is the only part of this file worth
 * reading twice.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const SUPPRESS = "audit-dead-css-ok";

/** Stylesheets that together are every rule the browser can receive. */
const STYLESHEETS = [
  "appkit/dist/tailwind-utilities.css",
  "appkit/dist/styles.css",
  "src/styles/globals.compiled.css",
];

const SCAN_DIRS = ["appkit/src", "src"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "__tests__"]);

/**
 * Prefixes owned by hand-written CSS or by a consumer stylesheet we do not
 * parse. Not an allowlist of valid Tailwind — an allowlist of "this name is
 * deliberately defined somewhere else".
 */
const NON_TAILWIND_PREFIXES = ["appkit-", "adsbygoogle", "grecaptcha", "swiper", "mapbox"];

// ---------------------------------------------------------------------------

/**
 * A compiled stylesheet older than the source it is built from describes a
 * build that no longer exists — and judging today's classes against yesterday's
 * CSS reports working code as dead. A rule that cries wolf is a rule people
 * learn to skip, so this STANDS DOWN rather than guessing.
 */
const BUILD_PAIRS = [
  ["src/app/globals.css", "src/styles/globals.compiled.css"],
  ["appkit/src/tailwind-input.css", "appkit/dist/tailwind-utilities.css"],
];

function stalePairs() {
  const stale = [];
  for (const [src, out] of BUILD_PAIRS) {
    const s = path.join(ROOT, src);
    const o = path.join(ROOT, out);
    if (!fs.existsSync(s) || !fs.existsSync(o)) continue;
    if (fs.statSync(s).mtimeMs > fs.statSync(o).mtimeMs) stale.push([src, out]);
  }
  return stale;
}

function readStylesheets() {
  const parts = [];
  const missing = [];
  for (const rel of STYLESHEETS) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) missing.push(rel);
    else parts.push(fs.readFileSync(p, "utf8"));
  }
  return { css: parts.join("\n"), missing };
}

/**
 * Every spelling Tailwind could have emitted for this class.
 *
 * 🛑 The `!` important prefix is ESCAPED, never stripped. `!text-white/50` is
 * emitted as `.\!text-white\/50`; stripping the `!` and looking for
 * `.text-white\/50` finds nothing, because with `important: true` the plain
 * form is often never generated separately. That reported a correct, working
 * class as dead — the first false positive this audit produced.
 */
function selectorsFor(token) {
  const escape = (s) => s.replace(/[:/.[\]()%#,!&>~=@*+?^${}|\\]/g, (c) => "\\" + c);
  const out = [];
  const push = (t) => {
    const esc = escape(t);
    out.push("." + esc);
    // A CSS identifier may not start with a digit, so Tailwind hex-escapes it
    // and the escape carries ONE trailing space: `.\32 xl\:hidden`.
    if (t[0] >= "0" && t[0] <= "9") out.push("." + "\\3" + t[0] + " " + esc.slice(1));
  };
  push(token);
  // `important: true` also makes the un-prefixed form a legitimate emission.
  if (token.startsWith("!")) push(token.slice(1));
  return out;
}

/**
 * A selector match must END at a CSS class boundary.
 *
 * 🛑 A bare `css.includes(".inline-")` is satisfied by `.inline-flex`, so the
 * truncated leftover `inline-` — a real dead class, found in SocialAuthButtons
 * — was reported as fine. Any token that is a PREFIX of a real class has this
 * false negative, and a truncation is exactly the shape a bad codemod leaves
 * behind, i.e. precisely what this audit is for.
 *
 * In Tailwind's output a class name is followed by `{`, `,`, whitespace, a
 * combinator, a pseudo (`:hover`), or an escaped `\:` for the next variant —
 * never by a bare `[A-Za-z0-9_-]`, which would be more of the same class.
 */
function hasSelector(css, selector) {
  let from = 0;
  for (;;) {
    const at = css.indexOf(selector, from);
    if (at === -1) return false;
    const next = css[at + selector.length];
    if (next === undefined || !/[A-Za-z0-9_-]/.test(next)) return true;
    from = at + 1;
  }
}

/** Tokens that are plausibly Tailwind classes, not JS identifiers or prose. */
function isClassLike(t) {
  if (!t || t.length > 90) return false;
  if (!/^[a-z0-9!]/.test(t)) return false; // excludes PascalCase/CONSTANTS
  if (/[A-Z$`{}]/.test(t)) return false; // JS identifiers / interpolation
  if (t.endsWith('"') || t.endsWith("'")) return false; // split template literal
  if (!/^[a-z0-9!:[\]/.@_-]+$/.test(t)) return false;
  // A bare fragment like `/60` or `.5` is a split className, not a class.
  if (/^[./]/.test(t)) return false;
  return true;
}

function collectFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (SKIP_DIRS.has(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx|jsx)$/.test(e.name)) out.push(p);
    }
  })(dir);
  return out;
}

const CLASSNAME_RE =
  /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`]*)`\s*\}|\{\s*"([^"]*)"\s*\})/g;

function main() {
  const { css, missing } = readStylesheets();
  if (missing.length) {
    console.error(
      `[audit-dead-css-classes] SKIPPED — build artefact(s) absent: ${missing.join(", ")}\n` +
        `  This audit compares authored classes against COMPILED CSS, so it cannot\n` +
        `  run before a build. Run \`npm --prefix appkit run build\` first.`,
    );
    // Not a violation: a fresh clone has no dist. Exit 0 rather than block.
    return 0;
  }

  const stale = stalePairs();
  if (stale.length) {
    console.error(
      `[audit-dead-css-classes] SKIPPED — compiled CSS is older than its source:\n` +
        stale.map(([s, o]) => `    ${s}  ->  ${o}`).join("\n") +
        `\n  Judging current classes against a stale build reports working code as\n` +
        `  dead. Rebuild (\`npm run build:css\` / \`npm --prefix appkit run build\`)\n` +
        `  and re-run.`,
    );
    return 0;
  }

  const violations = [];
  for (const dir of SCAN_DIRS) {
    for (const file of collectFiles(path.join(ROOT, dir))) {
      const src = fs.readFileSync(file, "utf8");
      const lines = src.split(/\r?\n/);
      lines.forEach((line, i) => {
        if (line.includes(SUPPRESS)) return;
        if (i > 0 && lines[i - 1].includes(SUPPRESS)) return;
        CLASSNAME_RE.lastIndex = 0;
        let m;
        while ((m = CLASSNAME_RE.exec(line))) {
          const raw = m[1] ?? m[2] ?? m[3] ?? m[4] ?? "";
          if (raw.includes("${")) continue; // dynamic — cannot be judged statically
          for (const token of raw.split(/\s+/)) {
            if (!isClassLike(token)) continue;
            if (NON_TAILWIND_PREFIXES.some((p) => token.startsWith(p))) continue;
            if (selectorsFor(token).some((s) => hasSelector(css, s))) continue;
            violations.push({
              file: path.relative(ROOT, file).replace(/\\/g, "/"),
              line: i + 1,
              token,
            });
          }
        }
      });
    }
  }

  if (violations.length === 0) {
    console.log("[audit-dead-css-classes] OK — every authored class resolves to a rule.");
    return 0;
  }

  console.error(
    `[audit-dead-css-classes] ${violations.length} class(es) generate NO CSS rule:\n`,
  );
  const byToken = new Map();
  for (const v of violations) {
    if (!byToken.has(v.token)) byToken.set(v.token, []);
    byToken.get(v.token).push(v);
  }
  for (const [token, list] of [...byToken].sort((a, b) => b[1].length - a[1].length)) {
    console.error(`  ${token}  (${list.length})`);
    for (const v of list.slice(0, 4)) console.error(`      ${v.file}:${v.line}`);
    if (list.length > 4) console.error(`      … ${list.length - 4} more`);
  }
  console.error(
    `\n  A class with no rule renders as an unstyled element, never as an error.\n` +
      `  Common causes: a CSS *value* written as a class (\`items-[center]\`),\n` +
      `  a token from another design system (\`bg-card\`), or a colour this\n` +
      `  project's tailwind config does not define.\n` +
      `  Genuine exception: \`// ${SUPPRESS}: <reason>\` on the line or above it.`,
  );
  return 1;
}

process.exit(main());

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
import { pathToFileURL } from "node:url";

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
 * Prefixes owned by a THIRD-PARTY stylesheet this audit does not parse. Not an
 * allowlist of valid Tailwind — an allowlist of "this name is defined in a file
 * we cannot see, so we cannot judge it".
 *
 * 🛑 `appkit-` WAS on this list until 2026-10-19, under the comment "this name
 * is deliberately defined somewhere else" — and nothing ever checked that it
 * was. The hand-authored BEM half of the design system is roughly half the
 * class surface, and it was exempt by assumption. Removing the prefix found 15
 * classes shipping to production with zero rules, including every class
 * `Radio.tsx` puts on its item wrapper (the CSS defines `appkit-radio-classic*`
 * / `appkit-radio-toggle*`; the component asks for `appkit-radio-item*`).
 *
 * It is checkable precisely BECAUSE appkit's own CSS is one of the stylesheets
 * read above — so the pair being compared is the authored class and the rule
 * that is supposed to style it, which is the pair that can actually disagree.
 * Do not re-add it.
 */
const NON_TAILWIND_PREFIXES = ["adsbygoogle", "grecaptcha", "swiper", "mapbox"];

/**
 * `appkit-` names that are NOT classes — see the const-map pass in `main()`.
 * Design tokens are CSS custom properties (`--appkit-color-primary`) and are
 * also written bare as token names; element ids share the same prefix.
 */
const TOKEN_NAMESPACE_RE =
  /^appkit-(?:color|space|font|radius|shadow|z|text|gradient|duration|ease|tracking|leading)-/;
const ID_ATTR_RE = /\b(?:id|htmlFor|aria-(?:labelledby|controls|describedby|owns|activedescendant))\s*=\s*$/;

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

/**
 * 🛑 A stylesheet that EXISTS but contributes ZERO rules is the third
 * build-incompleteness state, and the only one that used to get through.
 *
 * `missing` covers a fresh clone. `stalePairs()` covers an out-of-date build.
 * Neither covers a build caught MID-WRITE: `appkit/dist/styles.css` is
 * written by `bundle-css.mjs` as a flatten of ~190 `*.style.css` files, and
 * between truncate and flush it is a 1.3 KB stub holding nothing but the
 * unresolved `@import`s. That stub is NEWER than its sources, so the mtime
 * check passes it — and `styles.css` is not in BUILD_PAIRS at all, so no
 * mtime check ever covered it.
 *
 * Measured 2026-10-19 on a tree where a concurrent session was building:
 * **this audit reported 1,109 classes as dead**, including `appkit-button`,
 * `appkit-card`, `appkit-grid` and every other core primitive. Every one was
 * a false positive from a 0-rule stylesheet, and `verify-css-build` caught
 * the real cause in the same run (`styles.css — 0 rules, below the 2500
 * floor`). 1,109 lines of noise beside the one true line is precisely the
 * "rule that cries wolf" this audit's own stale-check docstring warns about.
 *
 * Counting `{` is a deliberately crude rule-count proxy — this file already
 * parses selectors textually rather than with a CSS AST, and the only
 * question here is "did anything at all get built", for which zero-versus-
 * hundreds needs no precision.
 */
function readStylesheets() {
  const parts = [];
  const missing = [];
  const empty = [];
  for (const rel of STYLESHEETS) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) {
      missing.push(rel);
      continue;
    }
    const text = fs.readFileSync(p, "utf8");
    if ((text.match(/\{/g) ?? []).length === 0) empty.push(rel);
    parts.push(text);
  }
  return { css: parts.join("\n"), missing, empty };
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
  if (/[A-Z`{}]/.test(t)) return false; // JS identifiers / interpolation
  if (t.endsWith('"') || t.endsWith("'")) return false; // split template literal
  /*
   * A bare variant prefix is never a complete class. These reach the extractor
   * as function ARGUMENTS — `responsiveSizeClass("md:", mdSize)` sits inside a
   * `className={[…]}` array, and walking the expression cannot tell an argument
   * from a class without parsing the whole file. Ending in `:` is the one
   * unambiguous tell; note `inline-` (ends in `-`) was a REAL defect, so the
   * same shortcut must not be extended to dashes.
   */
  if (t.endsWith(":")) return false;
  /*
   * 🛑 `(`, `)`, `,` and `%` are ALLOWED, because an arbitrary value routinely
   * contains them — `lg:top-[var(--header-height,0px)]`,
   * `bottom-[calc(var(--a)+var(--b))]`. The first version of this character
   * class omitted them, so every such class failed `isClassLike` and was
   * SKIPPED rather than checked: the audit reported OK while never looking at
   * the most breakage-prone classes in the codebase (an arbitrary value is
   * hand-written CSS inside a class name, with no autocomplete and no
   * type-checking). It is the audit-went-quiet failure, inside the audit
   * written to catch exactly that.
   */
  // `*` excluded: it is never part of a real class name, but it IS how every
  // docstring in this codebase writes a family placeholder (`shadow-*`,
  // `hover:shadow-*`). Those live inside `className="…"` strings quoted in
  // JSDoc, so they reach the extractor looking exactly like classes.
  if (!/^[a-z0-9!:[\]/.@_,()%+-]+$/.test(t)) return false;
  /*
   * 🛑 Must contain `-`, `:`, `/` or `[` — i.e. be STRUCTURALLY a utility.
   *
   * Walking the whole `className={…}` expression harvests every string literal
   * in it, and most are not classes: the comparison operand in
   * `hand === "left" ? …`, a variant key in `tone === "danger"`, prose inside a
   * comment. All of those are bare single words, and a bare single word is also
   * never one of the defects this audit exists for — every real one found so
   * far (`items-[center]`, `bg-card`, `inline-`, `!/80`, `fluid-grid-card`,
   * `text-muted-foreground`) carries one of these four characters.
   *
   * The cost is that a dead bare utility (`flexx`) would be missed. That is
   * accepted: those are a closed set of stable built-ins nobody mistypes into
   * existence, and the alternative is ~70 false positives, which is the state
   * in which an audit gets switched off.
   */
  if (!/[-:/[]/.test(t)) return false;
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

/**
 * Pull every class token out of ONE `className=` expression.
 *
 * 🛑 THE ARRAY FORM IS THE DOMINANT IDIOM HERE and a quoted-string regex does
 * not see it. `BottomChrome`, `BottomActions`, `InfoPanel` and dozens more
 * write `className={["fixed …", cond ? "a" : "b"].join(" ")}`. The first
 * version of this audit matched only `className="…"` / `{`…`}` / `{"…"}`, so
 * every one of those files was invisible — and it reported OK while a
 * deliberately corrupted `lg:top-[var(--headr-height,0px)]` sat inside one.
 *
 * So instead of pattern-matching the shape of the expression, this walks from
 * `className=` to the end of that attribute (balanced braces, quote-aware) and
 * harvests EVERY string literal inside, whatever the surrounding syntax —
 * array, ternary, `clsx(...)`, nested call, template literal.
 *
 * A template chunk containing `${` is skipped on a per-literal basis: the
 * static halves of `` `grid ${cond}` `` are still worth checking, and only the
 * interpolated part is unknowable.
 */
/** Blank out comment bodies, preserving length so offsets stay valid. */
function blankComments(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    if (src[i] === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (let k = i; k < stop; k++) out += src[k] === "\n" ? "\n" : " ";
      i = stop;
      continue;
    }
    if (src[i] === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") {
        out += " ";
        i++;
      }
      continue;
    }
    out += src[i];
    i++;
  }
  return out;
}

function classTokensIn(src, startIndex) {
  const eq = src.indexOf("=", startIndex);
  if (eq === -1) return [];
  let i = eq + 1;
  while (i < src.length && /\s/.test(src[i])) i++;

  const out = [];
  const pushLiteral = (lit) => {
    if (!lit.includes("${")) {
      for (const t of lit.split(/\s+/)) if (t) out.push(t);
      return;
    }
    /*
     * 🛑 A token TOUCHING an interpolation is a FRAGMENT, not a class.
     * `` `min-${BOTTOM_NAV_HEIGHT}` `` yields the static chunk "min-", which is
     * no more a dead class than `${x}` is — reporting it is noise, and noise is
     * how an audit gets switched off.
     *
     * But the fragment test is ADJACENCY, not "ends with a dash": `inline-` was
     * a genuine dead class (a truncated `inline-flex`) and it also ends with a
     * dash. The difference is that it was followed by whitespace inside one
     * complete literal, whereas `min-` runs straight into `${`. So a chunk's
     * boundary token is dropped only when no whitespace separates it from the
     * interpolation.
     */
    const chunks = lit.split(/\$\{[^}]*\}/);
    chunks.forEach((chunk, idx) => {
      const tokens = chunk.split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return;
      const touchesPrev = idx > 0 && !/^\s/.test(chunk);
      const touchesNext = idx < chunks.length - 1 && !/\s$/.test(chunk);
      const start = touchesPrev ? 1 : 0;
      const end = touchesNext ? tokens.length - 1 : tokens.length;
      for (let k = start; k < end; k++) out.push(tokens[k]);
    });
  };

  const readString = (quote) => {
    let lit = "";
    i++; // opening quote
    while (i < src.length) {
      const c = src[i];
      if (c === "\\") {
        lit += src[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (c === quote) {
        i++;
        return lit;
      }
      lit += c;
      i++;
    }
    return lit;
  };

  if (src[i] === '"' || src[i] === "'") {
    pushLiteral(readString(src[i]));
    return out;
  }
  if (src[i] !== "{") return out;

  // Walk the balanced expression, collecting literals as we meet them.
  let depth = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "{") {
      depth++;
      i++;
      continue;
    }
    if (c === "}") {
      depth--;
      i++;
      if (depth === 0) break;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      pushLiteral(readString(c));
      continue;
    }
    i++;
  }
  return out;
}

function main() {
  const { css, missing, empty } = readStylesheets();
  if (missing.length) {
    console.error(
      `[audit-dead-css-classes] SKIPPED — build artefact(s) absent: ${missing.join(", ")}\n` +
        `  This audit compares authored classes against COMPILED CSS, so it cannot\n` +
        `  run before a build. Run \`npm --prefix appkit run build\` first.`,
    );
    // Not a violation: a fresh clone has no dist. Exit 0 rather than block.
    return 0;
  }
  if (empty.length) {
    console.error(
      `[audit-dead-css-classes] SKIPPED — compiled stylesheet present but EMPTY: ${empty.join(", ")}\n` +
        `  Zero rules parsed, so every authored class would report as dead. This is\n` +
        `  a build caught mid-write (bundle-css.mjs truncates before it flushes),\n` +
        `  not 1,000+ regressions — see readStylesheets()'s docstring.\n` +
        `  \`npm run audit verify-css-build\` names the real fault; re-run this after\n` +
        `  the build completes.`,
    );
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
      // Comments are blanked (length-preserving) so prose inside a multi-line
      // JSX comment cannot be harvested as class tokens, while every reported
      // line number still points at the real line.
      const raw = fs.readFileSync(file, "utf8");
      const src = blankComments(raw);
      /*
       * 🛑 SUPPRESSION IS CHECKED AGAINST THE RAW SOURCE, NOT THE BLANKED COPY.
       *
       * `blankComments` replaces every comment body with spaces (preserving
       * length, so offsets stay valid) — which includes the `audit-dead-css-ok`
       * marker itself. Checking `src` for it therefore NEVER matched, and the
       * documented escape hatch had never once worked. Measured 2026-10-19:
       * three correctly-placed markers changed nothing.
       *
       * It went unnoticed because the audit was at zero for other reasons, so
       * nobody had needed a marker. A suppression that cannot fire is the same
       * class of defect as a gate that cannot fail (Root Cause #87/#106) — the
       * next person to need one would have concluded their class was genuinely
       * dead and "fixed" working code.
       */
      const rawLines = raw.split(/\r?\n/);

      /*
       * A `className=` expression routinely spans many lines (the array form
       * always does), so the scan is over the WHOLE FILE and the reported line
       * is derived from the match offset. A per-line loop can only ever see
       * single-line attributes — which is the other half of why the array form
       * was invisible.
       */
      const lineStarts = [0];
      for (let k = 0; k < src.length; k++) {
        if (src[k] === "\n") lineStarts.push(k + 1);
      }
      const lineOf = (offset) => {
        let lo = 0;
        let hi = lineStarts.length - 1;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          if (lineStarts[mid] <= offset) lo = mid;
          else hi = mid - 1;
        }
        return lo; // 0-based
      };
      const lines = src.split(/\r?\n/);

      const attrRe = /\bclassName\s*=/g;
      let m;
      while ((m = attrRe.exec(src))) {
        const lineIdx = lineOf(m.index);
        // Suppression applies to the line the attribute STARTS on, or the one
        // above it — the same contract every other audit here uses.
        if (rawLines[lineIdx]?.includes(SUPPRESS)) continue;
        if (lineIdx > 0 && rawLines[lineIdx - 1]?.includes(SUPPRESS)) continue;

        for (const token of classTokensIn(src, m.index)) {
          /*
           * 🛑 THE ORPHANED ALPHA FRAGMENT, CHECKED BEFORE `isClassLike`.
           *
           * `isClassLike` rejects `/80` at its very FIRST guard —
           * `/^[a-z0-9!]/`, written to exclude PascalCase identifiers — so a
           * bare `/NN` was skipped rather than checked, and 28 of them lived
           * in `appkit/src` until 2026-10-21.
           *
           * They are codemod residue: a sweep stripped `text-white` off
           * `text-white/80` and left the modifier (the same damage Root Cause
           * #79 records, and why both dark-mode codemods were deleted rather
           * than fixed). Tailwind cannot generate a class named `/80`, so
           * every one was a silent no-op — 28 subtitles and captions meant to
           * sit at 70–90% opacity rendered at full strength, which looks like
           * a design choice rather than a bug.
           *
           * A DEDICATED CHECK rather than loosening that leading-character
           * guard: allowing `/` to start a token would admit every path-like
           * string literal in the codebase. This shape is unambiguous — a
           * slash, one to three digits, nothing else — and can never be a
           * legitimate class, so it needs no stylesheet lookup at all.
           *
           * The fix is a VARIANT, not a restored `text-white/80`: a literal
           * white does not invert per theme. `color="inverse-muted"` exists
           * for precisely this and its own token comment says so.
           */
          if (/^\/\d{1,3}$/.test(token)) {
            violations.push({
              file: path.relative(ROOT, file).replace(/\\/g, "/"),
              line: lineIdx + 1,
              token,
              hint:
                "orphaned alpha modifier — codemod residue from a stripped " +
                '`text-white/NN`. Tailwind generates nothing for it. Use ' +
                '`color="inverse-muted"` (or the matching variant), never a ' +
                "restored literal white, which cannot invert per theme.",
            });
            continue;
          }
          if (!isClassLike(token)) continue;
          if (NON_TAILWIND_PREFIXES.some((p) => token.startsWith(p))) continue;
          if (selectorsFor(token).some((s) => hasSelector(css, s))) continue;
          violations.push({
            file: path.relative(ROOT, file).replace(/\\/g, "/"),
            line: lineIdx + 1,
            token,
          });
        }
      }

      /*
       * ── Second pass: class names held in a CONST MAP ────────────────────
       *
       * 🛑 THE `className=` WALK ALONE MISSES THIS CODEBASE'S DOMINANT IDIOM
       * for hand-authored classes. `OverflowRow`, `Radio`, `MediaPickerModal`
       * and others declare
       *
       *     const UI_OVERFLOW_ROW = { pill: "appkit-overflow-row__pill", … };
       *
       * at module scope and reference `UI_OVERFLOW_ROW.pill` in the JSX, so
       * the string literal never appears inside a `className=` expression and
       * the first pass cannot reach it.
       *
       * This was found by NEGATIVE CONTROL, not by reading: with `appkit-`
       * freshly un-exempted the audit found 40 classes and reported OK — and
       * then still reported OK with `appkit-overflow-row__pill` deliberately
       * misspelled to `…__pilll`, because that literal lives in the map. The
       * 40 it did find were only the inline subset. Root Cause #87: never
       * trust an audit you have not seen fail.
       *
       * The match is deliberately NARROW — a literal consisting solely of
       * whitespace-separated `appkit-*` tokens. That shape cannot be prose (no
       * sentence is one hyphenated word), cannot be a JS identifier (identifiers
       * have no `-`), and cannot be a CSS custom property reference, which is
       * spelled `--appkit-…` and is rejected below. Tailwind utilities are left
       * to the first pass, where the surrounding `className=` proves intent.
       */
      const APPKIT_LITERAL = /["'`](appkit-[A-Za-z0-9_-]+(?:\s+appkit-[A-Za-z0-9_-]+)*)["'`]/g;
      let lit;
      while ((lit = APPKIT_LITERAL.exec(src))) {
        // `var(--appkit-color-x)` — the leading `--` sits just before the match.
        if (src.slice(Math.max(0, lit.index - 2), lit.index + 1).includes("-")) continue;
        /*
         * The `appkit-` prefix is shared by three namespaces and only one of
         * them is classes:
         *   - DESIGN TOKENS (`appkit-color-*`, `appkit-space-*`, …) are CSS
         *     custom-property names. `ThemeManagerView` and the OG renderers
         *     hold them as bare strings, without the `--`, so the guard above
         *     does not catch those.
         *   - ELEMENT IDS (`id`, `aria-labelledby`, `aria-controls`, …).
         *     `Button`'s confirm dialog uses `appkit-action-confirm-title`.
         * Both reached this pass as "classes with no rule" on its first run.
         */
        if (TOKEN_NAMESPACE_RE.test(lit[1])) continue;
        if (ID_ATTR_RE.test(src.slice(Math.max(0, lit.index - 40), lit.index))) continue;
        const lineIdx = lineOf(lit.index);
        if (rawLines[lineIdx]?.includes(SUPPRESS)) continue;
        if (lineIdx > 0 && rawLines[lineIdx - 1]?.includes(SUPPRESS)) continue;
        for (const token of lit[1].split(/\s+/)) {
          if (!token) continue;
          if (selectorsFor(token).some((s) => hasSelector(css, s))) continue;
          violations.push({
            file: path.relative(ROOT, file).replace(/\\/g, "/"),
            line: lineIdx + 1,
            token,
          });
        }
      }
    }
  }

  // The two passes overlap wherever a literal sits inside `className="…"`.
  // Report each (file, line, token) once.
  {
    const seen = new Set();
    for (let i = violations.length - 1; i >= 0; i--) {
      const v = violations[i];
      const key = `${v.file}:${v.line}:${v.token}`;
      if (seen.has(key)) violations.splice(i, 1);
      else seen.add(key);
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

/*
 * Exported so `generate-css-inventory.mjs` can reuse the escaping and the
 * stylesheet list rather than re-deriving them. The two traps in
 * `selectorsFor` (the leading-digit hex escape with its trailing SPACE, and
 * the `!important` prefix) each produced a confident wrong answer when
 * re-implemented by hand — the inventory must not be a second, drifting copy.
 */
export { selectorsFor, hasSelector, readStylesheets, isClassLike, classTokensIn, blankComments, collectFiles, STYLESHEETS, SCAN_DIRS, ROOT };

/*
 * Only run the audit when invoked directly — importing it must not exit.
 *
 * 🛑 `file://${process.argv[1]}` is NOT the right comparison on Windows: the
 * argv path is `D:\…`, and `import.meta.url` is `file:///D:/…` with THREE
 * slashes and forward separators. The hand-rolled form matched neither, so
 * the audit silently did nothing and still exited 0 — a gate that passes
 * because it never ran. `pathToFileURL` produces the exact spelling.
 */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}

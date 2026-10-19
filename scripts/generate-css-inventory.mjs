#!/usr/bin/env node
/**
 * generate-css-inventory — write `docs/css-class-inventory.md`.
 *
 * Answers one question the project could not previously answer: **which of the
 * classes we author actually reach a browser, and through which stylesheet?**
 *
 * ── Why this is GENERATED and never hand-written ───────────────────────────
 * A hand-maintained class list is the failure Root Cause #84 describes: it is
 * always narrower than reality and goes quiet exactly when someone adopts a
 * newer API. This reads the same three compiled stylesheets the browser gets
 * and reports what is in them, so it cannot drift from what ships.
 *
 * ── Why the escaping helpers are IMPORTED, not re-derived ──────────────────
 * `selectorsFor()` encodes two traps that each produced a confident wrong
 * answer in this repo: the leading-digit hex escape (`2xl:hidden` ships as
 * `.\32 xl\:hidden`, note the trailing SPACE) and the `!important` prefix.
 * A second copy here would drift from the audit's copy, and the inventory
 * would then disagree with the gate about the same class.
 *
 * Usage:  node scripts/generate-css-inventory.mjs [--check]
 *   --check  exit 1 if the file on disk differs from what would be written
 *            (so CI can catch a stale inventory without writing to the tree)
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  selectorsFor,
  hasSelector,
  readStylesheets,
  collectFiles,
  blankComments,
  classTokensIn,
  isClassLike,
  STYLESHEETS,
  ROOT,
} from "./audit-dead-css-classes.mjs";

const OUT = path.join(ROOT, "docs", "css-class-inventory.md");

/** Design-token and element-id namespaces share the `appkit-` prefix. */
const ID_ATTR_RE =
  /\b(?:id|htmlFor|aria-(?:labelledby|controls|describedby|owns|activedescendant))\s*=\s*$/;

const TOKEN_NAMESPACE_RE =
  /^appkit-(?:color|space|font|radius|shadow|z|text|gradient|duration|ease|tracking|leading)-/;

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");

// ---------------------------------------------------------------------------
// 1. appkit-* classes DEFINED in appkit's hand-written CSS
// ---------------------------------------------------------------------------
function cssFilesIn(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === "dist") continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith(".css")) out.push(p);
    }
  })(dir);
  return out;
}

function collectDefined() {
  const defined = new Map(); // class -> defining file
  for (const f of cssFilesIn(path.join(ROOT, "appkit", "src"))) {
    const src = fs.readFileSync(f, "utf8");
    for (const m of src.matchAll(/\.(appkit-[A-Za-z0-9_-]+)/g)) {
      if (!defined.has(m[1])) defined.set(m[1], rel(f));
    }
  }
  return defined;
}

// ---------------------------------------------------------------------------
// 2. Classes USED in code — both idioms
// ---------------------------------------------------------------------------
/**
 * 🛑 Two passes, because this codebase writes classes two ways and the obvious
 * one covers only part of it: `className={…}` expressions AND module-scope
 * const maps (`const UI_OVERFLOW_ROW = { pill: "appkit-overflow-row__pill" }`).
 * Missing the second is what let a misspelled class pass the audit — see the
 * const-map pass in audit-dead-css-classes.mjs.
 */
function collectUsed() {
  const appkitUsed = new Map(); // class -> Set<file>
  const tailwindUsed = new Map(); // class -> Set<file>
  const add = (map, token, file) => {
    if (!map.has(token)) map.set(token, new Set());
    map.get(token).add(rel(file));
  };

  /*
   * The inventory must agree with the GATE about every class, so it honours
   * the same two exclusions the audit applies:
   *   - a token carrying `${` is a template FRAGMENT, not a class
   *     (`appkit-form-action-bar${className` is half of an interpolation);
   *   - a line carrying `audit-dead-css-ok` has been triaged as a deliberate
   *     non-class — an SVG gradient id, an element id, the JSON-LD selector
   *     target — and listing it as a defect here would contradict the audit.
   */
  const SUPPRESS = "audit-dead-css-ok";
  const FRAGMENT = /[${}]/;

  for (const dir of ["appkit/src", "src"]) {
    for (const file of collectFiles(path.join(ROOT, dir))) {
      const rawSrc = fs.readFileSync(file, "utf8");
      const src = blankComments(rawSrc);
      // Suppression is read from the RAW source: `blankComments` erases the
      // marker along with the rest of the comment, which is exactly why the
      // audit's own escape hatch had never worked (Root Cause #106).
      const lines = rawSrc.split(/\r?\n/);
      const lineStarts = [0];
      for (let k = 0; k < src.length; k++) if (src[k] === "\n") lineStarts.push(k + 1);
      const lineOf = (off) => {
        let lo = 0, hi = lineStarts.length - 1;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          if (lineStarts[mid] <= off) lo = mid;
          else hi = mid - 1;
        }
        return lo;
      };
      const suppressed = (off) => {
        const i = lineOf(off);
        return Boolean(lines[i]?.includes(SUPPRESS) || (i > 0 && lines[i - 1]?.includes(SUPPRESS)));
      };

      const attrRe = /\bclassName\s*=/g;
      let m;
      while ((m = attrRe.exec(src))) {
        if (suppressed(m.index)) continue;
        for (const token of classTokensIn(src, m.index)) {
          if (FRAGMENT.test(token)) continue;
          if (token.startsWith("appkit-")) {
            if (!TOKEN_NAMESPACE_RE.test(token)) add(appkitUsed, token, file);
          } else if (isClassLike(token)) {
            add(tailwindUsed, token, file);
          }
        }
      }

      const litRe = /["'`](appkit-[A-Za-z0-9_-]+(?:\s+appkit-[A-Za-z0-9_-]+)*)["'`]/g;
      let lit;
      while ((lit = litRe.exec(src))) {
        if (src.slice(Math.max(0, lit.index - 2), lit.index + 1).includes("-")) continue;
        // Element ids share the `appkit-` prefix — `Button`'s confirm dialog
        // uses `appkit-action-confirm-title` as an aria-labelledby target.
        // Mirrors the audit's own exclusion so the two cannot disagree.
        if (ID_ATTR_RE.test(src.slice(Math.max(0, lit.index - 40), lit.index))) continue;
        if (suppressed(lit.index)) continue;
        for (const token of lit[1].split(/\s+/)) {
          if (token && !TOKEN_NAMESPACE_RE.test(token)) add(appkitUsed, token, file);
        }
      }
    }
  }
  return { appkitUsed, tailwindUsed };
}

// ---------------------------------------------------------------------------

function table(rows, headers) {
  const out = [`| ${headers.join(" | ")} |`, `|${headers.map(() => "---").join("|")}|`];
  for (const r of rows) out.push(`| ${r.join(" | ")} |`);
  return out.join("\n");
}

function build() {
  const { css, missing } = readStylesheets();
  if (missing.length) {
    console.error(
      `[generate-css-inventory] Cannot run — build artefact(s) absent: ${missing.join(", ")}\n` +
        `  The inventory reports what SHIPS, so it needs the compiled CSS.\n` +
        `  Run \`npm --prefix appkit run build\` and \`npm run build:css\` first.`,
    );
    process.exit(1);
  }

  const defined = collectDefined();
  const { appkitUsed, tailwindUsed } = collectUsed();

  const shipped = (cls) => selectorsFor(cls).some((s) => hasSelector(css, s));

  const usedNotDefined = [...appkitUsed.keys()].filter((c) => !shipped(c)).sort();
  const definedNotUsed = [...defined.keys()].filter((c) => !appkitUsed.has(c)).sort();
  const definedNotShipped = [...defined.keys()].filter((c) => !shipped(c)).sort();

  const variants = [...tailwindUsed.keys()].filter((t) => t.includes(":"));
  const variantDead = variants.filter((t) => !shipped(t)).sort();
  const byPrefix = new Map();
  for (const t of variants) {
    const p = t.split(":").slice(0, -1).join(":") + ":";
    byPrefix.set(p, (byPrefix.get(p) ?? 0) + 1);
  }

  const byFile = new Map();
  for (const [cls, file] of defined) {
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push(cls);
  }

  const L = [];
  L.push("# CSS class inventory");
  L.push("");
  L.push(
    "> **Generated — do not edit.** `node scripts/generate-css-inventory.mjs`\n" +
      "> Regenerate after any CSS or className change; `npm run check` verifies it\n" +
      "> is current via `--check`.",
  );
  L.push("");
  L.push("## How a class reaches a browser");
  L.push("");
  L.push(
    "The single fact that explains every delivery bug in this repo:\n\n" +
      "> `src/app/globals.css` carries **`@source not \"../../appkit\"`**, so the\n" +
      "> consumer's Tailwind build never scans `appkit/src`. **Every class authored\n" +
      "> inside appkit must be generated by appkit's own build, or it reaches\n" +
      "> nobody.**\n",
  );
  L.push("");
  L.push(
    table(
      [
        [
          "`appkit/dist/tailwind-utilities.css`",
          "Tailwind utilities",
          "`appkit/tailwind.config.js` + `appkit/src/tailwind-input.css`, scanning `appkit/src`",
        ],
        [
          "`appkit/dist/styles.css`",
          "hand-written `appkit-*` BEM",
          "`appkit/src/**/*.style.css`, flattened by `bundle-css.mjs`",
        ],
        [
          "`src/styles/globals.compiled.css`",
          "the app's own Tailwind + utilities",
          "`src/app/globals.css`, scanning `src` only",
        ],
      ],
      ["Stylesheet", "Carries", "Built from"],
    ),
  );
  L.push("");
  L.push(
    "A class in `appkit/src` that appkit's config cannot generate is dead in\n" +
      "**both** directions — appkit never emits it, and the consumer never looks.\n" +
      "That is why the status colours had to be added to `appkit/tailwind.config.js`\n" +
      "(2026-08-21) and why `fluid-grid-card` reached no other consumer at all.",
  );
  L.push("");

  L.push("## Totals");
  L.push("");
  L.push(
    table(
      [
        ["`appkit-*` classes defined in appkit CSS", String(defined.size)],
        ["`appkit-*` classes referenced in code", String(appkitUsed.size)],
        ["— referenced but generating **no rule**", String(usedNotDefined.length)],
        ["— defined but referenced nowhere", String(definedNotUsed.length)],
        ["— defined in source but **absent from the compiled CSS**", String(definedNotShipped.length)],
        ["Tailwind classes authored in appkit/src + src", String(tailwindUsed.size)],
        ["— of which variant-prefixed (`hover:`, `lg:`, …)", String(variants.length)],
        ["— variant classes generating **no rule**", String(variantDead.length)],
      ],
      ["Measure", "Count"],
    ),
  );
  L.push("");

  L.push("## Referenced but generating no rule");
  L.push("");
  if (usedNotDefined.length === 0) {
    L.push("None. `audit-dead-css-classes` holds this at zero.");
  } else {
    L.push(
      table(
        usedNotDefined.map((c) => [`\`${c}\``, [...appkitUsed.get(c)].slice(0, 3).join("<br>")]),
        ["Class", "Referenced in"],
      ),
    );
  }
  L.push("");

  L.push("## Defined in source but absent from the compiled CSS");
  L.push("");
  L.push(
    "A non-empty list here means a `.style.css` is not reachable from\n" +
      "`src/styles.css` — the defect that hid `FormShell.style.css` and\n" +
      "`QuickCreateModal.style.css` from every consumer.",
  );
  L.push("");
  if (definedNotShipped.length === 0) {
    L.push("None — every defined class is present in `appkit/dist/styles.css`.");
  } else {
    L.push(
      table(
        definedNotShipped.map((c) => [`\`${c}\``, defined.get(c)]),
        ["Class", "Defined in"],
      ),
    );
  }
  L.push("");

  L.push("## Variant-prefixed Tailwind classes we author");
  L.push("");
  L.push(
    "🛑 Read this table before concluding a breakpoint is broken. A class whose\n" +
      "name starts with a digit is hex-escaped in the output — `2xl:grid-cols-4`\n" +
      "ships as `.\\32 xl\\:grid-cols-4`, with a trailing space inside the escape.\n" +
      "Grepping for `.2xl\\:` finds zero and reads as a total breakage; it is not.",
  );
  L.push("");
  L.push(
    table(
      [...byPrefix.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25)
        .map(([p, n]) => [`\`${p}\``, String(n)]),
      ["Variant prefix", "Classes authored"],
    ),
  );
  L.push("");
  if (variantDead.length) {
    L.push("### Variant classes generating no rule");
    L.push("");
    L.push(variantDead.map((c) => `- \`${c}\``).join("\n"));
    L.push("");
  }

  L.push("## `appkit-*` classes by stylesheet");
  L.push("");
  L.push(
    table(
      [...byFile.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([file, list]) => {
          const unused = list.filter((c) => !appkitUsed.has(c)).length;
          return [`\`${file}\``, String(list.length), String(list.length - unused), String(unused)];
        }),
      ["Stylesheet", "Defined", "Referenced", "Unreferenced"],
    ),
  );
  L.push("");
  L.push(
    "“Unreferenced” is **not** automatically dead: a modifier may be applied by a\n" +
      "sibling rule, by a consumer override, or by a descendant selector rather\n" +
      "than by a `className`. It is a review list, not a delete list.",
  );
  L.push("");

  return L.join("\n") + "\n";
}

const content = build();
const check = process.argv.includes("--check");

if (check) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (current !== content) {
    console.error(
      "[generate-css-inventory] docs/css-class-inventory.md is STALE.\n" +
        "  Run `node scripts/generate-css-inventory.mjs` and commit the result.",
    );
    process.exit(1);
  }
  console.log("[generate-css-inventory] OK — inventory is current.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, content);
console.log(`[generate-css-inventory] wrote ${rel(OUT)} (${STYLESHEETS.length} stylesheets read).`);

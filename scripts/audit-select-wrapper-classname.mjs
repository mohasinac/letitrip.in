#!/usr/bin/env node
/**
 * audit-select-wrapper-classname.mjs
 *
 * Guards a whole defect class, not just one component (Recurrent Root Cause #29):
 * a primitive whose ROOT wrapper element is the real flex/grid child, while the
 * caller's `className` only ever reaches an inner control. A caller passing a
 * sizing/flex-control utility via `className` — intending to constrain the
 * control's width in a flex row — gets silently ignored: the wrapper's own
 * `width: 100%` wins, and the control balloons while its flex siblings get
 * squeezed to nothing. Each such primitive exposes a dedicated
 * `wrapperClassName` prop that lands on the real flex child.
 *
 * Confirmed instances (see COMPONENTS below):
 *  - `<Select>`   — `.appkit-select` wrapper; broke the header search bar (2026-08-19)
 *  - `<Checkbox>` — `.appkit-checkbox` wrapper; broke the mobile cart, where the
 *                   checkbox claimed 100% of the row and pushed each item card
 *                   off-screen past its seller card's border
 *
 * The filename is kept for its registry entry in scripts/run-audits.mjs even
 * though the scope is now broader than `<Select>`.
 *
 * Strict-zero — no legitimate case puts a sizing/flex-control token on these
 * components' `className`. No suppression marker exists for this audit; if a
 * genuine exception ever surfaces, add one and register it in
 * scripts/audit-no-suppression-comments.mjs's SUPPRESSION_MARKERS.
 *
 * Exits 0 when violations === 0, 1 on any regression.
 */

const BASELINE = 0;
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "__tests__",
  "__mocks__",
  "scripts",
  "seed",
]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;

/**
 * Each entry: the JSX tag to scan, the file defining it (exempt — its own
 * internal usage is the primitive's implementation), and the inner element
 * `className` actually lands on, for the error message.
 */
const COMPONENTS = [
  {
    tag: "Select",
    sourceFile: join(ROOT, "appkit", "src", "ui", "components", "Select.tsx"),
    innerElement: "<select>",
    wrapper: ".appkit-select",
  },
  {
    tag: "Checkbox",
    sourceFile: join(ROOT, "appkit", "src", "ui", "components", "Checkbox.tsx"),
    innerElement: "<input>",
    wrapper: ".appkit-checkbox",
  },
];

const CLASSNAME_RE = /(?<!wrapper)className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/;
const BARE_PROP_RE = /\bbare\b(?:\s*=\s*\{?\s*(?:true)?\s*\}?)?/;
const WRAPPER_CLASSNAME_RE = /\bwrapperClassName\s*=/;

const SIZING_TOKEN_RES = [
  /\bflex-shrink(-0)?\b/,
  /\bshrink(-0)?\b/,
  /\bflex-grow\b/,
  /\bgrow-0\b/,
  /\bflex-1\b/,
  /\bflex-none\b/,
  /\bbasis-\S+/,
  /\bmin-w-\S+/,
  /\bmax-w-\S+/,
  /\bw-\d+\b/,
  /\bw-\[[^\]]+\]/,
];

const EXEMPT_SOURCE_FILES = new Set(COMPONENTS.map((c) => c.sourceFile));

/**
 * Extract a JSX opening tag's attribute text, starting just after `<Tag`.
 *
 * A naive `[^>]*?` stops at the first `>` character — which includes the `>`
 * inside an arrow function (`onChange={() => f()}`), silently truncating the
 * attribute list before later props like `className` and producing a false
 * negative. This walks characters instead, tracking string/template/brace
 * state, and returns the text up to the `>` that actually closes the tag.
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
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (!entry.name.endsWith(".tsx") && !entry.name.endsWith(".jsx")) continue;
    if (SKIP_FILE_RE.test(entry.name)) continue;
    if (EXEMPT_SOURCE_FILES.has(full)) continue;
    files.push(full);
  }
  return files;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");

    for (const { tag, innerElement, wrapper } of COMPONENTS) {
      if (!text.includes(`<${tag}`)) continue;

      const openerRe = new RegExp(`<${tag}(?![A-Za-z0-9_])`, "g");
      for (const match of text.matchAll(openerRe)) {
        const attrs = extractOpenerAttrs(text, (match.index ?? 0) + match[0].length);
        if (attrs === null) continue;
        if (BARE_PROP_RE.test(attrs)) continue; // bare mode: className already lands on the real flex child
        if (WRAPPER_CLASSNAME_RE.test(attrs)) continue; // already sizing the wrapper correctly

        const cls = CLASSNAME_RE.exec(attrs);
        if (!cls) continue;
        const classValue = cls[1] ?? cls[2] ?? cls[3] ?? cls[4] ?? cls[5] ?? "";
        if (!classValue.trim()) continue;

        const offending = SIZING_TOKEN_RES.filter((rx) => rx.test(classValue));
        if (offending.length === 0) continue;

        const before = text.slice(0, match.index ?? 0);
        const lineIdx = before.split("\n").length - 1;

        violations.push({
          tag,
          innerElement,
          wrapper,
          file: relative(ROOT, file).replace(/\\/g, "/"),
          line: lineIdx + 1,
          classValue: classValue.slice(0, 120),
          token: classValue.match(offending[0])?.[0] ?? "",
        });
      }
    }
  }
}

if (violations.length <= BASELINE) {
  console.log(
    violations.length === 0
      ? "audit-select-wrapper-classname: clean ✓"
      : `audit-select-wrapper-classname: ${violations.length}/${BASELINE} (within baseline; drive to 0)`,
  );
  process.exit(0);
}

console.error(
  `audit-select-wrapper-classname: REGRESSION — ${violations.length} site(s) carry a sizing/flex-control token in className instead of wrapperClassName (baseline ${BASELINE}, over by ${violations.length - BASELINE}).\n`,
);
for (const v of violations.slice(0, 20)) {
  console.error(`  ${v.file}:${v.line}  <${v.tag}>  [${v.token}]  className="${v.classValue}"`);
}
if (violations.length > 20) {
  console.error(`  … and ${violations.length - 20} more`);
}
console.error(
  "\n  Fix: move the sizing/flex-control token(s) to the wrapperClassName prop — className only styles the inner control\n" +
    "  (e.g. <select> / <input>); wrapperClassName sizes the actual flex-child wrapper div (.appkit-select / .appkit-checkbox).",
);
process.exit(1);

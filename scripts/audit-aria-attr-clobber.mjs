#!/usr/bin/env node
/**
 * audit-aria-attr-clobber — an aria attribute set AFTER `{...props}` silently
 * overwrites the caller's.
 *
 * WHY THIS EXISTS
 *   JSX is last-wins. A primitive that spreads the caller's props and THEN
 *   re-specifies the same attribute from its own state destroys whatever the
 *   caller passed — including, crucially, when the primitive's own value is
 *   `undefined`.
 *
 *   That is not hypothetical. `Input`, `Select`, `Textarea` and `Checkbox` all
 *   did exactly this with `aria-invalid`:
 *
 *       <input {...props} aria-invalid={error ? "true" : undefined} />
 *
 *   and the `Field*` wrappers set `aria-invalid` themselves while deliberately
 *   WITHHOLDING `error` (so the message is not rendered twice) — which means
 *   `error` is undefined inside the primitive exactly when the field is
 *   invalid. Net effect: no Field*-built form in the app ever emitted
 *   `aria-invalid`, and `SectionForm`'s focus-the-first-invalid-control jump
 *   (`querySelector("[aria-invalid='true']")`) silently focused nothing, every
 *   time. Eight attribute sites across four files, invisible to every audit.
 *
 * THE FIX — honour an incoming value:
 *       const ariaInvalid = props["aria-invalid"] ?? (error ? "true" : undefined);
 *       <input {...props} aria-invalid={ariaInvalid} />
 *   `Input` already used precisely this shape for `aria-label` and described
 *   it as "fill the gap, never override". Same rule, applied to the rest.
 *
 * SCOPE — only where it can actually bite: a JSX element that BOTH spreads a
 *   props-like identifier AND re-specifies an `aria-*`/`role` attribute after
 *   it, in the primitive layer (`appkit/src/ui/**`). Outside the primitives a
 *   spread-then-override is usually the author's deliberate last word.
 *
 *   An override is accepted when it references the spread object
 *   (`props["aria-invalid"] ?? …`), because that is the fix.
 *
 * No suppression marker — a genuine exception belongs in EXEMPT with a reason.
 *
 * Exit 0 — clean.  Exit 1 — a clobbering override.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN = [join(ROOT, "appkit", "src", "ui")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);

/** Attributes whose silent loss is an accessibility defect. */
const GUARDED = /^(aria-[a-z]+|role)$/;

const EXEMPT = new Map([
  [
    "appkit/src/ui/components/OverflowRow.tsx",
    // `OverflowRowLinkProps` is { scroll?, prefetch?, replace? } — a named
    // interface, deliberately NOT a Record<string, unknown> (so a misspelled
    // prop is a compile error). It cannot carry role/aria-selected/
    // aria-current, so the tab semantics set after the spread can never
    // overwrite a caller's value. Re-check if that interface ever widens.
    "linkProps cannot carry aria/role — the override is unreachable",
  ],
]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
}

/**
 * Every JSX opening tag, brace/quote aware.
 *
 * A `<tag[^>]*>` regex stops at the `>` inside `onChange={() => f()}` and
 * never reaches the attributes after it — the false negative behind Root
 * Cause #29. Walk characters instead.
 */
function openings(src) {
  const out = [];
  const re = /<\s*([a-zA-Z][\w.]*)/g;
  let m;
  while ((m = re.exec(src))) {
    let i = re.lastIndex, depth = 0, quote = null, buf = "";
    while (i < src.length) {
      const c = src[i];
      if (quote) { buf += c; if (c === quote && src[i - 1] !== "\\") quote = null; i++; continue; }
      if (c === '"' || c === "'" || c === "`") { quote = c; buf += c; i++; continue; }
      if (c === "{") { depth++; buf += c; i++; continue; }
      if (c === "}") { depth--; buf += c; i++; continue; }
      if (c === ">" && depth === 0) break;
      buf += c; i++;
    }
    out.push({ tag: m[1], attrs: buf, line: src.slice(0, m.index).split("\n").length });
  }
  return out;
}

/** Top-level `{...ident}` spreads, with their offset in the attribute text. */
function spreads(attrs) {
  const out = [];
  const re = /\{\s*\.\.\.\s*([A-Za-z_$][\w$]*)/g;
  let m;
  while ((m = re.exec(attrs))) out.push({ name: m[1], at: m.index });
  return out;
}

const violations = [];

for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file).split(sep).join("/");
    if (EXEMPT.has(rel)) continue;
    const src = stripComments(readFileSync(file, "utf8"));

    for (const { tag, attrs, line } of openings(src)) {
      const sp = spreads(attrs);
      if (sp.length === 0) continue;
      const firstSpread = sp[0].at;
      const spreadNames = sp.map((s) => s.name);

      // attributes written AFTER the first spread
      const re = /([a-zA-Z-]+)\s*=\s*\{/g;
      let m;
      while ((m = re.exec(attrs))) {
        const name = m[1];
        if (m.index < firstSpread) continue;
        if (!GUARDED.test(name)) continue;

        // the value expression, brace-matched
        let i = m.index + m[0].length, depth = 1, val = "";
        while (i < attrs.length && depth > 0) {
          const c = attrs[i];
          if (c === "{") depth++;
          else if (c === "}") { depth--; if (depth === 0) break; }
          val += c; i++;
        }
        // Referencing the spread object is the FIX, not the defect.
        const honoursCaller = spreadNames.some((n) =>
          new RegExp(`\\b${n}\\s*(\\[|\\.)`).test(val),
        );
        if (honoursCaller) continue;
        // A locally-computed value that already merged the caller's (the
        // `const ariaInvalid = props[...] ?? …` shape) reads as a bare
        // identifier; accept it and let review judge the const.
        if (/^[A-Za-z_$][\w$]*$/.test(val.trim())) continue;

        violations.push(
          `${rel}:${line}  <${tag}> re-specifies ${name} after {...${spreadNames.join(", ...")}}` +
            `\n      value: ${val.trim().slice(0, 80)}`,
        );
      }
    }
  }
}

if (violations.length === 0) {
  console.log("audit-aria-attr-clobber: clean ✓");
  process.exit(0);
}
console.error("\n[audit-aria-attr-clobber] violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(
  "\n  JSX is last-wins, so this overwrites whatever the caller passed —" +
    "\n  including with `undefined`. Honour the incoming value instead:" +
    "\n      const x = props[\"aria-invalid\"] ?? (error ? \"true\" : undefined);" +
    "\n  This is how every Field* form in the app lost its aria-invalid.\n",
);
console.error(`Total: ${violations.length}\n`);
process.exit(1);

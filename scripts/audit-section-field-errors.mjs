#!/usr/bin/env node
/**
 * audit-section-field-errors — a section that never reads `errors` shows none.
 *
 * WHY
 *   `SectionForm` hands every section `{ values, onChange, errors }` and
 *   already gates that map on `submitAttempted` (SectionForm.tsx). But a
 *   `render` that destructures only `values`/`onChange` can never put a
 *   message on a control: the error reaches the summary and the section's
 *   "N issues" badge and stops there. Nothing is marked, nothing is
 *   announced, and `scrollToSection`'s focus-first-invalid has no target.
 *
 *   Measured when this was written: 49 of 66 SectionForm files were in that
 *   state. The failure is invisible — the form refuses to save, the badge
 *   says "2 issues", and the fields look ordinary.
 *
 * WHAT IS *NOT* A VIOLATION — and this is most of them
 *   A `Field*` primitive (`FieldInput`, `FieldSelect`, `FieldTextarea`,
 *   `FieldCheckbox`) reads `FormShellContext` by its own `name` prop, so it
 *   surfaces the error without the section touching `errors` at all. Same for
 *   a file built by `buildSectionsFromSchema`, where the generator owns the
 *   wiring. Flagging those would be ~400 false positives and would push people
 *   toward passing `error=` twice.
 *
 *   So the rule is narrow on purpose: a section render that uses a BARE
 *   control (`Input`/`Textarea`/`Select`/`Checkbox`/`PaginatedSelect`) with no
 *   `error=` prop, and does not destructure `errors`. That is the one shape
 *   where the message provably has nowhere to go.
 *
 * STAGED — a ratchet, not a baseline.
 *   STAGED_FILES below was produced by running THIS rule, not by a grep
 *   written while designing it (Root Cause #84 — a hand-written list is
 *   always narrower than the rule it feeds). The list may only shrink. A file
 *   not on it fails immediately.
 *
 *   The residue is TWO files, 15 controls, and both are the same shape: the
 *   section's controls are driven by per-field `useState` rather than by the
 *   render's `values`/`onChange` draft, so there is no field name at the
 *   control to key an error on. Wiring them means mapping each local state
 *   variable to its schema key by hand.
 *
 *   Worth knowing before draining them, because it shrinks the real job a
 *   long way:
 *
 *   - `AdminCarouselEditorView` — `carouselSlideSchema` is
 *     `{ title, order, active }.passthrough()`. Of its 9 controls exactly
 *     ONE (`order`) can ever produce an error, and it is now wired. The
 *     other 8 — slide height, autoplay delay, and the per-card heading /
 *     subtitle / description / button text / link / variant — are outside the
 *     schema entirely, so no error exists for them to show. Validating them
 *     is the real fix; wiring them is not.
 *   - `AdminSectionsView` — 4 of its 7 are BUILDER UI (Mode, which section
 *     to edit, section type, start-from-template), which are not fields of
 *     the record at all. The remaining 3 (order, enabled, config JSON) are.
 *
 *   `MIGRATE=strict` fails everything, including the staged set.
 *
 * Exit 0 — clean (or only staged files).
 * Exit 1 — a file not on the staged list, or any file under MIGRATE=strict.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const STRICT = process.env.MIGRATE === "strict";

/** The primitive itself and its generator own this contract. */
const SELF = [
  join("appkit", "src", "features", "shell", "SectionForm.tsx"),
  join("appkit", "src", "features", "shell", "build-sections.tsx"),
];

/**
 * Known offenders at introduction, from a run of this rule.
 * May only shrink. Each is a repeater row or a dynamic settings tab whose
 * error key is an indexed path the call site does not yet compute.
 */
const STAGED_FILES = new Set([
  "appkit/src/features/admin/components/AdminCarouselEditorView.tsx",
  "appkit/src/features/admin/components/AdminSectionsView.tsx",
]);

const BARE_CONTROLS = ["Input", "Textarea", "Select", "Checkbox", "PaginatedSelect"];

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
 * JSX opening tags for `tag`, brace/quote aware.
 *
 * A `<Tag[^>]*>` regex stops at the `>` inside `onChange={() => f()}` and
 * never reaches a later `error=` prop — the exact false negative that made
 * Root Cause #29's cart violation invisible. Walk the characters instead.
 */
function openers(src, tag) {
  const out = [];
  const re = new RegExp("<\\s*" + tag + "(?![A-Za-z0-9_])", "g");
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
    out.push({ text: buf, line: src.slice(0, m.index).split("\n").length });
  }
  return out;
}

/**
 * The body of every `render:` callback — the only place a section is handed
 * `errors`, and therefore the only place a missing one is provable.
 *
 * Brace-matched from the arrow, so a nested object/JSX inside the callback
 * stays inside the region and the next sibling section does not leak in.
 */
function renderRegions(src) {
  const out = [];
  const re = /\brender\s*:\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*/g;
  let m;
  while ((m = re.exec(src))) {
    let i = re.lastIndex;
    while (i < src.length && /\s/.test(src[i])) i++;
    const opener = src[i];
    if (opener !== "(" && opener !== "{") continue;
    const closer = opener === "(" ? ")" : "}";
    let depth = 0, quote = null, buf = "";
    for (; i < src.length; i++) {
      const c = src[i];
      if (quote) { buf += c; if (c === quote && src[i - 1] !== "\\") quote = null; continue; }
      if (c === '"' || c === "'" || c === "`") { quote = c; buf += c; continue; }
      if (c === opener) depth++;
      else if (c === closer) { depth--; if (depth === 0) { buf += c; break; } }
      buf += c;
    }
    out.push({ text: buf, line: src.slice(0, m.index).split("\n").length });
  }
  return out;
}

const violations = [];
const stagedSeen = new Set();

for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (SELF.some((s) => rel === s)) continue;
    const posix = rel.split(sep).join("/");

    const raw = readFileSync(file, "utf8");
    if (!/<\s*SectionForm\b/.test(raw)) continue;
    const src = stripComments(raw);

    // A render that already reads `errors` is doing the right thing.
    const readsErrors =
      /render\s*:\s*\(\s*\{[^}]*\berrors\b/.test(src) ||
      /\(\s*\{\s*[^}]*\berrors\b[^}]*\}\s*\)\s*=>/.test(src);
    if (readsErrors) continue;

    /*
     * 🛑 ONLY controls inside a section `render:` callback count.
     *
     * The first version of this rule scanned the whole file, and the file is
     * the wrong unit: `errors` is handed to a section's render and nowhere
     * else, so a control outside one has no error to receive and nothing to
     * fix. Scanning file-wide reported 427 controls; reading them showed most
     * were never form fields at all — filter dropdowns on a listing toolbar,
     * row-selection checkboxes, a bulk-paste textarea, capability toggles,
     * and separate ban/reply mini-forms that happen to share a file with a
     * SectionForm.
     *
     * Wiring `error={errors.x}` onto those would be meaningless at best and
     * wrong at worst. This is the same overstatement `audit-text-as-label`
     * produced — 53 of its 72 staged entries were never violations — and the
     * lesson there is the one applied here: generating the list from the rule
     * protects you from typing it wrong, not from the rule being wrong
     * (Root Cause #84).
     */
    const unwired = [];
    for (const region of renderRegions(src)) {
      for (const tag of BARE_CONTROLS) {
        for (const o of openers(region.text, tag)) {
          if (/\berror\s*=/.test(o.text)) continue;
          /*
           * A `PaginatedSelect` with a `name` resolves its own error from
           * `FormShellContext`, exactly as the Field* primitives do — so it
           * needs no `errors` argument threaded through the render slot and
           * is not a gap. (The other four tags take `name` as a plain DOM
           * attribute and do not read context, so this applies only here.)
           */
          if (tag === "PaginatedSelect" && /\bname\s*=/.test(o.text)) continue;
          if (!/onChange|onValueChange/.test(o.text)) continue; // not data entry
          unwired.push(`${tag} @ line ~${region.line + o.line - 1}`);
        }
      }
    }
    if (unwired.length === 0) continue;

    if (STAGED_FILES.has(posix) && !STRICT) { stagedSeen.add(posix); continue; }
    violations.push(
      `${posix} :: ${unwired.length} bare control(s) with no error, and no section reads \`errors\`` +
        `\n      first: ${unwired[0]}`,
    );
  }
}

const stale = [...STAGED_FILES].filter((f) => !stagedSeen.has(f));

if (violations.length === 0) {
  const bits = [`${stagedSeen.size} staged`];
  if (stale.length) bits.push(`${stale.length} staged entr(y/ies) now FIXED — remove from STAGED_FILES`);
  console.log(`audit-section-field-errors: clean ✓ (${bits.join("; ")})`);
  if (stale.length) stale.forEach((f) => console.log(`  fixed: ${f}`));
  process.exit(0);
}

console.error("\n[audit-section-field-errors] violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(
  "\n  A <SectionForm> section is handed { values, onChange, errors }. Destructure" +
    "\n  `errors` and pass `error={errors.<field>}` to the control — see" +
    "\n  AdminCouponEditorView for the pattern. For a single field rendered as N" +
    "\n  controls (a radio group, a checkbox array), put `aria-invalid` on each and" +
    "\n  the message ONCE below, or it is announced N times.\n",
);
console.error(`Total: ${violations.length}\n`);
process.exit(1);

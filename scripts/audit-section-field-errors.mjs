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
 *   The residue is concentrated in repeater rows (`spinPrizes[i].label`) and
 *   the settings-tab builders, where the error key is a dotted/indexed path
 *   the call site does not currently compute. Those need the key derived per
 *   row, which is a real change rather than a mechanical one.
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
  "appkit/src/_internal/client/features/lottery/LotteryAdminEditView.tsx",
  "appkit/src/features/admin/components/AdminAdEditorView.tsx",
  "appkit/src/features/admin/components/AdminBrandEditorView.tsx",
  "appkit/src/features/admin/components/AdminCarouselEditorView.tsx",
  "appkit/src/features/admin/components/AdminFeatureEditorView.tsx",
  "appkit/src/features/admin/components/AdminOrderEditorView.tsx",
  "appkit/src/features/admin/components/AdminProductEditorView.tsx",
  "appkit/src/features/admin/components/AdminSectionsView.tsx",
  "appkit/src/features/admin/components/AdminSiteSettingsView.tsx",
  "appkit/src/features/admin/components/AdminStoreEditorView.tsx",
  "appkit/src/features/admin/components/AdminSupportTicketDetailView.tsx",
  "appkit/src/features/admin/components/AdminUserEditorView.tsx",
  "appkit/src/features/events/components/AdminEventEditorView.tsx",
  "appkit/src/features/products/components/GroupSettingsPanel.tsx",
  "appkit/src/features/seller/components/SellerReviewsView.tsx",
  "appkit/src/features/shipments/components/AdminShipmentLotItemsView.tsx",
  "src/app/[locale]/events/[id]/participate/EventParticipateClient.tsx",
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

    // Bare controls with no `error=` are the only provable gap: a Field*
    // resolves its own error from context by `name`.
    const unwired = [];
    for (const tag of BARE_CONTROLS) {
      for (const o of openers(src, tag)) {
        if (/\berror\s*=/.test(o.text)) continue;
        if (!/onChange|onValueChange/.test(o.text)) continue; // not data entry
        unwired.push(`${tag} @ line ${o.line}`);
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

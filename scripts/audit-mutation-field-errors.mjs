#!/usr/bin/env node
/**
 * audit-mutation-field-errors — a mutation inside a form must ask for the
 * field errors it is already being sent.
 *
 * WHY
 *   The server builds a correct, field-aware 400: `createRouteHandler` emits
 *   `issues` with real Zod paths, `ApiClient` parses them onto
 *   `ApiClientError.issues`, and `surfaceError` is written to apply them —
 *   `appkit/src/client/api/surface-error.ts` routes issues to inline field
 *   errors BEFORE it considers a toast.
 *
 *   But that whole branch is gated on the caller passing `setFieldError`:
 *
 *       if (setFieldError && hasAttachableIssue(issues)) { … }
 *
 *   and `setFieldError` is optional on `useApiMutation`. Measured when this
 *   was written: 214 call sites, THREE passed it. For the other 211 the field
 *   paths arrive over the wire, get parsed, and are thrown away one line
 *   before they could be used — the user gets the single sentence "The
 *   information provided is not valid." and no indication of which field.
 *
 * SCOPE — only where it is provably wrong: a file that mounts or consumes a
 *   `FormShellContext` (so a field-error sink demonstrably exists) AND calls
 *   `useApiMutation` WITHOUT handing it one. A mutation outside a form —
 *   a row action, a bulk delete, a toggle — has no field to attach anything
 *   to, and demanding `setFieldError` there would be noise.
 *
 * THE FIX
 *       const { setFieldError } = useFormShellState(schema);
 *       useApiMutation({ …, setFieldError });
 *
 * Marker: `// audit-mutation-field-errors-ok: <reason>` on the
 * `useApiMutation` line or the one above — for a mutation that genuinely
 * cannot fail per-field (a delete, a status flip) inside a form file.
 *
 * STAGED — a ratchet, not a baseline.
 *   STAGED_FILES was produced by a run of THIS rule (Root Cause #84), not by
 *   a grep. 75 sites across 40 files. The list may only shrink; a file not on
 *   it fails immediately, so no NEW mutation can land without a field sink.
 *
 *   🛑 Why it is not simply swept: only ONE of the 75 is a drop-in. In the
 *   other 74 the `useApiMutation` call sits ABOVE the
 *   `useFormShellState` that would supply `setFieldError`, so passing it
 *   means moving the hook up — and the hook is not free-floating. The
 *   dominant shape is
 *
 *       const sections = useMemo(…, [upload]);
 *       const nav = useSectionFormNav(sections, form, …);
 *       const { setFieldError } = useFormShellState(schema, {
 *         sections: nav.sectionMeta, onGoToSection: nav.goToSection, … });
 *
 *   so the hook depends on `nav`, which depends on a large `sections`
 *   memo, which in several files closes over the mutation's own handlers.
 *   Reordering that is a dependency-chain change per file, with a silent
 *   failure mode (a stale or missing section map), which is exactly the
 *   bulk-conversion this codebase refuses to do blind.
 *
 *   `MIGRATE=strict` fails everything.
 *
 * Exit 0 — clean.  Exit 1 — a form-scoped mutation with no field-error sink.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const MARKER = /\/\/\s*audit-mutation-field-errors-ok\b/;

/** The hook and the helper that consumes the issues both own this contract. */
const SELF = [
  join("appkit", "src", "client", "api", "useApiMutation.ts"),
  join("appkit", "src", "client", "api", "surface-error.ts"),
];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
}

/** The full `useApiMutation(...)` call text, brace/paren aware. */
function mutationCalls(src) {
  const out = [];
  const re = /\buseApiMutation\s*(?:<[^>]*>\s*)?\(/g;
  let m;
  while ((m = re.exec(src))) {
    let i = re.lastIndex, depth = 1, quote = null, buf = "";
    while (i < src.length && depth > 0) {
      const c = src[i];
      if (quote) { buf += c; if (c === quote && src[i - 1] !== "\\") quote = null; i++; continue; }
      if (c === '"' || c === "'" || c === "`") { quote = c; buf += c; i++; continue; }
      if (c === "(" || c === "{" || c === "[") depth++;
      else if (c === ")" || c === "}" || c === "]") { depth--; if (depth === 0) break; }
      buf += c; i++;
    }
    out.push({ text: buf, line: src.slice(0, m.index).split("\n").length });
  }
  return out;
}

const STRICT = process.env.MIGRATE === "strict";

/** Known offenders at introduction, from a run of this rule. May only shrink. */
const STAGED_FILES = new Set([
  "appkit/src/_internal/client/features/lottery/LotteryPullForm.tsx",
  "appkit/src/features/admin/components/AdminAdEditorView.tsx",
  "appkit/src/features/admin/components/AdminAddressEditorView.tsx",
  "appkit/src/features/admin/components/AdminAdsView.tsx",
  "appkit/src/features/admin/components/AdminBlogEditorView.tsx",
  "appkit/src/features/admin/components/AdminBrandEditorView.tsx",
  "appkit/src/features/admin/components/AdminBundleEditorView.tsx",
  "appkit/src/features/admin/components/AdminCarouselEditorView.tsx",
  "appkit/src/features/admin/components/AdminCarouselGroupEditorView.tsx",
  "appkit/src/features/admin/components/AdminCategoryEditorView.tsx",
  "appkit/src/features/admin/components/AdminCouponEditorView.tsx",
  "appkit/src/features/admin/components/AdminEmployeeEditorView.tsx",
  "appkit/src/features/admin/components/AdminFaqEditorView.tsx",
  "appkit/src/features/admin/components/AdminFeatureEditorView.tsx",
  "appkit/src/features/admin/components/AdminNavEditorView.tsx",
  "appkit/src/features/admin/components/AdminOrderEditorView.tsx",
  "appkit/src/features/admin/components/AdminPayoutMarkPaidModal.tsx",
  "appkit/src/features/admin/components/AdminProductEditorView.tsx",
  "appkit/src/features/admin/components/AdminSectionsView.tsx",
  "appkit/src/features/admin/components/AdminSiteSettingsView.tsx",
  "appkit/src/features/admin/components/AdminStoreEditorView.tsx",
  "appkit/src/features/admin/components/AdminSublistingCategoryEditorView.tsx",
  "appkit/src/features/admin/components/AdminSupportTicketDetailView.tsx",
  "appkit/src/features/admin/components/AdminTaxCodeEditorView.tsx",
  "appkit/src/features/admin/components/AdminTesterChecklistItemEditorView.tsx",
  "appkit/src/features/admin/components/AdminUserEditorView.tsx",
  "appkit/src/features/admin/components/AdminUsersView.tsx",
  "appkit/src/features/admin/components/BrandQuickCreateForm.tsx",
  "appkit/src/features/admin/components/CategoryQuickCreateForm.tsx",
  "appkit/src/features/catalogue/components/CatalogueItemEditorView.tsx",
  "appkit/src/features/events/components/AdminEventEditorView.tsx",
  "appkit/src/features/seller/components/SellerAnalyticsAlertsView.tsx",
  "appkit/src/features/shipments/components/AdminShipmentEditorView.tsx",
  "appkit/src/features/shipments/components/AdminShipmentLotItemsView.tsx",
  "src/app/[locale]/scams/report/page.tsx",
  "src/app/[locale]/store/sublisting-categories/[id]/edit/page.tsx",
  "src/app/[locale]/store/sublisting-categories/new/page.tsx",
  "src/components/homepage/HomepageNewsletterForm.tsx",
  "src/components/layout/FooterNewsletterSlot.tsx",
  "src/components/user/AddressUnbanDrawer.tsx",
]);

const violations = [];
const stagedSeen = new Set();

for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (SELF.some((s) => rel === s)) continue;
    const posix = rel.split(sep).join("/");

    const raw = readFileSync(file, "utf8");
    if (!/\buseApiMutation\s*[(<]/.test(raw)) continue;

    const src = stripComments(raw);
    // Is there a field-error sink in this file at all?
    const hasFormContext =
      /\buseFormShellState\s*\(/.test(src) ||
      /FormShellContext/.test(src) ||
      /<\s*SectionForm\b/.test(src) ||
      /<\s*Form\b(?!Shell|ErrorSummary|Action|Field)/.test(src);
    if (!hasFormContext) continue;

    const rawLines = raw.split("\n");
    for (const call of mutationCalls(src)) {
      if (/\bsetFieldError\b/.test(call.text)) continue;
      const here = rawLines[call.line - 1] ?? "";
      const above = rawLines[call.line - 2] ?? "";
      if (MARKER.test(here) || MARKER.test(above)) continue;
      if (STAGED_FILES.has(posix) && !STRICT) { stagedSeen.add(posix); continue; }
      violations.push(
        `${posix}:${call.line}  useApiMutation in a form file does not pass setFieldError`,
      );
    }
  }
}

const stale = [...STAGED_FILES].filter((x) => !stagedSeen.has(x));
if (violations.length === 0) {
  console.log(
    `audit-mutation-field-errors: clean ✓ (${stagedSeen.size} staged` +
      (stale.length ? `; ${stale.length} now FIXED — remove from STAGED_FILES` : "") +
      ")",
  );
  stale.forEach((x) => console.log("  fixed: " + x));
  process.exit(0);
}
console.error("\n[audit-mutation-field-errors] violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(
  "\n  The server already sends per-field `issues` and `surfaceError` already" +
    "\n  knows how to apply them — but only when the caller supplies a sink:" +
    "\n      useApiMutation({ …, setFieldError })" +
    "\n  Without it the paths are parsed off the wire and discarded, and the user" +
    "\n  sees one generic sentence with no indication of which field.\n",
);
console.error(`Total: ${violations.length}\n`);
process.exit(1);

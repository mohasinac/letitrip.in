#!/usr/bin/env node
/**
 * audit-form-sectionised — strict-zero, with a SHRINKING grandfather list.
 *
 * A file that renders form FIELDS must render them inside `<SectionForm>`.
 *
 * ## Why this exists
 *
 * "All 92 forms, no exemptions" has been the stated target since W0 and has
 * never been measurable: the only number available was a `<SectionForm>` grep
 * (13), which says what is DONE and nothing about what is LEFT. So migration
 * targets got picked ad hoc, and a new hand-rolled form could land without
 * anything noticing.
 *
 * The count this produces is the remaining work, and it only goes down.
 *
 * ## Ships green, like `audit-no-step-wizard`
 *
 * Every known offender is grandfathered on day one, so this blocks the NEXT
 * hand-rolled form immediately rather than arriving once the last one is
 * migrated. Delete an entry as its file migrates; the staleness check below
 * tells you when one is ready to remove, so the list cannot rot into a
 * permanent allow-list.
 *
 * ## What is NOT grandfathered — the structural exclusions
 *
 * `appkit/src/ui/**` and `appkit/src/features/shell/**` are the form
 * primitives THEMSELVES (`FieldInput`, `QuickFormDrawer`, `SectionForm`).
 * Asking them to render a `<SectionForm>` is circular. They are excluded by
 * path, not listed as debt, because they are never going to migrate and an
 * entry that can never be deleted is exactly what turns a shrinking list into
 * a permanent one.
 *
 * `QuickFormDrawer` callsites are also fine: quick mode is the sanctioned
 * OTHER surface for an entity's fields (see `EntityFormDefinition`), and it
 * carries its own `schema` prop enforced by `audit-quick-form-drawer-schema`.
 *
 * Suppression: `// audit-form-sectionised-ok: <reason>` on the offending line
 * or the one above.
 *
 * Exit 0 — clean.  Exit 1 — a new un-grandfathered hand-rolled form.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__"]);

/**
 * Paths that define the primitives rather than consume them. Excluded
 * structurally — see the header.
 */
const PRIMITIVE_DIRS = [
  "appkit/src/ui/",
  "appkit/src/features/shell/",
];

/**
 * Renders a form control.
 *
 * 🛑 **The narrow version of this regex made the audit's own count a fiction.**
 * It matched only `<Field*` / `<FormField`, so a form built from the appkit
 * control primitives — `<Input>`, `<Toggle>`, `<Select>`, `<PaginatedSelect>`,
 * `<MediaUploadField>` — was INVISIBLE to it. Measured 2026-08-29: **17 such
 * forms**, none of them on the list, including the two largest surfaces in the
 * app (`AdminSectionsView`, 207 controls; `AdminSiteSettingsView`, 161). The
 * audit reported "45 awaiting" against a true 62.
 *
 * That is the failure this file was written to prevent, reproduced inside the
 * file itself: a denominator narrow enough to certify the work done. And it is
 * not an unlucky regex — `audit-raw-form-input` BANS raw `<input>`, so every
 * compliant hand-rolled form necessarily uses the primitives this missed.
 */
const CONTROL_RE =
  /<(?:Field(?:Input|Select|Textarea|Checkbox)|FormField|Input|Textarea|Select|Toggle|Checkbox|PaginatedSelect|MediaUploadField|ImageUpload|RichTextEditor)\b/g;

/**
 * How many controls make a surface a FORM rather than a control that happens to
 * submit something.
 *
 * Widening the regex above brings back exactly the noise the submit-ownership
 * filter was added to remove: a listing's two filter `<Select>`s, a search box,
 * a single inline reply `<Textarea>`. None of those has anything to collapse,
 * so demanding sections of them would be nonsense — and, worse, would put
 * entries on a shrinking list that can never be removed, which is precisely how
 * a shrinking list rots into a permanent allow-list.
 *
 * Three is where the two populations separate: every genuine editor measured
 * has ≥4, and every reply-box / filter-bar false positive has ≤2.
 */
const MIN_CONTROLS = 3;
const SECTION_FORM_RE = /<\s*SectionForm\b/;
/** Quick mode is a sanctioned surface, and has its own schema audit. */
const QUICK_DRAWER_RE = /<\s*QuickFormDrawer\b/;
/**
 * A file only OWNS a form if it also owns a submit. Without this the count
 * includes three kinds of file that must NOT render their own <SectionForm>:
 *
 *   · search and filter inputs built from FieldInput — TesterHubView's
 *     "Search test cases" box, SellerProductsFilterDrawer
 *   · read-only views that render a field for display (UserBidsView)
 *   · FIELD GROUPS whose parent owns the submit — ProductForm renders inside
 *     SellerProductShell, which IS sectionised. Wrapping the child too would
 *     nest one SectionForm inside another
 *
 * Found while working the list: TesterHubView was flagged for a search box.
 * A count with noise in it is a count people learn to ignore, which is why
 * two W22 audits were cut for exactly this rather than shipped.
 */
const OWNS_A_SUBMIT_RE =
  /apiClient\.(post|put|patch)|method:\s*["'](POST|PUT|PATCH)["']|useApiMutation|useMutation|onSubmit\s*[=:]|mutationFn/;

const SUPPRESS_RE = /audit-form-sectionised-ok:/;

/**
 * Known hand-rolled forms, awaiting migration. DELETE an entry when its file
 * gains a `<SectionForm>` — the staleness check will tell you.
 *
 * Generated 2026-08-27 from the tree as it stood. 45 entries (16 dropped once the submit-ownership filter landed).
 */
const GRANDFATHERED = new Set([
  "appkit/src/_internal/client/features/lottery/LotteryAdminEditView.tsx",
  "appkit/src/_internal/client/features/lottery/LotteryPullForm.tsx",
  "appkit/src/features/account/components/AddressForm.tsx",
  "appkit/src/features/account/components/UserSupportView.tsx",
  "appkit/src/features/admin/components/AdminAdEditorView.tsx",
  "appkit/src/features/admin/components/AdminAddressEditorView.tsx",
  "appkit/src/features/admin/components/AdminAdsView.tsx",
  "appkit/src/features/admin/components/AdminBrandEditorView.tsx",
  "appkit/src/features/admin/components/AdminBundleEditorView.tsx",
  "appkit/src/features/admin/components/AdminCarouselEditorView.tsx",
  "appkit/src/features/admin/components/AdminCouponEditorView.tsx",
  "appkit/src/features/admin/components/AdminEmployeeEditorView.tsx",
  "appkit/src/features/admin/components/AdminFeatureEditorView.tsx",
  "appkit/src/features/admin/components/AdminNavEditorView.tsx",
  "appkit/src/features/admin/components/AdminOrderEditorView.tsx",
  "appkit/src/features/admin/components/AdminProductEditorView.tsx",
  "appkit/src/features/admin/components/AdminSectionsView.tsx",
  "appkit/src/features/admin/components/AdminSiteSettingsView.tsx",
  "appkit/src/features/admin/components/AdminStoreEditorView.tsx",
  "appkit/src/features/admin/components/AdminSupportTicketDetailView.tsx",
  "appkit/src/features/admin/components/AdminTesterChecklistItemEditorView.tsx",
  "appkit/src/features/admin/components/AdminUserEditorView.tsx",
  "appkit/src/features/admin/components/BrandQuickCreateForm.tsx",
  "appkit/src/features/admin/components/CategoryQuickCreateForm.tsx",
  "appkit/src/features/auth/components/LoginForm.tsx",
  "appkit/src/features/auth/components/RegisterForm.tsx",
  "appkit/src/features/catalogue/components/CatalogueItemEditorView.tsx",
  "appkit/src/features/consultation/components/ConsultationForm.tsx",
  "appkit/src/features/corporate/components/CorporateInquiryForm.tsx",
  "appkit/src/features/products/components/GroupSettingsPanel.tsx",
  "appkit/src/features/seller/components/SellerAnalyticsAlertsView.tsx",
  "appkit/src/features/seller/components/SellerCouponEditorView.tsx",
  "appkit/src/features/seller/components/SellerGoogleReviewsView.tsx",
  "appkit/src/features/seller/components/SellerOrdersView.tsx",
  "appkit/src/features/seller/components/SellerReviewsView.tsx",
  "appkit/src/features/shipments/components/AdminShipmentEditorView.tsx",
  "appkit/src/features/shipments/components/AdminShipmentLotItemsView.tsx",
  "appkit/src/features/whatsapp-bot/components/SellerWhatsAppSettingsView.tsx",
  "src/app/[locale]/admin/roles/[id]/edit/page.tsx",
  "src/app/[locale]/admin/roles/new/page.tsx",
  "src/app/[locale]/events/[id]/participate/EventParticipateClient.tsx",
  "src/app/[locale]/scams/report/page.tsx",
  "src/app/[locale]/user/orders/[id]/payment/page.tsx",
  "src/app/[locale]/user/settings/page.tsx",
  "src/app/[locale]/user/support/new/page.tsx",
  "src/components/routing/CheckoutRouteClient.tsx",
  "src/components/user/ProfilePageClient.tsx",
  "src/components/user/UserAddressesClient.tsx",
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

const violations = [];
const seen = new Set();

for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (PRIMITIVE_DIRS.some((d) => rel.startsWith(d))) continue;

    const raw = readFileSync(file, "utf8");
    // Comment-aware: three audits have shipped with this bug (see CLAUDE.md
    // Root Cause notes on audit-field-ui-meta), so strip before matching.
    const src = raw
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");

    CONTROL_RE.lastIndex = 0;
    if ((src.match(CONTROL_RE) ?? []).length < MIN_CONTROLS) continue;
    if (!OWNS_A_SUBMIT_RE.test(src)) continue;
    if (SECTION_FORM_RE.test(src)) continue;
    if (QUICK_DRAWER_RE.test(src)) continue;
    if (SUPPRESS_RE.test(raw)) continue;

    seen.add(rel);
    if (GRANDFATHERED.has(rel)) continue;
    violations.push(rel);
  }
}

/*
 * `--list` prints every surface the RULE currently detects, ready to paste into
 * GRANDFATHERED. Root Cause #84: a list seeded from a hand-written grep and a
 * list produced by the rule disagree, and the grep is always the wrong one —
 * it happened to this very file (see CONTROL_RE) and to the W1a ratchet before
 * it. There is now no reason to ever hand-write an entry.
 */
if (process.argv.includes("--list")) {
  for (const f of [...seen].sort()) console.log(`  "${f}",`);
  console.error(`\n${seen.size} surface(s) detected.`);
  process.exit(0);
}

const stale = [...GRANDFATHERED].filter((f) => !seen.has(f));

if (violations.length === 0) {
  console.log(
    `audit-form-sectionised: clean ✓ (${GRANDFATHERED.size} form(s) awaiting sectionising)`,
  );
  if (stale.length) {
    console.log("\n  ✓ migrated — remove from GRANDFATHERED:");
    for (const f of stale) console.log(`    ${f}`);
  }
  process.exit(0);
}

console.error("\n[audit-form-sectionised] STRICT-ZERO violation(s):\n");
console.error(
  "A file rendering form fields outside <SectionForm> is a hand-rolled form:\n" +
    "it gets no schema-derived sections, no error summary wiring, no jump-to-\n" +
    "field, and no pinned mobile action bar. Wrap the fields in <SectionForm>\n" +
    "(sections come from the schema via buildSectionsFromSchema), or use\n" +
    "<QuickFormDrawer> if it is genuinely a quick create.\n",
);
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

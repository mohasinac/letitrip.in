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

/** Renders a form field. */
const FIELD_RE = /<Field(?:Input|Select|Textarea|Checkbox)\b|<FormField\b/;
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
 * Generated 2026-08-27 from the tree as it stood. 47 entries (16 dropped once the submit-ownership filter landed).
 */
const GRANDFATHERED = new Set([
  "src/app/[locale]/admin/roles/new/page.tsx",
  "src/app/[locale]/store/listing-templates/new/page.tsx",
  "src/app/[locale]/store/listing-templates/[id]/edit/page.tsx",
  "src/app/[locale]/store/payout-methods/new/page.tsx",
  "src/app/[locale]/store/shipping-configs/new/page.tsx",
  "src/app/[locale]/store/shipping-configs/[id]/edit/page.tsx",
  "src/app/[locale]/user/notifications/page.tsx",
  "src/app/[locale]/user/orders/[id]/cancel/page.tsx",
  "src/app/[locale]/user/orders/[id]/payment/page.tsx",
  "src/app/[locale]/user/support/new/page.tsx",
  "src/components/homepage/HomepageNewsletterForm.tsx",
  "src/components/layout/FooterNewsletterSlot.tsx",
  "src/components/routing/CheckoutRouteClient.tsx",
  "src/components/user/ProfilePageClient.tsx",
  "src/components/user/UserAddressesClient.tsx",
  "appkit/src/features/account/components/AddressForm.tsx",
  "appkit/src/features/account/components/UserSupportView.tsx",
  "appkit/src/features/admin/components/AdminBrandEditorView.tsx",
  "appkit/src/features/admin/components/AdminBundleEditorView.tsx",
  "appkit/src/features/admin/components/AdminCarouselEditorView.tsx",
  "appkit/src/features/admin/components/AdminCarouselGroupEditorView.tsx",
  "appkit/src/features/admin/components/AdminCategoryEditorView.tsx",
  "appkit/src/features/admin/components/AdminCouponEditorView.tsx",
  "appkit/src/features/admin/components/AdminFaqEditorView.tsx",
  "appkit/src/features/admin/components/AdminPayoutMarkPaidModal.tsx",
  "appkit/src/features/admin/components/AdminSublistingCategoryEditorView.tsx",
  "appkit/src/features/admin/components/AdminTesterChecklistItemEditorView.tsx",
  "appkit/src/features/auctions/components/PlaceBidFormClient.tsx",
  "appkit/src/features/auth/components/ForgotPasswordView.tsx",
  "appkit/src/features/auth/components/LoginForm.tsx",
  "appkit/src/features/auth/components/RegisterForm.tsx",
  "appkit/src/features/auth/components/ResetPasswordView.tsx",
  "appkit/src/features/catalogue/components/CatalogueItemEditorView.tsx",
  "appkit/src/features/consultation/components/ConsultationForm.tsx",
  "appkit/src/features/corporate/components/CorporateInquiryForm.tsx",
  "appkit/src/features/events/components/EventRaffleEntryForm.tsx",
  "appkit/src/features/homepage/components/NewsletterBanner.tsx",
  "appkit/src/features/products/components/GroupSettingsPanel.tsx",
  "appkit/src/features/products/components/MakeOfferButton.tsx",
  "appkit/src/features/seller/components/SellerGoogleReviewsView.tsx",
  "appkit/src/features/shipments/components/AdminShipmentEditorView.tsx",
  "appkit/src/features/shipments/components/AdminShipmentLotItemsView.tsx",
  "appkit/src/features/shipments/components/ShipmentItemLinkModal.tsx",
  "appkit/src/features/store-extensions/components/ReviewDecisionModal.tsx",
  "appkit/src/features/tester/components/TesterHubView.tsx",
  "appkit/src/_internal/client/features/lottery/LotteryAdminEditView.tsx",
  "appkit/src/_internal/client/features/lottery/LotteryPullForm.tsx",
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

    if (!FIELD_RE.test(src)) continue;
    if (!OWNS_A_SUBMIT_RE.test(src)) continue;
    if (SECTION_FORM_RE.test(src)) continue;
    if (QUICK_DRAWER_RE.test(src)) continue;
    if (SUPPRESS_RE.test(raw)) continue;

    seen.add(rel);
    if (GRANDFATHERED.has(rel)) continue;
    violations.push(rel);
  }
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

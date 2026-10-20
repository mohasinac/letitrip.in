/**
 * Batch 2 — the live F1 defects, each with the control that separates a fix
 * from a plausible 200.
 *
 * 🛑 Every one of these returned success while doing the wrong thing:
 *
 *   #8  item-requests never finalized its uploads, so the photos were reaped
 *       out of `tmp/` hours after a 201.
 *   #9  two replies in the same second: one was silently discarded, and the
 *       count agreed with the survivor.
 *   #22 a declared `_MAX_ORDER_TICKETS` implied a cap nothing enforced.
 *   #23 the PDF invoice's lines could not sum to its own Grand Total.
 *   #24 ...and it printed HSN/GST columns on pre-GST orders, where empty
 *       columns read as missing DATA.
 *   #25 the seller's "compare at" price was written under a name no document
 *       declared and no renderer read.
 *   #28 a sixth hand-rolled copy of `toStoreListItem`.
 *   #34 multi-word search could not reach page 2 in ten repositories.
 *   #35 two dead FAQ methods, one wrapping a FAILED_PRECONDITION.
 *   #36 20 Firestore reads per homepage render to display 10.
 *
 * Run: node scripts/verify-f1-defects.mjs
 *
 * @tag domain:quality
 * @tag layer:script
 * @tag access:node-only
 */
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
globalThis.require = createRequire(import.meta.url);

const { beginSearchWindow, planSearchTxt, SEARCH_REFINE_WINDOW } = await import(
  "@mohasinac/appkit/utils/search-txt-query"
);

let pass = 0;
let fail = 0;
const ok = (c, m) => {
  if (c) {
    pass++;
    console.log("  PASS", m);
  } else {
    fail++;
    console.log("  FAIL", m);
  }
};
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");

console.log("\n=== #8 / #9 — item-requests: media finalized, replies atomic ===");
{
  const create = read("src/app/api/item-requests/route.ts");
  const replies = read("src/app/api/item-requests/[id]/replies/route.ts");
  const repo = read("appkit/src/features/store-extensions/repository/store-extensions.repositories.ts");

  ok(/finalizeStagedMediaArray\(body!\.imageUrls\)/.test(create), "#8 the create route finalizes `imageUrls` before writing");
  ok(
    /\n\s*imageUrls,/.test(create) && !/imageUrls: body!\.imageUrls \?\? \[\]/.test(create),
    "...and writes the finalized array, not the raw body",
  );

  ok(!/replies: \[\.\.\.doc\.replies/.test(replies), "#9 the read-modify-write on `replies` is gone");
  ok(/appendReply\(id, replyEntry\)/.test(replies), "...replaced by an atomic repository append");
  ok(/replies: arrayUnion\(reply\)/.test(repo) && /replyCount: increment\(1\)/.test(repo), "...which uses arrayUnion + increment, so two concurrent replies compose");
}

console.log("\n=== #5-in-this-copy — stripPii's UPI rule can now fire ===");
{
  /*
   * The rule ORDER is the fix, so the control is a bare VPA: the old order
   * matched it with none of its three rules and passed it through a filter
   * that reported success.
   */
  const src = read("src/app/api/item-requests/[id]/replies/route.ts");
  const body = src.slice(src.indexOf("function stripPii"), src.indexOf("export const POST"));
  // The route is TypeScript, so the annotations come off before eval. Crude on
  // purpose: a parser here would be a second implementation of the thing being
  // tested, and the only annotations in this function are its own signature.
  const js = body.replace(/\(input: string\): string/, "(input)");
  const stripPii = new Function(`${js}; return stripPii;`)();

  ok(stripPii("pay me at ravi@okaxis").includes("[UPI removed]"), "🛑 a bare `name@bank` VPA is removed — it matched NO rule before");
  ok(stripPii("mail ravi@example.com").includes("[email removed]"), "a real email is still an email, not a VPA");
  ok(stripPii("9876543210@upi").includes("[UPI removed]"), "a numeric VPA is removed as a VPA, not mangled into `[number removed]@upi`");
  ok(stripPii("call 9876543210").includes("[number removed]"), "a bare phone number is still removed");
  ok(stripPii("upi://pay?pa=ravi@okaxis").includes("[UPI removed]"), "an explicit upi:// link is removed");
  ok(stripPii("the Dranzer S is mint") === "the Dranzer S is mint", "CONTROL: ordinary text is untouched — a filter that eats everything looks identical to one that works");
}

console.log("\n=== #23 / #24 — the PDF invoice adds up, and hides inapplicable columns ===");
{
  const pdf = read("functions/src/invoice-pdf.ts");
  for (const [label, field] of [
    ["shipping", "order.shippingFee"],
    ["gift wrap", "order.giftWrapFee"],
    ["shipment protection", "order.shipmentProtectionFee"],
    ["the platform fee", "order.platformFee"],
    ["the GST total", "order.gstAmount"],
  ]) {
    ok(pdf.includes(field), `#23 ${label} has a row (${field})`);
  }
  ok(/appliedDiscounts\?\.length/.test(pdf), "#23 discounts come from `appliedDiscounts` (a cart can stack two), with the scalar as fallback");
  ok(/−\$\{?formatRupees/.test(pdf) || /`−\$\{formatRupees/.test(pdf), "...and a discount renders with its sign, so the column sums");
  ok(/const showTaxCols = items\.some\(\(i\) => i\.hsnCode \|\| i\.gstRate != null\)/.test(pdf), "#24 HSN/GST columns appear only when a line carries one — the same predicate the HTML invoice uses");
  ok(/if \(showTaxCols\) doc\.text\("HSN"/.test(pdf), "...the HEADER is gated too, not just the cells");
  ok(/item\.gstRate == null \? "—" : `\$\{item\.gstRate\}%`/.test(pdf), "`0%` reads as a deliberate exemption and an ABSENT rate as unknown — they are different statements");
}

console.log("\n=== #25 — the strike-through price is one vocabulary, end to end ===");
{
  const doc = read("appkit/src/features/products/schemas/firestore.ts");
  const shell = read("appkit/src/features/seller/components/SellerProductShell.tsx");
  const form = read("appkit/src/features/seller/schemas/product-form.ts");
  const repo = read("appkit/src/features/products/repository/products.repository.ts");
  const grid = read("appkit/src/features/products/components/ProductGrid.tsx");

  ok(/^  originalPrice\?: number;$/m.test(doc), "the DOCUMENT declares `originalPrice`");
  ok(/"originalPrice",/.test(doc), "...and it is in the updatable + public field lists");
  ok(/name="originalPrice"/.test(shell) && !/compareAtPrice/.test(form), "the FORM writes the same name (no `compareAtPrice` left in the schema)");
  ok(/out\.originalPrice = grossFromTaxable\(input\.originalPrice, effectiveRate\)/.test(repo), "🛑 it is grossed up with `price` — a mixed inc/ex-tax pair would overstate the discount");
  ok(/product\.originalPrice && product\.originalPrice > product\.price/.test(grid), "the RENDERER reads that same field (unchanged — it always did)");
  ok(
    read("appkit/src/features/about/components/PublicProfileView.tsx").includes("originalPrice: p.originalPrice"),
    "the second `toProductItem` copy carries it too, so a discount survives a profile/carousel",
  );
}

console.log("\n=== #28 — one store projection, not six ===");
{
  const view = read("appkit/src/features/categories/components/CategoryDetailPageView.tsx");
  ok(/\.map\(\(s\) => toStoreListItem\(s\)\)/.test(view), "the category page uses the shared adapter");
  ok(!/supportsSaleProtection: s\.supportsSaleProtection \?\? false/.test(view), "...and its hand-rolled literal is gone");
}

console.log("\n=== #34 — multi-word search reaches page 2 in every repository ===");
{
  const FILES = [
    "appkit/src/features/blog/repository/blog.repository.ts",
    "appkit/src/features/categories/repository/categories.repository.ts",
    "appkit/src/features/events/repository/events.repository.ts",
    "appkit/src/features/orders/repository/orders.repository.ts",
    "appkit/src/features/promotions/repository/coupons.repository.ts",
    "appkit/src/features/reviews/repository/reviews.repository.ts",
    "appkit/src/features/scams/repository/scammer.repository.ts",
    "appkit/src/features/seller/repository/offer.repository.ts",
    "appkit/src/features/stores/repository/store.repository.ts",
    "appkit/src/features/products/repository/products.repository.ts",
  ];
  let legacy = 0;
  let converted = 0;
  for (const f of FILES) {
    const s = read(f);
    legacy += (s.match(/refineSearchTxt\(result, plan\.rest\)/g) ?? []).length;
    converted += (s.match(/win\.finish\(result/g) ?? []).length;
  }
  ok(legacy === 0, `no legacy page-only refine calls remain (found ${legacy})`);
  ok(converted === 13, `all 13 call sites go through the window helper (found ${converted})`);

  /*
   * 🛑 The half that silently no-ops: a raised window with an unraised
   * `maxPageSize` is clamped straight back to a page. Every converted site
   * must declare it through the helper.
   */
  /*
   * 🛑 SCOPED to the refined queries, and the first version of this check was
   * not: it flagged every literal `maxPageSize` in the file and so reported
   * three "violations" in methods that have no search at all (orders'
   * `listForUser`, reviews' per-product and per-store lists), where a literal
   * cap is exactly right. A check wider than the rule it enforces is Root
   * Cause #84 — so the window is the 20 lines after a `beginSearchWindow`,
   * which is where a clamped cap would actually hurt.
   */
  const unraised = [];
  for (const f of FILES) {
    const lines = read(f).split("\n");
    lines.forEach((ln, i) => {
      if (!/maxPageSize: \d+/.test(ln)) return;
      const before = lines.slice(Math.max(0, i - 20), i).join("\n");
      if (before.includes("beginSearchWindow(")) unraised.push(`${f}:${i + 1} ${ln.trim()}`);
    });
  }
  ok(
    unraised.length === 0,
    `no refined query declares a literal maxPageSize — it would clamp the window back to a page (${unraised.join("; ") || "none"})`,
  );

  // Behaviour: the helper's three decisions.
  const plan2 = planSearchTxt("red dranzer");
  const win2 = beginSearchWindow({ page: 2, pageSize: 20 }, plan2);
  ok(win2.model.page === 1 && win2.model.pageSize === SEARCH_REFINE_WINDOW, "multi-term: the FETCH asks for page 1 × the window");
  ok(win2.maxPageSize(50) === SEARCH_REFINE_WINDOW, "...and maxPageSize rises with it");

  const plan1 = planSearchTxt("dranzer");
  const win1 = beginSearchWindow({ page: 2, pageSize: 20 }, plan1);
  ok(win1.model.page === 2 && win1.maxPageSize(50) === 50, "CONTROL: a single-term query is untouched — no over-fetch, no raised cap");

  const rows = Array.from({ length: 60 }, (_, i) => ({ id: i, searchTxt: ["red", "dranzer"] }));
  const sliced = win2.finish({ items: rows, total: 60, page: 1, pageSize: 250, totalPages: 1, hasMore: false });
  ok(sliced.items.length === 20 && sliced.items[0].id === 20, "🛑 page 2 of a two-word search EXISTS and holds rows 21-40");
  ok(sliced.total === 60, "...and `total` is the refined count over the window, not one page");

  const noMatch = win2.finish({ items: [{ id: 1, searchTxt: ["dranzer"] }], total: 1, page: 1, pageSize: 250, totalPages: 1, hasMore: false });
  ok(noMatch.items.length === 0, "CONTROL: a row matching only ONE of two terms is dropped — the AND-refine is real");
}

console.log("\n=== #35 / #36 — the FAQ reads ===");
{
  const repo = read("appkit/src/features/faq/repository/faqs.repository.ts");
  const caps = read("appkit/src/features/faq/constants/read-caps.ts");
  const renderer = read("appkit/src/features/homepage/lib/section-renderer.tsx");

  ok(!/async findForHomepage\(/.test(repo) && !/async findForFooter\(/.test(repo), "#35 both dead methods are deleted (one wrapped an undeclared ASC index)");
  ok(/export const FAQ_HOMEPAGE_READ_CAP/.test(caps), "#36 the read cap is a named constant");
  ok(/\.limit\(FAQ_HOMEPAGE_READ_CAP\)/.test(repo) && /\.limit\(FAQ_FOOTER_READ_CAP\)/.test(repo), "...and both reads are bounded by it");
  ok(
    !/repository\/faqs\.repository/.test(renderer),
    "🛑 the renderer imports the CONSTANT module, never the repository — importing the repo would drag firebase-admin into a render chain (Root Cause #24)",
  );
  ok(/moreCount=\{readSaturated \? 0 : totalFaqs - slicedItems\.length\}/.test(renderer), "a saturated read stops CLAIMING a precise `+N` (an unknown count must not render as a known one)");
}

console.log("\n=== #22 — a cap that was never enforced no longer claims to be ===");
{
  const tickets = read("src/app/api/support/tickets/route.ts");
  ok(!/_MAX_ORDER_TICKETS/.test(tickets.replace(/\/\*[\s\S]*?\*\//g, "")), "the dead constant is gone from the code (the note explaining why stays)");
  ok(/const MAX_OPEN_TICKETS = 2;/.test(tickets), "CONTROL: the cap that IS enforced is untouched");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

/**
 * C5e — the protection VALUE CAP and the category exclusions.
 *
 * These are the last thing standing between C5e's shipped logic and a badge on
 * a real listing: the plan's rule was that *no badge appears until the
 * exclusions are written*, because a no-questions-asked guarantee on a ₹40,000
 * graded slab is a different product from one on a ₹149 spin track.
 *
 * Directed to "use standard from net", so the shape follows the two
 * marketplaces that publish theirs — Amazon A-to-z (a $2,500 cap, inclusive of
 * shipping) and eBay MBG (whole categories excluded, a value threshold above
 * which authentication replaces the guarantee, and an authenticated item being
 * final sale) — while the NUMBER comes from this catalogue's own measured
 * bands, because $2,500 is ~₹2.2 lakh and a cap nothing can reach is not a cap.
 *
 * 🛑 THE CONTROL THAT MATTERS: shipping protection must be EXEMPT from both
 * gates. A parcel lost in transit was never delivered, so neither the value nor
 * the listing type changes what happened — and under escrow we are the
 * carrier's counterparty, so it is our claim either way. A cap applied there
 * would withdraw cover for the one failure the buyer has no part in.
 */
/* 🛑 The dist path, not a package subpath: `_internal/` is deliberately NOT in
 * appkit's `exports` map (the boundary audit enforces that), so a bare specifier
 * throws ERR_PACKAGE_PATH_NOT_EXPORTED. The sibling verify scripts import from
 * dist for the same reason. */
const {
  protectionAvailability,
  showsRiskNotice,
  showsSafetyBadge,
  adjudicateClaim,
  SALE_PROTECTION_MAX_VALUE,
  SALE_PROTECTION_EXCLUDED_LISTING_TYPES,
  SALE_PROTECTION_EXCLUDES_GRADED,
  PROTECTION_CLAIM_WINDOW_HOURS,
} = await import("../appkit/dist/_internal/shared/features/shipping/protections.js");

let pass = 0;
let fail = 0;
const ok = (c, m) => {
  if (c) { pass++; console.log("  PASS", m); } else { fail++; console.log("  FAIL", m); }
};

/** A seller who has opted in, on a platform that offers it, on an ordinary item. */
const ON = { platformEnabled: true, sellerSupports: true, finalSale: false };

console.log("\n=== 1. the cap is reachable, and it is OURS not a converted dollar figure ===");
ok(SALE_PROTECTION_MAX_VALUE === 25_000, "cap is ₹25,000");
ok(
  SALE_PROTECTION_MAX_VALUE < 220_000,
  "🛑 and well under Amazon's $2,500 (~₹2.2 lakh), which is above the most expensive thing in the whole corpus — a cap nothing can reach is not a cap",
);
ok(
  SALE_PROTECTION_MAX_VALUE > 14_500,
  "...while still above every measured band's p75 (the highest is ₹14,500, TCG booster box), so ordinary cover is unaffected",
);

console.log("\n=== 2. the value gate, SALE only ===");
ok(protectionAvailability("sale", { ...ON, lineTotal: 24_999 }).available === true,
   "₹24,999 is covered");
ok(protectionAvailability("sale", { ...ON, lineTotal: 25_000 }).available === true,
   "exactly ₹25,000 is covered — the cap is inclusive");
{
  const a = protectionAvailability("sale", { ...ON, lineTotal: 40_000 });
  ok(a.available === false && a.reason === "above-value-cap",
     "a ₹40,000 slab is above the cap, with a reason the UI can render");
}
ok(
  protectionAvailability("sale", ON).available === true,
  "🛑 an ABSENT lineTotal skips the cap rather than failing it — a missing figure is our gap, and refusing cover over it would charge a fee and then decline the claim",
);

console.log("\n=== 3. 🛑 SHIPPING protection is exempt from both gates ===");
ok(
  protectionAvailability("shipping", { ...ON, lineTotal: 1_000_000 }).available === true,
  "a ₹10 lakh item still has SHIPPING cover — the parcel was never delivered, so its value changes nothing",
);
for (const t of SALE_PROTECTION_EXCLUDED_LISTING_TYPES) {
  ok(
    protectionAvailability("shipping", { ...ON, listingType: t }).available === true,
    `...and so does a "${t}" listing`,
  );
}

console.log("\n=== 4. the excluded categories, each unadjudicable rather than merely dear ===");
ok(SALE_PROTECTION_EXCLUDED_LISTING_TYPES.length === 3, "three types, not a long tail");
for (const t of ["live", "digital-code", "classified"]) {
  ok(SALE_PROTECTION_EXCLUDED_LISTING_TYPES.includes(t), `"${t}" is excluded`);
  const a = protectionAvailability("sale", { ...ON, listingType: t });
  ok(a.available === false && a.reason === "excluded-category", `...and reports why for "${t}"`);
}
ok(
  protectionAvailability("sale", { ...ON, listingType: "standard" }).available === true,
  "CONTROL an ordinary standard listing is still covered — the list excludes, it does not gate everything",
);
ok(
  protectionAvailability("sale", { ...ON, listingType: "auction" }).available === true,
  "CONTROL and so is an auction",
);

console.log("\n=== 5. a GRADED slab follows eBay's own authenticated-is-final-sale rule ===");
ok(SALE_PROTECTION_EXCLUDES_GRADED === true, "graded items are excluded");
{
  const a = protectionAvailability("sale", { ...ON, isGraded: true });
  ok(a.available === false && a.reason === "excluded-category",
     "a slab is excluded — a third party has certified the grade and the cert deep-links, so the buyer can verify BEFORE paying");
}
ok(protectionAvailability("shipping", { ...ON, isGraded: true }).available === true,
   "CONTROL but it still ships protected");

console.log("\n=== 6. the two claim windows, on different clocks ===");
ok(PROTECTION_CLAIM_WINDOW_HOURS.shipping === 48,
   "shipping: 48h — already this platform's stated damage window, in the seeded FAQ");
ok(PROTECTION_CLAIM_WINDOW_HOURS.sale === 168,
   "sale: 7 days — long enough to inspect a collectible, and at the strict end because we underwrite it");
ok(PROTECTION_CLAIM_WINDOW_HOURS.sale > PROTECTION_CLAIM_WINDOW_HOURS.shipping,
   "...and longer than the transit window, since transit damage shows on unboxing");

console.log("\n=== 7. nothing above regressed the tier order or the promise ===");
{
  const a = protectionAvailability("sale", { platformEnabled: false, sellerSupports: true, finalSale: false, lineTotal: 99_999 });
  ok(a.reason === "platform-disabled",
     "platform-disabled still wins over the value cap — the reason is RENDERED, and 'we do not offer this' is a different sentence");
  ok(showsRiskNotice(a) === false, "...and it shows NO risk notice, because there is nothing to disclose about this seller");
}
{
  const a = protectionAvailability("sale", { platformEnabled: true, sellerSupports: false, finalSale: false, lineTotal: 99_999 });
  ok(a.reason === "seller-not-supported" && showsRiskNotice(a) === true,
     "seller-not-supported still wins over the cap, and shows the notice");
}
ok(showsSafetyBadge({ available: true }) === true, "an available protection still earns the badge");
ok(adjudicateClaim(true, "change-of-mind").refundBuyer === true,
   "🛑 and the promise is still UNCONDITIONAL — a protected change-of-mind claim refunds; only who BEARS it changes");

console.log(`\n${fail === 0 ? "all checks passed" : "FAILURES"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

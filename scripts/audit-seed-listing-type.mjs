#!/usr/bin/env node
/**
 * Every seeded product must carry a `listingType`, and it must be the one its
 * slug prefix claims.
 *
 * ── 🛑 WHY A COMMENT WAS NOT ENOUGH ───────────────────────────────────────
 *
 * `products-auctions-seed-data.ts` applied its wrappers to a spread and then
 * appended one more fixture after it, so that fixture received none of them. It
 * was found once, for `searchTxt`, and fixed by lifting `.map(withTokens)` out
 * to the whole array — with a comment above the pipeline explaining the lesson.
 *
 * `listingType` stayed INSIDE the spread and was missed. So the same bug
 * survived its own fix, one field over, under a comment describing it.
 * Measured 2026-10-14: 9 of the 10 seeded auctions carried `listingType` and
 * `auction-beyblade-burst-lord-spryzen-ended-unsold` did not — the single
 * fixture CLAUDE.md names as the only row that proves the auction availability
 * branch reads `auctionEndDate` rather than falling through to the shared
 * isSold check. It never appeared on /auctions at all.
 *
 * A predicted regression with no code enforcing the prediction is an unfixed
 * regression (Root Cause #74). This is the code.
 *
 * ── 🛑 WHY IT IS INVISIBLE WITHOUT AN AUDIT ───────────────────────────────
 *
 * `normalizeListingType(p)` returns `p.listingType ?? "standard"`, so every
 * object anyone inspects looks right — the detail page renders, the API
 * responds, a debugger shows "standard". A Firestore equality cannot match a
 * document that LACKS the field, and the query is the only copy that decides
 * what a listing page returns. Root Cause #101: a read-side default with no
 * write-side counterpart is a field no query can see.
 *
 * Nothing errors. The listing is simply absent from its own catalogue, which
 * reads as "we don't stock that" rather than as a defect.
 *
 * ── RULES ──────────────────────────────────────────────────────────────────
 *
 *   R1  a product row with no `listingType`, or an empty one
 *   R2  a `listingType` that is not a member of the union — it matches no
 *       filter, no tab and no badge anywhere (Root Cause #33)
 *   R3  a `listingType` that disagrees with the row's own slug prefix
 *
 * R3 calls **`detectListingTypeFromSlug`**, the shipped resolver, rather than
 * re-deriving the prefix rule here. A second implementation of the thing being
 * measured is how `measure-leaf-offenders.mjs` reported a confident zero over a
 * corpus it had read nothing from — the audit must agree with the code by
 * construction, not by care.
 *
 * Strict zero. There is no suppression marker: a product either has a real
 * listing type or it is invisible to the catalogue, and no reason makes the
 * second acceptable.
 *
 * @tag domain:quality
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — pure reads
 */
const DIST = new URL("../node_modules/@mohasinac/appkit/dist/", import.meta.url);
const seed = await import(new URL("seed/index.js", DIST).href);
const registry = await import(
  new URL("_internal/shared/listing-types/_registry.js", DIST).href
);

const { detectListingTypeFromSlug, LISTING_TYPE_REGISTRY } = registry;
if (typeof detectListingTypeFromSlug !== "function") {
  console.error(
    "✗ detectListingTypeFromSlug is not exported from the listing-type registry.\n" +
      "  R3 cannot run without it, and re-deriving the prefix rule here is the\n" +
      "  second-implementation trap this audit's header warns about.",
  );
  process.exit(2);
}

/*
 * The registry's own keys ARE the union — it is declared
 * `Record<ListingType, ListingTypePlugin>`, so a tenth type cannot compile
 * without a key here. `ALL_LISTING_TYPES` (feature-flags.ts) is derived from a
 * sibling `Record<ListingType, true>` and would be equally valid; the registry
 * is already imported for R3, and one import cannot drift from itself.
 */
const VALID = new Set(Object.keys(LISTING_TYPE_REGISTRY ?? {}));
if (VALID.size === 0) {
  console.error(
    "✗ LISTING_TYPE_REGISTRY is empty — refusing to validate against nothing.\n" +
      "  An empty allow-list would pass every row, including a typo'd type,\n" +
      "  which is the failure this audit exists to catch.",
  );
  process.exit(2);
}

/*
 * Enumerated by name, not by a `/^products.*SeedData$/` filter over the barrel:
 * that filter also matches `productFeaturesSeedData`, a different collection
 * whose rows have no `listingType` and never should — 170 false findings, and
 * the kind of noise that teaches people to skip an audit (Root Cause #84, from
 * the other direction).
 *
 * A new product seed file must be added here. That is deliberate: the arrays
 * are what `seed-cli` concatenates, so a file absent from BOTH lists is not
 * seeded at all and has a bigger problem than this audit.
 */
const PRODUCT_ARRAYS = [
  "productsStandardSeedData",
  "productsAuctionsSeedData",
  "productsPreordersSeedData",
  "productsPrizeDrawsSeedData",
  "productsClassifiedsSeedData",
  "productsDigitalCodesSeedData",
  "productsLiveItemsSeedData",
  "productsArtSeedData",
  "productsStickersSeedData",
  "productsSparesSeedData",
  "productsCatalogueSeedData",
];

const findings = [];
let scanned = 0;

for (const key of PRODUCT_ARRAYS) {
  const rows = seed[key];
  if (!Array.isArray(rows)) {
    findings.push({
      rule: "R0",
      where: key,
      message: `seed export \`${key}\` is missing or not an array — nothing was checked`,
    });
    continue;
  }
  for (const row of rows) {
    scanned++;
    const id = String(row?.id ?? "(no id)");
    const type = row?.listingType;

    if (typeof type !== "string" || type.trim() === "") {
      findings.push({
        rule: "R1",
        where: `${key} / ${id}`,
        message:
          "no `listingType`. Invisible to every `where(\"listingType\",…)` query, " +
          "so it never appears in its own catalogue — while rendering normally " +
          "anywhere a normaliser defaults it.",
      });
      continue;
    }

    if (!VALID.has(type)) {
      findings.push({
        rule: "R2",
        where: `${key} / ${id}`,
        message: `\`listingType: "${type}"\` is not a ListingType. Matches no filter, tab or badge.`,
      });
      continue;
    }

    const implied = detectListingTypeFromSlug(id);
    if (implied !== type) {
      findings.push({
        rule: "R3",
        where: `${key} / ${id}`,
        message:
          `slug prefix implies "${implied}" but the row declares "${type}". ` +
          "One of the two is wrong, and every context that infers from the slug " +
          "(guest carts, unauthenticated payloads) will disagree with the document.",
      });
    }
  }
}

if (findings.length === 0) {
  console.log(`OK — ${scanned} seeded products, every one typed and agreeing with its slug`);
  process.exit(0);
}

console.error(`✗ audit-seed-listing-type: ${findings.length} finding(s) over ${scanned} products\n`);
for (const f of findings) {
  console.error(`  [${f.rule}] ${f.where}`);
  console.error(`         ${f.message}`);
}
console.error(
  "\n  Fix at the seed pipeline, not the row: apply every wrapper to the WHOLE\n" +
    "  array after the closing `]`, never to a spread that a later fixture is\n" +
    "  appended after.",
);
process.exit(1);

/**
 * D12 — the panel renders only for listings that ARE the assembly.
 *
 * This exists because the first version did not have the gate, and the only
 * listing in the live catalogue that satisfied the rest of the conditions was
 * an ART POSTER: `art-dranzer-phoenix-poster` files under `category-dranzer-f`
 * (correctly — section 4.4 puts a print beside the bey it depicts), so the one
 * Parts tab in the whole catalogue offered a poster's attack ring.
 */
import admin from "firebase-admin";
import sa from "../firebase-admin-key.json" with { type: "json" };
import { LISTING_TYPE_HAS_COMPOSITION } from "../node_modules/@mohasinac/appkit/dist/features/parts/schemas/firestore.js";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  PASS", m); } else { fail++; console.log("  FAIL", m); } };

console.log("\n=== 1. the map covers the union exactly ===");
const ALL = ["standard","auction","pre-order","prize-draw","classified","digital-code","live","art","stickers"];
ok(Object.keys(LISTING_TYPE_HAS_COMPOSITION).length === ALL.length,
   `9 entries (got ${Object.keys(LISTING_TYPE_HAS_COMPOSITION).length})`);
ok(ALL.every((t) => t in LISTING_TYPE_HAS_COMPOSITION), "every ListingType member is answered");
ok(Object.keys(LISTING_TYPE_HAS_COMPOSITION).every((k) => ALL.includes(k)),
   "CONTROL no DEAD type in the map (Root Cause #61's other direction)");
ok(Object.values(LISTING_TYPE_HAS_COMPOSITION).every((v) => typeof v === "boolean"),
   "every value is a real boolean, so `undefined` cannot read as false by accident");

console.log("\n=== 2. the three exclusions, which are the whole point ===");
for (const t of ["art", "stickers", "digital-code"])
  ok(LISTING_TYPE_HAS_COMPOSITION[t] === false, `${t} is EXCLUDED`);
for (const t of ["standard", "auction", "pre-order", "prize-draw", "classified", "live"])
  ok(LISTING_TYPE_HAS_COMPOSITION[t] === true, `${t} is included`);

console.log("\n=== 3. against the LIVE catalogue ===");
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
const [prods, comps] = await Promise.all([
  db.collection("products").select("categorySlugs", "listingType", "title").get(),
  db.collection("modelComposition").get(),
]);
const byCat = new Set(comps.docs.map((d) => d.data().categoryId).filter(Boolean));
const leafHasComp = prods.docs.filter((d) => byCat.has((d.data().categorySlugs || [])[0]));
const wouldRender = leafHasComp.filter(
  (d) => LISTING_TYPE_HAS_COMPOSITION[d.data().listingType ?? "standard"] === true,
);
console.log(`    products: ${prods.size} | leaf has a composition: ${leafHasComp.length} | gate allows: ${wouldRender.length}`);
leafHasComp.forEach((d) =>
  console.log(`      ${d.id}  type=${d.data().listingType}  ->  ${LISTING_TYPE_HAS_COMPOSITION[d.data().listingType ?? "standard"] ? "PANEL" : "suppressed"}`),
);
ok(leafHasComp.length > 0, "at least one live product's leaf has a composition (else this is untested)");
ok(
  leafHasComp.every(
    (d) => LISTING_TYPE_HAS_COMPOSITION[d.data().listingType ?? "standard"] === true ||
           ["art", "stickers", "digital-code"].includes(d.data().listingType),
  ),
  "every suppressed one is suppressed for a NAMED reason, not by accident",
);
/*
 * 🛑 Stated rather than asserted as a pass: the product-page tab has almost no
 * data to exercise it, because 58 of 70 products file at a NON-leaf (G3a's
 * measurement). That is a FIXTURE gap for B6/E3, not a code gap — the model
 * page's panel works on all 204 leaves that have a composition.
 */
console.log(`\n    NOTE: ${wouldRender.length} live product(s) would render the tab.`);
console.log(`    ${byCat.size} category leaves render the model-page panel.`);

console.log(`\n${fail === 0 ? "all checks passed" : "FAILURES"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

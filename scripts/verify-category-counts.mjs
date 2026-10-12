#!/usr/bin/env node
/**
 * G3b — simulate real product transitions through the REAL `describeCountable`
 * / `countsChanged` / `buildCountPatch` from appkit's built dist, and assert
 * the arithmetic.
 *
 * 🛑 The thing under test is DOUBLE COUNTING, in all four shapes it can take:
 *   1. `own` summed with `total` (total already includes own)
 *   2. a shared ancestor bumped twice for one listing
 *   3. a brand that is also in the chain, bumped twice
 *   4. an update that adds without removing, or removes without adding
 *
 * Run: node scripts/verify-category-counts.mjs
 */
import {
  describeCountable, countsChanged, buildCountPatch,
} from "../appkit/dist/features/categories/repository/category-counts.js";
import {
  sumCounts, liveTotalFor, ownTotalFor, descendantTotalFor, descendantCountsFor,
} from "../appkit/dist/features/categories/schemas/category-counts.js";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log(`  PASS  ${m}`); } else { fail++; console.log(`  FAIL  ${m}`); } };
const flat = (patch) => { const o = {}; for (const [c, f] of patch) for (const [k, v] of f) o[`${c}/${k}`] = v; return o; };

// A real 5-tier chain, leaf first, as `deriveTaxonomy` writes it.
const CHAIN = ["category-dragoon-g","category-original-3layer","category-original-tops","category-beyblade-original","category-spinning-tops"];
const single = { categorySlugs: CHAIN, listingType: "standard", brandSlug: "brand-takara" };

console.log("\n--- a published single moves own ONCE and total once per ancestor ---");
let p = flat(buildCountPatch([{ delta: describeCountable(single), sign: 1 }]));
ok(p["category-dragoon-g/own.standard"] === 1, "own.standard +1 at the leaf only");
ok(CHAIN.every((id) => p[`${id}/total.standard`] === 1), "total.standard +1 at all 5 chain nodes");
ok(Object.keys(p).filter((k) => k.endsWith("own.standard")).length === 2,
   "own moves on exactly 2 rows — the leaf and the brand (a brand is flat)");
ok(p["brand-takara/own.standard"] === 1 && p["brand-takara/total.standard"] === 1,
   "the brand gets own AND total — own===total, so descendants derive to 0");

console.log("\n--- NO DOUBLE COUNT 1: total includes own, so they are never summed ---");
const doc = { own: { standard: 3 }, total: { standard: 10 }, lots: { own: 1, total: 4 } };
ok(liveTotalFor(doc) === 14, "liveTotalFor = total(10) + lots.total(4) = 14, not 3+10");
ok(ownTotalFor(doc) === 4, "ownTotalFor = own(3) + lots.own(1) = 4");
ok(descendantTotalFor(doc) === 10, "descendants = 14 - 4 = 10");
ok(descendantTotalFor(doc) + ownTotalFor(doc) === liveTotalFor(doc),
   "own + descendants === total — the invariant, stated as arithmetic");
const leafDoc = { own: { standard: 5 }, total: { standard: 5 }, lots: { own: 0, total: 0 } };
ok(descendantTotalFor(leafDoc) === 0, "a LEAF has 0 descendants, not 5 (the doubling case)");

console.log("\n--- NO DOUBLE COUNT 2: a shared ancestor, two leaves, one listing ---");
const twoLeaves = { categorySlugs: ["category-a","category-shared","category-root","category-b","category-shared"], listingType: "standard" };
p = flat(buildCountPatch([{ delta: describeCountable(twoLeaves), sign: 1 }]));
ok(p["category-shared/total.standard"] === 1, "the repeated ancestor is bumped ONCE, not twice");

console.log("\n--- NO DOUBLE COUNT 3: a brand already in the chain is not bumped again ---");
const brandInChain = { categorySlugs: ["brand-takara","category-root"], listingType: "standard", brandSlug: "brand-takara" };
const d3 = describeCountable(brandInChain);
ok(d3.brand === null, "describeCountable drops a brand the chain already covers");
p = flat(buildCountPatch([{ delta: d3, sign: 1 }]));
ok(p["brand-takara/total.standard"] === 1, "it lands once");
ok(p["brand-takara/own.standard"] === 1, "and own once");

console.log("\n--- NO DOUBLE COUNT 4: an update is a removal PLUS an addition ---");
const moved = { ...single, categorySlugs: ["category-dranzer-s", ...CHAIN.slice(1)] };
p = flat(buildCountPatch([
  { delta: describeCountable(single), sign: -1 },
  { delta: describeCountable(moved), sign: 1 },
]));
ok(p["category-dragoon-g/own.standard"] === -1, "the old leaf's own -1");
ok(p["category-dranzer-s/own.standard"] === 1, "the new leaf's own +1");
ok(!("category-original-3layer/total.standard" in p),
   "a SHARED ancestor nets to zero and is NOT written (no increment(0) spam)");
ok(!("brand-takara/own.standard" in p), "the unchanged brand nets to zero too");

console.log("\n--- a LOT is counted separately from singles ---");
const lot = { categorySlugs: CHAIN.slice(1), listingType: "standard", isLot: true };
p = flat(buildCountPatch([{ delta: describeCountable(lot), sign: 1 }]));
ok(p["category-original-3layer/lots.own"] === 1, "lots.own at its non-leaf");
ok(!("category-original-3layer/own.standard" in p),
   "and NOT own.standard — a lot never inflates the singles count");

console.log("\n--- the status-transition guard: the bug the plan predicted ---");
const asDelta = (row, countsNow) => ({ delta: describeCountable(row), countsNow });
ok(countsChanged(asDelta(single, false), asDelta(single, true)),
   "draft -> published is a CHANGE even though categorySlugs is identical");
ok(countsChanged(asDelta(single, true), asDelta(single, false)), "published -> archived likewise");
ok(!countsChanged(asDelta(single, true), asDelta(single, true)),
   "NEGATIVE CONTROL: an unrelated edit (same chain, still available) moves nothing");
ok(!countsChanged(asDelta(single, false), asDelta(single, false)),
   "NEGATIVE CONTROL: a draft edited while still a draft moves nothing");
ok(countsChanged(asDelta(single, true), asDelta({ ...single, isLot: true }, true)),
   "flipping isLot is a change — it moves the count between two different fields");
ok(countsChanged(asDelta(single, true), asDelta({ ...single, brandSlug: "brand-hasbro" }, true)),
   "re-branding is a change");

console.log("\n--- degenerate rows contribute nothing rather than crashing ---");
ok(describeCountable({}) === null, "no category at all -> null");
ok(describeCountable({ categorySlugs: [] }) === null, "an empty chain -> null");
ok(describeCountable({ category: "category-x" })?.leaf === "category-x",
   "the @deprecated scalar still works, matching tallyProduct's own fallback");
ok(buildCountPatch([{ delta: null, sign: 1 }]).size === 0, "a null delta writes nothing");
ok(sumCounts(undefined) === 0 && liveTotalFor(null) === undefined,
   "sumCounts(undefined) is 0 but liveTotalFor(null) is UNDEFINED — unknown is not zero");
ok(descendantCountsFor({ own: { standard: 5 }, total: { standard: 5 } })?.standard === undefined,
   "a zero descendant split omits the key rather than storing 0");
ok(descendantTotalFor({ own: { standard: 9 }, total: { standard: 2 }, lots: { own: 0, total: 0 } }) === 0,
   "drift clamps at 0 — never '-7 in subcategories' to a visitor");

console.log(`\n${fail === 0 ? "all checks passed" : `${fail} FAILED`}  (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);

#!/usr/bin/env node
/**
 * D4b — the breadcrumb chain, against the REAL builders and REAL production
 * shapes. Six requirements; the plan recorded only the first as done.
 *
 * Run: node scripts/verify-breadcrumb-chain.mjs
 */
import {
  categoryCrumbs, productCrumbs, withTrailHead,
  collapseTrail, alternateAssignments, TRAIL_COLLAPSE_THRESHOLD,
} from "../appkit/dist/features/categories/utils/breadcrumb-chain.js";
import { breadcrumbJsonLd } from "../appkit/dist/seo/json-ld.js";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log(`  PASS  ${m}`); } else { fail++; console.log(`  FAIL  ${m}`); } };
const HEAD = [{ name: "Home", url: "/" }, { name: "Categories", url: "/categories" }];
const href = (id) => `/categories/${id}`;

// The real deepest live node, measured 2026-10-12.
const DEEP = {
  name: "Ace Dragon Sting Charge Zan",
  url: "/categories/category-ace-dragon-sting-charge-zan",
  ancestors: [
    { id: "category-burst-gt", name: "GT", tier: 3 },
    { id: "category-spinning-tops", name: "Spinning Tops", tier: 0 },
    { id: "category-burst-tops", name: "Burst Tops", tier: 2 },
    { id: "category-beyblade-burst", name: "Beyblade Burst", tier: 1 },
  ], // deliberately SHUFFLED — stored order must not be trusted
  hrefFor: href,
};

console.log("\n--- REQ 1: ordered root -> leaf, never stored order ---");
let c = withTrailHead(categoryCrumbs(DEEP), HEAD);
ok(c.map((x) => x.name).join(" > ") ===
   "Home > Categories > Spinning Tops > Beyblade Burst > Burst Tops > GT > Ace Dragon Sting Charge Zan",
   "a SHUFFLED ancestors[] still renders root->leaf");

console.log("\n--- REQ 5: depth at tier 4 is SEVEN crumbs ---");
ok(c.length === 7, `7 crumbs, got ${c.length} — matches the measured production chain`);

console.log("\n--- REQ 3: a ROOT still emits a valid chain ---");
const root = withTrailHead(categoryCrumbs({ name: "Spinning Tops", url: "/categories/category-spinning-tops", ancestors: [], hrefFor: href }), HEAD);
ok(root.length === 3, "Home > Categories > Root = 3 crumbs, not a one-item list");
ok(root[2].name === "Spinning Tops", "the root is the final crumb");
ok(!root.some((x) => x.name === ""), "no empty crumb where an ancestor would be");
const noAnc = withTrailHead(categoryCrumbs({ name: "X", url: "/x", ancestors: undefined, hrefFor: href }), HEAD);
ok(noAnc.length === 3, "a MISSING ancestors[] behaves like an empty one (39 of 416 live rows are tier 0)");

console.log("\n--- REQ 6: a broken ancestor is OMITTED, never a gap ---");
const broken = withTrailHead(categoryCrumbs({
  name: "Leaf", url: "/leaf", hrefFor: href,
  ancestors: [
    { id: "category-root", name: "Root", tier: 0 },
    { id: "category-missing", name: null, tier: 1 },   // no name
    { id: null, name: "Nameless", tier: 2 },            // no id
    { id: "category-line", name: "Line", tier: 3 },
  ],
}), HEAD);
ok(broken.map((x) => x.name).join(" > ") === "Home > Categories > Root > Line > Leaf",
   "the two unusable ancestors are dropped, the chain still reads correctly");
ok(!broken.some((x) => x.name === "" || x.name == null), "no blank crumb survives");
ok(!broken.some((x) => x.url === "/categories/null"), "and no /categories/null link");

console.log("\n--- the last crumb is NOT a self-link ---");
ok(c[c.length - 1].url === undefined, "final crumb has no url");
ok(c.slice(0, -1).every((x) => !!x.url), "every other crumb does");

console.log("\n--- it survives breadcrumbJsonLd, which REQUIRED a url until now ---");
/*
 * 🛑 Wrapped, because the pre-fix failure mode is a THROW, not a wrong value:
 * `item.url.startsWith(...)` on a urlless final crumb is a TypeError that
 * would have taken down every category, brand and product page. An unwrapped
 * call aborts this script, and an aborted script prints no FAIL line — which
 * is indistinguishable from a pass to anything counting them.
 */
let ld = null, ldThrew = null;
try { ld = breadcrumbJsonLd(c); } catch (err) { ldThrew = err; }
ok(ldThrew === null, `breadcrumbJsonLd accepts a urlless final crumb${ldThrew ? ` - threw: ${ldThrew.message}` : ""}`);
if (!ld) { console.log(`
${fail} FAILED - cannot continue`); process.exit(1); }
ok(ld.itemListElement.length === 7, "7 ListItems");
ok(ld.itemListElement[6].item === undefined, "the last ListItem OMITS `item` rather than emitting \"\"");
ok(String(ld.itemListElement[2].item).endsWith("/categories/category-spinning-tops"),
   "an interior item is an absolute URL");
ok(ld.itemListElement.every((x, i) => x.position === i + 1), "positions are 1..7 in order");

console.log("\n--- REQ 4 + the product chain: stored LEAF-FIRST, reversed once ---");
// The real stored shape, measured on art-dranzer-phoenix-poster.
const prod = productCrumbs({
  categorySlugs: ["category-dranzer-f","category-original-spin-gear","category-original-tops","category-beyblade-original","category-spinning-tops"],
  categoryNames: ["Dranzer F","Spin Gear System","Original Tops","Beyblade Original","Spinning Tops"],
  hrefFor: href,
});
ok(prod.map((x) => x.name).join(" > ") === "Spinning Tops > Beyblade Original > Original Tops > Spin Gear System > Dranzer F",
   "reversed to root->leaf (stored order would have read backwards)");
const pc = withTrailHead([...prod, { name: "Dranzer Phoenix Poster", url: "/products/x" }],
                         [{ name: "Home", url: "/" }, { name: "Products", url: "/products" }]);
ok(pc.length === 8, `a product at a tier-4 leaf gets 8 crumbs, got ${pc.length} — the flat version emitted 3`);

console.log("\n--- REQ 4: a LOT at a non-leaf is SHORTER and is not padded ---");
const lot = withTrailHead([
  ...productCrumbs({
    categorySlugs: ["category-burst-tops","category-beyblade-burst","category-spinning-tops"],
    categoryNames: ["Burst Tops","Beyblade Burst","Spinning Tops"],
    hrefFor: href,
  }),
  { name: "Job lot of 12 assorted Burst beys", url: "/products/lot" },
], [{ name: "Home", url: "/" }, { name: "Products", url: "/products" }]);
ok(lot.length === 6, "6 crumbs, not 8 — genuinely shorter");
ok(lot[4].name === "Burst Tops", "the last CATEGORY crumb is the non-leaf it is filed under");
ok(!lot.some((x) => /dragoon|dranzer|specific/i.test(x.name)),
   "no fabricated leaf — padding one would claim the lot is a single model");

console.log("\n--- parallel arrays that DISAGREE must not mislabel ---");
const mismatch = productCrumbs({
  categorySlugs: ["category-a","category-b","category-c"],
  categoryNames: ["A"],     // only one name for three slugs
  hrefFor: href,
});
/*
 * 🛑 CORRECTED after a negative control: `Math.min(slugs.length, names.length)`
 * is NOT what protects this. Removing it changes nothing, because the
 * per-element `if (!slug || !name) continue` already drops a slug with no
 * name — so this assertion held for two independent reasons and proved only
 * one. Removing the GUARD is what breaks it.
 *
 * `Math.min` stays as the clearer statement of intent and as defence in depth;
 * the guard is the mechanism.
 */
ok(mismatch.length === 1 && mismatch[0].name === "A" && mismatch[0].url === "/categories/category-a",
   "a slug with no name is dropped - never paired with another index's name (the GUARD, not Math.min)");
ok(productCrumbs({ categorySlugs: ["category-a"], categoryNames: [""], hrefFor: href }).length === 0,
   "an empty name is dropped rather than rendered as a raw id");
ok(productCrumbs({}).length === 0, "no chain at all -> no crumbs, no crash");

console.log("\n--- NEGATIVE CONTROL: the surfaces must AGREE ---");
// The same category rendered through the category-page path and through a
// product filed directly under it must produce the same interior chain.
const viaCategory = categoryCrumbs({ name: "GT", url: "/categories/category-burst-gt", hrefFor: href,
  ancestors: [
    { id: "category-spinning-tops", name: "Spinning Tops", tier: 0 },
    { id: "category-beyblade-burst", name: "Beyblade Burst", tier: 1 },
    { id: "category-burst-tops", name: "Burst Tops", tier: 2 },
  ] }).map((x) => x.name).join(" > ");
const viaProduct = productCrumbs({
  categorySlugs: ["category-burst-gt","category-burst-tops","category-beyblade-burst","category-spinning-tops"],
  categoryNames: ["GT","Burst Tops","Beyblade Burst","Spinning Tops"],
  hrefFor: href,
}).map((x) => x.name).join(" > ");
ok(viaCategory === viaProduct,
   `both paths produce the same chain — "${viaCategory}"`);


console.log("\n--- I5b: a MULTI-ASSIGNMENT closure still yields the default trail ---");
/* The closure is [default chain ..., franchise chain ...] while categoryNames is
 * the default chain ONLY. productCrumbs pairs by index, and min() clamps to the
 * shorter array — so the indices line up exactly. Correct BY CONSTRUCTION, and
 * fragile-looking, which is why it is asserted: a future "fix" to the pairing,
 * or making the closure a set, must fail here rather than silently relabel a
 * hierarchy. */
const MULTI = productCrumbs({
  categorySlugs: [
    "category-dragoon-g", "category-g-revolution", "category-original-tops",
    "category-beyblade-original", "category-spinning-tops",
    "category-beyblade", "category-franchises",
  ],
  categoryNames: ["Dragoon G", "G Revolution", "Original Tops", "Beyblade Original", "Spinning Tops"],
  hrefFor: (s) => `/categories/${s}`,
});
ok(MULTI.length === 5, "5 crumbs from a 7-entry closure - the default chain only");
ok(MULTI[0].name === "Spinning Tops" && MULTI[4].name === "Dragoon G",
   "root-first, leaf-last - the default chain, not the franchise one");
ok(!MULTI.some((c) => c.name === "Beyblade"),
   "CONTROL the franchise chain is NOT mixed into the visible trail");

console.log("\n--- I5b: ONE row of crumbs - the middle collapses ---");
const I5B_SHORT = [{ name: "Home", url: "/" }, { name: "Categories", url: "/categories" }, { name: "Dragoon G" }];
const shortSplit = collapseTrail(I5B_SHORT);
ok(shortSplit.collapsed.length === 0 && shortSplit.lead.length === 3,
   "a short trail is not collapsed at all");
ok(shortSplit.tail.length === 0, "...and needs no tail split");

const I5B_DEEP = withTrailHead(MULTI, [{ name: "Home", url: "/" }, { name: "Categories", url: "/categories" }]);
ok(I5B_DEEP.length === 7, "a tier-4 leaf really is 7 crumbs - this is the 390px problem");
const deepSplit = collapseTrail(I5B_DEEP);
ok(deepSplit.lead.length === 1 && deepSplit.lead[0].name === "Home",
   "Home is never collapsed - it is the only guaranteed exit");
ok(deepSplit.tail.length === 2 && deepSplit.tail[1].name === "Dragoon G",
   "the last two survive - the parent you click, and the page you are on");
ok(deepSplit.collapsed.length === 4, "the middle 4 go behind the dropdown");
ok(deepSplit.lead.length + deepSplit.collapsed.length + deepSplit.tail.length === I5B_DEEP.length,
   "nothing is LOST - collapsing is presentation, and the JSON-LD still gets all 7");
ok(TRAIL_COLLAPSE_THRESHOLD === 5, "the threshold is a named constant, not a literal");

console.log("\n--- I5b: the alternate-assignment crumb ---");
const i5bHref = (s) => `/categories/${s}`;
ok(alternateAssignments({ categoryIds: ["a"], categoryIdNames: ["A"], hrefFor: i5bHref }).mode === "none",
   "ONE assignment -> no extra crumb at all (the overwhelming majority, and no layout shift)");
const two = alternateAssignments({
  categoryIds: ["category-dragoon-g", "category-beyblade"],
  categoryIdNames: ["Dragoon G", "Beyblade"], hrefFor: i5bHref,
});
ok(two.mode === "inline" && two.items.length === 1,
   "2 assignments -> ONE inline alternate (the default is already the trail's last crumb)");
ok(two.items[0].name === "Beyblade" && two.items[0].url === "/categories/category-beyblade",
   "...carrying a REAL url - a crawler does not open menus");
const four = alternateAssignments({
  categoryIds: ["d", "b", "c", "e"], categoryIdNames: ["D", "B", "C", "E"], hrefFor: i5bHref,
});
ok(four.mode === "dropdown" && four.items.length === 3,
   "4 assignments -> 3 alternates -> dropdown (>2 is the user's rule)");
ok(alternateAssignments({ categoryIds: ["a", "b"], categoryIdNames: ["A"], hrefFor: i5bHref }).mode === "none",
   "a name-less alternate is DROPPED, never shown as its raw id");

console.log(`\n${fail === 0 ? "all checks passed" : `${fail} FAILED`}  (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);

/**
 * Batch 3 — the four things that EXISTED and nothing called.
 *
 * 🛑 This is the hardest class to see, because the four conditions of "shipped"
 * come apart silently: the route is mounted, the component compiles, the
 * generator ran, the matcher is correct — and no page renders any of it. Every
 * item below was condition 1 of 4.
 *
 *   I5b  `BreadcrumbTrail` had NO render site. Both pages hand-rolled a `<Nav>`,
 *        and the product one showed three crumbs while its own JSON-LD carried
 *        eight. `alternates=` had zero callers and `alt.mode` was computed and
 *        never branched on.
 *   D4   `contentBody` — the field this plan measured as the SEO leader's actual
 *        ranking mechanism — was authorable, storable and had no render site.
 *   I7   745 generated bodies were imported by nobody: dead weight in the repo,
 *        absent from Firestore, unreadable by the page that renders them.
 *   D13  the (part, colourway) matcher had one caller: its own verify script.
 *        No rollup answered "what can I build".
 *
 * Run: node scripts/verify-render-wiring.mjs
 *
 * @tag domain:quality
 * @tag layer:script
 * @tag access:node-only
 */
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
globalThis.require = createRequire(import.meta.url);

const { collapseTrail, alternateAssignments, withTrailHead, productCrumbs, TRAIL_COLLAPSE_THRESHOLD } =
  await import("@mohasinac/appkit/features/categories/utils/breadcrumb-chain");
const { matchSlotToHoldings, normaliseColourway } = await import(
  "@mohasinac/appkit/features/parts/utils/colourway-match"
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

console.log("\n=== I5b — one trail component, two pages, one chain ===");
{
  const trail = read("appkit/src/features/categories/components/BreadcrumbTrail.tsx");
  const catPage = read("appkit/src/features/categories/components/CategoryDetailPageView.tsx");
  const prodPage = read("appkit/src/features/products/components/ProductDetailPageView.tsx");
  const ctx = read("appkit/src/features/categories/components/ContextualTrail.tsx");
  const beacon = read("appkit/src/features/categories/components/LastCategoryBeacon.tsx");

  ok(/<BreadcrumbTrail\b/.test(catPage), "the CATEGORY page renders BreadcrumbTrail (it had no render site at all)");
  ok(/<ContextualTrail\b/.test(prodPage), "the PRODUCT page renders the trail through ContextualTrail");
  ok(
    /const ldBreadcrumb = breadcrumbJsonLd\(trail\);/.test(catPage) && /crumbs=\{trail\}/.test(catPage),
    "🛑 ONE array: the markup serialises the same `trail` the visible crumbs render",
  );
  ok(
    /productCrumbs\(\{/.test(prodPage) && /withTrailHead\(/.test(prodPage),
    "the product page builds its visible chain with the SAME builder its route uses for JSON-LD",
  );
  ok(!/Home\s*<\/Link>/.test(prodPage), "the hand-rolled three-crumb `<Nav>` is gone from the product page");
  ok(/alternates=\{\{ ids: categoryIds, names: categoryIdNames \}\}/.test(prodPage), "`alternates=` finally has a caller");
  ok(/alt\.mode === "dropdown"/.test(trail) && /alt\.mode === "inline"/.test(trail), "both alternate modes are branched on (the dropdown mode was computed and ignored)");
  ok(/<Details/.test(trail) && /<Summary/.test(trail), "🛑 collapse + alternates use native `<details>` — real `<a>` in the server DOM, which a crawler reads without opening anything");
  ok(/storageManager\.get<string>\(LAST_CATEGORY_KEY/.test(ctx), "the contextual swap reads sessionStorage through the shared StorageManager (no second copy of the storage-may-throw logic)");
  ok(/storageManager\.set\(LAST_CATEGORY_KEY/.test(beacon), "...and the category page writes it");
  ok(/if \(!multi\) return;/.test(ctx), "🛑 suppressed entirely for a single assignment — no post-hydration shift on the common row");
  ok(/if \(match > 0\) setIndex\(match\)/.test(ctx), "...and it only swaps to a trail the listing is REALLY filed under");

  /* Behaviour: the collapse arithmetic, including the 8-crumb case. */
  const deep = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
    { name: "Spinning Tops", url: "/categories/a" },
    { name: "Beyblade Metal", url: "/categories/b" },
    { name: "Metal Parts", url: "/categories/c" },
    { name: "Performance Tips", url: "/categories/d" },
    { name: "Rubber Flat", url: "/categories/e" },
    { name: "RF tip, mint" },
  ];
  const split = collapseTrail(deep);
  ok(split.lead.length === 1 && split.tail.length === 2, "an 8-crumb trail renders as 1 + dropdown + 2");
  ok(split.collapsed.length === 5, "...with 5 levels behind the dropdown");
  ok(split.collapsed.every((c) => !!c.url), "🛑 every collapsed crumb keeps its URL — the old version rendered `… 5 more` as plain text, naming what it hid and offering no way to reach it");

  const shallow = [{ name: "Home", url: "/" }, { name: "Products", url: "/products" }, { name: "A thing" }];
  ok(collapseTrail(shallow).collapsed.length === 0, `CONTROL: a trail at or under the threshold (${TRAIL_COLLAPSE_THRESHOLD}) is not collapsed at all`);

  const one = alternateAssignments({ categoryIds: ["a"], categoryIdNames: ["A"], hrefFor: (s) => `/c/${s}` });
  ok(one.mode === "none", "CONTROL: a single assignment produces NO alternates crumb");
  const two = alternateAssignments({ categoryIds: ["a", "b", "c"], categoryIdNames: ["A", "B", "C"], hrefFor: (s) => `/c/${s}` });
  ok(two.mode === "inline" && two.items.length === 2, "two alternates render inline");
  const four = alternateAssignments({ categoryIds: ["a", "b", "c", "d"], categoryIdNames: ["A", "B", "C", "D"], hrefFor: (s) => `/c/${s}` });
  ok(four.mode === "dropdown", "three alternates open a dropdown");

  const last = withTrailHead(productCrumbs({ categorySlugs: ["leaf", "root"], categoryNames: ["Leaf", "Root"], hrefFor: (s) => `/c/${s}` }), [{ name: "Home", url: "/" }]);
  ok(last[last.length - 1] && !last[last.length - 1].url, "the final crumb carries no URL — it is the page you are on");
}

console.log("\n=== D4 / I7 — the category body renders, and the corpus is seeded ===");
{
  const page = read("appkit/src/features/categories/components/CategoryDetailPageView.tsx");
  const seed = read("appkit/src/seed/categories-seed-data.ts");
  ok(/<RichTextRenderer html=\{contentBody\} \/>/.test(page), "`contentBody` has a render site (it had none, while its own docstring claimed one)");
  ok(/categoryDoc\?\.contentBody/.test(page), "🛑 read off the DOCUMENT, not the CategoryItem cast — the list projection keeps it private for a 180 KB reason");
  ok(/contentBody && contentBody\.trim\(\)\.length > 0/.test(page), "omitted when empty — an empty prose block reads as a broken page");
  ok(/GENERATED_CATEGORY_CONTENT\[row\.id\]/.test(seed), "the 745 generated bodies are attached to seed rows (they were imported by nobody)");
  ok(/if \(typeof row\.contentBody === "string" && row\.contentBody\.trim\(\)\.length > 0\) return row;/.test(seed), "🛑 a HAND-AUTHORED body wins — composing over authored prose would be a silent downgrade");
  ok(/generatedApplied < Math\.floor\(GENERATED_CATEGORY_CONTENT_COUNT \* 0\.9\)/.test(seed), "a module-load assertion fails if the corpus key space drifts (otherwise: 745 exported, 0 applied, load reports success)");
}

console.log("\n=== D13 / I9 — the buildable rollup, and the MB control both ways ===");
{
  const roll = read("appkit/src/_internal/server/features/parts/buildable.ts");
  const route = read("src/app/api/store/parts/buildable/route.ts");
  const rollup = read("appkit/src/_internal/server/jobs/core/priceIndexRollup.ts");
  const band = read("appkit/src/features/categories/repository/price-index.repository.ts");

  ok(/export async function listBuildableModels/.test(roll), "the rollup exists");
  ok(/matchSlotToHoldings\(/.test(roll), "...and it goes through the (part, colourway) matcher rather than comparing ids itself");
  ok(/buildable: Math\.min\(\.\.\.matched\.map\(\(m\) => m\.buildable\)\)/.test(roll), "🛑 complete units = the MINIMUM across slots — a bey missing one tip is not 80% of a bey");
  ok(/availableQuantity/.test(roll) && !/stockQuantity/.test(roll), "🛑 gates on availableQuantity, never stockQuantity — 10 in stock with 3 reserved is SEVEN assemblable");
  ok(/truncated: true/.test(roll), "a failure returns truncated:true, so a caller says 'we could not work this out' rather than 'you can build nothing'");
  ok(/roles: \[\.\.\.ROLES_STORE_WRITE\]/.test(route) && !/permission:/.test(route), "the route gates on roles alone — a permission beside a seller role array locks out sellers");
  ok(/findByOwnerId\(user!\.uid\)/.test(route), "the store is resolved server-side, never from a client-supplied id");

  ok(/byColourway\?: Record<string, PriceIndexConditionBand>/.test(band), "`byColourway` is declared on the band");
  ok(/normaliseColourway\(s\.colourway\)/.test(rollup), "the rollup buckets on the NORMALISED colourway, so one colour typed three ways is one bucket");
  ok(/item\.colourway \?\? \(item\.productId \? colourwayOf\.get/.test(rollup), "🛑 snapshot first, product-map second — reading the CURRENT colourway would re-file an old sale under a value the seller changed later");

  /* 🛑 THE CONTROL THE PLAN NAMES: hold only the black MB and the answer must invert. */
  const L_DRAGO = { partId: "performance-tip--mb", expectedColourway: "silver" };
  const ZURAFA = { partId: "performance-tip--mb", expectedColourway: "transparent black" };
  const black = { productId: "p-black", partGlossaryId: "performance-tip--mb", colourway: "Transparent Black", availableQuantity: 4 };
  const silver = { productId: "p-silver", partGlossaryId: "performance-tip--mb", colourway: "Silver", availableQuantity: 1 };

  ok(matchSlotToHoldings(ZURAFA, [black]).buildable === 4, "holding only the BLACK MB: Poison Zurafa is buildable");
  ok(matchSlotToHoldings(L_DRAGO, [black]).buildable === 0, "🛑 ...and L-Drago Guardian is NOT — matching on the code alone is the defect this exists to prevent");
  ok(matchSlotToHoldings(L_DRAGO, [silver]).buildable === 1, "holding only the SILVER one inverts the answer");
  ok(matchSlotToHoldings(ZURAFA, [silver]).buildable === 0, "...both ways round");
  ok(normaliseColourway("  Transparent   Black ") === "transparent-black", "the normaliser folds case and spacing, so a bucket key and a build match agree");
}

console.log("\n=== D10 — a user can report a PAGE, and a row can say what it was about ===");
{
  const reports = read("appkit/src/features/store-extensions/schemas/firestore.ts");
  const errors = read("appkit/src/features/server-errors/schemas/firestore.ts");
  ok(/\| "page";/.test(reports) && /page: true,/.test(reports), "`page` is in the report enum AND its Record<Union,true> map (an array literal would catch neither mistake)");
  ok(/entityType\?: "page" \| "product"/.test(errors), "`serverErrors` can say what a failure was about");
  ok(/Absent means UNKNOWN, never "not a page"/.test(errors), "🛑 and it documents that a filter must treat a missing value as INCLUDED — otherwise every pre-existing row disappears");
  ok(/ENTITY_TYPE: "entityType"/.test(errors), "the field-name constant is declared, so no query hand-writes the string");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

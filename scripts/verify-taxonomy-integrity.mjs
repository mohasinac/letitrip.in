/**
 * Batch 1 — the three taxonomy-integrity fixes, each with the control that
 * tells a working fix apart from a plausible 200.
 *
 * 🛑 WHY A SCRIPT AND NOT A READING. All three defects return success:
 *
 *   1. A `categoryIds`-only update skipped `deriveTaxonomy` because the field
 *      was absent from `TAXONOMY_KEYS`, so the closure, the `category` mirror
 *      and `categoryNames` were never re-derived and `syncCategoryCounts`
 *      compared a document to itself. The write returned 200 and the product's
 *      own category pages did not change.
 *   2. Category delete wrote `{ category: parentId }` and left the deleted id
 *      in `categoryIds` — which `readAssignments` PREFERS — so the id was
 *      re-resolved and written straight back into the closure, pointing at a
 *      page that stopped existing one line later.
 *   3. `buildScopedQuery` gates the category clause on there being no search
 *      term, and its comment has always said "the category is refined by the
 *      caller". No caller did. So searching inside a category returned matches
 *      from the WHOLE catalogue — a populated, plausible, wrong grid.
 *
 * Run: node scripts/verify-taxonomy-integrity.mjs
 *
 * @tag domain:categories
 * @tag layer:script
 * @tag access:node-only
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
globalThis.require = createRequire(import.meta.url);

const { refineSearchTxt, planSearchTxt, SEARCH_REFINE_WINDOW } = await import(
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

const read = (p) => readFileSync(p, "utf8");
const REPO = read("appkit/src/features/products/repository/products.repository.ts");
const DELETE_ROUTE = read("src/app/api/admin/categories/[id]/route.ts");
const COUNTS = read("appkit/src/features/categories/repository/category-counts.ts");

/* ── 1. categoryIds re-derives ─────────────────────────────────────────────
 *
 * Static, because the derivation runs inside a Firestore write path. What is
 * checkable without a database is that the field NAMES the funnel — which is
 * the entire defect: everything downstream was already correct.
 */
console.log("\n=== 1. a categoryIds-only write re-derives the taxonomy ===");
{
  const keys = REPO.match(/TAXONOMY_KEYS = \[([\s\S]*?)\] as const;/);
  ok(!!keys, "TAXONOMY_KEYS is still an explicit list (not a derived union)");
  const list = keys ? keys[1] : "";
  ok(/"categoryIds"/.test(list), "🛑 categoryIds is in TAXONOMY_KEYS — the write re-derives");
  ok(/"categorySlugs"/.test(list) && /"category"/.test(list), "...and the two it already had are untouched");
  ok(
    /categoryIds\?: string\[\] \| null;/.test(COUNTS),
    "the counter reads categoryIds, so a changed assignment moves `own`",
  );
  // The guard that decides whether counts move at all must compare the
  // assignment list element-wise; a length-only compare would miss a swap of
  // one assignment for another, which is the commonest edit.
  ok(
    /b\.owns\.some\(\(id, i\) => id !== a\.owns\[i\]\)/.test(COUNTS),
    "countsChanged compares `owns` element-wise, so swapping one assignment for another is detected",
  );
}

/* ── 2. delete prunes the id ──────────────────────────────────────────────── */
console.log("\n=== 2. delete removes the id from categoryIds, keeping the others ===");
{
  ok(
    /const kept = assigned\.filter\(\(cid\) => cid !== id\);/.test(DELETE_ROUTE),
    "🛑 the deleted id is filtered OUT of the assignment list",
  );
  ok(
    /kept\.length > 0[\s\S]{0,400}?productRepository\.update\(product\.id, \{ categoryIds: next \}\)/.test(
      DELETE_ROUTE,
    ),
    "a product with other assignments keeps them (writes categoryIds, not just the scalar)",
  );
  ok(
    /parentId && !kept\.includes\(parentId\)/.test(DELETE_ROUTE),
    "...and the cascade to the parent is deduped rather than added twice",
  );
  ok(
    /categoryIds: \[\],\s*\n\s*category: "",\s*\n\s*categorySlugs: \[\],\s*\n\s*categoryNames: \[\],/.test(
      DELETE_ROUTE,
    ),
    "a root delete clears categoryIds TOO — otherwise the dead id is re-resolved on the next write",
  );
  ok(
    /assigned\.length > 0 \? \{ categoryIds: \[parentId\] \} : \{ category: parentId \}/.test(DELETE_ROUTE),
    "a pre-I1 row with no categoryIds does not gain the field (it keeps the old behaviour)",
  );
  ok(
    /findByAssignment\(id\)/.test(DELETE_ROUTE),
    "the products are found by ASSIGNMENT, so a second-category product is in scope at all",
  );
}

/* ── 3. search + category coexist ─────────────────────────────────────────── */
console.log("\n=== 3. the category filter survives a search ===");
{
  ok(
    /const needsCategoryRefine = plan\.head !== null && categoriesIn\.length > 0;/.test(REPO),
    "the refine is armed exactly when the search clause displaced the category clause",
  );
  ok(
    /const isMultiTerm = plan\.rest\.length > 0 \|\| needsCategoryRefine;/.test(REPO),
    "...and it rides the SAME bounded window, so there is one pagination implementation",
  );
  ok(
    /\(row\.categorySlugs \?\? \[\]\)\.some\(\(slug\) => wanted\.has\(slug\)\)/.test(REPO),
    "🛑 matched against the CLOSURE, so a category page's own id still matches its whole subtree",
  );

  /* The behavioural half — the helper that now carries the extra condition. */
  const rows = [
    { id: "a", searchTxt: ["dragoon", "g"], categorySlugs: ["category-dragoon-g", "category-spinning-tops"] },
    { id: "b", searchTxt: ["dragoon", "f"], categorySlugs: ["category-dragoon-f", "category-spinning-tops"] },
    { id: "c", searchTxt: ["dranzer"], categorySlugs: ["category-dranzer-s", "category-spinning-tops"] },
  ];
  const result = { items: rows, total: 3, page: 1, pageSize: 20, totalPages: 1, hasMore: false };
  const opts = (also) => ({ page: 1, pageSize: 20, windowSaturated: false, also });

  const inLeaf = refineSearchTxt(result, [], opts((r) => r.categorySlugs.includes("category-dragoon-g")));
  ok(inLeaf.items.length === 1 && inLeaf.items[0].id === "a", "a single-term search inside one leaf returns only that leaf's row");
  ok(inLeaf.total === 1, "...and `total` is the refined count, not the pre-filter one");

  const unscoped = refineSearchTxt(result, [], opts(undefined));
  ok(unscoped.items.length === 3, "CONTROL: with no predicate the same window is unfiltered — the refine is what narrows it");

  const bothTerms = refineSearchTxt(result, ["g"], opts((r) => r.categorySlugs.includes("category-spinning-tops")));
  ok(bothTerms.items.length === 1 && bothTerms.items[0].id === "a", "the term refine and the category refine AND together");

  const nonsense = refineSearchTxt(result, ["zzzznope"], opts((r) => r.categorySlugs.includes("category-spinning-tops")));
  ok(nonsense.items.length === 0, "🛑 NONSENSE CONTROL: a term nothing carries returns 0, not the category's whole grid");

  const emptyPlan = planSearchTxt("!!!");
  ok(emptyPlan.empty === true, "CONTROL: a query that normalises to no token is `empty`, and list() returns nothing for it");

  const saturated = refineSearchTxt(
    { ...result, items: rows },
    [],
    { page: 1, pageSize: 2, windowSaturated: true, also: () => true },
  );
  ok(saturated.truncated === true && saturated.totalPages >= 2, "a saturated window reports `truncated` and offers another page rather than a false last one");
  ok(typeof SEARCH_REFINE_WINDOW === "number" && SEARCH_REFINE_WINDOW <= 250, "the window stays bounded (Rule #6)");
}

/* ── 4. the dead index is gone ─────────────────────────────────────────────── */
console.log("\n=== 4. the deleted copilot feature leaves no index behind ===");
{
  const base = read("appkit/firebase/base/firestore.indexes.json");
  const root = read("firestore.indexes.json");
  ok(!base.includes("copilotLogs"), "no copilotLogs index in the base config");
  ok(!root.includes("copilotLogs"), "...nor in the generated root config (regenerate + commit BOTH)");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

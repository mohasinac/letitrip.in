#!/usr/bin/env node
/**
 * THE FLIP's measurement. Run this before touching `ENFORCE_LEAF_FILING`.
 *
 * 🛑 A hand count is not the measurement, and this is why the script exists:
 * one earlier pass said "58 of 70", a later one said "70 of 71", and the rule
 * had meanwhile been scoped so that 31 of those are listing types it does not
 * apply to at all. Three different numbers for one question, none of them
 * produced by running the rule.
 *
 * So this runs the REAL predicate — `findLeafRuleOffenders`, the same function
 * `assignCategories` calls — over every product in the seed, against the leaf
 * flags `buildCategoryTree` derives. Whatever it prints is the number.
 *
 * Usage:
 *   node scripts/measure-leaf-offenders.mjs            summary + first 20
 *   node scripts/measure-leaf-offenders.mjs --all      every offender
 *
 * Exit 0 — zero offenders, the flip is safe.
 * Exit 1 — offenders remain; the count and the breakdown are on stdout.
 *
 * @tag domain:quality
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — pure reads, touches no database
 */

import { existsSync } from "node:fs";

const ALL = process.argv.includes("--all");

/*
 * The INSTALLED dist, not `appkit/src` — this measures what the app loads.
 * A direct path rather than `require.resolve`, because appkit's `exports` map
 * does not expose `package.json` and these are deep internal modules that are
 * deliberately not public subpaths either.
 */
const DIST = new URL("../node_modules/@mohasinac/appkit/dist/", import.meta.url);
if (!existsSync(new URL("seed/index.js", DIST))) {
  console.error("✗ appkit dist not found — run `npm --prefix ./appkit run build` and resync node_modules.");
  process.exit(2);
}
const imp = (p) => import(new URL(p, DIST).href);

const seed = await imp("seed/index.js");
/*
 * 🛑 BOTH functions, and `readAssignments` is the one this script got wrong
 * first. It was reimplemented inline as "categoryIds, else the scalar
 * category" — which is only its first two branches. The seed hand-writes
 * neither of those: it writes `categorySlugs`, the full derived closure, and
 * the real function takes its HEAD as the assignment.
 *
 * So the inline copy found no assignments on any of the 71 products, examined
 * nothing, and printed `offenders: 0` — a clean result from a measurement that
 * had not measured. The docstring above warns against exactly that ("which
 * would be a second implementation of the thing being measured") and the first
 * version of this file did it anyway, one function over.
 */
const { findLeafRuleOffenders, readAssignments } = await imp(
  "features/products/repository/category-assignment.js",
);

/*
 * The leaf flags are DERIVED by buildCategoryTree, never hand-written — so
 * read them off the built seed array rather than recomputing, which would be a
 * second implementation of the thing being measured.
 */
const categories = seed.categoriesSeedData ?? [];
const byId = new Map(categories.map((c) => [c.id, c]));

/* Every product-shaped seed array the barrel exposes. Derived, not listed:
 * a new products-*-seed-data.ts must not be able to escape this measurement. */
const productKeys = Object.keys(seed).filter(
  (k) => /^products[A-Za-z]*SeedData$/.test(k) && Array.isArray(seed[k]),
);

if (productKeys.length === 0) {
  console.error("✗ no product seed arrays found on the appkit seed barrel — nothing was measured.");
  console.error("  That is not a clean result. Check the export names in appkit/src/seed/index.ts.");
  process.exit(2);
}

let total = 0;
let unassigned = 0;
const offenders = [];

for (const key of productKeys) {
  for (const p of seed[key]) {
    total++;
    /* The REAL function, never a local copy of its precedence. */
    const ids = readAssignments(p);
    if (ids.length === 0) unassigned++;

    const resolved = ids.map((id) => {
      const c = byId.get(id);
      return { id, name: c?.name, isLeaf: c?.isLeaf };
    });

    for (const o of findLeafRuleOffenders(resolved, p.isLot === true, p.listingType)) {
      offenders.push({ product: p.id, listingType: p.listingType ?? "(none)", ...o });
    }
  }
}

console.log(`\nseed arrays : ${productKeys.join(", ")}`);
console.log(`products    : ${total}`);
console.log(`unassigned  : ${unassigned}`);
console.log(`categories  : ${categories.length}`);
console.log(`offenders   : ${offenders.length}`);

/*
 * 🛑 THE GUARD THAT WOULD HAVE CAUGHT THE FALSE ZERO.
 *
 * A product with no resolvable assignment contributes nothing to the count, so
 * a bug that makes every product look unassigned prints `offenders: 0` — which
 * reads identically to a clean catalogue. That is what happened on this
 * script's first run: all 71 came back unassigned because the precedence was
 * reimplemented wrongly, and the summary said the flip was safe.
 *
 * A zero that comes out of a corpus nothing could be read from is not a
 * measurement, so it exits 2 (distinct from both clean and offenders-remain).
 */
if (unassigned === total && total > 0) {
  console.error(
    `\n✗ NOT A RESULT: all ${total} products resolved to zero assignments, so nothing was measured.\n` +
      `  The offender count is meaningless, not clean. Check readAssignments' precedence\n` +
      `  against the fields the seed actually writes (it writes categorySlugs, not categoryIds).\n`,
  );
  process.exit(2);
}

if (offenders.length === 0) {
  console.log("\n✓ zero offenders — ENFORCE_LEAF_FILING can be flipped to true.\n");
  process.exit(0);
}

const tally = (fn) =>
  offenders.reduce((acc, o) => ((acc[fn(o)] = (acc[fn(o)] ?? 0) + 1), acc), {});

console.log("\nby reason      :", tally((o) => o.reason));
console.log("by listingType :", tally((o) => o.listingType));
console.log("by category    :", tally((o) => o.id));

const show = ALL ? offenders : offenders.slice(0, 20);
console.log(`\n${ALL ? "every" : `first ${show.length}`} offender:`);
for (const o of show) {
  console.log(`  ${o.product}  [${o.listingType}]  ->  ${o.id}${o.name ? ` (${o.name})` : ""}  ${o.reason}`);
}
if (!ALL && offenders.length > show.length) {
  console.log(`  … ${offenders.length - show.length} more (--all to list them)`);
}

console.log("\n✗ offenders remain — do NOT flip ENFORCE_LEAF_FILING yet.\n");
process.exit(1);

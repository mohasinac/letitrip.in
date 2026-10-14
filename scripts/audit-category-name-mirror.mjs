#!/usr/bin/env node
/**
 * `categoryNames` must agree with `categorySlugs`, position for position.
 *
 * 🛑 Measured when this was written: **20 of 71** products disagreed, and four
 * of those predate any re-filing — so this is what a hand-maintained mirror
 * does on its own, not a transient (Recurrent Root Cause #42).
 *
 *     product-beyblade-metal-storm-pegasus
 *       slugs : [storm-pegasus-105rf, metal-fusion, …]
 *       names : ["Metal Masters", "Metal Fight Tops", …]   <- a generation out
 *
 * Nothing failed, because no reader cross-checks the two. A breadcrumb built
 * from `categoryNames` told a buyer "Metal Masters" while every link beneath
 * it pointed at Metal Fusion.
 *
 * `withDerivedCategoryNames` now derives the display chain in every product
 * seed pipeline, so the count is 0 by construction. This audit exists because
 * "by construction" is a claim about today's code: a new seed file that
 * forgets the pipeline step, or a record that re-adds a hand-written
 * `categoryNames` after it, puts the drift straight back with no other signal.
 *
 * Strict zero — there is no legitimate reason for the two to differ.
 *
 * @tag domain:quality
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — pure reads
 */
const DIST = new URL("../node_modules/@mohasinac/appkit/dist/", import.meta.url);
const seed = await import(new URL("seed/index.js", DIST).href);
const byId = new Map((seed.categoriesSeedData ?? []).map((c) => [c.id, c]));
const keys = Object.keys(seed).filter((k) => /^products[A-Za-z]*SeedData$/.test(k) && Array.isArray(seed[k]));
let bad = 0, total = 0;
for (const k of keys) for (const p of seed[k]) {
  const s = p.categorySlugs, n = p.categoryNames;
  if (!Array.isArray(s)) continue;
  total++;
  const expect = s.map((id) => byId.get(id)?.name ?? `??${id}`);
  if (JSON.stringify(expect) !== JSON.stringify(n)) {
    bad++;
    console.log(`${p.id}`);
    console.log(`   slugs : ${JSON.stringify(s)}`);
    console.log(`   names : ${JSON.stringify(n)}`);
    console.log(`   should: ${JSON.stringify(expect)}`);
  }
}
/*
 * 🛑 A zero out of a corpus nothing could be read from is not a clean result —
 * the same false-zero this session's leaf measurement produced. If no product
 * carried a `categorySlugs` array at all, `total` is 0 and the mirror can
 * never disagree, so "clean" would mean "unmeasured".
 */
if (total === 0) {
  console.error(
    "✗ NOT A RESULT: no product carried a categorySlugs array, so nothing was compared.\n" +
      "  Check the seed barrel's products* exports before reading this as clean.",
  );
  process.exit(2);
}

console.log(
  bad === 0
    ? `audit-category-name-mirror: clean ✓ (${total} product(s) checked, names derived from slugs)`
    : `\naudit-category-name-mirror: ${bad} of ${total} product(s) have categoryNames disagreeing with categorySlugs.\n` +
      `  Fix: apply withDerivedCategoryNames in that file's export pipeline, and delete the\n` +
      `  hand-written categoryNames from the record — a hand-written one is the defect.`,
);

process.exit(bad === 0 ? 0 : 1);

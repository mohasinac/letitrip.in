#!/usr/bin/env node
/*
 * verify-search-local.mjs — exercise the browser matcher in Node.
 *
 * The matcher is pure and isomorphic precisely so this can exist: no browser,
 * no dev server, no Vercel deploy. It builds a fixture artifact, runs real
 * queries through the real `searchIndex`, and asserts behaviour that would
 * otherwise only be observable by a human typing into a box.
 *
 * 🛑 EVERY ASSERTION HAS A CONTROL. A search that returns plausible rows for a
 * real term looks identical to one that has stopped filtering; "zzzznope"
 * returning zero is the only check here that cannot pass by accident. That is
 * the same rule `content-discovery__search.ts` states for the tester cases.
 *
 * 🛑 It also TIMES the scan, because `match.ts`'s header makes a claim with a
 * number in it — that a linear scan over ~3,700 records is sub-millisecond and
 * therefore does not need an inverted index. A claim with a number attached
 * should be checked, not repeated. If this prints a figure that makes the
 * claim false, the header is the thing to come back and change.
 *
 * Run: node scripts/verify-search-local.mjs
 */

import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { existsSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DIST = join(ROOT, "appkit", "dist", "_internal", "shared", "search");

if (!existsSync(join(DIST, "match.js"))) {
  console.error(
    "verify-search-local: appkit/dist is missing the matcher.\n" +
      "  Build it first:  npm --prefix ./appkit run build\n" +
      "  (This script runs the SHIPPED module on purpose — testing the source\n" +
      "   would not catch a build that drops or mangles it.)",
  );
  process.exit(2);
}

const { searchIndex, prepareIndex, resolveEntity } = await import(
  pathToFileURL(join(DIST, "match.js")).href
);
const { SEARCH_INDEX_SCHEMA_VERSION } = await import(
  pathToFileURL(join(DIST, "index-record.js")).href
);

/* ---------------------------------------------------------------- fixture -- */

const types = [
  { key: "product", hrefTemplate: "/products/{s}", moreHref: "/products", weight: 1.0 },
  { key: "category", hrefTemplate: "/categories/{s}", moreHref: "/categories", weight: 0.9 },
  { key: "part", hrefTemplate: "/parts/{s}", moreHref: "/parts", weight: 0.8 },
];

/** `[typeIdx, title, detail, slug, facets?]` */
const base = [
  [0, "Storm Pegasus 105RF", "Takara-Tomy · Metal Fight", "storm-pegasus-105rf", "lt:standard|br:takara-tomy"],
  [0, "Dragoon Storm", "Takara-Tomy · Plastic", "dragoon-storm", "lt:auction|br:takara-tomy"],
  [0, "Charizard Holo", "Wizards · Trading Cards", "charizard-holo", "lt:standard"],
  [1, "Beyblade X", "Spinning Tops", "category-beyblade-x"],
  [2, "Rubber Flat", "Performance Tip · RF", "performance-tip--rf"],
  [2, "Wide Flat", "Performance Tip · WF", "performance-tip--wf"],
];

/** Pad to a realistic corpus size so the timing figure means something. */
const FILLER = 3700 - base.length;
const records = [
  ...base,
  ...Array.from({ length: FILLER }, (_, i) => [
    0,
    `Filler Bey ${i}`,
    "Filler Brand · Filler Line",
    `filler-${i}`,
  ]),
];

const artifact = {
  schema: SEARCH_INDEX_SCHEMA_VERSION,
  version: 1,
  builtAt: "2026-10-19T00:00:00.000Z",
  types,
  r: records,
};

const prepared = prepareIndex(artifact);

/* -------------------------------------------------------------- assertions -- */

let failed = 0;
const check = (name, got, want, note = "") => {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`  ${ok ? "✓" : "✗"} ${name.padEnd(48)} got=${String(got).padEnd(6)} want=${want}${note ? "  " + note : ""}`);
};

const q = (s, opts) => searchIndex(artifact, prepared, s, opts);

console.log(`\nverify-search-local — ${records.length} records, schema ${artifact.schema}\n`);

console.log("CONTROLS — the assertions that cannot pass by accident");
check("nonsense term returns nothing", q("zzzznope").length, 0);
check("punctuation-only returns nothing", q("!!!").length, 0, "(not everything)");
check("empty string returns nothing", q("").length, 0);

console.log("\nDIRECT MATCHING");
check("exact word", q("charizard").length, 1);
check("word prefix", q("chari").length, 1);
check("multi-word is AND, not OR", q("storm pegasus").length, 1);
check("AND excludes a partial match", q("charizard dragoon").length, 0, "(no record has both)");

console.log("\nSUBSTRING — the capability the token index cannot have");
check("mid-word finds charizard", q("ariza").length, 1, '("ariza" is mid-word)');

console.log("\nALIAS PASS — only when the direct pass finds nothing");
check("doubled-letter: dragon -> Dragoon", q("dragon").length >= 1, true);
check("part code RF -> Rubber Flat", q("rf").length >= 1, true);

console.log("\nFILTERS");
check("types filter restricts", q("flat", { types: ["part"] }).length, 2);
check("types filter excludes others", q("pegasus", { types: ["part"] }).length, 0);
check("facet filter restricts", q("takara", { facets: ["lt:auction"] }).length, 1);
check("unknown facet matches nothing", q("takara", { facets: ["lt:nope"] }).length, 0);

console.log("\nRANKING");
const ranked = q("flat");
check("exact title beats detail-only", ranked[0]?.title, "Rubber Flat", "(or Wide Flat)");
check("href resolves from the template", q("charizard")[0]?.href, "/products/charizard-holo");

console.log("\nDEDUPE BY DESTINATION");
/*
 * `model` and `category` both render `/categories/{s}` — a real collision
 * found on the first production build (222 compositions over 1,144
 * categories), not a hypothetical. Two rows going to the same page read as a
 * duplicate-results bug.
 */
const dupArtifact = {
  ...artifact,
  types: [
    ...types,
    { key: "model", hrefTemplate: "/categories/{s}", moreHref: "/categories", weight: 0.85 },
  ],
  r: [...records, [3, "Beyblade X Composition", "Beyblade X system", "category-beyblade-x"]],
};
const dupPrepared = prepareIndex(dupArtifact);
const dupHits = searchIndex(dupArtifact, dupPrepared, "beyblade x");
check("two types, one page -> one hit", dupHits.length, 1, "(category + model collide)");
check("the higher score survives", dupHits[0]?.href, "/categories/category-beyblade-x");

console.log("\nresolveEntity — the primitive the tools call");
check("same results as searchIndex", resolveEntity(artifact, prepared, "charizard").length, 1);
check("tools can scope by type", resolveEntity(artifact, prepared, "flat", { types: ["part"] }).length, 2);

/* ------------------------------------------------------------------ timing -- */

console.log("\nTIMING — match.ts claims a linear scan is sub-millisecond here");
const WARM = 200;
for (let i = 0; i < WARM; i++) q("pegasus");
const t0 = performance.now();
const ITER = 1000;
for (let i = 0; i < ITER; i++) q("pegasus");
const per = (performance.now() - t0) / ITER;
console.log(`  ${per.toFixed(3)} ms per query over ${records.length} records (${ITER} iterations)`);
if (per > 1) {
  console.log(
    "  🛑 Over 1 ms. match.ts's header justifies hand-rolling partly on this number;\n" +
      "     if it stays above 1 ms the honest move is to revisit that argument.",
  );
}

/* ------------------------------------------------------------------ result -- */

console.log("");
if (failed > 0) {
  console.error(`verify-search-local: FAIL — ${failed} assertion(s).`);
  process.exit(1);
}
console.log("verify-search-local: OK — all assertions passed, controls returned zero.");

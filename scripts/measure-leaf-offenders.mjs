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
 * ── 🛑 THE SEED IS NOT THE CATALOGUE ──────────────────────────────────────
 *
 * By default this reads the SEED, which is what the flip's gate cares about:
 * a seed write that the rule would refuse makes `appkit-seed load` fail. But a
 * clean seed says nothing about Firestore. Measured 2026-10-14, the `products`
 * collection held **1,039** documents against the seed's 71 — 968 written by a
 * one-listing-per-taxonomy-leaf generator that is not in git. So the seed-only
 * reading covered 7% of the collection, and `appkit-seed status` reported
 * "71 / 71" throughout because it counts how many SEEDED IDS it can find and is
 * structurally blind to documents it did not write.
 *
 * `--live` runs the same predicate over Firestore instead. Same two functions,
 * same leaf flags — only the row source changes, because two implementations of
 * one rule is the mistake recorded above, and running it twice over two corpora
 * is not a reason to write it twice.
 *
 * Usage:
 *   node scripts/measure-leaf-offenders.mjs            the seed; summary + first 20
 *   node scripts/measure-leaf-offenders.mjs --live     every product in Firestore
 *   node scripts/measure-leaf-offenders.mjs --all      every offender
 *
 * Exit 0 — zero offenders, the flip is safe.
 * Exit 1 — offenders remain; the count and the breakdown are on stdout.
 * Exit 2 — nothing was measured (see the guard at the bottom).
 *
 * @tag domain:quality
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — pure reads; --live reads Firestore and writes nothing
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const ALL = process.argv.includes("--all");
const LIVE = process.argv.includes("--live");

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
 * a new products-*-seed-data.ts must not be able to escape this measurement.
 *
 * 🛑 `products[A-Za-z]*SeedData` and not `products.*SeedData`: the second also
 * matches `productFeaturesSeedData`, a different collection whose rows carry no
 * category assignment at all, so every one of its 170 rows would land in
 * `unassigned` and drag the corpus toward the false-zero guard below. */
const productKeys = Object.keys(seed).filter(
  (k) => /^products[A-Za-z]*SeedData$/.test(k) && Array.isArray(seed[k]),
);

if (productKeys.length === 0) {
  console.error("✗ no product seed arrays found on the appkit seed barrel — nothing was measured.");
  console.error("  That is not a clean result. Check the export names in appkit/src/seed/index.ts.");
  process.exit(2);
}

/**
 * The rows to measure. The SOURCE differs between modes; nothing else does.
 */
async function loadRows() {
  if (!LIVE) {
    return {
      label: `seed arrays : ${productKeys.join(", ")}`,
      rows: productKeys.flatMap((k) => seed[k]),
    };
  }

  // .env.local reader, same shape as seed-cli.mjs.
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      if (!(k in process.env)) process.env[k] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  const missing = [
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
  ].filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`✗ --live needs ${missing.join(", ")} in .env.local`);
    process.exit(2);
  }

  const require = createRequire(import.meta.url);
  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID.trim(),
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL.trim(),
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
  /*
   * Only the five fields the predicate reads. A full-body fetch of 1,039
   * documents to answer a question about four fields is the kind of unbounded
   * read Rule #6 exists to stop, and this runs against the live quota.
   */
  const snap = await admin
    .firestore()
    .collection("products")
    .select("categoryIds", "category", "categorySlugs", "isLot", "listingType")
    .get();
  return {
    label: `source      : Firestore \`products\` on ${process.env.FIREBASE_ADMIN_PROJECT_ID}`,
    rows: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
}

const { label, rows } = await loadRows();

let total = 0;
let unassigned = 0;
const offenders = [];

for (const p of rows) {
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

console.log(`\n${label}`);
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

#!/usr/bin/env node
/**
 * G3a — verify the `isLot` filing rule and its write-shape, with NEGATIVE
 * CONTROLS, because a check nothing has been seen to fail is decoration
 * (Root Cause #92).
 *
 * The rule is ONE-DIRECTIONAL and that is the finding worth protecting: a LOT
 * may not file at a LEAF; a SINGLE may file anywhere. The plan specified it
 * symmetrically, and measuring production showed the second half would have
 * rejected 58 of 70 live products on their next update.
 *
 * Run: node scripts/verify-lot-filing.mjs
 */
import { readFileSync } from "node:fs";
import { stripComments } from "./lib/strip-comments.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log(`  PASS  ${m}`); } else { fail++; console.log(`  FAIL  ${m}`); } };

const REPO = readFileSync("appkit/src/features/products/repository/products.repository.ts", "utf8");
const SCHEMA = readFileSync("appkit/src/features/products/schemas/firestore.ts", "utf8");
const REQ = readFileSync("src/validation/request-schemas.ts", "utf8");
// 🛑 Strip comments or every assertion below matches the prose EXPLAINING the
// rule rather than the rule — F1 #26/#33, which this repo has now hit twice.
const repo = stripComments(REPO), schema = stripComments(SCHEMA), req = stripComments(REQ);

console.log("\n--- the document declares both fields ---");
ok(/\bisLot\?:\s*boolean/.test(schema), "ProductDocument.isLot?: boolean");
ok(/\blotSize\?:\s*number/.test(schema), "ProductDocument.lotSize?: number");

console.log("\n--- both are WRITABLE, or an update strips them (Root Cause #101) ---");
const updatable = schema.slice(schema.indexOf("PRODUCT_UPDATABLE_FIELDS"));
ok(/"isLot"/.test(updatable), "isLot is in PRODUCT_UPDATABLE_FIELDS");
ok(/"lotSize"/.test(updatable), "lotSize is in PRODUCT_UPDATABLE_FIELDS");
const pub = schema.slice(schema.indexOf("PRODUCT_PUBLIC_FIELDS"), schema.indexOf("PRODUCT_UPDATABLE_FIELDS"));
ok(/"isLot"/.test(pub) && /"lotSize"/.test(pub), "both are PUBLIC — a buyer must see 'lot of 12'");

console.log("\n--- the write schema NAMES them, or they never reach Firestore ---");
ok(/isLot:\s*z\.boolean\(\)\.optional\(\)/.test(req), "isLot declared in productBaseSchema");
ok(/lotSize:\s*z\.number\(\)/.test(req), "lotSize declared in productBaseSchema");
ok(!/isLot:\s*z\.boolean\(\)\.default\(/.test(req),
   "isLot has NO .default() — absent must stay distinguishable from an explicit false");
ok(/lotSize:[^,]*\.min\(2\)/.test(req), "lotSize floors at 2 — a 'lot' of one is a single");
ok(/lotSize:[^,]*\.max\(999\)/.test(req), "lotSize is bounded — an unbounded count divides a price by a typo");

console.log("\n--- the rule is enforced in the repository, in ONE direction ---");
ok(/input\.isLot\s*===\s*true\s*&&\s*cat\.isLeaf\s*===\s*true/.test(repo),
   "refuses lot-at-leaf");
ok(!/!filingAsLot|!leafIsLeaf|input\.isLot\s*!==\s*true/.test(repo),
   "NEGATIVE CONTROL: does NOT refuse single-at-non-leaf (58 of 70 live products do that)");
ok(/isLeaf\?:\s*boolean/.test(repo),
   "isLeaf is read off the category snapshot already in hand — zero extra reads");
ok(/ValidationError/.test(repo) && /DatabaseError,\s*ValidationError/.test(repo),
   "throws the REAL ValidationError from ../../../errors (Root Cause #53), so it maps to a 400");

console.log("\n--- the throw is reachable from the chain derivation, not a dead branch ---");
const block = repo.slice(repo.indexOf("deriveTaxonomy"));
const catBlock = block.indexOf("catSnap?.exists");
const throwAt = block.indexOf("A lot holds several different items");
ok(catBlock > 0 && throwAt > catBlock, "the guard sits INSIDE the resolved-category branch");
ok(block.indexOf("out.categorySlugs") > throwAt,
   "it runs BEFORE the chain is written — a refused write must not half-derive");

console.log(`\n${fail === 0 ? "all checks passed" : `${fail} FAILED`}  (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);

#!/usr/bin/env node
/**
 * D2 Fix 3 — the part code ⇄ name bridge.
 *
 * 🛑 Compares the two implementations' OUTPUT, not their field names. F1 #29
 * records why: `audit-search-parity`'s R1 compares the FIELDS the backfill
 * reads against the builder's, and these tokens come from `title`/`specs`
 * which are in both lists — so R1 reports clean over a drift it structurally
 * cannot see. It has already happened once, with a mangled split regex.
 *
 * Run: node scripts/verify-part-aliases.mjs
 */
import { readFileSync } from "node:fs";
import { stripComments } from "./lib/strip-comments.mjs";
import { PART_ALIASES, partAliasTokens } from "../appkit/dist/_internal/shared/search/part-aliases.js";
import { buildProductSearchTxt } from "../appkit/dist/utils/search-txt-builders.js";
import { parseSearchTxtQuery } from "../appkit/dist/utils/search-txt.js";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log(`  PASS  ${m}`); } else { fail++; console.log(`  FAIL  ${m}`); } };

console.log("\n--- the generated map ---");
ok(PART_ALIASES.length === 23, `23 bridges (code AND a distinct name) — got ${PART_ALIASES.length}`);
ok(PART_ALIASES.every((a) => a.code && a.name && a.classification), "every row carries all three fields");
ok(new Set(PART_ALIASES.map((a) => a.code)).size === PART_ALIASES.length, "codes are unique");
ok(!PART_ALIASES.some((a) => /^(bottom|track|disc|layer):/i.test(a.name)),
   "the `Bottom:` / `Track:` prefix is stripped — a buyer types 'rubber flat', not 'bottom: rubber flat'");

console.log("\n--- 🛑 BOTH DIRECTIONS, which is the whole point ---");
ok(partAliasTokens("Storm Pegasus 105RF").includes("rubber flat"),
   "a CODE in the title yields the spoken name");
ok(partAliasTokens("Storm Pegasus 105 Rubber Flat").includes("rf"),
   "the spoken NAME yields the code");

console.log("\n--- false positives, each one measured during development ---");
ok(!partAliasTokens("Storm Pegasus 105RF").includes("flat"),
   "105RF does NOT also alias to 'flat' — \"105rf\".endsWith(\"f\") is true, so a plain endsWith added a second, wrong tip");
ok(partAliasTokens("Beyblade Original Dranzer F").length === 0,
   "a MODEL name ending in a 1-char code aliases nothing — bare codes need 2+ chars");
ok(partAliasTokens("Dran Sword 3-60F").includes("flat"),
   "...but a DIGIT-PREFIXED 1-char code still matches, which is where it really appears");
ok(partAliasTokens("A plain product with no parts").length === 0, "an unrelated product pays no tokens");
ok(partAliasTokens("").length === 0 && partAliasTokens(null ?? "").length === 0, "empty input is empty output");

console.log("\n--- it reaches the real product builder ---");
const withCode = buildProductSearchTxt({ title: "Storm Pegasus 105RF", description: "" });
ok(withCode.includes("rubber"), "buildProductSearchTxt emits the alias words");
const plain = buildProductSearchTxt({ title: "Plain Thing", description: "" });
ok(!plain.includes("rubber"), "NEGATIVE CONTROL: an unrelated product does not");

console.log("\n--- a real query actually matches, through the real parser ---");
const txt = buildProductSearchTxt({ title: "Storm Pegasus 105RF", description: "Metal Fight top." });
// 🛑 It returns a plain string[], not `{ terms }` — asserted against the real
// export rather than an assumed shape, which is what this line originally got
// wrong and crashed on.
const q = parseSearchTxtQuery("rubber flat");
ok(Array.isArray(q) && q.length > 0, `the query parses to ${q.length} term(s): ${JSON.stringify(q)}`);
ok(q.every((t) => txt.includes(t)),
   'every term of "rubber flat" is present in the listing searchTxt — so the listing is FOUND');
const nope = parseSearchTxtQuery("zzzznope");
ok(!nope.every((t) => txt.includes(t)),
   "NONSENSE CONTROL: 'zzzznope' does not match — it is filtering, not matching everything");

console.log("\n--- the 600-token cap, which truncates SILENTLY ---");
ok(txt.length < 600, `a real listing with aliases is ${txt.length} tokens, under the 600 cap`);

console.log("\n--- 🛑 the BACKFILL imports rather than re-implements (F1 #29) ---");
const bf = stripComments(readFileSync("appkit/scripts/backfill-search-txt.mjs", "utf8"));
ok(/import \{ partAliasTokens \} from "\.\.\/dist\//.test(bf),
   "it imports partAliasTokens from the built dist");
ok(!/function partAliasTokens/.test(bf),
   "NEGATIVE CONTROL: it does NOT define its own copy — a copy cannot drift if there is no copy");
ok(/partAliasTokens\(\[/.test(bf), "and it actually calls it in the products arm");

console.log(`\n${fail === 0 ? "all checks passed" : `${fail} FAILED`}  (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);

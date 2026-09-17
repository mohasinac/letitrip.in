#!/usr/bin/env node
/*
 * Back-annotate test-runs/test-run-1.md with Fix Run 1's fixes (RULE 6).
 *
 * One-shot: each FIX is matched to the Test Run 1 cases it addresses by a
 * signature over the case id and the tester's own comment, then
 * `tester-run-report.mjs --append-fix` writes the annotation.
 *
 * 🛑 MATCHING IS DELIBERATELY CONSERVATIVE.
 *
 * An annotation is a claim that a specific fix addresses a specific failure. A
 * loose matcher would paint "FIXED" across cases nobody fixed, and since Test
 * Run 2 re-tests every carried case anyway, a missed annotation costs nothing
 * while a wrong one is a lie in the permanent record. So each rule requires BOTH
 * an id/page signal AND (where ambiguous) a comment signal, and anything
 * unmatched is simply left un-annotated and reported.
 *
 * RULE 3 is enforced downstream: --append-fix cannot edit the original result
 * line, only insert beneath it.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const RUN_MD = "test-runs/test-run-1.md";

/** Each rule: the FIX id, and a predicate over { id, comment }. */
const RULES = [
  { fix: "FIX-001", test: (c) => /count|badge|metric/i.test(c.text) && /categor|brand|listing/i.test(c.id) },
  { fix: "FIX-002", test: (c) => /cart/i.test(c.id) && /(bundle|group)/i.test(c.text) },
  { fix: "FIX-003", test: (c) => /cart/i.test(c.id) && /(price|sign in to see)/i.test(c.text) },
  { fix: "FIX-005", test: (c) => /sellers-director|verified-seller/i.test(c.id) },
  { fix: "FIX-006", test: (c) => /(faq|scam)/i.test(c.id) && /search/i.test(c.id + c.text) },
  { fix: "FIX-007", test: (c) => /order/i.test(c.id) && /(unknown buyer|raw id|order id|no amount)/i.test(c.text) },
  { fix: "FIX-010", test: (c) => /(store|seller)/i.test(c.id) && /(rating|facet)/i.test(c.id + c.text) },
  { fix: "FIX-011", test: (c) => /coupon/i.test(c.id) && /(edit|editor|issue)/i.test(c.id + c.text) },
  /*
   * 🛑 ID ONLY, NOT THE COMMENT.
   *
   * The first version tested `/(return|refund)/` against id + comment and
   * matched **159** cases — because "return" is a verb that appears in almost
   * every piece of evidence ("the page returns 404", "the endpoint returns 0
   * rows"). Annotating 159 cases with a fix that addressed about eight would be
   * a lie written into the permanent record, which is the one thing a
   * traceability ledger must never contain.
   */
  {
    fix: "FIX-012",
    test: (c) =>
      /-(return|refund)/i.test(c.id) &&
      // "returns" is also an intransitive verb about the VISITOR, not a product
      // return: `checkout-guest-returns-after-signin` is about a guest coming
      // back to their cart. 13 of 14 id matches were genuine; this was the 14th.
      !/returns-(after|to|with)\b/i.test(c.id),
  },
  { fix: "FIX-013", test: (c) => /event/i.test(c.id) && /(cancelled|ended|paused|404|not found)/i.test(c.text) },
  /*
   * Id only, for the same reason: `/store/` appears in evidence text on plenty
   * of cases that were never seller-identity failures. The seller-identity
   * blocker is exactly the `selling` group.
   */
  { fix: "FIX-016", test: (c) => /^checklist-selling-/.test(c.id) },
  { fix: "FIX-017", test: (c) => /selling/i.test(c.id) && /(status|published)/i.test(c.text) },
  { fix: "FIX-018", test: (c) => /(404|error-page|not-found)/i.test(c.id) },
  { fix: "FIX-020", test: (c) => /admin/i.test(c.id) && /(missing-id|404|does not exist|invented)/i.test(c.id + c.text) },
  { fix: "FIX-021", test: (c) => /(mobile|responsive|announcement)/i.test(c.id + c.text) && /(overlap|hero|cover)/i.test(c.text) },
  { fix: "FIX-022", test: (c) => /(email|verification|password-reset|inbox)/i.test(c.id) && /(inbox|email)/i.test(c.text) },
  { fix: "FIX-023", test: (c) => /signup/i.test(c.id) },
];

// Parse the run file's case blocks: id + everything until the next heading.
const md = readFileSync(RUN_MD, "utf8");
const blocks = [];
const re = /^#### (checklist-[a-z0-9-]+)$/gm;
let m;
while ((m = re.exec(md))) {
  const start = m.index;
  const rest = md.slice(start + m[0].length);
  const next = rest.search(/\n#{1,4} /);
  blocks.push({
    id: m[1],
    text: (next === -1 ? rest : rest.slice(0, next)).toLowerCase(),
  });
}

console.log(`case blocks in ${RUN_MD}: ${blocks.length}`);

const matched = new Map(); // id -> fix (first rule wins; a case gets ONE fix)
for (const b of blocks) {
  for (const r of RULES) {
    if (matched.has(b.id)) break;
    try {
      if (r.test(b)) matched.set(b.id, r.fix);
    } catch { /* a bad predicate must not abort the whole pass */ }
  }
}

const byFix = {};
for (const [id, fix] of matched) (byFix[fix] ||= []).push(id);

console.log(`matched ${matched.size} of ${blocks.length} case blocks:\n`);
for (const [fix, ids] of Object.entries(byFix).sort()) {
  console.log(`  ${fix}  →  ${ids.length} case(s)`);
}
console.log(`\nunmatched: ${blocks.length - matched.size} (left un-annotated on purpose — Test Run 2 re-tests them regardless)\n`);

if (process.argv.includes("--dry-run")) process.exit(0);

let ok = 0, failed = 0;
for (const [id, fix] of matched) {
  try {
    execFileSync(
      process.execPath,
      ["scripts/tester-run-report.mjs", "--number", "1", "--append-fix", fix,
       "--case", id, "--fix-run", "1", "--retest-run", "2"],
      { stdio: "pipe" },
    );
    ok += 1;
  } catch {
    failed += 1;
  }
}
console.log(`✓ annotated ${ok} case(s); ${failed} could not be annotated.`);

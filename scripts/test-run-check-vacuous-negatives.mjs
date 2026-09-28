#!/usr/bin/env node
/*
 * Phase 1 helper — find NEGATIVE assertions that can never fail.
 *
 * 🛑 THE DEFECT THIS EXISTS FOR, AND WHY IT IS THE WORST ONE.
 *
 * buying/bidding asserted that seeing 'Meera Bey', 'Rohit Collector' or
 * 'Ananya Collector' in the public bid history is a PII leak. Those three
 * strings occur ZERO times in the seed — every persona's displayName is
 * "Mock User N" — so the assertion passed whether masking worked or not.
 * account-auth/profile-settings had the same shape, forbidding a revert to
 * 'Rehan Sheikh', which is that persona's EMAIL rather than their name.
 *
 * A wrong LABEL makes a case fail loudly and get fixed. A vacuous NEGATIVE
 * makes it pass silently forever: it reads as a guard, occupies the slot a real
 * guard would, and nobody re-examines a green PII case. That is why this is a
 * separate sweep rather than a note on the label checker.
 *
 * The rule: if a sentence forbids something, the thing it forbids has to be
 * able to appear. A literal that exists in neither the seed nor the source can
 * never show up on screen, so forbidding it asserts nothing.
 *
 * 🛑 LEAD GENERATOR, NOT A VERDICT — same standing as its sibling. Legitimate
 * hits exist: a case may forbid a string the app should never produce at all
 * ('Cannot find module', 'Batch write failed', 'undefined'), and those are
 * exactly right to assert and exactly absent from source. Read every hit.
 *
 * Usage:  node scripts/test-run-check-vacuous-negatives.mjs [<group/page>]
 * Exit:   always 0.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, basename } from "node:path";
import { REPO } from "./lib/test-run.mjs";

const only = process.argv[2];
const SEED_DIR = resolve(REPO, "appkit/src/features/tester/seed-data");

/* Everything a forbidden literal could legitimately come from. */
let hay = "";
const eat = (p) => {
  try {
    if (statSync(p).size < 2_000_000) hay += readFileSync(p, "utf8");
  } catch {
    /* unreadable is not a finding */
  }
};
for (const f of readdirSync(resolve(REPO, "appkit/src/seed"))) {
  if (f.endsWith(".ts")) eat(resolve(REPO, "appkit/src/seed", f));
}
for (const root of [resolve(REPO, "src"), resolve(REPO, "appkit/src")]) {
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (!["node_modules", ".next", "dist", "seed-data"].includes(e.name)) stack.push(p);
        continue;
      }
      if (/\.(tsx?|json)$/.test(e.name)) eat(p);
    }
  }
}

const files = [];
for (const f of readdirSync(join(SEED_DIR, "authored"))) {
  if (f.endsWith(".ts") && f !== "index.ts" && !f.startsWith("_")) files.push(join(SEED_DIR, "authored", f));
}
for (const f of readdirSync(SEED_DIR)) {
  if (f.endsWith(".ts") && f.startsWith("_") && f !== "_types.ts") files.push(join(SEED_DIR, f));
}

/* Phrases that make a sentence an assertion of ABSENCE. */
const NEGATION = /(must not|never|does not appear|is not shown|anywhere in|not reverted|no longer|is absent|are absent|nowhere)/i;

const hits = new Map();
for (const file of files) {
  const page = basename(file).replace(/\.ts$/, "").replace("__", "/");
  if (only && !page.startsWith(only)) continue;
  if (!existsSync(file)) continue;

  /* Comments carry the explanation of past fixes — judging them re-reports
   * every literal already corrected. Same trap as the label checker. */
  const text = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  for (const s of text.matchAll(/"((?:[^"\\]|\\.){40,})"/g)) {
    const sentence = s[1];
    if (!NEGATION.test(sentence)) continue;
    for (const q of sentence.matchAll(/'([A-Z][^']{3,40})'/g)) {
      const lit = q[1];
      /* Money, masked shapes and placeholders are not fixture citations. */
      if (/[₹$]|\*\*\*|\.\.\./.test(lit)) continue;
      if (hay.includes(lit)) continue;
      const key = `${page}|${lit}`;
      if (!hits.has(key)) hits.set(key, { page, lit });
    }
  }
}

if (hits.size === 0) {
  console.log(only ? `${only}: no vacuous negative assertions found` : "no vacuous negative assertions found");
  process.exit(0);
}

console.log(`${hits.size} negative assertion(s) citing a literal absent from BOTH the seed and the source:`);
console.log("");
for (const { page, lit } of hits.values()) console.log(`  ${page.padEnd(44)} '${lit}'`);
console.log("");
console.log("  Absent is not always wrong: a case may rightly forbid a string the app");
console.log("  should never produce ('Cannot find module', 'undefined'). But a forbidden");
console.log("  FIXTURE value that does not exist makes the assertion unfailable — read each.");

#!/usr/bin/env node
/*
 * Phase 1 helper — find quoted UI strings in a page's cases that appear NOWHERE
 * in the app source.
 *
 * 🛑 WHAT THIS IS FOR. Three pages into the audit, every defect found has the
 * same shape: the feature migrated, the case text followed, and ONE literal was
 * left pointing at the old world — a dead order id, a switch whose section
 * moved, three tab labels that now render under different names.
 *
 * That failure mode is the expensive one. The tester hunts for a control that
 * IS there under another name, does not find it, and answers "could not test"
 * on a feature that works — a false gap, and nobody re-checks a "could not
 * test". A name that no longer exists is exactly what a machine can find.
 *
 * 🛑 IT CANNOT CATCH THE DEFECT IT WAS WRITTEN FOR, AND THAT IS WORTH KNOWING.
 *
 * The case that prompted this helper clicked a 'Live' tab on /auctions. This
 * checker reports that page clean — because `liveBadge: "Live"` exists in
 * MarketplaceAuctionCard.tsx. The string is real; it is a BADGE ON A CARD, not
 * a tab, and the case named the wrong control on the right page.
 *
 * A global existence check can only ever answer "does this text exist
 * somewhere". "Is this the name of THAT control on THAT page" needs a human to
 * open the component — which is what step 3 of the audit procedure is for.
 *
 * So: this finds RENAMED and DELETED labels, which is a real and common drift
 * shape. It does not find MISPLACED ones. Do not read a clean result as a clean
 * page.
 *
 * 🛑 THIS IS A LEAD GENERATOR, NOT A VERDICT. It reports what it cannot find,
 * which is not the same as what is wrong:
 *
 *   - a label built by interpolation (`${count} items`) is absent by nature
 *   - a label coming from a translation file or from seeded data is absent here
 *   - a string in a STEP may be prose the author wrote, not a control
 *
 * So it is deliberately not an audit and not wired into `npm run check`. Every
 * hit is read by hand against the source before anything is changed — the same
 * discipline that stopped "Promotions" being reported as a missing label when a
 * truncated file list was the only reason it looked missing.
 *
 * Usage:
 *   node scripts/test-run-check-ui-strings.mjs <group/page>
 *   node scripts/test-run-check-ui-strings.mjs buying/product-detail
 *
 * Exit: always 0 — a lead generator that can fail a build would be a rule, and
 * its false-positive rate is far too high to be one.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { REPO } from "./lib/test-run.mjs";

const target = process.argv[2];
if (!target || !target.includes("/")) {
  console.error("Usage: node scripts/test-run-check-ui-strings.mjs <group/page>");
  process.exit(0);
}

const SEED_DIR = resolve(REPO, "appkit/src/features/tester/seed-data");
const overlay = resolve(SEED_DIR, "authored", `${target.replace("/", "__")}.ts`);

let caseSrc = "";
if (existsSync(overlay)) caseSrc = readFileSync(overlay, "utf8");
else {
  /* Inline-authored page sets (_happy-path, _money-flows) carry no overlay. */
  for (const f of readdirSync(SEED_DIR)) {
    if (f.endsWith(".ts") && f.startsWith("_")) caseSrc += readFileSync(resolve(SEED_DIR, f), "utf8");
  }
  caseSrc += readFileSync(resolve(SEED_DIR, "tester-checklist-seed-data.ts"), "utf8");
}
if (!caseSrc) {
  console.log(`no case source found for ${target}`);
  process.exit(0);
}

/*
 * 🛑 STRIP COMMENTS FIRST. A fix to a wrong label is normally documented beside
 * it — "this said 'Cancel whole order', the app says 'Cancel my whole order'" —
 * and an uncommented scan then re-reports the quoted OLD label on every
 * subsequent run. The helper would grow noisier with every defect it helped
 * fix, which is precisely backwards.
 *
 * Same failure the wiring audit had: a rule that reads its own documentation as
 * evidence cannot be satisfied, because fixing something correctly and
 * describing the fix become mutually exclusive.
 */
caseSrc = caseSrc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/*
 * Single-quoted runs inside a double-quoted TS string are the project's
 * convention for QUOTING THE SCREEN — 'Add to Cart', 'Sold & Ended'. That makes
 * them a far better signal than every double-quoted string, most of which are
 * prose.
 */
const candidates = new Set();
for (const m of caseSrc.matchAll(/'([^']{3,40})'/g)) {
  const s = m[1].trim();
  if (!/[A-Za-z]/.test(s)) continue;
  if (!/^[A-Z]/.test(s)) continue; // a control label starts capitalised
  if (/^(BEFORE|AFTER|QA)\b/.test(s)) continue; // authoring vocabulary
  if (/\.$/.test(s)) continue; // a sentence, not a label
  candidates.add(s);
}

/* Everything a label could legitimately live in. */
/*
 * 🛑 `messages/` IS A SOURCE OF LABELS AND WAS MISSING. Plenty of user-facing
 * text is not a literal in a component — `AboutView` renders
 * `labels.valuesLinkLabel`, and the actual words live in `messages/en.json` as
 * "How we hold ourselves to this →".
 *
 * Without that root the checker reported the string as found NOWHERE, which is
 * its loudest verdict, on a label that is real and correct. This file's own
 * closing note already admitted "i18n strings live outside these files" — but
 * an admitted blind spot still costs a lookup every time it fires, and here it
 * nearly cost a correct case being rewritten to match a string I would have
 * gone looking for instead.
 */
const ROOTS = [resolve(REPO, "src"), resolve(REPO, "appkit/src"), resolve(REPO, "messages")];
/*
 * `appkit/src/seed` is deliberately NOT skipped: a case legitimately quotes a
 * seeded product title ('Beyblade X BX-34 Dran Buster (Sold Out)'), and
 * excluding the fixtures reported 8 of those as missing — noise that buries the
 * two real hits. Only the CASE files are excluded, or every string would match
 * itself and nothing would ever be reported.
 */
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "seed-data"]);
let haystack = "";
for (const root of ROOTS) {
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
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) stack.push(join(dir, e.name));
        continue;
      }
      if (!/\.(tsx?|json)$/.test(e.name)) continue;
      const p = join(dir, e.name);
      try {
        if (statSync(p).size < 2_000_000) haystack += readFileSync(p, "utf8");
      } catch {
        /* unreadable file is not a finding */
      }
    }
  }
}

/**
 * Does this label appear in source as a LABEL, not merely as a substring?
 *
 * 🛑 `haystack.includes(s)` is not good enough, and testing it proved so. The
 * three tab labels this whole helper was written to catch — 'Live', 'Open',
 * 'Closed' — all sail through a substring test, because "Live Item",
 * "Open Edition" and "Closed Early" exist in source. The checker reported the
 * page clean while the defect was sitting in it.
 *
 * So require a DELIMITED occurrence: a complete quoted string, or JSX text
 * between tags. "Live Item" then no longer vouches for 'Live'.
 */
function appearsAsLabel(s) {
  const esc = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(["'\`])${esc}\\1|>\\s*${esc}\\s*<`).test(haystack);
}

/*
 * A NEAR match: the literal occurs in source but not as a complete delimited
 * label. That is almost always trailing punctuation ("No confirmed bugs yet."
 * vs the case's "No confirmed bugs yet") or a prefix of a longer label ("Bug
 * Hunters" inside "Bug Hunters Leaderboard — LetItRip"). Both cost a source
 * lookup to dismiss, and both were dismissed on 2026-09-29 — so separate them
 * from the literals that occur NOWHERE, which are the ones worth reading.
 *
 * Deliberately still reported rather than passed: a near match can also be a
 * real drift, e.g. a label that gained a word the case does not expect.
 */
function occursAnywhere(s) {
  return haystack.includes(s);
}

const unmatched = [...candidates].filter((s) => !appearsAsLabel(s)).sort();
const missing = unmatched.filter((s) => !occursAnywhere(s));
const near = unmatched.filter(occursAnywhere);

console.log(`${target}: ${candidates.size} quoted label(s) checked`);
if (unmatched.length === 0) {
  console.log("  ✓ every one appears somewhere in src/ or appkit/src/");
  process.exit(0);
}
if (missing.length) {
  console.log(`  ${missing.length} not found ANYWHERE — READ EACH against the source before changing anything:`);
  for (const s of missing) console.log(`    '${s}'`);
}
if (near.length) {
  console.log(`  ${near.length} near match (present in source, but not as a complete label — usually punctuation or a longer label):`);
  for (const s of near) console.log(`    ~ '${s}'`);
}
console.log("");
console.log("  Absent is not wrong: interpolated labels, i18n strings and seeded");
console.log("  titles all live outside these files, and a step may quote prose.");

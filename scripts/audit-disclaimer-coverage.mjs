#!/usr/bin/env node
/**
 * audit-disclaimer-coverage — strict zero.
 *
 * ## Two rules
 *
 * **R1 — a MOUNTED surface must keep its disclaimer.** Each pair below names a
 * component file and the `DisclaimerId` it renders today. If the
 * `<Disclaimer id="…">` disappears from that file, this fails. These are the
 * live legal-exposure surfaces, and the whole point of the registry is that
 * removing one is a decision somebody has to defend rather than a tidy-up
 * nobody notices.
 *
 * **R2 — every registry entry NAMES A LIMIT OR AN EXCLUSION.** Rule 2 of the
 * registry's own header: a disclaimer that only says "we try our best"
 * qualifies nothing and is worse than none, because it reads as cover while
 * providing none. Checked by requiring one of a small set of limiting words.
 *
 * ## 🛑 What this deliberately does NOT do
 *
 * It does not demand a disclaimer on every surface listed in an entry's
 * `surfaces` array. Those are a REVIEWER'S note — some name routes, some name
 * concepts ("obligation notifications"), and several name components that do
 * not exist yet. Treating them as a coverage requirement would produce a wall
 * of failures for work nobody has asked for, which is the report-only sweep
 * `audit-search-collection-coverage`'s header argues against. R1's pairs are
 * the ones actually wired, and a new mount adds a pair.
 *
 * It also does not check PLACEMENT ("above the fold"), because nothing static
 * can. The placement rule lives in the registry header and in a 🛑 at each
 * call site, where a reviewer reads it.
 *
 * ## Negative control
 *
 * Delete `<Disclaimer id="scam-registry" />` from `ScamProfileView.tsx` and
 * confirm R1 fails naming that file. Change an entry's body to "We do our
 * best." and confirm R2 fails naming that id. An audit nobody has seen fail is
 * decoration (Root Cause #87) — and this one's own first draft passed in
 * exactly the state it exists to catch, because it read the registry file and
 * found the id there.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APPKIT = join(ROOT, "appkit", "src");

const REGISTRY = join(APPKIT, "_internal", "shared", "content", "disclaimers.ts");

/**
 * R1 — surfaces that render a disclaimer today, and must keep doing so.
 *
 * 🛑 Add a pair when you mount one. Not adding it is not a failure here (this
 * audit cannot know what you intended), which is why the registry header asks
 * for it — but a pair that IS here is a guarantee.
 */
const MOUNTED = [
  { file: "features/scams/components/ScamProfileView.tsx", id: "scam-registry" },
  { file: "features/scams/components/ScamRegistryView.tsx", id: "scam-registry" },
  { file: "features/cart/components/StoreAddonsPicker.tsx", id: "protection-cover" },
  { file: "features/products/components/PrizeDrawDetailPageView.tsx", id: "prize-draw" },
  { file: "features/admin/components/AdminInvoicingView.tsx", id: "accounting-output" },
];

/**
 * R2 — words that make a sentence limiting rather than reassuring.
 *
 * 🛑 Deliberately a LIST of plain words rather than a cleverer test. The
 * failure mode of a cleverer test is a false pass, and a false pass here means
 * a disclaimer that qualifies nothing shipped on a page that needed one.
 */
const LIMIT_WORDS = [
  // Outright negation.
  "not ",
  "never",
  "cannot",
  "no guarantee",
  "not liable",
  // Boundaries.
  "only",
  "except",
  "void",
  "within",
  "up to",
  "until",
  "ineligible",
  "restrict",
  "exclude",
  /*
   * 🛑 These four were ADDED after running the rule, and the reason is worth
   * keeping: the first list flagged four of the registry's own entries, and
   * THREE of them did name a limit — in constructions the list simply lacked.
   *
   *   - `pre-order`  "refundable **until** the item ships"
   *   - `emi`        "**may** suspend access … **rather than** a bank"
   *   - `tax-computation`  "your own tax position **is yours** to determine"
   *   - `automated-decision`  "by a time limit **rather than** by a person"
   *
   * A rule that flags three correct entries out of four is the shape that
   * gets an audit ignored (Root Cause #84's mirror case, and the same mistake
   * `audit-published-number-literals` made with 38 false positives out of 43).
   * Widened, then re-verified against a genuinely empty reassurance — "We do
   * our best." still fails, which is what makes the widening safe rather than
   * merely quieter.
   */
  "rather than",
  "may ",
  "estimate",
  "is yours",
];

const violations = [];

// ── R1 ───────────────────────────────────────────────────────────────────────
for (const { file, id } of MOUNTED) {
  const full = join(APPKIT, file);
  if (!existsSync(full)) {
    violations.push({
      rule: "R1_FILE_MISSING",
      where: file,
      detail: `registered as rendering <Disclaimer id="${id}"> but the file does not exist`,
    });
    continue;
  }
  const src = readFileSync(full, "utf8");
  /*
   * 🛑 Matches the JSX USE, not the mere presence of the id string. The id
   * appears in the 🛑 comment above every one of these mounts, so a
   * substring search for the id would pass on a file where the component had
   * been deleted and only the explanation remained — which is the
   * `audit-observability-registration` failure (a commented-out registration
   * counting as present) and the reason that audit had to be rewritten.
   */
  const used = new RegExp(`<Disclaimer\\s[^>]*id=["']${id}["']`).test(src);
  if (!used) {
    violations.push({
      rule: "R1_DISCLAIMER_REMOVED",
      where: file,
      detail: `no <Disclaimer id="${id}"> found. This is a live legal-exposure surface — removing it is a decision, not a tidy-up.`,
    });
  }
}

// ── R2 ───────────────────────────────────────────────────────────────────────
if (!existsSync(REGISTRY)) {
  violations.push({
    rule: "R2_REGISTRY_MISSING",
    where: relative(ROOT, REGISTRY),
    detail: "the disclaimer registry does not exist",
  });
} else {
  const src = readFileSync(REGISTRY, "utf8");
  /*
   * Entries are `"kebab-id": { … body: "…" … }`. Parsed by locating each
   * quoted key followed by `: {`, then reading its `body:` string — a brace
   * walk would be more correct and is not needed: the bodies are plain
   * concatenated string literals with no nested objects.
   */
  const entryRe = /"([a-z0-9-]+)":\s*\{/g;
  let m;
  while ((m = entryRe.exec(src)) !== null) {
    const id = m[1];
    const rest = src.slice(m.index, m.index + 4000);
    const bodyMatch = /body:\s*((?:"(?:[^"\\]|\\.)*"\s*\+?\s*)+)/.exec(rest);
    if (!bodyMatch) {
      violations.push({
        rule: "R2_NO_BODY",
        where: `DISCLAIMERS["${id}"]`,
        detail: "entry has no `body`",
      });
      continue;
    }
    const body = bodyMatch[1].toLowerCase();
    if (!LIMIT_WORDS.some((w) => body.includes(w))) {
      violations.push({
        rule: "R2_NO_LIMIT_NAMED",
        where: `DISCLAIMERS["${id}"]`,
        detail:
          "the body names no limit or exclusion. A disclaimer that only reassures " +
          "qualifies nothing and is worse than none — it reads as cover while " +
          "providing none. Name what is NOT covered, or what the ceiling is.",
      });
    }
  }
}

if (violations.length === 0) {
  console.log(
    `[audit-disclaimer-coverage] OK: ${MOUNTED.length} mounted surface(s) intact, every entry names a limit`,
  );
  process.exit(0);
}

console.error("\n[audit-disclaimer-coverage] STRICT-ZERO violation(s):\n");
for (const v of violations) {
  console.error(`  [${v.rule}] ${v.where}`);
  console.error(`    ${v.detail}\n`);
}
process.exit(1);

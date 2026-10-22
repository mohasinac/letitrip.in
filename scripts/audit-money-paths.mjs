#!/usr/bin/env node
/**
 * audit-money-paths — the invariants that keep the four money paths agreeing.
 *
 * Before this, the registry carried exactly ONE money audit
 * (`audit-money-units`, a unit-scale rule), and every structural invariant this
 * codebase has paid for was held by convention alone. Root Cause #75 is the
 * canonical instance: `unitPriceFor` documents itself as "the single source of
 * truth for what do we charge for this line", and four hand-rolled copies of
 * its expression existed anyway — two of which had never learned about
 * `lockedPrice`, so a buyer who negotiated a price was quoted the agreed amount
 * and CHARGED the list price, with nothing erroring.
 *
 * ## 🛑 The plan named two functions that no longer exist
 *
 * R1 was specified against `createRazorpayGroupOrder` and
 * `verifyAndPlaceRazorpayOrderAction`. The gateway moved to PhonePe; the real
 * members are `createPhonePeGroupOrder` and `verifyAndPlaceGatewayOrderAction`.
 * The rule's INTENT is unchanged — a term in some paths and not others — but a
 * rule seeded from the stale names would have checked three paths of five and
 * reported clean (Root Cause #84: a measurement narrower than the rule it
 * feeds).
 *
 * ## The rules
 *
 *   R1 TERM_PARITY              a fee term in some money paths but not all
 *   R2 HANDROLLED_LINE_PRICE    `? item.price : product.price`, or `price *
 *                               quantity`, outside `order-math.ts`
 *   R3 INLINE_COMMISSION_MATH   arithmetic on `commissions.*` outside
 *                               `fees/calculator.ts`
 *   R4 DOUBLE_ROUNDING          `roundRupees` applied to its own result
 *   R5 GROUP_INVARIANT_ACCUM    `+=` in an order-group loop whose right side
 *                               names nothing group-scoped
 *   R7 LIVE_RATE_IN_HISTORICAL  a live `siteSettings` rate read in a payout /
 *                               invoice / GSTR-1 / report path
 *
 * 🛑 **R6 RATE_LITERAL IS NOT IMPLEMENTED, deliberately.** It was specified as
 * "a percentage or fee literal in logic, not in the pricing registry" — and
 * there is no pricing registry yet; that is Part 9b/9c, which this audit is
 * supposed to PRECEDE. A rule pointing at a destination that does not exist
 * can only say "move it somewhere that isn't there". Worse, every honest draft
 * of it flagged `/ 100` in percentage math, `* 0.18` in GST, and every
 * `Math.min(50, …)` page cap — noise that teaches people to skip the whole
 * audit (the nine-false-positives-of-eleven lesson from
 * `lister-opts-forwarding`). It lands WITH the registry it needs.
 *
 * ## Process, per the three rules this plan set for itself
 *
 * - Every ratchet below is seeded from a RUN OF THIS RULE, never from the grep
 *   used while designing it (#84).
 * - Every rule was broken on purpose and watched to fail (#87/#92).
 *
 *   🛑 R1's FIRST control passed, and the control was wrong rather than the
 *   rule. It renamed `platformFee` in one destructure — and the term appears
 *   again later in the same function, so parity still held. A control has to
 *   remove the thing ENTIRELY from one path, which is what the probe-term
 *   version does (inject a unique identifier into one body, declare it a
 *   parity term, watch 1-of-5 fail). The identical shape as the control that
 *   "passed" on `audit-text-as-label` because the violation was injected into
 *   a file still inside its allowance: when a control passes, suspect the
 *   control first.
 * - R2 and R5 walk a comment- and string-stripped source, because a regex over
 *   raw text matches its own docstring. This audit's siblings have been wrong
 *   that way twice.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/**
 * The five surfaces that must agree about what a cart costs.
 *
 * 🛑 Named by FUNCTION, not by file: four of the five live in one 4,782-line
 * module, and a file-level rule would say nothing about which of them is
 * missing a term.
 */
const MONEY_PATHS = [
  { fn: "previewCheckoutPricing", file: "appkit/src/_internal/server/features/checkout/actions.ts", role: "what the buyer is shown" },
  { fn: "createOrderForGroup", file: "appkit/src/_internal/server/features/checkout/actions.ts", role: "manual / COD / EMI order" },
  { fn: "createPhonePeGroupOrder", file: "appkit/src/_internal/server/features/checkout/actions.ts", role: "gateway order" },
  { fn: "verifyAndPlaceGatewayOrderAction", file: "appkit/src/_internal/server/features/checkout/actions.ts", role: "post-capture amount guard" },
  { fn: null, file: "src/app/api/payment/create-order/route.ts", role: "what the gateway captures" },
];

/**
 * Terms every money path must mention, derived from the fee helpers rather
 * than typed: a fee the calculator can compute and one path never names is the
 * add-on-fee bug of Root Cause #65 waiting to happen.
 *
 * 🛑 A SMALL, seeded set. The first draft diffed every money-ish identifier
 * across the five paths and produced 60+ findings, nearly all legitimate local
 * variables. A rule's job here is the terms whose ABSENCE is a charge going
 * uncollected or uncredited.
 */
const PARITY_TERMS = [
  "platformFee",
  "pointsApplied",
];

const ORDER_MATH = "appkit/src/_internal/shared/checkout/order-math.ts";
const FEES_CALCULATOR = "appkit/src/_internal/shared/fees/calculator.ts";

/**
 * Paths whose figures must come from the RECORD, never from live settings.
 *
 * A payout recomputed at today's commission rate pays a different amount than
 * the order recorded, and an invoice reprinted after a GST change states a tax
 * that was never charged. Both are silent: the number is simply different.
 */
const HISTORICAL_READ_DIRS = [
  "appkit/src/_internal/server/features/payouts",
  "appkit/src/_internal/server/features/invoicing",
  "appkit/src/features/payouts",
  "appkit/src/features/invoicing",
  "src/app/api/admin/invoicing",
  "src/app/api/admin/payouts",
];

/**
 * Known-and-accepted R7 reads, seeded FROM A RUN of the rule.
 *
 * 🛑 A ratchet, not a baseline: each entry is named, and a NEW one fails. The
 * list may only shrink.
 */
const R7_KNOWN = new Set([]);

/**
 * R3's ratchet — **seeded from a run of this rule**, never from the grep used
 * while designing it (#84).
 *
 * All nine are the same shape: `commissions.<x>Percent / 100`, a percent→rate
 * conversion done at the call site and handed to a payout computation. They
 * are a real drift risk rather than noise — the platform fee acquired a CAP
 * (`platformFeeMax`), and a site holding its own uncapped percentage is
 * exactly how the four buyer-facing paths drifted when that cap landed. None
 * of these nine applies it.
 *
 * 🛑 Staged rather than fixed in this commit for a reason the plan states
 * itself: 9a exists to land BEFORE Parts 3–6 touch money. Converting four
 * payout jobs mid-audit is a money change made under an audit that does not
 * yet guard it, which is the ordering this part was written to avoid. The
 * list names each one and a NEW one fails.
 *
 * 🛑 A ratchet, not a baseline: it may only shrink. `computePayoutDeduction`
 * in `fees/calculator.ts` is where these belong — note it is deliberately
 * UNCAPPED (the seller-side deduction is a separate commercial decision from
 * the buyer's capped fee), so the migration is a move, not a behaviour change.
 */
const R3_KNOWN = new Set([
  "appkit/src/_internal/server/features/checkout/actions.ts:1592",
  "appkit/src/_internal/server/jobs/core/autoPayoutEligibility.ts:180",
  "appkit/src/_internal/server/jobs/core/autoPayoutEligibility.ts:184",
  "appkit/src/_internal/server/jobs/core/weeklyPayoutEligibility.ts:147",
  "appkit/src/_internal/server/jobs/core/weeklyPayoutEligibility.ts:151",
  "appkit/src/features/seller/actions/seller-actions.ts:548",
  "appkit/src/features/seller/actions/seller-actions.ts:552",
  "appkit/src/features/seller/actions/seller-actions.ts:668",
  "appkit/src/features/seller/actions/seller-actions.ts:672",
]);

/* ───────────────────────── scanning helpers ───────────────────────── */

/**
 * Comment- and string-stripped source, via a state scanner.
 *
 * 🛑 Not two regexes. A block-comment-first strip reads a `/*` inside a LINE
 * comment as opening a comment that closes hundreds of lines later — which
 * cost `audit-dashboard-hub-coverage` six confident, entirely fictional
 * findings before it was written this way. Strings are blanked rather than
 * removed so column positions survive.
 */
function stripNonCode(src) {
  let out = "";
  let i = 0;
  let state = "code";
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (state === "code") {
      if (c === "/" && next === "/") { state = "line"; out += "  "; i += 2; continue; }
      if (c === "/" && next === "*") { state = "block"; out += "  "; i += 2; continue; }
      if (c === "'" || c === '"' || c === "`") { state = c; out += c; i += 1; continue; }
      out += c; i += 1; continue;
    }
    if (state === "line") {
      if (c === "\n") { state = "code"; out += c; } else out += " ";
      i += 1; continue;
    }
    if (state === "block") {
      if (c === "*" && next === "/") { state = "code"; out += "  "; i += 2; continue; }
      out += c === "\n" ? c : " ";
      i += 1; continue;
    }
    // inside a string: blank the content, keep the quotes and newlines
    if (c === "\\") { out += "  "; i += 2; continue; }
    if (c === state) { state = "code"; out += c; i += 1; continue; }
    out += c === "\n" ? c : " ";
    i += 1;
  }
  return out;
}

function read(rel) {
  const abs = join(ROOT, rel);
  return existsSync(abs) ? readFileSync(abs, "utf8") : null;
}

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next" || e.name === "dist") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(e.name)) out.push(full);
  }
  return out;
}

const rel = (abs) => relative(ROOT, abs).split(sep).join("/");

/**
 * The source of one function, found by brace-matching from its declaration.
 *
 * Returns `null` when the name is absent — which the caller treats as a FAILURE
 * rather than a skip. A money path that was renamed must break this audit
 * loudly; silently checking four of five is how R1 would report clean while
 * blind to the path that moved.
 */
function functionBody(code, name) {
  const decl = new RegExp(`(?:export\\s+)?(?:async\\s+)?function\\s+${name}\\s*\\(`).exec(code);
  if (!decl) return null;

  /*
   * 🛑 SKIP THE PARAMETER LIST FIRST. Taking the next `{` after the name finds
   * a DESTRUCTURED PARAMETER, not the body — and brace-matching from there
   * returns the parameter object as a two-line "function".
   *
   * That is not hypothetical: it is what this audit did on its first run.
   * `createOrderForGroup` and `createPhonePeGroupOrder` both take destructured
   * args, so R1 compared a parameter list against three real bodies and
   * reported `platformFee` and `pointsApplied` as missing from two of the five
   * money paths. Both terms are present — `platformFee` on the function's own
   * line 49, `pointsApplied` on 498.
   *
   * Two confident, entirely false findings about MONEY, from a parser shortcut.
   * The same lesson as `audit-dashboard-hub-coverage`'s comment scanner, which
   * is why this one walks the parens before it walks the braces.
   */
  let i = decl.index + decl[0].length - 1; // at the "("
  let paren = 0;
  for (; i < code.length; i++) {
    if (code[i] === "(") paren++;
    else if (code[i] === ")") { paren--; if (paren === 0) { i++; break; } }
  }

  const open = code.indexOf("{", i);
  if (open < 0) return null;
  let depth = 0;
  for (let j = open; j < code.length; j++) {
    if (code[j] === "{") depth++;
    else if (code[j] === "}") { depth--; if (depth === 0) return code.slice(open, j + 1); }
  }
  return null;
}

const violations = [];
const add = (rule, where, detail, hint) => violations.push({ rule, where, detail, hint });

/* ───────────────────────── R1 TERM_PARITY ───────────────────────── */
{
  const bodies = new Map();
  for (const path of MONEY_PATHS) {
    const src = read(path.file);
    if (src === null) {
      add("MISSING_MONEY_PATH", path.file, "(file not found)",
        "A money path this audit checks has moved. Update MONEY_PATHS — a stale\n" +
        "      entry silently stops checking the path it names.");
      continue;
    }
    const code = stripNonCode(src);
    const body = path.fn ? functionBody(code, path.fn) : code;
    if (body === null) {
      add("MISSING_MONEY_PATH", path.file, `function ${path.fn} not found`,
        `R1 compares five paths. With ${path.fn} missing it would compare four and\n` +
        "      report clean — exactly how a renamed path escapes the parity rule.");
      continue;
    }
    bodies.set(`${path.fn ?? "route"} (${path.role})`, body);
  }

  if (bodies.size === MONEY_PATHS.length) {
    for (const term of PARITY_TERMS) {
      const present = [...bodies.entries()].filter(([, b]) => b.includes(term)).map(([k]) => k);
      const absent = [...bodies.keys()].filter((k) => !present.includes(k));
      if (present.length > 0 && absent.length > 0) {
        add("TERM_PARITY", "checkout money paths", `"${term}" — in ${present.length}/${bodies.size}, missing from: ${absent.join("; ")}`,
          "A fee one path charges and another does not is a figure the buyer is shown\n" +
          "      or billed inconsistently. Root Cause #65: an add-on applied once per cart in\n" +
          "      one path and once per store in another took money that never reconciled.");
      }
    }
  }
}

/* ───────────────── R2 HANDROLLED_LINE_PRICE ───────────────── */
{
  const roots = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
  const TERNARY = /\?\s*item\.price\s*:\s*\w+\.price/;
  /*
   * 🛑 `product.price`, NOT `item.price` — and the difference is the whole
   * rule.
   *
   * The plan specified "`price * quantity` outside `order-math.ts`". Run
   * honestly, that matched NINE sites and **every one was correct**:
   *
   *  - `cartRepository.getSubtotal` — CLAUDE.md names this function as one
   *    that "stayed correct with no changes of their own", because
   *    `item.price` on a cart line is already the per-copy price the
   *    repository DERIVES at every write of `groupMembers`.
   *  - the OTP-threshold and COD-max checks in `createCheckoutOrderAction` —
   *    threshold comparisons over those same derived prices.
   *  - the invoice, order-detail and pre-order pages — rendering an ORDER
   *    item, whose price is a stored snapshot with no product to re-derive
   *    from.
   *
   * Converting any of them would have made the code worse. `item.price` is
   * the DERIVED value; multiplying it is the intended use. The bug Root Cause
   * #75 records is reaching past the derivation to the raw list price, which
   * is `product.price`. That is what this matches.
   *
   * The ternary above found ZERO sites, which is the other half of the same
   * result: that migration is finished, and this rule now keeps it finished.
   */
  const MULTIPLY = /\bproduct\.price\s*\*\s*\w*\.?\bquantity\b/;
  for (const root of roots) {
    for (const abs of walk(root)) {
      const r = rel(abs);
      if (r === ORDER_MATH) continue;
      const code = stripNonCode(readFileSync(abs, "utf8"));
      code.split(/\r?\n/).forEach((line, i) => {
        if (TERNARY.test(line)) {
          add("HANDROLLED_LINE_PRICE", `${r}:${i + 1}`, line.trim().slice(0, 110),
            "Re-derives `unitPriceFor`. The copies that existed had the bundle branch and\n" +
            "      NOT the locked-price one, so a negotiated price was quoted and the LIST\n" +
            "      price captured (Root Cause #75). Call `lineTotalFor(item, product)`.");
        } else if (MULTIPLY.test(line)) {
          add("HANDROLLED_LINE_PRICE", `${r}:${i + 1}`, line.trim().slice(0, 110),
            "A line total multiplied at the call site. `lineTotalFor` exists so the\n" +
            "      multiplication lives inside the definition — exporting a factor the caller\n" +
            "      must still combine is what let thirteen sites drift.");
        }
      });
    }
  }
}

/* ───────────────── R3 INLINE_COMMISSION_MATH ───────────────── */
/**
 * Which staged entries were actually seen this run.
 *
 * 🛑 A staged entry that no longer matches is REPORTED, not silently dropped.
 * Four audits in this repo once shared an inverted stale-check that deleted
 * from its own "stale" set on every branch, so each reported "now fixed" while
 * meaning "the file is gone" — and counted already-fixed entries as backlog.
 * A ratchet whose list cannot be trusted is not a ratchet.
 */
const r3Seen = new Set();
{
  const roots = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
  const MATH = /\bcommissions\.\w+\s*[*/+-]|[*/+-]\s*\w*\.?commissions\.\w+/;
  for (const root of roots) {
    for (const abs of walk(root)) {
      const r = rel(abs);
      if (r === FEES_CALCULATOR) continue;
      /* Schemas and field-name maps DECLARE the fields; they compute nothing. */
      if (/schemas\/firestore\.ts$|constants\/field-names\.ts$|seed\//.test(r)) continue;
      const code = stripNonCode(readFileSync(abs, "utf8"));
      code.split(/\r?\n/).forEach((line, i) => {
        if (MATH.test(line)) {
          const key = `${r}:${i + 1}`;
          if (R3_KNOWN.has(key)) { r3Seen.add(key); return; }
          add("INLINE_COMMISSION_MATH", key, line.trim().slice(0, 110),
            "Arithmetic on a commission rate outside `fees/calculator.ts`. Four paths did\n" +
            "      this and drifted the moment the platform-fee CAP landed — each kept its own\n" +
            "      uncapped expression. One helper per fee, no exceptions.");
        }
      });
    }
  }
}

/* ───────────────── R4 DOUBLE_ROUNDING ───────────────── */
{
  const roots = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
  const NESTED = /roundRupees\s*\(\s*roundRupees\s*\(/;
  for (const root of roots) {
    for (const abs of walk(root)) {
      const code = stripNonCode(readFileSync(abs, "utf8"));
      code.split(/\r?\n/).forEach((line, i) => {
        if (NESTED.test(line)) {
          add("DOUBLE_ROUNDING", `${rel(abs)}:${i + 1}`, line.trim().slice(0, 110),
            "`roundRupees` applied to its own result. Rounding twice can move a total by a\n" +
            "      rupee against a figure already shown to the buyer, and the amount-mismatch\n" +
            "      guard then refuses a payment that was correct.");
        }
      });
    }
  }
}

/* ───────────────── R5 GROUP_INVARIANT_ACCUM ───────────────── */
{
  /*
   * The shape of Root Cause #65: `x += f(...)` inside `for (const group of
   * orderGroups)` where nothing on the right-hand side varies with the group,
   * so one cart-wide charge is multiplied by the number of stores.
   *
   * Brace-walked, not line-matched: the loop body has to be delimited before
   * "inside the loop" means anything.
   */
  const src = read("appkit/src/_internal/server/features/checkout/actions.ts");
  if (src !== null) {
    const code = stripNonCode(src);
    const loopRe = /for\s*\(\s*const\s+(\w+)\s+of\s+[^)]*[Gg]roups?\b[^)]*\)\s*\{/g;
    let m;
    while ((m = loopRe.exec(code)) !== null) {
      const loopVar = m[1];
      const open = code.indexOf("{", m.index + m[0].length - 1);
      let depth = 0, end = -1;
      for (let i = open; i < code.length; i++) {
        if (code[i] === "{") depth++;
        else if (code[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
      }
      if (end < 0) continue;
      const body = code.slice(open, end + 1);
      const lineOf = (idx) => code.slice(0, open + idx).split("\n").length;
      for (const acc of body.matchAll(/^[^\n]*?\b(\w+)\s*\+=\s*([^;\n]+);/gm)) {
        const rhs = acc[2];
        if (rhs.includes(loopVar)) continue;
        /* A bare counter (`n += 1`) names nothing and charges nothing. */
        if (/^\s*[\d.]+\s*$/.test(rhs)) continue;
        add("GROUP_INVARIANT_ACCUM",
          `appkit/src/_internal/server/features/checkout/actions.ts:${lineOf(acc.index)}`,
          `${acc[1]} += ${rhs.trim().slice(0, 80)}`,
          `Accumulated per group, but nothing on the right varies with \`${loopVar}\`. Either\n` +
          "      it belongs OUTSIDE the loop, or its input needs to be per-group. Root Cause\n" +
          "      #65: one tick on a cart-wide add-on billed ₹10 × every store in the cart.");
      }
    }
  }
}

/* ───────────────── R7 LIVE_RATE_IN_HISTORICAL_READ ───────────────── */
{
  const LIVE_READ = /siteSettingsRepository\.getSingleton|getSiteSettings\s*\(|settings\.commissions|settings\.gst\b/;
  for (const dir of HISTORICAL_READ_DIRS) {
    const abs = join(ROOT, dir);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const r = rel(file);
      const code = stripNonCode(readFileSync(file, "utf8"));
      code.split(/\r?\n/).forEach((line, i) => {
        if (!LIVE_READ.test(line)) return;
        const key = `${r}:${i + 1}`;
        if (R7_KNOWN.has(key)) return;
        add("LIVE_RATE_IN_HISTORICAL_READ", key, line.trim().slice(0, 110),
          "A payout, invoice or return must state what was CHARGED, not what the rate is\n" +
          "      today. Read the record's own snapshot (`order.gst`, `order.platformFee`,\n" +
          "      `appliedDiscounts`), which is why those fields are snapshotted at all.");
      });
    }
  }
}

/* ───────────── stale ratchet entries ───────────── */
for (const key of R3_KNOWN) {
  if (!r3Seen.has(key)) {
    add("STALE_RATCHET_ENTRY", key, "(staged R3 entry no longer matches)",
      "Either it was fixed — delete the entry, the ratchet only shrinks — or the\n" +
      "      line moved and the entry now stages nothing. Both are silent otherwise,\n" +
      "      and a list that silently stops covering what it names is not a ratchet.");
  }
}

/* ───────────────────────── report ───────────────────────── */

violations.sort((a, b) => a.rule.localeCompare(b.rule) || a.where.localeCompare(b.where));

if (violations.length > 0) {
  console.error(`[audit-money-paths] FAIL: ${violations.length} violation(s).\n`);
  for (const v of violations) {
    console.error(`  ${v.where}  [${v.rule}]`);
    console.error(`      ${v.detail}`);
    console.error(`      ${v.hint}\n`);
  }
  process.exit(1);
}

console.log(
  `[audit-money-paths] OK: 0 new violations ` +
    `(${MONEY_PATHS.length} money paths, ${PARITY_TERMS.length} parity term(s), ` +
    `${R3_KNOWN.size} staged R3 site(s)).`,
);

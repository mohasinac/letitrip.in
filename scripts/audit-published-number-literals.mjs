#!/usr/bin/env node
/**
 * audit-published-number-literals — strict zero.
 *
 * ## What it blocks
 *
 * A BUYER-FACING number re-stated as a literal in copy that the published-value
 * registry already owns: a refund timeline in business days, a return or
 * response window in days/hours, or the platform-fee cap in rupees.
 *
 * ## Why it exists
 *
 * Phase 9 found the same fact published in four places with different answers.
 * The refund timeline was "5–7 business days via Razorpay" on the policy page
 * (naming a gateway that was not the one in use), "5–7 business days" in
 * `REFUND_COPY`, and "3–5 business days" in the FAQ. The seller's
 * return-response window was 48 hours in the FAQ and 3 days in a staff guide.
 * The offer deadline was 48h in code and 24h in both the FAQ and the seed.
 *
 * Tokenising them fixes today. This stops tomorrow: the FAQ answers are seeded
 * and then ADMIN-EDITABLE, so a number typed into one drifts after deployment
 * with nothing able to see it — and a developer adding a fifth surface has no
 * reason to know a registry exists.
 *
 * ## 🛑 Scope is deliberately narrow, and widening it would make it useless
 *
 * It scans the files that CARRY published copy, not the whole repo:
 *
 *   - `appkit/src/seed/faq-seed-data.ts`
 *   - `appkit/src/_internal/shared/features/orders/refund-copy.ts`
 *   - `appkit/src/features/**` guide and policy VIEWS
 *   - `messages/*.json`
 *
 * A number in a test fixture, a schema default, a comment or an audit script is
 * not published copy. Flagging those is how an audit acquires nine false
 * positives out of eleven and gets ignored along with its two real ones
 * (Root Cause #84's `lister-opts-forwarding` first draft).
 *
 * 🛑 COMMENTS ARE STRIPPED FIRST. Every 🛑 note added by Phase 9 explains the
 * contradiction it fixed by QUOTING the old numbers — "said 48 hours while the
 * guide said 3 days" — so an audit that read comments would fail on its own
 * documentation. That is the mistake `audit-observability-registration` made
 * (a commented-out registration counted as present, so it reported OK in
 * exactly the state it existed to catch).
 *
 * ## Negative control
 *
 * Add `<p>processed within 3–5 business days</p>` to an FAQ answer and confirm
 * this fails, naming the file, the line and the token to use instead. Then
 * remove it and confirm it passes. An audit nobody has seen fail is decoration
 * (Root Cause #87).
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** Files and directories that carry PUBLISHED copy. */
const TARGETS = [
  { path: join(ROOT, "appkit", "src", "seed", "faq-seed-data.ts"), kind: "file" },
  {
    path: join(
      ROOT, "appkit", "src", "_internal", "shared", "features", "orders", "refund-copy.ts",
    ),
    kind: "file",
  },
  { path: join(ROOT, "messages"), kind: "dir", ext: ".json" },
];

/**
 * Guide/policy views, which restate windows in prose.
 *
 * Matched by NAME rather than by scanning all of `features/`: a component
 * called `*GuideView` or `*PolicyView` exists to publish prose, and everything
 * else in there is a control surface where a number is a label on a field.
 */
const VIEW_DIR = join(ROOT, "appkit", "src", "features");
const VIEW_NAME = /(GuideView|PolicyView|FeesView)\.tsx$/;

/**
 * The rules. Each names the token a developer should reach for instead —
 * a failure message that only says "no" costs a round trip to find out what
 * to do.
 */
const RULES = [
  {
    id: "REFUND_TIMELINE_LITERAL",
    /*
     * 🛑 SCOPED TO A REFUND CONTEXT, and the first draft was not — it matched
     * any "N business days" and produced **43 hits of which about five were
     * real**. The rest were different facts entirely: shipping timelines
     * ("most sellers ship within 1–3 business days"), dispatch windows, bank
     * reversal estimates, specialist-courier transit. Tokenising those would
     * have published the REFUND timeline as the shipping estimate.
     *
     * That is Root Cause #84's mirror case — a rule LOUDER than the truth —
     * and the ratio is the point: an audit with 38 false positives out of 43
     * is worse than none, because the five real ones get dismissed along with
     * the rest. The fix is to require the word `refund` within the same
     * sentence, which is what distinguishes "your money comes back in N days"
     * from "your parcel leaves in N days".
     *
     * Measured after narrowing: the count dropped to the ones about refunds.
     * Generating the list from the rule protects you from typing it wrong; it
     * does not protect you from the rule being wrong.
     */
    re: /\brefund(?:ed|s)?\b[^.<]{0,120}?\b\d+\s*(?:[–\-—]\s*\d+\s*)?business\s+days?\b|\b\d+\s*(?:[–\-—]\s*\d+\s*)?business\s+days?\b[^.<]{0,120}?\brefund(?:ed|s)?\b/gi,
    token: "{{refundBusinessDaysMin}}–{{refundBusinessDaysMax}}",
    why: "the refund timeline was published three different ways",
  },
  {
    id: "RESPONSE_WINDOW_LITERAL",
    // "has 48 hours to respond", "has 3 days to respond"
    re: /\bhas\s+\d+\s+(?:hours?|days?)\s+to\s+respond\b/gi,
    token: "{{returnRespondHours}}",
    why: "the seller's return-response window was 48h in the FAQ and 3 days in a guide",
  },
  {
    id: "PLATFORM_FEE_CAP_LITERAL",
    // "capped at ₹10"
    re: /\bcapped\s+at\s+₹\s*[\d,]+/gi,
    token: "{{platformFeeMax}}",
    why: "`commissions.platformFeeMax` is admin-editable, so a literal is wrong the moment it changes",
  },
  {
    id: "OFFER_DEADLINE_LITERAL",
    // "locked ... for 24 hours"
    re: /\blocked[^.<]{0,60}\bfor\s+\d+\s+hours?\b/gi,
    token: "{{offerCheckoutHours}}",
    why: "the offer deadline was 24h in copy and 48h in the code that enforces it",
  },
];

/**
 * 🛑 Strip comments BEFORE matching. Phase 9's own 🛑 notes quote the old
 * numbers to explain what they fixed, so a comment-blind scan would fail on
 * its own documentation.
 *
 * Block comments first, then line comments. Newlines are preserved so the
 * reported line numbers stay correct — replacing a multi-line comment with
 * nothing would shift every line after it, and a report pointing at the wrong
 * line is worse than no report.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

function collectFiles() {
  const files = [];
  for (const target of TARGETS) {
    if (!existsSync(target.path)) continue;
    if (target.kind === "file") {
      files.push(target.path);
      continue;
    }
    for (const name of readdirSync(target.path)) {
      if (target.ext && !name.endsWith(target.ext)) continue;
      const full = join(target.path, name);
      if (statSync(full).isFile()) files.push(full);
    }
  }
  // The guide/policy views.
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (VIEW_NAME.test(name)) files.push(full);
    }
  };
  walk(VIEW_DIR);
  return files;
}

/**
 * 🛑 A rail's own speed is NOT a window we set, and must not be tokenised.
 *
 * "UPI refunds are typically faster (1–2 business days)" is a fact about
 * NPCI's rail, not a promise LetItRip controls. Tokenising it would make it
 * drift with OUR refund timeline — so a change to the window we do control
 * would silently restate a third party's performance. That is worse than the
 * literal.
 *
 * Measured while narrowing this rule: after scoping to a refund context the
 * count went 43 → 8 → 2, and both survivors were this case. Excluding them is
 * the difference between a rule that is right and a rule that is merely
 * quieter.
 *
 * NEFT/IMPS get the same exemption for the same reason.
 */
const RAIL_SPEED = /\b(UPI|NEFT|IMPS|RTGS)\b/i;

const violations = [];
for (const file of collectFiles()) {
  const raw = readFileSync(file, "utf8");
  const src = file.endsWith(".json") ? raw : stripComments(raw);
  const lines = src.split("\n");
  for (const rule of RULES) {
    lines.forEach((line, i) => {
      rule.re.lastIndex = 0;
      const m = rule.re.exec(line);
      if (!m) return;
      /*
       * Scoped to the MATCH plus a little either side, not the whole line: an
       * FAQ answer is one long line, so testing the line would exempt every
       * number in any answer that mentions UPI anywhere — which would hide
       * the card timeline sitting in the same sentence.
       */
      const around = line.slice(
        Math.max(0, m.index - 60),
        m.index + m[0].length + 60,
      );
      if (rule.id === "REFUND_TIMELINE_LITERAL" && RAIL_SPEED.test(around)) return;
      violations.push({
        file: relative(ROOT, file),
        line: i + 1,
        rule: rule.id,
        text: m[0].trim(),
        token: rule.token,
        why: rule.why,
      });
    });
  }
}

if (violations.length === 0) {
  console.log(
    "[audit-published-number-literals] OK: no published number restated as a literal",
  );
  process.exit(0);
}

console.error("\n[audit-published-number-literals] STRICT-ZERO violation(s):\n");
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
  console.error(`    found: "${v.text}"`);
  console.error(`    use:   ${v.token}`);
  console.error(`    why:   ${v.why}\n`);
}
console.error(
  "Published numbers have ONE definition: `resolvePublishedValues()` in\n" +
    "appkit/src/_internal/shared/content/published-values.ts. Copy carries a\n" +
    "{{token}} and the renderer resolves it — the FAQ answers are seeded and\n" +
    "then ADMIN-EDITABLE, so a literal there drifts after deployment with\n" +
    "nothing able to see it.\n",
);
process.exit(1);

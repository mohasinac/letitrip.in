#!/usr/bin/env node
/**
 * A privileged write that leaves no record — Part 14, A5.
 *
 * `adminAuditLog` answers *"what have admins done lately"*, and it answers it
 * only for acts somebody instrumented. 13 actions, 13 writers, 1:1 — healthy
 * as far as it goes. The gap is the write paths that record NOTHING, and that
 * gap is invisible: a route with no `recordAdminAction` looks exactly like a
 * route that does not need one.
 *
 * ## 🛑 What counts as privileged here
 *
 * NOT "every admin route" — that would flag ~240 files, most of them
 * legitimate content edits, and a rule that flags everything gets disabled.
 * Three narrower tests, each naming a thing somebody would later be asked
 * about:
 *
 *   MONEY   — it moves, withholds or forgives value
 *   ACCESS  — it changes who can do what
 *   POLICY  — it changes a rule the platform applies to other people
 *
 * ## 🛑 Seeded from a RUN, never from a hand survey
 *
 * Root Cause #84, twice over in this plan alone: a "37" that measured 4 and a
 * "240" that measured 142. The ratchet below is whatever this rule printed on
 * its first clean run — so removing an entry is progress and adding one is
 * the thing being blocked.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const API = join(ROOT, "src", "app", "api");

/**
 * Verbs that change something. A GET is never privileged in this sense —
 * reading an admin list is gated by `roles`, not by an audit trail.
 */
const WRITE_VERB = /export\s+const\s+(POST|PUT|PATCH|DELETE)\b|export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/;

/**
 * Path fragments that mean money, access or policy.
 *
 * 🛑 Matched on the ROUTE PATH rather than on body content. A path is stable
 * and reviewable; guessing from identifiers inside the handler would make the
 * rule's coverage depend on how a given file happens to be written, which is
 * the entry-condition trap (Root Cause #56).
 */
const PRIVILEGED = [
  // money
  "payouts", "refund", "points", "coupons", "pricing", "commission",
  "checkout-bypass", "deduction", "invoicing", "payment-cases",
  // access
  "roles", "permissions", "team", "ban", "users/", "sessions",
  // policy
  "site", "tax-codes", "dispute-reasons", "scammers", "moderation",
];

/** Comment-stripped, so a commented-out call cannot count as instrumentation. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name === "route.ts") out.push(full);
  }
  return out;
}

/**
 * 🛑 EMPTY, and that is a finished migration rather than a rule gone quiet.
 *
 * Seeded at **14** from this rule's own first run and drained to 0 in the
 * same session: coupons (create + edit), roles (create/update/delete), tax
 * codes (create + edit), session revocation, bulk user actions, order
 * refunds, payout deductions, soft-ban lifts, moderation decisions, payment
 * cases and scammer-profile edits.
 *
 * The distinction matters — `pii-coverage`'s entry in CLAUDE.md exists to
 * make exactly this point. An empty set here means the rule is STRICT: the
 * next unlogged privileged admin write fails the build. Verified by control
 * rather than assumed.
 */
const KNOWN = new Set([]);

/**
 * Every exported function living in a file that calls `recordAdminAction`.
 *
 * Built once by walking appkit's source; the names are what a route would
 * have to call to be instrumented one hop away.
 */
const LOGGING_FNS = (() => {
  const names = new Set();
  const walkTs = (dir, out = []) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return out;
    }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walkTs(full, out);
      else if (e.name.endsWith(".ts")) out.push(full);
    }
    return out;
  };
  for (const abs of walkTs(join(ROOT, "appkit", "src"))) {
    const src = stripComments(readFileSync(abs, "utf8"));
    if (!/recordAdminAction\s*\(/.test(src)) continue;
    for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)) names.add(m[1]);
    for (const m of src.matchAll(/export\s+const\s+(\w+)\s*=/g)) names.add(m[1]);
  }
  names.delete("recordAdminAction");
  return [...names];
})();

const found = [];
const seen = new Set();

for (const abs of walk(API)) {
  const rel = relative(ROOT, abs).split("\\").join("/");
  /*
   * 🛑 `api/admin/` ONLY, and the scoping is not a convenience.
   *
   * `adminAuditLog`'s own header says what it is: *"a queryable record of
   * high-value privileged ADMIN actions"* — the question it answers is "what
   * have admins done lately". A buyer claiming a coupon or spending their own
   * points is not an admin act, and a seller editing their own store's coupon
   * is self-service.
   *
   * Without this the rule reported 24, of which nine were
   * `api/cart/points`, `api/user/coupons/*`, `api/store/coupons/*` and
   * `api/coupons/validate` — correct code, flagged because the PATH matched a
   * money word. Those acts are not unrecorded; they are recorded somewhere
   * else, and demanding an admin-audit row for them would put a buyer's
   * routine action in the log an admin scans for abuse.
   */
  if (!rel.startsWith("src/app/api/admin/")) continue;
  if (!PRIVILEGED.some((p) => rel.includes(p))) continue;

  const code = stripComments(readFileSync(abs, "utf8"));
  if (!WRITE_VERB.test(code)) continue;

  /*
   * Instrumented EITHER directly, or by an action it calls. A route that
   * delegates to `hardBanCascade` is logged by the cascade — demanding the
   * call appear in the route file would flag correct code and push people
   * toward duplicating the log.
   */
  if (/recordAdminAction\s*\(/.test(code)) continue;
  /*
   * 🛑 ONE HOP. Instrumentation usually lives in the ACTION a route calls,
   * not in the route file — `/admin/pricing` logs inside `applyRateChange`,
   * `/admin/coupons/[id]` inside `adminUpdateCoupon`.
   *
   * The first run of this rule reported 32 routes and roughly two thirds
   * were correct code logging one level down. A rule that is wrong more
   * often than it is right gets disabled, and then the handful of real gaps
   * go with it (Root Cause #56 — an entry condition is a claim about
   * coverage that nothing checks).
   *
   * This OVER-exempts: any call to a function whose defining file logs
   * counts, even if that particular function does not. That direction is
   * deliberate — a false negative leaves a gap visible to the next person
   * who looks, a false positive trains people to ignore the output.
   */
  if (LOGGING_FNS.some((fn) => code.includes(`${fn}(`))) continue;
  /*
   * 🛑 A route whose whole job is enqueuing a job is logged by the RUNNER.
   * Flagging it would be flagging the wrong file, and the fix someone reached
   * for would be a second log entry for one act.
   */
  if (/enqueueJob\s*\(/.test(code)) continue;

  if (KNOWN.has(rel)) {
    seen.add(rel);
    continue;
  }
  found.push(rel);
}

const stale = [...KNOWN].filter((k) => !seen.has(k));

if (found.length === 0 && stale.length === 0) {
  console.log(
    `[audit-privileged-write-unlogged] OK — 0 new (${KNOWN.size} staged, all still present).`,
  );
  process.exit(0);
}

if (found.length > 0) {
  console.error(
    `\n[audit-privileged-write-unlogged] ${found.length} privileged write(s) with no audit record:\n`,
  );
  for (const f of found) {
    console.error(`  ${f}`);
    console.error(
      "      moves money, changes access, or changes a rule applied to other people,\n" +
        "      and records nothing. Add `recordAdminAction({ action, targetType, targetId })`\n" +
        "      — best-effort, never failing the underlying write.\n",
    );
  }
}

if (stale.length > 0) {
  /*
   * A staged entry that no longer matches is reported, not silently dropped.
   * Four audits in this repo once shared an inverted stale-check that deleted
   * from its own set on every branch — each reported "now fixed" while
   * meaning "the file is gone".
   */
  console.error(`\n  ${stale.length} staged entry/entries no longer found:`);
  for (const s of stale) console.error(`    ${s} — instrumented, or the route moved. Remove it from KNOWN.`);
  console.error("");
}

process.exit(1);

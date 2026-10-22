/*
 * The four tester identities, and the refusal that replaced their defaults.
 *
 * 🛑 THERE ARE NO HARDCODED CREDENTIALS HERE, AND THAT IS THE POINT.
 *
 * Until 2026-09-28 each identity carried a literal fallback in the file that used
 * it — `?? "admin@letitrip.in"`, `?? "TempPass123!"` — and NONE of the eight vars
 * existed in any env file. So the literals were what actually ran, every time,
 * while the code read as though it were configurable. Worse, the two files
 * disagreed: `fetch-cases.mjs` defaulted the bot to `admin@letitrip.in` while
 * `record-verdicts.mjs` defaulted the SAME two vars to `claude-tester@letitrip.in`,
 * a persona deleted on 2026-09-14. One of them could only ever fail.
 *
 * A silent fallback to the wrong identity is not a smaller bug than a crash; it is
 * a larger one. It is how 174 seller cases once ran as the buyer (commit e6a897c)
 * — every one produced a confident verdict about a page the case was not written
 * for, which is indistinguishable from real coverage. Exit 2 means "could not
 * check", which is the honest answer when the harness does not know who it is.
 *
 * This module exists so there is ONE owner. Two copies of a credential rule drift
 * the moment one of them is edited, which is the defect above, verbatim.
 *
 * @tag domain:tester
 * @tag layer:lib
 * @tag access:node-only
 * @tag consumers:fetch-cases.mjs, record-verdicts.mjs
 * @tag sideEffects:process.exit(2) on a missing var
 */

/** Every identity var, with what each one is FOR — printed on refusal. */
export const IDENTITY_VARS = [
  ["TESTER_BOT_EMAIL", "TESTER_BOT_PASSWORD", "reads the checklist, writes verdicts"],
  ["TESTER_BUYER_EMAIL", "TESTER_BUYER_PASSWORD", "default browsing identity, owns cart/orders/address"],
  ["TESTER_ADMIN_EMAIL", "TESTER_ADMIN_PASSWORD", "adminOnly batches — /admin pages redirect canTestAdmin"],
  ["TESTER_SELLER_EMAIL", "TESTER_SELLER_PASSWORD", "owns the seeded store, offers, payouts"],
];

function refuse(name) {
  console.error(`✗ ${name} is not set.`);
  console.error("");
  console.error("  The tester has no hardcoded identities. Set all eight in tester/.env:");
  for (const [emailVar, pwVar, why] of IDENTITY_VARS) {
    console.error(`    ${emailVar} / ${pwVar}`);
    console.error(`        ${why}`);
  }
  console.error("");
  console.error("  tester/.env is gitignored by the submodule's own .gitignore. Do NOT put these");
  console.error("  in the consumer .env.local — that file is read by the Vercel build.");
  console.error("");
  console.error("  A missing var is refused rather than defaulted, because browsing as the wrong");
  console.error("  identity still produces confident verdicts — about a page the case was never");
  console.error("  written for. That is worse than not running.");
  process.exit(2);
}

/**
 * Read a required credential, or exit 2.
 *
 * Exit 2 rather than 1 on purpose: throughout this harness 1 means "the thing
 * under test failed" and 2 means "could not check". A missing credential is
 * squarely the second, and collapsing them reports a broken harness as a broken
 * product.
 */
export function requireEnv(name) {
  const value = process.env[name];
  if (typeof value === "string" && value.trim() !== "") return value;
  refuse(name);
}

/**
 * Assert every identity is configured, before any of them is used.
 *
 * Fails on the FIRST missing var rather than the first one a code path happens to
 * reach — so a run cannot get four batches deep and then discover the seller
 * identity was never set.
 */
export function requireAllIdentities() {
  for (const [emailVar, pwVar] of IDENTITY_VARS) {
    requireEnv(emailVar);
    requireEnv(pwVar);
  }
}

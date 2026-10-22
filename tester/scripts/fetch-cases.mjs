#!/usr/bin/env node
/*
 * Fetch the tester checklist and slice it into per-PAGE batches.
 *
 * Usage (from the consumer repo root):
 *   node tester/scripts/fetch-cases.mjs --run <id>                  # every page
 *   node tester/scripts/fetch-cases.mjs --run <id> --phase 7
 *   node tester/scripts/fetch-cases.mjs --run <id> --page buying/cart --out batch.json
 *   node tester/scripts/fetch-cases.mjs --run <id> --group buying
 *   node tester/scripts/fetch-cases.mjs --run <id> --cases fails.txt   # re-verify a set
 *
 * 🛑 `--cases <file>` was UNDOCUMENTED here for its whole life, and the cost was
 * concrete: run 3 recorded 203 failures and had no way to re-drive them, so the
 * backlog was carried forward as prose instead. Generate the file with
 * `scripts/write-fail-list.mjs`. One id per line, `#` comments allowed, and an id
 * matching nothing is a hard error rather than a silent skip.
 *
 * Exit: 0 success, 1 errors during run, 2 misconfiguration.
 *
 * WHY per page and not per phase: phases run 9–91 cases (assignDefaultPhases never
 * splits a page), which is too coarse for one context window. A page is ~11 cases that
 * share a URL, a role and a session, so one navigation amortises across the batch.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { flag, loadEnvLocal } from "./lib/firestore.mjs";
import { CONTROL_CASES } from "./lib/controls.mjs";
import { batchFileName, matchesGroupFilter, matchesPageFilter } from "./lib/batch-keys.mjs";
import { buildScopeRows, mergeScope, readScope, writeScopeFile } from "./lib/scope.mjs";
import { requireEnv } from "./lib/credentials.mjs";

const REPO_ROOT = process.cwd();
const RUN_ID = String(flag("run", `run-${Date.now()}`));
/**
 * Everything this run writes lives here. Defined once: the path was rebuilt
 * inline at each write site, which is fine until a new artefact is written
 * before the directory exists.
 */
const RUN_DIR = resolve(REPO_ROOT, "tester/.tester-runs", RUN_ID);
mkdirSync(RUN_DIR, { recursive: true });
/*
 * 🛑 The default target is LOCAL, and production is opt-in.
 *
 * This defaulted to `https://www.letitrip.in`, so every run drove the live site
 * unless someone remembered otherwise. Measured 2026-10-09: run-3 worked 255
 * batches against production, and at ~12 cases × ~3 navigations × ~100 proxied
 * images that is roughly 900K image requests — which matches, independently,
 * the ~1.06M implied by dividing the billed 52.52 GB of origin transfer by the
 * 49.5 KB measured per image. The project was then suspended (HTTP 402).
 *
 * The harness was not misused; it did exactly what it was configured to do.
 * The default was the defect, so the default is what changed.
 *
 * Targeting production is still supported and still sometimes right — several
 * bugs in this codebase reproduce only on the real deployment. It now has to be
 * asked for: `--base-url https://www.letitrip.in` or `TESTER_BASE_URL=…`.
 */
const DEFAULT_BASE_URL = "http://localhost:3000";
const BASE_URL = String(flag("base-url", process.env.TESTER_BASE_URL ?? DEFAULT_BASE_URL));
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(BASE_URL)) {
  console.warn(
    `\n⚠️  TESTER TARGET IS NOT LOCAL: ${BASE_URL}\n` +
      `   A full sweep is thousands of page loads against that origin.\n` +
      `   Run it only when the deployment itself is what you are testing.\n`,
  );
}
const PHASE = flag("phase");
const PAGE = flag("page");
const GROUP = flag("group");
const OUT = flag("out");

loadEnvLocal(REPO_ROOT);

/*
 * THE API IDENTITY — reads the checklist and writes verdicts. NOT a browsing
 * identity, and conflating the two is what this split exists to prevent.
 *
 * It used to be `claude-tester@letitrip.in`, an `isTester` + `canTestAdmin`
 * persona that was ALSO the default browsing session. That persona was deleted on
 * 2026-09-14 with the rest of the tester personas and the sandbox catalogue: two
 * identities and two catalogues meant cases were written against data no real
 * buyer ever sees.
 *
 * `/api/user/tester-checklist` gates on `isTester` OR admin, so the admin account
 * satisfies it with nobody holding a tester flag. The admin must NOT inherit the
 * browsing job though — see BUYER_EMAIL.
 */
const EMAIL = requireEnv("TESTER_BOT_EMAIL");
const PASSWORD = requireEnv("TESTER_BOT_PASSWORD");

/*
 * THE DEFAULT BROWSING IDENTITY — a real buyer who owns real data.
 *
 * `user-yugi-muto` has the seeded "Home — 123 Stadium Lane, Indore" address every
 * checkout case selects BY NAME, plus a cart, wishlist and order history. The
 * deleted bot had none of that, which is why so many buying cases could only ever
 * be answered "could not test". The rewritten cases name this address in their own
 * sign-in steps, so the session and the procedure agree.
 */
const BUYER_EMAIL = requireEnv("TESTER_BUYER_EMAIL");
const BUYER_PASSWORD = requireEnv("TESTER_BUYER_PASSWORD");

/*
 * THE SECOND BUYER — not a spare, a distinct role the cases genuinely need.
 *
 * Counted across every authored case file, `vivaan.kapoor@gmail.com` is named in
 * **92 steps**, behind only the three identities already minted (rehan 331,
 * admin 306, tyson 214). Without a session for him, every one of those steps is
 * answered "could not test", and six cases on admin/coupons alone were recorded
 * as not-driven for exactly this reason on 2026-10-04.
 *
 * 🛑 SUBSTITUTING THE FIRST BUYER DOES NOT WORK, which is why this is a second
 * identity rather than a reused one. A whole class of case needs TWO buyers at
 * once and is meaningless with one: a per-user coupon limit is only proved when
 * the SAME buyer is refused a second redemption AND a DIFFERENT buyer is still
 * accepted; a bid ladder needs someone to outbid; an offer needs a counterparty.
 * Run them both as rehan and the refusal looks like the rule working when it is
 * really just the same person being counted twice.
 *
 * Best-effort, like the seller below: a failure here costs only the cases that
 * already could not be tested, while throwing would take the whole harness down.
 */
const BUYER2_EMAIL = process.env.TESTER_BUYER2_EMAIL ?? "vivaan.kapoor@gmail.com";
const BUYER2_PASSWORD =
  process.env.TESTER_BUYER2_PASSWORD ?? process.env.TESTER_BUYER_PASSWORD ?? "";

/**
 * The browser identity is chosen per batch and is NOT always the bot.
 *
 * The bot is `role: seller` + `canTestAdmin`, and while the API honours that flag,
 * the admin LAYOUT does not — admin/layout.tsx gates on isAdminUser/isEmployeeUser
 * and never calls isEffectiveAdminUser, despite that helper's docstring naming the
 * layout as one of its two chokepoints. So a canTestAdmin account reaches
 * /api/admin/* but is redirected off every /admin page.
 *
 * Rather than widen an authorization gate to suit the tester, adminOnly batches
 * browse as the real admin account. Verdicts are still RECORDED as the bot, so
 * attribution and the leaderboard exclusion are unaffected — the two concerns are
 * separate and only the browsing identity changes.
 *
 * Non-admin batches keep browsing as the bot on purpose: testing a buyer flow while
 * signed in as an admin is not testing the buyer flow.
 */
const ADMIN_EMAIL = requireEnv("TESTER_ADMIN_EMAIL");
const ADMIN_PASSWORD = requireEnv("TESTER_ADMIN_PASSWORD");

/**
 * A SELLER WHO OWNS DATA — the fourth identity.
 *
 * 🛑 WHY: the bot is a seller too, but its store is EMPTY. Every seeded offer,
 * order, payout and listing belongs to other personas, so ~20 cases across the
 * offers, selling and payouts pages sign in as this address BY NAME in their own
 * steps. Without a session for it those cases can only ever be answered "could
 * not test": the bot's /store/offers reads "No offers received", and the admin
 * cannot stand in because /admin/offers deliberately exposes only View and
 * Cancel — never Accept / Counter / Decline — which is correct design, not a gap.
 *
 * Measured on run-1789300124915: the offers phase returned 4 passes against 40
 * blocked, and the identity gap was the single largest cause.
 *
 * This writes the file only. Batch ASSIGNMENT is untouched, so nothing that
 * works today changes shape: a run selects this identity the same way it selects
 * the others, by copying the file over session.json. Teaching the batcher to
 * emit seller slices automatically is a separate, larger change.
 */
const SELLER_EMAIL = requireEnv("TESTER_SELLER_EMAIL");
const SELLER_PASSWORD = requireEnv("TESTER_SELLER_PASSWORD");

/**
 * Sign in ONCE and reuse the cookie for the whole slice.
 *
 * `/api/auth/login`, `/api/auth/session` and `/api/auth/me` share a single
 * 10-request-per-60s bucket keyed on IP — not on route. This is the only place in
 * the whole tool that is allowed to call any of them; everything downstream reuses
 * the cookie this returns. Retries back off explicitly because the limiter falls
 * back to an in-memory store (no Upstash configured), which makes 429s erratic
 * rather than predictable.
 */
async function login(email = EMAIL, password = PASSWORD) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const cookies = res.headers.getSetCookie?.() ?? [];
      const jar = cookies.map((c) => c.split(";")[0]).join("; ");
      if (!jar.includes("__session")) {
        console.error("✗ Login returned 200 but no __session cookie — cannot continue.");
        process.exit(1);
      }
      return jar;
    }

    if (res.status === 429 && attempt < 3) {
      const waitMs = 5000 * (attempt + 1);
      console.warn(`  rate limited, retrying in ${waitMs / 1000}s…`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    console.error(`✗ Login as ${email} failed: ${res.status} ${res.statusText}`);
    console.error("  Set TESTER_BOT_EMAIL / TESTER_BOT_PASSWORD, or re-seed to create the account.");
    console.error("  Note: seed-cli only sets the password when it CREATES the Auth record —");
    console.error("  an existing account whose password changed must be reset explicitly.");
    process.exit(2);
  }
}

async function fetchChecklist(cookie) {
  const res = await fetch(`${BASE_URL}/api/user/tester-checklist`, { headers: { cookie } });
  if (!res.ok) {
    console.error(`✗ GET /api/user/tester-checklist → ${res.status}`);
    if (res.status === 403) {
      console.error("  The account is not a tester. It needs isTester:true (and canTestAdmin");
      console.error("  for the 116 adminOnly cases, which are silently 404'd without it).");
    }
    process.exit(1);
  }
  const body = await res.json();
  const items = body?.data?.items ?? body?.items;
  if (!Array.isArray(items)) {
    console.error("✗ Unexpected response shape — expected { data: { items: [...] } }");
    process.exit(1);
  }
  return items;
}

/**
 * Split a page whose cases need different identities into separate batches.
 *
 * 🛑 WHY: the browsing identity is chosen PER BATCH, so a page containing even one
 * admin-scoped case forced the whole page to be browsed as admin. `buying/cart` is
 * 71 cases of which exactly ONE is admin-scoped — so 70 buyer cases would be
 * authored, and tested, by someone looking at admin chrome. 37 of 94 pages have that
 * shape; four of them are over 90% non-admin.
 *
 * It matters more for authoring than for testing: the author writes
 * `expectedUiState` from what it can SEE, so as admin it describes moderation
 * controls a buyer never gets and misses the sign-in prompt a guest does.
 *
 * Both halves keep the same `pageKey`, so validation and R5 coverage are unaffected;
 * only the batch (and therefore the authored module) is split. This is the per-case
 * role switching the design always wanted, at the granularity the batch shape can
 * actually express today.
 */
/**
 * Which of the three browsing identities a case needs.
 *
 * 🛑 GUEST IS NOT "SIGNED IN WITH FEWER RIGHTS" — IT IS NO SESSION AT ALL.
 *
 * 304 of 1,162 cases (26%) are authored for a signed-out visitor: the sign-in
 * prompt on a gated action, what a crawler sees, whether a private profile leaks.
 * Every one of them was previously performed by a signed-in bot, so the case that
 * was written could not be the case that ran — and the tester was instructed to
 * answer `null` in exactly that situation, which is 26% of the catalogue reported
 * as untestable when it is merely unsupported by the harness.
 *
 * A case whose roles are EXACTLY ["guest"] gets the guest slice. A case listing
 * guest alongside a signed-in role (`["buyer","guest"]` — "both see this") is left
 * with the signed-in identity: it is a contrast the author wanted, and the
 * signed-in half is the harder one to satisfy.
 *
 * 🛑 AND SELLER IS NOT "BUYER WITH A STORE" — IT IS A DIFFERENT ACCOUNT.
 *
 * The same gap the guest split closed, one identity over: **172 cases are
 * authored `roles: ["seller"]`** and every one of them fell to `main`, which is
 * the BUYER session. That account owns no store, so `/store/*` is not merely
 * emptier for it — the pages are a different thing entirely, and a case reading
 * "open /store/products and find a listing whose status reads Published" has
 * nothing to open.
 *
 * `session-seller.json` has existed the whole time and is written by this very
 * file (`writeStorageState(sellerCookie, "session-seller.json")`). Only the
 * routing to it was missing, so 172 cases — about 15% of the catalogue — ran as
 * the wrong person and failed or blocked for a reason that is not a defect.
 *
 * Ordering matters: seller is checked BEFORE the admin fallback but AFTER the
 * guest test, matching the existing precedence. A case listing seller alongside
 * admin (`["admin","seller"]`) stays admin — admin is the broader capability and
 * the one whose chrome the author was describing.
 */
function identityFor(item) {
  const roles = Array.isArray(item.roles) ? item.roles : null;
  if (roles?.length === 1 && roles[0] === "guest") return "guest";
  if (needsAdminIdentity(item)) return "admin";
  if (roles?.length && roles.every((r) => r === "seller")) return "seller";
  return "main";
}

/**
 * Split a page by browsing identity. FOUR slices now, not three.
 *
 * `main` keeps the page's original key so the unsplit pages produce
 * byte-identical filenames; only a page that genuinely mixes identities grows
 * suffixes. Order runs main → guest → seller → admin: the two slices that
 * MUTATE a page's state go last, and admin is the broadest of those.
 */
function splitByIdentity(batches) {
  const out = [];
  for (const batch of batches) {
    const byIdentity = { main: [], guest: [], seller: [], admin: [] };
    for (const c of batch.cases) byIdentity[identityFor(c)].push(c);

    const present = Object.entries(byIdentity).filter(([, cases]) => cases.length);
    // A page that is entirely one identity needs no split — and splitting it would
    // produce an empty batch that reads as a page nobody authored.
    if (present.length <= 1) {
      const only = present[0]?.[0] ?? "main";
      out.push({
        ...batch,
        needsAdmin: only === "admin",
        isGuest: only === "guest",
        isSeller: only === "seller",
        slice: only,
      });
      continue;
    }

    /*
     * 🛑 Slices run in AUTHORED order, not in a fixed identity ranking.
     *
     * This was `{ main: 0, guest: 50, seller: 75, admin: 100 }`, so a seller
     * slice always sorted after a guest one no matter where its cases sat on the
     * page. `happy-path/seller-listing` is authored as "the seller creates a
     * listing" then "a signed-out visitor finds it" — and the split scheduled
     * the verification at 3000 and the creation at 3075, so the guest case went
     * looking for a listing that had not been made yet and could only ever record
     * a `null`. `selling/seller-listing-types` had the same inversion.
     *
     * `chunkBatches` states this rule in its own comment and honours it: "cases
     * within a page can depend on state an earlier case left behind, and a chunk
     * boundary must not reorder them." An identity boundary is no different.
     *
     * Step of 50 leaves room for 49 chunks inside one slice (the largest page so
     * far needed 6), and pages are 1000 apart.
     */
    const firstAt = (cases) => Math.min(...cases.map((c) => batch.cases.indexOf(c)));
    const sliceOrder = new Map(
      [...present]
        .sort((a, b) => firstAt(a[1]) - firstAt(b[1]))
        .map(([slice], i) => [slice, i * 50]),
    );

    for (const [slice, cases] of present) {
      out.push({
        ...batch,
        key: slice === "main" ? batch.key : `${batch.key}--${slice}`,
        needsAdmin: slice === "admin",
        isGuest: slice === "guest",
        isSeller: slice === "seller",
        slice,
        order: batch.order + (sliceOrder.get(slice) ?? 0),
        cases,
      });
    }
  }
  return out;
}

/**
 * Which identity should BROWSE a case.
 *
 * Derived from `roles` first, falling back to the older adminOnly/href heuristic
 * for a case that predates the roles field. ONE function because `splitByIdentity`
 * and the batch's own `needsAdmin` flag must agree — if the split says a case is
 * admin and the flag says the batch is not, the slice browses as the wrong user
 * and every case in it fails for a reason that is not a bug in the product.
 *
 * `page-wiring` and `search-and-nav` both contain admin pages despite not being
 * the admin group, which is why this reads the case and never the group name.
 */
function needsAdminIdentity(item) {
  const roles = Array.isArray(item.roles) ? item.roles : null;
  if (roles?.length) return roles.some((r) => r === "admin" || r === "employee");
  return Boolean(item.adminOnly) || String(item.href ?? "").startsWith("/admin");
}

/**
 * Group into per-page batches, preserving catalog order within a page.
 *
 * 🛑 THIS FUNCTION CARRIES THE PROCEDURE. IT USED TO THROW IT AWAY.
 *
 * It emitted six keys — id, label, description, href, adminOnly, priorAnswer —
 * plus a boolean `alreadyAuthored` that was the ONLY trace of `steps`. Every other
 * hop in the chain was intact: AuthoredCase → group() → TesterChecklistItemDocument
 * → listActive() → the API's `...item` spread all carry the full six-part contract.
 * This last hop discarded it, so 1,139 hand-written procedures reached nothing and
 * the tester improvised from a label — which is the exact state the authoring work
 * existed to end. The symptom was a batch that ran and produced verdicts, i.e. it
 * looked like it was working (Root Cause #57).
 *
 * `alreadyAuthored` is deliberately GONE rather than kept alongside: it is the
 * boolean projection that let the array get summarised away in the first place.
 * Anything that wants it computes `Boolean(c.steps?.length)`. Audit rule R11
 * blocks its return and asserts every AuthoredCase field appears here.
 */
function toBatches(items) {
  const byPage = new Map();
  for (const item of items) {
    const key = `${item.groupKey}/${item.pageKey}`;
    if (!byPage.has(key)) {
      byPage.set(key, {
        key,
        groupKey: item.groupKey,
        groupLabel: item.groupLabel,
        pageKey: item.pageKey,
        pageLabel: item.pageLabel,
        phase: item.phase,
        href: item.href ?? null,
        needsAdmin: false,
        /*
         * Explicit execution order, because filename sort is not the catalogue's.
         *
         * Cases within a page can depend on state an earlier case left behind
         * (buying/offers chains deliberately: "One pending offer exists; later
         * cases read it"), so the run has to work them in catalogue order. Room is
         * left between pages for the slice and chunk suffixes to occupy.
         */
        order: byPage.size * 1000,
        cases: [],
      });
    }
    const batch = byPage.get(key);
    if (needsAdminIdentity(item)) batch.needsAdmin = true;
    batch.cases.push({
      id: item.id,
      label: item.label,
      description: item.description ?? null,
      href: item.href ?? null,
      adminOnly: item.adminOnly ?? false,
      priorAnswer: item.answer ?? null,

      // The six-part contract. See skills/run-tests/SKILL.md for what the tester
      // is required to do with each of them.
      roles: Array.isArray(item.roles) && item.roles.length ? item.roles : null,
      /*
       * `startPage` is NOT a synonym for `href`, and preferring href loses real
       * information. `group()` resolves it as
       * `c.startPage ?? authored?.startPage ?? c.href ?? page.href` — so an
       * authored startPage is deliberately more specific than the page-level href
       * a case inherits when it did not link individually.
       */
      startPage: item.startPage ?? item.href ?? null,
      steps: Array.isArray(item.steps) && item.steps.length ? item.steps : null,
      inputs: item.inputs ?? null,
      expectedBehaviour: item.expectedBehaviour ?? null,
      expectedUiState: item.expectedUiState ?? null,
      expectedData: item.expectedData ?? null,
      endResult: item.endResult ?? null,

      // Carried so the report can flag a case whose own author was unsure, rather
      // than presenting its verdict with the same confidence as every other row.
      needsReview: item.needsReview ?? false,
      reviewNote: item.reviewNote ?? null,

      // Needs a real inbox or an interactive Google account — impossible in an
      // automated run, so `null` here is the CORRECT answer and not blockage.
      // Carried to the tester so it abstains immediately instead of spending a
      // session's turns discovering the obvious, and to the report so it can
      // subtract these from the blocked count rather than re-triaging the same
      // twelve cases every run.
      requiresHumanChannel: item.requiresHumanChannel ?? false,
      humanChannelReason: item.humanChannelReason ?? null,
    });
  }
  return [...byPage.values()];
}

/**
 * Hand the BROWSER the same session the API calls use.
 *
 * Without this the tester browses anonymously: fetch-cases signs in to pull the
 * checklist and then throws the cookie away, so every admin-, store- and
 * user-gated case comes back `null` ("redirected to /unauthorized"). That is the
 * majority of the catalogue.
 *
 * Written in Playwright storageState shape and consumed by the MCP server's
 * --storage-state flag, so every browser context the tester opens starts signed
 * in. The file is rewritten on every fetch, which also keeps it fresh — the
 * session cookie lasts 5 days but a run should never depend on that.
 *
 * 🛑 This file contains a live production session cookie. .gitignore excludes
 *    the whole .tester-runs/ directory for exactly this reason.
 */
function writeStorageState(cookieHeader, file = "session.json") {
  const host = new URL(BASE_URL).hostname;
  const cookies = cookieHeader
    .split("; ")
    .map((pair) => {
      const eq = pair.indexOf("=");
      if (eq === -1) return null;
      const name = pair.slice(0, eq);
      const value = pair.slice(eq + 1);
      return {
        name,
        value,
        domain: host,
        path: "/",
        expires: Math.floor(Date.now() / 1000) + 5 * 24 * 3600,
        httpOnly: name === "__session",
        secure: true,
        // The server sets SameSite=Strict. Mirror it rather than relaxing to Lax:
        // a cookie that differs from the one a real browser holds is not the
        // session under test.
        sameSite: "Strict",
      };
    })
    .filter(Boolean);

  const statePath = resolve(REPO_ROOT, "tester/.tester-runs", file);
  mkdirSync(resolve(REPO_ROOT, "tester/.tester-runs"), { recursive: true });
  writeFileSync(statePath, JSON.stringify({ cookies, origins: [] }, null, 2));
  console.log(`✓ Wrote browser session (${cookies.length} cookies) → tester/.tester-runs/${file}`);
}

const cookie = await login();

/*
 * 🛑 The API cookie is NOT written as the default browsing session.
 *
 * It used to be: one persona fetched the checklist AND browsed every non-admin
 * batch. With that persona gone the API identity is the ADMIN, and writing it to
 * session.json would silently sign every buyer case in as an administrator —
 * different nav, different gates, different data. The cases would still run and
 * still produce verdicts, which is exactly what makes it dangerous.
 *
 * The buyer is best-effort for the same reason the seller is: a missing session
 * costs only the cases that need it, while throwing takes the whole harness down.
 */
try {
  const buyerCookie = await login(BUYER_EMAIL, BUYER_PASSWORD);
  writeStorageState(buyerCookie, "session-buyer.json");
  writeStorageState(buyerCookie); // default browsing identity
} catch (err) {
  console.warn(
    `⚠ Buyer session unavailable (${BUYER_EMAIL}): ${err?.message ?? err}\n` +
      `  Falling back to the API identity for default browsing — buyer cases will\n` +
      `  run SIGNED IN AS ADMIN and must be answered null, not yes.`,
  );
  writeStorageState(cookie);
}

/*
 * The guest identity is an EMPTY storage state, written as a real file.
 *
 * The MCP server reads a fixed --storage-state path, so an identity is selected
 * by copying a file over it. "No session" therefore has to be a file too — the
 * alternative is deleting session.json, which leaves the browser holding whatever
 * the previous batch left behind and makes the guest slice silently signed in.
 */
writeFileSync(
  resolve(REPO_ROOT, "tester/.tester-runs", "session-guest.json"),
  JSON.stringify({ cookies: [], origins: [] }, null, 2),
);
console.log("✓ Wrote browser session (0 cookies, signed out) → tester/.tester-runs/session-guest.json");
const adminCookie = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
writeStorageState(adminCookie, "session-admin.json");

/*
 * The seller identity is best-effort: a failure here must NOT abort a run.
 *
 * Every batch that exists today browses as the bot, the admin or signed out, so
 * a missing seller session costs only the cases that already could not be tested
 * without it. Throwing instead would turn a partial improvement into a total
 * outage of the harness — the opposite trade.
 */
try {
  const sellerCookie = await login(SELLER_EMAIL, SELLER_PASSWORD);
  writeStorageState(sellerCookie, "session-seller.json");
} catch (err) {
  console.warn(
    `⚠ Seller session unavailable (${SELLER_EMAIL}): ${err?.message ?? err}\n` +
      `  Seller-owned cases will report "could not test". Set TESTER_SELLER_EMAIL /\n` +
      `  TESTER_SELLER_PASSWORD, or re-seed to create the account.`,
  );
}

/*
 * The second buyer. Same best-effort contract as the seller above.
 *
 * Note this is the LAST login of the five, deliberately: /api/auth/login shares a
 * 10-requests-per-minute bucket keyed on IP with the rest of the auth routes, so
 * the identity whose absence costs the least goes last and is the first to be
 * dropped if the bucket is ever the thing that fails.
 */
try {
  if (!BUYER2_PASSWORD) throw new Error("no password configured");
  const buyer2Cookie = await login(BUYER2_EMAIL, BUYER2_PASSWORD);
  writeStorageState(buyer2Cookie, "session-buyer2.json");
} catch (err) {
  console.warn(
    `⚠ Second-buyer session unavailable (${BUYER2_EMAIL}): ${err?.message ?? err}\n` +
      `  The ~92 case steps naming that buyer will report "could not test", and any\n` +
      `  case needing two buyers at once (per-user coupon limits, outbidding, offers)\n` +
      `  cannot be driven at all. Set TESTER_BUYER2_EMAIL / TESTER_BUYER2_PASSWORD.`,
  );
}

const items = await fetchChecklist(cookie);
/**
 * Split an oversized page into numbered chunks.
 *
 * 🛑 THE TAIL WAS ALREADY FAILING BEFORE THE PROCEDURES ARRIVED.
 *
 * 56 of 87 pages hold ≤12 cases — around 19 KB of batch file, a rounding error
 * next to one browser snapshot. But buying/cart and buying/offers are 69 cases
 * each: roughly 115 KB, ~30k tokens of context consumed before the first
 * navigation. The evidence is in the run directories — a full sweep of 90 batches
 * produced 2 verdict files, and another produced 3. Carrying the procedures did
 * not create that problem, it made it undeniable.
 *
 * Chunking runs AFTER splitByIdentity and BEFORE control injection, so every chunk
 * gets its own calibration pair — which is the correct reading of "controls per
 * batch, not per run": a pair at the start of a long page only proves the start.
 *
 * The suffix is zero-padded because `sort()` is lexical and `--p10` would
 * otherwise sort before `--p2`. A page that needs no chunking keeps its exact
 * current key, so 56 of 87 batch files are byte-identical to before.
 */
function chunkBatches(batches, max) {
  if (!Number.isFinite(max) || max <= 0) return batches;
  const out = [];
  for (const b of batches) {
    if (b.cases.length <= max) {
      out.push(b);
      continue;
    }
    const total = Math.ceil(b.cases.length / max);
    const width = String(total).length;
    for (let i = 0; i < total; i++) {
      const n = String(i + 1).padStart(width, "0");
      out.push({
        ...b,
        key: `${b.key}--p${n}`,
        chunk: i + 1,
        chunkCount: total,
        // Chunks of one page run consecutively and in catalogue order: cases within
        // a page can depend on state an earlier case left behind, and a chunk
        // boundary must not reorder them.
        order: b.order + i,
        cases: b.cases.slice(i * max, (i + 1) * max),
      });
    }
  }
  return out;
}

const MAX_CASES = Number(flag("max-cases", "12"));
/**
 * 🛑 RESTORE CATALOGUE ORDER BEFORE BATCHING. The API does not preserve it.
 *
 * `toBatches` stamps each batch's `order` from the sequence it meets pages in,
 * and everything downstream trusts that as catalogue order: run.mjs sorts the
 * run by it, and sweep.mjs derives the group sequence from it. But the items
 * arrive from `listActive()` — a Firestore query, whose order is its own
 * business and is NOT the seed array's.
 *
 * Measured: unsorted, the sweep planned `addresses` second when the catalogue
 * puts it twelfth, i.e. the plan was alphabetical by accident. Cases within a
 * page can depend on state an earlier case left behind, and a page's chunks must
 * run consecutively, so the ordering is load-bearing rather than cosmetic.
 *
 * `phase` is assigned by walking the seed array in catalogue order and is stored
 * on every item, so it is the surviving record of that order; the item's own
 * `order` breaks ties within a phase.
 */
const ordered = [...items].sort(
  (a, b) => (a.phase ?? 0) - (b.phase ?? 0) || (a.order ?? 0) - (b.order ?? 0),
);

let batches = chunkBatches(splitByIdentity(toBatches(ordered)), MAX_CASES);

/**
 * Re-verify an explicit set of cases — Phase E of the pipeline.
 *
 * 🛑 WHY THIS IS NOT A CONVENIENCE
 *
 * The only filters were --page and --phase, so confirming a fix meant re-running a
 * whole page at best and the full 18-hour sweep at worst. Faced with that, the
 * rational move is to verify one fix at a time as you make it — which is exactly the
 * test-one-fix-one loop the pipeline exists to replace. The absence of this filter
 * would quietly undo the sequencing.
 *
 * Takes a file of case ids (one per line, `#` comments allowed) — the fix list's own
 * output. Batches are rebuilt from only those cases and keep their real page
 * identity, so the tester still browses as the right user and the verdicts still
 * record against the right page.
 *
 * An id that matches nothing is a hard error, not a skip: silently verifying four
 * of five fixes and reporting success is the false green this whole tool refuses.
 *
 * 🛑 APPLIED WITH THE OTHER FILTERS, BELOW THE CATALOGUE WRITE — not here.
 *
 * This ran inline at this point for its whole life, which put it ABOVE the
 * `catalogue.json` write. That write's own comment says it is "written BEFORE any
 * filter, which is the whole point" — true of `--page`/`--phase`/`--group`, and
 * false of this one. Measured on run-4: `catalogue.json` recorded **203** cases
 * against run-3's **1338**, so the report's coverage table would have divided by
 * the run's own scope and read ~100% while 1135 cases sat untested. That is the
 * exact failure the catalogue manifest was added to prevent, reintroduced by the
 * one filter that predates it. `audit-tester-plugin-wiring` R14 only checks that
 * the write precedes `writeScopeFile(`, so it does not catch this.
 *
 * Moved to `applyCaseFilter()` and invoked beside the others. Ordering is the fix;
 * the logic is unchanged.
 */
function applyCaseFilter(batches) {
  if (typeof flag("cases") !== "string") return batches;
  const file = resolve(REPO_ROOT, String(flag("cases")));
  if (!existsSync(file)) {
    console.error(`✗ --cases file not found: ${flag("cases")}`);
    process.exit(2);
  }
  const wanted = new Set(
    readFileSync(file, "utf8")
      .split("\n")
      .map((l) => l.replace(/#.*$/, "").trim())
      .filter(Boolean),
  );
  if (!wanted.size) {
    console.error(`✗ --cases file is empty — nothing to re-verify.`);
    process.exit(2);
  }

  const found = new Set();
  const filtered = batches
    .map((b) => {
      const cases = b.cases.filter((c) => wanted.has(c.id));
      for (const c of cases) found.add(c.id);
      return { ...b, cases };
    })
    .filter((b) => b.cases.length);

  const missing = [...wanted].filter((id) => !found.has(id));
  if (missing.length) {
    console.error(`✗ ${missing.length} case id(s) in --cases match no case in the catalogue:`);
    for (const id of missing.slice(0, 10)) console.error(`    ${id}`);
    console.error("  Re-verifying a subset while silently dropping the rest is a false pass.");
    process.exit(1);
  }
  console.log(`✓ Re-verify set: ${found.size} case(s) across ${filtered.length} batch(es).`);
  return filtered;
}

// Captured before any filter, so a no-match can name what WAS available. A typo'd
// group is otherwise the difference between a five-second fix and re-reading the
// whole catalogue.
const allBatchKeys = batches.map((b) => b.key);

/*
 * 🛑 THE CATALOGUE MANIFEST — written BEFORE any filter, which is the whole point.
 *
 * The report's coverage table has to compare what was tested against the WHOLE
 * catalogue, not against what this run happened to ask for. Run
 * run-1789300124915 recorded 103 batches and its report said so — while TEN of
 * fourteen groups (505 cases: all 233 admin, all SEO, all page-wiring) had never
 * been opened, because the run stopped at phase 17 of 34. Every number in that
 * report was true and the run still read as broadly complete.
 *
 * Derived from the same `/api/user/tester-checklist` response the batches are
 * built from, so it cannot drift from what the tester actually runs.
 *
 * 🛑 NEVER rebuild this by listing `seed-data/authored/*.ts`. `money-flows`
 * lives in `seed-data/_money-flows.ts`, so an underscore filter skips it — which
 * is exactly how nine zero-coverage groups got reported when there were ten.
 */
writeFileSync(
  resolve(RUN_DIR, "catalogue.json"),
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      totalBatches: batches.length,
      groups: Object.values(
        batches.reduce((acc, b) => {
          const g = (acc[b.groupKey] ??= {
            groupKey: b.groupKey,
            groupLabel: b.groupLabel ?? b.groupKey,
            pages: new Set(),
            batchKeys: [],
            cases: 0,
          });
          g.pages.add(b.pageKey);
          g.batchKeys.push(b.key);
          g.cases += b.cases?.length ?? 0;
          return acc;
        }, {}),
      )
        .map((g) => ({ ...g, pages: g.pages.size }))
        .sort((a, b) => b.cases - a.cases),
    },
    null,
    2,
  ),
);

/*
 * Print the group→phase spread, so the distribution is VISIBLE without
 * recomputing assignDefaultPhases in your head.
 *
 * Phases are interleaved across groups now, so every group should span most of
 * the range. A group confined to a narrow band at the top of the range is the
 * old failure returning — `admin` used to sit at 25–32 purely because its
 * `...group(...)` spread was 9th in a 6,200-line literal, which guaranteed that
 * any short run lost it whole.
 */
{
  const spread = new Map();
  for (const b of batches) {
    const g = spread.get(b.groupKey) ?? { lo: Infinity, hi: -Infinity, cases: 0 };
    g.lo = Math.min(g.lo, b.phase ?? 0);
    g.hi = Math.max(g.hi, b.phase ?? 0);
    g.cases += b.cases?.length ?? 0;
    spread.set(b.groupKey, g);
  }
  const maxPhase = Math.max(...batches.map((b) => b.phase ?? 0));
  console.log(`
  Phase spread (1..${maxPhase}) — a group confined to a narrow band is the old bug:`);
  for (const [g, v] of [...spread.entries()].sort((a, b) => b[1].cases - a[1].cases)) {
    console.log(`    ${g.padEnd(22)} phases ${String(v.lo).padStart(2)}–${String(v.hi).padStart(2)}   ${String(v.cases).padStart(4)} case(s)`);
  }
  console.log("");
}

if (PHASE) batches = batches.filter((b) => String(b.phase) === String(PHASE));
if (typeof PAGE === "string") batches = batches.filter((b) => matchesPageFilter(b.key, PAGE));
/*
 * `--group` phases a long sweep. A bare valueless `--group` parses as `true`,
 * and silently meaning "everything" is a 50-hour surprise — so refuse it.
 */
if (GROUP === true) {
  console.error("✗ --group needs a value, e.g. --group buying. A bare --group would sweep everything.");
  process.exit(2);
}
if (typeof GROUP === "string") batches = batches.filter((b) => matchesGroupFilter(b.key, GROUP));
/* Last, and deliberately below the catalogue write — see applyCaseFilter's header. */
batches = applyCaseFilter(batches);

if (!batches.length) {
  console.error(`✗ No batches matched (phase=${PHASE ?? "any"}, page=${PAGE ?? "any"}, group=${GROUP ?? "any"}).`);
  const seen = [...new Set(allBatchKeys.map((k) => k.split("/")[0]))].sort();
  if (seen.length) console.error(`  Available groups: ${seen.join(", ")}`);
  process.exit(1);
}

/**
 * 🛑 INERT CASES — seed-only reference fixtures, dropped before batching.
 *
 * A handful of catalogue rows exist so that OTHER cases can cite them by name
 * (`admin/bug-hunter-rewards`'s "Demo fixture — reported bug" pair is the known
 * example). They carry no steps and no expectations of any kind, so there is
 * nothing a tester could assert. Handing one over burns a case slot, spends a
 * session's turns, and comes back `null` — which then inflates the blocked count
 * and reads in triage as an untestable PRODUCT gap rather than a catalogue
 * artefact. That is exactly what happened on 2026-09-11.
 *
 * 🛑 The predicate is INERT, deliberately not "has no steps".
 *
 * Excluding every stepless case would silence the procedure-coverage oracle
 * directly below — a project that was not re-seeded hands back cases with no
 * steps, and that must WARN, not quietly shrink the run. A rule that goes quiet
 * is as likely to have stopped looking as to have been satisfied (Root Cause
 * #84). So a case is only dropped when it has no steps AND nothing to check:
 * no expectedBehaviour, no expectedUiState, no expectedData, no endResult.
 * A stale-seed case still has its expectations and still trips the oracle.
 *
 * Never silent: what was dropped is printed and carried into fetch.json, so a
 * shrinking catalogue shows up in the deliverable instead of looking like
 * coverage that was never owed.
 */
const isInertCase = (c) =>
  !c.isControl &&
  !(Array.isArray(c.steps) && c.steps.length) &&
  !c.expectedBehaviour &&
  !c.expectedUiState &&
  !c.endResult &&
  !(c.expectedData && Object.keys(c.expectedData).length);

const inertCases = [];
for (const batch of batches) {
  const keep = [];
  for (const c of batch.cases) {
    if (isInertCase(c)) inertCases.push({ batch: batch.key, key: c.key ?? c.id });
    else keep.push(c);
  }
  batch.cases = keep;
}
// A batch that was ONLY reference fixtures has nothing left to test. Dropping it
// here rather than after control injection matters: injected controls would
// otherwise keep an empty batch alive, and it would run, pass both controls and
// record a clean, entirely meaningless result.
const emptiedBatches = batches.filter((b) => !b.cases.length).map((b) => b.key);
batches = batches.filter((b) => b.cases.length);

if (inertCases.length) {
  console.log(
    `✓ Skipped ${inertCases.length} seed-only reference fixture(s) with nothing to assert:`,
  );
  for (const c of inertCases.slice(0, 10)) console.log(`    ${c.batch}  ${c.key}`);
  if (inertCases.length > 10) console.log(`    … and ${inertCases.length - 10} more`);
}
if (emptiedBatches.length) {
  console.log(`✓ Dropped ${emptiedBatches.length} batch(es) left empty: ${emptiedBatches.join(", ")}`);
}
if (!batches.length) {
  console.error("✗ Every matched batch contained only reference fixtures — nothing to run.");
  process.exit(1);
}

/**
 * Controls are injected per batch, not per run: a single pair at the start of a long
 * run only proves the first batch was awake.
 *
 * `--no-controls` is for the AUTHORING harness. A control is a fake case with a known
 * verdict; handing it to an author produces a set of authored steps for a case that
 * does not exist, which then fails the merge's id check — or worse, reads as coverage.
 * Authoring has its own quality gate (the merge validator and a human review), so it
 * needs no calibration pair.
 */
if (flag("no-controls") !== true) {
  for (const batch of batches) batch.cases.push(...CONTROL_CASES(RUN_ID));
}

/**
 * 🛑 PROCEDURE COVERAGE — the staleness oracle.
 *
 * The procedures are authored in the SEED but a batch is built from FIRESTORE, so
 * a project that was not re-seeded after an authoring session hands back cases with
 * no steps. The tester then improvises, and 1,100 improvised tests are shaped
 * exactly like 1,100 procedural ones — in the transcript, in the verdicts and in
 * the report. The only place the difference is visible is here, before anything runs.
 *
 * Not a hard exit: a `--page` slice of a genuinely unauthored page is legitimate.
 * The number is printed, written to fetch.json, folded into scope.json by run.mjs
 * and rendered in the report header, so a stale seed shows up in the deliverable
 * instead of quietly becoming a worse test.
 */
const realCases = batches.flatMap((b) => b.cases.filter((c) => !c.isControl));
const withSteps = realCases.filter((c) => Array.isArray(c.steps) && c.steps.length).length;
const coveragePct = realCases.length ? Math.round((withSteps / realCases.length) * 100) : 100;
console.log(`✓ Procedure coverage: ${withSteps}/${realCases.length} cases carry steps (${coveragePct}%).`);

if (realCases.length && coveragePct < 90) {
  const barePages = batches
    .filter((b) => b.cases.some((c) => !c.isControl && !(Array.isArray(c.steps) && c.steps.length)))
    .map((b) => b.key);
  console.warn(`\n⚠ ${realCases.length - withSteps} case(s) have NO authored steps.`);
  console.warn(`  The tester will improvise those, and an improvised test reads exactly`);
  console.warn(`  like a procedural one in the report. Bare pages include:`);
  for (const p of barePages.slice(0, 8)) console.warn(`    ${p}`);
  if (barePages.length > 8) console.warn(`    … and ${barePages.length - 8} more`);
  console.warn(`  If this is unexpected, the project is behind the seed:`);
  console.warn(`    npx appkit-seed load --collections testerChecklistItems\n`);
}

/**
 * Guest cases now run signed OUT, in their own slice.
 *
 * They used to be performed by a signed-in bot, because the harness knew only two
 * identities — so 304 cases (26% of the catalogue) could not be the cases that
 * were written, and the tester was instructed to answer `null` in exactly that
 * situation. Reporting the split is what makes the third identity visible in the
 * run's own output rather than something you have to infer from the batch names.
 */
const guestOnly = realCases.filter(
  (c) => Array.isArray(c.roles) && c.roles.length === 1 && c.roles[0] === "guest",
);
const guestBatches = batches.filter((b) => b.isGuest).length;
if (guestOnly.length) {
  console.log(
    `✓ Identity split: ${guestOnly.length} signed-out case(s) across ${guestBatches} guest batch(es).`,
  );
}

const sellerOnly = realCases.filter(
  (c) => Array.isArray(c.roles) && c.roles.length && c.roles.every((r) => r === "seller"),
);
const sellerBatches = batches.filter((b) => b.isSeller).length;
if (sellerOnly.length) {
  console.log(
    `✓ Identity split: ${sellerOnly.length} seller case(s) across ${sellerBatches} seller batch(es).`,
  );
}

const outDir = resolve(REPO_ROOT, "tester/.tester-runs", RUN_ID, "batches");
mkdirSync(outDir, { recursive: true });

/*
 * The scope side of the completeness gate starts here: run.mjs folds these counts
 * into scope.json, and record-verdicts renders them in the report header. Written
 * before the batch files so a fetch that dies mid-write still leaves the intent.
 */
writeFileSync(
  resolve(REPO_ROOT, "tester/.tester-runs", RUN_ID, "fetch.json"),
  JSON.stringify(
    {
      runId: RUN_ID,
      baseUrl: BASE_URL,
      filters: { phase: PHASE ?? null, page: PAGE ?? null, group: GROUP ?? null, cases: flag("cases") ?? null },
      procedureCoverage: { withSteps, total: realCases.length },
      guestOnlyCases: guestOnly.length,
      // Seed-only reference fixtures dropped before batching. Recorded rather
      // than merely logged: a catalogue that quietly shrinks between runs must
      // be visible in the deliverable, not only in a console line nobody kept.
      skippedInertCases: inertCases,
      emptiedBatches,
      batches: batches.length,
    },
    null,
    2,
  ),
);

/*
 * `--out` materialises ONE batch; the default materialises all of them. The scope
 * must describe what was actually written, or the gate demands verdicts for
 * batches that exist nowhere on disk and `--finish` can never pass.
 */
let materialised;
if (typeof OUT === "string") {
  writeFileSync(resolve(REPO_ROOT, OUT), JSON.stringify(batches[0], null, 2));
  // Also land it in batches/ under its canonical name, so record-verdicts and
  // next-batch can find it by key rather than by wherever --out happened to point.
  writeFileSync(resolve(outDir, batchFileName(batches[0].key)), JSON.stringify(batches[0], null, 2));
  materialised = batches.slice(0, 1);
  console.log(`✓ Wrote ${OUT} (${batches[0].cases.length} cases)`);
} else {
  for (const batch of batches) {
    writeFileSync(resolve(outDir, batchFileName(batch.key)), JSON.stringify(batch, null, 2));
  }
  materialised = batches;
  const total = batches.reduce((n, b) => n + b.cases.length, 0);
  const controls = flag("no-controls") === true ? "no controls" : "incl. controls";
  console.log(`✓ Wrote ${batches.length} batches (${total} cases, ${controls}) → ${outDir}`);
}

/*
 * ── The scope manifest ──────────────────────────────────────────────────────
 *
 * 🛑 fetch-cases OWNS scope.json as of 2026-09-14. It used to be written by
 * run.mjs, which spawned one Claude session per batch and was deleted for it —
 * and because run.mjs was the ONLY producer, its removal silently disarmed
 * `record-verdicts --report/--publish/--finish`, all three of which refuse to
 * run without a manifest. Nothing imported run.mjs, so no import error would
 * have said so; the flow would simply have stopped publishing.
 *
 * Scope now means "the batches I deliberately fetched", which is the same
 * deliberate-intent semantics the gate already demands — record-verdicts
 * explicitly refuses to infer scope from readdir(batches/), because that
 * directory accumulates across runs and across --page scoping.
 *
 * MERGE, never overwrite: fetching a second page must add to the run rather
 * than replace it, or the gate certifies one page as a finished run (R20).
 */
const runsDir = resolve(REPO_ROOT, "tester/.tester-runs", RUN_ID);
const incomingScope = {
  runId: RUN_ID,
  startedAt: new Date().toISOString(),
  finishedAt: null,
  baseUrl: BASE_URL,
  filters: { page: PAGE ?? null, phase: PHASE ?? null, group: GROUP ?? null, cases: flag("cases") ?? null },
  retries: 0,
  procedureCoverage: { withSteps, total: realCases.length },
  guestOnlyCases: guestOnly.length,
  batches: buildScopeRows(
    materialised.map((b) => batchFileName(b.key)),
    (name) => materialised.find((b) => batchFileName(b.key) === name),
  ),
};
const mergedScope = mergeScope(readScope(runsDir), incomingScope);
writeScopeFile(runsDir, mergedScope);
console.log(`✓ Scope: ${mergedScope.batches.length} batch(es) → tester/.tester-runs/${RUN_ID}/scope.json`);

process.exit(0);

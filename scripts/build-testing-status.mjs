#!/usr/bin/env node
/*
 * WHY: the testing evidence was scattered across five run directories and two
 *      reports, so nobody could answer "what did we find, what did we fix, what
 *      is still open" without re-reading raw verdict JSON.
 * WHAT: generates docs/TESTING-STATUS.md from the run artifacts on disk plus the
 *       classification table below.
 *
 * The CLASSIFICATION map is hand-authored on purpose. A script can tell you a
 * case failed; only a person who read the code can say whether the FIX shipped,
 * whether it is still open, or whether the case was wrong about the product.
 * Two entries here are NOT-A-BUG and both nearly cost a "fix" to working code —
 * see the notes on them.
 *
 * Usage: node scripts/build-testing-status.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const RUNS = resolve("tester/.tester-runs");
const OUT = resolve("docs/TESTING-STATUS.md");

/**
 * status: FIXED | OPEN | NOT-A-BUG
 * fix:    what shipped (FIXED) / why it is not a defect (NOT-A-BUG) / null
 */
const CLASSIFICATION = {
  // ---- FIXED, shipped in appkit 4.35.3 / 4.35.4 + consumer, deployed --------
  "checklist-account-auth-profile-settings-edit-profile": {
    status: "FIXED",
    fix: "GET /api/user/profile read document-backed fields off the SESSION. Now reads the document.",
  },
  "checklist-account-auth-profile-settings-avatar-upload": {
    status: "FIXED",
    fix: "Same cause as edit-profile — photoURL came from the stale Auth token.",
  },
  "checklist-account-auth-profile-settings-notification-prefs": {
    status: "FIXED",
    fix: "The PUT always persisted; the GET read the session and returned all-true defaults. Now reads the document.",
  },
  "checklist-account-auth-profile-settings-public-profile-toggle": {
    status: "FIXED",
    fix: "publicProfile is not in the session at all, so the page rendered its default. Verified stored isPublic=false while the UI showed 'Public'.",
  },
  "checklist-account-auth-testing-program-admin-testing-section": {
    status: "FIXED",
    fix: "Admin sidebar rendered empty: permissions===null means admin, but that was honoured only when no navConfig existed. isAdmin now passes through filterNavItems.",
  },
  "checklist-buying-browsing-search-card-shows-seller-name": {
    status: "FIXED",
    fix: "Cards showed the raw slug 'by store-beyblade-arena'. Slug fallback is now humanised across all six card variants.",
  },
  "checklist-buying-buying-checkout-add-to-cart-max-quantity": {
    status: "FIXED",
    fix: "NOTHING in the quantity path consulted the product — .max(99) is a sanity bound, not inventory. PATCH now 409s above stock. Real overselling exposure.",
  },
  "checklist-buying-buying-checkout-checkout-flow": {
    status: "FIXED",
    fix: "React #310 at step 2->3. Two render helpers called React.useMemo, so payment rendered N+1 hooks. Hoisted to module consts.",
  },
  "checklist-buying-buying-checkout-checkout-mobile-responsive": {
    status: "FIXED",
    fix: "Same #310 crash — the payment step was unreachable on mobile too.",
  },
  "checklist-buying-product-detail-bundle-purchase": {
    status: "FIXED",
    fix: "Blocked by the same #310 crash at the Add-ons -> payment transition.",
  },
  "checklist-buying-product-detail-prizedraw-buy-reveal": {
    status: "FIXED",
    fix: "Blocked by the same #310 crash; the order summary never left 'Calculating shipping & fees...'.",
  },
  "checklist-buying-product-detail-digitalcode-delivery": {
    status: "FIXED",
    fix: "Blocked by the same #310 crash before the payment step.",
  },
  "checklist-buying-product-detail-unreachable-image-degrades-to-placeholder": {
    status: "FIXED",
    fix: "The placeholder SVG was invalid XML — its own comment contained '--' from naming a CSS var in its real var() spelling. The fallback for a broken image was itself broken. Confirmed valid live.",
  },
  "checklist-buying-product-detail-video-real-file-upload": {
    status: "FIXED",
    fix: "/api/media/sign 500'd: SellerProductShell omitted `category`, so slugify(undefined) threw inside the generator. Caller fixed; the guard now converts any generator throw into an actionable 400.",
  },
  "checklist-buying-product-detail-tester-fixtures-hidden-from-the-public": {
    status: "FIXED",
    fix: "Guest invisibility was correct; a signed-in TESTER also could not see sandbox rows. SSR passes no viewer and staleTime:Infinity froze it. useProducts now keys the query on viewer class so testers refetch; public visitors keep the cached paint (NOT by making SSR dynamic — that would be Root Cause #82).",
  },
  "checklist-buying-product-detail-video-lightbox-fullscreen-sizing": {
    status: "FIXED",
    fix: "Partial: Escape now leaves fullscreen instead of tearing down the whole lightbox. The sizing half of the case already passed.",
  },
  "checklist-buying-bidding-bid-history-auction-detail-pagination": {
    status: "NOT-A-BUG",
    fix: "The pagination code was always correct. The tester saw one bid because tester:setup DELETES bids (CASCADE tier) and never re-seeded them. Fixed as a HARNESS defect (SEED_TRANSACTIONAL), not a product one. My own first re-check also read total:1 — from a CACHED response (X-Vercel-Cache: HIT, Age: 293). Cache-busted: 5 items, total 14, 3 pages.",
  },

  // ---- OPEN ---------------------------------------------------------------
  "checklist-buying-bidding-place-bid-live-self": {
    status: "OPEN",
    fix: "Live bid updates do not reach the bidder's own page without a reload (SSE/live-update path).",
  },
  "checklist-buying-bidding-place-bid-live-other-viewer": {
    status: "OPEN",
    fix: "Same live-update path, observed from a second viewer.",
  },
  "checklist-buying-bidding-win-auction": {
    status: "OPEN",
    fix: "Winning an auction should create a payable locked cart line. Needs re-verification now that checkout works again.",
  },
  "checklist-buying-bidding-bid-below-current-plus-increment-rejected": { status: "OPEN", fix: null },
  "checklist-buying-bidding-first-bid-can-equal-starting-bid": { status: "OPEN", fix: null },
  "checklist-page-wiring-data-loss-lottery-booked-slot-cannot-be-deleted": { status: "OPEN", fix: null },
  "checklist-content-discovery-search-search-faqs": { status: "OPEN", fix: null },
  "checklist-account-auth-testing-program-admin-tester-access": {
    status: "OPEN",
    fix: "Spec question rather than a defect: /user/tester exists but the admin lacks canTestAdmin. Either the fixture grants it or role=admin should imply hub access. Part D1 resolves it by raising the tester's powers.",
  },
  "checklist-account-auth-profile-settings-own-public-profile-quick-links": {
    status: "OPEN",
    fix: "The three entry points resolve correctly; the profile 404s because publicProfile.isPublic is false. Offering the owner a link to their own private profile is the real UX defect.",
  },
  "checklist-buying-browsing-search-product-filter-status-labels": { status: "OPEN", fix: null },
  "checklist-buying-browsing-search-grid-follows-sidebar-not-viewport": { status: "OPEN", fix: null },
  "checklist-buying-browsing-search-compare-double-row-arrows": { status: "OPEN", fix: null },
  "checklist-buying-browsing-search-show-sold-toggle-reveals-items": { status: "OPEN", fix: null },
  "checklist-buying-browsing-search-product-type-chip-drives-sort-options": { status: "OPEN", fix: null },
  "checklist-buying-browsing-search-product-type-selection-survives-reload": { status: "OPEN", fix: null },
  "checklist-buying-buying-checkout-shipping-address-edit": {
    status: "OPEN",
    fix: "Deliberately deferred: no edit control exists on checkout address cards. A UI addition, not a fix.",
  },
  "checklist-buying-buying-checkout-gst-breakdown-display": {
    status: "OPEN",
    fix: "Deliberately deferred: needs buyer-vs-seller state resolution that is not client-side today.",
  },
  "checklist-buying-buying-checkout-checkout-back-navigation": {
    status: "OPEN",
    fix: "Deliberately deferred: per-step history needs pushState/popstate in a payment flow — double-submit and replay risk. Earns its own focused pass.",
  },
  "checklist-buying-product-detail-standard-detail": {
    status: "OPEN",
    fix: "Partial failure — the page renders everything expected; one expectedUiState clause about button visibility did not hold.",
  },
  "checklist-buying-product-detail-product-group-set-widget": { status: "OPEN", fix: null },
  "checklist-buying-product-detail-grouped-listings-carousel-on-detail": { status: "OPEN", fix: null },
  "checklist-buying-product-detail-live-item-video-mandatory": { status: "OPEN", fix: null },
};

/** Blocked-answer buckets, measured across every run. */
function bucketBlocked() {
  const buckets = new Map();
  for (const d of readdirSync(RUNS)) {
    const vd = resolve(RUNS, d, "verdicts");
    if (!existsSync(vd)) continue;
    for (const f of readdirSync(vd)) {
      let v;
      try {
        v = JSON.parse(readFileSync(resolve(vd, f), "utf8"));
      } catch {
        continue;
      }
      for (const x of v.verdicts ?? []) {
        if (x.answer || x.id.startsWith("control-")) continue;
        /*
         * The comment is lowercased FIRST, so every pattern here must be
         * lowercase too. An earlier version matched `canTestAdmin` against a
         * lowercased string — it could never hit, and 29 refused-account
         * answers sat in "other" looking like a mystery.
         */
        const c = String(x.comment ?? "").toLowerCase();
        let k = "other";
        if (/unauthorized|403|cantestadmin|no store seller access|authenticated admin session|seller\/admin access|admin access/.test(c))
          k = "tester account refused (no admin / no seller)";
        else if (/google|oauth|inbox|verification link/.test(c)) k = "needs a real Google account or inbox";
        else if (/no order|0 orders|total:0|no bids|no seeded|does not exist|not the winner/.test(c)) k = "fixture missing";
        else if (/#310|crash|something went wrong/.test(c)) k = "blocked by the checkout crash";
        else if (/ended|expired|auction.*(closed|ended)/.test(c)) k = "time-bound fixture expired";
        else if (/second (account|browser|window)|two (tabs|accounts|independent)|concurrent|simultan|only one bidder/.test(c))
          k = "needs two concurrent sessions";
        else if (/48-hour|wait|window/.test(c)) k = "needs a long wait";
        // The tester COULD reach the page and still declined to rule. That is
        // not an environment gap — it is the case failing to say what a pass
        // looks like, and it is the input to the Part B enrichment pass.
        else if (/inconclusive|could not isolate|partially checked|not tested|could not verify|cannot be tested meaningfully|not willing to call it/.test(c))
          k = "INCONCLUSIVE — the case does not define a verdict";
        buckets.set(k, (buckets.get(k) ?? 0) + 1);
      }
    }
  }
  return [...buckets.entries()].sort((a, b) => b[1] - a[1]);
}

function runHistory() {
  const rows = [];
  for (const d of readdirSync(RUNS)) {
    const vd = resolve(RUNS, d, "verdicts");
    if (!existsSync(vd)) continue;
    let Y = 0, N = 0, U = 0, B = 0, first = Infinity;
    for (const f of readdirSync(vd)) {
      let v;
      try {
        v = JSON.parse(readFileSync(resolve(vd, f), "utf8"));
      } catch {
        continue;
      }
      B++;
      first = Math.min(first, statSync(resolve(vd, f)).mtimeMs);
      for (const x of v.verdicts ?? []) {
        if (x.id.startsWith("control-")) continue;
        if (x.answer === "yes") Y++;
        else if (x.answer === "no") N++;
        else U++;
      }
    }
    rows.push({ run: d, B, Y, N, U, when: new Date(first).toISOString().slice(0, 10) });
  }
  return rows.sort((a, b) => a.when.localeCompare(b.when));
}

const failures = JSON.parse(readFileSync(resolve(RUNS, "_failures.json"), "utf8"));
const unclassified = failures.filter((f) => !CLASSIFICATION[f.id]);
if (unclassified.length) {
  console.error(`✗ ${unclassified.length} failure(s) have no classification — refusing to write a doc with holes:`);
  unclassified.forEach((f) => console.error(`   ${f.id}`));
  process.exit(1);
}

const byStatus = (s) => failures.filter((f) => CLASSIFICATION[f.id].status === s);
const hist = runHistory();
const buckets = bucketBlocked();
const totalBlocked = buckets.reduce((a, [, n]) => a + n, 0);

const L = [];
L.push("# Testing status");
L.push("");
L.push(`Generated ${new Date().toISOString()} by \`scripts/build-testing-status.mjs\`.`);
L.push("");
L.push("> Every number here is computed from the verdict files in");
L.push("> `tester/.tester-runs/*/verdicts/`. The FIXED / OPEN / NOT-A-BUG column is");
L.push("> hand-authored — a script can say a case failed, but only reading the code");
L.push("> says whether the fix shipped.");
L.push("");
L.push("## 1. Run history");
L.push("");
L.push("| run | date | batches | pass | fail | blocked |");
L.push("|---|---|---|---|---|---|");
for (const r of hist) L.push(`| \`${r.run}\` | ${r.when} | ${r.B} | ${r.Y} | ${r.N} | ${r.U} |`);
L.push("");
L.push(`**${failures.length} distinct cases have failed at least once.** \`sweep1\` was stopped`);
L.push("at 25 of 206 batches — not because it was failing, but because ~40% of its");
L.push("remaining cases were heading for \"blocked\" against fixtures the harness had");
L.push("deleted and windows that had already expired.");
L.push("");

const secs = [
  ["FIXED", "2. Fixed", "Shipped in appkit 4.35.3 / 4.35.4 plus consumer changes, deployed and verified."],
  ["NOT-A-BUG", "3. Not a bug", "The case failed, but the product was right. Recorded explicitly because each of these nearly cost a \"fix\" to working code."],
  ["OPEN", "4. Still open", "Reproduced and unfixed. Items marked *deferred* were a deliberate call, not an oversight."],
];
for (const [status, heading, blurb] of secs) {
  const items = byStatus(status);
  L.push(`## ${heading} — ${items.length}`);
  L.push("");
  L.push(blurb);
  L.push("");
  for (const f of items) {
    const c = CLASSIFICATION[f.id];
    L.push(`### ${f.label}`);
    L.push("");
    L.push(`- \`${f.id}\` · seen in: ${f.runs.map((r) => `\`${r}\``).join(", ")}`);
    L.push(`- **Evidence** — ${String(f.ev).replace(/\s+/g, " ").trim() || "_(none recorded)_"}`);
    if (c.fix) L.push(`- **${status === "OPEN" ? "Note" : "Resolution"}** — ${c.fix}`);
    L.push("");
  }
}

L.push(`## 5. Why cases could not be tested — ${totalBlocked} blocked answers`);
L.push("");
L.push("| count | cause | addressed by |");
L.push("|---|---|---|");
const ADDRESSED = {
  "fixture missing (orders / bids)": "**Fixed** — `SEED_TRANSACTIONAL` re-seeds orders/bids/payouts/eventEntries",
  "blocked by the checkout crash": "**Fixed** — React #310",
  "time-bound fixture expired": "**Fixed by design** — per-batch fixtures, no windows (plan D5)",
  "tester account refused (no admin / no seller)": "Plan D1 — raise the tester's powers",
  "needs a real Google account or inbox": "Dropped — not automatable",
  "needs two concurrent sessions": "Plan D2 — five tester accounts makes this reachable",
  "needs a long wait": "**Fixed by design** — seed the end state, never wait (plan D5)",
  "INCONCLUSIVE — the case does not define a verdict": "**Plan B** — these are the cases to enrich; the tester reached the page and the case did not say what a pass looks like",
};
for (const [k, n] of buckets) L.push(`| ${n} | ${k} | ${ADDRESSED[k] ?? "—"} |`);
L.push("");
L.push("## 6. What the next run should look like");
L.push("");
L.push("A prediction, so the next run can be checked against it rather than admired:");
L.push("");
L.push("- The **fixture-missing**, **checkout-crash**, **expired-window** and **long-wait**");
L.push("  buckets should all go to zero. Together that is the majority of blocked answers.");
L.push("- The **tester-refused** bucket should go to zero once the accounts carry admin");
L.push("  and seller powers.");
L.push("- The **Google/inbox** bucket should stay — it is genuinely not automatable, and");
L.push("  those cases are hand-off work for a person.");
L.push("- The 16 FIXED cases above should flip to pass. Any that does not is a");
L.push("  regression, and the fix did not do what this document claims.");
L.push("");

mkdirSync(resolve("docs"), { recursive: true });
writeFileSync(OUT, L.join("\n") + "\n");
console.log(
  `docs/TESTING-STATUS.md: ${hist.length} runs · ${failures.length} distinct failures ` +
    `(${byStatus("FIXED").length} fixed, ${byStatus("NOT-A-BUG").length} not-a-bug, ${byStatus("OPEN").length} open) · ${totalBlocked} blocked`,
);

#!/usr/bin/env node
/**
 * audit-tester-plugin-wiring.mjs — strict-zero.
 *
 * Guards the boundary the tester runner rests on.
 *
 * A tester run WIPES the seeded catalog from a live project and re-seeds it. That
 * is only tolerable because the wipe is tiered: real accounts, their Firebase Auth
 * records, their saved addresses and siteSettings (which carries the encrypted live
 * API keys) are PRESERVED, and only the catalog plus the transactional rows pointing
 * at it are destroyed.
 *
 * Nothing in TypeScript enforces that boundary — tester/scripts/lib/collections.mjs
 * is plain JS in a submodule, outside tsc, outside eslint, and outside every other
 * audit (all of which scan `src` and `appkit/src` only). So this is the one check.
 *
 * Rules:
 *   R1  Every collection with seed data is classified into exactly one tier.
 *       Unclassified means preserved, so a NEW collection is safe by default — but
 *       silently un-seeded, which is its own bug. This makes it visible.
 *   R2  The PRESERVE tier still contains the four collections whose loss is
 *       permanent. Removing one is how a run starts deleting real accounts.
 *   R3  Nothing under tester/scripts/ except the session helper touches the auth
 *       endpoints. /api/auth/login, /session and /me share ONE 10-request-per-60s
 *       bucket keyed on IP; a second caller exhausts the budget the run needs.
 *   R4  Time-bound tester fixtures go through tester-window.ts. A hard-coded
 *       duration cannot be shortened, which is what makes "watch an auction end"
 *       untestable in any run shorter than the literal.
 *
 * And the six-part case contract — role · startPage · steps · expectedBehaviour ·
 * expectedUiState · endResult. `merge-authored.mjs` refuses most of this at
 * authoring time; these are the durable gate, because an authored module's header
 * invites hand edits and a validator you can walk around is a suggestion:
 *
 *   R5  Every case on a page NOT on the ratchet list has all six parts. Five of six
 *       is a fail — the missing one is always the one that would have caught the
 *       bug. RATCHET, seeded from a run of this rule (90 pages), shrink-only.
 *   R6  No mechanical "Open X. Verify Y." scaffold. It reaches 100% while encoding
 *       nothing the label did not already say, turning a visible gap into an
 *       invisible one (Root Cause #83).
 *   R7  Every fixture id cited in a step resolves to a real seed id — the
 *       checklist's stale-`href` failure (Root Cause #32) moved into step bodies,
 *       where no existing audit could see it.
 *   R8  A step asking for input names the literal value. "Enter an amount below the
 *       price" is a different test every run, so two runs cannot be diffed.
 *   R9  startPage is unprefixed and real. A procedure that begins at a dead URL
 *       wastes the tester's first step.
 *  R10  role and startPage are coherent. `buyer` + `/admin/**` can only ever produce
 *       /unauthorized; `guest` + `/user/**` is redirected before the case begins.
 *
 * 🛑 All six were SEEN TO FAIL against deliberate violations before landing (Root
 * Cause #87) — which is how R10 was caught matching nothing: its first form expected
 * the generator's exact line breaks, so both probes passed while violating it.
 *
 * Skips cleanly (exit 0) when tester/ is absent — a fresh clone without
 * --recursive must not fail `npm run check`.
 *
 * Strict-zero, no suppression marker.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TESTER_DIR = resolve(ROOT, "tester");
const violations = [];

if (!existsSync(TESTER_DIR)) {
  console.log("audit-tester-plugin-wiring: tester/ not checked out — skipping.");
  process.exit(0);
}

const read = (p) => readFileSync(p, "utf8");
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/* ── Load the tier declarations ──────────────────────────────────────────── */

const collectionsPath = resolve(TESTER_DIR, "scripts/lib/collections.mjs");
if (!existsSync(collectionsPath)) {
  violations.push(`R1 missing file: tester/scripts/lib/collections.mjs — the tier boundary is undeclared`);
}

const tiers = { PRESERVE: [], SEED_OWNED: [], DERIVED: [], CASCADE: [] };
if (existsSync(collectionsPath)) {
  const src = stripComments(read(collectionsPath));
  for (const name of ["PRESERVE", "SEED_OWNED", "DERIVED"]) {
    const m = src.match(new RegExp(`export const ${name} = Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\)`));
    if (m) tiers[name] = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  }
  const cm = src.match(/export const CASCADE = Object\.freeze\(\[([\s\S]*?)\]\);/);
  if (cm) tiers.CASCADE = [...cm[1].matchAll(/collection:\s*"([^"]+)"/g)].map((x) => x[1]);
}

/* ── R2: the preserve tier must still hold the irreplaceable four ────────── */

const MUST_PRESERVE = ["users", "addresses", "sessions", "siteSettings"];
for (const c of MUST_PRESERVE) {
  if (!tiers.PRESERVE.includes(c)) {
    violations.push(
      `R2 "${c}" is no longer in the PRESERVE tier of tester/scripts/lib/collections.mjs. ` +
        `A run would delete it, and it cannot be rebuilt from seed data.`,
    );
  }
}

/* ── R1: every seeded collection is classified ───────────────────────────── */

/**
 * Derive the collection list from COLLECTION_MAP in appkit/scripts/seed-cli.mjs —
 * the authoritative registry of what the seeder actually writes.
 *
 * 🛑 This rule previously parsed appkit/src/seed/index.ts for `collection: "x"`
 * pairs, which do not exist in that file. It therefore built an EMPTY set and
 * passed unconditionally, while four real collections (carousels, productFeatures,
 * scammerProfiles, conversations) sat unclassified and survived a live clear.
 * An audit that reports OK because it is looking at nothing is worse than no audit
 * (Root Cause #84). Hence the explicit emptiness check below.
 */
const seedCli = resolve(ROOT, "appkit/scripts/seed-cli.mjs");
const seededCollections = new Set();
if (existsSync(seedCli)) {
  const src = stripComments(read(seedCli));
  const block = src.match(/const COLLECTION_MAP\s*=\s*\{([\s\S]*?)\n\};/);
  if (block) for (const m of block[1].matchAll(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s*:/gm)) seededCollections.add(m[1]);
}

if (seededCollections.size === 0) {
  violations.push(
    `R1 could not extract any collection names from appkit/scripts/seed-cli.mjs's COLLECTION_MAP. ` +
      `The rule cannot run, and a rule that silently checks nothing reports OK forever — ` +
      `fix the parser rather than letting this pass.`,
  );
}

const classified = new Set([...tiers.PRESERVE, ...tiers.SEED_OWNED, ...tiers.DERIVED, ...tiers.CASCADE]);
for (const c of seededCollections) {
  if (!classified.has(c)) {
    violations.push(
      `R1 "${c}" has seed data but is not classified in tester/scripts/lib/collections.mjs. ` +
        `Unclassified means PRESERVED, so a run will re-seed nothing for it and leave stale rows. ` +
        `Add it to PRESERVE, SEED_OWNED or CASCADE.`,
    );
  }
}

const overlap = tiers.SEED_OWNED.filter((c) => tiers.PRESERVE.includes(c));
for (const c of overlap) violations.push(`R1 "${c}" is in BOTH PRESERVE and SEED_OWNED — the tiers must be disjoint.`);

/* ── R3: only the session helper may touch the auth endpoints ────────────── */

const AUTH_RE = /\/api\/auth\/(login|session|me)\b/;
const ALLOWED_AUTH_CALLERS = new Set(["fetch-cases.mjs", "record-verdicts.mjs"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".mjs") || entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

for (const file of walk(resolve(TESTER_DIR, "scripts"))) {
  const base = file.split(/[\\/]/).pop();
  if (ALLOWED_AUTH_CALLERS.has(base)) continue;
  const src = stripComments(read(file));
  if (AUTH_RE.test(src)) {
    violations.push(
      `R3 ${file.replace(ROOT, ".")} references an /api/auth/* endpoint. ` +
        `login, session and me share ONE 10-req/60s bucket keyed on IP — only ` +
        `${[...ALLOWED_AUTH_CALLERS].join(" and ")} may call them.`,
    );
  }
}

/* ── R4: time-bound tester fixtures derive from tester-window.ts ─────────── */

const seedDir = resolve(ROOT, "appkit/src/features/tester/seed-data");
const TIME_FIELDS = /(auctionEndDate|drawWindowDurationMinutes|expiresAt|checkoutDeadline|spinWindowEnd)\s*:/;
if (existsSync(seedDir)) {
  for (const name of readdirSync(seedDir)) {
    if (!name.endsWith("-seed-data.ts")) continue;
    const file = resolve(seedDir, name);
    const src = stripComments(read(file));
    if (!TIME_FIELDS.test(src)) continue;
    if (!/from "\.\/tester-window"/.test(src)) {
      violations.push(
        `R4 ${name} sets a time-bound fixture field but does not import ./tester-window. ` +
          `A hard-coded duration cannot be shortened, so the case that watches it close ` +
          `is untestable in any run shorter than the literal.`,
      );
    }
  }
}

/* ── R5–R10: the six-part case contract ──────────────────────────────────────
 *
 * `merge-authored.mjs` already refuses most of this at authoring time, and that is
 * the fast feedback. These are the DURABLE gate: an authored module's own header
 * says hand edits are safe and expected, so every rule the merge enforces has to
 * hold for a file nobody merged. A validator you can walk around is a suggestion.
 *
 * Everything below reads the seed SOURCE — the catalogue plus the authored overlay
 * — never Firestore. Firestore is downstream of the seed and a run wipes it.
 */

const CATALOGUE = resolve(ROOT, "appkit/src/features/tester/seed-data/tester-checklist-seed-data.ts");
const AUTHORED_DIR = resolve(ROOT, "appkit/src/features/tester/seed-data/authored");
const MONEY_FLOWS = resolve(ROOT, "appkit/src/features/tester/seed-data/_money-flows.ts");

/**
 * 🛑 A RATCHET, NOT A BASELINE. This list may only ever SHRINK.
 *
 * Every page here still has cases without the six parts. Removing an entry is the
 * goal; adding one is the thing being blocked. A page NOT listed must be complete,
 * so adding a case to a finished page fails immediately — which is the point.
 *
 * When this empties, delete it and the `has()` guard with it: a ratchet is a
 * migration mechanism, not a tolerated baseline (CLAUDE.md § "a ratchet is not a
 * baseline"). Seeded from a run of this rule, never from a hand-written list —
 * Root Cause #84.
 */
const UNAUTHORED_PAGES = new Set([
  "account-auth/profile-settings",
  "account-auth/signup-login",
  "account-auth/testing-program",
  "addresses/address-filters",
  "addresses/postal-lookup",
  "addresses/postal-validation",
  "addresses/state-picker",
  "addresses/unban-request",
  "admin/blog-faqs",
  "admin/bug-hunter-rewards",
  "admin/bundles",
  "admin/buyer-data-admin",
  "admin/catalog-listings",
  "admin/classifieds-digitalcodes-live",
  "admin/content-marketing",
  "admin/coupons",
  "admin/events-raffles-spin",
  "admin/media-watermark",
  "admin/orders-fulfillment",
  "admin/prize-draws-lotteries",
  "admin/site-system",
  "admin/users-trust",
  "buying/bidding",
  "buying/browsing-search",
  "buying/buying-checkout",
  "buying/buying-coupons",
  "buying/cart",
  "buying/image-tile-layout",
  "buying/my-orders",
  "buying/offers",
  "buying/product-detail",
  "buying/return-request",
  "buying/reviews",
  "buying/reviews-pagination",
  "buying/user-dashboard-extras",
  "buying/user-dashboard-navigation",
  "buying/wishlist-history",
  "community-support/public-profile",
  "community-support/support-tickets",
  "content-discovery/blog",
  "content-discovery/coupons",
  "content-discovery/events",
  "content-discovery/faq-help",
  "content-discovery/notifications",
  "content-discovery/search",
  "cta-layout/checkout-bottom-bar",
  "cta-layout/dialog-footers",
  "cta-layout/editor-action-bar",
  "cta-layout/product-bottom-bar",
  "design-ux/back-to-top-button",
  "design-ux/carousel-arrow-bounds",
  "design-ux/dashboard-layout",
  "design-ux/footer-theme",
  "design-ux/form-validation-errors",
  "design-ux/general-design",
  "design-ux/hand-mode-layout",
  "design-ux/homepage-carousels",
  "design-ux/status-badge-legibility",
  "design-ux/sticky-cta-bar",
  "page-wiring/data-loss",
  "page-wiring/detail-pages",
  "page-wiring/drawer-pages",
  "page-wiring/reachability",
  "public-pages/auth-error-pages",
  "public-pages/bug-hunters",
  "public-pages/core-listing-pages",
  "public-pages/help-how-it-works",
  "public-pages/legal-policy-pages",
  "public-pages/stores-sellers-directories",
  "search-and-nav/employee-permissions",
  "search-and-nav/header-search",
  "search-and-nav/settings-deep-links",
  "search-and-nav/sidebar-search",
  "selling/become-seller",
  "selling/final-sale-authoring",
  "selling/listing-a-product",
  "selling/listing-type-fields-roundtrip",
  "selling/media-limits",
  "selling/sectionised-forms",
  "selling/seller-analytics-payouts",
  "selling/seller-bids-bundles-filters",
  "selling/seller-catalog-org",
  "selling/seller-custom-brands",
  "selling/seller-guide",
  "selling/seller-listing-types",
  "selling/seller-marketing-extras",
  "selling/seller-ops-comms",
  "selling/seller-orders",
  "selling/seller-shipping-payouts-setup",
  "selling/store-dashboard-navigation",
]);

if (existsSync(CATALOGUE)) {
  const authoredSrc = existsSync(AUTHORED_DIR)
    ? readdirSync(AUTHORED_DIR)
        .filter((f) => f.endsWith(".ts") && f !== "index.ts" && !f.startsWith("_"))
        .map((f) => read(resolve(AUTHORED_DIR, f)))
        .join("\n")
    : "";
  const inlineSrc = read(CATALOGUE) + (existsSync(MONEY_FLOWS) ? read(MONEY_FLOWS) : "");

  /* R7 — every fixture id an authored step cites must be a real seed id. */
  const seedIds = new Set();
  {
    const walk = (dir) => {
      if (!existsSync(dir)) return;
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = resolve(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (e.name.endsWith(".ts")) {
          const s = read(full);
          for (const m of s.matchAll(/\bid:\s*"([^"]+)"/g)) seedIds.add(m[1]);
          for (const m of s.matchAll(/\bslug:\s*"([^"]+)"/g)) seedIds.add(m[1]);
          // Template-literal families: `auction-…-cycle-${i+1}` can never match a
          // quoted scan, so record the PREFIX and accept any concrete id under it.
          // Inventing -1..-3 here would be the fabricated-value problem itself.
          for (const m of s.matchAll(/\bid:\s*`([^`$]*)\$\{/g)) if (m[1].length > 6) seedIds.add(m[1] + "*");
        }
      }
    };
    walk(resolve(ROOT, "appkit/src/seed"));
    walk(resolve(ROOT, "appkit/src/features/tester/seed-data"));
  }
  const idKnown = (id) =>
    seedIds.has(id) || [...seedIds].some((s) => s.endsWith("*") && id.startsWith(s.slice(0, -1)));

  const FIXTURE_RE =
    /\b(?:product|auction|preorder|prizedraw|classified|digitalcode|live|art|sticker|category|brand|bundle|offer|event|store|coupon|group)-[a-z0-9][a-z0-9-]{4,}/g;

  const unknown = new Set();
  for (const m of authoredSrc.matchAll(FIXTURE_RE)) {
    const id = m[0];
    // The overlay is keyed by `checklist-<group>-<page>-<key>`, whose tail matches
    // this shape (`product-detail-video-playback`). Those are case ids, not fixtures.
    if (/^(product|category|event|store|group)-detail/.test(id)) continue;
    if (!idKnown(id)) unknown.add(id);
  }
  for (const id of [...unknown].sort()) {
    violations.push(
      `R7 authored steps cite "${id}", which is not a seed id. A tester follows it, ` +
        `finds nothing, and reports a bug that is really a typo in the case (Root Cause #32).`,
    );
  }

  /* R6 — the mechanical scaffold, which reaches 100% while encoding nothing. */
  for (const m of authoredSrc.matchAll(/"(Open|Go to|Navigate to)[^"]*\.\s*Verify[^"]*"/gi)) {
    violations.push(`R6 mechanical "Open X. Verify Y." step: ${m[0].slice(0, 70)}`);
  }

  /* R8 — a step asking for input must name the value. */
  const VAGUE = [
    /"[^"]*\benter (an?|some) (amount|value|price|number)[^"]*"/i,
    /"[^"]*\b(pick|choose|select) (a|an|any|some) (category|brand|option|date|product|store)\b[^"]*"/i,
    /"[^"]*\bbid (above|below|over|under) the\b[^"]*"/i,
  ];
  for (const re of VAGUE) {
    const m = authoredSrc.match(re);
    if (m) {
      violations.push(
        `R8 step has no literal value: ${m[0].slice(0, 70)} — an unrepeatable case ` +
          `cannot be diffed between runs, so a regression cannot be spotted.`,
      );
    }
  }

  /* R9 + R10 — startPage must be real, and coherent with role. */
  const allSrc = authoredSrc + inlineSrc;
  for (const m of allSrc.matchAll(/startPage:\s*"([^"]+)"/g)) {
    if (/^\/(en|hi)\//.test(m[1])) violations.push(`R9 startPage "${m[1]}" is locale-prefixed; the tester uses unprefixed paths.`);
  }
  /*
   * Split into entries and read each block's own fields.
   *
   * This started as one regex expecting `role: "x",\n  startPage: "y"` — the exact
   * shape merge-authored.mjs emits — and it silently matched NOTHING when both
   * fields sat on one line. Both R10 probes passed while violating the rule. Since
   * an authored module's header explicitly invites hand edits, a rule that only
   * recognises generated formatting checks the one case that was already safe.
   */
  const entryStarts = [...authoredSrc.matchAll(/"(checklist-[^"]+)":\s*\{/g)];
  const blocks = entryStarts.map((m, i) => ({
    id: m[1],
    body: authoredSrc.slice(m.index ?? 0, i + 1 < entryStarts.length ? entryStarts[i + 1].index : authoredSrc.length),
  }));
  for (const { body } of blocks) {
    const role = body.match(/\brole:\s*"(\w+)"/)?.[1];
    const page = body.match(/\bstartPage:\s*"([^"]+)"/)?.[1];
    if (!role || !page) continue;
    if (page.startsWith("/admin") && role !== "admin" && role !== "employee") {
      violations.push(`R10 role "${role}" with startPage "${page}" — that case can only ever produce /unauthorized.`);
    }
    if (role === "guest" && /^\/(admin|store|user|cart|checkout|wishlist)\b/.test(page)) {
      violations.push(`R10 role "guest" with startPage "${page}" — a signed-out visitor is redirected before the case begins.`);
    }
  }

  /* R5 — the six parts, per page, ratcheted. */
  const pageAnchors = [...inlineSrc.matchAll(/pageKey:\s*"([^"]+)"/g)];
  const groupOf = (idx) => {
    const before = inlineSrc.slice(0, idx);
    const g = [...before.matchAll(/group\(\s*"([^"]+)"/g)].pop();
    return g ? g[1] : "?";
  };
  for (const [i, m] of pageAnchors.entries()) {
    const pageKey = m[1];
    const key = `${groupOf(m.index ?? 0)}/${pageKey}`;
    if (UNAUTHORED_PAGES.has(key)) continue;
    const start = m.index ?? 0;
    const end = i + 1 < pageAnchors.length ? pageAnchors[i + 1].index : inlineSrc.length;
    const caseKeys = [...inlineSrc.slice(start, end).matchAll(/\bkey:\s*"([^"]+)"/g)].map((x) => x[1]);
    const missing = caseKeys.filter((k) => {
      const id = `checklist-${key.replace("/", "-")}-${k}`;
      // Inline-authored cases carry `steps:` beside their own key in the catalogue.
      const inlineHas = new RegExp(`key:\\s*"${k}"[\\s\\S]{0,3000}?steps:\\s*\\[`).test(inlineSrc.slice(start, end));
      return !inlineHas && !authoredSrc.includes(`"${id}"`);
    });
    if (missing.length) {
      violations.push(
        `R5 ${key} is not on the ratchet list but ${missing.length} of its ${caseKeys.length} case(s) ` +
          `have no six-part procedure: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? " …" : ""}`,
      );
    }
  }
}

/* ── Report ──────────────────────────────────────────────────────────────── */

if (violations.length > 0) {
  console.error(`\naudit-tester-plugin-wiring: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  ✗ ${v}`);
  console.error("");
  process.exit(1);
}

console.log(
  `audit-tester-plugin-wiring: OK — ${tiers.PRESERVE.length} preserved, ` +
    `${tiers.SEED_OWNED.length} seed-owned, ${tiers.DERIVED.length} derived, ${tiers.CASCADE.length} cascade.`,
);
process.exit(0);

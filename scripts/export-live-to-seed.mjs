#!/usr/bin/env node
/**
 * Promote hand-curated LIVE Firestore data back into the local seed files.
 *
 * ## Why this exists
 *
 * The owner curates the live catalogue by hand — FAQ answers, homepage
 * sections, product copy. The seed files are the only thing that can REPRODUCE
 * that catalogue, and there was no path from live back into them. So the
 * curation was one command from being destroyed, in two different ways, and
 * neither warns:
 *
 *   - `appkit-seed load` writes `set(payload, { merge: true })`, so **every key
 *     the seed payload declares overwrites live**. It reports
 *     `created N, errors 0`.
 *   - **A tester run DELETES `faqs` wholesale** (it is in SEED_OWNED, with 27
 *     other collections) and re-seeds from the stale file. Not overwritten —
 *     gone.
 *
 * And neither existing tool can SEE the drift. `appkit-seed status` counts
 * document IDS, which is why it once reported `products 71/71` against a
 * collection holding 1,039; a rewritten FAQ answer reports as perfectly in
 * sync. `load` cannot remove a field either, so the drift is asymmetric: the
 * seed can overwrite live, and live can never correct the seed.
 *
 * ## 🛑 DIFF-FIRST. This writes nothing without `--write`
 *
 * A tool that silently rewrites 1,308 product fixtures is as dangerous as the
 * problem it solves. The useful output is the diff: which ids and which fields
 * actually moved. Read that before promoting anything.
 *
 * ## 🛑 What it deliberately REFUSES
 *
 * `users` / `addresses` / `sessions` / `siteSettings` are refused outright.
 * They are the tester's PRESERVE tier for a reason: `siteSettings.credentials`
 * holds live API keys and the other three hold PII. Promoting any of them
 * writes secrets or personal data into a git-tracked file.
 *
 * PII-bearing fields are skipped on everything else. Live holds `enc:v1:`
 * ciphertext; round-tripping it would commit ciphertext to git AND
 * double-encrypt it on the next load, which is the `whatsappConfig.accessToken`
 * trap that is already documented as unrecoverable without a
 * decrypt-and-renormalise migration.
 *
 * The generated corpora (`partGlossary`, `beys`, `products-catalogue`) are
 * excluded: they carry `GENERATED … do not edit by hand` headers and are
 * `gen-*.mjs` output, so promoting live over them fights the generator. Those
 * two already have the `adminEdited` / `adminEditedFields` mechanism, which is
 * the right instrument for them.
 *
 * ## 🛑 Every exclusion is REPORTED, never applied silently
 *
 * An audit whose exemption list nobody verified is how 40 real defects hid
 * behind a prefix allowlist (Root Cause #106). So the summary prints what was
 * compared, what was skipped, and why — and a field skipped as "volatile" is
 * named rather than quietly dropped.
 *
 * Usage:
 *   node scripts/export-live-to-seed.mjs --collections faqs
 *   node scripts/export-live-to-seed.mjs --collections faqs --verbose
 *   node scripts/export-live-to-seed.mjs --collections faqs --write
 */

import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Load the seed corpus.
 *
 * 🛑 A RELATIVE path, never `@mohasinac/appkit/seed`. That subpath does not
 * exist — measured 2026-10-21, **46 export keys and no `./seed`, in both the
 * installed copy and `appkit/package.json`** — and `seed-cli.mjs` explains why
 * in its own comment: it was added and then removed in the same change,
 * because `dist/seed` is excluded from the published tarball (27 MB of 52 MB),
 * so a declared export pointing at files the package does not contain is a
 * landmine for anyone who imports it.
 *
 * This mirrors `seed-cli.mjs`'s `importSeedModule()` exactly, including the
 * loud throw. The failure that must never happen is the SILENT one — an import
 * resolving to nothing, then a diff reporting "no drift" because it compared
 * live against an empty array. That is Root Cause #90's shape and it would make
 * this tool assert the opposite of the truth.
 */
async function importSeedModule() {
  const candidates = [
    resolve(process.cwd(), "node_modules/@mohasinac/appkit/dist/seed/index.js"),
    resolve(process.cwd(), "appkit/dist/seed/index.js"),
  ];
  const attempts = [];
  for (const p of candidates) {
    try {
      return await import(pathToFileURL(p).href);
    } catch (err) {
      attempts.push(`${p} — ${err?.code ?? err?.message ?? err}`);
    }
  }
  console.error(
    "[31m✗ Could not load the seed data.[0m\n" +
      "  The seed is excluded from the published package on purpose — it is a repo\n" +
      "  operation, not something a consumer does. Build it first:\n\n" +
      "      npm --prefix ./appkit run build\n\n" +
      "  Tried:\n" +
      attempts.map((a) => `      ${a}`).join("\n"),
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Scope
// ---------------------------------------------------------------------------

/**
 * 🛑 Refused outright. The tester's PRESERVE tier, and for the same reasons:
 * secrets and PII. There is no flag that enables these.
 */
const REFUSED = new Set(["users", "addresses", "sessions", "siteSettings"]);

/**
 * 🛑 Generator output. Promoting live over these fights `gen-*.mjs`, and both
 * of the ones with an editor already have `adminEdited` protection.
 */
const GENERATED = new Set(["partGlossary", "beys", "productsCatalogue", "modelComposition"]);

/**
 * seed key → { collection, seedExport }
 *
 * Deliberately EXPLICIT and small rather than derived from `seed-cli`'s maps.
 * This tool rewrites source files, so targeting the wrong collection is
 * unrecoverable — an explicit list is checkable by eye, and a collection
 * missing from it fails loudly rather than being promoted by accident.
 */
const PROMOTABLE = {
  faqs: { collection: "faqs", seedExport: "faqSeedData", file: "appkit/src/seed/faq-seed-data.ts" },
  blogPosts: { collection: "blogPosts", seedExport: "blogPostsSeedData", file: "appkit/src/seed/blog-posts-seed-data.ts" },
  events: { collection: "events", seedExport: "eventsSeedData", file: "appkit/src/seed/events-seed-data.ts" },
  coupons: { collection: "coupons", seedExport: "couponsSeedData", file: "appkit/src/seed/coupons-seed-data.ts" },
  homepageSections: { collection: "homepageSections", seedExport: "homepageSectionsSeedData", file: "appkit/src/seed/homepage-sections-seed-data.ts" },
  carouselSlides: { collection: "carouselSlides", seedExport: "carouselSlidesSeedData", file: "appkit/src/seed/carousel-slides-seed-data.ts" },
  stores: { collection: "stores", seedExport: "storesSeedData", file: "appkit/src/seed/stores-seed-data.ts" },
  orders: { collection: "orders", seedExport: "ordersSeedData", file: "appkit/src/seed/orders-seed-data.ts" },
  bids: { collection: "bids", seedExport: "bidsSeedData", file: "appkit/src/seed/bids-seed-data.ts" },
  notifications: { collection: "notifications", seedExport: "notificationsSeedData", file: "appkit/src/seed/notifications-seed-data.ts" },
  offers: { collection: "offers", seedExport: "offersSeedData", file: "appkit/src/seed/offers-seed-data.ts" },
  payouts: { collection: "payouts", seedExport: "payoutsSeedData", file: "appkit/src/seed/payouts-seed-data.ts" },
  supportTickets: { collection: "supportTickets", seedExport: "supportTicketsSeedData", file: "appkit/src/seed/support-tickets-seed-data.ts" },
  groupedListings: { collection: "groupedListings", seedExport: "groupedListingsSeedData", file: "appkit/src/seed/grouped-listings-seed-data.ts" },
  scammerProfiles: { collection: "scammerProfiles", seedExport: "scammersSeedData", file: "appkit/src/seed/scammers-seed-data.ts" },
  catalogueItems: { collection: "catalogueItems", seedExport: "catalogueSeedData", file: "appkit/src/seed/catalogue-seed-data.ts" },
  couponUsage: { collection: "couponUsage", seedExport: "couponUsageSeedData", file: "appkit/src/seed/coupon-usage-seed-data.ts" },
  storeAddresses: { collection: "storeAddresses", seedExport: "storeAddressesSeedData", file: "appkit/src/seed/store-addresses-seed-data.ts" },
  payoutMethods: { collection: "payoutMethods", seedExport: "payoutMethodsSeedData", file: "appkit/src/seed/store-extensions-seed-data.ts" },
  analyticsAlerts: { collection: "analyticsAlerts", seedExport: "analyticsAlertsSeedData", file: "appkit/src/seed/store-extensions-seed-data.ts" },
  storeCategories: { collection: "storeCategories", seedExport: "storeCategoriesSeedData", file: "appkit/src/seed/store-extensions-seed-data.ts" },
  listingTemplates: { collection: "listingTemplates", seedExport: "listingTemplatesSeedData", file: "appkit/src/seed/store-extensions-seed-data.ts" },
  moderationQueue: { collection: "moderationQueue", seedExport: "moderationQueueSeedData", file: "appkit/src/seed/store-extensions-seed-data.ts" },
  reports: { collection: "reports", seedExport: "reportsSeedData", file: "appkit/src/seed/store-extensions-seed-data.ts" },
  itemRequests: { collection: "itemRequests", seedExport: "itemRequestsSeedData", file: "appkit/src/seed/store-extensions-seed-data.ts" },
  storeGoogleConfig: { collection: "storeGoogleConfig", seedExport: "storeGoogleConfigSeedData", file: "appkit/src/seed/store-extensions-seed-data.ts" },
  shippingConfigs: { collection: "shippingConfigs", seedExport: "shippingConfigsSeedData", file: "appkit/src/seed/store-extensions-seed-data.ts" },
  analyticsCards: { collection: "analyticsCards", seedExport: "analyticsCardsSeedData", file: "appkit/src/seed/store-extensions-seed-data.ts" },
  categories: { collection: "categories", seedExport: "categoriesSeedData", file: "appkit/src/seed/categories-seed-data.ts" },
  /*
   * 🛑 `products` is TWELVE arrays, not one — the seed ships one per listing
   * type and `seed-cli` concatenates them.
   *
   * Enumerated by NAME deliberately, because a `/^products.*SeedData$/` filter
   * also matches `productFeaturesSeedData` — a different collection whose 170
   * rows would make every live product look orphaned.
   *
   * 🛑 And the list must be checked against `seed-cli.mjs`'s own import block,
   * not written from memory. My first version had TEN, omitting
   * `productsBeybladeXSeedData` and `productsSparesSeedData` — which are
   * precisely where the live `product-beyblade-x-*` and `spare-*` rows sit, so
   * the omission reported 16 live rows as unreproducible when most of them
   * were in the seed all along. A short enumeration is worse than no
   * enumeration when it is used to decide what to delete.
   */
  products: {
    collection: "products",
    seedExport: [
      "productsStandardSeedData",
      "productsBeybladeXSeedData",
      "productsAuctionsSeedData",
      "productsPreordersSeedData",
      "productsPrizeDrawsSeedData",
      "productsClassifiedsSeedData",
      "productsDigitalCodesSeedData",
      "productsLiveItemsSeedData",
      "productsArtSeedData",
      "productsStickersSeedData",
      "productsSparesSeedData",
      /*
       * 🛑 `productsCatalogueSeedData` is deliberately NOT here.
       *
       * It is 4,657 generated rows and the loader **DEREGISTERED** it on
       * 2026-10-19 — `seed-cli.mjs:672` is not spread into `REAL_PRODUCTS`,
       * because real curated listings now occupy the same taxonomy leaves and
       * re-enabling it would put hash-priced synthetic duplicates (one
       * measured at a NEGATIVE price) into the categories the real BX-53
       * fixtures hold.
       *
       * Including it here was my own measurement error and it reported a load
       * hazard of 4,733 products where the real figure is ZERO. The lesson is
       * the one this whole plan keeps relearning: **this tool must compare
       * live against what the LOADER WRITES, never against what the barrel
       * exports.** The two differ by two layers — this deregistration, and
       * `realListingsOnly()` below.
       */
    ],
    file: "appkit/src/seed/products-*-seed-data.ts",
    /*
     * 🛑 And even the arrays above are not what loads. `seed-cli.mjs:502`
     * wraps them in `realListingsOnly()`, which keeps only rows whose
     * `storeId` is a REAL store and whose imagery is not a generated
     * `/images/seed-tiles/` placeholder — 76 of the 90 are dropped.
     *
     * So the authoritative question "what would a load actually write" is
     * answered by the loader itself, read-only:
     *
     *     npx appkit-seed load --dry-run --collections products
     *
     * which reports `products 14 seed / 14 in db / 0 would create`. Prefer
     * that over anything this script infers about products.
     */
    loaderFiltered: true,
  },
};

/**
 * Where each collection's ids live IN SOURCE, for `--source-ids`.
 *
 * Globs rather than single paths because `products` is twelve files and the
 * generated catalogue is nineteen more. The prefix list is what scopes the
 * regex: matching a bare `id:` would also pick up nested ids (a slot's
 * `id`, a spin prize's `id`) and inflate the set.
 */
const SOURCE = {
  faqs: { globs: ["appkit/src/seed/faq-seed-data.ts"], prefixes: ["faq-"] },
  blogPosts: { globs: ["appkit/src/seed/blog-posts-seed-data.ts"], prefixes: ["blog-"] },
  events: { globs: ["appkit/src/seed/events-seed-data.ts"], prefixes: ["event-"] },
  coupons: { globs: ["appkit/src/seed/coupons-seed-data.ts"], prefixes: ["coupon-"] },
  homepageSections: { globs: ["appkit/src/seed/homepage-sections-seed-data.ts"], prefixes: ["section-"] },
  carouselSlides: { globs: ["appkit/src/seed/carousel-slides-seed-data.ts"], prefixes: ["slide-"] },
  stores: { globs: ["appkit/src/seed/stores-seed-data.ts"], prefixes: ["store-"] },
  /*
   * ── Live-EMPTY collections, pruned wholesale ────────────────────────────
   *
   * Every one of these reports `0 in db` against production, so "prune to
   * live" means empty. `prefixes: null` matches every top-level row rather
   * than requiring me to guess twenty id prefixes correctly — and guessing
   * wrong is exactly how the carousel-slide CTA cards nearly got deleted.
   *
   * 🛑 `store-extensions-seed-data.ts` holds TEN collections in one file, so
   * it is deliberately NOT listed here: a null-prefix prune of that file
   * would empty all ten including the two that are partially live
   * (`shippingConfigs` 2, `analyticsCards` 4). It needs per-array handling.
   */
  orders: { globs: ["appkit/src/seed/orders-seed-data.ts"], prefixes: null },
  bids: { globs: ["appkit/src/seed/bids-seed-data.ts"], prefixes: null },
  notifications: { globs: ["appkit/src/seed/notifications-seed-data.ts"], prefixes: null },
  offers: { globs: ["appkit/src/seed/offers-seed-data.ts"], prefixes: null },
  payouts: { globs: ["appkit/src/seed/payouts-seed-data.ts"], prefixes: null },
  supportTickets: { globs: ["appkit/src/seed/support-tickets-seed-data.ts"], prefixes: null },
  groupedListings: { globs: ["appkit/src/seed/grouped-listings-seed-data.ts"], prefixes: null },
  scammerProfiles: { globs: ["appkit/src/seed/scammers-seed-data.ts"], prefixes: null },
  catalogueItems: { globs: ["appkit/src/seed/catalogue-seed-data.ts"], prefixes: null },
  couponUsage: { globs: ["appkit/src/seed/coupon-usage-seed-data.ts"], prefixes: null },
  storeAddresses: { globs: ["appkit/src/seed/store-addresses-seed-data.ts"], prefixes: null },
  /*
   * store-extensions-seed-data.ts holds TEN arrays. Each entry below scopes to
   * ONE of them by name, so the two partially-live arrays in the same file
   * (shippingConfigs, analyticsCards) are untouched.
   */
  payoutMethods: { globs: ["appkit/src/seed/store-extensions-seed-data.ts"], prefixes: null, scopeToArray: "payoutMethodsSeedData" },
  analyticsAlerts: { globs: ["appkit/src/seed/store-extensions-seed-data.ts"], prefixes: null, scopeToArray: "analyticsAlertsSeedData" },
  storeCategories: { globs: ["appkit/src/seed/store-extensions-seed-data.ts"], prefixes: null, scopeToArray: "storeCategoriesSeedData" },
  listingTemplates: { globs: ["appkit/src/seed/store-extensions-seed-data.ts"], prefixes: null, scopeToArray: "listingTemplatesSeedData" },
  moderationQueue: { globs: ["appkit/src/seed/store-extensions-seed-data.ts"], prefixes: null, scopeToArray: "moderationQueueSeedData" },
  reports: { globs: ["appkit/src/seed/store-extensions-seed-data.ts"], prefixes: null, scopeToArray: "reportsSeedData" },
  itemRequests: { globs: ["appkit/src/seed/store-extensions-seed-data.ts"], prefixes: null, scopeToArray: "itemRequestsSeedData" },
  storeGoogleConfig: { globs: ["appkit/src/seed/store-extensions-seed-data.ts"], prefixes: null, scopeToArray: "storeGoogleConfigSeedData" },
  // Partially live — the prune KEEPS whatever is live and drops the rest.
  shippingConfigs: { globs: ["appkit/src/seed/store-extensions-seed-data.ts"], prefixes: null, scopeToArray: "shippingConfigsSeedData" },
  analyticsCards: { globs: ["appkit/src/seed/store-extensions-seed-data.ts"], prefixes: null, scopeToArray: "analyticsCardsSeedData" },
  categories: {
    globs: ["appkit/src/seed/categories-seed-data.ts", "appkit/src/seed/_helpers/*.ts"],
    prefixes: ["category-", "brand-", "bundle-", "sublisting-", "franchise-"],
  },
  /*
   * 🛑 The catalogue chunks are EXCLUDED, matching the loader: they are
   * deregistered (`seed-cli.mjs:672`) so none of their 4,657 rows can be
   * written, and including them here would reproduce exactly the 180x
   * over-report that made this mode necessary.
   */
  products: {
    globs: ["appkit/src/seed/products-*-seed-data.ts"],
    prefixes: ["product-", "auction-", "preorder-", "prizedraw-", "classified-", "digitalcode-", "live-", "art-", "sticker-", "spare-", "beyblade-"],
  },
};

/**
 * Fields never compared and never promoted.
 *
 * `createdAt`/`updatedAt` move on every write, so comparing them makes every
 * row differ and buries the real changes. `searchTxt` is derived on write.
 * `seedPurpose` is stamped BY the loader and is not seed content.
 */
const VOLATILE = new Set(["createdAt", "updatedAt", "lastModified", "searchTxt", "seedPurpose"]);

/**
 * `id` is the Firestore DOCUMENT KEY, not a field in the body.
 *
 * The loader passes it to `.doc(id)` and does not write it into the payload, so
 * every seed row has it and no live document does. Comparing it reported all 91
 * FAQs as drifted on the first run — 100% false positives that buried the real
 * signal. The ids ARE compared, as sets, which is what the only-live/only-seed
 * buckets are.
 */
const STRUCTURAL = new Set(["id"]);

/**
 * Derived counters: organic live values a promotion must never freeze into a
 * fixture. Mirrors the loader's own `DERIVED_COUNTER_FIELDS` and extends it
 * where a collection has a counter the loader does not yet protect.
 *
 * 🛑 `faqs.stats` holds `views`/`helpful` — real user behaviour. Promoting it
 * would bake today's view count into the seed and then reset it to that number
 * on every future load.
 */
const DERIVED = {
  categories: ["metrics"],
  stores: ["stats"],
  faqs: ["stats"],
  blogPosts: ["views"],
  events: ["stats"],
  coupons: ["usage"],
  /*
   * 🛑 Products carry two different kinds of non-seed field, and neither is
   * curation to promote:
   *
   *   LOADER-DERIVED — `gstRate`, `hsnCode`, `authenticity`, `franchise`,
   *   `franchiseSlug`. Stamped at seed time by `withDerivedCategoryFields` and
   *   the franchise pass, which is why live has them and the source array does
   *   not. Promoting them would hard-code a derivation into the fixture and
   *   then fight the deriver on the next load.
   *
   *   ORGANIC COUNTERS — `reviewCount`, `avgRating`, `views7d`, `views30d`.
   *   Real user behaviour. Freezing today's view count into a fixture means
   *   every future load resets live to that number.
   */
  products: [
    "gstRate",
    "hsnCode",
    "authenticity",
    "franchise",
    "franchiseSlug",
    "reviewCount",
    "avgRating",
    "views7d",
    "views30d",
  ],
};

/**
 * PII-bearing fields per collection, skipped so ciphertext never reaches a
 * source file. Kept narrow and explicit; a collection absent here is asserted
 * to hold no PII, and that assertion is printed in the summary.
 */
const PII = {
  stores: ["payoutDetails", "whatsappConfig"],
};

// ---------------------------------------------------------------------------
// Firestore
// ---------------------------------------------------------------------------

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error(`✗ .env.local not found at ${envPath}`);
    process.exit(2);
  }
  const vars = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([\s\S]*?)"?\s*$/);
    if (m) vars[m[1]] = m[2].replace(/\\n/g, "\n");
  }
  return vars;
}

function initDb() {
  const env = loadEnv();
  const projectId = env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    console.error("✗ FIREBASE_ADMIN_PROJECT_ID / _CLIENT_EMAIL / _PRIVATE_KEY missing from .env.local");
    process.exit(2);
  }
  let app;
  try {
    app = getApp();
  } catch {
    app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  console.log(`  project: ${projectId}`);
  return getFirestore(app);
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

/**
 * Normalise a value for comparison.
 *
 * Firestore hands back `Timestamp` objects and the seed holds `Date`s, so a
 * raw deep-equal reports every date field as changed. Both collapse to an ISO
 * string. Everything else is compared structurally via a stable JSON encoding
 * with object keys sorted — Firestore returns map keys alphabetically while a
 * seed literal is in author order, and without sorting every map differs.
 */
function normalise(value) {
  if (value === null || value === undefined) return null;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalise);
  if (typeof value === "object") {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k] = normalise(value[k]);
    return out;
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(normalise(value));
}

function preview(value) {
  const s = typeof value === "string" ? value : stableJson(value);
  if (s === undefined) return "undefined";
  return s.length > 120 ? `${s.slice(0, 117)}…` : s;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * The seed's id set, read from the SOURCE `.ts` files as text.
 *
 * ## 🛑 Why a regex over source beats importing the built seed
 *
 * The importable seed is `dist/seed`, and the installed `dist` is a BUILD
 * ARTEFACT that goes stale the moment anyone edits a seed file. Measured
 * 2026-10-21, mid-task: the dist held 11 coupons, 6 carousel slides and 26
 * homepage sections while the SOURCE held 1, 15 and 27 — the owner had already
 * pruned coupons to the one live row, and `dist/.build-stamp.json` named a
 * different (and dirty) head than appkit's HEAD.
 *
 * So every id-set number this script produced from `dist` described a build
 * nobody is running. Rebuilding appkit would fix it and is NOT this script's
 * call to make, so the destructive question — which rows would a load CREATE,
 * and which live rows can a wipe NOT restore — is answered from the text of
 * the files actually in git.
 *
 * 🛑 This answers IDS ONLY. Field-level value drift genuinely needs the
 * compiled objects, so `--source-ids` reports no value drift rather than
 * guessing at it. A tool that silently narrowed its own question is how the
 * staged-audit lessons in CLAUDE.md were all learned.
 */
function expandGlob(pattern) {
  const star = pattern.indexOf("*");
  if (star === -1) return existsSync(pattern) ? [pattern] : [];
  const slash = pattern.lastIndexOf("/", star);
  const dir = pattern.slice(0, slash);
  const [pre, post] = pattern.slice(slash + 1).split("*");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.startsWith(pre) && f.endsWith(post ?? ""))
    .map((f) => `${dir}/${f}`);
}

/**
 * Top-level `id` values of every array literal in a seed file, via the real
 * TypeScript AST.
 *
 * ## 🛑 A regex over `id:` COUNTS NESTED IDS, and that nearly destroyed data
 *
 * This started as `/\bid:\s*"(prefix…)"/g` and it was wrong in the most
 * dangerous possible direction. `carousel-slides-seed-data.ts` holds 8 slides,
 * each containing a CTA card whose own id also starts `slide-` —
 * `slide-festive-cashback` the slide, `slide-cashback-cta` the card inside it.
 * The regex returned 15, the live collection has 8, and the diff therefore
 * reported "7 ids in the seed that a load would write to live". Acting on that
 * would have deleted seven CTA cards out of the live homepage carousel.
 *
 * The same shape would hit lottery slots, spin prizes, event offer configs and
 * order items. My own `SOURCE` comment predicted it ("matching a bare `id:`
 * would also pick up nested ids") and the regex shipped anyway, which is the
 * recurring lesson: a documented hazard with no mechanism behind it is an
 * unguarded hazard.
 *
 * 🛑 And DEPTH ALONE DOES NOT FIX IT — that was my second attempt and it still
 * returned 15. The CTA id is at `overlay.button.id`: a plain nested object with
 * no array between it and the slide (`cards: []` is empty), so it sits at the
 * same array depth as the row that contains it.
 *
 * The real discriminator is structural and exact: a collection row's PARENT
 * NODE IS THE ARRAY LITERAL. `overlay.button` is the value of a property
 * assignment, so it is excluded; a card inside `cards: [...]` is an array
 * element but at depth 2, so the depth test excludes that. Both tests are
 * needed and neither is sufficient alone.
 */
function seedIdsFromSource(globs, prefixes) {
  const ts = loadTypescript();
  const ids = new Set();
  const files = globs.flatMap(expandGlob);
  /*
   * `prefixes: null` means "every top-level row", used for collections that
   * are live-EMPTY and are being emptied wholesale. Safe without a prefix
   * because the row test (parent is the array literal AND array depth 1)
   * already excludes every nested object — which is the thing a prefix was
   * never actually protecting against.
   */
  const matchesPrefix = (v) => prefixes === null || prefixes.some((p) => v.startsWith(p));

  for (const f of files) {
    const sf = ts.createSourceFile(f, readFileSync(f, "utf8"), ts.ScriptTarget.Latest, true);

    /*
     * Depth = how many ARRAY literals enclose this object. A collection row
     * sits at depth 1 (the seed array). A CTA card sits at depth 2 (the seed
     * array, then `cards: [...]`). Taking depth 1 only is what separates them,
     * and it is a structural fact rather than a naming convention — so it
     * holds for lottery slots and order items too.
     */
    const walk = (node, arrayDepth) => {
      const nextDepth = ts.isArrayLiteralExpression(node) ? arrayDepth + 1 : arrayDepth;
      const isRow =
        ts.isObjectLiteralExpression(node) &&
        arrayDepth === 1 &&
        node.parent &&
        ts.isArrayLiteralExpression(node.parent);
      if (isRow) {
        for (const prop of node.properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            prop.name &&
            ts.isIdentifier(prop.name) &&
            prop.name.text === "id" &&
            (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer))
          ) {
            const v = prop.initializer.text;
            if (matchesPrefix(v)) ids.add(v);
          }
        }
      }
      ts.forEachChild(node, (c) => walk(c, nextDepth));
    };
    ts.forEachChild(sf, (c) => walk(c, 0));
  }
  return { ids, files };
}

/**
 * Delete every top-level array row whose id is NOT live.
 *
 * ## 🛑 Why DELETION is safe to automate when promotion is not
 *
 * The reason `--write` refuses to promote live values is that rewriting a seed
 * row would inline helper CALLS as literals — `seedExtMedia()`,
 * `windowOffset()`, `editorialImage()`, `testDataExpiresAt()` — freezing a
 * time-relative fixture into a fixed date and turning a proxied media URL into
 * a raw one.
 *
 * Deleting a row has none of that: it removes a span of source text and leaves
 * every surviving row, every import and every `.map(withTokens)` pipeline
 * byte-identical. So the dangerous half stays manual and the safe half is
 * mechanical — which is also what keeps the diff reviewable, because the only
 * thing that can appear in it is whole rows disappearing.
 *
 * Cuts are computed from AST node spans and applied back-to-front so earlier
 * offsets stay valid, and it reuses the same row test as `seedIdsFromSource` —
 * parent-is-an-array-literal AND depth 1 — so a nested `overlay.button` or a
 * lottery slot can never be mistaken for a row.
 */
function pruneFileToLive(file, prefixes, liveIds, scopeToArray = null) {
  const ts = loadTypescript();
  const src = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);

  /*
   * 🛑 `scopeToArray` exists because ONE FILE CAN HOLD MANY COLLECTIONS.
   *
   * `store-extensions-seed-data.ts` declares ten arrays — payoutMethods,
   * shippingConfigs, analyticsCards, analyticsAlerts, storeCategories,
   * listingTemplates, moderationQueue, reports, itemRequests,
   * storeGoogleConfig. Eight are live-empty and two are partially live
   * (shippingConfigs 2, analyticsCards 4), so a file-wide prune against ONE
   * collection's live ids would empty the other nine — including the two that
   * have live rows.
   *
   * So when a spec names its array, only that declaration is walked. Without
   * this the tool is silently wrong on exactly the files where being wrong
   * costs the most.
   */
  let scopeRoot = null;
  if (scopeToArray) {
    ts.forEachChild(sf, (n) => {
      if (!ts.isVariableStatement(n)) return;
      for (const d of n.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.name.text === scopeToArray) scopeRoot = d;
      }
    });
    if (!scopeRoot) return { removed: [], text: src, missingScope: scopeToArray };
  }
  /*
   * `prefixes: null` means "every top-level row", used for collections that
   * are live-EMPTY and are being emptied wholesale. Safe without a prefix
   * because the row test (parent is the array literal AND array depth 1)
   * already excludes every nested object — which is the thing a prefix was
   * never actually protecting against.
   */
  const matchesPrefix = (v) => prefixes === null || prefixes.some((p) => v.startsWith(p));
  const cuts = [];

  const walk = (node, arrayDepth) => {
    const nextDepth = ts.isArrayLiteralExpression(node) ? arrayDepth + 1 : arrayDepth;
    const isRow =
      ts.isObjectLiteralExpression(node) &&
      arrayDepth === 1 &&
      node.parent &&
      ts.isArrayLiteralExpression(node.parent);
    if (isRow) {
      let id = null;
      for (const prop of node.properties) {
        if (
          ts.isPropertyAssignment(prop) &&
          prop.name &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === "id" &&
          (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer))
        ) {
          id = prop.initializer.text;
        }
      }
      if (id && matchesPrefix(id) && !liveIds.has(id)) {
        /*
         * Widen the cut to swallow the row's own trailing comma, any `as X`
         * assertion wrapping it, and the whitespace up to the next row — a
         * bare node span would leave `,\n\n  ,` behind and break the parse.
         */
        const arr = node.parent;
        const idx = arr.elements.indexOf(node.expression ? node.expression : node);
        const elements = arr.elements;
        let target = node;
        // `{...} as EventDocument` — the element is the assertion, not the object.
        for (const el of elements) {
          if (ts.isAsExpression(el) && el.expression === node) target = el;
        }
        const pos = target.getFullStart();
        const end = target.getEnd();
        let after = end;
        while (after < src.length && /[\s,]/.test(src[after])) after += 1;
        cuts.push({ id, pos, end: after, idx });
      }
    }
    ts.forEachChild(node, (c) => walk(c, nextDepth));
  };
  if (scopeRoot) ts.forEachChild(scopeRoot, (c) => walk(c, 0));
  else ts.forEachChild(sf, (c) => walk(c, 0));

  if (cuts.length === 0) return { removed: [], text: src };

  /*
   * 🛑 MERGE OVERLAPPING SPANS BEFORE APPLYING, or consecutive removals
   * corrupt the file.
   *
   * `getFullStart()` of row N+1 is where row N's trailing trivia ended, so the
   * spans are already adjacent — and the extension that swallows a trailing
   * comma therefore pushes row N's end PAST row N+1's start. Applying both
   * back-to-front then deletes the overlap twice and takes a brace with it.
   *
   * Measured: pruning `stores` to its one live row produced three adjacent
   * cuts (5806-8063, 8064-9627, 9628-12136) and 18 parse errors. The
   * parse-check caught it and refused to write, which is the only reason this
   * is a comment rather than a corrupted seed file.
   */
  const sorted = [...cuts].sort((a, b) => a.pos - b.pos);
  const merged = [sorted[0]];
  for (const c of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (c.pos <= last.end) last.end = Math.max(last.end, c.end);
    else merged.push({ ...c });
  }

  let out = src;
  for (const c of [...merged].sort((a, b) => b.pos - a.pos)) {
    out = out.slice(0, c.pos) + out.slice(c.end);
  }
  return { removed: cuts.map((c) => c.id), text: out };
}

function loadTypescript() {
  const req = createRequire(import.meta.url);
  try {
    return req("typescript");
  } catch {
    console.error("✗ `typescript` is required for --source-ids (it parses the seed files).");
    process.exit(2);
  }
}

function parseArgs(argv) {
  const out = { collections: [], write: false, verbose: false, perExport: false, sourceIds: false, prune: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--write") out.write = true;
    else if (a === "--verbose") out.verbose = true;
    else if (a === "--per-export") out.perExport = true;
    else if (a === "--source-ids") out.sourceIds = true;
    else if (a === "--prune") out.prune = true;
    else if (a === "--collections") out.collections = (argv[++i] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.collections.length === 0) {
    console.log("Usage: node scripts/export-live-to-seed.mjs --collections <a,b> [--verbose] [--write]");
    console.log(`\nPromotable: ${Object.keys(PROMOTABLE).join(", ")}`);
    console.log(`Refused (secrets/PII): ${[...REFUSED].join(", ")}`);
    console.log(`Excluded (generator output): ${[...GENERATED].join(", ")}`);
    process.exit(1);
  }

  for (const name of args.collections) {
    if (REFUSED.has(name)) {
      console.error(`\n🛑 ${name} is REFUSED — PRESERVE tier (secrets / PII). There is no flag for this.`);
      process.exit(2);
    }
    if (GENERATED.has(name)) {
      console.error(`\n🛑 ${name} is generator output — promote via its gen-*.mjs, or use the adminEdited mechanism.`);
      process.exit(2);
    }
    if (!PROMOTABLE[name]) {
      console.error(`\n✗ ${name} is not in PROMOTABLE. Add it explicitly after checking its PII and derived-counter fields.`);
      process.exit(2);
    }
  }

  console.log("\n── live → seed, DIFF ONLY ──────────────────────────────────────");
  if (args.write) console.log("  🛑 --write passed: the seed file WILL be rewritten after the diff.");
  else console.log("  dry run — nothing will be written. Pass --write to promote.");

  const db = initDb();

  /*
   * 🛑 Source-ids mode runs instead of the dist diff, not alongside it.
   *
   * Reporting both would print two id sets that disagree — the dist's and the
   * source's — and the reader would have no way to tell which is the one that
   * matters. The source is the one in git, so it is the one that answers
   * "what would a load create" and "what can a wipe not restore".
   */
  if (args.prune) {
    const ts = loadTypescript();
    let totalRemoved = 0;
    for (const name of args.collections) {
      const src = SOURCE[name];
      const spec = PROMOTABLE[name];
      if (!src || !spec) {
        console.error(`\n✗ ${name} has no SOURCE/PROMOTABLE entry.`);
        process.exit(2);
      }
      const liveIds = new Set((await db.collection(spec.collection).select().get()).docs.map((d) => d.id));
      console.log(`\n═══ ${name} — prune to live ═══`);
      console.log(`  live: ${liveIds.size} documents`);

      for (const file of src.globs.flatMap(expandGlob)) {
        const { removed, text, missingScope } = pruneFileToLive(file, src.prefixes, liveIds, src.scopeToArray ?? null);
        if (missingScope) {
          console.error(`  x ${file}: array \`${missingScope}\` not found — REFUSED (a renamed export must not silently prune nothing)`);
          process.exitCode = 1;
          continue;
        }
        if (removed.length === 0) {
          console.log(`  ${file}: nothing to remove`);
          continue;
        }
        /*
         * 🛑 Parse the RESULT before writing it. A cut that swallows one
         * character too many leaves a file that still looks plausible in a
         * diff and fails at build time — and this script is deleting hundreds
         * of rows across files it has never seen.
         */
        const check = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
        const diags = check.parseDiagnostics ?? [];
        if (diags.length > 0) {
          console.error(`  ✗ ${file}: pruning would leave ${diags.length} parse error(s) — REFUSED, file untouched`);
          console.error(`      ${diags.slice(0, 2).map((d) => d.messageText).join(" | ")}`);
          process.exitCode = 1;
          continue;
        }
        console.log(`  ${file}: ${removed.length} row(s) ${args.write ? "REMOVED" : "would be removed"}`);
        for (const id of removed.slice(0, args.verbose ? removed.length : 8)) console.log(`      − ${id}`);
        if (!args.verbose && removed.length > 8) console.log(`      … ${removed.length - 8} more (--verbose)`);
        if (args.write) writeFileSync(file, text, "utf8");
        totalRemoved += removed.length;
      }
    }
    console.log("\n────────────────────────────────────────────────────────────────");
    console.log(`${args.write ? "Removed" : "Would remove"} ${totalRemoved} row(s) across ${args.collections.length} collection(s).`);
    if (!args.write) console.log("Dry run — pass --write to apply.");
    else console.log("🛑 Orphaned imports and stale file headers are NOT fixed automatically — check each file.");
    return;
  }

  if (args.sourceIds) {
    for (const name of args.collections) {
      const src = SOURCE[name];
      if (!src) {
        console.error(`\n✗ ${name} has no SOURCE entry — add its globs and id prefixes.`);
        process.exit(2);
      }
      const { ids: seedIds, files } = seedIdsFromSource(src.globs, src.prefixes);
      const spec = PROMOTABLE[name];
      const liveIds = new Set((await db.collection(spec.collection).select().get()).docs.map((d) => d.id));

      const onlyLive = [...liveIds].filter((i) => !seedIds.has(i));
      const onlySeed = [...seedIds].filter((i) => !liveIds.has(i));

      console.log(`\n═══ ${name} (ids from SOURCE, ${files.length} file${files.length === 1 ? "" : "s"}) ═══`);
      console.log(`  seed source: ${seedIds.size} ids`);
      console.log(`  live:        ${liveIds.size} documents`);
      console.log(`\n  🛑 only in LIVE — a tester wipe DESTROYS these and nothing restores them: ${onlyLive.length}`);
      for (const id of onlyLive.slice(0, args.verbose ? onlyLive.length : 25)) console.log(`      ${id}`);
      if (!args.verbose && onlyLive.length > 25) console.log(`      … ${onlyLive.length - 25} more (--verbose)`);
      console.log(`\n  🛑 only in SEED — a load WRITES these to live: ${onlySeed.length}`);
      for (const id of onlySeed.slice(0, args.verbose ? onlySeed.length : 25)) console.log(`      ${id}`);
      if (!args.verbose && onlySeed.length > 25) console.log(`      … ${onlySeed.length - 25} more (--verbose)`);
      console.log("\n  (ids only — value drift needs the compiled seed, which is stale; not guessed at)");
    }
    console.log("\n────────────────────────────────────────────────────────────────");
    console.log("Source-of-truth = the .ts files in git. The installed dist/seed is a");
    console.log("build artefact and was measured 10 coupons / 9 slides / 1 section out of");
    console.log("date mid-task, so it is not used here.");
    return;
  }

  const seedModule = await importSeedModule();

  for (const name of args.collections) {
    const spec = PROMOTABLE[name];
    const exportNames = Array.isArray(spec.seedExport) ? spec.seedExport : [spec.seedExport];
    const seedArr = [];
    for (const ex of exportNames) {
      const part = seedModule[ex];
      if (!Array.isArray(part)) {
        console.error(`\n✗ ${name}: seed export ${ex} is not an array (got ${typeof part}).`);
        console.error("  A missing export here would silently shrink the comparison and report");
        console.error("  live rows as orphaned, so this is fatal rather than skipped.");
        process.exit(2);
      }
      seedArr.push(...part);
    }

    const skipFields = new Set([...VOLATILE, ...(DERIVED[name] ?? []), ...(PII[name] ?? [])]);

    /*
     * Per-export overlap, for a collection whose seed is several arrays.
     *
     * 🛑 This is what decides the EDIT per file, and it is not derivable from
     * the collection totals. `products` is 4,747 seed rows across twelve
     * arrays, and 4,657 of them are one GENERATED array — so "prune products
     * to match live" is two completely different operations depending on which
     * array a row sits in: hand-authored rows get pruned in place, and a
     * generated array with zero live rows should stop being loaded rather than
     * having 19 machine-written chunk files hand-edited.
     */
    if (args.perExport && exportNames.length > 1) {
      const liveIdSet = new Set((await db.collection(spec.collection).select().get()).docs.map((d) => d.id));
      console.log("\n  per seed export — rows / live / verdict");
      for (const ex of exportNames) {
        const arr = seedModule[ex] ?? [];
        const keep = arr.filter((r) => r?.id && liveIdSet.has(r.id)).length;
        const verdict = keep === 0 ? "DELETE WHOLE ARRAY (no live row)" : `prune to ${keep}`;
        console.log(`      ${ex.padEnd(32)} ${String(arr.length).padStart(5)} ${String(keep).padStart(4)}   ${verdict}`);
      }
    }

    console.log(`\n═══ ${name} ═══`);
    console.log(`  seed: ${seedArr.length} rows (${spec.seedExport})`);

    const snap = await db.collection(spec.collection).get();
    console.log(`  live: ${snap.size} documents`);
    console.log(`  not compared: ${[...skipFields].join(", ")}`);
    if (!PII[name]) console.log(`  (asserting ${name} holds no PII fields — verify if that changes)`);

    const liveById = new Map();
    for (const d of snap.docs) liveById.set(d.id, d.data());
    const seedById = new Map();
    for (const row of seedArr) if (row?.id) seedById.set(row.id, row);

    const onlyLive = [...liveById.keys()].filter((id) => !seedById.has(id));
    const onlySeed = [...seedById.keys()].filter((id) => !liveById.has(id));

    /*
     * Three buckets, because they map onto the two destructive triggers and
     * each needs a different response:
     *
     *   overwritten — both sides have the field and the values differ. A `load`
     *                 merge-writes the SEED value over live. **The hazard.**
     *   addedBySeed — only the seed has it. A load writes it onto live.
     *   liveOnly    — only live has it. A merge-write LEAVES IT ALONE (an absent
     *                 key is untouched), so a load is safe — but a tester run
     *                 deletes the document wholesale and it is gone.
     *
     * Lumping these together is what made the first run unreadable, and it
     * would also have been wrong: it implied a load was about to destroy
     * `slug`, which it cannot.
     */
    const overwritten = [];
    const addedBySeed = new Map();
    const liveOnly = new Map();
    for (const [id, seedRow] of seedById) {
      const liveRow = liveById.get(id);
      if (!liveRow) continue;
      const fields = [];
      for (const key of new Set([...Object.keys(seedRow), ...Object.keys(liveRow)])) {
        if (skipFields.has(key) || STRUCTURAL.has(key)) continue;
        const inSeed = seedRow[key] !== undefined;
        const inLive = liveRow[key] !== undefined;
        if (inSeed && !inLive) {
          addedBySeed.set(key, (addedBySeed.get(key) ?? 0) + 1);
          continue;
        }
        if (!inSeed && inLive) {
          liveOnly.set(key, (liveOnly.get(key) ?? 0) + 1);
          continue;
        }
        if (stableJson(seedRow[key]) !== stableJson(liveRow[key])) {
          fields.push({ key, seed: seedRow[key], live: liveRow[key] });
        }
      }
      if (fields.length > 0) overwritten.push({ id, fields });
    }
    const changed = overwritten;

    console.log("");
    console.log(`  🛑 only in LIVE (the seed cannot reproduce these): ${onlyLive.length}`);
    if (onlyLive.length > 0) console.log(`      ${onlyLive.slice(0, 20).join("\n      ")}${onlyLive.length > 20 ? `\n      … ${onlyLive.length - 20} more` : ""}`);
    console.log(`  only in SEED (a load would re-create these): ${onlySeed.length}`);
    if (onlySeed.length > 0) console.log(`      ${onlySeed.slice(0, 20).join("\n      ")}${onlySeed.length > 20 ? `\n      … ${onlySeed.length - 20} more` : ""}`);
    if (liveOnly.size > 0) {
      console.log(`\n  fields only LIVE — a load leaves these alone, a TESTER RUN destroys them:`);
      for (const [k, n] of [...liveOnly].sort((a, b) => b[1] - a[1])) console.log(`      ${k} (${n} rows)`);
    }
    if (addedBySeed.size > 0) {
      console.log(`\n  fields only in the SEED — a load would ADD these to live:`);
      for (const [k, n] of [...addedBySeed].sort((a, b) => b[1] - a[1])) console.log(`      ${k} (${n} rows)`);
    }
    console.log(`\n  🛑 VALUE drift, both sides present (a load OVERWRITES live with the seed): ${changed.length} rows`);

    for (const row of changed.slice(0, args.verbose ? changed.length : 15)) {
      console.log(`\n    ${row.id}`);
      for (const f of row.fields) {
        console.log(`      ${f.key}`);
        console.log(`        seed: ${preview(f.seed)}`);
        console.log(`        live: ${preview(f.live)}`);
      }
    }
    if (!args.verbose && changed.length > 15) {
      console.log(`\n    … ${changed.length - 15} more rows. Re-run with --verbose for all of them.`);
    }

    if (args.write) {
      console.log(`\n  🛑 --write is NOT IMPLEMENTED YET for ${name}.`);
      console.log("     Rewriting the TS file blindly would inline helper CALLS as literals —");
      console.log("     seedExtMedia(), windowOffset(), testDataExpiresAt() — freezing a");
      console.log("     time-relative fixture into a fixed date (Root Cause #25 in reverse)");
      console.log("     and turning a proxied media URL into a raw one. The write step has to");
      console.log("     be surgical per field, which needs this diff first to be worth building.");
    }
  }

  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("Read the drift above BEFORE any reseed or tester run.");
  console.log("A tester run deletes SEED_OWNED collections wholesale; a load merge-");
  console.log("overwrites every key the seed declares. Neither warns.");
}

main().catch((err) => {
  console.error(`\n✗ ${err?.stack ?? err}`);
  process.exit(1);
});

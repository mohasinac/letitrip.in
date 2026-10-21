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

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
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

function seedIdsFromSource(globs, prefixes) {
  const ids = new Set();
  const files = globs.flatMap(expandGlob);
  const alt = prefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const re = new RegExp(`\\bid:\\s*["\`]((?:${alt})[^"\`]*)["\`]`, "g");
  for (const f of files) {
    for (const m of readFileSync(f, "utf8").matchAll(re)) ids.add(m[1]);
  }
  return { ids, files };
}

function parseArgs(argv) {
  const out = { collections: [], write: false, verbose: false, perExport: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--write") out.write = true;
    else if (a === "--verbose") out.verbose = true;
    else if (a === "--per-export") out.perExport = true;
    else if (a === "--source-ids") out.sourceIds = true;
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

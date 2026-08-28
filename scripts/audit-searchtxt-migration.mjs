#!/usr/bin/env node
/**
 * audit-searchtxt-migration — a `searchTxt` migration is all-or-nothing.
 *
 * ## Why this exists
 *
 * A collection needs SIX things to be searchable, and any one missing produces
 * silence rather than an error:
 *
 *   1. the field on the document interface
 *   2. the field in `*_INDEXED_FIELDS`
 *   3. the field in `SIEVE_FIELDS` with `canFilter` — Sieve runs with
 *      `throwExceptions: false`, so a filter on an unlisted field is DROPPED
 *   4. tokens on every seed record — `array-contains` against a missing field
 *      matches zero docs, which is exactly how FAQ search returned nothing for
 *      63 documents
 *   5. a composite index — otherwise FAILED_PRECONDITION, swallowed by the
 *      `.catch(() => null)` most callers wrap the query in
 *      6. no PII feeding it — `searchTxt` stores readable fragments, so
 *      indexing an encrypted field would undo the encryption (decision D1)
 *
 * MIGRATED lists what must be fully wired; PENDING is reported but does not
 * fail, so the rollout can proceed collection by collection without leaving the
 * build red. Move a name from PENDING to MIGRATED in the same commit that
 * migrates it — that is the whole point.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();
const APPKIT = join(REPO_ROOT, "appkit", "src");

/** Fully wired — every rule below is enforced. */
const MIGRATED = [
  {
    name: "scammerProfiles",
    schema: "features/scams/schemas/firestore.ts",
    repo: "features/scams/repository/scammer.repository.ts",
    seeds: ["seed/scammers-seed-data.ts"],
    indexCollection: "scammerProfiles",
  },
  {
    name: "faqs",
    schema: "features/faq/schemas/firestore.ts",
    repo: "features/faq/repository/faqs.repository.ts",
    seeds: ["seed/faq-seed-data.ts"],
    indexCollection: "faqs",
  },
  {
    name: "products",
    schema: "features/products/schemas/firestore.ts",
    repo: "features/products/repository/products.repository.ts",
    seeds: [
      "seed/products-standard-seed-data.ts",
      "seed/products-auctions-seed-data.ts",
      "seed/products-preorders-seed-data.ts",
      "seed/products-prize-draws-seed-data.ts",
      "seed/products-classifieds-seed-data.ts",
      "seed/products-digital-codes-seed-data.ts",
      "seed/products-live-items-seed-data.ts",
      "seed/products-art-seed-data.ts",
      "seed/products-stickers-seed-data.ts",
    ],
    indexCollection: "products",
  },
  {
    name: "stores",
    schema: "features/stores/schemas/firestore.ts",
    repo: "features/stores/repository/store.repository.ts",
    seeds: ["seed/stores-seed-data.ts"],
    indexCollection: "stores",
    indexedFields: false, // this schema has no *_INDEXED_FIELDS list of its own
  },
  {
    name: "events",
    schema: "features/events/schemas/firestore.ts",
    repo: "features/events/repository/events.repository.ts",
    seeds: ["seed/events-seed-data.ts"],
    indexCollection: "events",
  },
  {
    name: "blogPosts",
    schema: "features/blog/schemas/firestore.ts",
    repo: "features/blog/repository/blog.repository.ts",
    seeds: ["seed/blog-posts-seed-data.ts"],
    indexCollection: "blogPosts",
  },
  {
    name: "reviews",
    schema: "features/reviews/schemas/firestore.ts",
    repo: "features/reviews/repository/reviews.repository.ts",
    seeds: ["seed/reviews-seed-data.ts"],
    indexCollection: "reviews",
  },
  {
    name: "orders",
    schema: "features/orders/schemas/firestore.ts",
    repo: "features/orders/repository/orders.repository.ts",
    seeds: ["seed/orders-seed-data.ts"],
    indexCollection: "orders",
  },
  {
    name: "coupons",
    schema: "features/promotions/schemas/firestore.ts",
    repo: "features/promotions/repository/coupons.repository.ts",
    seeds: ["seed/coupons-seed-data.ts"],
    indexCollection: "coupons",
  },
  {
    name: "offers",
    schema: "features/seller/schemas/firestore.ts",
    repo: "features/seller/repository/offer.repository.ts",
    seeds: ["seed/offers-seed-data.ts"],
    indexCollection: "offers",
  },
];

/** Awaiting migration — reported, not enforced. */
/**
 * Re-triaged 2026-08-28 against the actual `*_COLLECTION` constants. Three
 * names were wrong and two were never collections at all, so the old count of
 * 16 overstated the backlog by five and pointed four of the rest at nothing.
 *
 *   scammers  -> scammerProfiles   (SCAMMER_COLLECTION)
 *   catalogue -> catalogueItems    (CATALOGUE_COLLECTION) — this misnaming also
 *                                  made the PII backfill a silent no-op for
 *                                  months; see backfill-pii.mjs
 *   media     -> mediaAssets       (the repository's super() argument)
 *
 * `bundles` and `sublistingCategories` are NOT collections. Both are rows in
 * `categories` discriminated by `categoryType` (SB-UNI-D / the sublisting
 * work), so migrating `categories` covers them and a separate entry could only
 * ever point at an empty collection — the exact failure the `catalogue` typo
 * produced.
 */
const NOT_COLLECTIONS = {
  bundles: 'categories rows with categoryType:"bundle"',
  sublistingCategories: 'categories rows with categoryType:"sublisting"',
};

const PENDING = [
  "categories",
  "supportTickets",
  "bids", "payouts", "shipments", "groupedListings", "notifications",
  "users", "adminAuditLog", "jobs", "mediaAssets", "itemRequests",
  "catalogueItems",
];

// Enforced, not just documented. A name here is a collection that does not
// exist, so a migration targeting it would query nothing and report success —
// which is precisely what the `catalogue`/`catalogueItems` typo did to the PII
// backfill for months. Cheap to check, and it makes the note above load-bearing
// rather than a comment someone can silently contradict.
for (const [name, why] of Object.entries(NOT_COLLECTIONS)) {
  if (PENDING.includes(name) || MIGRATED.includes(name)) {
    console.error(
      `audit-searchtxt-migration: "${name}" is not a Firestore collection — ${why}. ` +
      `A migration targeting it would query nothing and pass.`,
    );
    process.exit(1);
  }
}

/** Field names that must never feed searchTxt (decision D1). */
const PII_SHAPED = /\b(email|phone|upiVpa|accountNumber|ifsc|password|token|ip)\b/i;

const read = (rel) => {
  const p = join(APPKIT, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
};

const violations = [];
const v = (rule, where, why) => violations.push({ rule, where, why });

// Indexes live in the appkit base file (the root copy is generated from it).
const indexPath = join(REPO_ROOT, "appkit", "firebase", "base", "firestore.indexes.json");
let indexes = [];
try {
  indexes = JSON.parse(readFileSync(indexPath, "utf8")).indexes ?? [];
} catch {
  v("INDEX_FILE_UNREADABLE", indexPath, "cannot verify composite indexes");
}

for (const c of MIGRATED) {
  const schema = read(c.schema);
  const repo = read(c.repo);

  if (!schema) { v("SCHEMA_MISSING", c.schema, `${c.name}: schema not found`); continue; }
  if (!repo) { v("REPO_MISSING", c.repo, `${c.name}: repository not found`); continue; }

  // 1 — on the interface
  if (!/searchTxt\??:\s*string\[\]/.test(schema)) {
    v("FIELD_NOT_DECLARED", c.schema, `${c.name}: no \`searchTxt?: string[]\` on the document interface`);
  }

  // 2 — in the indexed-field list (skipped where the schema has no such list)
  if (c.indexedFields !== false && !/["']searchTxt["']/.test(schema)) {
    v("NOT_IN_INDEXED_FIELDS", c.schema, `${c.name}: "searchTxt" missing from *_INDEXED_FIELDS`);
  }

  // 3 — filterable in SIEVE_FIELDS
  if (!/searchTxt:\s*\{[^}]*canFilter:\s*true/.test(repo)) {
    v("NOT_FILTERABLE", c.repo, `${c.name}: searchTxt missing from SIEVE_FIELDS with canFilter — Sieve drops the clause silently`);
  }

  // 4 — every seed file derives tokens
  for (const seedRel of c.seeds) {
    const seed = read(seedRel);
    if (!seed) { v("SEED_MISSING", seedRel, `${c.name}: seed file not found`); continue; }
    // Either the literal field or a derivation call — `withStoreSearchTxt` is
    // capital-S and would not match a case-sensitive /searchTxt/.
    const setsTokens = /searchTxt/.test(seed) || /SearchTxt\(|\.map\(\s*with\w*SearchTxt/.test(seed);
    if (!setsTokens) {
      v("SEED_NO_TOKENS", seedRel, `${c.name}: seed file never sets searchTxt — array-contains will match zero docs`);
    }
    // The wrapper form is what makes omission impossible; an inline literal per
    // record is how five product seed files shipped their last fixture without
    // tokens. Require a mapped/derived form, not a bare per-record literal.
    const derived = /\.map\(\s*with\w*SearchTxt|withProductSearchTxt|buildFaqSearchTxt|buildSearchTxt\(/.test(seed);
    if (!derived) {
      v("SEED_NOT_DERIVED", seedRel, `${c.name}: tokens must be derived via a wrapper/map, not written per record`);
    }
  }

  // 5 — a composite index mentioning searchTxt
  const hasIndex = indexes.some(
    (idx) => idx.collectionGroup === c.indexCollection &&
      (idx.fields ?? []).some((f) => f.fieldPath === "searchTxt"),
  );
  if (!hasIndex) {
    v("NO_COMPOSITE_INDEX", c.indexCollection, `${c.name}: no composite index on searchTxt — the query throws FAILED_PRECONDITION, which callers swallow`);
  }

  // 6 — no PII feeding it
  const builderMatch = repo.match(/buildSearchTxt\(\[([\s\S]{0,600}?)\]/);
  if (builderMatch && PII_SHAPED.test(builderMatch[1])) {
    v("PII_IN_SEARCHTXT", c.repo, `${c.name}: a PII-shaped field feeds searchTxt — encryption and partial-match search are mutually exclusive (D1)`);
  }

  // ---------------------------------------------------------------------
  // Rules 7 and 8 are why this audit certified FOUR half-migrations.
  //
  // Rules 1-6 check the interface, the indexed-field list, the Sieve config,
  // the seed tokens, the composite index and PII. `stores`, `events`,
  // `blogPosts` and `reviews` satisfied ALL SIX while their repositories
  // contained exactly one line about searchTxt — the SIEVE_FIELDS entry. Seed
  // rows had tokens; anything created through the app had none, and nothing
  // ever queried the field. Being searchable takes SEVEN things, and the two
  // nobody wrote down are the two that make it work.
  // ---------------------------------------------------------------------

  // 7 — a WRITE path derives the field
  const hasWritePath =
    /buildSearchTxtFor\s*\(/.test(repo) ||        // the BaseRepository hook
    /searchTxt:\s*build\w*SearchTxt\(/.test(repo); // or an inline derivation
  if (!hasWritePath) {
    v("NO_WRITE_PATH", c.repo,
      `${c.name}: nothing derives searchTxt on write — only SEEDED rows are searchable, and anything a user creates is invisible to search forever`);
  }

  // 8 — a READ path queries the field
  const hasReadPath = /array-contains["']?\s*,|["']array-contains["']/.test(repo)
    && /SEARCH_TXT|["']searchTxt["']/.test(repo);
  if (!hasReadPath) {
    v("NO_READ_PATH", c.repo,
      `${c.name}: nothing queries searchTxt with array-contains — the field is written and then never read, so search returns whatever the caller's other filters happen to match`);
  }
}

// The old field must be gone everywhere — a leftover means a half-done rename.
const STALE_ROOTS = [join(APPKIT), join(REPO_ROOT, "src")];
function* walk(root) {
  const { readdirSync } = require("node:fs");
  let e; try { e = readdirSync(root, { withFileTypes: true }); } catch { return; }
  for (const x of e) {
    if (["node_modules", "dist", ".next", "out", "__tests__"].includes(x.name)) continue;
    const f = join(root, x.name);
    if (x.isDirectory()) yield* walk(f);
    else if (/\.(ts|tsx)$/.test(x.name)) yield f;
  }
}
const { createRequire } = await import("node:module");
const require = createRequire(import.meta.url);
for (const root of STALE_ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8");
    // Doc comments referencing the historical name are fine; code is not.
    const codeHit = src.split(/\r?\n/).some(
      (l) => /searchTokens/.test(l) && !/^\s*(\/\*|\*|\/\/)/.test(l.trim()),
    );
    if (codeHit) {
      v("STALE_SEARCHTOKENS", file.replace(REPO_ROOT + "\\", "").replace(REPO_ROOT + "/", ""),
        "`searchTokens` still referenced in code — the rename is half-done");
    }
  }
}

if (violations.length > 0) {
  console.error(`audit-searchtxt-migration: ${violations.length} violation(s).`);
  for (const x of violations) {
    console.error(`  [${x.rule}] ${x.where}`);
    console.error(`      → ${x.why}`);
  }
  process.exit(1);
}

console.log(
  `audit-searchtxt-migration: clean ✓ (${MIGRATED.length} migrated, ${PENDING.length} pending: ${PENDING.slice(0, 6).join(", ")}…)`,
);

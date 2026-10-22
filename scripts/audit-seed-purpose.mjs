#!/usr/bin/env node
/**
 * STRICT-ZERO: the seed-provenance declaration must stay complete and honest.
 *
 * `seedPurpose` is the ONE declaration of whether a seeded row is real content
 * or clearable test data, and `appkit-seed purge` is a QUERY over it. That makes
 * the declaration load-bearing in a way a normal constant is not: a collection
 * missing from the table is silently `test` (clearable), and a row wrongly
 * marked `permanent` is silently un-clearable. Neither errors.
 *
 * ## The four rules, and the real defect behind each
 *
 * R1 · COLLECTION_PARITY — `SEED_COLLECTION_PURPOSE` ∪ `SEED_PURPOSE_DERIVED_FROM`
 *      must cover exactly `COLLECTION_MAP`'s keys in `appkit/scripts/seed-cli.mjs`.
 *
 *      Both directions matter. A MISSING key falls through to `test`, so a
 *      collection added later is purgeable by accident rather than by decision
 *      — the opposite of the fail-closed default the tester's `assertDeletable`
 *      uses. A DEAD key is the `offers` defect measured 2026-10-12:
 *      `TEST_DATA_COLLECTIONS` listed `offers` while `OfferDocument` does not
 *      declare `isTestData` at all, so that entry could only ever match zero
 *      rows and looked like coverage.
 *
 * R2 · NO_HAND_WRITTEN_ISTESTDATA — nothing in `seed-purpose.ts` may write
 *      `isTestData`.
 *
 *      🛑 This is the rule that protects the whole public catalogue. The first
 *      draft of `seedPurposeFields` derived `isTestData: true` for every `test`
 *      row — and since `test` is the DEFAULT, that would have hidden 70
 *      products, 416 categories and every store from every public page, because
 *      `hidePublicTestData` filters on exactly that field. The load would have
 *      reported `created 2513, errors 0`.
 *
 *      Purgeability and public visibility are orthogonal: `seedPurpose` answers
 *      "may a purge delete this", `isTestData` answers "may the public see
 *      this". A demo product is `test` AND visible; that is what makes the demo
 *      a demo.
 *
 * R3 · PERMANENT_MAY_NOT_REFERENCE_TEST — a row resolving `permanent` may not
 *      reference a seeded id that resolves `test`.
 *
 *      Measured: 14 of the 23 `store-extensions` rows reference
 *      `store-beyblade-arena` (test) and 9 reference `store-letitrip-official`
 *      (permanent). Marking `shippingConfigs`/`analyticsCards` permanent at the
 *      collection level would strand 14 rows pointing at a store the purge
 *      deletes — dangling config that survives every purge and reads as real.
 *      The reverse direction is fine and common: a test product under a
 *      permanent category is exactly right.
 *
 * R4 · ROW_OVERRIDES_RESOLVE — every id in `SEED_ROW_PURPOSE` must exist in the
 *      seed data.
 *
 *      An override for an id nobody seeds is the dead-chip shape (Root Cause
 *      #33): it reads as protection and protects nothing. `user-admin-letitrip`
 *      and `store-letitrip-official` are the two that matter — the admin
 *      credentials and the platform's own store — so a typo in either is
 *      exactly the row that must not be silently unprotected.
 *
 * No suppression marker. A collection is classified or it is not.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = process.cwd();
const PURPOSE_FILE = "appkit/src/seed/seed-purpose.ts";
const CLI_FILE = "appkit/scripts/seed-cli.mjs";
const SEED_DIR = "appkit/src/seed";

const violations = [];
let checked = 0;

const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const fail = (rule, detail, fix) => violations.push({ rule, detail, fix });

if (!existsSync(join(ROOT, PURPOSE_FILE))) {
  console.error(`[audit-seed-purpose] ${PURPOSE_FILE} not found — has it moved?`);
  process.exit(1);
}

/*
 * 🛑 Comment-stripped first. F1 #26/#33: most audits in this repo grep raw
 * source and match the prose EXPLAINING why a thing is wrong — `audit-registry-
 * constants` flagged a `where("status", …)` inside a comment that existed to
 * warn against it, and I have done the same in three verification scripts. This
 * file's own docstring names `isTestData` a dozen times, so R2 would flag
 * itself without this.
 */
const purposeSrc = stripComments(read(PURPOSE_FILE));
const cliSrc = stripComments(read(CLI_FILE));

// ── parse the declarations ─────────────────────────────────────────────────
/**
 * Slice the VALUE object of a `const X: Type = { … }` declaration.
 *
 * 🛑 Anchors on `= {`, not on the first `{` after the name. `SEED_PURPOSE_DERIVED_FROM`
 * is declared with a multi-line generic:
 *
 *     export const SEED_PURPOSE_DERIVED_FROM: Record<
 *       string,
 *       { readonly field: string; readonly collection: string }   <- first `{`
 *     > = {                                                        <- the real one
 *
 * so a first-brace parser returns the TYPE and the value is never read. That is
 * exactly what happened on this audit's first run: it reported
 * `shippingConfigs` and `analyticsCards` as unclassified while both were
 * declared, i.e. a false positive against correct code — the failure mode that
 * trains people to reach for a suppression marker (Root Cause #22).
 */
const sliceBlock = (src, marker) => {
  const i = src.indexOf(marker);
  if (i < 0) return "";
  const eq = src.indexOf("= {", i);
  const open = eq >= 0 ? eq + 2 : src.indexOf("{", i);
  if (open < 0) return "";
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") {
      depth--;
      if (depth === 0) return src.slice(open, j + 1);
    }
  }
  return "";
};

const purposeBlock = sliceBlock(purposeSrc, "SEED_COLLECTION_PURPOSE");
const derivedBlock = sliceBlock(purposeSrc, "SEED_PURPOSE_DERIVED_FROM");
const rowBlock = sliceBlock(purposeSrc, "SEED_ROW_PURPOSE");

const declared = new Map();
for (const m of purposeBlock.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*"(test|permanent)"/gm)) {
  if (declared.has(m[1])) {
    fail(
      "DUPLICATE_KEY",
      `SEED_COLLECTION_PURPOSE declares "${m[1]}" twice (now "${m[2]}", earlier "${declared.get(m[1])}")`,
      "A duplicate key means the LAST one silently wins. Remove one.",
    );
  }
  declared.set(m[1], m[2]);
}

const derivedKeys = new Set(
  [...derivedBlock.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*\{/gm)].map((m) => m[1]),
);
const derivedRefs = new Map();
for (const m of derivedBlock.matchAll(
  /([A-Za-z][A-Za-z0-9]*)\s*:\s*\{\s*field:\s*"([^"]+)"\s*,\s*collection:\s*"([^"]+)"/g,
)) {
  derivedRefs.set(m[1], { field: m[2], collection: m[3] });
}

const rowOverrides = new Map();
for (const m of rowBlock.matchAll(/"([^"]+)"\s*:\s*"(test|permanent)"/g)) {
  rowOverrides.set(m[1], m[2]);
}

const cliBlock = sliceBlock(cliSrc, "COLLECTION_MAP");
const cliKeys = new Set(
  [...cliBlock.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:/gm)].map((m) => m[1]),
);

// ── R1 · COLLECTION_PARITY ─────────────────────────────────────────────────
checked++;
if (cliKeys.size === 0) {
  fail("PARITY_UNREADABLE", `could not parse COLLECTION_MAP from ${CLI_FILE}`, "The audit cannot verify what it cannot read — fix the parser, do not skip the rule.");
} else {
  const covered = new Set([...declared.keys(), ...derivedKeys]);
  for (const k of cliKeys) {
    if (!covered.has(k)) {
      fail(
        "COLLECTION_UNCLASSIFIED",
        `"${k}" is loaded by appkit-seed and is in NEITHER SEED_COLLECTION_PURPOSE nor SEED_PURPOSE_DERIVED_FROM`,
        `Add "${k}" to SEED_COLLECTION_PURPOSE. Unclassified falls through to "test", so it becomes purgeable by accident rather than by decision.`,
      );
    }
  }
  for (const k of covered) {
    if (!cliKeys.has(k)) {
      fail(
        "COLLECTION_DEAD",
        `"${k}" is classified but appkit-seed does not load it`,
        `Remove "${k}". A dead entry reads as coverage and matches zero rows — the \`offers\` defect in TEST_DATA_COLLECTIONS.`,
      );
    }
  }
}

// ── R2 · NO_HAND_WRITTEN_ISTESTDATA ────────────────────────────────────────
checked++;
for (const m of purposeSrc.matchAll(/^.*\bisTestData\b.*$/gm)) {
  const line = m[0];
  /* A type-only or key-less mention is fine; an ASSIGNMENT is not. */
  if (/isTestData\s*[:=]\s*(true|false|[A-Za-z])/.test(line)) {
    fail(
      "DERIVES_ISTESTDATA",
      `seed-purpose.ts assigns isTestData: ${line.trim().slice(0, 90)}`,
      "seedPurpose must NEVER write isTestData. Deriving it from `test` — the DEFAULT — hides every seeded product, category and store from the public while the load reports success.",
    );
  }
}

// ── R3 · PERMANENT_MAY_NOT_REFERENCE_TEST ──────────────────────────────────
// Resolve each derived collection's rows against the seed files.
const resolve = (collection, id, refId) => {
  if (id && rowOverrides.has(id)) return rowOverrides.get(id);
  if (derivedRefs.has(collection)) {
    if (refId && rowOverrides.has(refId)) return rowOverrides.get(refId);
    const refColl = derivedRefs.get(collection).collection;
    return declared.get(refColl) ?? "test";
  }
  return declared.get(collection) ?? "test";
};

checked++;
/*
 * 🛑 Checks EVERY collection that carries a cross-collection reference, not
 * only the derived ones.
 *
 * The first version looped `derivedRefs` alone, which made it unable to catch
 * the exact mistake it exists for: declaring `shippingConfigs: "permanent"`
 * OUTRIGHT (which is what the user's list literally implies) removes it from
 * `derivedRefs`, so the loop skipped it and the rule reported clean on 14
 * dangling rows. Proven by negative control.
 *
 * So the reference FIELDS are enumerated independently of how a collection
 * resolves its purpose. `storeId` is the one that matters today; the others are
 * listed because a permanent row referencing any purged row is the same defect.
 */
const REFERENCE_FIELDS = [
  { field: "storeId", collection: "stores" },
  { field: "ownerId", collection: "users" },
  { field: "userId", collection: "users" },
  { field: "sellerId", collection: "users" },
];

const purposeOfId = (id, refCollection) =>
  rowOverrides.get(id) ?? declared.get(refCollection) ?? "test";

for (const f of readdirSync(join(ROOT, SEED_DIR)).filter((x) => x.endsWith("-seed-data.ts"))) {
  const src = stripComments(read(join(SEED_DIR, f)));
  /*
   * Which collection does this FILE feed? Derived from the filename, which is
   * the project's own convention (`<collection>-seed-data.ts`) — and when it
   * does not resolve, the file is SKIPPED rather than guessed at, because a
   * wrong guess here produces a false positive and those train people to reach
   * for a suppression marker (Root Cause #22).
   */
  /*
   * 🛑 The exported ARRAY NAME, not the filename.
   *
   * A filename maps to one collection and the files do not: measured,
   * `store-extensions-seed-data.ts` exports ELEVEN `*SeedData` arrays
   * (payoutMethods, shippingConfigs, analyticsCards, analyticsAlerts,
   * storeCategories, listingTemplates, moderationQueue, reports, itemRequests,
   * storeGoogleConfig). A filename-derived mapping resolved
   * that whole file to ONE collection, so declaring `shippingConfigs:
   * "permanent"` left it unexamined and the rule reported clean on 14 dangling
   * rows. Proven by negative control, twice.
   *
   * `export const <collection>SeedData` is the project's actual convention and
   * is unambiguous.
   */
  const ownCollections = [...declared.keys(), ...derivedKeys].filter((k) =>
    new RegExp(`export const ${k}SeedData\\b`).test(src),
  );
  if (ownCollections.length === 0) continue;

  for (const collection of ownCollections) {
    for (const { field, collection: refCollection } of REFERENCE_FIELDS) {
      const re = new RegExp(`\\b${field}:\\s*"([^"]+)"`, "g");
      const seen = new Set();
      for (const m of src.matchAll(re)) {
        const refId = m[1];
        if (seen.has(refId)) continue;
        seen.add(refId);
        const refPurpose = purposeOfId(refId, refCollection);
        const own = resolve(collection, null, refId);
        if (own === "permanent" && refPurpose === "test") {
          fail(
            "PERMANENT_REFERENCES_TEST",
            `${f}: a "${collection}" row resolving "permanent" references ${field} "${refId}", which resolves "test"`,
            `A purge deletes "${refId}" and leaves this row behind as a dangling FK that still reads as real data. Either make the referenced row permanent, or derive this collection's purpose from it via SEED_PURPOSE_DERIVED_FROM.`,
          );
        }
      }
    }
  }
}

// ── R4 · ROW_OVERRIDES_RESOLVE ─────────────────────────────────────────────
checked++;
if (rowOverrides.size > 0) {
  /*
   * 🛑 EXCLUDE seed-purpose.ts itself, and this is not a detail.
   *
   * `seed-purpose.ts` lives IN `appkit/src/seed/`, so the first version of this
   * rule scanned the file that DECLARES the overrides — every id trivially
   * matched its own declaration and the rule could never fail. Proven by
   * negative control: typing `user-admin-letitripp` still reported clean.
   *
   * That is Root Cause #92's lesson exactly — *a check a name satisfies is
   * decoration* — and it is the second time in this one file (the other was
   * `sliceBlock` reading a type annotation instead of a value).
   */
  const allSeed = readdirSync(join(ROOT, SEED_DIR))
    .filter((f) => f.endsWith(".ts") && f !== "seed-purpose.ts")
    .map((f) => read(join(SEED_DIR, f)))
    .join("\n");
  for (const key of rowOverrides.keys()) {
    /*
     * Keys are `"<collection>:<id>"`. 🛑 The collection half must be validated
     * too: an override scoped to a collection that is not loaded protects
     * nothing, and an UNSCOPED key (the old shape) silently matched every
     * collection keyed on the same id — which made the admin's cart permanent.
     */
    const sep = key.indexOf(":");
    if (sep < 0) {
      fail(
        "ROW_OVERRIDE_UNSCOPED",
        `SEED_ROW_PURPOSE key "${key}" has no "<collection>:" prefix`,
        'Scope it, e.g. "users:user-admin-letitrip". A bare id matches EVERY collection keyed on that id — carts, wishlists and history are all keyed on the user id, so an unscoped user override makes that user\'s cart permanently unpurgeable.',
      );
      continue;
    }
    const coll = key.slice(0, sep);
    const id = key.slice(sep + 1);
    if (!cliKeys.has(coll)) {
      fail(
        "ROW_OVERRIDE_DEAD_COLLECTION",
        `SEED_ROW_PURPOSE scopes "${id}" to "${coll}", which appkit-seed does not load`,
        "An override scoped to a collection nobody loads reads as protection and protects nothing.",
      );
    }
    if (!allSeed.includes(`"${id}"`)) {
      fail(
        "ROW_OVERRIDE_UNRESOLVED",
        `SEED_ROW_PURPOSE names "${id}" (in "${coll}"), which appears in no seed file`,
        "An override for an id nobody seeds reads as protection and protects nothing (Root Cause #33). Fix the id or drop the entry.",
      );
    }
  }
}

// ── R5 · EVERY LOADER STAMPS ───────────────────────────────────────────────
/*
 * Every write path in `seed-cli.mjs` must stamp, or the collections it feeds
 * land unstamped and are therefore UNREACHABLE by the purge — invisible,
 * because the load reports success and `appkit-seed status` counts documents by
 * id and cannot see a missing field.
 *
 * 🛑 Measured, and this is why the rule exists rather than a checklist: I
 * stamped the FOUR loader functions, declared it done, and a live read-back
 * found `addresses` at **0 of 19**. There are EIGHT write sites — four in named
 * loaders and four in inline `else if (colName === …)` branches
 * (`addresses`, `storeAddresses`, `couponUsage`, `siteSettings`). Root Cause
 * #75's shape: a rule reachable by copy-paste gets copied, and the copies made
 * elsewhere never learn about it.
 *
 * The check walks each `colName === "X"` branch and requires any branch that
 * writes to also stamp. A crude line-window check does NOT work — some stamps
 * sit ten lines above their write, which produced five false positives when I
 * tried it by hand.
 */
checked++;
{
  const BRANCH = /\}\s*else if \(colName === "([A-Za-z]+)"\)/g;
  const marks = [...cliSrc.matchAll(BRANCH)].map((m) => ({ name: m[1], at: m.index }));
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].at;
    const end = i + 1 < marks.length ? marks[i + 1].at : cliSrc.length;
    const body = cliSrc.slice(start, end);
    const writes = /\.set\(|batch\.set\(/.test(body);
    /* A branch that only DELEGATES to a named loader is stamped by that loader. */
    const delegates = /await load[A-Z][A-Za-z]*\(/.test(body);
    if (writes && !delegates && !body.includes("stampSeedPurpose")) {
      fail(
        "LOADER_DOES_NOT_STAMP",
        `seed-cli.mjs branch for "${marks[i].name}" writes to Firestore without calling stampSeedPurpose`,
        `Every write must stamp, or "${marks[i].name}" loads unstamped and the purge can never reach it — silently, because the load still reports success.`,
      );
    }
  }
  /* And the named loaders themselves. */
  for (const fn of ["loadUsers", "loadSubcollection", "loadOneDocPerUser", "loadGeneric"]) {
    const i = cliSrc.indexOf(`async function ${fn}(`);
    if (i < 0) continue;
    const next = cliSrc.indexOf("\nasync function ", i + 10);
    const body = cliSrc.slice(i, next < 0 ? cliSrc.length : next);
    if (/\.set\(|batch\.set\(/.test(body) && !body.includes("stampSeedPurpose")) {
      fail(
        "LOADER_DOES_NOT_STAMP",
        `${fn}() writes to Firestore without calling stampSeedPurpose`,
        "Same consequence: the collections it feeds load unstamped and are unreachable by the purge.",
      );
    }
  }
}

// ── R6 · TEST_DATA_COLLECTIONS DECLARES isTestData ─────────────────────────
/*
 * Every collection in `TEST_DATA_COLLECTIONS` must have `isTestData` on its
 * document interface, because `getTestDataRefs` queries on exactly that field.
 *
 * 🛑 This is the `offers` defect, and it is the clearest example in the repo of
 * a list that reads as coverage and matches nothing: `offers` sat in that list
 * while `OfferDocument` does not declare the field at all, so the daily sweep
 * queried a field no offer has ever had. Measured live: 10 offers, 0 carrying
 * it.
 *
 * 🛑 It is a SEPARATE axis from `seedPurpose` and the two must not be merged —
 * `isTestData` answers "may the public see this", `seedPurpose` answers "may a
 * purge delete this". Deriving one from the other hides the demo catalogue
 * (R2). This rule lives here only because both are seed-provenance concerns and
 * one audit is better than two that can disagree.
 */
checked++;
{
  const CLEANUP = "appkit/src/_internal/server/jobs/core/testDataCleanup.ts";
  if (existsSync(join(ROOT, CLEANUP))) {
    const src = stripComments(read(CLEANUP));
    const m = src.match(/TEST_DATA_COLLECTIONS\s*=\s*\[([^\]]*)\]/);
    const entries = m ? [...m[1].matchAll(/"([A-Za-z]+)"/g)].map((x) => x[1]) : [];
    /* Which feature schemas declare the field. */
    const schemaDirs = readdirSync(join(ROOT, "appkit/src/features"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    const declaring = new Set();
    for (const dir of schemaDirs) {
      const p = join("appkit/src/features", dir, "schemas/firestore.ts");
      if (!existsSync(join(ROOT, p))) continue;
      if (/\bisTestData\?*\s*:/.test(read(p))) declaring.add(dir);
    }
    /* Collection key -> the feature dir that owns its schema. Only the handful
     * in this list need mapping, and an unmapped one is reported rather than
     * assumed — a wrong guess here would be a false positive. */
    const OWNER = {
      categories: "categories",
      stores: "stores",
      products: "products",
      blogPosts: "blog",
      events: "events",
      offers: "seller",
      orders: "orders",
      obligations: "obligations",
      protectionClaims: "protection-claims",
    };
    for (const c of entries) {
      const owner = OWNER[c];
      if (!owner) {
        fail(
          "TEST_DATA_COLLECTION_UNMAPPED",
          `TEST_DATA_COLLECTIONS lists "${c}" and this audit does not know which feature declares its schema`,
          `Add "${c}" to the OWNER map in this audit so the isTestData check can run against it.`,
        );
        continue;
      }
      if (!declaring.has(owner)) {
        fail(
          "TEST_DATA_COLLECTION_LACKS_FIELD",
          `TEST_DATA_COLLECTIONS lists "${c}" but features/${owner}/schemas/firestore.ts does not declare isTestData`,
          `getTestDataRefs queries on exactly ZERO rows while reading as coverage. Either declare the field or remove the entry.`,
        );
      }
    }

    /*
     * ── the INVERSE direction (G1b) ──────────────────────────────────────────
     * R6 above catches an entry that CANNOT match anything. It never asked
     * whether some OTHER schema declares `isTestData` and has no entry at all —
     * a collection that is silently never swept, forever, because nothing
     * reads its field. `entries` was hand-maintained; a 6th schema adopting the
     * field would not fail a type check, only this audit.
     */
    const entryOwners = new Set(entries.map((c) => OWNER[c]).filter(Boolean));
    for (const dir of declaring) {
      if (!entryOwners.has(dir)) {
        fail(
          "TEST_DATA_COLLECTION_MISSING_ENTRY",
          `features/${dir}/schemas/firestore.ts declares isTestData but no TEST_DATA_COLLECTIONS entry maps to it`,
          `Add its collection key to both TEST_DATA_COLLECTIONS and the OWNER map in this audit, or the field is write-only and the row never gets swept.`,
        );
      }
    }
  }
}

// ── R7 · EVERY WIPED COLLECTION IS RE-SEEDABLE ─────────────────────────────
/*
 * The tester's `SEED_OWNED` tier means "deleted wholesale and re-seeded to a
 * known state". So every entry must be loadable by `appkit-seed` — because a
 * wipe with no restore is just a delete, and this tier is the one that runs
 * against the live project.
 *
 * 🛑 Found by this rule on its first run: `conversations` was SEED_OWNED and
 * absent from `COLLECTION_MAP`, so a tester run deleted a collection nothing
 * recreated. Benign in the end — the messaging feature was removed 2026-08-31
 * and all three chat collections measure 0 documents — but the shape is the
 * dangerous one, and it had been sitting there since.
 *
 * Note this rule does NOT object to a `permanent` collection being in
 * SEED_OWNED, and that is deliberate. Nine are (faqs, categories, taxCodes,
 * productFeatures, blogPosts, carousels, carouselSlides, homepageSections,
 * testerChecklistItems) and a tester run wipes and restores them from the same
 * seed files that authored them. `permanent` means "a PURGE must not remove
 * it", not "nothing may ever rewrite it" — conflating those would forbid the
 * reseed that makes a run reproducible. The risk a FAILED reseed poses is real
 * and is recorded in the plan, not papered over here.
 */
checked++;
{
  const TESTER = "tester/scripts/lib/collections.mjs";
  if (existsSync(join(ROOT, TESTER))) {
    const src = stripComments(read(TESTER));
    const i = src.indexOf("export const SEED_OWNED");
    if (i >= 0) {
      const block = src.slice(i, src.indexOf("]", i));
      const owned = [...block.matchAll(/"([A-Za-z]+)"/g)].map((m) => m[1]);
      for (const c of owned) {
        if (!cliKeys.has(c)) {
          fail(
            "WIPED_BUT_NOT_RESEEDABLE",
            `tester SEED_OWNED lists "${c}", which appkit-seed cannot load`,
            `A tester run deletes "${c}" and nothing recreates it. Either add a seed fixture (so the wipe has something to restore) or remove the entry — an unlisted collection is PRESERVED by default, which is the safe direction.`,
          );
        }
      }
    }
  }
}

// ── report ─────────────────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log(
    `audit-seed-purpose: clean ✓ (${declared.size} declared + ${derivedKeys.size} derived = ${
      declared.size + derivedKeys.size
    } of ${cliKeys.size} loaded collections, ${rowOverrides.size} row override(s), ${checked} rules)`,
  );
  process.exit(0);
}

console.error(`audit-seed-purpose: ${violations.length} violation(s) found.\n`);
console.error(
  "seedPurpose is what `appkit-seed purge` queries. A gap here is not a style\n" +
    "issue — it decides whether a row can be cleared, and neither direction errors.\n",
);
for (const v of violations) {
  console.error(`  ${v.rule} — ${v.detail}`);
  console.error(`    Fix: ${v.fix}\n`);
}
process.exit(1);

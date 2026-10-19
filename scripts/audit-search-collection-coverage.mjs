#!/usr/bin/env node
/*
 * audit-search-collection-coverage — strict-zero on NEW collections only. A ratchet.
 *
 * ## The question this answers
 *
 * "A schema change just added a collection. Does search need to know about
 * it?" Nothing else in this codebase asks that question at the moment a
 * collection is BORN — `audit-searchtxt-migration` and
 * `audit-search-index-artifact` both audit collections that already exist
 * and have presumably already had the conversation. A brand-new collection
 * has had no conversation at all, and the first anyone would notice is a
 * support ticket: "why can't I find the thing I just added?"
 *
 * ## The mechanism — a RATCHET over collection NAMES, seeded from today
 *
 * Every `*_COLLECTION = "name"` constant under `appkit/src/features/** /
 * schemas/firestore.ts` is extracted and checked against three buckets:
 *
 *   1. BASELINE_COLLECTIONS   — every collection that existed when this
 *      audit was written. None of these are re-litigated; they either
 *      already have a decision recorded elsewhere (searchable, PII-bound,
 *      not-applicable, artifact-only) or are intentionally out of scope
 *      (sessions, token stores, counters, logs) and relitigating 61 rows
 *      in one sweep is exactly the bulk-conversion mistake
 *      `listing-delegation`'s own header warns against.
 *   2. DECIDED  — collections with an on-record search decision: present
 *      in `PUBLIC_INDEX_SOURCES` (searchable via the artifact), OR in one
 *      of `audit-searchtxt-migration`'s MIGRATED / NOT_APPLICABLE /
 *      PII_BOUND / INDEX_ARTIFACT_ONLY buckets (a decision was made and
 *      recorded, even if the decision was "not this way").
 *   3. Anything NOT in (1) is, by definition, NEW since this audit was
 *      authored — and if it is ALSO not in (2), nobody has decided
 *      anything about it. STRICT FAIL, with the exact three options.
 *
 * This is the opposite shape to A7's report-only sweep: A7 found 55
 * PRE-EXISTING gaps across 27 untouched features and rightly stayed
 * report-only rather than fail a build on work nobody asked for today.
 * This rule can never find a pre-existing gap — the baseline absorbs all
 * 61 collections that exist right now — so every failure it raises is
 * about a collection that did not exist when this file was written, which
 * is precisely the "before the code ships" moment being asked for.
 *
 * 🛑 Expanding BASELINE_COLLECTIONS is the WRONG fix for a failure here.
 * Adding a new name to that array silences the audit without answering the
 * question it asked. The right fix is always one of the three options in
 * the failure message.
 *
 * Negative control: declare a fake `export const WIDGETS_COLLECTION =
 * "widgets" as const;` in a scratch schema file under appkit/src/features
 * and confirm it fails, naming the collection and the three options.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FEATURES_DIR = join(ROOT, "appkit", "src", "features");
const SHARED_DIR = join(ROOT, "appkit", "src", "_internal", "shared", "features");
const SOURCES_FILE = join(ROOT, "appkit", "src", "_internal", "server", "features", "search", "index-build", "sources.ts");
const MIGRATION_AUDIT = join(ROOT, "scripts", "audit-searchtxt-migration.mjs");

/*
 * 🛑 THE FROZEN BASELINE — every collection this project held at authoring
 * time. Measured by running this exact extraction, not hand-typed (Root
 * Cause #84: seed a ratchet from a run of its own rule).
 */
const BASELINE_COLLECTIONS = new Set([
  "addresses", "adminAuditLog", "analyticsAlerts", "analyticsCards",
  "authMailCooldowns", "bids", "blogPosts", "businessDocuments",
  "carouselSlides", "carousels", "carts", "catalogueItems", "categories",
  "claimedCoupons", "conversations", "coupons", "emailVerificationTokens",
  "eventEntries", "events", "failedCheckouts", "failedPayments", "faqs",
  "groupedListings", "homepageSections", "itemRequests", "jobs",
  "listingTemplates", "lotteryEntries", "messageBudget", "modelComposition",
  "moderationQueue", "notifications", "offers", "orders", "partGlossary",
  "passwordResetTokens", "payoutMethods", "payouts", "procurementShipments",
  "products", "reports", "reviews", "scammerProfiles", "serverErrors",
  "sessions", "shipmentItems", "shipmentLots", "shippingConfigs",
  "siteSettings", "sms_counters", "stickerSheets", "stickerTraceRuns",
  "stickerTraceTasks", "storeCategories", "storeGoogleConfig", "stores",
  "supportTickets", "taxCodes", "testerChecklistItems",
  "testerChecklistResponses", "users",
  /*
   * 🛑 Found by this audit's OWN FIRST RUN, not by the hand grep that built
   * everything above it — the hand grep's glob missed
   * `store-extensions/schemas/firestore.ts` for an undetermined reason.
   * Root Cause #84's lesson, immediate: trust the rule's output over a
   * list you typed, including the one you just typed for this very file.
   */
  "storeWhatsAppConfig",
]);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name === "node_modules") continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name === "firestore.ts") out.push(full);
  }
  return out;
}

/** `{ name, file }` for every `*_COLLECTION = "name"` constant found. */
function findCollectionConstants() {
  const found = [];
  const files = [...walk(FEATURES_DIR), ...(existsSync(SHARED_DIR) ? walk(SHARED_DIR) : [])];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/\b[A-Z][A-Z0-9_]*_COLLECTION\s*=\s*["']([a-zA-Z_][a-zA-Z0-9_]*)["']/g)) {
      found.push({ name: m[1], file: relative(ROOT, file) });
    }
  }
  return found;
}

/** Every collection name `PUBLIC_INDEX_SOURCES` already reads. */
function collectionsInSearchSources() {
  if (!existsSync(SOURCES_FILE)) return new Set();
  const src = readFileSync(SOURCES_FILE, "utf8");
  return new Set([...src.matchAll(/collection:\s*["']([^"']+)["']/g)].map((m) => m[1]));
}

/**
 * Every collection name appearing anywhere inside `audit-searchtxt-migration`'s
 * four verdict buckets (MIGRATED / NOT_APPLICABLE / PII_BOUND /
 * INDEX_ARTIFACT_ONLY). A loose text scan rather than parsing the buckets
 * individually — this audit only needs "was a decision recorded", not which
 * bucket it landed in.
 */
function collectionsDecidedInMigrationAudit() {
  if (!existsSync(MIGRATION_AUDIT)) return new Set();
  const src = readFileSync(MIGRATION_AUDIT, "utf8");
  return new Set([...src.matchAll(/name:\s*["']([a-zA-Z_][a-zA-Z0-9_]*)["']/g)].map((m) => m[1]));
}

const declared = findCollectionConstants();
const bySources = collectionsInSearchSources();
const byMigration = collectionsDecidedInMigrationAudit();

const violations = [];
const seenNames = new Set();

for (const { name, file } of declared) {
  seenNames.add(name);
  if (BASELINE_COLLECTIONS.has(name)) continue; // pre-existing — out of scope today
  if (bySources.has(name) || byMigration.has(name)) continue; // decided

  violations.push(
    `"${name}" (declared in ${file}) is a NEW collection with no recorded search ` +
      `decision. Pick one:\n` +
      `      (a) it should be publicly findable -> add it to PUBLIC_INDEX_SOURCES\n` +
      `          (appkit/src/_internal/server/features/search/index-build/sources.ts)\n` +
      `      (b) it needs Firestore token search or is explicitly out of scope ->\n` +
      `          add it to MIGRATED / NOT_APPLICABLE / PII_BOUND / INDEX_ARTIFACT_ONLY\n` +
      `          in scripts/audit-searchtxt-migration.mjs, with a reason\n` +
      `      (c) it is purely internal/operational, never public -> add its name to\n` +
      `          BASELINE_COLLECTIONS in this audit with a one-line reason comment`,
  );
}

if (violations.length === 0) {
  console.log(
    `[audit-search-collection-coverage] OK: 0 new undecided collection(s) ` +
      `(${seenNames.size} collection(s) scanned, ${BASELINE_COLLECTIONS.size} baseline).`,
  );
  process.exit(0);
}

console.error("\n[audit-search-collection-coverage] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}\n`);
console.error(`Total: ${violations.length}\n`);
process.exit(1);

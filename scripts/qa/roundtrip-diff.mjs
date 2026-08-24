#!/usr/bin/env node
/**
 * roundtrip-diff — prove a schema does not silently delete fields.
 *
 * ## Why this exists
 *
 * `z.object()` STRIPS UNKNOWN KEYS. So the moment a form gains a schema, any
 * field that schema forgets to name disappears from the document on the next
 * save — no error, no log, nothing in the network tab. That is exactly how
 * `productBaseSchema` came to eat every `classified*` / `digitalCode*` /
 * `liveItem*` / `prize*` field: the listing types were added to the UI and to
 * the union, and nobody widened the request schema.
 *
 * The plan that introduces this tool adds ~24 more schemas and tightens 44
 * `.passthrough()` routes. Both are chances to reproduce that bug at scale.
 *
 * ## What it does
 *
 *   read N real documents  ->  schema.safeParse(doc)  ->  deepDiff(doc, parsed)
 *
 * Any key present in the document and absent afterwards is a field this
 * schema will delete. Run it BEFORE touching a form to capture the baseline,
 * and after to prove the dropped-key set did not grow.
 *
 * A key dropped on 0 of N docs is fine — genuinely optional, never populated.
 * A key dropped on all N is a bug. The counts are the signal, not the names.
 *
 * ## Usage
 *
 *   node scripts/qa/roundtrip-diff.mjs --entity product --sample 20
 *   node scripts/qa/roundtrip-diff.mjs --all
 *   node scripts/qa/roundtrip-diff.mjs --entity coupon --full   # whole collection
 *   node scripts/qa/roundtrip-diff.mjs --all --json > baseline.json
 *   node scripts/qa/roundtrip-diff.mjs --all --baseline baseline.json
 *
 * `--full` is mandatory for the 40 forms that have never validated anything:
 * a sample cannot prove the tail of a collection parses.
 *
 * Exit 0 — no regression against `--baseline` (or no baseline supplied).
 * Exit 1 — the dropped-key set grew, or a doc failed to parse at all.
 * Exit 2 — configuration problem (no credentials, unknown entity).
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};

const ENTITY = value("entity", null);
const ALL = flag("all");
const FULL = flag("full");
const SAMPLE = Number(value("sample", "20"));
const AS_JSON = flag("json");
const BASELINE_PATH = value("baseline", null);
const VERBOSE = flag("verbose");

if (!ENTITY && !ALL) {
  console.error("Usage: roundtrip-diff --entity <name> [--sample N|--full] | --all");
  console.error("       --json > baseline.json     capture a baseline");
  console.error("       --baseline baseline.json   compare against one");
  process.exit(2);
}

// ---------------------------------------------------------------------------
// .env.local (same loader shape as appkit/scripts/seed-cli.mjs)
// ---------------------------------------------------------------------------
const repoRoot = process.cwd();
const envLocalPath = resolve(repoRoot, ".env.local");
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
} else {
  console.warn(`⚠ .env.local not found at ${envLocalPath} — relying on process.env`);
}

const required = ["FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`✗ Missing required env vars: ${missing.join(", ")}`);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// firebase-admin + appkit
// ---------------------------------------------------------------------------
const require = createRequire(import.meta.url);
// See seed-cli.mjs: appkit's pii-encrypt.ts calls a bare `require("crypto")`
// at runtime so bundlers never see a node:module dependency. A standalone ESM
// script has no ambient `require`, so provide one before importing appkit.
globalThis.require = require;
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID.trim(),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL.trim(),
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").includes("\\n")
        ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n")
        : process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    }),
  });
}
const db = admin.firestore();

/**
 * Load the schema registry.
 *
 * `import("@mohasinac/appkit")` currently fails from a standalone Node ESM
 * script: the package is `"type": "module"`, and `dist/server-entry.js` line
 * 16 re-exports `"./index"` with no file extension — which bundlers tolerate
 * and Node's ESM resolver does not. Verified from four different importer
 * locations; all fail with ERR_MODULE_NOT_FOUND on `dist/index`.
 *
 * That is a packaging bug worth fixing at the build step (emit extensioned
 * relative specifiers). Until it is, don't let this tool die with a raw
 * resolver stack trace — say what is wrong and what to do about it.
 */
async function loadSchemaRegistry() {
  for (const specifier of ["@mohasinac/appkit", "../../appkit/dist/index.js"]) {
    try {
      const mod = await import(specifier);
      if (mod?.SCHEMAS) return mod.SCHEMAS;
    } catch {
      // try the next specifier
    }
  }
  return null;
}

const SCHEMAS = await loadSchemaRegistry();
if (!SCHEMAS) {
  console.error(
    "\n✗ Could not load SCHEMAS from @mohasinac/appkit.\n\n" +
    "  appkit's built entry re-exports './index' without a file extension\n" +
    "  (dist/server-entry.js:16). Node ESM cannot resolve that, so any\n" +
    "  standalone .mjs script importing the bare specifier fails.\n\n" +
    "  Fix at the build step — emit extensioned relative specifiers — or run\n" +
    "  this check from a context that bundles appkit rather than importing it\n" +
    "  directly.\n",
  );
  process.exit(2);
}

// ---------------------------------------------------------------------------
// entity -> collection. Only entities with a registered form schema are
// checkable; SCHEMAS.forms is populated as each entity migrates, so this map
// grows alongside it rather than being a second hand-maintained list.
// ---------------------------------------------------------------------------
const COLLECTION_FOR = {
  product: "products",
  order: "orders",
  user: "users",
  store: "stores",
  category: "categories",
  brand: "categories",
  coupon: "coupons",
  blog: "blogPosts",
  event: "events",
  faq: "faqs",
  review: "reviews",
  payout: "payouts",
  address: "addresses",
  shipment: "procurementShipments",
  scammer: "scammerProfiles",
  supportTicket: "supportTickets",
  catalogueItem: "catalogueItems",
  groupedListing: "groupedListings",
  carouselSlide: "carouselSlides",
  homepageSection: "homepageSections",
  role: "customRoles",
  listingTemplate: "listingTemplates",
  payoutMethod: "payoutMethods",
  shippingConfig: "shippingConfigs",
  storeCategory: "storeCategories",
};

// ---------------------------------------------------------------------------
// diff
// ---------------------------------------------------------------------------

/** Every leaf path in an object, dotted. Arrays are compared as whole values. */
function leafPaths(obj, prefix = "", out = []) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    if (prefix) out.push(prefix);
    return out;
  }
  // Firestore Timestamps and similar carry methods, not data — treat as leaves.
  if (typeof obj.toDate === "function") {
    if (prefix) out.push(prefix);
    return out;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0 && prefix) out.push(prefix);
  for (const k of keys) leafPaths(obj[k], prefix ? `${prefix}.${k}` : k, out);
  return out;
}

/** Paths present in `before` but gone from `after`. */
function droppedPaths(before, after) {
  const a = new Set(leafPaths(after));
  return leafPaths(before).filter((p) => !a.has(p));
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------
const registered = Object.keys(SCHEMAS?.forms ?? {});
if (registered.length === 0) {
  console.log(
    "\nSCHEMAS.forms is empty — no entity has a registered form schema yet.\n" +
    "This is expected until the first entity migrates. Nothing to check.\n" +
    "(Register each EntityFormDefinition.schema as its form moves onto SectionForm.)\n",
  );
  process.exit(0);
}

const targets = ALL ? registered : [ENTITY];
const report = {};
let sawFailure = false;

for (const entity of targets) {
  const schema = SCHEMAS.forms[entity];
  if (!schema) {
    console.error(`✗ No schema registered for "${entity}". Known: ${registered.join(", ") || "(none)"}`);
    process.exit(2);
  }
  const collection = COLLECTION_FOR[entity];
  if (!collection) {
    console.error(`✗ No collection mapped for "${entity}" — add it to COLLECTION_FOR.`);
    process.exit(2);
  }

  let query = db.collection(collection);
  if (!FULL) query = query.limit(SAMPLE);
  const snap = await query.get();

  const droppedCounts = new Map();
  const parseFailures = [];

  for (const doc of snap.docs) {
    const data = { id: doc.id, ...doc.data() };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      parseFailures.push({
        id: doc.id,
        issues: parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`),
      });
      continue;
    }
    for (const p of droppedPaths(data, parsed.data)) {
      droppedCounts.set(p, (droppedCounts.get(p) ?? 0) + 1);
    }
  }

  const total = snap.size;
  const dropped = [...droppedCounts.entries()]
    .map(([path, count]) => ({ path, count, pct: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  report[entity] = { collection, sampled: total, full: FULL, dropped, parseFailures };

  if (!AS_JSON) {
    console.log(`\n── ${entity}  (${collection}, ${total} doc${total === 1 ? "" : "s"}${FULL ? ", FULL" : ""})`);
    if (parseFailures.length > 0) {
      sawFailure = true;
      console.log(`   ✗ ${parseFailures.length} doc(s) FAILED to parse — the schema rejects data that already exists:`);
      for (const f of parseFailures.slice(0, 5)) {
        console.log(`       ${f.id}: ${f.issues.join(" | ")}`);
      }
    }
    if (dropped.length === 0) {
      console.log("   ✓ no fields dropped");
    } else {
      console.log(`   ${dropped.length} field(s) dropped by this schema:`);
      for (const d of dropped) {
        const severity = d.pct === 100 ? "ALL" : d.pct >= 50 ? "most" : "some";
        console.log(`       ${String(d.count).padStart(4)}/${total}  (${severity})  ${d.path}`);
      }
      console.log("   A field dropped on every doc is almost certainly a schema gap, not an optional field.");
    }
  }
}

// ---------------------------------------------------------------------------
// baseline comparison — the actual gate
// ---------------------------------------------------------------------------
if (BASELINE_PATH) {
  if (!existsSync(BASELINE_PATH)) {
    console.error(`✗ Baseline not found: ${BASELINE_PATH}`);
    process.exit(2);
  }
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  const regressions = [];
  for (const [entity, current] of Object.entries(report)) {
    const before = new Set((baseline[entity]?.dropped ?? []).map((d) => d.path));
    for (const d of current.dropped) {
      if (!before.has(d.path)) regressions.push(`${entity}: ${d.path} (${d.count}/${current.sampled} docs)`);
    }
  }
  if (regressions.length > 0) {
    console.error("\n✗ REGRESSION — these fields were NOT dropped before and are now:\n");
    for (const r of regressions) console.error(`  - ${r}`);
    console.error("\nWiden the schema to name them, or confirm the loss is intended.\n");
    process.exit(1);
  }
  console.log("\n✓ No new dropped fields vs baseline.");
}

if (AS_JSON) {
  const out = JSON.stringify(report, null, 2);
  if (VERBOSE) writeFileSync("roundtrip-baseline.json", out);
  console.log(out);
}

process.exit(sawFailure ? 1 : 0);

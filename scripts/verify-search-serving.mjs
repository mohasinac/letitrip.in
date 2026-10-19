#!/usr/bin/env node
/*
 * verify-search-serving.mjs — prove the PUBLISHED artifact is actually
 * reachable, cacheable and correct, from outside the app.
 *
 * ## Why this exists separately from verify-search-local.mjs
 *
 * That script proves the matcher works against a fixture. This one proves the
 * three things a fixture cannot: that the object is published at the URL the
 * client computes, that a browser is allowed to read it, and that what comes
 * back is the shape this build understands. Every one of those is a property
 * of the deployed world, and each has already been wrong once —
 * `storage.googleapis.com` 403s, an un-CORSed response is opaque, and a schema
 * bump would be read wrong rather than rejected.
 *
 * 🛑 It performs REAL HTTP against production Storage. It writes nothing, reads
 * ~420 KB, costs no Firestore reads, and needs no credentials — which is the
 * point: it checks what an anonymous visitor gets, not what an authenticated
 * admin SDK can see. Those differ, and the difference is the whole security
 * surface of a public artifact.
 *
 * 🛑 EVERY ASSERTION HAS A CONTROL, same rule as its sibling. A real term
 * returning rows proves nothing on its own; `zzzznope` returning zero is what
 * separates "searching" from "returning everything".
 *
 * Run: node scripts/verify-search-serving.mjs
 */

import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DIST = join(ROOT, "appkit", "dist", "_internal", "shared", "search");

if (!existsSync(join(DIST, "artifact-url.js"))) {
  console.error(
    "verify-search-serving: appkit/dist is missing the URL builder.\n" +
      "  Build it first:  npm --prefix ./appkit run build",
  );
  process.exit(2);
}

/*
 * Import the SHIPPED URL builder rather than re-deriving the URL here. A
 * second copy of the path would make this script agree with itself and with
 * nothing else — which is exactly the failure mode it is meant to catch.
 */
const { searchManifestUrl, searchArtifactUrl, firebaseDownloadUrl, searchIndexObjectPath } =
  await import(pathToFileURL(join(DIST, "artifact-url.js")).href);
const { SEARCH_INDEX_SCHEMA_VERSION } = await import(
  pathToFileURL(join(DIST, "index-record.js")).href
);
const { prepareIndex, searchIndex } = await import(pathToFileURL(join(DIST, "match.js")).href);
/*
 * 🛑 `feature-flags.js`, not `_registry.js`. The first draft imported it from
 * the registry, got `undefined`, and the money rule below then reported
 * "✓ no amount on any listing record — 0 listing types checked": a clean pass
 * produced by not looking at anything.
 *
 * It was caught only because the detail string prints the denominator. That
 * is the lesson worth keeping from it — a check that can silently measure an
 * empty set must say how big the set was, or it is decoration.
 */
const { ALL_LISTING_TYPES } = await import(
  pathToFileURL(
    join(ROOT, "appkit", "dist", "_internal", "shared", "listing-types", "feature-flags.js"),
  ).href
);
if (!Array.isArray(ALL_LISTING_TYPES) || ALL_LISTING_TYPES.length === 0) {
  console.error(
    "verify-search-serving: ALL_LISTING_TYPES is empty — the money rule below\n" +
      "  would pass by matching nothing. Refusing to report a false green.",
  );
  process.exit(2);
}

/** Read the bucket the way the client does — from the same env var. */
function readBucket() {
  if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    return process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.trim();
  }
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) return "";
  const m = /^NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=(.*)$/m.exec(readFileSync(envPath, "utf8"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

const BUCKET = readBucket();
if (!BUCKET) {
  console.error("verify-search-serving: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is unset.");
  process.exit(2);
}

/** The origin a real visitor arrives from, so the CORS check means something. */
const ORIGIN = process.env.SEARCH_VERIFY_ORIGIN ?? "https://www.letitrip.in";

let failures = 0;
function check(label, ok, detail) {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

console.log(`\nsearch artifact serving — bucket ${BUCKET}, origin ${ORIGIN}\n`);

// ── 1. The manifest ──────────────────────────────────────────────────
console.log("manifest");
const manifestRes = await fetch(searchManifestUrl(BUCKET), { headers: { Origin: ORIGIN } });
check("reachable", manifestRes.ok, `HTTP ${manifestRes.status}`);
if (!manifestRes.ok) {
  console.error("\n  The manifest is the client's entry point; nothing below can run.\n");
  process.exit(1);
}
check(
  "CORS allows the app origin",
  manifestRes.headers.get("access-control-allow-origin") === ORIGIN,
  manifestRes.headers.get("access-control-allow-origin") ?? "(absent)",
);
const manifestCache = manifestRes.headers.get("cache-control") ?? "";
check(
  "short cache, so a new build reaches visitors",
  /max-age=(\d+)/.test(manifestCache) && Number(/max-age=(\d+)/.exec(manifestCache)[1]) <= 300,
  manifestCache || "(absent)",
);
const manifest = await manifestRes.json();
check(
  "schema matches this build",
  manifest.schema === SEARCH_INDEX_SCHEMA_VERSION,
  `artifact ${manifest.schema} vs client ${SEARCH_INDEX_SCHEMA_VERSION}`,
);
/*
 * 🛑 The mirror must stay NARROW. `dirty` / `lastFullAt` / `perType` are build
 * bookkeeping; if one leaks in, somebody will eventually render it, and then
 * the mirror can never drop a field again.
 */
const extra = Object.keys(manifest).filter(
  (k) => !["schema", "version", "builtAt", "recordCount"].includes(k),
);
check("carries no build bookkeeping", extra.length === 0, extra.join(", ") || "4 public fields");
console.log(`    version ${manifest.version}, built ${manifest.builtAt}, ${manifest.recordCount} records`);

// ── 2. The artifact ──────────────────────────────────────────────────
console.log("\nartifact");
const t0 = performance.now();
const artifactRes = await fetch(searchArtifactUrl(BUCKET, manifest.version), {
  headers: { Origin: ORIGIN },
});
check("reachable at the manifest's version", artifactRes.ok, `HTTP ${artifactRes.status}`);
if (!artifactRes.ok) {
  console.error("\n  The manifest points at an object that is not there.\n");
  process.exit(1);
}
check(
  "CORS allows the app origin",
  artifactRes.headers.get("access-control-allow-origin") === ORIGIN,
  artifactRes.headers.get("access-control-allow-origin") ?? "(absent)",
);
const artifactCache = artifactRes.headers.get("cache-control") ?? "";
check(
  "immutable — the version IS the cache key",
  artifactCache.includes("immutable") && artifactCache.includes("public"),
  artifactCache || "(absent)",
);
const body = await artifactRes.text();
const elapsed = performance.now() - t0;
const artifact = JSON.parse(body);
check("envelope schema agrees with its manifest", artifact.schema === manifest.schema);
check(
  "record count agrees with its manifest",
  artifact.r.length === manifest.recordCount,
  `${artifact.r.length} vs ${manifest.recordCount}`,
);
console.log(
  `    ${(body.length / 1024).toFixed(0)} KB over the wire in ${elapsed.toFixed(0)} ms, ${artifact.types.length} types`,
);

// ── 3. The URL that does NOT work, kept honest ───────────────────────
console.log("\nthe other endpoint (must stay broken, or the comment is a lie)");
const gcs = await fetch(
  `https://storage.googleapis.com/${BUCKET}/${searchIndexObjectPath(manifest.version)}`,
  { headers: { Origin: ORIGIN } },
);
check(
  "plain storage.googleapis.com is refused",
  gcs.status === 403 || gcs.status === 401,
  `HTTP ${gcs.status}`,
);
if (gcs.ok) {
  console.log(
    "    🛑 This now SUCCEEDS. The object is public at the IAM level, which the\n" +
      "       Firebase storage rules do not control — someone granted allUsers.\n" +
      "       Harmless for this artifact, alarming for the rest of the bucket.",
  );
}

// ── 4. What must NOT be in it ────────────────────────────────────────
console.log("\ncontents");
/*
 * 🛑 The money rule is "no amount on a LISTING", not "no ₹ anywhere" — and the
 * difference was found by getting it wrong here first.
 *
 * A blanket grep failed on four coupons whose admin-authored NAME is marketing
 * copy: "Blader's Power — ₹500 Off". Checked rather than assumed: `GET
 * /api/coupons` is unauthenticated, enforces only `validity.isActive==true`,
 * and returns the whole coupon document — so that headline is already public,
 * and the artifact publishes strictly less than the endpoint beside it.
 *
 * What § Guest price gating actually protects is a LISTING's price, bid,
 * deposit or per-entry amount, so the catalogue cannot be read at scale
 * without an account. A discount headline reveals nothing about any listing.
 * A rule that fires on legitimate copy is one people learn to suppress, so
 * this one is scoped to the types where an amount would be the real thing.
 */
const LISTING_TYPE_KEYS = new Set(ALL_LISTING_TYPES);
const moneyOnListing = artifact.r.filter((rec) => {
  const key = artifact.types[rec[0]]?.key;
  if (!LISTING_TYPE_KEYS.has(key)) return false;
  return [rec[1], rec[2], rec[4]].some((f) => typeof f === "string" && /[₹$€£]|\bINR\b/.test(f));
});
check(
  "no amount on any listing record",
  moneyOnListing.length === 0,
  moneyOnListing.length ? moneyOnListing.slice(0, 3).map((r) => r[1]).join("; ") : `${LISTING_TYPE_KEYS.size} listing types checked`,
);
const moneyElsewhere = artifact.r.filter(
  (rec) => !LISTING_TYPE_KEYS.has(artifact.types[rec[0]]?.key) && /[₹$€£]/.test(`${rec[1]} ${rec[2]}`),
);
if (moneyElsewhere.length) {
  const types = [...new Set(moneyElsewhere.map((r) => artifact.types[r[0]].key))];
  console.log(
    `    note: ${moneyElsewhere.length} non-listing record(s) carry a currency symbol (${types.join(", ")}) —` +
      " admin-authored copy on an already-public surface, not a gated amount.",
  );
}
check(
  "no e-mail-shaped string anywhere in the body",
  !/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(body),
);
check(
  "no blind-index digest",
  !body.includes("hmac:") && !/TokensIndex/.test(body),
);
check("every record has a non-empty title", artifact.r.every((rec) => rec[1]?.length > 0));

// ── 5. Does it actually search? With a control. ──────────────────────
console.log("\nmatching (the real published corpus)");
const prepared = prepareIndex(artifact);
const probes = [
  ["dranzer", true],
  ["beyblade", true],
  ["zzzznope", false],
  ["!!!", false],
];
for (const [q, expectHits] of probes) {
  const hits = searchIndex(artifact, prepared, q, { limit: 50 });
  const ok = expectHits ? hits.length > 0 : hits.length === 0;
  check(
    `"${q}" -> ${hits.length} hit(s)`,
    ok,
    expectHits ? "expected some" : "expected ZERO — this is the control",
  );
}

const parts = searchIndex(artifact, prepared, "105", { limit: 50 });
console.log(`    "105" -> ${parts.length} hit(s) across ${new Set(parts.map((h) => h.type)).size} type(s)`);

console.log(
  failures === 0
    ? `\nverify-search-serving: OK — ${artifact.r.length} records live at v${manifest.version}.\n`
    : `\nverify-search-serving: ${failures} FAILED.\n`,
);
process.exit(failures === 0 ? 0 : 1);

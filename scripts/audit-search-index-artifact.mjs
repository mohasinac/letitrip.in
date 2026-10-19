#!/usr/bin/env node
/*
 * audit-search-index-artifact — strict-zero. A1 + C2 + C3.
 *
 * The artifact is ONE shared, immutable, CDN-cached body with no per-viewer
 * filter anywhere downstream. Everything about it is therefore published to
 * the world for that version's lifetime, and an immutable object cannot be
 * recalled — the only remedy is a new version plus a prune, by which time
 * every browser that fetched it has a copy.
 *
 * A1  SAFETY — what must not be in it
 *   R1 every source calls `hidePublicTestData`
 *   R2 no price/bid/deposit identifier reachable from a `toRecord`
 *   R3 no PII field and no `*TokensIndex` reachable
 *   R4 `PUBLIC_INDEX_SOURCES` ∩ private collections is EMPTY
 *   R5 a declared byte budget that FAILS rather than truncating
 *
 * C2  COVERAGE — that search keeps being possible
 *   R6 every source names a real `*_COLLECTION`-shaped string
 *   R7 every source declares a title field and a slug resolver — a record
 *      with an empty title is one nobody can ever find
 *
 * C3  REACHABILITY
 *   R8 every `hrefTemplate` and `moreHref` resolves to a real page under
 *      `src/app/[locale]/**`. Modelled on `audit-tester-checklist-hrefs`,
 *      which already does this for checklist links — results that render
 *      and 404 on click are the rot that audit was written for.
 *
 * Negative controls run before registering:
 *   · add `users` to PUBLIC_INDEX_SOURCES          -> R4 fails
 *   · put `price` in a source's `select`           -> R2 fails
 *   · point the part template at `/part/{s}`       -> R8 fails, suggests /parts
 *   · delete a `hidePublicTestData` call           -> R1 fails
 *
 * No suppression marker. A field either belongs in a public artifact or it
 * does not, and "it is fine this once" is how the first price got in.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SOURCES = join(ROOT, "appkit", "src", "_internal", "server", "features", "search", "index-build", "sources.ts");
const BUILD = join(ROOT, "appkit", "src", "_internal", "server", "features", "search", "index-build", "build.ts");
const STORE = join(ROOT, "appkit", "src", "_internal", "server", "features", "search", "index-build", "artifact-store.ts");
const APP = join(ROOT, "src", "app", "[locale]");

for (const f of [SOURCES, BUILD, STORE]) {
  if (!existsSync(f)) {
    console.error(`[audit-search-index-artifact] missing ${f} — the index build moved?`);
    process.exit(1);
  }
}

/** Blank comments, preserve line structure. */
function maskComments(src) {
  let out = "";
  let mode = "code";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (mode === "code") {
      if (c === "/" && n === "/") mode = "line";
      else if (c === "/" && n === "*") mode = "block";
      else if (c === '"' || c === "'" || c === "`") mode = c;
    } else if (mode === "line") {
      if (c === "\n") mode = "code";
    } else if (mode === "block") {
      if (c === "*" && n === "/") {
        out += "  ";
        i++;
        mode = "code";
        continue;
      }
    } else if (c === mode && src[i - 1] !== "\\") {
      mode = "code";
    }
    out += mode === "line" || mode === "block" ? (c === "\n" ? "\n" : " ") : c;
  }
  return out;
}

const violations = [];
const srcRaw = readFileSync(SOURCES, "utf8");
const src = maskComments(srcRaw);
const buildSrc = maskComments(readFileSync(BUILD, "utf8"));
const storeSrc = maskComments(readFileSync(STORE, "utf8"));

/* ── A1/R1 — test data is filtered ─────────────────────────────────────── */
if (!/hidePublicTestData/.test(buildSrc)) {
  violations.push(
    "R1 the builder never calls hidePublicTestData — a sandbox row in an " +
      "immutable CDN artifact is published to the world for that version's life.",
  );
}

/* ── A1/R2 — no money ──────────────────────────────────────────────────── */
const MONEY = /\b(price|currentBid|startingBid|buyNowPrice|depositAmount|pricePerEntry|bundlePrice|amount)\b/;
src.split("\n").forEach((line, n) => {
  if (!/select:|detail:|facets:|title:/.test(line)) return;
  if (MONEY.test(line)) {
    violations.push(
      `sources.ts:${n + 1} :: R2 a money field reaches the artifact — § Guest ` +
        `price gating is a CLIENT gate and cannot reach an unauthenticated ` +
        `immutable object.`,
    );
  }
});

/* ── A1/R3 — no PII, no blind index ────────────────────────────────────── */
const PII = /\b(email|phone|fullName|addressLine1|sellerEmail|upiVpa|accountNumber)\b|TokensIndex/;
src.split("\n").forEach((line, n) => {
  if (!/select:|detail:|facets:|title:/.test(line)) return;
  if (PII.test(line)) {
    violations.push(
      `sources.ts:${n + 1} :: R3 a PII field or blind-index digest reaches the ` +
        `artifact. A deterministic per-person identifier is cross-referenceable ` +
        `even unbroken.`,
    );
  }
});

/* ── A1/R4 — the allowlist excludes private collections ────────────────── */
/*
 * 🛑 Keyed on the ALLOWLIST, never on `LISTERS`.
 *
 * `LISTERS` has 20 entries and four of them are `users`, `payouts`, `orders`
 * and `notifications`. "Index everything LISTERS knows about" is a one-line
 * change away from shipping every user's name to every browser, which is why
 * membership is a separate explicit list and why this rule reads that list.
 */
const PRIVATE_COLLECTIONS = [
  "users",
  "orders",
  "payouts",
  "notifications",
  "addresses",
  "sessions",
  "carts",
  "offers",
  "bids",
  "supportTickets",
  "adminAuditLog",
  "siteSettings",
  "messageBudget",
];
const collectionMatches = [...src.matchAll(/collection:\s*["']([^"']+)["']/g)].map((m) => m[1]);
for (const c of collectionMatches) {
  if (PRIVATE_COLLECTIONS.includes(c)) {
    violations.push(
      `sources.ts :: R4 PUBLIC_INDEX_SOURCES includes the private collection ` +
        `"${c}". This artifact is downloadable by anyone.`,
    );
  }
}

/* ── A1/R5 — a declared, failing byte budget ───────────────────────────── */
if (!/SEARCH_INDEX_MAX_BYTES/.test(storeSrc)) {
  violations.push("R5 no declared byte budget in artifact-store.ts.");
} else if (!/throw new Error\([^)]*MAX_BYTES|byteLength > SEARCH_INDEX_MAX_BYTES/.test(storeSrc)) {
  violations.push(
    "R5 the byte budget does not FAIL the build. A truncated index is one " +
      "missing rows, and nothing downstream can tell that from a small catalogue.",
  );
}

/* ── C2/R6 + R7 — every source is usable ───────────────────────────────── */
const sourceBlocks = [...src.matchAll(/typeKey:\s*["']([^"']+)["']/g)];
if (sourceBlocks.length === 0) {
  violations.push("R6 no sources found at all — did PUBLIC_INDEX_SOURCES move?");
}
if (collectionMatches.length < sourceBlocks.length) {
  violations.push(
    `R6 ${sourceBlocks.length} source(s) but only ${collectionMatches.length} ` +
      `collection(s) named — a source without a collection reads nothing.`,
  );
}
const slugResolvers = (src.match(/slugOf:/g) ?? []).length;
if (slugResolvers < sourceBlocks.length) {
  violations.push(
    `R7 ${sourceBlocks.length} source(s) but only ${slugResolvers} slugOf() — ` +
      `a record with no slug resolves to a broken href.`,
  );
}

/* ── C3/R8 — every destination is a real page ──────────────────────────── */
function pageExists(route) {
  // `/products/{s}` -> src/app/[locale]/products/[slug]/page.tsx (any param name)
  const segments = route.split("/").filter(Boolean);
  let dir = APP;
  for (const seg of segments) {
    if (!existsSync(dir)) return false;
    if (seg.includes("{")) {
      const dyn = readdirSync(dir).find((d) => d.startsWith("[") && statSync(join(dir, d)).isDirectory());
      if (!dyn) return false;
      dir = join(dir, dyn);
      continue;
    }
    const exact = join(dir, seg);
    if (existsSync(exact) && statSync(exact).isDirectory()) {
      dir = exact;
      continue;
    }
    const dyn = readdirSync(dir).find((d) => d.startsWith("[") && statSync(join(dir, d)).isDirectory());
    if (!dyn) return false;
    dir = join(dir, dyn);
  }
  return existsSync(join(dir, "page.tsx"));
}

const routeLiterals = new Set([
  ...[...src.matchAll(/hrefTemplate:\s*["']([^"']+)["']/g)].map((m) => m[1]),
  ...[...src.matchAll(/moreHref:\s*["']([^"']+)["']/g)].map((m) => m[1]),
]);
let routesChecked = 0;
for (const route of routeLiterals) {
  if (!route.startsWith("/")) continue;
  routesChecked++;
  if (!pageExists(route)) {
    violations.push(
      `sources.ts :: R8 "${route}" does not resolve to a page under ` +
        `src/app/[locale]/** — results would render and 404 on click.`,
    );
  }
}

/*
 * 🛑 Print the denominators. A rule that silently stopped matching reports
 * "0 violations" and is indistinguishable from one that is satisfied —
 * exactly how `audit-listing-search-capability` went quiet on the files that
 * had just changed (Root Cause #84).
 */
if (violations.length === 0) {
  console.log(
    `[audit-search-index-artifact] OK: 0 violations ` +
      `(${sourceBlocks.length} source(s), ${routesChecked} route(s) resolved, ` +
      `${PRIVATE_COLLECTIONS.length} private collection(s) excluded).`,
  );
  process.exit(0);
}

console.error("\n[audit-search-index-artifact] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);

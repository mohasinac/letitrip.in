#!/usr/bin/env node
/*
 * Generate the fixture reference the step-authoring skill is allowed to cite.
 *
 * Usage (from the consumer repo root):
 *   node tester/scripts/build-fixture-reference.mjs
 *   node tester/scripts/build-fixture-reference.mjs --out <path>
 *
 * Exit: 0 success, 1 errors during run, 2 misconfiguration.
 *
 * 🛑 WHY THIS EXISTS
 *
 * Authored steps must carry LITERAL values — "Enter 780. The listed price is
 * 999." — because "enter an amount below the listed price" produces a different
 * test every run, by every tester, and two runs cannot be diffed.
 *
 * But a literal value invented from memory is worse than a vague one: it sends a
 * tester to select a category that does not exist, and the case then fails for a
 * reason that is not a bug. That is the checklist's stale-`href` failure (Root
 * Cause #32) moved one field over.
 *
 * So the authoring skill may cite ONLY what appears in this file, and this file
 * is derived from the seed modules rather than hand-kept — a hand-kept list is
 * exactly the thing that drifts.
 *
 * Reads the TypeScript seed sources directly with regexes rather than importing
 * the compiled dist: the dist lags source until appkit is rebuilt (Root Cause
 * #28), and a reference built from a stale dist would quietly authorise values
 * that no longer exist.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { flag } from "./lib/firestore.mjs";

const REPO_ROOT = process.cwd();
const OUT = String(flag("out", "tester/.tester-runs/fixture-reference.md"));
const SEED = resolve(REPO_ROOT, "appkit/src/seed");
const TESTER_SEED = resolve(REPO_ROOT, "appkit/src/features/tester/seed-data");

if (!existsSync(SEED)) {
  console.error(`✗ Seed directory not found at ${SEED}`);
  process.exit(2);
}

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/**
 * Recurses on purpose. The category tree lives in `seed/_helpers/category-forest.ts`
 * — 47 of the 58 categories — so a flat readdir found 11 and silently authorised
 * a fifth of the taxonomy. A reference that is quietly incomplete pushes the
 * author back to inventing values, which is the failure this file exists to stop.
 */
function readSeedFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...readSeedFiles(full));
    else if (entry.name.endsWith(".ts")) out.push({ file: entry.name, src: stripComments(readFileSync(full, "utf8")) });
  }
  return out;
}

const files = [...readSeedFiles(SEED), ...readSeedFiles(TESTER_SEED)];

/**
 * Pull `field: "value"` out of the object that also declares `id: "<id>"`.
 *
 * Deliberately crude: the seed is 30+ files of nested literals and a real parse
 * would need the TS compiler in the loop. A regex that occasionally misses a
 * field is fine — a MISSING entry just means the authoring skill cannot cite
 * that value, which fails closed. A wrong entry would fail open, so nothing
 * here infers or defaults anything it did not literally read.
 */
function collect(idPrefixes, fields) {
  const prefixes = Array.isArray(idPrefixes) ? idPrefixes : [idPrefixes];
  const alt = prefixes.join("|");
  const out = new Map();

  for (const { src } of files) {
    // Every `id: "..."` in the file, in order. A record's body is then everything
    // up to the NEXT id — which works for both a one-line
    // `{ id: "x", name: "y", tier: 0 }` and a 40-line product literal, without
    // trying to brace-match TypeScript with a regex.
    const anchors = [...src.matchAll(/\bid:\s*"([^"]+)"/g)];
    anchors.forEach((m, i) => {
      const id = m[1];
      if (!new RegExp(`^(${alt})`).test(id)) return;
      if (out.has(id)) return;
      const start = m.index ?? 0;
      const end = i + 1 < anchors.length ? anchors[i + 1].index : Math.min(src.length, start + 2000);
      const body = src.slice(start, end);

      const row = { id };
      for (const f of fields) {
        const fm = body.match(new RegExp(`\\b${f}:\\s*("([^"]*)"|[0-9_.]+|true|false)`));
        if (fm) row[f] = (fm[2] ?? fm[1]).replace(/_/g, "");
      }
      out.set(id, row);
    });
  }
  // Some fixtures build their id from a template literal inside a loop, e.g.
  // `auction-tester-sandbox-cycle-${i + 1}`. Those never match a double-quoted
  // scan, so the whole family was invisible — including the three staggered
  // auctions the money-flows reference cases already cite. Emitted as a FAMILY
  // row rather than guessed concrete ids: the loop bound is not knowable from a
  // regex, and inventing `-1..-3` would be exactly the fabricated-value problem
  // this file exists to prevent. `audit-tester-checklist-hrefs.mjs` treats these
  // the same way, matching by pattern instead of by literal.
  for (const { src } of files) {
    for (const m of src.matchAll(/\bid:\s*`([^`]*\$\{[^`]*)`/g)) {
      const tpl = m[1];
      if (!new RegExp(`^(${alt})`).test(tpl)) continue;
      const family = tpl.replace(/\$\{[^}]*\}/g, "N");
      if (out.has(family)) continue;
      out.set(family, { id: family, title: "(generated family — N is the loop index, 1-based)" });
    }
  }

  return [...out.values()].sort((a, b) => a.id.localeCompare(b.id));
}

const table = (rows, cols) => {
  if (!rows.length) return "_none found_\n";
  const head = `| ${cols.join(" | ")} |\n| ${cols.map(() => "---").join(" | ")} |\n`;
  const body = rows
    .map((r) => `| ${cols.map((c) => String(r[c] ?? "—").slice(0, 60)).join(" | ")} |`)
    .join("\n");
  return head + body + "\n";
};

/* ── Personas ─────────────────────────────────────────────────────────────
 * Which seller matters. "The owning seller" and "some other seller" see
 * different things on the same listing, so a case saying only "a seller" is
 * ambiguous in precisely the way the contract exists to prevent. */
const usersSrc = files.find((f) => f.file === "users-seed-data.ts")?.src ?? "";
const personas = [];
// Anchor-to-next-anchor, same as collect(). A fixed-size lookahead window
// dropped 9 of 21 accounts — including the admin, the store-owning seller and
// the bot, i.e. precisely the personas a role-scoped case needs to name.
const userAnchors = [...usersSrc.matchAll(/\buid:\s*"([^"]+)"/g)];
for (const [i, m] of userAnchors.entries()) {
  const uid = m[1];
  const start = m.index ?? 0;
  const end = i + 1 < userAnchors.length ? userAnchors[i + 1].index : usersSrc.length;
  const body = usersSrc.slice(start, end);
  const g = (f) => body.match(new RegExp(`\\b${f}:\\s*("([^"]*)"|true|false)`))?.[2] ?? null;
  const email = g("email");
  if (!email) continue;
  personas.push({
    uid,
    email,
    role: body.match(/ROLE_VALUES\.(\w+)/)?.[1]?.toLowerCase() ?? g("role") ?? "user",
    storeId: g("storeId") ?? "—",
    flags: [
      /isTester:\s*true/.test(body) ? "isTester" : null,
      /canTestAdmin:\s*true/.test(body) ? "canTestAdmin" : null,
      /isBot:\s*true/.test(body) ? "isBot" : null,
      g("permissionGroup"),
    ].filter(Boolean).join(" ") || "—",
  });
}

// Every non-auction listing prefix — a listing type is identified by its id prefix
// (Slug Prefix System), so collecting only "product-" missed art, stickers,
// classifieds, digital codes, live items, pre-orders and prize draws entirely.
const products = collect(["product-", "preorder-", "prizedraw-", "classified-", "digitalcode-", "live-", "art-", "sticker-"], ["title", "price", "status", "listingType", "storeId", "stockQuantity"]);
const auctions = collect(["auction-"], ["title", "startingBid", "currentBid", "buyNowPrice", "storeId"]);
const offers = collect(["offer-"], ["productId", "listedPrice", "offerAmount", "lockedPrice", "status"]);
const events = collect(["event-"], ["title", "type", "status"]);
const categories = collect(["category-"], ["name", "categoryType"]);
/**
 * Bundles are `categories` rows discriminated by `categoryType:"bundle"`, and they
 * carry a `bundle-` id prefix rather than `category-` — so collecting only
 * `category-` missed every one of them. Found by the pilot page: the author cited
 * `bundle-tester-sandbox` correctly, having read it off the real page, and the
 * reference could not authorise it. A reference that is quietly incomplete pushes
 * the author back to citing from memory, which is the failure it exists to stop.
 */
const bundles = collect(["bundle-"], ["name", "bundlePrice", "bundleOriginalTotal"]);
const brands = collect(["brand-"], ["name"]);
const coupons = collect(["coupon-"], ["code", "type"]);
const stores = collect(["store-"], ["storeName", "ownerId", "status"]);

const md = `# Fixture reference — the ONLY values an authored step may cite

> Generated by \`node tester/scripts/build-fixture-reference.mjs\` from the seed
> sources. Do not edit by hand; re-run it after changing seed data.

🛑 **A step may name only ids and values that appear below.** A value invented
from memory sends a tester to select something that does not exist, and the case
then fails for a reason that is not a bug — the stale-\`href\` failure (Root Cause
#32) one field over.

If a case needs a fixture that is not here, that is a **seed gap**: add the
fixture (Workstream 3 of the plan), re-run this script, then author the case.
Do not soften the case to fit what happens to exist.

## Personas — who a \`role\` resolves to

${table(personas, ["uid", "email", "role", "storeId", "flags"])}
**Every seeded account's password is \`TempPass123!\`** — \`seed-cli\` sets it when it
CREATES the Auth record. So a sign-in step can and should be written in full:
*"Sign in as rehan.sheikh@gmail.com / TempPass123!"*. An author flagged a case
\`needsReview\` purely because a password was not listed here; that is a gap in this
file, not in the case.

🛑 It is only true for accounts the seed created. A real signup, or an account whose
password was later changed, keeps its own — and \`seed-cli\` never resets an existing
one.

**\`seller\` means the OWNER of the listing under test.** A different seller
looking at someone else's listing behaves as a buyer for that case.

## Products (${products.length})

${table(products, ["id", "title", "price", "listingType", "storeId", "status"])}

## Auctions (${auctions.length}) — cite the starting bid and increment, not "above the minimum"

${table(auctions, ["id", "title", "startingBid", "currentBid", "buyNowPrice"])}

## Offers (${offers.length}) — listed vs agreed price is the whole point of these

${table(offers, ["id", "productId", "listedPrice", "offerAmount", "lockedPrice", "status"])}

## Events (${events.length})

${table(events, ["id", "title", "type", "status"])}

## Stores (${stores.length})

${table(stores, ["id", "storeName", "ownerId", "status"])}

## Categories (${categories.length})

${table(categories, ["id", "name", "categoryType"])}

## Bundles (${bundles.length}) — priced, all-or-nothing; NOT a listingType

${table(bundles, ["id", "name", "bundlePrice", "bundleOriginalTotal"])}
A bundle is a \`categories\` row with \`categoryType:"bundle"\`. A buyer cannot pick
members — that is a **product group** or a **grouped listing**, which are different
things with different pages. Cite the right one.

## Brands (${brands.length})

${table(brands, ["id", "name"])}

## Coupons (${coupons.length})

${table(coupons, ["id", "code", "type"])}

## Naming for records a case CREATES

Use \`QA <Thing> <case-key>\` — e.g. \`QA Address buying-checkout-cod\`. That makes a
created row traceable to the case that made it, greppable, and cleanable. A case
that then edits the record states the before and after values explicitly, so
"did the save persist" is checked against a known string rather than a vibe.

🛑 **Use the bare case key, not the page-qualified one, and rename around a
listing-type prefix.** R7 of \`audit-tester-plugin-wiring\` reads
\`product-…\` / \`auction-…\` / \`live-…\` / \`classified-…\` / \`digitalcode-…\` /
\`preorder-…\` / \`prizedraw-…\` / \`art-…\` / \`sticker-…\` / \`category-…\` / \`brand-…\` /
\`bundle-…\` / \`offer-…\` / \`event-…\` / \`store-…\` / \`coupon-…\` / \`group-…\` as a
FIXTURE CITATION wherever it appears in a step, including inside a name you are
telling the tester to type. So \`QA Address product-detail-bundle-purchase\` and
\`QA Live live-item-video-mandatory\` both fail the audit as unknown ids. Write
\`QA Address bundle-purchase\` and \`QA Live Item video-mandatory\` instead — the
rule is doing its job, and renaming the record is cheaper than weakening it.
`;

const outPath = resolve(REPO_ROOT, OUT);
writeFileSync(outPath, md);
console.log(
  `✓ Wrote ${OUT} — ${personas.length} personas, ${products.length} products, ` +
    `${auctions.length} auctions, ${offers.length} offers, ${events.length} events, ` +
    `${stores.length} stores, ${categories.length} categories, ${bundles.length} bundles, ${coupons.length} coupons.`,
);
process.exit(0);

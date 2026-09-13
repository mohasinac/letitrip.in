#!/usr/bin/env node
/**
 * audit-guest-price-leak.mjs — money amounts stay behind the sign-in gate.
 *
 * Prices, current bids, deposits and per-entry amounts are hidden from
 * signed-out visitors so the catalogue cannot be read at scale without an
 * account. The render gate is `<GatedPrice>` / `<PricesOnly>` / `useCanSeePrices`
 * (appkit/src/ui/components/GatedPrice.tsx).
 *
 * A client-side gate reaches the rendered page and NOTHING else, which is what
 * the three rules below are about — each covers a surface the gate cannot see:
 *
 *   R1  OG_IMAGE_MONEY
 *       An OG image is a public image URL with the amount burned into the
 *       pixels. No session reaches it, no paywall markup describes it, and
 *       anyone can fetch it directly. Eight og.tsx files rendered a ₹ amount
 *       before 2026-09-14.
 *
 *   R2  UNGATED_PUBLIC_PRICE
 *       A public listing/detail component formatting money outside the gate.
 *       `formatCurrency` itself is NOT gated on purpose — admin, seller, cart,
 *       checkout and order surfaces use it legitimately and are signed-in by
 *       definition — so the rule is scoped to public surfaces instead.
 *
 *   R3  OFFERS_PRICE_WITHOUT_PAYWALL_MARKUP
 *       The JSON-LD deliberately KEEPS `offers.price` so search engines still
 *       see it. Googlebot crawls signed out, so it renders the gated page while
 *       the markup declares a real amount — and Google requires marked-up
 *       content to be visible to the user. `gatedPriceWebPageJsonLd()` declares
 *       that gap (`isAccessibleForFree: false` + a `cssSelector`). Emitting the
 *       offer WITHOUT it is an undeclared mismatch that can cost the rich
 *       result. This rule exists because that pairing is invisible at both
 *       ends: removing the WebPage node breaks nothing, types nothing, and
 *       renders identically.
 *
 *   R4  GATED_PRICE_SELECTOR_DRIFT
 *       `GATED_PRICE_CLASS` (the class the gate renders) and the selector the
 *       JSON-LD advertises are two literals in two files that MUST agree. They
 *       cannot import each other: `seo/` is reached from server-only metadata
 *       paths and must not pull in a `"use client"` module (Root Cause #76). A
 *       rename on either side silently points the crawler at a selector that
 *       matches nothing — which reads to Google exactly like the undeclared
 *       mismatch R3 exists to prevent, and to a human like nothing at all.
 *
 * Suppression: `// audit-guest-price-ok: <reason>` on the same line or the line
 * above. Reserve it for a surface that is genuinely signed-in-only.
 *
 * Strict zero.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SUPPRESS = "audit-guest-price-ok";

/**
 * Money-producing expressions — deliberately VALUE-BEARING only.
 *
 * A bare `₹` is a SYMBOL, not a disclosure: it is the prefix on a price-range
 * filter input (`currencyPrefix="₹"`), a form label ("Price per entry (₹)"),
 * and a badge glyph. Flagging those trains people to reach for the suppression
 * marker on lines that were never a leak, which is how a marker stops meaning
 * anything (Root Cause #22). So `₹` counts only when an interpolation or a
 * digit follows it.
 *
 * `Intl.NumberFormat` anchors on the constructor rather than also matching
 * `style: "currency"` on the next line, which would report one leak twice.
 *
 * 🛑 A TRAILING `₹` counts too. `PrizeRevealModal` renders
 *     Estimated value: ₹
 *     {winner.estimatedValue.toLocaleString("en-IN")}
 * across two lines, and a line-scoped "₹ then a value" rule sails straight past
 * it. That was a live false negative in this audit's first version — found by
 * re-reading what the refinement had silenced, not by the rule itself
 * (Root Cause #84: a rule going quiet is as likely to have stopped looking).
 */
const MONEY_RE = /formatCurrency\s*\(|₹\s*[{$\d]|₹\s*$|Intl\.NumberFormat\s*\(/;

/**
 * Public listing/detail surfaces. Deliberately a directory allow-list rather
 * than "everything that is not admin": a new admin view under a feature would
 * otherwise start failing this audit the day it is written, and training people
 * to reach for the suppression marker is how markers become noise
 * (Root Cause #22).
 */
const PUBLIC_DIRS = [
  "appkit/src/features/products/components",
  "appkit/src/features/auctions/components",
  "appkit/src/features/pre-orders/components",
  "appkit/src/features/classified/components",
  "appkit/src/features/digital-codes/components",
  "appkit/src/features/live/components",
  "appkit/src/features/categories/components",
  "appkit/src/features/homepage/components",
  "appkit/src/features/catalogue/components",
  "appkit/src/features/wishlist/components",
  "appkit/src/features/grouped/components",
];

/**
 * Files inside a public directory that are NOT public surfaces. Each names why,
 * so the list is reviewable rather than a dumping ground.
 */
const PUBLIC_DIR_EXCEPTIONS = new Map([
  ["AdminCatalogueApprovalsView.tsx", "admin approvals queue — staff only"],
  ["AuctionBidsTable.tsx", "rendered only by /user/bids, /admin/bids, /store/bids"],
  ["bid-detail-fields.ts", "consumed only by the three dashboard bids views"],
  ["BundleItemsPicker.tsx", "admin/seller bundle authoring control"],
  ["PrizeDrawItemsEditor.tsx", "seller prize-draw authoring form"],
  ["ProductForm.tsx", "seller listing authoring form"],
]);

const OG_GLOB_DIR = "appkit/src/_internal/server/features";

/** Where the gate's class and the JSON-LD's selector are declared. */
const GATE_CLASS_FILE = "appkit/src/ui/components/GatedPrice.tsx";
const JSON_LD_FILE = "appkit/src/seo/json-ld.ts";

/** Pages that emit `offers.price` must also emit the paywall markup. */
const PAYWALL_MARKUP_FN = "gatedPriceWebPageJsonLd";
const OFFER_EMITTERS = ["productJsonLd", "auctionJsonLd"];
const PAGE_SCAN_DIR = "src/app";

const violations = [];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "dist") continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

function makeSuppressor(rawLines) {
  return (idx) =>
    (rawLines[idx] ?? "").includes(SUPPRESS) ||
    (rawLines[idx - 1] ?? "").includes(SUPPRESS);
}

function rel(p) {
  return relative(ROOT, p).split(sep).join("/");
}

// ── R1 — no money in any OG image ────────────────────────────────────────────
for (const file of walk(join(ROOT, OG_GLOB_DIR))) {
  if (!file.endsWith("og.tsx")) continue;
  const raw = readFileSync(file, "utf8");
  const lines = raw.split(/\r?\n/);
  const scan = stripComments(raw).split(/\r?\n/);
  const suppressed = makeSuppressor(lines);
  scan.forEach((line, i) => {
    if (!MONEY_RE.test(line)) return;
    if (suppressed(i)) return;
    violations.push({
      file: rel(file),
      line: i + 1,
      rule: "OG_IMAGE_MONEY",
      snippet: lines[i].trim().slice(0, 110),
      hint:
        "An OG image is a PUBLIC image URL with the amount burned into the pixels —\n" +
        "      no sign-in gate reaches it and no paywall markup describes it.\n" +
        "      Use a non-money accent; the auction and pre-order OGs use the end date\n" +
        "      and release date respectively.",
    });
  });
}

// ── R2 — public surfaces format money only through the gate ──────────────────
for (const dir of PUBLIC_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const base = file.split(sep).pop();
    if (PUBLIC_DIR_EXCEPTIONS.has(base)) continue;
    const raw = readFileSync(file, "utf8");
    // A file that consults the gate at all is trusted to have applied it — the
    // alternative is matching JSX nesting with a regex, which is exactly the
    // false-negative shape Root Cause #29 documents.
    if (/GatedPrice|PricesOnly|useCanSeePrices/.test(raw)) continue;
    const lines = raw.split(/\r?\n/);
    const scan = stripComments(raw).split(/\r?\n/);
    const suppressed = makeSuppressor(lines);
    scan.forEach((line, i) => {
      if (!MONEY_RE.test(line)) return;
      if (/^\s*import\s/.test(line)) return;
      if (suppressed(i)) return;
      violations.push({
        file: rel(file),
        line: i + 1,
        rule: "UNGATED_PUBLIC_PRICE",
        snippet: lines[i].trim().slice(0, 110),
        hint:
          "Public surface rendering money with no sign-in gate anywhere in the file.\n" +
          "      Wrap the amount in <GatedPrice>, or <PricesOnly> for a secondary\n" +
          "      detail beside an already-gated primary amount. For a plain string\n" +
          "      prop (a bottom-bar infoLabel, an OG caption) use useCanSeePrices().",
      });
    });
  }
}

// ── R3 — offers.price must be paired with the paywall markup ─────────────────
for (const file of walk(join(ROOT, PAGE_SCAN_DIR))) {
  const raw = readFileSync(file, "utf8");
  const src = stripComments(raw);
  const emitter = OFFER_EMITTERS.find((fn) => new RegExp(`\\b${fn}\\s*\\(`).test(src));
  if (!emitter) continue;
  // A CALL, not a mention. Matching the bare name let a leftover `import
  // { gatedPriceWebPageJsonLd }` satisfy this rule with the markup itself
  // deleted — the audit passed on precisely the state it exists to catch
  // (Root Cause #92: a check a name satisfies is decoration).
  if (new RegExp(`\\b${PAYWALL_MARKUP_FN}\\s*\\(`).test(src)) continue;
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((l) => new RegExp(`\\b${emitter}\\s*\\(`).test(l));
  const suppressed = makeSuppressor(lines);
  if (idx >= 0 && suppressed(idx)) continue;
  violations.push({
    file: rel(file),
    line: idx + 1,
    rule: "OFFERS_PRICE_WITHOUT_PAYWALL_MARKUP",
    snippet: `${emitter}(…) with no ${PAYWALL_MARKUP_FN}(…)`,
    hint:
      "This page emits offers.price, but the price is gated for signed-out visitors\n" +
      "      and Googlebot crawls signed out. Without the paywall markup that is an\n" +
      `      undeclared structured-data mismatch. Emit ${PAYWALL_MARKUP_FN}(path)\n` +
      "      in the same <script type=\"application/ld+json\"> block.",
  });
}

// ── R4 — the gate's class and the JSON-LD selector must agree ────────────────
{
  const gateSrc = readFileSync(join(ROOT, GATE_CLASS_FILE), "utf8");
  const ldSrc = readFileSync(join(ROOT, JSON_LD_FILE), "utf8");
  const gateClass = gateSrc.match(/GATED_PRICE_CLASS\s*=\s*"([^"]+)"/)?.[1];
  const ldSelector = ldSrc.match(/GATED_PRICE_SELECTOR\s*=\s*"\.([^"]+)"/)?.[1];
  if (!gateClass || !ldSelector) {
    violations.push({
      file: rel(join(ROOT, GATE_CLASS_FILE)),
      line: 1,
      rule: "GATED_PRICE_SELECTOR_DRIFT",
      snippet: `GATED_PRICE_CLASS=${gateClass ?? "NOT FOUND"} GATED_PRICE_SELECTOR=${ldSelector ? `.${ldSelector}` : "NOT FOUND"}`,
      hint:
        "One of the two literals could not be read, so the audit cannot prove they\n" +
        "      agree. Never let this check pass by being unable to look.",
    });
  } else if (gateClass !== ldSelector) {
    violations.push({
      file: rel(join(ROOT, JSON_LD_FILE)),
      line: ldSrc.split(/\r?\n/).findIndex((l) => l.includes("GATED_PRICE_SELECTOR")) + 1,
      rule: "GATED_PRICE_SELECTOR_DRIFT",
      snippet: `gate renders ".${gateClass}", JSON-LD advertises ".${ldSelector}"`,
      hint:
        "The paywall markup's cssSelector must match the class <GatedPrice> renders,\n" +
        "      or it points the crawler at nothing — indistinguishable from having no\n" +
        "      declaration at all.",
    });
  }
}

violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (violations.length > 0) {
  console.error(`[audit-guest-price-leak] FAIL: ${violations.length} violation(s).\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
    console.error(`      ${v.snippet}`);
    console.error(`      ${v.hint}\n`);
  }
  console.error(`  Suppress a genuinely signed-in-only surface with: // ${SUPPRESS}: <reason>`);
  process.exit(1);
}

console.log(
  `[audit-guest-price-leak] OK: 0 violations (${PUBLIC_DIRS.length} public dirs, OG images, offer pages, selector parity).`,
);

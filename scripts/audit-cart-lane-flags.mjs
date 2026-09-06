#!/usr/bin/env node
/**
 * audit-cart-lane-flags.mjs — strict-zero.
 *
 * 🛑 A LOCKED CART LINE MUST CARRY THE FLAG ITS LANE IS DERIVED FROM.
 *
 * `laneOf()` (appkit/src/_internal/shared/checkout/lanes.ts) reads exactly two
 * things:
 *
 *     if (item.isAuctionWin || item.bidId) return AUCTION;
 *     if (item.isOffer      || item.offerId) return OFFER;
 *     return STANDARD;
 *
 * It does NOT read `listingType`, and it does NOT read `locked`. So a seeded cart
 * line written as `{ listingType: "auction", locked: true }` — which reads to a
 * human as unmistakably a won auction — lands in the STANDARD lane.
 *
 * What that costs, all silently:
 *   · the cart's "Won Auctions" tab is empty while the win plainly exists;
 *   · a non-removable line sits in the ordinary cart, inflating its total and
 *     refusing to be deleted, with no explanation available to the buyer;
 *   · `assertCheckoutLane()` never blocks anything, because the lane it is
 *     protecting is empty.
 *
 * Found by the Claude tester 2026-09-06 on `checklist-buying-bidding-win-auction`
 * — "Pay now" led to a checkout showing ₹0.00 and no line items. Nothing errored;
 * the fixture simply described a state the lane model does not recognise.
 *
 * Scope: seed data only. Runtime write paths set these flags in code that the
 * type system already checks; a seed literal is where the omission hides, because
 * `CartItemDocument` marks every one of these fields optional.
 *
 * Suppression: `// audit-cart-lane-ok: <reason>` on the line or the one above —
 * for a locked line that genuinely belongs to the standard lane.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SEED_DIRS = [
  join(ROOT, "appkit", "src", "seed"),
  join(ROOT, "appkit", "src", "features", "tester", "seed-data"),
];

const violations = [];

/** Walk the object literal that starts at `openIdx` and return its source span. */
function objectSpan(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return src.slice(openIdx, i + 1);
    }
  }
  return src.slice(openIdx);
}

function checkFile(file) {
  const src = readFileSync(file, "utf8");
  if (!src.includes("locked:")) return;

  const rel = relative(ROOT, file).replace(/\\/g, "/");

  /*
   * Anchor on `itemId:` — every cart line literal in the seed opens with it, and
   * it is the only key unique to a cart item. Anchoring on `locked:` instead
   * would also match offer/lottery shapes that have nothing to do with a lane.
   */
  for (const m of src.matchAll(/\bitemId:\s*"([^"]+)"/g)) {
    let open = src.lastIndexOf("{", m.index);
    if (open < 0) continue;
    const span = objectSpan(src, open);
    if (!/\blocked:\s*true/.test(span)) continue;

    const line = src.slice(0, m.index).split("\n").length;
    const context = src.split("\n").slice(Math.max(0, line - 3), line + 12).join("\n");
    if (/audit-cart-lane-ok:/.test(context)) continue;

    const hasAuction = /\bisAuctionWin:\s*true/.test(span) || /\bbidId:\s*"/.test(span);
    const hasOffer = /\bisOffer:\s*true/.test(span) || /\boffefId:\s*"/.test(span) || /\bofferId:\s*"/.test(span);
    if (hasAuction || hasOffer) continue;

    const looksAuction = /listingType:\s*"auction"/.test(span) || /auction/i.test(m[1]);
    violations.push(
      `${rel}:${line}  locked line "${m[1]}" carries neither isAuctionWin/bidId nor isOffer/offerId — ` +
        `laneOf() puts it in the STANDARD lane` +
        (looksAuction ? ", though it reads as a won auction" : "") +
        `. The Won Auctions/Offers tab will be empty while an unremovable line sits in the ordinary cart.`,
    );
  }
}

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && e.name.endsWith(".ts")) checkFile(p);
  }
}

for (const d of SEED_DIRS) walk(d);

/*
 * Emptiness check. This rule matches a shape in another file's formatting, which
 * is precisely the kind that goes inert unnoticed — if the anchor stops matching,
 * the audit passes forever and says nothing.
 */
let anchors = 0;
for (const d of SEED_DIRS) {
  const stack = [d];
  while (stack.length) {
    const cur = stack.pop();
    if (!existsSync(cur)) continue;
    for (const e of readdirSync(cur, { withFileTypes: true })) {
      const p = join(cur, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile() && e.name.endsWith(".ts")) {
        anchors += (readFileSync(p, "utf8").match(/\bitemId:\s*"/g) ?? []).length;
      }
    }
  }
}
if (anchors === 0) {
  violations.push(
    "audit-cart-lane-flags found no cart-line literals at all — the anchor no longer matches, " +
      "so this rule is checking nothing. Fix the rule before trusting it.",
  );
}

if (violations.length) {
  console.error(`\naudit-cart-lane-flags: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  ✗ ${v}`);
  console.error("");
  console.error("  laneOf() reads isAuctionWin/bidId and isOffer/offerId only — never listingType,");
  console.error("  never locked. Set the flag that names the lane, or mark the line");
  console.error("  // audit-cart-lane-ok: <reason> if it genuinely belongs in the standard lane.\n");
  process.exit(1);
}

console.log(`audit-cart-lane-flags: clean ✓ (${anchors} cart line(s) checked)`);
process.exit(0);

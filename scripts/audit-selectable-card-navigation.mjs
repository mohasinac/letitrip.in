#!/usr/bin/env node
/**
 * audit-selectable-card-navigation.mjs — catches the "a selection callback
 * being merely wired silently disables primary navigation" bug class.
 *
 * Root-caused 2026-08-20: `InteractiveProductCard.tsx`'s `onSelect` branch
 * rendered `<ProductCard>` WITHOUT forwarding the `href` prop at all — so any
 * card that supports bulk-selection (a checkbox that appears on hover /
 * long-press) lost ALL click/tap navigation the instant a selection callback
 * was merely *wired* (regardless of whether anything was actually selected).
 * `ProductCard`'s own `if (href && !selectionMode) return <Link>...` logic
 * only wraps in a Link when nothing is actively selected — so `href` needs
 * to reach it unconditionally, gated only on active selection, never on
 * whether `onSelect` is present at all. See CLAUDE.md's Recurrent Root Cause
 * Patterns for the full writeup.
 *
 * The correct pattern, found consistently across every other card in the
 * `BaseListingCard.Checkbox` family: the checkbox is the ONLY thing gated on
 * `onSelect` (`{onSelect && (<BaseListingCard.Checkbox .../>)}`) — the
 * navigation target (a `<Link>`/`<TextLink href=...>` or an
 * `onClick`-driven `router.push`/`window.location` handler) is wired
 * unconditionally, sitting entirely outside that conditional block. The one
 * exception is `InteractiveProductCard.tsx` itself, which branches its whole
 * return value on `onSelect` (delegates to `<ProductCard selectionMode>` so
 * ITS OWN internal checkbox/long-press wiring can run) — for that file the
 * check is inverted: the nav prop must still be forwarded INSIDE the branch.
 *
 * Method: no TypeScript compiler in the loop — matches this project's
 * existing regex/text-extraction audit convention (see
 * audit-filter-tab-enums.mjs and audit-list-serializer-parity.mjs for
 * precedent). Each REGISTRY entry names a literal `guardMarker` locating the
 * selection-conditional's opening bracket; this script walks a bracket-depth
 * stack (string/comment aware) to find its matching close, then checks
 * whether a literal `navMarker` string appears inside vs. outside that span,
 * per the entry's `mode`. `derivation-independent` mode (DataTable's
 * SelectableRow, AdminViewCards' AdminCardItem) instead extracts the
 * standalone `const handleClick = ...;` statement and asserts it contains
 * none of the given `forbiddenTokens` — proving the nav-vs-select decision
 * never reads the selection-toggle prop at all.
 *
 * Strict zero — any violation blocks. No suppression marker exists for this
 * audit: every registered card is a small component where the fix is always
 * a direct, non-negotiable prop-forwarding correction, not an irreducible
 * architectural escape. If a genuinely new card shape needs a different
 * check shape, extend this script's `mode` handling — don't bypass it.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @typedef {{
 *   name: string,
 *   file: string,
 *   mode: "guard-excludes-nav" | "guard-includes-nav" | "derivation-independent",
 *   guardMarker?: string,
 *   navMarker?: string,
 *   derivationMarker?: string,
 *   forbiddenTokens?: string[],
 * }} RegistryEntry
 */

/** @type {RegistryEntry[]} */
const REGISTRY = [
  // The originally-fixed component. Branches its whole return on `onSelect`
  // (delegates to ProductCard's own selectionMode/checkbox wiring) — so the
  // check here is inverted: `href` must be forwarded INSIDE the branch, not
  // just in the plain-Link else-branch.
  {
    name: "InteractiveProductCard",
    file: "appkit/src/features/products/components/InteractiveProductCard.tsx",
    mode: "guard-includes-nav",
    guardMarker: "if (onSelect) {",
    navMarker: "href={href}",
  },
  // Reference-correct pattern this whole audit is modeled on: checkbox is
  // the only thing gated on onSelect; the outer <Link href> always wraps.
  {
    name: "InteractiveStoreCard",
    file: "appkit/src/features/stores/components/InteractiveStoreCard.tsx",
    mode: "guard-excludes-nav",
    guardMarker: "{onSelect && (",
    navMarker: "href={href}",
  },
  {
    name: "EventCard",
    file: "appkit/src/features/events/components/EventCard.tsx",
    mode: "guard-excludes-nav",
    guardMarker: "{onSelect && (",
    navMarker: "href={detailHref}",
  },
  {
    name: "MarketplaceBundleCard",
    file: "appkit/src/features/products/components/MarketplaceBundleCard.tsx",
    mode: "guard-excludes-nav",
    guardMarker: "{onSelect && (",
    navMarker: "href={String(detailHref)}",
  },
  {
    name: "MarketplacePreorderCard",
    file: "appkit/src/features/pre-orders/components/MarketplacePreorderCard.tsx",
    mode: "guard-excludes-nav",
    guardMarker: "{onSelect && (",
    navMarker: "href={detailHref}",
  },
  {
    name: "MarketplacePrizeDrawCard",
    file: "appkit/src/features/products/components/MarketplacePrizeDrawCard.tsx",
    mode: "guard-excludes-nav",
    guardMarker: "{onSelect && (",
    navMarker: "href={String(detailHref)}",
  },
  {
    name: "MarketplaceOrderCard",
    file: "appkit/src/features/orders/components/MarketplaceOrderCard.tsx",
    mode: "guard-excludes-nav",
    guardMarker: "{onSelect && (",
    navMarker: "href={detailHref}",
  },
  {
    name: "BlogFeaturedCard",
    file: "appkit/src/features/blog/components/BlogFeaturedCard.tsx",
    mode: "guard-excludes-nav",
    guardMarker: "{onSelect && (",
    navMarker: "href={href}",
  },
  {
    name: "MarketplaceAuctionCard",
    file: "appkit/src/features/auctions/components/MarketplaceAuctionCard.tsx",
    mode: "guard-excludes-nav",
    guardMarker: "{onSelect && (",
    navMarker: 'href={auctionHref ?? "#"}',
  },
  // Admin/store/user dashboard card-view mode (DataListingView's default
  // card renderer when a feature doesn't supply its own `renderCards`).
  {
    name: "AdminViewCards",
    file: "appkit/src/features/admin/components/AdminViewCards.tsx",
    mode: "guard-excludes-nav",
    guardMarker: "{onToggleSelect && (",
    navMarker: "onClick={handleClick}",
  },
  // Admin/store/user dashboard TABLE-view mode. handleClick is derived from
  // `onRowClick ?? rowHref`, entirely independent of `onToggle`/selection —
  // checked structurally instead of via a guard-block span since the
  // checkbox and the nav derivation aren't nested inside one another here.
  {
    name: "DataTable.SelectableRow",
    file: "appkit/src/features/admin/components/DataTable.tsx",
    mode: "derivation-independent",
    derivationMarker: "const handleClick = onRowClick",
    forbiddenTokens: ["onToggle", "isSelected", "selectionEnabled"],
  },
];

function readSource(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

/**
 * Stack-based bracket walk (string/comment aware, tolerant of mixed bracket
 * types since it matches purely by nesting depth, not bracket identity —
 * sufficient for locating the textual span a JSX/TS block covers). Returns
 * the index of the char that closes the bracket at `openIndex`, or -1.
 */
function findMatchingClose(src, openIndex) {
  const OPEN = new Set(["(", "{", "["]);
  const CLOSE = new Set([")", "}", "]"]);
  let depth = 0;
  let inStr = null;
  for (let i = openIndex; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      i = nl === -1 ? src.length : nl;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? src.length : end + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (OPEN.has(c)) { depth++; continue; }
    if (CLOSE.has(c)) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Extracts the guarded block's [start, end) span (exclusive of the bracket chars). */
function extractGuardSpan(src, guardMarker) {
  const markerIdx = src.indexOf(guardMarker);
  if (markerIdx === -1) return null;
  const openIndex = markerIdx + guardMarker.length - 1; // last char of marker is the opening bracket
  const closeIndex = findMatchingClose(src, openIndex);
  if (closeIndex === -1) return null;
  return { start: openIndex + 1, end: closeIndex };
}

/** Finds every occurrence index of `needle` in `src`. */
function findAllIndices(src, needle) {
  const out = [];
  let i = src.indexOf(needle);
  while (i !== -1) {
    out.push(i);
    i = src.indexOf(needle, i + 1);
  }
  return out;
}

/** Extracts a standalone `const NAME = ...;` statement starting at `marker`, depth-aware so a `;` inside a nested arrow-function body doesn't end it early. */
function extractStatement(src, markerIdx) {
  let depth = 0;
  let inStr = null;
  for (let i = markerIdx; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      i = nl === -1 ? src.length : nl;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? src.length : end + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "(" || c === "{" || c === "[") { depth++; continue; }
    if (c === ")" || c === "}" || c === "]") { depth--; continue; }
    if (c === ";" && depth === 0) return src.slice(markerIdx, i + 1);
  }
  return null;
}

function checkEntry(entry) {
  const src = readSource(entry.file);

  if (entry.mode === "derivation-independent") {
    const markerIdx = src.indexOf(entry.derivationMarker);
    if (markerIdx === -1) {
      return [{ name: entry.name, reason: `could not locate "${entry.derivationMarker}" in ${entry.file} — audit registry entry is stale, fix REGISTRY in this script` }];
    }
    const statement = extractStatement(src, markerIdx);
    if (!statement) {
      return [{ name: entry.name, reason: `found "${entry.derivationMarker}" in ${entry.file} but could not extract a terminated statement — audit registry entry may be stale` }];
    }
    const hits = entry.forbiddenTokens.filter((tok) => statement.includes(tok));
    if (hits.length > 0) {
      return [{
        name: entry.name,
        reason: `navigation derivation now references ${hits.map((h) => `"${h}"`).join(", ")} — nav/click handling must stay independent of selection state (found: ${statement.replace(/\s+/g, " ").trim()})`,
      }];
    }
    return [];
  }

  const span = extractGuardSpan(src, entry.guardMarker);
  if (!span) {
    return [{ name: entry.name, reason: `could not locate guard "${entry.guardMarker}" in ${entry.file} — audit registry entry is stale, fix REGISTRY in this script` }];
  }

  const navHits = findAllIndices(src, entry.navMarker);
  if (navHits.length === 0) {
    return [{ name: entry.name, reason: `nav marker "${entry.navMarker}" not found anywhere in ${entry.file} — audit registry entry is stale, fix REGISTRY in this script` }];
  }

  if (entry.mode === "guard-excludes-nav") {
    const hasOutside = navHits.some((idx) => idx < span.start || idx >= span.end);
    if (!hasOutside) {
      return [{
        name: entry.name,
        reason: `nav marker "${entry.navMarker}" only appears inside the "${entry.guardMarker}" selection-conditional in ${entry.file} — navigation must be wired unconditionally, gated only on whether a selection is actively in progress, never on whether the selection callback is merely present`,
      }];
    }
    return [];
  }

  if (entry.mode === "guard-includes-nav") {
    const hasInside = navHits.some((idx) => idx >= span.start && idx < span.end);
    if (!hasInside) {
      return [{
        name: entry.name,
        reason: `nav marker "${entry.navMarker}" does not appear inside the "${entry.guardMarker}" branch in ${entry.file} — this is the exact regression that shipped 2026-08-19: the selection branch must still forward the nav prop`,
      }];
    }
    return [];
  }

  return [{ name: entry.name, reason: `unknown mode "${entry.mode}" — fix REGISTRY in this script` }];
}

function main() {
  const violations = [];
  for (const entry of REGISTRY) {
    violations.push(...checkEntry(entry));
  }

  if (violations.length === 0) {
    console.log(`audit-selectable-card-navigation: clean ✓ (${REGISTRY.length} component(s) checked)`);
    process.exit(0);
  }

  console.error(`audit-selectable-card-navigation: ${violations.length} violation(s) found.\n`);
  console.error("A selectable card's primary navigation (Link href / router.push / handleClick)");
  console.error("is gated on whether a selection callback is merely wired, instead of staying");
  console.error("unconditional and gating only on whether a selection is actively in progress.");
  console.error("See CLAUDE.md's Recurrent Root Cause Patterns for the InteractiveProductCard");
  console.error("incident this guards against.\n");
  for (const v of violations) {
    console.error(`  [${v.name}] ${v.reason}`);
  }
  process.exit(1);
}

main();

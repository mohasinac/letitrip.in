#!/usr/bin/env node
/**
 * audit-listing-quick-filters.mjs — Phase D click-reduction enforcement:
 * a marketplace listing page (`*IndexListing.tsx`) that already tracks a
 * boolean-shaped filter (a FILTER_KEYS entry named SHOW_*, FREE_SHIPPING,
 * or IS_*) must promote it to an inline `toggles=` pill on <ListingToolbar>
 * — not leave it drawer-only, which forces open-drawer → check → Apply →
 * close for a single on/off filter.
 *
 * This does NOT require every *IndexListing.tsx to have toggles — pages
 * with no boolean-shaped facet (categorical-only filters like species,
 * jurisdiction, delivery method) are legitimately exempt; forcing an
 * invented toggle onto them would be scope creep, not click reduction.
 * See CLAUDE.md's Duplication Decision Framework ("different domain
 * semantics") for the reasoning.
 *
 * Heuristic: file matches `**\/*IndexListing.tsx`, its FILTER_KEYS array
 * (or inline params spread) references a TABLE_KEYS.SHOW_* / FREE_SHIPPING
 * / IS_* member, but the file has no `toggles=` prop anywhere.
 *
 * Strict zero — locked 2026-08-12 after promoting Products/Auctions/
 * PreOrders/Stores/PrizeDraws/Classified/Events to inline toggles. Any
 * new listing page with a boolean facet must wire it inline from day one.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIR = join(ROOT, "appkit", "src", "features");
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__"]);

const BOOLEAN_FILTER_RE = /TABLE_KEYS\.(?:SHOW_[A-Z_]+|FREE_SHIPPING|IS_[A-Z_]+)\b/;
const TOGGLES_PROP_RE = /\btoggles=\{/;
const DRAWER_IMPORT_RE = /\b(?:FilterDrawer|ListingFilterDrawer)\b/;

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (extname(entry.name) === ".tsx" && entry.name.endsWith("IndexListing.tsx")) files.push(full);
  }
  return files;
}

const violations = [];
for (const file of walk(SCAN_DIR)) {
  const content = readFileSync(file, "utf8");
  if (!DRAWER_IMPORT_RE.test(content)) continue;
  if (!BOOLEAN_FILTER_RE.test(content)) continue;
  if (TOGGLES_PROP_RE.test(content)) continue;
  violations.push(relative(ROOT, file).replace(/\\/g, "/"));
}

const BASELINE = 0;

if (violations.length <= BASELINE) {
  console.log(`audit-listing-quick-filters: clean ✓ (${violations.length}/${BASELINE})`);
  process.exit(0);
}

console.error(`audit-listing-quick-filters: ${violations.length} listing page(s) track a boolean filter but never promote it to an inline toggle (baseline ${BASELINE}).`);
console.error("Fix: add a `toggles={[{ label, active, onChange }]}` entry to <ListingToolbar> — see ProductsIndexListing.tsx's \"Free shipping\" toggle for the pattern.\n");
for (const f of violations) console.error(`  ${f}`);
process.exit(1);

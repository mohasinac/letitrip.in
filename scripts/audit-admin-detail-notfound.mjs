#!/usr/bin/env node
/*
 * Admin detail pages that render an editor for an id that does not exist.
 *
 * /admin/coupons/zzzznope-not-a-coupon-42/edit rendered a fully editable
 * coupon form — 12 inputs, a "Save changes" button and a "Delete coupon"
 * button — because its page.tsx was a bare client shim with no existence
 * check. The sibling /admin/orders/[id]/view fetches server-side and calls
 * notFound(), and 404s correctly; the two differed only because one never
 * grew the check.
 *
 * The failure is quiet and dangerous in the same way as Root Cause #98: the
 * form looks ready to save, and what it saves is a record keyed on an id
 * nobody meant to create.
 *
 * WHAT THIS FLAGS: a dynamic admin page under a [id]/[slug] segment whose
 * component body never calls notFound() and never delegates to something that
 * does. A page that renders a LIST, a creation form, or a purely client
 * dashboard is not a detail page and is excluded by name.
 *
 * 🛑 POSITIVE CONTROL FIRST — a sweep that cannot see its own known-bad shape
 * is worse than no sweep, because it is reported as evidence.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/app/[locale]/admin";

/** Segment names that are not detail pages. */
const NOT_A_DETAIL = new Set(["new", "create"]);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else if (e === "page.tsx") out.push(p);
  }
  return out;
}

const isDetailPage = (f) => {
  const parts = f.split(/[\\/]/);
  if (!parts.some((p) => /^\[.+\]$/.test(p) && p !== "[locale]")) return false;
  return !parts.some((p) => NOT_A_DETAIL.has(p));
};

const guards = (src) => /notFound\(\)/.test(src);

// ── Positive control ────────────────────────────────────────────────────────
const KNOWN_BAD = `import { CouponEditClient } from "./coupon-edit-client";
export default async function Page({ params }) {
  const { id } = await params;
  return <CouponEditClient id={id} />;
}`;
if (guards(KNOWN_BAD)) {
  console.error("✗ CONTROL FAILED — the rule thinks the known-bad page is guarded. Aborting.");
  process.exit(2);
}
const KNOWN_GOOD = `const order = await orderRepository.findById(id);\n if (!order) return notFound();`;
if (!guards(KNOWN_GOOD)) {
  console.error("✗ CONTROL FAILED — the rule cannot recognise the known-good guard. Aborting.");
  process.exit(2);
}
console.log("✓ control: rule distinguishes the known-bad shim from the known-good guard\n");

/*
 * 🛑 RATCHET — NOT A BASELINE. The distinction matters (see CLAUDE.md
 * "Staged audits — a ratchet is not a baseline").
 *
 * These 17 are NAMED, and the list may only SHRINK. Removing an entry is the
 * goal; adding one is the thing being blocked. A baseline tolerates N
 * violations without saying which; this refuses the eighteenth by name.
 *
 * Seeded from a RUN OF THIS RULE, never from a hand-written grep — the
 * hand-written list while designing the codemod said 10, the rule found 27
 * (Root Cause #84).
 *
 * They are staged rather than fixed in the same change because they are two
 * shapes needing different repairs, and mixing them into one codemod is how a
 * half-migration ships:
 *   - a "use client" page must distinguish LOADING from NOT-FOUND (today it
 *     returns <PageLoader/> for both, so a bad id spins forever rather than
 *     404ing) — that is a behaviour change per page, not a wrapper;
 *   - five have no obvious repository (ads live inside siteSettings; roles,
 *     navigation and shipment lots are nested or synthetic).
 *
 * MIGRATE=strict fails on all of them.
 */
const RATCHET = new Set([
  "src/app/[locale]/admin/ads/[id]/edit/page.tsx",
  "src/app/[locale]/admin/bids/[id]/view/page.tsx",
  "src/app/[locale]/admin/event-entries/[id]/view/page.tsx",
  "src/app/[locale]/admin/events/[id]/edit/page.tsx",
  "src/app/[locale]/admin/features/[id]/edit/page.tsx",
  "src/app/[locale]/admin/grouped-listings/[id]/edit/page.tsx",
  "src/app/[locale]/admin/navigation/[id]/edit/page.tsx",
  "src/app/[locale]/admin/payouts/[id]/view/page.tsx",
  "src/app/[locale]/admin/prize-draws/[id]/edit/page.tsx",
  "src/app/[locale]/admin/roles/[id]/edit/page.tsx",
  "src/app/[locale]/admin/shipments/[id]/edit/page.tsx",
  "src/app/[locale]/admin/shipments/[id]/lots/[lotId]/items/page.tsx",
  "src/app/[locale]/admin/stores/[id]/view/page.tsx",
  "src/app/[locale]/admin/team/[id]/edit/page.tsx",
  "src/app/[locale]/admin/tester-checklist/[id]/edit/page.tsx",
  "src/app/[locale]/admin/users/[id]/edit/page.tsx",
  "src/app/[locale]/admin/users/[id]/page.tsx",
]);

const STRICT = process.env.MIGRATE === "strict";
const norm = (f) => f.replace(/\\/g, "/");

const pages = walk(ROOT).filter(isDetailPage);
const unguarded = pages.filter((f) => !guards(readFileSync(f, "utf8")));
const staged = unguarded.filter((f) => !STRICT && RATCHET.has(norm(f)));
const blocking = unguarded.filter((f) => STRICT || !RATCHET.has(norm(f)));

for (const f of blocking) {
  console.log(`  ${norm(f)}`);
  console.log("    renders a detail view with no notFound() — an invented id gets an editor");
}

// A ratchet entry that has been FIXED must be removed from the list, or the
// list quietly stops meaning what it says.
const stale = [...RATCHET].filter((f) => !unguarded.some((u) => norm(u) === f));
for (const f of stale) {
  console.log(`  ${f}`);
  console.log("    is in the ratchet but is now GUARDED — delete it from RATCHET (the list may only shrink)");
}

const failures = blocking.length + stale.length;
console.log(
  failures === 0
    ? `\naudit-admin-detail-notfound: clean ✓ (${pages.length} checked, ${staged.length} staged)`
    : `\naudit-admin-detail-notfound: ${failures} blocking (${pages.length} checked, ${staged.length} staged).`,
);
process.exit(failures === 0 ? 0 : 1);

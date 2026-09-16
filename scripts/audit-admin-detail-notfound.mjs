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

const pages = walk(ROOT).filter(isDetailPage);
const unguarded = pages.filter((f) => !guards(readFileSync(f, "utf8")));

for (const f of unguarded) {
  console.log(`  ${f}`);
  console.log("    renders a detail view with no notFound() — an invented id gets an editor");
}

console.log(
  unguarded.length === 0
    ? `\naudit-admin-detail-notfound: clean ✓ (${pages.length} admin detail page(s) checked)`
    : `\naudit-admin-detail-notfound: ${unguarded.length} of ${pages.length} admin detail page(s) unguarded.`,
);
process.exit(unguarded.length === 0 ? 0 : 1);

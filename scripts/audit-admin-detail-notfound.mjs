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
import { stripComments } from "./lib/strip-comments.mjs";

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

/**
 * What counts as guarded.
 *
 * 🛑 `notFound()` is ONE of two valid answers, and keying on it alone made this
 * rule narrower than the property it exists to protect. The property is: *a bad
 * id must not render an editable form*. A `"use client"` detail page cannot
 * reach a server `notFound()` before its own fetch resolves, and three pages
 * (`event-entries/[id]/view`, `payouts/[id]/view`, `stores/[id]/view`) already
 * satisfied the property correctly — they branch on the absence of the record
 * once loading is done and render a "… not found" panel with a way back, which
 * is better admin UX than the global 404. All three were being counted as
 * offenders. Root Cause #84: a measurement narrower than the rule it feeds.
 *
 * The client form requires BOTH halves, deliberately:
 *   · an ABSENCE GUARD — `!isLoading && !x`, `isError || !data`, or similar, so
 *     the page distinguishes "still fetching" from "does not exist"; and
 *   · a VISIBLE not-found string, so the guard renders something a human reads.
 *
 * Either half alone is not enough. A guard with no message is a blank screen,
 * and a message with no guard is prose — which is why `src` arrives
 * comment-stripped, so a docstring saying "not found" cannot satisfy the rule.
 */
/*
 * The accepted absence-guard shapes, enumerated rather than approximated by
 * one permissive regex. Each is a real shape in this codebase, and listing
 * them is what keeps the rule reviewable: a looser catch-all would start
 * crediting any page that happens to negate something.
 */
const ABSENCE_GUARD = new RegExp(
  [
    // !isLoading && !payout  ·  !existing.isLoading && !existing.data
    "!\\s*(?:\\w+\\.)*is(?:Loading|Pending|Fetching)\\s*&&\\s*!",
    "\\bis(?:Error|LoadError)\\b\\s*\\|\\|\\s*!", // isError || !data
    "\\bif\\s*\\(\\s*!\\s*\\w+(?:[.?]\\w+)*\\s*\\)", // if (!data) / if (!lot.shipmentId)
    "\\bif\\s*\\(\\s*\\w+\\s*&&\\s*!\\s*\\w+\\s*\\)", // if (itemId && !item)
    "\\bif\\s*\\(\\s*(?:is)?[Mm]issing\\b", // if (missing) — an explicit settled flag
    "\\b(?:missing|isMissing|notFoundState)\\s*\\?", // the same flag as a ternary
  ].join("|"),
);
const NOT_FOUND_TEXT = /not\s+found/i;

const guards = (src) =>
  /notFound\(\)/.test(src) || (ABSENCE_GUARD.test(src) && NOT_FOUND_TEXT.test(src));

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
 * 🛑 EMPTY, and closed 2026-10-17. The ratchet held 17; all 17 are resolved
 * and none was dropped from the rule to get there.
 *
 * THREE were never offenders — `event-entries`, `payouts` and `stores` already
 * branched on absence and rendered a "… not found" panel. The rule only knew
 * `notFound()`, so it was narrower than the property it protects.
 *
 * ONE more fell out once DELEGATION was implemented. This header has always
 * claimed the rule credits a page that "delegates to something that does", and
 * it never did — `bids/[id]/view`'s client has had the guard all along.
 *
 * The remaining THIRTEEN were real, and two were worse than a missing 404:
 *   · `/admin/team/[id]/edit` passed the editor no permissions at all, and
 *     `currentPermissions` defaults to `[]` — so Save on an untouched form
 *     WIPED a real employee's permission set. The page's own docstring claimed
 *     the editor loaded them. Root Cause #98's shape.
 *   · `/admin/navigation/[id]/edit` resolved an unknown id to `item={null}`,
 *     which means CREATE to `AdminNavEditorView` — an edit URL silently
 *     offering to add a nav item.
 *   · `/admin/ads/[id]/edit` is the one with the widest blast radius: ads live
 *     inside the `siteSettings` singleton, so saving an invented id did not
 *     fail on a missing document, it appended a new ad to the shared one.
 *
 * Server pages now go through `requireRecord` (appkit/src/next/routing), which
 * separates a FAILED read from an ABSENT record — a naive `fallback: null`
 * would 404 a real record on a transient Firestore error, which is worse than
 * the bug being fixed.
 *
 * MIGRATE=strict is now the same as the default run. Do not add an entry: a
 * stale one already blocks, and the two repair shapes both have a precedent to
 * copy.
 */
const RATCHET = new Set([
]);

const STRICT = process.env.MIGRATE === "strict";
const norm = (f) => f.replace(/\\/g, "/");

/**
 * Resolve a page's import specifier to a file on disk, for the delegation
 * check below. Handles a relative sibling (`./coupon-edit-client`) and an
 * appkit deep subpath (`@mohasinac/appkit/features/.../AdminAdEditorView`);
 * returns null for a bare package, a barrel entry, or anything unresolvable.
 */
function resolveImport(fromFile, spec) {
  let base;
  if (spec.startsWith(".")) {
    base = join(fromFile, "..", spec);
  } else if (spec.startsWith("@mohasinac/appkit/")) {
    const sub = spec.slice("@mohasinac/appkit/".length);
    // A barrel entry (`client`, `server`, `features/x/components`) re-exports
    // hundreds of symbols; following it would read the wrong file and could
    // credit a page for a `notFound()` somewhere unrelated.
    if (!sub.includes("/")) return null;
    base = join("appkit", "src", sub);
  } else if (spec.startsWith("@/")) {
    base = join("src", spec.slice(2));
  } else {
    return null;
  }
  for (const ext of [".tsx", ".ts"]) {
    const p = base + ext;
    try {
      if (statSync(p).isFile()) return p;
    } catch {
      /* next extension */
    }
  }
  return null;
}

const IMPORT_RE = /import\s+(?:[\s\S]*?)\s*from\s*["']([^"']+)["']/g;

/**
 * 🛑 Follows DELEGATION, which this audit's own header has always claimed it
 * does — "never delegates to something that does" — and which was never
 * implemented. That gap is why eight pages sat in the ratchet: each is a thin
 * shim whose entire job is to render ONE component, and that component owns
 * the fetch, so it is the only place that can know the record is missing. The
 * page cannot check what it never loads.
 *
 * Depth 2, and no further: a page → its client body → the editor that client
 * mounts is the real chain here. Beyond that the import graph widens fast and
 * a `notFound()` in some distant shared module would start crediting pages
 * that have nothing to do with it.
 */
function guardsWithDelegation(file, depth = 2, seen = new Set()) {
  const key = norm(file);
  if (seen.has(key)) return false;
  seen.add(key);

  let src;
  try {
    // Comment-stripped: a docstring that happens to say "not found" must not
    // satisfy the rule. The same discipline four other audits in this repo needed.
    src = stripComments(readFileSync(file, "utf8"));
  } catch {
    return false;
  }
  if (guards(src)) return true;
  if (depth <= 0) return false;

  for (const m of src.matchAll(IMPORT_RE)) {
    const target = resolveImport(file, m[1]);
    if (!target) continue;
    if (guardsWithDelegation(target, depth - 1, seen)) return true;
  }
  return false;
}

const pages = walk(ROOT).filter(isDetailPage);
const unguarded = pages.filter((f) => !guardsWithDelegation(f));
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

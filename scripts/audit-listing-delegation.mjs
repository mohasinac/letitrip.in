#!/usr/bin/env node
/**
 * audit-listing-delegation — list queries belong in the Function, and a
 * paginated result must not be reshaped afterwards.
 *
 * ## Why this exists
 *
 * A route that calls a repository list method directly runs the query inside
 * Vercel: the 10s sync ceiling, the 2GB function memory, and every Firestore
 * read billed against the request that is also rendering a page (Rule #6). The
 * colocated `listingProcessor` Function exists to take that work, and
 * `listingProcessorFirstExecutor` falls back to the local repository when it
 * fails — so delegating is safe in the failure direction.
 *
 * ## R1 UNDELEGATED_LIST_ROUTE — ratchet
 *
 * 64 routes call a repository list method; 3 delegate. The other 61 are listed
 * below, so a NEW one fails while the known set is burned down.
 *
 * 🛑 That 61 is itself a correction. A hand-written
 * `grep 'Repository.list('` found 45, and this audit — run once, on its own
 * rule — found 16 more: chat, store/dashboard, both store/analytics routes,
 * user/orders, user/export and the rest. The enumeration used to seed the
 * ratchet was narrower than the rule enforcing it, so a quarter of the backlog
 * was invisible to the measurement that defined it. Trust the rule's output
 * over any list a human typed.
 *
 * They are not converted in bulk, and the reason is measured rather than
 * cautious: 33 of the original 45 have a `LISTERS` entry and could delegate
 * today, but
 * each conversion moves the query to a different executor whose only failure
 * mode is SILENT SEMANTIC DIVERGENCE — the Function returning different rows
 * than the fallback would. That is exactly the `LISTERS` `baseOpts.search` drop,
 * which every local check passed and which reproduced only in production.
 * Converting 33 at once, then verifying at the end, makes each divergence
 * indistinguishable from the others.
 *
 * The remaining 12 need a new lister registered first (carts, offers,
 * supportTickets, carouselSlides, shipments, newsletterSubscribers,
 * adminAuditLog, groupedListings, contactSubmissions, notifications, and the
 * two tester collections) — one route each.
 *
 * ## R2 POST_PAGINATION_RESHAPE — strict
 *
 * Filtering, sorting or recounting a result that has ALREADY been paginated.
 * The page was cut by the query, so a filter here searches one page and misses
 * every match outside it, and recomputing `total` from the survivors asserts
 * that one page was the whole result set.
 *
 * `/api/admin/events/[id]/entries` did all three: it filtered `result.items`,
 * then returned `total: filtered.length, totalPages: 1, hasMore: false`. A
 * match on page 2 was unreachable and the count was a fiction. Fixed by
 * scanning a bounded window and paginating the refined set — with `truncated`
 * set when the scan saturates, because then `total` is a floor, not a count.
 *
 * In-memory refinement is sometimes REQUIRED, not lazy: an encrypted field has
 * no usable prefix, so `userEmail` can only be matched after `mapDoc` decrypts
 * it. The defect is never "filtered in memory" — it is "filtered one page and
 * called it the total".
 *
 * Suppression: `// audit-listing-delegation-ok: <reason>`.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const API_ROOT = join(REPO_ROOT, "src", "app", "api");
const OK_RE = /\/\/\s*audit-listing-delegation-ok\s*:/i;
const STRICT_ALL = process.env.MIGRATE === "strict";

const LIST_CALL = /[a-zA-Z]+Repository\.(?:list|listAll|listFor\w*|sieveQuery|findAll)\(/;

/**
 * Routes that still run their list query inside Vercel.
 *
 * A ratchet, not an allowlist: removing an entry is the goal, adding one is
 * blocked. Delete a line the moment its route gains an executor.
 */
const KNOWN_UNDELEGATED = new Set([
  "admin/audit-log", "admin/bids", "admin/blog", "admin/brands", "admin/carousel",
  "admin/carts", "admin/categories", "admin/contact-submissions", "admin/coupons",
  "admin/event-entries", "admin/events", "admin/faqs", "admin/grouped-listings",
  "admin/newsletter", "admin/notifications", "admin/offers", "admin/orders",
  "admin/payouts", "admin/payouts/export", "admin/reviews", "admin/scammers",
  "admin/sections", "admin/shipments", "admin/sublisting-categories",
  "admin/support-tickets", "admin/team", "admin/tester-checklist-items",
  "admin/tester-feedback", "admin/users",
  "brands", "classified", "coupons", "digital-codes", "events", "faqs", "live",
  "pre-orders", "reviews",
  "store/bids", "store/coupons", "store/payouts", "store/sublisting-categories",
  "stores/[storeSlug]/auctions", "stores/[storeSlug]/products",
  "user/bids",
  // Found by this audit itself, not by the hand-written enumeration that
  // seeded the list above — its `Repository.list(` grep was narrower than the
  // rule, so the real backlog is 61, not 45.
  "admin/events/[id]/entries",
  "admin/events/[id]/stats",
  "admin/shipments/projections",
  "chat",
  "profile/[userId]/reviews",
  "store/analytics/alerts",
  "store/analytics/cards",
  "store/dashboard",
  "store/orders",
  "store/reviews",
  "user/coupons",
  "user/events",
  "user/export",
  "user/notifications",
  "user/orders",
  "user/tester-checklist",
]);

function* walk(root) {
  let entries;
  try { entries = readdirSync(root, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = join(root, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.name === "route.ts") yield full;
  }
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

const findings = [];
const report = (f, l, rule, msg) => findings.push({ f, l, rule, msg });
let staged = 0;

for (const file of walk(API_ROOT)) {
  const rel = relative(REPO_ROOT, file).replace(/\\/g, "/");
  const routeKey = rel.replace("src/app/api/", "").replace("/route.ts", "");
  const raw = readFileSync(file, "utf8");
  const code = stripComments(raw);
  const lines = raw.split(/\r?\n/);
  const lineAt = (i) => code.slice(0, i).split(/\r?\n/).length;
  const suppressed = (l) => OK_RE.test(`${lines[l - 2] ?? ""}\n${lines[l - 1] ?? ""}`);

  // R1
  const m = code.match(LIST_CALL);
  if (m && !/\bexecutor\b/.test(code)) {
    const line = lineAt(m.index);
    if (!suppressed(line)) {
      if (KNOWN_UNDELEGATED.has(routeKey) && !STRICT_ALL) {
        staged++;
      } else {
        report(rel, line, "UNDELEGATED_LIST_ROUTE",
          `calls a repository list method directly, so the query runs inside Vercel ` +
          `against the 10s ceiling with every read billed to the request. Pass ` +
          `\`executor: listingProcessorFirstExecutor\` — it falls back to the local ` +
          `repository if the Function fails, so the failure direction is safe.`);
      }
    }
  }

  // R2 — reshaping an already-paginated result.
  for (const r of code.matchAll(/(\w+)\.items\s*\.\s*(filter|sort|slice)\(/g)) {
    const line = lineAt(r.index);
    if (suppressed(line)) continue;
    // Recomputing total from the survivors is what makes it a lie rather than
    // merely a narrow page.
    const after = code.slice(r.index, r.index + 900);
    if (!/total:\s*\w+\.length|totalPages:\s*1\b/.test(after)) continue;
    // `truncated` is the documented marker of the HONEST version of this
    // shape: scan a bounded window, refine it, paginate the refined set, and
    // declare that `total` is a floor rather than a count. Filtering in memory
    // is sometimes required — an encrypted field has no usable prefix, so it
    // can only be matched after mapDoc decrypts it — so the rule must catch
    // "filtered one already-cut page", not "filtered at all".
    if (/\btruncated\b/.test(after)) continue;
    report(rel, line, "POST_PAGINATION_RESHAPE",
      `\`${r[1]}.items.${r[2]}(...)\` reshapes a result the query already ` +
      `paginated, then reports the survivors as \`total\`. Matches outside the ` +
      `fetched page are unreachable and the count asserts one page was the whole ` +
      `result set. Scan a bounded window, paginate the refined set, and set ` +
      `\`truncated\` when the scan saturates — then \`total\` is honestly a floor.`);
  }
}

const byRule = findings.reduce((a, f) => ((a[f.rule] = (a[f.rule] ?? 0) + 1), a), {});
const summary = Object.entries(byRule).map(([r, n]) => `${r}=${n}`).join(" · ") || "none";

if (findings.length > 0) {
  console.error(`[audit-listing-delegation] ${findings.length} finding(s) — ${summary}\n`);
  for (const f of findings) {
    console.error(`  ${f.f}:${f.l}  [${f.rule}]`);
    console.error(`    ${f.msg}\n`);
  }
  console.error("Suppression: // audit-listing-delegation-ok: <reason>");
  process.exit(1);
}

console.log(
  `[audit-listing-delegation] OK — 0 findings ` +
  `(${staged} route(s) staged on R1; MIGRATE=strict includes them)`,
);

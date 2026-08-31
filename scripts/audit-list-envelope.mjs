#!/usr/bin/env node
/**
 * audit-list-envelope.mjs — one shape for "a page of rows".
 *
 * ## The state this freezes
 *
 * Every repository already returns `SieveResult<T>`:
 *
 *     { items, total, page, pageSize, totalPages, hasMore }
 *
 * That is the canonical envelope, it has ~18 importers, and it is exactly the
 * shape a list endpoint should emit. The divergence is entirely at the ROUTE
 * boundary: routes destructure `result.items` and re-emit it under a bespoke
 * name — `products`, `orders`, `posts`, `tickets`, `scammers`, eighteen in all
 * — and hoist `result.total` into `meta`. Then every view supplies a `mapRows`
 * that reads its own name back out.
 *
 * Nothing ever type-errors, because `ListingViewConfig<TResponse, TRow>` treats
 * `TResponse` as opaque and delegates the read to a per-view callback. That
 * indirection is precisely what let eighteen shapes accumulate, and three sites
 * have already grown `response.items ?? response.data` defences against it.
 *
 * ## Why this is a ratchet, not a strict-zero
 *
 * Converging all of it is ~148 route files. Each is mostly a one-line delete
 * (`return successResponse(result)` instead of a hand-built literal), but a
 * half-finished rename is worse than none: the view reads the old key, the
 * route emits the new one, and the list silently renders empty with a 200.
 *
 * So the existing keys are NAMED, and the list may only shrink. A NEW one
 * fails. Removing an entry is the goal; adding one is the thing being blocked.
 *
 * 🛑 `LEGACY_ITEM_KEYS` was seeded from a RUN OF THIS RULE, never from a
 * hand-written grep. Root Cause #84: the `listing-delegation` ratchet was
 * seeded from a grep that found 45 routes when its own audit found 61, so a
 * quarter of the backlog was invisible to the measurement that defined it.
 *
 * ## Rules
 *
 * R1  ENVELOPE_PERPAGE  — an interface declaring `perPage`. `pageSize` is the
 *     canonical spelling. Also a ratchet, by FILE: the 15 remaining sites are
 *     the `PagedResult` / `SieveQuery` family, which is genuinely live in 14
 *     repositories through `IReadRepository.findAll`. Renaming that field is a
 *     change to the repository CONTRACT, not to a response envelope, and doing
 *     it half-way would leave `findAll` implementations disagreeing with their
 *     interface. A NEW file introducing `perPage` fails.
 *
 * R2  NEW_ITEM_ARRAY_KEY — a `mapRows` reading a list off a key that is not
 *     `items` and not in the ratchet.
 *
 * Suppression: `// audit-list-envelope-ok: <reason>`.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = "audit-list-envelope-ok";
const STRICT = process.env.MIGRATE === "strict";

/**
 * Item-array keys in use today, seeded from a run of R2 itself.
 *
 * This list may only SHRINK. Each entry is one route family still renaming
 * `SieveResult.items` on the way out; converging it means deleting the rename
 * in the route and the `mapRows` override in the view, together.
 */
const LEGACY_ITEM_KEYS = new Set([
  "bids",
  "coupons",
  "data",
  "entries",
  "orders",
  "payouts",
  "posts",
  "products",
  "scammers",
  "sessions",
  "shipments",
  "submissions",
  "subscribers",
  "tickets",
  "users",
]);
// 15 keys, from `MIGRATE=strict node scripts/audit-list-envelope.mjs`. A survey
// of the same ground by hand said 17, adding `auctions` and `reviews` — two
// views this rule does not in fact flag. Seeded from the run, so the number is
// the rule's, not a person's.

/**
 * Files still declaring `perPage`, from a run of R1 itself.
 *
 * All of them are the `PagedResult` / `SieveQuery` / table-state family — a
 * live repository contract, not a response envelope. This list may only shrink,
 * and it shrinks by renaming the field across `IReadRepository.findAll` and its
 * 14 implementations in one commit, never one file at a time.
 */
const LEGACY_PERPAGE_FILES = new Set([
  "appkit/src/contracts/repository.ts",
  "appkit/src/contracts/search.ts",
  "appkit/src/contracts/table.ts",
  "appkit/src/features/admin/types/index.ts",
  "appkit/src/features/blog/types/index.ts",
  "appkit/src/features/consultation/types/index.ts",
  "appkit/src/features/corporate/types/index.ts",
  "appkit/src/features/faq/types/index.ts",
  "appkit/src/features/orders/types/index.ts",
  "appkit/src/features/products/types/index.ts",
  "appkit/src/utils/array.helper.ts",
]);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", "dist", ".next", "__tests__"].includes(e.name)) continue;
      walk(p, out);
    } else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const FILES = [...walk(join(ROOT, "appkit", "src")), ...walk(join(ROOT, "src"))];

const blocking = [];
const ratcheted = [];

for (const file of FILES) {
  const raw = readFileSync(file, "utf8");
  const src = stripComments(raw);
  const lines = src.split(/\r?\n/);
  const rawLines = raw.split(/\r?\n/);
  const rel = file.slice(ROOT.length + 1).replace(/\\/g, "/");
  const ok = (i) =>
    (rawLines[i] ?? "").includes(MARKER) || (rawLines[i - 1] ?? "").includes(MARKER);

  lines.forEach((line, i) => {
    if (ok(i)) return;

    // R1 — `perPage` declared as an envelope field.
    //
    // Matched anywhere on the line, not anchored to line-start: a one-line
    // interface (`{ items: T[]; perPage: number }`) is legal TS and the
    // anchored version silently missed it. Found by planting exactly that and
    // watching the audit report clean.
    if (/\bperPage\??\s*:\s*number/.test(line)) {
      const entry = {
        rule: "ENVELOPE_PERPAGE",
        file: rel,
        line: i + 1,
        detail:
          "`perPage` declared. The canonical page-size field is `pageSize` — " +
          "`SieveResult<T>`, which every repository already returns, spells it that way.",
      };
      if (LEGACY_PERPAGE_FILES.has(rel) && !STRICT) ratcheted.push(entry);
      else blocking.push(entry);
    }

    // R2 — a mapRows reading its rows off a bespoke key.
    const m = line.match(/\bresponse[?.]*\.\s*([A-Za-z_][A-Za-z0-9_]*)/);
    if (m && /toRecordArray\s*\(|Array\.isArray\s*\(/.test(line)) {
      const key = m[1];
      if (key === "items" || key === "meta" || key === "total") return;
      const entry = {
        rule: "NEW_ITEM_ARRAY_KEY",
        file: rel,
        line: i + 1,
        detail:
          `Rows read off \`response.${key}\`. The repository returned them as \`items\`; ` +
          `the route renamed the key and this view renames it back.`,
      };
      if (LEGACY_ITEM_KEYS.has(key) && !STRICT) ratcheted.push(entry);
      else blocking.push(entry);
    }
  });
}

if (ratcheted.length > 0) {
  console.log(
    `[audit-list-envelope] ${ratcheted.length} ratcheted site(s) across ${
      new Set(ratcheted.map((r) => r.file)).size
    } file(s) — the named backlog. MIGRATE=strict to fail on them.`,
  );
}

if (blocking.length === 0) {
  console.log("[audit-list-envelope] OK — 0 blocking violations");
  process.exit(0);
}

console.error(`[audit-list-envelope] ${blocking.length} blocking violation(s).\n`);
for (const v of blocking) {
  console.error(`  [${v.rule}] ${v.file}:${v.line}`);
  console.error(`    ${v.detail}\n`);
}
console.error(`Suppress a genuine exception with: // ${MARKER}: <reason>`);
process.exit(1);

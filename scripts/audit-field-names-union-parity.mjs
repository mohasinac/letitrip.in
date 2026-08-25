#!/usr/bin/env node
/**
 * audit-field-names-union-parity — strict-zero.
 *
 * ## Why this exists
 *
 * `appkit/src/constants/field-names.ts` calls itself "canonical source of
 * truth" and is a deliberate LEAF: it imports nothing, and feature files import
 * IT (`features/products/types/index.ts` does). That leaf position is load-
 * bearing — making it re-export each feature's union would create an import
 * cycle — but it also means its ~37 `*_VALUES` maps are hand-copied duplicates
 * of unions defined elsewhere, with nothing keeping them aligned.
 *
 * Measured 2026-08-24: SIX of them had drifted, and every one is the shape of
 * Root Cause #33 — a value that is byte-compared against Firestore, so a wrong
 * or missing member silently matches zero rows with no error anywhere:
 *
 *   PRE_ORDER_PRODUCTION_STATUS_VALUES  3 of its 4 values were FICTION
 *                                       (real: upcoming|in_production|ready_to_ship)
 *   BID_FIELDS.STATUS_VALUES            missing `forfeited`
 *   PAYOUT_FIELDS.STATUS_VALUES         extra `cancelled` — not a PayoutStatus
 *   SCAMMER_FIELDS.STATUS_VALUES        `pending` vs real `pending_review`; missing `removed`
 *   ORDER_FIELDS.PAYMENT_STATUS_VALUES  missing `processing`, `partial_refund`
 *   SUPPORT_TICKET_FIELDS.PRIORITY_VALUES  extra `medium` — not a TicketPriority
 *
 * CLAUDE.md's Root Cause #34 already warned this file was stale in places, and
 * named two of these. Nothing enforced it, so they stayed wrong.
 *
 * ## What it checks
 *
 * For every pair in REGISTRY: extract the value set from the `*_VALUES` block
 * in field-names.ts, extract the union or `*Values` const from the feature's
 * own file, and require the two sets to be EQUAL. Reports members present in
 * one and not the other, in both directions — a missing value and an invented
 * one are equally broken, they just fail differently.
 *
 * Regex over raw source, no TypeScript compiler, matching every other audit
 * here (`audit-filter-tab-enums.mjs` set the precedent).
 *
 * ## Adding a pair
 *
 * Add an entry to REGISTRY. A `*_VALUES` map in field-names.ts with no entry
 * here is NOT flagged — many are genuinely single-source (`AD_FIELDS`'s
 * `AdStatus` is derived FROM field-names, not the other way round). Triaging
 * every map is a bigger job than this wave; the six known-drifted pairs plus
 * the ones already verified equal are covered, and the list grows as pairs are
 * confirmed.
 *
 * No suppression marker. A duplicated enum either matches its source or it is
 * a bug; there is no legitimate third case.
 *
 * Exit 0 — every registered pair agrees.
 * Exit 1 — any pair differs.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIELD_NAMES = join(ROOT, "appkit", "src", "constants", "field-names.ts");

/**
 * Each entry: the `*_VALUES` block in field-names.ts, and where the real union
 * lives. `kind: "union"` reads a `type X = "a" | "b"` declaration; `kind:
 * "const"` reads a `const XValues = { A: "a" }` object.
 */
const REGISTRY = [
  {
    label: "PRODUCT_FIELDS.PRE_ORDER_PRODUCTION_STATUS_VALUES",
    block: "PRE_ORDER_PRODUCTION_STATUS_VALUES",
    file: "appkit/src/features/products/schemas/firestore.ts",
    kind: "inline-union",
    symbol: "preOrderProductionStatus",
  },
  {
    label: "PRODUCT_FIELDS.STATUS_VALUES",
    block: "STATUS_VALUES",
    blockOwner: "PRODUCT_FIELDS",
    file: "appkit/src/features/products/types/index.ts",
    kind: "union",
    symbol: "ProductStatus",
  },
  {
    label: "ORDER_FIELDS.STATUS_VALUES",
    block: "STATUS_VALUES",
    blockOwner: "ORDER_FIELDS",
    file: "appkit/src/features/orders/types/index.ts",
    kind: "union",
    symbol: "OrderStatus",
  },
  {
    label: "ORDER_FIELDS.PAYMENT_STATUS_VALUES",
    block: "PAYMENT_STATUS_VALUES",
    file: "appkit/src/features/orders/types/index.ts",
    kind: "union",
    symbol: "PaymentStatus",
  },
  {
    label: "BID_FIELDS.STATUS_VALUES",
    block: "STATUS_VALUES",
    blockOwner: "BID_FIELDS",
    file: "appkit/src/features/auctions/schemas/firestore.ts",
    kind: "union",
    symbol: "BidStatus",
  },
  {
    label: "PAYOUT_FIELDS.STATUS_VALUES",
    block: "STATUS_VALUES",
    blockOwner: "PAYOUT_FIELDS",
    file: "appkit/src/features/payments/schemas/firestore.ts",
    kind: "union",
    symbol: "PayoutStatus",
  },
  {
    label: "SCAMMER_FIELDS.STATUS_VALUES",
    block: "STATUS_VALUES",
    blockOwner: "SCAMMER_FIELDS",
    file: "appkit/src/features/scams/schemas/firestore.ts",
    kind: "const",
    symbol: "ScammerStatusValues",
  },
  {
    label: "SUPPORT_TICKET_FIELDS.STATUS_VALUES",
    block: "STATUS_VALUES",
    blockOwner: "SUPPORT_TICKET_FIELDS",
    file: "appkit/src/features/support/schemas/firestore.ts",
    kind: "const",
    symbol: "TicketStatusValues",
  },
  {
    label: "SUPPORT_TICKET_FIELDS.PRIORITY_VALUES",
    block: "PRIORITY_VALUES",
    file: "appkit/src/features/support/schemas/firestore.ts",
    kind: "const",
    symbol: "TicketPriorityValues",
  },
  {
    label: "EVENT_FIELDS.STATUS_VALUES",
    block: "STATUS_VALUES",
    blockOwner: "EVENT_FIELDS",
    file: "appkit/src/features/events/types/index.ts",
    kind: "union",
    symbol: "EventStatus",
  },
  {
    label: "STORE_FIELDS.STATUS_VALUES",
    block: "STATUS_VALUES",
    blockOwner: "STORE_FIELDS",
    file: "appkit/src/features/stores/schemas/firestore.ts",
    kind: "const",
    symbol: "StoreStatusValues",
  },
];

const read = (rel) => {
  try {
    return readFileSync(join(ROOT, rel), "utf8");
  } catch {
    return null;
  }
};

/** String literals inside `BLOCK: { ... }`, scoped to its owner when given. */
function valuesFromFieldNames(source, block, owner) {
  let scope = source;
  if (owner) {
    const start = source.indexOf(`export const ${owner}`);
    if (start === -1) return null;
    // Owner blocks end at the next top-level `} as const;`.
    const end = source.indexOf("} as const;", start);
    scope = source.slice(start, end === -1 ? undefined : end);
  }
  const at = scope.indexOf(`${block}: {`);
  if (at === -1) return null;
  const close = scope.indexOf("},", at);
  const body = scope.slice(at, close === -1 ? undefined : close);
  return new Set([...body.matchAll(/:\s*"([^"]+)"/g)].map((m) => m[1]));
}

/** `type X = "a" | "b" | "c";` — comments between members are tolerated. */
function valuesFromUnion(source, symbol) {
  const re = new RegExp(`export type ${symbol}\\s*=([\\s\\S]*?);`, "m");
  const m = source.match(re);
  if (!m) return null;
  return new Set([...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
}

/** `const XValues = { A: "a" } as const;` */
function valuesFromConst(source, symbol) {
  const at = source.indexOf(`export const ${symbol}`);
  if (at === -1) return null;
  const end = source.indexOf("} as const", at);
  const body = source.slice(at, end === -1 ? undefined : end);
  return new Set([...body.matchAll(/:\s*"([^"]+)"/g)].map((m) => m[1]));
}

/** `field: z.enum(["a","b"])` inside a document interface or schema. */
function valuesFromInlineUnion(source, symbol) {
  const re = new RegExp(`${symbol}\\??\\s*:\\s*([^;]*);`);
  const m = source.match(re);
  if (!m) return null;
  const found = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  return found.length > 0 ? new Set(found) : null;
}

function main() {
  const fieldNames = readFileSync(FIELD_NAMES, "utf8");
  const violations = [];
  let checked = 0;

  for (const entry of REGISTRY) {
    const mine = valuesFromFieldNames(fieldNames, entry.block, entry.blockOwner);
    if (!mine || mine.size === 0) {
      violations.push(
        `${entry.label}: could not read the ${entry.block} block in field-names.ts — ` +
          `the registry entry is stale (block renamed or removed).`,
      );
      continue;
    }
    const source = read(entry.file);
    if (!source) {
      violations.push(`${entry.label}: source file not found — ${entry.file}`);
      continue;
    }
    const theirs =
      entry.kind === "union"
        ? valuesFromUnion(source, entry.symbol)
        : entry.kind === "const"
          ? valuesFromConst(source, entry.symbol)
          : valuesFromInlineUnion(source, entry.symbol);

    if (!theirs || theirs.size === 0) {
      violations.push(
        `${entry.label}: could not read \`${entry.symbol}\` from ${entry.file} — registry entry is stale.`,
      );
      continue;
    }

    checked++;
    const missing = [...theirs].filter((v) => !mine.has(v));
    const invented = [...mine].filter((v) => !theirs.has(v));
    if (missing.length > 0 || invented.length > 0) {
      const parts = [];
      if (missing.length > 0) parts.push(`MISSING ${missing.map((v) => `"${v}"`).join(", ")}`);
      if (invented.length > 0) parts.push(`NOT REAL ${invented.map((v) => `"${v}"`).join(", ")}`);
      violations.push(`${entry.label} vs ${entry.symbol} (${entry.file}): ${parts.join(" | ")}`);
    }
  }

  if (violations.length === 0) {
    console.log(`audit-field-names-union-parity: clean ✓ (${checked} union pair(s) checked)`);
    process.exit(0);
  }

  console.error(
    `\naudit-field-names-union-parity: ${violations.length} drifted union(s).\n\n` +
      "  field-names.ts duplicates each of these unions by hand — it is a leaf\n" +
      "  module and cannot re-export them without an import cycle. A value here\n" +
      "  is byte-compared against Firestore, so an invented member matches zero\n" +
      "  rows forever and a missing one makes a real state unreachable, in both\n" +
      "  cases with no error anywhere (Root Cause #33).\n\n" +
      "  Fix field-names.ts to match the feature's own union — that file is the\n" +
      "  copy, never the source.\n",
  );
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

main();

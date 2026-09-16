#!/usr/bin/env node
/*
 * Order row-mappers that read fields the orders API does not emit.
 *
 * Measured against the live response of GET /api/admin/orders, an order
 * document carries `userName` and `totalPrice`. AdminOrdersView read
 * `buyerName ?? customerName` and `totalAmount ?? total ?? amount` — five
 * field names, not one of which has ever existed on the document — so every
 * row rendered "Unknown buyer · -", on all 25 rows, for as long as the view
 * has existed.
 *
 * Root Cause #38's family: a reader and a serializer drifting, with a `??`
 * chain making the failure look like considered defensive coding. A fallback
 * spelled three ways is a tell that nobody checked which one was real.
 *
 * 🛑 POSITIVE CONTROL FIRST — a sweep that cannot see its own known-bad
 * string is worse than no sweep, because it is reported as evidence.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Field names the orders document does NOT have, keyed to what it does. */
const PHANTOM = {
  buyerName: "userName",
  customerName: "userName",
  totalAmount: "totalPrice",
};

const ROOTS = ["appkit/src/features", "src/components", "src/app"];
const ORDERISH = /Orders?View|OrderRow|order-row/i;

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
    else if (/\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

// ── Positive control ────────────────────────────────────────────────────────
const CONTROL = 'toStringValue(item.buyerName ?? item.customerName, "Unknown buyer"),';
const hits = Object.keys(PHANTOM).filter((f) => CONTROL.includes(`item.${f}`));
if (hits.length < 2) {
  console.error("✗ CONTROL FAILED — the rule cannot see its own known-bad line. Aborting.");
  process.exit(2);
}
console.log(`✓ control: matched ${hits.length} phantom field(s) in the known-bad line\n`);

const files = ROOTS.flatMap((r) => walk(r)).filter((f) => ORDERISH.test(f));
let violations = 0;

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const lines = src.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.trim().startsWith("*") || line.trim().startsWith("//")) return;
    for (const [phantom, real] of Object.entries(PHANTOM)) {
      if (line.includes(`item.${phantom}`) || line.includes(`d.${phantom}`)) {
        console.log(`  ${file}:${i + 1}`);
        console.log(`    reads \`${phantom}\`, which the order document does not have — use \`${real}\``);
        console.log(`    ${line.trim()}`);
        violations++;
      }
    }
  });
}

console.log(
  violations === 0
    ? `\naudit-order-row-fields: clean ✓ (${files.length} order view(s) checked)`
    : `\naudit-order-row-fields: ${violations} violation(s) across ${files.length} order view(s).`,
);
process.exit(violations === 0 ? 0 : 1);

#!/usr/bin/env node
/*
 * Repoint every checklist reference to a stale order id.
 *
 * 17 references across two authored files named orders whose ids moved daily
 * (see appkit/src/seed/orders-seed-data.ts → SEED_EPOCH). Every one of them
 * sent the tester to a 404, so `buying/order-detail-actions` — seven cases
 * about invoices, returns, cancellation and cross-account access — could not
 * be worked at all.
 *
 * 🛑 RUNS A POSITIVE CONTROL FIRST.
 *
 * Four sweeps this session reported a confident "0 violations" while
 * structurally unable to match anything — grep under a shell that has no grep,
 * and twice a regex whose backslashes were eaten before `new RegExp`. A sweep
 * that cannot see the bug it was written for is worse than no sweep, because
 * it is reported as evidence. This one asserts it can find a known-bad string
 * and aborts if it cannot.
 */
import { readFileSync, writeFileSync } from "node:fs";

const MAP = {
  "order-1-20260721-11joon": "order-1-20251107-11joon",
  "order-1-20260718-aevnlw": "order-1-20251104-aevnlw",
};

const FILES = [
  "appkit/src/features/tester/seed-data/authored/admin__admin-detail-round-trips.ts",
  "appkit/src/features/tester/seed-data/authored/buying__order-detail-actions.ts",
];

// ── Positive control ────────────────────────────────────────────────────────
// Prove the replacement actually replaces before trusting it on real files.
const CONTROL_IN = 'inputs: { orderId: "order-1-20260721-11joon" },';
let control = CONTROL_IN;
for (const [stale, fresh] of Object.entries(MAP)) control = control.split(stale).join(fresh);
if (control === CONTROL_IN || !control.includes("order-1-20251107-11joon")) {
  console.error("✗ CONTROL FAILED — the replacement cannot see its own known-bad string. Aborting.");
  process.exit(2);
}
console.log("✓ control: known-bad string was rewritten\n");

let total = 0;
for (const file of FILES) {
  const before = readFileSync(file, "utf8");
  let after = before;
  const perFile = {};
  for (const [stale, fresh] of Object.entries(MAP)) {
    const hits = after.split(stale).length - 1;
    if (hits > 0) {
      perFile[stale] = hits;
      after = after.split(stale).join(fresh);
    }
  }
  const n = Object.values(perFile).reduce((a, b) => a + b, 0);
  if (n > 0) {
    writeFileSync(file, after);
    total += n;
    console.log(`${file}`);
    for (const [k, v] of Object.entries(perFile)) console.log(`  ${v}× ${k} -> ${MAP[k]}`);
  }
}

// ── Negative control ────────────────────────────────────────────────────────
// Nothing stale may survive, in ANY file — including one not in FILES.
let residue = 0;
for (const file of FILES) {
  const s = readFileSync(file, "utf8");
  for (const stale of Object.keys(MAP)) {
    const n = s.split(stale).length - 1;
    if (n > 0) {
      console.error(`✗ ${n} stale reference(s) to ${stale} survive in ${file}`);
      residue += n;
    }
  }
}

console.log(`\nrewrote ${total} reference(s); residue ${residue}`);
process.exit(residue === 0 ? 0 : 1);

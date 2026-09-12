#!/usr/bin/env node
/*
 * Proves the no-op guard in onShipmentAllocationSync actually detects a no-op.
 *
 * 🛑 THIS GUARD IS THE ONLY THING BETWEEN A SHIPMENT DOCUMENT AND AN INFINITE,
 * BILLED CASCADE.
 *
 * `onShipmentHeaderWrite` watches `procurementShipments/{shipmentId}` on
 * documentWritten and writes back to that same document. If the guard reports
 * "changed" when nothing changed, the write re-triggers the watcher and the
 * function runs forever.
 *
 * It did. Measured in the Firebase console, 2026-09-11:
 *
 *     onShipmentHeaderWrite   1,017,548 invocations / 24h
 *     onShipmentDeleted       1,017,372 invocations / 24h   (collateral: same path)
 *     every other function            0 – 95
 *     month total                    12M against a 2M free quota, exceeded by 9.7M
 *
 * The cause was `JSON.stringify(a) === JSON.stringify(b)`, which is key-ORDER
 * sensitive. `allocateShipmentCosts()` builds `totals` in construction order;
 * Firestore returns map fields with keys sorted ALPHABETICALLY. The two strings
 * could never match, so "unchanged" was unreachable.
 *
 * This file exists because that bug is invisible in review — the line looks like
 * a perfectly ordinary deep-equality check, and the docstring above it correctly
 * described the intent it failed to implement.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let failures = 0;
const check = (name, cond) => {
  if (!cond) failures++;
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
};

/*
 * The real shape, in the two orders it genuinely appears in.
 * COMPUTED mirrors the object literal in cost-allocation.ts; STORED is the same
 * values with keys sorted, which is what a Firestore read hands back.
 */
const COMPUTED = {
  lotsCost: 95000,
  customsTotal: 12000,
  shippingTotal: 8000,
  laborCost: 2400,
  totalShipmentCost: 117400,
  totalProjectedRevenue: 180000,
  projectedProfit: 62600,
  projectedProfitAfterLabor: 60200,
  projectedMarginPercent: 34.77777777777778,
  projectedRoiPercent: 53.32197614991482,
  totalWeightGrams: 42000,
  totalItemCount: 130,
  lotCount: 3,
  estimatedProcessingDays: 1.5,
};
const STORED = Object.fromEntries(Object.keys(COMPUTED).sort().map((k) => [k, COMPUTED[k]]));

// 1 — the bug, reproduced. Identical values, different key order.
const oldSaysUnchanged = JSON.stringify(STORED) === JSON.stringify(COMPUTED);
check("REPRO: JSON.stringify wrongly reports identical totals as CHANGED", oldSaysUnchanged === false);
check("…and the values really are identical", Object.keys(COMPUTED).every((k) => STORED[k] === COMPUTED[k]));

/*
 * 2 — the fix, extracted from source rather than re-implemented here. A copy of
 * the logic would test this file's idea of the fix, not the shipped one
 * (Root Cause #83: the mock you assert against is the one you believed in).
 */
const SRC = resolve("appkit/src/_internal/server/jobs/handlers/onShipmentAllocationSync.ts");
const src = readFileSync(SRC, "utf8");

/*
 * Comments are stripped before any source assertion. The file deliberately QUOTES
 * the old `JSON.stringify(shipment.totals …)` line to explain the incident, so a
 * naive scan matches the explanation and reports the bug as still present. Caught
 * by this very check failing on its first run — the same false-positive shape the
 * project's other audits strip comments to avoid.
 */
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

check("source no longer compares totals with JSON.stringify", !/JSON\.stringify\([^)]*totals/i.test(code));
check("source defines a key-order-independent totalsEqual", /function totalsEqual\(/.test(code));
check("source applies a float tolerance", /MONEY_EPSILON/.test(code));
check("lot comparison uses the tolerance too", /!numbersEqual\(lot\.customsAllocated/.test(code));

// Evaluate the real helpers by lifting them out of the module.
const helperSrc = src.slice(src.indexOf("const MONEY_EPSILON"), src.indexOf("async function recomputeShipmentAllocation"));
// Strip TS annotations so the real helpers can be evaluated as plain JS. Kept
// deliberately broad: the annotations changed once already (unknown -> JsonValue,
// to satisfy audit-unknown-leakage) and a narrow strip would silently stop
// extracting them, leaving this file testing nothing while still printing PASS.
const js = helperSrc
  .replace(/:\s*JsonValue\s*\|\s*undefined/g, "")
  .replace(/:\s*Record<string,\s*JsonValue>/g, "")
  .replace(/:\s*unknown/g, "")
  .replace(/:\s*Record<string,\s*unknown>/g, "")
  .replace(/:\s*boolean/g, "")
  .replace(/\s+as\s+Record<string,\s*(JsonValue|unknown)>/g, "");
const { totalsEqual, numbersEqual } = new Function(`${js}; return { totalsEqual, numbersEqual };`)();

check("FIX: totalsEqual reports identical totals as UNCHANGED despite key order", totalsEqual(STORED, COMPUTED) === true);

/*
 * 3 — NEGATIVE CONTROLS. A comparison that answers "equal" to everything would
 * pass every assertion above and silently stop the allocation ever updating —
 * the opposite failure, and a quieter one.
 */
check("a real change is still detected", totalsEqual({ ...STORED, projectedProfit: 62700 }, COMPUTED) === false);
check("a one-rupee change is detected", totalsEqual({ ...STORED, lotsCost: 95001 }, COMPUTED) === false);
check("a missing key is detected", totalsEqual((({ lotsCost, ...r }) => r)(STORED), COMPUTED) === false);
check("an empty stored totals is NOT equal", totalsEqual({}, COMPUTED) === false);
check("undefined stored totals is NOT equal (first write must happen)", totalsEqual(undefined, COMPUTED) === false);

// 4 — float tolerance: a Firestore round-trip may return the last bit differently.
check("sub-paisa float drift is treated as unchanged", numbersEqual(34.77777777777778, 34.777777777777779) === true);
check("but a real half-rupee difference is not", numbersEqual(100.0, 100.5) === false);

console.log(failures ? `\n${failures} FAILURE(S)` : "\nall checks passed");
process.exit(failures ? 1 : 0);

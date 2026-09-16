#!/usr/bin/env node
/*
 * Add "user" to every role gate that names "buyer" but not "user".
 *
 * `requireRole` is a plain `allowed.includes(userRole)` — so a gate listing
 * ["buyer","seller","admin"] rejects every ordinary buyer, whose role is
 * "user". Measured: requestReturnAction failed for user-yugi-muto with a
 * generic "Failed to submit refund request" on a completely valid form.
 *
 * `prize-draws/actions.ts` already reads ["user","buyer","seller","admin"] and
 * works — it is the in-repo control for what the correct list looks like.
 *
 * "buyer" is KEPT rather than replaced: it costs nothing, some deployment may
 * carry it as a custom claim, and removing it is a second, separable decision.
 * This change only widens a gate that was refusing the people it exists for.
 *
 * 🛑 CONTROLS BOTH WAYS before touching a file.
 */
import { readFileSync, writeFileSync } from "node:fs";

const GATE = /require(?:Role|RoleUser|AnyRole)\s*\(\s*\[([^\]]*)\]/g;

function fixLine(line) {
  return line.replace(GATE, (whole, inner) => {
    if (!/["']buyer["']/.test(inner)) return whole;      // not a buyer gate
    if (/["']user["']/.test(inner)) return whole;        // already correct
    return whole.replace(/\[\s*/, '["user", ');
  });
}

// ── Controls ────────────────────────────────────────────────────────────────
const BAD = `const user = await requireRoleUser(["buyer", "seller", "admin"]);`;
const fixed = fixLine(BAD);
if (!/\["user", "buyer", "seller", "admin"\]/.test(fixed)) {
  console.error(`✗ CONTROL FAILED — did not widen the known-bad gate. Got: ${fixed}`);
  process.exit(2);
}
const GOOD = `const user = await requireRoleUser(["user", "buyer", "seller", "admin"]);`;
if (fixLine(GOOD) !== GOOD) {
  console.error("✗ CONTROL FAILED — modified an already-correct gate. Aborting.");
  process.exit(2);
}
const UNRELATED = `shippingPaidBy: z.enum(["buyer", "seller"]).optional(),`;
if (fixLine(UNRELATED) !== UNRELATED) {
  console.error("✗ CONTROL FAILED — modified a Zod value enum. Aborting.");
  process.exit(2);
}
console.log("✓ controls: widens the bad gate, leaves the good gate and a value enum alone\n");

// ── Apply ───────────────────────────────────────────────────────────────────
let changed = 0;
for (const file of process.argv.slice(2)) {
  const src = readFileSync(file, "utf8");
  const next = src
    .split(/\r?\n/)
    .map((l) => (l.trim().startsWith("*") || l.trim().startsWith("//") ? l : fixLine(l)))
    .join("\n");
  if (next !== src) {
    writeFileSync(file, next);
    console.log(`  + ${file.replace(/\\/g, "/")}`);
    changed++;
  }
}
console.log(`\n${changed} file(s) updated`);

/**
 * I9 — colourway matching, against the user's own case.
 *
 * 🛑 THE DEFECT THIS PREVENTS. One glossary row, `performance-tip--mb` ("Metal
 * Ball"), is two physically different units:
 *
 *   silver            -> ships with L-Drago Guardian S130MB. Rare and costly.
 *   transparent-black -> ships with Poison Zurafa S130MB.
 *
 * Same mould, same weight, same stats, same behaviour, and NOT interchangeable:
 * to build an L-Drago you need the silver one. A "buildable now" rollup that
 * matched on `partId` alone would report the L-Drago as buildable while the only
 * MB on the shelf was the Zurafa black — a confident, specific, wrong answer
 * with no error, discovered by the seller holding the wrong part.
 *
 * So the control that matters is the INVERSION: hold only the black one, and the
 * answer must flip between the two models.
 */
import { createRequire } from "node:module";
globalThis.require = createRequire(import.meta.url);

const {
  normaliseColourway, satisfiesSlot, matchSlotToHoldings,
} = await import("@mohasinac/appkit/features/parts/utils/colourway-match");

let pass = 0;
let fail = 0;
const ok = (c, m) => {
  if (c) { pass++; console.log("  PASS", m); } else { fail++; console.log("  FAIL", m); }
};

/* ── the two models' MB slots, and the two physical units ───────────────── */
const L_DRAGO_MB = { partId: "performance-tip--mb", expectedColourway: "silver" };
const ZURAFA_MB = { partId: "performance-tip--mb", expectedColourway: "transparent black" };
const AGNOSTIC_MB = { partId: "performance-tip--mb" }; // no colour named

const silverMb = { productId: "p-mb-silver", partGlossaryId: "performance-tip--mb", colourway: "Silver", availableQuantity: 1 };
const blackMb = { productId: "p-mb-black", partGlossaryId: "performance-tip--mb", colourway: "Transparent Black", availableQuantity: 4 };

console.log("\n=== 1. normalisation — one colour typed three ways ===");
ok(normaliseColourway("Transparent Black") === "transparent-black", "spaces and case fold");
ok(normaliseColourway("transparent-black") === "transparent-black", "...to the same value as the hyphenated form");
ok(normaliseColourway("  Transparent   Black  ") === "transparent-black", "...and the sloppily typed one");
ok(normaliseColourway(undefined) === "" && normaliseColourway(null) === "", "absent is the empty string, not a crash");

console.log("\n=== 2. 🛑 THE INVERSION CONTROL — hold only the black MB ===");
{
  const holdings = [blackMb];
  const zurafa = matchSlotToHoldings(ZURAFA_MB, holdings);
  const lDrago = matchSlotToHoldings(L_DRAGO_MB, holdings);
  ok(zurafa.buildable === 4, "Poison Zurafa: buildable (4 black MBs on the shelf)");
  ok(lDrago.buildable === 0, "🛑 L-Drago Guardian: NOT buildable — the silver MB is a different physical part");
  ok(lDrago.candidates.length === 0, "...and it offers no candidate rather than the wrong one");
}

console.log("\n=== 3. ...and it INVERTS when the holding does ===");
{
  const holdings = [silverMb];
  ok(matchSlotToHoldings(L_DRAGO_MB, holdings).buildable === 1, "L-Drago: buildable");
  ok(matchSlotToHoldings(ZURAFA_MB, holdings).buildable === 0, "Zurafa: NOT buildable");
}
{
  /* A matcher that ignored colourway entirely would pass sections 2 and 3's
   * positive halves and fail only the negatives — which is why both directions
   * are asserted rather than one. */
  const both = matchSlotToHoldings(AGNOSTIC_MB, [silverMb, blackMb]);
  ok(both.buildable === 5, "a COLOUR-AGNOSTIC slot accepts both (1 + 4), so the ids really do match");
}

console.log("\n=== 4. unset means ANY; a named colour refuses an unknown one ===");
ok(
  satisfiesSlot(AGNOSTIC_MB, { productId: "x", partGlossaryId: "performance-tip--mb", availableQuantity: 1 }) === true,
  "a colour-agnostic slot accepts a holding that declares no colour",
);
ok(
  satisfiesSlot(L_DRAGO_MB, { productId: "x", partGlossaryId: "performance-tip--mb", availableQuantity: 1 }) === false,
  "🛑 a slot naming 'silver' REFUSES a holding with no colour — unknown is not evidence of the right colour",
);
ok(
  satisfiesSlot({ partId: "driver--atomic", expectedColourway: "silver" }, silverMb) === false,
  "the glossary id still has to match — a Driver is not a Bit, whatever the colour",
);
ok(
  satisfiesSlot(AGNOSTIC_MB, { ...silverMb, availableQuantity: 0 }) === false,
  "a holding at 0 AVAILABLE satisfies nothing",
);
ok(
  satisfiesSlot({ expectedColourway: "silver" }, silverMb) === false,
  "a slot with no partId satisfies nothing — it has not been resolved to a glossary row",
);

console.log("\n=== 5. two listings of the same part in the same colour ADD UP ===");
{
  const a = { ...silverMb, productId: "p-a", availableQuantity: 2 };
  const b = { ...silverMb, productId: "p-b", availableQuantity: 3 };
  const m = matchSlotToHoldings(L_DRAGO_MB, [a, b]);
  ok(m.buildable === 5, "2 + 3 = 5 — two piles of the same thing");
  ok(m.candidates[0].productId === "p-b", "richest first, so a picker defaults to the deepest pile");
}

console.log(`\n${fail === 0 ? "all checks passed" : "FAILURES"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

/**
 * D13 — the assembly DECISION, against the real `planAssembly`.
 *
 * 🛑 The thing being proved is which FIELD gates a build. A component with 10
 * in stock and 3 reserved has SEVEN assemblable; planning against
 * `stockQuantity` would build a bey out of parts somebody has already bought,
 * and nothing would error — the listing would simply become unbuyable later,
 * which is A4's bug through a new door.
 *
 * 🛑 This file replaces a mock-based harness that reported every ordering
 * assertion as green having executed NONE of them: the ESM namespace is frozen,
 * so `getAdminDb` could not be replaced and the fake transaction was never
 * reached. The harness caught itself because it asserted the fake had been
 * reached before trusting a pass — and the fix was not a cleverer mock, it was
 * moving the decision OUT of the transaction so there is nothing to mock.
 *
 * What stays untested here, stated rather than implied: the read-before-write
 * ORDERING inside `runTransaction`. That is now three lines of `tx.getAll`
 * followed by a `for` loop of `tx.update`, with no branching between them, and
 * Firestore itself rejects a read after a write.
 */
import {
  planAssembly,
  assertAssemblyInput,
  MAX_ASSEMBLY_COMPONENTS,
} from "../node_modules/@mohasinac/appkit/dist/_internal/server/features/parts/assembly.js";

let pass = 0;
let fail = 0;
const ok = (c, m) => {
  if (c) {
    pass++;
    console.log("  PASS", m);
  } else {
    fail++;
    console.log("  FAIL", m);
  }
};
const throws = (fn, name) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e?.name === name ? e : { name: e?.name, message: e?.message, _wrong: true };
  }
};

const part = (stock, available, storeId = "s") => ({
  stockQuantity: stock,
  availableQuantity: available,
  storeId,
});
const req = (productId, quantity = 1, slotKey = "layer") => ({ slotKey, productId, quantity });

console.log("\n=== 1. input rules, shared by both directions ===");
for (const [u, why] of [
  [0, "zero"],
  [-1, "negative"],
  [1.5, "fractional"],
  [100, "over 99"],
]) {
  ok(
    throws(() => assertAssemblyInput([req("p1")], u), "ValidationError"),
    `units=${u} (${why}) is refused`,
  );
}
ok(throws(() => assertAssemblyInput([], 1), "ValidationError"), "an empty component list is refused");
ok(
  throws(
    () =>
      assertAssemblyInput(
        Array.from({ length: MAX_ASSEMBLY_COMPONENTS + 1 }, (_, i) => req(`p${i}`)),
        1,
      ),
    "ValidationError",
  ),
  `more than ${MAX_ASSEMBLY_COMPONENTS} components is refused`,
);
// 🛑 THE DUPLICATE CONTROL. Two rows for one product are each planned against
// the SAME read value and each subtract from it, so the second overdraws.
ok(
  throws(() => assertAssemblyInput([req("p1"), req("p1", 1, "other")], 1), "ValidationError"),
  "the SAME component twice is refused, not silently summed",
);
ok(
  assertAssemblyInput(
    Array.from({ length: MAX_ASSEMBLY_COMPONENTS }, (_, i) => req(`p${i}`)),
    99,
  ) === undefined,
  "CONTROL exactly 8 components and 99 units is ACCEPTED — a boundary, not a blanket refusal",
);

const plan = (over) =>
  planAssembly({
    storeId: "s",
    subject: { productId: "t", doc: part(0, 0) },
    components: [{ request: req("p1"), doc: part(5, 5) }],
    units: 1,
    direction: -1,
    ...over,
  });

console.log("\n=== 2. 🛑 WHICH FIELD GATES THE BUILD ===");
{
  // 10 in stock, 3 reserved -> 7 available. Asking for 8 must FAIL.
  const e = throws(
    () => plan({ components: [{ request: req("p1", 8), doc: part(10, 7) }] }),
    "ConflictError",
  );
  ok(e && !e._wrong, "8 from (stock 10 / available 7) is a CONFLICT, not a success");
  ok(/has 7/.test(e?.message ?? ""), "the message names AVAILABLE (7), never stock (10)");
  ok(!/has 10/.test(e?.message ?? ""), "and it does not mention 10 at all");
}
{
  const p = plan({ components: [{ request: req("p1", 7), doc: part(10, 7) }] });
  ok(p.writes[0].availableQuantity === 0, "CONTROL 7 from the same stock SUCCEEDS, available -> 0");
  ok(
    p.writes[0].stockQuantity === 3,
    "and stock -> 3: the 3 RESERVED units are carried forward, not handed back to the shelf",
  );
  ok(
    p.writes[0].stockQuantity - p.writes[0].availableQuantity === 3,
    "the reservation (stock − available) is UNCHANGED at 3 — the invariant that matters",
  );
}
{
  // A component with everything reserved can build nothing, even with stock.
  const e = throws(
    () => plan({ components: [{ request: req("p1", 1), doc: part(99, 0) }] }),
    "ConflictError",
  );
  ok(e && !e._wrong, "stock 99 / available 0 builds NOTHING — the reserved case, exactly");
}
{
  const e = throws(
    () => plan({ components: [{ request: req("p1", 2), doc: part(5, 5) }], units: 3 }),
    "ConflictError",
  );
  ok(e && !e._wrong, "quantity 2 x 3 units = 6 against 5 available is a conflict");
  ok(/needs 6/.test(e?.message ?? ""), "the message multiplies quantity BY units (needs 6, not 2)");
}

console.log("\n=== 3. the arithmetic ===");
{
  const p = planAssembly({
    storeId: "s",
    subject: { productId: "t", doc: part(1, 1) },
    components: [
      { request: req("p1", 1, "a"), doc: part(5, 5) },
      { request: req("p2", 2, "b"), doc: part(9, 9) },
    ],
    units: 2,
    direction: -1,
  });
  ok(p.writes.length === 2, "one write per component");
  ok(p.writes[0].availableQuantity === 3, "p1: 5 − (1 x 2) = 3");
  ok(p.writes[1].availableQuantity === 5, "p2: 9 − (2 x 2) = 5 — quantity 2 is not treated as 1");
  ok(
    p.target.stockQuantity === 3 && p.target.availableQuantity === 3,
    "the target gains 2 units on BOTH fields (1 + 2)",
  );
  ok(p.consumed.length === 2 && p.consumed[1].taken === 4, "`consumed` reports 4 taken from p2");
  ok(
    p.consumed[1].before - p.consumed[1].after === 4,
    "and before − after agrees with taken",
  );
}
{
  // Stock must never go negative even if the two fields disagree on input.
  const p = plan({ components: [{ request: req("p1", 3), doc: part(1, 9) }] });
  ok(p.writes[0].stockQuantity === 0, "stockQuantity floors at 0 rather than going negative");
}

console.log("\n=== 4. store scoping and missing documents ===");
ok(
  throws(() => plan({ subject: { productId: "t", doc: undefined } }), "ValidationError"),
  "a missing SUBJECT is refused",
);
ok(
  throws(
    () => plan({ components: [{ request: req("p1"), doc: undefined }] }),
    "ValidationError",
  ),
  "a missing COMPONENT is refused",
);
ok(
  throws(
    () => plan({ components: [{ request: req("p1"), doc: part(5, 5, "OTHER") }] }),
    "ValidationError",
  ),
  "a component owned by ANOTHER store is refused",
);
ok(
  throws(
    () => plan({ subject: { productId: "t", doc: part(0, 0, "OTHER") } }),
    "ValidationError",
  ),
  "a subject owned by ANOTHER store is refused",
);
{
  // A document with no storeId at all must not be refused — that is a data
  // shape, not an ownership claim.
  const p = plan({ components: [{ request: req("p1"), doc: { stockQuantity: 5, availableQuantity: 5 } }] });
  ok(p.writes.length === 1, "CONTROL a component with NO storeId is allowed, not refused");
}

console.log("\n=== 5. part-out is the same planner, direction +1 ===");
{
  const p = planAssembly({
    storeId: "s",
    subject: { productId: "x", doc: part(2, 2) },
    components: [{ request: req("p1", 1, "a"), doc: part(0, 0) }],
    units: 1,
    direction: 1,
  });
  ok(p.target.availableQuantity === 1, "the bey loses a unit");
  ok(
    p.writes[0].availableQuantity === 1 && p.writes[0].stockQuantity === 1,
    "the component gains one on BOTH fields",
  );
  ok(p.consumed[0].taken === -1, "`taken` is negative on a part-out, so the two read differently");
}
{
  // 🛑 A bey with 2 in stock and 1 reserved can only have ONE parted out.
  const e = throws(
    () =>
      planAssembly({
        storeId: "s",
        subject: { productId: "x", doc: part(2, 1) },
        components: [{ request: req("p1"), doc: part(0, 0) }],
        units: 2,
        direction: 1,
      }),
    "ConflictError",
  );
  ok(e && !e._wrong, "parting out 2 from (stock 2 / available 1) is a CONFLICT");
  ok(/has 1/.test(e?.message ?? ""), "the message names the AVAILABLE figure on this side too");
}
{
  // CONTROL — on an ASSEMBLY the subject only gains, so a subject with zero
  // available must NOT be gated. If it were, no first build could ever happen.
  const p = plan({ subject: { productId: "t", doc: part(0, 0) } });
  ok(p.target.availableQuantity === 1, "CONTROL an assembly onto a 0-available target succeeds");
}
{
  // CONTROL — a component with 0 available is fine as a part-out DESTINATION.
  const p = planAssembly({
    storeId: "s",
    subject: { productId: "x", doc: part(1, 1) },
    components: [{ request: req("p1"), doc: part(0, 0) }],
    units: 1,
    direction: 1,
  });
  ok(p.writes[0].availableQuantity === 1, "CONTROL a 0-available component receives parts fine");
}

console.log(`\n${fail === 0 ? "all checks passed" : "FAILURES"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

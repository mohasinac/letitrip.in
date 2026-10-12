/**
 * D12 — the `{{partBreakdown}}` slot, end to end against REAL data.
 *
 * Every assertion below has a negative control, because the failure mode here
 * is silent and plausible: a slot that resolves to "" renders an empty bullet,
 * and a body whose line was stripped looks exactly like a body that never had
 * one. Both read as fine.
 */
import admin from "firebase-admin";
import sa from "../firebase-admin-key.json" with { type: "json" };
import {
  formatPartBreakdown,
  stripSlotLine,
  PART_BREAKDOWN_SLOT,
} from "../node_modules/@mohasinac/appkit/dist/features/parts/utils/part-breakdown.js";
import { usedPlaceholders, interpolate } from "../node_modules/@mohasinac/appkit/dist/_internal/shared/templating/placeholders.js";
import { BEY_TEMPLATES, COLLECTIBLE_TEMPLATES, PART_TEMPLATES } from "../node_modules/@mohasinac/appkit/dist/seed/_helpers/category-content.js";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  PASS", m); } else { fail++; console.log("  FAIL", m); } };

admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

console.log("\n=== 1. the seeded bodies ===");
ok(BEY_TEMPLATES.length === 4, `BEY_TEMPLATES has 4 bodies (got ${BEY_TEMPLATES.length})`);
for (const t of BEY_TEMPLATES) {
  const ph = usedPlaceholders(t.body);
  ok(ph.includes(PART_BREAKDOWN_SLOT), `${t.variant} declares {{partBreakdown}}`);
  ok(
    t.body.split("\n").filter((l) => l.includes(`{{${PART_BREAKDOWN_SLOT}}}`)).length === 1,
    `${t.variant} carries the slot on exactly ONE source line (the strip is line-based)`,
  );
}
// CONTROL — the shared sets must NOT carry it, or every figure/TCG/Hot Wheels
// category pays for a read it can never satisfy.
for (const [name, set] of [["COLLECTIBLE_TEMPLATES", COLLECTIBLE_TEMPLATES], ["PART_TEMPLATES", PART_TEMPLATES]])
  ok(
    set.every((t) => !usedPlaceholders(t.body).includes(PART_BREAKDOWN_SLOT)),
    `CONTROL ${name} does NOT carry the slot`,
  );

console.log("\n=== 2. formatPartBreakdown against a REAL composition ===");
const snap = await db.collection("modelComposition").where("categoryId", "!=", null).limit(400).get();
const withSlots = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((c) => (c.slots ?? []).length > 0);
ok(withSlots.length > 0, `found ${withSlots.length} joined compositions carrying slots`);
const comp = withSlots[0];
const out = formatPartBreakdown([comp]);
console.log("    →", out.slice(0, 150));
ok(out.length > 0, "a real composition formats to a non-empty line");
ok(!out.includes("undefined") && !out.includes("NaN"), "no undefined/NaN leaked into the line");
ok(out.split(" · ").length === comp.slots.filter((s) => (s.partName ?? "").trim()).length,
   "one piece per named slot, none dropped and none invented");
ok(/[A-Z]/.test(out) && out.includes(" — "), "each piece reads `Label — Part name`");
const withWeight = withSlots.find((c) => (c.slots ?? []).some((s) => typeof s.weightG === "number"));
if (withWeight) {
  const line = formatPartBreakdown([withWeight]);
  ok(/\(\d+(\.\d+)? g\)/.test(line), `a recorded weight renders as \`(N g)\` — ${line.slice(0, 70)}`);
}

console.log("\n=== 3. absence ===");
ok(formatPartBreakdown([]) === "", "CONTROL no composition -> empty string (the strip signal)");
ok(formatPartBreakdown([{ id: "x", name: "x", generation: null, slots: [] }]) === "",
   "CONTROL a composition with zero slots -> empty string");
ok(formatPartBreakdown([{ id: "x", name: "x", generation: null, slots: [{ slotKey: "layer", slotLabel: "", partName: "   " }] }]) === "",
   "CONTROL a blank partName is dropped, not rendered as a bare label");

console.log("\n=== 4. stripSlotLine ===");
const body = BEY_TEMPLATES[0].body;
const stripped = stripSlotLine(body, PART_BREAKDOWN_SLOT);
ok(!stripped.includes(`{{${PART_BREAKDOWN_SLOT}}}`), "the slot is gone from the stripped body");
ok(stripped.split("\n").length === body.split("\n").length - 1, "EXACTLY one line removed");
ok(stripped.includes("</ul>") && stripped.includes("{{title}}"),
   "every other line survives (the list still closes, the title still interpolates)");
// CONTROL — a body that never had the slot must come back byte-identical.
ok(stripSlotLine(COLLECTIBLE_TEMPLATES[0].body, PART_BREAKDOWN_SLOT) === COLLECTIBLE_TEMPLATES[0].body,
   "CONTROL a body without the slot is returned UNCHANGED");

console.log("\n=== 5. end to end: what the seller's description actually says ===");
const ctx = {
  title: "Dragoon MS", brand: "Takara", condition: "Used", category: "Beyblade",
  categoryPath: "Spinning Tops › Beyblade (Original) › HMS", series: "Beyblade HMS",
  system: "Heavy Metal System", siteName: "LetItRip", year: "2003", type: "Attack", spin: "right",
  storeName: "Beyblade Arena",
};
const filledWith = interpolate(body, { ...ctx, [PART_BREAKDOWN_SLOT]: out });
const htmlWith = typeof filledWith === "string" ? filledWith : filledWith.text;
ok(htmlWith.includes(out.split(" · ")[0]), "WITH a composition: the first part appears in the description");
ok(!htmlWith.includes("{{"), "WITH a composition: no literal {{slot}} survives");
ok(!/<strong>Parts:<\/strong>\s*<\/li>/.test(htmlWith), "WITH a composition: the Parts bullet is not empty");

const filledWithout = interpolate(stripped, ctx);
const htmlWithout = typeof filledWithout === "string" ? filledWithout : filledWithout.text;
ok(!htmlWithout.includes("Parts:"), "WITHOUT a composition: NO Parts bullet at all — the line was removed, not emptied");
ok(htmlWithout.includes("Dragoon MS"), "WITHOUT a composition: the rest of the body is intact");
// The defect this whole design exists to prevent, reproduced deliberately.
const naive = interpolate(body, ctx);
const naiveHtml = typeof naive === "string" ? naive : naive.text;
ok(/<strong>Parts:<\/strong>\s*<\/li>/.test(naiveHtml),
   "CONTROL interpolating WITHOUT stripping DOES produce the empty bullet (so the strip is load-bearing)");

console.log(`\n${fail === 0 ? "all checks passed" : "FAILURES"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

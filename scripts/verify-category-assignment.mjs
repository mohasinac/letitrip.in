/**
 * I1/I2 — multi-category assignment, verified against the COMPILED module.
 *
 * 🛑 It imports `appkit/dist`, not the source, and that is deliberate. The
 * consumer compiles against `dist/*.d.ts` and the seed CLI loads
 * `node_modules/@mohasinac/appkit`, so a rule that is right in `src` and absent
 * from `dist` is a rule that does not run (Root Cause #28). If this file cannot
 * resolve the export, the build has not happened — which is itself the finding.
 *
 * The three things worth asserting, in order of how badly each would hurt:
 *
 *   1. `categorySlugs[0]` is STILL the default leaf. ~30 call sites read it as
 *      that — the order-item snapshot, both count writers, both triggers, eight
 *      detail views. A set-shaped union breaks every one of them silently.
 *   2. The default is the DEEPEST assignment, not the busiest. Count-first
 *      would put a franchise above every product and widen its realised-price
 *      band from one model to a whole franchise.
 *   3. One per root is refused, and the lot rule still is — while the single
 *      rule only WARNS until the data is clean.
 */
import { createRequire } from "node:module";
globalThis.require = createRequire(import.meta.url);

const mod = await import("@mohasinac/appkit/features/products/repository/category-assignment");
const {
  MAX_CATEGORY_ASSIGNMENTS,
  ENFORCE_LEAF_FILING,
  readAssignments,
  assertAssignmentShape,
  pickDefaultAssignment,
  buildTaxonomyClosure,
  findLeafRuleOffenders,
} = mod;

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
const throws = (fn, needle, m) => {
  try {
    fn();
    ok(false, `${m} (did not throw)`);
  } catch (err) {
    ok(
      String(err?.message ?? "").toLowerCase().includes(needle.toLowerCase()),
      `${m} — "${String(err?.message ?? "").slice(0, 68)}…"`,
    );
  }
};

/* Fixtures mirroring the real forest: a model leaf at tier 4 under Spinning
 * Tops, a franchise leaf at tier 1 under Franchises, and a line node at tier 3. */
const dragoonG = {
  id: "category-dragoon-g", name: "Dragoon G", rootId: "category-spinning-tops",
  tier: 4, isLeaf: true,
  parentIds: ["category-spinning-tops", "category-beyblade-original", "category-original-tops", "category-g-revolution"],
  ancestorNames: ["Spinning Tops", "Beyblade Original", "Original Tops", "G Revolution"],
};
const drigerG = { ...dragoonG, id: "category-driger-g", name: "Driger G" };
const beybladeFranchise = {
  id: "category-beyblade", name: "Beyblade", rootId: "category-franchises",
  tier: 1, isLeaf: true,
  parentIds: ["category-franchises"], ancestorNames: ["Franchises"],
};
const engineGear = {
  id: "category-engine-gear", name: "Engine Gear", rootId: "category-spinning-tops",
  tier: 3, isLeaf: false,
  parentIds: ["category-spinning-tops", "category-beyblade-original", "category-original-tops"],
  ancestorNames: ["Spinning Tops", "Beyblade Original", "Original Tops"],
};
const notIndexed = { ...engineGear, id: "category-unindexed", name: "Unindexed", isLeaf: undefined };

console.log("\n=== 1. readAssignments — all three live payload shapes ===");
ok(readAssignments({ categoryIds: ["a", "b"] }).join() === "a,b", "categoryIds wins when present");
ok(readAssignments({ category: "a" }).join() === "a", "the scalar alone means one assignment");
ok(
  readAssignments({ category: "fresh", categorySlugs: ["stale", "stale-parent"] }).join() === "fresh",
  "🛑 the SCALAR beats categorySlugs — the edit form sends a stale derived chain beside a fresh pick",
);
ok(
  readAssignments({ categorySlugs: ["leaf", "parent", "root"] }).join() === "leaf",
  "🛑 only the HEAD of categorySlugs is read — treating its ancestors as assignments would file a product at every tier of its own chain",
);
ok(readAssignments({ categoryIds: ["a", "a", " a ", "b"] }).join() === "a,b", "duplicates deduped (a duplicate is equivalent to not having it)");
ok(readAssignments({}).length === 0, "nothing named = no assignment (category-less is a legal state)");

console.log("\n=== 2. 🛑 categorySlugs[0] is STILL the default leaf ===");
{
  const resolved = [beybladeFranchise, dragoonG]; // franchise FIRST in authored order
  const idx = pickDefaultAssignment(resolved);
  const { categorySlugs, categoryNames } = buildTaxonomyClosure(resolved, idx);
  ok(
    categorySlugs[0] === "category-dragoon-g",
    "index 0 is the DEEPEST assignment even when it was picked second — the ~30 readers stay correct",
  );
  ok(
    categorySlugs.slice(0, 5).join() ===
      "category-dragoon-g,category-g-revolution,category-original-tops,category-beyblade-original,category-spinning-tops",
    "the default chain comes first, leaf-first / root-last — byte-identical to what the seed hand-writes",
  );
  ok(
    categorySlugs.includes("category-beyblade") && categorySlugs.includes("category-franchises"),
    "the second chain is appended, so both category pages find this product",
  );
  ok(
    categoryNames[0] === "Dragoon G" && categoryNames.at(-1) === "Spinning Tops",
    "categoryNames is the DEFAULT chain only, leaf-first — breadcrumbs unchanged",
  );
  ok(
    !categoryNames.includes("Beyblade"),
    "CONTROL and it does NOT mix the second chain's names in — a union has no readable path",
  );
}
{
  const dedupe = buildTaxonomyClosure([dragoonG, engineGear], 0).categorySlugs;
  ok(
    dedupe.filter((id) => id === "category-spinning-tops").length === 1,
    "a shared ancestor appears ONCE — this is what stops a parent being counted twice",
  );
}

console.log("\n=== 3. the default: deepest, then busiest, then authored ===");
ok(pickDefaultAssignment([dragoonG, beybladeFranchise]) === 0, "tier 4 beats tier 1");
ok(pickDefaultAssignment([beybladeFranchise, dragoonG]) === 1, "…regardless of authored order");
{
  /* 🛑 THE CONTROL THAT MATTERS. A franchise spans every product type, so it
   * outranks any model on listing count. If count came first, every Beyblade
   * product's breadcrumb would read Home > Franchises > Beyblade and its
   * price band would widen from "Dragoon G" to "all Beyblade". */
  const counts = new Map([["category-beyblade", 9999], ["category-dragoon-g", 3]]);
  ok(
    pickDefaultAssignment([beybladeFranchise, dragoonG], counts) === 1,
    "🛑 a 9999-listing franchise does NOT beat a 3-listing model leaf — depth is first, count only breaks a tie",
  );
}
{
  const other = { ...dragoonG, id: "category-dranzer-f", name: "Dranzer F", rootId: "category-other-root" };
  const counts = new Map([["category-dragoon-g", 5], ["category-dranzer-f", 50]]);
  ok(pickDefaultAssignment([dragoonG, other], counts) === 1, "on a genuine tier TIE, the busier one wins");
  ok(pickDefaultAssignment([dragoonG, other]) === 0, "with no counts at all, authored order decides");
  ok(
    pickDefaultAssignment([dragoonG, other], new Map([["category-dranzer-f", 50]])) === 1,
    "a counted node beats an uncounted one — undefined is not 0",
  );
}

console.log("\n=== 4. one per root is REFUSED ===");
throws(
  () => assertAssignmentShape([dragoonG, drigerG], false),
  "same category tree",
  "🛑 two leaves under one root → 400, naming both",
);
ok(
  (() => { try { assertAssignmentShape([dragoonG, beybladeFranchise], false); return true; } catch { return false; } })(),
  "CONTROL a cross-root pair still SAVES — a rule that refuses everything looks identical to one that works",
);
throws(
  () => assertAssignmentShape(Array.from({ length: MAX_CATEGORY_ASSIGNMENTS + 1 }, (_, i) => ({ ...dragoonG, id: `c${i}`, rootId: `r${i}` })), false),
  "at most",
  `more than ${MAX_CATEGORY_ASSIGNMENTS} assignments → 400`,
);

console.log("\n=== 5. the leaf rule: lot REFUSES, single only WARNS (for now) ===");
ok(ENFORCE_LEAF_FILING === false, "🛑 ENFORCE_LEAF_FILING ships false — 70 of 71 products file at a non-leaf today");
throws(
  () => assertAssignmentShape([dragoonG], true),
  "lot holds several",
  "a LOT at a leaf → 400, enforced regardless of the flag (the half measurement validated)",
);
{
  const warnings = [];
  assertAssignmentShape([engineGear], false, { enforceLeafFiling: false, warn: (m, meta) => warnings.push(meta) });
  ok(warnings.length === 1, "a single at a non-leaf WARNS while the flag is off");
  ok(warnings[0]?.offenders?.[0]?.reason === "single-at-branch", "…and names why");
}
throws(
  () => assertAssignmentShape([engineGear], false, { enforceLeafFiling: true }),
  "subcategories",
  "…and 400s once the flag flips",
);
ok(
  (() => { try { assertAssignmentShape([engineGear], true, { enforceLeafFiling: true }); return true; } catch { return false; } })(),
  "CONTROL a LOT at that same non-leaf is correct and saves",
);
throws(
  () => assertAssignmentShape([notIndexed], false, { enforceLeafFiling: true }),
  "has not been indexed",
  "🛑 an absent isLeaf is its own refusal — a fact about OUR tree, not the seller's input",
);
ok(
  findLeafRuleOffenders([dragoonG, engineGear], false).map((o) => o.id).join() === "category-engine-gear",
  "findLeafRuleOffenders reports per assignment, so the ratchet can be seeded from a run of the rule",
);

console.log("\n=== 6. the leaf rule is SCOPED BY LISTING TYPE ===");

/*
 * Measured while rewriting the data: of the 70 non-leaf singles, 20 are types
 * that are not an instance of a named model AT ALL — sticker sheets, art
 * prints, redemption codes. So the RULE was wrong for them rather than the
 * catalogue being wrong, and it now reuses the existing
 * `LISTING_TYPE_HAS_COMPOSITION` record instead of adding a second
 * enumeration of the union (Root Cause #61).
 *
 * The first three assertions are the exemption working. The last six are the
 * exemption NOT being blanket — which is the half that could void the entire
 * rule while every exempt-side check still passed.
 */
for (const t of ["stickers", "art", "digital-code"]) {
  ok(
    findLeafRuleOffenders([engineGear], false, t).length === 0,
    `a ${t.toUpperCase()} single at a non-leaf is exempt — it is not an instance of a model`,
  );
}
for (const t of ["standard", "auction", "pre-order", "prize-draw", "live"]) {
  ok(
    findLeafRuleOffenders([engineGear], false, t).length === 1,
    `CONTROL a ${t.toUpperCase()} single at a non-leaf is STILL reported`,
  );
}
ok(
  findLeafRuleOffenders([engineGear], false, undefined).length === 1,
  "CONTROL an UNKNOWN listing type is reported, never exempted — absence must not be a loophole",
);
ok(
  findLeafRuleOffenders([engineGear], true, "stickers").length === 0,
  "CONTROL a LOT is correct at a non-leaf whatever its type",
);

console.log(`\n${fail === 0 ? "all checks passed" : "FAILURES"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

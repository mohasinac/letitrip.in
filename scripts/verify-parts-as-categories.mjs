/**
 * D13 — a part is a CATEGORY LEAF, verified against the live tree.
 *
 * ── 🛑 WHAT THIS EXISTS TO CATCH ───────────────────────────────────────────
 *
 * Making parts categories shipped with a defect that was invisible at every
 * layer. The forest walked 1,138 nodes with only **1,118 distinct ids** because
 * 20 part leaves had the same name as a bey — in Plastic Gen "Galeon" is both a
 * bey and its Bit Chip, and the same holds for Galman, Galzzly, Griffolyon,
 * Trygle, Trypio, Wyborg, Zeus and twelve more. `appkit-seed load` is a
 * `set(…, {merge:true})`, so the part silently overwrote the bey and the CLI
 * reported `created 1173, errors 0` while Firestore held **1,153** documents.
 *
 * A buyer opening `/categories/category-galeon` got an attack ring.
 *
 * So the assertions below are not "did it load" — they are **does the live tree
 * have as many documents as the seed has rows**, and **did the bey keep its
 * own URL**. Counting rows is not counting documents.
 */
import admin from "firebase-admin";
import sa from "../firebase-admin-key.json" with { type: "json" };
import { categoriesSeedData } from "../node_modules/@mohasinac/appkit/dist/seed/categories-seed-data.js";
import { PART_LEAVES, PART_LEAF_COUNT } from "../node_modules/@mohasinac/appkit/dist/seed/_helpers/category-parts.js";
import { PART_SLOT_CATEGORY, ALL_PART_SLOTS } from "../node_modules/@mohasinac/appkit/dist/features/parts/schemas/firestore.js";

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

console.log("\n=== 1. the generated map, before any database ===");
const genIds = Object.values(PART_LEAVES).flat().map((n) => n.id);
ok(genIds.length === PART_LEAF_COUNT, `PART_LEAVES holds ${PART_LEAF_COUNT} leaves (got ${genIds.length})`);
ok(new Set(genIds).size === genIds.length, "every generated leaf id is distinct");
ok(
  Object.keys(PART_LEAVES).every((k) => Object.values(PART_SLOT_CATEGORY).includes(k)),
  "every parent key is a declared part-type node",
);
ok(
  ALL_PART_SLOTS.every((s) => typeof PART_SLOT_CATEGORY[s] === "string"),
  "PART_SLOT_CATEGORY answers all 20 classifications (Root Cause #61's control)",
);
ok(
  Object.keys(PART_SLOT_CATEGORY).length === ALL_PART_SLOTS.length,
  "CONTROL and carries no DEAD classification",
);

console.log("\n=== 2. 🛑 ROWS vs DOCUMENTS — the defect that shipped ===");
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
const [cats, glossary, comps] = await Promise.all([
  db.collection("categories").get(),
  db.collection("partGlossary").get(),
  db.collection("modelComposition").get(),
]);
const byId = new Map(cats.docs.map((d) => [d.id, d.data()]));
const seedIds = categoriesSeedData.map((c) => c.id);

ok(
  new Set(seedIds).size === seedIds.length,
  `the seed itself has no duplicate id (${seedIds.length} rows)`,
);
ok(
  cats.size === new Set(seedIds).size,
  `live documents (${cats.size}) equal distinct seed rows (${new Set(seedIds).size}) — a merge write hides any shortfall`,
);
ok(
  cats.docs.filter((d) => !new Set(seedIds).has(d.id)).length === 0,
  "no live category is absent from the seed",
);

console.log("\n=== 3. 🛑 the bey keeps its own URL, the part is qualified ===");
// The 20 measured collisions. Each bare id must be the MODEL.
const CONTESTED = [
  "category-galeon",
  "category-galman",
  "category-galzzly",
  "category-griffolyon",
  "category-trygle",
  "category-trypio",
  "category-wyborg",
  "category-zeus",
  "category-metal-driger",
  "category-metal-draciel",
  "category-draciel-fortress",
  "category-shadow-driger",
  "category-salamalyon",
  "category-apollon",
  "category-flash-leopard",
  "category-vortex-ape",
  "category-gigars",
  "category-rock-bison",
  "category-thunder-pegasus",
  "category-torch-pegasus",
];
const partIdSet = new Set(genIds);
const stolen = CONTESTED.filter((id) => partIdSet.has(id));
ok(stolen.length === 0, `none of the 20 contested ids is a PART leaf (${stolen.join(", ") || "clean"})`);
const missing = CONTESTED.filter((id) => !byId.has(id));
ok(missing.length === 0, `all 20 contested ids exist live (${missing.join(", ") || "clean"})`);
// And the part still exists, under a qualified id.
ok(
  genIds.some((id) => id.startsWith("category-bit-chip-")),
  "the displaced parts live under a classification-qualified id",
);

console.log("\n=== 4. a part leaf is a REAL taxonomy node ===");
const sample = byId.get(genIds.find((id) => byId.has(id)));
ok(sample?.tier === 4, `a part leaf is tier 4 (got ${sample?.tier})`);
ok(sample?.isLeaf === true, "and is marked a leaf");
ok((sample?.parentIds ?? []).length >= 3, `with a real ancestor chain (${(sample?.parentIds ?? []).length} deep)`);
ok(
  sample?.categoryType === undefined,
  "🛑 `categoryType` is OMITTED — a new value would opt out of deriveTaxonomy, the counters and the sitemap",
);
const t4 = cats.docs.filter((d) => d.data().tier === 4);
ok(
  t4.every((d) => Array.isArray(d.data().searchTxt) && d.data().searchTxt.length > 0),
  `every tier-4 leaf carries searchTxt (${t4.length} checked) — else the pickers cannot find it`,
);

console.log("\n=== 5. the two collections share a key ===");
let paired = 0;
const orphans = [];
for (const d of glossary.docs) {
  const i = d.id.indexOf("--");
  const slot = d.id.slice(0, i);
  const tail = d.id.slice(i + 2);
  if (byId.has(`category-${tail}`) || byId.has(`category-${slot}-${tail}`)) paired++;
  else orphans.push(d.id);
}
ok(paired === glossary.size, `every glossary row has a category leaf (${paired}/${glossary.size})`);
if (orphans.length) console.log("    orphans:", orphans.slice(0, 5).join(", "));

console.log("\n=== 6. data repairs hold ===");
const unbalanced = (rows, f) =>
  rows.filter((d) => {
    const n = f(d) || "";
    return (n.match(/\(/g) || []).length !== (n.match(/\)/g) || []).length;
  }).length;
ok(
  unbalanced(glossary.docs, (d) => d.data().name) === 0,
  "no part name is truncated at its closing bracket (8 were)",
);
ok(
  unbalanced(cats.docs, (d) => d.data().name) === 0,
  "and no category name is either",
);
// `Dimension'` is a DIFFERENT Burst driver from `Dimension` — the apostrophe is
// a real part distinction, not punctuation to strip.
const dashed = glossary.docs.filter((d) => d.id.endsWith("-dash"));
ok(dashed.length >= 3, `the apostrophe survives as -dash on ${dashed.length} drivers`);
ok(
  dashed.every((d) => d.data().name.endsWith("'")),
  "and each of those rows really is an apostrophe name",
);

const slots = comps.docs.flatMap((d) => d.data().slots ?? []);
const glossaryIds = new Set(glossary.docs.map((d) => d.id));
ok(
  slots.every((s) => !s.partId || glossaryIds.has(s.partId)),
  `every composition slot's partId resolves (${slots.filter((s) => s.partId).length}/${slots.length} linked)`,
);
console.log(
  `    compositions joined to a category: ${comps.docs.filter((d) => d.data().categoryId).length}/${comps.size}`,
);

console.log(`\n${fail === 0 ? "all checks passed" : "FAILURES"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

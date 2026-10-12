/**
 * Generates `appkit/src/seed/_helpers/category-parts.ts` — a category LEAF per
 * part, keyed by the part-type node it belongs under.
 *
 * ── 🛑 WHY PARTS ARE CATEGORIES ────────────────────────────────────────────
 *
 * User instruction: *"treat parts as also categories let admins create or add
 * more of them as well"*. A plain category leaf answers both halves at once —
 * it inherits `deriveTaxonomy`'s ancestor chain, `countersReconcile`'s tally,
 * the sitemap, breadcrumbs, SEO, an OG image **and the existing admin category
 * editor**, create/edit/delete included, for no new code.
 *
 * 🛑 `categoryType` is OMITTED, never a new `"part"` value. 92 files read that
 * discriminator and `"sublisting"` carries seven live defects precisely because
 * a new value opts out of every path that works.
 *
 * ── 🛑 THE ID IS SHARED WITH THE GLOSSARY ROW, DELIBERATELY ────────────────
 *
 * `category-{slug}` is the leaf; the `partGlossary` row keeps the SAME id. One
 * key, two collections, the same pattern as `categoryCounts` and `priceIndex`
 * and for the same reason: measured physical data (weight, code, aliases,
 * usedBy) must not live on `categories`, because `onCategoryWrite` calls
 * `notifyRevalidate` unconditionally and would drop the page's ISR entry on
 * every reseed — on a project paused at 15.5x its ISR cap.
 *
 * ── 🛑 COLLISIONS ARE REFUSED, NOT SUFFIXED ────────────────────────────────
 *
 * Two parts in different classifications can share a name ("Flat" exists as a
 * tip and as a bit), so the slug carries the classification when a bare one
 * would collide. A silently suffixed `-2` would be a URL nobody can predict and
 * a page whose title does not say which part it is.
 *
 * Usage: node scripts/gen-category-parts.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const GLOSSARY_SRC = path.join(ROOT, "appkit/src/seed/part-glossary-seed-data.ts");
const OUT = path.join(ROOT, "appkit/src/seed/_helpers/category-parts.ts");

/* Mirrors PART_SLOT_CATEGORY in features/parts/schemas/firestore.ts. The TS
 * side is the compile-checked `Record<PartSlot, string>`; this is the generator
 * half, and the script FAILS if a slot appears in the data and not here — which
 * is what keeps the two from drifting silently. */
const SLOT_CATEGORY = {
  "attack-ring": "category-original-attack-rings",
  "weight-disk": "category-original-weight-disks",
  "blade-base": "category-original-blade-bases",
  "bit-chip": "category-original-bit-chips",
  "spin-gear": "category-original-spin-gears",
  "engine-gear": "category-original-engine-gears",
  "running-core": "category-original-running-cores",
  "face-bolt": "category-metal-face-bolts",
  "energy-ring": "category-metal-energy-rings",
  "fusion-wheel": "category-metal-fusion-wheels",
  "chrome-wheel": "category-metal-chrome-wheels",
  "spin-track": "category-metal-spin-tracks",
  "performance-tip": "category-metal-performance-tips",
  layer: "category-burst-layers",
  disc: "category-burst-discs",
  driver: "category-burst-drivers",
  armour: "category-burst-chips-armour",
  blade: "category-x-blades",
  ratchet: "category-x-ratchets",
  bit: "category-x-bits",
};

const SLOT_LABEL = {
  "bit-chip": "Bit Chip",
  "attack-ring": "Attack Ring",
  "weight-disk": "Weight Disk",
  "spin-gear": "Spin Gear",
  "engine-gear": "Engine Gear",
  "blade-base": "Blade Base",
  "running-core": "Running Core",
  "face-bolt": "Face Bolt",
  "energy-ring": "Energy Ring",
  "fusion-wheel": "Fusion Wheel",
  "chrome-wheel": "Chrome Wheel",
  "spin-track": "Spin Track",
  "performance-tip": "Performance Tip",
  layer: "Layer",
  disc: "Disc",
  driver: "Driver",
  armour: "Armour",
  blade: "Blade",
  ratchet: "Ratchet",
  bit: "Bit",
};

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Read the generated glossary source rather than the database.
 *
 * 🛑 `JSON.parse` over the array literal, NOT a regex over the rows. The
 * generated file is `JSON.stringify` output, so its keys are quoted and its
 * shape is exact — and my first version regexed for UNQUOTED keys and would
 * have parsed zero rows. The script refuses to write on zero, so that failure
 * was loud; a regex that matched SOME rows would not have been.
 */
function readGlossary() {
  const src = fs.readFileSync(GLOSSARY_SRC, "utf8");
  const decl = src.indexOf("partGlossarySeedData");
  const eq = src.indexOf("=", decl);
  const open = src.indexOf("[", eq);
  const close = src.lastIndexOf("]");
  if (decl < 0 || eq < 0 || open < 0 || close <= open) {
    console.error("Could not locate the glossary array literal. Refusing to write.");
    process.exit(1);
  }
  return JSON.parse(src.slice(open, close + 1));
}

/**
 * Every category id the forest ALREADY uses — model leaves, part-type nodes,
 * branches, lines, roots.
 *
 * 🛑 Without this the generator checked part-vs-part collisions only, and 20
 * part leaves silently stole a MODEL leaf's id: in Plastic Gen the bey
 * "Galeon" and its Attack Ring are both called Galeon, and the same is true of
 * Galman, Galzzly, Griffolyon, Trygle, Trypio, Wyborg, Zeus and twelve more.
 *
 * The failure was invisible at every layer: the forest walked 1,138 nodes with
 * 1,118 distinct ids, `appkit-seed load` reported `created 1173, errors 0`
 * because a merge write silently overwrites, and Firestore ended up with 1,153
 * documents. Twenty model pages had been replaced by a part page with the same
 * URL, and nothing anywhere said so.
 *
 * 🛑 The MODEL keeps the bare slug and the PART is qualified, not the other way
 * round: somebody searching "Galeon" wants the bey.
 */
function forestIds() {
  const src = fs.readFileSync(path.join(ROOT, "appkit/src/seed/_helpers/category-forest.ts"), "utf8");
  const models = fs.readFileSync(path.join(ROOT, "appkit/src/seed/_helpers/category-models.ts"), "utf8");
  const ids = new Set();
  for (const text of [src, models]) {
    for (const m of text.matchAll(/"(category-[a-z0-9-]+)"/g)) ids.add(m[1]);
  }
  if (ids.size === 0) {
    console.error("Read ZERO existing category ids — refusing to write.");
    process.exit(1);
  }
  return ids;
}

const TAKEN = forestIds();

const parts = readGlossary();
if (parts.length === 0) {
  console.error("Parsed ZERO parts — the glossary shape changed. Refusing to write.");
  process.exit(1);
}

/* 🛑 Fail on an unmapped slot rather than skipping it. A skipped slot is a
 * silently missing branch of the catalogue, which is exactly how 135 parts had
 * no home before the five nodes were added. */
const unmapped = [...new Set(parts.map((p) => p.slot))].filter((s) => !SLOT_CATEGORY[s]);
if (unmapped.length > 0) {
  console.error(`Unmapped slot(s): ${unmapped.join(", ")} — add them to SLOT_CATEGORY and to the forest.`);
  process.exit(1);
}

/* ── the leaf id INHERITS the glossary id's tail ─────────────────────────────
 *
 * 🛑 It does NOT re-slugify the name, and that is the whole point. The glossary
 * generator preserves a trailing apostrophe as `-dash`, because in Burst
 * `Dimension'` is a different driver from `Dimension`; a second slugifier here
 * stripped it and collided the two, which is exactly what this script refused
 * to write. Two slug rules for one string is Root Cause #75's shape, and the
 * id is a URL — the one field that cannot be quietly corrected later.
 *
 * So the glossary id `driver--dimension-dash` becomes `category-dimension-dash`,
 * and the two collections share a key by construction rather than by agreement.
 */
const tailOf = (glossaryId) => {
  const i = glossaryId.indexOf("--");
  return i >= 0 ? glossaryId.slice(i + 2) : glossaryId;
};

const byBareTail = new Map();
for (const p of parts) {
  const t = tailOf(p.id);
  if (t) byBareTail.set(t, (byBareTail.get(t) ?? 0) + 1);
}

const leaves = new Map(); // parentId -> [node]
const idSeen = new Map();
let qualified = 0;
let skippedNoName = 0;

for (const p of parts) {
  const tail = tailOf(p.id);
  if (!tail || !p.name) {
    skippedNoName += 1;
    continue;
  }
  /*
   * Qualify with the classification only when the bare tail is ambiguous ACROSS
   * classifications — "Flat" is both a performance tip and an X bit — so the
   * common case keeps the short, guessable URL.
   */
  /*
   * Ambiguous across classifications ("Flat" is both a performance tip and an X
   * bit), OR already claimed by a model leaf / part-type node / branch.
   */
  const collides = (byBareTail.get(tail) ?? 0) > 1 || TAKEN.has(`category-${tail}`);
  const id = collides ? `category-${slugify(p.slot)}-${tail}` : `category-${tail}`;
  if (collides) qualified += 1;
  if (idSeen.has(id)) {
    console.error(`Duplicate id ${id} (${p.name} vs ${idSeen.get(id)}) — refusing to write.`);
    process.exit(1);
  }
  idSeen.set(id, p.name);

  const label = SLOT_LABEL[p.slot] ?? p.classification;
  /* Our own prose from facts, never a corpus sentence. The printed code and the
   * weight are the two things a buyer is actually choosing between. */
  const bits = [
    p.code ? `printed ${p.code}` : null,
    typeof p.weightG === "number" ? `${p.weightG} g` : null,
    (p.usedBy ?? []).length > 0
      ? `used by ${(p.usedBy ?? []).length} ${(p.usedBy ?? []).length === 1 ? "model" : "models"}`
      : null,
  ].filter(Boolean);
  const description =
    `${p.name} — a ${label.toLowerCase()}` +
    (bits.length ? ` (${bits.join(", ")})` : "") +
    `. Loose examples, spares and pre-owned ${label.toLowerCase()}s of this part are listed here.`;

  // The printed code and every recorded spelling, because those are what a
  // buyer types. `searchTxt` is built from these by the category seed.
  const aliases = [...new Set([p.code, p.name, ...(p.aliases ?? [])].filter(Boolean))];
  const parent = SLOT_CATEGORY[p.slot];
  if (!leaves.has(parent)) leaves.set(parent, []);
  leaves.get(parent).push({ id, name: p.name, description, aliases, glossaryId: p.id });
}

for (const arr of leaves.values()) arr.sort((a, b) => a.name.localeCompare(b.name));

const q = (v) => JSON.stringify(v);
const body = [...leaves.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(
    ([parent, arr]) =>
      `  ${q(parent)}: [\n` +
      arr
        .map(
          (n) =>
            `    {\n      id: ${q(n.id)},\n      name: ${q(n.name)},\n      description:\n        ${q(n.description)},\n      extra: { aliases: ${q(n.aliases)} },\n    },`,
        )
        .join("\n") +
      `\n  ],`,
  )
  .join("\n");

const out = `/*
 * GENERATED by scripts/gen-category-parts.mjs — do not edit by hand.
 *
 * WHY: every part is a CATEGORY leaf, so it is browsable, countable, in the
 *      sitemap, and editable (and creatable) by admins through the existing
 *      category editor. The user's instruction was "treat parts as also
 *      categories let admins create or add more of them as well".
 *
 * WHAT: Record<part-type node id, CategoryTreeNode[]>, spread into
 *       CATEGORY_FOREST by \`category-forest.ts\`.
 *
 * 🛑 \`categoryType\` is OMITTED, not set to a new "part" value: 92 files read
 *    that discriminator, and "sublisting" carries seven live defects precisely
 *    because a new value opts out of \`deriveTaxonomy\`, the counters and the
 *    sitemap.
 *
 * 🛑 The id is SHARED with the \`partGlossary\` row, so measured data (weight,
 *    code, aliases, usedBy) stays in its own collection — writing it onto
 *    \`categories\` would fire \`notifyRevalidate\` on every reseed.
 *
 * 🛑 The prose is ours, composed from facts (name, classification, printed
 *    code, weight, model count). No corpus sentence is reproduced.
 *
 * ${parts.length} parts -> ${idSeen.size} leaves across ${leaves.size} part-type nodes.
 * ${qualified} needed a classification-qualified slug because the bare name
 * collides across classifications; the rest keep the short URL.
 *
 * @tag domain:categories
 * @tag layer:seed
 * @tag pattern:generated
 * @tag access:server-only
 * @tag sideEffects:none
 */

import type { CategoryTreeNode } from "./category-tree";

/** Part leaves, keyed by the part-type node they belong under. */
export const PART_LEAVES: Record<string, CategoryTreeNode[]> = {
${body}
};

/**
 * The part leaf id for a \`partGlossary\` row id, and vice versa — they are the
 * SAME string by construction, so this map exists only to let a reader see that
 * stated rather than inferred.
 */
export const PART_LEAF_COUNT = ${idSeen.size};
`;

/*
 * 🛑 Assert the OUTPUT is clean rather than trusting the rule that produced it.
 * This is the check that would have caught the 20 stolen model ids, and it runs
 * on the final id set rather than on the intention behind it.
 */
const stolen = [...idSeen.keys()].filter((id) => TAKEN.has(id));
if (stolen.length > 0) {
  console.error(
    `${stolen.length} part leaf id(s) collide with an existing forest id after qualification: ` +
      stolen.slice(0, 10).join(", "),
  );
  process.exit(1);
}

fs.writeFileSync(OUT, out, "utf8");
console.log(`parts parsed:        ${parts.length}`);
console.log(`leaves written:      ${idSeen.size}`);
console.log(`part-type nodes:     ${leaves.size}`);
console.log(`qualified slugs:     ${qualified}`);
console.log(`skipped (no name):   ${skippedNoName}`);
console.log(`-> ${path.relative(ROOT, OUT)}`);

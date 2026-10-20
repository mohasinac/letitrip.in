/**
 * The PART SLOT vocabulary, and the map from the wiki's `Classification=` to it.
 *
 * ── 🛑 THIS FILE IS THE SOURCE; THE TYPE MIRRORS IT ────────────────────────
 *
 * `appkit/src/features/parts/schemas/firestore.ts` says so explicitly of the
 * original 20: *"Mirrors `SLOT_VOCAB` in `scripts/extract-part-composition.mjs`
 * — the script is the source and this is the type, so a slot that appears in
 * one and not the other is a compile-visible gap rather than a silent one."*
 * Same contract here. `SLOT_VOCAB_REPORT` is emitted into the extraction report
 * so the schema edit is mechanical and checkable rather than hand-copied.
 *
 * ── 🛑 WHY THE VOCABULARY GREW 20 -> 55 ────────────────────────────────────
 *
 * Not because the wiki is noisy. `case study/BEYBLADE MASTER REFERENCE.md`
 * documents the STACK of every system, and each addition is a real slot in one:
 *
 *   GT / Gatinko   GT Chip -> Layer Base -> Forge Disc -> Driver
 *   SK / Sparking   Sparking Chip -> Layer Base -> Forge Disc -> Driver
 *   DB              DB Core -> Armor -> Layer Ring -> Forge Disc -> Driver
 *   CX (Bey X)      Lock Chip + Main Blade + Assist Blade -> Ratchet -> Bit
 *   CX Expand       Lock Chip + Over Blade + Metal Blade + Assist Blade -> …
 *
 * So `Lock Chip`, `Assist Blade`, `Main Blade`, `GT Chip`, `DB Core`, `Ring`
 * and the rest are the documented anatomy of the later Burst sub-systems and
 * the Beyblade X Custom line — the generations our 20-slot set predates.
 *
 * ── 🛑 MAP, NEVER DUPLICATE ────────────────────────────────────────────────
 *
 * `Forge Disc` IS our `disc`. `Armor` IS our `armour` (British, per
 * `PART_SLOT_LABEL`). `Energy Layer` IS our `layer`. Minting a second key for
 * any of them would split one part family across two classifications, and the
 * existing 752 rows would land in one while every new row landed in the other.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 */

/** The 20 that already exist. Unchanged — additive only, so no id moves. */
export const EXISTING_SLOTS = [
  "bit-chip",
  "attack-ring",
  "weight-disk",
  "spin-gear",
  "engine-gear",
  "blade-base",
  "running-core",
  "face-bolt",
  "energy-ring",
  "fusion-wheel",
  "chrome-wheel",
  "spin-track",
  "performance-tip",
  "layer",
  "disc",
  "driver",
  "armour",
  "blade",
  "ratchet",
  "bit",
];

/**
 * Slots added from the crawl, each with the system whose stack it belongs to.
 * The `system` note is what justifies the key existing at all, and it is what
 * a reviewer should check rather than taking the name on trust.
 */
export const NEW_SLOTS = {
  // ── Burst: GT / Gatinko, SK / Sparking, DB, BU, QuadDrive ──────────────
  "gt-chip": { label: "GT Chip", system: "GT / Gatinko Layer System" },
  "gatinko-chip": { label: "Gatinko Chip", system: "Gatinko Layer System" },
  base: { label: "Layer Base", system: "GT / Gatinko and SK / Sparking" },
  "superking-chip": { label: "Superking Chip", system: "Superking / Sparking Layer System" },
  "db-core": { label: "DB Core", system: "Dynamite Battle Layer System" },
  ring: { label: "Layer Ring", system: "Dynamite Battle Layer System" },
  "armor-tip": { label: "Armor Tip", system: "Dynamite Battle / QuadDrive" },
  frame: { label: "Frame", system: "Gatinko through Superking" },
  chassis: { label: "Chassis", system: "Superking / Sparking Layer System" },
  "bu-blade": { label: "BU Blade", system: "Burst Ultimate System" },
  "qs-blade": { label: "QS Blade", system: "QuadStrike System" },
  "drive-chip": { label: "Drive Chip", system: "QuadDrive System" },
  "storm-chip": { label: "Storm Chip", system: "HyperSphere / SlingShock" },
  "strike-chip": { label: "Strike Chip", system: "QuadStrike System" },
  "gravity-ring": { label: "Gravity Ring", system: "QuadDrive System" },
  "spirit-shield": { label: "Spirit Shield", system: "QuadStrike System" },
  "spirit-axle": { label: "Spirit Axle", system: "QuadStrike System" },
  "disc-integrated-driver": { label: "Disc-Integrated Driver", system: "Burst Ultimate System" },

  // ── Beyblade X: the CX Custom line ─────────────────────────────────────
  "lock-chip": { label: "Lock Chip", system: "Beyblade X — Custom Line (CX)" },
  "main-blade": { label: "Main Blade", system: "Beyblade X — Custom Line (CX)" },
  "assist-blade": { label: "Assist Blade", system: "Beyblade X — Custom Line (CX)" },
  "over-blade": { label: "Over Blade", system: "Beyblade X — CX Expand" },
  "metal-blade": { label: "Metal Blade", system: "Beyblade X — CX Expand" },
  "ratchet-integrated-blade": { label: "Ratchet-Integrated Blade", system: "Beyblade X" },
  "ratchet-integrated-bit": { label: "Ratchet-Integrated Bit", system: "Beyblade X" },

  // ── Metal Fight / Zero-G leftovers our 20 missed ───────────────────────
  "warrior-wheel": { label: "Warrior Wheel", system: "Shogun Steel / Zero-G" },
  "element-wheel": { label: "Element Wheel", system: "Shogun Steel / Zero-G" },
  "light-wheel": { label: "Light Wheel", system: "Shogun Steel / Zero-G" },
  wheel: { label: "Wheel", system: "Metal Fight — generic wheel" },
  "shogun-face-bolt": { label: "Shogun Face Bolt", system: "Shogun Steel / Zero-G" },
  "dome-spin-track": { label: "Dome Spin Track", system: "Metal Fight 4D" },

  // ── Gen 1 ──────────────────────────────────────────────────────────────
  "evolution-gear": { label: "Evolution Gear", system: "Engine Gear System" },
  "bit-protector": { label: "Bit Protector", system: "Hard Metal System (HMS)" },
  weight: { label: "Weight", system: "Gatinko / Superking weight" },
  core: { label: "Core", system: "generic core component" },
  "support-parts": { label: "Support Parts", system: "V2 Series sub-parts" },

  /*
   * ── From the CORPUS tables, not the wiki ────────────────────────────────
   *
   * The wiki has no `Classification` for these three, but the case study
   * documents all of them and the curated tables carry real rows:
   *
   *   SAR  §1.10 "SAR (Sub Attack Ring) | Gen 1 Plastic | 2–5 g"
   *   CEW  §2.12 "GT / G-Revolution System — CEW (Customize Engine Weight)"
   *   Gear Chip  §6.2 "Sits beneath PMMA window… rotating disk"
   */
  "sub-attack-ring": { label: "Sub Attack Ring", system: "Gen 1 Plastic (SAR)" },
  cew: { label: "Customize Engine Weight", system: "GT / G-Revolution System" },
  "gear-chip": { label: "Gear Chip", system: "Beyblade X" },
};

export const ALL_SLOTS = [...EXISTING_SLOTS, ...Object.keys(NEW_SLOTS)];

/**
 * Wiki `Classification=` -> our slot key.
 *
 * Only the three ALIASES need stating; everything else kebab-cases cleanly.
 * Keep this explicit rather than deriving it, because the aliases are exactly
 * the cases a derivation would get wrong.
 */
const CLASSIFICATION_ALIAS = {
  "forge disc": "disc",
  "energy layer": "layer",
  armor: "armour",
  "layer base": "base",
  "layer ring": "ring",
  "sparking chip": "superking-chip",
  "performance tip": "performance-tip",
  // Singular/plural the wiki uses interchangeably. One key, not two — a second
  // key would split one part family in half across two classifications.
  "support part": "support-parts",
};

const SLOT_SET = new Set(ALL_SLOTS);

/**
 * Resolve a wiki classification to a slot, or `null`.
 *
 * 🛑 `null` is returned rather than guessed. An unmapped classification is
 * reported by the extractor and left out — a part filed under an invented slot
 * renders on no page and joins to no document, which is worse than absent
 * because it looks present in a count.
 */
export function slotForClassification(raw) {
  if (!raw) return null;
  const k = String(raw).toLowerCase().replace(/\s+/g, " ").trim();
  if (CLASSIFICATION_ALIAS[k]) return CLASSIFICATION_ALIAS[k];
  const kebab = k.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return SLOT_SET.has(kebab) ? kebab : null;
}

/**
 * Buyer-facing label per slot, for every one of the 56.
 *
 * 🛑 The EXISTING 20 are copied from `PART_SLOT_LABEL` in the schema rather
 * than title-cased from the key, because title-casing gets them wrong:
 * "Armour" is not `armour` title-cased in this corpus, and `bit-chip` is
 * "Bit Chip" and not "Bit-chip". The schema's own comment makes the same
 * point, and this map is what the Phase 3 edit to that `Record<PartSlot,
 * string>` will be generated from.
 */
export const SLOT_LABEL = {
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
  ...Object.fromEntries(Object.entries(NEW_SLOTS).map(([k, v]) => [k, v.label])),
};

/** Emitted into the extraction report so the schema edit is checkable. */
export const SLOT_VOCAB_REPORT = {
  existing: EXISTING_SLOTS.length,
  added: Object.keys(NEW_SLOTS).length,
  total: ALL_SLOTS.length,
  newSlots: Object.entries(NEW_SLOTS).map(([k, v]) => ({ slot: k, ...v })),
  aliases: CLASSIFICATION_ALIAS,
};

/**
 * ── OUR OWN CLASSIFICATION ─────────────────────────────────────────────────
 *
 * `slot` mirrors the source's `Classification=` spelling, and it cannot be
 * renamed: it is half of every document id (`${slot}--${code}`) and those ids
 * are LIVE URLS (`/parts/{classification}/{code}`). Re-keying 2,490 rows
 * breaks every inbound link, and a slug is the one field that cannot be
 * quietly corrected later.
 *
 * So our taxonomy is ADDITIVE — a `role` derived from the slot. It answers
 * "what does this part DO", consistently across generations, where the
 * source's vocabulary answers "what did this line call it":
 *
 *   bu-blade / qs-blade / blade        all `blade` — one role, three line names
 *   disc-integrated-driver             two roles in one moulding; filed under
 *                                      its PRIMARY function, with
 *                                      `integratedRoles` naming both so a
 *                                      stack check can see the second one
 *   gt-chip / gatinko-chip /
 *   superking-chip / drive-chip / …    all `chip` — the top-of-stack emblem
 *
 * 🛑 A `Record<PartSlot, …>` on the consuming side, so a 60th slot is a
 * compile error rather than a part with no role (Root Cause #61). This map is
 * the SOURCE that mirrors.
 *
 * 🛑 A role is NOT a rating category. `partType: "Attack"` is the source's
 * editorial judgement about how a part plays; `role: "ring"` is where it sits
 * in the stack. Measured: a part's declared type agrees with its own
 * top-scoring rating axis only 81% of the time, so the two are related and
 * neither derives the other.
 */
export const PART_ROLE = {
  // top-of-stack emblem / identity
  "bit-chip": "chip", "gt-chip": "chip", "gatinko-chip": "chip",
  "superking-chip": "chip", "drive-chip": "chip", "storm-chip": "chip",
  "strike-chip": "chip", "lock-chip": "chip", "gear-chip": "chip",
  "face-bolt": "chip", "shogun-face-bolt": "chip", "bit-protector": "chip",
  "db-core": "chip", "core": "chip",

  // the outer contact ring — what hits the opponent
  "attack-ring": "ring", "sub-attack-ring": "ring", "energy-ring": "ring",
  ring: "ring", "gravity-ring": "ring", layer: "ring", armour: "ring",
  "spirit-shield": "ring",

  // mass / momentum
  "weight-disk": "weight", disc: "weight", weight: "weight",
  "fusion-wheel": "wheel", "chrome-wheel": "wheel", "crystal-wheel": "wheel",
  "element-wheel": "wheel", "warrior-wheel": "wheel", "light-wheel": "wheel",
  wheel: "wheel", "tracker-wheel": "wheel",

  // the body the rest bolts onto
  "blade-base": "base", base: "base", chassis: "base", frame: "base",
  blade: "blade", "bu-blade": "blade", "qs-blade": "blade",
  "main-blade": "blade", "over-blade": "blade", "metal-blade": "blade",
  "assist-blade": "blade",

  // height / axle
  "spin-track": "track", "dome-spin-track": "track", ratchet: "track",
  "spirit-axle": "track", "gyro-holder": "track",

  // ground contact
  "performance-tip": "tip", driver: "tip", bit: "tip", "armor-tip": "tip",
  "shogun-tip": "tip", "running-core": "tip",

  // drive / gearing
  "spin-gear": "gear", "engine-gear": "gear", "evolution-gear": "gear",
  cew: "gear", gyrostat: "gear",

  // merged — filed under the primary function, both named below
  "disc-integrated-driver": "tip",
  "ratchet-integrated-bit": "tip",
  "ratchet-integrated-blade": "blade",

  // genuinely other
  "support-parts": "support", "attack-gear": "support",
  "energy-core": "support", "warrior-weapons": "support",
};

/**
 * ── THE STACK IS TOP-TO-BOTTOM, AND THE ORDER IS PART OF THE MODEL ─────────
 *
 * Face Bolt -> Energy Ring -> Fusion Wheel -> Spin Track -> Performance Tip,
 * and the equivalent per system. A composition panel, a build validator and
 * an exploded 3D view all need the SAME sequence, so it lives here rather
 * than being re-derived (differently) by each consumer — two enumerations of
 * one order always drift (Root Cause #61).
 *
 * The index is also what makes integration decidable: a single moulding can
 * only ever absorb an ADJACENT role. `tip` absorbing `track` is one piece;
 * `tip` absorbing `chip` would be the whole bey.
 */
export const ROLE_STACK_ORDER = [
  "chip", // top — the emblem / identity
  "ring", // the outer contact ring
  "wheel", // metal mass
  "weight", // discs / weight disks
  "base", // the body everything bolts onto
  "blade", // contact blade (X / Burst lines name this separately)
  "track", // height / axle
  "tip", // ground contact
  "gear", // drive, threaded through rather than stacked
  "support", // add-ons that fill no stack position
];

/** 0-based position in the stack, or -1 for a role with no fixed place. */
export function stackIndexOfRole(role) {
  return ROLE_STACK_ORDER.indexOf(role);
}

/**
 * ── INTEGRATION ───────────────────────────────────────────────────────────
 *
 * 🛑 The owner's term is INTEGRATION, not fusion. "Fusion Wheel" is a literal
 * MFB slot name, so a field called `fusedRoles` reads as *the roles of the
 * fusion wheel* — the opposite of what it means. The source's own slot names
 * already use the right word: `disc-integrated-driver`,
 * `ratchet-integrated-bit`, `ratchet-integrated-blade`.
 *
 * A SLOT-keyed map covers only the case where the source classification
 * itself names the merge. It cannot express the per-part case, which is the
 * common one: `fusion-wheel--variares` absorbs the energy ring and
 * `fusion-wheel--jade` does not — same slot, different part. Those come from
 * `scripts/derive-part-integration.mjs`, which reads it off the compositions
 * each part actually appears in, and land on the part as `integratedRoles`.
 *
 * So this map is the floor, not the whole answer: every part in one of these
 * slots integrates, by classification.
 */
export const PART_INTEGRATED_ROLES = {
  "running-core": ["gear", "base"],
  "disc-integrated-driver": ["weight", "tip"],
  "ratchet-integrated-bit": ["track", "tip"],
  "ratchet-integrated-blade": ["track", "blade"],
};

export const ALL_PART_ROLES = [...new Set(Object.values(PART_ROLE))].sort();

/** The role for a slot, or null — never a guess. */
export function roleForSlot(slot) {
  return PART_ROLE[slot] ?? null;
}

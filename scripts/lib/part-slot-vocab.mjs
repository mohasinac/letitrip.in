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

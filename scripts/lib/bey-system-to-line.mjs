/**
 * `system` → the forest LINE id a bey's category leaf hangs off.
 *
 * ── 🛑 WHY THIS MAPS TO A LINE AND NOT TO AN `era` ─────────────────────────
 *
 * `gen-category-models.mjs`'s `lineFor()` switches on the curated corpus's
 * `era` field, and `wiki-beys.json` — the only source with 1,988 rows — does
 * not have one. The obvious bridge is to learn `system -> era` from the 221
 * curated rows and apply it to the wiki set. Measured, that FAILS twice over:
 *
 *   · coverage is 371 of 1,988 (19%), because the curated `system` is free
 *     prose — 84 distinct strings for 221 rows, e.g.
 *     "Takara Tomy Beyblade Burst — God Layer System." against the wiki's
 *     clean "God Layer System";
 *   · and FIVE systems resolve to more than one era (Dual Layer ->
 *     burst|god|gt, Cho-Z -> choz|gt, God -> god|gt, Synchrome ->
 *     zerog|choz), so even a normalised join has to guess.
 *
 * 🛑 And `era` is the WRONG GRANULARITY regardless. `Magnacore System` and
 * `Engine Gear System` both carry `gen1/plastic`, while the forest has
 * separate `category-original-magnacore` and `category-original-engine-gear`
 * lines — so an era-keyed map cannot express the tree it is feeding.
 *
 * The system string names the line outright, so one table does it exactly and
 * a reader can check every row by eye. That is the whole argument for
 * hand-authoring this rather than deriving it.
 *
 * ── 🛑 HASBRO AND TAKARA-TOMY NAME THE SAME GENERATION DIFFERENTLY ─────────
 *
 * Several entries below pair a TT system with its Hasbro retail name, because
 * the wiki uses both as `System=` values for the same hardware:
 *
 *   God Layer      ⇄ SwitchStrike      Cho-Z Layer    ⇄ SlingShock
 *   Gatinko Layer  ⇄ HyperSphere       Superking      ⇄ SpeedStorm
 *   Dynamite Battle ⇄ QuadDrive
 *
 * These are the same shelf to a buyer and are filed together deliberately.
 *
 * @tag domain:categories
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:none
 */

/**
 * The confident mappings — 24 of the 30 measured `system` values, covering
 * 1,762 of 1,988 beys.
 *
 * Counts are from `wiki-beys.json` on 2026-10-20 and are recorded so the next
 * reader can tell a shrinking bucket from a renamed one.
 */
export const SYSTEM_TO_LINE = {
  // ── Original (1999-2003) ────────────────────────────────────────────────
  "4 Layer System": "category-original-plastic-gen", //  23
  "Spin Gear System": "category-original-spin-gear", //  99
  "Magnacore System": "category-original-magnacore", //  58
  Magnecore: "category-original-magnacore", //   2 — the wiki's own misspelling
  "Engine Gear System": "category-original-engine-gear", //  35
  "Hard Metal System": "category-original-hms", //  36
  "Heavy Metal System": "category-original-hms", //   2

  // ── Metal Fight / Zero-G (2008-2013) ───────────────────────────────────
  "Metal System": "category-metal-phws", //  44 — MFB's first, pre-Hybrid Wheel
  "Hybrid Wheel System": "category-metal-fusion", // 257
  "4D System": "category-metal-fury-4d", //  21
  "Synchrome System": "category-metal-shogun-steel", //  58
  "Extreme Top System": "category-metal-shogun-steel", //  43 — Hasbro's Zero-G name

  // ── Burst (2015-2023) ──────────────────────────────────────────────────
  "Burst System": "category-burst-classic", // 158
  "Dual Layer System": "category-burst-classic", // 135
  "God Layer System": "category-burst-god", //  77
  "SwitchStrike System": "category-burst-god", //  40
  "Cho-Z Layer System": "category-burst-cho-z", //  79
  "SlingShock System": "category-burst-cho-z", //  63
  "Gatinko Layer System": "category-burst-gt", //  65
  "HyperSphere System": "category-burst-gt", //  67
  "Superking Layer System": "category-burst-superking", //  45
  "SpeedStorm System": "category-burst-superking", //  50
  "Dynamite Battle Layer System": "category-burst-db", //  53
  "QuadDrive System": "category-burst-db", //  74

  // ── Beyblade X (2023- ) ────────────────────────────────────────────────
  "Basic Line": "category-x-basic", // 182
  "Unique Line": "category-x-unique-ux", //  54
  "Custom Line": "category-x-custom-cx", //  52
};

/**
 * 🛑 DELIBERATELY UNMAPPED — 226 beys that land on NO leaf, by choice.
 *
 * Each of these is a real `System=` value I could not place without asserting
 * a generation I have not verified. Filing a Hasbro re-release under the wrong
 * generation is a wrong taxonomy on a live URL, and a slug is the one field
 * that cannot be quietly corrected later (the same reason
 * `gen-category-parts.mjs` refuses rather than guessing an id).
 *
 * They remain fully reachable at `/beys/{slug}` — the detail page does not
 * depend on a category leaf — so the cost of leaving them unmapped is
 * discoverability, not access.
 *
 * The value is the reason, so the reason travels with the key.
 */
export const SYSTEM_UNMAPPED = {
  "(none)":
    "95 beys state no system at all. `series` is sometimes present but names a " +
    "TV season rather than a hardware generation, so it is not a substitute.",
  "Pro Series System":
    "20 beys. A Hasbro premium line that reissues designs ACROSS generations, " +
    "so it is not a generation itself and has no single line to sit under.",
  "Spinning Spirits":
    "1 bey. A one-off spinoff line; too small to justify a forest node and too " +
    "unlike anything else to fold into one.",
};

/** Every system the table covers, for a generator's own reporting. */
export const MAPPED_SYSTEMS = Object.keys(SYSTEM_TO_LINE);

/**
 * The line id for a bey's `system`, or `null` when it is not mapped.
 *
 * 🛑 Returns null rather than a fallback. `lineFor()` already routes a null to
 * `unassigned`, logs it and sets a non-zero exit — which is the behaviour we
 * want, because a silent default would file 226 beys under whichever line was
 * chosen as "close enough".
 */
export function lineForSystem(system) {
  if (!system) return null;
  return SYSTEM_TO_LINE[String(system).trim()] ?? null;
}

#!/usr/bin/env node
/**
 * E4a — extract PART COMPOSITION from the local corpus.
 *
 * 🛑 NO CRAWL. The plan records this as derivable today: `linka/beys/**` is a
 * completed local crawl the user already owns, and 328 of its 335 bey docs
 * carry a slot breakdown. The Wiki API stays the gap-filler (JP/romaji names
 * and the TT↔Hasbro alias map), which is E4c.
 *
 * Output: `docs/research/part-composition-2026-10/` — committed, and the thing
 * D12/D13 seed FROM. This script does not write to Firestore and does not
 * touch `appkit/src/seed/`.
 *
 * ── THE THREE SHAPES, measured rather than assumed ──────────────────────────
 *
 * The breakdown is an ASCII box and the slot line has three forms:
 *
 *   gen2 (MFB/4D)   │  L1: FACE BOLT — Pegasus (cosmic-burst design)   │
 *   gen1 (HMS)      │  LAYER 2: METAL ATTACK RING (MAR) — Upper Dragon │
 *   gen4 (BX)       │  BLADE: AeroPegasus                              │
 *
 * A parser written for one of them silently finds nothing in the other two —
 * which would read as "that generation has no parts" rather than as a parser
 * bug, so all three are handled and the per-generation yield is REPORTED.
 *
 * ── SLOTS MERGE, and that is why the slot set is DATA ───────────────────────
 *
 * `Spin Gear + Blade Base → RUNNING CORE (integrated module)` (HMS) and
 * `SPIN TRACK + TIP combined: F:D` (4D) are real lines in the corpus. So a
 * fixed field-set per generation is WRONG — a `Record<Generation, Slot[]>`
 * cannot express a merge and would drift the moment a system is added
 * (Root Cause #61). Merges are captured explicitly.
 *
 * ── WHAT IS NOT TAKEN ──────────────────────────────────────────────────────
 *
 * 🛑 Facts only — names, codes, weights, slots. Fandom is CC-BY-SA, so the
 * PROSE is not copied; our own descriptions come from the category templates.
 * raikages' scraped bodies, one ending "Add to Wishlist Add to Wishlist", are
 * the example of doing this badly.
 *
 * 🛑 `game-original/` is EXCLUDED by a path test, not a heuristic — those are
 * the user's own game inventions and must never reach a marketplace catalogue.
 *
 * 🛑 A doc that flags its own uncertainty (`[VERIFY …]`, `(presumed)`,
 * `anime-exclusive`) goes to the REVIEW LIST, never to the seed. A self-flagged
 * row is not data.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative, sep } from "node:path";
import { SLOT_LABEL as SHARED_SLOT_LABEL } from "./lib/part-slot-vocab.mjs";

const CORPUS = process.env.BEY_CORPUS
  ?? "C:/Users/mohsi/Downloads/Beyblade-Game-master/linka/beys";
const OUT_DIR = resolve(process.cwd(), "docs/research/part-composition-2026-10");

/** Canonical slot keys. Values are the spellings the corpus actually uses. */
const SLOT_VOCAB = [
  // Gen 1 — Plastic / Spin Gear / Magnacore / Engine Gear / HMS
  ["bit-chip",        ["BIT CHIP", "BIT PROTECTOR", "METAL STONE FACE"]],
  ["attack-ring",     ["ATTACK RING", "METAL ATTACK RING"]],
  ["weight-disk",     ["WEIGHT DISK", "CIRCLE WEIGHT DISK"]],
  ["spin-gear",       ["SPIN GEAR"]],
  ["engine-gear",     ["ENGINE GEAR"]],
  ["blade-base",      ["BLADE BASE"]],
  ["running-core",    ["RUNNING CORE"]],
  // Gen 2 — MFB / 4D / Zero-G
  ["face-bolt",       ["FACE BOLT"]],
  ["energy-ring",     ["ENERGY RING", "4D ENERGY RING", "CRYSTAL / ELEMENT WHEEL", "CRYSTAL WHEEL", "ELEMENT WHEEL"]],
  ["fusion-wheel",    ["FUSION WHEEL", "4D FUSION WHEEL", "METAL WHEEL"]],
  ["chrome-wheel",    ["CHROME WHEEL", "CHROME / WARRIOR WHEEL", "WARRIOR WHEEL"]],
  ["spin-track",      ["SPIN TRACK"]],
  ["performance-tip", ["PERFORMANCE TIP", "BOTTOM"]],
  // Gen 3 — Burst
  ["layer",           ["ENERGY LAYER", "GOD LAYER", "CHO-Z LAYER", "DUAL LAYER", "SINGLE LAYER", "LAYER"]],
  ["disc",            ["FORGE DISC", "DISC", "DISK FRAME"]],
  ["driver",          ["PERFORMANCE DRIVER", "DRIVER"]],
  ["armour",          ["ARMOUR", "ARMOR", "CHASSIS"]],
  // Gen 4 — Beyblade X
  ["blade",           ["BX BLADE", "BLADE"]],
  ["ratchet",         ["RATCHET"]],
  ["bit",             ["BIT"]],
];

/*
 * 🛑 THE OTHER 39 SLOTS, FROM THE SHARED VOCABULARY — NOT A SECOND COPY.
 *
 * The 20 entries above are hand-curated because their spellings carry real
 * aliases the corpus uses ("METAL ATTACK RING", "CRYSTAL / ELEMENT WHEEL")
 * that no label could be derived from. The other 39 do not: for every one of
 * them the corpus spells the slot exactly as its label, uppercased.
 *
 * They are MERGED here rather than transcribed, because a transcribed copy is
 * what caused the bug this fixes. `scripts/lib/part-slot-vocab.mjs` gained
 * Lock Chip / Main Blade / Assist Blade and the whole CX stack on 2026-10-20;
 * `PART_SLOT_LABEL` in the schema mirrors it; and this file kept its own
 * private 20-entry table that nothing updated. So the vocabulary knew about
 * the CX slots, the schema knew, the UI knew — and the one component that
 * reads the corpus did not.
 *
 * The symptom was not an error. `ValkyrieVolt S4-70V` extracted 2 slots of
 * the 5 its own `system` string names, and the product page rendered a Parts
 * tab headed "BX Custom Line (Lock Chip + Main Blade + Assist Blade + Ratchet
 * + Bit)" listing a ratchet and a bit. An unmatched line is skipped silently,
 * so a partial breakdown looks exactly like a complete one.
 *
 * 🛑 A LABEL IS SKIPPED WHEN THE 20 ALREADY CLAIM IT. `armour` lists
 * "CHASSIS" among its spellings while the shared vocab also declares
 * `chassis` as a slot in its own right. Adding it blindly would put two keys
 * on one spelling at equal length, making `slotKeyFor` resolve by sort order
 * — i.e. arbitrarily. The hand-curated mapping wins; that is the same
 * "MAPPED, NOT DUPLICATED" rule the schema states for Forge Disc and Armor.
 */
const CLAIMED = new Set(SLOT_VOCAB.flatMap(([, spellings]) => spellings));
for (const [key, label] of Object.entries(SHARED_SLOT_LABEL)) {
  if (SLOT_VOCAB.some(([k]) => k === key)) continue;
  const spelling = label.toUpperCase();
  if (CLAIMED.has(spelling)) continue;
  SLOT_VOCAB.push([key, [spelling]]);
}

/*
 * 🛑 LONGEST SPELLING FIRST. "METAL ATTACK RING" must not be matched as
 * "ATTACK RING" with "METAL " left dangling, and "BX BLADE" must not resolve
 * to "BLADE". Sorting by length is what makes the mapping deterministic rather
 * than dependent on declaration order.
 */
const SLOT_LOOKUP = SLOT_VOCAB
  .flatMap(([key, spellings]) => spellings.map((s) => [s, key]))
  // Sorted on the NORMALISED length, because that is what is compared.
  .sort((a, b) =>
    a[0].replace(/[^A-Z /]/g, " ").trim().length < b[0].replace(/[^A-Z /]/g, " ").trim().length ? 1 : -1);

/** Lines that are prose or notes, not slots. */
const NOT_A_SLOT = new Set(["NOTE", "NOTES", "GIMMICK", "SUMMARY", "STATS", "TOTAL"]);

/*
 * 🛑 NORMALISE BOTH SIDES, or a vocab entry can be unreachable.
 *
 * This stripped digits from the INPUT (`[^A-Z /]` → space) while comparing
 * against RAW vocab strings — so `"4D ENERGY RING"` and `"4D FUSION WHEEL"`
 * could never match anything: the input became `"D ENERGY RING"` and no
 * spelling in the table looked like that. Three entries were dead, and the
 * symptom was a 4D slot resolving to `layer` with the real slot word left
 * inside the part NAME.
 *
 * A vocabulary whose entries cannot be reached is the Root Cause #33 shape one
 * level in: the value is declared, nothing matches it, and nothing errors.
 */
const normaliseSlotWord = (raw) =>
  raw.replace(/\([^)]*\)/g, "").replace(/[^A-Z /]/g, " ").replace(/\s+/g, " ").trim();

function slotKeyFor(raw) {
  const t = normaliseSlotWord(raw);
  if (!t || NOT_A_SLOT.has(t)) return null;
  for (const [spelling, key] of SLOT_LOOKUP) {
    const sp = normaliseSlotWord(spelling);
    if (!sp) continue;
    if (t === sp || t.startsWith(`${sp} `)) return key;
  }
  return null;
}

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (e.endsWith(".md")) acc.push(p);
  }
  return acc;
}

/**
 * 🛑 NORMALISE THE GENERATION, and this is the third instance of the lesson
 * section 3.8 records for `Type` and `Spin`: the corpus header is freeform prose.
 *
 * Measured raw values include `gen3 (S5 Sparking-era)`, `burst`,
 * `gen4 (canonical)` and `gen4 (canonical) / gen3 S7 (TRACKER cross-listing)`
 * — so grouping on the raw string produced NINE "generations" for four, with
 * single-row buckets that read as real eras.
 *
 * Take the leading `genN` token; fall back to the directory, which is the one
 * signal that cannot be prose. The parenthetical is kept as `generationNote`
 * rather than discarded — it is often the interesting part — but it is never a
 * value anything groups or filters on (Root Cause #33).
 */
const GEN_FROM_PATH = { gen1: "gen1", gen2: "gen2", gen3: "gen3", gen4: "gen4" };
function normaliseGeneration(raw, relPath) {
  const fromPath = GEN_FROM_PATH[relPath.split("/")[0]];
  const m = String(raw ?? "").match(/gen\s*([1-4])/i);
  if (m) return `gen${m[1]}`;
  // `burst` is the gen3 era by name; the directory agrees, so prefer it.
  return fromPath ?? null;
}
function generationNote(raw) {
  const m = String(raw ?? "").match(/\(([^)]+)\)/);
  return m ? m[1].trim() : null;
}

const HEADER = (src, label) => {
  const m = src.match(new RegExp(`^\\*\\*${label}:?\\*\\*\\s*(.+)$`, "mi"));
  return m ? m[1].trim() : null;
};

/** `[VERIFY …]` / `(presumed)` / anime-exclusive — a self-flagged row is not data. */
const UNCERTAIN = /\[VERIFY|\(presumed\)|anime-exclusive|not sold at retail/i;

const files = walk(CORPUS);
const beys = [];
const review = [];
const perGen = new Map();
const slotFreq = new Map();
let merges = 0;

for (const file of files) {
  const rel = relative(CORPUS, file).split(sep).join("/");
  // 🛑 Path test, not a heuristic: the user's own game inventions.
  if (rel.startsWith("game-original/")) continue;

  const src = readFileSync(file, "utf8");
  /*
   * 🛑 THE TITLE IS AN H2 WITH A SUFFIX, and the files are CRLF.
   *
   * The real line is `## Advance Averazer — Gen1 HMS Bey Doc ⭐ Spin-Steal
   * Gimmick`. Matching `^#\s+` found no H1, fell through to the filename, and
   * every one of 259 compositions ended up NAMED `gen1/hms/advance-averazer` —
   * a path. It looked like data and it made the category join 0/259, which is
   * how it was found: a join that matches nothing is a question about the
   * KEYS, not about the data.
   *
   * So: accept `#` or `##`, strip the CR, and take the part before the first
   * em-dash — the suffix after it is a document description, not the bey.
   */
  // 🛑 The CR strip is written with an explicit escape. An earlier edit emitted
  // `.replace(//g, "")` — an EMPTY regex, which JS reads as a line COMMENT, so the
  // rest of the statement vanished, `heading` was always undefined, and every one
  // of 259 compositions silently kept its FILENAME as its name. The script still
  // parsed and still ran; the only symptom was a category join of 0/259.
  const CR = String.fromCharCode(13);
  const heading = src.match(/^#{1,2}\s+(.+?)\s*$/m)?.[1]?.split(CR).join("");
  const name = (heading ? heading.split(/\s+[—–-]\s+/)[0] : rel.replace(/\.md$/, ""))
    .replace(/[⭐✔❌️]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const rawGeneration = HEADER(src, "Generation");
  const generation = normaliseGeneration(rawGeneration, rel);
  const genNote = generationNote(rawGeneration);

  const slots = [];
  const seen = new Set();
  for (const line of src.split("\n")) {
    if (!line.includes("│")) continue;
    const body = line.replace(/[│|]/g, " ").trim();
    // All three shapes: `L1: X — y`, `LAYER 2: X — y`, `X: y`
    const m = body.match(/^(?:L\d+:\s*|LAYER\s+\d+:\s*)?([A-Z][A-Z0-9 /&'()-]{1,40}?)\s*(?:[—–-]|:)\s*(.*)$/);
    if (!m) continue;
    let key = slotKeyFor(m[1]);
    let rest = m[2];

    /*
     * 🛑 `LAYER 4: ENGINE GEAR — Gyro Engine Gear` — the corpus numbers its
     * physical layers AND names the slot inside them, so a line can carry two
     * slot words. Resolving the first gave `layer` and left "ENGINE GEAR —
     * Gyro Engine Gear" as the PART NAME: a wrong slot and a name carrying a
     * slot label. Measured 3 such rows in the live glossary.
     *
     * When the remainder opens with a slot word of its own, that is the real
     * slot and the layer index is just a position.
     */
    /*
     * 🛑 Strip the corpus's emphasis marks BEFORE re-matching. The real line is
     * `LAYER 4: ENGINE GEAR (EG) ⭐ — Gyro Engine Gear`, and the star sits
     * between the slot word and the dash — so the inner match failed on three
     * rows and left "ENGINE GEAR — Gyro Engine Gear" as a part NAME under the
     * wrong slot. Found by reading the live glossary, not by reading the regex.
     */
    rest = rest.replace(/[⭐✔❌️]/g, " ").replace(/\s+/g, " ").trim();
    /*
     * 🛑 Strip PARENTHETICALS before re-matching too. The real line is
     * `LAYER 2: ENERGY RING (ER / Clear Wheel) — Pegasus`, and the slot-word
     * character class excludes lowercase — so "(ER / Clear Wheel)" blocked the
     * inner match and the row kept `layer` with "ENERGY RING — Pegasus" as its
     * part name. `slotKeyFor` already strips parentheticals for exactly this
     * reason; the re-match has to as well, or the two disagree about what a
     * slot word is.
     */
    const restForSlot = rest.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    const inner = restForSlot.match(/^([A-Z][A-Z0-9 /&'()-]{2,34}?)\s*(?:[—–-]|:)\s*(.*)$/);
    if (inner) {
      const innerKey = slotKeyFor(inner[1]);
      if (innerKey) {
        key = innerKey;
        /*
         * Take the remainder from the STRIPPED text: the parenthetical was an
         * annotation on the slot, not part of the name, and the name strip
         * below would remove it anyway.
         */
        rest = inner[2];
      }
    }

    if (!key || seen.has(key)) continue;
    seen.add(key);
    const partName = rest.replace(/\([^)]*\)/g, "").replace(/[⭐✔️❌]/g, "").trim();
    if (!partName) continue;
    /*
     * 🛑 A PLACEHOLDER IS NOT A PART. The corpus writes `N/A` for a slot a
     * system does not have, and taking it literally created glossary rows
     * `spin-gear--n-a` and `weight-disk--n-a` — junk that would render as a
     * real part with a real page. Measured: 2 rows.
     */
    if (/^(n\/?a|none|tbd|unknown|-+)$/i.test(partName)) continue;
    const wM = src.match(new RegExp(`${m[1].replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}[\\s\\S]{0,240}?Weight:\\s*([\\d.]+)\\s*g`, "i"));
    slots.push({
      slotKey: key,
      slotLabel: m[1].trim(),
      partName,
      ...(wM ? { weightG: Number(wM[1]) } : {}),
    });
    slotFreq.set(key, (slotFreq.get(key) ?? 0) + 1);
  }

  // Explicit merges — `Spin Gear + Blade Base → RUNNING CORE`, `SPIN TRACK + TIP combined: F:D`
  const mergeLines = [];
  for (const line of src.split("\n")) {
    const mm = line.match(/([A-Za-z][A-Za-z ]+?)\s*\+\s*([A-Za-z][A-Za-z ]+?)\s*(?:→|->|combined:)\s*([A-Z][A-Za-z0-9: ]+)/);
    if (!mm) continue;
    const a = slotKeyFor(mm[1].toUpperCase()), b = slotKeyFor(mm[2].toUpperCase());
    const into = slotKeyFor(mm[3].toUpperCase());
    if (a && b && into) { mergeLines.push({ into, merges: [a, b] }); merges++; }
  }

  const row = {
    id: rel.replace(/\.md$/, "").replace(/\//g, "-"),
    name,
    generation,
    ...(genNote ? { generationNote: genNote } : {}),
    ...(rawGeneration && rawGeneration !== generation ? { generationRaw: rawGeneration } : {}),
    system: HEADER(src, "System"),
    series: HEADER(src, "Series"),
    productCode: HEADER(src, "Product Code"),
    slots,
    ...(mergeLines.length ? { slotMerges: mergeLines } : {}),
    source: rel,
  };

  if (slots.length === 0) {
    review.push({ ...row, reason: "no slot breakdown found" });
  } else if (UNCERTAIN.test(src)) {
    review.push({ ...row, reason: "the document flags its own uncertainty" });
  } else {
    beys.push(row);
    perGen.set(generation, (perGen.get(generation) ?? 0) + 1);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "composition.json"), JSON.stringify(beys, null, 2) + "\n");
writeFileSync(join(OUT_DIR, "review-list.json"), JSON.stringify(review, null, 2) + "\n");

const slotRows = [...slotFreq].sort((a, b) => b[1] - a[1]);
writeFileSync(
  join(OUT_DIR, "slot-frequency.json"),
  JSON.stringify(Object.fromEntries(slotRows), null, 2) + "\n",
);

console.log(`docs scanned:        ${files.length}`);
console.log(`beys with slots:     ${beys.length}`);
console.log(`review list:         ${review.length}`);
console.log(`explicit slot merges:${merges}`);
console.log(`\nper generation (extracted):`);
for (const [g, n] of [...perGen].sort()) console.log(`  ${String(g).padEnd(10)} ${n}`);
console.log(`\nslot frequency:`);
for (const [k, n] of slotRows) console.log(`  ${k.padEnd(16)} ${n}`);
console.log(`\nwritten to ${relative(process.cwd(), OUT_DIR)}`);

/*
 * 🛑 A generation yielding ZERO is a parser failure, not an empty generation —
 * and it is the failure that reads as data. Reported loudly rather than left
 * for someone to notice in a count.
 */
const EXPECTED_GENS = ["gen1", "gen2", "gen3", "gen4"];
const missing = EXPECTED_GENS.filter((g) => !perGen.has(g));
if (missing.length) {
  console.log(`\n🛑 NO COMPOSITION EXTRACTED FOR: ${missing.join(", ")}`);
  console.log("   Each generation writes its breakdown differently; a parser that");
  console.log("   finds nothing in one of them looks exactly like a generation with");
  console.log("   no parts. Fix the parser, do not accept the number.");
  process.exit(1);
}

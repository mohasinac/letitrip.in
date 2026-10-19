#!/usr/bin/env node
/**
 * E4b — the PART GLOSSARY, keyed `(classification, code)`.
 *
 * 🛑 KEYED ON THE PAIR, NEVER ON THE CODE ALONE. `105` is a Metal Fight
 * spin-track height, a bare number in Burst is a disc, and `1-60` is a
 * Beyblade X ratchet. Code-alone would explain a Burst disc as a spin track —
 * the same namespacing argument as the feature `group` field.
 *
 * ── THREE SOURCES, and the plan was wrong about the largest ────────────────
 *
 * The plan says `case study/` has "1,920 parseable `## Case N — Part Name
 * (X.X g)` headers". Measured: there ARE 1,920 case headers, and they are
 * **physics and game-design cases** — "Hit to a Freely Suspended Body",
 * "Track Height as a Physics Variable", "[SPECIAL MOVE] …", arena analyses.
 * Only **89** carry a weight, and those are the real parts. section 3.8's own
 * wording ("89 carry a confirmed weight in the header") was right; the 1,920
 * figure is a count of cases, not of parts.
 *
 * Taking 1,920 at face value would have produced a glossary mostly made of
 * physics essays with part-shaped keys — which is worse than a small one,
 * because it would look comprehensive.
 *
 * | Source | Measured | Gives |
 * |---|---|---|
 * | `case study/` weight-bearing headers | **89** | name, code, weight |
 * | `linka/bottom_parts.txt` | **35** (the plan said 44) | tip code → full name |
 * | E4a's composition output | 260 beys | part names WITH their slot, i.e. classification for free |
 *
 * ── WHAT THIS UNBLOCKS ─────────────────────────────────────────────────────
 *
 * D2 Fix 3's alias tokens: "rubber flat" must find `RF` and `RF` must find
 * "rubber flat". That is the whole reason the glossary is a prerequisite, and
 * it is why `aliases` carries the code, the full name AND the spoken form.
 *
 * 🛑 It shares the 600-token `searchTxt` budget with D0's generated misspelling
 * variants, which truncate SILENTLY. Measure before adding a third source.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { resolve, join, relative } from "node:path";
import { SLOT_LABEL as SHARED_SLOT_LABEL } from "./lib/part-slot-vocab.mjs";

const ROOT = process.env.BEY_ROOT ?? "C:/Users/mohsi/Downloads/Beyblade-Game-master";
const CASES = join(ROOT, "case study");
const TIPS = join(ROOT, "linka/bottom_parts.txt");
const COMPOSITION = resolve(process.cwd(), "docs/research/part-composition-2026-10/composition.json");
const OUT_DIR = resolve(process.cwd(), "docs/research/part-composition-2026-10");

/**
 * Slot key → the classification a buyer sees. Mirrors E4a's `SLOT_VOCAB` keys
 * so the two outputs join without a translation table.
 */
const CLASSIFICATION = {
  "bit-chip": "Bit Chip", "attack-ring": "Attack Ring", "weight-disk": "Weight Disk",
  "spin-gear": "Spin Gear", "engine-gear": "Engine Gear", "blade-base": "Blade Base",
  "running-core": "Running Core", "face-bolt": "Face Bolt", "energy-ring": "Energy Ring",
  "fusion-wheel": "Fusion Wheel", "chrome-wheel": "Chrome Wheel", "spin-track": "Spin Track",
  "performance-tip": "Performance Tip", layer: "Layer", disc: "Disc", driver: "Driver",
  armour: "Armour", blade: "Blade", ratchet: "Ratchet", bit: "Bit",
};

/*
 * 🛑 THE OTHER 39 CLASSIFICATIONS, FROM THE SHARED VOCABULARY.
 *
 * The map above is the THIRD hand-transcribed copy of one vocabulary — the
 * other two being `SLOT_VOCAB` in `extract-part-composition.mjs` and
 * `PART_SLOT_LABEL` in the schema. Its own docstring says it "mirrors E4a's
 * SLOT_VOCAB keys", which is exactly the promise a transcription cannot keep:
 * the shared vocabulary gained the CX stack and 38 other slots on 2026-10-20
 * and all three copies had to be updated by hand. Two were not.
 *
 * The consequence here is silent by construction. The composition loop below
 * does `const cls = CLASSIFICATION[s.slotKey]; if (!cls) continue;` — so a
 * slot whose key is absent contributes NO glossary row, with no warning. That
 * is why `lock-chip`, `main-blade` and `assist-blade` had zero parts between
 * them: ValkyrieVolt's Lock Chip "Valkyrie", Main Blade "Volt" and Assist
 * Blade "Slash" render their names on the product page and link nowhere,
 * because the part pages they would link to were never generated.
 *
 * Merged rather than transcribed a fourth time. Existing keys win, so the
 * curated spellings above ("Armour", not the shared "Armor") are preserved —
 * the two outputs must agree on the string, since it is the join key.
 */
for (const [key, label] of Object.entries(SHARED_SLOT_LABEL)) {
  if (!(key in CLASSIFICATION)) CLASSIFICATION[key] = label;
}

/** Infer the slot from a part NAME, for sources that do not state one. */
const NAME_TO_SLOT = [
  [/\bbottom\b|\btip\b|\bflat\b|\bsharp\b|\bball\b|\bdefen[cs]e\b/i, "performance-tip"],
  [/\btrack\b/i, "spin-track"],
  [/\bmetal wheel\b|\bfusion wheel\b/i, "fusion-wheel"],
  [/\bchrome wheel\b|\bwarrior wheel\b/i, "chrome-wheel"],
  [/\bclear wheel\b|\bcrystal wheel\b|\benergy ring\b|\belement wheel\b/i, "energy-ring"],
  [/\bface bolt\b|\bmetal face\b/i, "face-bolt"],
  [/\battack ring\b/i, "attack-ring"],
  [/\bweight disk\b|\bweight disc\b/i, "weight-disk"],
  [/\bspin gear\b|\bsg\b/i, "spin-gear"],
  [/\bblade base\b/i, "blade-base"],
  [/\brunning core\b/i, "running-core"],
  [/\bratchet\b/i, "ratchet"],
  [/\bdriver\b/i, "driver"],
  [/\bforge disc\b|\bdisc\b/i, "disc"],
  [/\blayer\b/i, "layer"],
  [/\bblade\b/i, "blade"],
];

function slotFromName(name) {
  for (const [re, key] of NAME_TO_SLOT) if (re.test(name)) return key;
  return null;
}

/** Spoken form for an abbreviation, so "rubber flat" finds RF (D2 Fix 3). */
const CODE_WORDS = {
  R: "right", L: "left", W: "wide", S: "sharp", B: "ball", F: "flat", D: "defense",
  M: "metal", RB: "rubber", H: "hole", X: "extreme", C: "circle", G: "gear",
  E: "eternal", J: "jog", T: "twin", Q: "quake", CS: "coat", SD: "semi defense",
};

const glossary = new Map(); // "classification|code" -> row
const sources = { cases: 0, tips: 0, composition: 0 };

/**
 * Collapse double spaces, and drop a leading classification that duplicates
 * the column next to it.
 *
 * 🛑 The case-study source writes `Fusion Wheel: Dark` and `Energy Ring:
 * Capricorn` — correctly classified, redundantly named. A part page headed
 * "Fusion Wheel" showing "Fusion Wheel: Dark" reads as a bug, and the two
 * sources then disagree about the same part's name, so they would not merge:
 * the composition knows it as "Dark".
 */
const CLASSIFICATION_PREFIX =
  /^(bit chip|attack ring|weight disk|spin gear|engine gear|blade base|running core|face bolt|energy ring|fusion wheel|chrome wheel|spin track|performance tip|layer|disc|driver|armour|blade|ratchet|bit)\s*:\s*/i;

/*
 * 🛑 BALANCE THE PARENS. Measured: 8 of 753 names arrive truncated at their
 * closing bracket — "First Clutch Base (Zeus", "Hit Release (Draciel",
 * "Right SG (Bearing" — because an upstream corpus parse split on `)`.
 *
 * Appending the missing bracket cannot be wrong: an unbalanced `(` in a display
 * name is never correct, and the alternative is a part PAGE TITLE and a
 * category name that read as cut off. The names also become slugs, and
 * `(Zeus` and `(Zeus)` slug identically, so this changes what a human reads
 * and not what anything resolves.
 *
 * It is a repair, not a parse fix — the upstream split is recorded here rather
 * than chased, because the corpus line is not the thing shipping.
 */
const balanceParens = (n) => {
  const opens = (n.match(/\(/g) || []).length;
  const closes = (n.match(/\)/g) || []).length;
  return opens > closes ? n + ")".repeat(opens - closes) : n;
};

const normName = (n) =>
  balanceParens(
    String(n).replace(/\s+/g, " ").replace(CLASSIFICATION_PREFIX, "").trim(),
  );

/*
 * 🛑 INDEXED BY NAME AS WELL AS BY (classification, code), because the three
 * sources identify a part differently: `bottom_parts.txt` knows
 * `RF: Rubber Flat` (code + name) while the composition knows
 * `R²F Double Rubber Flat` (name only, `code: null`). Without a name index
 * they become two rows and **the code never reaches the part** — which is
 * exactly the join "rubber flat" ⇄ `RF` depends on, i.e. the one job this
 * glossary exists to unblock (D2 Fix 3).
 *
 * The first version keyed on `(classification, code ?? name)` and filled only
 * keys that were `undefined`. A composition row sets `code: null` EXPLICITLY,
 * and `null !== undefined`, so a code could never fill in. The control caught
 * it: the row printed "(no code)" and `RF` was absent from the whole glossary.
 */
const byName = new Map(); // "classification|NORMALISEDNAME" -> row

function add(classification, code, name, extra = {}) {
  if (!classification || !name) return false;
  const clean = normName(name);
  const nameKey = `${classification}|${clean.toUpperCase()}`;
  const codeKey = code ? `${classification}|${String(code).toUpperCase()}` : null;

  // Match on either identity — whichever this source happens to carry.
  const prev = (codeKey && glossary.get(codeKey)) || byName.get(nameKey);
  if (prev) {
    // 🛑 `== null`, not `=== undefined`: a stored `null` must be fillable.
    for (const [k, v] of Object.entries(extra)) if (v != null && prev[k] == null) prev[k] = v;
    if (code && prev.code == null) {
      prev.code = code;
      glossary.set(`${classification}|${String(code).toUpperCase()}`, prev);
    }
    byName.set(nameKey, prev);
    return false;
  }

  const row = { classification, code: code ?? null, name: clean, ...extra };
  glossary.set(codeKey ?? nameKey, row);
  byName.set(nameKey, row);
  return true;
}

// ── 1. The 89 weight-bearing case headers ──────────────────────────────────
if (existsSync(CASES)) {
  for (const f of readdirSync(CASES).filter((f) => f.endsWith(".md"))) {
    for (const line of readFileSync(join(CASES, f), "utf8").split("\n")) {
      const m = line.match(/^## Case \d+ — (.+?)\s*\(([\d.]+)\s*g\)\s*$/);
      if (!m) continue;
      // `Wing 105 Track / W105` → name + code; `Galaxy Metal Wheel` → name only.
      const [, raw, weight] = m;
      const parts = raw.split("/").map((s) => s.trim());
      const name = parts[0];
      // A code is a short, mostly-uppercase trailing token.
      const tail = parts.length > 1 ? parts[parts.length - 1] : null;
      const code = tail && tail.length <= 8 && /^[A-Z0-9:²'·-]+$/i.test(tail) && tail === tail.toUpperCase()
        ? tail
        : null;
      const slot = slotFromName(raw);
      if (!slot) continue;
      if (add(CLASSIFICATION[slot], code, name, { weightG: Number(weight), source: "case-study" })) sources.cases++;
    }
  }
}

// ── 2. The tip glossary ────────────────────────────────────────────────────
if (existsSync(TIPS)) {
  for (const line of readFileSync(TIPS, "utf8").split("\n")) {
    const m = line.match(/^\d+\s+([A-Z0-9:']+):\s*(.+?)\s*$/);
    if (!m) continue;
    const [, code, name] = m;
    if (add("Performance Tip", code, name, { source: "bottom-parts" })) sources.tips++;
  }
}

// ── 3. E4a's composition — part names already paired with their slot ───────
if (existsSync(COMPOSITION)) {
  const beys = JSON.parse(readFileSync(COMPOSITION, "utf8"));
  for (const bey of beys) {
    for (const s of bey.slots ?? []) {
      const cls = CLASSIFICATION[s.slotKey];
      if (!cls) continue;
      if (add(cls, null, s.partName, {
        weightG: s.weightG,
        usedBy: undefined,
        source: "composition",
      })) sources.composition++;
      // Which beys use this part — the single most useful thing a part page says.
      const row = byName.get(`${cls}|${normName(s.partName).toUpperCase()}`);
      if (row) (row.usedBy ??= []).push(bey.id);
    }
  }
}

// Aliases: the code, the full name, and the spoken form of the code.
for (const row of glossary.values()) {
  const aliases = new Set();
  if (row.code) {
    aliases.add(row.code.toLowerCase());
    const spoken = row.code.toUpperCase().match(/[A-Z]{1,2}/g)?.map((c) => CODE_WORDS[c]).filter(Boolean);
    if (spoken?.length) aliases.add(spoken.join(" "));
  }
  aliases.add(row.name.toLowerCase());
  aliases.delete("");
  row.aliases = [...aliases];
  if (row.usedBy) row.usedBy = [...new Set(row.usedBy)].sort();
}

const rows = [...glossary.values()].sort((a, b) =>
  a.classification.localeCompare(b.classification) || a.name.localeCompare(b.name));

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "part-glossary.json"), JSON.stringify(rows, null, 2) + "\n");

const byCls = new Map();
for (const r of rows) byCls.set(r.classification, (byCls.get(r.classification) ?? 0) + 1);

console.log(`glossary rows: ${rows.length}`);
console.log(`  from case-study headers: ${sources.cases}`);
console.log(`  from bottom_parts.txt:   ${sources.tips}`);
console.log(`  from E4a composition:    ${sources.composition}`);
console.log(`\nby classification:`);
for (const [c, n] of [...byCls].sort((a, b) => b[1] - a[1])) console.log(`  ${c.padEnd(18)} ${n}`);
console.log(`\nwith a weight: ${rows.filter((r) => r.weightG != null).length}`);
console.log(`with a code:   ${rows.filter((r) => r.code).length}`);
console.log(`with usedBy:   ${rows.filter((r) => r.usedBy?.length).length}`);
console.log(`\nwritten to ${relative(process.cwd(), join(OUT_DIR, "part-glossary.json"))}`);

/*
 * 🛑 The alias round-trip this exists for (D2 Fix 3). If this prints nothing,
 * the glossary cannot do the one job it was a prerequisite for.
 */
const rf = rows.find((r) => r.code === "RF");
console.log(`\nalias control — "rubber flat" ⇄ RF:`);
if (!rf) {
  console.log("  NO ROW WITH CODE 'RF' - the glossary cannot serve D2 Fix 3");
  process.exit(1);
}
console.log(`  ${rf.classification} / ${rf.code} - ${rf.name}`);
console.log(`  aliases: ${rf.aliases.join(", ")}`);
const bothWays = rf.aliases.includes("rf") && rf.aliases.some((a) => /rubber flat/i.test(a));
console.log(`  searchable BOTH ways: ${bothWays ? "yes" : "NO"}`);
if (!bothWays) process.exit(1);

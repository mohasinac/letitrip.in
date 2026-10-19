/**
 * Shared reader for the corpus's CURATED PART TABLES.
 *
 * Two source families, 18 files, measured as the best spec source available:
 *
 *   linka/parts/{gen1,hms,mfb,burst,bx}/*.md   14 files, per-ROW provenance tags
 *   linka/gen{1,2,3,4}/parts-glossary.md        4 files, broadest coverage
 *
 * ── 🛑 WHY THESE AND NOT THE FANDOM CRAWL ──────────────────────────────────
 *
 * Measured against our 752 seeded parts, slot-scoped:
 *
 *   these 18 curated tables      288 / 752  =  38.2%
 *   fandom per-part pages         80 / 753  =  10.6%
 *
 * The crawl's 946 per-part pages are Burst/X only, while 573 of our 752 parts
 * are Plastic/HMS/MFB/Zero-G. The curated tables also already carry the
 * worldbeyblade mm dimensions PRE-DIGESTED and tagged, which is why that
 * source is demoted to fill-only rather than read first.
 *
 * ── 🛑 JOIN ON (slot, name) OR (slot, code) — NEVER ON A NAME ALONE ────────
 *
 * A name-only join across slots produces 42 verified-wrong pairings:
 * Fusion Wheel "Rock" matches a Burst `Base - Rock`, Performance Tip "Atomic"
 * matches a Burst `Driver - Atomic`, Ratchet "1" matches an `Armor - 1`, and
 * Face Bolt "Pegasus" matches a `GT Chip - Pegasus`. Slot-scoping eliminates
 * all 42 structurally — none of those pairs shares a slot — so there is no
 * blocklist here and none should be added.
 *
 * ── 🛑 A `~` IN A COLUMN HEADER MARKS THE WHOLE COLUMN ESTIMATED ───────────
 *
 * gen3 and gen4 write `| Code | Full Name | Material | ~Weight | ... |`, and
 * gen2's `Weight (approx)` says the same thing in words. A per-CELL check
 * alone would publish 300+ estimates as facts — a confident wrong number with
 * no error anywhere, which is the failure mode this corpus work exists to
 * avoid. Header marking is therefore checked FIRST and overrides the row tag.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 */

import fs from "node:fs";
import path from "node:path";

/**
 * The slot vocabulary. ONE definition, shared with the wiki extractor.
 *
 * 🛑 This file carried its own 20-item copy until the wiki crawl grew the set
 * to 56. Two lists is the Root Cause #61 shape — ten hand-written
 * enumerations of one union — and the failure here would be quiet: a table
 * whose slot exists in one list and not the other is dropped as
 * "unresolvable" and reported as a corpus gap rather than a code gap.
 */
export { ALL_SLOTS as SLOTS } from "./part-slot-vocab.mjs";
import { ALL_SLOTS } from "./part-slot-vocab.mjs";

const SLOT_SET = new Set(ALL_SLOTS);

/**
 * `partGlossaryId` from the schema, reproduced exactly.
 *
 * 🛑 Must stay byte-identical to `appkit/src/features/parts/schemas/firestore.ts`.
 * A divergence here does not error — it produces ids that match no document, so
 * every spec silently attaches to nothing and the report reads as a clean miss.
 */
export function partGlossaryId(slot, codeOrName) {
  const tail = String(codeOrName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slot}--${tail}`;
}

/** Punctuation-free lowercase key, for matching a cell against a seeded name. */
export function normaliseName(raw) {
  return String(raw)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

/**
 * Strip the markdown a cell can carry: bold, italics, links, code spans.
 * gen2 writes `**Metal**` for its material column and gen4 puts
 * `**B4 Hall of Fame BANNED (April 2025)**` inside a notes cell.
 */
export function cleanCell(raw) {
  return String(raw)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cells that assert ABSENCE. These emit NOTHING — never an empty spec row.
 *
 * `—` is the corpus's own "no value" marker and appears in 68 dimension cells;
 * `none documented` is its explicit negative assertion, which is a different
 * and more useful fact than silence but still not a spec value.
 */
const EMPTY_CELL = /^(|—|-|–|n\/?a|none|none documented|unknown|tbd|\?)$/i;

export function isEmptyCell(raw) {
  return EMPTY_CELL.test(cleanCell(raw));
}

/* ── Provenance ──────────────────────────────────────────────────────────── */

/**
 * The corpus's own confidence vocabulary, mapped to ours.
 *
 * `FACT(PDB)` means verified against PlasticsDB's individual part page, which
 * is the strongest claim the corpus makes about a legacy part, so it maps to
 * `confirmed`. A bare `FACT` is `fact`. `INFERENCE` is `inferred`.
 */
export function confidenceFromTag(tagCell) {
  const t = cleanCell(tagCell).toUpperCase();
  if (!t) return null;
  if (t.includes("FACT(PDB)") || t.includes("FACT (PDB)")) return "confirmed";
  if (t.includes("CONFIRMED")) return "confirmed";
  if (t.includes("FACT")) return "fact";
  if (t.includes("INFERENCE") || t.includes("INFERRED")) return "inferred";
  if (t.includes("ESTIMATE")) return "estimated";
  return null;
}

/** A `~` or `(approx)` anywhere in the header marks the column estimated. */
function headerIsEstimated(header) {
  const h = cleanCell(header);
  return /~/.test(h) || /\(\s*approx\.?\s*\)/i.test(h);
}

/** A leading `~` or a `±` on the VALUE marks that one cell estimated. */
function cellIsEstimated(value) {
  return /^[~≈]/.test(cleanCell(value)) || /\bapprox\b/i.test(cleanCell(value));
}

/* ── Column mapping ──────────────────────────────────────────────────────── */

/**
 * Which column holds the part's NAME, and which its printed CODE.
 *
 * The 18 files use eleven different spellings for "the name of the part":
 * `AR Name`, `WD Name`, `Base Name`, `Core Name`, `Blade Name`, `Bit`,
 * `Ratchet`, `Disc`, `Driver`, `Code`, `Name`. Where both `Code` and
 * `Full Name` are present (every gen2/gen3/gen4 table and the MFB files) the
 * code is the id tail and the full name is the label, which is exactly the
 * `(slot, code)` key the glossary is built on.
 */
const NAME_HEADERS = /^(.*\bname\b.*|bit|ratchet|blade|disc|driver|core|base|tip|track|wheel|layer|part)$/i;
const CODE_HEADERS = /^(code|abbrev\.?|abbreviation)$/i;
const FULLNAME_HEADERS = /^(full name|name)$/i;

/**
 * Spec columns worth publishing, mapped to the label a buyer sees.
 *
 * Deliberately an ALLOW-LIST. The tables also carry `Source Bey`, `Source
 * Beys`, `Case`, `Tag`, `Era`, `Source`, `Competitive Tier`, `Competitive
 * Notes`, `Competitive Use`, `Key Behavior`, `Notes` and `Molds` — provenance,
 * editorial prose and cross-references, none of which is a specification. A
 * deny-list would publish every column nobody thought to exclude, which is the
 * public-projection failure this codebase has already paid for once.
 */
const SPEC_COLUMNS = [
  [/^weight(\s*\(.*\))?$/i, { label: "Weight", unit: "g" }],
  [/^~?weight(\s*\(g\))?$/i, { label: "Weight", unit: "g" }],
  /*
   * Material comes in five spellings across the 18 files — `Material`,
   * `Body Mat.`, `Tip Material`, `Shaft/Tip Mat.`, `Mat.`. Matching only the
   * first left the 30-row "PLASTIC GEN — SPIN GEARS, CORES & CEWs" table with
   * NO recognised spec column at all, so every row was skipped and the report
   * read `spin-gear 0/14` as though the corpus held nothing.
   */
  [/^material$/i, { label: "Material" }],
  [/^body\s*mat\.?(erial)?$/i, { label: "Body material" }],
  [/^(shaft\s*\/\s*)?tip\s*mat\.?(erial)?$/i, { label: "Tip material" }],
  [/^mat\.$/i, { label: "Material" }],
  [/^type$/i, { label: "Type" }],
  [/^spin(\s*dir(ection)?)?$/i, { label: "Spin direction" }],
  [/^(tip )?shape$/i, { label: "Tip shape" }],
  [/^tip type$/i, { label: "Tip type" }],
  [/^profile$/i, { label: "Tip profile" }],
  [/^height(\s*\(mm\))?$/i, { label: "Height", unit: "mm" }],
  [/^full h(eight)?$/i, { label: "Full height", unit: "mm" }],
  [/^tip h(eight)?$/i, { label: "Tip height", unit: "mm" }],
  [/^max\s*h(eight)?$/i, { label: "Maximum height", unit: "mm" }],
  [/^min\s*h(eight)?$/i, { label: "Minimum height", unit: "mm" }],
  [/^full w(idth)?$/i, { label: "Full width", unit: "mm" }],
  [/^tip w(idth)?$/i, { label: "Tip width", unit: "mm" }],
  [/^width(\s*\(mm\))?$/i, { label: "Width", unit: "mm" }],
  [/^outer diameter$/i, { label: "Outer diameter", unit: "mm" }],
  [/^diameter(\s*\(mm\))?$/i, { label: "Diameter", unit: "mm" }],
  [/^angle$/i, { label: "Tip angle" }],
  [/^protrusions$/i, { label: "Protrusions" }],
  [/^classification$/i, { label: "Classification" }],
  [/^spin compat\.?$/i, { label: "Spin compatibility" }],
  [/^shape \/ contact geometry$/i, { label: "Contact geometry" }],
  [/^movement (pattern|behavior|behaviour)$/i, { label: "Movement" }],
  [/^spin retention$/i, { label: "Spin retention" }],
  [/^xtreme dash$/i, { label: "Xtreme Dash" }],
  [/^(mold variants|molds)$/i, { label: "Mould variants" }],
  [/^key feature$/i, { label: "Key feature" }],
  [/^gimmick$/i, { label: "Gimmick" }],
  [/^burst system era$/i, { label: "Burst era" }],
];

function specColumnFor(header) {
  const h = cleanCell(header);
  for (const [re, def] of SPEC_COLUMNS) if (re.test(h)) return def;
  return null;
}

/* ── Section titles that are NOT part catalogues ─────────────────────────── */

/**
 * 🛑 Dropped sections are COUNTED AND PRINTED, never silently skipped.
 *
 * These tables are keyed on something other than a part: an engine field name,
 * a weight band, a prior estimate being corrected, a physics rule. Letting one
 * through would mint parts called "Weight Class" and "Attack" — and a larger
 * dropped list than the report records means the slot resolver has broken,
 * which is the one failure mode this list exists to make visible.
 *
 * 🛑 THIS LIST WAS OVER-BROAD AND SILENTLY ATE REAL PARTS. Its first version
 * also matched `cew`, `cwd` and `sub attack rings`, which are PART FAMILIES
 * rather than section types — so "PLASTIC GEN — SPIN GEARS, CORES & CEWs" was
 * dropped for the word CEW in its heading, taking 30 rows of spin-gear data
 * with it and reporting `spin-gear 0/14` as though the corpus had none.
 * "HMS — CUSTOMIZE WEIGHT DISKS (CWDs)" and "Sub Attack Rings (SAR)" went the
 * same way, and case study §1.10 lists SAR as a documented Gen1 part at 2–5 g.
 *
 * Match on what a section IS, never on a part name that happens to appear in
 * its title.
 */
const NON_CATALOGUE_SECTION =
  /(engine mapping|engine tipshape|engine notes|category mapping|weight range|weight class|weight summary|corrections? vs|prior estimate|physics rules?|naming convention|disambiguation|chassis concept|system structure|overview|quick reference|notes?$|dash \(.\) rule|note on naming|gear bit mechanic)/i;

/* ── Table parsing ───────────────────────────────────────────────────────── */

/** Split one markdown table row into trimmed cells. */
function splitRow(line) {
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((c) => c.trim());
}

const DIVIDER = /^\s*\|?[\s:|-]+\|[\s:|-]*$/;

/**
 * Walk a markdown file and yield every table with the heading trail above it.
 * Heading trail is what resolves the slot, so it is tracked per level rather
 * than as a single "last heading seen".
 */
export function readTables(markdown) {
  const lines = markdown.split(/\r?\n/);
  const tables = [];
  const trail = { h1: "", h2: "", h3: "", h4: "" };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = cleanCell(heading[2]);
      if (level === 1) Object.assign(trail, { h1: text, h2: "", h3: "", h4: "" });
      else if (level === 2) Object.assign(trail, { h2: text, h3: "", h4: "" });
      else if (level === 3) Object.assign(trail, { h3: text, h4: "" });
      else trail.h4 = text;
      continue;
    }
    if (!line.trim().startsWith("|")) continue;
    const next = lines[i + 1];
    if (!next || !DIVIDER.test(next)) continue;

    const headers = splitRow(line);
    const rows = [];
    let j = i + 2;
    for (; j < lines.length; j += 1) {
      const r = lines[j];
      if (!r.trim().startsWith("|")) break;
      rows.push(splitRow(r));
    }
    tables.push({ headers, rows, trail: { ...trail } });
    i = j - 1;
  }
  return tables;
}

/* ── Slot resolution ─────────────────────────────────────────────────────── */

/** `attack-rings` → `attack-ring`. Plural filenames, singular slots. */
function depluralise(s) {
  return s.replace(/ies$/, "y").replace(/s$/, "");
}

/**
 * The slot vocabulary as it appears in prose, longest first so that
 * "attack ring" is tested before "ring" and "bit chip" before "bit".
 */
const SLOT_PHRASES = [
  // Longest first — "sub attack ring" must beat "attack ring", and
  // "customize weight disk" must beat "weight disk".
  ["sub attack ring", "sub-attack-ring"],
  ["customize weight disk", "weight-disk"],
  ["customize engine weight", "cew"],
  ["gear chip", "gear-chip"],
  ["gatinko chip", "gatinko-chip"],
  ["superking chip", "superking-chip"],
  ["sparking chip", "superking-chip"],
  ["storm chip", "storm-chip"],
  ["strike chip", "strike-chip"],
  ["drive chip", "drive-chip"],
  ["lock chip", "lock-chip"],
  ["gt chip", "gt-chip"],
  ["db core", "db-core"],
  ["layer base", "base"],
  ["layer ring", "ring"],
  ["assist blade", "assist-blade"],
  ["main blade", "main-blade"],
  ["over blade", "over-blade"],
  ["metal blade", "metal-blade"],
  ["bu blade", "bu-blade"],
  ["qs blade", "qs-blade"],
  ["armor tip", "armor-tip"],
  ["bit protector", "bit-protector"],
  ["warrior wheel", "warrior-wheel"],
  ["element wheel", "element-wheel"],
  ["light wheel", "light-wheel"],
  ["evolution gear", "evolution-gear"],
  ["chassis", "chassis"],
  ["frame", "frame"],
  ["bit chip", "bit-chip"],
  ["attack ring", "attack-ring"],
  ["weight disk", "weight-disk"],
  ["weight ring", "weight-disk"],
  ["spin gear", "spin-gear"],
  ["engine gear", "engine-gear"],
  ["blade base", "blade-base"],
  ["running core", "running-core"],
  ["face bolt", "face-bolt"],
  ["energy ring", "energy-ring"],
  ["energy layer", "layer"],
  ["fusion wheel", "fusion-wheel"],
  ["metal wheel", "fusion-wheel"],
  ["chrome wheel", "chrome-wheel"],
  ["spin track", "spin-track"],
  ["performance tip", "performance-tip"],
  ["tips catalog", "performance-tip"],
  ["bottoms", "performance-tip"],
  ["bottom", "performance-tip"],
  ["ratchet", "ratchet"],
  ["driver", "driver"],
  ["armour", "armour"],
  ["armor", "armour"],
  ["blade", "blade"],
  ["layer", "layer"],
  ["disc", "disc"],
  ["bit", "bit"],
];

/**
 * Resolve a table's slot from file path, then H2, then H3.
 *
 * Returns `null` rather than guessing. A `null` row is dropped and reported —
 * `Disc Frames`, `DB Cores` and `Chassis Types` are real part families the
 * 20-slot vocabulary has no key for, and inventing one would put rows in a
 * classification no page renders and no document joins.
 */
export function resolveSlot({ filePath, trail }) {
  const base = depluralise(path.basename(filePath, ".md").toLowerCase());
  const direct = base.replace(/_/g, "-");
  if (SLOT_SET.has(direct)) return direct;

  for (const probe of [trail.h3, trail.h2, path.basename(filePath, ".md"), trail.h1]) {
    if (!probe) continue;
    const hay = ` ${String(probe).toLowerCase().replace(/[^a-z]+/g, " ")} `;
    for (const [phrase, slot] of SLOT_PHRASES) {
      if (hay.includes(` ${phrase} `) || hay.includes(` ${phrase}s `)) return slot;
    }
  }
  return null;
}

/* ── Value parsing ───────────────────────────────────────────────────────── */

/**
 * A single unambiguous gram figure, or `null`.
 *
 * 🛑 Multi-valued cells are NEVER resolved. `15.3g (regular) / 15.5g (indent
 * mold)` is two real measurements of two real moulds, and picking the first is
 * an invention — the verbatim string is published as the spec VALUE while
 * `weightG` stays unset, so nothing downstream gets a number the corpus did
 * not give.
 */
export function singleWeightG(raw) {
  const v = cleanCell(raw);
  if (isEmptyCell(v)) return null;
  const all = v.match(/(\d+(?:\.\d+)?)\s*g\b/gi) ?? [];
  if (all.length !== 1) return null;
  if (/\//.test(v)) return null;
  const n = Number.parseFloat(all[0]);
  return Number.isFinite(n) && n > 0 && n < 500 ? n : null;
}

/* ── The reader ──────────────────────────────────────────────────────────── */

/**
 * Read one file into `{ specs, dropped, disagreements }`.
 *
 * `specs` is a flat list of `{ slot, name, code, label, value, unit, source,
 * confidence }`. Nothing is merged here — merging is the caller's job, because
 * precedence spans files and this function only knows about one.
 */
export function readPartSpecFile(filePath, sourceKind) {
  const markdown = fs.readFileSync(filePath, "utf8");
  const rel = filePath.replace(/\\/g, "/");
  const out = { specs: [], dropped: [], rows: 0 };

  for (const table of readTables(markdown)) {
    const sectionTitle = table.trail.h3 || table.trail.h2 || table.trail.h1;

    if (NON_CATALOGUE_SECTION.test(sectionTitle)) {
      out.dropped.push({
        file: rel,
        section: sectionTitle,
        rows: table.rows.length,
        reason: "not a part catalogue (engine map, weight band, correction or prose rule)",
      });
      continue;
    }

    const slot = resolveSlot({ filePath, trail: table.trail });
    if (!slot) {
      out.dropped.push({
        file: rel,
        section: sectionTitle,
        rows: table.rows.length,
        reason: "slot unresolvable — no key in the 20-slot vocabulary",
      });
      continue;
    }

    // Locate the name/code columns.
    let codeIdx = -1;
    let fullNameIdx = -1;
    let nameIdx = -1;
    table.headers.forEach((h, idx) => {
      const c = cleanCell(h);
      if (codeIdx < 0 && CODE_HEADERS.test(c)) codeIdx = idx;
      else if (fullNameIdx < 0 && FULLNAME_HEADERS.test(c)) fullNameIdx = idx;
      else if (nameIdx < 0 && NAME_HEADERS.test(c)) nameIdx = idx;
    });
    const labelIdx = fullNameIdx >= 0 ? fullNameIdx : nameIdx >= 0 ? nameIdx : codeIdx;
    if (labelIdx < 0) {
      out.dropped.push({
        file: rel,
        section: sectionTitle,
        rows: table.rows.length,
        reason: "no name or code column",
      });
      continue;
    }

    const tagIdx = table.headers.findIndex((h) => /^tag$/i.test(cleanCell(h)));
    const specCols = table.headers
      .map((h, idx) => ({ idx, def: specColumnFor(h), estimated: headerIsEstimated(h) }))
      .filter((c) => c.def && c.idx !== labelIdx && c.idx !== codeIdx);

    for (const row of table.rows) {
      const label = cleanCell(row[labelIdx] ?? "");
      if (!label || isEmptyCell(label)) continue;

      // A row whose every spec cell asserts absence is a CROSS-REFERENCE, not
      // a part: gen1 carries `| Circle Upper | HMS — see HMS section | — | — |`.
      const anyValue = specCols.some((c) => !isEmptyCell(row[c.idx] ?? ""));
      const code = codeIdx >= 0 ? cleanCell(row[codeIdx] ?? "") : "";
      out.rows += 1;
      if (!anyValue) continue;

      const rowConfidence = tagIdx >= 0 ? confidenceFromTag(row[tagIdx] ?? "") : null;

      for (const col of specCols) {
        const rawValue = row[col.idx] ?? "";
        if (isEmptyCell(rawValue)) continue;
        const value = cleanCell(rawValue);

        // Header mark wins, then the cell's own `~`, then the row's tag.
        const confidence = col.estimated || cellIsEstimated(rawValue)
          ? "estimated"
          : (rowConfidence ?? "fact");

        out.specs.push({
          slot,
          name: label,
          code: code && !isEmptyCell(code) ? code : null,
          label: col.def.label,
          value,
          unit: col.def.unit,
          source: sourceKind,
          confidence,
          file: rel,
          section: sectionTitle,
        });
      }
    }
  }
  return out;
}

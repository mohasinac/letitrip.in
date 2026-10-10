#!/usr/bin/env node
/*
 * WHY: B5 needs ~216 named-model category leaves (Lost Longinus, Storm Pegasus,
 *      Dran Sword …) and hand-typing them from a 349 KB corpus is how a slug
 *      acquires a typo — and a slug is the one field you cannot quietly fix
 *      later, because it is the document id, the URL and the searchTxt source.
 *
 * WHAT: Reads docs/research/bey-corpus-2026-10/canonical-beys.json (B4's
 *       output) and emits appkit/src/seed/_helpers/category-models.ts — a
 *       Record<tier3LineId, CategoryTreeNode[]> the authored forest spreads in.
 *
 * 🛑 The prose is OURS, built from facts. The corpus derives from Fandom
 *    (CC-BY-SA), so names / codes / types / spin / systems are taken as FACTS
 *    and every sentence here is generated from a template we wrote. No corpus
 *    sentence is copied. See docs/research/bey-corpus-2026-10/README.md.
 *
 * Run: node scripts/gen-category-models.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "docs/research/bey-corpus-2026-10/canonical-beys.json");
const OUT = path.join(ROOT, "appkit/src/seed/_helpers/category-models.ts");

/* ── line assignment ────────────────────────────────────────────────────────
 * Era alone is not enough for gen1/plastic, gen2/mfb and gen4/bx: each of
 * those three directories spans several retail lines, and the line is the
 * tier-3 node a buyer browses. So the split reads `system` / `productLine`,
 * which the corpus carries per document — never a filename or an index.
 */
const has = (s, ...needles) => {
  const v = (s || "").toLowerCase();
  return needles.some((n) => v.includes(n.toLowerCase()));
};

function lineFor(c) {
  const sys = c.system || "";
  const pl = c.productLine || "";

  switch (c.era) {
    case "gen1/hms":
      return "category-original-hms";

    case "gen1/plastic":
      if (has(sys, "magnacore", "magna core")) return "category-original-magnacore";
      if (has(sys, "engine gear")) return "category-original-engine-gear";
      if (has(sys, "spin gear", "sgs")) return "category-original-spin-gear";
      return "category-original-plastic-gen";

    case "gen2/mfb":
      if (has(sys, "4d")) return "category-metal-fury-4d";
      if (has(sys, "metal system", "(ms)", "ms —")) return "category-metal-phws";
      // Hybrid Wheel System spans Fusion and Masters; the corpus says which.
      if (has(sys, "metal masters", "mm era", "mm-era", "(mm")) return "category-metal-masters";
      if (has(sys, "hybrid wheel", "hws")) return "category-metal-fusion";
      return "category-metal-fusion";

    case "gen2/zerog":
      return "category-metal-shogun-steel";

    case "gen3/burst":
      return "category-burst-classic";
    case "gen3/god":
      return "category-burst-god";
    case "gen3/choz":
      return "category-burst-cho-z";
    case "gen3/gt":
      return "category-burst-gt";
    case "gen3/superking":
      return "category-burst-superking";
    case "gen3/db":
      return "category-burst-db";
    case "gen3/bu":
      return "category-burst-bu";

    case "gen4/bx":
      // 🛑 Two rows sit in gen4/bx carrying a SUPERKING layer system. The
      // directory is wrong about them and the `system` field is right — a
      // Superking release is not a Beyblade X product and must not file under
      // the X branch, where every compatibility claim on the page would be
      // false.
      if (has(sys, "superking")) return "category-burst-superking";
      if (has(pl, "x-over") || has(sys, "x-over")) return "category-x-over";
      if (has(pl, "custom") || has(sys, "custom line")) return "category-x-custom-cx";
      if (has(pl, "unique") || has(sys, "unique line")) return "category-x-unique-ux";
      if (has(pl, "basic") || has(sys, "basic line")) return "category-x-basic";
      return "category-x-basic";

    default:
      return null;
  }
}

/* ── our own prose, from facts only ──────────────────────────────────────── */
const TYPE_LABEL = { attack: "Attack", defense: "Defense", stamina: "Stamina", balance: "Balance" };
const SPIN_LABEL = { right: "right-spin", left: "left-spin", dual: "dual-spin" };

const LINE_LABEL = {
  "category-original-plastic-gen": "Plastic Generation",
  "category-original-spin-gear": "Spin Gear System",
  "category-original-magnacore": "Magnacore System",
  "category-original-engine-gear": "Engine Gear System",
  "category-original-hms": "Heavy Metal System",
  "category-metal-phws": "Metal System",
  "category-metal-fusion": "Metal Fusion",
  "category-metal-masters": "Metal Masters",
  "category-metal-fury-4d": "Metal Fury (4D)",
  "category-metal-shogun-steel": "Shogun Steel / Zero-G",
  "category-burst-classic": "Burst Classic",
  "category-burst-god": "Burst God",
  "category-burst-cho-z": "Cho-Z",
  "category-burst-gt": "GT",
  "category-burst-superking": "Superking",
  "category-burst-db": "Dynamite Battle",
  "category-burst-bu": "Burst Ultimate",
  "category-x-basic": "Basic Line",
  "category-x-unique-ux": "Unique Line (UX)",
  "category-x-custom-cx": "Custom Line (CX)",
  "category-x-over": "X-Over Project",
};

/** Strip the corpus's own annotations — we keep the fact, not its commentary. */
function cleanName(raw) {
  return (raw || "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/[*⭐]/g, "")
    .trim();
}

/**
 * 🛑 A trailing parenthetical is an EXPANSION, not part of the name.
 *
 * 41 of the 216 canonical rows read like `Draciel MS (Draciel Metal Shield)`:
 * the retail name is "Draciel MS" and the bracket says what MS stands for.
 * Leaving it in produced the slug `draciel-ms-draciel-metal-shield`, and a
 * slug is the document id, the public URL and a searchTxt source — the one
 * field that cannot be quietly corrected later.
 *
 * So the bracket becomes an ALIAS, which is the field that exists for exactly
 * this: a buyer who learned "Draciel Metal Shield" still finds the page, and
 * the URL reads as the product's actual name. A `/`-separated bracket
 * ("Strata Dragoon MS / Metal Spike") yields two aliases, not one.
 */
function splitTrailingParenthetical(raw) {
  const name = (raw || "").replace(/[*⭐]/g, "").trim();
  const m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(name);
  if (!m) return { name, extraAliases: [] };
  const head = m[1].trim();
  // A bracket that is shorter than three characters, or that is purely
  // punctuation, is noise rather than a name — drop it instead of aliasing it.
  const inner = m[2]
    .split("/")
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && /[a-z0-9]/i.test(s));
  if (!head) return { name, extraAliases: [] };
  return { name: head, extraAliases: inner };
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function describe(c, lineId) {
  const bits = [];
  const t = TYPE_LABEL[c.type];
  const s = SPIN_LABEL[c.spin];
  const line = LINE_LABEL[lineId];

  // "an Attack-type", "a Balance-type" — the article follows the TYPE word,
  // which is why it is derived rather than hardcoded per branch.
  const article = t && /^[aeiou]/i.test(t) ? "an" : "a";
  if (t && s) bits.push(`${article} ${t}-type, ${s} ${line} release`);
  else if (t) bits.push(`${article} ${t}-type ${line} release`);
  else bits.push(`a ${line} release`);

  if (c.productCode) bits.push(`product code ${c.productCode}`);
  /*
   * 🛑 Only a RECOGNISED manufacturer is asserted as one. Before the parser
   * validated this field, 21 rows produced sentences like "released by April
   * 2nd, 2016 — 1404¥" and, for the plan's own example, "released by Lost
   * Lúinor L2 Nine Spiral" — the product's own name presented as its maker.
   */
  if (c.marque) bits.push(`released by ${c.marque}`);

  const head = `${c.name} — ${bits.join(", ")}.`;
  // A release note is real information ("Fukubako 2005 prize bey", "PSP game
  // exclusive") and worth surfacing — just not as a manufacturer.
  const note = c.releaseNote ? ` Release note: ${c.releaseNote}.` : "";
  const tail =
    "Complete tops, loose parts, sticker sheets and pre-owned examples of this model are listed here.";
  return `${head}${note} ${tail}`;
}

/**
 * Search aliases: the Hasbro name, the product code, and the expansion that
 * used to be welded into the slug.
 *
 * 🛑 Bounded deliberately. `buildSearchTxt` truncates at 600 tokens SILENTLY,
 * and `buildCategorySearchTxt` puts aliases LAST — so an unbounded list would
 * evict the leaf's own lineage tokens, which are the whole reason ancestors
 * are indexed. Four aliases is the cap; the Hasbro name and the product code
 * are the two a buyer actually types and they are added first.
 */
const MAX_ALIASES = 4;

function aliasesFor(c, displayName, extraAliases) {
  const out = new Set();
  const seen = new Set([displayName.toLowerCase()]);
  const add = (v) => {
    const s = (v ?? "").trim();
    if (!s || s.length < 2) return;
    if (seen.has(s.toLowerCase())) return;
    seen.add(s.toLowerCase());
    out.add(s);
  };

  // Order matters — this list is truncated at MAX_ALIASES, so the two a buyer
  // actually types go first.
  add(cleanName(c.hasbroName));
  if (c.productCode) add(c.productCode);
  /*
   * `altNames` is the TT<->Hasbro pair pulled out of the `Full Name` field,
   * and it is the whole reason this is worth doing: the corpus titles
   * `luinor-l2` by its HASBRO name with an empty `hasbroName` field, so
   * without this the leaf would be unreachable by "Lost Longinus" — the name
   * every buyer uses for it, and the plan's own canonical example.
   */
  for (const a of c.altNames || []) add(a);
  for (const a of extraAliases) add(a);
  for (const a of c.aliases || []) add(cleanName(a));

  return [...out].slice(0, MAX_ALIASES);
}

/**
 * A blader/character name -> its `feature-blader-…` id.
 *
 * 🛑 `blader-`, not `character-`, in the slug. The `character` FEATURE GROUP
 * is the general concept (it will carry a figure's character and a card's
 * franchise face too), but these 95 rows are specifically anime bladers, and
 * a reader seeing `feature-blader-tyson-granger` in a URL knows what it is.
 */
export function bladerFeatureId(name) {
  return `feature-blader-${slugify(name)}`;
}

/**
 * What a listing under this leaf inherits: its blader, its battle type and its
 * spin direction. All three come from the corpus at 100% / 100% / 100%
 * coverage for type and spin, and 85% for the blader.
 */
function defaultFeaturesFor(c) {
  const out = [];
  if (c.ownerName) out.push(bladerFeatureId(c.ownerName));
  if (c.type) out.push(`feature-type-${c.type}`);
  if (c.spin) out.push(`feature-${c.spin}-spin`);
  return out;
}

/* ── build ──────────────────────────────────────────────────────────────── */
const data = JSON.parse(fs.readFileSync(SRC, "utf8"));
const byLine = new Map();
const unassigned = [];
const seenId = new Map();
/** blader name -> how many canonical beys they own. */
const owners = new Map();

for (const c of data.canonical) {
  const lineId = lineFor(c);
  if (!lineId) {
    unassigned.push(c);
    continue;
  }
  const { name, extraAliases } = splitTrailingParenthetical(c.name);
  const slug = slugify(name);
  const id = `category-${slug}`;
  /*
   * 🛑 A collision is FATAL, not a last-write-wins. A document id derives from
   * the slug, so seeding two rows at one id writes the first and SILENTLY
   * overwrites it — no error, no count discrepancy, and `appkit-seed status`
   * blind to it because it counts ids and the id exists either way. That is
   * the same blind spot that hid four orphaned checklist cases in B2, and it
   * is why B4 sent all 31 of its colliding rows to review rather than picking
   * one by file order.
   *
   * Stripping the trailing parenthetical narrows the slug and therefore makes
   * a NEW collision possible, which is precisely why this throws.
   */
  if (seenId.has(id)) {
    throw new Error(
      `duplicate model id ${id} after stripping the parenthetical: ` +
        `${seenId.get(id)} vs ${c.file}. Both need to reach review, not one.`,
    );
  }
  seenId.set(id, c.file);

  const node = {
    id,
    name,
    description: describe({ ...c, name }, lineId),
    aliases: aliasesFor(c, name, extraAliases),
    /*
     * 🛑 The feature ids every listing under this leaf INHERITS.
     *
     * This is what makes the owner a clickable linkage rather than a line of
     * prose: a seller files a Dragoon G and `deriveTaxonomy` merges
     * `feature-blader-tyson-granger`, `feature-type-attack` and
     * `feature-right-spin` onto the product without the seller choosing any
     * of them. Those are then facet-filterable, chip-clickable
     * (`?features=feature-blader-tyson-granger`) and indexed into searchTxt.
     *
     * It also closes A3's second finding structurally. That step added the
     * four missing `features` composite indexes and the facet STILL showed
     * nothing, because 0 of 72 products carried a feature id against 10
     * seeded vocabulary rows — a vocabulary with nothing referencing it.
     * Assigning by hand in B6 would have fixed today's fixtures and left
     * every future seller-created listing bare.
     *
     * 🛑 These are MERGED, never replacing: `defaultFeatures` is documented as
     * "merged onto the product, never replacing what it already has", and a
     * leaf's defaults must also merge with its LINE's (tax code, specs, price
     * band) rather than shadowing them. C2's `resolveCategoryDefaults` walks
     * `parentIds` in reverse and must resolve PER FIELD for that reason.
     */
    defaultFeatures: defaultFeaturesFor(c),
    ...(c.ownerName ? { ownerName: c.ownerName } : {}),
  };
  if (c.ownerName) owners.set(c.ownerName, (owners.get(c.ownerName) ?? 0) + 1);
  if (!byLine.has(lineId)) byLine.set(lineId, []);
  byLine.get(lineId).push(node);
}

for (const list of byLine.values()) list.sort((a, b) => a.name.localeCompare(b.name));

if (unassigned.length) {
  console.error(`[gen-category-models] ${unassigned.length} canonical rows had no line:`);
  for (const c of unassigned.slice(0, 10)) console.error(`  ${c.era}  ${c.name}`);
  process.exitCode = 1;
}

/* ── emit ───────────────────────────────────────────────────────────────── */
const q = (s) => JSON.stringify(s);
const lines = [];
lines.push("/*");
lines.push(" * GENERATED by scripts/gen-category-models.mjs — do not edit by hand.");
lines.push(" *");
lines.push(" * WHY: the named-model tier-4 leaves (Lost Longinus, Storm Pegasus, Dran");
lines.push(" *      Sword …). A named model is a PLAIN category leaf with `categoryType`");
lines.push(" *      omitted, so `deriveTaxonomy` derives its full ancestor chain,");
lines.push(" *      `countersReconcile` tallies it and the sitemap includes it — none of");
lines.push(' *      which `categoryType:"sublisting"` does.');
lines.push(" *");
lines.push(" * WHAT: Record<tier-3 line id, CategoryTreeNode[]>, spread into");
lines.push(" *       CATEGORY_FOREST by `category-forest.ts`.");
lines.push(" *");
lines.push(" * 🛑 The prose is ours, generated from facts (name, type, spin, line,");
lines.push(" *    product code, marque) taken from a CC-BY-SA-derived corpus. No corpus");
lines.push(" *    sentence is reproduced. The `aliases` carry the Hasbro name and the");
lines.push(" *    product code because those are what buyers actually type.");
lines.push(" *");
lines.push(" * @tag domain:categories");
lines.push(" * @tag layer:seed");
lines.push(" * @tag pattern:generated");
lines.push(" * @tag access:server-only");
lines.push(" * @tag sideEffects:none");
lines.push(" */");
lines.push("");
lines.push('import type { CategoryTreeNode } from "./category-tree";');
lines.push("");
lines.push("/** Named-model leaves, keyed by the tier-3 line they belong to. */");
lines.push("export const MODEL_LEAVES: Record<string, CategoryTreeNode[]> = {");

for (const lineId of [...byLine.keys()].sort()) {
  lines.push(`  ${q(lineId)}: [`);
  for (const n of byLine.get(lineId)) {
    lines.push(`    {`);
    lines.push(`      id: ${q(n.id)},`);
    lines.push(`      name: ${q(n.name)},`);
    lines.push(`      description:`);
    lines.push(`        ${q(n.description)},`);
    const extra = [];
    if (n.aliases.length) extra.push(`aliases: [${n.aliases.map(q).join(", ")}]`);
    if (n.defaultFeatures.length) {
      extra.push(`productDefaults: { defaultFeatures: [${n.defaultFeatures.map(q).join(", ")}] }`);
    }
    if (extra.length) lines.push(`      extra: { ${extra.join(", ")} },`);
    lines.push(`    },`);
  }
  lines.push(`  ],`);
}
lines.push("};");
lines.push("");
lines.push("/** Total named-model leaves — asserted by the seed so a silent drop is loud. */");
lines.push(`export const MODEL_LEAF_COUNT = ${seenId.size};`);
lines.push("");

fs.writeFileSync(OUT, lines.join("\r\n"), "utf8");

/* ── the blader/character feature rows ──────────────────────────────────── */
const OUT_CHARS = path.join(ROOT, "appkit/src/seed/_helpers/character-features.ts");
/*
 * 🛑 Fold spellings that differ ONLY IN CASE before emitting.
 *
 * The corpus writes one character both `Jin of the Gale` and `Jin of The
 * Gale`, which slugify to the same id — caught by the duplicate-slug guard in
 * the features seed, which is where it should be caught rather than becoming
 * two facet rows for one person.
 *
 * Case-insensitive folding is safe in a way fuzzy matching is not: letter case
 * alone never distinguishes two people. (`OWNER_ALIASES` in the parser handles
 * the genuinely different spellings — Eddie/Eddy — explicitly, because those
 * DO need a human to say they are one person.)
 *
 * The surviving spelling is the most frequent one, alphabetical on a tie, so
 * the output does not depend on `readdir()` order.
 */
const foldedOwners = new Map();
for (const [name, n] of owners) {
  const key = name.toLowerCase();
  const prev = foldedOwners.get(key);
  if (!prev) {
    foldedOwners.set(key, { spellings: new Map([[name, n]]), total: n });
    continue;
  }
  prev.spellings.set(name, (prev.spellings.get(name) ?? 0) + n);
  prev.total += n;
}
const sortedOwners = [...foldedOwners.values()]
  .map((g) => {
    const best = [...g.spellings.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0][0];
    return [best, g.total];
  })
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

const cl = [];
cl.push("/*");
cl.push(" * GENERATED by scripts/gen-category-models.mjs — do not edit by hand.");
cl.push(" *");
cl.push(" * WHY: the clickable owner linkage. `Owner (Anime)` is 100% populated in the");
cl.push(" *      corpus but it is a SENTENCE — \"Tyson Granger (Tyson's 9th and final");
cl.push(" *      bey)\" — so it renders as prose and filters nothing. These are the");
cl.push(" *      normalised names as `character`-group features, which makes");
cl.push(" *      \"show me every Tyson Granger bey\" one click from any listing page.");
cl.push(" *");
cl.push(" * 🛑 A FEATURE and never a category node. A blader crosses every generation —");
cl.push(" *    Tyson owns nine beys spanning Spin Gear, Magnacore, Engine Gear and HMS —");
cl.push(" *    so a tree node would duplicate all nine under a second parent and break");
cl.push(" *    the one-chain-per-product invariant. As a feature it COMPOSES with the");
cl.push(" *    generation tree instead of competing with it: browse Beyblade Original,");
cl.push(" *    then narrow to Tyson's.");
cl.push(" *");
cl.push(" * @tag domain:products");
cl.push(" * @tag layer:seed");
cl.push(" * @tag pattern:generated");
cl.push(" * @tag access:server-only");
cl.push(" * @tag sideEffects:none");
cl.push(" */");
cl.push("");
cl.push("/** A blader, and how many canonical beys the corpus attributes to them. */");
cl.push("export interface CharacterSeed {");
cl.push("  /** Without the `feature-` prefix — the factory prepends it. */");
cl.push("  slug: string;");
cl.push("  name: string;");
cl.push("  /** Canonical beys owned. Drives display order; not stored on the row. */");
cl.push("  beyCount: number;");
cl.push("}");
cl.push("");
cl.push("export const CHARACTER_SEEDS: CharacterSeed[] = [");
for (const [name, n] of sortedOwners) {
  cl.push(`  { slug: ${q(`blader-${slugify(name)}`)}, name: ${q(name)}, beyCount: ${n} },`);
}
cl.push("];");
cl.push("");
cl.push("export const CHARACTER_SEED_COUNT = " + sortedOwners.length + ";");
cl.push("");
fs.writeFileSync(OUT_CHARS, cl.join("\r\n"), "utf8");

console.log(`[gen-category-models] ${seenId.size} model leaves across ${byLine.size} lines`);
console.log(
  `[gen-category-models] ${sortedOwners.length} blader/character features; ` +
    `${[...owners.values()].reduce((a, b) => a + b, 0)} of ${seenId.size} leaves name an owner`,
);
for (const lineId of [...byLine.keys()].sort()) {
  console.log(`  ${String(byLine.get(lineId).length).padStart(3)}  ${lineId}`);
}
console.log(`  -> ${path.relative(ROOT, OUT)}`);

/**
 * Parse a `{{Part Infobox}}` out of crawled MediaWiki wikitext.
 *
 * ── 🛑 THE TEMPLATE IS NOT LINE-ORIENTED ───────────────────────────────────
 *
 * The obvious parser is `/^\|(\w+)\s*=\s*(.*)$/mg`, and it is wrong. Measured
 * over the 2,248 crawled pages it produced **61 distinct `Classification`
 * values of which ~33 were artifacts** — `|Abbreviation=`,
 * `Bit Chip|System=Spin Gear System}}`, `|Element =` — because some infoboxes
 * are written on ONE line:
 *
 *   {{Part Infobox|Image=X.png|Classification=Bit Chip|System=Spin Gear System}}
 *
 * A line-anchored capture swallows every following field into the first one's
 * value. So this splits the template body on `|` at brace/bracket depth zero
 * instead, which handles both layouts and costs nothing.
 *
 * ── 🛑 DEPTH MATTERS, BECAUSE VALUES CONTAIN PIPES ─────────────────────────
 *
 * `|Image=[[File:DranzerV2-5.jpg|thumb]]` and
 * `|ProductCode={{Tooltip|BB-01|Takara Tomy}}` both carry a `|` INSIDE the
 * value. Splitting naively truncates the image filename and loses the code.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 */

/**
 * Every infobox template the crawl actually contains, measured:
 *
 *   2072  {{Part Infobox        43  {{Part_Infobox
 *     58  {{Bit Chip Infobox     1  {{Product_Infobox
 *     29  {{Beyblade Infobox
 *
 * 🛑 The underscore form and `{{Bit Chip Infobox}}` are why 176 pages first
 * read as "no infobox" — including every legacy Gen1 Bit Chip and a batch of
 * Attack Rings. A single hard-coded `Part Infobox` silently discards them, and
 * the symptom is a believable-looking lower count rather than an error.
 */
const TEMPLATE_NAMES = [
  "Part Infobox",
  "Bit Chip Infobox",
  "Beyblade Infobox",
  "Product Infobox",
];

/** Matches a template name with either a space or an underscore between words. */
function templatePattern(name) {
  return name.split(" ").map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[ _]");
}

/** Pull the balanced `{{… Infobox … }}` body, or null. Tries every known name. */
export function extractInfoboxBody(wikitext, templateName = null) {
  const names = templateName ? [templateName] : TEMPLATE_NAMES;
  let start = null;
  for (const n of names) {
    const re = new RegExp(`\\{\\{\\s*${templatePattern(n)}\\s*`, "i");
    const hit = re.exec(wikitext);
    if (hit && (start === null || hit.index < start.index)) start = hit;
  }
  if (!start) return null;

  let i = start.index + start[0].length;
  let depth = 2; // we are inside the opening `{{`
  const out = [];
  while (i < wikitext.length && depth > 0) {
    const two = wikitext.slice(i, i + 2);
    if (two === "{{") {
      depth += 2;
      out.push(two);
      i += 2;
      continue;
    }
    if (two === "}}") {
      depth -= 2;
      if (depth === 0) break;
      out.push(two);
      i += 2;
      continue;
    }
    out.push(wikitext[i]);
    i += 1;
  }
  return depth === 0 ? out.join("") : out.join("");
}

/**
 * Split an infobox body into `{ key: value }`, respecting nesting.
 *
 * Keys are lowercased for lookup but the original spelling is kept in
 * `__keys` so a caller can report an unexpected field rather than drop it.
 */
export function parseInfobox(wikitext, templateName = null) {
  const body = extractInfoboxBody(wikitext, templateName);
  if (body === null) return null;

  const parts = [];
  let buf = "";
  let curly = 0;
  let square = 0;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    const two = body.slice(i, i + 2);
    if (two === "{{") { curly += 1; buf += two; i += 1; continue; }
    if (two === "}}") { curly -= 1; buf += two; i += 1; continue; }
    if (two === "[[") { square += 1; buf += two; i += 1; continue; }
    if (two === "]]") { square -= 1; buf += two; i += 1; continue; }
    if (ch === "|" && curly === 0 && square === 0) { parts.push(buf); buf = ""; continue; }
    buf += ch;
  }
  parts.push(buf);

  const out = { __keys: [] };
  for (const seg of parts) {
    const eq = seg.indexOf("=");
    if (eq < 0) continue;
    const rawKey = seg.slice(0, eq).trim();
    if (!rawKey || /[\n\r]/.test(rawKey)) continue;
    const value = seg.slice(eq + 1).trim();
    const key = rawKey.toLowerCase();
    if (!(key in out)) {
      out[key] = value;
      out.__keys.push(rawKey);
    }
  }
  return out;
}

/** Strip wiki markup from a value: links, bold, templates, refs, breaks. */
export function cleanValue(raw) {
  if (!raw) return "";
  return String(raw)
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<ref[^>]*\/>/gi, "")
    .replace(/<br\s*\/?>/gi, " · ")
    .replace(/\{\{Translation\|([^|}]*)[^}]*\}\}/gi, "$1")
    .replace(/\{\{Tooltip\|([^|}]*)\|?[^}]*\}\}/gi, "$1")
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\[\[File:[^\]]*\]\]/gi, "")
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2")
    .replace(/\[\[([^\]]*)\]\]/g, "$1")
    .replace(/'''?/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The image filename, from either shape the template uses.
 *
 * Measured: bare (`Armor0.png`) and wrapped (`[[File:DranzerV2-5.jpg|thumb]]`).
 * Returns the bare filename with no `File:` prefix and no thumb options.
 */
export function imageFilename(raw) {
  if (!raw) return null;
  const wrapped = /\[\[\s*File\s*:\s*([^\]|]+)/i.exec(raw);
  if (wrapped) return wrapped[1].trim();
  const bare = cleanValue(raw);
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(bare) ? bare : null;
}

/** `13.9 grams` / `5.0 g` / `15 grams` -> 13.9. Single value only. */
export function weightGrams(raw) {
  const v = cleanValue(raw);
  if (!v) return null;
  const all = v.match(/(\d+(?:\.\d+)?)\s*(?:g\b|grams?\b)/gi) ?? [];
  if (all.length !== 1) return null;
  const n = Number.parseFloat(all[0]);
  return Number.isFinite(n) && n > 0 && n < 500 ? n : null;
}

/**
 * Multi-vendor product codes, split on the `<br>` the template uses.
 *
 * `BB-01 (Takara Tomy)<br>BB-28 (Hasbro)` -> ["BB-01 (Takara Tomy)", "BB-28 (Hasbro)"]
 *
 * 🛑 Never concatenated into one string. Two vendors' codes for one part are
 * two facts, and joining them produces a code no catalogue ever printed.
 */
export function productCodes(raw) {
  if (!raw) return [];
  return String(raw)
    .split(/<br\s*\/?>/i)
    .map((s) => cleanValue(s))
    .filter(Boolean);
}

/** `✔️` / `❌` / `Yes` / `No` -> boolean, else null. */
export function tri(raw) {
  const v = cleanValue(raw).toLowerCase();
  if (!v) return null;
  if (/✔|✓|^yes$|^legal$|^true$/.test(v)) return true;
  if (/❌|✗|^no$|^banned$|^illegal$|^false$/.test(v)) return false;
  return null;
}

/**
 * Documented mass bands per slot, from `case study/BEYBLADE MASTER REFERENCE.md`
 * § 1.10 "Part Terminology by Generation".
 *
 * 🛑 Used to REPORT an out-of-band weight, never to clamp or drop one silently.
 * A 30 g "attack ring" is a parse error — a `<br>`-split gone wrong or a
 * Fusion Wheel mis-classified — and the useful response is to surface it, not
 * to publish a confident wrong number (Root Cause #102's shape).
 *
 * Bands are widened ~25% from the documented figures on purpose: §1.10 reports
 * the COMPETITIVE range of commonly used parts, while the wiki covers every
 * release including outliers, so the documented band is a centre of mass
 * rather than a hard limit.
 *
 * 🛑 THE BAND CATCHES PARSE ERRORS, NOT TAXONOMY DISAGREEMENTS. Its first run
 * flagged 49 weights, and 47 were `blade` at 5–12 g against §1.10's BX figure
 * of 33–60 g. Those are not errors: the wiki uses `Blade` for BOTH the
 * Beyblade X Blade (33–60 g) and a much lighter Burst-era blade component, so
 * the band was asserting a single meaning the source never had. Slots whose
 * name spans systems therefore get the UNION of their plausible ranges — a
 * band that argues with the data is worse than no band, because the real
 * outliers get dismissed along with the false ones (Root Cause #92's lesson
 * about nine false positives out of eleven).
 */
export const SLOT_MASS_BAND = {
  // Unambiguous — one system, one meaning, so these stay tight.
  "attack-ring": [1.5, 22],
  "weight-disk": [5, 25],
  "blade-base": [1.5, 14],
  "spin-gear": [1, 9],
  "bit-chip": [0.2, 4],
  "running-core": [0.3, 6],
  "fusion-wheel": [12, 48],
  "spin-track": [0.3, 12],
  "face-bolt": [0.2, 4],
  "energy-ring": [0.8, 10],
  "chrome-wheel": [8, 52],
  "engine-gear": [0.8, 14],
  ratchet: [0.8, 14],
  "performance-tip": [0.2, 10],

  // Span systems — union bands. `blade` is the measured case; `layer`, `disc`,
  // `driver`, `bit` and `armour` carry the same hazard across Burst sub-systems.
  blade: [3, 75],
  layer: [3, 35],
  disc: [1, 40],
  driver: [0.5, 20],
  bit: [0.3, 10],
  armour: [1, 30],
};

/** `{ ok, reason }` — `ok:false` means report it, not drop it. */
export function weightInBand(slot, grams) {
  const band = SLOT_MASS_BAND[slot];
  if (!band || grams === null) return { ok: true };
  const [lo, hi] = band;
  if (grams < lo || grams > hi) {
    return { ok: false, reason: `${grams} g outside the documented ${lo}–${hi} g band for ${slot}` };
  }
  return { ok: true };
}

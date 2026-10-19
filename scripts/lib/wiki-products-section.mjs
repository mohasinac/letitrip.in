/**
 * Parse a wiki part page's `== Products ==` section.
 *
 * This single section answers two questions the parts gallery could not:
 * **which Beyblade does this part come in**, and **what colourways exist**.
 * Measured: present on 2,105 of 2,248 crawled part pages, with per-vendor
 * subsections (`Takara Tomy` 2,303, `Hasbro` 2,525, plus Youngtoys, Sonokong
 * and Takara).
 *
 * The shape, verbatim from `Ratchet_-_3-60`:
 *
 *   ==Products==
 *   ===Takara Tomy===
 *   * BX-01 [[DranSword 3-60F]]
 *   * BX-07 [[Start Dash Set]] - [[DranSword 3-60F]] (Special Ver.)
 *   * BX-14 [[Random Booster Vol. 1]] - 01: [[SharkEdge 3-60LF]]
 *   * BX-00 [[DranSword 3-60F]] (Bronze Ver.) (G1 Prize)
 *   * BX-00 [[DranSword 3-60F]] (Sushiro Ver.)
 *
 * So per bullet: a box CODE, a SET and/or a BEY as wiki links, a VENDOR from
 * the enclosing subsection, and a trailing parenthetical carrying the
 * COLOURWAY and its DISTRIBUTION.
 *
 * ── 🛑 WHY THIS BEATS THE CORPUS FOR VARIANTS ──────────────────────────────
 *
 * The plan's variant source was `linka/beys/**` — 28 tables and 65 bullet
 * lists across 145 of 335 bey docs, with **zero** gen3/gen4 coverage, plus
 * gallery alt-text on 393 pages. This is 2,105 pages, every generation, and
 * the variant is attached to the PART rather than inferred from the bey.
 *
 * ── 🛑 FACTS, NOT PROSE — CC-BY-SA ─────────────────────────────────────────
 *
 * Box codes, product names, vendor names and version names are facts. The
 * `== Description ==` and `== Overall ==` prose on the same pages is never
 * read. Attribution and a source link travel with every extracted row.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 */

/** Vendors the wiki files products under, as `=== … ===` subsections. */
const KNOWN_VENDORS = new Map([
  ["takara tomy", "Takara Tomy"],
  ["takara", "Takara"],
  ["tomy", "Tomy"],
  ["hasbro", "Hasbro"],
  ["sonokong", "Sonokong"],
  ["youngtoys", "Youngtoys"],
  ["young toys", "Youngtoys"],
  ["flame", "Flame"],
  ["other", "Other"],
]);

/**
 * A trailing `(…)` that names a COLOURWAY rather than a distribution channel.
 *
 * The wiki's own convention is `… Ver.` for a version/colourway, so that is
 * the primary signal. A bare colour word is accepted too, because a handful of
 * rows write `(Gold)` rather than `(Gold Ver.)`.
 */
const COLOUR_WORD =
  /\b(white|black|red|blue|green|yellow|orange|purple|pink|gold|golden|silver|bronze|grey|gray|clear|translucent|transparent|metallic|pearl|pearlescent|chrome|crystal|brown|teal|navy|turquoise|lime|magenta|maroon|copper|rainbow|glitter|neon)\b/i;

function looksLikeColourway(text) {
  return /\bver\.?\b/i.test(text) || /\bversion\b/i.test(text) || COLOUR_WORD.test(text);
}

/** Pull the `== Products ==` body, stopping at the next same-or-higher heading. */
function productsSection(wikitext) {
  const start = /^==\s*Products\s*==\s*$/mi.exec(wikitext);
  if (!start) return null;
  const after = wikitext.slice(start.index + start[0].length);
  const next = /^==[^=]/m.exec(after);
  return next ? after.slice(0, next.index) : after;
}

/**
 * All `[[Target|Label]]` / `[[Target]]` targets OUTSIDE parentheses, in order.
 *
 * 🛑 A link inside a trailing parenthetical is a QUALIFIER, not a product.
 * `* BB-43 [[Lightning L-Drago 100HF]] (''[[Beyblade Legends]]'')` names one
 * bey and the series it was re-released under — and taking the last link
 * regardless put "Beyblade Legends" in `shippedIn` as though it were a
 * Beyblade. It appeared in a generated SEO sentence as "It shipped with
 * Lightning L-Drago 100HF, L-Drago Battle Set, Beyblade Legends…", which is
 * the kind of plausible-looking wrong fact nobody would catch by eye.
 */
function wikiLinks(line) {
  const out = [];
  let depth = 0;
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "(") { depth += 1; i += 1; continue; }
    if (ch === ")") { depth = Math.max(0, depth - 1); i += 1; continue; }
    if (depth === 0 && line.startsWith("[[", i)) {
      const end = line.indexOf("]]", i + 2);
      if (end < 0) break;
      const inner = line.slice(i + 2, end);
      const target = (inner.split("|")[0] ?? "").trim();
      if (target) out.push(target);
      i = end + 2;
      continue;
    }
    i += 1;
  }
  return out;
}

/** Balanced trailing parentheticals, outermost only, left to right. */
function parentheticals(line) {
  const out = [];
  let depth = 0;
  let buf = "";
  for (const ch of line) {
    if (ch === "(") {
      depth += 1;
      if (depth === 1) { buf = ""; continue; }
    }
    if (ch === ")") {
      depth -= 1;
      if (depth === 0) { out.push(buf.trim()); buf = ""; continue; }
    }
    if (depth >= 1) buf += ch;
  }
  return out.filter(Boolean);
}

/**
 * Parse one `== Products ==` section into release rows.
 *
 * Returns `{ releases, beys, colourways }`:
 *   releases   one row per bullet — the raw facts
 *   beys       distinct bey/set names, in first-seen order
 *   colourways one row per distinct (colour, distribution) pair
 *
 * 🛑 A bullet with no recognisable bey link is DROPPED and counted, never
 * guessed at. The section occasionally carries a prose line or a stray note,
 * and inventing a product name from it would put a bey in the catalogue that
 * no catalogue ever listed.
 */
export function parseProductsSection(wikitext) {
  const body = productsSection(wikitext);
  if (!body) return { releases: [], beys: [], colourways: [], dropped: 0, hasSection: false };

  const releases = [];
  let dropped = 0;
  let vendor = null;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = /^===+\s*(.+?)\s*===+$/.exec(line);
    if (heading) {
      const key = heading[1].toLowerCase().replace(/\s+/g, " ").trim();
      vendor = KNOWN_VENDORS.get(key) ?? heading[1].trim();
      continue;
    }

    if (!/^\*/.test(line)) continue;
    const bullet = line.replace(/^\*+\s*/, "");

    const links = wikiLinks(bullet);
    if (links.length === 0) {
      dropped += 1;
      continue;
    }

    /*
     * The code prefixes the bullet: `BX-01 [[…]]`, `BB-43C [[…]]`,
     * `A-126 [[…]]`. `BX-00` is the wiki's marker for "no retail number" —
     * event prizes, collaborations — so it is kept verbatim rather than
     * normalised away; "which box" and "no box" are different facts.
     */
    const codeMatch = /^([A-Z]{1,4}-\d+[A-Za-z]?)\b/.exec(bullet);
    const code = codeMatch ? codeMatch[1] : null;

    /*
     * `[[Set]] - [[Bey]]` and `[[Set]] - 01: [[Bey]]` both put the SET first
     * and the BEY last. A single link is the bey itself.
     */
    const bey = links[links.length - 1];
    const set = links.length > 1 ? links[0] : null;

    const parens = parentheticals(bullet);
    const colour = parens.find(looksLikeColourway) ?? null;
    const distribution = parens.filter((p) => p !== colour);

    releases.push({
      vendor: vendor ?? "Unknown",
      ...(code ? { code } : {}),
      bey,
      ...(set ? { set } : {}),
      ...(colour ? { colourway: colour } : {}),
      ...(distribution.length ? { distribution } : {}),
    });
  }

  // Distinct beys, first-seen order. The set is a product too, so it counts.
  const beys = [];
  const seenBey = new Set();
  for (const r of releases) {
    for (const n of [r.bey, r.set]) {
      if (n && !seenBey.has(n)) { seenBey.add(n); beys.push(n); }
    }
  }

  /*
   * Colourways, deduped on (colour, distribution). The same colour can be
   * released twice through different channels and those are two facts; the
   * same colour listed twice for one channel is one.
   */
  const colourways = [];
  const seenCw = new Set();
  for (const r of releases) {
    if (!r.colourway) continue;
    const dist = (r.distribution ?? []).join(" · ");
    const key = `${r.colourway.toLowerCase()} ${dist.toLowerCase()}`;
    if (seenCw.has(key)) continue;
    seenCw.add(key);
    colourways.push({
      colourway: r.colourway,
      vendor: r.vendor,
      ...(r.code ? { code: r.code } : {}),
      ...(dist ? { distribution: dist } : {}),
      inBey: r.bey,
    });
  }

  return { releases, beys, colourways, dropped, hasSection: true };
}

/**
 * `== Mold Variations ==` — a DIFFERENT axis from colour, and worth keeping
 * separate. A mould revision changes the physical part (weight, burst
 * resistance); a colourway does not. Measured on 12 pages.
 */
export function hasMoldVariations(wikitext) {
  return /^==\s*Mold Variations?\s*==\s*$/mi.test(wikitext);
}

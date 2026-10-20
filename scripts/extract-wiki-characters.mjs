#!/usr/bin/env node
/**
 * Turn the crawled `{{Character Infobox}}` / `{{Bit Beast Infobox}}` wikitext
 * into committed JSON.
 *
 *   node scripts/extract-wiki-characters.mjs [--corpus <path>] [--quiet]
 *
 * Reads `linka/api-characters-2026-10/*.wikitext` and writes
 * `docs/research/characters-2026-10/wiki-characters.json` plus a report.
 * No network.
 *
 * ── 🛑 TWO TEMPLATES, TWO ENTITIES ────────────────────────────────────────
 *
 * Measured over 712 pages: **655 Character Infobox** and **57 Bit Beast
 * Infobox**. A Bit Beast is the spirit bound to a bey (Dragoon, Dranzer), not
 * a person — it has no age, gender or voice actor, and merging the two would
 * put 57 rows with nine empty fields into a people list. They go to separate
 * keys in one file.
 *
 * ── WHY THIS IS WORTH EXTRACTING ──────────────────────────────────────────
 *
 * `owner` is stated on 733 beys and 27 parts, giving 539 distinct names that
 * currently resolve to nothing. The character pages turn each into a real
 * entity with a Japanese name, a first anime appearance and a team — which is
 * both taxonomy (a `/characters/{slug}` facet) and game content (whose deck a
 * bey belongs to).
 *
 * `Beyblade=` is the join from the CHARACTER side, and it is richer than
 * `owner` is from the bey side: it is a `<br>`-separated list of wikilinks, so
 * one character names every bey they have used across every series.
 *
 * ── 🛑 FACTS ONLY — CC-BY-SA ──────────────────────────────────────────────
 *
 * Names, Japanese names, aliases, gender, birthday, age, hair/eye colour,
 * occupation, team, voice actors, first appearances and the bey list. The
 * `==Appearance==`, `==Personality==` and `==History==` prose is never read;
 * the rendering side links back to `sourceUrl`.
 *
 * @tag domain:characters
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:writes-docs-research
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { parseInfobox, cleanValue, imageFilename, splitList } from "./lib/wiki-infobox.mjs";

const DEFAULT_CORPUS = "C:/Users/mohsi/Downloads/Beyblade-Game-master";
const OUT_DIR = "docs/research/characters-2026-10";
const WIKI = "https://beyblade.fandom.com/wiki/";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const CORPUS = arg("--corpus", process.env.BEY_CORPUS ?? DEFAULT_CORPUS).replace(/\\/g, "/");
const CRAWL = path.join(CORPUS, "linka/api-characters-2026-10");
const QUIET = process.argv.includes("--quiet");
const log = (...a) => {
  if (!QUIET) console.log(...a);
};

const slugify = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * `[[Target|Display]]` / `[[Target]]` -> the TARGET, which is the page a bey
 * actually lives at.
 *
 * 🛑 The display text is NOT interchangeable with the target.
 * `[[Dragoon Fantom Gravity Variable|Dragoon Fighter Gravity Variable]]`
 * appears on Tyson's page: the display is a manga-only renaming and the target
 * is the real article. Joining on the display text would miss the bey and
 * silently drop the edge.
 */
function linkTargets(raw) {
  const value = cleanValue(raw);
  if (!value) return [];
  const out = [];
  for (const chunk of String(raw).split(/<br\s*\/?>/i)) {
    for (const m of chunk.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
      const target = m[1].trim();
      if (!target || /^(File|Image|Category|wikipedia):/i.test(target)) continue;
      out.push(target);
    }
  }
  return [...new Set(out)];
}

/**
 * A `<br>`-separated infobox value -> array of plain strings.
 *
 * 🛑 `<br>` is the separator here, NOT a comma. `Occupation=World-Class
 * Blader<br>#1 Beyblader in the World<br>Leader of the Bladebreakers` is three
 * entries, and splitting on commas instead yields one long string while
 * splitting a value like `Hair=Dark blue` on `<br>` correctly yields one.
 */
function brList(raw) {
  const value = cleanValue(raw);
  if (!value) return [];
  return String(raw)
    .split(/<br\s*\/?>/i)
    .map((s) => cleanValue(s))
    .filter((s) => s && s.length > 0);
}

/** Every `ImageN=` plus the plain `Image=`, with their labels when present. */
function labelledImages(box) {
  const out = [];
  const plain = imageFilename(box.image);
  if (plain) out.push({ file: plain, label: cleanValue(box.imagecaption) ?? null });
  for (let i = 1; i <= 8; i += 1) {
    const file = imageFilename(box[`image${i}`]);
    if (!file) continue;
    out.push({ file, label: cleanValue(box[`image${i}label`]) ?? null });
  }
  return out;
}

function main() {
  if (!fs.existsSync(CRAWL)) {
    console.error(
      `[extract-wiki-characters] no crawl at ${CRAWL}\n` +
        `  run: node scripts/crawl-wiki-parts.mjs --category Category:Characters --out api-characters-2026-10`,
    );
    process.exit(2);
  }

  const files = fs.readdirSync(CRAWL).filter((f) => f.endsWith(".wikitext"));
  const characters = {};
  const counts = {
    jpName: 0, romaji: 0, aka: 0, gender: 0, birthday: 0, age: 0,
    hair: 0, eyes: 0, occupation: 0, team: 0, voiceJp: 0, voiceEn: 0,
    appearAnime: 0, appearManga: 0, beyblades: 0, images: 0, ranking: 0,
    bitBeast: 0,
  };
  const unmapped = new Map();
  /* Keys that are real fields; anything else is reported, never dropped. */
  const KNOWN = new Set([
    "__keys", "name", "jpname", "romajiname", "kanjiname", "aka", "gender",
    "birthday", "age", "hair", "eyes", "occupation", "team", "jpvoice",
    "envoice", "appearanime", "appearmanga", "beyblade", "equipment",
    "image", "imagecaption", "ranking", "enemies", "civilian",
    // alternate spellings, mapped above
    "beyblades", "firstapp", "firstappanime", "firstappmanga", "kanji", "romaji",
  ]);
  for (let i = 1; i <= 8; i += 1) {
    KNOWN.add(`image${i}`);
    KNOWN.add(`image${i}label`);
  }

  let pages = 0;
  let noBox = 0;
  for (const f of files) {
    pages += 1;
    /* One file at a time; nothing accumulates but the output row. */
    const text = fs.readFileSync(path.join(CRAWL, f), "utf8");
    const title = f.replace(/\.wikitext$/, "").replace(/_/g, " ");

    const box = parseInfobox(text, "Character Infobox");
    if (!box) {
      noBox += 1;
      continue;
    }

    /*
     * ── 🛑 A BIT BEAST IS NESTED, NOT A SIBLING ENTITY ─────────────────────
     *
     * The first draft routed `{{Bit Beast Infobox}}` pages into their own
     * `bitBeasts` map and produced ZERO rows while 57 pages carried that
     * template — which read as an extraction bug and was not one. Measured:
     * all 57 of those pages ALSO carry a Character Infobox, i.e. there are no
     * standalone beast pages in this crawl; a character page embeds its
     * beast's box. The separate map was dead code that looked like a gap.
     *
     * So the beast hangs off the character, which is also what it is. Its own
     * `Owner=` is therefore redundant and dropped; `Types=` (Attack / Defense
     * / Stamina) and `Beyblades=` are the parts worth keeping.
     */
    const beastBox = parseInfobox(text, "Bit Beast Infobox");
    const bitBeast = beastBox
      ? {
          ...(cleanValue(beastBox.name) ? { name: cleanValue(beastBox.name) } : {}),
          ...(cleanValue(beastBox.engtrnsname) ? { nameEn: cleanValue(beastBox.engtrnsname) } : {}),
          ...(cleanValue(beastBox.japname) ? { jpName: cleanValue(beastBox.japname) } : {}),
          ...(cleanValue(beastBox.types) ? { type: cleanValue(beastBox.types) } : {}),
          ...(imageFilename(beastBox.image) ? { image: imageFilename(beastBox.image) } : {}),
          ...(linkTargets(beastBox.beyblades).length
            ? { beyblades: linkTargets(beastBox.beyblades) }
            : {}),
          ...(linkTargets(beastBox.firstappanime).length
            ? { appearAnime: linkTargets(beastBox.firstappanime)[0] }
            : {}),
        }
      : null;

    for (const k of Object.keys(box)) {
      if (k === "__keys" || KNOWN.has(k)) continue;
      unmapped.set(k, (unmapped.get(k) ?? 0) + 1);
    }

    const slug = slugify(title);
    const images = labelledImages(box);
    /*
     * 🛑 ALTERNATE SPELLINGS ARE REAL DATA, not noise to report.
     *
     * The first run listed `beyblades`, `firstapp`, `kanji` and `romaji` as
     * UNMAPPED — and every one of them is another spelling of a field this
     * extractor already handles. `Beyblades = [[Strata Dragoon MS]]<br>…`
     * carries the identical wikilink list as `Beyblade=`, so leaving it
     * unmapped silently dropped a character's whole bey list on those pages.
     *
     * The unmapped REPORT is what surfaced this, which is the argument for
     * reporting unknown keys rather than skipping them (Root Cause #90).
     */
    const beyblades = linkTargets(box.beyblade ?? box.beyblades);
    const occupation = brList(box.occupation);
    const aka = brList(box.aka);

    const row = {
      slug,
      name: cleanValue(box.name) && cleanValue(box.name) !== title ? cleanValue(box.name) : title,
      title,
      ...(cleanValue(box.jpname) ? { jpName: cleanValue(box.jpname) } : {}),
      ...(cleanValue(box.romajiname ?? box.romaji) ? { romaji: cleanValue(box.romajiname ?? box.romaji) } : {}),
      ...(cleanValue(box.kanjiname ?? box.kanji) ? { kanjiName: cleanValue(box.kanjiname ?? box.kanji) } : {}),
      ...(aka.length ? { aka } : {}),
      ...(cleanValue(box.gender) ? { gender: cleanValue(box.gender) } : {}),
      ...(cleanValue(box.birthday) ? { birthday: cleanValue(box.birthday) } : {}),
      ...(cleanValue(box.age) ? { age: cleanValue(box.age) } : {}),
      ...(cleanValue(box.hair) ? { hair: cleanValue(box.hair) } : {}),
      ...(cleanValue(box.eyes) ? { eyes: cleanValue(box.eyes) } : {}),
      ...(occupation.length ? { occupation } : {}),
      ...(cleanValue(box.team) ? { team: cleanValue(box.team) } : {}),
      ...(cleanValue(box.ranking) ? { ranking: cleanValue(box.ranking) } : {}),
      ...(cleanValue(box.jpvoice) ? { voiceJp: cleanValue(box.jpvoice) } : {}),
      ...(cleanValue(box.envoice) ? { voiceEn: cleanValue(box.envoice) } : {}),
      /*
       * FIRST APPEARANCE, which is the one field here that is also game and
       * SEO content: `AppearAnime=[[Beyblade - Episode 01|The Blade Raider]]`
       * names the episode AND its title. Both halves are kept — the target is
       * the join key, the display is what a reader wants to see.
       */
      ...(linkTargets((box.appearanime ?? box.firstapp ?? box.firstappanime)).length
        ? {
            appearAnime: linkTargets((box.appearanime ?? box.firstapp ?? box.firstappanime))[0],
            appearAnimeTitle: (String((box.appearanime ?? box.firstapp ?? box.firstappanime)).match(/\[\[[^\]|]+\|([^\]]+)\]\]/) ?? [])[1]?.trim(),
          }
        : cleanValue((box.appearanime ?? box.firstapp ?? box.firstappanime))
          ? { appearAnime: cleanValue((box.appearanime ?? box.firstapp ?? box.firstappanime)) }
          : {}),
      ...(linkTargets((box.appearmanga ?? box.firstappmanga)).length
        ? { appearManga: linkTargets((box.appearmanga ?? box.firstappmanga))[0] }
        : cleanValue((box.appearmanga ?? box.firstappmanga))
          ? { appearManga: cleanValue((box.appearmanga ?? box.firstappmanga)) }
          : {}),
      ...(beyblades.length ? { beyblades } : {}),
      ...(brList(box.equipment).length ? { equipment: brList(box.equipment) } : {}),
      ...(images.length ? { images } : {}),
      sourceUrl: WIKI + encodeURIComponent(title.replace(/ /g, "_")),
      source: "fandom-infobox",
    };

    if (bitBeast && Object.keys(bitBeast).length) row.bitBeast = bitBeast;
    characters[slug] = row;
    if (row.bitBeast) counts.bitBeast += 1;

    for (const [k, field] of [
      ["jpName", "jpName"], ["romaji", "romaji"], ["aka", "aka"], ["gender", "gender"],
      ["birthday", "birthday"], ["age", "age"], ["hair", "hair"], ["eyes", "eyes"],
      ["occupation", "occupation"], ["team", "team"], ["voiceJp", "voiceJp"],
      ["voiceEn", "voiceEn"], ["appearAnime", "appearAnime"], ["appearManga", "appearManga"],
      ["beyblades", "beyblades"], ["images", "images"], ["ranking", "ranking"],
    ]) {
      if (row[field] !== undefined) counts[k] += 1;
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "wiki-characters.json"),
    `${JSON.stringify({ characters }, null, 2)}\n`,
    "utf8",
  );

  const report = {
    generatedAt: new Date().toISOString(),
    pages,
    characters: Object.keys(characters).length,
    charactersWithABitBeast: Object.keys(characters).filter((k) => characters[k].bitBeast).length,
    pagesWithNoInfobox: noBox,
    fieldCoverage: counts,
    /*
     * 🛑 REPORTED, never silently skipped. An unknown key is either a new
     * field or a template variant, and both need a human. Measured on the
     * first run: `2000`, `g-revolution`, `shogun steel`, `beywheelz` — section
     * headings from a different infobox variant, which is why they are
     * reported rather than mapped.
     */
    unmappedInfoboxKeys: Object.fromEntries([...unmapped.entries()].sort((a, b) => b[1] - a[1])),
  };
  fs.writeFileSync(
    path.join(OUT_DIR, "character-extraction-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  log(`[extract-wiki-characters] ${pages} pages`);
  log(`  characters: ${Object.keys(characters).length}`);
  log(`  with a nested bit beast: ${Object.keys(characters).filter((k) => characters[k].bitBeast).length}`);
  log(`  no infobox: ${noBox}`);
  log("");
  for (const [k, v] of Object.entries(counts)) log(`  ${k.padEnd(14)} ${String(v).padStart(5)}`);
  if (unmapped.size) log(`\n  unmapped keys: ${[...unmapped.keys()].slice(0, 12).join(", ")}`);
  log(`\n-> ${OUT_DIR}/wiki-characters.json`);
}

main();

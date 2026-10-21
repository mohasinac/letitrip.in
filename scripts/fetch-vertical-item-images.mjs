#!/usr/bin/env node
/**
 * Fetch REAL ITEM photography per editorial slot from the Fandom wiki that
 * covers that collectible vertical.
 *
 * ── Why this replaces the Commons picks ───────────────────────────────────
 *
 * Commons is an encyclopedia image library, not a product catalogue. Asked
 * for collectibles it returns *situational* photographs — people at a table,
 * a vending machine, a shop front — and for the abstract marketplace topics
 * it returns pure stock: silica gel, a magnifying glass, an 1851 engraving, a
 * Navy mail call. Every one of those resolved with a tidy ✓ and none of them
 * is a picture of a thing you can buy here.
 *
 * Fandom wikis are the opposite: every article about a casting, a kit, a card
 * set or a top carries the PRODUCT SHOT as its lead image. That is what an
 * item-led editorial page needs.
 *
 * ── Why not Imgur ─────────────────────────────────────────────────────────
 *
 * Tried, measured: `api.imgur.com/3/gallery/search` returns **401
 * Authentication required** without a registered Client-ID, and the web
 * search page is a JS-rendered SPA. More decisively, Imgur is user-uploaded
 * with no licence metadata and its ToS grants no commercial sublicense — the
 * same liability as scraping Google Images, on a site that sells things.
 *
 * ── 🛑 Licensing, stated honestly ─────────────────────────────────────────
 *
 * Fandom's TEXT is CC-BY-SA. These IMAGES are overwhelmingly publisher
 * product shots (Takara-Tomy, Mattel, Bandai, The Pokémon Company) uploaded
 * by editors with no explicit grant — the same position
 * `fetch-taxonomy-images.mjs` already records for the 195 taxonomy covers
 * this project has shipped since 2026-10-14. Provenance per image goes to
 * `docs/research/editorial-images/image-provenance.json`, which makes
 * attribution possible and a takedown mechanical.
 *
 * Usage:
 *   node scripts/fetch-vertical-item-images.mjs --dry-run
 *   node scripts/fetch-vertical-item-images.mjs
 *   node scripts/fetch-vertical-item-images.mjs --only blog-cover-auction-launch
 *
 * Exit: 0 = every slot resolved, 1 = one or more unresolved.
 *
 * @tag domain:blog
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:network,fs
 */

import fs from "node:fs";
import path from "node:path";
import { resolveLeadImages, downloadAsWebp, wikiPageUrl } from "./lib/wiki-images.mjs";
import { ASPECTS } from "./lib/editorial-image-manifest.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, ".media-cache/editorial");
const PROV_DIR = path.join(ROOT, "docs/research/editorial-images");
const PROVENANCE = path.join(PROV_DIR, "image-provenance.json");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ONLY = (() => {
  const i = args.indexOf("--only");
  return i === -1 ? null : args[i + 1];
})();

const HOTWHEELS = "hotwheels.fandom.com";
const GUNDAM = "gundam.fandom.com";
const ONEPIECE = "onepiece.fandom.com";
const POKEMON = "pokemon.fandom.com";
const BEYBLADE = "beyblade.fandom.com";

/**
 * One entry per slot: which wiki, and candidate article titles tried in order.
 *
 * 🛑 Every title names a THING, never a concept. The abstract marketplace
 * articles (escrow, verification, auctions, selling, climate, market
 * overview) have no literal subject, so each is illustrated with a genuine
 * collectible drawn from a DIFFERENT vertical — which is both a real item
 * photo and an accurate picture of what this marketplace sells. That is the
 * whole correction: "a padlock" is a concept, "a 1968 Beach Bomb" is an item.
 */
const SLOTS = [
  // ── Verticals with a literal subject ────────────────────────────────────
  { key: "blog-cover-hot-wheels-collecting", host: HOTWHEELS, aspect: "cover", titles: ["Bone Shaker", "Twin Mill", "Deora II"] },
  { key: "blog-cover-tomica-vs-hot-wheels", host: HOTWHEELS, aspect: "cover", titles: ["Nissan Skyline GT-R (BNR34)", "Datsun 240Z", "Custom Datsun 240Z"] },
  { key: "blog-cover-gundam-grades", host: GUNDAM, aspect: "cover", titles: ["Perfect Grade", "Master Grade", "Real Grade"] },
  { key: "blog-cover-mumbai-gundam", host: GUNDAM, aspect: "cover", titles: ["RX-78-2 Gundam", "MSZ-006 Zeta Gundam", "RX-0 Unicorn Gundam"] },
  { key: "blog-cover-pokemon-prismatic", host: POKEMON, aspect: "cover", titles: ["Pokémon Trading Card Game", "Base Set", "Charizard (Base Set 4)"] },
  { key: "blog-cover-one-piece-tcg", host: ONEPIECE, aspect: "cover", titles: ["One Piece Card Game", "Monkey D. Luffy", "Going Merry"] },

  // ── Abstract marketplace topics, illustrated with real collectibles ─────
  /*
   * The rarest Hot Wheels casting there is — the 1969 pink Rear-Loading
   * Beach Bomb, of which a handful exist and one sold for six figures. If an
   * article about launching live auctions needs a picture, it should be of
   * the kind of thing people bid on.
   */
  { key: "blog-cover-auction-launch", host: HOTWHEELS, aspect: "cover", titles: ["Beach Bomb", "Volkswagen Beach Bomb", "Custom Volkswagen"] },
  { key: "blog-cover-escrow-launch", host: GUNDAM, aspect: "cover", titles: ["RX-0 Unicorn Gundam", "MSN-04 Sazabi", "RX-93 ν Gundam"] },
  { key: "blog-cover-seller-verification", host: BEYBLADE, aspect: "cover", titles: ["Dranzer S", "Dragoon Storm", "Driger S"] },
  { key: "blog-cover-selling-tips", host: HOTWHEELS, aspect: "cover", titles: ["Rodger Dodger", "Custom Camaro", "'67 Camaro"] },
  { key: "blog-cover-protect-collectibles", host: BEYBLADE, aspect: "cover", titles: ["Draciel S", "Dranzer F", "Driger F"] },
  { key: "blog-cover-india-market", host: POKEMON, aspect: "cover", titles: ["Pikachu", "Eevee", "Bulbasaur"] },

  /*
   * ── Beyblade-topic slots, fetched rather than recycled ──────────────────
   *
   * These twelve previously pointed at images already in our bucket, which
   * worked but had two faults: `product-bx-53-box-image`,
   * `category-beyblade-original-image` and `category-beyblade-metal-image`
   * each served TWO different articles, and reusing catalogue photography
   * makes the blog look like the shop. A distinct item per slot fixes both.
   */
  { key: "blog-cover-genuine-beyblade", host: BEYBLADE, aspect: "cover", titles: ["Dragoon Storm", "Dragoon S", "Dranzer S"] },
  { key: "blog-cover-sealed-vs-opened-beyblade", host: BEYBLADE, aspect: "cover", titles: ["Dragoon V2", "Dranzer V2", "Driger V2"] },
  { key: "blog-cover-beyblade-x-guide", host: BEYBLADE, aspect: "cover", titles: ["CobaltDrake 4-60F", "CobaltDragoon 2-60C", "AeroPegasus 3-70A"] },
  // Burst articles are titled with the FULL release name including the disc
  // and driver — "Victory Valkyrie Boost Variable", never "Victory Valkyrie".
  { key: "blog-cover-beyblade-x-vs-burst", host: BEYBLADE, aspect: "cover", titles: ["Victory Valkyrie Boost Variable", "God Valkyrie 6Vortex Reboot", "Slash Valkyrie Blitz Power Retsu"] },
  { key: "blog-cover-top10-vintage-beyblade", host: BEYBLADE, aspect: "cover", titles: ["Dragoon F", "Dranzer F", "Driger F"] },
  { key: "blog-cover-metal-fight-gems", host: BEYBLADE, aspect: "cover", titles: ["Storm Pegasus 105RF", "Lightning L-Drago 100HF", "Flame Sagittario C145S"] },
  { key: "blog-cover-authenticating-beyblades", host: BEYBLADE, aspect: "cover", titles: ["Xtreme Stadium", "Beystadium", "Dranzer GT"] },
  { key: "blog-content-genuine-beyblade-logo", host: BEYBLADE, aspect: "content", titles: ["Driger S", "Dranzer S", "Draciel S"] },
  { key: "blog-content-sealed-beyblade-box", host: BEYBLADE, aspect: "content", titles: ["Dragoon Galaxy", "Dragoon MS", "Dranzer MS"] },
  { key: "blog-content-beyblade-x-waves", host: BEYBLADE, aspect: "content", titles: ["AeroPegasus 3-70A", "ValkyrieVolt S4-70V", "PhoenixWing 9-60GF"] },
  { key: "blog-content-top10-starter-set", host: BEYBLADE, aspect: "content", titles: ["Dranzer V", "Dragoon V", "Driger V"] },
  { key: "blog-content-metal-fight-gems", host: BEYBLADE, aspect: "content", titles: ["Lightning L-Drago 100HF", "Earth Eagle 145WD", "Rock Leone 145WB"] },

  // ── Inline content images ───────────────────────────────────────────────
  { key: "blog-content-genuine-beyblade-weight", host: BEYBLADE, aspect: "content", titles: ["Driger G", "Dranzer V2", "Dragoon V"] },
  { key: "blog-content-top10-tournament-gold", host: BEYBLADE, aspect: "content", titles: ["Gold Dragoon", "Dragoon GT", "Dragoon V2"] },

  // ── Sticker product shots ───────────────────────────────────────────────
  /*
   * A sticker sheet depicting Beyblade X blades; the honest product shot for
   * a demo catalogue is the blade the sheet features. Two DIFFERENT blades so
   * the two listings do not share one photo.
   */
  { key: "sticker-image-beyblade-x-event-sheet", host: BEYBLADE, aspect: "square", titles: ["Dran Sword", "DranSword 3-60F", "Dran Buster"] },
  /*
   * 🛑 Beyblade X blade articles are titled in the COMPACT form with the
   * ratchet/bit code — `HellsScythe 4-60T`, not `Hells Scythe`. Measured: the
   * spaced form and the bare name both resolve to nothing, which reads as
   * "the wiki has no image" rather than "the title is wrong". Same class as
   * the `<Classification> - <Name>` discovery in `fetch-part-images.mjs`.
   */
  { key: "sticker-image-beyblade-x-event-holo", host: BEYBLADE, aspect: "square", titles: ["HellsScythe 4-60T", "WizardArrow 4-80B", "KnightShield 3-80N"] },
];

const slots = SLOTS.filter((s) => !ONLY || s.key === ONLY);
if (slots.length === 0) {
  console.error(`✗ no slot matches --only ${ONLY}`);
  process.exit(2);
}

if (!DRY_RUN) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PROV_DIR, { recursive: true });
}

/* Group by host — `resolveLeadImages` batches 50 titles per request, and the
 * host is per-request, so one pass per wiki rather than one per slot. */
const byHost = new Map();
for (const s of slots) {
  if (!byHost.has(s.host)) byHost.set(s.host, []);
  byHost.get(s.host).push(s);
}

const resolvedAll = new Map();
for (const [host, group] of byHost) {
  console.log(`\n── ${host} (${group.length} slots) ──`);
  const hits = await resolveLeadImages(
    group.map((s) => ({ key: s.key, titles: s.titles })),
    { thumbSize: 1400, host },
  );
  for (const [k, v] of hits) resolvedAll.set(k, { ...v, host });
}

const provenance = fs.existsSync(PROVENANCE)
  ? JSON.parse(fs.readFileSync(PROVENANCE, "utf8"))
  : { generatedBy: "scripts/fetch-editorial-images.mjs", images: {} };

const unresolved = [];
let fetched = 0;

console.log("");
for (const slot of slots) {
  const hit = resolvedAll.get(slot.key);
  if (!hit) {
    unresolved.push(slot.key);
    console.warn(`✗ ${slot.key} — none of: ${slot.titles.join(" | ")}`);
    continue;
  }
  console.log(`✓ ${slot.key}\n    ${hit.host} · ${hit.title}`);
  if (DRY_RUN) {
    fetched += 1;
    continue;
  }

  const { width } = ASPECTS[slot.aspect];
  const dest = path.join(OUT_DIR, `${slot.key}.webp`);
  try {
    /*
     * 🛑 `downloadAsWebp` resizes by WIDTH only and flattens onto white — it
     * does not crop to the slot's aspect. That is deliberate here: these are
     * product shots on transparent PNGs, and a `fit: cover` crop to 1200x630
     * would slice the top and bottom off the item. A letterboxed product on
     * white is the correct presentation; `MediaImage` now defaults to
     * `objectFit="contain"` for exactly this reason.
     */
    const bytes = await downloadAsWebp(hit.src, dest, { width, quality: 82, host: hit.host });
    console.log(`    → ${bytes} bytes`);
  } catch (err) {
    unresolved.push(slot.key);
    console.warn(`✗ ${slot.key} — download failed: ${err.message}`);
    continue;
  }

  provenance.images[slot.key] = {
    sourcePage: wikiPageUrl(hit.title, hit.host),
    fileUrl: hit.src,
    title: hit.title,
    licence: `Fandom ${hit.host} (CC BY-SA text; image rights unverified — publisher product shot)`,
    author: `${hit.host} contributors`,
    query: hit.title,
    aspect: slot.aspect,
    fetchedAt: new Date().toISOString(),
  };
  fetched += 1;
}

if (!DRY_RUN) {
  provenance.updatedAt = new Date().toISOString();
  fs.writeFileSync(PROVENANCE, `${JSON.stringify(provenance, null, 2)}\n`);
}

console.log(`\n${DRY_RUN ? "[dry-run] " : ""}resolved ${fetched}/${slots.length} · unresolved ${unresolved.length}`);
if (unresolved.length) {
  console.log(`unresolved: ${unresolved.join(", ")}`);
  process.exit(1);
}

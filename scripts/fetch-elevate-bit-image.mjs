#!/usr/bin/env node
/**
 * Stage the product photo for the Beyblade X **Elevate** bit spare listing.
 *
 * One part, one image — so this is a thin wrapper over the SAME
 * `scripts/lib/wiki-images.mjs` the bulk parts pipeline uses, rather than a
 * second way of talking to the wiki. The shared lib owns the bit that is easy
 * to get wrong: `static.wikia.nocookie.net` checks **`Referer`**, not
 * User-Agent, and answers a browser UA alone with `403 text/html`. A
 * hand-rolled fetch here would 403 and read as "the wiki has no image".
 *
 * ── Why not Wikimedia Commons ─────────────────────────────────────────────
 *
 * Commons has no photograph of a 3.2 g plastic Beyblade bit. Asked for one it
 * returned its generic "Beyblade tournament" crowd shot — see the note in
 * `lib/editorial-image-manifest.mjs` for why that slot was removed from the
 * Commons manifest rather than left to resolve wrongly.
 *
 * ── The title form is "<Classification> - <Name>" ─────────────────────────
 *
 * `fetch-part-images.mjs` established this: guessing bare part names resolved
 * 9%, using the wiki's real `Bit - Elevate` convention took it to 41%. The
 * glossary row (`bit--elevate`) carries both halves already.
 *
 * Usage:
 *   node scripts/fetch-elevate-bit-image.mjs --dry-run
 *   node scripts/fetch-elevate-bit-image.mjs
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:network,fs
 */

import fs from "node:fs";
import path from "node:path";
import { resolveLeadImages, downloadAsWebp, wikiPageUrl } from "./lib/wiki-images.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, ".media-cache/editorial");
const PROV_DIR = path.join(ROOT, "docs/research/editorial-images");
const PROVENANCE = path.join(PROV_DIR, "image-provenance.json");

const DRY_RUN = process.argv.includes("--dry-run");

const KEY = "spare-image-elevate-bit";
const TITLES = ["Bit - Elevate", "Elevate", "Bit - Elevate (E)"];

const resolved = await resolveLeadImages([{ key: KEY, titles: TITLES }], { thumbSize: 960 });
const hit = resolved.get(KEY);

if (!hit) {
  console.error(`✗ no lead image for any of: ${TITLES.join(" | ")}`);
  console.error("  Leaving the slot without an image — a wrong part photo is a false");
  console.error("  claim about real merchandise.");
  process.exit(1);
}

console.log(`✓ ${KEY}\n    ${hit.title}\n    ${hit.src}`);

if (DRY_RUN) {
  console.log("[dry-run] wrote nothing");
  process.exit(0);
}

const dest = path.join(OUT_DIR, `${KEY}.webp`);
// 900px square-ish: this is a product shot on a listing card, not a 480px
// taxonomy thumbnail, so it is fetched larger than the parts pipeline default.
const bytes = await downloadAsWebp(hit.src, dest, { width: 900, quality: 82 });
console.log(`  → ${path.relative(ROOT, dest)} (${bytes} bytes)`);

fs.mkdirSync(PROV_DIR, { recursive: true });
const provenance = fs.existsSync(PROVENANCE)
  ? JSON.parse(fs.readFileSync(PROVENANCE, "utf8"))
  : { generatedBy: "scripts/fetch-editorial-images.mjs", images: {} };
provenance.images[KEY] = {
  sourcePage: wikiPageUrl(hit.title),
  fileUrl: hit.src,
  title: hit.title,
  // Fandom text is CC-BY-SA; its IMAGES are overwhelmingly publisher product
  // shots uploaded by editors with no explicit grant. Recorded honestly rather
  // than asserted as free — same position as fetch-taxonomy-images.mjs.
  licence: "Fandom (CC BY-SA text; image rights unverified — publisher product shot)",
  author: "beyblade.fandom.com contributors",
  query: hit.title,
  aspect: "square",
  fetchedAt: new Date().toISOString(),
};
provenance.updatedAt = new Date().toISOString();
fs.writeFileSync(PROVENANCE, `${JSON.stringify(provenance, null, 2)}\n`);
console.log("  → provenance recorded");

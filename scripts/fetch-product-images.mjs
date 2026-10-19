#!/usr/bin/env node
/**
 * Fetch real Beyblade X product photography for the five curated
 * `store-letitrip-official` listings (4 tops + the Xtreme Stadium), using the
 * same mechanism `fetch-taxonomy-images.mjs` already proved out for category
 * covers — see that file's header for why the Referer header (not the User-
 * Agent) is what the CDN actually checks.
 *
 * Output: `.media-cache/products/<slug>.webp` (gitignored staging cache,
 * same convention as `.media-cache/beys/`) plus a provenance record appended
 * to `docs/research/bey-corpus-2026-10/image-provenance.json`.
 *
 * Deliberately a SEPARATE small script rather than extending
 * `fetch-taxonomy-images.mjs`: that script reads `corpus.canonical` and
 * title-candidates every row in it — these five products are a fixed,
 * hand-picked list (two of them, CobaltDrake and PhoenixWing, are not even IN
 * `canonical` — they're `review`-bucket duplicate-documentation collisions
 * describing one real product each, not two competing retail versions; see
 * the commit this ships with). Running the generic pipeline over them would
 * also try to write category-image shortIds, which is the wrong id scheme
 * for a product photo — see upload-taxonomy-images.mjs's header on why
 * `category-<slug>-image` / `media/categories/...` is category-specific.
 *
 * Usage: node scripts/fetch-product-images.mjs [--force]
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE_DIR = path.join(ROOT, ".media-cache/products");
const PROVENANCE_PATH = path.join(
  ROOT,
  "docs/research/bey-corpus-2026-10/image-provenance.json",
);

const FORCE = process.argv.includes("--force");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// Same mechanism as fetch-taxonomy-images.mjs: Referer is what the CDN
// checks, not the User-Agent (measured 2026-10-14, documented there).
const IMAGE_HEADERS = {
  "User-Agent": UA,
  Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://beyblade.fandom.com/",
};

// Product photography, not a category icon — wider than the 480px covers use.
const TARGET_WIDTH = 900;
const WEBP_QUALITY = 85;

/**
 * Resolved via the MediaWiki API
 * (api.php?action=query&prop=pageimages&piprop=original&titles=…), same
 * endpoint fetch-taxonomy-images.mjs uses. Two (aeropegasus, valkyrievolt)
 * are already cached under .media-cache/beys/ from the taxonomy run and are
 * copied rather than re-fetched.
 */
const TARGETS = [
  {
    slug: "cobaltdrake-4-60f",
    sourcePage: "https://beyblade.fandom.com/wiki/CobaltDrake_4-60F",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/5/5a/CobaltDrake_4-60F.jpeg/revision/latest?cb=20230912065524",
  },
  {
    slug: "phoenixwing-9-60gf",
    sourcePage: "https://beyblade.fandom.com/wiki/PhoenixWing_9-60GF",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/0/02/PhoenixWing_9-60GF.jpeg/revision/latest?cb=20231114155235",
  },
  {
    slug: "xtreme-stadium-bx-10",
    sourcePage: "https://beyblade.fandom.com/wiki/Xtreme_Stadium",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/0/07/Xtreme_Stadium.jpeg/revision/latest?cb=20250322063443",
  },
  {
    slug: "wizardarrow-4-80b",
    sourcePage: "https://beyblade.fandom.com/wiki/WizardArrow_4-80B",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/6/6d/WizardArrow_4-80B.jpeg/revision/latest?cb=20230517044837",
  },
  {
    slug: "knightshield-3-80n",
    sourcePage: "https://beyblade.fandom.com/wiki/KnightShield_3-80N",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/a/ac/KnightShield_3-80N.jpeg/revision/latest?cb=20230517045417",
  },
  {
    slug: "winder-launcher",
    sourcePage: "https://beyblade.fandom.com/wiki/Winder_Launcher",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/b/b1/Beyblade_X_Winder_Launcher.jpeg/revision/latest?cb=20230517043723",
  },
  /*
   * 🛑 The String Launcher has no dedicated photo on the wiki (checked via the
   * MediaWiki API: the page carries zero images). Rather than fabricate a
   * studio shot or leave the listing without a real photo, this uses the real
   * BX-53 box photo — the actual string launcher IS visible in it, just not
   * isolated. The product description says so explicitly.
   */
  {
    slug: "bx-53-box",
    sourcePage: "https://beyblade.fandom.com/wiki/All_In_One_Set",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/a/a1/All_In_One_Set_Box.jpeg/revision/latest?cb=20260914151741",
  },
  /*
   * CX-20 Customize Set C — pre-order fixture. Marked {{Unreleased}} on the
   * wiki as of 2026-10-19, release Nov 21 2026, which is WHY it is a
   * pre-order rather than a standard listing: it genuinely is not out yet.
   */
  {
    slug: "customize-set-c-cx-20",
    sourcePage: "https://beyblade.fandom.com/wiki/Customize_Set_C",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/7/78/Customize_Set_C_Box.jpeg/revision/latest?cb=20261014150643",
  },
];

/** Already fetched by fetch-taxonomy-images.mjs for the taxonomy run. */
const REUSE_FROM_BEYS_CACHE = ["aeropegasus-3-70a", "valkyrievolt-s4-70v"];

fs.mkdirSync(CACHE_DIR, { recursive: true });

let provenance;
try {
  provenance = JSON.parse(fs.readFileSync(PROVENANCE_PATH, "utf8"));
} catch {
  provenance = { note: "", fetchedAt: new Date().toISOString(), images: {} };
}

let fetched = 0;
let skipped = 0;
let reused = 0;
let failed = 0;

for (const slug of REUSE_FROM_BEYS_CACHE) {
  const src = path.join(ROOT, ".media-cache/beys", `${slug}.webp`);
  const dest = path.join(CACHE_DIR, `${slug}.webp`);
  if (!fs.existsSync(src)) {
    console.error(`✗ ${slug}: expected at ${path.relative(ROOT, src)}, not found`);
    failed++;
    continue;
  }
  if (fs.existsSync(dest) && !FORCE) {
    console.log(`= ${slug} (already in products cache)`);
    skipped++;
    continue;
  }
  fs.copyFileSync(src, dest);
  console.log(`✓ ${slug} (reused from .media-cache/beys/)`);
  reused++;
}

for (const t of TARGETS) {
  const dest = path.join(CACHE_DIR, `${t.slug}.webp`);
  if (fs.existsSync(dest) && !FORCE) {
    console.log(`= ${t.slug} (cached)`);
    skipped++;
    continue;
  }

  try {
    const res = await fetch(t.sourceFile, { headers: IMAGE_HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());

    await sharp(buf)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .webp({ quality: WEBP_QUALITY })
      .toFile(dest);

    provenance.images ??= {};
    provenance.images[t.slug] = {
      sourcePage: t.sourcePage,
      sourceFile: t.sourceFile,
      localPath: `/images/products/${t.slug}.webp`,
      fetchedAt: new Date().toISOString(),
    };

    console.log(`✓ ${t.slug} <- ${t.sourceFile}`);
    fetched++;
  } catch (err) {
    console.error(`✗ ${t.slug}: ${err.message}`);
    failed++;
  }
}

fs.writeFileSync(PROVENANCE_PATH, JSON.stringify(provenance, null, 2) + "\n", "utf8");

console.log(`\nfetched ${fetched}, reused ${reused}, skipped ${skipped}, failed ${failed}`);
process.exit(failed > 0 ? 1 : 0);

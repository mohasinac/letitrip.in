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
   * ── BX-53 SET-EXCLUSIVE COLOURWAYS ────────────────────────────────────────
   *
   * 🛑 CORRECTED 2026-10-19. The note here used to read "The String Launcher
   * has no dedicated photo on the wiki (checked via the MediaWiki API: the
   * page carries zero images)" and fell back to the box photo.
   *
   * That was measured against the WRONG PAGE. `String_Launcher` carries no
   * images, but the components of this set are documented on the SET's page,
   * `All_In_One_Set` — and `prop=images` on that one returns a dedicated,
   * correctly-coloured photo for every single component. The same mistake
   * left three listings showing the box: the set's AeroPegasus, its stadium
   * and its string launcher.
   *
   * It matters beyond tidiness: every one of these six is a SET-EXCLUSIVE
   * colourway, which is the whole reason they are listed separately from the
   * standard releases (`AeroPegasus 3-70A` and `Xtreme Stadium (BX-10)` are
   * their own products in this same file). Showing the standard release's
   * photo on the exclusive variant misdescribes the goods; showing the box on
   * a ₹250 launcher reads as a ₹12,500 box.
   *
   * The lesson is Root Cause #84's: "the page carries zero images" was true
   * and the conclusion drawn from it was false, because the query was aimed
   * one page away from where the answer lived.
   */
  {
    slug: "bx-53-aeropegasus-dmc",
    sourcePage: "https://beyblade.fandom.com/wiki/All_In_One_Set",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/c/c0/AeroPegasus_3-70A_%28Double_Metal_Coat_Blue%C3%97Cyan%29.png/revision/latest?cb=20260915025428",
  },
  {
    slug: "bx-53-string-launcher",
    sourcePage: "https://beyblade.fandom.com/wiki/All_In_One_Set",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/8/86/Beyblade_X_String_Launcher_%28Yellow_Ver.%29.png/revision/latest?cb=20260915025615",
  },
  {
    slug: "bx-53-xtreme-stadium",
    sourcePage: "https://beyblade.fandom.com/wiki/All_In_One_Set",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/3/34/Xtreme_Stadium_%28Clear_Black%C3%97Green%29.png/revision/latest?cb=20260915025601",
  },
  {
    slug: "bx-53-winder-launcher",
    sourcePage: "https://beyblade.fandom.com/wiki/All_In_One_Set",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/b/b6/Beyblade_X_Winder_Launcher_%28Blue%C3%97Cyan%29.png/revision/latest?cb=20260915025640",
  },
  {
    slug: "bx-53-knightshield-v2",
    sourcePage: "https://beyblade.fandom.com/wiki/All_In_One_Set",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/2/2d/KnightShield_3-80N_%28Version_2.0%29.png/revision/latest?cb=20260915025531",
  },
  {
    slug: "bx-53-wizardarrow-v2",
    sourcePage: "https://beyblade.fandom.com/wiki/All_In_One_Set",
    sourceFile:
      "https://static.wikia.nocookie.net/beyblade/images/5/51/WizardArrow_4-80B_%28Version_2.0%29.png/revision/latest?cb=20260915025457",
  },
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

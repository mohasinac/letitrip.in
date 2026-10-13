/**
 * D3 — the two remaining visual patterns, mosaic and split-tile.
 *
 * Collage and OG already existed (BundleCollage, PrizeDrawCollage, 20+
 * opengraph-image.tsx routes); this covers what did not.
 *
 * @tag domain:quality
 * @tag layer:script
 * @tag access:node-only
 */
import { readFileSync, existsSync } from "node:fs";

let pass = 0;
let fail = 0;
const ok = (c, m) => {
  if (c) {
    pass++;
    console.log("  PASS", m);
  } else {
    fail++;
    console.log("  FAIL", m);
  }
};
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");

const MOSAIC = read("appkit/src/ui/components/ImageMosaic.tsx");
const MOSAIC_CSS = read("appkit/src/ui/components/ImageMosaic.style.css");
const SPLIT = read("appkit/src/ui/components/SplitTile.tsx");
const PAGE = read("appkit/src/features/categories/components/CategoryDetailPageView.tsx");

console.log("\n=== ImageMosaic — honest about what it has, deterministic about layout ===");
{
  ok(/tiles\.length < MOSAIC_MIN\) return null/.test(MOSAIC), "below the floor it renders NOTHING, not a one-tile mosaic that looks like a mistake");
  ok(/aria-label=\{alt\}/.test(MOSAIC) && /role=\"img\"/.test(MOSAIC), "the group is labelled as ONE image, not five unlabelled thumbnails");
  const mosaicCode = MOSAIC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  ok(!/Math\.random/.test(mosaicCode), "🛑 no randomness in the CODE — the docstring names Math.random as the anti-pattern it avoids, so comments are stripped first");
  ok(!/<Anchor|<Link|href=/.test(MOSAIC), "no links inside the mosaic — every product is already linked in the grid below it; a second set of hit targets is a tap hazard");
  ok(/object-fit: cover/.test(MOSAIC_CSS), "a fixed-height band with object-fit:cover, so a portrait photo cannot stretch and distort the subject");
}

console.log("\n=== SplitTile — two real branches, never an invented third ===");
{
  ok(/left: SplitTilePane;\s*\n\s*right: SplitTilePane;/.test(SPLIT), "exactly two REQUIRED panes — no 'only one side' fallback and no placeholder image");
  ok(
    read("appkit/src/features/categories/components/CategoryDetailPageView.tsx").includes("branches.length !== 2) return null"),
    "🛑 the caller only renders it for EXACTLY two photographed tier-1 children — three or more falls through to the existing scroller",
  );
  ok(PAGE.includes("!coverOf(a) || !coverOf(b)) return null"), "both sides must have a REAL cover photo — neither side is padded with a stand-in");
  ok(
    PAGE.includes("category?.tier !== 0) return null"),
    "only on a ROOT — a mid-tree node's two children are not the same kind of decision as a root's two verticals",
  );
  ok(
    /totalProductCount \?\? c\?\.metrics\?\.productCount \?\? 0/.test(PAGE),
    "the count read is the SAME rollup field the adjacent scroller chips already use — not a second, possibly-disagreeing count",
  );
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

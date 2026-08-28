#!/usr/bin/env node
/**
 * audit-card-grid-cols.mjs — strict-zero.
 *
 * Every "cards laid out in a grid" surface goes through one ladder:
 * `<Grid cols="cards">` (or the `cardsWide` / `categoryCards` / `statTiles` /
 * `navTiles` density variants), resolved by `.appkit-grid--cards` in
 * appkit/src/ui/components/Layout.style.css — 1 column on phones, 2 from md,
 * `auto-fill` above so the count follows the grid's own width.
 *
 * Before this landed there were ~24 hand-written responsive ladders across
 * ~90 call sites. They disagreed in every direction: the dominant spelling
 * put 2 cramped cards on a 375px phone, `.appkit-grid--cards` itself had a
 * no-op `lg` step and never reached 4 columns, and none of them could see
 * ListingLayout's filter sidebar opening.
 *
 * Two rules, both narrow on purpose. A rule matching EVERY responsive
 * `grid-cols` would fire on ~70 legitimate form, filter, split-layout and
 * fixed-count marketing grids — the noise that trains people to ignore an
 * audit. What is flagged here is specifically a grid of CARDS.
 *
 *   Rule A — files whose name says they are a listing surface.
 *   Rule B — repo-wide backstop: a responsive ladder over `.map()` whose
 *            child is a `<XxxCard>` / `<XxxTile>` component.
 *
 * There is NO suppression marker, by design (see
 * scripts/audit-no-suppression-comments.mjs — markers are policy-banned).
 * A genuine exception goes in EXCLUDED_FILES below with its reason, so the
 * decision stays reviewable in one place instead of scattered across call
 * sites.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "__tests__"]);

/** Rule A applies to files named like a listing surface. */
const LISTING_FILE = /(IndexListing|Listing|ListView|ViewCards|Grid)\.tsx$/;

/**
 * A responsive ladder: a base `grid-cols-N` and/or at least one
 * breakpoint-prefixed `grid-cols-M`. A bare `grid-cols-2` with no breakpoint
 * is a fixed layout (form field pairs, a two-button row) and is not flagged.
 */
const RESPONSIVE_LADDER = /\b(?:sm|md|lg|xl|2xl):grid-cols-\d/;

/** Rule B's card signal — `<ProductCard`, `<StatTile`, … but NOT a bare `<Card`. */
const CARD_CHILD = /<[A-Z][A-Za-z0-9]*(?:Card|Tile)\b/;

const LOOKAHEAD_LINES = 45;

/**
 * Files that legitimately keep a hand-written ladder. Each needs a reason.
 */
const EXCLUDED_FILES = [
  {
    // The column count is an ADMIN CHOICE (a 1-4 setting on the homepage
    // section), and the same map is re-derived into `columns-*` for the
    // masonry layout by string replacement. Forcing the shared ladder would
    // silently override what the admin picked.
    path: join("appkit", "src", "features", "homepage", "components", "CustomCardsSection.tsx"),
  },
  {
    // A promo banner collage whose fixed 3-column count is load-bearing for
    // the `sm:row-span-2` choreography on its first tile.
    path: join("appkit", "src", "features", "homepage", "components", "PromoGrid.tsx"),
  },
  {
    // Three "how it works" steps, a fixed set authored in the file. `auto-fill`
    // would open a 4th track in a wide container and leave the row short one
    // tile — the shared ladder is for listings of unknown length, not for a
    // fixed-count marketing row.
    path: join("appkit", "src", "features", "homepage", "components", "HowItWorksSection.tsx"),
  },
  {
    // A 3-panel activity row (orders / reviews / wishlist) that is deliberately
    // 3-wide above lg — it already carries an eslint-disable saying exactly
    // that. Three named panels, not a list.
    path: join("src", "components", "user", "ProfileActivityPanel.tsx"),
  },
  {
    // Defines the ladder. Its own docstring quotes the class names.
    path: join("appkit", "src", "ui", "components", "Layout.tsx"),
  },
];

function isExcluded(file) {
  return EXCLUDED_FILES.some((e) => file.endsWith(e.path));
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else if (full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    if (isExcluded(file)) continue;
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    const isHomepage = rel.includes("/features/homepage/");
    const lines = readFileSync(file, "utf8").split("\n");

    lines.forEach((line, i) => {
      if (!RESPONSIVE_LADDER.test(line)) return;

      // Rule A — a listing-surface file. Catches both the JSX-className shape
      // and the `const gridClass = "…"` shape a className-only check misses.
      if (LISTING_FILE.test(file) && !isHomepage) {
        violations.push({ at: `${rel}:${i + 1}`, rule: "A", line: line.trim() });
        return;
      }

      // Rule B — repo-wide: a ladder rendering mapped card/tile components.
      const window = lines.slice(i, i + LOOKAHEAD_LINES).join("\n");
      if (window.includes(".map(") && CARD_CHILD.test(window)) {
        violations.push({ at: `${rel}:${i + 1}`, rule: "B", line: line.trim() });
      }
    });
  }
}

if (violations.length > 0) {
  console.error(
    "audit-card-grid-cols: FAILED — hand-written responsive grid ladder on a card grid:\n",
  );
  for (const v of violations) {
    console.error(`  ✗ [${v.rule}] ${v.at}`);
    console.error(`      ${v.line.slice(0, 140)}`);
  }
  console.error(
    `\n${violations.length} violation(s). Use <Grid cols="cards"> (or cardsWide / ` +
      `categoryCards / statTiles / navTiles) and DELETE the grid-cols-* className — ` +
      `appkit's dist/styles.css is unlayered and both tailwind configs set ` +
      `important:true, so a leftover utility silently beats the preset. ` +
      `A genuine exception goes in EXCLUDED_FILES in this script, with a reason.`,
  );
  process.exit(1);
}

console.log("audit-card-grid-cols: clean ✓");

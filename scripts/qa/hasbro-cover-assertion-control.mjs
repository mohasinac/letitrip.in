#!/usr/bin/env node
/**
 * Negative control for the regional-logo assertion in `categories-seed-data.ts`.
 *
 * ── Why this exists, and why it is not a unit test ─────────────────────────
 *
 * This project forbids vitest/jest and `*.test.ts`, for a reason worth
 * restating: a mock is a second implementation, and the one you assert against
 * is always the one you believed in (Root Cause #83 — `/admin/team`'s test
 * mocked `buildSieveFilters` as the CORRECT behaviour while the real helper
 * concatenated, so a live bug passed its own test for as long as it existed).
 *
 * This mocks nothing. It imports the REAL built seed and the REAL generated
 * map, and perturbs one row or one key at a time. The sibling precedent is
 * `scripts/qa/roundtrip-diff.mjs`, which is likewise a standalone proof script
 * rather than a suite.
 *
 * ── What it proves ────────────────────────────────────────────────────────
 *
 * The assertion compares `covered` to `Object.keys(map).length`, and the two
 * drift directions are deliberately NOT symmetric:
 *
 *   - a map entry whose row names no Hasbro wave can never render, because
 *     `withGeneratedHasbroCover` gates on `hasbroName` — a stored object
 *     nothing will ever serve. MUST fire.
 *   - a named wave with no logo renders the name without a picture, which the
 *     view handles and which is the honest-gap rule the rest of this work
 *     follows. MUST NOT fire.
 *
 * 🛑 That second clause is the whole point of keeping this. A first draft of
 * the assertion's COMMENT claimed both directions were caught; running this
 * showed one was not, and then showed the uncaught one was correct behaviour
 * rather than a blind spot. Without the control the comment would have shipped
 * describing a guarantee that did not exist — which is how a check becomes
 * decoration (Root Cause #92: "a check a variable name satisfies").
 *
 * Usage, from the consumer root (needs appkit/dist built):
 *   node scripts/qa/hasbro-cover-assertion-control.mjs
 *
 * Exit: 0 = discriminates correctly, 1 = wrong discrimination, 2 = cannot run.
 *
 * @tag domain:categories
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — reads appkit/dist, writes nothing
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DIST = `file:///${ROOT.split(path.sep).join("/")}/appkit/dist/`;

if (!fs.existsSync(path.join(ROOT, "appkit/dist/seed/categories-seed-data.js"))) {
  console.error("✗ appkit/dist is not built — run `npm --prefix appkit run build` first.");
  process.exit(2);
}

const { categoriesSeedData } = await import(new URL("seed/categories-seed-data.js", DIST).href);
const { GENERATED_CATEGORY_HASBRO_IMAGES } = await import(
  new URL("seed/_helpers/category-images-generated.js", DIST).href
);

/**
 * Verbatim the predicate from `categories-seed-data.ts`.
 *
 * 🛑 Kept as a copy ON PURPOSE, and it is the one copy in this file that could
 * drift from the thing it checks. The alternative — exporting the predicate so
 * both call it — would mean this script passes whenever the seed passes,
 * including when both are wrong together. A control has to be able to
 * disagree.
 */
function evaluate(rows, map) {
  const named = rows.filter((c) => typeof c.hasbroName === "string" && c.hasbroName);
  const covered = named.filter((c) => typeof c.id === "string" && map[c.id] === c.hasbroCoverImage);
  const keys = Object.keys(map);
  return { fires: covered.length !== keys.length, covered: covered.length, keys: keys.length };
}

const fmt = (label, r, expect) =>
  `${label.padEnd(20)} fires: ${String(r.fires).padEnd(5)} (covered ${r.covered} / keys ${r.keys})` +
  (expect === undefined ? "" : `  [must be ${expect}]`);

const base = evaluate(categoriesSeedData, GENERATED_CATEGORY_HASBRO_IMAGES);
console.log(fmt("live state", base, false));
if (base.fires) {
  console.error(
    "\n✗ the assertion fires on the REAL data. That is a genuine seed failure, not a\n" +
      "  control result — the seed itself would throw at module load. Fix that first.",
  );
  process.exit(1);
}

// Drift 1 — a wave loses its name but its logo stays mapped.
const nameDropped = categoriesSeedData.map((r) =>
  r.id === "category-burst-god" ? { ...r, hasbroName: undefined } : r,
);
const d1 = evaluate(nameDropped, GENERATED_CATEGORY_HASBRO_IMAGES);
console.log(fmt("name removed", d1, true));

// Drift 2 — the map gains a logo for a row that names no wave.
const orphaned = { ...GENERATED_CATEGORY_HASBRO_IMAGES, "category-burst-bu": "/media/nope-image" };
const d2 = evaluate(categoriesSeedData, orphaned);
console.log(fmt("orphan logo added", d2, true));

// PERMITTED — a named wave with no logo. Renders text-only; must stay silent.
const firstKey = Object.keys(GENERATED_CATEGORY_HASBRO_IMAGES)[0];
const thinned = { ...GENERATED_CATEGORY_HASBRO_IMAGES };
delete thinned[firstKey];
const permitted = evaluate(categoriesSeedData, thinned);
console.log(fmt("name w/o logo", permitted, false));

const ok = d1.fires && d2.fires && !permitted.fires;
console.log(
  ok
    ? "\n✓ discriminates correctly — silent on the real data AND on the permitted state,\n" +
        "  fires on both real drifts."
    : "\n✗ wrong discrimination — a drift went undetected, or a legal state was rejected.",
);
process.exit(ok ? 0 : 1);

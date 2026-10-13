/**
 * H2 — the persuasion patterns, and the controls that keep them honest.
 *
 * 🛑 THE WHOLE POINT OF THIS SCRIPT is that a dishonest persuasion pattern is
 * indistinguishable from an honest one by looking at the page. "Only 10 left —
 * order soon!" renders identically whether 10 is scarce or comfortable, and a
 * fabricated "RRP ₹2,499" renders identically to a measured median. So the
 * controls here are the ones that would catch the dishonest version:
 *
 *   - a band under the confidence threshold must render NOTHING, not a median
 *     computed from two sales;
 *   - the window must be stated, because a median with no period attached is
 *     unfalsifiable;
 *   - the direction must be stated even when it is UNFLATTERING — an anchor
 *     that only appears when it helps is a filter, not a measurement;
 *   - and the urgency copy must be proportionate to the number it describes.
 *
 * Run: node scripts/verify-honest-persuasion.mjs
 *
 * @tag domain:products
 * @tag layer:script
 * @tag access:node-only
 */
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
globalThis.require = createRequire(import.meta.url);

const { PRICE_INDEX_MIN_CONFIDENT_SAMPLES } = await import(
  "@mohasinac/appkit/features/categories/repository/price-index.repository"
);

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

const ANCHOR = read("appkit/src/features/products/components/MarketPriceAnchor.tsx");
const VIEW = read("appkit/src/features/products/components/ProductDetailPageView.tsx");

console.log("\n=== The anchor is MEASURED, not fabricated ===");
{
  ok(ANCHOR.length > 0, "`MarketPriceAnchor` exists");
  ok(
    /band\.sampleSize < PRICE_INDEX_MIN_CONFIDENT_SAMPLES\) return null/.test(ANCHOR),
    `🛑 silent below ${PRICE_INDEX_MIN_CONFIDENT_SAMPLES} samples — a median of two sales is arithmetic, not a market`,
  );
  ok(
    /Number\.isFinite\(band\.median\) \|\| band\.median <= 0\) return null/.test(ANCHOR),
    "...and silent for a zero or non-finite median, which would render as a real ₹0",
  );
  ok(/in the last \$\{window\} days/.test(ANCHOR), "the WINDOW is stated — a median with no period is unfalsifiable");
  ok(
    /so this one is above the usual price/.test(ANCHOR),
    "🛑 it states the UNFLATTERING direction too — an anchor that only renders when it helps is a filter, not a measurement",
  );
  ok(/Math\.abs\(delta\) < 0\.05/.test(ANCHOR), "a sub-5% difference claims no direction, so rounding is not reported as a discount");
  ok(
    /<PricesOnly>/.test(ANCHOR),
    "wrapped in `<PricesOnly>` — a SECONDARY money figure beside an already-gated price shows a guest nothing, not a second sign-in prompt",
  );
  /*
   * 🛑 COMMENT-STRIPPED FIRST. The first version of this control matched the
   * component's own docstring, which names "a fabricated RRP ₹2,499" as the
   * thing being avoided — so the check failed on prose explaining why it
   * passes. That is `audit-empty-catch` reporting its own comment, and F1 #26's
   * whole lesson: a false positive trains people to reach for a suppression.
   */
  const code = ANCHOR.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  ok(
    !/RRP|list price|MRP/i.test(code),
    "CONTROL: no fabricated reference price in the component's CODE (its docstring names the anti-pattern, so the check strips comments first)",
  );
}

console.log("\n=== It is wired, and it costs no extra latency ===");
{
  ok(/<MarketPriceAnchor/.test(VIEW), "the product page renders it");
  ok(
    /priceIndexRepository\.getForLeaf\(primaryCategorySlug\)/.test(VIEW),
    "the band is read by leaf id — one `findById`, no query and no index",
  );
  const block = VIEW.slice(VIEW.indexOf("await Promise.all(["), VIEW.indexOf("]);", VIEW.indexOf("await Promise.all([")));
  ok(
    /priceIndexRepository/.test(block),
    "🛑 read INSIDE the existing `Promise.all` — a fifth parallel read adds document reads but no latency, which is what Rule #6's ~3-sequential-round-trip budget is about",
  );
  ok(
    /byListingType\?\.\[normalizeListingType\(/.test(VIEW),
    "keyed by LISTING TYPE within the leaf — a ₹399 sticker sheet and a ₹1,299 bey share a leaf and must not blend",
  );
  ok(/key: "product\.priceIndex"/.test(VIEW), "wrapped in `safeRead`, so a missing band renders nothing rather than failing the page");
}

console.log("\n=== Scarcity is PROPORTIONATE to the number ===");
{
  ok(
    /effectiveStock <= 3 && \(/.test(VIEW),
    "🛑 urgency copy only at 3 or fewer — it fired at 10, which is an urgency claim about a comfortable stock level",
  );
  ok(
    /effectiveStock > 3 && effectiveStock <= 10 && \(/.test(VIEW) && /in stock\n/.test(VIEW),
    "4–10 states the count without the exclamation mark: a fact, not a push",
  );
  ok(
    !/effectiveStock <= 10 && \(\n\s*<Text className="mt-1 text-warning"/.test(VIEW),
    "CONTROL: the old ≤10 urgency branch is gone, not merely shadowed by a new one",
  );
}

console.log("\n=== Social proof is real, and floored ===");
{
  ok(/views7d !== null && views7d >= 2/.test(VIEW), "the view count renders only at 2+, so a lone visitor is never told '1 person viewed this'");
  ok(
    !/\?\? 0/.test(VIEW.slice(VIEW.indexOf("const views7d"), VIEW.indexOf("const views7d") + 200)),
    "🛑 `undefined` is not `0` — a product with no measurement renders nothing rather than a confident zero",
  );
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

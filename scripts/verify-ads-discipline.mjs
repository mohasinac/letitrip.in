/**
 * H3 — ads discipline: inventory + placement already existed; this verifies
 * the two things the plan actually asked for — lazy/below-the-fold, and never
 * product-card-shaped.
 *
 * 🛑 "More built than this plan assumed" was the finding: `adSettings` was
 * already declared private, `/api/ads` already filtered to `active`, and
 * `<AdSlot>` was already mounted on auctions/blog/promotions/search. So H3 is
 * discipline, not construction — and the one real gap was that every slot
 * fetched its ad unconditionally on mount, with no regard for whether it was
 * anywhere near the viewport.
 *
 * Run: node scripts/verify-ads-discipline.mjs
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

const HOOK = read("appkit/src/features/homepage/hooks/useActiveAd.ts");
const SLOT = read("appkit/src/features/homepage/components/AdSlot.tsx");

console.log("\n=== Lazy / below-the-fold ===");
{
  ok(
    /enabled: near/.test(HOOK),
    "🛑 the ad query does not fire until the slot is near the viewport — it fired unconditionally on mount before this",
  );
  ok(/IntersectionObserver/.test(HOOK), "an IntersectionObserver decides 'near', not a timer or a route-level heuristic");
  ok(/rootMargin: \"200px\"/.test(HOOK), "it fires a little EARLY (200px) so the ad has time to resolve before a visitor actually scrolls to it — 'lazy' is not 'late'");
  ok(
    /typeof IntersectionObserver === \"undefined\"/.test(HOOK),
    "CONTROL: an environment with no observer fails OPEN to fetching immediately, not to a permanently silent slot",
  );
  ok(
    /ref={slotRef}/.test(SLOT) && /useActiveAd\(id, slotRef\)/.test(SLOT),
    "the slot renders its sentinel BEFORE the ad resolves — there has to be something in the DOM to observe, or 'near' could never become true",
  );
}

console.log("\n=== Never product-card-shaped ===");
{
  const banner = SLOT.slice(SLOT.indexOf("function ManualAdBanner"), SLOT.indexOf("// --", SLOT.indexOf("function ManualAdBanner")));
  ok(
    !/ProductCard|InteractiveProductCard|PriceDisplay|GatedPrice/.test(banner),
    "the manual-ad banner imports no product-card component and renders no price",
  );
  ok(
    /aria-label=\"Advertisement\"/.test(SLOT),
    "every slot is labelled 'Advertisement' in the accessibility tree, not disguised as a listing",
  );
  ok(
    /h-14 w-14/.test(banner),
    "its thumbnail is a fixed small square — a product card's image is the dominant element of the tile; here it is a detail beside the text, not the headline",
  );
}

console.log("\n=== Already built (restraint, not construction) ===");
{
  const adsRoute = read("src/app/api/ads/route.ts");
  ok(/s-maxage=600/.test(adsRoute), "/api/ads is CDN-cached — a slot's lazy fetch still costs no Firestore read on a cache hit");
  ok(
    read("appkit/src/features/auctions/components/AuctionsListView.tsx").includes("AdSlot") &&
      read("appkit/src/features/blog/components/BlogIndexPageView.tsx").includes("AdSlot"),
    "AdSlot was already mounted on auctions and blog — confirmed rather than re-built",
  );
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

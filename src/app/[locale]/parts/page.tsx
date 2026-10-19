import { PartsIndexPageView, ROUTES } from "@mohasinac/appkit";
import { PartsSearchBox } from "@mohasinac/appkit/features/parts/components/PartsSearchBox";
import { getSiteSettingsSafe } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants/seo.server";

/**
 * D12 — the parts database index.
 *
 * 🛑 STILL ZERO Firestore reads for the grid itself. The 20 classifications
 * come from `ALL_PART_SLOTS` + `PART_SLOT_LABEL`, both compile-checked.
 * Showing a count per classification would be 20 queries or a 753-document
 * scan on a page that exists only to route — and a stored count would be a
 * mirror of a collection the seed rewrites (Root Cause #42).
 *
 * The one read added here is the settings singleton, which is cached and
 * which the layout already loads: it carries the search kill switch. The
 * search box itself reads a CDN object, never Firestore, so the page stays
 * as cheap as it was.
 *
 * ## Why a search box at all
 *
 * 752 parts were reachable ONLY by drilling classification -> code, with no
 * search input anywhere on the surface. A code is also ambiguous across
 * generations — `105` is a Metal Fight spin-track height, a bare number in
 * Burst is a disc — which is why the box shows each hit's classification
 * rather than guessing one.
 */
export const metadata = _gm({
  title: "Beyblade parts database — LetItRip",
  description:
    "Every Beyblade component we have a record of, grouped by what it is: attack rings, weight disks, fusion wheels, spin tracks, performance tips, layers, discs, drivers, blades, ratchets and bits.",
  path: "/parts",
});

export default async function PartsIndexPage() {
  const settings = await getSiteSettingsSafe();
  // `!== false` — default ON, so an unseeded document leaves search working.
  const indexEnabled = settings?.search?.indexEnabled !== false;

  return (
    <PartsIndexPageView
      hrefForClassification={(c) => String(ROUTES.PUBLIC.PART_CLASSIFICATION(c))}
      renderSearch={() => <PartsSearchBox indexEnabled={indexEnabled} />}
    />
  );
}

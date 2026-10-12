import { PartsIndexPageView, ROUTES } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

/**
 * D12 — the parts database index.
 *
 * 🛑 ZERO Firestore reads, so it is fully static and costs no function
 * invocation. The 20 classifications come from `ALL_PART_SLOTS` +
 * `PART_SLOT_LABEL`, both compile-checked. Showing a count per classification
 * would be 20 queries or a 753-document scan on a page that exists only to
 * route — and a stored count would be a mirror of a collection the seed
 * rewrites (Root Cause #42).
 */
export const metadata = _gm({
  title: "Beyblade parts database — LetItRip",
  description:
    "Every Beyblade component we have a record of, grouped by what it is: attack rings, weight disks, fusion wheels, spin tracks, performance tips, layers, discs, drivers, blades, ratchets and bits.",
  path: "/parts",
});

export default function PartsIndexPage() {
  return (
    <PartsIndexPageView
      hrefForClassification={(c) => String(ROUTES.PUBLIC.PART_CLASSIFICATION(c))}
    />
  );
}

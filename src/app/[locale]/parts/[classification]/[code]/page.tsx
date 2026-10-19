import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  PartDetailPageView,
  PART_SLOT_LABEL,
  partSlotFromSegment,
  GENERIC_PRODUCT_LISTING_TYPES,
  ROUTES,
  breadcrumbJsonLd,
  productRepository,
  type PartListingRow,
} from "@mohasinac/appkit";
// Imported from the DEFINING modules, not a barrel (Root Cause #18).
import { AVAILABILITY_VALUES } from "@mohasinac/appkit/constants/field-names";
import { withTrailHead } from "@mohasinac/appkit/features/categories/utils/breadcrumb-chain";
import { PageViewTracker } from "@mohasinac/appkit/client";
import {
  getPartByKey,
  getModelsUsingPart,
  listPublicProducts,
  safeRead,
} from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants/seo.server";

/**
 * D12 — one part's page: what it is, which beys use it, and who is selling it.
 *
 * ── 🛑 THE URL CARRIES BOTH HALVES OF THE KEY, AND THAT IS THE POINT ───────
 *
 * `/parts/{classification}/{code}` → document id `${slot}--${tail}`, so this
 * is a DIRECT doc read: no query, no index, no scan. Code alone would be
 * ambiguous — `105` is a Metal Fight spin-track height, a bare number in
 * Burst is a disc, `1-60` is a Beyblade X ratchet — so a one-segment URL
 * would have to guess, and guessing would explain a Burst disc as a spin
 * track.
 *
 * ── 🛑 LISTINGS COME FROM THE SHARED PUBLIC QUERY, NEVER A NEW ONE ─────────
 *
 * `listPublicProducts` is the single implementation every public browse
 * surface uses, and re-implementing it is precisely Root Cause #59 (a fix
 * applied to the route and never back-ported to the view that duplicates it).
 * The search term is the part's NAME, which works because D2 Fix 3 put the
 * code ⇄ name bridge into product `searchTxt` — so a listing titled
 * "Storm Pegasus 105RF" is found by "Rubber Flat" and vice versa.
 *
 * ── 🛑 NO MONEY ON THE PAGE ────────────────────────────────────────────────
 *
 * Prices are gated for signed-out visitors, so an amount here would need
 * `<GatedPrice>` and make this a client component. Rows carry a title, a
 * condition and a link; the price lives on the listing. Same rule as
 * `/search` — nothing to gate means nothing to leak, and no `offers.price` is
 * emitted, so no paywall declaration is needed either.
 */
type Props = { params: Promise<{ classification: string; code: string }> };

const LISTINGS_PAGE_SIZE = 6;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classification, code } = await params;
  const slot = partSlotFromSegment(classification);
  if (!slot) return {};
  // Wrapped in React.cache, so this is the SAME read the page body does.
  const part = await getPartByKey(slot, code);
  if (!part) return {};
  const label = PART_SLOT_LABEL[slot];
  const weight = typeof part.weightG === "number" ? ` It weighs ${part.weightG} g.` : "";
  return _gm({
    title: `${part.name}${part.code ? ` (${part.code})` : ""} — ${label} — LetItRip`,
    description: `${part.name} is a Beyblade ${label.toLowerCase()}.${weight} See which models use it and what is currently listed.`,
    path: `/parts/${classification}/${code}`,
  });
}

export default async function PartDetailPage({ params }: Props) {
  const { classification, code } = await params;
  const slot = partSlotFromSegment(classification);
  if (!slot) notFound();

  const part = await getPartByKey(slot, code);
  if (!part) notFound();

  /*
   * Two reads in parallel, both guarded. `getModelsUsingPart` is a `getAll`
   * over the ids `usedBy` already carries — no query — and the listings read
   * is one bounded `listPublicProducts` call.
   */
  const [usedBy, listingsResult, exactListings] = await Promise.all([
    safeRead(() => getModelsUsingPart(part.id), {
      route: "/parts/[classification]/[code]",
      key: "parts.modelsUsingPart",
      fallback: [],
    }),
    safeRead(
      () =>
        listPublicProducts({
          q: part.name,
          availability: AVAILABILITY_VALUES.AVAILABLE,
          listingTypes: GENERIC_PRODUCT_LISTING_TYPES,
          page: 1,
          pageSize: LISTINGS_PAGE_SIZE,
        }),
      {
        route: "/parts/[classification]/[code]",
        key: "parts.listings",
        fallback: null,
      },
    ),
    /*
     * 🛑 A SECOND query, deliberately — not a widening of the one above.
     * `spares` sets `inGeneralCatalogue: false`, so it can never surface
     * through `listPublicProducts({ listingTypes: GENERIC_PRODUCT_LISTING_TYPES })`
     * no matter how precisely a spare is titled. This is the one place that
     * exclusion is bridged, via the exact `partGlossaryId` link rather than a
     * name match.
     *
     * `findByPartGlossaryId` fails open to `[]` through `safeRead` — a missing
     * composite index would otherwise throw `FAILED_PRECONDITION`, which
     * `safeRead` already logs, turning into an empty section rather than a
     * broken page.
     */
    safeRead(() => productRepository.findByPartGlossaryId(part.id), {
      route: "/parts/[classification]/[code]",
      key: "parts.exactListings",
      fallback: [],
    }),
  ]);

  const listings: PartListingRow[] = (listingsResult?.items ?? []).map((row) => {
    const slug = typeof row.slug === "string" ? row.slug : String(row.id ?? "");
    return {
      id: String(row.id ?? slug),
      title: typeof row.title === "string" ? row.title : slug,
      slug,
      condition: typeof row.condition === "string" ? row.condition : undefined,
      href: String(ROUTES.PUBLIC.PRODUCT_DETAIL(slug)),
    };
  });

  const label = PART_SLOT_LABEL[slot];
  /*
   * The same shared builder every other breadcrumb on the site uses (D4b), so
   * the trail reads root→leaf and the final crumb is a non-link. `withTrailHead`
   * drops the last URL, which is why `breadcrumbJsonLd` had to stop assuming
   * every item has one.
   */
  const ldBreadcrumb = breadcrumbJsonLd(
    withTrailHead(
      [
        { name: label, url: `/parts/${classification}` },
        { name: part.name, url: `/parts/${classification}/${code}` },
      ],
      [
        { name: "Home", url: "/" },
        { name: "Parts", url: "/parts" },
      ],
    ),
  );

  return (
    <>
      <PageViewTracker
        entityType="product"
        entityId={part.id}
        url={`/parts/${classification}/${code}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }}
      />
      <PartDetailPageView
        part={part}
        usedBy={usedBy}
        listings={listings}
        listingsTruncated={listingsResult?.truncated === true}
        allListingsHref={`${String(ROUTES.PUBLIC.PRODUCTS)}?q=${encodeURIComponent(part.name)}`}
        exactListings={exactListings.slice(0, 12).map((row) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          condition: row.condition,
          /*
           * `pluginFor(normalizeListingType(row)).detailRoute` would be the
           * general-purpose way to resolve this, but every known producer of
           * `partGlossaryId` — spares and the generated catalogue rows — is a
           * standard product-page listing, and pulling the whole listing-type
           * registry into this page for one link is more machinery than the
           * fact warrants. If a THIRD listing type starts carrying the field,
           * revisit this.
           */
          href: String(ROUTES.PUBLIC.PRODUCT_DETAIL(row.slug ?? row.id)),
        }))}
        exactListingsTruncated={exactListings.length > 12}
        hrefForModel={(categoryId) => String(ROUTES.PUBLIC.CATEGORY_DETAIL(categoryId))}
        hrefForClassification={(c) => String(ROUTES.PUBLIC.PART_CLASSIFICATION(c))}
      />
    </>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BeyDetailPageView,
  GENERIC_PRODUCT_LISTING_TYPES,
  ROUTES,
  breadcrumbJsonLd,
  partSlotFromSegment,
  type BeyListingRow,
} from "@mohasinac/appkit";
// Imported from the DEFINING modules, not a barrel (Root Cause #18).
import { AVAILABILITY_VALUES } from "@mohasinac/appkit/constants/field-names";
import { PART_SLOT_CATEGORY } from "@mohasinac/appkit/features/parts/schemas/firestore";
import { withTrailHead } from "@mohasinac/appkit/features/categories/utils/breadcrumb-chain";
import { PageViewTracker } from "@mohasinac/appkit/client";
import {
  getBeyBySlug,
  getProductsContainingBey,
  listPublicProducts,
  safeRead,
} from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants/seo.server";

/**
 * One bey's page: what it is, what it is built from, and who is selling it.
 *
 * ── 🛑 A ONE-SEGMENT URL, UNLIKE `/parts/{classification}/{code}` ──────────
 *
 * A bey's document id IS its slug, so `/beys/{slug}` is a direct doc read with
 * no query and no index. Parts need the classification in the path because a
 * code alone is ambiguous — `105` is a Metal Fight spin-track height, a bare
 * number in Burst is a disc, `1-60` is a Beyblade X ratchet — and a one-segment
 * part URL would have to guess. A bey name carries no such collision.
 *
 * ── 🛑 LISTINGS COME FROM THE SHARED PUBLIC QUERY ─────────────────────────
 *
 * `listPublicProducts` is the single implementation every public browse
 * surface uses. Re-implementing it is precisely Root Cause #59 — a fix applied
 * to one route and never back-ported to the view that duplicated it.
 *
 * ── 🛑 NO MONEY ON THE PAGE ───────────────────────────────────────────────
 *
 * Prices are gated for signed-out visitors, so an amount here would need
 * `<GatedPrice>` and make this a client component. Rows carry a title, a
 * condition and a link; the price lives on the listing. No `offers.price` is
 * emitted, so no paywall declaration is needed either.
 */
type Props = { params: Promise<{ slug: string }> };

const LISTINGS_PAGE_SIZE = 6;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Wrapped in React.cache, so this is the SAME read the page body does.
  const bey = await getBeyBySlug(slug);
  if (!bey) return {};
  return _gm({
    title: `${bey.name}${bey.type ? ` — ${bey.type} type` : ""} — LetItRip`,
    description:
      bey.seoDescription ??
      `${bey.name} is a Beyblade${bey.system ? ` from the ${bey.system}` : ""}. See what it is built from and what is currently listed.`,
    path: `/beys/${slug}`,
  });
}

export default async function BeyDetailPage({ params }: Props) {
  const { slug } = await params;

  const bey = await getBeyBySlug(slug);
  if (!bey) notFound();

  /*
   * Two reads in parallel, both guarded. Neither needs a composite index:
   * the products read is one `array-contains`, and the listings read is one
   * bounded `listPublicProducts` call.
   */
  const [products, listingsResult] = await Promise.all([
    safeRead(() => getProductsContainingBey(bey.id), {
      route: "/beys/[slug]",
      key: "beys.products",
      fallback: [],
    }),
    safeRead(
      () =>
        listPublicProducts({
          q: bey.name,
          availability: AVAILABILITY_VALUES.AVAILABLE,
          listingTypes: GENERIC_PRODUCT_LISTING_TYPES,
          page: 1,
          pageSize: LISTINGS_PAGE_SIZE,
        }),
      { route: "/beys/[slug]", key: "beys.listings", fallback: null },
    ),
  ]);

  const listings: BeyListingRow[] = (listingsResult?.items ?? []).map((row) => {
    const rowSlug = typeof row.slug === "string" ? row.slug : String(row.id ?? "");
    return {
      id: String(row.id ?? rowSlug),
      title: typeof row.title === "string" ? row.title : rowSlug,
      slug: rowSlug,
      condition: typeof row.condition === "string" ? row.condition : undefined,
      href: String(ROUTES.PUBLIC.PRODUCT_DETAIL(rowSlug)),
    };
  });

  /*
   * A part's page needs its CLASSIFICATION segment, and a glossary id is
   * `${slot}--${tail}` — so the slot is recovered from the id rather than
   * refetched. 🛑 `PART_SLOT_CATEGORY` is keyed on the slot, and
   * `partSlotFromSegment` is its inverse; using the raw slot as the URL
   * segment would 404 wherever the two spellings differ.
   */
  const hrefForPart = (partId: string): string | null => {
    const slot = partId.split("--")[0];
    const code = partId.slice(slot.length + 2);
    if (!slot || !code) return null;
    /* Round-trip the slot through the segment map; an unknown slot gets no
     * link rather than a guessed one. */
    const segment = Object.keys(PART_SLOT_CATEGORY).includes(slot) ? slot : null;
    if (!segment || !partSlotFromSegment(segment)) return null;
    return String(ROUTES.PUBLIC.PART_DETAIL(segment, code));
  };

  /*
   * 🛑 NO `/beys` CRUMB — there is no `/beys` index page, and a breadcrumb to a
   * route that does not exist is a dead link in markup a crawler follows.
   * `audit-nav-page-wiring` is strict-zero on exactly this shape for nav, and
   * the reasoning does not change because this is JSON-LD instead.
   *
   * The real parent of a bey is its category leaf, which is also where its
   * listings are, so the trail goes through that when one exists. A bey with no
   * leaf gets Home -> itself, which is honest rather than invented.
   */
  const ldBreadcrumb = breadcrumbJsonLd(
    withTrailHead(
      [{ name: bey.name, url: `/beys/${slug}` }],
      [
        { name: "Home", url: "/" },
        { name: "Categories", url: "/categories" },
      ],
    ),
  );

  return (
    <>
      <PageViewTracker entityType="product" entityId={bey.id} url={`/beys/${slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }}
      />
      <BeyDetailPageView
        bey={bey}
        products={products}
        listings={listings}
        listingsTruncated={listingsResult?.truncated === true}
        allListingsHref={`${String(ROUTES.PUBLIC.PRODUCTS)}?q=${encodeURIComponent(bey.name)}`}
        hrefForPart={hrefForPart}
        /*
         * The paired category leaf, which is where the COMMERCE lives.
         *
         * 🛑 READ FROM `bey.categoryId`, never derived here. The leaf id comes
         * from the bey's NAME with the trailing parenthetical stripped, so
         * `category-${slug}` is wrong for every vendor-qualified bey
         * (`…-press-hasbro` pairs with `category-…-press`). The generator
         * resolves it with the leaf generator's own helper and VERIFIES it
         * against the leaves actually emitted — 1,880 of 1,988 — so a bey
         * without one gets no link rather than a 404.
         */
        categoryHref={
          bey.categoryId ? String(ROUTES.PUBLIC.CATEGORY_DETAIL(bey.categoryId)) : null
        }
      />
    </>
  );
}

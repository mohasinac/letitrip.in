import type { Metadata } from "next";
import { auctionJsonLd, breadcrumbJsonLd } from "@mohasinac/appkit/seo/json-ld";
import { AuctionDetailPageView, getAuctionForDetail, getProductFeaturesForAuction } from "@mohasinac/appkit";
import { productImageUrls } from "@mohasinac/appkit";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { placeBidAction, buyNowAction } from "@/actions/bid.actions";
import { generateAuctionMetadata } from "@/constants/seo.server";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const auction = await getAuctionForDetail(id);
  if (!auction) return { title: "Auction Not Found" };
  return generateAuctionMetadata({
    title: auction.title,
    description: auction.description ?? "",
    slug: auction.slug ?? id,
    mainImage: auction.mainImage || auction.images?.[0]?.url,
    auctionEndDate: auction.auctionEndDate instanceof Date
      ? auction.auctionEndDate
      : auction.auctionEndDate
        ? new Date(auction.auctionEndDate as unknown as string)
        : undefined,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  // getAuctionForDetail is React.cache() — this reuses the generateMetadata read.
  const auction = await getAuctionForDetail(id);
  // A record that does not exist must render the 404 view - that is what gets it
  // marked noindex. The HTTP STATUS stays 200, and that is Next's documented
  // behaviour rather than a bug: the response is streamed, so headers are already
  // sent by the time notFound() runs and the status can no longer change. Next
  // injects <meta name="robots" content="noindex"> into the streamed HTML
  // instead, and that is what actually keeps the URL out of the index.
  // Before this, the page rendered its OWN "not found" body with no noindex at
  // all - a genuine soft 404 that stayed indexable forever.
  if (!auction) notFound();
  const productFeatures = await getProductFeaturesForAuction(auction?.storeId ?? null);

  const ldAuction = auction
    ? auctionJsonLd({
        id: auction.id,
        title: auction.title,
        description: auction.description ?? "",
        slug: auction.slug ?? id,
        price: auction.currentBid ?? auction.price,
        currency: auction.currency ?? "INR",
        mainImage: auction.mainImage,
        images: productImageUrls(auction.images),
        listingType: "auction",
        auctionEndDate: auction.auctionEndDate instanceof Date
          ? auction.auctionEndDate
          : auction.auctionEndDate
            ? new Date(auction.auctionEndDate as unknown as string)
            : undefined,
      })
    : null;

  const ldBreadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Auctions", url: "/auctions" },
    { name: auction?.title ?? "Auction", url: `/auctions/${id}` },
  ]);

  return (
    <>
      <PageViewTracker entityType="auction" entityId={id} url={`/auctions/${id}`} />
      {ldAuction && (
        /*
         * The paired `gatedPriceWebPageJsonLd` node was dropped on 2026-10-20
         * with `GUEST_PRICE_GATE_ENABLED` (appkit useCanSeePrices.ts). It
         * declared `isAccessibleForFree: false` over the current bid; the bid
         * now renders for signed-out visitors, so the declaration would be a
         * false one — the same crawler/page mismatch it was added to prevent,
         * pointed the other way. Restore both together or neither.
         */
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldAuction) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }}
      />
      <AuctionDetailPageView
        id={id}
        initialAuction={auction}
        productFeatures={productFeatures}
        onPlaceBid={placeBidAction}
        // Bind the resolved document id, matching what the bid path already
        // passes (`String(product.id)`). `id` here is the raw URL segment,
        // which for auctions is a slug.
        onBuyNow={buyNowAction.bind(null, String(auction?.id ?? id))}
      />
    </>
  );
}

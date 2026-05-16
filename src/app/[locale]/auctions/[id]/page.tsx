import type { Metadata } from "next";
import {
  AuctionDetailPageView,
  getAuctionForDetail,
  getProductFeaturesForAuction,
  auctionJsonLd,
  breadcrumbJsonLd,
} from "@mohasinac/appkit";
import { placeBidAction } from "@/actions/bid.actions";
import { generateAuctionMetadata } from "@/constants";

export const revalidate = 30;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const auction = await getAuctionForDetail(id);
  if (!auction) return { title: "Auction Not Found" };
  return generateAuctionMetadata({
    title: auction.title,
    description: auction.description ?? "",
    slug: auction.slug ?? id,
    mainImage: auction.mainImage || auction.images?.[0],
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
        images: auction.images,
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
      {ldAuction && (
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
      />
    </>
  );
}

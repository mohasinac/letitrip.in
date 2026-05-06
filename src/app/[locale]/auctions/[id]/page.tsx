import type { Metadata } from "next";
import { AuctionDetailPageView, getProductById } from "@mohasinac/appkit";
import { placeBidAction } from "@/actions/bid.actions";
import { generateAuctionMetadata } from "@/constants/seo.server";

export const revalidate = 30;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const auction = await getProductById(id).catch(() => null);
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
  return <AuctionDetailPageView id={id} onPlaceBid={placeBidAction} />;
}

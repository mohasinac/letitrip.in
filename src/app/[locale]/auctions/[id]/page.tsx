import { AuctionDetailPageView } from "@mohasinac/appkit";
import type { Metadata } from "next";

export const revalidate = 30;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const title = id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { title: `Auction: ${title}` };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <AuctionDetailPageView id={id} />;
}

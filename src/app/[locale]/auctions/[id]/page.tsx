/**
 * Auction Detail Page
 * Route: /auctions/[id]
 *
 * Thin orchestration layer — all logic lives in AuctionDetailView.
 */

import { use } from "react";
import { AuctionDetailView } from "@/features/products";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AuctionDetailPage({ params }: Props) {
  const { id } = use(params);
  return <AuctionDetailView id={id} />;
}

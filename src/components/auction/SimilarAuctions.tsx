"use client";

import AuctionCard from "@/components/cards/AuctionCard";
import {
  SimilarAuctions as LibSimilarAuctions,
  type SimilarAuctionsProps as LibSimilarAuctionsProps,
} from "@letitrip/react-library";

export type SimilarAuctionsProps = Omit<
  LibSimilarAuctionsProps,
  "AuctionCardComponent"
>;

export function SimilarAuctions(props: SimilarAuctionsProps) {
  return <LibSimilarAuctions {...props} AuctionCardComponent={AuctionCard} />;
}

export default SimilarAuctions;

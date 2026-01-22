"use client";

import { AuctionCard, ClientLink } from "@mohasinac/react-library";
import Image from "next/image";

interface SimilarAuctionsProps {
  auctions: any[];
}

export function SimilarAuctions({ auctions }: SimilarAuctionsProps) {
  if (auctions.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Similar Auctions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {auctions.slice(0, 4).map((similarAuction: any) => (
          <AuctionCard
            key={similarAuction.id}
            auction={{
              id: similarAuction.id,
              name: similarAuction.title,
              slug: similarAuction.slug,
              images: similarAuction.images || [],
              currentBid: similarAuction.currentBid,
              startingBid: similarAuction.startingBid,
              bidCount: similarAuction.bidCount || 0,
              endTime: similarAuction.endTime,
              featured: similarAuction.featured,
              status: similarAuction.status,
              shop: similarAuction.shopName
                ? {
                    id: similarAuction.shopId || "",
                    name: similarAuction.shopName,
                  }
                : undefined,
            }}
            variant="compact"
            LinkComponent={ClientLink}
            ImageComponent={Image}
          />
        ))}
      </div>
    </section>
  );
}

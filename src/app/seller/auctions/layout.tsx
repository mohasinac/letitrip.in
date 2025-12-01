"use client";

import { TabNav } from "@/components/navigation/TabNav";
import { SELLER_AUCTIONS_TABS } from "@/constants/tabs";

export default function SellerAuctionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Auctions Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Auction Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Create and manage your auction listings.
        </p>
      </div>

      {/* Tab Navigation */}
      <TabNav tabs={SELLER_AUCTIONS_TABS} />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}

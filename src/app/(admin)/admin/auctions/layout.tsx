"use client";

import { TabNav } from "@/components/navigation/TabNav";
import { ADMIN_AUCTIONS_TABS } from "@/constants/tabs";

export default function AdminAuctionsLayout({
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
          Manage all auctions, live bidding, and moderation queue.
        </p>
      </div>

      {/* Tab Navigation */}
      <TabNav tabs={ADMIN_AUCTIONS_TABS} />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}

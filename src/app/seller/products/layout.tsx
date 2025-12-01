"use client";

import { TabNav } from "@/components/navigation/TabNav";
import { SELLER_PRODUCTS_TABS } from "@/constants/tabs";

export default function SellerProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Products Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Product Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your product listings and inventory.
        </p>
      </div>

      {/* Tab Navigation */}
      <TabNav tabs={SELLER_PRODUCTS_TABS} />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}

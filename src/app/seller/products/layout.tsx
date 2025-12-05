/**
 * @fileoverview React Component
 * @module src/app/seller/products/layout
 * @description This file contains the layout component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { TabNav } from "@/components/navigation/TabNav";
import { SELLER_PRODUCTS_TABS } from "@/constants/tabs";

export default /**
 * SellerProductsLayout component
 *
 * @param {{
  
  children: React.ReactNode;
}} {
  children,
} - The {
  children,
}
 *
 * @returns {any} The sellerproductslayout result
 *
 */
function SellerProductsLayout({
  children,
}: {
  /** Children */
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

/**
 * @fileoverview React Component
 * @module src/app/admin/shops/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { shopsService } from "@/services/shops.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Store, CheckCircle, XCircle } from "lucide-react";
import { getShopBulkActions } from "@/constants/bulk-actions";
import { SHOP_FIELDS, toInlineFields } from "@/constants/form-fields";
import type { ShopCardFE } from "@/types/frontend/shop.types";

export default /**
 * Performs admin shops page operation
 *
 * @returns {any} The adminshopspage result
 *
 */
function AdminShopsPage() {
  // Define columns
  /**
 * Performs columns operation
 *
 * @param {ShopCardFE} shop - The shop
 *
 * @returns {any} The columns result
 *
 */
const columns = [
    {
      /** Key */
      key: "shop",
      /** Label */
      label: "Shop",
      /** Render */
      render: (shop: ShopCardFE) => (
        <div className="flex items-center gap-3">
          {shop.logo ? (
            <OptimizedImage
              src={shop.logo}
              alt={shop.name}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {shop.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {shop.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      /** Key */
      key: "owner",
      /** Label */
      label: "Owner",
      /** Render */
      render: (shop: ShopCardFE) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {shop.ownerId || "Unknown"}
        </div>
      ),
    },
    {
      /** Key */
      key: "verification",
      /** Label */
      label: "Verified",
      /** Render */
      render: (shop: ShopCardFE) =>
        shop.isVerified ? (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Verified</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Not verified</span>
          </div>
        ),
    },
    {
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Render */
      render: (shop: ShopCardFE) => (
        <StatusBadge status={shop.featured ? "active" : "inactive"} />
      ),
    },
    {
      /** Key */
      key: "products",
      /** Label */
      label: "Products",
      /** Render */
      render: (shop: ShopCardFE) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {shop.productCount || 0}
        </div>
      ),
    },
    {
      /** Key */
      key: "rating",
      /** Label */
      label: "Rating",
      /** Render */
      render: (shop: ShopCardFE) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {shop.rating ? `⭐ ${shop.rating.toFixed(1)}` : "No rating"}
        </div>
      ),
    },
    {
      /** Key */
      key: "created",
      /** Label */
      label: "Created",
      /** Render */
      render: (shop: ShopCardFE) => (
        <DateDisplay date={shop.createdAt} format="medium" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      /** Key */
      key: "isVerified",
      /** Label */
      label: "Verification",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All" },
        { value: "true", label: "Verified" },
        { value: "false", label: "Not Verified" },
      ],
    },
    {
      /** Key */
      key: "isActive",
      /** Label */
      label: "Status",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Status" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  // Load data function
  /**
   * Performs async operation
   *
   * @param {{
    cursor} [options] - Configuration options
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadData = async (options: {
    /** Cursor */
    cursor: string | null;
    /** Search */
    search?: string;
    /** Filters */
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      /** Page */
      page: options.cursor ? parseInt(options.cursor) : 1,
      /** Limit */
      limit: 20,
    };

    if (options.filters?.isVerified && options.filters.isVerified !== "all") {
      apiFilters.isVerified = options.filters.isVerified === "true";
    }
    if (options.filters?.isActive && options.filters.isActive !== "all") {
      apiFilters.isActive = options.filters.isActive === "true";
    }
    if (options.search) {
      apiFilters.search = options.search;
    }

    const response = await shopsService.list(apiFilters);
    const currentPage = apiFilters.page;
    const totalPages = Math.ceil((response.count || 0) / 20);

    return {
      /** Items */
      items: (response.data || []) as ShopCardFE[],
      /** Next Cursor */
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      /** Has Next Page */
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<ShopCardFE>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<ShopCardFE>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSave = async (id: string, data: Partial<ShopCardFE>) => {
    await shopsService.update(id, data as any);
  };

  // Handle delete
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleDelete = async (id: string) => {
    await shopsService.delete(id);
  };

  return (
    <AdminResourcePage<ShopCardFE>
      resourceName="Shop"
      resourceNamePlural="Shops"
      loadData={loadData}
      columns={columns}
      fields={toInlineFields(SHOP_FIELDS)}
      bulkActions={getShopBulkActions(0)}
      onSave={handleSave}
      onDelete={handleDelete}
      filters={filters}
    />
  );
}

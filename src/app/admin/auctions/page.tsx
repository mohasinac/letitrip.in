/**
 * @fileoverview React Component
 * @module src/app/admin/auctions/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { auctionsService } from "@/services/auctions.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { Price } from "@/components/common/values/Price";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Gavel, Clock, TrendingUp } from "lucide-react";
import { AuctionStatus } from "@/types/shared/common.types";
import { getAuctionBulkActions } from "@/constants/bulk-actions";
import { AUCTION_FIELDS, toInlineFields } from "@/constants/form-fields";
import type { AuctionCardFE } from "@/types/frontend/auction.types";

export default /**
 * Performs admin auctions page operation
 *
 * @returns {any} The adminauctionspage result
 *
 */
function AdminAuctionsPage() {
  // Define columns
  /**
 * Performs columns operation
 *
 * @param {AuctionCardFE} auction - The auction
 *
 * @returns {any} The columns result
 *
 */
const columns = [
    {
      /** Key */
      key: "auction",
      /** Label */
      label: "Auction",
      /** Render */
      render: (auction: AuctionCardFE) => (
        <div className="flex items-center gap-3">
          {auction.images && auction.images[0] ? (
            <OptimizedImage
              src={auction.images[0]}
              alt={auction.productName}
              width={60}
              height={60}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-[60px] h-[60px] rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Gavel className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {auction.productName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {auction.productSlug}
            </div>
          </div>
        </div>
      ),
    },
    {
      /** Key */
      key: "currentBid",
      /** Label */
      label: "Current Bid",
      /** Render */
      render: (auction: AuctionCardFE) => (
        <div>
          <Price amount={auction.currentPrice || 0} />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {auction.totalBids || 0} bids
          </div>
        </div>
      ),
    },
    {
      /** Key */
      key: "timing",
      /** Label */
      label: "Timing",
      /** Render */
      render: (auction: AuctionCardFE) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              <DateDisplay date={auction.startTime} format="short" />
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            /** Ends */
            Ends: <DateDisplay date={auction.endTime} format="short" />
          </div>
        </div>
      ),
    },
    {
      /** Key */
      key: "product",
      /** Label */
      label: "Product Slug",
      /** Render */
      render: (auction: AuctionCardFE) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {auction.productSlug}
        </div>
      ),
    },
    {
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Render */
      render: (auction: AuctionCardFE) => {
        const statusMap: Record<string, string> = {
          [AuctionStatus.SCHEDULED]: "scheduled",
          [AuctionStatus.ACTIVE]: "active",
          [AuctionStatus.ENDED]: "completed",
          [AuctionStatus.CANCELLED]: "cancelled",
        };
        const status = statusMap[auction.status] || "pending";
        return <StatusBadge status={status} />;
      },
    },
    {
      /** Key */
      key: "created",
      /** Label */
      label: "Created",
      /** Render */
      render: (auction: AuctionCardFE) => (
        <DateDisplay date={auction.startTime} format="medium" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Status" },
        { value: AuctionStatus.SCHEDULED, label: "Scheduled" },
        { value: AuctionStatus.ACTIVE, label: "Live" },
        { value: AuctionStatus.ENDED, label: "Ended" },
        { value: AuctionStatus.CANCELLED, label: "Cancelled" },
      ],
    },
    {
      /** Key */
      key: "minBid",
      /** Label */
      label: "Min Current Bid",
      /** Type */
      type: "text" as const,
    },
    {
      /** Key */
      key: "maxBid",
      /** Label */
      label: "Max Current Bid",
      /** Type */
      type: "text" as const,
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

    if (options.filters?.status && options.filters.status !== "all") {
      apiFilters.status = options.filters.status;
    }
    if (options.filters?.minBid) {
      apiFilters.minBid = parseFloat(options.filters.minBid);
    }
    if (options.filters?.maxBid) {
      apiFilters.maxBid = parseFloat(options.filters.maxBid);
    }
    if (options.search) {
      apiFilters.search = options.search;
    }

    const response = await auctionsService.list(apiFilters);
    const currentPage = apiFilters.page;
    const totalPages = Math.ceil((response.count || 0) / 20);

    return {
      /** Items */
      items: (response.data || []) as AuctionCardFE[],
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
   * @param {Partial<AuctionCardFE>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<AuctionCardFE>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSave = async (id: string, data: Partial<AuctionCardFE>) => {
    await auctionsService.update(id, data as any);
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
    await auctionsService.delete(id);
  };

  return (
    <AdminResourcePage<AuctionCardFE>
      resourceName="Auction"
      resourceNamePlural="Auctions"
      loadData={loadData}
      columns={columns}
      fields={toInlineFields(AUCTION_FIELDS)}
      bulkActions={getAuctionBulkActions(0)}
      onSave={handleSave}
      onDelete={handleDelete}
      filters={filters}
    />
  );
}

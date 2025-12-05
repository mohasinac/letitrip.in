/**
 * @fileoverview React Component
 * @module src/app/seller/auctions/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import OptimizedImage from "@/components/common/OptimizedImage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { Price } from "@/components/common/values/Price";
import { SellerResourcePage } from "@/components/seller/SellerResourcePage";
import { auctionsService } from "@/services/auctions.service";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import { formatDistanceToNow } from "date-fns";
import { Clock, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";

/**
 * Performs seller auctions page operation
 *
 * @returns {void} Function return value
 *
 * @example
 * const result = SellerAuctionsPage();
 */
export default function SellerAuctionsPage() {
  return (
    <SellerResourcePage<AuctionCardFE>
      resourceName="Auction"
      resourceNamePlural="Auctions"
      loadData={async (options) => {
        const response = await auctionsService.list({
          /** Search */
          search: options.search,
          ...options.filters,
          /** Page */
          page: 1,
          /** Limit */
          limit: 50,
        });
        return {
          /** Items */
          items: response.data || [],
          /** Next Cursor */
          nextCursor: null,
          /** Has Next Page */
          hasNextPage: false,
        };
      }}
      columns={[
        {
          /** Key */
          key: "productImage",
          /** Label */
          label: "Image",
          /** Width */
          width: "80px",
          /** Render */
          render: (auction) => (
            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
              {auction.productImage ? (
                <OptimizedImage
                  src={auction.productImage}
                  alt={auction.productName}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              )}
            </div>
          ),
        },
        {
          /** Key */
          key: "productName",
          /** Label */
          label: "Auction",
          /** Sortable */
          sortable: true,
          /** Render */
          render: (auction) => (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {auction.productName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                /** I D */
                ID: {auction.id.substring(0, 8)}
              </div>
            </div>
          ),
        },
        {
          /** Key */
          key: "currentPrice",
          /** Label */
          label: "Current Bid",
          /** Sortable */
          sortable: true,
          /** Render */
          render: (auction) => (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                <Price
                  amount={auction.currentPrice || auction.startingBid || 0}
                />
              </div>
              {auction.startingBid && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  /** Start */
                  Start: <Price amount={auction.startingBid} />
                </div>
              )}
            </div>
          ),
        },
        {
          /** Key */
          key: "bidCount",
          /** Label */
          label: "Bids",
          /** Render */
          render: (auction) => (
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {auction.bidCount || 0}
            </span>
          ),
        },
        {
          /** Key */
          key: "endTime",
          /** Label */
          label: "Ends",
          /** Render */
          render: (auction) => (
            <div>
              <div className="text-sm text-gray-900 dark:text-white">
                <DateDisplay date={auction.endTime} format="medium" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(auction.endTime), {
                  /** Add Suffix */
                  addSuffix: true,
                })}
              </div>
            </div>
          ),
        },
        {
          /** Key */
          key: "status",
          /** Label */
          label: "Status",
          /** Render */
          render: (auction) => <StatusBadge status={auction.status} />,
        },
        {
          /** Key */
          key: "actions",
          /** Label */
          label: "Actions",
          /** Render */
          render: (auction) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/auctions/${auction.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                href={`/seller/auctions/${auction.id}/edit`}
                className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                title="Edit"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          ),
        },
      ]}
      fields={[
        {
          /** Name */
          name: "productName",
          /** Label */
          label: "Product Name",
          /** Type */
          type: "text",
          /** Required */
          required: true,
        },
        {
          /** Name */
          name: "startingPrice",
          /** Label */
          label: "Starting Price",
          /** Type */
          type: "number",
          /** Required */
          required: true,
        },
        {
          /** Name */
          name: "reservePrice",
          /** Label */
          label: "Reserve Price",
          /** Type */
          type: "number",
        },
        {
          /** Name */
          name: "endTime",
          /** Label */
          label: "End Time",
          /** Type */
          type: "date",
          /** Required */
          required: true,
        },
        {
          /** Name */
          name: "status",
          /** Label */
          label: "Status",
          /** Type */
          type: "select",
          /** Required */
          required: true,
        },
      ]}
      bulkActions={[]}
      onSave={async (id: string, data: any) => {
        if (id) {
          await auctionsService.quickUpdate(id, data);
        } else {
          await auctionsService.quickCreate(data);
        }
      }}
      onDelete={async (id: string) => {
        await auctionsService.delete(id);
      }}
      renderMobileCard={(auction) => (
        <div className="p-4">
          <div className="flex gap-3">
            <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
              {auction.productImage ? (
                <OptimizedImage
                  src={auction.productImage}
                  alt={auction.productName}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {auction.productName}
                </h3>
                <StatusBadge status={auction.status} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    <Price
                      amount={auction.currentPrice || auction.startingBid || 0}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {auction.bidCount || 0} bids
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(auction.endTime), {
                      /** Add Suffix */
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/seller/auctions/${auction.id}/edit`}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Edit
            </Link>
            <Link
              href={`/auctions/${auction.id}`}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              View
            </Link>
          </div>
        </div>
      )}
      renderGridCard={(auction) => (
        <div className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
            <OptimizedImage
              src={auction.productImage || "/placeholder-product.jpg"}
              alt={auction.productName}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                {auction.productName}
              </h3>
              <StatusBadge status={auction.status} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  <Price amount={auction.currentPrice} />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {auction.bidCount || 0} bids
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(auction.endTime), {
                    /** Add Suffix */
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/seller/auctions/${auction.id}/edit`}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Edit
              </Link>
              <Link
                href={`/auctions/${auction.id}`}
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      )}
    />
  );
}

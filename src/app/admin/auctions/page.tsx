"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { auctionsService } from "@/services/auctions.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values";
import { Price } from "@/components/common/values/Price";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Gavel, Clock, TrendingUp } from "lucide-react";
import { AuctionStatus } from "@/types/shared/common.types";
import { getAuctionBulkActions } from "@/constants/bulk-actions";
import { AUCTION_FIELDS, toInlineFields } from "@/constants/form-fields";
import type { AuctionCardFE } from "@/types/frontend/auction.types";

export default function AdminAuctionsPage() {
  // Define columns
  const columns = [
    {
      key: "auction",
      label: "Auction",
      render: (auction: AuctionCardFE) => (
        <div className="flex items-center gap-3">
          {auction.images && auction.images[0] ? (
            <OptimizedImage
              src={auction.images[0]}
              alt={auction.title}
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
              {auction.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {auction.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "currentBid",
      label: "Current Bid",
      render: (auction: AuctionCardFE) => (
        <div>
          <Price amount={auction.currentBid || auction.startingBid} />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {auction.totalBids || 0} bids
          </div>
        </div>
      ),
    },
    {
      key: "timing",
      label: "Timing",
      render: (auction: AuctionCardFE) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              <DateDisplay date={new Date(auction.startTime)} format="short" />
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Ends:{" "}
            <DateDisplay date={new Date(auction.endTime)} format="short" />
          </div>
        </div>
      ),
    },
    {
      key: "seller",
      label: "Seller",
      render: (auction: AuctionCardFE) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {auction.seller?.name || "Unknown"}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {auction.shop?.name || "No shop"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (auction: AuctionCardFE) => {
        const statusMap: Record<string, { status: string; label: string }> = {
          [AuctionStatus.SCHEDULED]: {
            status: "scheduled",
            label: "Scheduled",
          },
          [AuctionStatus.LIVE]: { status: "active", label: "Live" },
          [AuctionStatus.ENDED]: { status: "completed", label: "Ended" },
          [AuctionStatus.CANCELLED]: {
            status: "cancelled",
            label: "Cancelled",
          },
        };
        const statusInfo = statusMap[auction.status] || {
          status: "pending",
          label: auction.status,
        };
        return (
          <StatusBadge status={statusInfo.status} label={statusInfo.label} />
        );
      },
    },
    {
      key: "created",
      label: "Created",
      render: (auction: AuctionCardFE) => (
        <DateDisplay date={new Date(auction.createdAt)} format="relative" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: AuctionStatus.SCHEDULED, label: "Scheduled" },
        { value: AuctionStatus.LIVE, label: "Live" },
        { value: AuctionStatus.ENDED, label: "Ended" },
        { value: AuctionStatus.CANCELLED, label: "Cancelled" },
      ],
    },
    {
      key: "minBid",
      label: "Min Current Bid",
      type: "text" as const,
    },
    {
      key: "maxBid",
      label: "Max Current Bid",
      type: "text" as const,
    },
  ];

  // Load data function
  const loadData = async (options: {
    cursor: string | null;
    search?: string;
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      page: options.cursor ? parseInt(options.cursor) : 1,
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
      items: (response.data || []) as AuctionCardFE[],
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  const handleSave = async (id: string, data: Partial<AuctionCardFE>) => {
    await auctionsService.update(id, data);
  };

  // Handle delete
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

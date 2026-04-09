"use client";

import { useCallback, useMemo, useState } from "react";
import { Gavel } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUrlTable, useAuth, useMessage } from "@/hooks";
import {
  AuctionGrid,
  Button,
  EmptyState,
  ListingLayout,
  Search,
  SortDropdown,
  Spinner,
  TablePagination,
  ViewToggle,
} from "@/components";
import type { ViewMode } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { addToWishlistAction } from "@/actions";
import { useStoreAuctions } from "../hooks";

const { flex } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

const AUCTION_SORT_VALUES = {
  ENDING_SOON: "auctionEndDate",
  NEWEST: "-createdAt",
  OLDEST: "createdAt",
  PRICE_LOW: "currentBid",
  PRICE_HIGH: "-currentBid",
} as const;

interface StoreAuctionsViewProps {
  storeSlug: string;
}

export function StoreAuctionsView({ storeSlug }: StoreAuctionsViewProps) {
  const t = useTranslations("storePage");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: AUCTION_SORT_VALUES.NEWEST },
  });

  const sortParam = table.get("sort") || AUCTION_SORT_VALUES.NEWEST;
  const viewMode = (table.get("view") || "card") as ViewMode;
  const pageParam = table.getNumber("page", 1);

  const sortOptions = useMemo(
    () => [
      { value: AUCTION_SORT_VALUES.NEWEST, label: t("auctions.sortNewest") },
      {
        value: AUCTION_SORT_VALUES.ENDING_SOON,
        label: t("auctions.sortEndingSoon"),
      },
      {
        value: AUCTION_SORT_VALUES.PRICE_LOW,
        label: t("auctions.sortPriceLow"),
      },
      {
        value: AUCTION_SORT_VALUES.PRICE_HIGH,
        label: t("auctions.sortPriceHigh"),
      },
    ],
    [t],
  );

  const apiParams = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("page", String(pageParam));
    sp.set("pageSize", String(PAGE_SIZE));
    sp.set("sorts", sortParam);
    const q = table.get("q");
    if (q) sp.set("q", q);
    return sp.toString();
  }, [pageParam, sortParam, table]);

  const {
    auctions: items,
    total,
    isLoading,
    error,
  } = useStoreAuctions(storeSlug, apiParams);

  const pageSize = table.getNumber("pageSize", PAGE_SIZE);
  const totalPages = Math.ceil(total / pageSize) || 1;

  const handleBulkAddToWishlist = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => addToWishlistAction(id)),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(
        tActions("bulkPartialSuccess", {
          success: succeeded,
          total: selectedIds.length,
        }),
      );
    } else {
      showError(tActions("bulkFailed"));
    }
    setSelectedIds([]);
  }, [selectedIds, showSuccess, showError, tActions]);

  return (
    <ListingLayout
      viewToggleSlot={
        <ViewToggle value={viewMode} onChange={(m) => table.set("view", m)} />
      }
      searchSlot={
        <Search
          value={table.get("q")}
          onChange={(v) => table.set("q", v)}
          placeholder={t("auctions.searchPlaceholder")}
          onClear={() => table.set("q", "")}
        />
      }
      sortSlot={
        <SortDropdown
          value={sortParam}
          onChange={(v) => table.set("sort", v)}
          options={sortOptions}
        />
      }
      toolbarPaginationSlot={
        totalPages > 1 ? (
          <TablePagination
            total={total}
            currentPage={pageParam}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={table.setPage}
            compact
          />
        ) : undefined
      }
      selectedCount={selectedIds.length}
      onClearSelection={() => setSelectedIds([])}
      bulkActionItems={
        user
          ? [
              {
                id: "bulk-wishlist",
                label: tActions("bulkAddToWishlist", {
                  count: selectedIds.length,
                }),
                variant: "primary",
                onClick: handleBulkAddToWishlist,
              },
            ]
          : undefined
      }
    >
      {isLoading && (
        <div className={`${flex.hCenter} ${THEME_CONSTANTS.page.empty}`}>
          <Spinner />
        </div>
      )}
      {!!error && !isLoading && (
        <EmptyState
          title={t("error.title")}
          description={t("error.description")}
        />
      )}
      {!isLoading && !error && items.length === 0 && (
        <EmptyState
          icon={<Gavel className="w-16 h-16" />}
          title={t("auctions.empty.title")}
          description={t("auctions.empty.description")}
        />
      )}
      {!isLoading && !error && items.length > 0 && (
        <AuctionGrid
          auctions={
            items as unknown as Parameters<typeof AuctionGrid>[0]["auctions"]
          }
          variant={viewMode}
          selectable={!!user}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}
    </ListingLayout>
  );
}

"use client";

import { useMemo } from "react";
import { Gavel } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUrlTable } from "@/hooks";
import {
  AuctionGrid,
  EmptyState,
  ListingLayout,
  Search,
  SortDropdown,
  Spinner,
  TablePagination,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
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

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: AUCTION_SORT_VALUES.NEWEST },
  });

  const sortParam = table.get("sort") || AUCTION_SORT_VALUES.NEWEST;
  const pageParam = table.getNumber("page", 1);

  const sortOptions = useMemo(
    () => [
      { value: AUCTION_SORT_VALUES.NEWEST, label: t("auctions.sortNewest") },
      { value: AUCTION_SORT_VALUES.ENDING_SOON, label: t("auctions.sortEndingSoon") },
      { value: AUCTION_SORT_VALUES.PRICE_LOW, label: t("auctions.sortPriceLow") },
      { value: AUCTION_SORT_VALUES.PRICE_HIGH, label: t("auctions.sortPriceHigh") },
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

  const { data, isLoading, error } = useStoreAuctions(storeSlug, apiParams);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageSize = table.getNumber("pageSize", PAGE_SIZE);
  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <ListingLayout
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
      paginationSlot={
        totalPages > 1 ? (
          <TablePagination
            total={total}
            currentPage={pageParam}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={table.setPage}
            onPageSizeChange={(n) => table.set("pageSize", String(n))}
            pageSizeOptions={[12, 24, 48]}
          />
        ) : undefined
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
        <AuctionGrid auctions={items} />
      )}
    </ListingLayout>
  );
}

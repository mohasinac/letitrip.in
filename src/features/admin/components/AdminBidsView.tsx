"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useUrlTable, usePendingTable } from "@/hooks";
import { useAdminBids } from "@/features/admin/hooks";
import { ROUTES, ERROR_MESSAGES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import {
  Card,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  TablePagination,
  Text,
  Caption,
  Span,
  StatusBadge,
  ListingLayout,
  Search,
  BidFilters,
} from "@/components";
import { useBidTableColumns } from ".";
import { formatCurrency, formatDate } from "@/utils";
import type { BidDocument } from "@/db/schema";

interface Props {
  action?: string[];
}

export function AdminBidsView({ action }: Props) {
  const router = useRouter();
  const t = useTranslations("adminBids");
  const tTable = useTranslations("table");

  const table = useUrlTable({ defaults: { pageSize: "25", sort: "-bidDate" } });
  const statusFilter = table.get("status");

  const STATUS_TABS = [
    { key: "", label: t("filterAll") },
    { key: "active", label: t("filterActive") },
    { key: "won", label: t("filterWon") },
    { key: "outbid", label: t("filterOutbid") },
    { key: "cancelled", label: t("filterCancelled") },
  ];

  const [selectedBid, setSelectedBid] = useState<BidDocument | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const searchTerm = table.get("q");
  const minAmount = table.get("minAmount");
  const maxAmount = table.get("maxAmount");

  // ── Pending filter state (staged until Apply is clicked) ─────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["status", "isWinning", "minAmount", "maxAmount"]);

  const filtersArr: string[] = [];
  if (statusFilter) filtersArr.push(`status==${statusFilter}`);
  if (minAmount) filtersArr.push(`bidAmount>=${minAmount}`);
  if (maxAmount) filtersArr.push(`bidAmount<=${maxAmount}`);
  if (searchTerm) filtersArr.push(`productTitle@=*${searchTerm}`);

  const { data, isLoading, error } = useAdminBids(
    table.buildSieveParams(filtersArr.join(",")),
  );

  const bids = data?.bids || [];

  const handleView = useCallback(
    (bid: BidDocument) => {
      setSelectedBid(bid);
      setIsDrawerOpen(true);
      if (bid.id && action?.[0] !== "view") {
        router.push(`${ROUTES.ADMIN.BIDS}/view/${bid.id}`, { scroll: false });
      }
    },
    [action, router],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedBid(null);
    router.push(ROUTES.ADMIN.BIDS, { scroll: false });
  }, [router]);

  // Summary stats
  const totalBids = data?.meta.total ?? 0;
  const activeBids = bids.filter((b) => b.status === "active").length;
  const wonBids = bids.filter((b) => b.status === "won").length;
  const totalValue = bids.reduce((sum, b) => sum + b.bidAmount, 0);

  const { columns } = useBidTableColumns(handleView);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        subtitle={`${t("subtitle")} — ${totalBids} total`}
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {[
          { label: t("totalBids"), value: totalBids },
          { label: t("activeBids"), value: activeBids },
          { label: t("wonBids"), value: wonBids },
          { label: t("totalValue"), value: formatCurrency(totalValue) },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4">
            <Caption className="uppercase tracking-wide font-medium">
              {label}
            </Caption>
            <Text weight="bold" className="mt-1 text-2xl">
              {value}
            </Text>
          </Card>
        ))}
      </div>

      <ListingLayout
        searchSlot={
          <Search
            value={searchTerm}
            onChange={(v) => table.set("q", v)}
            placeholder={t("searchPlaceholder")}
          />
        }
        filterContent={<BidFilters table={pendingTable} />}
        filterActiveCount={filterActiveCount}
        onFilterApply={onFilterApply}
        onFilterClear={onFilterClear}
        paginationSlot={
          <TablePagination
            currentPage={data?.meta?.page ?? 1}
            totalPages={data?.meta?.totalPages ?? 1}
            pageSize={table.getNumber("pageSize", 25)}
            total={data?.meta?.total ?? 0}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
          />
        }
      >
        <DataTable
          columns={columns}
          data={bids}
          loading={isLoading}
          emptyTitle={t("empty")}
          emptyMessage={
            error ? ERROR_MESSAGES.BID.FETCH_FAILED : t("emptySubtitle")
          }
          keyExtractor={(bid: BidDocument) => bid.id}
          externalPagination
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(bid) => (
            <Card className="p-4 space-y-2">
              <Text weight="medium" size="sm" className="line-clamp-2">
                {bid.productTitle}
              </Text>
              <Caption>{bid.userName}</Caption>
              <div className="flex items-center justify-between">
                <Text weight="bold" size="sm">
                  {formatCurrency(bid.bidAmount)}
                </Text>
                <StatusBadge status={bid.status as any} />
              </div>
              <Caption>{formatDate(bid.bidDate)}</Caption>
            </Card>
          )}
        />
      </ListingLayout>

      {/* Bid detail drawer — read-only */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={t("title")}
        side="right"
      >
        {selectedBid && (
          <div className="flex flex-col h-full p-4 space-y-4">
            {/* Product */}
            <div>
              <Caption className="uppercase tracking-wide font-semibold">
                {t("product")}
              </Caption>
              <Text size="sm" weight="medium" className="mt-1">
                {selectedBid.productTitle}
              </Text>
              <Caption className="font-mono">{selectedBid.productId}</Caption>
            </div>

            {/* Bidder */}
            <div>
              <Caption className="uppercase tracking-wide font-semibold">
                {t("bidder")}
              </Caption>
              <Text size="sm" weight="medium" className="mt-1">
                {selectedBid.userName}
              </Text>
              <Caption>{selectedBid.userEmail}</Caption>
            </div>

            {/* Bid details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Caption className="uppercase tracking-wide font-semibold">
                  {t("bidAmount")}
                </Caption>
                <Text weight="bold" className="mt-1 text-lg">
                  {formatCurrency(selectedBid.bidAmount)}
                </Text>
              </div>
              <div>
                <Caption className="uppercase tracking-wide font-semibold">
                  {tTable("status")}
                </Caption>
                <Text size="sm" weight="medium" className="mt-1 capitalize">
                  {selectedBid.status}
                  {selectedBid.isWinning && (
                    <Span variant="accent" className="ml-1">
                      ★ {t("winning")}
                    </Span>
                  )}
                </Text>
              </div>
            </div>

            {/* Bid Date */}
            <div>
              <Caption className="uppercase tracking-wide font-semibold">
                {t("bidDate")}
              </Caption>
              <Text size="sm" className="mt-1">
                {formatDate(selectedBid.bidDate)}
              </Text>
            </div>

            {/* Auto max bid if set */}
            {selectedBid.autoMaxBid != null && (
              <div>
                <Caption className="uppercase tracking-wide font-semibold">
                  Auto Max Bid
                </Caption>
                <Text size="sm" className="mt-1">
                  {formatCurrency(selectedBid.autoMaxBid)}
                </Text>
              </div>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  );
}

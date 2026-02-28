"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUrlTable } from "@/hooks";
import { useAdminBids } from "@/features/admin/hooks";
import { ROUTES, ERROR_MESSAGES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import {
  Card,
  Button,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  useBidTableColumns,
  TablePagination,
} from "@/components";
import { formatCurrency, formatDate } from "@/utils";
import type { BidDocument } from "@/db/schema";

interface Props {
  action?: string[];
}

export function AdminBidsView({ action }: Props) {
  const router = useRouter();
  const t = useTranslations("adminBids");
  const tTable = useTranslations("table");
  const { themed } = THEME_CONSTANTS;
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

  const filtersParam = statusFilter ? `status==${statusFilter}` : undefined;

  const { data, isLoading, error } = useAdminBids(
    table.buildSieveParams(filtersParam ?? ""),
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("totalBids"), value: totalBids },
          { label: t("activeBids"), value: activeBids },
          { label: t("wonBids"), value: wonBids },
          { label: t("totalValue"), value: formatCurrency(totalValue) },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4">
            <p
              className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary}`}
            >
              {label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${themed.textPrimary}`}>
              {value}
            </p>
          </Card>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={statusFilter === tab.key ? "primary" : "outline"}
            size="sm"
            onClick={() => table.set("status", tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card>
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
        />
        <TablePagination
          currentPage={data?.meta?.page ?? 1}
          totalPages={data?.meta?.totalPages ?? 1}
          pageSize={table.getNumber("pageSize", 25)}
          total={data?.meta?.total ?? 0}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />
      </Card>

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
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${themed.textSecondary}`}
              >
                {t("product")}
              </p>
              <p className={`mt-1 text-sm font-medium ${themed.textPrimary}`}>
                {selectedBid.productTitle}
              </p>
              <p className={`text-xs font-mono ${themed.textSecondary}`}>
                {selectedBid.productId}
              </p>
            </div>

            {/* Bidder */}
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${themed.textSecondary}`}
              >
                {t("bidder")}
              </p>
              <p className={`mt-1 text-sm font-medium ${themed.textPrimary}`}>
                {selectedBid.userName}
              </p>
              <p className={`text-xs ${themed.textSecondary}`}>
                {selectedBid.userEmail}
              </p>
            </div>

            {/* Bid details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${themed.textSecondary}`}
                >
                  {t("bidAmount")}
                </p>
                <p className={`mt-1 text-lg font-bold ${themed.textPrimary}`}>
                  {formatCurrency(selectedBid.bidAmount)}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${themed.textSecondary}`}
                >
                  {tTable("status")}
                </p>
                <p
                  className={`mt-1 text-sm font-medium capitalize ${themed.textPrimary}`}
                >
                  {selectedBid.status}
                  {selectedBid.isWinning && (
                    <span className="ml-1 text-indigo-600 dark:text-indigo-400">
                      ★ {t("winning")}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Bid Date */}
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${themed.textSecondary}`}
              >
                {t("bidDate")}
              </p>
              <p className={`mt-1 text-sm ${themed.textPrimary}`}>
                {formatDate(selectedBid.bidDate)}
              </p>
            </div>

            {/* Auto max bid if set */}
            {selectedBid.autoMaxBid != null && (
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${themed.textSecondary}`}
                >
                  Auto Max Bid
                </p>
                <p className={`mt-1 text-sm ${themed.textPrimary}`}>
                  {formatCurrency(selectedBid.autoMaxBid)}
                </p>
              </div>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  );
}

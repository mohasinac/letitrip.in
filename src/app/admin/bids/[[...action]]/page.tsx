"use client";

import { useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, ROUTES, ERROR_MESSAGES } from "@/constants";
import {
  Card,
  Button,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  getBidTableColumns,
} from "@/components";
import { formatCurrency, formatDate } from "@/utils";
import { THEME_CONSTANTS } from "@/constants";
import type { BidDocument } from "@/db/schema";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

const LABELS = UI_LABELS.ADMIN.BIDS;
const { themed } = THEME_CONSTANTS;

const STATUS_TABS = [
  { key: "", label: LABELS.FILTER_ALL },
  { key: "active", label: LABELS.FILTER_ACTIVE },
  { key: "won", label: LABELS.FILTER_WON },
  { key: "outbid", label: LABELS.FILTER_OUTBID },
  { key: "cancelled", label: LABELS.FILTER_CANCELLED },
];

export default function AdminBidsPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBid, setSelectedBid] = useState<BidDocument | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filtersParam = statusFilter ? `status==${statusFilter}` : undefined;

  const { data, isLoading, error } = useApiQuery<{
    bids: BidDocument[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }>({
    queryKey: ["admin", "bids", statusFilter],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.ADMIN.BIDS}?pageSize=200${
          filtersParam ? `&filters=${encodeURIComponent(filtersParam)}` : ""
        }`,
      ),
  });

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

  const { columns } = getBidTableColumns(handleView);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={LABELS.TITLE}
        subtitle={`${LABELS.SUBTITLE} — ${totalBids} total`}
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: LABELS.TOTAL_BIDS, value: totalBids },
          { label: LABELS.ACTIVE_BIDS, value: activeBids },
          { label: LABELS.WON_BIDS, value: wonBids },
          { label: LABELS.TOTAL_VALUE, value: formatCurrency(totalValue) },
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
            onClick={() => setStatusFilter(tab.key)}
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
          emptyTitle={LABELS.EMPTY}
          emptyMessage={
            error ? ERROR_MESSAGES.BID.FETCH_FAILED : LABELS.EMPTY_SUBTITLE
          }
          keyExtractor={(bid: BidDocument) => bid.id}
        />
      </Card>

      {/* Bid detail drawer — read-only */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={LABELS.TITLE}
      >
        {selectedBid && (
          <div className="flex flex-col h-full p-4 space-y-4">
            {/* Product */}
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${themed.textSecondary}`}
              >
                {LABELS.PRODUCT}
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
                {LABELS.BIDDER}
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
                  {LABELS.BID_AMOUNT}
                </p>
                <p className={`mt-1 text-lg font-bold ${themed.textPrimary}`}>
                  {formatCurrency(selectedBid.bidAmount)}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${themed.textSecondary}`}
                >
                  {LABELS.STATUS}
                </p>
                <p
                  className={`mt-1 text-sm font-medium capitalize ${themed.textPrimary}`}
                >
                  {selectedBid.status}
                  {selectedBid.isWinning && (
                    <span className="ml-1 text-indigo-600 dark:text-indigo-400">
                      ★ {LABELS.WINNING}
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
                {LABELS.BID_DATE}
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

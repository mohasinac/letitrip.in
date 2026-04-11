"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter } from "@/i18n/navigation";
import { usePendingTable } from "@mohasinac/appkit/react";
import { useUrlTable } from "@/hooks";
import { buildSieveFilters } from "@mohasinac/appkit/utils";
import { useAdminBids } from "@/features/admin/hooks";
import {
  Grid,
  Text,
  Caption,
  StatusBadge,
  Span,
  TablePagination,
} from "@mohasinac/appkit/ui";
import { ROUTES, ERROR_MESSAGES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import {
  Card,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  Search,
} from "@/components";
import { AdminBidsView as AdminBidsShell } from "@mohasinac/appkit/features/admin";
import { BidFilters } from "./BidFilters";
import { useBidTableColumns } from ".";
import { formatCurrency, formatDate } from "@/utils";
import type { BidDocument } from "@/db/schema";

const { flex, spacing } = THEME_CONSTANTS;

interface Props {
  action?: string[];
}

function AdminBidsContent({ action }: Props) {
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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedBid, setSelectedBid] = useState<BidDocument | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const searchTerm = table.get("q");
  const minAmount = table.get("minAmount");
  const maxAmount = table.get("maxAmount");

  // ── Pending filter state (staged until Apply is clicked) ─────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["status", "isWinning", "minAmount", "maxAmount"]);

  const isWinningFilter = table.get("isWinning");

  const { data, isLoading, error } = useAdminBids(
    table.buildSieveParams(
      buildSieveFilters(
        ["status==", statusFilter],
        ["bidAmount>=", minAmount],
        ["bidAmount<=", maxAmount],
        ["productTitle@=*", searchTerm],
        ["isWinning==", isWinningFilter === "true" ? "true" : undefined],
      ),
    ),
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
      <Grid className="grid-cols-2 md:grid-cols-4" gap="md">
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
      </Grid>

      <AdminBidsShell
        isDashboard
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
        toolbarPaginationSlot={
          <TablePagination
            currentPage={data?.meta?.page ?? 1}
            totalPages={data?.meta?.totalPages ?? 1}
            pageSize={table.getNumber("pageSize", 25)}
            total={data?.meta?.total ?? 0}
            onPageChange={table.setPage}
            compact
          />
        }
        renderDrawer={() => (
          <SideDrawer
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            title={t("title")}
            side="right"
          >
            {selectedBid && (
              <div className={`flex flex-col h-full p-4 ${spacing.stack}`}>
                <div>
                  <Caption className="uppercase tracking-wide font-semibold">
                    {t("product")}
                  </Caption>
                  <Text size="sm" weight="medium" className="mt-1">
                    {selectedBid.productTitle}
                  </Text>
                  <Caption className="font-mono">
                    {selectedBid.productId}
                  </Caption>
                </div>

                <div>
                  <Caption className="uppercase tracking-wide font-semibold">
                    {t("bidder")}
                  </Caption>
                  <Text size="sm" weight="medium" className="mt-1">
                    {selectedBid.userName}
                  </Text>
                  <Caption>{selectedBid.userEmail}</Caption>
                </div>

                <Grid className="grid-cols-2" gap="md">
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
                </Grid>

                <div>
                  <Caption className="uppercase tracking-wide font-semibold">
                    {t("bidDate")}
                  </Caption>
                  <Text size="sm" className="mt-1">
                    {formatDate(selectedBid.bidDate)}
                  </Text>
                </div>

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
        )}
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
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
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
              <div className={`${flex.between}`}>
                <Text weight="bold" size="sm">
                  {formatCurrency(bid.bidAmount)}
                </Text>
                <StatusBadge status={bid.status as any} />
              </div>
              <Caption>{formatDate(bid.bidDate)}</Caption>
            </Card>
          )}
        />
      </AdminBidsShell>
    </div>
  );
}

export function AdminBidsView(props: Props) {
  return (
    <Suspense>
      <AdminBidsContent {...props} />
    </Suspense>
  );
}

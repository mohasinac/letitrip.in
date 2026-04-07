"use client";

import { useState, useCallback, useEffect } from "react";
import { useMessage, useUrlTable, usePendingTable } from "@/hooks";
import { buildSieveFilters } from "@/helpers";
import { useAdminPayouts } from "@/features/admin/hooks";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import {
  Card,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  DrawerFormFooter,
  StatusBadge,
  Text,
  Caption,
  TablePagination,
  ListingLayout,
  Search,
} from "@/components";
import { PayoutFilters } from "./PayoutFilters";
import { getPayoutTableColumns, PayoutStatusForm } from ".";
import type { PayoutStatusFormState } from ".";
import { formatCurrency, formatDate, isSameMonth, nowMs } from "@/utils";
import type { PayoutDocument } from "@/db/schema";

const { spacing, flex } = THEME_CONSTANTS;

interface PayoutsResponse {
  payouts: PayoutDocument[];
  meta: {
    total: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

export function AdminPayoutsView() {
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("adminPayouts");

  const table = useUrlTable({
    defaults: { pageSize: "25", sorts: "-requestedAt" },
  });
  const statusFilter = table.get("status");
  const paymentMethodFilter = table.get("paymentMethod");
  const searchTerm = table.get("q");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<PayoutDocument | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formState, setFormState] = useState<PayoutStatusFormState | null>(
    null,
  );

  const minAmount = table.get("minAmount");
  const maxAmount = table.get("maxAmount");

  // ── Pending filter state (staged until Apply is clicked) ─────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, [
      "status",
      "paymentMethod",
      "minAmount",
      "maxAmount",
    ]);

  const { data, isLoading, error, refetch, updateMutation } = useAdminPayouts(
    (() => {
      // sellerName is PII-encrypted — cannot use @=* Sieve filter; pass `q` separately
      const rawSieveParams = table.buildSieveParams(
        buildSieveFilters(
          ["status==", statusFilter],
          ["paymentMethod==", paymentMethodFilter],
          ["amount>=", minAmount],
          ["amount<=", maxAmount],
        ),
      );
      return searchTerm
        ? `${rawSieveParams}&q=${encodeURIComponent(searchTerm)}`
        : rawSieveParams;
    })(),
  );

  const payouts = data?.payouts ?? [];

  // Derive summary stats from full (unfiltered) payload when showing "all"
  const pendingPayouts = payouts.filter((p) => p.status === "pending");
  const totalPending = pendingPayouts.reduce((s, p) => s + p.amount, 0);
  const completedThisMonth = payouts.filter(
    (p) =>
      p.status === "completed" &&
      p.processedAt &&
      isSameMonth(p.processedAt, nowMs()),
  );
  const totalPaidMonth = completedThisMonth.reduce((s, p) => s + p.amount, 0);
  const failedThisMonth = payouts.filter(
    (p) =>
      p.status === "failed" &&
      p.processedAt &&
      isSameMonth(p.processedAt, nowMs()),
  ).length;

  const handleView = useCallback((payout: PayoutDocument) => {
    setSelectedPayout(payout);
    setFormState({ status: payout.status, adminNote: payout.adminNote ?? "" });
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedPayout(null);
    setFormState(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedPayout || !formState) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedPayout!.id,
        data: formState,
      });
      showSuccess(SUCCESS_MESSAGES.PAYOUT.UPDATED);
      handleCloseDrawer();
      refetch();
    } catch {
      showError(ERROR_MESSAGES.PAYOUT.UPDATE_FAILED);
    }
  }, [
    selectedPayout,
    formState,
    updateMutation,
    showSuccess,
    showError,
    handleCloseDrawer,
    refetch,
  ]);

  const { columns } = getPayoutTableColumns(handleView);

  return (
    <div className={spacing.stack}>
      <AdminPageHeader
        title={t("title")}
        subtitle={`${t("subtitle")} \u2014 ${data?.meta?.total ?? payouts.length} total`}
      />

      {/* Stats row */}
      {!statusFilter && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          <Card className="p-4">
            <Caption className="uppercase tracking-wide font-medium mb-1">
              {t("totalPending")}
            </Caption>
            <Text
              weight="bold"
              className="text-2xl text-yellow-600 dark:text-yellow-400 tabular-nums"
            >
              {formatCurrency(totalPending)}
            </Text>
            <Caption className="mt-0.5">
              {pendingPayouts.length} request
              {pendingPayouts.length !== 1 ? "s" : ""}
            </Caption>
          </Card>
          <Card className="p-4">
            <Caption className="uppercase tracking-wide font-medium mb-1">
              {t("totalPaidMonth")}
            </Caption>
            <Text
              weight="bold"
              className="text-2xl text-emerald-600 dark:text-emerald-400 tabular-nums"
            >
              {formatCurrency(totalPaidMonth)}
            </Text>
            <Caption className="mt-0.5">
              {completedThisMonth.length} payout
              {completedThisMonth.length !== 1 ? "s" : ""}
            </Caption>
          </Card>
          <Card className="p-4">
            <Caption className="uppercase tracking-wide font-medium mb-1">
              {t("failureCount")}
            </Caption>
            <Text
              weight="bold"
              className="text-2xl text-red-600 dark:text-red-400 tabular-nums"
            >
              {failedThisMonth}
            </Text>
            <Caption className="mt-0.5">{t("thisMonth")}</Caption>
          </Card>
        </div>
      )}

      {/* Status filter tabs */}
      <ListingLayout
        searchSlot={
          <Search
            value={searchTerm}
            onChange={(v) => table.set("q", v)}
            placeholder={t("searchPlaceholder")}
          />
        }
        filterContent={<PayoutFilters table={pendingTable} />}
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
      >
        <DataTable
          columns={columns}
          data={payouts}
          loading={isLoading}
          emptyMessage={error ? ERROR_MESSAGES.PAYOUT.FETCH_FAILED : t("empty")}
          keyExtractor={(p: PayoutDocument) => p.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(payout) => (
            <Card className="p-4 space-y-2">
              <Text weight="medium" size="sm">
                {payout.sellerName}
              </Text>
              <Caption className="truncate">{payout.sellerEmail}</Caption>
              <div className={`${flex.between}`}>
                <Text weight="semibold" size="sm">
                  {formatCurrency(payout.amount)}
                </Text>
                <StatusBadge status={payout.status as any} />
              </div>
              <Caption>{formatDate(payout.requestedAt)}</Caption>
            </Card>
          )}
        />
      </ListingLayout>

      {/* Update payout status drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={t("updateStatus")}
        side="right"
        footer={
          selectedPayout ? (
            <DrawerFormFooter
              onCancel={handleCloseDrawer}
              onSubmit={handleSave}
              isLoading={updateMutation.isPending}
              submitLabel={t("updatePayout")}
            />
          ) : undefined
        }
      >
        {selectedPayout && (
          <PayoutStatusForm payout={selectedPayout} onChange={setFormState} />
        )}
      </SideDrawer>
    </div>
  );
}

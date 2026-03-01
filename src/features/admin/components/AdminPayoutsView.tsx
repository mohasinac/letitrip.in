"use client";

import { useState, useCallback } from "react";
import { useMessage } from "@/hooks";
import { useAdminPayouts } from "@/features/admin/hooks";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import {
  Card,
  Button,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  DrawerFormFooter,
  getPayoutTableColumns,
  PayoutStatusForm,
} from "@/components";
import type { PayoutStatusFormState } from "@/components";
import { formatCurrency, isSameMonth, nowMs } from "@/utils";
import type { PayoutDocument } from "@/db/schema";

const { themed, spacing } = THEME_CONSTANTS;

interface PayoutsResponse {
  payouts: PayoutDocument[];
  meta: { total: number };
}

export function AdminPayoutsView() {
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("adminPayouts");
  const STATUS_TABS = [
    { key: "", label: t("filterAll") },
    { key: "pending", label: t("filterPending") },
    { key: "processing", label: t("filterProcessing") },
    { key: "completed", label: t("filterCompleted") },
    { key: "failed", label: t("filterFailed") },
  ];

  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<PayoutDocument | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formState, setFormState] = useState<PayoutStatusFormState | null>(
    null,
  );

  const { data, isLoading, error, refetch, updateMutation } =
    useAdminPayouts(statusFilter);

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
      await updateMutation.mutate({
        id: selectedPayout.id,
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
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <Card className="p-4">
            <p
              className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary} mb-1`}
            >
              {t("totalPending")}
            </p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 tabular-nums">
              {formatCurrency(totalPending)}
            </p>
            <p className={`text-xs ${themed.textSecondary} mt-0.5`}>
              {pendingPayouts.length} request
              {pendingPayouts.length !== 1 ? "s" : ""}
            </p>
          </Card>
          <Card className="p-4">
            <p
              className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary} mb-1`}
            >
              {t("totalPaidMonth")}
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(totalPaidMonth)}
            </p>
            <p className={`text-xs ${themed.textSecondary} mt-0.5`}>
              {completedThisMonth.length} payout
              {completedThisMonth.length !== 1 ? "s" : ""}
            </p>
          </Card>
          <Card className="p-4">
            <p
              className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary} mb-1`}
            >
              {t("failureCount")}
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
              {failedThisMonth}
            </p>
            <p className={`text-xs ${themed.textSecondary} mt-0.5`}>
              this month
            </p>
          </Card>
        </div>
      )}

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
          data={payouts}
          loading={isLoading}
          emptyMessage={error ? ERROR_MESSAGES.PAYOUT.FETCH_FAILED : t("empty")}
          keyExtractor={(p: PayoutDocument) => p.id}
        />
      </Card>

      {/* Update payout status drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={t("updateStatus")}
        side="right"
      >
        {selectedPayout && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              <PayoutStatusForm
                payout={selectedPayout}
                onChange={setFormState}
              />
            </div>
            <DrawerFormFooter
              onCancel={handleCloseDrawer}
              onSubmit={handleSave}
              isLoading={updateMutation.isLoading}
              submitLabel={t("updatePayout")}
            />
          </div>
        )}
      </SideDrawer>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  API_ENDPOINTS,
  UI_LABELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";
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
import { formatCurrency } from "@/utils";
import type { PayoutDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.PAYOUTS;
const { themed, spacing } = THEME_CONSTANTS;

const STATUS_TABS = [
  { key: "", label: LABELS.FILTER_ALL },
  { key: "pending", label: LABELS.FILTER_PENDING },
  { key: "processing", label: LABELS.FILTER_PROCESSING },
  { key: "completed", label: LABELS.FILTER_COMPLETED },
  { key: "failed", label: LABELS.FILTER_FAILED },
];

interface PayoutsResponse {
  payouts: PayoutDocument[];
  meta: { total: number };
}

export default function AdminPayoutsPage() {
  const { showSuccess, showError } = useMessage();

  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<PayoutDocument | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formState, setFormState] = useState<PayoutStatusFormState | null>(
    null,
  );

  const queryKey = ["admin", "payouts", statusFilter];
  const { data, isLoading, error, refetch } = useApiQuery<PayoutsResponse>({
    queryKey,
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.ADMIN.PAYOUTS}${statusFilter ? `?filters=${encodeURIComponent(`status==${statusFilter}`)}` : ""}`,
      ),
  });

  const updateMutation = useApiMutation<
    unknown,
    { id: string; data: PayoutStatusFormState }
  >({
    mutationFn: ({ id, data: update }) =>
      apiClient.patch(API_ENDPOINTS.ADMIN.PAYOUT_BY_ID(id), update),
  });

  const payouts = data?.payouts ?? [];

  // Derive summary stats from full (unfiltered) payload when showing "all"
  const pendingPayouts = payouts.filter((p) => p.status === "pending");
  const totalPending = pendingPayouts.reduce((s, p) => s + p.amount, 0);
  const completedThisMonth = payouts.filter(
    (p) =>
      p.status === "completed" &&
      p.processedAt &&
      new Date(p.processedAt).getMonth() === new Date().getMonth(),
  );
  const totalPaidMonth = completedThisMonth.reduce((s, p) => s + p.amount, 0);
  const failedThisMonth = payouts.filter(
    (p) =>
      p.status === "failed" &&
      p.processedAt &&
      new Date(p.processedAt).getMonth() === new Date().getMonth(),
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
        title={LABELS.TITLE}
        subtitle={`${LABELS.SUBTITLE} — ${data?.meta?.total ?? payouts.length} total`}
      />

      {/* Stats row */}
      {!statusFilter && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <p
              className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary} mb-1`}
            >
              {LABELS.TOTAL_PENDING}
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
              {LABELS.TOTAL_PAID_MONTH}
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
              {LABELS.FAILURE_COUNT}
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
          emptyMessage={
            error ? ERROR_MESSAGES.PAYOUT.FETCH_FAILED : LABELS.EMPTY
          }
          keyExtractor={(p: PayoutDocument) => p.id}
        />
      </Card>

      {/* Update payout status drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={LABELS.UPDATE_STATUS}
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
              submitLabel={LABELS.UPDATE_PAYOUT}
            />
          </div>
        )}
      </SideDrawer>
    </div>
  );
}

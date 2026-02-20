/**
 * Seller Payouts Page
 *
 * Route: /seller/payouts
 * Displays earnings summary, payout request form, and payout history.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge, Button, FormField, Alert } from "@/components";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useAuth, useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils";

const { themed, spacing, typography } = THEME_CONSTANTS;

// ─── Types ─────────────────────────────────────────────────────────────────

interface PayoutSummary {
  availableEarnings: number;
  grossEarnings: number;
  platformFee: number;
  platformFeeRate: number;
  totalPaidOut: number;
  pendingAmount: number;
  hasPendingPayout: boolean;
  eligibleOrderCount: number;
}

interface PayoutRecord {
  id: string;
  amount: number;
  grossAmount: number;
  platformFee: number;
  status: "pending" | "processing" | "completed" | "failed";
  paymentMethod: "bank_transfer" | "upi";
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
  orderIds: string[];
}

interface PayoutsResponse {
  payouts: PayoutRecord[];
  summary: PayoutSummary;
}

// ─── Status badge helper ────────────────────────────────────────────────────

const STATUS_VARIANT: Record<
  PayoutRecord["status"],
  "pending" | "info" | "success" | "danger"
> = {
  pending: "pending",
  processing: "info",
  completed: "success",
  failed: "danger",
};

const STATUS_LABEL: Record<PayoutRecord["status"], string> = {
  pending: UI_LABELS.SELLER_PAYOUTS.STATUS_PENDING,
  processing: UI_LABELS.SELLER_PAYOUTS.STATUS_PROCESSING,
  completed: UI_LABELS.SELLER_PAYOUTS.STATUS_COMPLETED,
  failed: UI_LABELS.SELLER_PAYOUTS.STATUS_FAILED,
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SellerPayoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();

  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "upi">(
    "bank_transfer",
  );
  const [bankForm, setBankForm] = useState({
    accountHolderName: "",
    accountNumberMasked: "",
    ifscCode: "",
    bankName: "",
  });
  const [upiId, setUpiId] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  const { data, isLoading, refetch } = useApiQuery<PayoutsResponse>({
    queryKey: ["seller-payouts", user?.uid ?? ""],
    queryFn: () => fetch(API_ENDPOINTS.SELLER.PAYOUTS).then((r) => r.json()),
    enabled: !!user,
    cacheTTL: 0,
  });

  const { mutate: requestPayout, isLoading: submitting } = useApiMutation<
    unknown,
    Record<string, unknown>
  >({
    mutationFn: (payload) =>
      fetch(API_ENDPOINTS.SELLER.PAYOUTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json()),
  });

  if (authLoading || !user) {
    return (
      <div
        className={`${themed.bgPrimary} min-h-screen flex items-center justify-center`}
      >
        <p className={themed.textSecondary}>{UI_LABELS.LOADING.DEFAULT}</p>
      </div>
    );
  }

  const summary = (data as any)?.data?.summary as PayoutSummary | undefined;
  const payouts = ((data as any)?.data?.payouts ?? []) as PayoutRecord[];

  async function handleRequestPayout() {
    const payload: Record<string, unknown> = {
      paymentMethod,
      notes: notes || undefined,
    };

    if (paymentMethod === "bank_transfer") {
      payload.bankAccount = bankForm;
    } else {
      payload.upiId = upiId;
    }

    const result = await requestPayout(payload);
    if (result) {
      showSuccess(UI_LABELS.SELLER_PAYOUTS.STATUS_PENDING);
      setShowForm(false);
      refetch();
    } else {
      showError(UI_LABELS.SELLER_PAYOUTS.NO_EARNINGS);
    }
  }

  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      <div className={`max-w-4xl mx-auto ${spacing.padding.lg}`}>
        {/* Header */}
        <div className={`${spacing.stack} mb-8`}>
          <h1 className={`${typography.h2} ${themed.textPrimary}`}>
            {UI_LABELS.SELLER_PAYOUTS.PAGE_TITLE}
          </h1>
          <p className={themed.textSecondary}>
            {UI_LABELS.SELLER_PAYOUTS.PAGE_SUBTITLE}
          </p>
        </div>

        {/* Stat Cards */}
        {isLoading ? (
          <p className={`${themed.textSecondary} mb-6`}>
            {UI_LABELS.SELLER_PAYOUTS.LOADING}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className={spacing.padding.md}>
              <p className={`text-sm ${themed.textSecondary}`}>
                {UI_LABELS.SELLER_PAYOUTS.AVAILABLE_EARNINGS}
              </p>
              <p className={`${typography.h3} text-emerald-600 mt-1`}>
                {formatCurrency(summary?.availableEarnings ?? 0)}
              </p>
            </Card>
            <Card className={spacing.padding.md}>
              <p className={`text-sm ${themed.textSecondary}`}>
                {UI_LABELS.SELLER_PAYOUTS.TOTAL_PAID}
              </p>
              <p className={`${typography.h3} ${themed.textPrimary} mt-1`}>
                {formatCurrency(summary?.totalPaidOut ?? 0)}
              </p>
            </Card>
            <Card className={spacing.padding.md}>
              <p className={`text-sm ${themed.textSecondary}`}>
                {UI_LABELS.SELLER_PAYOUTS.PENDING_PAYOUT}
              </p>
              <p className={`${typography.h3} text-amber-600 mt-1`}>
                {formatCurrency(summary?.pendingAmount ?? 0)}
              </p>
            </Card>
          </div>
        )}

        {/* Request Payout Section */}
        {!isLoading && summary && (
          <Card className={`${spacing.padding.lg} mb-8`}>
            {summary.hasPendingPayout ? (
              <Alert variant="info">
                {UI_LABELS.SELLER_PAYOUTS.ALREADY_PENDING}
              </Alert>
            ) : summary.availableEarnings <= 0 ? (
              <Alert variant="info">
                {UI_LABELS.SELLER_PAYOUTS.NO_EARNINGS}
              </Alert>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className={`${typography.h4} ${themed.textPrimary}`}>
                      {UI_LABELS.SELLER_PAYOUTS.REQUEST_PAYOUT}
                    </h2>
                    <p className={`text-sm ${themed.textSecondary} mt-1`}>
                      {UI_LABELS.SELLER_PAYOUTS.PLATFORM_FEE(
                        summary.platformFeeRate,
                      )}{" "}
                      &middot; {UI_LABELS.SELLER_PAYOUTS.GROSS_AMOUNT}:{" "}
                      {formatCurrency(summary.grossEarnings)} &middot;{" "}
                      {UI_LABELS.SELLER_PAYOUTS.NET_AMOUNT}:{" "}
                      {formatCurrency(summary.availableEarnings)}
                    </p>
                  </div>
                  {!showForm && (
                    <Button variant="primary" onClick={() => setShowForm(true)}>
                      {UI_LABELS.SELLER_PAYOUTS.REQUEST_PAYOUT}
                    </Button>
                  )}
                </div>

                {showForm && (
                  <div
                    className={`${spacing.stack} border-t ${themed.border} pt-4`}
                  >
                    {/* Payment method selector */}
                    <FormField
                      type="select"
                      name="paymentMethod"
                      label={UI_LABELS.SELLER_PAYOUTS.PAYMENT_METHOD_LABEL}
                      value={paymentMethod}
                      onChange={(v) =>
                        setPaymentMethod(v as "bank_transfer" | "upi")
                      }
                      options={[
                        {
                          value: "bank_transfer",
                          label: UI_LABELS.SELLER_PAYOUTS.PAYMENT_METHOD_BANK,
                        },
                        {
                          value: "upi",
                          label: UI_LABELS.SELLER_PAYOUTS.PAYMENT_METHOD_UPI,
                        },
                      ]}
                    />

                    {paymentMethod === "bank_transfer" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          name="accountHolderName"
                          label={UI_LABELS.SELLER_PAYOUTS.BANK_HOLDER_NAME}
                          value={bankForm.accountHolderName}
                          onChange={(v) =>
                            setBankForm((f) => ({ ...f, accountHolderName: v }))
                          }
                        />
                        <FormField
                          name="accountNumberMasked"
                          label={UI_LABELS.SELLER_PAYOUTS.BANK_ACCOUNT_NUMBER}
                          value={bankForm.accountNumberMasked}
                          onChange={(v) =>
                            setBankForm((f) => ({
                              ...f,
                              accountNumberMasked: v,
                            }))
                          }
                        />
                        <FormField
                          name="ifscCode"
                          label={UI_LABELS.SELLER_PAYOUTS.BANK_IFSC}
                          value={bankForm.ifscCode}
                          onChange={(v) =>
                            setBankForm((f) => ({ ...f, ifscCode: v }))
                          }
                        />
                        <FormField
                          name="bankName"
                          label={UI_LABELS.SELLER_PAYOUTS.BANK_NAME}
                          value={bankForm.bankName}
                          onChange={(v) =>
                            setBankForm((f) => ({ ...f, bankName: v }))
                          }
                        />
                      </div>
                    ) : (
                      <FormField
                        name="upiId"
                        label={UI_LABELS.SELLER_PAYOUTS.UPI_ID_LABEL}
                        value={upiId}
                        onChange={(v) => setUpiId(v)}
                      />
                    )}

                    <FormField
                      name="notes"
                      label={UI_LABELS.SELLER_PAYOUTS.NOTES_LABEL}
                      value={notes}
                      onChange={(v) => setNotes(v)}
                    />

                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="secondary"
                        onClick={() => setShowForm(false)}
                      >
                        {UI_LABELS.ACTIONS.CANCEL}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleRequestPayout}
                        disabled={submitting}
                      >
                        {submitting
                          ? UI_LABELS.LOADING.DEFAULT
                          : UI_LABELS.ACTIONS.SUBMIT}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {/* Payout History */}
        <div>
          <h2 className={`${typography.h3} ${themed.textPrimary} mb-4`}>
            {UI_LABELS.SELLER_PAYOUTS.HISTORY_TITLE}
          </h2>

          {isLoading ? (
            <p className={themed.textSecondary}>
              {UI_LABELS.SELLER_PAYOUTS.LOADING}
            </p>
          ) : payouts.length === 0 ? (
            <Card className={`${spacing.padding.lg} text-center`}>
              <p className={`${themed.textSecondary} font-medium`}>
                {UI_LABELS.SELLER_PAYOUTS.NO_PAYOUTS}
              </p>
              <p className={`text-sm ${themed.textSecondary} mt-1`}>
                {UI_LABELS.SELLER_PAYOUTS.NO_PAYOUTS_DESC}
              </p>
            </Card>
          ) : (
            <div
              className={`overflow-x-auto rounded-xl border ${themed.border}`}
            >
              <table className="w-full text-sm">
                <thead className={themed.bgSecondary}>
                  <tr>
                    {[
                      UI_LABELS.SELLER_PAYOUTS.GROSS_AMOUNT,
                      UI_LABELS.SELLER_PAYOUTS.PLATFORM_FEE_LABEL,
                      UI_LABELS.SELLER_PAYOUTS.NET_AMOUNT,
                      UI_LABELS.SELLER_PAYOUTS.PAYMENT_METHOD_LABEL,
                      "Status",
                      "Requested",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-left font-medium ${themed.textSecondary}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payouts.map((p) => (
                    <tr
                      key={p.id}
                      className={`${themed.bgPrimary} hover:${themed.bgSecondary}`}
                    >
                      <td className={`px-4 py-3 ${themed.textPrimary}`}>
                        {formatCurrency(p.grossAmount)}
                      </td>
                      <td className={`px-4 py-3 ${themed.textSecondary}`}>
                        {formatCurrency(p.platformFee)}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${themed.textPrimary}`}
                      >
                        {formatCurrency(p.amount)}
                      </td>
                      <td className={`px-4 py-3 ${themed.textSecondary}`}>
                        {p.paymentMethod === "bank_transfer"
                          ? UI_LABELS.SELLER_PAYOUTS.PAYMENT_METHOD_BANK
                          : UI_LABELS.SELLER_PAYOUTS.PAYMENT_METHOD_UPI}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[p.status]}>
                          {STATUS_LABEL[p.status]}
                        </Badge>
                      </td>
                      <td className={`px-4 py-3 ${themed.textSecondary}`}>
                        {formatDate(new Date(p.requestedAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

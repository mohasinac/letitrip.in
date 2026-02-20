"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { Alert } from "@/components/feedback";
import { FormField } from "@/components/FormField";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { PayoutSummary } from "./SellerPayoutStats";

const { themed, spacing, typography } = THEME_CONSTANTS;
const LABELS = UI_LABELS.SELLER_PAYOUTS;

interface SellerPayoutRequestFormProps {
  summary: PayoutSummary;
  submitting: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
}

export function SellerPayoutRequestForm({
  summary,
  submitting,
  onSubmit,
}: SellerPayoutRequestFormProps) {
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

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      paymentMethod,
      notes: notes || undefined,
    };
    if (paymentMethod === "bank_transfer") {
      payload.bankAccount = bankForm;
    } else {
      payload.upiId = upiId;
    }
    onSubmit(payload);
    setShowForm(false);
  };

  if (summary.hasPendingPayout) {
    return (
      <Card className={`${spacing.padding.lg} mb-8`}>
        <Alert variant="info">{LABELS.ALREADY_PENDING}</Alert>
      </Card>
    );
  }

  if (summary.availableEarnings <= 0) {
    return (
      <Card className={`${spacing.padding.lg} mb-8`}>
        <Alert variant="info">{LABELS.NO_EARNINGS}</Alert>
      </Card>
    );
  }

  return (
    <Card className={`${spacing.padding.lg} mb-8`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`${typography.h4} ${themed.textPrimary}`}>
            {LABELS.REQUEST_PAYOUT}
          </h2>
          <p className={`text-sm ${themed.textSecondary} mt-1`}>
            {LABELS.PLATFORM_FEE(summary.platformFeeRate)} &middot;{" "}
            {LABELS.GROSS_AMOUNT}: {formatCurrency(summary.grossEarnings)}{" "}
            &middot; {LABELS.NET_AMOUNT}:{" "}
            {formatCurrency(summary.availableEarnings)}
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            {LABELS.REQUEST_PAYOUT}
          </Button>
        )}
      </div>

      {showForm && (
        <div className={`${spacing.stack} border-t ${themed.border} pt-4`}>
          <FormField
            type="select"
            name="paymentMethod"
            label={LABELS.PAYMENT_METHOD_LABEL}
            value={paymentMethod}
            onChange={(v) => setPaymentMethod(v as "bank_transfer" | "upi")}
            options={[
              { value: "bank_transfer", label: LABELS.PAYMENT_METHOD_BANK },
              { value: "upi", label: LABELS.PAYMENT_METHOD_UPI },
            ]}
          />

          {paymentMethod === "bank_transfer" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                name="accountHolderName"
                label={LABELS.BANK_HOLDER_NAME}
                value={bankForm.accountHolderName}
                onChange={(v) =>
                  setBankForm((f) => ({ ...f, accountHolderName: v }))
                }
              />
              <FormField
                name="accountNumberMasked"
                label={LABELS.BANK_ACCOUNT_NUMBER}
                value={bankForm.accountNumberMasked}
                onChange={(v) =>
                  setBankForm((f) => ({ ...f, accountNumberMasked: v }))
                }
              />
              <FormField
                name="ifscCode"
                label={LABELS.BANK_IFSC}
                value={bankForm.ifscCode}
                onChange={(v) => setBankForm((f) => ({ ...f, ifscCode: v }))}
              />
              <FormField
                name="bankName"
                label={LABELS.BANK_NAME}
                value={bankForm.bankName}
                onChange={(v) => setBankForm((f) => ({ ...f, bankName: v }))}
              />
            </div>
          ) : (
            <FormField
              name="upiId"
              label={LABELS.UPI_ID_LABEL}
              value={upiId}
              onChange={(v) => setUpiId(v)}
            />
          )}

          <FormField
            name="notes"
            label={LABELS.NOTES_LABEL}
            value={notes}
            onChange={(v) => setNotes(v)}
          />

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              {UI_LABELS.ACTIONS.CANCEL}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? UI_LABELS.LOADING.DEFAULT
                : UI_LABELS.ACTIONS.SUBMIT}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

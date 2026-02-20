/**
 * PayoutStatusForm
 * Path: src/components/admin/payouts/PayoutStatusForm.tsx
 *
 * Form for updating payout status and adding an admin note.
 * Shown inside a SideDrawer on the admin payouts page.
 */

"use client";

import { useState } from "react";
import { Select, Textarea } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import type { PayoutDocument, PayoutStatus } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.PAYOUTS;
const { themed } = THEME_CONSTANTS;

const STATUS_OPTIONS: { value: PayoutStatus; label: string }[] = [
  { value: "pending", label: LABELS.STATUS_PENDING },
  { value: "processing", label: LABELS.STATUS_PROCESSING },
  { value: "completed", label: LABELS.STATUS_COMPLETED },
  { value: "failed", label: LABELS.STATUS_FAILED },
];

export interface PayoutStatusFormState {
  status: PayoutStatus;
  adminNote: string;
}

interface PayoutStatusFormProps {
  payout: PayoutDocument;
  onChange: (state: PayoutStatusFormState) => void;
}

export function PayoutStatusForm({ payout, onChange }: PayoutStatusFormProps) {
  const [formState, setFormState] = useState<PayoutStatusFormState>({
    status: payout.status,
    adminNote: payout.adminNote ?? "",
  });

  const handleChange = (field: keyof PayoutStatusFormState, value: string) => {
    const updated = { ...formState, [field]: value };
    setFormState(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-5">
      {/* Read-only payout summary */}
      <div
        className={`rounded-lg border ${themed.border} p-4 space-y-2 text-sm`}
      >
        <div className="flex justify-between">
          <span className={themed.textSecondary}>{LABELS.SELLER}</span>
          <span className={`font-medium ${themed.textPrimary}`}>
            {payout.sellerName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={themed.textSecondary}>{LABELS.AMOUNT}</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(payout.amount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={themed.textSecondary}>{LABELS.GROSS_AMOUNT}</span>
          <span className={`${themed.textPrimary} tabular-nums`}>
            {formatCurrency(payout.grossAmount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={themed.textSecondary}>{LABELS.PLATFORM_FEE}</span>
          <span className={`${themed.textPrimary} tabular-nums`}>
            {formatCurrency(payout.platformFee)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={themed.textSecondary}>{LABELS.METHOD}</span>
          <span className={themed.textPrimary}>
            {payout.paymentMethod === "bank_transfer"
              ? LABELS.PAYMENT_METHOD_BANK
              : LABELS.PAYMENT_METHOD_UPI}
          </span>
        </div>
        {payout.paymentMethod === "bank_transfer" && payout.bankAccount && (
          <>
            <div className="flex justify-between">
              <span className={themed.textSecondary}>
                {LABELS.BANK_DETAILS}
              </span>
              <span className={themed.textPrimary}>
                {payout.bankAccount.bankName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={themed.textSecondary}>
                {LABELS.ACCOUNT_MASKED}
              </span>
              <span className={`font-mono ${themed.textPrimary}`}>
                ****{payout.bankAccount.accountNumberMasked}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={themed.textSecondary}>{LABELS.IFSC}</span>
              <span className={`font-mono ${themed.textPrimary}`}>
                {payout.bankAccount.ifscCode}
              </span>
            </div>
          </>
        )}
        {payout.paymentMethod === "upi" && payout.upiId && (
          <div className="flex justify-between">
            <span className={themed.textSecondary}>{LABELS.UPI_ID}</span>
            <span className={themed.textPrimary}>{payout.upiId}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className={themed.textSecondary}>{LABELS.REQUESTED}</span>
          <span className={themed.textPrimary}>
            {payout.requestedAt ? formatDate(payout.requestedAt) : "—"}
          </span>
        </div>
        {payout.notes && (
          <div className="pt-1 border-t border-dashed border-gray-200 dark:border-gray-700">
            <p className={`text-xs italic ${themed.textSecondary}`}>
              "{payout.notes}"
            </p>
          </div>
        )}
      </div>

      {/* Editable fields */}
      <Select
        label={LABELS.STATUS}
        value={formState.status}
        onChange={(e) =>
          handleChange("status", (e.target as HTMLSelectElement).value)
        }
        options={STATUS_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        }))}
      />

      <Textarea
        label={LABELS.ADMIN_NOTE}
        value={formState.adminNote}
        onChange={(e) => handleChange("adminNote", e.target.value)}
        rows={3}
        placeholder="Add a note about this payout (visible to admin only)"
      />
    </div>
  );
}

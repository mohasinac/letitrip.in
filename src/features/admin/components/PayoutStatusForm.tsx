/**
 * PayoutStatusForm
 * Path: src/components/admin/payouts/PayoutStatusForm.tsx
 *
 * Form for updating payout status and adding an admin note.
 * Shown inside a SideDrawer on the admin payouts page.
 */

"use client";

import { useState } from "react";
import { Button, Select, Span, Text, Textarea } from "@/components";
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
          <Span className={themed.textSecondary}>{LABELS.SELLER}</Span>
          <Span className={`font-medium ${themed.textPrimary}`}>
            {payout.sellerName}
          </Span>
        </div>
        <div className="flex justify-between">
          <Span className={themed.textSecondary}>{LABELS.AMOUNT}</Span>
          <Span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(payout.amount)}
          </Span>
        </div>
        <div className="flex justify-between">
          <Span className={themed.textSecondary}>{LABELS.GROSS_AMOUNT}</Span>
          <Span className={`${themed.textPrimary} tabular-nums`}>
            {formatCurrency(payout.grossAmount)}
          </Span>
        </div>
        <div className="flex justify-between">
          <Span className={themed.textSecondary}>{LABELS.PLATFORM_FEE}</Span>
          <Span className={`${themed.textPrimary} tabular-nums`}>
            {formatCurrency(payout.platformFee)}
          </Span>
        </div>
        <div className="flex justify-between">
          <Span className={themed.textSecondary}>{LABELS.METHOD}</Span>
          <Span className={themed.textPrimary}>
            {payout.paymentMethod === "bank_transfer"
              ? LABELS.PAYMENT_METHOD_BANK
              : LABELS.PAYMENT_METHOD_UPI}
          </Span>
        </div>
        {payout.paymentMethod === "bank_transfer" && payout.bankAccount && (
          <>
            <div className="flex justify-between">
              <Span className={themed.textSecondary}>
                {LABELS.BANK_DETAILS}
              </Span>
              <Span className={themed.textPrimary}>
                {payout.bankAccount.bankName}
              </Span>
            </div>
            <div className="flex justify-between">
              <Span className={themed.textSecondary}>
                {LABELS.ACCOUNT_MASKED}
              </Span>
              <Span className={`font-mono ${themed.textPrimary}`}>
                ****{payout.bankAccount.accountNumberMasked}
              </Span>
            </div>
            <div className="flex justify-between">
              <Span className={themed.textSecondary}>{LABELS.IFSC}</Span>
              <Span className={`font-mono ${themed.textPrimary}`}>
                {payout.bankAccount.ifscCode}
              </Span>
            </div>
          </>
        )}
        {payout.paymentMethod === "upi" && payout.upiId && (
          <div className="flex justify-between">
            <Span className={themed.textSecondary}>{LABELS.UPI_ID}</Span>
            <Span className={themed.textPrimary}>{payout.upiId}</Span>
          </div>
        )}
        <div className="flex justify-between">
          <Span className={themed.textSecondary}>{LABELS.REQUESTED}</Span>
          <Span className={themed.textPrimary}>
            {payout.requestedAt ? formatDate(payout.requestedAt) : "—"}
          </Span>
        </div>
        {payout.notes && (
          <div className={`pt-1 border-t border-dashed ${themed.border}`}>
            <Text variant="secondary" size="xs" className="italic">
              "{payout.notes}"
            </Text>
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

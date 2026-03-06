"use client";

import { useState } from "react";
import { Card, Button, Heading, Text } from "@/components";
import { Alert } from "@/components/feedback";
import { FormField } from "@/components/FormField";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { PayoutSummary } from "./SellerPayoutStats";

const { themed, spacing, typography, flex } = THEME_CONSTANTS;

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
  const t = useTranslations("sellerPayouts");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");
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
        <Alert variant="info">{t("alreadyPending")}</Alert>
      </Card>
    );
  }

  if (summary.availableEarnings <= 0) {
    return (
      <Card className={`${spacing.padding.lg} mb-8`}>
        <Alert variant="info">{t("noEarnings")}</Alert>
      </Card>
    );
  }

  return (
    <Card className={`${spacing.padding.lg} mb-8`}>
      <div className={`${flex.between} mb-4`}>
        <div>
          <Heading level={2}>{t("requestPayout")}</Heading>
          <Text size="sm" variant="secondary" className="mt-1">
            {t("platformFee", { rate: summary.platformFeeRate * 100 })} &middot;{" "}
            {t("grossAmount")}: {formatCurrency(summary.grossEarnings)} &middot;{" "}
            {t("netAmount")}: {formatCurrency(summary.availableEarnings)}
          </Text>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            {t("requestPayout")}
          </Button>
        )}
      </div>

      {showForm && (
        <div className={`${spacing.stack} border-t ${themed.border} pt-4`}>
          <FormField
            type="select"
            name="paymentMethod"
            label={t("paymentMethodLabel")}
            value={paymentMethod}
            onChange={(v) => setPaymentMethod(v as "bank_transfer" | "upi")}
            options={[
              { value: "bank_transfer", label: t("paymentMethodBank") },
              { value: "upi", label: t("paymentMethodUpi") },
            ]}
          />

          {paymentMethod === "bank_transfer" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                name="accountHolderName"
                label={t("bankHolderName")}
                value={bankForm.accountHolderName}
                onChange={(v) =>
                  setBankForm((f) => ({ ...f, accountHolderName: v }))
                }
              />
              <FormField
                name="accountNumberMasked"
                label={t("bankAccountNumber")}
                value={bankForm.accountNumberMasked}
                onChange={(v) =>
                  setBankForm((f) => ({ ...f, accountNumberMasked: v }))
                }
              />
              <FormField
                name="ifscCode"
                label={t("bankIfsc")}
                value={bankForm.ifscCode}
                onChange={(v) => setBankForm((f) => ({ ...f, ifscCode: v }))}
              />
              <FormField
                name="bankName"
                label={t("bankName")}
                value={bankForm.bankName}
                onChange={(v) => setBankForm((f) => ({ ...f, bankName: v }))}
              />
            </div>
          ) : (
            <FormField
              name="upiId"
              label={t("upiIdLabel")}
              value={upiId}
              onChange={(v) => setUpiId(v)}
            />
          )}

          <FormField
            name="notes"
            label={t("notesLabel")}
            value={notes}
            onChange={(v) => setNotes(v)}
          />

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              {tActions("cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? tLoading("default") : tActions("submit")}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

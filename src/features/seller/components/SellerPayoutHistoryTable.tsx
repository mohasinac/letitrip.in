"use client";

import { useState } from "react";
import { Heading, Text } from "@mohasinac/appkit/ui";
import { Card, Badge, DataTable } from "@/components";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";

const { themed, spacing } = THEME_CONSTANTS;

export interface PayoutRecord {
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

const STATUS_VARIANT: Record<
  PayoutRecord["status"],
  "pending" | "info" | "success" | "danger"
> = {
  pending: "pending",
  processing: "info",
  completed: "success",
  failed: "danger",
};

interface SellerPayoutHistoryTableProps {
  payouts: PayoutRecord[];
  isLoading: boolean;
}

export function SellerPayoutHistoryTable({
  payouts,
  isLoading,
}: SellerPayoutHistoryTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const t = useTranslations("sellerPayouts");
  const STATUS_LABEL: Record<PayoutRecord["status"], string> = {
    pending: t("statusPending"),
    processing: t("statusProcessing"),
    completed: t("statusCompleted"),
    failed: t("statusFailed"),
  };

  const columns = [
    {
      key: "grossAmount" as const,
      header: t("grossAmount"),
      render: (p: PayoutRecord) => formatCurrency(p.grossAmount),
    },
    {
      key: "platformFee" as const,
      header: t("platformFeeLabel"),
      render: (p: PayoutRecord) => formatCurrency(p.platformFee),
    },
    {
      key: "amount" as const,
      header: t("netAmount"),
      render: (p: PayoutRecord) => (
        <Text weight="semibold">{formatCurrency(p.amount)}</Text>
      ),
    },
    {
      key: "paymentMethod" as const,
      header: t("paymentMethodLabel"),
      render: (p: PayoutRecord) =>
        p.paymentMethod === "bank_transfer"
          ? t("paymentMethodBank")
          : t("paymentMethodUpi"),
    },
    {
      key: "status" as const,
      header: t("status"),
      render: (p: PayoutRecord) => (
        <Badge variant={STATUS_VARIANT[p.status]}>
          {STATUS_LABEL[p.status]}
        </Badge>
      ),
    },
    {
      key: "requestedAt" as const,
      header: t("requested"),
      render: (p: PayoutRecord) => formatDate(new Date(p.requestedAt)),
    },
  ];
  return (
    <div>
      <Heading level={2} className="mb-4">
        {t("historyTitle")}
      </Heading>

      {isLoading ? (
        <Text variant="secondary">{t("loading")}</Text>
      ) : payouts.length === 0 ? (
        <Card className={`p-6 text-center`}>
          <Text variant="secondary" weight="medium">
            {t("noPayouts")}
          </Text>
          <Text size="sm" variant="secondary" className="mt-1">
            {t("noPayoutsDesc")}
          </Text>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={payouts}
          loading={isLoading}
          keyExtractor={(p) => p.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}
    </div>
  );
}

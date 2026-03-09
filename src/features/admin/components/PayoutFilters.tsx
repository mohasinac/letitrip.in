"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection, RangeFilter } from "@/components";
import type { UrlTable } from "@/components";

export const PAYOUT_SORT_OPTIONS = [
  { value: "-requestedAt", label: "Most Recent Request" },
  { value: "requestedAt", label: "Oldest Request" },
  { value: "-processedAt", label: "Most Recently Processed" },
  { value: "-amount", label: "Highest Amount" },
  { value: "amount", label: "Lowest Amount" },
  { value: "sellerName", label: "Seller Name A–Z" },
  { value: "-createdAt", label: "Newest First" },
] as const;

export interface PayoutFiltersProps {
  table: UrlTable;
}

export function PayoutFilters({ table }: PayoutFiltersProps) {
  const t = useTranslations("filters");

  const statusOptions = [
    { value: "pending", label: t("payoutStatusPending") },
    { value: "processing", label: t("payoutStatusProcessing") },
    { value: "completed", label: t("payoutStatusCompleted") },
    { value: "failed", label: t("payoutStatusFailed") },
  ];

  const paymentMethodOptions = [
    { value: "bank_transfer", label: t("payoutMethodBankTransfer") },
    { value: "upi", label: t("payoutMethodUpi") },
  ];

  const selectedStatus = table.get("status")
    ? table.get("status").split("|").filter(Boolean)
    : [];
  const selectedPaymentMethod = table.get("paymentMethod")
    ? table.get("paymentMethod").split("|").filter(Boolean)
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("status")}
        options={statusOptions}
        selected={selectedStatus}
        onChange={(vals) => table.set("status", vals.join("|"))}
        searchable={false}
        defaultCollapsed={false}
      />

      <FilterFacetSection
        title={t("payoutPaymentMethod")}
        options={paymentMethodOptions}
        selected={selectedPaymentMethod}
        onChange={(vals) => table.set("paymentMethod", vals.join("|"))}
        searchable={false}
        defaultCollapsed={true}
      />

      <RangeFilter
        title={t("amountRange")}
        type="number"
        minValue={table.get("minAmount")}
        maxValue={table.get("maxAmount")}
        onMinChange={(v) => table.set("minAmount", v)}
        onMaxChange={(v) => table.set("maxAmount", v)}
        prefix="₹"
        showSlider
        minBound={0}
        maxBound={500000}
        step={500}
        minPlaceholder={t("minAmount")}
        maxPlaceholder={t("maxAmount")}
        defaultCollapsed={true}
      />
    </div>
  );
}

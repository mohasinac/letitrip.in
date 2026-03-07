"use client";

import { FormField } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import type { SaleConfig } from "@/db/schema";

const { spacing } = THEME_CONSTANTS;

interface SaleConfigFormProps {
  value: Partial<SaleConfig>;
  onChange: (v: Partial<SaleConfig>) => void;
}

export function SaleConfigForm({ value, onChange }: SaleConfigFormProps) {
  const set = <K extends keyof SaleConfig>(k: K, v: SaleConfig[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className={spacing.stack}>
      <FormField
        label="Discount Percent"
        name="discountPercent"
        type="number"
        value={String(value.discountPercent ?? "")}
        onChange={(v) => set("discountPercent", v ? Number(v) : 0)}
        placeholder="e.g. 20"
      />
      <FormField
        label="Banner Text (optional)"
        name="bannerText"
        type="text"
        value={value.bannerText ?? ""}
        onChange={(v) => set("bannerText", v)}
        placeholder="e.g. 20% Off Everything"
      />
    </div>
  );
}

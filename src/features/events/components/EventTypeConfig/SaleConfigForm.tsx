"use client";

import { FormGroup } from "@mohasinac/appkit/ui";
import { FormField } from "@/components";
import type { SaleConfig } from "@/db/schema";

interface SaleConfigFormProps {
  value: Partial<SaleConfig>;
  onChange: (v: Partial<SaleConfig>) => void;
}

export function SaleConfigForm({ value, onChange }: SaleConfigFormProps) {
  const set = <K extends keyof SaleConfig>(k: K, v: SaleConfig[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <FormGroup columns={2}>
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
    </FormGroup>
  );
}

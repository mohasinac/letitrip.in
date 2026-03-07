"use client";

import { FormField } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import type { OfferConfig } from "@/db/schema";

const { spacing } = THEME_CONSTANTS;

interface OfferConfigFormProps {
  value: Partial<OfferConfig>;
  onChange: (v: Partial<OfferConfig>) => void;
}

export function OfferConfigForm({ value, onChange }: OfferConfigFormProps) {
  const set = <K extends keyof OfferConfig>(k: K, v: OfferConfig[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className={spacing.stack}>
      <FormField
        label="Coupon ID"
        name="couponId"
        type="text"
        value={value.couponId ?? ""}
        onChange={(v) => set("couponId", v)}
        placeholder="Coupon document ID"
      />
      <FormField
        label="Display Code"
        name="displayCode"
        type="text"
        value={value.displayCode ?? ""}
        onChange={(v) => set("displayCode", v)}
        placeholder="Visible code (e.g. SAVE20)"
      />
      <FormField
        label="Banner Text (optional)"
        name="bannerText"
        type="text"
        value={value.bannerText ?? ""}
        onChange={(v) => set("bannerText", v)}
        placeholder="Override display text"
      />
    </div>
  );
}

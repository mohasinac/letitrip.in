"use client";

import { FormGroup } from "@mohasinac/appkit/ui";
import { FormFieldSpan } from "@mohasinac/appkit/ui";
import { FormField } from "@/components";
import type { OfferConfig } from "@/db/schema";

interface OfferConfigFormProps {
  value: Partial<OfferConfig>;
  onChange: (v: Partial<OfferConfig>) => void;
}

export function OfferConfigForm({ value, onChange }: OfferConfigFormProps) {
  const set = <K extends keyof OfferConfig>(k: K, v: OfferConfig[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <FormGroup columns={2}>
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
      <FormFieldSpan>
        <FormField
          label="Banner Text (optional)"
          name="bannerText"
          type="text"
          value={value.bannerText ?? ""}
          onChange={(v) => set("bannerText", v)}
          placeholder="Override display text"
        />
      </FormFieldSpan>
    </FormGroup>
  );
}

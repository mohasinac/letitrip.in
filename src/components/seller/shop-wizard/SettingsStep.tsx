"use client";

import { FormField, FormInput, FormCheckbox } from "@/components/forms";
import type { ShopFormData, OnShopChange } from "./types";

interface SettingsStepProps {
  formData: ShopFormData;
  onChange: OnShopChange;
  errors: Record<string, string>;
}

export default function SettingsStep({
  formData,
  onChange,
  errors,
}: SettingsStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Default Shipping Fee (₹)"
          id="defaultShippingFee"
          optional
          error={errors.defaultShippingFee}
        >
          <FormInput
            type="number"
            min={0}
            step={1}
            value={formData.defaultShippingFee ?? ""}
            onChange={(e) =>
              onChange(
                "defaultShippingFee",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="e.g. 99"
          />
        </FormField>
        <FormField
          label="Support Email"
          id="supportEmail"
          optional
          error={errors.supportEmail}
        >
          <FormInput
            type="email"
            value={formData.supportEmail || ""}
            onChange={(e) => onChange("supportEmail", e.target.value)}
            placeholder="support@yourshop.com"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormCheckbox
          label="Enable COD"
          checked={!!formData.enableCOD}
          onChange={(e) => onChange("enableCOD", e.target.checked)}
        />
        <FormCheckbox
          label="Enable Returns"
          checked={!!formData.enableReturns}
          onChange={(e) => onChange("enableReturns", e.target.checked)}
        />
        <FormCheckbox
          label="Show Contact Info"
          checked={!!formData.showContact}
          onChange={(e) => onChange("showContact", e.target.checked)}
        />
      </div>
    </div>
  );
}

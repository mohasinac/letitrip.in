/**
 * @fileoverview React Component
 * @module src/components/seller/shop-wizard/SettingsStep
 * @description This file contains the SettingsStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import type { ShopFormData, OnShopChange } from "./types";

/**
 * SettingsStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for SettingsStepProps
 */
interface SettingsStepProps {
  /** Form Data */
  formData: ShopFormData;
  /** On Change */
  onChange: OnShopChange;
  /** Errors */
  errors: Record<string, string>;
}

export default /**
 * Sets tings step
 *
 * @param {SettingsStepProps} {
  formData,
  onChange,
  errors,
} - The {
  formdata,
  onchange,
  errors,
}
 *
 * @returns {any} The settingsstep result
 *
 */
function SettingsStep({
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
                e.target.value ? Number(e.target.value) : undefined,
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

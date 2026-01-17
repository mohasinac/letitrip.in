"use client";

import { FormField } from "@letitrip/react-library";
import { FormTextarea } from "@letitrip/react-library";
import type { ShopFormData, OnShopChange } from "./types";

interface PoliciesStepProps {
  formData: ShopFormData;
  onChange: OnShopChange;
  errors: Record<string, string>;
}

export default function PoliciesStep({
  formData,
  onChange,
  errors,
}: PoliciesStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        label="Return Policy"
        id="returnPolicy"
        required
        error={errors.returnPolicy}
      >
        <FormTextarea
          value={formData.returnPolicy || ""}
          onChange={(e) => onChange("returnPolicy", e.target.value)}
          placeholder="Outline return timelines, conditions, and steps"
          rows={6}
        />
      </FormField>
      <FormField
        label="Shipping Policy"
        id="shippingPolicy"
        required
        error={errors.shippingPolicy}
      >
        <FormTextarea
          value={formData.shippingPolicy || ""}
          onChange={(e) => onChange("shippingPolicy", e.target.value)}
          placeholder="Dispatch times, carriers, coverage, and tracking info"
          rows={6}
        />
      </FormField>
      <FormField label="Terms of Service" id="tos" optional error={errors.tos}>
        <FormTextarea
          value={formData.tos || ""}
          onChange={(e) => onChange("tos", e.target.value)}
          placeholder="Optional: Add your shop-specific terms"
          rows={6}
        />
      </FormField>
      <FormField
        label="Privacy Policy"
        id="privacy"
        optional
        error={errors.privacy}
      >
        <FormTextarea
          value={formData.privacy || ""}
          onChange={(e) => onChange("privacy", e.target.value)}
          placeholder="Optional: Data handling and contact preferences"
          rows={6}
        />
      </FormField>
    </div>
  );
}

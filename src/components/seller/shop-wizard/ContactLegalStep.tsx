"use client";

import { FormField, FormInput } from "@/components/forms";
import { AddressSelectorWithCreate } from "@/components/common/AddressSelectorWithCreate";
import type { ShopFormData, OnShopChange } from "./types";

interface ContactLegalStepProps {
  formData: ShopFormData;
  onChange: OnShopChange;
  errors: Record<string, string>;
}

export default function ContactLegalStep({
  formData,
  onChange,
  errors,
}: ContactLegalStepProps) {
  return (
    <div className="space-y-6">
      {/* Business Address */}
      <AddressSelectorWithCreate
        value={formData.businessAddressId || ""}
        onChange={(addressId, addressData) => {
          onChange("businessAddressId", addressId);
          // Store formatted address as fallback
          if (addressData) {
            onChange(
              "address",
              `${addressData.line1}, ${addressData.city}, ${addressData.state}, ${addressData.pincode}`,
            );
          }
        }}
        label="Business Address"
        required
        error={errors.address}
        filterByType="work"
        helperText="Select or create your business address"
      />

      {/* Legal Information (Optional) */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Legal Information (Optional)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            label="GSTIN"
            id="gstin"
            optional
            hint="Indian GST number"
            error={errors.gstin}
          >
            <FormInput
              value={formData.gstin || ""}
              onChange={(e) => onChange("gstin", e.target.value)}
              placeholder="22AAAAA0000A1Z5"
            />
          </FormField>
          <FormField label="PAN" id="pan" optional error={errors.pan}>
            <FormInput
              value={formData.pan || ""}
              onChange={(e) => onChange("pan", e.target.value)}
              placeholder="ABCDE1234F"
            />
          </FormField>
          <FormField label="CIN" id="cin" optional error={errors.cin}>
            <FormInput
              value={formData.cin || ""}
              onChange={(e) => onChange("cin", e.target.value)}
              placeholder="U12345AB1234PLC123456"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

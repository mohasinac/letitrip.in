/**
 * @fileoverview React Component
 * @module src/components/seller/shop-wizard/ContactLegalStep
 * @description This file contains the ContactLegalStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { AddressSelectorWithCreate } from "@/components/common/AddressSelectorWithCreate";
import type { ShopFormData, OnShopChange } from "./types";

/**
 * ContactLegalStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ContactLegalStepProps
 */
interface ContactLegalStepProps {
  /** Form Data */
  formData: ShopFormData;
  /** On Change */
  onChange: OnShopChange;
  /** Errors */
  errors: Record<string, string>;
}

export default /**
 * Performs contact legal step operation
 *
 * @param {ContactLegalStepProps} {
  formData,
  onChange,
  errors,
} - The {
  formdata,
  onchange,
  errors,
}
 *
 * @returns {any} The contactlegalstep result
 *
 */
function ContactLegalStep({
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
              `${addressData.addressLine1}, ${addressData.city}, ${addressData.state}, ${addressData.postalCode}`,
            );
          }
        }}
        label="Business Address"
        required
        error={errors.address}
        filterType="work"
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

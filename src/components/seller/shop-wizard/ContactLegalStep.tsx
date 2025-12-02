"use client";

import { FormField, FormInput, FormTextarea } from "@/components/forms";
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Phone" id="phone" required error={errors.phone}>
          <FormInput
            value={formData.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+91 98765 43210"
          />
        </FormField>
        <FormField label="Email" id="email" required error={errors.email}>
          <FormInput
            type="email"
            value={formData.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="you@example.com"
          />
        </FormField>
      </div>

      <FormField label="Address" id="address" required error={errors.address}>
        <FormTextarea
          value={formData.address || ""}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Street, City, State, Pincode"
        />
      </FormField>

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
          />
        </FormField>
        <FormField label="PAN" id="pan" optional error={errors.pan}>
          <FormInput
            value={formData.pan || ""}
            onChange={(e) => onChange("pan", e.target.value)}
          />
        </FormField>
        <FormField label="CIN" id="cin" optional error={errors.cin}>
          <FormInput
            value={formData.cin || ""}
            onChange={(e) => onChange("cin", e.target.value)}
          />
        </FormField>
      </div>
    </div>
  );
}

"use client";

import { FormInput } from "@/components/forms/FormInput";
import type { ShopFormData, OnChange } from "./types";

interface BankingStepProps {
  formData: ShopFormData;
  onChange: OnChange;
}

export default function BankingStep({ formData, onChange }: BankingStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInput
        id="payout-account-holder"
        label="Account Holder Name"
        value={formData.accountHolderName || ""}
        onChange={(e) => onChange("accountHolderName", e.target.value)}
        placeholder="As per bank records"
      />

      <FormInput
        id="payout-bank-name"
        label="Bank Name"
        value={formData.bankName || ""}
        onChange={(e) => onChange("bankName", e.target.value)}
        placeholder="Bank name"
      />

      <FormInput
        id="payout-account-number"
        label="Account Number"
        value={formData.accountNumber || ""}
        onChange={(e) => onChange("accountNumber", e.target.value)}
        placeholder="Enter account number"
      />

      <FormInput
        id="payout-ifsc"
        label="IFSC Code"
        value={formData.ifsc || ""}
        onChange={(e) => onChange("ifsc", e.target.value)}
        placeholder="e.g., HDFC0001234"
      />
    </div>
  );
}

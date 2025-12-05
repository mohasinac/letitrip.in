/**
 * @fileoverview React Component
 * @module src/components/seller/shop-wizard/BankingStep
 * @description This file contains the BankingStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { FormInput } from "@/components/forms/FormInput";
import type { ShopFormData, OnChange } from "./types";

/**
 * BankingStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for BankingStepProps
 */
interface BankingStepProps {
  /** Form Data */
  formData: ShopFormData;
  /** On Change */
  onChange: OnChange;
}

export default /**
 * Performs banking step operation
 *
 * @param {BankingStepProps} { formData, onChange } - The { formdata, onchange }
 *
 * @returns {any} The bankingstep result
 *
 */
function BankingStep({ formData, onChange }: BankingStepProps) {
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

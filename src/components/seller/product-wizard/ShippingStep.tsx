"use client";

import { FormInput, FormLabel, FormTextarea } from "@/components/forms";
import { AddressSelectorWithCreate } from "@/components/common/AddressSelectorWithCreate";
import type { StepProps } from "./types";
import type { AddressFE } from "@/types/frontend/address.types";

export function ShippingStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Shipping & Returns
      </h2>

      {/* Pickup Address */}
      <div>
        <FormLabel required>Pickup Address</FormLabel>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Select the address from where this product will be shipped
        </p>
        <AddressSelectorWithCreate
          value={formData.pickupAddressId}
          onChange={(addressId: string, _address: AddressFE) => {
            setFormData({ ...formData, pickupAddressId: addressId });
          }}
          filterType="work"
          required
          label="Pickup Address"
          autoSelectDefault={true}
        />
      </div>

      {/* Shipping Class */}
      <div>
        <FormLabel required>Shipping Class</FormLabel>
        <select
          value={formData.shippingClass}
          onChange={(e) =>
            setFormData({
              ...formData,
              shippingClass: e.target.value as
                | "standard"
                | "express"
                | "free"
                | "fragile",
            })
          }
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          required
        >
          <option value="standard">Standard Shipping</option>
          <option value="express">Express Shipping</option>
          <option value="free">Free Shipping</option>
          <option value="fragile">Fragile Shipping</option>
        </select>
      </div>

      {/* Weight */}
      <FormInput
        id="product-weight"
        label="Weight (kg)"
        type="number"
        step="0.01"
        min="0"
        required
        value={formData.weight}
        onChange={(e) =>
          setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })
        }
        placeholder="Enter weight in kg"
      />

      {/* Return Policy */}
      <FormTextarea
        id="product-return-policy"
        label="Return Policy"
        value={formData.returnPolicy}
        onChange={(e) =>
          setFormData({ ...formData, returnPolicy: e.target.value })
        }
        placeholder="Describe your return policy"
        rows={3}
      />

      {/* Warranty Info */}
      <FormTextarea
        id="product-warranty-info"
        label="Warranty Information"
        value={formData.warrantyInfo}
        onChange={(e) =>
          setFormData({ ...formData, warrantyInfo: e.target.value })
        }
        placeholder="Describe warranty details"
        rows={3}
      />
    </div>
  );
}

"use client";

import { FormLabel, FormTextarea } from "@/components/forms";
import { AddressSelectorWithCreate } from "@/components/common/AddressSelectorWithCreate";
import type { StepProps } from "./types";
import type { AddressFE } from "@/types/frontend/address.types";

export function PickupStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Pickup & Shipping
      </h2>

      {/* Pickup Address */}
      <div>
        <FormLabel required>Pickup Address</FormLabel>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Select the address from where the winning bidder will pick up the item
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

      {/* Shipping Terms */}
      <FormTextarea
        id="auction-shipping-terms"
        label="Shipping Terms"
        value={formData.shippingTerms}
        onChange={(e) =>
          setFormData({ ...formData, shippingTerms: e.target.value })
        }
        placeholder="Describe shipping options, costs, and any special handling requirements"
        rows={4}
        helperText="Let bidders know if shipping is available, who pays for it, and any restrictions"
      />

      {/* Return Policy */}
      <FormTextarea
        id="auction-return-policy"
        label="Return Policy"
        value={formData.returnPolicy}
        onChange={(e) =>
          setFormData({ ...formData, returnPolicy: e.target.value })
        }
        placeholder="Describe your return policy for this auction"
        rows={3}
        helperText="Be clear about returns, refunds, and any inspection period"
      />
    </div>
  );
}

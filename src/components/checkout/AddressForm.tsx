"use client";

import type { AddressFE } from "@/types/frontend/address.types";
import { SmartAddressForm } from "@letitrip/react-library";

interface AddressFormProps {
  addressId?: string | null;
  onClose: () => void;
  onSuccess?: (address: AddressFE) => void;
}

/**
 * AddressForm - Wrapper around SmartAddressForm for checkout flow
 * Uses the full-featured SmartAddressForm with GPS, pincode lookup, and state selector
 */
export function AddressForm({
  addressId,
  onClose,
  onSuccess,
}: AddressFormProps) {
  return (
    <SmartAddressForm
      addressId={addressId}
      onClose={onClose}
      onSuccess={onSuccess}
      mode="modal"
      showGPS={true}
    />
  );
}

export default AddressForm;

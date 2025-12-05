/**
 * @fileoverview React Component
 * @module src/components/checkout/AddressForm
 * @description This file contains the AddressForm component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { SmartAddressForm } from "@/components/common/SmartAddressForm";
import type { AddressFE } from "@/types/frontend/address.types";

/**
 * AddressFormProps interface
 * 
 * @interface
 * @description Defines the structure and contract for AddressFormProps
 */
interface AddressFormProps {
  /** Address Id */
  addressId?: string | null;
  /** On Close */
  onClose: () => void;
  /** On Success */
  onSuccess?: (address: AddressFE) => void;
}

/**
 * AddressForm - Wrapper around SmartAddressForm for checkout flow
 * Uses the full-featured SmartAddressForm with GPS, pincode lookup, and state selector
 */
/**
 * Performs address form operation
 *
 * @param {AddressFormProps} {
  addressId,
  onClose,
  onSuccess,
} - The {
  address id,
  on close,
  on success,
}
 *
 * @returns {any} The addressform result
 *
 * @example
 * AddressForm({
  addressId,
  onClose,
  onSuccess,
});
 */

/**
 * Performs address form operation
 *
 * @param {AddressFormProps} {
  addressId,
  onClose,
  onSuccess,
} - The {
  address id,
  on close,
  on success,
}
 *
 * @returns {any} The addressform result
 *
 * @example
 * AddressForm({
  addressId,
  onClose,
  onSuccess,
});
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

/**
 * Address Validation Helper
 *
 * Reusable validation logic for address forms
 */

import { isRequired, isValidIndianMobile, isValidIndianPincode } from "@/utils";
import { ERROR_MESSAGES } from "@/constants";

/**
 * Address form data structure
 */
export interface AddressFormData {
  fullName: string;
  phoneNumber: string;
  pincode: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  addressType: string;
  isDefault: boolean;
}

/**
 * Validates address form data
 *
 * @param formData - The address form data to validate
 * @returns Object containing validation errors (empty if valid)
 *
 * @example
 * ```typescript
 * const errors = validateAddressForm(formData);
 * if (Object.keys(errors).length === 0) {
 *   // Form is valid, proceed with submission
 * }
 * ```
 */
export function validateAddressForm(
  formData: AddressFormData,
): Record<string, string> {
  const errors: Record<string, string> = {};

  // Full Name validation
  if (!isRequired(formData.fullName)) {
    errors.fullName = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
  }

  // Phone Number validation
  if (!isRequired(formData.phoneNumber)) {
    errors.phoneNumber = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
  } else if (!isValidIndianMobile(formData.phoneNumber)) {
    errors.phoneNumber = ERROR_MESSAGES.VALIDATION.INVALID_INDIAN_MOBILE;
  }

  // Pincode validation
  if (!isRequired(formData.pincode)) {
    errors.pincode = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
  } else if (!isValidIndianPincode(formData.pincode)) {
    errors.pincode = ERROR_MESSAGES.VALIDATION.INVALID_PINCODE;
  }

  // Address Line 1 validation
  if (!isRequired(formData.addressLine1)) {
    errors.addressLine1 = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
  }

  // City validation
  if (!isRequired(formData.city)) {
    errors.city = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
  }

  // State validation
  if (!isRequired(formData.state)) {
    errors.state = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
  }

  return errors;
}

"use client";

/**
 * useAddressForm Hook
 *
 * Hook for managing address form state and validation
 *
 * @example
 * ```tsx
 * const { formData, errors, handleChange, validate, reset } = useAddressForm(initialData);
 *
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   if (!validate()) return;
 *   // ... save logic
 * };
 * ```
 */

import { useState, useCallback } from "react";
import { validateAddressForm, AddressFormData } from "@/helpers";

const DEFAULT_FORM_DATA: AddressFormData = {
  fullName: "",
  phoneNumber: "",
  pincode: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  addressType: "home",
  isDefault: false,
};

interface UseAddressFormResult {
  formData: AddressFormData;
  errors: Record<string, string>;
  handleChange: (field: keyof AddressFormData, value: string | boolean) => void;
  validate: () => boolean;
  reset: (data?: Partial<AddressFormData>) => void;
  setFormData: React.Dispatch<React.SetStateAction<AddressFormData>>;
}

export function useAddressForm(
  initialData: Partial<AddressFormData> = {},
): UseAddressFormResult {
  const [formData, setFormData] = useState<AddressFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (field: keyof AddressFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors],
  );

  const validate = useCallback(() => {
    const newErrors = validateAddressForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback((data: Partial<AddressFormData> = {}) => {
    setFormData({ ...DEFAULT_FORM_DATA, ...data });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    handleChange,
    validate,
    reset,
    setFormData,
  };
}

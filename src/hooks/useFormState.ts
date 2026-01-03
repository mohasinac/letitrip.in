/**
 * useFormState Hook
 * Manages form state including data, validation errors, and touched fields
 *
 * Purpose: Centralize form field state management to reduce boilerplate
 * Replaces: Multiple useState calls in form components
 *
 * @example
 * const { formData, handleChange, setFieldValue, errors, touched, reset } = useFormState(initialData);
 */

import { useCallback, useState } from "react";

export interface UseFormStateOptions<T> {
  initialData: T;
  onDataChange?: (data: T) => void;
  onValidate?: (data: T) => Record<string, string>;
}

export interface UseFormStateReturn<T> {
  formData: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  setFormData: (data: T | ((prev: T) => T)) => void;
  reset: (newData?: T) => void;
  validate: () => boolean;
  isValid: boolean;
}

export function useFormState<T extends Record<string, any>>({
  initialData,
  onDataChange,
  onValidate,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const finalValue =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

      setFormData((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
      onDataChange?.({ ...formData, [name]: finalValue });

      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [formData, errors, onDataChange]
  );

  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
    },
    []
  );

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      onDataChange?.(formData);
    },
    [formData, onDataChange]
  );

  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, []);

  const reset = useCallback(
    (newData?: T) => {
      setFormData(newData || initialData);
      setErrors({});
      setTouched({});
    },
    [initialData]
  );

  const validate = useCallback(() => {
    if (onValidate) {
      const validationErrors = onValidate(formData);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    }
    return true;
  }, [formData, onValidate]);

  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    errors,
    touched,
    setFieldValue,
    setFieldError,
    handleChange,
    handleBlur,
    setFormData,
    reset,
    validate,
    isValid,
  };
}

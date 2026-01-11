/**
 * useFormState Hook
 * Manages form state including data, validation errors, and touched fields
 *
 * Purpose: Centralize form field state management to reduce boilerplate
 * Replaces: Multiple useState calls in form components
 * Features: Supports Zod schema validation for type-safe form validation
 *
 * @example
 * const { formData, handleChange, setFieldValue, errors, touched, reset } = useFormState(initialData);
 * 
 * @example With Zod Schema
 * const schema = z.object({
 *   email: z.string().email("Invalid email"),
 *   password: z.string().min(8, "Password must be at least 8 characters")
 * });
 * const { formData, handleChange, errors, validate } = useFormState({ 
 *   initialData, 
 *   schema 
 * });
 */

import { useCallback, useState } from "react";
import { z } from "zod";

export interface UseFormStateOptions<T> {
  initialData: T;
  onDataChange?: (data: T) => void;
  onValidate?: (data: T) => Record<string, string>;
  /** Zod schema for type-safe validation */
  schema?: z.ZodSchema<T>;
  /** Validate on change (default: false) */
  validateOnChange?: boolean;
  /** Validate on blur (default: true) */
  validateOnBlur?: boolean;
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
  /** Validate a specific field */
  validateField: (field: keyof T) => boolean;
  isValid: boolean;
  /** Whether the form is currently being validated */
  isValidating: boolean;
}

export function useFormState<T extends Record<string, any>>({
  initialData,
  onDataChange,
  onValidate,
  schema,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validates the entire form using Zod schema or custom validator
   */
  const validateForm = useCallback(
    (data: T): Record<string, string> => {
      if (schema) {
        try {
          schema.parse(data);
          return {};
        } catch (error) {
          if (error instanceof z.ZodError) {
            const fieldErrors: Record<string, string> = {};
            error.errors.forEach((err) => {
              const fieldName = err.path.join(".");
              fieldErrors[fieldName] = err.message;
            });
            return fieldErrors;
          }
        }
      }
      
      if (onValidate) {
        return onValidate(data);
      }
      
      return {};
    },
    [schema, onValidate]
  );

  /**
   * Validates a specific field using Zod schema or custom validator
   */
  const validateSingleField = useCallback(
    (field: keyof T, value: any): string | null => {
      if (schema) {
        try {
          // Create a partial schema for the specific field
          const fieldSchema = (schema as any).shape?.[field];
          if (fieldSchema) {
            fieldSchema.parse(value);
          }
          return null;
        } catch (error) {
          if (error instanceof z.ZodError) {
            return error.errors[0]?.message || "Validation error";
          }
        }
      }
      
      // Fall back to full validation if no field-specific schema
      if (onValidate) {
        const testData = { ...formData, [field]: value };
        const allErrors = onValidate(testData);
        return allErrors[field as string] || null;
      }
      
      return null;
    },
    [schema, onValidate, formData]
  );
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const finalValue =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

      const newData = { ...formData, [name]: finalValue };
      setFormData(newData);
      onDataChange?.(newData);

      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      // Validate on change if enabled
      if (validateOnChange) {
        const error = validateSingleField(name as keyof T, finalValue);
        if (error) {
          setErrors((prev) => ({ ...prev, [name]: error }));
        }
      }
    },
    [formData, errors, onDataChange, validateOnChange, validateSingleField]
  );

  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
const newData = { ...formData, [field]: value };
      setFormData(newData);
      onDataChange?.(newData);

      // Validate field if validateOnChange is enabled
      if (validateOnChange) {
        const error = validateSingleField(field, value);
        if (error) {
          setErrors((prev) => ({ ...prev, [field]: error }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field as string];
            return newErrors;
          });
        }
      }
    },
    [formData, onDataChange, validateOnChange, validateSingleField]
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
    setIsValidating(true);
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    setIsValidating(false);
    return Object.keys(validationErrors).length === 0;
  }, [formData, validateForm]);

  const validateField = useCallback(
    (field: keyof T) => {
      const error = validateSingleField(field, formData[field]);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
        return false;
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        return true;
      }
    },
    [formData, validateSingleField]
  );

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
    validateField,
    isValid,
    isValidating,
  };
}    }
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

/**
 * useFormState Hook
 * Framework-agnostic form state management with validation
 *
 * Purpose: Centralize form field state management to reduce boilerplate
 * Features: Supports async validation with debouncing, field-level validation
 *
 * Note: Zod dependency is optional. Pass schema validator as function instead.
 *
 * @example Basic Usage
 * ```tsx
 * const { formData, handleChange, setFieldValue, errors, touched, reset } = useFormState({
 *   initialData: { email: '', password: '' }
 * });
 * ```
 *
 * @example With Validation
 * ```tsx
 * const { formData, handleChange, errors, validate } = useFormState({
 *   initialData: { email: '', password: '' },
 *   onValidate: (data) => {
 *     const errors: Record<string, string> = {};
 *     if (!data.email) errors.email = 'Email is required';
 *     if (!data.password || data.password.length < 8) errors.password = 'Password must be at least 8 characters';
 *     return errors;
 *   }
 * });
 * ```
 *
 * @example With Async Validation
 * ```tsx
 * const { formData, handleChange, errors, validatingFields } = useFormState({
 *   initialData: { email: '' },
 *   asyncValidators: {
 *     email: async (value) => {
 *       const exists = await checkEmailExists(value);
 *       return exists ? 'Email already taken' : null;
 *     }
 *   },
 *   debounceMs: 500
 * });
 * ```
 *
 * @example With Custom Schema Validator (e.g., Zod)
 * ```tsx
 * import { z } from 'zod';
 *
 * const schema = z.object({
 *   email: z.string().email("Invalid email"),
 *   password: z.string().min(8, "Password must be at least 8 characters")
 * });
 *
 * const { formData, handleChange, errors, validate } = useFormState({
 *   initialData,
 *   schema: (data) => {
 *     try {
 *       schema.parse(data);
 *       return {};
 *     } catch (error) {
 *       if (error instanceof z.ZodError) {
 *         const fieldErrors: Record<string, string> = {};
 *         error.errors.forEach((err) => {
 *           const fieldName = err.path.join(".");
 *           fieldErrors[fieldName] = err.message;
 *         });
 *         return fieldErrors;
 *       }
 *       return {};
 *     }
 *   }
 * });
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncValidator<T = any> = (
  value: T,
  formData: Record<string, any>
) => Promise<string | null>;

export interface UseFormStateOptions<T> {
  /** Initial form data */
  initialData: T;
  /** Called when form data changes */
  onDataChange?: (data: T) => void;
  /** Synchronous validation function */
  onValidate?: (data: T) => Record<string, string>;
  /** Schema validator function (can be Zod or any other validator) */
  schema?: (data: T) => Record<string, string>;
  /** Async validators for specific fields */
  asyncValidators?: Partial<Record<keyof T, AsyncValidator>>;
  /** Debounce delay for async validation in milliseconds (default: 300) */
  debounceMs?: number;
  /** Validate on change (default: false) */
  validateOnChange?: boolean;
  /** Validate on blur (default: true) */
  validateOnBlur?: boolean;
}

export interface UseFormStateReturn<T> {
  /** Current form data */
  formData: T;
  /** Validation errors by field name */
  errors: Record<string, string>;
  /** Touched fields by field name */
  touched: Record<string, boolean>;
  /** Fields currently being validated asynchronously */
  validatingFields: Record<string, boolean>;
  /** Set value for a specific field */
  setFieldValue: (field: keyof T, value: any) => void;
  /** Set error for a specific field */
  setFieldError: (field: keyof T, error: string | null) => void;
  /** Handle input change event */
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  /** Handle input blur event */
  handleBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  /** Set entire form data */
  setFormData: (data: T | ((prev: T) => T)) => void;
  /** Reset form to initial or provided data */
  reset: (newData?: T) => void;
  /** Validate entire form */
  validate: () => Promise<boolean>;
  /** Validate a specific field (async if async validator exists) */
  validateField: (field: keyof T) => Promise<boolean>;
  /** Whether the form is valid (no errors) */
  isValid: boolean;
  /** Whether the form is currently being validated */
  isValidating: boolean;
}

export function useFormState<T extends Record<string, any>>({
  initialData,
  onDataChange,
  onValidate,
  schema,
  asyncValidators = {},
  debounceMs = 300,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validatingFields, setValidatingFields] = useState<
    Record<string, boolean>
  >({});

  // Debounce timers for async validation
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );
  // Abort controllers for canceling async validations
  const abortControllers = useRef<Record<string, AbortController>>({});

  /**
   * Validates the entire form using schema or custom validator
   */
  const validateForm = useCallback(
    (data: T): Record<string, string> => {
      if (schema) {
        return schema(data);
      }

      if (onValidate) {
        return onValidate(data);
      }

      return {};
    },
    [schema, onValidate]
  );

  /**
   * Runs async validation for a specific field
   */
  const runAsyncValidation = useCallback(
    async (field: keyof T, value: any): Promise<string | null> => {
      const asyncValidator = asyncValidators[field];
      if (!asyncValidator) return null;

      // Cancel previous validation for this field
      if (abortControllers.current[field as string]) {
        abortControllers.current[field as string].abort();
      }

      // Create new abort controller
      const controller = new AbortController();
      abortControllers.current[field as string] = controller;

      // Set validating state
      setValidatingFields((prev) => ({ ...prev, [field]: true }));

      try {
        const error = await asyncValidator(value, formData);

        // Check if validation was aborted
        if (controller.signal.aborted) {
          return null;
        }

        // Clear validating state
        setValidatingFields((prev) => {
          const newState = { ...prev };
          delete newState[field as string];
          return newState;
        });

        return error;
      } catch (err) {
        // Clear validating state
        setValidatingFields((prev) => {
          const newState = { ...prev };
          delete newState[field as string];
          return newState;
        });

        // If error is due to abort, return null
        if ((err as Error).name === "AbortError") {
          return null;
        }

        // Otherwise, return generic error
        return "Validation failed";
      }
    },
    [asyncValidators, formData]
  );

  /**
   * Validates a field with debouncing for async validators
   */
  const validateFieldDebounced = useCallback(
    (field: keyof T, value: any) => {
      // Clear previous debounce timer
      if (debounceTimers.current[field as string]) {
        clearTimeout(debounceTimers.current[field as string]);
      }

      // Run sync validation immediately
      const testData = { ...formData, [field]: value };
      const syncErrors = validateForm(testData);
      const syncError = syncErrors[field as string];

      if (syncError) {
        setErrors((prev) => ({ ...prev, [field]: syncError }));
        return;
      } else {
        // Clear sync error
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }

      // If async validator exists, debounce it
      if (asyncValidators[field]) {
        debounceTimers.current[field as string] = setTimeout(async () => {
          const asyncError = await runAsyncValidation(field, value);
          if (asyncError) {
            setErrors((prev) => ({ ...prev, [field]: asyncError }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[field as string];
              return newErrors;
            });
          }
        }, debounceMs);
      }
    },
    [formData, validateForm, asyncValidators, runAsyncValidation, debounceMs]
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
        validateFieldDebounced(name as keyof T, finalValue);
      }
    },
    [formData, errors, onDataChange, validateOnChange, validateFieldDebounced]
  );

  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validate on blur if enabled
      if (validateOnBlur) {
        validateFieldDebounced(name as keyof T, formData[name]);
      }
    },
    [formData, validateOnBlur, validateFieldDebounced]
  );

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);
      onDataChange?.(newData);

      // Validate field if validateOnChange is enabled
      if (validateOnChange) {
        validateFieldDebounced(field, value);
      }
    },
    [formData, onDataChange, validateOnChange, validateFieldDebounced]
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
      // Cancel all ongoing async validations
      Object.values(abortControllers.current).forEach((controller) => {
        controller.abort();
      });
      abortControllers.current = {};

      // Clear all debounce timers
      Object.values(debounceTimers.current).forEach((timer) => {
        clearTimeout(timer);
      });
      debounceTimers.current = {};

      setFormData(newData || initialData);
      setErrors({});
      setTouched({});
      setValidatingFields({});
    },
    [initialData]
  );

  const validate = useCallback(async () => {
    setIsValidating(true);

    // Run sync validation
    const syncErrors = validateForm(formData);
    setErrors(syncErrors);

    // Run async validations for all fields with async validators
    const asyncValidationPromises = Object.keys(asyncValidators).map(
      async (field) => {
        const asyncError = await runAsyncValidation(
          field as keyof T,
          formData[field as keyof T]
        );
        return { field, error: asyncError };
      }
    );

    const asyncResults = await Promise.all(asyncValidationPromises);

    // Merge async errors with sync errors
    const allErrors = { ...syncErrors };
    asyncResults.forEach(({ field, error }) => {
      if (error) {
        allErrors[field] = error;
      }
    });

    setErrors(allErrors);
    setIsValidating(false);

    return Object.keys(allErrors).length === 0;
  }, [formData, validateForm, asyncValidators, runAsyncValidation]);

  const validateField = useCallback(
    async (field: keyof T): Promise<boolean> => {
      // Run sync validation
      const testData = { ...formData };
      const syncErrors = validateForm(testData);
      const syncError = syncErrors[field as string];

      if (syncError) {
        setErrors((prev) => ({ ...prev, [field]: syncError }));
        return false;
      }

      // Run async validation if exists
      if (asyncValidators[field]) {
        const asyncError = await runAsyncValidation(field, formData[field]);
        if (asyncError) {
          setErrors((prev) => ({ ...prev, [field]: asyncError }));
          return false;
        }
      }

      // Clear errors for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });

      return true;
    },
    [formData, validateForm, asyncValidators, runAsyncValidation]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel all ongoing async validations
      Object.values(abortControllers.current).forEach((controller) => {
        controller.abort();
      });

      // Clear all debounce timers
      Object.values(debounceTimers.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    errors,
    touched,
    validatingFields,
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
}

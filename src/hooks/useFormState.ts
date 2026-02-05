/**
 * Form State Hook
 * 
 * Reusable hook for managing form state with validation
 */

import { useState, useCallback, ChangeEvent } from 'react';

interface FormConfig<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => Record<keyof T, string> | {};
}

export function useFormState<T extends Record<string, any>>(config: FormConfig<T>) {
  const [values, setValues] = useState<T>(config.initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue =
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // Clear error when user starts typing
      if (errors[name as keyof T]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (config.validate) {
      const validationErrors = config.validate(values);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    }
    return true;
  }, [config, values]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({
          ...acc,
          [key]: true,
        }),
        {}
      );
      setTouched(allTouched);

      // Validate
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await config.onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, config, validateForm]
  );

  const reset = useCallback(() => {
    setValues(config.initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [config.initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    validateForm,
    reset,
  };
}

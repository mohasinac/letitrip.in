/**
 * Form Validation Snippets
 *
 * Reusable patterns for form validation
 */

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FieldValidation {
  rules: ValidationRule[];
  value: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate single field
 */
export function validateField(
  value: any,
  rules: ValidationRule[],
): string | null {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Validate entire form
 */
export function validateForm(
  fields: Record<string, FieldValidation>,
): ValidationResult {
  const errors: Record<string, string> = {};

  Object.entries(fields).forEach(([fieldName, field]) => {
    const error = validateField(field.value, field.rules);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message: string = "This field is required"): ValidationRule => ({
    validate: (value) => {
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  email: (message: string = "Invalid email address"): ValidationRule => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length <= max,
    message: message || `Must be at most ${max} characters`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value: string) => regex.test(value),
    message,
  }),

  number: (message: string = "Must be a number"): ValidationRule => ({
    validate: (value) => !isNaN(Number(value)),
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value: number) => value >= min,
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value: number) => value <= max,
    message: message || `Must be at most ${max}`,
  }),

  matches: (
    otherValue: any,
    message: string = "Fields do not match",
  ): ValidationRule => ({
    validate: (value) => value === otherValue,
    message,
  }),

  custom: (fn: (value: any) => boolean, message: string): ValidationRule => ({
    validate: fn,
    message,
  }),
};

/**
 * Async validation
 */
export async function validateAsync(
  value: any,
  validator: (value: any) => Promise<boolean>,
  message: string,
): Promise<string | null> {
  const isValid = await validator(value);
  return isValid ? null : message;
}

/**
 * Create form validator
 */
export function createValidator(schema: Record<string, ValidationRule[]>) {
  return (formData: Record<string, any>): ValidationResult => {
    const fields: Record<string, FieldValidation> = {};

    Object.entries(schema).forEach(([fieldName, rules]) => {
      fields[fieldName] = {
        rules,
        value: formData[fieldName],
      };
    });

    return validateForm(fields);
  };
}

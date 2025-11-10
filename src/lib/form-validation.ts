/**
 * Form Validation Utilities
 * 
 * This module provides validation functions that work with the centralized
 * field configuration system from @/constants/form-fields.ts
 */

import type { FormField, FieldValidator } from "@/constants/form-fields";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate a single field value against its field configuration
 */
export function validateField(value: any, field: FormField): string | null {
  // Required validation
  if (field.required && (value === undefined || value === null || value === "")) {
    return `${field.label} is required`;
  }

  // Skip other validations if value is empty and not required
  if (!value && !field.required) {
    return null;
  }

  // Min/Max for numbers
  if (field.type === "number") {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return `${field.label} must be a valid number`;
    }
    if (field.min !== undefined && numValue < field.min) {
      return `${field.label} must be at least ${field.min}`;
    }
    if (field.max !== undefined && numValue > field.max) {
      return `${field.label} must be at most ${field.max}`;
    }
  }

  // MinLength/MaxLength for strings
  if (field.type === "text" || field.type === "textarea") {
    const strValue = String(value);
    if (field.minLength !== undefined && strValue.length < field.minLength) {
      return `${field.label} must be at least ${field.minLength} characters`;
    }
    if (field.maxLength !== undefined && strValue.length > field.maxLength) {
      return `${field.label} must be at most ${field.maxLength} characters`;
    }
  }

  // Email validation
  if (field.type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      return `${field.label} must be a valid email address`;
    }
  }

  // URL validation
  if (field.type === "url") {
    try {
      new URL(String(value));
    } catch {
      return `${field.label} must be a valid URL`;
    }
  }

  // Phone validation (basic)
  if (field.type === "tel") {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(String(value))) {
      return `${field.label} must be a valid phone number`;
    }
  }

  // Pattern validation
  if (field.pattern) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(String(value))) {
      return field.helpText || `${field.label} format is invalid`;
    }
  }

  // Custom validators
  if (field.validators && field.validators.length > 0) {
    for (const validator of field.validators) {
      const error = validateWithValidator(value, validator, field.label);
      if (error) {
        return error;
      }
    }
  }

  return null;
}

/**
 * Validate using a FieldValidator
 */
function validateWithValidator(
  value: any,
  validator: FieldValidator,
  fieldLabel: string
): string | null {
  switch (validator.type) {
    case "required":
      if (value === undefined || value === null || value === "") {
        return validator.message || `${fieldLabel} is required`;
      }
      break;

    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return validator.message || `${fieldLabel} must be a valid email`;
      }
      break;

    case "url":
      try {
        new URL(String(value));
      } catch {
        return validator.message || `${fieldLabel} must be a valid URL`;
      }
      break;

    case "phone":
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(String(value))) {
        return validator.message || `${fieldLabel} must be a valid phone number`;
      }
      break;

    case "min":
      if (Number(value) < validator.value) {
        return validator.message || `${fieldLabel} must be at least ${validator.value}`;
      }
      break;

    case "max":
      if (Number(value) > validator.value) {
        return validator.message || `${fieldLabel} must be at most ${validator.value}`;
      }
      break;

    case "minLength":
      if (String(value).length < validator.value) {
        return validator.message || `${fieldLabel} must be at least ${validator.value} characters`;
      }
      break;

    case "maxLength":
      if (String(value).length > validator.value) {
        return validator.message || `${fieldLabel} must be at most ${validator.value} characters`;
      }
      break;

    case "pattern":
      const regex = new RegExp(validator.value);
      if (!regex.test(String(value))) {
        return validator.message || `${fieldLabel} format is invalid`;
      }
      break;

    case "custom":
      if (validator.fn) {
        const result = validator.fn(value);
        if (result === false) {
          return validator.message || `${fieldLabel} is invalid`;
        }
        if (typeof result === "string") {
          return result;
        }
      }
      break;
  }

  return null;
}

/**
 * Validate an entire form (all fields)
 */
export function validateForm(
  values: Record<string, any>,
  fields: FormField[]
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = values[field.key];
    const error = validateField(value, field);
    if (error) {
      errors[field.key] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate only specific fields
 */
export function validateFields(
  values: Record<string, any>,
  fields: FormField[],
  fieldKeys: string[]
): ValidationResult {
  const fieldsToValidate = fields.filter((f) => fieldKeys.includes(f.key));
  return validateForm(values, fieldsToValidate);
}

/**
 * Get first error message from validation result
 */
export function getFirstError(errors: Record<string, string>): string | null {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
}

/**
 * Format validation errors for display
 */
export function formatErrors(errors: Record<string, string>): ValidationError[] {
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message,
  }));
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  return value === undefined || value === null || value === "";
}

/**
 * Sanitize user input (basic XSS prevention)
 */
export function sanitizeInput(value: string): string {
  return value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate and sanitize user input
 */
export function validateAndSanitize(
  value: string,
  field: FormField
): { value: string; error: string | null } {
  const error = validateField(value, field);
  const sanitized = error ? value : sanitizeInput(value);
  return { value: sanitized, error };
}

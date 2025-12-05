/**
 * @fileoverview TypeScript Module
 * @module src/lib/form-validation
 * @description This file contains functionality related to form-validation
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Form Validation Utilities
 *
 * This module provides validation functions that work with the centralized
 * field configuration system from @/constants/form-fields.ts
 */

import type { FormField, FieldValidator } from "@/constants/form-fields";
import {
  isValidEmail,
  isValidPhone,
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

/**
 * ValidationError interface
 * 
 * @interface
 * @description Defines the structure and contract for ValidationError
 */
export interface ValidationError {
  /** Field */
  field: string;
  /** Message */
  message: string;
}

/**
 * ValidationResult interface
 * 
 * @interface
 * @description Defines the structure and contract for ValidationResult
 */
export interface ValidationResult {
  /** Is Valid */
  isValid: boolean;
  /** Errors */
  errors: Record<string, string>;
}

/**
 * Validate a single field value against its field configuration
 */
/**
 * Validates field
 *
 * @param {any} value - The value
 * @param {FormField} field - The field
 *
 * @returns {string} The validatefield result
 *
 * @example
 * validateField(value, field);
 */

/**
 * Validates field
 *
 * @param {any} value - The value
 * @param {FormField} field - The field
 *
 * @returns {string} The validatefield result
 *
 * @example
 * validateField(value, field);
 */

export function validateField(value: any, field: FormField): string | null {
  // Required validation
  if (
    field.required &&
    (value === undefined || value === null || value === "")
  ) {
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
    if (!isValidEmail(String(value))) {
      return VALIDATION_MESSAGES.EMAIL.INVALID;
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
    if (!isValidPhone(String(value))) {
      return VALIDATION_MESSAGES.PHONE.INVALID;
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
/**
 * Validates with validator
 *
 * @param {any} value - The value
 * @param {FieldValidator} validator - The validator
 * @param {string} fieldLabel - The field label
 *
 * @returns {string} The validatewithvalidator result
 */

/**
 * Validates with validator
 *
 * @returns {any} The validatewithvalidator result
 */

function validateWithValidator(
  /** Value */
  value: any,
  /** Validator */
  validator: FieldValidator,
  /** Field Label */
  fieldLabel: string,
): string | null {
  switch (validator.type) {
    case "required":
      if (value === undefined || value === null || value === "") {
        return validator.message || `${fieldLabel} is required`;
      }
      break;

    case "email":
      if (!isValidEmail(String(value))) {
        return validator.message || VALIDATION_MESSAGES.EMAIL.INVALID;
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
      if (!isValidPhone(String(value))) {
        return validator.message || VALIDATION_MESSAGES.PHONE.INVALID;
      }
      break;

    case "min":
      if (Number(value) < validator.value) {
        return (
          validator.message ||
          `${fieldLabel} must be at least ${validator.value}`
        );
      }
      break;

    case "max":
      if (Number(value) > validator.value) {
        return (
          validator.message ||
          `${fieldLabel} must be at most ${validator.value}`
        );
      }
      break;

    case "minLength":
      if (String(value).length < validator.value) {
        return (
          validator.message ||
          `${fieldLabel} must be at least ${validator.value} characters`
        );
      }
      break;

    case "maxLength":
      if (String(value).length > validator.value) {
        return (
          validator.message ||
          `${fieldLabel} must be at most ${validator.value} characters`
        );
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
/**
 * Validates form
 *
 * @param {Record<string, any>} values - The values
 * @param {FormField[]} fields - The fields
 *
 * @returns {any} The validateform result
 *
 * @example
 * validateForm(values, fields);
 */

/**
 * Validates form
 *
 * @returns {any} The validateform result
 *
 * @example
 * validateForm();
 */

export function validateForm(
  /** Values */
  values: Record<string, any>,
  /** Fields */
  fields: FormField[],
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
    /** Is Valid */
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate only specific fields
 */
/**
 * Validates fields
 *
 * @param {Record<string, any>} values - The values
 * @param {FormField[]} fields - The fields
 * @param {string[]} fieldKeys - The field keys
 *
 * @returns {string} The validatefields result
 *
 * @example
 * validateFields(values, fields, fieldKeys);
 */

/**
 * Validates fields
 *
 * @returns {any} The validatefields result
 *
 * @example
 * validateFields();
 */

export function validateFields(
  /** Values */
  values: Record<string, any>,
  /** Fields */
  fields: FormField[],
  /** Field Keys */
  fieldKeys: string[],
): ValidationResult {
  /**
 * Performs fields to validate operation
 *
 * @param {any} (f - The (f
 *
 * @returns {any} The fieldstovalidate result
 *
 */
const fieldsToValidate = fields.filter((f) => fieldKeys.includes(f.key));
  return validateForm(values, fieldsToValidate);
}

/**
 * Get first error message from validation result
 */
/**
 * Retrieves first error
 *
 * @param {Record<string, string>} errors - The errors
 *
 * @returns {string} The firsterror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getFirstError(errors);
 */

/**
 * Retrieves first error
 *
 * @param {Record<string, string>} errors - The errors
 *
 * @returns {string} The firsterror result
 *
 * @throws {Error} When operation fails or validation errors oc/**
 * Performs first key operation
 *
 * @param {any} errors - The errors
 *
 * @returns {ValidationError[]} The firstkey result
 *
 * @example
 * firstKey(errors);
 */
cur
 *
 * @example
 * getFirstError(errors);
 */

export function getFirstError(errors: Record<string, string>): string | null {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
}

/**
 * Format validation errors for display
 */
/**
 * Formats errors
 *
 * @param {Record<string, string>} errors - The errors
 *
 * @returns {any} The formaterrors result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * formatErrors(errors);
 */

/**
 * Formats errors
 *
 * @param {Record<string, string>} /** Errors */
  errors - The /**  errors */
  errors
 *
 * @returns {any} The formaterrors result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * formatErrors(/** Errors */
  errors);
 */

/**
 * Formats errors
 *
 * @param {Record<string} errors - The errors
 * @param {any} string> - The string>
 *
 * @returns {ValidationError[]} The formaterrors result
 *
 * @example
 * formatErrors(errors, string>);
 */
export function formatErrors(
  /** Errors */
  errors: Record<string, string>,
): ValidationError[] {
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message,
  }));
}

/**
 * Check if value is empty
 */
/**
 * Checks if empty
 *
 * @param {any} value - The value
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isEmpty(value);
 */

/**
 * Checks if empty
 *
 * @param {any} value - The value
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isEmpty(value);
 */

export function isEmpty(value: any): boolean {
  return value === undefined || value === null || value === "";
}

/**
 * Sanitize user input (basic XSS prevention)
 */
/**
 * Performs sanitize input operation
 *
 * @param {string} value - The value
 *
 * @returns {string} The sanitizeinput result
 *
 * @example
 * sanitizeInput("example");
 */

/**
 * Performs sanitize input operation
 *
 * @param {string} value - The value
 *
 * @returns {string} The sanitizeinput result
 *
 * @example
 * sanitizeInput("example");
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
/**
 * Validates and sanitize
 *
 * @param {string} value - The value
 * @param {FormField} field - The field
 *
 * @returns {string} The validateandsanitize result
 *
 * @example
 * validateAndSanitize("example", field);
 */

/**
 * Validates and sanitize
 *
 * @returns {string} The validateandsanitize result
 *
 * @example
 * validateAndSanitize();
 */

export function validateAndSanitize(
  /** Value */
  value: string,
  /** Field */
  field: FormField,
): { value: string; error: string | null } {
  const error = validateField(value, field);
  const sanitized = error ? value : sanitizeInput(value);
  return { value: sanitized, error };
}

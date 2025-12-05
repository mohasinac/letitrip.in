/**
 * @fileoverview TypeScript Module
 * @module src/lib/validations/helpers
 * @description This file contains functionality related to helpers
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Validation Helper Utilities
 *
 * These utilities help add field-level validation to existing forms
 * without requiring a complete refactor to react-hook-form.
 *
 * Usage:
 * 1. Import the validation schema
 * 2. Use validateField or validateStep to check individual fields
 * 3. Display errors using FieldError component
 * 4. Call validateAllSteps before final submission
 */

import { z } from "zod";
import { logError } from "@/lib/firebase-error-logger";

/**
 * Validates a single field against a Zod schema
 */
/**
 * Validates field
 *
 * @param {T} schema - The schema
 * @param {string} fieldName - Name of field
 * @param {any} value - The value
 *
 * @returns {string} The validatefield result
 *
 * @example
 * validateField(schema, "example", value);
 */

/**
 * Validates field
 *
 * @returns {string} The validatefield result
 *
 * @example
 * validateField();
 */

export function validateField<T extends z.ZodType>(
  /** Schema */
  schema: T,
  /** Field Name */
  fieldName: string,
  /** Value */
  value: any,
): string | null {
  try {
    // Create a partial schema for this field
    const result = schema.safeParse({ [fieldName]: value });

    if (!result.success) {
      /**
 * Performs error operation
 *
 * @param {z.ZodIssue} (err - The (err
 *
 * @returns {any} The error result
 *
 */
const error = result.error.issues.find(
        (err: z.ZodIssue) => err.path[0] === fieldName,
      );
      return error?.message || null;
    }

    return null;
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "validateField",
      /** Metadata */
      metadata: { fieldName },
    });
    return null;
  }
}

/**
 * Validates multiple fields against a schema
 */
/**
 * Validates step
 *
 * @param {T} schema - The schema
 * @param {any} data - Data object containing information
 *
 * @returns {any} The validatestep result
 *
 * @example
 * validateStep(schema, data);
 */

/**
 * Validates step
 *
 * @returns {any} The validatestep result
 *
 * @example
 * validateStep();
 */

export function validateStep<T extends z.ZodType>(
  /** Schema */
  schema: T,
  /** Data */
  data: any,/**
 * Performs errors operation
 *
 * @param {z.ZodIssue} (err - The (err
 *
 * @returns {any} The errors result
 *
 */

): Record<string, string> {
  try {
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as string;
        if (field && !errors[field]) {
          errors[field] = err.message;
        }
      });
      return errors;
    }

    return {};
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "validateStep",
    });
    return {};
  }
}

/**
 * Check if validation errors exist
 */
/**
 * Checks if errors
 *
 * @param {Record<string, string>} errors - The errors
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * hasErrors(errors);
 */

/**
 * Checks if errors
 *
 * @param {Record<string, string>} errors - The errors
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * hasErrors(errors);
 */

export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get error message for a specific field
 */
/**
 * Retrieves field error
 *
 * @param {Record<string, string>} errors - The errors
 * @param {string} fieldName - Name of field
 *
 * @returns {string} The fielderror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getFieldError(errors, "example");
 */

/**
 * Retrieves field error
 *
 * @returns {string} The fielderror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getFieldError();
 */

export function getFieldError(
  /** Errors */
  errors: Record<string, string>,
  /** Field Name */
  fieldName: string,
): string | undefined {
  return errors[fieldName];
}

/**
 * Validates entire form data against schema
 */
/**
 * Validates form
 *
 * @param {T} schema - The schema
 * @param {any} data - Data object containing information
 *
 * @returns {Promise<any>} Promise resolving to validateform result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateForm(schema, data);
 */

/**
 * Validates form
 *
 * @returns {Promise<any>} Promise resolving to validateform result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateForm();
 */

export async function validateForm<T extends z.ZodType>(
  /** Schema */
  schema: T,
  /** Data /**
 * Performs errors operation
 *
 * @param {z.ZodIssue} (err - The (err
 *
 * @returns {any} The errors result
 *
 */
*/
  data: any,
): Promise<{ success: boolean; errors: Record<string, string> }> {
  try {
    await schema.parseAsync(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as string;
        if (field && !errors[field]) {
          errors[field] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: "Validation failed" } };
  }
}

/**
 * Creates a CSS class string for input fields with validation state
 */
/**
 * Retrieves input class name
 *
 * @param {string} baseClass - The base class
 * @param {boolean} hasError - Whether has error
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getInputClassName("example", /**
 * Performs error class operation
 *
 * @returns {Promise<any>} The errorclass result
 *
 * @example
 * errorClass();
 */
true);
 */

/**
 * Retrieves input class name
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getInputClassName();
 */

export function getInputClassName(
  /** Base Class */
  baseClass: string,
  /** Has Error */
  hasError: boolean,
): string {
  const errorClass = hasError
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : "";
  return `${baseClass} ${errorClass}`.trim();
}

/**
 * Debounce function for async validation (e.g., slug uniqueness check)
 */
/**
 * Performs debounce operation
 *
 * @param {any[]} ...args - The ...args
 *
 * @returns {number} The debounce result
 *
 * @example
 * debounce(...args);
 */

/**
 * Performs debounce operation
 *
 * @param {any[]} ...args - The ...args
 *
 * @returns {number} The debounce result
 *
 * @example
 * debounce(...args);
 */

export function debounce<T extends (...args: any[]) => any>(
  /** Func */
  func: T,
  /** Delay */
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Example usage for adding validation to existing forms:
 *
 * ```tsx
 * import { productStep1Schema } from "@/lib/validations/product.schema";/**
 * Handles next
 *
 * @returns {any} The handlenext result
 *
 */

 * import { validateStep, getFieldError, getInputClassName } from "@/lib/validations/helpers";
 * import { FieldError } from "@/components/common/FieldError";
 *
 * // In your component:
 * const [errors, setErrors] = useState<Record<string, string>>({});
 *
 * // Validate on blur:
 * const handleBlur = (fieldName: string) => {
 *   const stepErrors = validateStep(productStep1Schema, formData);
 *   setErrors(stepErrors);
 * };
 *
 * // Before moving to next step:
 * const handleNext = () => {
 *   const stepErrors = validateStep(productStep1Schema, formData);
 *   if (hasErrors(stepErrors)) {
 *     setErrors(stepErrors);
 *     return;
 *   }
 *   setCurrentStep(currentStep + 1);
 * };
 *
 * // In your JSX:
 * <input
 *   className={getInputClassName("w-full ...", !!getFieldError(errors, "name"))}
 *   onBlur={() => handleBlur("name")}
 * />
 * <FieldError error={getFieldError(errors, "name")} />
 * ```
 */

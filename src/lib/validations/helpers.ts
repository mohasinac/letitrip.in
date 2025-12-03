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
export function validateField<T extends z.ZodType>(
  schema: T,
  fieldName: string,
  value: any
): string | null {
  try {
    // Create a partial schema for this field
    const result = schema.safeParse({ [fieldName]: value });

    if (!result.success) {
      const error = result.error.issues.find(
        (err: z.ZodIssue) => err.path[0] === fieldName
      );
      return error?.message || null;
    }

    return null;
  } catch (error) {
    logError(error as Error, {
      component: "validateField",
      metadata: { fieldName },
    });
    return null;
  }
}

/**
 * Validates multiple fields against a schema
 */
export function validateStep<T extends z.ZodType>(
  schema: T,
  data: any
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
      component: "validateStep",
    });
    return {};
  }
}

/**
 * Check if validation errors exist
 */
export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get error message for a specific field
 */
export function getFieldError(
  errors: Record<string, string>,
  fieldName: string
): string | undefined {
  return errors[fieldName];
}

/**
 * Validates entire form data against schema
 */
export async function validateForm<T extends z.ZodType>(
  schema: T,
  data: any
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
export function getInputClassName(
  baseClass: string,
  hasError: boolean
): string {
  const errorClass = hasError
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : "";
  return `${baseClass} ${errorClass}`.trim();
}

/**
 * Debounce function for async validation (e.g., slug uniqueness check)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
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
 * import { productStep1Schema } from "@/lib/validations/product.schema";
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

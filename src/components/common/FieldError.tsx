/**
 * @fileoverview React Component
 * @module src/components/common/FieldError
 * @description This file contains the FieldError component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { AlertCircle } from "lucide-react";

/**
 * FieldErrorProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FieldErrorProps
 */
interface FieldErrorProps {
  /** Error */
  error?: string;
}

/**
 * Function: Field Error
 */
/**
 * Performs field error operation
 *
 * @param {FieldErrorProps} { error } - The { error }
 *
 * @returns {any} The fielderror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * FieldError({ error });
 */

/**
 * Performs field error operation
 *
 * @param {FieldErrorProps} { error } - The { error }
 *
 * @returns {any} The fielderror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * FieldError({ error });
 */

export function FieldError({ error }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

/**
 * InputWrapperProps interface
 * 
 * @interface
 * @description Defines the structure and contract for InputWrapperProps
 */
interface InputWrapperProps {
  /** Label */
  label: string;
  /** Required */
  required?: boolean;
  /** Error */
  error?: string;
  /** Hint */
  hint?: string;
  /** Children */
  children: React.ReactNode;
}

/**
 * Function: Input Wrapper
 */
/**
 * Performs input wrapper operation
 *
 * @returns {any} The inputwrapper result
 *
 * @example
 * InputWrapper();
 */

/**
 * Performs input wrapper operation
 *
 * @returns {any} The inputwrapper result
 *
 * @example
 * InputWrapper();
 */

export function InputWrapper({
  label,
  required,
  error,
  hint,
  children,
}: InputWrapperProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <FieldError error={error} />}
      {!error && hint && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
}

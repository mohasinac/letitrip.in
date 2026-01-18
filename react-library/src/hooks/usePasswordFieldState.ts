
/**
 * usePasswordFieldState Hook
 * Framework-agnostic password field state management
 *
 * Purpose: Encapsulate password-specific UI state (show/hide) and validation logic
 * Replaces: useState for showPassword, showConfirmPassword in auth components
 *
 * @example Basic Usage
 * ```tsx
 * const password = usePasswordFieldState();
 *
 * <input
 *   type={password.showPassword ? 'text' : 'password'}
 *   value={passwordValue}
 * />
 * <button onClick={password.togglePasswordVisibility}>
 *   {password.showPassword ? 'Hide' : 'Show'}
 * </button>
 * ```
 *
 * @example With Validation
 * ```tsx
 * const password = usePasswordFieldState();
 *
 * const handleSubmit = () => {
 *   const matchError = password.validatePasswordMatch(pwd, confirmPwd);
 *   const strengthValidation = password.validatePasswordStrength(pwd);
 *
 *   if (matchError || !strengthValidation.valid) {
 *     // Show errors
 *     return;
 *   }
 *   // Submit
 * };
 * ```
 */

import { useCallback, useState } from "react";

export interface UsePasswordFieldStateReturn {
  /** Whether password is visible */
  showPassword: boolean;
  /** Whether confirm password is visible */
  showConfirmPassword: boolean;
  /** Toggle password visibility */
  togglePasswordVisibility: () => void;
  /** Toggle confirm password visibility */
  toggleConfirmPasswordVisibility: () => void;
  /** Validate password and confirm password match */
  validatePasswordMatch: (
    password: string,
    confirmPassword: string
  ) => string | null;
  /** Validate password strength */
  validatePasswordStrength: (password: string) => {
    valid: boolean;
    errors: string[];
  };
  /** Reset visibility state */
  reset: () => void;
}

export function usePasswordFieldState(): UsePasswordFieldStateReturn {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const validatePasswordMatch = useCallback(
    (password: string, confirmPassword: string): string | null => {
      if (password !== confirmPassword) {
        return "Passwords do not match";
      }
      return null;
    },
    []
  );

  const validatePasswordStrength = useCallback(
    (password: string): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
      }
      if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }
      if (!/\d/.test(password)) {
        errors.push("Password must contain at least one number");
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("Password must contain at least one special character");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    []
  );

  const reset = useCallback(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  return {
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    validatePasswordMatch,
    validatePasswordStrength,
    reset,
  };
}

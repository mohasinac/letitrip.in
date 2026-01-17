"use client";

/**
 * useSlugValidation Hook
 * Framework-agnostic slug validation with debouncing
 *
 * Purpose: Validate slugs/codes with debounced async validation
 * Note: Requires injectable validation function (no built-in API calls)
 *
 * @example Basic Usage
 * ```tsx
 * const { isAvailable, isValidating, validateSlug } = useSlugValidation({
 *   onValidate: async (slug) => {
 *     const response = await fetch(`/api/shops/validate-slug?slug=${slug}`);
 *     const data = await response.json();
 *     return data.available;
 *   },
 *   debounceMs: 500,
 * });
 *
 * <input onChange={(e) => validateSlug(e.target.value)} />
 * {isValidating && <Spinner />}
 * {isAvailable === false && <Error>Slug already taken</Error>}
 * {isAvailable === true && <Success>Slug available</Success>}
 * ```
 *
 * @example With Error Handling
 * ```tsx
 * const { isAvailable, isValidating, error, validateSlug } = useSlugValidation({
 *   onValidate: async (slug) => {
 *     try {
 *       const response = await fetch(`/api/shops/validate-slug?slug=${slug}`);
 *       if (!response.ok) throw new Error('Validation failed');
 *       const data = await response.json();
 *       return data.available;
 *     } catch (err) {
 *       throw err;
 *     }
 *   },
 *   debounceMs: 300,
 * });
 *
 * {error && <div className="text-red-500">{error}</div>}
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSlugValidationOptions {
  /** Validation function that returns true if slug is available */
  onValidate: (slug: string) => Promise<boolean>;
  /** Debounce delay in milliseconds (default: 500) */
  debounceMs?: number;
  /** Initial slug value */
  initialSlug?: string;
  /** Called when validation starts */
  onValidationStart?: (slug: string) => void;
  /** Called when validation completes */
  onValidationComplete?: (slug: string, isAvailable: boolean) => void;
  /** Called when validation errors */
  onValidationError?: (slug: string, error: Error) => void;
}

export interface UseSlugValidationReturn {
  /** Current slug value */
  slug: string;
  /** Whether slug is available (null = not validated yet) */
  isAvailable: boolean | null;
  /** Validation is in progress */
  isValidating: boolean;
  /** Validation error message */
  error: string | null;
  /** Function to validate a slug */
  validateSlug: (slug: string) => void;
  /** Function to reset validation state */
  reset: () => void;
}

export function useSlugValidation({
  onValidate,
  debounceMs = 500,
  initialSlug = "",
  onValidationStart,
  onValidationComplete,
  onValidationError,
}: UseSlugValidationOptions): UseSlugValidationReturn {
  const [slug, setSlug] = useState(initialSlug);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Validation function
  const validate = useCallback(
    async (slugToValidate: string) => {
      if (!slugToValidate) {
        setIsAvailable(null);
        setError(null);
        return;
      }

      setIsValidating(true);
      setError(null);
      onValidationStart?.(slugToValidate);

      try {
        const available = await onValidate(slugToValidate);
        setIsAvailable(available);
        onValidationComplete?.(slugToValidate, available);
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Validation failed";
        setError(errorMessage);
        setIsAvailable(null);
        onValidationError?.(
          slugToValidate,
          err instanceof Error ? err : new Error(errorMessage)
        );
      } finally {
        setIsValidating(false);
      }
    },
    [onValidate, onValidationStart, onValidationComplete, onValidationError]
  );

  // Public validate function with debouncing
  const validateSlug = useCallback(
    (newSlug: string) => {
      setSlug(newSlug);

      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (!newSlug) {
        setIsAvailable(null);
        setError(null);
        return;
      }

      // Set new timer
      debounceTimer.current = setTimeout(() => {
        validate(newSlug);
      }, debounceMs);
    },
    [validate, debounceMs]
  );

  // Reset function
  const reset = useCallback(() => {
    setSlug("");
    setIsAvailable(null);
    setIsValidating(false);
    setError(null);
  }, []);

  // Validate initial slug
  useEffect(() => {
    if (initialSlug) {
      validate(initialSlug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    slug,
    isAvailable,
    isValidating,
    error,
    validateSlug,
    reset,
  };
}

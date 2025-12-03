import { useState, useCallback, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

interface UseSlugValidationOptions {
  /** API endpoint for validation */
  endpoint: string;
  /** Additional query parameters */
  params?: Record<string, string>;
  /** Exclude ID for edit mode */
  excludeId?: string;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Initial slug value */
  initialSlug?: string;
}

interface SlugValidationResult {
  /** Current slug value */
  slug: string;
  /** Whether slug is available */
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

/**
 * Hook for validating slugs/codes with debounced API calls
 *
 * @example Shop Slug Validation
 * ```tsx
 * const { isAvailable, isValidating, validateSlug } = useSlugValidation({
 *   endpoint: '/api/shops/validate-slug',
 *   excludeId: shopId, // for edit mode
 *   debounceMs: 500,
 * });
 *
 * <input onChange={(e) => validateSlug(e.target.value)} />
 * {isValidating && <Spinner />}
 * {isAvailable === false && <Error>Slug already taken</Error>}
 * {isAvailable === true && <Success>Slug available</Success>}
 * ```
 *
 * @example Product Slug Validation (per shop)
 * ```tsx
 * const { isAvailable, validateSlug } = useSlugValidation({
 *   endpoint: '/api/products/validate-slug',
 *   params: { shop_slug: shopSlug }, // Use shop_slug instead of shop_id
 *   excludeId: productId,
 * });
 * ```
 *
 * @example Coupon Code Validation (per shop)
 * ```tsx
 * const { isAvailable, validateSlug } = useSlugValidation({
 *   endpoint: '/api/coupons/validate-code',
 *   params: { shop_slug: shopSlug }, // Use shop_slug instead of shop_id
 *   excludeId: couponId,
 * });
 * ```
 */
export function useSlugValidation({
  endpoint,
  params = {},
  excludeId,
  debounceMs = 500,
  initialSlug = "",
}: UseSlugValidationOptions): SlugValidationResult {
  const [slug, setSlug] = useState(initialSlug);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      try {
        // Build query params
        const queryParams = new URLSearchParams({
          slug: slugToValidate,
          ...params,
        });

        if (excludeId) {
          queryParams.set("exclude_id", excludeId);
        }

        // Special handling for coupon codes (use 'code' param instead of 'slug')
        if (endpoint.includes("validate-code")) {
          queryParams.delete("slug");
          queryParams.set("code", slugToValidate);
        }

        const response = await fetch(`${endpoint}?${queryParams.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Validation failed");
        }

        setIsAvailable(data.available);
      } catch (err) {
        logError(err, {
          component: "useSlugValidation.validate",
          slug: slugToCheck,
          endpoint,
        });
        setError(err instanceof Error ? err.message : "Validation failed");
        setIsAvailable(null);
      } finally {
        setIsValidating(false);
      }
    },
    [endpoint, params, excludeId]
  );

  // Debounced validation
  const debouncedValidate = useDebouncedCallback(validate, debounceMs);

  // Public validate function
  const validateSlug = useCallback(
    (newSlug: string) => {
      setSlug(newSlug);
      if (newSlug) {
        debouncedValidate(newSlug);
      } else {
        setIsAvailable(null);
        setError(null);
      }
    },
    [debouncedValidate]
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
  }, [initialSlug, validate]);

  return {
    slug,
    isAvailable,
    isValidating,
    error,
    validateSlug,
    reset,
  };
}

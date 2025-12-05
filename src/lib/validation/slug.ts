/**
 * @fileoverview TypeScript Module
 * @module src/lib/validation/slug
 * @description This file contains functionality related to slug
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { useEffect, useRef, useState } from "react";

/**
 * ValidationResult interface
 * 
 * @interface
 * @description Defines the structure and contract for ValidationResult
 */
export interface ValidationResult {
  /** Checking */
  checking: boolean;
  /** Available */
  available: boolean | null;
  /** Error */
  error: string | null;
}

/**
 * UseRemoteValidationOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for UseRemoteValidationOptions
 */
interface UseRemoteValidationOptions {
  /** Value */
  value: string;
  /** Endpoint */
  endpoint: string; // full endpoint e.g. /api/shops/validate-slug
  /** ParamName */
  paramName?: string; // default 'slug' or 'code'
  /** Extra Params */
  extraParams?: Record<string, string | undefined>;
  /** Debounce Ms */
  debounceMs?: number;
  /** Skip */
  skip?: boolean; // skip when creating until length threshold
  /** Min Length */
  minLength?: number;
}

/**
 * Function: Use Remote Validation
 */
/**
 * Custom React hook for remote validation
 *
 * @returns {any} The useremotevalidation result
 *
 * @example
 * useRemoteValidation();
 */

/**
 * Custom React hook for remote validation
 *
 * @returns {any} The useremotevalidation result
 *
 * @example
 * useRemoteValidation();
 */

export function useRemoteValidation({
  value,
  endpoint,
  paramName = "slug",
  extraParams = {},
  debounceMs = 400,
  skip = false,
  minLength = 3,
}: UseRemoteValidationOptions): ValidationResult {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  /**
 * Performs extra params str operation
 *
 * @param {any} extraParams - The extraparams
 *
 * @returns {any} The extraparamsstr result
 *
 */
const extraParamsStr = JSON.stringify(extraParams);

  useEffect(() => {
    if (skip) return;
    if (!value || value.length < minLength) {
      setAvailable(null);
      setError(null);
      return;
    }

    // Clear previous debounce
    if (timerRef.current) clearTimeout(timerRef.current);
    // Abort previous fetch
    if (abortRef.current) abortRef.current.abort();

    timerRef.current = s/**
 * Performs params operation
 *
 * @returns {any} The params result
 *
 */
etTimeout(async () => {
      try {
        setChecking(true);
        setError(null);
        abortRef.current = new AbortController();

        const params = new URLSearchParams();
        params.append(paramName, value);
        Object.entries(extraParams).forEach(([k, v]) => {
          if (v) params.append(k, v);
        });

        const res = await fetch(`${endpoint}?${params.toString()}`, {
          /** Method */
          method: "GET",
          /** Signal */
          signal: abortRef.current.signal,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || "Validation failed");
          setAvailable(null);
        } else {
          setAvailable(Boolean(json.available));
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return; // ignore aborts
        setError("Network error");
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, endpoint, paramName, extraParamsStr, debounceMs, skip, minLength]);

  return { checking, available, error };
}

// Convenience hook wrappers
/**
 * Function: Use Shop Slug Validation
 */
/**
 * Custom React hook for shop slug validation
 *
 * @param {string} slug - URL-friendly identifier
 * @param {string} [excludeId] - exclude identifier
 *
 * @returns {string} The useshopslugvalidation result
 *
 * @example
 * useShopSlugValidation("example", "example");
 */

/**
 * Custom React hook for shop slug validation
 *
 * @param {string} slug - URL-friendly identifier
 * @param {string} [excludeId] - exclude identifier
 *
 * @returns {string} The useshopslugvalidation result
 *
 * @example
 * useShopSlugValidation("example", "example");
 */

export function useShopSlugValidation(slug: string, excludeId?: string) {
  return useRemoteValidation({
    /** Value */
    value: slug,
    /** Endpoint */
    endpoint: "/api/shops/validate-slug",
    /** Extra Params */
    extraParams: { exclude_id: excludeId },
  });
}
/**
 * Function: Use Product Slug Validation
 */
/**
 * Custom React hook for product slug validation
 *
 * @param {string} slug - URL-friendly identifier
 * @param {string | undefined} shopSlug - The shop slug
 * @param {string} [excludeId] - exclude identifier
 *
 * @returns {string} The useproductslugvalidation result
 *
 * @example
 * useProductSlugValidation("example", shopSlug, "example");
 */

/**
 * Custom React hook for product slug validation
 *
 * @returns {string} The useproductslugvalidation result
 *
 * @example
 * useProductSlugValidation();
 */

export function useProductSlugValidation(
  /** Slug */
  slug: string,
  /** Shop Slug */
  shopSlug: string | undefined,
  /** Exclude Id */
  excludeId?: string,
) {
  return useRemoteValidation({
    /** Value */
    value: slug,
    /** Endpoint */
    endpoint: "/api/products/validate-slug",
    /** Extra Params */
    extraParams: { shop_slug: shopSlug, exclude_id: excludeId },
    /** Skip */
    skip: !shopSlug,
  });
}
/**
 * Function: Use Coupon Code Validation
 */
/**
 * Custom React hook for coupon code validation
 *
 * @param {string} code - The code
 * @param {string | undefined} shopSlug - The shop slug
 * @param {string} [excludeId] - exclude identifier
 *
 * @returns {string} The usecouponcodevalidation result
 *
 * @example
 * useCouponCodeValidation("example", shopSlug, "example");
 */

/**
 * Custom React hook for coupon code validation
 *
 * @returns {string} The usecouponcodevalidation result
 *
 * @example
 * useCouponCodeValidation();
 */

export function useCouponCodeValidation(
  /** Code */
  code: string,
  /** Shop Slug */
  shopSlug: string | undefined,
  /** Exclude Id */
  excludeId?: string,
) {
  return useRemoteValidation({
    /** Value */
    value: code.toUpperCase(),
    /** Endpoint */
    endpoint: "/api/coupons/validate-code",
    /** Param Name */
    paramName: "code",
    /** Extra Params */
    extraParams: { shop_slug: shopSlug, exclude_id: excludeId },
    /** Skip */
    skip: !shopSlug,
    /** Min Length */
    minLength: 2,
  });
}

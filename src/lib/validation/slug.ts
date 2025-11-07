import { useEffect, useRef, useState } from 'react';

export interface ValidationResult {
  checking: boolean;
  available: boolean | null;
  error: string | null;
}

interface UseRemoteValidationOptions {
  value: string;
  endpoint: string; // full endpoint e.g. /api/shops/validate-slug
  paramName?: string; // default 'slug' or 'code'
  extraParams?: Record<string, string | undefined>;
  debounceMs?: number;
  skip?: boolean; // skip when creating until length threshold
  minLength?: number;
}

export function useRemoteValidation({
  value,
  endpoint,
  paramName = 'slug',
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

    timerRef.current = setTimeout(async () => {
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
          method: 'GET',
          signal: abortRef.current.signal,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || 'Validation failed');
          setAvailable(null);
        } else {
          setAvailable(Boolean(json.available));
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return; // ignore aborts
        setError('Network error');
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [value, endpoint, paramName, JSON.stringify(extraParams), debounceMs, skip, minLength]);

  return { checking, available, error };
}

// Convenience hook wrappers
export function useShopSlugValidation(slug: string, excludeId?: string) {
  return useRemoteValidation({ value: slug, endpoint: '/api/shops/validate-slug', extraParams: { exclude_id: excludeId } });
}
export function useProductSlugValidation(slug: string, shopSlug: string | undefined, excludeId?: string) {
  return useRemoteValidation({ value: slug, endpoint: '/api/products/validate-slug', extraParams: { shop_slug: shopSlug, exclude_id: excludeId }, skip: !shopSlug });
}
export function useCouponCodeValidation(code: string, shopSlug: string | undefined, excludeId?: string) {
  return useRemoteValidation({ value: code.toUpperCase(), endpoint: '/api/coupons/validate-code', paramName: 'code', extraParams: { shop_slug: shopSlug, exclude_id: excludeId }, skip: !shopSlug, minLength: 2 });
}

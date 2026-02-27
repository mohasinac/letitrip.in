"use client";

import { useApiMutation } from "@/hooks";
import { couponService } from "@/services";

interface ValidateCouponPayload {
  code: string;
  orderTotal?: number;
}

/**
 * useCouponValidate
 * Wraps `couponService.validate()` as a `useApiMutation` for PromoCodeInput.
 */
export function useCouponValidate() {
  return useApiMutation<unknown, ValidateCouponPayload>({
    mutationFn: (payload) => couponService.validate(payload),
  });
}

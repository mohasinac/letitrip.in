"use client";

import { useApiMutation } from "@/hooks";
import { validateCouponAction } from "@/actions";
import type { ValidateCouponResult } from "@/actions";

interface ValidateCouponPayload {
  code: string;
  orderTotal?: number;
}

/**
 * useCouponValidate
 * Wraps `validateCouponAction` as a mutation hook for PromoCodeInput.
 */
export function useCouponValidate() {
  return useApiMutation<ValidateCouponResult, ValidateCouponPayload>({
    mutationFn: (payload) =>
      validateCouponAction({
        code: payload.code,
        orderTotal: payload.orderTotal ?? 0,
      }),
  });
}

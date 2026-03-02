"use client";

/**
 * useBecomeSeller Hook
 *
 * Mutation hook that submits a seller application for the authenticated user.
 * On success the server sets role="seller" and storeStatus="pending" on the
 * user document; an admin must approve before the store goes live.
 *
 * @example
 * ```tsx
 * const { mutate: applyAsSeller, isLoading } = useBecomeSeller();
 * ```
 */

import { useApiMutation } from "./useApiMutation";
import { useMessage } from "./useMessage";
import { sellerService } from "@/services";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";

export interface BecomeSellerResult {
  storeStatus: "pending" | "approved" | "rejected";
  alreadySeller?: boolean;
}

export function useBecomeSeller() {
  const { showSuccess, showError } = useMessage();

  return useApiMutation<BecomeSellerResult, void>({
    mutationFn: () => sellerService.becomeSeller(),
    onSuccess: (data) => {
      if (!data?.alreadySeller) {
        showSuccess(SUCCESS_MESSAGES.USER.SELLER_APPLICATION_SUBMITTED);
      }
    },
    onError: () => showError(ERROR_MESSAGES.USER.SELLER_APPLICATION_FAILED),
  });
}

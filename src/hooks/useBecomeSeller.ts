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

import { useMutation } from "@tanstack/react-query";
import { useMessage } from "./useMessage";
import { becomeSellerAction } from "@/actions";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";

export interface BecomeSellerResult {
  storeStatus: "pending" | "approved" | "rejected";
  alreadySeller?: boolean;
}

export function useBecomeSeller() {
  const { showSuccess, showError } = useMessage();

  return useMutation<BecomeSellerResult, Error, void>({
    mutationFn: () => becomeSellerAction(),
    onSuccess: (data) => {
      if (!data?.alreadySeller) {
        showSuccess(SUCCESS_MESSAGES.USER.SELLER_APPLICATION_SUBMITTED);
      }
    },
    onError: () => showError(ERROR_MESSAGES.USER.SELLER_APPLICATION_FAILED),
  });
}

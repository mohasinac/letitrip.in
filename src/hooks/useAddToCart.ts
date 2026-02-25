"use client";

import { useApiMutation } from "./useApiMutation";
import { cartService } from "@/services";

interface AddToCartPayload {
  productId: string;
  quantity: number;
  [key: string]: unknown;
}

interface UseAddToCartOptions {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

/**
 * useAddToCart
 * Mutation hook for adding a product to the shopping cart.
 *
 * @example
 * const { mutate, isLoading } = useAddToCart({ onSuccess: () => showToast("Added!") });
 * mutate({ productId: 'prod-123', quantity: 1 });
 */
export function useAddToCart(options?: UseAddToCartOptions) {
  return useApiMutation<unknown, AddToCartPayload>({
    mutationFn: (data) => cartService.addItem(data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

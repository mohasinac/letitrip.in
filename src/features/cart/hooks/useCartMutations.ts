"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartItemAction, removeFromCartAction } from "@/actions";
import { cartService } from "@/services";
import type { CartDocument } from "@/db/schema";

interface CartApiResponse {
  cart: CartDocument;
  itemCount: number;
  subtotal: number;
}

export function useCart(enabled: boolean) {
  return useQuery<CartApiResponse>({
    queryKey: ["cart"],
    queryFn: () => cartService.get(),
    enabled,
  });
}

export function useUpdateCartItem(
  onSuccess?: () => void,
  onError?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { itemId: string; quantity: number }>({
    mutationFn: ({ itemId, quantity }) =>
      updateCartItemAction(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      onSuccess?.();
    },
    onError,
  });
}

export function useRemoveCartItem(
  onSuccess?: () => void,
  onError?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { itemId: string }>({
    mutationFn: ({ itemId }) => removeFromCartAction(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      onSuccess?.();
    },
    onError,
  });
}

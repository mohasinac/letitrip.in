"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateCartItemAction,
  removeFromCartAction,
  getCartAction,
} from "@/actions";
import type { CartDocument } from "@/db/schema";

interface CartApiResponse {
  cart: CartDocument;
  itemCount: number;
  subtotal: number;
}

export function useCart(enabled: boolean) {
  return useQuery<CartApiResponse | null>({
    queryKey: ["cart"],
    queryFn: async () => {
      const cart = await getCartAction();
      if (!cart) return null;
      const itemCount = cart.items.length;
      const subtotal = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      return { cart, itemCount, subtotal };
    },
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

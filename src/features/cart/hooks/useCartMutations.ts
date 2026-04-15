"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartItemAction, removeFromCartAction } from "@/actions";
import { useCartQuery } from "@mohasinac/appkit/features/cart";
import { API_ENDPOINTS } from "@/constants";
import type { CartDocument } from "@/db/schema";

interface CartApiResponse {
  cart: CartDocument;
  itemCount: number;
  subtotal: number;
}

export function useCart(enabled: boolean) {
  return useCartQuery<CartApiResponse | null>({
    endpoint: API_ENDPOINTS.CART.GET,
    queryKey: ["cart"],
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
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<CartApiResponse | null>([
        "cart",
      ]);
      queryClient.setQueryData<CartApiResponse | null>(["cart"], (old) => {
        if (!old) return old;
        return {
          ...old,
          cart: {
            ...old.cart,
            items: old.cart.items.map((item) =>
              item.itemId === itemId ? { ...item, quantity } : item,
            ),
          },
          subtotal: old.cart.items.reduce(
            (sum, item) =>
              sum +
              item.price * (item.itemId === itemId ? quantity : item.quantity),
            0,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      const ctx = context as
        | { previous: CartApiResponse | null | undefined }
        | undefined;
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(["cart"], ctx.previous);
      }
      onError?.();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      onSuccess?.();
    },
  });
}

export function useRemoveCartItem(
  onSuccess?: () => void,
  onError?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { itemId: string }>({
    mutationFn: ({ itemId }) => removeFromCartAction(itemId),
    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<CartApiResponse | null>([
        "cart",
      ]);
      queryClient.setQueryData<CartApiResponse | null>(["cart"], (old) => {
        if (!old) return old;
        const remaining = old.cart.items.filter(
          (item) => item.itemId !== itemId,
        );
        return {
          ...old,
          cart: { ...old.cart, items: remaining },
          itemCount: remaining.length,
          subtotal: remaining.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      const ctx = context as
        | { previous: CartApiResponse | null | undefined }
        | undefined;
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(["cart"], ctx.previous);
      }
      onError?.();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      onSuccess?.();
    },
  });
}


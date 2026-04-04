"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import { addToCartAction } from "@/actions";
import { addToGuestCart } from "@/utils";
import type { ApiClientError } from "@mohasinac/http";

interface AddToCartPayload {
  productId: string;
  quantity: number;
  productTitle?: string;
  productImage?: string;
  price?: number;
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
 * - Authenticated users: POSTs to /api/cart (server Firestore cart).
 * - Guest users: writes to localStorage guest cart; items are merged into
 *   the server cart automatically when the user signs in.
 *
 * @example
 * const { mutate, isLoading } = useAddToCart({ onSuccess: () => showToast("Added!") });
 * mutate({ productId: 'prod-123', quantity: 1 });
 */
export function useAddToCart(options?: UseAddToCartOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Keep options in a ref so the mutate callback stays stable (no re-creation on re-render)
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const serverMutation = useMutation<unknown, ApiClientError, AddToCartPayload>(
    {
      mutationFn: (data) =>
        addToCartAction(data as Parameters<typeof addToCartAction>[0]),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        optionsRef.current?.onSuccess?.();
      },
      onError: (err: ApiClientError) => optionsRef.current?.onError?.(err),
    },
  );

  const mutate = useCallback(
    async (data: AddToCartPayload): Promise<unknown> => {
      if (user) {
        // Authenticated: persist in server cart
        return serverMutation.mutate(data);
      }
      // Guest: persist in localStorage; merged on next login
      addToGuestCart(data.productId, data.quantity, {
        productTitle: data.productTitle,
        productImage: data.productImage,
        price: data.price,
      });
      optionsRef.current?.onSuccess?.();
      return undefined;
    },
    [user, serverMutation],
  );

  return {
    mutate,
    isLoading: serverMutation.isPending,
    error: serverMutation.error,
    data: serverMutation.data,
    reset: serverMutation.reset,
  };
}

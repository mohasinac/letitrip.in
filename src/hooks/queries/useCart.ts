"use client";

/**
 * Cart Query Hooks
 *
 * React Query hooks for cart data fetching and mutations.
 */

import { invalidateQueries, queryKeys } from "@/lib/react-query";
import { cartService } from "@/services/cart.service";
import type { AddToCartFormFE, CartFE } from "@/types/frontend/cart.types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

/**
 * Fetch current user's cart
 *
 * @param options - React Query options
 * @returns Query result with cart data
 *
 * @example
 * const { data: cart, isLoading } = useCart();
 */
export function useCart(
  options?: Omit<UseQueryOptions<CartFE>, "queryKey" | "queryFn">
) {
  return useQuery<CartFE>({
    queryKey: queryKeys.cart.current(),
    queryFn: () => cartService.get(),
    ...options,
  });
}

/**
 * Add item to cart mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * const addToCart = useAddToCart({
 *   onSuccess: () => toast.success('Added to cart')
 * });
 * addToCart.mutate({ productId: '123', quantity: 1 });
 */
export function useAddToCart(
  options?: UseMutationOptions<CartFE, Error, AddToCartFormFE>
) {
  const queryClient = useQueryClient();

  return useMutation<CartFE, Error, AddToCartFormFE>({
    mutationFn: (data) => cartService.addItem(data),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.cart.current());
    },
    ...options,
  });
}

/**
 * Update cart item mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useUpdateCartItem(
  options?: UseMutationOptions<
    CartFE,
    Error,
    { itemId: string; quantity: number }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<CartFE, Error, { itemId: string; quantity: number }>({
    mutationFn: ({ itemId, quantity }) =>
      cartService.updateItem(itemId, quantity),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.cart.current());
    },
    ...options,
  });
}

/**
 * Remove item from cart mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useRemoveFromCart(
  options?: UseMutationOptions<CartFE, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<CartFE, Error, string>({
    mutationFn: (itemId) => cartService.removeItem(itemId),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.cart.current());
    },
    ...options,
  });
}

/**
 * Clear cart mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useClearCart(
  options?: UseMutationOptions<{ message: string }, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationFn: () => cartService.clear(),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.cart.current());
    },
    ...options,
  });
}

/**
 * Apply coupon mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useApplyCoupon(
  options?: UseMutationOptions<CartFE, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<CartFE, Error, string>({
    mutationFn: (code) => cartService.applyCoupon(code),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.cart.current());
    },
    ...options,
  });
}

/**
 * Remove coupon mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useRemoveCoupon(
  options?: UseMutationOptions<CartFE, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation<CartFE, Error, void>({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.cart.current());
    },
    ...options,
  });
}

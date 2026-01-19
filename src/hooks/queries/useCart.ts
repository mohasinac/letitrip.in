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
  options?: Omit<UseQueryOptions<CartFE>, "queryKey" | "queryFn">,
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
  options?: UseMutationOptions<CartFE, Error, AddToCartFormFE>,
) {
  const queryClient = useQueryClient();

  return useMutation<CartFE, Error, AddToCartFormFE>({
    mutationFn: (data) => cartService.addItem(data),
    // Optimistic update
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.current() });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<CartFE>(
        queryKeys.cart.current(),
      );

      // Optimistically update cart
      if (previousCart) {
        const optimisticCart: CartFE = {
          ...previousCart,
          items: [
            ...previousCart.items,
            {
              id: `temp_${Date.now()}`,
              productId: newItem.productId,
              productName: "Loading...",
              productSlug: "",
              quantity: newItem.quantity,
              price: 0,
              productImage: "",
              sku: "",
              variantId: newItem.variantId || null,
              variantName: null,
              maxQuantity: 100,
              subtotal: 0,
              discount: 0,
              total: 0,
              isAvailable: true,
              addedAt: new Date(),
              formattedPrice: "₹0",
              formattedSubtotal: "₹0",
              formattedTotal: "₹0",
              isOutOfStock: false,
              isLowStock: false,
              canIncrement: true,
              canDecrement: false,
              hasDiscount: false,
              addedTimeAgo: "Just now",
            },
          ],
          itemCount: previousCart.itemCount + newItem.quantity,
        };
        queryClient.setQueryData(queryKeys.cart.current(), optimisticCart);
      }

      return { previousCart };
    },
    // Rollback on error
    onError: (err, newItem, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(
          queryKeys.cart.current(),
          context.previousCart,
        );
      }
    },
    // Refetch on success
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
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<CartFE, Error, { itemId: string; quantity: number }>({
    mutationFn: ({ itemId, quantity }) =>
      cartService.updateItem(itemId, quantity),
    // Optimistic update
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.current() });

      const previousCart = queryClient.getQueryData<CartFE>(
        queryKeys.cart.current(),
      );

      if (previousCart) {
        const optimisticCart: CartFE = {
          ...previousCart,
          items: previousCart.items.map((item) => {
            if (item.id === itemId) {
              const subtotal = item.price * quantity;
              const total = subtotal - (item.discount || 0);
              return {
                ...item,
                quantity,
                subtotal,
                total,
                formattedSubtotal: `₹${subtotal.toLocaleString("en-IN")}`,
                formattedTotal: `₹${total.toLocaleString("en-IN")}`,
                canIncrement: quantity < item.maxQuantity,
                canDecrement: quantity > 1,
              };
            }
            return item;
          }),
          itemCount:
            previousCart.itemCount -
            (previousCart.items.find((i) => i.id === itemId)?.quantity || 0) +
            quantity,
        };
        queryClient.setQueryData(queryKeys.cart.current(), optimisticCart);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(
          queryKeys.cart.current(),
          context.previousCart,
        );
      }
    },
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
  options?: UseMutationOptions<CartFE, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation<CartFE, Error, string>({
    mutationFn: (itemId) => cartService.removeItem(itemId),
    // Optimistic update
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.current() });

      const previousCart = queryClient.getQueryData<CartFE>(
        queryKeys.cart.current(),
      );

      if (previousCart) {
        const removedItem = previousCart.items.find((i) => i.id === itemId);
        const optimisticCart: CartFE = {
          ...previousCart,
          items: previousCart.items.filter((item) => item.id !== itemId),
          itemCount: previousCart.itemCount - (removedItem?.quantity || 0),
        };
        queryClient.setQueryData(queryKeys.cart.current(), optimisticCart);
      }

      return { previousCart };
    },
    onError: (err, itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(
          queryKeys.cart.current(),
          context.previousCart,
        );
      }
    },
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
  options?: UseMutationOptions<{ message: string }, Error, void>,
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationFn: () => cartService.clear(),
    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.current() });

      const previousCart = queryClient.getQueryData<CartFE>(
        queryKeys.cart.current(),
      );

      if (previousCart) {
        const emptyCart: CartFE = {
          ...previousCart,
          items: [],
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          tax: 0,
          total: 0,
          formattedSubtotal: "₹0",
          formattedDiscount: "₹0",
          formattedTax: "₹0",
          formattedTotal: "₹0",
        };
        queryClient.setQueryData(queryKeys.cart.current(), emptyCart);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(
          queryKeys.cart.current(),
          context.previousCart,
        );
      }
    },
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
  options?: UseMutationOptions<CartFE, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation<CartFE, Error, string>({
    mutationFn: (code) => cartService.applyCoupon(code),
    // Optimistic update
    onMutate: async (code) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.current() });

      const previousCart = queryClient.getQueryData<CartFE>(
        queryKeys.cart.current(),
      );

      if (previousCart) {
        // Optimistic discount calculation (estimate 10% discount)
        const discount = Math.round(previousCart.subtotal * 0.1 * 100) / 100;
        const total =
          Math.round(
            (previousCart.subtotal + previousCart.tax - discount) * 100,
          ) / 100;

        const optimisticCart: CartFE = {
          ...previousCart,
          couponCode: code,
          discount,
          total,
          formattedDiscount: `₹${discount.toLocaleString("en-IN")}`,
          formattedTotal: `₹${total.toLocaleString("en-IN")}`,
        };
        queryClient.setQueryData(queryKeys.cart.current(), optimisticCart);
      }

      return { previousCart };
    },
    onError: (err, code, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(
          queryKeys.cart.current(),
          context.previousCart,
        );
      }
    },
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
  options?: UseMutationOptions<CartFE, Error, void>,
) {
  const queryClient = useQueryClient();

  return useMutation<CartFE, Error, void>({
    mutationFn: () => cartService.removeCoupon(),
    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.current() });

      const previousCart = queryClient.getQueryData<CartFE>(
        queryKeys.cart.current(),
      );

      if (previousCart) {
        const total =
          Math.round((previousCart.subtotal + previousCart.tax) * 100) / 100;

        const optimisticCart: CartFE = {
          ...previousCart,
          couponCode: null,
          discount: 0,
          total,
          formattedDiscount: "₹0",
          formattedTotal: `₹${total.toLocaleString("en-IN")}`,
        };
        queryClient.setQueryData(queryKeys.cart.current(), optimisticCart);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(
          queryKeys.cart.current(),
          context.previousCart,
        );
      }
    },
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.cart.current());
    },
    ...options,
  });
}

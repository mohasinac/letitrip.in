"use client";

/**
 * Order Query Hooks
 *
 * React Query hooks for order data fetching and mutations.
 */

import { invalidateQueries, queryKeys } from "@/lib/react-query";
import { ordersService } from "@/services/orders.service";
import type {
  CreateOrderFormFE,
  OrderCardFE,
  OrderFE,
} from "@/types/frontend/order.types";
import type { PaginatedResponseFE } from "@/types/shared/common.types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

/**
 * Fetch order by ID
 *
 * @param id - Order ID
 * @param options - React Query options
 * @returns Query result with order data
 *
 * @example
 * const { data: order } = useOrder(orderId);
 */
export function useOrder(
  id: string | undefined,
  options?: Omit<UseQueryOptions<OrderFE>, "queryKey" | "queryFn">
) {
  return useQuery<OrderFE>({
    queryKey: queryKeys.orders.detail(id!),
    queryFn: () => ordersService.getById(id!),
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch paginated list of orders
 *
 * @param filters - Filter criteria
 * @param options - React Query options
 * @returns Query result with paginated orders
 */
export function useOrders(
  filters?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<PaginatedResponseFE<OrderCardFE>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<PaginatedResponseFE<OrderCardFE>>({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => ordersService.list(filters),
    ...options,
  });
}

/**
 * Create order mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * const createOrder = useCreateOrder({
 *   onSuccess: (order) => {
 *     router.push(`/orders/${order.id}`);
 *   }
 * });
 */
export function useCreateOrder(
  options?: UseMutationOptions<OrderFE, Error, CreateOrderFormFE>
) {
  const queryClient = useQueryClient();

  return useMutation<OrderFE, Error, CreateOrderFormFE>({
    mutationFn: (data) => ordersService.create(data),
    onSuccess: async () => {
      // Invalidate orders list and cart
      await Promise.all([
        invalidateQueries(queryClient, queryKeys.orders.lists()),
        invalidateQueries(queryClient, queryKeys.cart.current()),
      ]);
    },
    ...options,
  });
}

/**
 * Cancel order mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useCancelOrder(
  options?: UseMutationOptions<OrderFE, Error, { id: string; reason: string }>
) {
  const queryClient = useQueryClient();

  return useMutation<OrderFE, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => ordersService.cancel(id, reason),
    onSuccess: async (data, variables) => {
      await Promise.all([
        invalidateQueries(queryClient, queryKeys.orders.detail(variables.id)),
        invalidateQueries(queryClient, queryKeys.orders.lists()),
      ]);
    },
    ...options,
  });
}

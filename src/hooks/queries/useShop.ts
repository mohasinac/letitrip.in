"use client";

/**
 * Shop Query Hooks
 *
 * React Query hooks for shop data fetching and mutations.
 */

import { invalidateQueries, queryKeys } from "@/lib/react-query";
import { shopsService } from "@/services/shops.service";
import type {
  ShopCardFE,
  ShopFE,
  ShopFormFE,
} from "@/types/frontend/shop.types";
import type { PaginatedResponseFE } from "@/types/shared/common.types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

/**
 * Fetch shop by ID
 *
 * @param id - Shop ID
 * @param options - React Query options
 * @returns Query result with shop data
 */
export function useShop(
  id: string | undefined,
  options?: Omit<UseQueryOptions<ShopFE>, "queryKey" | "queryFn">
) {
  return useQuery<ShopFE>({
    queryKey: queryKeys.shops.detail(id!),
    queryFn: () => shopsService.getById(id!),
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch shop by slug
 *
 * @param slug - Shop URL slug
 * @param options - React Query options
 * @returns Query result with shop data
 *
 * @example
 * const { data: shop } = useShopBySlug(slug);
 */
export function useShopBySlug(
  slug: string | undefined,
  options?: Omit<UseQueryOptions<ShopFE>, "queryKey" | "queryFn">
) {
  return useQuery<ShopFE>({
    queryKey: queryKeys.shops.bySlug(slug!),
    queryFn: () => shopsService.getBySlug(slug!),
    enabled: !!slug,
    ...options,
  });
}

/**
 * Fetch paginated list of shops
 *
 * @param filters - Filter criteria
 * @param options - React Query options
 * @returns Query result with paginated shops
 */
export function useShops(
  filters?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<PaginatedResponseFE<ShopCardFE>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<PaginatedResponseFE<ShopCardFE>>({
    queryKey: queryKeys.shops.list(filters),
    queryFn: () => shopsService.list(filters),
    ...options,
  });
}

/**
 * Fetch shop statistics
 *
 * @param slug - Shop slug
 * @param options - React Query options
 * @returns Query result with shop stats
 */
export function useShopStats(
  slug: string | undefined,
  options?: Omit<UseQueryOptions<any>, "queryKey" | "queryFn">
) {
  return useQuery<any>({
    queryKey: queryKeys.shops.stats(slug!),
    queryFn: () => shopsService.getStats(slug!),
    enabled: !!slug,
    ...options,
  });
}

/**
 * Fetch following shops
 *
 * @param options - React Query options
 * @returns Query result with following shops
 */
export function useFollowingShops(
  options?: Omit<
    UseQueryOptions<{ shops: ShopCardFE[]; count: number }>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<{ shops: ShopCardFE[]; count: number }>({
    queryKey: queryKeys.shops.following(),
    queryFn: () => shopsService.getFollowing(),
    ...options,
  });
}

/**
 * Fetch featured shops
 *
 * @param options - React Query options
 * @returns Query result with featured shops
 */
export function useFeaturedShops(
  options?: Omit<UseQueryOptions<ShopCardFE[]>, "queryKey" | "queryFn">
) {
  return useQuery<ShopCardFE[]>({
    queryKey: queryKeys.shops.lists(),
    queryFn: () => shopsService.getFeatured(),
    ...options,
  });
}

/**
 * Create shop mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * const createShop = useCreateShop({
 *   onSuccess: (shop) => {
 *     router.push(`/shops/${shop.slug}`);
 *   }
 * });
 */
export function useCreateShop(
  options?: UseMutationOptions<ShopFE, Error, ShopFormFE>
) {
  const queryClient = useQueryClient();

  return useMutation<ShopFE, Error, ShopFormFE>({
    mutationFn: (data) => shopsService.create(data),
    onSuccess: async () => {
      await invalidateQueries(queryClient, queryKeys.shops.lists());
    },
    ...options,
  });
}

/**
 * Update shop mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useUpdateShop(
  options?: UseMutationOptions<
    ShopFE,
    Error,
    { slug: string; data: Partial<ShopFormFE> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ShopFE,
    Error,
    { slug: string; data: Partial<ShopFormFE> }
  >({
    mutationFn: ({ slug, data }) => shopsService.updateBySlug(slug, data),
    onSuccess: async (data, variables) => {
      await Promise.all([
        invalidateQueries(queryClient, queryKeys.shops.bySlug(variables.slug)),
        invalidateQueries(queryClient, queryKeys.shops.lists()),
      ]);
    },
    ...options,
  });
}

/**
 * Follow shop mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useFollowShop(
  options?: UseMutationOptions<{ message: string }, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (slug) => shopsService.follow(slug),
    onSuccess: async (data, slug) => {
      await Promise.all([
        invalidateQueries(queryClient, queryKeys.shops.bySlug(slug)),
        invalidateQueries(queryClient, queryKeys.shops.following()),
      ]);
    },
    ...options,
  });
}

/**
 * Unfollow shop mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useUnfollowShop(
  options?: UseMutationOptions<{ message: string }, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (slug) => shopsService.unfollow(slug),
    onSuccess: async (data, slug) => {
      await Promise.all([
        invalidateQueries(queryClient, queryKeys.shops.bySlug(slug)),
        invalidateQueries(queryClient, queryKeys.shops.following()),
      ]);
    },
    ...options,
  });
}

/**
 * React Query Configuration
 * 
 * Configures TanStack Query (React Query) for server state management
 * with optimized defaults for caching, retries, and error handling.
 */

import { QueryClient, DefaultOptions } from "@tanstack/react-query";

/**
 * Default query options for all React Query queries
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Stale time: 5 minutes
    // Data is considered fresh for 5 minutes before refetching
    staleTime: 5 * 60 * 1000,
    
    // Cache time: 10 minutes
    // Inactive queries are kept in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    
    // Retry failed requests 3 times with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Don't refetch on window focus by default (can be overridden per query)
    refetchOnWindowFocus: false,
    
    // Refetch on reconnect (useful for mobile/offline scenarios)
    refetchOnReconnect: true,
    
    // Don't refetch on mount by default (data is cached)
    refetchOnMount: false,
  },
  mutations: {
    // Retry mutations once
    retry: 1,
  },
};

/**
 * Create and configure the React Query client
 * 
 * @returns Configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
}

/**
 * Singleton query client instance
 * Used in client components
 */
export const queryClient = createQueryClient();

/**
 * Query key factories for consistent cache key management
 * 
 * These factories provide a standardized way to create query keys
 * that support invalidation and prefetching patterns.
 */
export const queryKeys = {
  // Products
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    bySlug: (slug: string) => [...queryKeys.products.all, "slug", slug] as const,
    reviews: (id: string) => [...queryKeys.products.detail(id), "reviews"] as const,
    variants: (id: string) => [...queryKeys.products.detail(id), "variants"] as const,
    similar: (id: string) => [...queryKeys.products.detail(id), "similar"] as const,
  },
  
  // Users
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
    stats: () => [...queryKeys.users.all, "stats"] as const,
  },
  
  // Orders
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    stats: () => [...queryKeys.orders.all, "stats"] as const,
  },
  
  // Cart
  cart: {
    all: ["cart"] as const,
    current: () => [...queryKeys.cart.all, "current"] as const,
  },
  
  // Shops
  shops: {
    all: ["shops"] as const,
    lists: () => [...queryKeys.shops.all, "list"] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.shops.lists(), filters] as const,
    details: () => [...queryKeys.shops.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.shops.details(), id] as const,
    bySlug: (slug: string) => [...queryKeys.shops.all, "slug", slug] as const,
    products: (slug: string) => [...queryKeys.shops.bySlug(slug), "products"] as const,
    stats: (slug: string) => [...queryKeys.shops.bySlug(slug), "stats"] as const,
    following: () => [...queryKeys.shops.all, "following"] as const,
  },
  
  // Categories
  categories: {
    all: ["categories"] as const,
    tree: () => [...queryKeys.categories.all, "tree"] as const,
    detail: (id: string) => [...queryKeys.categories.all, id] as const,
  },
  
  // Reviews
  reviews: {
    all: ["reviews"] as const,
    lists: () => [...queryKeys.reviews.all, "list"] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.reviews.lists(), filters] as const,
    details: () => [...queryKeys.reviews.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.reviews.details(), id] as const,
    summary: (filters: Record<string, any>) => 
      [...queryKeys.reviews.all, "summary", filters] as const,
  },
  
  // Auctions
  auctions: {
    all: ["auctions"] as const,
    lists: () => [...queryKeys.auctions.all, "list"] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.auctions.lists(), filters] as const,
    details: () => [...queryKeys.auctions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.auctions.details(), id] as const,
    bids: (id: string) => [...queryKeys.auctions.detail(id), "bids"] as const,
  },
} as const;

/**
 * Helper to invalidate related queries after mutations
 * 
 * @example
 * // After creating a product, invalidate products list
 * await invalidateQueries(queryClient, queryKeys.products.lists());
 */
export async function invalidateQueries(
  client: QueryClient,
  queryKey: readonly unknown[]
): Promise<void> {
  await client.invalidateQueries({ queryKey });
}

/**
 * Helper to prefetch data for better UX
 * 
 * @example
 * // Prefetch product details on hover
 * await prefetchQuery(queryClient, queryKeys.products.detail(id), () => 
 *   productsService.getById(id)
 * );
 */
export async function prefetchQuery<T>(
  client: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>
): Promise<void> {
  await client.prefetchQuery({
    queryKey,
    queryFn,
  });
}

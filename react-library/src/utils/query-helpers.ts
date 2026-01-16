/**
 * Query Key Factory
 *
 * Utility for creating consistent, type-safe query keys.
 * Query keys are used for caching, invalidation, and deduplication.
 *
 * @example
 * ```tsx
 * // Create a query key factory for a resource
 * const productKeys = {
 *   all: ['products'] as const,
 *   lists: () => [...productKeys.all, 'list'] as const,
 *   list: (filters: any) => [...productKeys.lists(), filters] as const,
 *   details: () => [...productKeys.all, 'detail'] as const,
 *   detail: (id: string) => [...productKeys.details(), id] as const,
 * };
 *
 * // Usage
 * useQuery({
 *   queryKey: productKeys.detail('123'),
 *   queryFn: () => fetchProduct('123')
 * });
 *
 * // Invalidate all product queries
 * queryClient.invalidateQueries({ queryKey: productKeys.all });
 *
 * // Invalidate all product lists
 * queryClient.invalidateQueries({ queryKey: productKeys.lists() });
 *
 * // Invalidate specific product
 * queryClient.invalidateQueries({ queryKey: productKeys.detail('123') });
 * ```
 */

/**
 * Create a query key factory for a resource
 *
 * @param resource - Resource name (e.g., 'products', 'users')
 * @returns Query key factory with common patterns
 *
 * @example
 * ```tsx
 * const productKeys = createQueryKeys('products');
 *
 * // Keys: ['products']
 * productKeys.all;
 *
 * // Keys: ['products', 'list']
 * productKeys.lists();
 *
 * // Keys: ['products', 'list', { status: 'active' }]
 * productKeys.list({ status: 'active' });
 *
 * // Keys: ['products', 'detail']
 * productKeys.details();
 *
 * // Keys: ['products', 'detail', '123']
 * productKeys.detail('123');
 *
 * // Keys: ['products', 'bySlug', 'my-product']
 * productKeys.bySlug('my-product');
 * ```
 */
export function createQueryKeys(resource: string) {
  return {
    all: [resource] as const,
    lists: () => [resource, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [resource, "list", filters] as const,
    details: () => [resource, "detail"] as const,
    detail: (id: string) => [resource, "detail", id] as const,
    bySlug: (slug: string) => [resource, "bySlug", slug] as const,
    search: (query: string) => [resource, "search", query] as const,
    infinite: (filters?: Record<string, any>) =>
      [resource, "infinite", filters] as const,
  };
}

/**
 * Create a custom query key factory with specific patterns
 *
 * @param resource - Resource name
 * @param customKeys - Custom key generators
 * @returns Query key factory with custom patterns
 *
 * @example
 * ```tsx
 * const orderKeys = createCustomQueryKeys('orders', {
 *   byStatus: (status: string) => ['orders', 'status', status] as const,
 *   byUser: (userId: string) => ['orders', 'user', userId] as const,
 *   recent: () => ['orders', 'recent'] as const,
 * });
 *
 * // Usage
 * orderKeys.all; // ['orders']
 * orderKeys.byStatus('pending'); // ['orders', 'status', 'pending']
 * orderKeys.byUser('user123'); // ['orders', 'user', 'user123']
 * orderKeys.recent(); // ['orders', 'recent']
 * ```
 */
export function createCustomQueryKeys<
  T extends Record<string, (...args: any[]) => readonly any[]>
>(resource: string, customKeys: T) {
  return {
    all: [resource] as const,
    ...customKeys,
  };
}

/**
 * Optimistic Update Helper
 *
 * Helper for performing optimistic updates with rollback on error.
 *
 * @example
 * ```tsx
 * const updateProduct = useMutation({
 *   mutationFn: (product) => api.updateProduct(product),
 *   onMutate: async (newProduct) => {
 *     // Cancel outgoing refetches
 *     await queryClient.cancelQueries({ queryKey: productKeys.detail(newProduct.id) });
 *
 *     // Snapshot previous value
 *     const previousProduct = queryClient.getQueryData(productKeys.detail(newProduct.id));
 *
 *     // Optimistically update
 *     queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct);
 *
 *     // Return context for rollback
 *     return { previousProduct };
 *   },
 *   onError: (err, newProduct, context) => {
 *     // Rollback on error
 *     if (context?.previousProduct) {
 *       queryClient.setQueryData(
 *         productKeys.detail(newProduct.id),
 *         context.previousProduct
 *       );
 *     }
 *   },
 *   onSettled: (newProduct) => {
 *     // Refetch to ensure consistency
 *     queryClient.invalidateQueries({ queryKey: productKeys.detail(newProduct.id) });
 *   },
 * });
 * ```
 */
export interface OptimisticUpdateContext<TData = unknown> {
  previous: TData | undefined;
  optimistic: TData;
}

/**
 * Create optimistic update handlers
 *
 * @param queryKey - Query key to update
 * @param getOptimisticData - Function to generate optimistic data
 * @returns Mutation callbacks for optimistic updates
 *
 * @example
 * ```tsx
 * // With a query client (TanStack Query, etc.)
 * const { onMutate, onError, onSettled } = createOptimisticUpdate(
 *   productKeys.detail('123'),
 *   (variables, previous) => ({
 *     ...previous,
 *     ...variables,
 *     updatedAt: new Date().toISOString(),
 *   }),
 *   queryClient
 * );
 *
 * const updateProduct = useMutation({
 *   mutationFn: updateProductApi,
 *   onMutate,
 *   onError,
 *   onSettled,
 * });
 * ```
 */
export function createOptimisticUpdate<TData, TVariables>(
  queryKey: readonly unknown[],
  getOptimisticData: (
    variables: TVariables,
    previous: TData | undefined
  ) => TData,
  queryClient: {
    cancelQueries: (key: { queryKey: readonly unknown[] }) => Promise<void>;
    getQueryData: (key: readonly unknown[]) => TData | undefined;
    setQueryData: (key: readonly unknown[], data: TData) => void;
    invalidateQueries: (key: { queryKey: readonly unknown[] }) => Promise<void>;
  }
) {
  return {
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previous = queryClient.getQueryData(queryKey);

      // Optimistically update
      if (previous !== undefined) {
        const optimistic = getOptimisticData(variables, previous);
        queryClient.setQueryData(queryKey, optimistic);
      }

      // Return context for rollback
      return { previous };
    },

    onError: (
      _error: unknown,
      _variables: TVariables,
      context?: { previous: TData | undefined }
    ) => {
      // Rollback on error
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: async () => {
      // Refetch to ensure consistency
      await queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * Cache Invalidation Helper
 *
 * @example
 * ```tsx
 * // Invalidate specific patterns
 * await invalidateQueries(queryClient, productKeys.all); // All products
 * await invalidateQueries(queryClient, productKeys.lists()); // All product lists
 * await invalidateQueries(queryClient, productKeys.detail('123')); // Specific product
 * ```
 */
export async function invalidateQueries(
  queryClient: {
    invalidateQueries: (key: { queryKey: readonly unknown[] }) => Promise<void>;
  },
  queryKey: readonly unknown[]
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey });
}

/**
 * Prefetch Helper
 *
 * @example
 * ```tsx
 * // Prefetch data on hover
 * <Link
 *   to="/products/123"
 *   onMouseEnter={() => {
 *     prefetchQuery(
 *       queryClient,
 *       productKeys.detail('123'),
 *       () => fetchProduct('123')
 *     );
 *   }}
 * >
 *   View Product
 * </Link>
 * ```
 */
export async function prefetchQuery<TData>(
  queryClient: {
    prefetchQuery?: (options: {
      queryKey: readonly unknown[];
      queryFn: () => Promise<TData>;
    }) => Promise<void>;
    setQueryData?: (key: readonly unknown[], data: TData) => void;
  },
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>
): Promise<void> {
  if (queryClient.prefetchQuery) {
    await queryClient.prefetchQuery({ queryKey, queryFn });
  } else if (queryClient.setQueryData) {
    // Fallback for clients without prefetch
    const data = await queryFn();
    queryClient.setQueryData(queryKey, data);
  }
}

/**
 * Paginated Query Helper
 *
 * @example
 * ```tsx
 * const paginatedQuery = usePaginatedQuery({
 *   queryKey: productKeys.list,
 *   queryFn: (page, limit) => fetchProducts({ page, limit }),
 *   initialPage: 1,
 *   pageSize: 20,
 * });
 *
 * const {
 *   data,
 *   isLoading,
 *   page,
 *   hasNextPage,
 *   hasPreviousPage,
 *   nextPage,
 *   previousPage,
 *   goToPage,
 * } = paginatedQuery;
 * ```
 */
export interface PaginatedQueryOptions<TData> {
  queryKey: (page: number, limit: number) => readonly unknown[];
  queryFn: (
    page: number,
    limit: number
  ) => Promise<{ data: TData[]; total: number; page: number; limit: number }>;
  initialPage?: number;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Infinite Query Helper
 *
 * @example
 * ```tsx
 * const infiniteQuery = useInfiniteQuery({
 *   queryKey: productKeys.infinite(),
 *   queryFn: ({ pageParam = 1 }) => fetchProducts({ page: pageParam }),
 *   getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
 * });
 *
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = infiniteQuery;
 * ```
 */
export interface InfiniteQueryOptions<TData> {
  queryKey: readonly unknown[];
  queryFn: (params: { pageParam: any }) => Promise<TData>;
  getNextPageParam: (lastPage: TData) => any;
  getPreviousPageParam?: (firstPage: TData) => any;
  initialPageParam?: any;
  enabled?: boolean;
}

/**
 * Dependent Query Helper
 *
 * Execute queries in sequence where each depends on the previous.
 *
 * @example
 * ```tsx
 * // User query
 * const { data: user } = useQuery({
 *   queryKey: userKeys.me(),
 *   queryFn: fetchCurrentUser,
 * });
 *
 * // Shop query (depends on user)
 * const { data: shop } = useQuery({
 *   queryKey: shopKeys.detail(user?.shopId),
 *   queryFn: () => fetchShop(user!.shopId),
 *   enabled: !!user?.shopId, // Only run if user exists and has shopId
 * });
 * ```
 */
export function createDependentQuery<TData, TDependency>(
  dependentData: TDependency | undefined,
  queryKey: (dep: TDependency) => readonly unknown[],
  queryFn: (dep: TDependency) => Promise<TData>,
  enabled: (dep: TDependency | undefined) => boolean = (dep) =>
    dep !== undefined
) {
  return {
    queryKey: dependentData ? queryKey(dependentData) : [],
    queryFn: () =>
      dependentData
        ? queryFn(dependentData)
        : Promise.reject(new Error("Dependency not ready")),
    enabled: enabled(dependentData),
  };
}

export default {
  createQueryKeys,
  createCustomQueryKeys,
  createOptimisticUpdate,
  invalidateQueries,
  prefetchQuery,
  createDependentQuery,
};

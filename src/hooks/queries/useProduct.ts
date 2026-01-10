"use client";

/**
 * Product Query Hooks
 *
 * React Query hooks for product data fetching and caching.
 * Provides optimized data fetching with automatic caching, background refetching,
 * and cache invalidation.
 */

import { invalidateQueries, queryKeys } from "@/lib/react-query";
import { productsService } from "@/services/products.service";
import type {
  ProductCardFE,
  ProductFE,
  ProductFormFE,
} from "@/types/frontend/product.types";
import type { ReviewFE } from "@/types/frontend/review.types";
import type { PaginatedResponseFE } from "@/types/shared/common.types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

/**
 * Fetch a single product by ID
 *
 * @param id - Product ID
 * @param options - React Query options
 * @returns Query result with product data
 *
 * @example
 * const { data: product, isLoading } = useProduct(productId);
 */
export function useProduct(
  id: string | undefined,
  options?: Omit<UseQueryOptions<ProductFE>, "queryKey" | "queryFn">
) {
  return useQuery<ProductFE>({
    queryKey: queryKeys.products.detail(id!),
    queryFn: () => productsService.getById(id!),
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch a single product by slug
 *
 * @param slug - Product URL slug
 * @param options - React Query options
 * @returns Query result with product data
 *
 * @example
 * const { data: product } = useProductBySlug(slug);
 */
export function useProductBySlug(
  slug: string | undefined,
  options?: Omit<UseQueryOptions<ProductFE>, "queryKey" | "queryFn">
) {
  return useQuery<ProductFE>({
    queryKey: queryKeys.products.bySlug(slug!),
    queryFn: () => productsService.getBySlug(slug!),
    enabled: !!slug,
    ...options,
  });
}

/**
 * Fetch paginated list of products
 *
 * @param filters - Filter criteria (page, limit, category, price range, etc.)
 * @param options - React Query options
 * @returns Query result with paginated products
 *
 * @example
 * const { data, isLoading } = useProducts({
 *   page: 1,
 *   limit: 20,
 *   category: 'electronics'
 * });
 */
export function useProducts(
  filters?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<PaginatedResponseFE<ProductCardFE>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<PaginatedResponseFE<ProductCardFE>>({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productsService.list(filters),
    ...options,
  });
}

/**
 * Fetch product reviews
 *
 * @param productId - Product ID
 * @param options - React Query options
 * @returns Query result with product reviews
 *
 * @example
 * const { data: reviews } = useProductReviews(productId);
 */
export function useProductReviews(
  productId: string | undefined,
  options?: Omit<UseQueryOptions<ReviewFE[]>, "queryKey" | "queryFn">
) {
  return useQuery<ReviewFE[]>({
    queryKey: queryKeys.products.reviews(productId!),
    queryFn: () => productsService.getReviews(productId!),
    enabled: !!productId,
    ...options,
  });
}

/**
 * Fetch product variants
 *
 * @param productId - Product ID
 * @param options - React Query options
 * @returns Query result with product variants
 *
 * @example
 * const { data: variants } = useProductVariants(productId);
 */
export function useProductVariants(
  productId: string | undefined,
  options?: Omit<UseQueryOptions<ProductCardFE[]>, "queryKey" | "queryFn">
) {
  return useQuery<ProductCardFE[]>({
    queryKey: queryKeys.products.variants(productId!),
    queryFn: () => productsService.getVariants(productId!),
    enabled: !!productId,
    ...options,
  });
}

/**
 * Fetch similar products
 *
 * @param productId - Product ID
 * @param options - React Query options
 * @returns Query result with similar products
 *
 * @example
 * const { data: similar } = useSimilarProducts(productId);
 */
export function useSimilarProducts(
  productId: string | undefined,
  options?: Omit<UseQueryOptions<ProductCardFE[]>, "queryKey" | "queryFn">
) {
  return useQuery<ProductCardFE[]>({
    queryKey: queryKeys.products.similar(productId!),
    queryFn: () => productsService.getSimilar(productId!),
    enabled: !!productId,
    ...options,
  });
}

/**
 * Fetch featured products
 *
 * @param options - React Query options
 * @returns Query result with featured products
 *
 * @example
 * const { data: featured } = useFeaturedProducts();
 */
export function useFeaturedProducts(
  options?: Omit<UseQueryOptions<ProductCardFE[]>, "queryKey" | "queryFn">
) {
  return useQuery<ProductCardFE[]>({
    queryKey: queryKeys.products.lists(),
    queryFn: () => productsService.getFeatured(),
    ...options,
  });
}

/**
 * Create product mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * const createProduct = useCreateProduct({
 *   onSuccess: (product) => {
 *     console.log('Created:', product);
 *   }
 * });
 *
 * createProduct.mutate(formData);
 */
export function useCreateProduct(
  options?: UseMutationOptions<ProductFE, Error, ProductFormFE>
) {
  const queryClient = useQueryClient();

  return useMutation<ProductFE, Error, ProductFormFE>({
    mutationFn: (data) => productsService.create(data),
    onSuccess: async (data, variables, context) => {
      // Invalidate products list to refetch
      await invalidateQueries(queryClient, queryKeys.products.lists());
    },
    ...options,
  });
}

/**
 * Update product mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * const updateProduct = useUpdateProduct({
 *   onSuccess: () => {
 *     toast.success('Product updated');
 *   }
 * });
 *
 * updateProduct.mutate({ id: '123', data: formData });
 */
export function useUpdateProduct(
  options?: UseMutationOptions<
    ProductFE,
    Error,
    { id: string; data: Partial<ProductFormFE> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ProductFE,
    Error,
    { id: string; data: Partial<ProductFormFE> }
  >({
    mutationFn: ({ id, data }) => productsService.update(id, data),
    onSuccess: async (data, variables, context) => {
      // Invalidate specific product and lists
      await Promise.all([
        invalidateQueries(queryClient, queryKeys.products.detail(variables.id)),
        invalidateQueries(queryClient, queryKeys.products.lists()),
      ]);
    },
    ...options,
  });
}

/**
 * Update product by slug mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 */
export function useUpdateProductBySlug(
  options?: UseMutationOptions<
    ProductFE,
    Error,
    { slug: string; data: Partial<ProductFormFE> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ProductFE,
    Error,
    { slug: string; data: Partial<ProductFormFE> }
  >({
    mutationFn: ({ slug, data }) => productsService.updateBySlug(slug, data),
    onSuccess: async (data, variables, context) => {
      // Invalidate by slug and lists
      await Promise.all([
        invalidateQueries(
          queryClient,
          queryKeys.products.bySlug(variables.slug)
        ),
        invalidateQueries(queryClient, queryKeys.products.lists()),
      ]);
    },
    ...options,
  });
}

/**
 * Delete product mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * const deleteProduct = useDeleteProduct({
 *   onSuccess: () => {
 *     toast.success('Product deleted');
 *     router.push('/products');
 *   }
 * });
 *
 * deleteProduct.mutate(productId);
 */
export function useDeleteProduct(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => productsService.delete(id),
    onSuccess: async (data, variables, context) => {
      // Invalidate all product queries
      await invalidateQueries(queryClient, queryKeys.products.all);
    },
    ...options,
  });
}

/**
 * Update product stock mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * const updateStock = useUpdateProductStock();
 * updateStock.mutate({ id: '123', stock: 50 });
 */
export function useUpdateProductStock(
  options?: UseMutationOptions<ProductFE, Error, { id: string; stock: number }>
) {
  const queryClient = useQueryClient();

  return useMutation<ProductFE, Error, { id: string; stock: number }>({
    mutationFn: ({ id, stock }) => productsService.updateStock(id, stock),
    onSuccess: async (data, variables, context) => {
      // Invalidate specific product
      await invalidateQueries(
        queryClient,
        queryKeys.products.detail(variables.id)
      );
    },
    ...options,
  });
}

/**
 * Update product status mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * const updateStatus = useUpdateProductStatus();
 * updateStatus.mutate({ id: '123', status: 'published' });
 */
export function useUpdateProductStatus(
  options?: UseMutationOptions<
    ProductFE,
    Error,
    { id: string; status: "draft" | "published" | "archived" }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ProductFE,
    Error,
    { id: string; status: "draft" | "published" | "archived" }
  >({
    mutationFn: ({ id, status }) => productsService.updateStatus(id, status),
    onSuccess: async (data, variables, context) => {
      // Invalidate specific product and lists
      await Promise.all([
        invalidateQueries(queryClient, queryKeys.products.detail(variables.id)),
        invalidateQueries(queryClient, queryKeys.products.lists()),
      ]);
    },
    ...options,
  });
}

/**
 * Bulk delete products mutation
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * const bulkDelete = useBulkDeleteProducts();
 * bulkDelete.mutate(['id1', 'id2', 'id3']);
 */
export function useBulkDeleteProducts(
  options?: UseMutationOptions<any, Error, string[]>
) {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string[]>({
    mutationFn: (ids) => productsService.bulkDelete(ids),
    onSuccess: async (data, variables, context) => {
      // Invalidate all product queries
      await invalidateQueries(queryClient, queryKeys.products.all);
    },
    ...options,
  });
}

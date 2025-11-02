/**
 * useProducts Hook
 * React hook for fetching and managing product data
 * 
 * Usage:
 *   const { products, loading, error, refetch } = useProducts({ category: 'electronics' });
 */

import { useState, useEffect, useCallback } from 'react';
import { productsService } from '@/lib/api/services';
import type { Product, ProductFilters } from '@/types';
import type { PaginatedData } from '@/lib/api/responses';

export interface UseProductsResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch list of products with filters
 */
export function useProducts(filters?: ProductFilters): UseProductsResult {
  const [data, setData] = useState<PaginatedData<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await productsService.list(filters);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    hasMore: data?.hasMore || false,
    loading,
    error,
    refetch: fetchProducts,
  };
}

export interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single product by slug
 */
export function useProduct(slug: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productsService.getBySlug(slug);
      setProduct(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product');
      console.error('Failed to fetch product:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}

/**
 * Hook for product search
 */
export function useProductSearch(query: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await productsService.search(searchQuery);
      setProducts(results);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      console.error('Product search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  return { products, loading, error, search };
}

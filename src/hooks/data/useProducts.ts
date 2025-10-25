/**
 * Enhanced Products Hook using new API services
 */

import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '@/lib/api/products';
import type { Product, ProductFilters } from '@/types';
import type { ProductsApiParams, FeaturedProductsParams } from '@/lib/api/products';

export interface UseProductsOptions extends ProductsApiParams {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const {
    enabled = true,
    refetchOnMount = true,
    page = 1,
    limit = 20,
    ...apiParams
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await productsAPI.getProducts({
        ...apiParams,
        page: pageNum,
        limit,
      });

      if (append) {
        setProducts(prev => [...prev, ...response.items]);
      } else {
        setProducts(response.items);
      }

      setTotalCount(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [enabled, apiParams, limit]);

  const refetch = useCallback(() => fetchProducts(currentPage, false), [fetchProducts, currentPage]);

  useEffect(() => {
    if (refetchOnMount) {
      fetchProducts(page);
    }
  }, [fetchProducts, page, refetchOnMount]);

  return {
    products,
    loading,
    error,
    totalCount,
    currentPage,
    refetch,
  };
}

export function useProduct(productId?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const productData = await productsAPI.getProduct(id);
      setProduct(productData);
    } catch (err) {
      console.error(`Failed to fetch product ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    } else {
      setProduct(null);
      setLoading(false);
    }
  }, [productId, fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch,
  };
}

export function useProductBySlug(slug?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductBySlug = useCallback(async (productSlug: string) => {
    setLoading(true);
    setError(null);

    try {
      const productData = await productsAPI.getProduct(productSlug);
      setProduct(productData);
    } catch (err) {
      console.error(`Failed to fetch product with slug ${productSlug}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (slug) {
      fetchProductBySlug(slug);
    }
  }, [slug, fetchProductBySlug]);

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug);
    } else {
      setProduct(null);
      setLoading(false);
    }
  }, [slug, fetchProductBySlug]);

  return {
    product,
    loading,
    error,
    refetch,
  };
}

export function useFeaturedProducts(params: FeaturedProductsParams = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const productData = await productsAPI.getFeaturedProducts(params);
      setProducts(productData);
    } catch (err) {
      console.error('Failed to fetch featured products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchFeaturedProducts,
  };
}

export function useProductsByCategory(category?: string, limit?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsByCategory = useCallback(async (cat: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsAPI.getProducts({
        category: cat,
        limit,
      });
      setProducts(response.items);
    } catch (err) {
      console.error(`Failed to fetch products for category ${cat}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products by category');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refetch = useCallback(() => {
    if (category) {
      fetchProductsByCategory(category);
    }
  }, [category, fetchProductsByCategory]);

  useEffect(() => {
    if (category) {
      fetchProductsByCategory(category);
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [category, fetchProductsByCategory]);

  return {
    products,
    loading,
    error,
    refetch,
  };
}

export function useProductSearch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const searchProducts = useCallback(async (query: string, filters: ProductFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsAPI.searchProducts(query, filters);
      setProducts(response);
      setTotalCount(response.length);
      setCurrentPage(1);
    } catch (err) {
      console.error(`Failed to search products with query "${query}":`, err);
      setError(err instanceof Error ? err.message : 'Failed to search products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setProducts([]);
    setTotalCount(0);
    setCurrentPage(1);
    setError(null);
  }, []);

  return {
    products,
    loading,
    error,
    totalCount,
    currentPage,
    searchProducts,
    clearSearch,
  };
}

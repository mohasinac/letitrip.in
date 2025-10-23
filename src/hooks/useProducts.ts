/**
 * Products Hook - Using Real API
 * Replaces mock data with actual API calls
 */

import { useState, useEffect } from 'react';
import { productsService, ProductFilters } from '@/lib/api/services/products';
import { Product } from '@/types';

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsService.getProducts(filters);
      setProducts(response.products);
      setTotalCount(response.total);
      setCurrentPage(response.page);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    filters?.category,
    filters?.featured,
    filters?.search,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.page,
    filters?.limit,
    filters?.sortBy,
    filters?.sortOrder
  ]);

  return {
    products,
    loading,
    error,
    totalCount,
    currentPage,
    refetch: fetchProducts,
  };
}

export function useProduct(productId?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await productsService.getProductById(id);
      setProduct(productData);
    } catch (err) {
      console.error(`Failed to fetch product ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    } else {
      setProduct(null);
      setLoading(false);
    }
  }, [productId]);

  return {
    product,
    loading,
    error,
    refetch: productId ? () => fetchProduct(productId) : () => {},
  };
}

export function useProductBySlug(slug?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductBySlug = async (productSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await productsService.getProductBySlug(productSlug);
      setProduct(productData);
    } catch (err) {
      console.error(`Failed to fetch product with slug ${productSlug}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug);
    } else {
      setProduct(null);
      setLoading(false);
    }
  }, [slug]);

  return {
    product,
    loading,
    error,
    refetch: slug ? () => fetchProductBySlug(slug) : () => {},
  };
}

export function useFeaturedProducts(limit?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await productsService.getFeaturedProducts(limit);
      setProducts(productData);
    } catch (err) {
      console.error('Failed to fetch featured products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, [limit]);

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

  const fetchProductsByCategory = async (cat: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await productsService.getProductsByCategory(cat, limit);
      setProducts(productData);
    } catch (err) {
      console.error(`Failed to fetch products for category ${cat}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products by category');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchProductsByCategory(category);
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [category, limit]);

  return {
    products,
    loading,
    error,
    refetch: category ? () => fetchProductsByCategory(category) : () => {},
  };
}

export function useProductSearch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const searchProducts = async (query: string, filters?: Omit<ProductFilters, 'search'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsService.searchProducts(query, filters);
      setProducts(response.products);
      setTotalCount(response.total);
      setCurrentPage(response.page);
    } catch (err) {
      console.error(`Failed to search products with query "${query}":`, err);
      setError(err instanceof Error ? err.message : 'Failed to search products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setProducts([]);
    setTotalCount(0);
    setCurrentPage(1);
    setError(null);
  };

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

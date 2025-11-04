/**
 * API-based Products Hook
 * Replaces useFirebase.ts products functionality with API service calls
 */

import { useState, useEffect } from "react";
import { ProductService, Product, ProductFilters } from "@/lib/api";

interface UseProductsOptions extends ProductFilters {
  enabled?: boolean;
}

export function useApiProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { enabled = true, ...filters } = options;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await ProductService.getProducts(filters);
        setProducts(response.products || []);
      } catch (err: any) {
        console.error("API products error:", err);
        setError(err.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    enabled,
    filters.category,
    filters.featured,
    filters.limit,
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    filters.sellerId,
    filters.sortBy,
    filters.order,
    filters.page,
  ]);

  return { products, loading, error };
}

export function useApiProduct(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setProduct(null);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await ProductService.getProduct(productId);
        setProduct(data);
      } catch (err: any) {
        console.error("API product error:", err);
        setError(err.message || "Failed to load product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}

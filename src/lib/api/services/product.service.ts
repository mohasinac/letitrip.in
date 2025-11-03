/**
 * Product Service
 * Handles all product-related API operations
 */

import { apiClient } from "../client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
  images: string[];
  category: string;
  categoryId: string;
  sellerId: string;
  sellerName?: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sellerId?: string;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProductService {
  /**
   * Get all products with filters
   */
  static async getProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await apiClient.get<ProductListResponse>(
        `/api/products?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("ProductService.getProducts error:", error);
      throw error;
    }
  }

  /**
   * Get single product by ID or slug
   */
  static async getProduct(idOrSlug: string): Promise<Product> {
    try {
      const response = await apiClient.get<Product>(`/api/products/${idOrSlug}`);
      return response;
    } catch (error) {
      console.error("ProductService.getProduct error:", error);
      throw error;
    }
  }

  /**
   * Search products
   */
  static async searchProducts(query: string, filters?: ProductFilters): Promise<ProductListResponse> {
    try {
      const params = new URLSearchParams({ search: query });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'search') {
            params.append(key, String(value));
          }
        });
      }

      const response = await apiClient.get<ProductListResponse>(
        `/api/search?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("ProductService.searchProducts error:", error);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>(
        `/api/products?featured=true&limit=${limit}`
      );
      
      return response;
    } catch (error) {
      console.error("ProductService.getFeaturedProducts error:", error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(
    categoryId: string, 
    filters?: Omit<ProductFilters, 'category'>
  ): Promise<ProductListResponse> {
    try {
      return await this.getProducts({ ...filters, category: categoryId });
    } catch (error) {
      console.error("ProductService.getProductsByCategory error:", error);
      throw error;
    }
  }

  /**
   * Get related products
   */
  static async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>(
        `/api/products/${productId}/related?limit=${limit}`
      );
      
      return response;
    } catch (error) {
      console.error("ProductService.getRelatedProducts error:", error);
      throw error;
    }
  }
}

export default ProductService;

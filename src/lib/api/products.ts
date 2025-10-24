/**
 * Products API Service
 */

import apiClient from './client';
import type { Product, ProductFilters, PaginatedResponse } from '@/types';

export interface ProductsApiParams {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  search?: string;
  sortBy?: 'price' | 'name' | 'created' | 'views' | 'rating';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface FeaturedProductsParams {
  type?: 'most-visited' | 'wishlisted' | 'newest' | 'sale' | 'popularity';
  limit?: number;
}

class ProductsAPI {
  /**
   * Get all products with filtering and pagination
   */
  async getProducts(params: ProductsApiParams = {}): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', params);
    return response || { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(params: FeaturedProductsParams = {}): Promise<Product[]> {
    const response = await apiClient.get<{ products: Product[] }>('/products/featured', params);
    return response?.products || [];
  }

  /**
   * Get product by ID or slug
   */
  async getProduct(identifier: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(`/products/${identifier}`);
      return response || null;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: string, filters: ProductFilters = {}): Promise<Product[]> {
    const params = {
      search: query,
      ...filters,
    };
    const response = await apiClient.get<{ products: Product[] }>('/search', params);
    return response?.products || [];
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId: string, page = 1, limit = 10) {
    const response = await apiClient.get<{ items: any[]; total: number }>(`/products/${productId}/reviews`, {
      page,
      limit,
    });
    return response || { items: [], total: 0 };
  }

  /**
   * Add product review
   */
  async addProductReview(productId: string, review: {
    rating: number;
    comment: string;
    title?: string;
  }) {
    return await apiClient.post(`/products/${productId}/reviews`, review);
  }

  // Admin/Seller methods
  /**
   * Create new product (admin/seller)
   */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await apiClient.post<Product>('/admin/products', productData);
    return response;
  }

  /**
   * Update product (admin/seller)
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const response = await apiClient.put<Product>(`/admin/products/${productId}`, updates);
    return response;
  }

  /**
   * Delete product (admin/seller)
   */
  async deleteProduct(productId: string): Promise<void> {
    await apiClient.delete(`/admin/products/${productId}`);
  }

  /**
   * Toggle product featured status (admin)
   */
  async toggleFeatured(productId: string): Promise<Product> {
    const response = await apiClient.patch<Product>(`/admin/products/${productId}/featured`);
    return response;
  }

  /**
   * Update product inventory (seller)
   */
  async updateInventory(productId: string, inventory: {
    quantity: number;
    inStock: boolean;
    lowStockThreshold?: number;
  }): Promise<Product> {
    const response = await apiClient.patch<Product>(`/seller/products/${productId}/inventory`, inventory);
    return response;
  }
}

export const productsAPI = new ProductsAPI();

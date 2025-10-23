/**
 * Products API Service
 * Handles all product-related API calls
 */

import apiClient from '@/lib/api/client';
import { Product } from '@/types';

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

class ProductsService {
  private readonly baseUrl = '/products';

  /**
   * Get all products with optional filters
   */
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.set('category', filters.category);
      if (filters?.featured !== undefined) params.set('featured', filters.featured.toString());
      if (filters?.search) params.set('search', filters.search);
      if (filters?.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
      if (filters?.page !== undefined) params.set('page', filters.page.toString());
      if (filters?.limit !== undefined) params.set('limit', filters.limit.toString());
      if (filters?.sortBy) params.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

      const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
      return await apiClient.get<ProductsResponse>(url);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    try {
      return await apiClient.get<Product>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string): Promise<Product> {
    try {
      return await apiClient.get<Product>(`${this.baseUrl}/slug/${slug}`);
    } catch (error) {
      console.error(`Failed to fetch product with slug ${slug}:`, error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    try {
      const response = await this.getProducts({ 
        featured: true, 
        limit: limit || 8,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      return response.products;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      throw new Error('Failed to fetch featured products');
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, limit?: number): Promise<Product[]> {
    try {
      const response = await this.getProducts({ 
        category, 
        limit: limit || 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      return response.products;
    } catch (error) {
      console.error(`Failed to fetch products for category ${category}:`, error);
      throw new Error('Failed to fetch products by category');
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: string, filters?: Omit<ProductFilters, 'search'>): Promise<ProductsResponse> {
    try {
      return await this.getProducts({ 
        ...filters, 
        search: query,
        sortBy: 'rating',
        sortOrder: 'desc'
      });
    } catch (error) {
      console.error(`Failed to search products with query "${query}":`, error);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Create a new product (Admin/Seller only)
   */
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      return await apiClient.post<Product>(this.baseUrl, productData);
    } catch (error) {
      console.error('Failed to create product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Update a product (Admin/Seller only)
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      return await apiClient.put<Product>(`${this.baseUrl}/${id}`, productData);
    } catch (error) {
      console.error(`Failed to update product ${id}:`, error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Delete a product (Admin only)
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error);
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId: string): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(`${this.baseUrl}/${productId}/reviews`);
    } catch (error) {
      console.error(`Failed to fetch reviews for product ${productId}:`, error);
      throw new Error('Failed to fetch product reviews');
    }
  }

  /**
   * Add product review
   */
  async addProductReview(productId: string, reviewData: any): Promise<any> {
    try {
      return await apiClient.post<any>(`${this.baseUrl}/${productId}/reviews`, reviewData);
    } catch (error) {
      console.error(`Failed to add review for product ${productId}:`, error);
      throw new Error('Failed to add product review');
    }
  }
}

export const productsService = new ProductsService();

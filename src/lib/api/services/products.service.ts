/**
 * Products Service
 * Frontend service for product-related API calls
 * 
 * Usage:
 *   import { productsService } from '@/lib/api/services';
 *   const products = await productsService.list({ category: 'electronics' });
 */

import { apiClient } from '../client';
import { API_ENDPOINTS, buildQueryString } from '../constants/endpoints';
import type {
  Product,
  ProductFilters,
  PaginatedResponse,
} from '@/types';
import type { PaginatedData } from '../responses';

export interface ProductStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  outOfStock: number;
  lowStock: number;
  inStock: number;
  totalValue: number;
}

export class ProductsService {
  /**
   * Get list of products with filters and pagination
   * @param filters - Filter parameters
   * @returns Paginated list of products
   */
  async list(filters?: ProductFilters): Promise<PaginatedData<Product>> {
    const params: Record<string, any> = {};
    
    if (filters?.search) params.search = filters.search;
    if (filters?.category) params.category = filters.category;
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.sort) params.sort = filters.sort;
    if (filters?.page) params.page = filters.page;
    if (filters?.pageSize) params.limit = filters.pageSize;
    if (filters?.sellerId) params.sellerId = filters.sellerId;
    if (filters?.status) params.status = filters.status;
    if (filters?.tags && filters.tags.length > 0) params.tags = filters.tags.join(',');
    
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.PRODUCTS.LIST}${queryString}`;
    
    return apiClient.get<PaginatedData<Product>>(url);
  }

  /**
   * Get single product by slug
   * @param slug - Product slug
   * @returns Product details
   */
  async getBySlug(slug: string): Promise<Product> {
    return apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.GET(slug));
  }

  /**
   * Search products
   * @param query - Search query
   * @returns Matching products
   */
  async search(query: string): Promise<Product[]> {
    const params = { search: query };
    const queryString = buildQueryString(params);
    const result = await apiClient.get<PaginatedData<Product>>(
      `${API_ENDPOINTS.PRODUCTS.SEARCH}${queryString}`
    );
    return result.items;
  }

  /**
   * Create new product (admin/seller only)
   * @param data - Product data
   * @returns Created product
   */
  async create(data: Partial<Product>): Promise<Product> {
    return apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, data);
  }

  /**
   * Update existing product (admin/seller only)
   * @param id - Product ID
   * @param data - Updated product data
   * @returns Updated product
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    return apiClient.patch<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
  }

  /**
   * Delete product (admin/seller only)
   * @param id - Product ID
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }

  /**
   * Get product statistics (admin only)
   * @returns Product statistics
   */
  async getStats(): Promise<ProductStats> {
    return apiClient.get<ProductStats>(API_ENDPOINTS.PRODUCTS.STATS);
  }

  /**
   * Bulk delete products (admin only)
   * @param ids - Array of product IDs
   */
  async bulkDelete(ids: string[]): Promise<void> {
    return apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, { action: 'bulk-delete', ids });
  }

  /**
   * Bulk update product status (admin only)
   * @param ids - Array of product IDs
   * @param status - New status
   */
  async bulkUpdateStatus(
    ids: string[],
    status: 'active' | 'draft' | 'archived'
  ): Promise<void> {
    return apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, {
      action: 'bulk-update-status',
      ids,
      status,
    });
  }
}

// Export singleton instance
export const productsService = new ProductsService();

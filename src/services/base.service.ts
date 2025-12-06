/**
 * @fileoverview Base CRUD Service Class
 * @module src/services/base.service
 * @description Abstract base class for all entity services providing common CRUD operations.
 * Eliminates duplication across 23 service files.
 *
 * @created 2025-12-06
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { logServiceError } from "@/lib/error-logger";
import type { BulkActionResponse } from "@/types/shared/common.types";
import type { PaginatedResponse } from "@/types/shared/pagination.types";
import { apiService } from "./api.service";

/**
 * Generic filter type for list queries
 * @interface
 */
export interface BaseFilters {
  /** Search query */
  search?: string;
  /** Status filter */
  status?: string;
  /** Page number */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort order */
  sortOrder?: "asc" | "desc";
}

/**
 * Abstract Base Service Class
 *
 * Provides common CRUD operations for all entity services.
 * Handles type transformations between Backend (BE) and Frontend (FE) types.
 *
 * @template TBE - Backend type (database schema)
 * @template TFE - Frontend type (UI-optimized)
 * @template TForm - Form type (user input)
 * @template TFilters - Filters type (query parameters)
 *
 * @example
 * // Implementing a service
 * class ProductsService extends BaseService<ProductBE, ProductFE, ProductFormFE, ProductFiltersFE> {
 *   protected endpoint = '/api/products';
 *   protected entityName = 'Product';
 *
 *   protected toBE(form: ProductFormFE): Partial<ProductBE> {
 *     return toBEProductCreate(form);
 *   }
 *
 *   protected toFE(be: ProductBE): ProductFE {
 *     return toFEProduct(be);
 *   }
 * }
 *
 * @abstract
 */
export abstract class BaseService<
  TBE = any,
  TFE = any,
  TForm = any,
  TFilters extends BaseFilters = BaseFilters
> {
  /**
   * API endpoint for this entity (e.g., '/api/products')
   * @abstract
   */
  protected abstract endpoint: string;

  /**
   * Human-readable entity name for error messages (e.g., 'Product')
   * @abstract
   */
  protected abstract entityName: string;

  /**
   * Transform frontend form data to backend format
   * @abstract
   * @param {TForm} form - Form data from UI
   * @returns {Partial<TBE>} Backend-formatted data
   */
  protected abstract toBE(form: TForm): Partial<TBE>;

  /**
   * Transform backend data to frontend format
   * @abstract
   * @param {TBE} be - Backend data from API
   * @returns {TFE} Frontend-formatted data
   */
  protected abstract toFE(be: TBE): TFE;

  /**
   * Transform backend array to frontend array
   *
   * @param {TBE[]} beArray - Backend data array
   * @returns {TFE[]} Frontend data array
   */
  protected toFEArray(beArray: TBE[]): TFE[] {
    return beArray.map((item) => this.toFE(item));
  }

  /**
   * Handle service errors and convert to user-friendly messages
   *
   * @param {any} error - Error object
   * @param {string} context - Context where error occurred
   * @throws {Error} Rethrows error after logging
   */
  protected handleError(error: any, context: string): never {
    logServiceError(this.constructor.name, context, error);
    throw error;
  }

  /**
   * Build query string from filters
   *
   * @param {TFilters} [filters] - Filter parameters
   * @returns {string} Query string
   */
  protected buildQueryString(filters?: TFilters): string {
    if (!filters) return "";

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const query = params.toString();
    return query ? `?${query}` : "";
  }

  /**
   * List entities with optional filters
   *
   * @param {TFilters} [filters] - Query filters
   * @returns {Promise<PaginatedResponse<TFE>>} Paginated results
   *
   * @example
   * const { data, total, page } = await service.list({ status: 'active', page: 1 });
   */
  async list(filters?: TFilters): Promise<PaginatedResponse<TFE>> {
    try {
      const query = this.buildQueryString(filters);
      const response = await apiService.get<PaginatedResponse<TBE>>(
        `${this.endpoint}${query}`
      );

      return {
        data: this.toFEArray(response.data),
        total: response.total,
        page: response.page,
        limit: response.limit,
        hasMore: response.hasMore,
      };
    } catch (error) {
      return this.handleError(error, "list");
    }
  }

  /**
   * Get entity by ID
   *
   * @param {string} id - Entity ID
   * @returns {Promise<TFE>} Entity data
   *
   * @example
   * const product = await productsService.getById('prod_123');
   */
  async getById(id: string): Promise<TFE> {
    try {
      const response = await apiService.get<TBE>(`${this.endpoint}/${id}`);
      return this.toFE(response);
    } catch (error) {
      return this.handleError(error, `getById:${id}`);
    }
  }

  /**
   * Get entity by slug
   *
   * @param {string} slug - Entity slug
   * @returns {Promise<TFE>} Entity data
   *
   * @example
   * const product = await productsService.getBySlug('red-shoes');
   */
  async getBySlug(slug: string): Promise<TFE> {
    try {
      const response = await apiService.get<TBE>(`${this.endpoint}/${slug}`);
      return this.toFE(response);
    } catch (error) {
      return this.handleError(error, `getBySlug:${slug}`);
    }
  }

  /**
   * Create new entity
   *
   * @param {TForm} data - Form data
   * @returns {Promise<TFE>} Created entity
   *
   * @example
   * const newProduct = await productsService.create(productFormData);
   */
  async create(data: TForm): Promise<TFE> {
    try {
      const beData = this.toBE(data);
      const response = await apiService.post<TBE>(this.endpoint, beData);
      return this.toFE(response);
    } catch (error) {
      return this.handleError(error, "create");
    }
  }

  /**
   * Update existing entity
   *
   * @param {string} id - Entity ID
   * @param {Partial<TForm>} data - Updated data
   * @returns {Promise<TFE>} Updated entity
   *
   * @example
   * const updated = await productsService.update('prod_123', { name: 'New Name' });
   */
  async update(id: string, data: Partial<TForm>): Promise<TFE> {
    try {
      const beData = this.toBE(data as TForm);
      const response = await apiService.put<TBE>(
        `${this.endpoint}/${id}`,
        beData
      );
      return this.toFE(response);
    } catch (error) {
      return this.handleError(error, `update:${id}`);
    }
  }

  /**
   * Partially update entity (PATCH)
   *
   * @param {string} id - Entity ID
   * @param {Partial<TForm>} data - Fields to update
   * @returns {Promise<TFE>} Updated entity
   */
  async patch(id: string, data: Partial<TForm>): Promise<TFE> {
    try {
      const beData = this.toBE(data as TForm);
      const response = await apiService.patch<TBE>(
        `${this.endpoint}/${id}`,
        beData
      );
      return this.toFE(response);
    } catch (error) {
      return this.handleError(error, `patch:${id}`);
    }
  }

  /**
   * Delete entity
   *
   * @param {string} id - Entity ID
   * @returns {Promise<void>}
   *
   * @example
   * await productsService.delete('prod_123');
   */
  async delete(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      return this.handleError(error, `delete:${id}`);
    }
  }

  /**
   * Bulk delete entities
   *
   * @param {string[]} ids - Array of entity IDs
   * @returns {Promise<BulkActionResponse>} Results of bulk operation
   *
   * @example
   * const result = await productsService.bulkDelete(['id1', 'id2', 'id3']);
   * console.log(`Deleted ${result.successCount} items`);
   */
  async bulkDelete(ids: string[]): Promise<BulkActionResponse> {
    try {
      const response = await apiService.post<BulkActionResponse>(
        `${this.endpoint}/bulk/delete`,
        { ids }
      );
      return response;
    } catch (error) {
      return this.handleError(error, "bulkDelete");
    }
  }

  /**
   * Bulk update entities
   *
   * @param {string[]} ids - Array of entity IDs
   * @param {Partial<TForm>} data - Data to update
   * @returns {Promise<BulkActionResponse>} Results of bulk operation
   *
   * @example
   * const result = await productsService.bulkUpdate(['id1', 'id2'], { status: 'active' });
   */
  async bulkUpdate(
    ids: string[],
    data: Partial<TForm>
  ): Promise<BulkActionResponse> {
    try {
      const beData = this.toBE(data as TForm);
      const response = await apiService.post<BulkActionResponse>(
        `${this.endpoint}/bulk/update`,
        { ids, data: beData }
      );
      return response;
    } catch (error) {
      return this.handleError(error, "bulkUpdate");
    }
  }

  /**
   * Check if entity exists
   *
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>} Whether entity exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      await this.getById(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Count entities with optional filters
   *
   * @param {TFilters} [filters] - Query filters
   * @returns {Promise<number>} Total count
   */
  async count(filters?: TFilters): Promise<number> {
    try {
      const query = this.buildQueryString(filters);
      const response = await apiService.get<{ count: number }>(
        `${this.endpoint}/count${query}`
      );
      return response.count;
    } catch (error) {
      return this.handleError(error, "count");
    }
  }
}

/**
 * Example implementation of BaseService
 *
 * @example
 * ```typescript
 * import { BaseService } from './base.service';
 * import { ProductBE } from '@/types/backend/product.types';
 * import { ProductFE, ProductFormFE, ProductFiltersFE } from '@/types/frontend/product.types';
 * import { toBEProductCreate, toFEProduct } from '@/types/transforms/product.transforms';
 *
 * class ProductsService extends BaseService<
 *   ProductBE,
 *   ProductFE,
 *   ProductFormFE,
 *   ProductFiltersFE
 * > {
 *   protected endpoint = '/api/products';
 *   protected entityName = 'Product';
 *
 *   protected toBE(form: ProductFormFE): Partial<ProductBE> {
 *     return toBEProductCreate(form);
 *   }
 *
 *   protected toFE(be: ProductBE): ProductFE {
 *     return toFEProduct(be);
 *   }
 *
 *   // Add custom methods specific to products
 *   async getFeatured(): Promise<ProductFE[]> {
 *     const response = await apiService.get<ProductBE[]>(`${this.endpoint}/featured`);
 *     return this.toFEArray(response);
 *   }
 * }
 *
 * export const productsService = new ProductsService();
 * ```
 */

export default BaseService;

import { logServiceError } from "@/lib/error-logger";
import {
  AppError,
  ErrorCode,
  NetworkError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import type { PaginatedResponse } from "@/types/shared/pagination.types";
import { apiService, type RequestOptions } from "./api.service";

/**
 * Base options for service operations
 */
export interface ServiceOptions extends Omit<RequestOptions, "method"> {
  /** Whether to throw errors or return them */
  throwOnError?: boolean;
}

/**
 * Base Service Class
 * Provides generic CRUD operations with type safety and error handling
 *
 * @template TFE - Frontend entity type
 * @template TBE - Backend entity type
 * @template TCreate - Create DTO type
 * @template TUpdate - Update DTO type
 *
 * @example
 * ```typescript
 * class ProductService extends BaseService<
 *   ProductFE,
 *   ProductBE,
 *   ProductCreateDTO,
 *   ProductUpdateDTO
 * > {
 *   constructor() {
 *     super({
 *       resourceName: 'product',
 *       baseRoute: '/api/products',
 *       toFE: toFEProduct,
 *       toBECreate: toBEProductCreate,
 *       toBEUpdate: toBEProductUpdate,
 *     });
 *   }
 * }
 * ```
 */
export abstract class BaseService<
  TFE,
  TBE,
  TCreate = Partial<TBE>,
  TUpdate = Partial<TBE>
> {
  protected readonly resourceName: string;
  protected readonly baseRoute: string;
  protected readonly toFE: (be: TBE) => TFE;
  protected readonly toBECreate?: (fe: TCreate) => Partial<TBE>;
  protected readonly toBEUpdate?: (fe: TUpdate) => Partial<TBE>;

  constructor(config: {
    resourceName: string;
    baseRoute: string;
    toFE: (be: TBE) => TFE;
    toBECreate?: (fe: TCreate) => Partial<TBE>;
    toBEUpdate?: (fe: TUpdate) => Partial<TBE>;
  }) {
    this.resourceName = config.resourceName;
    this.baseRoute = config.baseRoute;
    this.toFE = config.toFE;
    this.toBECreate = config.toBECreate;
    this.toBEUpdate = config.toBEUpdate;
  }

  /**
   * Get a single entity by ID
   */
  async getById(id: string, options?: ServiceOptions): Promise<TFE> {
    try {
      const response = await apiService.get<{ data: TBE }>(
        `${this.baseRoute}/${id}`,
        options
      );

      if (!response.data) {
        throw new NotFoundError(
          `${this.resourceName} not found`,
          ErrorCode.RESOURCE_NOT_FOUND,
          { id }
        );
      }

      return this.toFE(response.data);
    } catch (error) {
      logServiceError(error, `${this.resourceName}.getById`, { id });
      throw this.handleError(error, "get");
    }
  }

  /**
   * Get all entities with pagination
   */
  async getAll(
    params?: Record<string, any>,
    options?: ServiceOptions
  ): Promise<PaginatedResponse<TFE>> {
    try {
      const response = await apiService.get<PaginatedResponse<TBE>>(
        this.baseRoute,
        { ...options, params }
      );

      return {
        data: response.data.map((item) => this.toFE(item)),
        meta: response.meta,
      };
    } catch (error) {
      logServiceError(error, `${this.resourceName}.getAll`, { params });
      throw this.handleError(error, "list");
    }
  }

  /**
   * Create a new entity
   */
  async create(data: TCreate, options?: ServiceOptions): Promise<TFE> {
    try {
      if (!this.toBECreate) {
        throw new AppError(
          `Create operation not supported for ${this.resourceName}`,
          ErrorCode.NOT_IMPLEMENTED
        );
      }

      const beData = this.toBECreate(data);
      const response = await apiService.post<{ data: TBE }>(
        this.baseRoute,
        beData,
        options
      );

      if (!response.data) {
        throw new AppError(
          `Failed to create ${this.resourceName}`,
          ErrorCode.INTERNAL_ERROR
        );
      }

      return this.toFE(response.data);
    } catch (error) {
      logServiceError(error, `${this.resourceName}.create`, { data });
      throw this.handleError(error, "create");
    }
  }

  /**
   * Update an existing entity
   */
  async update(
    id: string,
    data: TUpdate,
    options?: ServiceOptions
  ): Promise<TFE> {
    try {
      if (!this.toBEUpdate) {
        throw new AppError(
          `Update operation not supported for ${this.resourceName}`,
          ErrorCode.NOT_IMPLEMENTED
        );
      }

      const beData = this.toBEUpdate(data);
      const response = await apiService.put<{ data: TBE }>(
        `${this.baseRoute}/${id}`,
        beData,
        options
      );

      if (!response.data) {
        throw new NotFoundError(
          `${this.resourceName} not found`,
          ErrorCode.RESOURCE_NOT_FOUND,
          { id }
        );
      }

      return this.toFE(response.data);
    } catch (error) {
      logServiceError(error, `${this.resourceName}.update`, { id, data });
      throw this.handleError(error, "update");
    }
  }

  /**
   * Partially update an existing entity
   */
  async patch(
    id: string,
    data: Partial<TUpdate>,
    options?: ServiceOptions
  ): Promise<TFE> {
    try {
      if (!this.toBEUpdate) {
        throw new AppError(
          `Update operation not supported for ${this.resourceName}`,
          ErrorCode.NOT_IMPLEMENTED
        );
      }

      const beData = this.toBEUpdate(data as TUpdate);
      const response = await apiService.patch<{ data: TBE }>(
        `${this.baseRoute}/${id}`,
        beData,
        options
      );

      if (!response.data) {
        throw new NotFoundError(
          `${this.resourceName} not found`,
          ErrorCode.RESOURCE_NOT_FOUND,
          { id }
        );
      }

      return this.toFE(response.data);
    } catch (error) {
      logServiceError(error, `${this.resourceName}.patch`, { id, data });
      throw this.handleError(error, "update");
    }
  }

  /**
   * Delete an entity by ID
   */
  async delete(id: string, options?: ServiceOptions): Promise<void> {
    try {
      await apiService.delete(`${this.baseRoute}/${id}`, options);
    } catch (error) {
      logServiceError(error, `${this.resourceName}.delete`, { id });
      throw this.handleError(error, "delete");
    }
  }

  /**
   * Bulk delete multiple entities
   */
  async bulkDelete(
    ids: string[],
    options?: ServiceOptions
  ): Promise<{ success: number; failed: number; errors?: string[] }> {
    try {
      const response = await apiService.delete<{
        success: number;
        failed: number;
        errors?: string[];
      }>(`${this.baseRoute}/bulk`, {
        ...options,
        data: { ids },
      });

      return response;
    } catch (error) {
      logServiceError(error, `${this.resourceName}.bulkDelete`, { ids });
      throw this.handleError(error, "delete");
    }
  }

  /**
   * Check if an entity exists by ID
   */
  async exists(id: string, options?: ServiceOptions): Promise<boolean> {
    try {
      await this.getById(id, options);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Count entities matching criteria
   */
  async count(
    params?: Record<string, any>,
    options?: ServiceOptions
  ): Promise<number> {
    try {
      const response = await apiService.get<{ count: number }>(
        `${this.baseRoute}/count`,
        { ...options, params }
      );

      return response.count;
    } catch (error) {
      logServiceError(error, `${this.resourceName}.count`, { params });
      throw this.handleError(error, "count");
    }
  }

  /**
   * Handle errors and convert to appropriate error types
   */
  protected handleError(error: unknown, operation: string): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Network errors
    if (
      error instanceof TypeError ||
      (error as any)?.message?.includes("fetch")
    ) {
      return new NetworkError(`Network error during ${operation} operation`, {
        originalError: error,
      });
    }

    // Validation errors
    if ((error as any)?.code === ErrorCode.VALIDATION_ERROR) {
      return new ValidationError(
        (error as any)?.message ||
          `Validation failed for ${operation} operation`,
        { originalError: error }
      );
    }

    // Generic error
    return new AppError(
      `Failed to ${operation} ${this.resourceName}`,
      ErrorCode.INTERNAL_ERROR,
      { originalError: error }
    );
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrl(path: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return path;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  }
}

/**
 * Example usage:
 *
 * ```typescript
 * // Define your service
 * export class ProductService extends BaseService<
 *   ProductFE,
 *   ProductBE,
 *   ProductCreateDTO,
 *   ProductUpdateDTO
 * > {
 *   constructor() {
 *     super({
 *       resourceName: 'product',
 *       baseRoute: '/api/products',
 *       toFE: toFEProduct,
 *       toBECreate: toBEProductCreate,
 *       toBEUpdate: toBEProductUpdate,
 *     });
 *   }
 *
 *   // Add custom methods
 *   async getBySlug(slug: string): Promise<ProductFE> {
 *     const response = await apiService.get<{ data: ProductBE }>(
 *       `${this.baseRoute}/slug/${slug}`
 *     );
 *     return this.toFE(response.data);
 *   }
 * }
 *
 * // Use the service
 * const productService = new ProductService();
 * const product = await productService.getById('123');
 * const products = await productService.getAll({ page: 1, limit: 20 });
 * const newProduct = await productService.create(productData);
 * await productService.update('123', updatedData);
 * await productService.delete('123');
 * ```
 */

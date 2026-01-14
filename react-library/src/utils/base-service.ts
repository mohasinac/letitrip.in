/**
 * Base Service Class
 * Provides generic CRUD operations with type safety and error handling
 * Framework-agnostic base class for building service layers
 */

import {
  AppError,
  ErrorCode,
  NetworkError,
  NotFoundError,
  ValidationError,
} from "./errors";
import { logServiceError } from "./error-logger";

/**
 * HTTP Client interface for pluggable implementations
 */
export interface HttpClient {
  get<T = any>(url: string, options?: RequestOptions): Promise<T>;
  post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  delete<T = any>(url: string, options?: RequestOptions): Promise<T>;
}

/**
 * Request options
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Base options for service operations
 */
export interface ServiceOptions extends Omit<RequestOptions, "method"> {
  /** Whether to throw errors or return them */
  throwOnError?: boolean;
}

/**
 * Base Service Class Configuration
 */
export interface BaseServiceConfig<TFE, TBE, TCreate, TUpdate> {
  /** Resource name for error messages */
  resourceName: string;
  /** Base API route */
  baseRoute: string;
  /** HTTP client for making requests */
  httpClient: HttpClient;
  /** Transform backend entity to frontend */
  toFE: (be: TBE) => TFE;
  /** Transform frontend create DTO to backend */
  toBECreate?: (fe: TCreate) => Partial<TBE>;
  /** Transform frontend update DTO to backend */
  toBEUpdate?: (fe: TUpdate) => Partial<TBE>;
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
 *   constructor(httpClient: HttpClient) {
 *     super({
 *       resourceName: 'product',
 *       baseRoute: '/api/products',
 *       httpClient,
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
  protected readonly httpClient: HttpClient;
  protected readonly toFE: (be: TBE) => TFE;
  protected readonly toBECreate?: (fe: TCreate) => Partial<TBE>;
  protected readonly toBEUpdate?: (fe: TUpdate) => Partial<TBE>;

  constructor(config: BaseServiceConfig<TFE, TBE, TCreate, TUpdate>) {
    this.resourceName = config.resourceName;
    this.baseRoute = config.baseRoute;
    this.httpClient = config.httpClient;
    this.toFE = config.toFE;
    this.toBECreate = config.toBECreate;
    this.toBEUpdate = config.toBEUpdate;
  }

  /**
   * Get a single entity by ID
   */
  async getById(id: string, options?: ServiceOptions): Promise<TFE> {
    try {
      const response = await this.httpClient.get<{ data: TBE }>(
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
      logServiceError(this.resourceName, "getById", error as Error);
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
      const response = await this.httpClient.get<PaginatedResponse<TBE>>(
        this.baseRoute,
        { ...options, params }
      );

      return {
        data: response.data.map((item) => this.toFE(item)),
        meta: response.meta,
      };
    } catch (error) {
      logServiceError(this.resourceName, "getAll", error as Error);
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
      const response = await this.httpClient.post<{ data: TBE }>(
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
      logServiceError(this.resourceName, "create", error as Error);
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
      const response = await this.httpClient.put<{ data: TBE }>(
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
      logServiceError(this.resourceName, "update", error as Error);
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
      const response = await this.httpClient.patch<{ data: TBE }>(
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
      logServiceError(this.resourceName, "patch", error as Error);
      throw this.handleError(error, "update");
    }
  }

  /**
   * Delete an entity by ID
   */
  async delete(id: string, options?: ServiceOptions): Promise<void> {
    try {
      await this.httpClient.delete(`${this.baseRoute}/${id}`, options);
    } catch (error) {
      logServiceError(this.resourceName, "delete", error as Error);
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
      const response = await this.httpClient.delete<{
        success: number;
        failed: number;
        errors?: string[];
      }>(`${this.baseRoute}/bulk`, {
        ...options,
        data: { ids },
      });

      return response;
    } catch (error) {
      logServiceError(this.resourceName, "bulkDelete", error as Error);
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
      const response = await this.httpClient.get<{ count: number }>(
        `${this.baseRoute}/count`,
        { ...options, params }
      );

      return response.count;
    } catch (error) {
      logServiceError(this.resourceName, "count", error as Error);
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
      return new NetworkError(
        `Network error during ${operation} operation`,
        ErrorCode.NETWORK_ERROR,
        { originalError: error }
      );
    }

    // Validation errors
    if ((error as any)?.code === ErrorCode.VALIDATION_ERROR) {
      return new ValidationError(
        (error as any)?.message ||
          `Validation failed for ${operation} operation`,
        (error as any)?.errors,
        { originalError: error }
      );
    }

    // Generic error
    return new AppError(
      `Failed to ${operation} ${this.resourceName}`,
      ErrorCode.INTERNAL_ERROR,
      500,
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
 * Example Fetch-based HTTP Client
 */
export class FetchHttpClient implements HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = "", defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  async get<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", url, undefined, options);
  }

  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>("POST", url, data, options);
  }

  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>("PUT", url, data, options);
  }

  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>("PATCH", url, data, options);
  }

  async delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", url, options?.data, options);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const fullUrl = this.buildFullUrl(url, options?.params);

    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...this.defaultHeaders,
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AppError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        errorData.code || ErrorCode.UNKNOWN_ERROR,
        response.status,
        errorData
      );
    }

    return response.json();
  }

  private buildFullUrl(path: string, params?: Record<string, any>): string {
    const url = this.baseUrl + path;

    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return `${url}?${searchParams.toString()}`;
  }
}

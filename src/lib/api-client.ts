/**
 * API Client
 * 
 * Centralized API client with error handling, authentication, and response parsing.
 * Wraps fetch API with consistent error handling and authentication token management.
 * 
 * @example
 * ```tsx
 * import { apiClient } from '@/lib/api-client';
 * 
 * // GET request
 * const products = await apiClient.get('/api/products');
 * 
 * // POST request
 * const newProduct = await apiClient.post('/api/products', { name: 'Product' });
 * 
 * // With query params
 * const filtered = await apiClient.get('/api/products', { category: 'electronics' });
 * ```
 */

import { buildQueryString } from "@/constants/api-endpoints";

/**
 * API Error class with status code and message
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * API client configuration
 */
interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

/**
 * Request options
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  skipAuth?: boolean;
}

/**
 * Create API client instance
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private credentials: RequestCredentials;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
    this.credentials = config.credentials || "include";
  }

  /**
   * Get authorization token from storage or auth service
   * Override this method to integrate with your auth system
   */
  private async getAuthToken(): Promise<string | null> {
    // TODO: Integrate with Firebase Auth or your auth service
    // Example:
    // const user = auth.currentUser;
    // if (user) {
    //   return await user.getIdToken();
    // }
    return null;
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = `${this.baseUrl}${endpoint}`;
    if (params) {
      return `${url}${buildQueryString(params)}`;
    }
    return url;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, skipAuth, headers: customHeaders, ...fetchOptions } = options;

    // Build URL
    const url = this.buildUrl(endpoint, params);

    // Build headers
    const headers: HeadersInit = {
      ...this.defaultHeaders,
      ...(customHeaders as Record<string, string>),
    };

    // Add authorization header
    if (!skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: this.credentials,
      });

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData;

        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use default error message
        }

        throw new ApiError(response.status, errorMessage, errorData);
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return null as T;
      }

      // Parse JSON response
      const data = await response.json();
      return data as T;
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiError(0, "Network error. Please check your connection.");
      }

      // Handle unknown errors
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      params,
      ...options,
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      ...options,
    });
  }

  /**
   * Upload file(s)
   */
  async upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    const { headers, ...restOptions } = options || {};
    
    // Remove Content-Type header to let browser set it with boundary
    const uploadHeaders = { ...headers };
    delete uploadHeaders["Content-Type"];

    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: uploadHeaders,
      ...restOptions,
    });
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();

/**
 * Create custom API client with different configuration
 */
export const createApiClient = (config: ApiClientConfig) => new ApiClient(config);

/**
 * Helper to handle API errors in components
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred";
}

/**
 * Type guard for API errors
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

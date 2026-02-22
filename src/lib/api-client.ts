/**
 * API Client
 * Centralized API client for making HTTP requests with consistent error handling,
 * authentication, and response parsing.
 *
 * Usage:
 * ```ts
 * import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
 *
 * // GET request
 * const profile = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
 *
 * // POST request
 * const result = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 *
 * // With error handling
 * try {
 *   const data = await apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, body);
 * } catch (error) {
 *   if (error instanceof ApiClientError) {
 *     console.error(error.message, error.status, error.data);
 *   }
 * }
 * ```
 */

import { API_ENDPOINTS } from "@/constants";

export { API_ENDPOINTS };

// ============================================================================
// Types
// ============================================================================

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

// ============================================================================
// API Client Class
// ============================================================================

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "";
    this.defaultTimeout = 30000; // 30 seconds
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const url = new URL(endpoint, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Get default headers including authentication
   */
  private async getHeaders(customHeaders?: HeadersInit): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // Note: NextAuth session is handled server-side via cookies
    // If you need client-side token, uncomment below:
    // const session = await getSession();
    // if (session?.accessToken) {
    //   headers['Authorization'] = `Bearer ${session.accessToken}`;
    // }

    return headers;
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const {
      params,
      timeout = this.defaultTimeout,
      headers: customHeaders,
      ...fetchConfig
    } = config;

    const url = this.buildURL(endpoint, params);
    const headers = await this.getHeaders(customHeaders);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Merge external signal with timeout signal if provided
    const externalSignal = config?.signal;
    const combinedSignal = controller.signal;

    if (externalSignal) {
      // If external signal is already aborted, abort our controller
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        // Listen to external signal and abort our controller if it fires
        externalSignal.addEventListener("abort", () => controller.abort());
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: combinedSignal,
        credentials: "include", // Include cookies for NextAuth
      });

      clearTimeout(timeoutId);

      // Parse response
      const data: ApiResponse<T> = await response.json().catch(() => ({
        success: false,
        error: "Invalid JSON response",
      }));

      // Handle error responses
      if (!response.ok) {
        throw new ApiClientError(
          data.error ||
            data.message ||
            `Request failed with status ${response.status}`,
          response.status,
          data,
        );
      }

      if (!data.success) {
        throw new ApiClientError(
          data.error || data.message || "Request failed",
          response.status,
          data,
        );
      }

      return data.data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort errors (timeout or external cancellation)
      if (error instanceof Error && error.name === "AbortError") {
        // Check if it was external cancellation vs timeout
        if (externalSignal?.aborted) {
          // External cancellation - don't throw, just return
          throw error; // Let caller handle it
        }
        throw new ApiClientError("Request timeout", 408);
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiClientError(
          "Network error. Please check your connection.",
          0,
        );
      }

      // Re-throw ApiClientError
      if (error instanceof ApiClientError) {
        throw error;
      }

      // Unknown error
      throw new ApiClientError(
        error instanceof Error ? error.message : "An unexpected error occurred",
        500,
      );
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }

  /**
   * Upload file(s)
   */
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig,
  ): Promise<T> {
    const { headers, ...restConfig } = config || {};

    // Remove Content-Type header to let browser set it with boundary
    const uploadHeaders = await this.getHeaders(headers);
    delete (uploadHeaders as any)["Content-Type"];

    return this.request<T>(endpoint, {
      ...restConfig,
      method: "POST",
      body: formData,
      headers: uploadHeaders,
    });
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const apiClient = new ApiClient();

// ============================================================================
// Convenience exports
// ============================================================================

export { ApiClient };
export type { RequestConfig, ApiResponse };

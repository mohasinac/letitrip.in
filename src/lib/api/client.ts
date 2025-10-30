/**
 * API Client for frontend
 * Centralized service for making authenticated API requests
 * Handles Firebase tokens, retries, error handling, and auth intercepting
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { ApiResponse } from "@/types";
import { auth } from "@/lib/database/config";
import { getAuthToken, clearAuthToken, setAuthToken } from "./auth-fetch";
import { apiCache, CACHE_KEYS } from "./cache";

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;
  private tokenPromise: Promise<string | null> | null = null;

  constructor(config?: ApiClientConfig) {
    const baseURL =
      config?.baseURL || process.env.NEXT_PUBLIC_API_URL || "/api";
    const timeout = config?.timeout || 30000;
    this.maxRetries = config?.retries || 3;

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Include cookies
    });

    // Request interceptor to add authentication token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await this.getTokenWithRetry();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Error getting authentication token:", error);
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor to handle errors and retries
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const config = error.config as any;

        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
          clearAuthToken();
          console.warn("Unauthorized access - clearing token");

          // Don't redirect during initial auth setup or for /auth/me calls
          // Let the caller handle the 401, particularly for Google signup flow
          const isAuthMeCall = config.url?.includes("/auth/me");
          const isInitialAuthSetup =
            config.url?.includes("/auth/") &&
            (config.url?.includes("/register") ||
              config.url?.includes("/send-otp"));

          if (
            typeof window !== "undefined" &&
            !isAuthMeCall &&
            !isInitialAuthSetup
          ) {
            // Redirect to login if not already on login page
            if (!window.location.pathname.includes("/login")) {
              window.location.href = "/login";
            }
          }
          return Promise.reject(error);
        }

        // Handle 403 - Forbidden
        if (error.response?.status === 403) {
          console.warn("Access forbidden - insufficient permissions");
          return Promise.reject(error);
        }

        // Retry logic for 5xx errors and network errors
        if (!config.__retryCount) {
          config.__retryCount = 0;
        }

        if (
          config.__retryCount < this.maxRetries &&
          (!error.response || error.response.status >= 500)
        ) {
          config.__retryCount++;

          // Exponential backoff
          const delay = this.retryDelay * Math.pow(2, config.__retryCount - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));

          console.debug(
            `Retrying request (${config.__retryCount}/${this.maxRetries}): ${config.method?.toUpperCase()} ${config.url}`,
          );

          return this.client.request(config);
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Generic GET request with caching support
   */
  async get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig & { skipCache?: boolean },
  ): Promise<T> {
    try {
      // Generate cache key based on URL and params
      const cacheKey = `${url}?${JSON.stringify(params || {})}`;

      // Check cache first (unless skipCache is true)
      if (!config?.skipCache && apiCache.has(cacheKey)) {
        console.debug(`Cache HIT for ${url}`);
        return apiCache.get<T>(cacheKey)!;
      }

      console.debug(`Cache MISS for ${url}`);
      const response = await this.client.get<ApiResponse<T>>(url, {
        params,
        ...config,
      });

      const data = response.data.data as T;

      // Cache the response (with appropriate TTL based on endpoint)
      apiCache.set(cacheKey, data);

      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Generic POST request with cache invalidation
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T>>(
        url,
        data,
        config,
      );

      // Invalidate related caches after successful POST
      this.invalidateCacheForUrl(url);

      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Generic PATCH request with cache invalidation
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(
        url,
        data,
        config,
      );

      // Invalidate related caches after successful PATCH
      this.invalidateCacheForUrl(url);

      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Generic DELETE request with cache invalidation
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);

      // Invalidate related caches after successful DELETE
      this.invalidateCacheForUrl(url);

      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Upload files with FormData
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        ...config,
        headers: {
          "Content-Type": "multipart/form-data",
          ...config?.headers,
        },
      });
      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a request without authentication (for public endpoints)
   */
  async publicGet<T = any>(url: string, params?: any): Promise<T> {
    try {
      const response = await axios.get<ApiResponse<T>>(url, {
        params,
        baseURL: this.client.defaults.baseURL,
        timeout: this.client.defaults.timeout,
        withCredentials: true,
      });
      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make POST request without authentication
   */
  async publicPost<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await axios.post<ApiResponse<T>>(url, data, {
        baseURL: this.client.defaults.baseURL,
        timeout: this.client.defaults.timeout,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Invalidate cache entries based on URL pattern
   * Clears caches for related endpoints after mutations
   */
  private invalidateCacheForUrl(url: string): void {
    // For category endpoints, clear all category-related caches
    if (url.includes("/admin/categories") || url.includes("/api/categories")) {
      console.debug("Invalidating category caches after mutation");
      apiCache.invalidatePattern(/categories/);
    }
    // For beyblade endpoints
    else if (url.includes("/beyblades")) {
      console.debug("Invalidating beyblade caches after mutation");
      apiCache.invalidatePattern(/beyblades/);
    }
    // For other endpoints, invalidate based on the specific URL pattern
    else {
      console.debug(`Invalidating cache for ${url}`);
      apiCache.invalidatePattern(new RegExp(url.replace(/\//g, "\\/")));
    }
  }

  /**
   * Handle errors and log them appropriately
   */
  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message;

      console.error(`API Error [${status}]:`, message);

      if (error.response?.data?.errors) {
        console.error("Validation errors:", error.response.data.errors);
      }
    } else if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }

  /**
   * Get the underlying axios instance for advanced use cases
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Get current auth token (for debugging/testing)
   */
  async getCurrentToken(): Promise<string | null> {
    return getAuthToken();
  }

  /**
   * Clear auth token (logout)
   */
  clearAuth(): void {
    clearAuthToken();
  }

  /**
   * Get authentication token with retry logic
   * Waits for Firebase to be ready and user to be authenticated
   */
  private async getTokenWithRetry(
    maxAttempts: number = 5,
  ): Promise<string | null> {
    let lastError: any = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Try to get token from Firebase first
        if (typeof window !== "undefined" && auth && auth.currentUser) {
          try {
            // Get fresh Firebase ID token
            const token = await auth.currentUser.getIdToken(true);
            if (token) {
              setAuthToken(token);
              return token;
            }
          } catch (getTokenError) {
            console.debug(
              `Attempt ${attempt + 1}/${maxAttempts}: Failed to get token from Firebase`,
              getTokenError,
            );
            lastError = getTokenError;
          }
        }

        // Fall back to localStorage token
        const storedToken = await getAuthToken();
        if (storedToken) {
          return storedToken;
        }

        // If not the last attempt, wait before retrying
        if (attempt < maxAttempts - 1) {
          const delay = 100 * (attempt + 1); // 100ms, 200ms, 300ms, etc
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.debug(
          `Attempt ${attempt + 1}/${maxAttempts}: Error getting token`,
          error,
        );
        lastError = error;
      }
    }

    // No token found after retries
    if (lastError) {
      console.debug("Failed to get token after retries:", lastError);
    }
    return null;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;

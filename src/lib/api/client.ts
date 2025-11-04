/**
 * API Client for frontend
 * Centralized service for making authenticated API requests
 * Uses HTTP-only cookies for session-based authentication
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
}

// Simple in-memory cache
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

const apiCache = new ApiCache();

class ApiClient {
  private client: AxiosInstance;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(config?: ApiClientConfig) {
    const baseURL = config?.baseURL || "";
    const timeout = config?.timeout || 30000;
    this.maxRetries = config?.retries || 3;

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Important: Send cookies with requests
    });

    // Request interceptor - no token handling needed
    this.client.interceptors.request.use(
      async (config) => {
        // Cookies are automatically sent with withCredentials: true
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor to handle errors and retries
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const config = error.config as any;

        // Handle 401 - Unauthorized (session expired)
        if (error.response?.status === 401) {
          const isAuthCheckEndpoint = config.url?.includes("/api/auth/me");
          
          // Only log and redirect if NOT an auth check endpoint
          if (!isAuthCheckEndpoint) {
            console.warn("Unauthorized access - session expired");
            
            // Only redirect to login if NOT already on auth pages and NOT an auth API call
            if (typeof window !== "undefined") {
              const currentPath = window.location.pathname;
              const isAuthPage = ["/login", "/register", "/reset-password"].some(page => 
                currentPath.startsWith(page)
              );
              const isAuthApiCall = config.url?.includes("/api/auth/");
              
              // Don't redirect if we're already on an auth page or calling auth APIs
              if (!isAuthPage && !isAuthApiCall) {
                // Save current page for redirect after login
                sessionStorage.setItem("auth_redirect_after_login", currentPath);
                window.location.href = "/login?error=session-expired";
              }
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
      const cacheKey = `${url}?${JSON.stringify(params || {})}`;

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
      apiCache.set(cacheKey, data);

      return data;
    } catch (error) {
      // Don't log expected 401 errors for auth check endpoints
      if (axios.isAxiosError(error)) {
        const isAuthCheckEndpoint = error.config?.url?.includes("/api/auth/me");
        const is401 = error.response?.status === 401;
        
        if (!(isAuthCheckEndpoint && is401)) {
          this.handleError(error);
        }
      } else {
        this.handleError(error);
      }
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
      this.invalidateCacheForUrl(url);
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
   * Invalidate cache entries based on URL pattern
   */
  private invalidateCacheForUrl(url: string): void {
    const basePath = url.split("?")[0].split("/").slice(0, 3).join("/");
    apiCache.invalidatePattern(new RegExp(`^${basePath}`));
  }

  /**
   * Handle errors and log them appropriately
   */
  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message;
      const url = error.config?.url || "unknown";
      const method = error.config?.method?.toUpperCase() || "REQUEST";

      // Don't log 401 errors for auth check endpoints (expected behavior)
      const isAuthCheckEndpoint = url.includes("/api/auth/me");
      
      if (status === 401) {
        if (!isAuthCheckEndpoint) {
          console.warn(`🔒 Authentication required: ${method} ${url}`);
        }
        // Don't auto-redirect here, let the interceptor handle it
      } else if (status === 403) {
        console.error(`⛔ Authorization Error [${status}]: ${method} ${url}`);
        console.error(`Message:`, message);
      } else if (status === 404) {
        console.warn(`❓ Not Found [${status}]: ${method} ${url}`);
      } else if (status && status >= 500) {
        console.error(`🔥 Server Error [${status}]: ${method} ${url}`);
        console.error(`Message:`, message);
      } else if (status) {
        console.error(`API Error [${status}]: ${method} ${url}`);
        console.error(`Message:`, message);
      }
    } else if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    apiCache.clear();
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;

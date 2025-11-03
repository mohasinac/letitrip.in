/**
 * API Client for frontend
 * Centralized service for making authenticated API requests
 * Handles Firebase tokens, retries, error handling, and caching
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { auth } from "@/app/api/_lib/database/config";

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
  private tokenPromise: Promise<string | null> | null = null;

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
      withCredentials: true,
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
          console.warn("Unauthorized access");
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

      console.error(`API Error [${status}]: ${method} ${url}`);
      console.error(`Message:`, message);

      if (status === 401) {
        console.error("🔒 Authentication Error: Token may be missing or invalid");
      } else if (status === 403) {
        console.error("⛔ Authorization Error: User may not have required permissions");
      } else if (status === 404) {
        console.error("❓ Not Found: API endpoint may not exist");
      }
    } else if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }

  /**
   * Get authentication token with retry logic
   */
  private async getTokenWithRetry(maxAttempts: number = 5): Promise<string | null> {
    // Reuse existing promise if one is in flight
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = (async () => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const user = auth.currentUser;
          
          if (!user) {
            return null;
          }

          const token = await user.getIdToken();
          return token;
        } catch (error) {
          console.warn(`Token fetch attempt ${attempt}/${maxAttempts} failed:`, error);
          
          if (attempt < maxAttempts) {
            const delay = 200 * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
      
      return null;
    })();

    try {
      return await this.tokenPromise;
    } finally {
      this.tokenPromise = null;
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

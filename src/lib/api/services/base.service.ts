/**
 * Base Service
 * Abstract base class for all API services
 * Provides common error handling, caching, and utility methods
 */

import { ApiResponse } from "@/types";

export interface ServiceConfig {
  enableCache?: boolean;
  cacheDuration?: number;
  retries?: number;
  timeout?: number;
}

export abstract class BaseService {
  protected config: ServiceConfig;
  protected cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config?: ServiceConfig) {
    this.config = {
      enableCache: true,
      cacheDuration: 5 * 60 * 1000, // 5 minutes default
      retries: 3,
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Get cached data
   * @param key - Cache key
   * @returns Cached data or null if expired/not found
   */
  protected getFromCache<T>(key: string): T | null {
    if (!this.config.enableCache) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired =
      Date.now() - cached.timestamp > (this.config.cacheDuration || 0);
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set cache data
   * @param key - Cache key
   * @param data - Data to cache
   */
  protected setInCache(key: string, data: any): void {
    if (!this.config.enableCache) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear specific cache entry
   */
  protected clearCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  protected clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Handle API errors uniformly
   */
  protected handleError(error: any): never {
    let message = "An error occurred";
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;
      message =
        error.response.data?.error ||
        error.response.data?.message ||
        error.message;
    } else if (error.message) {
      message = error.message;
    }

    const apiError = new Error(message) as any;
    apiError.statusCode = statusCode;
    apiError.originalError = error;

    console.error(`Service Error [${statusCode}]:`, message);
    throw apiError;
  }

  /**
   * Validate required parameters
   */
  protected validateRequired(
    params: Record<string, any>,
    required: string[],
  ): void {
    const missing = required.filter((key) => !params[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(", ")}`);
    }
  }

  /**
   * Format API response
   */
  protected formatResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      const error = new Error(response.error || "Unknown error") as any;
      error.response = response;
      throw error;
    }

    return response.data as T;
  }
}

export default BaseService;

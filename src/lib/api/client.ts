/**
 * API Client for frontend
 * Centralized service for making authenticated API requests
 * Handles Firebase tokens, retries, error handling, and auth intercepting
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types';
import { auth } from '@/lib/database/config';
import { getAuthToken, clearAuthToken, setAuthToken } from './auth-fetch';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(config?: ApiClientConfig) {
    const baseURL = config?.baseURL || process.env.NEXT_PUBLIC_API_URL || '/api';
    const timeout = config?.timeout || 30000;
    this.maxRetries = config?.retries || 3;

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include cookies
    });

    // Request interceptor to add authentication token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Try to get token from Firebase first
          let token: string | null = null;
          
          try {
            const currentUser = auth.currentUser;
            if (currentUser) {
              token = await currentUser.getIdToken();
              // Store token for future use
              if (token) {
                setAuthToken(token);
              }
            }
          } catch (firebaseError) {
            console.debug('Firebase auth not available, trying localStorage');
            // Fall back to localStorage token
            token = await getAuthToken();
          }

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting authentication token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors and retries
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const config = error.config as any;

        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
          clearAuthToken();
          console.warn('Unauthorized access - clearing token');
          
          // Don't redirect during initial auth setup or for /auth/me calls
          // Let the caller handle the 401, particularly for Google signup flow
          const isAuthMeCall = config.url?.includes('/auth/me');
          const isInitialAuthSetup = config.url?.includes('/auth/') && 
            (config.url?.includes('/register') || config.url?.includes('/send-otp'));

          if (typeof window !== 'undefined' && !isAuthMeCall && !isInitialAuthSetup) {
            // Store current path to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          return Promise.reject(error);
        }

        // Handle 403 - Forbidden
        if (error.response?.status === 403) {
          console.warn('Access forbidden - insufficient permissions');
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
            `Retrying request (${config.__retryCount}/${this.maxRetries}): ${config.method?.toUpperCase()} ${config.url}`
          );
          
          return this.client.request(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request
   */
  async get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, {
        params,
        ...config,
      });
      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Generic POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
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
    config?: AxiosRequestConfig
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
   * Generic PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
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
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
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
  async publicPost<T = any>(
    url: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await axios.post<ApiResponse<T>>(url, data, {
        baseURL: this.client.defaults.baseURL,
        timeout: this.client.defaults.timeout,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
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
        console.error('Validation errors:', error.response.data.errors);
      }
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error:', error);
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
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;

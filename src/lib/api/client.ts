/**
 * API Client for frontend
 * Centralized service for making authenticated API requests
 * Uses Firebase ID tokens for authentication
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types';
import { auth } from '@/lib/database/config';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || process.env.NEXT_PUBLIC_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add Firebase auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Get Firebase ID token from current user
          const currentUser = auth.currentUser;
          if (currentUser) {
            const token = await currentUser.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting Firebase token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.warn('Unauthorized access - redirecting to login');
          if (typeof window !== 'undefined') {
            // Store current path to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params, ...config });
    return response.data.data as T;
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  /**
   * Upload files
   */
  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data.data as T;
  }

  /**
   * Make a request without authentication (for public endpoints)
   */
  async publicGet<T>(url: string, params?: any): Promise<T> {
    const response = await axios.get<ApiResponse<T>>(url, { 
      params,
      baseURL: this.client.defaults.baseURL 
    });
    return response.data.data as T;
  }

  /**
   * Get the underlying axios instance for advanced use cases
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;

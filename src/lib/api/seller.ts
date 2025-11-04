/**
 * Seller API utility functions
 * These are convenience wrappers around apiClient for seller operations
 */
import { apiClient } from "./client";

/**
 * Make a GET request to seller endpoints
 */
export async function apiGet<T = any>(url: string): Promise<T> {
  return await apiClient.get<T>(url);
}

/**
 * Make a POST request to seller endpoints
 */
export async function apiPost<T = any>(url: string, data?: any): Promise<T> {
  return await apiClient.post<T>(url, data);
}

/**
 * Make a PUT request to seller endpoints
 */
export async function apiPut<T = any>(url: string, data?: any): Promise<T> {
  return await apiClient.put<T>(url, data);
}

/**
 * Make a DELETE request to seller endpoints
 */
export async function apiDelete<T = any>(url: string): Promise<T> {
  return await apiClient.delete<T>(url);
}

/**
 * Upload file with authentication
 * Uses FormData for multipart/form-data uploads
 */
export async function uploadWithAuth<T = any>(url: string, formData: FormData): Promise<T> {
  return await apiClient.upload<T>(url, formData);
}

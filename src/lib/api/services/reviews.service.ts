/**
 * Reviews Service
 * Frontend service for review-related API calls
 */

import { apiClient } from '../client';
import { API_ENDPOINTS, buildQueryString } from '../constants/endpoints';
import type { Review } from '@/types';
import type { PaginatedData } from '../responses';

export interface ReviewFilters {
  productId?: string;
  userId?: string;
  rating?: number;
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export class ReviewsService {
  /**
   * Get list of reviews
   * @param filters - Filter parameters
   * @returns Paginated list of reviews
   */
  async list(filters?: ReviewFilters): Promise<PaginatedData<Review>> {
    const params: Record<string, any> = {};
    
    if (filters?.productId) params.productId = filters.productId;
    if (filters?.userId) params.userId = filters.userId;
    if (filters?.rating) params.rating = filters.rating;
    if (filters?.status) params.status = filters.status;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.REVIEWS.LIST}${queryString}`;
    
    return apiClient.get<PaginatedData<Review>>(url);
  }

  /**
   * Get reviews for a specific product
   * @param productId - Product ID
   * @returns List of product reviews
   */
  async getByProduct(productId: string): Promise<Review[]> {
    const result = await apiClient.get<PaginatedData<Review>>(
      API_ENDPOINTS.REVIEWS.BY_PRODUCT(productId)
    );
    return result.items;
  }

  /**
   * Get single review by ID
   * @param id - Review ID
   * @returns Review details
   */
  async getById(id: string): Promise<Review> {
    return apiClient.get<Review>(API_ENDPOINTS.REVIEWS.GET(id));
  }

  /**
   * Create new review
   * @param data - Review data
   * @returns Created review
   */
  async create(data: CreateReviewData): Promise<Review> {
    return apiClient.post<Review>(API_ENDPOINTS.REVIEWS.CREATE, data);
  }

  /**
   * Update existing review
   * @param id - Review ID
   * @param data - Updated review data
   * @returns Updated review
   */
  async update(id: string, data: UpdateReviewData): Promise<Review> {
    return apiClient.patch<Review>(API_ENDPOINTS.REVIEWS.UPDATE(id), data);
  }

  /**
   * Delete review
   * @param id - Review ID
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.REVIEWS.DELETE(id));
  }

  /**
   * Get all reviews (admin only)
   * @param filters - Filter parameters
   * @returns Paginated list of all reviews
   */
  async adminList(filters?: ReviewFilters): Promise<PaginatedData<Review>> {
    const params: Record<string, any> = {};
    
    if (filters?.productId) params.productId = filters.productId;
    if (filters?.userId) params.userId = filters.userId;
    if (filters?.rating) params.rating = filters.rating;
    if (filters?.status) params.status = filters.status;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.REVIEWS.ADMIN_LIST}${queryString}`;
    
    return apiClient.get<PaginatedData<Review>>(url);
  }

  /**
   * Approve review (admin only)
   * @param id - Review ID
   * @returns Approved review
   */
  async approve(id: string): Promise<Review> {
    return apiClient.post<Review>(API_ENDPOINTS.REVIEWS.ADMIN_APPROVE(id), {});
  }

  /**
   * Reject review (admin only)
   * @param id - Review ID
   * @param reason - Rejection reason
   * @returns Rejected review
   */
  async reject(id: string, reason?: string): Promise<Review> {
    return apiClient.post<Review>(API_ENDPOINTS.REVIEWS.ADMIN_REJECT(id), { reason });
  }

  /**
   * Mark review as helpful
   * @param id - Review ID
   */
  async markHelpful(id: string): Promise<void> {
    return apiClient.post(`${API_ENDPOINTS.REVIEWS.GET(id)}/helpful`, {});
  }
}

// Export singleton instance
export const reviewsService = new ReviewsService();

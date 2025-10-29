/**
 * Category Service
 * Standalone service layer for category API operations
 * Handles all category-related requests with caching and error handling
 */

import { apiClient } from "../client";
import type { Category, CategoryFormData, ApiResponse } from "@/types";

export class CategoryService {
  /**
   * Fetch all categories
   * @param format - 'tree' or 'list' format
   * @param page - Page number for list format
   * @param limit - Items per page for list format
   */
  static async getCategories(
    format: "tree" | "list" = "list",
    page: number = 1,
    limit: number = 10
  ): Promise<Category[]> {
    try {
      const params = new URLSearchParams({
        format,
        ...(format === "list" && { page: page.toString(), limit: limit.toString() }),
      });

      const response = await apiClient.get<ApiResponse>(
        `/admin/categories?${params}`
      );

      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.error || "Failed to fetch categories");
    } catch (error) {
      console.error("CategoryService.getCategories error:", error);
      throw error;
    }
  }

  /**
   * Fetch single category by ID
   */
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<Category>(`/admin/categories/${id}`);
      return response || null;
    } catch (error) {
      console.error("CategoryService.getCategoryById error:", error);
      throw error;
    }
  }

  /**
   * Create new category
   */
  static async createCategory(data: CategoryFormData): Promise<Category> {
    try {
      const response = await apiClient.post<Category>(
        "/admin/categories",
        data
      );
      return response;
    } catch (error) {
      console.error("CategoryService.createCategory error:", error);
      throw error;
    }
  }

  /**
   * Update existing category
   */
  static async updateCategory(
    id: string,
    data: Partial<CategoryFormData>
  ): Promise<Category> {
    try {
      const response = await apiClient.patch<Category>(
        `/admin/categories?id=${id}`,
        data
      );
      return response;
    } catch (error) {
      console.error("CategoryService.updateCategory error:", error);
      throw error;
    }
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/categories?id=${id}`);
    } catch (error) {
      console.error("CategoryService.deleteCategory error:", error);
      throw error;
    }
  }

  /**
   * Validate slug uniqueness
   */
  static async validateSlug(
    slug: string,
    excludeId?: string
  ): Promise<{ available: boolean; error?: string }> {
    try {
      const params = new URLSearchParams({ slug });
      if (excludeId) params.append("excludeId", excludeId);

      const response = await apiClient.get<{
        available: boolean;
        error?: string;
      }>(`/admin/categories/validate-slug?${params}`);

      return response;
    } catch (error) {
      console.error("CategoryService.validateSlug error:", error);
      throw error;
    }
  }

  /**
   * Generate slug from name
   */
  static async generateSlug(
    name: string,
    excludeId?: string
  ): Promise<{ slug: string; error?: string }> {
    try {
      const response = await apiClient.post<{ slug: string; error?: string }>(
        "/admin/categories/validate-slug",
        { name, excludeId }
      );

      return response;
    } catch (error) {
      console.error("CategoryService.generateSlug error:", error);
      throw error;
    }
  }

  /**
   * Bulk update categories
   */
  static async bulkUpdateCategories(
    updates: Array<{ id: string; data: Partial<CategoryFormData> }>
  ): Promise<Category[]> {
    try {
      const responses = await Promise.all(
        updates.map((update) => this.updateCategory(update.id, update.data))
      );
      return responses;
    } catch (error) {
      console.error("CategoryService.bulkUpdateCategories error:", error);
      throw error;
    }
  }

  /**
   * Bulk delete categories
   */
  static async bulkDeleteCategories(ids: string[]): Promise<void> {
    try {
      await Promise.all(ids.map((id) => this.deleteCategory(id)));
    } catch (error) {
      console.error("CategoryService.bulkDeleteCategories error:", error);
      throw error;
    }
  }
}

export default CategoryService;

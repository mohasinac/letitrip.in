/**
 * Category Service
 * Handles all category-related API operations
 */

import { apiClient } from "../client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  level: number;
  children?: Category[];
  productCount?: number;
  sortOrder: number;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryFilters {
  parentId?: string;
  level?: number;
  featured?: boolean;
  active?: boolean;
}

export class CategoryService {
  /**
   * Get all categories as tree structure
   */
  static async getCategoryTree(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>(
        "/api/categories?format=tree"
      );
      return response;
    } catch (error) {
      console.error("CategoryService.getCategoryTree error:", error);
      throw error;
    }
  }

  /**
   * Get all categories as flat list
   */
  static async getCategories(filters?: CategoryFilters): Promise<Category[]> {
    try {
      const params = new URLSearchParams({ format: 'list' });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await apiClient.get<Category[]>(
        `/api/categories?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("CategoryService.getCategories error:", error);
      throw error;
    }
  }

  /**
   * Get single category by ID or slug
   */
  static async getCategory(idOrSlug: string): Promise<Category> {
    try {
      const response = await apiClient.get<Category>(
        `/api/categories/${idOrSlug}`
      );
      return response;
    } catch (error) {
      console.error("CategoryService.getCategory error:", error);
      throw error;
    }
  }

  /**
   * Get featured categories
   */
  static async getFeaturedCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>(
        "/api/categories?featured=true"
      );
      return response;
    } catch (error) {
      console.error("CategoryService.getFeaturedCategories error:", error);
      throw error;
    }
  }

  /**
   * Get top-level categories
   */
  static async getTopCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>(
        "/api/categories?level=0"
      );
      return response;
    } catch (error) {
      console.error("CategoryService.getTopCategories error:", error);
      throw error;
    }
  }

  /**
   * Get subcategories of a category
   */
  static async getSubcategories(categoryId: string): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>(
        `/api/categories?parentId=${categoryId}`
      );
      return response;
    } catch (error) {
      console.error("CategoryService.getSubcategories error:", error);
      throw error;
    }
  }
}

export default CategoryService;

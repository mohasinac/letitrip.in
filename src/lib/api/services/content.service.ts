/**
 * Content Service
 * Handles CMS content, pages, and content-related API operations
 */

import { apiClient } from "../client";

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContentPageData {
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
}

export interface UpdateContentPageData extends Partial<CreateContentPageData> {}

export class ContentService {
  /**
   * Get all published content pages
   */
  static async getPublishedPages(): Promise<ContentPage[]> {
    try {
      const response = await apiClient.get<ContentPage[]>(
        "/api/content?published=true"
      );
      return response;
    } catch (error) {
      console.error("ContentService.getPublishedPages error:", error);
      throw error;
    }
  }

  /**
   * Get all content pages (admin)
   */
  static async getAllPages(): Promise<ContentPage[]> {
    try {
      const response = await apiClient.get<ContentPage[]>("/api/content");
      return response;
    } catch (error) {
      console.error("ContentService.getAllPages error:", error);
      throw error;
    }
  }

  /**
   * Get single content page by slug
   */
  static async getPage(slug: string): Promise<ContentPage> {
    try {
      const response = await apiClient.get<ContentPage>(`/api/content/${slug}`);
      return response;
    } catch (error) {
      console.error("ContentService.getPage error:", error);
      throw error;
    }
  }

  /**
   * Create content page (admin)
   */
  static async createPage(data: CreateContentPageData): Promise<ContentPage> {
    try {
      const response = await apiClient.post<ContentPage>("/api/content", data);
      return response;
    } catch (error) {
      console.error("ContentService.createPage error:", error);
      throw error;
    }
  }

  /**
   * Update content page (admin)
   */
  static async updatePage(
    slug: string,
    data: UpdateContentPageData
  ): Promise<ContentPage> {
    try {
      const response = await apiClient.patch<ContentPage>(
        `/api/content/${slug}`,
        data
      );
      return response;
    } catch (error) {
      console.error("ContentService.updatePage error:", error);
      throw error;
    }
  }

  /**
   * Delete content page (admin)
   */
  static async deletePage(slug: string): Promise<void> {
    try {
      await apiClient.delete(`/api/content/${slug}`);
    } catch (error) {
      console.error("ContentService.deletePage error:", error);
      throw error;
    }
  }
}

export default ContentService;

/**
 * Hero Banner Service
 * Handles hero banner/carousel API operations
 */

import { apiClient } from "../client";

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  linkText?: string;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHeroBannerData {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  linkText?: string;
  order?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateHeroBannerData extends Partial<CreateHeroBannerData> {}

export class HeroBannerService {
  /**
   * Get all active hero banners
   */
  static async getActiveBanners(): Promise<HeroBanner[]> {
    try {
      const response = await apiClient.get<HeroBanner[]>(
        "/api/hero-banner?active=true"
      );
      return response;
    } catch (error) {
      console.error("HeroBannerService.getActiveBanners error:", error);
      throw error;
    }
  }

  /**
   * Get all hero banners (admin)
   */
  static async getAllBanners(): Promise<HeroBanner[]> {
    try {
      const response = await apiClient.get<HeroBanner[]>("/api/hero-banner");
      return response;
    } catch (error) {
      console.error("HeroBannerService.getAllBanners error:", error);
      throw error;
    }
  }

  /**
   * Get single hero banner
   */
  static async getBanner(id: string): Promise<HeroBanner> {
    try {
      const response = await apiClient.get<HeroBanner>(`/api/hero-banner/${id}`);
      return response;
    } catch (error) {
      console.error("HeroBannerService.getBanner error:", error);
      throw error;
    }
  }

  /**
   * Create hero banner (admin)
   */
  static async createBanner(data: CreateHeroBannerData): Promise<HeroBanner> {
    try {
      const response = await apiClient.post<HeroBanner>("/api/hero-banner", data);
      return response;
    } catch (error) {
      console.error("HeroBannerService.createBanner error:", error);
      throw error;
    }
  }

  /**
   * Update hero banner (admin)
   */
  static async updateBanner(
    id: string,
    data: UpdateHeroBannerData
  ): Promise<HeroBanner> {
    try {
      const response = await apiClient.patch<HeroBanner>(
        `/api/hero-banner/${id}`,
        data
      );
      return response;
    } catch (error) {
      console.error("HeroBannerService.updateBanner error:", error);
      throw error;
    }
  }

  /**
   * Delete hero banner (admin)
   */
  static async deleteBanner(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/hero-banner/${id}`);
    } catch (error) {
      console.error("HeroBannerService.deleteBanner error:", error);
      throw error;
    }
  }

  /**
   * Reorder banners (admin)
   */
  static async reorderBanners(bannerIds: string[]): Promise<void> {
    try {
      await apiClient.post("/api/hero-banner/reorder", { bannerIds });
    } catch (error) {
      console.error("HeroBannerService.reorderBanners error:", error);
      throw error;
    }
  }
}

export default HeroBannerService;

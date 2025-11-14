import { apiService } from "./api.service";
import { ShopBE } from "@/types/backend/shop.types";
import { ShopFE, ShopCardFE, ShopFormFE } from "@/types/frontend/shop.types";
import {
  toFEShop,
  toFEShopCard,
  toBECreateShopRequest,
} from "@/types/transforms/shop.transforms";
import type { ProductBE } from "@/types/backend/product.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { toFEProductCard } from "@/types/transforms/product.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";

interface ShopVerificationData {
  isVerified: boolean;
  verificationNotes?: string;
}

interface ShopFeatureData {
  isFeatured: boolean;
  showOnHomepage: boolean;
}

interface ShopBanData {
  isBanned: boolean;
  banReason?: string;
}

interface ShopPaymentData {
  amount: number;
  description: string;
  dueDate?: Date;
}

class ShopsService {
  // List shops (filtered by role)
  async list(
    filters?: Record<string, any>
  ): Promise<PaginatedResponseFE<ShopCardFE>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/shops?${queryString}` : "/shops";

    const response = await apiService.get<PaginatedResponseBE<ShopBE>>(
      endpoint
    );

    return {
      data: response.data.map(toFEShopCard),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      hasMore: response.hasMore,
    };
  }

  // Get shop by slug
  async getBySlug(slug: string): Promise<ShopFE> {
    const shopBE = await apiService.get<ShopBE>(`/shops/${slug}`);
    return toFEShop(shopBE);
  }

  // Create shop (seller/admin)
  async create(formData: ShopFormFE): Promise<ShopFE> {
    const request = toBECreateShopRequest(formData);
    const shopBE = await apiService.post<ShopBE>("/shops", request);
    return toFEShop(shopBE);
  }

  // Update shop (owner/admin)
  async update(slug: string, formData: Partial<ShopFormFE>): Promise<ShopFE> {
    const request = toBECreateShopRequest(formData as ShopFormFE);
    const shopBE = await apiService.patch<ShopBE>(`/shops/${slug}`, request);
    return toFEShop(shopBE);
  }

  // Delete shop (owner/admin)
  async delete(slug: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/shops/${slug}`);
  }

  // Verify shop (admin only)
  async verify(slug: string, data: ShopVerificationData): Promise<ShopFE> {
    const shopBE = await apiService.patch<ShopBE>(
      `/shops/${slug}/verify`,
      data
    );
    return toFEShop(shopBE);
  }

  // Ban/unban shop (admin only)
  async ban(slug: string, data: ShopBanData): Promise<ShopFE> {
    const shopBE = await apiService.patch<ShopBE>(`/shops/${slug}/ban`, data);
    return toFEShop(shopBE);
  }

  // Set feature flags (admin only)
  async setFeatureFlags(slug: string, data: ShopFeatureData): Promise<ShopFE> {
    const shopBE = await apiService.patch<ShopBE>(
      `/shops/${slug}/feature`,
      data
    );
    return toFEShop(shopBE);
  }

  // Get shop payments (owner/admin)
  async getPayments(slug: string): Promise<any[]> {
    return apiService.get<any[]>(`/shops/${slug}/payments`);
  }

  // Process payment (admin only)
  async processPayment(slug: string, data: ShopPaymentData): Promise<any> {
    return apiService.post<any>(`/shops/${slug}/payments`, data);
  }

  // Get shop statistics
  async getStats(slug: string): Promise<any> {
    return apiService.get<any>(`/shops/${slug}/stats`);
  }

  // Get products for a shop (supports pagination & basic filters)
  async getShopProducts(
    slug: string,
    options?: { page?: number; limit?: number; filters?: Record<string, any> }
  ): Promise<PaginatedResponseFE<ProductCardFE>> {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.filters) {
      Object.entries(options.filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.append(k, String(v));
      });
    }

    const qs = params.toString();
    const endpoint = qs
      ? `/shops/${slug}/products?${qs}`
      : `/shops/${slug}/products`;
    const response = await apiService.get<PaginatedResponseBE<ProductBE>>(
      endpoint
    );

    return {
      data: response.data.map(toFEProductCard),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      hasMore: response.hasMore,
    };
  }

  // Get shop reviews (paginated)
  async getShopReviews(
    slug: string,
    page?: number,
    limit?: number
  ): Promise<any> {
    const params = new URLSearchParams();
    if (page) params.append("page", String(page));
    if (limit) params.append("limit", String(limit));
    const qs = params.toString();
    const endpoint = qs
      ? `/shops/${slug}/reviews?${qs}`
      : `/shops/${slug}/reviews`;
    return apiService.get<any>(endpoint);
  }

  // Follow shop (user feature)
  async follow(slug: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`/shops/${slug}/follow`, {});
  }

  // Unfollow shop (user feature)
  async unfollow(slug: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/shops/${slug}/follow`);
  }

  // Check if following shop
  async checkFollowing(slug: string): Promise<{ isFollowing: boolean }> {
    return apiService.get<{ isFollowing: boolean }>(`/shops/${slug}/follow`);
  }

  // Get following shops list
  async getFollowing(): Promise<{ shops: ShopCardFE[]; count: number }> {
    const response = await apiService.get<{ shops: ShopBE[]; count: number }>(
      "/shops/following"
    );
    return {
      shops: response.shops.map(toFEShopCard),
      count: response.count,
    };
  }

  // Get featured shops
  async getFeatured(): Promise<ShopCardFE[]> {
    const response = await apiService.get<{ data: ShopBE[] }>(
      "/shops?featured=true&verified=true&limit=100"
    );
    return response.data.map(toFEShopCard);
  }

  // Get homepage shops
  async getHomepage(): Promise<ShopCardFE[]> {
    const response = await apiService.get<{ data: ShopBE[] }>(
      "/shops?featured=true&verified=true&limit=20"
    );
    return response.data.map(toFEShopCard);
  }
}

export const shopsService = new ShopsService();
export type {
  ShopVerificationData,
  ShopFeatureData,
  ShopBanData,
  ShopPaymentData,
};

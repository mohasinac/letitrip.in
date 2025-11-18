import { apiService } from "./api.service";
import { SHOP_ROUTES } from "@/constants/api-routes";
import { ShopBE } from "@/types/backend/shop.types";
import { ShopFE, ShopCardFE, ShopFormFE } from "@/types/frontend/shop.types";
import {
  toFEShop,
  toFEShopCard,
  toBECreateShopRequest,
} from "@/types/transforms/shop.transforms";
import type {
  ProductBE,
  ProductListItemBE,
} from "@/types/backend/product.types";
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
  featured: boolean;
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
  // List shops (filtered by role) with cursor-based pagination
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
    const endpoint = queryString
      ? `${SHOP_ROUTES.LIST}?${queryString}`
      : SHOP_ROUTES.LIST;

    const response = await apiService.get<PaginatedResponseBE<any>>(endpoint);

    return {
      data: (response.data || []).map(toFEShopCard),
      count: response.count,
      pagination: response.pagination,
    };
  }

  // Get shop by slug
  async getBySlug(slug: string): Promise<ShopFE> {
    const response: any = await apiService.get(SHOP_ROUTES.BY_SLUG(slug));
    return toFEShop(response.data);
  }

  // Create shop (seller/admin)
  async create(formData: ShopFormFE): Promise<ShopFE> {
    const request = toBECreateShopRequest(formData);
    const response: any = await apiService.post(SHOP_ROUTES.LIST, request);
    return toFEShop(response.data);
  }

  // Update shop (owner/admin)
  async update(slug: string, formData: Partial<ShopFormFE>): Promise<ShopFE> {
    const request = toBECreateShopRequest(formData as ShopFormFE);
    const response: any = await apiService.patch(
      SHOP_ROUTES.BY_SLUG(slug),
      request
    );
    return toFEShop(response.data);
  }

  // Delete shop (owner/admin)
  async delete(slug: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(SHOP_ROUTES.BY_SLUG(slug));
  }

  // Verify shop (admin only)
  async verify(slug: string, data: ShopVerificationData): Promise<ShopFE> {
    const response: any = await apiService.patch(`/shops/${slug}/verify`, data);
    return toFEShop(response.data);
  }

  // Ban/unban shop (admin only)
  async ban(slug: string, data: ShopBanData): Promise<ShopFE> {
    const response: any = await apiService.patch(`/shops/${slug}/ban`, data);
    return toFEShop(response.data);
  }

  // Set feature flags (admin only)
  async setFeatureFlags(slug: string, data: ShopFeatureData): Promise<ShopFE> {
    const response: any = await apiService.patch(
      `/shops/${slug}/feature`,
      data
    );
    return toFEShop(response.data);
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
    const response = await apiService.get<
      PaginatedResponseBE<ProductListItemBE>
    >(endpoint);

    return {
      data: response.data.map(toFEProductCard),
      count: response.count,
      pagination: response.pagination,
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

  // Bulk operations (admin only)
  private async bulkAction(
    action: string,
    ids: string[],
    data?: Record<string, any>
  ): Promise<{
    success: boolean;
    results: {
      success: string[];
      failed: { id: string; error: string }[];
    };
    summary: { total: number; succeeded: number; failed: number };
  }> {
    return apiService.post(SHOP_ROUTES.BULK, { action, ids, data });
  }

  async bulkVerify(ids: string[]): Promise<any> {
    return this.bulkAction("verify", ids);
  }

  async bulkUnverify(ids: string[]): Promise<any> {
    return this.bulkAction("unverify", ids);
  }

  async bulkFeature(ids: string[]): Promise<any> {
    return this.bulkAction("feature", ids);
  }

  async bulkUnfeature(ids: string[]): Promise<any> {
    return this.bulkAction("unfeature", ids);
  }

  async bulkActivate(ids: string[]): Promise<any> {
    return this.bulkAction("activate", ids);
  }

  async bulkDeactivate(ids: string[]): Promise<any> {
    return this.bulkAction("deactivate", ids);
  }

  async bulkBan(ids: string[], banReason?: string): Promise<any> {
    return this.bulkAction("ban", ids, { banReason });
  }

  async bulkUnban(ids: string[]): Promise<any> {
    return this.bulkAction("unban", ids);
  }

  async bulkDelete(ids: string[]): Promise<any> {
    return this.bulkAction("delete", ids);
  }

  async bulkUpdate(ids: string[], updates: Record<string, any>): Promise<any> {
    return this.bulkAction("update", ids, updates);
  }
}

export const shopsService = new ShopsService();
export type {
  ShopVerificationData,
  ShopFeatureData,
  ShopBanData,
  ShopPaymentData,
};

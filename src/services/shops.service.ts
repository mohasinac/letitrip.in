import { apiService } from "./api.service";
import { BaseService } from "./base-service";
import { SHOP_ROUTES } from "@/constants/api-routes";
import { logError } from "@/lib/firebase-error-logger";
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

/**
 * Shops Service - Extends BaseService
 *
 * Provides shop management with BaseService CRUD operations
 * plus shop-specific methods for verification, payments, and social features.
 */
class ShopsService extends BaseService<
  ShopFE,
  ShopBE,
  ShopFormFE,
  Partial<ShopFormFE>
> {
  constructor() {
    super({
      resourceName: "shop",
      baseRoute: SHOP_ROUTES.LIST,
      toFE: toFEShop,
      toBECreate: toBECreateShopRequest,
      toBEUpdate: (data) => toBECreateShopRequest(data as ShopFormFE),
    });
  }

  /**
   * Override list to support custom filters and return ShopCardFE
   */
  async list(
    filters?: Record<string, any>,
  ): Promise<PaginatedResponseFE<ShopCardFE>> {
    try {
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
    } catch (error) {
      return BaseService.handleError(error, "list shops");
    }
  }

  /**
   * Get shop by slug (shops use slugs for public URLs)
   */
  async getBySlug(slug: string): Promise<ShopFE> {
    try {
      const response: any = await apiService.get(SHOP_ROUTES.BY_SLUG(slug));
      return toFEShop(response.shop);
    } catch (error) {
      return BaseService.handleError(error, "get shop by slug");
    }
  }

  /**
   * Update shop by slug
   */
  async updateBySlug(slug: string, formData: Partial<ShopFormFE>): Promise<ShopFE> {
    try {
      const request = toBECreateShopRequest(formData as ShopFormFE);
      const response: any = await apiService.patch(
        SHOP_ROUTES.BY_SLUG(slug),
        request,
      );
      return toFEShop(response.data);
    } catch (error) {
      return BaseService.handleError(error, "update shop");
    }
  }

  /**
   * Delete shop by slug
   */
  async deleteBySlug(slug: string): Promise<{ message: string }> {
    try {
      return await apiService.delete<{ message: string }>(SHOP_ROUTES.BY_SLUG(slug));
    } catch (error) {
      return BaseService.handleError(error, "delete shop");
    }
  }

  // Note: getById, create, update (by ID), delete (by ID) are inherited from BaseService

  /**
   * Verify shop (admin only)
   */
  async verify(slug: string, data: ShopVerificationData): Promise<ShopFE> {
    try {
      const response: any = await apiService.patch(`/shops/${slug}/verify`, data);
      return toFEShop(response.data);
    } catch (error) {
      return BaseService.handleError(error, "verify shop");
    }
  }

  /**
   * Ban/unban shop (admin only)
   */
  async ban(slug: string, data: ShopBanData): Promise<ShopFE> {
    try {
      const response: any = await apiService.patch(`/shops/${slug}/ban`, data);
      return toFEShop(response.data);
    } catch (error) {
      return BaseService.handleError(error, "ban shop");
    }
  }

  /**
   * Set feature flags (admin only)
   */
  async setFeatureFlags(slug: string, data: ShopFeatureData): Promise<ShopFE> {
    try {
      const response: any = await apiService.patch(
        `/shops/${slug}/feature`,
        data,
      );
      return toFEShop(response.data);
    } catch (error) {
      return BaseService.handleError(error, "set shop feature flags");
    }
  }

  /**
   * Get shop payments (owner/admin)
   */
  async getPayments(slug: string): Promise<any[]> {
    try {
      return await apiService.get<any[]>(`/shops/${slug}/payments`);
    } catch (error) {
      return BaseService.handleError(error, "get shop payments");
    }
  }

  /**
   * Process payment (admin only)
   */
  async processPayment(slug: string, data: ShopPaymentData): Promise<any> {
    try {
      return await apiService.post<any>(`/shops/${slug}/payments`, data);
    } catch (error) {
      return BaseService.handleError(error, "process shop payment");
    }
  }

  /**
   * Get shop statistics
   */
  async getStats(slug: string): Promise<any> {
    try {
      return await apiService.get<any>(`/shops/${slug}/stats`);
    } catch (error) {
      return BaseService.handleError(error, "get shop statistics");
    }
  }

  /**
   * Get products for a shop (supports pagination & basic filters)
   */
  async getShopProducts(
    slug: string,
    options?: { page?: number; limit?: number; filters?: Record<string, any> },
  ): Promise<PaginatedResponseFE<ProductCardFE>> {
    try {
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
      const response =
        await apiService.get<PaginatedResponseBE<ProductListItemBE>>(endpoint);

      return {
        data: response.data.map(toFEProductCard),
        count: response.count,
        pagination: response.pagination,
      };
    } catch (error) {
      return BaseService.handleError(error, "get shop products");
    }
  }

  /**
   * Get shop reviews (paginated)
   */
  async getShopReviews(
    slug: string,
    page?: number,
    limit?: number,
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", String(page));
      if (limit) params.append("limit", String(limit));
      const qs = params.toString();
      const endpoint = qs
        ? `/shops/${slug}/reviews?${qs}`
        : `/shops/${slug}/reviews`;
      return await apiService.get<any>(endpoint);
    } catch (error) {
      return BaseService.handleError(error, "get shop reviews");
    }
  }

  /**
   * Follow shop (user feature)
   */
  async follow(slug: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>(`/shops/${slug}/follow`, {});
    } catch (error) {
      return BaseService.handleError(error, "follow shop");
    }
  }

  /**
   * Unfollow shop (user feature)
   */
  async unfollow(slug: string): Promise<{ message: string }> {
    try {
      return await apiService.delete<{ message: string }>(`/shops/${slug}/follow`);
    } catch (error) {
      return BaseService.handleError(error, "unfollow shop");
    }
  }

  /**
   * Check if following shop
   */
  async checkFollowing(slug: string): Promise<{ isFollowing: boolean }> {
    try {
      return await apiService.get<{ isFollowing: boolean }>(`/shops/${slug}/follow`);
    } catch (error) {
      return BaseService.handleError(error, "check if following shop");
    }
  }

  /**
   * Get following shops list
   */
  async getFollowing(): Promise<{ shops: ShopCardFE[]; count: number }> {
    try {
      const response = await apiService.get<{ shops: ShopBE[]; count: number }>(
        "/shops/following",
      );
      return {
        shops: response.shops.map(toFEShopCard),
        count: response.count,
      };
    } catch (error) {
      return BaseService.handleError(error, "get following shops");
    }
  }

  /**
   * Get featured shops
   */
  async getFeatured(): Promise<ShopCardFE[]> {
    try {
      const response = await apiService.get<{ data: ShopBE[] }>(
        "/shops?featured=true&verified=true&limit=100",
      );
      return response.data.map(toFEShopCard);
    } catch (error) {
      return BaseService.handleError(error, "get featured shops");
    }
  }

  /**
   * Get homepage shops
   */
  async getHomepage(): Promise<ShopCardFE[]> {
    try {
      const response = await apiService.get<{ data: ShopBE[] }>(
        "/shops?featured=true&verified=true&limit=20",
      );
      return response.data.map(toFEShopCard);
    } catch (error) {
      return BaseService.handleError(error, "get homepage shops");
    }
  }

  /**
   * Bulk operations (admin only)
   */
  private async bulkAction(
    action: string,
    ids: string[],
    data?: Record<string, any>,
  ): Promise<{
    success: boolean;
    results: {
      success: string[];
      failed: { id: string; error: string }[];
    };
    summary: { total: number; succeeded: number; failed: number };
  }> {
    try {
      return await apiService.post(SHOP_ROUTES.BULK, { action, ids, data });
    } catch (error) {
      return BaseService.handleError(error, `bulk ${action} shops`);
    }
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

  /**
   * Batch fetch shops by IDs
   * Used for admin-curated featured sections
   */
  async getByIds(ids: string[]): Promise<ShopCardFE[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const response: any = await apiService.post("/shops/batch", { ids });
      return (response.data || []).map(toFEShopCard);
    } catch (error) {
      logError(error as Error, {
        component: "ShopsService.getByIds",
        metadata: { ids },
      });
      return [];
    }
  }
}

export const shopsService = new ShopsService();
export type {
  ShopVerificationData,
  ShopFeatureData,
  ShopBanData,
  ShopPaymentData,
};

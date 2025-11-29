import { apiService } from "./api.service";
import { COUPON_ROUTES, buildUrl } from "@/constants/api-routes";
import type { CouponBE, CouponFiltersBE } from "@/types/backend/coupon.types";
import type {
  CouponFE,
  CouponFormFE,
  ValidateCouponRequestFE,
  ValidateCouponResponseFE,
} from "@/types/frontend/coupon.types";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
  BulkActionResponse,
} from "@/types/shared/common.types";
import { logServiceError } from "@/lib/error-logger";
import {
  toFECoupon,
  toFECoupons,
  toBECreateCouponRequest,
  toBEUpdateCouponRequest,
} from "@/types/transforms/coupon.transforms";

// Remove old interfaces - now using types from type system

interface ValidateCouponData {
  code: string;
  cartTotal: number;
  items: {
    productId: string;
    categoryId: string;
    quantity: number;
    price: number;
  }[];
}

interface ValidateCouponResponse {
  valid: boolean;
  discount: number;
  message?: string;
}

class CouponsService {
  // List coupons (public active/owner all)
  async list(
    filters?: Partial<CouponFiltersBE>,
  ): Promise<PaginatedResponseFE<CouponFE>> {
    const endpoint = buildUrl(COUPON_ROUTES.LIST, filters);
    const response =
      await apiService.get<PaginatedResponseBE<CouponBE>>(endpoint);

    return {
      data: toFECoupons(response.data),
      count: response.count,
      pagination: response.pagination,
    };
  }

  // Get coupon by ID (or code)
  async getById(id: string): Promise<CouponFE> {
    const couponBE = await apiService.get<CouponBE>(COUPON_ROUTES.BY_CODE(id));
    return toFECoupon(couponBE);
  }

  // Get coupon by code
  async getByCode(code: string): Promise<CouponFE> {
    const couponBE = await apiService.get<CouponBE>(
      COUPON_ROUTES.BY_CODE(code),
    );
    return toFECoupon(couponBE);
  }

  // Create coupon (seller/admin)
  async create(data: CouponFormFE): Promise<CouponFE> {
    const request = toBECreateCouponRequest(data);
    const couponBE = await apiService.post<CouponBE>(
      COUPON_ROUTES.LIST,
      request,
    );
    return toFECoupon(couponBE);
  }

  // Update coupon (owner/admin)
  async update(code: string, data: Partial<CouponFormFE>): Promise<CouponFE> {
    const request = toBEUpdateCouponRequest(data);
    const couponBE = await apiService.patch<CouponBE>(
      COUPON_ROUTES.BY_CODE(code),
      request,
    );
    return toFECoupon(couponBE);
  }

  // Delete coupon (owner/admin)
  async delete(code: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(COUPON_ROUTES.BY_CODE(code));
  }

  // Validate coupon
  async validate(data: ValidateCouponData): Promise<ValidateCouponResponse> {
    return apiService.post<ValidateCouponResponse>(
      COUPON_ROUTES.VALIDATE,
      data,
    );
  }

  // Check if coupon code is available (for form validation)
  async validateCode(
    code: string,
    shopId?: string,
  ): Promise<{ available: boolean; message?: string }> {
    const params = new URLSearchParams();
    params.append("code", code);
    if (shopId) params.append("shop_id", shopId);

    return apiService.get<{ available: boolean; message?: string }>(
      `/coupons/validate-code?${params.toString()}`,
    );
  }

  // Get public coupons (featured/active)
  async getPublic(shopId?: string): Promise<CouponFE[]> {
    const params = new URLSearchParams();
    if (shopId) params.append("shopId", shopId);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/coupons/public?${queryString}`
      : "/coupons/public";

    const couponsBE = await apiService.get<CouponBE[]>(endpoint);
    return toFECoupons(couponsBE);
  }

  /**
   * Bulk actions - supports: activate, deactivate, delete, update
   */
  async bulkAction(
    action: string,
    couponIds: string[],
    data?: any,
  ): Promise<BulkActionResponse> {
    try {
      const response = await apiService.post<BulkActionResponse>(
        COUPON_ROUTES.BULK,
        {
          action,
          couponIds,
          data,
        },
      );
      return response;
    } catch (error) {
      logServiceError("CouponsService", "bulkAction", error as Error);
      throw error;
    }
  }

  /**
   * Bulk activate coupons
   */
  async bulkActivate(couponIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("activate", couponIds);
  }

  /**
   * Bulk deactivate coupons
   */
  async bulkDeactivate(couponIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("deactivate", couponIds);
  }

  /**
   * Bulk delete coupons
   */
  async bulkDelete(couponIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("delete", couponIds);
  }

  /**
   * Bulk update coupons
   */
  async bulkUpdate(
    couponIds: string[],
    updates: Partial<CouponFormFE>,
  ): Promise<BulkActionResponse> {
    return this.bulkAction(
      "update",
      couponIds,
      toBEUpdateCouponRequest(updates),
    );
  }
}

export const couponsService = new CouponsService();
export type { ValidateCouponData, ValidateCouponResponse };

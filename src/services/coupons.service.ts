import { apiService } from "./api.service";
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
} from "@/types/shared/common.types";
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
    filters?: Partial<CouponFiltersBE>
  ): Promise<PaginatedResponseFE<CouponFE>> {
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
    const endpoint = queryString ? `/coupons?${queryString}` : "/coupons";

    const response = await apiService.get<PaginatedResponseBE<CouponBE>>(
      endpoint
    );

    return {
      data: toFECoupons(response.data),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      hasMore: response.hasMore,
    };
  }

  // Get coupon by ID
  async getById(id: string): Promise<CouponFE> {
    const couponBE = await apiService.get<CouponBE>(`/coupons/${id}`);
    return toFECoupon(couponBE);
  }

  // Get coupon by code
  async getByCode(code: string): Promise<CouponFE> {
    const couponBE = await apiService.get<CouponBE>(`/coupons/${code}`);
    return toFECoupon(couponBE);
  }

  // Create coupon (seller/admin)
  async create(data: CouponFormFE): Promise<CouponFE> {
    const request = toBECreateCouponRequest(data);
    const couponBE = await apiService.post<CouponBE>("/coupons", request);
    return toFECoupon(couponBE);
  }

  // Update coupon (owner/admin)
  async update(code: string, data: Partial<CouponFormFE>): Promise<CouponFE> {
    const request = toBEUpdateCouponRequest(data);
    const couponBE = await apiService.patch<CouponBE>(
      `/coupons/${code}`,
      request
    );
    return toFECoupon(couponBE);
  }

  // Delete coupon (owner/admin)
  async delete(code: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/coupons/${code}`);
  }

  // Validate coupon
  async validate(data: ValidateCouponData): Promise<ValidateCouponResponse> {
    return apiService.post<ValidateCouponResponse>("/coupons/validate", data);
  }

  // Check if coupon code is available (for form validation)
  async validateCode(
    code: string,
    shopId?: string
  ): Promise<{ available: boolean; message?: string }> {
    const params = new URLSearchParams();
    params.append("code", code);
    if (shopId) params.append("shop_id", shopId);

    return apiService.get<{ available: boolean; message?: string }>(
      `/coupons/validate-code?${params.toString()}`
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
}

export const couponsService = new CouponsService();
export type { ValidateCouponData, ValidateCouponResponse };

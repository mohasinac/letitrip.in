/**
 * @fileoverview Coupons Service - Extends BaseService
 * @module src/services/coupons.service
 * @description Coupon management service with CRUD and validation operations
 *
 * @pattern BaseService - Inherits common CRUD operations
 * @created 2025-12-05
 * @refactored 2026-01-08 - Migrated to BaseService pattern
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { COUPON_ROUTES } from "@/constants/api-routes";
import { logServiceError } from "@/lib/error-logger";
import type { CouponBE, CouponFiltersBE } from "@/types/backend/coupon.types";
import type { CouponFE, CouponFormFE } from "@/types/frontend/coupon.types";
import type { BulkActionResponse } from "@/types/shared/common.types";
import {
  toBECreateCouponRequest,
  toBEUpdateCouponRequest,
  toFECoupon,
  toFECoupons,
} from "@/types/transforms/coupon.transforms";
import { apiService } from "./api.service";
import { BaseService } from "./base.service";

// Remove old interfaces - now using types from type system

/**
 * ValidateCouponData interface
 *
 * @interface
 * @description Defines the structure and contract for ValidateCouponData
 */
interface ValidateCouponData {
  /** Code */
  code: string;
  /** Cart Total */
  cartTotal: number;
  /** Items */
  items: {
    /** Product Id */
    productId: string;
    /** Category Id */
    categoryId: string;
    /** Quantity */
    quantity: number;
    /** Price */
    price: number;
  }[];
}

/**
 * ValidateCouponResponse interface
 *
 * @interface
 * @description Defines the structure and contract for ValidateCouponResponse
 */
interface ValidateCouponResponse {
  /** Valid */
  valid: boolean;
  /** Discount */
  discount: number;
  /** Message */
  message?: string;
}

class CouponsService extends BaseService<
  CouponBE,
  CouponFE,
  CouponFormFE,
  CouponFiltersBE
> {
  protected endpoint = COUPON_ROUTES.LIST;
  protected entityName = "Coupon";

  protected toBE(form: CouponFormFE): Partial<CouponBE> {
    return toBECreateCouponRequest(form) as Partial<CouponBE>;
  }

  protected toFE(be: CouponBE): CouponFE {
    return toFECoupon(be);
  }

  // Note: list(), getById(), create(), update(), delete() inherited from BaseService

  async getByCode(code: string): Promise<CouponFE> {
    const couponBE = await apiService.get<CouponBE>(
      COUPON_ROUTES.BY_CODE(code)
    );
    return toFECoupon(couponBE);
  }

  // Validate coupon
  async validate(data: ValidateCouponData): Promise<ValidateCouponResponse> {
    return apiService.post<ValidateCouponResponse>(
      COUPON_ROUTES.VALIDATE,
      data
    );
  }

  // Check if coupon code is available (for form validation)
  async validateCode(
    /** Code */
    code: string,
    /** Shop Id */
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

  /**
   * Bulk actions - supports: activate, deactivate, delete, update
   */
  async bulkAction(
    /** Action */
    action: string,
    /** Coupon Ids */
    couponIds: string[],
    /** Data */
    data?: any
  ): Promise<BulkActionResponse> {
    try {
      const response = await apiService.post<BulkActionResponse>(
        COUPON_ROUTES.BULK,
        {
          action,
          couponIds,
          data,
        }
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
    /** Coupon Ids */
    couponIds: string[],
    /** Updates */
    updates: Partial<CouponFormFE>
  ): Promise<BulkActionResponse> {
    return this.bulkAction(
      "update",
      couponIds,
      toBEUpdateCouponRequest(updates)
    );
  }
}

export const couponsService = new CouponsService();
export type { ValidateCouponData, ValidateCouponResponse };

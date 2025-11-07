import { apiService } from './api.service';
import type { Coupon, CouponType, CouponStatus, PaginatedResponse } from '@/types';

interface CouponFilters {
  shopId?: string;
  type?: CouponType;
  status?: CouponStatus;
  search?: string;
  page?: number;
  limit?: number;
}

interface CreateCouponData {
  shopId: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  discountValue?: number;
  maxDiscountAmount?: number;
  tiers?: {
    minAmount: number;
    discountPercentage: number;
  }[];
  bogoConfig?: {
    buyQuantity: number;
    getQuantity: number;
    discountPercentage: number;
    applicableProducts?: string[];
  };
  minPurchaseAmount: number;
  minQuantity: number;
  applicability: 'all' | 'category' | 'product';
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  usageLimit?: number;
  usageLimitPerUser: number;
  startDate: Date;
  endDate: Date;
  firstOrderOnly: boolean;
  newUsersOnly: boolean;
  canCombineWithOtherCoupons: boolean;
  autoApply: boolean;
  isPublic: boolean;
  isFeatured: boolean;
}

interface UpdateCouponData extends Partial<CreateCouponData> {
  status?: CouponStatus;
}

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
  async list(filters?: CouponFilters): Promise<PaginatedResponse<Coupon>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/coupons?${queryString}` : '/coupons';
    
    return apiService.get<PaginatedResponse<Coupon>>(endpoint);
  }

  // Get coupon by ID
  async getById(id: string): Promise<Coupon> {
    return apiService.get<Coupon>(`/coupons/${id}`);
  }

  // Get coupon by code
  async getByCode(code: string): Promise<Coupon> {
    return apiService.get<Coupon>(`/coupons/${code}`);
  }

  // Create coupon (seller/admin)
  async create(data: CreateCouponData): Promise<Coupon> {
    return apiService.post<Coupon>('/coupons', data);
  }

  // Update coupon (owner/admin)
  async update(code: string, data: UpdateCouponData): Promise<Coupon> {
    return apiService.patch<Coupon>(`/coupons/${code}`, data);
  }

  // Delete coupon (owner/admin)
  async delete(code: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/coupons/${code}`);
  }

  // Validate coupon
  async validate(data: ValidateCouponData): Promise<ValidateCouponResponse> {
    return apiService.post<ValidateCouponResponse>('/coupons/validate', data);
  }

  // Get public coupons (featured/active)
  async getPublic(shopId?: string): Promise<Coupon[]> {
    const params = new URLSearchParams();
    if (shopId) params.append('shopId', shopId);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/coupons/public?${queryString}` : '/coupons/public';
    
    return apiService.get<Coupon[]>(endpoint);
  }
}

export const couponsService = new CouponsService();
export type {
  CouponFilters,
  CreateCouponData,
  UpdateCouponData,
  ValidateCouponData,
  ValidateCouponResponse,
};

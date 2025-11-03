/**
 * Coupon Controller
 * Handles business logic for coupon operations
 */

import { couponModel } from '../models/coupon.model';
import { Coupon } from '@/types';
import { AuthorizationError, ValidationError, NotFoundError } from '../middleware/error-handler';

interface UserContext {
  uid: string;
  role: 'user' | 'seller' | 'admin';
  sellerId?: string;
  email?: string;
}

class CouponController {
  /**
   * Get all coupons (admin only)
   */
  async getAllCouponsAdmin(
    filters: {
      status?: 'active' | 'inactive' | 'expired' | 'all';
      search?: string;
      limit?: number;
      offset?: number;
    },
    user: UserContext
  ): Promise<any[]> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Get coupons with seller information
    const coupons = await couponModel.findAllWithSellerInfo({
      status: filters.status || 'all',
      search: filters.search,
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    });

    return coupons;
  }

  /**
   * Get coupon by ID (admin only)
   */
  async getCouponByIdAdmin(id: string, user: UserContext): Promise<Coupon> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    const coupon = await couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    return coupon;
  }

  /**
   * Toggle coupon status (admin only)
   */
  async toggleCouponStatusAdmin(id: string, user: UserContext): Promise<Coupon> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    const updatedCoupon = await couponModel.toggleStatus(id);

    return updatedCoupon;
  }

  /**
   * Delete coupon (admin only)
   */
  async deleteCouponAdmin(id: string, user: UserContext): Promise<void> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    await couponModel.delete(id);
  }

  /**
   * Get seller coupons (seller only)
   */
  async getSellerCoupons(
    filters: {
      status?: 'active' | 'inactive' | 'expired' | 'all';
      search?: string;
      limit?: number;
      offset?: number;
    },
    user: UserContext
  ): Promise<Coupon[]> {
    // RBAC check
    if (user.role !== 'seller') {
      throw new AuthorizationError('Seller access required');
    }

    if (!user.sellerId) {
      throw new ValidationError('Seller ID not found');
    }

    const coupons = await couponModel.findAll({
      ...filters,
      sellerId: user.sellerId,
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    });

    return coupons;
  }

  /**
   * Create coupon (seller only)
   */
  async createCoupon(
    data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>,
    user: UserContext
  ): Promise<Coupon> {
    // RBAC check
    if (user.role !== 'seller') {
      throw new AuthorizationError('Seller access required');
    }

    if (!user.sellerId) {
      throw new ValidationError('Seller ID not found');
    }

    // Validate coupon data
    this.validateCouponData(data);

    // Add seller ID
    const couponData: any = {
      ...data,
      sellerId: user.sellerId,
      createdBy: user.uid,
      usedCount: 0,
    };

    const newCoupon = await couponModel.create(couponData);

    return newCoupon;
  }

  /**
   * Update coupon (seller only)
   */
  async updateCoupon(
    id: string,
    data: Partial<Coupon>,
    user: UserContext
  ): Promise<Coupon> {
    // RBAC check
    if (user.role !== 'seller') {
      throw new AuthorizationError('Seller access required');
    }

    if (!user.sellerId) {
      throw new ValidationError('Seller ID not found');
    }

    // Get existing coupon
    const existingCoupon = await couponModel.findById(id);
    if (!existingCoupon) {
      throw new NotFoundError('Coupon not found');
    }

    // Verify ownership
    if ((existingCoupon as any).sellerId !== user.sellerId) {
      throw new AuthorizationError('You can only update your own coupons');
    }

    // Validate coupon data if provided
    if (Object.keys(data).length > 0) {
      this.validateCouponData(data);
    }

    const updatedCoupon = await couponModel.update(id, data);

    return updatedCoupon;
  }

  /**
   * Toggle coupon status (seller only)
   */
  async toggleCouponStatus(id: string, user: UserContext): Promise<Coupon> {
    // RBAC check
    if (user.role !== 'seller') {
      throw new AuthorizationError('Seller access required');
    }

    if (!user.sellerId) {
      throw new ValidationError('Seller ID not found');
    }

    // Get existing coupon
    const existingCoupon = await couponModel.findById(id);
    if (!existingCoupon) {
      throw new NotFoundError('Coupon not found');
    }

    // Verify ownership
    if ((existingCoupon as any).sellerId !== user.sellerId) {
      throw new AuthorizationError('You can only update your own coupons');
    }

    const updatedCoupon = await couponModel.toggleStatus(id);

    return updatedCoupon;
  }

  /**
   * Delete coupon (seller only)
   */
  async deleteCoupon(id: string, user: UserContext): Promise<void> {
    // RBAC check
    if (user.role !== 'seller') {
      throw new AuthorizationError('Seller access required');
    }

    if (!user.sellerId) {
      throw new ValidationError('Seller ID not found');
    }

    // Get existing coupon
    const existingCoupon = await couponModel.findById(id);
    if (!existingCoupon) {
      throw new NotFoundError('Coupon not found');
    }

    // Verify ownership
    if ((existingCoupon as any).sellerId !== user.sellerId) {
      throw new AuthorizationError('You can only delete your own coupons');
    }

    await couponModel.delete(id);
  }

  /**
   * Validate coupon data
   */
  private validateCouponData(data: Partial<Coupon>): void {
    // Validate code
    if (data.code && !/^[A-Z0-9_-]+$/.test(data.code)) {
      throw new ValidationError(
        'Coupon code must contain only uppercase letters, numbers, hyphens, and underscores'
      );
    }

    // Validate value
    if (data.value !== undefined) {
      if (data.type === 'percentage' && (data.value < 0 || data.value > 100)) {
        throw new ValidationError('Percentage value must be between 0 and 100');
      }
      if (data.type === 'fixed' && data.value < 0) {
        throw new ValidationError('Fixed value must be positive');
      }
    }

    // Validate dates
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (start >= end) {
        throw new ValidationError('End date must be after start date');
      }
    }

    // Validate limits
    if (data.maxUses !== undefined && data.maxUses < 0) {
      throw new ValidationError('Maximum uses must be positive');
    }

    if (data.maxUsesPerUser !== undefined && data.maxUsesPerUser < 0) {
      throw new ValidationError('Maximum uses per user must be positive');
    }

    // Validate minimum/maximum amounts
    if (data.minimumAmount !== undefined && data.minimumAmount < 0) {
      throw new ValidationError('Minimum amount must be positive');
    }

    if (data.maximumAmount !== undefined && data.maximumAmount < 0) {
      throw new ValidationError('Maximum amount must be positive');
    }

    if (
      data.minimumAmount !== undefined &&
      data.maximumAmount !== undefined &&
      data.minimumAmount > data.maximumAmount
    ) {
      throw new ValidationError('Minimum amount cannot exceed maximum amount');
    }
  }
}

export const couponController = new CouponController();

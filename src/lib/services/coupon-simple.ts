/**
 * Coupon Management Service - Simplified Version
 */

import { getAdminDb } from '@/lib/firebase/admin';
import { 
  Coupon, 
  CouponUsage, 
  CouponValidationResult, 
  CartItem, 
  User 
} from '@/types';

// Simple UUID generator
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

class CouponService {
  private couponsCollection = 'coupons';
  private couponUsageCollection = 'coupon_usage';
  
  private get db() {
    return getAdminDb();
  }

  /**
   * Create a new coupon
   */
  async createCoupon(couponData: Omit<Coupon, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>): Promise<Coupon> {
    try {
      const couponId = generateId();
      const now = new Date().toISOString();

      const coupon: Coupon = {
        ...couponData,
        id: couponId,
        usedCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      // Basic validation
      if (!coupon.code || coupon.code.trim().length === 0) {
        throw new Error('Coupon code is required');
      }

      if (coupon.value <= 0) {
        throw new Error('Coupon value must be greater than 0');
      }

      // Check if code already exists
      const existingCoupon = await this.getCouponByCode(coupon.code);
      if (existingCoupon) {
        throw new Error('Coupon code already exists');
      }

      await this.db.collection(this.couponsCollection).doc(couponId).set(coupon);
      return coupon;
    } catch (error) {
      console.error('Create coupon error:', error);
      throw error;
    }
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<Coupon | null> {
    try {
      const snapshot = await this.db
        .collection(this.couponsCollection)
        .where('code', '==', code.toUpperCase())
        .limit(1)
        .get();

      return snapshot.empty ? null : (snapshot.docs[0].data() as Coupon);
    } catch (error) {
      console.error('Get coupon by code error:', error);
      throw new Error('Failed to retrieve coupon');
    }
  }

  /**
   * Get coupon by ID
   */
  async getCouponById(couponId: string): Promise<Coupon | null> {
    try {
      const doc = await this.db.collection(this.couponsCollection).doc(couponId).get();
      return doc.exists ? (doc.data() as Coupon) : null;
    } catch (error) {
      console.error('Get coupon by ID error:', error);
      throw new Error('Failed to retrieve coupon');
    }
  }

  /**
   * Validate coupon for a specific order
   */
  async validateCoupon(params: {
    code: string;
    userId: string;
    cartItems: CartItem[];
    subtotal: number;
    user?: User;
  }): Promise<CouponValidationResult> {
    try {
      const { code, userId, subtotal } = params;

      // Get coupon by code
      const coupon = await this.getCouponByCode(code);
      if (!coupon) {
        return { valid: false, error: 'Invalid coupon code' };
      }

      // Check if coupon is active
      if (coupon.status !== 'active') {
        return { valid: false, error: 'Coupon is not active' };
      }

      // Check if coupon has expired
      const now = new Date();
      const startDate = new Date(coupon.startDate);
      const endDate = new Date(coupon.endDate);

      if (now < startDate) {
        return { valid: false, error: 'Coupon is not yet valid' };
      }

      if (now > endDate) {
        return { valid: false, error: 'Coupon has expired' };
      }

      // Check total usage limit
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { valid: false, error: 'Coupon usage limit exceeded' };
      }

      // Check per-user usage limit
      if (coupon.maxUsesPerUser) {
        const userUsageCount = await this.getUserCouponUsageCount(coupon.id, userId);
        if (userUsageCount >= coupon.maxUsesPerUser) {
          return { valid: false, error: 'You have reached the usage limit for this coupon' };
        }
      }

      // Check minimum order amount
      if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
        return { 
          valid: false, 
          error: `Minimum order amount of ₹${coupon.minimumAmount} required` 
        };
      }

      // Calculate discount amount
      const discountAmount = this.calculateDiscount(coupon, subtotal);

      return {
        valid: true,
        coupon,
        discountAmount,
        warnings: [],
      };
    } catch (error) {
      console.error('Validate coupon error:', error);
      return { valid: false, error: 'Failed to validate coupon' };
    }
  }

  /**
   * Apply coupon to an order
   */
  async applyCoupon(params: {
    couponId: string;
    userId: string;
    orderId: string;
    discountAmount: number;
  }): Promise<CouponUsage> {
    try {
      const { couponId, userId, orderId, discountAmount } = params;

      const coupon = await this.getCouponById(couponId);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      // Create usage record
      const usageId = generateId();
      const usage: CouponUsage = {
        id: usageId,
        couponId,
        couponCode: coupon.code,
        userId,
        orderId,
        discountAmount,
        usedAt: new Date().toISOString(),
      };

      // Save usage record
      await this.db.collection(this.couponUsageCollection).doc(usageId).set(usage);

      // Update coupon usage count
      await this.db.collection(this.couponsCollection).doc(couponId).update({
        usedCount: coupon.usedCount + 1,
        updatedAt: new Date().toISOString(),
      });

      return usage;
    } catch (error) {
      console.error('Apply coupon error:', error);
      throw new Error('Failed to apply coupon');
    }
  }

  /**
   * Get all coupons
   */
  async getCoupons(params: {
    page?: number;
    pageSize?: number;
    status?: 'active' | 'inactive' | 'expired';
  } = {}): Promise<{ coupons: Coupon[]; total: number; page: number; pageSize: number }> {
    try {
      const { page = 1, pageSize = 20, status } = params;
      const offset = (page - 1) * pageSize;

      let query = this.db.collection(this.couponsCollection).orderBy('createdAt', 'desc');

      // Filter by status
      if (status) {
        if (status === 'expired') {
          query = query.where('endDate', '<', new Date().toISOString());
        } else {
          query = query.where('status', '==', status);
        }
      }

      // Apply pagination
      const snapshot = await query.offset(offset).limit(pageSize).get();
      const coupons = snapshot.docs.map((doc: any) => doc.data() as Coupon);

      // Get total count
      const totalSnapshot = await this.db.collection(this.couponsCollection).get();
      const total = totalSnapshot.size;

      return {
        coupons,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('Get coupons error:', error);
      throw new Error('Failed to retrieve coupons');
    }
  }

  /**
   * Get user's coupon usage count for a specific coupon
   */
  private async getUserCouponUsageCount(couponId: string, userId: string): Promise<number> {
    try {
      const snapshot = await this.db
        .collection(this.couponUsageCollection)
        .where('couponId', '==', couponId)
        .where('userId', '==', userId)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Get user coupon usage count error:', error);
      return 0;
    }
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(coupon: Coupon, subtotal: number): number {
    let discountAmount = 0;

    switch (coupon.type) {
      case 'fixed':
        discountAmount = coupon.value;
        break;

      case 'percentage':
        discountAmount = (subtotal * coupon.value) / 100;
        // Apply maximum discount limit if specified
        if (coupon.maximumAmount && discountAmount > coupon.maximumAmount) {
          discountAmount = coupon.maximumAmount;
        }
        break;

      case 'free_shipping':
        // This would typically be handled at the checkout level
        discountAmount = 0;
        break;

      default:
        discountAmount = 0;
    }

    // Ensure discount doesn't exceed subtotal
    return Math.min(discountAmount, subtotal);
  }

  /**
   * Update coupon
   */
  async updateCoupon(couponId: string, updates: Partial<Coupon>): Promise<Coupon> {
    try {
      const existingCoupon = await this.getCouponById(couponId);
      if (!existingCoupon) {
        throw new Error('Coupon not found');
      }

      const updatedCoupon: Coupon = {
        ...existingCoupon,
        ...updates,
        id: couponId,
        updatedAt: new Date().toISOString(),
      };

      await this.db.collection(this.couponsCollection).doc(couponId).set(updatedCoupon);
      return updatedCoupon;
    } catch (error) {
      console.error('Update coupon error:', error);
      throw error;
    }
  }

  /**
   * Delete coupon
   */
  async deleteCoupon(couponId: string): Promise<void> {
    try {
      await this.db.collection(this.couponsCollection).doc(couponId).delete();
    } catch (error) {
      console.error('Delete coupon error:', error);
      throw error;
    }
  }
}

export const couponService = new CouponService();

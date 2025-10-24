/**
 * Coupon Management Service
 */

import { getAdminDb } from '@/lib/firebase/admin';
import { 
  Coupon, 
  CouponUsage, 
  CouponValidationResult, 
  CartItem, 
  User 
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Get database instance
const db = getAdminDb();

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

      // Validate coupon data
      await this.validateCouponData(coupon);

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
   * Update an existing coupon
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
        id: couponId, // Ensure ID doesn't change
        usedCount: existingCoupon.usedCount, // Preserve usage count
        createdAt: existingCoupon.createdAt, // Preserve creation date
        updatedAt: new Date().toISOString(),
      };

      // Validate updated coupon data
      await this.validateCouponData(updatedCoupon);

      // If code is being changed, check if new code already exists
      if (updates.code && updates.code !== existingCoupon.code) {
        const existingWithNewCode = await this.getCouponByCode(updates.code);
        if (existingWithNewCode && existingWithNewCode.id !== couponId) {
          throw new Error('Coupon code already exists');
        }
      }

      await db.collection(this.couponsCollection).doc(couponId).update({...updatedCoupon});
      return updatedCoupon;
    } catch (error) {
      console.error('Update coupon error:', error);
      throw error;
    }
  }

  /**
   * Delete a coupon
   */
  async deleteCoupon(couponId: string): Promise<void> {
    try {
      const coupon = await this.getCouponById(couponId);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      // Delete the coupon
      await db.collection(this.couponsCollection).doc(couponId).delete();

      // Optionally keep usage history but mark coupon as deleted
      // You might want to soft delete instead for audit purposes
    } catch (error) {
      console.error('Delete coupon error:', error);
      throw error;
    }
  }

  /**
   * Get coupon by ID
   */
  async getCouponById(couponId: string): Promise<Coupon | null> {
    try {
      const doc = await db.collection(this.couponsCollection).doc(couponId).get();
      return doc.exists ? (doc.data() as Coupon) : null;
    } catch (error) {
      console.error('Get coupon by ID error:', error);
      throw new Error('Failed to retrieve coupon');
    }
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<Coupon | null> {
    try {
      const snapshot = await db
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
   * Get all coupons with pagination
   */
  async getCoupons(params: {
    page?: number;
    pageSize?: number;
    status?: 'active' | 'inactive' | 'expired';
    search?: string;
  } = {}): Promise<{ coupons: Coupon[]; total: number; page: number; pageSize: number }> {
    try {
      const { page = 1, pageSize = 20, status, search } = params;
      const offset = (page - 1) * pageSize;

      let query = db.collection(this.couponsCollection).orderBy('createdAt', 'desc');

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
      let coupons = snapshot.docs.map(doc => doc.data() as Coupon);

      // Apply search filter (in-memory since Firestore doesn't support full-text search)
      if (search) {
        const searchLower = search.toLowerCase();
        coupons = coupons.filter(coupon => 
          coupon.code.toLowerCase().includes(searchLower) ||
          coupon.name.toLowerCase().includes(searchLower) ||
          (coupon.description && coupon.description.toLowerCase().includes(searchLower))
        );
      }

      // Get total count
      const totalSnapshot = await db.collection(this.couponsCollection).get();
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
      const { code, userId, cartItems, subtotal, user } = params;

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
        const userUsageCount = await this.getUserCouponUsageCount(coupon.id!, userId);
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

      // Check user restrictions
      if (coupon.restrictions) {
        const validationResult = await this.validateUserRestrictions(coupon, userId, user);
        if (!validationResult.valid) {
          return validationResult;
        }
      }

      // Check product/category restrictions
      const productValidation = await this.validateProductRestrictions(coupon, cartItems);
      if (!productValidation.valid) {
        return productValidation;
      }

      // Calculate discount amount
      const discountAmount = await this.calculateDiscount(coupon, cartItems, subtotal);

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
      const usageId = uuidv4();
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
      await db.collection(this.couponUsageCollection).doc(usageId).set(usage);

      // Update coupon usage count
      await db.collection(this.couponsCollection).doc(couponId).update({
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
   * Get coupon usage history
   */
  async getCouponUsage(couponId: string, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;

      const snapshot = await db
        .collection(this.couponUsageCollection)
        .where('couponId', '==', couponId)
        .orderBy('usedAt', 'desc')
        .offset(offset)
        .limit(pageSize)
        .get();

      const usage = snapshot.docs.map(doc => doc.data() as CouponUsage);

      return {
        usage,
        page,
        pageSize,
        total: snapshot.size,
      };
    } catch (error) {
      console.error('Get coupon usage error:', error);
      throw new Error('Failed to retrieve coupon usage');
    }
  }

  /**
   * Get user's coupon usage count for a specific coupon
   */
  private async getUserCouponUsageCount(couponId: string, userId: string): Promise<number> {
    try {
      const snapshot = await db
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
   * Validate coupon data
   */
  private async validateCouponData(coupon: Coupon): Promise<void> {
    // Basic validation
    if (!coupon.code || coupon.code.trim().length === 0) {
      throw new Error('Coupon code is required');
    }

    if (!coupon.name || coupon.name.trim().length === 0) {
      throw new Error('Coupon name is required');
    }

    if (coupon.value <= 0) {
      throw new Error('Coupon value must be greater than 0');
    }

    if (coupon.type === 'percentage' && coupon.value > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }

    // Date validation
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }

    // Usage limits validation
    if (coupon.maxUses && coupon.maxUses <= 0) {
      throw new Error('Maximum uses must be greater than 0');
    }

    if (coupon.maxUsesPerUser && coupon.maxUsesPerUser <= 0) {
      throw new Error('Maximum uses per user must be greater than 0');
    }
  }

  /**
   * Validate user restrictions
   */
  private async validateUserRestrictions(
    coupon: Coupon, 
    userId: string, 
    user?: User
  ): Promise<CouponValidationResult> {
    if (!coupon.restrictions) {
      return { valid: true };
    }

    const { restrictions } = coupon;

    // Check if it's for first-time users only
    if (restrictions.firstTimeOnly) {
      // You would need to implement logic to check if this is user's first order
      // This is a simplified example
      const orderCount = await this.getUserOrderCount(userId);
      if (orderCount > 0) {
        return { valid: false, error: 'This coupon is only valid for first-time customers' };
      }
    }

    // Check new customers only (similar to first-time)
    if (restrictions.newCustomersOnly) {
      const userCreatedAt = user?.createdAt ? new Date(user.createdAt) : new Date();
      const daysSinceJoined = (Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceJoined > 30) { // Consider new customer if joined within 30 days
        return { valid: false, error: 'This coupon is only valid for new customers' };
      }
    }

    // Check existing customers only
    if (restrictions.existingCustomersOnly) {
      const orderCount = await this.getUserOrderCount(userId);
      if (orderCount === 0) {
        return { valid: false, error: 'This coupon is only valid for existing customers' };
      }
    }

    return { valid: true };
  }

  /**
   * Validate product/category restrictions
   */
  private async validateProductRestrictions(
    coupon: Coupon, 
    cartItems: CartItem[]
  ): Promise<CouponValidationResult> {
    // If no restrictions, coupon applies to all products
    if (!coupon.applicableProducts?.length && !coupon.applicableCategories?.length) {
      return { valid: true };
    }

    // Check if any cart items are applicable
    let hasApplicableItems = false;

    for (const item of cartItems) {
      // Check applicable products
      if (coupon.applicableProducts?.includes(item.productId)) {
        hasApplicableItems = true;
        break;
      }

      // Check excluded products
      if (coupon.excludeProducts?.includes(item.productId)) {
        continue;
      }

      // You would need to implement category checking logic here
      // This requires fetching product data to get category information
    }

    if (!hasApplicableItems && (coupon.applicableProducts?.length || coupon.applicableCategories?.length)) {
      return { valid: false, error: 'This coupon is not applicable to items in your cart' };
    }

    return { valid: true };
  }

  /**
   * Calculate discount amount
   */
  private async calculateDiscount(coupon: Coupon, cartItems: CartItem[], subtotal: number): Promise<number> {
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
        // Return 0 here and handle shipping discount separately
        discountAmount = 0;
        break;

      case 'bogo':
        // Buy One Get One logic - simplified example
        // You would need more complex logic based on your requirements
        const applicableItems = cartItems.filter(item => 
          !coupon.applicableProducts?.length || 
          coupon.applicableProducts.includes(item.productId)
        );
        
        if (applicableItems.length >= 2) {
          // Get the cheapest applicable item for free
          const cheapestItem = applicableItems.reduce((min, item) => 
            item.price < min.price ? item : min
          );
          discountAmount = cheapestItem.price;
        }
        break;

      default:
        discountAmount = 0;
    }

    // Ensure discount doesn't exceed subtotal
    return Math.min(discountAmount, subtotal);
  }

  /**
   * Get user order count (helper method)
   */
  private async getUserOrderCount(userId: string): Promise<number> {
    try {
      const snapshot = await db
        .collection('orders')
        .where('userId', '==', userId)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Get user order count error:', error);
      return 0;
    }
  }

  /**
   * Automatically expire coupons
   */
  async expireCoupons(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      const snapshot = await db
        .collection(this.couponsCollection)
        .where('status', '==', 'active')
        .where('endDate', '<', now)
        .get();

      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { 
          status: 'expired',
          updatedAt: now 
        });
      });

      await batch.commit();
      
      console.log(`Expired ${snapshot.size} coupons`);
    } catch (error) {
      console.error('Expire coupons error:', error);
    }
  }
}

export const couponService = new CouponService();

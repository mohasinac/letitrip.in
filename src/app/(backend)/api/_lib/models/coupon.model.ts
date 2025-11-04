/**
 * Coupon Model
 * Handles coupon management, validation, and usage tracking
 */

import { getAdminDb } from '../database/admin';
import { Coupon } from "@/types/shared";
import { NotFoundError, ValidationError, ConflictError } from '../middleware/error-handler';

export class CouponModel {
  private collection = getAdminDb().collection('coupons');

  /**
   * Get all coupons with optional filtering
   */
  async findAll(filters?: {
    status?: 'active' | 'inactive' | 'expired' | 'all';
    search?: string;
    sellerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Coupon[]> {
    let query: any = this.collection.orderBy('createdAt', 'desc');

    // Filter by seller
    if (filters?.sellerId) {
      query = query.where('sellerId', '==', filters.sellerId);
    }

    // Filter by status
    if (filters?.status && filters.status !== 'all') {
      if (filters.status === 'active') {
        query = query.where('isActive', '==', true);
      } else if (filters.status === 'inactive') {
        query = query.where('isActive', '==', false);
      } else if (filters.status === 'expired') {
        query = query.where('expiresAt', '<=', new Date().toISOString());
      }
    }

    // Pagination
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    let coupons: Coupon[] = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Coupon[];

    // Apply search filter (client-side)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      coupons = coupons.filter(
        (coupon) =>
          coupon.code?.toLowerCase().includes(searchLower) ||
          coupon.name?.toLowerCase().includes(searchLower)
      );
    }

    return coupons;
  }

  /**
   * Get coupon by ID
   */
  async findById(id: string): Promise<Coupon | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Coupon;
  }

  /**
   * Get coupon by code
   */
  async findByCode(code: string): Promise<Coupon | null> {
    const snapshot = await this.collection
      .where('code', '==', code.toUpperCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Coupon;
  }

  /**
   * Create a new coupon
   */
  async create(data: Omit<Coupon, 'id'>): Promise<Coupon> {
    // Check for duplicate code
    const existingCoupon = await this.findByCode(data.code);
    if (existingCoupon) {
      throw new ConflictError(`Coupon code '${data.code}' already exists`);
    }

    const docRef = await this.collection.add({
      ...data,
      code: data.code.toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const newCoupon = await this.findById(docRef.id);
    if (!newCoupon) {
      throw new Error('Failed to retrieve created coupon');
    }

    return newCoupon;
  }

  /**
   * Update a coupon
   */
  async update(id: string, data: Partial<Coupon>): Promise<Coupon> {
    const coupon = await this.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    // If code is being changed, check for duplicates
    if (data.code && data.code !== coupon.code) {
      const existingCoupon = await this.findByCode(data.code);
      if (existingCoupon && existingCoupon.id !== id) {
        throw new ConflictError(`Coupon code '${data.code}' already exists`);
      }
    }

    const updateData = {
      ...data,
      code: data.code ? data.code.toUpperCase() : coupon.code,
      updatedAt: new Date().toISOString(),
    };

    await this.collection.doc(id).update(updateData);

    const updatedCoupon = await this.findById(id);
    if (!updatedCoupon) {
      throw new Error('Failed to retrieve updated coupon');
    }

    return updatedCoupon;
  }

  /**
   * Toggle coupon active status
   */
  async toggleStatus(id: string): Promise<Coupon> {
    const coupon = await this.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    const newStatus = !(coupon as any).isActive;
    await this.collection.doc(id).update({
      isActive: newStatus,
      updatedAt: new Date().toISOString(),
    });

    const updatedCoupon = await this.findById(id);
    if (!updatedCoupon) {
      throw new Error('Failed to retrieve updated coupon');
    }

    return updatedCoupon;
  }

  /**
   * Delete a coupon
   */
  async delete(id: string): Promise<void> {
    const coupon = await this.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    await this.collection.doc(id).delete();
  }

  /**
   * Increment usage count
   */
  async incrementUsage(id: string): Promise<void> {
    const coupon = await this.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    await this.collection.doc(id).update({
      usedCount: (coupon.usedCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Get coupon usage count for a user
   */
  async getUserUsageCount(couponId: string, userId: string): Promise<number> {
    const usageSnapshot = await getAdminDb()
      .collection('couponUsages')
      .where('couponId', '==', couponId)
      .where('userId', '==', userId)
      .get();

    return usageSnapshot.size;
  }

  /**
   * Record coupon usage
   */
  async recordUsage(data: {
    couponId: string;
    couponCode: string;
    userId: string;
    orderId: string;
    discountAmount: number;
  }): Promise<void> {
    await getAdminDb().collection('couponUsages').add({
      ...data,
      usedAt: new Date().toISOString(),
    });

    await this.incrementUsage(data.couponId);
  }

  /**
   * Get coupons with seller information
   */
  async findAllWithSellerInfo(filters?: {
    status?: 'active' | 'inactive' | 'expired' | 'all';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const coupons = await this.findAll(filters);
    const db = getAdminDb();

    const couponsWithSeller = await Promise.all(
      coupons.map(async (coupon: any) => {
        if (coupon.sellerId) {
          try {
            const sellerDoc = await db.collection('users').doc(coupon.sellerId).get();
            const sellerData = sellerDoc.data();

            let shopName = 'Unknown Shop';
            if (sellerData?.shopId) {
              const shopDoc = await db.collection('shops').doc(sellerData.shopId).get();
              shopName = shopDoc.data()?.name || 'Unknown Shop';
            }

            return {
              ...coupon,
              sellerEmail: sellerData?.email || 'Unknown',
              shopName,
            };
          } catch (error) {
            return {
              ...coupon,
              sellerEmail: 'Unknown',
              shopName: 'Unknown Shop',
            };
          }
        }
        return coupon;
      })
    );

    return couponsWithSeller;
  }
}

export const couponModel = new CouponModel();

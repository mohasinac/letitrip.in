/**
 * Coupons Repository
 *
 * Manages coupon creation, validation, and usage tracking
 */

import { BaseRepository } from "./base.repository";
import {
  COUPONS_COLLECTION,
  COUPON_USAGE_SUBCOLLECTION,
  CouponDocument,
  CouponUsageDocument,
  CouponCreateInput,
  CouponUpdateInput,
  CouponType,
  isValidCouponCode,
  isCouponValid,
  canUserUseCoupon,
  calculateDiscount,
  createCouponId,
} from "@/db/schema/coupons";
import { USER_COLLECTION } from "@/db/schema/users";
import { DatabaseError } from "@/lib/errors";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Repository for coupon management
 */
class CouponsRepository extends BaseRepository<CouponDocument> {
  constructor() {
    super(COUPONS_COLLECTION);
  }

  /**
   * Create new coupon with SEO-friendly ID based on code
   */
  async create(input: CouponCreateInput): Promise<CouponDocument> {
    // Generate coupon ID from code
    const code = input.code || "COUPON";
    const id = createCouponId(code);

    const couponData = {
      ...input,
      stats: {
        totalUses: 0,
        totalRevenue: 0,
        totalDiscount: 0,
      },
      code: code.toUpperCase(), // Normalize to uppercase
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db
      .collection(this.collection)
      .doc(id)
      .set(prepareForFirestore(couponData));

    return { id, ...couponData } as CouponDocument;
  }

  /**
   * Get coupon by code
   *
   * @param code - Coupon code (case-insensitive)
   * @returns Promise<CouponDocument | null>
   */
  async getCouponByCode(code: string): Promise<CouponDocument | null> {
    try {
      const upperCode = code.toUpperCase();
      const snapshot = await this.db
        .collection(this.collection)
        .where("code", "==", upperCode)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CouponDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve coupon by code: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get all active coupons
   *
   * @returns Promise<CouponDocument[]>
   */
  async getActiveCoupons(): Promise<CouponDocument[]> {
    try {
      const now = new Date();
      const snapshot = await this.db
        .collection(this.collection)
        .where("validity.isActive", "==", true)
        .get();

      // Filter by date range (Firestore doesn't support compound queries on nested fields)
      const coupons = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as CouponDocument)
        .filter((coupon) => isCouponValid(coupon));

      return coupons;
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve active coupons: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get coupons by type
   *
   * @param type - Coupon type
   * @returns Promise<CouponDocument[]>
   */
  async getCouponsByType(type: CouponType): Promise<CouponDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("type", "==", type)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CouponDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve coupons by type: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get coupons created by specific user
   *
   * @param userId - Creator user ID
   * @returns Promise<CouponDocument[]>
   */
  async getCouponsByCreator(userId: string): Promise<CouponDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("createdBy", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CouponDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve coupons by creator: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get coupons expiring soon (within specified days)
   *
   * @param days - Number of days to look ahead
   * @returns Promise<CouponDocument[]>
   */
  async getCouponsExpiringSoon(days: number = 7): Promise<CouponDocument[]> {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const snapshot = await this.db
        .collection(this.collection)
        .where("validity.isActive", "==", true)
        .get();

      // Filter by expiration date
      const coupons = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as CouponDocument)
        .filter((coupon) => {
          const endDate = coupon.validity.endDate;
          return endDate && endDate > now && endDate <= futureDate;
        });

      return coupons;
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve expiring coupons: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Validate coupon code (format and availability)
   *
   * @param code - Coupon code to validate
   * @param userId - User ID attempting to use coupon
   * @param orderTotal - Order total amount (for validation)
   * @returns Promise<{valid: boolean, coupon?: CouponDocument, message?: string}>
   */
  async validateCoupon(
    code: string,
    userId: string,
    orderTotal: number,
  ): Promise<{
    valid: boolean;
    coupon?: CouponDocument;
    discountAmount?: number;
    message?: string;
  }> {
    // Validate code format
    if (!isValidCouponCode(code)) {
      return {
        valid: false,
        message: "Invalid coupon code format",
      };
    }

    // Get coupon from database
    const coupon = await this.getCouponByCode(code);
    if (!coupon) {
      return {
        valid: false,
        message: "Coupon not found",
      };
    }

    // Check if coupon is valid (active, date range, usage limits)
    if (!isCouponValid(coupon)) {
      return {
        valid: false,
        coupon,
        message: "Coupon is not currently valid",
      };
    }

    // Check minimum purchase requirement
    if (
      coupon.discount.minPurchase &&
      orderTotal < coupon.discount.minPurchase
    ) {
      return {
        valid: false,
        coupon,
        message: `Minimum purchase of $${coupon.discount.minPurchase} required`,
      };
    }

    // Check user-specific usage limit
    const userUsageCount = await this.getUserCouponUsageCount(
      userId,
      coupon.id,
    );
    if (!canUserUseCoupon(coupon, userUsageCount)) {
      return {
        valid: false,
        coupon,
        message: "You have reached the usage limit for this coupon",
      };
    }

    // Calculate discount
    const discountAmount = calculateDiscount(coupon, orderTotal);

    return {
      valid: true,
      coupon,
      discountAmount,
      message: "Coupon is valid",
    };
  }

  /**
   * Apply coupon to order (increment usage counters)
   *
   * @param couponId - Coupon ID
   * @param userId - User ID
   * @param orderId - Order ID
   * @param discountAmount - Applied discount amount
   * @returns Promise<void>
   */
  async applyCoupon(
    couponId: string,
    userId: string,
    orderId: string,
    discountAmount: number,
  ): Promise<void> {
    try {
      const batch = this.db.batch();

      // Update coupon usage stats
      const couponRef = this.db.collection(this.collection).doc(couponId);
      batch.update(couponRef, {
        "usage.currentUsage": FieldValue.increment(1),
        "stats.totalDiscountGiven": FieldValue.increment(discountAmount),
        "stats.totalOrders": FieldValue.increment(1),
        updatedAt: new Date(),
      });

      // Create user coupon usage record
      const usageData = {
        userId,
        couponCode: "", // Will be filled by getCouponByCode
        orderId,
        discountAmount,
        usedAt: new Date(),
      } as any;

      const usageRef = this.db
        .collection(USER_COLLECTION)
        .doc(userId)
        .collection(COUPON_USAGE_SUBCOLLECTION)
        .doc(couponId);

      batch.set(usageRef, prepareForFirestore(usageData));

      await batch.commit();
    } catch (error) {
      throw new DatabaseError(
        `Failed to apply coupon: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get user's coupon usage count for a specific coupon
   *
   * @param userId - User ID
   * @param couponId - Coupon ID
   * @returns Promise<number>
   */
  async getUserCouponUsageCount(
    userId: string,
    couponId: string,
  ): Promise<number> {
    try {
      const doc = await this.db
        .collection(USER_COLLECTION)
        .doc(userId)
        .collection(COUPON_USAGE_SUBCOLLECTION)
        .doc(couponId)
        .get();

      return doc.exists ? 1 : 0; // Document exists = used once (per our schema)
    } catch {
      return 0;
    }
  }

  /**
   * Get user's coupon usage history
   *
   * @param userId - User ID
   * @returns Promise<CouponUsageDocument[]>
   */
  async getUserCouponHistory(userId: string): Promise<CouponUsageDocument[]> {
    try {
      const snapshot = await this.db
        .collection(USER_COLLECTION)
        .doc(userId)
        .collection(COUPON_USAGE_SUBCOLLECTION)
        .orderBy("usedAt", "desc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CouponUsageDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve coupon history: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Deactivate a coupon
   *
   * @param couponId - Coupon ID to deactivate
   * @returns Promise<CouponDocument>
   */
  async deactivateCoupon(couponId: string): Promise<CouponDocument> {
    try {
      await this.db.collection(this.collection).doc(couponId).update({
        "validity.isActive": false,
        updatedAt: new Date(),
      });

      return await this.findByIdOrFail(couponId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to deactivate coupon: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Reactivate a coupon
   *
   * @param couponId - Coupon ID to reactivate
   * @returns Promise<CouponDocument>
   */
  async reactivateCoupon(couponId: string): Promise<CouponDocument> {
    try {
      await this.db.collection(this.collection).doc(couponId).update({
        "validity.isActive": true,
        updatedAt: new Date(),
      });

      return await this.findByIdOrFail(couponId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to reactivate coupon: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

// Export singleton instance
export const couponsRepository = new CouponsRepository();

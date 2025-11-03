import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../_lib/database/admin';
import { DiscountCalculator, CartItem } from '@/lib/utils/discountCalculator';
import { SellerCoupon } from '@/types';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../_lib/middleware/error-handler';

/**
 * Helper function to verify seller authentication
 */
async function verifySellerAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'seller' && role !== 'admin') {
      throw new AuthorizationError('Seller access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'seller' | 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * POST /api/seller/coupons/validate
 * Validate and calculate discount for a coupon with cart items
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const db = getAdminDb();

    // Parse request body
    const body = await request.json();
    const { couponCode, cartItems, cartSubtotal } = body;

    if (!couponCode || !cartItems || cartSubtotal === undefined) {
      throw new ValidationError(
        'Missing required fields: couponCode, cartItems, cartSubtotal'
      );
    }

    // Find the coupon
    const couponSnapshot = await db
      .collection('coupons')
      .where('code', '==', couponCode.toUpperCase())
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (couponSnapshot.empty) {
      throw new NotFoundError('Coupon not found or inactive');
    }

    const couponDoc = couponSnapshot.docs[0];
    const couponData = couponDoc.data() as SellerCoupon;
    const coupon: SellerCoupon = {
      ...couponData,
      id: couponDoc.id,
    };

    // Check if coupon has expired
    if (!coupon.isPermanent && coupon.endDate) {
      const endDate = new Date(coupon.endDate);
      if (endDate < new Date()) {
        throw new ValidationError('Coupon has expired');
      }
    }

    // Check if coupon has started
    if (coupon.startDate) {
      const startDate = new Date(coupon.startDate);
      if (startDate > new Date()) {
        throw new ValidationError('Coupon is not yet active');
      }
    }

    // Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new ValidationError('Coupon usage limit reached');
    }

    // Apply the coupon using DiscountCalculator
    const result = DiscountCalculator.applyCoupon(
      coupon,
      cartItems,
      cartSubtotal
    );

    if (!result.success) {
      throw new ValidationError(result.message || 'Coupon cannot be applied');
    }

    // Get human-readable description
    const description = DiscountCalculator.getCouponDescription(coupon);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: description,
      },
      discount: {
        amount: result.discountAmount,
        itemDiscounts: result.itemDiscounts,
        details: result.details,
      },
      message: result.message,
    });
  } catch (error: any) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

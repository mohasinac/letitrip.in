/**
 * Admin Coupon Toggle Status API
 * POST /api/admin/coupons/[id]/toggle - Toggle coupon status
 */

import { NextRequest, NextResponse } from 'next/server';
import { couponController } from '../../../../_lib/controllers/coupon.controller';
import { getAdminAuth } from '../../../../_lib/database/admin';
import { AuthorizationError, NotFoundError, ValidationError } from '../../../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */


  

/**
 * POST /api/admin/coupons/[id]/toggle
 * Toggle coupon active status
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await verifyAdminSession(request);

    // Get coupon ID from params
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    // Toggle coupon status using controller
    const updatedCoupon = await couponController.toggleCouponStatusAdmin(id, user);

    return NextResponse.json({
      message: 'Coupon status updated successfully',
      isActive: (updatedCoupon as any).isActive,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/coupons/[id]/toggle:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to toggle coupon status' },
      { status: 500 }
    );
  }
}

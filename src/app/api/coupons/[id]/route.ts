/**
 * Individual Coupon API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { couponService } from '@/lib/services/coupon';
import { getAdminAuth } from '@/lib/database/admin';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/config/api';

// GET: Get coupon by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const coupon = await couponService.getCouponById(id);
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT: Update coupon (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const token = authHeader.split(' ')[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user is admin
    const userRecord = await auth.getUser(decodedToken.uid);
    if (!userRecord.customClaims?.role || userRecord.customClaims.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.FORBIDDEN },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const updates = await request.json();
    const coupon = await couponService.updateCoupon(id, updates);

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error: any) {
    console.error('Update coupon error:', error);
    return NextResponse.json(
      { success: false, error: error.message || ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}

// DELETE: Delete coupon (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const token = authHeader.split(' ')[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user is admin
    const userRecord = await auth.getUser(decodedToken.uid);
    if (!userRecord.customClaims?.role || userRecord.customClaims.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.FORBIDDEN },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    await couponService.deleteCoupon(id);

    return NextResponse.json({
      success: true,
      data: { message: 'Coupon deleted successfully' },
    });
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    return NextResponse.json(
      { success: false, error: error.message || ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}

/**
 * Coupons API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { couponService } from '@/lib/services/coupon';
import { getAdminAuth } from '@/lib/firebase/admin';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/config/api';

// GET: List all coupons (Admin only)
export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status') as 'active' | 'inactive' | 'expired' | undefined;

    const result = await couponService.getCoupons({ page, pageSize, status });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// POST: Create new coupon (Admin only)
export async function POST(request: NextRequest) {
  try {
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

    const couponData = await request.json();
    
    // Add creator information
    couponData.createdBy = decodedToken.uid;
    
    const coupon = await couponService.createCoupon(couponData);

    return NextResponse.json({
      success: true,
      data: coupon,
    }, { status: HTTP_STATUS.CREATED });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    return NextResponse.json(
      { success: false, error: error.message || ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}

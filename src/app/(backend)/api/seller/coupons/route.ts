import { NextRequest, NextResponse } from 'next/server';
import { verifySellerSession } from '../../_lib/auth/admin-auth';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../_lib/middleware/error-handler';
import { couponController } from '../../_lib/controllers/coupon.controller';



/**
 * GET /api/seller/coupons - List all coupons for the authenticated seller
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySellerSession(request);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Use controller to get coupons
    const coupons = await couponController.getSellerCoupons(
      {
        status: status as any,
        search,
        limit,
        offset,
      },
      { uid: session.userId, role: session.role, email: session.email }
    );

    return NextResponse.json({
      success: true,
      coupons,
      total: coupons.length,
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

    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/coupons - Create a new coupon
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySellerSession(request);

    // Parse request body
    const body = await request.json();

    // Use controller to create coupon
    const coupon = await couponController.createCoupon(body, { uid: session.userId, role: session.role, email: session.email });

    return NextResponse.json(
      {
        success: true,
        message: 'Coupon created successfully',
        coupon,
      },
      { status: 201 }
    );
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

    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

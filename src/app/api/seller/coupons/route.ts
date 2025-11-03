import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../_lib/database/admin';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../_lib/middleware/error-handler';
import { couponController } from '../../_lib/controllers/coupon.controller';

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
      sellerId: decodedToken.uid, // For sellers, sellerId === uid
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * GET /api/seller/coupons - List all coupons for the authenticated seller
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);

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
      seller
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
    const seller = await verifySellerAuth(request);

    // Parse request body
    const body = await request.json();

    // Use controller to create coupon
    const coupon = await couponController.createCoupon(body, seller);

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

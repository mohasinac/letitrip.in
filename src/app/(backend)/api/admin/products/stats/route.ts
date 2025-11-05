/**
 * Admin Product Stats API
 * GET /api/admin/products/stats - Get product statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { productController } from '../../../_lib/controllers/product.controller';
import { verifyAdminSession } from '../../../_lib/auth/admin-auth';
import { AuthorizationError } from '../../../_lib/middleware/error-handler';

/**
 * GET /api/admin/products/stats
 * Get product statistics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using session
    const session = await verifyAdminSession(request);

    // Get stats using controller
    const stats = await productController.getProductStatsAdmin({
      uid: session.userId,
      role: session.role,
      email: session.email,
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/products/stats:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get product stats' },
      { status: 500 }
    );
  }
}

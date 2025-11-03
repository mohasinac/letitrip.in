/**
 * Reject Review API Route - POST
 * 
 * POST: Reject a review with reason (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { rejectReview } from '../../../_lib/controllers/review.controller';
import { authenticateUser } from '../../../_lib/auth/middleware';
import { 
  ValidationError,
  AuthorizationError, 
  NotFoundError 
} from '../../../_lib/middleware/error-handler';

/**
 * POST /api/reviews/[id]/reject
 * Protected endpoint - Reject review
 * Authorization: Admin only
 * Body: { reason: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can reject reviews
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can reject reviews' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { reason } = body;

    // Validate reason
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Fetch user data
    const { getAdminDb } = await import('../../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Reject review using controller
    const review = await rejectReview(id, reason.trim(), {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review rejected successfully',
    });

  } catch (error: any) {
    console.error('Error in POST /api/reviews/[id]/reject:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reject review' },
      { status: 500 }
    );
  }
}

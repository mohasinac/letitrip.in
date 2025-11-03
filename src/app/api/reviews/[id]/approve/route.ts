/**
 * Approve Review API Route - POST
 * 
 * POST: Approve a review (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { approveReview } from '../../../_lib/controllers/review.controller';
import { authenticateUser } from '../../../_lib/auth/middleware';
import { 
  AuthorizationError, 
  NotFoundError 
} from '../../../_lib/middleware/error-handler';

/**
 * POST /api/reviews/[id]/approve
 * Protected endpoint - Approve review
 * Authorization: Admin only
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

    // Only admins can approve reviews
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can approve reviews' },
        { status: 403 }
      );
    }

    // Fetch user data
    const { getAdminDb } = await import('../../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Approve review using controller
    const review = await approveReview(id, {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review approved successfully',
    });

  } catch (error: any) {
    console.error('Error in POST /api/reviews/[id]/approve:', error);
    
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
      { success: false, error: error.message || 'Failed to approve review' },
      { status: 500 }
    );
  }
}

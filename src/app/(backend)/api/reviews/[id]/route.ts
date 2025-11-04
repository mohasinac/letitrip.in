/**
 * Review by ID API Route - GET, PUT, DELETE
 * 
 * GET: View review details (public for approved, owner/admin for others)
 * PUT: Update review (owner only, pending reviews only)
 * DELETE: Delete review (owner or admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getReviewById, 
  updateReview, 
  deleteReview 
} from '../../_lib/controllers/review.controller';
import { authenticateUser } from '../../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../../_lib/middleware/error-handler';

/**
 * GET /api/reviews/[id]
 * Public endpoint (filtered) - Get review by ID
 */
export async function GET(
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

    // Try to authenticate (optional)
    const user = await authenticateUser(request);

    // Fetch user data if authenticated
    let userContext;
    if (user) {
      const { getAdminDb } = await import('../../_lib/database/admin');
      const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
      const userData = userDoc.data();
      
      userContext = {
        userId: user.userId,
        role: user.role as 'admin' | 'seller' | 'user',
        email: userData?.email,
      };
    }

    // Get review using controller
    const review = await getReviewById(id, userContext);

    return NextResponse.json({
      success: true,
      data: review,
    });

  } catch (error: any) {
    console.error('Error in GET /api/reviews/[id]:', error);
    
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews/[id]
 * Protected endpoint - Update review
 * Authorization: Owner only, pending reviews only
 */
export async function PUT(
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

    // Get request body
    const body = await request.json();

    // Fetch user data
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Update review using controller
    const review = await updateReview(id, body, {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review updated successfully',
    });

  } catch (error: any) {
    console.error('Error in PUT /api/reviews/[id]:', error);
    
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
      { success: false, error: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 * Protected endpoint - Delete review
 * Authorization: Owner or Admin
 */
export async function DELETE(
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

    // Fetch user data
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Delete review using controller
    await deleteReview(id, {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/reviews/[id]:', error);
    
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
      { success: false, error: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}

/**
 * Reviews API Route - GET, POST
 * 
 * GET: List reviews (public sees approved, admin sees all)
 * POST: Create review (authenticated users only, purchase verification)
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllReviews, 
  getProductReviews, 
  getUserReviews, 
  createReview 
} from '../_lib/controllers/review.controller';
import { authenticateUser } from '../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../_lib/middleware/error-handler';

/**
 * GET /api/reviews
 * Public endpoint (filtered) - List reviews
 * Query params: productId, userId, status, sortBy, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | undefined;
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'rating' | 'helpful' | undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try to authenticate (optional for public access)
    const user = await authenticateUser(request);

    // Fetch user data if authenticated
    let userContext;
    if (user) {
      const { getAdminDb } = await import('../_lib/database/admin');
      const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
      const userData = userDoc.data();
      
      userContext = {
        userId: user.userId,
        role: user.role as 'admin' | 'seller' | 'user',
        email: userData?.email,
      };
    }

    const filters = {
      productId: productId || undefined,
      userId: userId || undefined,
      status,
      sortBy,
      limit,
      page: Math.floor(offset / limit) + 1,
    };

    let reviews;

    // Route to appropriate controller method
    if (productId) {
      reviews = await getProductReviews(productId, filters, userContext);
    } else if (userContext) {
      reviews = await getUserReviews(userContext, filters);
    } else {
      // Public: approved reviews only
      reviews = await getProductReviews('', { ...filters, status: 'approved' });
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      total: reviews.length,
    });

  } catch (error: any) {
    console.error('Error in GET /api/reviews:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Protected endpoint - Create new review
 * Authorization: Authenticated users, must have purchased product
 */
export async function POST(request: NextRequest) {
  try {
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
    const { getAdminDb } = await import('../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Create review using controller
    const review = await createReview(body, {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/reviews:', error);
    
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

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}

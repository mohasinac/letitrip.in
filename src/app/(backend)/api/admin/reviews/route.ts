/**
 * Admin Reviews API
 * GET /api/admin/reviews - Get all reviews with filters
 * PATCH /api/admin/reviews - Update review status
 * DELETE /api/admin/reviews - Delete review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../_lib/database/admin';
import { AuthorizationError, ValidationError } from '../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * Update product rating based on approved reviews
 */
async function updateProductRating(productId: string) {
  try {
    const db = getAdminDb();

    // Get all approved reviews for this product
    const reviewsSnapshot = await db
      .collection('reviews')
      .where('productId', '==', productId)
      .where('status', '==', 'approved')
      .get();

    const reviews = reviewsSnapshot.docs.map((doc: any) => doc.data());

    if (reviews.length === 0) {
      // No approved reviews, set rating to 0
      await db.collection('products').doc(productId).update({
        rating: 0,
        reviewCount: 0,
        updatedAt: new Date(),
      });
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce(
      (sum: number, review: any) => sum + (review.rating || 0),
      0
    );
    const averageRating = totalRating / reviews.length;

    // Update product
    await db.collection('products').doc(productId).update({
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviews.length,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
    // Don't throw error - this is a background task
  }
}

/**
 * GET /api/admin/reviews
 * Get all reviews with filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');

    const db = getAdminDb();
    let query: any = db.collection('reviews');

    // Apply filters
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }
    if (productId) {
      query = query.where('productId', '==', productId);
    }
    if (rating) {
      query = query.where('rating', '==', parseInt(rating));
    }

    // Execute query
    const snapshot = await query.orderBy('createdAt', 'desc').get();

    // Map reviews with proper date handling
    let reviews = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    // Apply search filter (client-side for flexible searching)
    if (search) {
      const searchLower = search.toLowerCase();
      reviews = reviews.filter(
        (review: any) =>
          review.userName?.toLowerCase().includes(searchLower) ||
          review.title?.toLowerCase().includes(searchLower) ||
          review.comment?.toLowerCase().includes(searchLower) ||
          review.productId?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/reviews:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reviews
 * Update review status (query: ?id=reviewId, body: {status, adminNote?})
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      throw new ValidationError('Review ID is required');
    }

    const body = await request.json();
    const { status, adminNote } = body;

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const db = getAdminDb();
    const reviewRef = db.collection('reviews').doc(reviewId);

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (adminNote) {
      updateData.adminNote = adminNote;
    }

    await reviewRef.update(updateData);

    // If approved, update product rating
    if (status === 'approved') {
      const reviewDoc = await reviewRef.get();
      const reviewData = reviewDoc.data();

      if (reviewData?.productId) {
        await updateProductRating(reviewData.productId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/reviews:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews
 * Delete review (query: ?id=reviewId)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      throw new ValidationError('Review ID is required');
    }

    const db = getAdminDb();
    const reviewRef = db.collection('reviews').doc(reviewId);

    // Get review data before deleting
    const reviewDoc = await reviewRef.get();
    const reviewData = reviewDoc.data();

    await reviewRef.delete();

    // Update product rating if review was approved
    if (reviewData?.status === 'approved' && reviewData?.productId) {
      await updateProductRating(reviewData.productId);
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/reviews:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

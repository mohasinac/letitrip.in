import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const status = searchParams.get("status") || "approved";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const rating = searchParams.get("rating");
    const category = searchParams.get("category");
    const sellerRating = searchParams.get("sellerRating");
    const verified = searchParams.get("verified");
    const search = searchParams.get("search");

    // Get database
    const { getAdminDb } = await import('@/lib/database/admin');
    const db = getAdminDb();

    // Build query
    let query: any = db.collection('reviews').where('approved', '==', true);

    // Filter by product if specified
    if (productId) {
      query = query.where('productId', '==', productId);
    }

    // Filter by rating if specified
    if (rating) {
      query = query.where('rating', '==', parseInt(rating));
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    // Filter by verified purchase if specified
    if (verified === 'true') {
      query = query.where('verified', '==', true);
    }

    // Determine sort order
    let orderField = 'createdAt';
    let direction: any = 'desc';

    if (sort === 'oldest') {
      direction = 'asc';
    } else if (sort === 'highest' || sort === 'rating-high') {
      orderField = 'rating';
      direction = 'desc';
    } else if (sort === 'lowest' || sort === 'rating-low') {
      orderField = 'rating';
      direction = 'asc';
    } else if (sort === 'helpful') {
      orderField = 'helpful';
      direction = 'desc';
    }

    // Execute query
    const snapshot = await query.orderBy(orderField, direction).get();

    const reviews = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      productName: doc.data().productName,
      productImage: doc.data().productImage,
      userName: doc.data().userName,
      rating: doc.data().rating,
      title: doc.data().title,
      comment: doc.data().content || doc.data().comment,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      verified: doc.data().verified || false,
      helpful: doc.data().helpful || 0,
      images: doc.data().images || [],
      ...doc.data(),
    }));

    // Calculate statistics if not filtered by product
    let stats = null;
    let filters = null;

    if (!productId) {
      const allReviewsSnapshot = await db.collection('reviews')
        .where('approved', '==', true)
        .get();

      const allReviews = allReviewsSnapshot.docs.map((doc: any) => doc.data());
      const totalReviews = allReviews.length;
      const averageRating = totalReviews > 0
        ? allReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
        : 0;

      const ratingDistribution = {
        5: allReviews.filter((r: any) => r.rating === 5).length,
        4: allReviews.filter((r: any) => r.rating === 4).length,
        3: allReviews.filter((r: any) => r.rating === 3).length,
        2: allReviews.filter((r: any) => r.rating === 2).length,
        1: allReviews.filter((r: any) => r.rating === 1).length,
      };

      // Calculate available filter options
      const categories = [...new Set(allReviews.map((r: any) => r.category).filter(Boolean))];
      const verifiedCount = allReviews.filter((r: any) => r.verified).length;
      const sellerRatings = [...new Set(allReviews.map((r: any) => r.sellerRating).filter(Boolean))].sort((a, b) => b - a);

      stats = {
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingDistribution,
      };

      filters = {
        categories,
        verifiedCount,
        sellerRatings: sellerRatings.slice(0, 5), // Top 5 seller ratings
        totalReviews,
      };
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedReviews = reviews.slice(offset, offset + limit);

    return NextResponse.json({
      reviews: paginatedReviews,
      stats,
      filters,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(reviews.length / limit),
        totalReviews: reviews.length,
        hasMore: offset + limit < reviews.length
      }
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

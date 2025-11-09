import { NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';

/**
 * GET /api/shops/[slug]/reviews
 * Fetch reviews for a specific shop
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // First, get the shop by slug
    const shopsSnapshot = await Collections.shops()
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (shopsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    const shopDoc = shopsSnapshot.docs[0];
    const shopId = shopDoc.id;

    // Build reviews query
    let query = Collections.reviews()
      .where('shopId', '==', shopId)
      .orderBy('createdAt', 'desc') as any;

    // Apply pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      const offsetSnapshot = await query.limit(offset).get();
      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    query = query.limit(limit);

    // Execute query
    const reviewsSnapshot = await query.get();

    const reviews = reviewsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count
    const totalSnapshot = await Collections.reviews()
      .where('shopId', '==', shopId)
      .count()
      .get();
    
    const total = totalSnapshot.data().count;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Shop reviews error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch shop reviews' },
      { status: 500 }
    );
  }
}

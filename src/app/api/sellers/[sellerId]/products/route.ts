import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

const db = getAdminDb();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';

    // Verify seller exists
    const sellerDoc = await db.collection('users').doc(sellerId).get();
    if (!sellerDoc.exists) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Build query
    let query = db
      .collection('products')
      .where('sellerId', '==', sellerId)
      .where('status', '==', 'published');

    // Apply category filter
    if (category) {
      query = query.where('category', '==', category);
    }

    // Get all documents first for search and sorting
    const allProductsSnapshot = await query.get();
    let products: any[] = [];

    allProductsSnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      });
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    products.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // Get unique categories for filters
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    // Apply pagination
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Transform products for response
    const transformedProducts = paginatedProducts.map(product => ({
      id: product.id,
      name: product.name || '',
      price: product.price || 0,
      originalPrice: product.originalPrice || null,
      images: product.images || [],
      category: product.category || '',
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      views: product.views || 0,
      inStock: product.stockCount > 0,
      stockCount: product.stockCount || 0,
      description: product.description || '',
      features: product.features || [],
      tags: product.tags || [],
      createdAt: product.createdAt,
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      categories,
    });

  } catch (error) {
    console.error('Error fetching seller products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

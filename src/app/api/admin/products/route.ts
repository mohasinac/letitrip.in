import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const sellerId = searchParams.get('sellerId') || '';
    const sort = searchParams.get('sort') || 'newest';

    let query: any = db.collection('products');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    if (sellerId) {
      query = query.where('sellerId', '==', sellerId);
    }

    // Apply sorting
    if (sort === 'newest') {
      query = query.orderBy('createdAt', 'desc');
    } else if (sort === 'oldest') {
      query = query.orderBy('createdAt', 'asc');
    } else if (sort === 'price_high') {
      query = query.orderBy('price', 'desc');
    } else if (sort === 'price_low') {
      query = query.orderBy('price', 'asc');
    } else if (sort === 'name') {
      query = query.orderBy('name', 'asc');
    }

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const productsSnapshot = await query.get();
    const products: any[] = [];

    for (const doc of productsSnapshot.docs) {
      const productData = doc.data();
      
      // Get seller information
      let sellerInfo = null;
      if (productData.sellerId) {
        try {
          const sellerDoc = await db.collection('users').doc(productData.sellerId).get();
          if (sellerDoc.exists) {
            const sellerData = sellerDoc.data();
            sellerInfo = {
              id: sellerDoc.id,
              name: sellerData?.name || 'Unknown Seller',
              email: sellerData?.email || '',
              verified: sellerData?.verificationStatus?.identity || false,
            };
          }
        } catch (error) {
          console.error('Error fetching seller info:', error);
        }
      }

      const productItem = {
        id: doc.id,
        ...productData,
        seller: sellerInfo,
        createdAt: productData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: productData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };

      // Apply search filter (client-side for now)
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          productItem.name?.toLowerCase().includes(searchLower) ||
          productItem.description?.toLowerCase().includes(searchLower) ||
          productItem.category?.toLowerCase().includes(searchLower) ||
          productItem.seller?.name?.toLowerCase().includes(searchLower);
        
        if (matchesSearch) {
          products.push(productItem);
        }
      } else {
        products.push(productItem);
      }
    }

    // Get categories for filter options
    const categoriesSnapshot = await db.collection('categories').get();
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
      filters: {
        categories,
        statuses: ['active', 'draft', 'archived'],
      }
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    const { productId, updates } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await db.collection('products').doc(productId).update({
      ...updates,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

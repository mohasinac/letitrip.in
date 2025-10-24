import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    
    // Get seller ID from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    const sellerId = decodedToken.uid;
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') || 'newest';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    let query: any = db.collection('products').where('sellerId', '==', sellerId);

    // Apply status filter
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Apply category filter
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    // Apply sorting
    if (sort === 'newest') {
      query = query.orderBy('createdAt', 'desc');
    } else if (sort === 'oldest') {
      query = query.orderBy('createdAt', 'asc');
    } else if (sort === 'name') {
      query = query.orderBy('name', 'asc');
    } else if (sort === 'price_high') {
      query = query.orderBy('price', 'desc');
    } else if (sort === 'price_low') {
      query = query.orderBy('price', 'asc');
    }

    query = query.limit(limit);

    const productsSnapshot = await query.get();
    let products: any[] = [];

    for (const doc of productsSnapshot.docs) {
      const productData = doc.data();
      
      // Apply search filter (client-side since Firestore doesn't support full-text search easily)
      if (search && !productData.name?.toLowerCase().includes(search.toLowerCase()) && 
          !productData.sku?.toLowerCase().includes(search.toLowerCase())) {
        continue;
      }
      
      // Get product performance metrics
      let totalSales = 0;
      let totalRevenue = 0;
      let views = 0;
      
      try {
        // Get orders containing this product
        const ordersSnapshot = await db.collection('orders')
          .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
          .limit(100) // Limit for performance
          .get();

        ordersSnapshot.forEach((orderDoc: any) => {
          const order = orderDoc.data();
          const productItem = order.items?.find((item: any) => item.productId === doc.id);
          
          if (productItem) {
            totalSales += productItem.quantity || 0;
            totalRevenue += (productItem.price || 0) * (productItem.quantity || 0);
          }
        });

        // Get views (if tracking in separate collection)
        const viewsSnapshot = await db.collection('product_views')
          .where('productId', '==', doc.id)
          .get();
        views = viewsSnapshot.size;
      } catch (error) {
        console.error('Error fetching product performance:', error);
      }

      products.push({
        id: doc.id,
        ...productData,
        totalSales,
        totalRevenue,
        views,
        createdAt: productData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: productData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    }

    // Sort by performance if requested (needs to be done after fetching all data)
    if (sort === 'performance') {
      products.sort((a, b) => (b.totalRevenue + b.totalSales * 10) - (a.totalRevenue + a.totalSales * 10));
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller products' },
      { status: 500 }
    );
  }
}

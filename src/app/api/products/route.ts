import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../lib/session';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getProductsQuery, userOwnsShop, UserRole } from '@/app/api/lib/firebase/queries';

// GET /api/products - List all products (role-based)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isFeatured = searchParams.get('isFeatured');
    const slug = searchParams.get('slug'); // Add slug parameter for SEO-friendly URLs
    const limit = parseInt(searchParams.get('limit') || '50');

    const role = (user.role || 'user') as UserRole;
    const userId = user.id;

    // Build query based on role
    const query = getProductsQuery(role, userId);

    // Apply filters
    const filters: any[] = [];
    
    if (shopId) {
      filters.push({ field: 'shop_id', operator: '==', value: shopId });
    }
    
    if (categoryId) {
      filters.push({ field: 'category_id', operator: '==', value: categoryId });
    }
    
    if (status) {
      filters.push({ field: 'status', operator: '==', value: status });
    }
    
    if (isFeatured === 'true') {
      filters.push({ field: 'is_featured', operator: '==', value: true });
    }
    
    // Filter by slug for SEO-friendly URLs
    if (slug) {
      filters.push({ field: 'slug', operator: '==', value: slug });
    }

    // Execute query
    let productsQuery = query;
    
    for (const filter of filters) {
      productsQuery = productsQuery.where(filter.field, filter.operator as any, filter.value);
    }

    // Price filtering (done in memory since Firestore doesn't support range queries with other filters)
    const snapshot = await productsQuery.limit(limit).get();
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply price filters if provided
    if (minPrice) {
      const min = parseFloat(minPrice);
      products = products.filter(p => p.price >= min);
    }
    
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      products = products.filter(p => p.price <= max);
    }

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      shop_id,
      name,
      slug,
      description,
      price,
      category_id,
      images,
      status,
      stock_quantity,
      is_featured
    } = body;

    // Validate required fields
    if (!shop_id || !name || !slug || !price || !category_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate user owns the shop
    const ownsShop = await userOwnsShop(user.email, shop_id);
    if (!ownsShop) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to add products to this shop' },
        { status: 403 }
      );
    }

    // Check if slug is unique
    const existingSlug = await Collections.products()
      .where('slug', '==', slug)
      .limit(1)
      .get();
    
    if (!existingSlug.empty) {
      return NextResponse.json(
        { success: false, error: 'Product slug already exists' },
        { status: 400 }
      );
    }

    // Create product document
    const productData = {
      shop_id,
      name,
      slug,
      description: description || '',
      price: parseFloat(price),
      category_id,
      images: images || [],
      status: status || 'draft',
      stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : null,
      is_featured: is_featured || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const docRef = await Collections.products().add(productData);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...productData
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

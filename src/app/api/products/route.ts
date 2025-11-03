/**
 * Products API Route - GET, POST
 * 
 * Public access for GET (listing products)
 * Seller/Admin only for POST (create product)
 */

import { NextRequest, NextResponse } from 'next/server';
import { productController } from '../_lib/controllers/product.controller';
import { authenticateUser } from '../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../_lib/middleware/error-handler';

/**
 * GET /api/products
 * Public endpoint - List all products with filtering
 * Query params: search, category, minPrice, maxPrice, sort, inStock, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const filters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      inStock: searchParams.get('inStock') === 'true' ? true : undefined,
      status: 'active' as const, // Public always sees active products only
      sortBy: (searchParams.get('sort') || 'createdAt') as 'createdAt' | 'price' | 'name',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Apply sort mapping for backward compatibility
    const sortParam = searchParams.get('sort');
    if (sortParam === 'price-low') {
      filters.sortBy = 'price';
      filters.sortOrder = 'asc';
    } else if (sortParam === 'price-high') {
      filters.sortBy = 'price';
      filters.sortOrder = 'desc';
    } else if (sortParam === 'newest') {
      filters.sortBy = 'createdAt';
      filters.sortOrder = 'desc';
    }

    // Get products using controller
    const result = await productController.getAllProducts(filters);

    // Apply pagination in-memory (controller returns all matching products)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = result.products.slice(startIndex, endIndex);
    const hasMore = endIndex < result.products.length;

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      total: result.total,
      page,
      limit,
      hasMore,
    });

  } catch (error: any) {
    console.error('Error in GET /api/products:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Protected endpoint - Create a new product
 * Authorization: Seller (own products) or Admin (any seller)
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

    // Fetch full user data from database to get sellerId and email
    const { getAdminDb } = await import('../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Create product using controller
    const product = await productController.createProduct(body, {
      uid: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      sellerId: userData?.sellerId,
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      product,
      message: 'Product created successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/products:', error);
    
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
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

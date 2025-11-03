/**
 * Admin Products API
 * GET /api/admin/products - List all products (with filters)
 * POST /api/admin/products - Create new product
 * DELETE /api/admin/products - Bulk delete products
 */

import { NextRequest, NextResponse } from 'next/server';
import { productController } from '../../_lib/controllers/product.controller';
import { getAdminAuth } from '../../_lib/database/admin';
import { AuthorizationError } from '../../_lib/middleware/error-handler';

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
 * GET /api/admin/products
 * List all products with advanced filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: (searchParams.get('status') as any) || 'all',
      sellerId: searchParams.get('sellerId') || 'all',
      category: searchParams.get('category') || 'all',
      search: searchParams.get('search') || undefined,
      stockStatus: (searchParams.get('stockStatus') as any) || 'all',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    // Get products using controller
    const result = await productController.getAllProductsAdmin(filters, user);

    return NextResponse.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/products:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create a new product (admin can create for any seller)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Parse request body
    const body = await request.json();

    // Create product using controller
    const product = await productController.createProductAdmin(body, user);

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/products:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products
 * Bulk delete multiple products
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Parse request body
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No product IDs provided' },
        { status: 400 }
      );
    }

    // Delete products using controller
    const result = await productController.bulkDeleteProducts(ids, user);

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} product(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/products:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete products' },
      { status: 500 }
    );
  }
}

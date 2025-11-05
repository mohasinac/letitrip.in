/**
 * Product by Slug API Route - GET, PUT, DELETE
 * 
 * GET: Public access (view product details)
 * PUT/DELETE: Owner (seller) or Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { productController } from '../../_lib/controllers/product.controller';
import { authenticateUser } from '../../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../../_lib/middleware/error-handler';
import { withCache } from '../../_lib/middleware/cache';
import { withRateLimit } from '../../_lib/middleware/rate-limit';
import { CacheKeys, CacheTTL, cacheService } from '../../_lib/utils/cache';
import { rateLimitConfigs } from '../../_lib/utils/rate-limiter';

/**
 * GET /api/products/[slug]
 * Public endpoint - Get product by slug
 * Optimized with caching (5 minutes TTL) and rate limiting
 */
const getProductHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // Get product using controller
    const product = await productController.getProductBySlug(slug);

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (error: any) {
    console.error('Error in GET /api/products/[slug]:', error);
    
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
};

export const GET = withRateLimit(
  withCache(getProductHandler, {
    keyGenerator: (req) => {
      // Extract slug from URL path
      const slug = req.nextUrl.pathname.split('/').pop() || 'unknown';
      return CacheKeys.PRODUCT_DETAIL(slug);
    },
    ttl: CacheTTL.SHORT, // 5 minutes for product details
    skip: (req) => false, // Always cache product details
  }),
  {
    config: (req) => {
      const authHeader = req.headers.get('authorization');
      return authHeader ? rateLimitConfigs.authenticated : rateLimitConfigs.public;
    }
  }
);

/**
 * PUT /api/products/[slug]
 * Protected endpoint - Update product
 * Authorization: Owner (seller) or Admin
 * Optimized with rate limiting and cache invalidation
 */
const putProductHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      );
    }

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
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Update product using controller
    const product = await productController.updateProduct(
      slug,
      body,
      {
        uid: user.userId,
        role: session.role as 'admin' | 'seller' | 'user',
        sellerId: userData?.sellerId,
        email: userData?.email,
      }
    );

    // Invalidate cache for this product and product list
    cacheService.invalidatePattern('products:*');
    cacheService.invalidatePattern(`product:${slug}`);

    return NextResponse.json({
      success: true,
      product,
      message: 'Product updated successfully',
    });

  } catch (error: any) {
    console.error('Error in PUT /api/products/[slug]:', error);
    
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

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
};

export const PUT = withRateLimit(putProductHandler, {
  config: (req) => {
    // Check user role from auth token or use seller config as default
    return rateLimitConfigs.seller; // Sellers can update frequently, admins inherit higher limits
  }
});

/**
 * DELETE /api/products/[slug]
 * Protected endpoint - Delete product (soft delete)
 * Authorization: Owner (seller) or Admin
 * Optimized with rate limiting and cache invalidation
 */
const deleteProductHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch full user data from database to get sellerId and email
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Delete product using controller
    await productController.deleteProduct(
      slug,
      {
        uid: user.userId,
        role: session.role as 'admin' | 'seller' | 'user',
        sellerId: userData?.sellerId,
        email: userData?.email,
      }
    );

    // Invalidate cache for this product and product list
    cacheService.invalidatePattern('products:*');
    cacheService.invalidatePattern(`product:${slug}`);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/products/[slug]:', error);
    
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
};

export const DELETE = withRateLimit(deleteProductHandler, {
  config: (req) => {
    return rateLimitConfigs.seller; // Same limits as PUT
  }
});

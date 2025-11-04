/**
 * Categories API Route - GET, POST (OPTIMIZED)
 * 
 * GET: Public access - List all categories (tree or list format)
 *      ✅ Cache: 1 hour TTL (static data)
 *      ✅ Rate Limit: 100 req/hr (public), 1000 req/hr (authenticated)
 * 
 * POST: Admin only - Create new category
 *       ✅ Rate Limit: 5000 req/hr (admin)
 *       ✅ Cache Invalidation: Clears category caches
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, getCategoryTree, createCategory } from '../_lib/controllers/category.controller';
import { authenticateUser } from '../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../_lib/middleware/error-handler';

// Import performance middleware
import { withCache } from '../_lib/middleware/cache';
import { withRateLimit } from '../_lib/middleware/rate-limit';
import { rateLimitConfigs } from '../_lib/utils/rate-limiter';
import cacheService, { CacheKeys, CacheTTL } from '../_lib/utils/cache';

/**
 * GET /api/categories (OPTIMIZED)
 * Public endpoint - List all categories
 * Query params: format (tree/list), search, limit
 * 
 * Performance:
 * - Cache: 1 hour for static categories
 * - Rate Limit: 100 req/hr (public), 1000 req/hr (authenticated)
 * - Expected: < 10ms (cached), < 100ms (uncached)
 */
const getCategoriesHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    
    const format = searchParams.get('format'); // 'tree' or 'list'
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Build filters
    const filters = {
      search: search || undefined,
      limit,
      isActive: true, // Public only sees active categories
      sortBy: 'sortOrder' as const,
      sortOrder: 'asc' as const,
    };

    // Get categories based on format
    let result: any;
    if (format === 'tree') {
      result = await getCategoryTree();
    } else {
      result = await getAllCategories(filters);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Error in GET /api/categories:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
};

// Apply cache and rate limit middleware to GET
export const GET = withRateLimit(
  withCache(getCategoriesHandler, {
    keyGenerator: (req) => {
      const url = new URL(req.url);
      const format = url.searchParams.get('format') || 'list';
      const search = url.searchParams.get('search') || '';
      
      // Don't cache search results (they change frequently)
      if (search) {
        return `categories:search:${search}`;
      }
      
      // Cache tree and list separately
      return format === 'tree' 
        ? CacheKeys.CATEGORIES_TREE 
        : CacheKeys.CATEGORIES;
    },
    ttl: CacheTTL.STATIC, // 1 hour for static data
    skip: (req) => {
      // Don't cache search queries
      const url = new URL(req.url);
      return !!url.searchParams.get('search');
    },
  }),
  {
    config: (req) => {
      // Higher limit for authenticated users
      const authHeader = req.headers.get('authorization');
      return authHeader 
        ? rateLimitConfigs.authenticated 
        : rateLimitConfigs.public;
    },
  }
);

/**
 * POST /api/categories (OPTIMIZED)
 * Protected endpoint - Create new category
 * Authorization: Admin only
 * 
 * Performance:
 * - Rate Limit: 5000 req/hr (admin only)
 * - Cache Invalidation: Clears all category caches on create
 */
const postCategoriesHandler = async (request: NextRequest) => {
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

    // Create category using controller
    const category = await createCategory(body, {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
    });

    // 🔥 Invalidate category caches after creation
    cacheService.invalidatePattern('categories:*');
    console.log('[Cache] Invalidated category caches after POST');

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/categories:', error);
    
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
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
};

// Apply rate limiting to POST (admin only, 5000 req/hr)
export const POST = withRateLimit(postCategoriesHandler, {
  config: rateLimitConfigs.admin,
});

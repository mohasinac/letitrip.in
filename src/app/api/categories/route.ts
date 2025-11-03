/**
 * Categories API Route - GET, POST
 * 
 * GET: Public access - List all categories (tree or list format)
 * POST: Admin only - Create new category
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, getCategoryTree, createCategory } from '../_lib/controllers/category.controller';
import { authenticateUser } from '../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../_lib/middleware/error-handler';

/**
 * GET /api/categories
 * Public endpoint - List all categories
 * Query params: format (tree/list), search, limit
 */
export async function GET(request: NextRequest) {
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
}

/**
 * POST /api/categories
 * Protected endpoint - Create new category
 * Authorization: Admin only
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

    // Create category using controller
    const category = await createCategory(body, {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
    });

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
}

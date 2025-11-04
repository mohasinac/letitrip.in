/**
 * Category by Slug API Route - GET, PUT, DELETE
 * 
 * GET: Public access - View category details
 * PUT: Admin only - Update category
 * DELETE: Admin only - Delete category
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getCategoryBySlug, 
  updateCategory, 
  deleteCategory 
} from '../../_lib/controllers/category.controller';
import { authenticateUser } from '../../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../../_lib/middleware/error-handler';

/**
 * GET /api/categories/[slug]
 * Public endpoint - Get category by slug with subcategories
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Category slug is required' },
        { status: 400 }
      );
    }

    // Get category using controller
    const category = await getCategoryBySlug(slug);

    // Fetch subcategories (handled by controller or model)
    return NextResponse.json({
      success: true,
      data: {
        category,
        // subcategories can be added here if needed
      },
    });

  } catch (error: any) {
    console.error('Error in GET /api/categories/[slug]:', error);
    
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[slug]
 * Protected endpoint - Update category
 * Authorization: Admin only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Category slug is required' },
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

    // Update category using controller
    const category = await updateCategory(slug, body, {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });

  } catch (error: any) {
    console.error('Error in PUT /api/categories/[slug]:', error);
    
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
      { success: false, error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[slug]
 * Protected endpoint - Delete category (soft delete)
 * Authorization: Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Category slug is required' },
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

    // Delete category using controller
    await deleteCategory(slug, {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/categories/[slug]:', error);
    
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
      { success: false, error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../_lib/auth/admin-auth';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../_lib/middleware/error-handler';
import { getAllCategories, getCategoryTree, createCategory } from '../../_lib/controllers/category.controller';

/**
 * GET /api/admin/categories - List all categories (admin view - includes inactive)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await verifyAdminSession(request);

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format'); // 'tree' or 'list'
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const includeInactive = searchParams.get('includeInactive') !== 'false';

    // Build filters (admin sees all categories including inactive)
    const filters = {
      search: search || undefined,
      limit,
      isActive: includeInactive ? undefined : true,
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
      ...result,
    });
  } catch (error: any) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories - Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await verifyAdminSession(request);

    // Parse request body
    const body = await request.json();

    // Create category
    const category = await createCategory(body, { 
      userId: session.userId,
      role: session.role,
      email: session.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully',
        category,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

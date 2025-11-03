/**
 * Admin Categories Batch Update API
 * POST /api/admin/categories/batch-update - Batch update categories
 */

import { NextRequest, NextResponse } from 'next/server';
import * as categoryController from '../../../_lib/controllers/category.controller';
import { getAdminAuth } from '../../../_lib/database/admin';
import { AuthorizationError, ValidationError } from '../../../_lib/middleware/error-handler';

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
 * POST /api/admin/categories/batch-update
 * Batch update multiple categories
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Parse request body
    const body = await request.json();
    const { updates } = body;

    console.log('Batch update request received:', {
      updatesCount: updates?.length,
      updates: JSON.stringify(updates, null, 2),
    });

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    // Validate each update has required fields
    for (const update of updates) {
      if (!update.id) {
        return NextResponse.json(
          { error: 'Category ID is required for each update' },
          { status: 400 }
        );
      }
    }

    // Batch update categories using controller
    await categoryController.batchUpdateCategories(
      updates.map((update: any) => ({
        id: update.id,
        data: {
          ...(typeof update.featured === 'boolean' && { featured: update.featured }),
          ...(typeof update.isActive === 'boolean' && { isActive: update.isActive }),
          ...(typeof update.sortOrder === 'number' && { sortOrder: update.sortOrder }),
        },
      })),
      { userId: user.uid, role: 'admin' }
    );

    console.log(`Successfully updated ${updates.length} categories`);

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} categories`,
      updatedCount: updates.length,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/categories/batch-update:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update categories' },
      { status: 500 }
    );
  }
}

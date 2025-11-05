/**
 * Seller Product Categories API
 * GET /api/seller/products/categories/leaf - Get all leaf categories for product assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySellerSession } from '../../../../_lib/auth/admin-auth';
import { AuthorizationError } from '../../../../_lib/middleware/error-handler';

/**
 * Verify seller authentication
 */


  

/**
 * GET /api/seller/products/categories/leaf
 * Get all leaf (end-level) categories for product assignment
 * Leaf categories are categories that have no children
 */
export async function GET(request: NextRequest) {
  try {
    // Verify seller authentication
    await verifySellerSession(request);

    const db = getAdminDb();

    // Get all active categories
    const categoriesSnapshot = await db
      .collection('categories')
      .where('isActive', '==', true)
      .orderBy('name', 'asc')
      .get();

    if (categoriesSnapshot.empty) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No categories found',
      });
    }

    // Build category map
    const categoryMap = new Map();
    const allCategories = categoriesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    allCategories.forEach((cat: any) => {
      categoryMap.set(cat.id, cat);
    });

    // Find leaf categories (no children or empty childIds array)
    const leafCategories = allCategories.filter((cat: any) => {
      const childIds = cat.childIds || [];
      return childIds.length === 0;
    });

    // Build full path for each leaf category
    const leafCategoriesWithPath = leafCategories.map((cat: any) => {
      const path: any[] = [];
      let current: any = cat;

      // Build path from leaf to root
      while (current) {
        path.unshift({
          id: current.id,
          name: current.name,
          slug: current.slug,
        });

        // Get first parent (categories can have multiple parents)
        const parentIds = current.parentIds || [];
        const firstParentId = parentIds[0];
        if (firstParentId) {
          current = categoryMap.get(firstParentId);
        } else {
          current = null;
        }
      }

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        level: cat.level || 0,
        path: path,
        pathString: path.map((p) => p.name).join(' > '),
        icon: cat.icon || null,
        image: cat.image || null,
        sortOrder: cat.sortOrder || 0,
      };
    });

    // Sort by path string for better organization
    leafCategoriesWithPath.sort((a: any, b: any) =>
      a.pathString.localeCompare(b.pathString)
    );

    return NextResponse.json({
      success: true,
      data: leafCategoriesWithPath,
      count: leafCategoriesWithPath.length,
      message: `Found ${leafCategoriesWithPath.length} leaf categories`,
    });
  } catch (error: any) {
    console.error('Error in GET /api/seller/products/categories/leaf:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaf categories' },
      { status: 500 }
    );
  }
}

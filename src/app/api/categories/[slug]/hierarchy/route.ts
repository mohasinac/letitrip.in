import { NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';

/**
 * GET /api/categories/[slug]/hierarchy
 * Get full category hierarchy path (breadcrumb)
 */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // First, get the category by slug
    const categoriesSnapshot = await Collections.categories()
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (categoriesSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const categoryDoc = categoriesSnapshot.docs[0];
    const category: any = { id: categoryDoc.id, ...categoryDoc.data() };

    // Build hierarchy by traversing up the parent chain
    const hierarchy = [category];
    let currentParentId = category.parentId;

    while (currentParentId) {
      const parentSnapshot = await Collections.categories()
        .doc(currentParentId)
        .get();

      if (!parentSnapshot.exists) break;

      const parent: any = { id: parentSnapshot.id, ...parentSnapshot.data() };
      hierarchy.unshift(parent); // Add to beginning
      currentParentId = parent.parentId;
    }

    return NextResponse.json({
      success: true,
      data: hierarchy,
    });
  } catch (error: any) {
    console.error('Category hierarchy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch category hierarchy' },
      { status: 500 }
    );
  }
}

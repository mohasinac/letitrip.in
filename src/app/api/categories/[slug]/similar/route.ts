import { NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';

/**
 * GET /api/categories/[slug]/similar
 * Fetch similar categories (siblings or related)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

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

    // Get sibling categories (same parent)
    let similarQuery = Collections.categories()
      .where('isActive', '==', true) as any;

    if (category.parentId) {
      similarQuery = similarQuery.where('parentId', '==', category.parentId);
    } else {
      // If it's a root category, get other root categories
      similarQuery = similarQuery.where('parentId', '==', null);
    }

    similarQuery = similarQuery
      .orderBy('sortOrder', 'asc')
      .limit(limit + 1);

    const similarSnapshot = await similarQuery.get();

    // Filter out the current category
    const similar = similarSnapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .filter((cat: any) => cat.id !== category.id)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: similar,
    });
  } catch (error: any) {
    console.error('Similar categories error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch similar categories' },
      { status: 500 }
    );
  }
}

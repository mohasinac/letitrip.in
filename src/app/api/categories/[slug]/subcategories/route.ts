import { NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';

/**
 * GET /api/categories/[slug]/subcategories
 * Fetch immediate children of a category
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
    const categoryId = categoryDoc.id;

    // Fetch subcategories
    const subcategoriesSnapshot = await Collections.categories()
      .where('parentId', '==', categoryId)
      .where('isActive', '==', true)
      .orderBy('sortOrder', 'asc')
      .get();

    const subcategories = subcategoriesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Optionally, get product counts for each subcategory
    const subcategoriesWithCounts = await Promise.all(
      subcategories.map(async (cat: any) => {
        const countSnapshot = await Collections.products()
          .where('categoryId', '==', cat.id)
          .where('status', '==', 'published')
          .count()
          .get();
        
        return {
          ...cat,
          productCount: countSnapshot.data().count,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: subcategoriesWithCounts,
    });
  } catch (error: any) {
    console.error('Subcategories error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}

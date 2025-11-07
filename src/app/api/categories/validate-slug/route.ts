import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getCurrentUser } from '../../lib/session';

/**
 * Validate Category Slug Uniqueness
 * GET /api/categories/validate-slug?slug=smartphones&exclude_id=xxx
 * 
 * Slugs are globally unique across all categories
 * Admin-only feature
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    // Check authentication and admin role
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('exclude_id'); // For edit mode

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug parameter is required',
        },
        { status: 400 }
      );
    }

    // Check if slug exists
    const query = Collections.categories().where('slug', '==', slug);
    const snapshot = await query.get();

    // If editing, exclude current category
    const exists = snapshot.docs.some(doc => doc.id !== excludeId);

    return NextResponse.json({
      success: true,
      available: !exists,
      slug,
    });
  } catch (error) {
    console.error('Error validating category slug:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate slug',
      },
      { status: 500 }
    );
  }
}

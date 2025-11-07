import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';

/**
 * Validate Auction Slug Uniqueness
 * GET /api/auctions/validate-slug?slug=rare-vintage-watch&exclude_id=xxx
 * 
 * Slugs are globally unique across all auctions
 */
export async function GET(request: NextRequest) {
  try {
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
    const query = Collections.auctions().where('slug', '==', slug);
    const snapshot = await query.get();

    // If editing, exclude current auction
    const exists = snapshot.docs.some(doc => doc.id !== excludeId);

    return NextResponse.json({
      success: true,
      available: !exists,
      slug,
    });
  } catch (error) {
    console.error('Error validating auction slug:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate slug',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';

const COLLECTION = 'blog_posts';

// GET /api/blog/[slug] - Get single blog post by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { slug } = await params;

    const snapshot = await db
      .collection(COLLECTION)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const post = {
      id: doc.id,
      ...doc.data(),
    };

    // Increment view count
    await doc.ref.update({
      views: (doc.data().views || 0) + 1,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PATCH /api/blog/[slug] - Update blog post (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { slug } = await params;
    const body = await req.json();

    const snapshot = await db
      .collection(COLLECTION)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Allow updating specific fields
    const allowedFields = [
      'title',
      'excerpt',
      'content',
      'featuredImage',
      'category',
      'tags',
      'status',
      'showOnHomepage',
      'isFeatured',
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Update publishedAt if changing to published
    if (body.status === 'published' && doc.data().status !== 'published') {
      updates.publishedAt = new Date().toISOString();
    }

    await doc.ref.update(updates);

    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
      ...updates,
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[slug] - Delete blog post (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { slug } = await params;

    const snapshot = await db
      .collection(COLLECTION)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    await snapshot.docs[0].ref.delete();

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

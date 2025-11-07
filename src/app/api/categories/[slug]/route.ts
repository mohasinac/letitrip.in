import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getCurrentUser } from '../../lib/session';

// GET /api/categories/[slug] - Public category detail
// PATCH /api/categories/[slug] - Admin update
// DELETE /api/categories/[slug] - Admin delete
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const snapshot = await Collections.categories().where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    const doc = snapshot.docs[0];
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    const { slug } = await params;
    const snapshot = await Collections.categories().where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    const doc = snapshot.docs[0];
    const data = await request.json();

    if (data.slug && data.slug !== slug) {
      const exists = await Collections.categories().where('slug', '==', data.slug).limit(1).get();
      if (!exists.empty) {
        return NextResponse.json({ success: false, error: 'Slug already in use' }, { status: 400 });
      }
    }

    const update: any = { ...data, updated_at: new Date().toISOString() };
    delete update.id; delete update.created_at;

    await Collections.categories().doc(doc.id).update(update);
    const updated = await Collections.categories().doc(doc.id).get();
    return NextResponse.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    const { slug } = await params;
    const snapshot = await Collections.categories().where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    const doc = snapshot.docs[0];

    // Prevent deletion if category has children
    const children = await Collections.categories().where('parent_id', '==', doc.id).limit(1).get();
    if (!children.empty) {
      return NextResponse.json({ success: false, error: 'Cannot delete category with children' }, { status: 400 });
    }

    await Collections.categories().doc(doc.id).delete();
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}

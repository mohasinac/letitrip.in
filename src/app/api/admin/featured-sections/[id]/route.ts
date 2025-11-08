import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';
import { COLLECTIONS } from '@/constants/database';

// GET /api/admin/featured-sections/[id] - Get featured section
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getFirestoreAdmin();
    const doc = await db.collection(COLLECTIONS.FEATURED_SECTIONS).doc(params.id).get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Featured section not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error('Error fetching featured section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured section' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/featured-sections/[id] - Update featured section
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();
    
    // Check if section exists
    const doc = await db.collection(COLLECTIONS.FEATURED_SECTIONS).doc(params.id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Featured section not found' },
        { status: 404 }
      );
    }
    
    // Update section
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.item_ids !== undefined) updateData.item_ids = body.item_ids;
    if (body.layout !== undefined) updateData.layout = body.layout;
    if (body.max_items !== undefined) updateData.max_items = body.max_items;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    
    await db.collection(COLLECTIONS.FEATURED_SECTIONS).doc(params.id).update(updateData);
    
    return NextResponse.json({
      id: params.id,
      ...doc.data(),
      ...updateData,
    });
  } catch (error) {
    console.error('Error updating featured section:', error);
    return NextResponse.json(
      { error: 'Failed to update featured section' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/featured-sections/[id] - Delete featured section
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getFirestoreAdmin();
    
    // Check if section exists
    const doc = await db.collection(COLLECTIONS.FEATURED_SECTIONS).doc(params.id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Featured section not found' },
        { status: 404 }
      );
    }
    
    // Delete section
    await db.collection(COLLECTIONS.FEATURED_SECTIONS).doc(params.id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting featured section:', error);
    return NextResponse.json(
      { error: 'Failed to delete featured section' },
      { status: 500 }
    );
  }
}

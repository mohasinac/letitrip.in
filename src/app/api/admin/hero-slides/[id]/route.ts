import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';
import { COLLECTIONS } from '@/constants/database';

// GET /api/admin/hero-slides/[id] - Get hero slide
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { id } = await params;
    const doc = await db.collection(COLLECTIONS.HERO_SLIDES).doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Hero slide not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error('Error fetching hero slide:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero slide' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/hero-slides/[id] - Update hero slide
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();
    const { id } = await params;
    
    // Check if slide exists
    const doc = await db.collection(COLLECTIONS.HERO_SLIDES).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Hero slide not found' },
        { status: 404 }
      );
    }
    
    // Update slide
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.link_url !== undefined) updateData.link_url = body.link_url;
    if (body.cta_text !== undefined) updateData.cta_text = body.cta_text;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.show_in_carousel !== undefined) updateData.show_in_carousel = body.show_in_carousel;
    
    await db.collection(COLLECTIONS.HERO_SLIDES).doc(id).update(updateData);
    
    return NextResponse.json({
      id: id,
      ...doc.data(),
      ...updateData,
    });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    return NextResponse.json(
      { error: 'Failed to update hero slide' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/hero-slides/[id] - Delete hero slide
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { id } = await params;
    
    // Check if slide exists
    const doc = await db.collection(COLLECTIONS.HERO_SLIDES).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Hero slide not found' },
        { status: 404 }
      );
    }
    
    // Delete slide
    await db.collection(COLLECTIONS.HERO_SLIDES).doc(id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json(
      { error: 'Failed to delete hero slide' },
      { status: 500 }
    );
  }
}

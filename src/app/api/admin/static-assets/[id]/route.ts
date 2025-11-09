import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';

// GET /api/admin/static-assets/[id] - Get single asset
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { id } = await params;

    const doc = await db.collection('static_assets').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      asset: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/static-assets/[id] - Update asset metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { id } = await params;
    const body = await req.json();

    const doc = await db.collection('static_assets').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    await db.collection('static_assets').doc(id).update(updates);

    return NextResponse.json({
      success: true,
      asset: {
        id,
        ...doc.data(),
        ...updates,
      },
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/static-assets/[id] - Delete asset
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { id } = await params;

    const doc = await db.collection('static_assets').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    const data = doc.data();

    // Delete from Storage
    try {
      const storage = getStorage();
      const bucket = storage.bucket();
      await bucket.file(data?.storagePath).delete();
    } catch (storageError) {
      console.warn('Storage deletion failed:', storageError);
      // Continue with Firestore deletion even if storage fails
    }

    // Delete from Firestore
    await db.collection('static_assets').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}

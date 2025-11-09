import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/app/api/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { COLLECTIONS } from '@/constants/database';

// GET /api/admin/static-assets - List all static assets
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    let query = db.collection('static_assets');

    if (type) {
      query = query.where('type', '==', type) as any;
    }

    if (category) {
      query = query.where('category', '==', category) as any;
    }

    const snapshot = await query.orderBy('uploadedAt', 'desc').get();

    const assets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      assets,
      count: assets.length,
    });
  } catch (error) {
    console.error('Error fetching static assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// POST /api/admin/static-assets - Upload new asset (metadata only, actual upload via client SDK)
export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();

    const {
      id,
      name,
      type,
      url,
      storagePath,
      category,
      uploadedBy,
      size,
      contentType,
      metadata,
    } = body;

    if (!id || !name || !type || !url || !storagePath) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const asset = {
      id,
      name,
      type,
      url,
      storagePath,
      category: category || null,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      size: size || 0,
      contentType: contentType || 'application/octet-stream',
      metadata: metadata || {},
    };

    await db.collection('static_assets').doc(id).set(asset);

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}

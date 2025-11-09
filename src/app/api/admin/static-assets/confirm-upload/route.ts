import { NextRequest, NextResponse } from 'next/server';
import {
  saveAssetMetadata,
  getDownloadUrl,
} from '@/app/api/lib/static-assets-server.service';

// POST /api/admin/static-assets/confirm-upload - Confirm upload completion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      assetId,
      name,
      type,
      storagePath,
      category,
      uploadedBy,
      size,
      contentType,
      metadata,
    } = body;

    if (!assetId || !name || !type || !storagePath) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get public CDN URL
    const url = await getDownloadUrl(storagePath);

    // Save metadata to Firestore
    const assetData = {
      id: assetId,
      name,
      type: type as 'payment-logo' | 'icon' | 'image' | 'video' | 'document',
      url,
      storagePath,
      category: category || null,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      size: size || 0,
      contentType: contentType || 'application/octet-stream',
      metadata: metadata || {},
    };
    
    const asset = await saveAssetMetadata(assetData);

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error('Error confirming upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm upload' },
      { status: 500 }
    );
  }
}

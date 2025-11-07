import { NextRequest, NextResponse } from 'next/server';
import { getStorageAdmin } from '@/app/api/lib/firebase/admin';
import { Collections } from '@/app/api/lib/firebase/collections';
import { STORAGE_PATHS } from '@/constants/storage';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    const context = (form.get('context') as string) || 'product';
    const contextId = form.get('contextId') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'application/octet-stream';
    const originalName = (file as any).name || 'upload';

    // Build storage path
    let path = '';
    if (context === 'product') {
      if (!contextId) {
        return NextResponse.json({ success: false, error: 'productId (contextId) is required' }, { status: 400 });
      }
      // Lookup product to get shop_id
      const prodSnap = await Collections.products().doc(contextId).get();
      if (!prodSnap.exists) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      const prod: any = prodSnap.data();
      const shopId = prod.shop_id;
      const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      path = STORAGE_PATHS.productImage(shopId, contextId, safeName);
    } else if (context === 'shop') {
      if (!contextId) {
        return NextResponse.json({ success: false, error: 'shopId (contextId) is required' }, { status: 400 });
      }
      const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      path = STORAGE_PATHS.shopLogo(contextId, safeName);
    } else {
      // Default bucket path
      const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      path = `uploads/${context}/${contextId || 'general'}/${safeName}`;
    }

    const storage = getStorageAdmin();
    
    // Get bucket with explicit name if needed
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    if (!bucketName) {
      return NextResponse.json({ success: false, error: 'Storage bucket not configured' }, { status: 500 });
    }
    
    const bucket = storage.bucket(bucketName);
    const fileRef = bucket.file(path);

    await fileRef.save(buffer, { contentType, resumable: false, public: true, metadata: { cacheControl: 'public, max-age=31536000' } });

    // Ensure the object is publicly readable
    try { await fileRef.makePublic(); } catch (_) {}

    const url = `https://storage.googleapis.com/${bucket.name}/${encodeURI(path)}`;

    return NextResponse.json({ success: true, url, id: path });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}

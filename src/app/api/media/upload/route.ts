import { NextRequest, NextResponse } from 'next/server';
import { getStorageAdmin } from '@/app/api/lib/firebase/admin';
import { Collections } from '@/app/api/lib/firebase/collections';
import { STORAGE_PATHS } from '@/constants/storage';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('[Media Upload] Starting upload process...');
    
    const form = await request.formData();
    const file = form.get('file') as File | null;
    const context = (form.get('context') as string) || 'product';
    const contextId = form.get('contextId') as string | null;

    console.log('[Media Upload] Context:', context, 'ContextId:', contextId);

    if (!file) {
      console.error('[Media Upload] No file provided');
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    console.log('[Media Upload] File received:', file.name, file.type, file.size);

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'application/octet-stream';
    const originalName = (file as any).name || 'upload';

    // Build storage path
    let path = '';
    const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    
    if (context === 'product' && contextId) {
      // Lookup product to get shop_id
      const prodSnap = await Collections.products().doc(contextId).get();
      if (!prodSnap.exists) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      const prod: any = prodSnap.data();
      const shopId = prod.shop_id;
      path = STORAGE_PATHS.productImage(shopId, contextId, safeName);
    } else if (context === 'shop' && contextId) {
      path = STORAGE_PATHS.shopLogo(contextId, safeName);
    } else {
      // Default bucket path - allow uploads without contextId for general use
      path = `uploads/${context}/${contextId || 'general'}/${safeName}`;
    }

    console.log('[Media Upload] Storage path:', path);
    
    const storage = getStorageAdmin();
    
    // Get bucket with explicit name if needed
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    if (!bucketName) {
      console.error('[Media Upload] Storage bucket not configured');
      return NextResponse.json({ success: false, error: 'Storage bucket not configured' }, { status: 500 });
    }
    
    console.log('[Media Upload] Using bucket:', bucketName);
    
    const bucket = storage.bucket(bucketName);
    const fileRef = bucket.file(path);

    console.log('[Media Upload] Uploading to Firebase Storage...');
    await fileRef.save(buffer, { contentType, resumable: false, public: true, metadata: { cacheControl: 'public, max-age=31536000' } });

    // Ensure the object is publicly readable
    try { 
      await fileRef.makePublic(); 
      console.log('[Media Upload] File made public');
    } catch (err) {
      console.warn('[Media Upload] Could not make file public:', err);
    }

    const url = `https://storage.googleapis.com/${bucket.name}/${encodeURI(path)}`;
    
    console.log('[Media Upload] Upload successful:', url);

    return NextResponse.json({ success: true, url, id: path });
  } catch (error) {
    console.error('[Media Upload] Upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

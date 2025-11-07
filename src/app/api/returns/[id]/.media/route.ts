import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/api/lib/session';
import { Collections } from '@/app/api/lib/firebase/collections';
import { userOwnsShop } from '@/app/api/lib/firebase/queries';
import { getStorageAdmin } from '@/app/api/lib/firebase/admin';
import { randomUUID } from 'crypto';

// NOTE: This is a simplified stub. In production, validate file type/size and use signed URLs or direct upload tokens.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, error: 'Invalid content type' }, { status: 400 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files');
    if (!files.length) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
    }

    const { id } = await params;
    const retRef = Collections.returns().doc(id);
    const retSnap = await retRef.get();
    if (!retSnap.exists) return NextResponse.json({ success: false, error: 'Return not found' }, { status: 404 });
    const ret = retSnap.data() as any;

    // Authorization: owner of return, seller owning shop, or admin
    const role = user.role;
    let authorized = false;
    if (role === 'admin') authorized = true;
    else if (ret.user_id === user.id) authorized = true;
    else if (role === 'seller' && (await userOwnsShop(ret.shop_id, user.id))) authorized = true;

    if (!authorized) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const storage = getStorageAdmin();
    const bucket = storage.bucket();

    const uploaded: string[] = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = f.name.split('.').pop() || 'bin';
      const path = `returns/media/${id}/${randomUUID()}.${ext}`;
      const file = bucket.file(path);
      await file.save(buffer, { contentType: f.type, resumable: false, public: true });
      // Make public (optional) and get public URL
      try { await file.makePublic(); } catch {}
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;
      uploaded.push(publicUrl);
    }

    // Append media URLs to return doc
    await retRef.update({ media: [...(ret.media || []), ...uploaded], updated_at: new Date().toISOString() });
    return NextResponse.json({ success: true, data: { urls: uploaded } });
  } catch (error) {
    console.error('Return media upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload media' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { generateUploadUrl } from '@/app/api/lib/static-assets-server.service';

// POST /api/admin/static-assets/upload-url - Request signed upload URL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, contentType, type, category } = body;

    if (!fileName || !contentType || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { uploadUrl, assetId, storagePath } = await generateUploadUrl(
      fileName,
      contentType,
      type,
      category
    );

    return NextResponse.json({
      success: true,
      uploadUrl,
      assetId,
      storagePath,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

/**
 * API Route: Upload Beyblade Image
 * POST /api/beyblades/upload-image
 */

import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/storage/firebase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const beybladeId = formData.get('beybladeId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!beybladeId) {
      return NextResponse.json(
        { success: false, error: 'No Beyblade ID provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PNG, JPG, SVG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Firebase Storage
    const filename = `beyblade-${beybladeId}-${Date.now()}.png`;
    const folder = 'beyblades';
    const userId = 'admin'; // TODO: Get from session/auth

    const metadata = await storageService.uploadFile(
      buffer,
      filename,
      folder,
      userId,
      'image/png',
      true // Make public
    );

    return NextResponse.json({
      success: true,
      imageUrl: metadata.url,
      metadata,
    });
  } catch (error) {
    console.error('Error uploading Beyblade image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}

/**
 * Seller Product Media API
 * POST /api/seller/products/media - Upload product images/videos to Firebase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../_lib/database/admin';
import { getStorage } from 'firebase-admin/storage';
import { AuthorizationError, ValidationError } from '../../../_lib/middleware/error-handler';

/**
 * Verify seller authentication
 */
async function verifySellerAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'seller' && role !== 'admin') {
      throw new AuthorizationError('Seller access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'seller' | 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * POST /api/seller/products/media
 * Upload product images and videos to Firebase Storage
 */
export async function POST(request: NextRequest) {
  try {
    // Verify seller authentication
    const seller = await verifySellerAuth(request);
    const sellerId = seller.uid;

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const slug = formData.get('slug') as string;
    const type = formData.get('type') as string; // 'image' or 'video'

    // Validate inputs
    if (!files || files.length === 0) {
      throw new ValidationError('No files provided');
    }

    if (!slug) {
      throw new ValidationError('Product slug is required');
    }

    if (!slug.startsWith('buy-')) {
      throw new ValidationError("Invalid slug format - must start with 'buy-'");
    }

    if (!type || !['image', 'video'].includes(type)) {
      throw new ValidationError("Type must be 'image' or 'video'");
    }

    const bucket = getStorage().bucket();
    const uploadedFiles: Array<{
      url: string;
      path: string;
      name: string;
      size: number;
      type: string;
    }> = [];

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file size: 10MB for images, 50MB for videos
      const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new ValidationError(
          `File ${file.name} exceeds maximum size of ${type === 'video' ? '50MB' : '10MB'}`
        );
      }

      // Validate file type
      if (type === 'image' && file.type && !file.type.startsWith('image/')) {
        throw new ValidationError(`File ${file.name} is not an image`);
      }

      if (type === 'video' && file.type && !file.type.startsWith('video/')) {
        throw new ValidationError(`File ${file.name} is not a video`);
      }

      // Generate file path
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName =
        type === 'image'
          ? `img${i + 1}-${timestamp}.${extension}`
          : `v${i + 1}-${timestamp}.${extension}`;

      const filePath = `sellers/${sellerId}/products/${slug}/${fileName}`;

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Firebase Storage
      const fileRef = bucket.file(filePath);
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: {
            uploadedBy: sellerId,
            uploadedAt: new Date().toISOString(),
            originalName: file.name,
          },
        },
      });

      // Make file publicly accessible
      await fileRef.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      uploadedFiles.push({
        url: publicUrl,
        path: filePath,
        name: fileName,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json({
      success: true,
      data: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    });
  } catch (error: any) {
    console.error('Error in POST /api/seller/products/media:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

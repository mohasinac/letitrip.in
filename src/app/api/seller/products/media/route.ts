import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/database/admin";
import { getStorage } from "firebase-admin/storage";

/**
 * POST /api/seller/products/media
 * Upload product images and videos to Firebase Storage
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    const sellerId = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can upload
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Seller access required" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as string; // 'image' or 'video'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Product slug is required" },
        { status: 400 }
      );
    }

    // Validate slug format (must start with 'buy-')
    if (!slug.startsWith("buy-")) {
      return NextResponse.json(
        { success: false, error: "Invalid slug format - must start with 'buy-'" },
        { status: 400 }
      );
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
      
      // Validate file size
      const maxSize = type === "video" ? 20 * 1024 * 1024 : 5 * 1024 * 1024; // 20MB for videos, 5MB for images
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: `File ${file.name} exceeds maximum size of ${type === "video" ? "20MB" : "5MB"}`,
          },
          { status: 400 }
        );
      }

      // Validate file type
      if (type === "image" && !file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} is not an image` },
          { status: 400 }
        );
      }

      if (type === "video" && !file.type.startsWith("video/")) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} is not a video` },
          { status: 400 }
        );
      }

      // Generate file path
      const timestamp = Date.now();
      const extension = file.name.split(".").pop();
      const fileName = type === "image" 
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
    console.error("Error uploading media:", error);

    // Handle specific Firebase errors
    if (error.code === "auth/id-token-expired") {
      return NextResponse.json(
        { success: false, error: "Token expired - Please login again" },
        { status: 401 }
      );
    }

    if (error.code === "auth/argument-error") {
      return NextResponse.json(
        { success: false, error: "Invalid token format" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload media",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

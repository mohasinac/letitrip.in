import { NextRequest, NextResponse } from "next/server";
import { getStorageAdmin } from "@/app/api/lib/firebase/admin";

export const runtime = "nodejs";

/**
 * DELETE /api/media/delete
 * Delete a file from Firebase Storage
 *
 * Body: { path: string } or { url: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, url } = body;

    if (!path && !url) {
      return NextResponse.json(
        { success: false, error: "Either path or url is required" },
        { status: 400 },
      );
    }

    const storage = getStorageAdmin();
    const bucketName =
      process.env.FIREBASE_STORAGE_BUCKET ||
      `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;

    if (!bucketName) {
      return NextResponse.json(
        { success: false, error: "Storage bucket not configured" },
        { status: 500 },
      );
    }

    const bucket = storage.bucket(bucketName);

    // Extract path from URL if URL is provided
    let filePath = path;
    if (url && !path) {
      // Extract path from Firebase Storage URL
      // Format: https://storage.googleapis.com/BUCKET/PATH
      const match = url.match(/googleapis\.com\/[^/]+\/(.+)/);
      if (match) {
        filePath = decodeURIComponent(match[1]);
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid URL format" },
          { status: 400 },
        );
      }
    }

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: "Could not determine file path" },
        { status: 400 },
      );
    }

    const fileRef = bucket.file(filePath);

    // Check if file exists
    const [exists] = await fileRef.exists();
    if (!exists) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 },
      );
    }

    // Delete the file
    await fileRef.delete();

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      path: filePath,
    });
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/media/delete
 * Alternative method for DELETE (for compatibility)
 */
export async function POST(request: NextRequest) {
  return DELETE(request);
}

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";
import { getAdminStorage, getAdminDb } from "@/lib/database/admin";
import { v4 as uuidv4 } from "uuid";

// Next.js 13+ route configuration
export const runtime = 'nodejs';
export const maxDuration = 60; // Max execution time in seconds

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";
    const slug = (formData.get("slug") as string) || null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename - use slug if provided, otherwise use UUID
    const extension = file.name.split(".").pop() || "jpg";
    const filename = slug ? `${slug}.${extension}` : `${uuidv4()}.${extension}`;
    const filepath = `${folder}/${filename}`;

    // Upload to Firebase Storage
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const fileRef = bucket.file(filepath);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy: user.uid,
          uploadedAt: new Date().toISOString(),
        },
      },
      public: true,
    });

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filepath}`;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename,
        filepath,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload image",
      },
      { status: 500 }
    );
  }
}

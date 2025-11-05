/**
 * API Route: Upload Beyblade Image
 * POST /api/beyblades/upload-image (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "../../_lib/database/admin";
import { verifyAdminSession } from "../../_lib/auth/admin-auth";
import { AuthorizationError, ValidationError } from "../../_lib/middleware/error-handler";

const storage = getAdminStorage();

/**
 * POST /api/beyblades/upload-image
 * Upload beyblade image (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const beybladeId = formData.get("beybladeId") as string;

    // Validate file
    if (!file) {
      throw new ValidationError("No file provided");
    }

    // Validate beybladeId
    if (!beybladeId) {
      throw new ValidationError("No Beyblade ID provided");
    }

    // Validate file type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError(
        "Invalid file type. Only PNG, JPG, SVG, and WebP are allowed."
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new ValidationError("File size exceeds 10MB limit");
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename
    const ext = file.type.split("/")[1];
    const filename = `beyblade-${beybladeId}-${Date.now()}.${ext}`;

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileRef = bucket.file(`beyblades/${filename}`);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
      public: true,
    });

    // Make the file publicly accessible
    await fileRef.makePublic();

    // Get public URL
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/beyblades/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading beyblade image:", error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message.includes("Missing or invalid") ? 401 : 403 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload image",
      },
      { status: 500 }
    );
  }
}

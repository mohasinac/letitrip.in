import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/database/admin";

export const config = {
  api: {
    responseLimit: "50mb",
  },
};

/**
 * GET /api/storage/get
 * 
 * Retrieves images from Firebase Storage with caching support
 * 
 * Query Parameters:
 * - path: The file path in storage (e.g., "uploads/image-uuid.jpg")
 * - cache: Cache duration in seconds (default: 86400 = 24 hours)
 * 
 * Response Headers:
 * - Cache-Control: Set based on cache parameter for browser/CDN caching
 * - Content-Type: Image MIME type
 * - ETag: For cache validation
 * 
 * Examples:
 * - GET /api/storage/get?path=uploads/abc123.jpg
 * - GET /api/storage/get?path=uploads/abc123.jpg&cache=3600
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const cacheDuration = searchParams.get("cache") || "86400"; // 24 hours default

    // Validate path parameter
    if (!path) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: path" },
        { status: 400 }
      );
    }

    // Prevent directory traversal attacks
    if (path.includes("..") || path.startsWith("/")) {
      return NextResponse.json(
        { success: false, error: "Invalid path" },
        { status: 400 }
      );
    }

    // Parse cache duration (must be a positive number)
    let cacheSeconds = parseInt(cacheDuration, 10);
    if (isNaN(cacheSeconds) || cacheSeconds < 0) {
      cacheSeconds = 86400; // Default to 24 hours
    }
    if (cacheSeconds > 2592000) {
      cacheSeconds = 2592000; // Max 30 days
    }

    // Get file from Firebase Storage
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const fileRef = bucket.file(path);

    // Check if file exists
    const [exists] = await fileRef.exists();
    if (!exists) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // Get file metadata
    const [metadata] = await fileRef.getMetadata();
    const contentType = metadata.contentType || "application/octet-stream";
    const fileSize = metadata.size || 0;
    const lastModified = metadata.updated
      ? new Date(metadata.updated).toUTCString()
      : undefined;
    const etag = metadata.etag || "";

    // Check If-None-Match header for ETag caching
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    // Download the file
    const [buffer] = await fileRef.download();

    // Return file with cache headers
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Cache-Control": `public, max-age=${cacheSeconds}, immutable`,
        "ETag": etag,
        ...(lastModified && { "Last-Modified": lastModified }),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });

    return response;
  } catch (error: any) {
    console.error("Storage get error:", error);

    // Return 500 error for server-side issues
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve image",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
      "Access-Control-Max-Age": "86400",
    },
  });
}

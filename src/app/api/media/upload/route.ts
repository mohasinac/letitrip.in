/**
 * Media Upload API Route
 *
 * Upload files to Firebase Cloud Storage
 */

import { NextRequest } from "next/server";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import {
  validateRequestBody,
  formatZodErrors,
  mediaUploadRequestSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError } from "@/lib/errors";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";
import { getStorage } from "@/lib/firebase/admin";

/**
 * POST /api/media/upload
 *
 * Upload media file to Cloud Storage
 * Requires authentication
 *
 * Body (multipart/form-data):
 * - file: File (required)
 * - folder: string (optional) - Storage folder path
 * - public: boolean (optional) - Make file publicly accessible
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string | null;
    const isPublic = formData.get("public") === "true";

    // Validate file exists
    if (!file) {
      return errorResponse(ERROR_MESSAGES.MEDIA.NO_FILE, 400);
    }

    // Validate file type and size
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    if (!allowedTypes.includes(file.type)) {
      return errorResponse(ERROR_MESSAGES.UPLOAD.INVALID_TYPE, 400, {
        allowed: "JPEG, PNG, GIF, WebP, MP4, WebM, QuickTime",
        received: file.type,
      });
    }

    // Validate file size (max 10MB for images, 50MB for videos)
    const isVideo = allowedVideoTypes.includes(file.type);
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB or 10MB

    if (file.size > maxSize) {
      return errorResponse(ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE, 400, {
        maxSize: isVideo ? "50MB" : "10MB",
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Determine storage path
    const basePath = folder || "uploads";
    const storagePath = `${basePath}/${user.uid}/${filename}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket();
    const fileRef = bucket.file(storagePath);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy: user.uid,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      },
      public: isPublic,
    });

    // Generate download URL
    let downloadURL: string;
    if (isPublic) {
      await fileRef.makePublic();
      downloadURL = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    } else {
      const [signedUrl] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      downloadURL = signedUrl;
    }

    return successResponse(
      {
        url: downloadURL,
        path: storagePath,
        filename,
        size: file.size,
        type: file.type,
        isPublic,
        uploadedBy: user.uid,
        uploadedAt: new Date().toISOString(),
      },
      SUCCESS_MESSAGES.UPLOAD.FILE_UPLOADED,
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

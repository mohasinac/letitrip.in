import "@/providers.config";
/**
 * Media Upload API Route
 *
 * Upload files to Firebase Cloud Storage
 */

import { randomBytes } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { successResponse, errorResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";
import { getStorage } from "@/lib/firebase/admin";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import {
  formatFileSize,
  generateMediaFilename,
  type MediaFilenameContext,
} from "@/utils";

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
 * - context: string (optional) - JSON-encoded MediaFilenameContext for SEO filename
 *   e.g. {"type":"product-image","name":"iPhone 15 Pro","category":"Smartphones","store":"TechStore","index":1}
 */
export const POST = createRouteHandler({
  auth: true,
  // No JSON schema — body is multipart/form-data; parsed below via request.formData()
  handler: async ({ user, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string | null;
    const isPublic = formData.get("public") === "true";
    const contextRaw = formData.get("context") as string | null;

    // Validate file exists
    if (!file) {
      return errorResponse(ERROR_MESSAGES.MEDIA.NO_FILE, 400);
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    // Convert file to buffer early so we can inspect magic bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Server-side magic byte detection — cannot be spoofed by the client
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected || !allowedTypes.includes(detected.mime)) {
      return errorResponse(ERROR_MESSAGES.UPLOAD.INVALID_TYPE, 400, {
        allowed: "JPEG, PNG, GIF, WebP, MP4, WebM, QuickTime",
        detected: detected?.mime ?? "unknown",
      });
    }

    // Use server-detected MIME type for storage, not client-supplied file.type
    const detectedMime = detected.mime;
    const isVideo = allowedVideoTypes.includes(detectedMime);
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB or 10MB

    if (file.size > maxSize) {
      return errorResponse(ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE, 400, {
        maxSize: isVideo ? "50MB" : "10MB",
        fileSize: formatFileSize(file.size),
      });
    }

    // Generate SEO-friendly filename when context is supplied, otherwise
    // fall back to a cryptographically random name (safe for anonymous uploads).
    let filename: string;
    if (contextRaw) {
      let ctx: MediaFilenameContext | null = null;
      try {
        ctx = JSON.parse(contextRaw) as MediaFilenameContext;
      } catch {
        // Malformed context — fall back silently; no sensitive info leaked
      }
      if (ctx && typeof ctx === "object" && "type" in ctx) {
        // Force the correct extension from the server-detected MIME type
        const mimeToExt: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/jpg": "jpg",
          "image/png": "png",
          "image/gif": "gif",
          "image/webp": "webp",
          "video/mp4": "mp4",
          "video/webm": "webm",
          "video/quicktime": "mov",
        };
        const detectedExt = mimeToExt[detectedMime] ?? detected.ext;
        // Inject the server-verified extension into the context
        filename = generateMediaFilename({ ...ctx, ext: detectedExt });
      } else {
        const randomString = randomBytes(6).toString("hex");
        filename = `${Date.now()}-${randomString}.${detected.ext}`;
      }
    } else {
      const randomString = randomBytes(6).toString("hex");
      filename = `${Date.now()}-${randomString}.${detected.ext}`;
    }

    // Determine storage path
    const basePath = folder || "uploads";
    const storagePath = `${basePath}/${user!.uid}/${filename}`;

    // Upload to Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket();
    const fileRef = bucket.file(storagePath);

    await fileRef.save(buffer, {
      metadata: {
        contentType: detectedMime,
        metadata: {
          uploadedBy: user!.uid,
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

    serverLogger.info("Media uploaded", {
      uid: user!.uid,
      path: storagePath,
      mime: detectedMime,
      size: file.size,
    });

    return successResponse(
      {
        url: downloadURL,
        path: storagePath,
        filename,
        size: file.size,
        type: detectedMime,
        isPublic,
        uploadedBy: user!.uid,
        uploadedAt: new Date().toISOString(),
      },
      SUCCESS_MESSAGES.UPLOAD.FILE_UPLOADED,
      201,
    );
  },
});

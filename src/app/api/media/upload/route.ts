import { withProviders } from "@/providers.config";
import { randomBytes } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { getAdminStorage as getStorage } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit";
import {
  formatFileSize, generateMediaFilename } from "@mohasinac/appkit";
import type { MediaFilenameContext } from "@mohasinac/appkit";

/**
 * Media Upload API Route
 *
 * Upload files to Firebase Cloud Storage
 */

const PRODUCT_IMAGE_MAX = 5;
const PRODUCT_VIDEO_MAX = 1;
const REVIEW_IMAGE_MAX = 5;
const REVIEW_VIDEO_MAX = 1;
const AUCTION_IMAGE_MAX = 5;
const PREORDER_IMAGE_MAX = 5;
const EVENT_COVER_MAX = 1;
const EVENT_IMAGE_MAX = 10;
const EVENT_WINNER_IMAGE_MAX = 5;
const EVENT_ADDITIONAL_IMAGE_MAX = 10;
const BLOG_COVER_MAX = 1;
const BLOG_CONTENT_IMAGE_MAX = 10;
const BLOG_ADDITIONAL_IMAGE_MAX = 5;
const RICH_TEXT_IMAGE_MAX = 20;
const TMP_UPLOAD_PREFIX = "tmp";

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
export const POST = withProviders(createRouteHandler({
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
    let parsedContext: MediaFilenameContext | null = null;
    if (contextRaw) {
      let ctx: MediaFilenameContext | null = null;
      try {
        ctx = JSON.parse(contextRaw) as MediaFilenameContext;
      } catch {
        // Malformed context — fall back silently; no sensitive info leaked
      }
      if (ctx && typeof ctx === "object" && "type" in ctx) {
        parsedContext = ctx;

        // Product media guardrails: max 5 images, max 1 video.
        if (ctx.type === "product-image") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > PRODUCT_IMAGE_MAX) {
            return errorResponse("Product image index exceeds max allowed", 400, {
              maxImages: PRODUCT_IMAGE_MAX,
              receivedIndex: imageIndex,
            });
          }
        }

        if (ctx.type === "product-video") {
          const videoIndex = ctx.index ?? 1;
          if (videoIndex < 1 || videoIndex > PRODUCT_VIDEO_MAX) {
            return errorResponse("Only one product video is allowed", 400, {
              maxVideos: PRODUCT_VIDEO_MAX,
              receivedIndex: videoIndex,
            });
          }
        }

        // Review media guardrails: max 5 images, max 1 video.
        if (ctx.type === "review-image") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > REVIEW_IMAGE_MAX) {
            return errorResponse("Review image index exceeds max allowed", 400, {
              maxImages: REVIEW_IMAGE_MAX,
              receivedIndex: imageIndex,
            });
          }
        }

        if (ctx.type === "review-video") {
          // REVIEW_VIDEO_MAX = 1; index is always implicitly 1 — no index check needed
          if (!isVideo) {
            return errorResponse("review-video context requires a video file", 400);
          }
        }

        // Auction media guardrails: max 5 images.
        if (ctx.type === "auction-image") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > AUCTION_IMAGE_MAX) {
            return errorResponse("Auction image index exceeds max allowed", 400, {
              maxImages: AUCTION_IMAGE_MAX,
              receivedIndex: imageIndex,
            });
          }
        }

        // Pre-order media guardrails: max 5 images.
        if (ctx.type === "preorder-image") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > PREORDER_IMAGE_MAX) {
            return errorResponse(
              "Pre-order image index exceeds max allowed",
              400,
              { maxImages: PREORDER_IMAGE_MAX, receivedIndex: imageIndex },
            );
          }
        }

        if (ctx.type === "event-cover") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > EVENT_COVER_MAX) {
            return errorResponse("Only one event cover image is allowed", 400, {
              maxImages: EVENT_COVER_MAX,
              receivedIndex: imageIndex,
            });
          }
        }

        if (ctx.type === "event-image") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > EVENT_IMAGE_MAX) {
            return errorResponse("Event image index exceeds max allowed", 400, {
              maxImages: EVENT_IMAGE_MAX,
              receivedIndex: imageIndex,
            });
          }
        }

        if (ctx.type === "event-winner-image") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > EVENT_WINNER_IMAGE_MAX) {
            return errorResponse(
              "Event winner image index exceeds max allowed",
              400,
              {
                maxImages: EVENT_WINNER_IMAGE_MAX,
                receivedIndex: imageIndex,
              },
            );
          }
        }

        if (ctx.type === "event-additional-image") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > EVENT_ADDITIONAL_IMAGE_MAX) {
            return errorResponse(
              "Event additional image index exceeds max allowed",
              400,
              {
                maxImages: EVENT_ADDITIONAL_IMAGE_MAX,
                receivedIndex: imageIndex,
              },
            );
          }
        }

        if (ctx.type === "blog-cover") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > BLOG_COVER_MAX) {
            return errorResponse("Only one blog cover image is allowed", 400, {
              maxImages: BLOG_COVER_MAX,
              receivedIndex: imageIndex,
            });
          }
        }

        if (ctx.type === "blog-content-image") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > BLOG_CONTENT_IMAGE_MAX) {
            return errorResponse(
              "Blog content image index exceeds max allowed",
              400,
              {
                maxImages: BLOG_CONTENT_IMAGE_MAX,
                receivedIndex: imageIndex,
              },
            );
          }
        }

        if (ctx.type === "blog-additional-image") {
          const imageIndex = ctx.index ?? 1;
          if (imageIndex < 1 || imageIndex > BLOG_ADDITIONAL_IMAGE_MAX) {
            return errorResponse(
              "Blog additional image index exceeds max allowed",
              400,
              {
                maxImages: BLOG_ADDITIONAL_IMAGE_MAX,
                receivedIndex: imageIndex,
              },
            );
          }
        }

        if (ctx.type === "rich-text-image") {
          const imageIndex = ctx.index ?? 1;
          if (isVideo) {
            return errorResponse("rich-text-image context requires an image file", 400);
          }
          if (imageIndex < 1 || imageIndex > RICH_TEXT_IMAGE_MAX) {
            return errorResponse(
              "Rich text image index exceeds max allowed",
              400,
              {
                maxImages: RICH_TEXT_IMAGE_MAX,
                receivedIndex: imageIndex,
              },
            );
          }
        }

        // Image-only contexts — reject video uploads.
        if (
          ctx.type === "store-logo" ||
          ctx.type === "store-banner" ||
          ctx.type === "user-avatar" ||
          ctx.type === "event-cover" ||
          ctx.type === "event-image" ||
          ctx.type === "event-winner-image" ||
          ctx.type === "event-additional-image" ||
          ctx.type === "blog-cover" ||
          ctx.type === "blog-content-image" ||
          ctx.type === "blog-additional-image"
        ) {
          if (isVideo) {
            return errorResponse(
              `${ctx.type} must be an image file, not a video`,
              400,
            );
          }
        }

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
        if (ctx.type === "invoice" || ctx.type === "payout-doc") {
          filename = generateMediaFilename(ctx);
        } else {
          filename = generateMediaFilename({ ...ctx, ext: detectedExt });
        }
      } else {
        const randomString = randomBytes(6).toString("hex");
        filename = `${Date.now()}-${randomString}.${detected.ext}`;
      }
    } else {
      const randomString = randomBytes(6).toString("hex");
      filename = `${Date.now()}-${randomString}.${detected.ext}`;
    }

    // Determine storage path.
    // New uploads are always staged under tmp/* until entity save finalization.
    const folderInput = (folder || "uploads").replace(/^\/+|\/+$/g, "");
    const basePath =
      folderInput === TMP_UPLOAD_PREFIX ||
      folderInput.startsWith(`${TMP_UPLOAD_PREFIX}/`)
        ? folderInput
        : `${TMP_UPLOAD_PREFIX}/${folderInput}`;
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
      mediaType: parsedContext?.type,
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
}));


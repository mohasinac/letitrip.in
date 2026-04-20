import "@/providers.config";
import { randomBytes } from "crypto";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { cropDataSchema } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { getAdminStorage as getStorage } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit";
import { generateCroppedImageFilename } from "@mohasinac/appkit";

/**
 * Media Crop API Route
 *
 * Crop images using sharp library
 */

import sharp from "sharp";
import axios from "axios";

/**
 * POST /api/media/crop
 *
 * Crop an image
 * Requires authentication
 *
 * Body:
 * - sourceUrl: string (required) — Must be an approved CDN/Storage domain
 * - x: number (required) - Crop X position
 * - y: number (required) - Crop Y position
 * - width: number (required) - Crop width
 * - height: number (required) - Crop height
 * - outputFolder?: string - Output folder path
 * - outputFormat?: 'jpeg' | 'png' | 'webp' - Output format (default: original)
 * - quality?: number (1-100) - Output quality (default: 90)
 */
export const POST = createRouteHandler<(typeof cropDataSchema)["_output"]>({
  auth: true,
  schema: cropDataSchema,
  handler: async ({ request, user, body }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const {
      sourceUrl,
      x,
      y,
      width,
      height,
      outputFolder = "cropped",
      outputFormat,
      quality = 90,
    } = body!;

    // Download source image
    const response = await axios.get(sourceUrl, {
      responseType: "arraybuffer",
    });
    const sourceBuffer = Buffer.from(response.data);

    // Detect original format if not specified
    const metadata = await sharp(sourceBuffer).metadata();
    const originalFormat = metadata.format || "png";
    const finalFormat =
      (outputFormat as "jpeg" | "png" | "webp") || originalFormat;

    // Crop image
    let pipeline = sharp(sourceBuffer).extract({
      left: x,
      top: y,
      width,
      height,
    });

    // Convert format if specified
    if (finalFormat === "jpeg") {
      pipeline = pipeline.jpeg({ quality });
    } else if (finalFormat === "png") {
      pipeline = pipeline.png({ quality });
    } else if (finalFormat === "webp") {
      pipeline = pipeline.webp({ quality });
    } else {
      pipeline = pipeline.png();
    }

    const croppedBuffer = await pipeline.toBuffer();

    // Derive an SEO-friendly filename from the source URL so the cropped file
    // is clearly related to its origin (e.g. product-iphone-15-pro-...-cropped.webp).
    // Fall back to a random name if the source URL path is opaque.
    const sourcePathSegment =
      new URL(sourceUrl).pathname.split("/").pop() ?? "";
    const filename = sourcePathSegment
      ? generateCroppedImageFilename(sourcePathSegment, finalFormat)
      : `cropped-${Date.now()}-${randomBytes(6).toString("hex")}.${finalFormat}`;

    // Upload to storage
    const storage = getStorage();
    const bucket = storage.bucket();
    const uploadPath = `${outputFolder}/${user!.uid}/${filename}`;
    const file = bucket.file(uploadPath);

    await file.save(croppedBuffer, {
      metadata: {
        contentType: `image/${finalFormat}`,
        customMetadata: {
          uploadedBy: user!.uid,
          croppedFrom: sourceUrl,
          cropData: JSON.stringify({ x, y, width, height }),
          originalFormat: originalFormat,
          croppedAt: new Date().toISOString(),
        },
      },
    } as any);

    // Generate signed URL (7 days)
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    serverLogger.info("Image cropped and uploaded", {
      uid: user!.uid,
      path: uploadPath,
      format: finalFormat,
    });

    return successResponse(
      {
        url: signedUrl,
        path: uploadPath,
        filename,
        cropData: { x, y, width, height },
        format: finalFormat,
        quality,
        size: croppedBuffer.length,
      },
      SUCCESS_MESSAGES.MEDIA.IMAGE_CROPPED,
    );
  },
});


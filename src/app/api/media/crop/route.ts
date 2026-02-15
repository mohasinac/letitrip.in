/**
 * Media Crop API Route
 *
 * Crop images using sharp library
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import {
  validateRequestBody,
  formatZodErrors,
  cropDataSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { getStorage } from "@/lib/firebase/admin";
import sharp from "sharp";
import axios from "axios";

/**
 * POST /api/media/crop
 *
 * Crop an image
 * Requires authentication
 *
 * Body:
 * - sourceUrl: string (required) - Source image URL or path
 * - x: number (required) - Crop X position
 * - y: number (required) - Crop Y position
 * - width: number (required) - Crop width
 * - height: number (required) - Crop height
 * - outputFolder?: string - Output folder path
 * - outputFormat?: 'jpeg' | 'png' | 'webp' - Output format (default: original)
 * - quality?: number (1-100) - Output quality (default: 90)
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(cropDataSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.VALIDATION.FAILED,
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 },
      );
    }

    const {
      sourceUrl,
      x,
      y,
      width,
      height,
      outputFolder = "cropped",
      outputFormat,
      quality = 90,
    } = validation.data;

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

    // Generate output filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `cropped-${timestamp}-${randomString}.${finalFormat}`;

    // Upload to storage
    const storage = getStorage();
    const bucket = storage.bucket();
    const uploadPath = `${outputFolder}/${user.uid}/${filename}`;
    const file = bucket.file(uploadPath);

    await file.save(croppedBuffer, {
      metadata: {
        contentType: `image/${finalFormat}`,
        customMetadata: {
          uploadedBy: user.uid,
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

    return NextResponse.json(
      {
        success: true,
        data: {
          url: signedUrl,
          path: uploadPath,
          filename,
          cropData: { x, y, width, height },
          format: finalFormat,
          quality,
          size: croppedBuffer.length,
        },
        message: SUCCESS_MESSAGES.MEDIA.IMAGE_CROPPED,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    serverLogger.error(ERROR_MESSAGES.API.MEDIA_CROP_ERROR, { error });
    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.MEDIA.CROP_FAILED,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Media Trim API Route
 *
 * Trim videos using ffmpeg
 */

import { NextRequest } from "next/server";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import {
  validateRequestBody,
  formatZodErrors,
  trimDataSchema,
} from "@/lib/validation/schemas";
import { serverLogger } from "@/lib/server-logger";
import { ApiErrors, errorResponse, successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors/error-handler";
import { getStorage } from "@/lib/firebase/admin";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import axios from "axios";

/**
 * POST /api/media/trim
 *
 * Trim a video
 * Requires authentication
 *
 * Body:
 * - sourceUrl: string (required) - Source video URL or path
 * - startTime: number (required) - Start time in seconds
 * - endTime: number (required) - End time in seconds
 * - outputFolder?: string - Output folder path
 * - outputFormat?: 'mp4' | 'webm' - Output format (default: 'mp4')
 * - quality?: 'low' | 'medium' | 'high' - Output quality (default: 'medium')
 */
export async function POST(request: NextRequest) {
  let tempInputFile: string | null = null;
  let tempOutputFile: string | null = null;

  try {
    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(trimDataSchema, body);

    if (!validation.success) {
      return ApiErrors.validationError(formatZodErrors(validation.errors));
    }

    const {
      sourceUrl,
      startTime,
      endTime,
      outputFolder = "trimmed",
      outputFormat = "mp4",
      quality = "medium",
    } = validation.data;

    // Validate time range
    if (startTime >= endTime) {
      return errorResponse(ERROR_MESSAGES.VALIDATION.INVALID_TIME_RANGE, 400, {
        message: "Start time must be less than end time",
        startTime,
        endTime,
      });
    }

    // Download source video
    serverLogger.info("Downloading video from source", { sourceUrl });
    const response = await axios.get(sourceUrl, {
      responseType: "arraybuffer",
    });
    const videoBuffer = Buffer.from(response.data);

    // Create temporary files
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    tempInputFile = path.join(tempDir, `input-${timestamp}-${randomStr}.mp4`);
    tempOutputFile = path.join(
      tempDir,
      `output-${timestamp}-${randomStr}.${outputFormat}`,
    );

    // Write input video to temp file
    fs.writeFileSync(tempInputFile, videoBuffer);
    serverLogger.info("Wrote input video to temp file", {
      path: tempInputFile,
    });

    // Quality settings
    const qualitySettings: Record<
      string,
      { videoBitrate: string; audioBitrate: string }
    > = {
      low: { videoBitrate: "500k", audioBitrate: "64k" },
      medium: { videoBitrate: "1000k", audioBitrate: "128k" },
      high: { videoBitrate: "2500k", audioBitrate: "192k" },
    };

    const settings =
      qualitySettings[quality as string] || qualitySettings.medium;
    const duration = endTime - startTime;

    // Trim video using ffmpeg
    serverLogger.info("Starting video trim operation", {
      startTime,
      endTime,
      duration,
      quality,
      outputFormat,
    });

    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputFile!)
        .seekInput(startTime)
        .duration(duration)
        .videoBitrate(settings.videoBitrate)
        .audioBitrate(settings.audioBitrate)
        .toFormat(outputFormat)
        .output(tempOutputFile!)
        .on("end", () => {
          serverLogger.info("FFmpeg trimming completed");
          resolve();
        })
        .on("error", (err: any) => {
          serverLogger.error("FFmpeg error", { error: err.message });
          reject(err);
        })
        .run();
    });

    // Read trimmed video
    const trimmedBuffer = fs.readFileSync(tempOutputFile);
    serverLogger.info("Read trimmed video from temp file", {
      size: trimmedBuffer.length,
    });

    // Upload to storage
    const storage = getStorage();
    const bucket = storage.bucket();
    const filename = `trimmed-${timestamp}-${randomStr}.${outputFormat}`;
    const uploadPath = `${outputFolder}/${user.uid}/${filename}`;
    const file = bucket.file(uploadPath);

    await file.save(trimmedBuffer, {
      metadata: {
        contentType: `video/${outputFormat}`,
        customMetadata: {
          uploadedBy: user.uid,
          trimmedFrom: sourceUrl,
          trimData: JSON.stringify({ startTime, endTime, duration }),
          quality,
          trimmedAt: new Date().toISOString(),
        },
      },
    } as any);

    serverLogger.info("Uploaded trimmed video to storage", {
      path: uploadPath,
    });

    // Generate signed URL (7 days)
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(
      {
        url: signedUrl,
        path: uploadPath,
        filename,
        trimData: { startTime, endTime, duration },
        format: outputFormat,
        quality,
        size: trimmedBuffer.length,
      },
      SUCCESS_MESSAGES.MEDIA.VIDEO_TRIMMED,
    );
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.MEDIA_TRIM_ERROR, { error });
    return handleApiError(error);
  } finally {
    // Cleanup temporary files
    if (tempInputFile && fs.existsSync(tempInputFile)) {
      try {
        fs.unlinkSync(tempInputFile);
        serverLogger.info("Deleted temp input file");
      } catch (err) {
        serverLogger.error("Failed to delete temp input file", { error: err });
      }
    }
    if (tempOutputFile && fs.existsSync(tempOutputFile)) {
      try {
        fs.unlinkSync(tempOutputFile);
        serverLogger.info("Deleted temp output file");
      } catch (err) {
        serverLogger.error("Failed to delete temp output file", { error: err });
      }
    }
  }
}

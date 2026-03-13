/**
 * Media Trim API Route
 *
 * Trim videos using ffmpeg
 */

import { randomBytes } from "crypto";
import { SUCCESS_MESSAGES } from "@/constants";
import { trimDataSchema } from "@/lib/validation/schemas";
import { serverLogger } from "@/lib/server-logger";
import { successResponse } from "@/lib/api-response";
import { getStorage } from "@/lib/firebase/admin";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";
import { generateTrimmedVideoFilename } from "@/utils";
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
 * - sourceUrl: string (required) — Must be an approved CDN/Storage domain
 * - startTime: number (required) - Start time in seconds
 * - endTime: number (required) - End time in seconds (must be > startTime)
 * - outputFolder?: string - Output folder path
 * - outputFormat?: 'mp4' | 'webm' - Output format (default: 'mp4')
 * - quality?: 'low' | 'medium' | 'high' - Output quality (default: 'medium')
 */
export const POST = createApiHandler<(typeof trimDataSchema)["_output"]>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  schema: trimDataSchema,
  handler: async ({ user, body }) => {
    let tempInputFile: string | null = null;
    let tempOutputFile: string | null = null;

    try {
      const {
        sourceUrl,
        startTime,
        endTime,
        outputFolder = "trimmed",
        outputFormat = "mp4",
        quality = "medium",
      } = body!;

      // Validate time range checked by schema refine — no duplicate needed

      // Download source video
      serverLogger.info("Downloading video from source", { sourceUrl });
      const response = await axios.get(sourceUrl, {
        responseType: "arraybuffer",
      });
      const videoBuffer = Buffer.from(response.data);

      // Create temporary files with cryptographically random names
      const tempDir = os.tmpdir();
      const timestamp = Date.now();
      const randomStr = randomBytes(6).toString("hex");
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
      // Derive SEO-friendly filename from the source URL so the trimmed file
      // stays clearly related to its origin (e.g. product-...-video-1-trimmed.mp4).
      const sourcePathSegment =
        new URL(sourceUrl).pathname.split("/").pop() ?? "";
      const filename = sourcePathSegment
        ? generateTrimmedVideoFilename(sourcePathSegment, outputFormat)
        : `trimmed-${timestamp}-${randomStr}.${outputFormat}`;
      const uploadPath = `${outputFolder}/${user!.uid}/${filename}`;
      const file = bucket.file(uploadPath);

      await file.save(trimmedBuffer, {
        metadata: {
          contentType: `video/${outputFormat}`,
          customMetadata: {
            uploadedBy: user!.uid,
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
    } finally {
      // Cleanup temporary files
      if (tempInputFile && fs.existsSync(tempInputFile)) {
        try {
          fs.unlinkSync(tempInputFile);
          serverLogger.info("Deleted temp input file");
        } catch (err) {
          serverLogger.error("Failed to delete temp input file", {
            error: err,
          });
        }
      }
      if (tempOutputFile && fs.existsSync(tempOutputFile)) {
        try {
          fs.unlinkSync(tempOutputFile);
          serverLogger.info("Deleted temp output file");
        } catch (err) {
          serverLogger.error("Failed to delete temp output file", {
            error: err,
          });
        }
      }
    }
  },
});

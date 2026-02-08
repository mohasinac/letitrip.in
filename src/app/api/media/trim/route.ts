/**
 * Media Trim API Route
 *
 * Trim videos using ffmpeg
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  trimDataSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError } from "@/lib/errors";
import { getStorage } from "@/lib/firebase/admin";

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
  try {
    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(trimDataSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 },
      );
    }

    const {
      sourceUrl,
      startTime,
      endTime,
      outputFolder,
      outputFormat = "mp4",
      quality = "medium",
    } = validation.data;

    // Validate time range
    if (startTime >= endTime) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid time range",
          details: {
            message: "Start time must be less than end time",
            startTime,
            endTime,
          },
        },
        { status: 400 },
      );
    }

    // TODO: Implement video trimming with ffmpeg
    // This is a placeholder implementation that needs ffmpeg installed:
    // npm install fluent-ffmpeg
    // Also requires ffmpeg binary installed on the system

    // For now, return not implemented error with instructions
    return NextResponse.json(
      {
        success: false,
        error: "Video trimming not yet implemented",
        details: {
          message: "This endpoint requires ffmpeg for video processing",
          installation: {
            npm: "npm install fluent-ffmpeg @types/fluent-ffmpeg",
            system:
              "ffmpeg must be installed on the system (https://ffmpeg.org/download.html)",
          },
          implementation: "Video processing requires server-side ffmpeg binary",
        },
        // TODO: Remove this when implemented
        receivedData: {
          sourceUrl,
          trim: {
            startTime,
            endTime,
            duration: endTime - startTime,
          },
          output: { format: outputFormat, quality },
        },
      },
      { status: 501 },
    );

    /* 
    // FUTURE IMPLEMENTATION (when ffmpeg is installed):
    
    const ffmpeg = require('fluent-ffmpeg');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    // Download source video from Storage
    const storage = getStorage();
    const bucket = storage.bucket();
    
    // Extract path from URL or use as path
    const sourcePath = sourceUrl.includes('storage.googleapis.com')
      ? sourceUrl.split(`${bucket.name}/`)[1]
      : sourceUrl;
    
    const sourceFile = bucket.file(sourcePath);
    const [sourceBuffer] = await sourceFile.download();
    
    // Create temporary files
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-${Date.now()}.mp4`);
    const outputPath = path.join(tempDir, `output-${Date.now()}.${outputFormat}`);
    
    // Write input buffer to temp file
    fs.writeFileSync(inputPath, sourceBuffer);
    
    // Determine quality settings
    const qualitySettings = {
      low: { videoBitrate: '500k', audioBitrate: '64k' },
      medium: { videoBitrate: '1000k', audioBitrate: '128k' },
      high: { videoBitrate: '2000k', audioBitrate: '192k' },
    };
    
    const settings = qualitySettings[quality];
    
    // Trim video using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(endTime - startTime)
        .videoBitrate(settings.videoBitrate)
        .audioBitrate(settings.audioBitrate)
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
    
    // Read trimmed video
    const trimmedBuffer = fs.readFileSync(outputPath);
    
    // Cleanup temp files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    
    // Generate output filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `trimmed-${timestamp}-${randomString}.${outputFormat}`;
    
    // Upload trimmed video
    const uploadPath = `${outputFolder || 'trimmed'}/${user.uid}/${filename}`;
    const outputFile = bucket.file(uploadPath);
    
    await outputFile.save(trimmedBuffer, {
      metadata: {
        contentType: `video/${outputFormat}`,
        metadata: {
          uploadedBy: user.uid,
          trimmedFrom: sourcePath,
          trimData: JSON.stringify({ startTime, endTime }),
          quality,
          trimmedAt: new Date().toISOString(),
        },
      },
    });
    
    // Generate signed URL
    const [signedUrl] = await outputFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return NextResponse.json(
      {
        success: true,
        data: {
          url: signedUrl,
          path: uploadPath,
          filename,
          trimData: { startTime, endTime, duration: endTime - startTime },
          format: outputFormat,
          quality,
        },
        message: 'Video trimmed successfully',
      },
      { status: 200 }
    );
    */
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    console.error("POST /api/media/trim error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to trim video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

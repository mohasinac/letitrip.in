/**
 * POST /api/media/sign
 *
 * Issues a Firebase Storage v4 signed PUT URL so the browser can upload
 * media bytes directly to GCS, bypassing the Vercel function (4.5 MB
 * request cap — Rule #6).
 *
 * Body (JSON):
 * - contentType: string (required) — must be in ALLOWED_MIMES
 * - size:        number (required) — declared size in bytes; ≤ kind ceiling
 * - folder?:     string — staging subfolder under tmp/
 * - isPublic?:   boolean — recorded for the finalize step (no effect on the
 *                signed URL itself); the bucket policy + finalize decide
 *                whether to issue a public download URL
 * - context?:    MediaFilenameContext — drives the SEO filename
 *
 * Response:
 * - uploadUrl:   string — v4 signed PUT URL, 15-minute expiry
 * - storagePath: string — `tmp/{folder}/{uid}/{filename}`
 * - filename:    string — SEO filename including extension
 * - contentType: string — echoes the validated request value (must be sent
 *                back as the Content-Type header on the browser PUT)
 *
 * After the browser uploads, it calls POST /api/media/finalize with the
 * storagePath to run the magic-byte check + receive the download URL.
 */

import { withProviders } from "@/providers.config";
import { randomBytes } from "crypto";
import {
  ALLOWED_TYPES_LABEL,
  MAX_BYTES,
  MAX_LABEL,
  classifyMime,
  getConversionHint,
  isAllowedMime,
} from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { getAdminStorage as getStorage } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit";
import { formatFileSize } from "@mohasinac/appkit";
import {
  applyMediaContextGuards,
} from "@mohasinac/appkit/server";
import type { MediaFilenameContext } from "@mohasinac/appkit";

const TMP_UPLOAD_PREFIX = "tmp";
const PDF_FOLDER = "documents";
const DEFAULT_MEDIA_FOLDER = "uploads";
const SIGNED_URL_TTL_MS = 15 * 60 * 1000; // 15 min — enough for slow mobile uploads

interface SignRequestBody {
  contentType?: unknown;
  size?: unknown;
  folder?: unknown;
  isPublic?: unknown;
  context?: unknown;
}

export const POST = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);

    let body: SignRequestBody;
    try {
      body = (await request.json()) as SignRequestBody;
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const contentType = typeof body.contentType === "string" ? body.contentType : "";
    const size = typeof body.size === "number" ? body.size : NaN;
    const folder = typeof body.folder === "string" ? body.folder : null;
    const isPublic = body.isPublic === true;
    const contextInput = body.context;

    if (!isAllowedMime(contentType)) {
      const hint = getConversionHint(contentType);
      return errorResponse(
        hint ?? ERROR_MESSAGES.UPLOAD.INVALID_TYPE,
        400,
        {
          allowed: ALLOWED_TYPES_LABEL,
          detected: contentType || "unknown",
          ...(hint ? { hint } : {}),
        },
      );
    }

    if (!Number.isFinite(size) || size <= 0) {
      return errorResponse("size must be a positive number", 400);
    }
    const kind = classifyMime(contentType)!;
    const maxSize = MAX_BYTES[kind];
    if (size > maxSize) {
      return errorResponse(ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE, 400, {
        maxSize: MAX_LABEL[kind],
        fileSize: formatFileSize(size),
      });
    }
    const isPdf = kind === "pdf";

    let filename: string;
    if (contextInput && typeof contextInput === "object" && "type" in (contextInput as object)) {
      const ctx = contextInput as MediaFilenameContext;
      const guard = applyMediaContextGuards({ detectedMime: contentType, context: ctx });
      if (!guard.ok) return errorResponse(guard.error, guard.status, guard.details);
      filename = guard.filename;
    } else {
      const random = randomBytes(6).toString("hex");
      const ext = contentType.split("/")[1] ?? "bin";
      filename = `${Date.now()}-${random}.${ext}`;
    }

    const defaultFolder = isPdf ? PDF_FOLDER : DEFAULT_MEDIA_FOLDER;
    const folderInput = (folder || defaultFolder).replace(/^\/+|\/+$/g, "");
    const basePath =
      folderInput === TMP_UPLOAD_PREFIX ||
      folderInput.startsWith(`${TMP_UPLOAD_PREFIX}/`)
        ? folderInput
        : `${TMP_UPLOAD_PREFIX}/${folderInput}`;
    const storagePath = `${basePath}/${user!.uid}/${filename}`;

    const storage = getStorage();
    const bucket = storage.bucket();
    const fileRef = bucket.file(storagePath);

    const [uploadUrl] = await fileRef.getSignedUrl({
      version: "v4",
      action: "write",
      contentType,
      expires: Date.now() + SIGNED_URL_TTL_MS,
    });

    serverLogger.info("Media upload URL signed", {
      uid: user!.uid,
      path: storagePath,
      contentType,
      declaredSize: size,
      isPublic,
    });

    return successResponse({
      uploadUrl,
      storagePath,
      filename,
      contentType,
      isPublic,
      expiresAt: new Date(Date.now() + SIGNED_URL_TTL_MS).toISOString(),
    });
  },
}));

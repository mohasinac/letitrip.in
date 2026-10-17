/**
 * POST /api/media/sign
 *
 * Issues a Firebase Storage v4 signed PUT URL so the browser can upload
 * media bytes directly to GCS, bypassing the Vercel function (4.5 MB
 * request cap â€” Rule #6).
 *
 * Body (JSON):
 * - contentType: string (required) â€” must be in ALLOWED_MIMES
 * - size:        number (required) â€” declared size in bytes; â‰¤ kind ceiling
 * - folder?:     string â€” staging subfolder under tmp/
 * - isPublic?:   boolean â€” recorded for the finalize step (no effect on the
 *                signed URL itself); the bucket policy + finalize decide
 *                whether to issue a public download URL
 * - context?:    MediaFilenameContext â€” drives the SEO filename
 *
 * Response:
 * - uploadUrl:   string â€” v4 signed PUT URL, 15-minute expiry
 * - storagePath: string â€” `tmp/{folder}/{uid}/{filename}`
 * - filename:    string â€” SEO filename including extension
 * - contentType: string â€” echoes the validated request value (must be sent
 *                back as the Content-Type header on the browser PUT)
 *
 * After the browser uploads, it calls POST /api/media/finalize with the
 * storagePath to run the magic-byte check + receive the download URL.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withRetry } from "@mohasinac/appkit/http/retry";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import {
  ALLOWED_TYPES_LABEL,
  MAX_BYTES,
  MAX_LABEL,
  classifyMime,
  getConversionHint,
  isAllowedMime,
} from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { getAdminStorage as getStorage } from "@mohasinac/appkit/providers/db-firebase/admin";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { formatFileSize } from "@mohasinac/appkit/utils/number.formatter";
import {
  applyMediaContextGuards,
} from "@mohasinac/appkit/server";
import type { MediaFilenameContext } from "@mohasinac/appkit/utils/id-generators";

const TMP_UPLOAD_PREFIX = "tmp";
const PDF_FOLDER = "documents";
const DEFAULT_MEDIA_FOLDER = "uploads";
const SIGNED_URL_TTL_MS = 15 * 60 * 1000; // 15 min â€” enough for slow mobile uploads

/*
 * The five fields, validated instead of narrowed one `typeof` at a time.
 *
 * The old shape typed every field `JsonValue` and then wrote
 * `typeof body.size === "number" ? body.size : NaN` — which is a narrowing, so
 * it was never UNSAFE, but it meant a client sending `size: "4096"` got `NaN`
 * and a message about the file being too large, rather than a 400 naming the
 * field.
 *
 * 🛑 The byte cap deliberately stays OUT of this schema. `MAX_BYTES` is a
 * `Record<MediaKind, number>` — the limit depends on whether the upload is an
 * image, a video or a PDF — and the kind is only known once
 * `classifyMime(contentType)` has run below. A single number here would have to
 * be the most permissive of the three, which is not a limit. The per-kind check
 * stays where the kind exists.
 *
 * 🛑 `folder` is bounded AND pattern-checked. It is interpolated into the
 * storage object path, so `../` or a leading `/` in it would place the object
 * outside the `tmp/<uid>/` prefix that `/api/media/finalize` later proves
 * ownership from (`pathBelongsToUser`). The previous `typeof === "string"`
 * accepted either.
 */
const signSchema = z.object({
  contentType: z.string().trim().min(1, "contentType is required").max(200),
  size: z.number().int().positive("size must be a positive byte count"),
  folder: z
    .string()
    .trim()
    .max(80)
    .regex(/^[A-Za-z0-9][A-Za-z0-9/_-]*$/, "folder may only contain letters, digits, dashes and slashes")
    .refine((v) => !v.includes(".."), "folder may not traverse upwards")
    .optional()
    .nullable(),
  isPublic: z.boolean().optional(),
  /*
   * Left as an unvalidated object on purpose. `context` is the
   * `MediaFilenameContext` discriminated union — 25 variants, each with its own
   * required fields — and `applyMediaContextGuards` below is its validator,
   * returning a 400 that names the missing field. Re-declaring it here would be
   * a second copy of that rule, which is Root Cause #75's shape; the schema's
   * job is to prove it is an OBJECT before the guard indexes into it.
   */
  context: z.record(z.string(), z.unknown()).optional(),
});

export const POST = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);

    let raw: unknown;
    try {
      raw = await request.json();
    } catch (_err) {
      void normalizeError(_err);
      return errorResponse("Invalid JSON body", 400); // malformed request body
    }

    const parsed = signSchema.safeParse(raw);
    if (!parsed.success) {
      /*
       * Thrown rather than returned as a flat `errorResponse` string:
       * `mapToHttpError` classifies a ValidationError as 400 VALIDATION_FAILED
       * and carries `issues` through to the client, so the caller learns WHICH
       * field it got wrong. A client that sent `size` as a string cannot act on
       * "upload too large".
       */
      throw new ValidationError("Invalid request body", parsed.error.issues);
    }

    const contentType = parsed.data.contentType;
    const size = parsed.data.size;
    const folder = parsed.data.folder ?? null;
    const isPublic = parsed.data.isPublic === true;
    const contextInput = parsed.data.context as JsonValue | undefined;

    if (!isAllowedMime(contentType)) {
      const hint = getConversionHint(contentType);
      // The allowed/detected detail used to ride under `details`, which no
      // client has ever read — so the user saw a bare "invalid type". It goes
      // in the MESSAGE now, which is rendered.
      return errorResponse(
        `${hint ?? ERROR_MESSAGES.UPLOAD.INVALID_TYPE} Detected ${contentType || "unknown"}; allowed: ${ALLOWED_TYPES_LABEL}.`,
        400,
        { code: "INVALID_TYPE" },
      );
    }

    if (!Number.isFinite(size) || size <= 0) {
      return errorResponse("size must be a positive number", 400);
    }
    const kind = classifyMime(contentType)!;
    const maxSize = MAX_BYTES[kind];
    if (size > maxSize) {
      return errorResponse(
        `${ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE} This file is ${formatFileSize(size)}; the limit is ${MAX_LABEL[kind]}.`,
        400,
        { code: "FILE_TOO_LARGE" },
      );
    }
    const isPdf = kind === "pdf";

    // Track E2 â€” context is REQUIRED. The random-filename fallback path is
    // deleted. Every caller passes a typed MediaFilenameContext so generated
    // filenames stay SEO-friendly and the slug audits keep working.
    if (
      !contextInput ||
      typeof contextInput !== "object" ||
      !("type" in (contextInput as object))
    ) {
      return errorResponse(
        "context is required â€” pass a MediaFilenameContext { type, ... }.",
        400,
        { code: "MEDIA_CONTEXT_REQUIRED" },
      );
    }
    const ctx = contextInput as MediaFilenameContext;
    const guard = applyMediaContextGuards({ detectedMime: contentType, context: ctx });
    if (!guard.ok) {
      // guard.details is server context (filename, limits), not something the
      // client can act on — log it, send only the code.
      serverLogger.warn("Media sign: context guard rejected", { details: guard.details });
      return errorResponse(guard.error, guard.status, { code: "MEDIA_CONTEXT_INVALID" });
    }
    const filename = guard.filename;

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

    let uploadUrl: string;
    try {
      [uploadUrl] = await withRetry(
        () => fileRef.getSignedUrl({ version: "v4", action: "write", contentType, expires: Date.now() + SIGNED_URL_TTL_MS }),
        2, 300,
      );
    } catch (err) {
      void normalizeError(err);
      serverLogger.error("media/sign: GCS getSignedUrl failed", { uid: user!.uid, path: storagePath, error: err instanceof Error ? err.message : String(err) });
      return errorResponse("Storage service temporarily unavailable. Please try again.", 503);
    }

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
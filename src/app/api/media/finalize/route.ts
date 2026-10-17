/**
 * POST /api/media/finalize
 *
 * Validates an object that was uploaded via the signed-PUT flow:
 *
 *  1. Pulls the object metadata (size + declared contentType from the PUT)
 *  2. Streams the first ~4 KB and runs `fileTypeFromBuffer` for magic-byte
 *     detection â€” well under the 4.5 MB Vercel request cap (Rule #6).
 *  3. Rejects mismatches or oversize uploads (the signer already enforced
 *     the size cap, but the actual PUT may have exceeded the declared size).
 *  4. Stamps `customMetadata.uploadedBy` + `uploadedAt` so abuse can be
 *     traced and the existing tmp-cleanup logic still works.
 *  5. Returns the canonical download URL (public URL if requested, else a
 *     7-day v4 signed read URL).
 *
 * Body (JSON):
 * - storagePath: string (required) â€” the path returned by /api/media/sign
 * - isPublic?:   boolean â€” issue a public URL instead of a signed one
 *
 * Authorization: the path must be under `tmp/.../{uid}/...` matching the
 * authenticated caller. Cross-user finalize is rejected.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { safeFireAndForget } from "@mohasinac/appkit/server";
import {
  ALLOWED_TYPES_LABEL,
  MAX_BYTES,
  MAX_LABEL,
  PDF_MAGIC,
  classifyMime,
  getConversionHint,
} from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { getAdminStorage as getStorage } from "@mohasinac/appkit/providers/db-firebase/admin";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { formatFileSize } from "@mohasinac/appkit/utils/number.formatter";
import { mediaAssetsRepository } from "@mohasinac/appkit/features/media/repository/media-assets.repository";
import { deriveContextTypeFromFilename } from "@mohasinac/appkit/utils/id-generators";

const TMP_PREFIX = "tmp/";
const HEAD_BYTES = 4096; // file-type matches well within 4 KB for every supported format
const CLEANUP_LABEL = "media finalize: cleanup invalid upload";

/*
 * Two fields, and `storagePath` is the security-critical one: it names a
 * Storage object this handler will promote out of `tmp/` and register as a
 * public `/media/<id>` asset.
 *
 * `pathBelongsToUser` below is the real authorisation check and stays exactly
 * as it was. The schema adds the step before it — proving the value IS a
 * string, where `typeof body.storagePath === "string" ? … : ""` previously
 * turned every non-string into `""` and reported it as "storagePath is
 * required", which is the wrong diagnosis for a client that sent an array.
 *
 * The traversal guard is deliberately duplicated-looking but is not: it fails
 * the request at the field, whereas `pathBelongsToUser` fails it at the prefix
 * check with a 403. A `..` segment is malformed input, not an authorisation
 * failure, and the two deserve different statuses.
 */
const finalizeSchema = z.object({
  storagePath: z
    .string()
    .trim()
    .min(1, "storagePath is required")
    .max(500)
    .refine((v) => !v.split("/").includes(".."), "storagePath may not traverse upwards"),
  isPublic: z.boolean().optional(),
});

function pathBelongsToUser(storagePath: string, uid: string): boolean {
  if (!storagePath.startsWith(TMP_PREFIX)) return false;
  const segments = storagePath.split("/");
  // Expected shapes: tmp/{folder}/{uid}/{filename} or tmp/{uid}/{filename}
  // Owner uid is always the segment immediately before the filename.
  if (segments.length < 3) return false;
  return segments[segments.length - 2] === uid;
}

type StorageFile = ReturnType<
  ReturnType<ReturnType<typeof getStorage>["bucket"]>["file"]
>;

async function readHeadBytes(fileRef: StorageFile): Promise<Buffer> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const stream = fileRef.createReadStream({ start: 0, end: HEAD_BYTES - 1 });
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve());
    stream.on("error", reject);
  });
  return Buffer.concat(chunks);
}

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

    const parsed = finalizeSchema.safeParse(raw);
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

    const storagePath = parsed.data.storagePath;
    const isPublic = parsed.data.isPublic === true;
    if (!pathBelongsToUser(storagePath, user!.uid)) {
      serverLogger.warn("Media finalize rejected â€” path/uid mismatch", {
        uid: user!.uid,
        path: storagePath,
      });
      return errorResponse("Not authorized to finalize this path", 403);
    }

    const storage = getStorage();
    const bucket = storage.bucket();
    const fileRef = bucket.file(storagePath);

    const [exists] = await fileRef.exists();
    if (!exists) {
      // storagePath is server context, not something the client can act on.
      serverLogger.warn("Media finalize: object missing", { path: storagePath });
      return errorResponse("Uploaded object not found at storagePath", 404, {
        code: "NOT_FOUND",
      });
    }

    const [metadata] = await fileRef.getMetadata();
    const declaredMime = typeof metadata.contentType === "string" ? metadata.contentType : "";
    const size = typeof metadata.size === "string" ? parseInt(metadata.size, 10) : Number(metadata.size ?? 0);

    const declaredKind = classifyMime(declaredMime);
    if (!declaredKind) {
      safeFireAndForget(fileRef.delete(), CLEANUP_LABEL);
      const hint = getConversionHint(declaredMime);
      // The allowed/detected detail used to ride under `details`, which no
      // client has ever read — so the user saw a bare "invalid type". It goes
      // in the MESSAGE now, which is rendered.
      return errorResponse(
        `${hint ?? ERROR_MESSAGES.UPLOAD.INVALID_TYPE} Detected ${declaredMime || "unknown"}; allowed: ${ALLOWED_TYPES_LABEL}.`,
        400,
        { code: "INVALID_TYPE" },
      );
    }

    if (!Number.isFinite(size) || size <= 0) {
      safeFireAndForget(fileRef.delete(), CLEANUP_LABEL);
      return errorResponse("Uploaded object has no size", 400);
    }

    const maxSize = MAX_BYTES[declaredKind];
    if (size > maxSize) {
      safeFireAndForget(fileRef.delete(), CLEANUP_LABEL);
      return errorResponse(
        `${ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE} This file is ${formatFileSize(size)}; the limit is ${MAX_LABEL[declaredKind]}.`,
        400,
        { code: "FILE_TOO_LARGE" },
      );
    }

    // Magic-byte verification on the first few KB of the uploaded object.
    // file-type identifies every supported format from well under 4 KB,
    // so we never need to download the full file.
    const head = await readHeadBytes(fileRef);
    const detected = await fileTypeFromBuffer(head);
    const detectedKind = detected ? classifyMime(detected.mime) : null;
    if (!detected || !detectedKind) {
      safeFireAndForget(fileRef.delete(), CLEANUP_LABEL);
      return errorResponse(
        `${ERROR_MESSAGES.UPLOAD.INVALID_TYPE} Detected ${detected?.mime ?? "unknown"}; allowed: ${ALLOWED_TYPES_LABEL}.`,
        400,
        { code: "INVALID_TYPE" },
      );
    }
    if (detectedKind !== declaredKind) {
      safeFireAndForget(fileRef.delete(), CLEANUP_LABEL);
      // Structured 422 MIME_MISMATCH â€” Track E3 contract. Clients distinguish
      // "wrong content-type header" from generic upload errors and can re-prompt
      // the user accurately.
      return errorResponse(
        `Uploaded file bytes do not match the declared content type (declared ${declaredMime}, detected ${detected.mime})`,
        422,
        { code: "MIME_MISMATCH" },
      );
    }
    if (declaredKind === "pdf") {
      const looksLikePdf =
        head.length >= PDF_MAGIC.length &&
        head.subarray(0, PDF_MAGIC.length).toString("ascii") === PDF_MAGIC;
      if (!looksLikePdf) {
        safeFireAndForget(fileRef.delete(), CLEANUP_LABEL);
        return errorResponse(
          `${ERROR_MESSAGES.UPLOAD.INVALID_TYPE} Expected a PDF starting with the ${PDF_MAGIC} header.`,
          400,
          { code: "INVALID_TYPE" },
        );
      }
    }

    // Stamp custom metadata so the existing tmp-cleanup logic and audit
    // log queries still find what they expect.
    await fileRef.setMetadata({
      metadata: {
        uploadedBy: user!.uid,
        uploadedAt: new Date().toISOString(),
        finalized: "true",
      },
    });

    // Generate an SEO-friendly short ID from the filename (minus extension).
    // The storage path stays internal; callers receive /media/{shortId} which
    // resolves to the actual storagePath via the mediaAssets Firestore collection.
    // This keeps storage structure private and gives us full URL control.
    const filename = storagePath.split("/").pop() ?? "upload";
    const baseShortId = filename.replace(/\.[^.]+$/, ""); // strip extension

    let shortId: string;
    try {
      const asset = await mediaAssetsRepository.createAsset(baseShortId, {
        storagePath,
        uploadedBy: user!.uid,
        contentType: declaredMime,
        size,
        isPublic,
        status: "staged", // file is still in tmp/; moved to media/ when form saves
        contextType: deriveContextTypeFromFilename(filename),
      });
      shortId = asset.id;
    } catch (assetErr) {
      void normalizeError(assetErr);
      serverLogger.warn("Media finalize: failed to create mediaAssets record, falling back to path", {
        uid: user!.uid,
        path: storagePath,
        error: assetErr instanceof Error ? assetErr.message : String(assetErr),
      });
      shortId = baseShortId; // fallback: return path-based URL
    }

    const downloadURL = `/media/${shortId}`;
    if (isPublic) {
      await fileRef.makePublic().catch((makePublicErr: unknown) => {
        void normalizeError(makePublicErr);
        serverLogger.warn("Media finalize: makePublic best-effort failed", {
          path: storagePath,
          error: makePublicErr instanceof Error ? makePublicErr.message : String(makePublicErr),
        });
      });
    }

    serverLogger.info("Media finalized", {
      uid: user!.uid,
      path: storagePath,
      mime: declaredMime,
      size,
    });

    return successResponse(
      {
        url: downloadURL,
        path: storagePath,
        filename,
        size,
        type: declaredMime,
        isPublic,
        uploadedBy: user!.uid,
        uploadedAt: new Date().toISOString(),
      },
      SUCCESS_MESSAGES.UPLOAD.FILE_UPLOADED,
      201,
    );
  },
}));
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createApiHandler,
  errorResponse,
  successResponse,
  getAdminDb,
  serverLogger,
} from "@mohasinac/appkit";

const PREVIEW_TTL_MS = 30 * 60 * 1000; // 30 minutes
const PREVIEW_COLLECTION = "previewDrafts";
const PREVIEW_TOKEN_PREFIX = "preview-";
const PREVIEW_KINDS = ["product", "auction", "preorder", "blog", "event"] as const;

const ERRORS = {
  INVALID_PAYLOAD: "Invalid preview payload",
  MISSING_TOKEN: "Missing token",
  NOT_FOUND: "Preview not found",
  EXPIRED: "Preview expired",
  CREATE_FAILED: "Failed to create preview",
  READ_FAILED: "Failed to read preview",
} as const;

const previewSchema = z.object({
  kind: z.enum(PREVIEW_KINDS),
  draft: z.record(z.string(), z.unknown()),
});

function generateToken(): string {
  return (
    PREVIEW_TOKEN_PREFIX +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

/**
 * POST /api/preview
 * Body: { kind, draft }
 * → { token, expiresAt }
 *
 * Stores a short-lived draft for in-tab preview (UX4 follow-up / TS13).
 * Used by FormShell PreviewPane's "Open in new tab" action.
 */
export const POST = withProviders(
  createApiHandler({
    roles: ["admin", "moderator", "seller"],
    handler: async ({ request, user }) => {
      const json = await request.json().catch(() => null);
      const parsed = previewSchema.safeParse(json);
      if (!parsed.success) {
        return errorResponse(ERRORS.INVALID_PAYLOAD, 400);
      }
      try {
        const token = generateToken();
        const expiresAt = Date.now() + PREVIEW_TTL_MS;
        await getAdminDb()
          .collection(PREVIEW_COLLECTION)
          .doc(token)
          .set({
            kind: parsed.data.kind,
            draft: parsed.data.draft,
            createdBy: user?.uid ?? null,
            createdAt: new Date(),
            expiresAt: new Date(expiresAt),
          });
        return successResponse({ token, expiresAt });
      } catch (error) {
        serverLogger.error("preview create error", { error });
        return errorResponse(ERRORS.CREATE_FAILED, 500);
      }
    },
  }),
);

/**
 * GET /api/preview?token=<x>
 * Returns the draft if still valid; otherwise 404 / 410.
 * No role gate — token is the capability.
 */
export const GET = withProviders(
  createApiHandler({
    handler: async ({ request }) => {
      const token = new URL(request.url).searchParams.get("token");
      if (!token) return errorResponse(ERRORS.MISSING_TOKEN, 400);
      try {
        const snap = await getAdminDb()
          .collection(PREVIEW_COLLECTION)
          .doc(token)
          .get();
        if (!snap.exists) return errorResponse(ERRORS.NOT_FOUND, 404);
        const data = snap.data() ?? {};
        const expiresAt = (data.expiresAt as { toDate?: () => Date } | undefined)?.toDate?.()
          ?? new Date(0);
        if (expiresAt.getTime() < Date.now()) {
          return errorResponse(ERRORS.EXPIRED, 410);
        }
        return successResponse({
          kind: data.kind,
          draft: data.draft,
          expiresAt: expiresAt.toISOString(),
        });
      } catch (error) {
        serverLogger.error("preview read error", { error, token });
        return errorResponse(ERRORS.READ_FAILED, 500);
      }
    },
  }),
);

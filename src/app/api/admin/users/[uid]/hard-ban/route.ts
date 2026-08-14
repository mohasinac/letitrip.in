import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  userRepository,
  isAdminUser,
} from "@mohasinac/appkit";
import { enqueueJob } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * POST /api/admin/users/[uid]/hard-ban
 *
 * Runs the cheap synchronous pre-flight guards (self-ban / target-exists /
 * admin-target) then enqueues the 8-stage cascade as a `hardBanCascade` job
 * (CLAUDE.md Rule #6 — the cascade does 8 sequential Firestore/Auth stages
 * which risked the Vercel Hobby 10s sync ceiling; it now runs inside the
 * `onJobCreated` Firebase Function via `JOB_RUNNERS.hardBanCascade`, which
 * wraps `runHardBanCascade`).
 *
 * The client subscribes to `bulk_events/{jobId}` via `useBulkEvent` using the
 * returned `customToken` to learn when the cascade finishes.
 */

const schema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

export const POST = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:user-bans:write",
    schema,
    handler: async ({ params, body, user }) => {
      const uid = (params as { uid: string }).uid;
      if (uid === user!.uid) return errorResponse("Cannot ban yourself", 400);

      const target = await userRepository.findById(uid);
      if (!target) return errorResponse("User not found", 404);
      if (isAdminUser(target)) return errorResponse("Cannot ban an admin", 400);

      const { jobId, customToken } = await enqueueJob({
        jobType: "hardBanCascade",
        payload: { uid, reason: body!.reason, bannedBy: user!.uid },
        requestedBy: user!.uid,
      });

      return successResponse({ jobId, customToken, uid }, "Hard-ban cascade started");
    },
  }),
);

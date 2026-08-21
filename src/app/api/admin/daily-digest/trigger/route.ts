import { withProviders } from "@/providers.config";
/**
 * POST /api/admin/daily-digest/trigger
 *
 * Fires the daily status digest on demand. Firebase scheduled functions
 * have no "run on first deploy" trigger, so this covers that case — hit it
 * once after a fresh Functions deploy to confirm the whole
 * Firestore → Functions → Resend chain works instead of waiting for the
 * next 10:00 IST run. Same core implementation as the scheduled job.
 *
 * Cheap enough to run synchronously (two counted Firestore reads, one
 * bounded 24h scan, one email) — comfortably inside the Vercel Hobby 10s
 * ceiling, so no async job primitive needed.
 */

import { createRouteHandler, successResponse } from "@mohasinac/appkit";
import { triggerDailyStatusDigest } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:settings:write",
    handler: async () => {
      const result = await triggerDailyStatusDigest();
      return successResponse(
        result,
        result.sent
          ? "Daily status digest sent."
          : `Digest not sent (${result.reason ?? "unknown reason"}).`,
      );
    },
  }),
);

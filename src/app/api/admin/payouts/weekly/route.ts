import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { ROLES_ADMIN_ONLY } from "@/constants";
/**
 * POST /api/admin/payouts/weekly
 *
 * Admin-manual trigger — enqueues an async `payoutsWeekly` job (CLAUDE.md
 * Rule #6 — this route only writes a lightweight `jobs/{jobId}` doc and
 * returns immediately; the actual sweep runs inside the `onJobCreated`
 * Firebase Function via `JOB_RUNNERS.payoutsWeekly`, which wraps the same
 * `runWeeklyPayoutEligibility` core used by the scheduled Saturday run).
 *
 * The client subscribes to `bulk_events/{jobId}` via `useBulkEvent` using the
 * returned `customToken` to learn when the sweep finishes and its summary.
 */

import { createApiHandler as createRouteHandler, successResponse } from "@mohasinac/appkit";
import { enqueueJob } from "@mohasinac/appkit/server";

// --- Route --------------------------------------------------------------------

const __POST__g = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:payouts:write",
  handler: async ({ user }) => {
    const { jobId, customToken } = await enqueueJob({
      jobType: "payoutsWeekly",
      payload: {},
      requestedBy: user!.uid,
    });
    return successResponse({ jobId, customToken }, "Weekly payout run started");
  },
}));

export const POST = withFeatureGuard("PAYOUTS", __POST__g);

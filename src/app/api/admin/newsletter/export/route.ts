import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse } from "@mohasinac/appkit";
import { enqueueJob } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_MOD } from "@/constants";

/**
 * Enqueues an async `newsletterExport` job instead of building the CSV
 * in-process (CLAUDE.md Rule #6 — a full unbounded subscriber scan risks the
 * Vercel Hobby 10s sync timeout as the list grows). The client subscribes to
 * the job via `useBulkEvent` and reads the finished CSV off
 * `result.data.csv` — see `AdminNewsletterView.tsx`.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ user }) => {
      const { jobId, customToken } = await enqueueJob({
        jobType: "newsletterExport",
        payload: {},
        requestedBy: user!.uid,
      });
      return successResponse({ jobId, customToken }, "Export started");
    },
  }),
);

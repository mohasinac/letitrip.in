import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse, getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit";
import { listCloudLogEntries } from "@mohasinac/appkit/server";
import { ROLES_ANY_STAFF } from "@/constants";

/**
 * GET /api/admin/maintenance/cloud-logs?filter=&pageSize=&pageToken=
 *
 * Reads Google Cloud Logging entries (Firebase Functions — 2nd-gen, running
 * on Cloud Run, see `listCloudLogEntries`'s doc comment for why the default
 * filter targets `resource.type="cloud_run_revision"`). Gated by the
 * `admin:maintenance:view-cloud-logs` permission (see `src/constants/navigation.tsx`).
 *
 * One bounded `getEntries()` call per request — client drives further pages
 * via `pageToken` ("Load more" in `CloudLogsListView`), never a server-side
 * exhaust loop (Vercel Hobby 10s ceiling, CLAUDE.md Rule #6).
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ANY_STAFF],
    permission: "admin:maintenance:view-cloud-logs",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const filter = getStringParam(searchParams, "filter") || undefined;
      const pageToken = getStringParam(searchParams, "pageToken") || undefined;
      const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 50 });

      const result = await listCloudLogEntries({ filter, pageSize, pageToken });
      return successResponse(result);
    },
  }),
);

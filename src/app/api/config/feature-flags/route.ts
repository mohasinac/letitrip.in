import { withProviders } from "@/providers.config";
import { createApiHandler as createRouteHandler, successResponse } from "@mohasinac/appkit";
import { FEATURE_FLAGS, getFlag } from "@/lib/features";

/**
 * GET /api/config/feature-flags
 *
 * Public, read-only boolean flag state — lets "use client" components decide
 * whether to fetch/render a flag-gated feature before hitting its (guarded)
 * API, instead of firing the request unconditionally and eating a 404.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: false,
    cache: { maxAge: 60, sMaxAge: 60, staleWhileRevalidate: 300 },
    handler: async () => {
      const flags = Object.fromEntries(
        FEATURE_FLAGS.map((flag) => [flag, getFlag(flag)]),
      );
      return successResponse(flags);
    },
  }),
);

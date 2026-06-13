import { withProviders } from "@/providers.config";
/**
 * Admin Analytics API Route â€” thin proxy
 *
 * Auth is verified here on Vercel (session cookie â†’ role check).
 * All Firestore querying and aggregation runs inside the Firebase HTTPS
 * function `adminAnalytics`, which executes on Firebase servers in the same
 * region as the data â€” no large order datasets cross the internet to Vercel.
 *
 * Required env vars (Vercel):
 *   FIREBASE_FUNCTION_ADMIN_ANALYTICS_URL  â€” Cloud Run URL of adminAnalytics
 *   LETITRIP_INTERNAL_SECRET               â€” shared secret for server-to-server auth
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { callFirebaseFunction } from "@/lib/firebase-gateway";
import { ROLES_ADMIN_MOD } from "@/constants";

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:analytics:view",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const startDate = url.searchParams.get("startDate") ?? undefined;
      const endDate = url.searchParams.get("endDate") ?? undefined;

      const data = await callFirebaseFunction<{
        summary: unknown;
        ordersByMonth: unknown;
        topProducts: unknown;
      }>("adminAnalytics", { startDate, endDate });

      if (!data) {
        serverLogger.error("adminAnalytics: Firebase Function not configured");
        return Response.json({ error: "Analytics service not configured" }, { status: 503 });
      }

      return successResponse(data);
    },
  }),
);

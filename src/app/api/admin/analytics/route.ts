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

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ request }) => {
      const functionUrl = process.env.FIREBASE_FUNCTION_ADMIN_ANALYTICS_URL;
      const secret = process.env.LETITRIP_INTERNAL_SECRET;

      if (!functionUrl || !secret) {
        serverLogger.error(
          "adminAnalytics: FIREBASE_FUNCTION_ADMIN_ANALYTICS_URL or LETITRIP_INTERNAL_SECRET not set",
        );
        return Response.json({ error: "Analytics service not configured" }, { status: 503 });
      }

      const url = new URL(request.url);
      const startDate = url.searchParams.get("startDate") ?? undefined;
      const endDate = url.searchParams.get("endDate") ?? undefined;

      serverLogger.info("adminAnalytics: delegating to Firebase Function", { startDate, endDate });

      const upstream = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": secret,
        },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        serverLogger.error("adminAnalytics: Firebase Function error", {
          status: upstream.status,
          body: text,
        });
        return Response.json(
          { error: "Analytics service error" },
          { status: upstream.status >= 500 ? 502 : upstream.status },
        );
      }

      const data = (await upstream.json()) as {
        summary: unknown;
        ordersByMonth: unknown;
        topProducts: unknown;
      };

      return successResponse(data);
    },
  }),
);

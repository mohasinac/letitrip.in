import { withProviders } from "@/providers.config";
/**
 * Store (Seller) Analytics API Route â€” thin proxy
 *
 * Auth is verified here on Vercel (session cookie â†’ authenticated seller uid).
 * The verified uid is forwarded as `sellerId` to the Firebase HTTPS function
 * `storeAnalytics`, which runs all Firestore queries and aggregation on
 * Firebase servers â€” no large order datasets cross the internet to Vercel.
 *
 * Required env vars (Vercel):
 *   FIREBASE_FUNCTION_STORE_ANALYTICS_URL  â€” Cloud Run URL of storeAnalytics
 *   LETITRIP_INTERNAL_SECRET               â€” shared secret for server-to-server auth
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const functionUrl = process.env.FIREBASE_FUNCTION_STORE_ANALYTICS_URL;
      const secret = process.env.LETITRIP_INTERNAL_SECRET;

      if (!functionUrl || !secret) {
        serverLogger.error(
          "storeAnalytics: FIREBASE_FUNCTION_STORE_ANALYTICS_URL or LETITRIP_INTERNAL_SECRET not set",
        );
        return Response.json({ error: "Analytics service not configured" }, { status: 503 });
      }

      const uid = user!.uid;
      serverLogger.info("storeAnalytics: delegating to Firebase Function", { uid });

      const upstream = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": secret,
        },
        body: JSON.stringify({ uid }),
      });

      if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        serverLogger.error("storeAnalytics: Firebase Function error", {
          status: upstream.status,
          body: text,
          uid,
        });
        return Response.json(
          { error: "Analytics service error" },
          { status: upstream.status >= 500 ? 502 : upstream.status },
        );
      }

      const data = (await upstream.json()) as {
        summary: unknown;
        revenueByMonth: unknown;
        topProducts: unknown;
      };

      return successResponse(data);
    },
  }),
);

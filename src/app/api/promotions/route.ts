import { withProviders } from "@/providers.config";
/**
 * Promotions API Route â€” thin proxy
 *
 * Public endpoint (no auth). Delegates to the Firebase HTTPS function
 * `promotionsApi`, which fetches promoted products, featured products, and
 * active coupons entirely on Firebase servers â€” including the coupon
 * start-date guard that Firestore cannot express as a single compound query.
 *
 * Required env vars (Vercel):
 *   FIREBASE_FUNCTION_PROMOTIONS_URL  â€” Cloud Run URL of promotionsApi
 *   LETITRIP_INTERNAL_SECRET          â€” shared secret for server-to-server auth
 */

import { successResponse } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    handler: async () => {
      const functionUrl = process.env.FIREBASE_FUNCTION_PROMOTIONS_URL;
      const secret = process.env.LETITRIP_INTERNAL_SECRET;

      if (!functionUrl || !secret) {
        serverLogger.error(
          "promotions: FIREBASE_FUNCTION_PROMOTIONS_URL or LETITRIP_INTERNAL_SECRET not set",
        );
        return Response.json({ error: "Promotions service not configured" }, { status: 503 });
      }

      serverLogger.info("promotions: delegating to Firebase Function");

      const upstream = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": secret,
        },
        body: JSON.stringify({}),
      });

      if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        serverLogger.error("promotions: Firebase Function error", {
          status: upstream.status,
          body: text,
        });
        return Response.json(
          { error: "Promotions service error" },
          { status: upstream.status >= 500 ? 502 : upstream.status },
        );
      }

      const data = (await upstream.json()) as {
        promotedProducts: unknown;
        featuredProducts: unknown;
        activeCoupons: unknown;
      };

      return successResponse(data);
    },
  }),
);

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
import { callFirebaseFunction } from "@/lib/firebase-gateway";

export const GET = withProviders(
  createRouteHandler({
    handler: async () => {
      const data = await callFirebaseFunction<{
        promotedProducts: unknown;
        featuredProducts: unknown;
        activeCoupons: unknown;
      }>("promotionsApi");

      if (!data) {
        serverLogger.error("promotions: Firebase Function not configured");
        return Response.json({ error: "Promotions service not configured" }, { status: 503 });
      }

      return successResponse(data);
    },
  }),
);

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
import { orderRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { callFirebaseFunction } from "@/lib/firebase-gateway";

// S-STORE-1-E — Direct Firestore fallback when the analytics Firebase
// Function isn't configured (dev / preview deploys without the env vars).
// Bounded to last 30 days + pageSize 50 to respect Vercel Hobby caps.
async function firestoreFallback(uid: string) {
  const store = await storeRepository.findByOwnerId(uid).catch(() => null);
  if (!store) {
    return { summary: { revenue: 0, orders: 0, aov: 0 }, revenueByMonth: [], topProducts: [] };
  }
  const since = new Date(Date.now() - 30 * 86400_000);
  const raw = await orderRepository
    .findBy("storeId", store.id)
    .catch(() => [] as unknown[]);
  const orders = (raw as Array<{ totalAmount?: number; createdAt?: Date | string }>)
    .filter((o) => new Date(o.createdAt ?? 0).getTime() >= since.getTime())
    .slice(0, 50);
  const revenue = orders.reduce((s, o) => s + Number(o.totalAmount ?? 0), 0);
  const count = orders.length;
  return {
    summary: { revenue, orders: count, aov: count > 0 ? Math.round(revenue / count) : 0 },
    revenueByMonth: [],
    topProducts: [],
  };
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const uid = user!.uid;

      const data = await callFirebaseFunction<{
        summary: unknown;
        revenueByMonth: unknown;
        topProducts: unknown;
      }>("storeAnalytics", { uid }).catch(() => null);

      if (!data) {
        serverLogger.warn("storeAnalytics: Firebase Function unavailable — falling back to Firestore");
        const fallback = await firestoreFallback(uid);
        return successResponse(fallback);
      }

      return successResponse(data);
    },
  }),
);

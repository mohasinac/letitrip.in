import { withProviders } from "@/providers.config";
import { getAdminDb } from "@mohasinac/appkit";
import {
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const limit = Math.min(Number(url.searchParams.get("limit") ?? "200"), 500);
      const snapshot = await getAdminDb()
        .collectionGroup("wishlist")
        .orderBy("addedAt", "desc")
        .limit(limit)
        .get();
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        const pathParts = doc.ref.path.split("/");
        const userId = pathParts[1] ?? "";
        return {
          id: doc.id,
          userId,
          productId: data.productId ?? doc.id,
          addedAt: data.addedAt?.toDate?.()?.toISOString?.() ?? null,
          priceAtAdd: data.priceAtAdd ?? null,
          productTitle: data.productTitle ?? null,
        };
      });
      return successResponse({ items, total: items.length });
    },
  }),
);

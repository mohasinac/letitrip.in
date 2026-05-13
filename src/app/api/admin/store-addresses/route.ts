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
    permission: "admin:store-addresses:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const limit = Math.min(Number(url.searchParams.get("limit") ?? "500"), 1000);
      const storeId = url.searchParams.get("storeId");

      const snapshot = await (storeId
        ? getAdminDb()
            .collection("stores")
            .doc(storeId)
            .collection("addresses")
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get()
        : getAdminDb()
            .collectionGroup("addresses")
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get());

      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        const pathParts = doc.ref.path.split("/");
        // Path: stores/{storeId}/addresses/{addressId}
        const storeSlug = pathParts[1] ?? "";
        return {
          id: doc.id,
          storeId: storeSlug,
          label: data["label"] ?? "",
          city: data["city"] ?? "",
          state: data["state"] ?? "",
          pincode: data["pincode"] ?? "",
          isPickupLocation: data["isPickupLocation"] ?? false,
          createdAt: data["createdAt"]?.toDate?.()?.toISOString?.() ?? null,
        };
      });

      return successResponse({ items, total: items.length });
    },
  }),
);

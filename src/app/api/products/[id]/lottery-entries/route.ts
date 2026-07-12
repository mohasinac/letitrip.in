import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  isAdminUser,
} from "@mohasinac/appkit";
import { getLotteryEntriesForAdmin, getLotteryEntriesForUser } from "@mohasinac/appkit/server";
import { productRepository } from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: admin/store-owner gets all; user gets own only
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const productId = (params as { id: string }).id;
      const model = { page: 1, pageSize: 20 };

      if (isAdminUser(user!)) {
        const result = await getLotteryEntriesForAdmin("product", productId, model);
        return successResponse(result, "Lottery entries retrieved");
      }

      // Check if store owner
      const product = await productRepository.findById(productId).catch(() => null);
      if (product && product.storeId === user!.uid) {
        const result = await getLotteryEntriesForAdmin("product", productId, model);
        return successResponse(result, "Lottery entries retrieved");
      }

      // Regular user — own entries only
      const result = await getLotteryEntriesForUser(user!.uid, model);
      const filtered = { ...result, items: result.items.filter((e: { productId?: string }) => e.productId === productId) };
      const safe = {
        ...filtered,
        items: filtered.items.map((entry) => {
          const { userPhone: _p, userEmail: _e, transactionId: _t, ...rest } = entry;
          return rest;
        }),
      };
      return successResponse(safe, "Your lottery entries");
    },
  }),
);

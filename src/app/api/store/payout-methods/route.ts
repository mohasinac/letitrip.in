import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  payoutMethodsRepository,
  storeRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const result = await payoutMethodsRepository.listByStore(store.id);
      return successResponse({ items: result.items, total: result.items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ request, user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        const doc = await payoutMethodsRepository.create({
          ...body,
          storeId: store.id,
          sellerId: user!.uid,
        });
        return successResponse(doc, "Payout method created", 201);
      } catch (err) {
        return errorResponse(
          err instanceof Error ? err.message : "Create failed",
          400,
        );
      }
    },
  }),
);

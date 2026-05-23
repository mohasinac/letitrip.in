import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  productRepository,
  storeRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

// S-STORE-2-C — Duplicate listing. Copies the source product into a new
// document with status "draft", appends "(copy)" to the title, and clears
// statistics fields.
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const source = await productRepository.findById(id);
      if (!source) return ApiErrors.notFound("Source listing not found");
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      if ((source as { storeId?: string }).storeId !== store.id) {
        return ApiErrors.forbidden("Not your listing");
      }
      try {
        const now = new Date();
        const copy: Record<string, unknown> = {
          ...(source as unknown as Record<string, unknown>),
          title: `${(source as { title?: string }).title ?? "Listing"} (copy)`,
          status: "draft",
          slug: undefined,
          viewCount: 0,
          purchaseCount: 0,
          favoriteCount: 0,
          avgRating: 0,
          createdAt: now,
          updatedAt: now,
        };
        delete copy.id;
        // Structural cast — ProductCreateInput shape verified by mapDoc on read.
        const created = await productRepository.create(copy as never);
        return successResponse(created, "Listing duplicated", 201);
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Duplicate failed", 400);
      }
    },
  }),
);

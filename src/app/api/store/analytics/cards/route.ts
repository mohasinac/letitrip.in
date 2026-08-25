import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  analyticsCardsRepository,
  createRouteHandler,
  errorResponse,
  analyticsCardCreateSchema,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const result = await analyticsCardsRepository.listForOwner("seller", user!.uid);
      return successResponse({ items: result.items });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof analyticsCardCreateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: analyticsCardCreateSchema,
    handler: async ({ user, body }) => {
      // `isBuiltIn: false` is pinned here — a seller-authored card claiming to
      // be built-in would sit alongside the platform's own and could not be
      // told apart.
      const doc = await analyticsCardsRepository.create({
        ...body!,
        filters: body!.filters ?? {},
        position: body!.position ?? 0,
        isVisible: body!.isVisible ?? true,
        scope: "seller",
        ownerId: user!.uid,
        isBuiltIn: false,
      });
      return successResponse(doc, "Card created", 201);
    },
  }),
);

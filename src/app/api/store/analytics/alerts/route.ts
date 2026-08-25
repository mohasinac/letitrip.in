import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  analyticsAlertsRepository,
  createRouteHandler,
  errorResponse,
  analyticsAlertCreateSchema,
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
      const result = await analyticsAlertsRepository.listForOwner("seller", user!.uid);
      return successResponse({ items: result.items });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof analyticsAlertCreateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: analyticsAlertCreateSchema,
    handler: async ({ user, body }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");

      // `scope` and `ownerId` come from the session. The schema declares
      // neither, so a seller cannot file an admin-scoped alert or attribute one
      // to another owner.
      const doc = await analyticsAlertsRepository.create({
        ...body!,
        scope: "seller",
        ownerId: user!.uid,
        isActive: body!.isActive ?? true,
        notifyChannels: body!.notifyChannels ?? ["in-app"],
      });
      return successResponse(doc, "Alert created", 201);
    },
  }),
);

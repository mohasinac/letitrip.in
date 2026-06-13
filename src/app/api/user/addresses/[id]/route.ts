import { withProviders } from "@/providers.config";
import {
  addressesRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const address = await addressesRepository.findById(id);
      if (!address || address.ownerType !== "user" || address.ownerId !== user!.uid) {
        return errorResponse("Address not found", 404);
      }
      return successResponse(address);
    },
  }),
);

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request, params }) => {
      const id = (params as { id: string }).id;
      const body = await request.json();
      const updated = await addressesRepository.updateForOwner(
        "user",
        user!.uid,
        id,
        body,
      );
      return successResponse(updated);
    },
  }),
);

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      await addressesRepository.deleteForOwner("user", user!.uid, id);
      return successResponse(null, "Address deleted");
    },
  }),
);

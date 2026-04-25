import { withProviders } from "@/providers.config";
import {
  addressRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const address = await addressRepository.findById(user!.uid, id);
      if (!address) return errorResponse("Address not found", 404);
      return successResponse(address);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request, params }) => {
      const id = (params as { id: string }).id;
      const body = await request.json();
      const updated = await addressRepository.update(user!.uid, id, body);
      return successResponse(updated);
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      await addressRepository.delete(user!.uid, id);
      return successResponse(null, "Address deleted");
    },
  }),
);

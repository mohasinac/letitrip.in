import { withProviders } from "@/providers.config";
import { itemRequestsRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await itemRequestsRepository.findById(id);
      if (!doc || doc.status === "pending-approval") return ApiErrors.notFound("Not found");
      return successResponse(doc);
    },
  }),
);
import { withProviders } from "@/providers.config";
import { becomeSeller } from "@mohasinac/appkit/features/seller/actions/seller-actions";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const POST = withProviders(
  createApiHandler({
    auth: true,
    handler: async ({ user }) => {
      const result = await becomeSeller(user!.uid);
      return successResponse(result, "Seller application submitted");
    },
  }),
);
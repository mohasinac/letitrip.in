import { withProviders } from "@/providers.config";
import {
  becomeSeller,
  createApiHandler,
  successResponse,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: createRouteHandler with auth:true — any authenticated user
export const POST = withProviders(
  createApiHandler({
    auth: true,
    handler: async ({ user }) => {
      const result = await becomeSeller(user!.uid);
      return successResponse(result, "Seller application submitted");
    },
  }),
);
import { withProviders } from "@/providers.config";
import {
  becomeSeller,
  createApiHandler,
  successResponse,
} from "@mohasinac/appkit";

export const POST = withProviders(
  createApiHandler({
    auth: true,
    handler: async ({ user }) => {
      const result = await becomeSeller(user!.uid);
      return successResponse(result, "Seller application submitted");
    },
  }),
);

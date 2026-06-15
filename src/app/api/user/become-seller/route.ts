import { withProviders } from "@/providers.config";
import {
  becomeSeller,
  createApiHandler,
  successResponse,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
// audit-route-schema-ok: pending-bespoke-schema
export const POST = withProviders(
  createApiHandler({
    auth: true,
    handler: async ({ user }) => {
      const result = await becomeSeller(user!.uid);
      return successResponse(result, "Seller application submitted");
    },
  }),
);
